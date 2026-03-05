<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CoOwner;
use App\Models\Property;
use App\Models\PropertyDelegation;
use App\Models\Lease;
use App\Models\RentReceipt;
use App\Models\User;
use App\Models\Tenant;
use App\Models\Notice;
use App\Models\Invoice;
use App\Models\Payment;
use App\Models\Document;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use App\Mail\PropertyModifiedNotification;

class CoOwnerMeController extends Controller
{
    /**
     * Récupérer le profil complet du co-propriétaire connecté AVEC LES DONNÉES RÉELLES DU DASHBOARD
     */
    public function getProfile(Request $request): JsonResponse
    {
        $user = $request->user();

        Log::info('CoOwnerMeController::getProfile - Début', [
            'user_id' => $user?->id,
            'user_email' => $user?->email,
        ]);

        // Vérifier si l'utilisateur a le rôle co_owner
        if (!$user || !$user->hasRole('co_owner')) {
            return response()->json(['message' => 'Forbidden - User is not a co-owner'], 403);
        }

        // Récupérer le profil co-propriétaire
        $coOwner = CoOwner::where('user_id', $user->id)->first();

        if (!$coOwner) {
            $coOwner = CoOwner::create([
                'user_id' => $user->id,
                'first_name' => $user->first_name ?? '',
                'last_name' => $user->last_name ?? '',
                'email' => $user->email,
                'phone' => $user->phone ?? '',
                'status' => 'active',
                'is_professional' => false,
                'co_owner_type' => 'simple',
            ]);
        }

        // Récupérer les délégations actives
        $delegations = PropertyDelegation::where('co_owner_id', $coOwner->id)
            ->where('status', 'active')
            ->with('property')
            ->get();

        $propertyIds = $delegations->pluck('property_id')->toArray();

        // Récupérer les baux actifs
        $activeLeases = Lease::whereIn('property_id', $propertyIds)
            ->where('status', 'active')
            ->with(['property', 'tenant'])
            ->get();

        // === 1. DONNÉES DES LOYERS DES 6 DERNIERS MOIS ===
        $rentData = [];
        $monthlyTotals = [];

        // Pour les 6 derniers mois
        for ($i = 5; $i >= 0; $i--) {
            $monthStart = now()->subMonths($i)->startOfMonth();
            $monthEnd = now()->subMonths($i)->endOfMonth();
            $monthName = $monthStart->format('M');

            // Loyers attendus ce mois-ci (somme des loyers des baux actifs)
            $expectedRent = $activeLeases->filter(function($lease) use ($monthStart, $monthEnd) {
                // Vérifier si le bail était actif pendant ce mois
                $leaseStart = \Carbon\Carbon::parse($lease->start_date);
                $leaseEnd = $lease->end_date ? \Carbon\Carbon::parse($lease->end_date) : null;

                if ($leaseEnd) {
                    return $leaseStart <= $monthEnd && $leaseEnd >= $monthStart;
                }
                return $leaseStart <= $monthEnd;
            })->sum('rent_amount');

            // Loyers reçus ce mois-ci depuis la table payments
            $receivedRent = Payment::whereIn('lease_id', $activeLeases->pluck('id'))
                ->where('status', 'approved')
                ->whereBetween('paid_at', [$monthStart, $monthEnd])
                ->sum('amount_total');

            $rentData[] = [
                'month' => $monthName,
                'expected' => (float) $expectedRent,
                'received' => (float) $receivedRent,
            ];

            // Garder les totaux pour le max du graphique
            $monthlyTotals[] = max($expectedRent, $receivedRent);
        }

        // Trouver le maximum pour l'échelle du graphique
        $maxRent = $monthlyTotals ? max($monthlyTotals) : 5000;
        $graphMax = ceil($maxRent / 1000) * 1000; // Arrondir au 1000 supérieur

        // === 2. TAUX D'OCCUPATION ===
        $occupiedProperties = $activeLeases->pluck('property_id')->unique()->count();
        $totalProperties = count($propertyIds);
        $occupancyRate = $totalProperties > 0 ? ($occupiedProperties / $totalProperties) * 100 : 0;

        $occupancyData = [
            'occupied' => $occupiedProperties,
            'vacant' => $totalProperties - $occupiedProperties,
            'total' => $totalProperties,
            'occupancy_rate' => round($occupancyRate, 1)
        ];

        // === 3. DOCUMENTS RÉCENTS ===
        $recentDocuments = [];

        // Contrats de bail récents
        $recentLeases = Lease::whereIn('property_id', $propertyIds)
            ->with(['property', 'tenant'])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        foreach ($recentLeases as $lease) {
            $recentDocuments[] = [
                'type' => 'contrat',
                'title' => 'Contrat de bail' . ($lease->tenant ? ' - ' . $lease->tenant->last_name : ''),
                'date' => $lease->created_at->format('d-F-Y'),
                'document_id' => $lease->id,
                'document_type' => 'lease'
            ];
        }

        // Avis d'échéance récents (invoices)
        $recentInvoices = Invoice::whereIn('lease_id', $activeLeases->pluck('id'))
            ->where('status', 'pending')
            ->with('lease.property')
            ->orderBy('due_date', 'desc')
            ->limit(5)
            ->get();

        foreach ($recentInvoices as $invoice) {
            $monthName = \Carbon\Carbon::parse($invoice->due_date)->locale('fr')->monthName;
            $recentDocuments[] = [
                'type' => 'avis',
                'title' => 'Avis d\'échéance - ' . $monthName,
                'date' => \Carbon\Carbon::parse($invoice->due_date)->subDays(5)->format('d F Y'),
                'document_id' => $invoice->id,
                'document_type' => 'invoice'
            ];
        }

        // États des lieux récents (notices de type inventory)
        $recentInventories = Notice::whereIn('property_id', $propertyIds)
            ->where('type', 'inventory')
            ->with('property')
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        foreach ($recentInventories as $inventory) {
            $recentDocuments[] = [
                'type' => 'etat',
                'title' => 'État des lieux' . ($inventory->property ? ' - ' . $inventory->property->name : ''),
                'date' => $inventory->created_at->format('d-F-Y'),
                'document_id' => $inventory->id,
                'document_type' => 'inventory'
            ];
        }

        // Factures travaux récentes
        $recentMaintenance = Invoice::whereIn('lease_id', $activeLeases->pluck('id'))
            ->where('type', 'maintenance')
            ->with('lease.property')
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        foreach ($recentMaintenance as $maintenance) {
            $recentDocuments[] = [
                'type' => 'facture',
                'title' => 'Facture travaux' . ($maintenance->lease->property ? ' - ' . $maintenance->lease->property->name : ''),
                'date' => $maintenance->created_at->format('d-F-Y'),
                'document_id' => $maintenance->id,
                'document_type' => 'maintenance'
            ];
        }

        // Quittances récentes
        $recentReceipts = RentReceipt::whereIn('lease_id', $activeLeases->pluck('id'))
            ->with(['lease.property', 'lease.tenant'])
            ->orderBy('issued_date', 'desc')
            ->limit(5)
            ->get();

        foreach ($recentReceipts as $receipt) {
            $recentDocuments[] = [
                'type' => 'quittance',
                'title' => 'Quittance' . ($receipt->lease->tenant ? ' - ' . $receipt->lease->tenant->last_name : ''),
                'date' => $receipt->issued_date->format('d-F-Y'),
                'document_id' => $receipt->id,
                'document_type' => 'receipt'
            ];
        }

        // Trier par date et garder les 5 plus récents
        usort($recentDocuments, function($a, $b) {
            return strtotime($b['date']) - strtotime($a['date']);
        });
        $recentDocuments = array_slice($recentDocuments, 0, 5);

        // === 4. KPIs EN TEMPS RÉEL ===

        // Loyers attendus ce mois-ci
        $currentMonthStart = now()->startOfMonth();
        $currentMonthEnd = now()->endOfMonth();

        $expectedRentCurrentMonth = $activeLeases->filter(function($lease) use ($currentMonthStart, $currentMonthEnd) {
            $leaseStart = \Carbon\Carbon::parse($lease->start_date);
            $leaseEnd = $lease->end_date ? \Carbon\Carbon::parse($lease->end_date) : null;

            if ($leaseEnd) {
                return $leaseStart <= $currentMonthEnd && $leaseEnd >= $currentMonthStart;
            }
            return $leaseStart <= $currentMonthEnd;
        })->sum('rent_amount');

        // Loyers reçus ce mois-ci
        $receivedRentCurrentMonth = Payment::whereIn('lease_id', $activeLeases->pluck('id'))
            ->where('status', 'approved')
            ->whereBetween('paid_at', [$currentMonthStart, $currentMonthEnd])
            ->sum('amount_total');

        // Alertes en attente
        $activeAlerts = Notice::whereIn('property_id', $propertyIds)
            ->where('status', 'pending')
            ->count();

        // === 5. PRÉPARER LA RÉPONSE ===
        $profileData = [
            'id' => $coOwner->id,
            'user_id' => $coOwner->user_id,
            'first_name' => $coOwner->first_name,
            'last_name' => $coOwner->last_name,
            'full_name' => trim($coOwner->first_name . ' ' . $coOwner->last_name),
            'email' => $user->email,
            'phone' => $coOwner->phone ?? $user->phone,
            'company_name' => $coOwner->company_name,
            'is_professional' => (bool) $coOwner->is_professional,
            'co_owner_type' => $coOwner->co_owner_type ?: 'simple',
            'status' => $coOwner->status,
            'dashboard_data' => [
                'subscription' => [
                    'plan' => 'Permanent',
                    'renewal_date' => '15 Mars 2026'
                ],
                'rent_data' => $rentData,
                'graph_max' => $graphMax,
                'occupancy_data' => $occupancyData,
                'recent_documents' => $recentDocuments,
                'quick_actions' => [
                    ['id' => 1, 'title' => 'Créer un bien', 'description' => 'Créer la fiche de votre bien', 'icon' => 'home'],
                    ['id' => 2, 'title' => 'Créer un locataire', 'description' => 'Créer la fiche de votre locataire', 'icon' => 'users'],
                    ['id' => 3, 'title' => 'Créer une Location', 'description' => 'Lier le bien et le locataire dans une location', 'icon' => 'handshake'],
                ],
                'kpis' => [
                    'expected_rent' => (float) $expectedRentCurrentMonth,
                    'received_rent' => (float) $receivedRentCurrentMonth,
                    'occupancy_rate' => $occupancyData['occupancy_rate'],
                    'occupied_properties' => $occupancyData['occupied'],
                    'total_properties' => $occupancyData['total'],
                    'active_delegations' => $delegations->count(),
                    'active_alerts' => $activeAlerts,
                ]
            ],
            'statistics' => [
                'delegated_properties_count' => $delegations->count(),
                'active_leases_count' => $activeLeases->count(),
                'total_rent_collected' => Payment::whereIn('lease_id', $activeLeases->pluck('id'))
                    ->where('status', 'approved')
                    ->sum('amount_total'),
            ]
        ];

        return response()->json([
            'data' => $profileData
        ]);
    }

    /**
     * Mettre à jour le profil du co-propriétaire
     */
    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();

        Log::info('CoOwnerMeController::updateProfile - Début', [
            'user_id' => $user?->id,
            'user_email' => $user?->email,
            'user_phone' => $user?->phone,
            'request_data' => $request->all()
        ]);

        if (!$user || !$user->hasRole('co_owner')) {
            Log::warning('CoOwnerMeController::updateProfile - Accès refusé');
            return response()->json(['message' => 'Forbidden - User is not a co-owner'], 403);
        }

        $coOwner = CoOwner::where('user_id', $user->id)->first();
        if (!$coOwner) {
            Log::info('CoOwnerMeController::updateProfile - Création du profil co-owner');
            $coOwner = CoOwner::create([
                'user_id' => $user->id,
                'first_name' => $user->first_name ?? '',
                'last_name' => $user->last_name ?? '',
                'email' => $user->email,
                'phone' => $user->phone ?? '',
                'status' => 'active',
                'is_professional' => false,
                'co_owner_type' => 'simple',
            ]);
        }

        try {
            $validated = $request->validate([
                'first_name' => 'sometimes|nullable|string|max:255',
                'last_name' => 'sometimes|nullable|string|max:255',
                'phone' => 'sometimes|nullable|string|max:20',
                'address' => 'sometimes|nullable|string|max:255',
                'date_of_birth' => 'sometimes|nullable|date|before:today',
                'id_number' => 'sometimes|nullable|string|max:50',
                'company_name' => 'sometimes|nullable|string|max:255',
                'address_billing' => 'sometimes|nullable|string|max:255',
                'license_number' => 'sometimes|nullable|string|max:100',
                'ifu' => 'sometimes|nullable|string|max:50',
                'rccm' => 'sometimes|nullable|string|max:50',
                'vat_number' => 'sometimes|nullable|string|max:50',
                'is_professional' => 'sometimes|boolean',
            ]);

            Log::info('CoOwnerMeController::updateProfile - Données validées', ['validated' => $validated]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('CoOwnerMeController::updateProfile - Erreur de validation', [
                'errors' => $e->errors(),
                'request_data' => $request->all()
            ]);
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        }

        foreach ($validated as $key => $value) {
            if ($value === '' || $value === null) {
                $validated[$key] = null;
            }
        }

        if (isset($validated['phone']) && $validated['phone'] !== $user->phone) {
            $user->update(['phone' => $validated['phone']]);
            Log::info('CoOwnerMeController::updateProfile - Téléphone mis à jour dans users', [
                'old_phone' => $user->phone,
                'new_phone' => $validated['phone']
            ]);
        }

        if (isset($validated['is_professional'])) {
            $coOwner->is_professional = (bool) $validated['is_professional'];
            if ($validated['is_professional'] && !empty($validated['company_name'])) {
                $coOwner->co_owner_type = 'agency';
            } elseif ($validated['is_professional']) {
                $coOwner->co_owner_type = 'professional';
            } else {
                $coOwner->co_owner_type = 'simple';
            }
            unset($validated['is_professional']);
        }

        $coOwner->update($validated);

        if ($request->has('email') && $request->email !== $user->email) {
            try {
                $request->validate(['email' => 'required|email|unique:users,email,' . $user->id]);
                $user->update(['email' => $request->email]);
                $coOwner->update(['email' => $request->email]);
                Log::info('CoOwnerMeController::updateProfile - Email mis à jour', [
                    'old_email' => $user->email,
                    'new_email' => $request->email
                ]);
            } catch (\Illuminate\Validation\ValidationException $e) {
                Log::error('CoOwnerMeController::updateProfile - Erreur validation email', [
                    'errors' => $e->errors()
                ]);
                $validated['email'] = $user->email;
            }
        }

        $userUpdates = [];
        if (isset($validated['first_name']) && $validated['first_name'] !== $user->first_name) {
            $userUpdates['first_name'] = $validated['first_name'];
        }
        if (isset($validated['last_name']) && $validated['last_name'] !== $user->last_name) {
            $userUpdates['last_name'] = $validated['last_name'];
        }

        if (!empty($userUpdates)) {
            $user->update($userUpdates);
            Log::info('CoOwnerMeController::updateProfile - Nom utilisateur mis à jour', $userUpdates);
        }

        $coOwner->refresh();
        $user->refresh();

        $coOwnerType = $coOwner->co_owner_type;
        if (!$coOwnerType) {
            if ($coOwner->is_professional) {
                $coOwnerType = !empty($coOwner->company_name) ? 'agency' : 'professional';
            } else {
                $coOwnerType = 'simple';
            }
        }

        Log::info('CoOwnerMeController::updateProfile - Profil mis à jour avec succès', [
            'co_owner_id' => $coOwner->id,
            'co_owner_type' => $coOwnerType,
            'phone' => $coOwner->phone
        ]);

        return response()->json([
            'message' => 'Profile updated successfully',
            'data' => [
                'id' => $coOwner->id,
                'user_id' => $coOwner->user_id,
                'first_name' => $coOwner->first_name,
                'last_name' => $coOwner->last_name,
                'email' => $user->email,
                'phone' => $coOwner->phone ?? $user->phone,
                'address' => $coOwner->address,
                'date_of_birth' => $coOwner->date_of_birth,
                'id_number' => $coOwner->id_number,
                'company_name' => $coOwner->company_name,
                'address_billing' => $coOwner->address_billing,
                'license_number' => $coOwner->license_number,
                'is_professional' => (bool) $coOwner->is_professional,
                'co_owner_type' => $coOwnerType,
                'ifu' => $coOwner->ifu,
                'rccm' => $coOwner->rccm,
                'vat_number' => $coOwner->vat_number,
                'status' => $coOwner->status,
                'joined_at' => $coOwner->created_at,
            ]
        ]);
    }

    /**
     * Récupérer les propriétés déléguées au co-propriétaire connecté
     * CORRECTION: Récupération directe du statut depuis la base de données
     */
    public function getDelegatedProperties(Request $request): JsonResponse
    {
        $user = $request->user();

        Log::info('CoOwnerMeController::getDelegatedProperties', [
            'user_id' => $user?->id,
            'user_email' => $user?->email,
        ]);

        if (!$user) {
            return response()->json(['message' => 'User not authenticated'], 401);
        }

        if (!$user->hasRole('co_owner')) {
            return response()->json(['message' => 'Forbidden - User is not a co-owner'], 403);
        }

        $coOwner = CoOwner::where('user_id', $user->id)->first();
        if (!$coOwner) {
            return response()->json(['message' => 'Co-owner profile missing'], 422);
        }

        // Récupérer les délégations actives
        $delegations = PropertyDelegation::where('co_owner_id', $coOwner->id)
            ->where('status', 'active')
            ->with('property')
            ->get();

        // Extraire les propriétés depuis les délégations
        $properties = $delegations->map(function ($delegation) use ($coOwner) {
            $property = $delegation->property;
            if (!$property) return null;

            // CORRECTION: Récupération DIRECTE du statut depuis la base de données
            // Sans aucune logique de calcul ou déduction
            $propertyStatus = $property->status; // available, rented, maintenance, off_market

            return [
                'id' => $property->id,
                'name' => $property->name,
                'address' => $property->address,
                'city' => $property->city,
                'zip_code' => $property->zip_code,
                'country' => $property->country,
                'rent_amount' => $property->rent_amount,
                'charges_amount' => $property->charges_amount,
                'caution' => $property->caution, // AJOUT ICI
                'surface' => $property->surface,
                'property_type' => $property->property_type,
                'description' => $property->description,
                'photos' => $property->photos ?? [],
                'status' => $propertyStatus, // DIRECT depuis DB
                'created_at' => $property->created_at,
                'updated_at' => $property->updated_at,
                'landlord_id' => $property->landlord_id,
                'co_owner_id' => $coOwner->id,
                'delegation' => [
                    'id' => $delegation->id,
                    'status' => $delegation->status,
                    'permissions' => $delegation->permissions,
                    'expires_at' => $delegation->expires_at,
                ],
                'reference_code' => $property->reference_code,
                'bedroom_count' => $property->bedroom_count,
                'bathroom_count' => $property->bathroom_count,
                'room_count' => $property->room_count,
                'district' => $property->district,
                'state' => $property->state,
                'floor' => $property->floor,
                'total_floors' => $property->total_floors,
                'construction_year' => $property->construction_year,
                'has_garage' => $property->has_garage,
                'has_parking' => $property->has_parking,
                'is_furnished' => $property->is_furnished,
                'has_elevator' => $property->has_elevator,
                'has_balcony' => $property->has_balcony,
                'has_terrace' => $property->has_terrace,
                'has_cellar' => $property->has_cellar,
                'charges_amount' => $property->charges_amount,
                'amenities' => $property->amenities ?? [],
            ];
        })->filter()->values();

        Log::info('Properties retrieved with status', [
            'count' => $properties->count(),
            'statuses' => $properties->pluck('status')->toArray()
        ]);

        return response()->json([
            'data' => $properties
        ]);
    }

    /**
     * Récupérer les baux du co-propriétaire
     */
    public function getLeases(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user->hasRole('co_owner')) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $coOwner = CoOwner::where('user_id', $user->id)->first();
        if (!$coOwner) {
            return response()->json(['message' => 'Co-owner profile missing'], 422);
        }

        $delegatedPropertyIds = PropertyDelegation::where('co_owner_id', $coOwner->id)
            ->where('status', 'active')
            ->pluck('property_id');

        $leases = Lease::whereIn('property_id', $delegatedPropertyIds)
            ->with(['property', 'tenant'])
            ->get();

        $leasesData = $leases->map(function ($lease) {
            return [
                'id' => $lease->id,
                'property_id' => $lease->property_id,
                'tenant_id' => $lease->tenant_id,
                'rent_amount' => $lease->rent_amount,
                'deposit_amount' => $lease->deposit_amount,
                'start_date' => $lease->start_date,
                'end_date' => $lease->end_date,
                'status' => $lease->status,
                'created_at' => $lease->created_at,
                'updated_at' => $lease->updated_at,
                'property' => $lease->property,
                'tenant' => $lease->tenant,
            ];
        });

        return response()->json([
            'data' => $leasesData
        ]);
    }

    /**
     * Récupérer les quittances du co-propriétaire
     */
    public function getRentReceipts(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user->hasRole('co_owner')) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $coOwner = CoOwner::where('user_id', $user->id)->first();
        if (!$coOwner) {
            return response()->json(['message' => 'Co-owner profile missing'], 422);
        }

        $delegatedPropertyIds = PropertyDelegation::where('co_owner_id', $coOwner->id)
            ->where('status', 'active')
            ->pluck('property_id');

        $receipts = RentReceipt::whereIn('property_id', $delegatedPropertyIds)
            ->with(['lease', 'property'])
            ->orderBy('issued_date', 'desc')
            ->get();

        $receiptsData = $receipts->map(function ($receipt) {
            return [
                'id' => $receipt->id,
                'lease_id' => $receipt->lease_id,
                'paid_month' => $receipt->paid_month,
                'amount_paid' => $receipt->amount_paid,
                'payment_date' => $receipt->payment_date,
                'issued_date' => $receipt->issued_date,
                'status' => $receipt->status,
                'created_at' => $receipt->created_at,
                'lease' => $receipt->lease,
                'property' => $receipt->property,
            ];
        });

        return response()->json([
            'data' => $receiptsData
        ]);
    }

    /**
     * Récupérer les locataires du co-propriétaire
     */
    public function getTenants(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user->hasRole('co_owner')) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $coOwner = CoOwner::where('user_id', $user->id)->first();
        if (!$coOwner) {
            return response()->json(['message' => 'Co-owner profile missing'], 422);
        }

        $delegatedPropertyIds = PropertyDelegation::where('co_owner_id', $coOwner->id)
            ->where('status', 'active')
            ->pluck('property_id');

        $tenantIds = Lease::whereIn('property_id', $delegatedPropertyIds)
            ->where('status', 'active')
            ->pluck('tenant_id');

        $tenants = Tenant::whereIn('id', $tenantIds)->get();

        $tenantsData = $tenants->map(function ($tenant) {
            return [
                'id' => $tenant->id,
                'first_name' => $tenant->first_name,
                'last_name' => $tenant->last_name,
                'email' => $tenant->email,
                'phone' => $tenant->phone,
                'id_number' => $tenant->id_number,
                'address' => $tenant->address,
                'created_at' => $tenant->created_at,
                'updated_at' => $tenant->updated_at,
            ];
        });

        return response()->json([
            'data' => $tenantsData
        ]);
    }

    /**
     * Récupérer les notifications du co-propriétaire
     */
    public function getNotices(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user->hasRole('co_owner')) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $coOwner = CoOwner::where('user_id', $user->id)->first();
        if (!$coOwner) {
            return response()->json(['message' => 'Co-owner profile missing'], 422);
        }

        $delegatedPropertyIds = PropertyDelegation::where('co_owner_id', $coOwner->id)
            ->where('status', 'active')
            ->pluck('property_id');

        $notices = Notice::whereIn('property_id', $delegatedPropertyIds)
            ->with(['property', 'tenant'])
            ->orderBy('created_at', 'desc')
            ->get();

        $noticesData = $notices->map(function ($notice) {
            return [
                'id' => $notice->id,
                'property_id' => $notice->property_id,
                'tenant_id' => $notice->tenant_id,
                'type' => $notice->type,
                'title' => $notice->reason,
                'description' => $notice->reason,
                'status' => $notice->status,
                'priority' => 'medium',
                'notice_date' => $notice->notice_date,
                'end_date' => $notice->end_date,
                'notes' => $notice->notes,
                'created_at' => $notice->created_at,
                'updated_at' => $notice->updated_at,
                'property' => $notice->property,
                'tenant' => $notice->tenant,
            ];
        });

        return response()->json([
            'data' => $noticesData
        ]);
    }

    /**
     * Récupérer les délégations du co-propriétaire
     */
    public function getDelegations(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user->hasRole('co_owner')) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $coOwner = CoOwner::where('user_id', $user->id)->first();
        if (!$coOwner) {
            return response()->json(['message' => 'Co-owner profile missing'], 422);
        }

        $delegations = PropertyDelegation::where('co_owner_id', $coOwner->id)
            ->with(['property', 'landlord'])
            ->orderBy('created_at', 'desc')
            ->get();

        $delegationsData = $delegations->map(function ($delegation) {
            return [
                'id' => $delegation->id,
                'property_id' => $delegation->property_id,
                'co_owner_id' => $delegation->co_owner_id,
                'landlord_id' => $delegation->landlord_id,
                'status' => $delegation->status,
                'permissions' => $delegation->permissions,
                'created_at' => $delegation->created_at,
                'expires_at' => $delegation->expires_at,
                'property' => $delegation->property,
                'landlord' => $delegation->landlord,
            ];
        });

        return response()->json([
            'data' => $delegationsData
        ]);
    }

    /**
     * Mettre à jour une propriété déléguée
     */
    public function updateProperty(Request $request, $propertyId): JsonResponse
    {
        $user = $request->user();

        if (!$user->hasRole('co_owner')) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $coOwner = CoOwner::where('user_id', $user->id)->first();
        if (!$coOwner) {
            return response()->json(['message' => 'Co-owner profile missing'], 422);
        }

        $delegation = PropertyDelegation::where('co_owner_id', $coOwner->id)
            ->where('property_id', $propertyId)
            ->where('status', 'active')
            ->first();

        if (!$delegation) {
            return response()->json(['message' => 'Property not delegated to this co-owner'], 403);
        }

        $property = Property::find($propertyId);
        if (!$property) {
            return response()->json(['message' => 'Property not found'], 404);
        }

        if (!in_array('edit', $delegation->permissions ?? [])) {
            return response()->json(['message' => 'No permission to edit this property'], 403);
        }

        Log::info('Données reçues pour modification', [
            'property_id' => $propertyId,
            'data' => $request->all(),
            'user_id' => $user->id
        ]);

        try {
            $validated = $request->validate([
                'name' => 'sometimes|nullable|string|max:255',
                'address' => 'sometimes|nullable|string|max:255',
                'district' => 'sometimes|nullable|string|max:255',
                'city' => 'sometimes|nullable|string|max:255',
                'state' => 'sometimes|nullable|string|max:255',
                'zip_code' => 'sometimes|nullable|string|max:20',
                'country' => 'sometimes|nullable|string|max:255',
                'latitude' => 'sometimes|nullable|string|max:50',
                'longitude' => 'sometimes|nullable|string|max:50',
                'surface' => 'sometimes|nullable|numeric|min:0',
                'floor' => 'sometimes|nullable|integer|min:0',
                'total_floors' => 'sometimes|nullable|integer|min:0',
                'room_count' => 'sometimes|nullable|integer|min:0',
                'bedroom_count' => 'sometimes|nullable|integer|min:0',
                'bathroom_count' => 'sometimes|nullable|integer|min:0',
                'wc_count' => 'sometimes|nullable|integer|min:0',
                'construction_year' => 'sometimes|nullable|integer|min:1800|max:' . date('Y'),
                'rent_amount' => 'sometimes|nullable|numeric|min:0',
                'charges_amount' => 'sometimes|nullable|numeric|min:0',
                'caution' => 'sometimes|nullable|numeric|min:0', // AJOUT ICI
                'property_type' => 'sometimes|nullable|string|max:255',
                'description' => 'sometimes|nullable|string|max:2000',
                'has_garage' => 'sometimes|boolean',
                'has_parking' => 'sometimes|boolean',
                'is_furnished' => 'sometimes|boolean',
                'has_elevator' => 'sometimes|boolean',
                'has_balcony' => 'sometimes|boolean',
                'has_terrace' => 'sometimes|boolean',
                'has_cellar' => 'sometimes|boolean',
                'reference_code' => 'sometimes|string|max:100',
                'status' => 'sometimes|nullable|string|in:available,rented,maintenance,off_market',
                'amenities' => 'sometimes|nullable|array',
                'amenities.*' => 'sometimes|string',
            ]);

            Log::info('Données validées', ['validated' => $validated]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Erreur de validation', [
                'errors' => $e->errors(),
                'data' => $request->all()
            ]);

            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        }

        foreach ($validated as $key => $value) {
            if ($value === '' || $value === null) {
                $validated[$key] = null;
            }
        }

        if (!isset($validated['reference_code']) || empty($validated['reference_code'])) {
            $validated['reference_code'] = $property->reference_code ?: 'REF-' . time();
        }

        $booleanFields = ['has_garage', 'has_parking', 'is_furnished', 'has_elevator', 'has_balcony', 'has_terrace', 'has_cellar'];
        foreach ($booleanFields as $field) {
            if (isset($validated[$field])) {
                $validated[$field] = (bool) $validated[$field];
            }
        }

        $originalData = $property->toArray();

        try {
            $property->update($validated);

            DB::table('property_modification_audits')->insert([
                'property_id' => $property->id,
                'co_owner_id' => $coOwner->id,
                'landlord_id' => $property->landlord_id,
                'original_data' => json_encode($originalData),
                'modified_data' => json_encode($validated),
                'status' => 'modified',
                'notification_sent_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            try {
                $landlord = User::find($property->landlord_id);
                if ($landlord && $landlord->email) {
                    Mail::to($landlord->email)->send(new PropertyModifiedNotification(
                        $property,
                        $coOwner,
                        $originalData,
                        $validated
                    ));
                }
            } catch (\Exception $e) {
                Log::error('Erreur lors de l\'envoi de l\'email', [
                    'error' => $e->getMessage(),
                ]);
            }

            Log::info('Propriété mise à jour avec succès', [
                'property_id' => $property->id,
            ]);

            $property->refresh();

            return response()->json([
                'message' => 'Propriété modifiée avec succès. Le propriétaire a été notifié par email.',
                'data' => $this->formatPropertyData($property, $coOwner, $delegation)
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur base de données', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'message' => 'Erreur serveur: ' . $e->getMessage()
            ], 500);
        }
    }

    private function formatPropertyData($property, $coOwner, $delegation)
    {
        return [
            'id' => $property->id,
            'name' => $property->name,
            'address' => $property->address,
            'district' => $property->district,
            'city' => $property->city,
            'state' => $property->state,
            'zip_code' => $property->zip_code,
            'country' => $property->country,
            'latitude' => $property->latitude,
            'longitude' => $property->longitude,
            'rent_amount' => $property->rent_amount,
            'charges_amount' => $property->charges_amount,
            'caution' => $property->caution, // AJOUT ICI
            'surface' => $property->surface,
            'floor' => $property->floor,
            'total_floors' => $property->total_floors,
            'room_count' => $property->room_count,
            'bedroom_count' => $property->bedroom_count,
            'bathroom_count' => $property->bathroom_count,
            'wc_count' => $property->wc_count,
            'construction_year' => $property->construction_year,
            'property_type' => $property->property_type,
            'description' => $property->description,
            'has_garage' => $property->has_garage,
            'has_parking' => $property->has_parking,
            'is_furnished' => $property->is_furnished,
            'has_elevator' => $property->has_elevator,
            'has_balcony' => $property->has_balcony,
            'has_terrace' => $property->has_terrace,
            'has_cellar' => $property->has_cellar,
            'reference_code' => $property->reference_code,
            'status' => $property->status,
            'amenities' => $property->amenities ?? [],
            'photos' => $property->photos ?? [],
            'created_at' => $property->created_at,
            'updated_at' => $property->updated_at,
            'landlord_id' => $property->landlord_id,
            'co_owner_id' => $coOwner->id,
            'delegation' => [
                'id' => $delegation->id,
                'status' => $delegation->status,
                'permissions' => $delegation->permissions,
                'expires_at' => $delegation->expires_at,
            ],
        ];
    }

    /**
     * Uploader des photos pour une propriété
     */
    public function uploadPropertyPhotos(Request $request, $propertyId): JsonResponse
    {
        $user = $request->user();

        if (!$user->hasRole('co_owner')) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $coOwner = CoOwner::where('user_id', $user->id)->first();
        if (!$coOwner) {
            return response()->json(['message' => 'Co-owner profile missing'], 422);
        }

        $delegation = PropertyDelegation::where('co_owner_id', $coOwner->id)
            ->where('property_id', $propertyId)
            ->where('status', 'active')
            ->first();

        if (!$delegation) {
            return response()->json(['message' => 'Property not delegated to this co-owner'], 403);
        }

        $property = Property::find($propertyId);
        if (!$property) {
            return response()->json(['message' => 'Property not found'], 404);
        }

        $request->validate([
            'photos' => 'required|array',
            'photos.*' => 'image|mimes:jpeg,png,jpg,gif,webp|max:5120',
        ]);

        $uploadedPhotos = [];
        $currentPhotos = $property->photos ?? [];

        if ($request->hasFile('photos')) {
            foreach ($request->file('photos') as $photo) {
                $path = $photo->store('properties/' . $propertyId, 'public');
                $uploadedPhotos[] = $path;
            }
        }

        $allPhotos = array_merge($currentPhotos, $uploadedPhotos);
        $property->photos = $allPhotos;
        $property->save();

        try {
            $landlord = User::find($property->landlord_id);
            if ($landlord && $landlord->email) {
                Mail::to($landlord->email)->send(new \App\Mail\PhotosAddedNotification(
                    $property,
                    $coOwner,
                    count($uploadedPhotos)
                ));
            }
        } catch (\Exception $e) {
            Log::error('Erreur lors de l\'envoi de l\'email pour photos', [
                'error' => $e->getMessage(),
            ]);
        }

        return response()->json([
            'message' => 'Photos uploaded successfully. Propriétaire notifié.',
            'photos' => $allPhotos
        ]);
    }

    /**
     * Accepter une délégation
     */
    public function acceptDelegation(Request $request, $delegationId): JsonResponse
    {
        $user = $request->user();

        if (!$user->hasRole('co_owner')) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $coOwner = CoOwner::where('user_id', $user->id)->first();
        if (!$coOwner) {
            return response()->json(['message' => 'Co-owner profile missing'], 422);
        }

        $delegation = PropertyDelegation::where('id', $delegationId)
            ->where('co_owner_id', $coOwner->id)
            ->first();

        if (!$delegation) {
            return response()->json(['message' => 'Délégation non trouvée'], 404);
        }

        if ($delegation->status !== 'pending') {
            return response()->json(['message' => 'Délégation non disponible'], 400);
        }

        $delegation->status = 'active';
        $delegation->save();

        Log::info('Co-owner accepted delegation', [
            'co_owner_id' => $coOwner->id,
            'delegation_id' => $delegationId,
            'property_id' => $delegation->property_id
        ]);

        return response()->json([
            'message' => 'Délégation acceptée avec succès',
            'data' => $delegation
        ]);
    }

    /**
     * Refuser une délégation
     */
    public function rejectDelegation(Request $request, $delegationId): JsonResponse
    {
        $user = $request->user();

        if (!$user->hasRole('co_owner')) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $coOwner = CoOwner::where('user_id', $user->id)->first();
        if (!$coOwner) {
            return response()->json(['message' => 'Co-owner profile missing'], 422);
        }

        $delegation = PropertyDelegation::where('id', $delegationId)
            ->where('co_owner_id', $coOwner->id)
            ->first();

        if (!$delegation) {
            return response()->json(['message' => 'Délégation non trouvée'], 404);
        }

        if ($delegation->status !== 'pending') {
            return response()->json(['message' => 'Délégation non disponible'], 400);
        }

        $delegation->status = 'revoked';
        $delegation->save();

        Log::info('Co-owner rejected delegation', [
            'co_owner_id' => $coOwner->id,
            'delegation_id' => $delegationId,
            'property_id' => $delegation->property_id,
            'reason' => $request->input('reason')
        ]);

        return response()->json([
            'message' => 'Délégation refusée'
        ]);
    }

    /**
     * Obtenir l'historique des modifications pour une propriété
     */
    public function getPropertyAuditHistory(Request $request, $propertyId): JsonResponse
    {
        $user = $request->user();

        if (!$user->hasRole('co_owner')) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $coOwner = CoOwner::where('user_id', $user->id)->first();
        if (!$coOwner) {
            return response()->json(['message' => 'Co-owner profile missing'], 422);
        }

        $delegation = PropertyDelegation::where('co_owner_id', $coOwner->id)
            ->where('property_id', $propertyId)
            ->where('status', 'active')
            ->first();

        if (!$delegation) {
            return response()->json(['message' => 'Property not delegated to this co-owner'], 403);
        }

        $audits = DB::table('property_modification_audits')
            ->where('property_id', $propertyId)
            ->where('co_owner_id', $coOwner->id)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($audit) {
                return [
                    'id' => $audit->id,
                    'original_data' => json_decode($audit->original_data, true),
                    'modified_data' => json_decode($audit->modified_data, true),
                    'status' => $audit->status,
                    'created_at' => $audit->created_at,
                    'updated_at' => $audit->updated_at,
                ];
            });

        return response()->json([
            'data' => $audits
        ]);
    }
}
