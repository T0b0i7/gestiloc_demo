<?php

namespace App\Http\Controllers\Api\Landlord;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Invoice;
use App\Models\Lease;
use App\Models\Property;
use App\Models\MaintenanceRequest;
use App\Models\TenantInvitation;
use App\Models\RentReceipt;
use App\Models\Notice;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Carbon\Carbon;

class LandlordNotificationController extends Controller
{
    /**
     * GET /api/landlord/notifications
     * Récupère les notifications du propriétaire
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $user = auth()->user();

            if (!$user || !$user->isLandlord()) {
                return response()->json(['message' => 'Accès réservé aux propriétaires'], 403);
            }

            $landlord = $user->landlord;
            $landlordId = $landlord->id;

            $notifications = [];

            // 1. Paiements reçus récemment (7 derniers jours)
            $recentPayments = Payment::where('landlord_user_id', $user->id)
                ->where('status', 'approved')
                ->where('paid_at', '>=', now()->subDays(7))
                ->with(['lease.property', 'lease.tenant'])
                ->get();

            foreach ($recentPayments as $payment) {
                $propertyName = $payment->lease->property->name ?? 'Inconnu';
                $tenantName = $payment->lease->tenant 
                    ? ($payment->lease->tenant->first_name . ' ' . $payment->lease->tenant->last_name)
                    : 'Inconnu';
                $amount = number_format($payment->amount_total, 0, ',', ' ');

                $notifications[] = [
                    'id' => 'payment_received_' . $payment->id,
                    'type' => 'success',
                    'title' => 'Paiement reçu',
                    'message' => "{$tenantName} a payé {$amount} € pour {$propertyName}",
                    'subtext' => 'Paiement confirmé',
                    'is_read' => false,
                    'created_at' => $payment->paid_at,
                    'link' => '/paiements',
                    'icon' => 'credit-card',
                ];
            }

            // 2. Paiements en attente/en retard
            $pendingPayments = Payment::where('landlord_user_id', $user->id)
                ->whereIn('status', ['pending', 'initiated'])
                ->whereHas('invoice', function($q) {
                    $q->where('due_date', '<', now());
                })
                ->with(['lease.property', 'lease.tenant'])
                ->get();

            foreach ($pendingPayments as $payment) {
                $propertyName = $payment->lease->property->name ?? 'Inconnu';
                $tenantName = $payment->lease->tenant 
                    ? ($payment->lease->tenant->first_name . ' ' . $payment->lease->tenant->last_name)
                    : 'Inconnu';
                $amount = number_format($payment->amount_total, 0, ',', ' ');

                $notifications[] = [
                    'id' => 'payment_pending_' . $payment->id,
                    'type' => 'warning',
                    'title' => 'Paiement en attente',
                    'message' => "Paiement de {$tenantName} pour {$propertyName} en attente",
                    'subtext' => "Montant: {$amount} €",
                    'is_read' => false,
                    'created_at' => $payment->created_at,
                    'link' => '/paiements',
                    'icon' => 'clock',
                ];
            }

            // 3. Rappels de paiements (envoyés mais non encore reçus)
            $upcomingDueInvoices = Invoice::whereHas('lease', function($q) use ($landlordId) {
                    $q->whereHas('property', function($pq) use ($landlordId) {
                        $pq->where('landlord_id', $landlordId);
                    });
                })
                ->where('status', 'pending')
                ->where('due_date', '>=', now())
                ->where('due_date', '<=', now()->addDays(7))
                ->with(['lease.property', 'lease.tenant'])
                ->get();

            foreach ($upcomingDueInvoices as $invoice) {
                $propertyName = $invoice->lease->property->name ?? 'Inconnu';
                $tenantName = $invoice->lease->tenant 
                    ? ($invoice->lease->tenant->first_name . ' ' . $invoice->lease->tenant->last_name)
                    : 'Inconnu';
                $amount = number_format($invoice->amount_total, 0, ',', ' ');
                $dueDate = Carbon::parse($invoice->due_date)->format('d/m/Y');

                $notifications[] = [
                    'id' => 'invoice_due_' . $invoice->id,
                    'type' => 'info',
                    'title' => 'Échéance proche',
                    'message' => "Facture pour {$tenantName} - {$propertyName}",
                    'subtext' => "{$amount} € - Échéance: {$dueDate}",
                    'is_read' => false,
                    'created_at' => $invoice->created_at,
                    'link' => '/factures',
                    'icon' => 'calendar',
                ];
            }

            // 4. Invitations de locataires acceptées récemment
            $recentInvitations = TenantInvitation::whereHas('lease.property', function($q) use ($landlordId) {
                    $q->where('landlord_id', $landlordId);
                })
                ->where('accepted_at', '>=', now()->subDays(7))
                ->with(['lease.property', 'lease.tenant'])
                ->get();

            foreach ($recentInvitations as $invitation) {
                $propertyName = $invitation->lease->property->name ?? 'Inconnu';
                $tenantName = $invitation->lease->tenant 
                    ? ($invitation->lease->tenant->first_name . ' ' . $invitation->lease->tenant->last_name)
                    : $invitation->email;

                $notifications[] = [
                    'id' => 'invitation_accepted_' . $invitation->id,
                    'type' => 'success',
                    'title' => 'Locataire confirmé',
                    'message' => "{$tenantName} a confirmé sa location pour {$propertyName}",
                    'subtext' => 'Invitation acceptée',
                    'is_read' => false,
                    'created_at' => $invitation->accepted_at,
                    'link' => '/locataires',
                    'icon' => 'user-check',
                ];
            }

            // 5. Nouvelles demandes d'intervention
            $recentInterventions = MaintenanceRequest::whereHas('property', function($q) use ($landlordId) {
                    $q->where('landlord_id', $landlordId);
                })
                ->where('created_at', '>=', now()->subDays(7))
                ->whereIn('priority', ['high', 'emergency'])
                ->with(['property'])
                ->get();

            foreach ($recentInterventions as $intervention) {
                $propertyName = $intervention->property->name ?? 'Inconnu';
                $priority = $intervention->priority === 'emergency' ? 'Urgente' : 'Haute priorité';

                $notifications[] = [
                    'id' => 'intervention_' . $intervention->id,
                    'type' => $intervention->priority === 'emergency' ? 'error' : 'warning',
                    'title' => "Intervention {$priority}",
                    'message' => $intervention->title,
                    'subtext' => $propertyName,
                    'is_read' => false,
                    'created_at' => $intervention->created_at,
                    'link' => '/interventions',
                    'icon' => 'wrench',
                ];
            }

            // 6. Quittances générées récemment
            $recentReceipts = RentReceipt::whereHas('property', function($q) use ($landlordId) {
                    $q->where('landlord_id', $landlordId);
                })
                ->where('status', 'paid')
                ->where('issued_date', '>=', now()->subDays(7))
                ->with(['property', 'lease.tenant'])
                ->get();

            foreach ($recentReceipts as $receipt) {
                $propertyName = $receipt->property->name ?? 'Inconnu';
                $tenantName = $receipt->lease->tenant 
                    ? ($receipt->lease->tenant->first_name . ' ' . $receipt->lease->tenant->last_name)
                    : 'Inconnu';
                $month = $receipt->paid_month ?? ($receipt->month . '/' . $receipt->year);

                $notifications[] = [
                    'id' => 'receipt_' . $receipt->id,
                    'type' => 'info',
                    'title' => 'Quittance générée',
                    'message' => "Quittance de {$tenantName} pour {$propertyName}",
                    'subtext' => 'Mois de ' . $month,
                    'is_read' => false,
                    'created_at' => $receipt->issued_date,
                    'link' => '/quittances',
                    'icon' => 'file-text',
                ];
            }

            // 7. Baux expirant dans 30 jours
            $expiringLeases = Lease::whereHas('property', function($q) use ($landlordId) {
                    $q->where('landlord_id', $landlordId);
                })
                ->where('status', 'active')
                ->whereNotNull('end_date')
                ->where('end_date', '>=', now())
                ->where('end_date', '<=', now()->addDays(30))
                ->with(['property', 'tenant'])
                ->get();

            foreach ($expiringLeases as $lease) {
                $propertyName = $lease->property->name ?? 'Inconnu';
                $tenantName = $lease->tenant 
                    ? ($lease->tenant->first_name . ' ' . $lease->tenant->last_name)
                    : 'Inconnu';
                $daysLeft = now()->diffInDays($lease->end_date);
                $endDate = Carbon::parse($lease->end_date)->format('d/m/Y');

                $notifications[] = [
                    'id' => 'lease_expiring_' . $lease->id,
                    'type' => 'warning',
                    'title' => 'Bail expirant',
                    'message' => "Le bail de {$tenantName} pour {$propertyName} expire dans {$daysLeft} jours",
                    'subtext' => 'Date de fin: ' . $endDate,
                    'is_read' => false,
                    'created_at' => $lease->updated_at,
                    'link' => '/baux',
                    'icon' => 'home',
                ];
            }

            // 8. Préavis reçus
            $recentNotices = Notice::whereHas('lease.property', function($q) use ($landlordId) {
                    $q->where('landlord_id', $landlordId);
                })
                ->where('created_at', '>=', now()->subDays(7))
                ->with(['lease.property', 'lease.tenant'])
                ->get();

            foreach ($recentNotices as $notice) {
                $propertyName = $notice->lease->property->name ?? 'Inconnu';
                $tenantName = $notice->lease->tenant 
                    ? ($notice->lease->tenant->first_name . ' ' . $notice->lease->tenant->last_name)
                    : 'Inconnu';
                $effectiveDate = Carbon::parse($notice->effective_date)->format('d/m/Y');

                $notifications[] = [
                    'id' => 'notice_' . $notice->id,
                    'type' => 'warning',
                    'title' => 'Préavis reçu',
                    'message' => "{$tenantName} a envoyé un préavis pour {$propertyName}",
                    'subtext' => 'Effective le: ' . $effectiveDate,
                    'is_read' => false,
                    'created_at' => $notice->created_at,
                    'link' => '/preavis',
                    'icon' => 'file-signature',
                ];
            }

            // Trier par date décroissante
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
     * POST /api/landlord/notifications/{id}/read
     * Marquer une notification comme lue
     */
    public function markAsRead(Request $request, string $id): JsonResponse
    {
        try {
            $user = auth()->user();

            if (!$user || !$user->isLandlord()) {
                return response()->json(['message' => 'Accès réservé aux propriétaires'], 403);
            }

            // Dans une implémentation complète, on enregistrerait dans une table
            // Pour l'instant, on retourne juste un succès
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
     * POST /api/landlord/notifications/read-all
     * Marquer toutes les notifications comme lues
     */
    public function markAllAsRead(Request $request): JsonResponse
    {
        try {
            $user = auth()->user();

            if (!$user || !$user->isLandlord()) {
                return response()->json(['message' => 'Accès réservé aux propriétaires'], 403);
            }

            // Dans une implémentation complète, on enregistrerait dans une table
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
}
