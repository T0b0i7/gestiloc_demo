<?php

namespace App\Http\Controllers\Api\Tenant;

use App\Http\Controllers\Controller;
use App\Http\Resources\LeaseResource;
use App\Http\Resources\InvoiceResource;
use App\Models\Lease;
use App\Models\Payment;
use App\Models\MaintenanceRequest;
use App\Models\RentReceipt;
use App\Models\Notice;
use App\Models\TenantInvitation;
use App\Models\PropertyDelegation;
use App\Models\User;
use App\Models\Tenant;
use App\Models\Property;
use App\Models\Landlord;
use App\Models\CoOwner;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class MyLeaseController extends Controller
{

/**
 * Liste des baux du locataire (pour la page Locations)
 */
public function index()
{
    try {
        $user = auth()->user();

        if (!$user || !$user->hasRole('tenant') || !$user->tenant) {
            return response()->json(['message' => 'Accès réservé aux locataires'], 403);
        }

        $tenant = $user->tenant;

        $leases = Lease::where('tenant_id', $tenant->id)
            ->with([
                'property',
                'property.landlord.user',
                'property.landlord',
            ])
            ->get();

        $formattedLeases = $leases->map(function ($lease) {
            // Calculer le solde (loyers impayés)
            $balance = 0;
            $invoices = $lease->invoices()->where('status', 'unpaid')->get();
            foreach ($invoices as $invoice) {
                $balance += $invoice->amount ?? 0;
            }

            return [
                'id' => $lease->id,
                'property' => [
                    'id' => $lease->property->id,
                    'name' => $lease->property->name,
                    'address' => $lease->property->address,
                ],
                'landlord' => [
                    'id' => $lease->property->landlord->id ?? null,
                    'name' => ($lease->property->landlord->first_name ?? '') . ' ' . ($lease->property->landlord->last_name ?? ''),
                    'email' => $lease->property->landlord->user->email ?? null,
                ],
                'rent_amount' => (float) $lease->rent_amount,
                'balance' => $balance,
                'start_date' => $lease->start_date,
                'end_date' => $lease->end_date,
                'status' => $lease->status,
            ];
        });

        return response()->json($formattedLeases);

    } catch (\Exception $e) {
        Log::error('Erreur index locations: ' . $e->getMessage());
        return response()->json([
            'message' => 'Erreur lors du chargement des locations',
            'error' => $e->getMessage()
        ], 500);
    }
}



    private function getTenant()
    {
        $user = auth()->user();

        if (!$user || !$user->isTenant()) {
            abort(403, 'Accès réservé aux locataires');
        }

        if (!$user->tenant) {
            abort(404, 'Profil locataire introuvable');
        }

        return $user->tenant;
    }

    /**
     * Extrait le code postal d'une adresse
     */
    private function extractPostalCode($address)
    {
        if (empty($address)) return null;

        preg_match('/\b\d{5}\b/', $address, $matches);
        return $matches[0] ?? null;
    }

    /**
     * Récupère les informations du créateur, propriétaire et copropriétaires du bien
     */
    public function getLandlordInfo()
    {
        try {
            $user = auth()->user();

            if (!$user || !$user->hasRole('tenant') || !$user->tenant) {
                return response()->json(['message' => 'Accès réservé aux locataires'], 403);
            }

            $tenant = $user->tenant;
            $tenantId = $tenant->id;

            Log::info('getLandlordInfo - Début', [
                'tenant_id' => $tenantId,
                'user_id' => $user->id
            ]);

            // 1. Récupérer le bail actif du locataire
            $activeLease = Lease::where('tenant_id', $tenantId)
                ->where('status', 'active')
                ->with(['property'])
                ->first();

            if (!$activeLease) {
                Log::warning('Aucun bail actif trouvé', ['tenant_id' => $tenantId]);
                return response()->json([
                    'success' => true,
                    'creator' => null,
                    'co_owners' => [],
                    'message' => 'Aucun bail actif trouvé'
                ]);
            }

            $propertyId = $activeLease->property_id;

            // Récupérer la propriété
            $property = Property::find($propertyId);

            if (!$property) {
                return response()->json([
                    'success' => false,
                    'message' => 'Propriété non trouvée'
                ], 404);
            }

            Log::info('Bail actif trouvé', [
                'lease_id' => $activeLease->id,
                'property_id' => $propertyId,
                'property_landlord_id' => $property->landlord_id,
                'property_creator_id' => $property->user_id
            ]);

            $people = [];
            $processedIds = [];

            // ============================================
            // 1. LE CRÉATEUR DU BIEN (user_id dans properties)
            // ============================================
            if ($property->user_id) {
                $creatorUser = User::with('landlord', 'coOwner')->find($property->user_id);

                if ($creatorUser) {
                    $creatorType = null;
                    $creatorDetails = null;
                    $phone = $creatorUser->phone;
                    $email = $creatorUser->email;
                    $avatar = null;

                    if ($creatorUser->isLandlord() && $creatorUser->landlord) {
                        $creatorType = 'landlord';
                        $creatorDetails = $creatorUser->landlord;
                        $firstName = $creatorDetails->first_name ?? $creatorUser->first_name;
                        $lastName = $creatorDetails->last_name ?? $creatorUser->last_name;
                        if ($firstName && $lastName) {
                            $avatar = strtoupper(substr($firstName, 0, 1) . substr($lastName, 0, 1));
                        }
                    } elseif ($creatorUser->isCoOwner() && $creatorUser->coOwner) {
                        $creatorType = 'co_owner';
                        $creatorDetails = $creatorUser->coOwner;
                        $phone = $creatorDetails->phone ?? $creatorUser->phone;
                        $firstName = $creatorDetails->first_name ?? $creatorUser->first_name;
                        $lastName = $creatorDetails->last_name ?? $creatorUser->last_name;
                        if ($firstName && $lastName) {
                            $avatar = strtoupper(substr($firstName, 0, 1) . substr($lastName, 0, 1));
                        }
                    }

                    $address = null;
                    $ville = null;
                    $pays = null;

                    if ($creatorType === 'landlord' && $creatorDetails) {
                        $address = $creatorDetails->address_billing;
                    } elseif ($creatorType === 'co_owner' && $creatorDetails) {
                        $address = $creatorDetails->address_billing;
                    }

                    if (!empty($address)) {
                        $addressParts = explode(',', $address);
                        if (count($addressParts) > 0) {
                            $address = trim($addressParts[0]);
                        }
                        if (count($addressParts) > 1) {
                            $ville = trim($addressParts[1]);
                        }
                        if (count($addressParts) > 2) {
                            $pays = trim($addressParts[2]);
                        }
                    }

                    $people[] = [
                        'id' => (string) $creatorUser->id,
                        'nom' => $creatorDetails->last_name ?? $creatorUser->last_name,
                        'prenom' => $creatorDetails->first_name ?? $creatorUser->first_name,
                        'telephone' => $phone,
                        'email' => $email,
                        'avatar' => $avatar,
                        'adresse' => $address,
                        'ville' => $ville,
                        'codePostal' => $this->extractPostalCode($creatorDetails->address_billing ?? null),
                        'pays' => $pays,
                        'type' => $creatorType === 'landlord' ? 'Propriétaire' : ($creatorType === 'co_owner' ? 'Copropriétaire' : null),
                        'role' => 'Créateur du bien',
                        'company_name' => $creatorDetails->company_name ?? null,
                        'is_professional' => $creatorDetails->is_professional ?? null,
                    ];

                    $processedIds[] = (string) $creatorUser->id;
                }
            }

            // ============================================
            // 2. LES COPROPRIÉTAIRES (délégations actives sur CE bien)
            // ============================================
            $delegations = PropertyDelegation::where('property_id', $propertyId)
                ->where('status', 'active')
                ->with(['coOwner.user'])
                ->get();

            foreach ($delegations as $delegation) {
                $coOwner = $delegation->coOwner;
                if ($coOwner && $coOwner->user) {
                    $coOwnerUser = $coOwner->user;

                    // Éviter les doublons avec le créateur
                    if (in_array((string) $coOwnerUser->id, $processedIds)) {
                        continue;
                    }

                    // Vérifier les permissions
                    $permissions = $delegation->permissions ?? [];
                    $permissionLabels = [];

                    if (is_array($permissions) || is_string($permissions)) {
                        $permsArray = is_string($permissions) ? json_decode($permissions, true) ?? [] : $permissions;
                        if (in_array('view', $permsArray)) $permissionLabels[] = 'Consultation';
                        if (in_array('edit', $permsArray)) $permissionLabels[] = 'Modification';
                        if (in_array('manage_lease', $permsArray)) $permissionLabels[] = 'Gestion des baux';
                        if (in_array('collect_rent', $permsArray)) $permissionLabels[] = 'Collecte des loyers';
                        if (in_array('manage_maintenance', $permsArray)) $permissionLabels[] = 'Gestion des interventions';
                    }

                    $address = $coOwner->address_billing;
                    $ville = null;
                    $pays = null;

                    if (!empty($address)) {
                        $addressParts = explode(',', $address);
                        if (count($addressParts) > 0) {
                            $address = trim($addressParts[0]);
                        }
                        if (count($addressParts) > 1) {
                            $ville = trim($addressParts[1]);
                        }
                        if (count($addressParts) > 2) {
                            $pays = trim($addressParts[2]);
                        }
                    }

                    $firstName = $coOwner->first_name ?? $coOwnerUser->first_name;
                    $lastName = $coOwner->last_name ?? $coOwnerUser->last_name;
                    $avatar = null;
                    if ($firstName && $lastName) {
                        $avatar = strtoupper(substr($firstName, 0, 1) . substr($lastName, 0, 1));
                    }

                    $people[] = [
                        'id' => (string) $coOwnerUser->id,
                        'nom' => $coOwner->last_name ?? $coOwnerUser->last_name,
                        'prenom' => $coOwner->first_name ?? $coOwnerUser->first_name,
                        'telephone' => $coOwner->phone ?? $coOwnerUser->phone,
                        'email' => $coOwner->email ?? $coOwnerUser->email,
                        'avatar' => $avatar,
                        'adresse' => $address,
                        'ville' => $ville,
                        'codePostal' => $this->extractPostalCode($coOwner->address_billing),
                        'pays' => $pays,
                        'type' => $delegation->co_owner_type === 'agency' ? 'Agence' : 'Copropriétaire',
                        'role' => 'Copropriétaire',
                        'permissions' => $permissionLabels,
                        'delegation_type' => $delegation->delegation_type,
                        'delegated_at' => $delegation->delegated_at ? $delegation->delegated_at->toDateTimeString() : null,
                        'expires_at' => $delegation->expires_at ? $delegation->expires_at->toDateTimeString() : null,
                        'company_name' => $coOwner->company_name,
                        'is_professional' => $coOwner->is_professional,
                    ];

                    $processedIds[] = (string) $coOwnerUser->id;
                }
            }

            Log::info('getLandlordInfo - Succès', [
                'people_count' => count($people),
                'creator_id' => $people[0]['id'] ?? null,
                'people_ids' => array_column($people, 'id')
            ]);

            // Séparer les personnes par rôle pour la réponse
            $creator = null;
            $coOwners = [];

            foreach ($people as $person) {
                if ($person['role'] === 'Créateur du bien') {
                    $creator = $person;
                } else {
                    $coOwners[] = $person;
                }
            }

            return response()->json([
                'success' => true,
                'creator' => $creator,
                'co_owners' => $coOwners,
                'property' => [
                    'id' => $property->id,
                    'name' => $property->name,
                    'address' => $property->address,
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur getLandlordInfo: ' . $e->getMessage(), [
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du chargement des informations',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Récupère les notifications du locataire
     */
    public function notifications()
    {
        try {
            $user = auth()->user();

            if (!$user || !$user->hasRole('tenant') || !$user->tenant) {
                return response()->json(['message' => 'Accès réservé aux locataires'], 403);
            }

            $tenant = $user->tenant;
            $tenantId = $tenant->id;

            $notifications = [];

            // 1. Vérifier les paiements en retard
            $latePayments = Payment::where('tenant_id', $tenantId)
                ->whereIn('status', ['pending', 'initiated'])
                ->whereHas('invoice', function($q) {
                    $q->where('due_date', '<', now());
                })
                ->with(['lease.property'])
                ->get();

            foreach ($latePayments as $payment) {
                $propertyName = $payment->lease->property->name ?? 'inconnu';
                $dueDate = $payment->invoice->due_date ?? null;

                $notifications[] = [
                    'id' => 'payment_late_' . $payment->id,
                    'type' => 'critical',
                    'title' => 'Loyer en retard',
                    'message' => "Loyer pour le logement {$propertyName} est en retard",
                    'subtext' => $dueDate ? "À régulariser avant pénalités (échéance: " . date('d/m/Y', strtotime($dueDate)) . ")" : "À régulariser avant pénalités",
                    'is_read' => false,
                    'created_at' => $payment->created_at,
                    'link' => '/payments',
                    'icon' => 'alert-triangle',
                ];
            }

            // 2. Vérifier les interventions en cours
            $inProgressIncidents = MaintenanceRequest::where('tenant_id', $tenantId)
                ->whereIn('status', ['open', 'in_progress'])
                ->where('priority', 'high')
                ->orWhere('priority', 'emergency')
                ->with(['property'])
                ->get();

            foreach ($inProgressIncidents as $incident) {
                $propertyName = $incident->property->name ?? 'inconnu';
                $priority = $incident->priority === 'emergency' ? 'Urgente' : 'Haute priorité';

                $notifications[] = [
                    'id' => 'incident_' . $incident->id,
                    'type' => $incident->priority === 'emergency' ? 'critical' : 'important',
                    'title' => "Intervention {$priority}",
                    'message' => $incident->title,
                    'subtext' => $propertyName . ' - ' . date('d/m/Y', strtotime($incident->created_at)),
                    'is_read' => false,
                    'created_at' => $incident->created_at,
                    'link' => '/interventions',
                    'icon' => 'wrench',
                ];
            }

            // 3. Vérifier les quittances récentes
            $recentReceipts = RentReceipt::where('tenant_id', $tenantId)
                ->where('status', 'paid')
                ->whereDate('issued_date', '>=', now()->subDays(7))
                ->with(['lease.property'])
                ->get();

            foreach ($recentReceipts as $receipt) {
                $propertyName = $receipt->lease->property->name ?? 'inconnu';

                $notifications[] = [
                    'id' => 'receipt_' . $receipt->id,
                    'type' => 'info',
                    'title' => 'Nouvelle quittance disponible',
                    'message' => "Quittance pour {$receipt->paid_month}",
                    'subtext' => $propertyName . ' - ' . date('d/m/Y', strtotime($receipt->issued_date)),
                    'is_read' => false,
                    'created_at' => $receipt->issued_date,
                    'link' => '/receipts',
                    'icon' => 'file-text',
                    'pdf_url' => $receipt->pdf_path ? url('/storage/' . $receipt->pdf_path) : null,
                ];
            }

            // 4. Vérifier les préavis en attente
            $pendingNotices = Notice::where('tenant_id', $tenantId)
                ->where('status', 'pending')
                ->get();

            foreach ($pendingNotices as $notice) {
                $notifications[] = [
                    'id' => 'notice_' . $notice->id,
                    'type' => 'important',
                    'title' => 'Préavis en attente',
                    'message' => "Votre préavis de départ est en cours de traitement",
                    'subtext' => "Effectif le: " . date('d/m/Y', strtotime($notice->effective_date)),
                    'is_read' => false,
                    'created_at' => $notice->created_at,
                    'link' => '/notice',
                    'icon' => 'file-signature',
                ];
            }

            // 5. Vérifier les rappels de visite d'état des lieux
            $activeLease = Lease::where('tenant_id', $tenantId)
                ->where('status', 'active')
                ->first();

            if ($activeLease) {
                $endDate = $activeLease->end_date;
                if ($endDate) {
                    $daysUntilEnd = now()->diffInDays($endDate, false);

                    if ($daysUntilEnd > 0 && $daysUntilEnd <= 30) {
                        $notifications[] = [
                            'id' => 'lease_expiring_' . $activeLease->id,
                            'type' => 'important',
                            'title' => 'Fin de bail proche',
                            'message' => "Votre bail se termine dans {$daysUntilEnd} jours",
                            'subtext' => "Pensez à préparer votre état des lieux de sortie",
                            'is_read' => false,
                            'created_at' => now(),
                            'link' => '/location',
                            'icon' => 'home',
                        ];
                    }
                }
            }

            // 6. Vérifier les paiements à venir
            $upcomingPayments = Payment::where('tenant_id', $tenantId)
                ->whereIn('status', ['pending', 'initiated'])
                ->whereHas('invoice', function($q) {
                    $q->where('due_date', '>=', now())
                      ->where('due_date', '<=', now()->addDays(7));
                })
                ->with(['lease.property'])
                ->get();

            foreach ($upcomingPayments as $payment) {
                $propertyName = $payment->lease->property->name ?? 'inconnu';
                $dueDate = $payment->invoice->due_date ?? null;
                $daysUntilDue = $dueDate ? now()->diffInDays($dueDate) : 0;

                $notifications[] = [
                    'id' => 'payment_upcoming_' . $payment->id,
                    'type' => 'info',
                    'title' => 'Paiement à venir',
                    'message' => "Loyer à payer dans {$daysUntilDue} jours",
                    'subtext' => $propertyName . ' - Échéance: ' . date('d/m/Y', strtotime($dueDate)),
                    'is_read' => false,
                    'created_at' => $payment->created_at,
                    'link' => '/payments',
                    'icon' => 'credit-card',
                ];
            }

            usort($notifications, function($a, $b) {
                return strtotime($b['created_at']) - strtotime($a['created_at']);
            });

            $unreadCount = count($notifications);

            return response()->json([
                'notifications' => array_slice($notifications, 0, 20),
                'unread_count' => $unreadCount,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors du chargement des notifications',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Marquer une notification comme lue
     */
    public function markNotificationAsRead(Request $request, $notificationId)
    {
        try {
            $user = auth()->user();

            if (!$user || !$user->hasRole('tenant') || !$user->tenant) {
                return response()->json(['message' => 'Accès réservé aux locataires'], 403);
            }

            return response()->json([
                'success' => true,
                'message' => 'Notification marquée comme lue'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors du marquage de la notification',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Marquer toutes les notifications comme lues
     */
    public function markAllNotificationsAsRead(Request $request)
    {
        try {
            $user = auth()->user();

            if (!$user || !$user->hasRole('tenant') || !$user->tenant) {
                return response()->json(['message' => 'Accès réservé aux locataires'], 403);
            }

            return response()->json([
                'success' => true,
                'message' => 'Toutes les notifications ont été marquées comme lues'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors du marquage des notifications',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Récupère toutes les données pour le dashboard du locataire
     */
    public function dashboardData()
    {
        try {
            $user = auth()->user();

            if (!$user || !$user->hasRole('tenant') || !$user->tenant) {
                return response()->json(['message' => 'Accès réservé aux locataires'], 403);
            }

            $tenant = $user->tenant;

            $leases = Lease::where('tenant_id', $tenant->id)
                ->with([
                    'property',
                    'property.landlord.user',
                    'property.landlord',
                ])
                ->get();

            $activeLease = $leases->firstWhere('status', 'active');

            $payments = Payment::where('tenant_id', $tenant->id)
                ->with(['lease.property'])
                ->orderBy('created_at', 'desc')
                ->get();

            $receipts = RentReceipt::where('tenant_id', $tenant->id)
                ->with(['lease.property'])
                ->orderBy('issued_date', 'desc')
                ->orderBy('year', 'desc')
                ->orderBy('month', 'desc')
                ->get();

            $incidents = MaintenanceRequest::where('tenant_id', $tenant->id)
                ->with(['property'])
                ->orderBy('created_at', 'desc')
                ->get();

            $notices = Notice::where('tenant_id', $tenant->id)
                ->orderBy('created_at', 'desc')
                ->get();

            $invoices = [];
            if ($activeLease) {
                $invoices = $activeLease->invoices()
                    ->orderBy('due_date', 'desc')
                    ->get();
            }

            $notificationsResponse = $this->notifications();
            $notificationsData = $notificationsResponse->getData(true);

            $formattedLeases = $leases->map(function ($lease) {
                return [
                    'id' => $lease->id,
                    'uuid' => $lease->uuid,
                    'lease_number' => $lease->lease_number,
                    'start_date' => $lease->start_date,
                    'end_date' => $lease->end_date,
                    'status' => $lease->status,
                    'rent_amount' => (float) $lease->rent_amount,
                    'charges_amount' => (float) ($lease->charges_amount ?? 0),
                    'guarantee_amount' => (float) ($lease->guarantee_amount ?? 0),
                    'type' => $lease->type,
                    'property' => $lease->property ? [
                        'id' => $lease->property->id,
                        'name' => $lease->property->name,
                        'address' => $lease->property->address,
                        'city' => $lease->property->city,
                        'postal_code' => $lease->property->postal_code,
                        'country' => $lease->property->country,
                    ] : null,
                    'landlord' => $lease->property && $lease->property->landlord ? [
                        'id' => $lease->property->landlord->id,
                        'first_name' => $lease->property->landlord->first_name,
                        'last_name' => $lease->property->landlord->last_name,
                        'email' => $lease->property->landlord->user->email,
                        'phone' => $lease->property->landlord->user->phone,
                    ] : null,
                ];
            });

            $formattedPayments = $payments->map(function ($payment) {
                return [
                    'id' => $payment->id,
                    'amount' => (float) ($payment->amount_total ?? 0),
                    'amount_net' => (float) ($payment->amount_net ?? 0),
                    'fee_amount' => (float) ($payment->fee_amount ?? 0),
                    'status' => $payment->status,
                    'payment_method' => $this->getPaymentMethod($payment),
                    'paid_at' => $payment->paid_at,
                    'created_at' => $payment->created_at,
                    'property' => $payment->lease && $payment->lease->property ? [
                        'id' => $payment->lease->property->id,
                        'name' => $payment->lease->property->name,
                        'address' => $payment->lease->property->address,
                    ] : null,
                    'month' => $payment->paid_at ? date('Y-m', strtotime($payment->paid_at)) : null,
                ];
            });

            $formattedReceipts = $receipts->map(function ($receipt) {
                return [
                    'id' => $receipt->id,
                    'reference' => $receipt->reference,
                    'amount' => (float) ($receipt->amount_paid ?? 0),
                    'paid_month' => $receipt->paid_month,
                    'month' => $receipt->month,
                    'year' => $receipt->year,
                    'issued_date' => $receipt->issued_date,
                    'paid_at' => $receipt->paid_at,
                    'status' => $receipt->status,
                    'type' => $receipt->type,
                    'property' => $receipt->lease && $receipt->lease->property ? [
                        'id' => $receipt->lease->property->id,
                        'name' => $receipt->lease->property->name,
                    ] : null,
                    'pdf_url' => $receipt->pdf_path ? url('/storage/' . $receipt->pdf_path) : null,
                ];
            });

            $formattedIncidents = $incidents->map(function ($incident) {
                return [
                    'id' => $incident->id,
                    'title' => $incident->title,
                    'description' => $incident->description,
                    'category' => $incident->category,
                    'priority' => $incident->priority,
                    'status' => $incident->status,
                    'created_at' => $incident->created_at,
                    'updated_at' => $incident->updated_at,
                    'property' => $incident->property ? [
                        'id' => $incident->property->id,
                        'name' => $incident->property->name,
                    ] : null,
                    'photos' => $incident->photos ?? [],
                ];
            });

            $formattedNotices = $notices->map(function ($notice) {
                return [
                    'id' => $notice->id,
                    'notice_number' => $notice->notice_number,
                    'notice_date' => $notice->notice_date ?? $notice->created_at,
                    'effective_date' => $notice->effective_date,
                    'status' => $notice->status,
                    'reason' => $notice->reason,
                    'created_at' => $notice->created_at,
                ];
            });

            $formattedInvoices = collect($invoices)->map(function ($invoice) {
                return [
                    'id' => $invoice->id,
                    'invoice_number' => $invoice->invoice_number,
                    'amount' => (float) ($invoice->amount ?? 0),
                    'due_date' => $invoice->due_date,
                    'status' => $invoice->status,
                    'type' => $invoice->type,
                    'description' => $invoice->description,
                ];
            });

            $totalMonthly = 0;
            if ($activeLease) {
                $totalMonthly = (float) $activeLease->rent_amount + (float) ($activeLease->charges_amount ?? 0);
            }

            $monthsPaid = $formattedReceipts
                ->where('status', 'paid')
                ->pluck('paid_month')
                ->filter()
                ->unique()
                ->values();

            $currentMonth = date('Y-m');
            $isUpToDate = $monthsPaid->contains($currentMonth);

            $openIncidents = $incidents->whereIn('status', ['open', 'in_progress'])->count();

            return response()->json([
                'user' => [
                    'id' => $user->id,
                    'email' => $user->email,
                    'first_name' => $tenant->first_name,
                    'last_name' => $tenant->last_name,
                    'phone' => $user->phone,
                    'roles' => $user->roles->pluck('name'),
                ],
                'leases' => $formattedLeases,
                'active_lease' => $activeLease ? [
                    'id' => $activeLease->id,
                    'uuid' => $activeLease->uuid,
                    'lease_number' => $activeLease->lease_number,
                    'start_date' => $activeLease->start_date,
                    'end_date' => $activeLease->end_date,
                    'status' => $activeLease->status,
                    'rent_amount' => (float) $activeLease->rent_amount,
                    'charges_amount' => (float) ($activeLease->charges_amount ?? 0),
                    'total_monthly' => $totalMonthly,
                    'type' => $activeLease->type,
                    'property' => $activeLease->property ? [
                        'id' => $activeLease->property->id,
                        'name' => $activeLease->property->name,
                        'address' => $activeLease->property->address,
                        'city' => $activeLease->property->city,
                        'postal_code' => $activeLease->property->postal_code,
                        'country' => $activeLease->property->country,
                    ] : null,
                    'landlord' => $activeLease->property && $activeLease->property->landlord ? [
                        'id' => $activeLease->property->landlord->id,
                        'first_name' => $activeLease->property->landlord->first_name,
                        'last_name' => $activeLease->property->landlord->last_name,
                        'email' => $activeLease->property->landlord->user->email,
                        'phone' => $activeLease->property->landlord->user->phone,
                    ] : null,
                ] : null,
                'payments' => $formattedPayments,
                'receipts' => $formattedReceipts,
                'incidents' => $formattedIncidents,
                'notices' => $formattedNotices,
                'invoices' => $formattedInvoices,
                'notifications' => $notificationsData['notifications'] ?? [],
                'notifications_unread_count' => $notificationsData['unread_count'] ?? 0,
                'stats' => [
                    'total_monthly' => $totalMonthly,
                    'is_up_to_date' => $isUpToDate,
                    'months_paid_count' => $monthsPaid->count(),
                    'open_incidents' => $openIncidents,
                    'in_progress_incidents' => $incidents->where('status', 'in_progress')->count(),
                    'pending_notices' => $notices->where('status', 'pending')->count(),
                    'total_paid_ytd' => $formattedReceipts
                        ->where('status', 'paid')
                        ->where('year', date('Y'))
                        ->sum('amount'),
                ],
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors du chargement des données',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Détail d'un bail.
     */
    public function show($uuid)
    {
        $tenant = $this->getTenant();

        $lease = Lease::where('uuid', $uuid)
            ->where('tenant_id', $tenant->id)
            ->with([
                'property',
                'property.landlord',
                'property.landlord.user',
                'invoices' => function ($q) {
                    $q->latest('due_date')->take(5);
                },
            ])
            ->firstOrFail();

        return new LeaseResource($lease);
    }

    /**
     * Télécharger le contrat de bail.
     */
    public function downloadContract($uuid)
    {
        $tenant = $this->getTenant();

        $lease = Lease::where('uuid', $uuid)
            ->where('tenant_id', $tenant->id)
            ->firstOrFail();

        if (!$lease->contract_file_path || !Storage::exists($lease->contract_file_path)) {
            return response()->json(['message' => 'Le document n\'est pas disponible.'], 404);
        }

        return Storage::download($lease->contract_file_path, 'Mon_Contrat_Bail.pdf');
    }

    /**
     * Factures/quittances du bail.
     */
    public function invoices(Request $request, $uuid)
    {
        $tenant = $this->getTenant();

        $lease = Lease::where('uuid', $uuid)
            ->where('tenant_id', $tenant->id)
            ->firstOrFail();

        $query = $lease->invoices()->orderBy('due_date', 'desc');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        return InvoiceResource::collection($query->paginate(20));
    }

    /**
     * Helper pour obtenir la méthode de paiement - VERSION CORRIGÉE
     */
    private function getPaymentMethod($payment)
    {
        if (!$payment->provider_payload) {
            return 'Carte bancaire';
        }

        try {
            // Vérifier si c'est déjà un tableau (cas d'erreur)
            if (is_array($payment->provider_payload)) {
                $payload = $payment->provider_payload;
            }
            // Sinon, essayer de décoder la chaîne JSON
            elseif (is_string($payment->provider_payload)) {
                $payload = json_decode($payment->provider_payload, true);

                // Si json_decode échoue, retourner la valeur par défaut
                if (json_last_error() !== JSON_ERROR_NONE) {
                    Log::warning('Erreur json_decode dans getPaymentMethod', [
                        'payment_id' => $payment->id,
                        'error' => json_last_error_msg()
                    ]);
                    return 'Carte bancaire';
                }
            }
            else {
                // Type inattendu
                return 'Carte bancaire';
            }

            // Si le payload est null ou pas un tableau après décodage
            if (!is_array($payload)) {
                return 'Carte bancaire';
            }

            // Extraire la méthode de paiement des différentes structures possibles
            $method = $payload['payment_method'] ??
                     $payload['data']['payment_method'] ??
                     $payload['transaction']['payment_method'] ??
                     $payload['method'] ??
                     null;

            // Mapper les valeurs possibles
            if ($method) {
                $method = strtolower($method);

                if (in_array($method, ['mobile_money', 'mtn', 'moov', 'orange'])) {
                    return 'Mobile Money';
                } elseif (in_array($method, ['card', 'visa', 'mastercard'])) {
                    return 'Carte bancaire';
                } elseif (in_array($method, ['bank_transfer', 'virement'])) {
                    return 'Virement bancaire';
                } elseif (in_array($method, ['cash', 'especes'])) {
                    return 'Espèces';
                } elseif (in_array($method, ['check', 'cheque'])) {
                    return 'Chèque';
                }
            }

            return 'Carte bancaire';

        } catch (\Exception $e) {
            Log::error('Exception dans getPaymentMethod: ' . $e->getMessage(), [
                'payment_id' => $payment->id
            ]);
            return 'Carte bancaire';
        }
    }
}
