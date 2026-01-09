<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Property;
use App\Models\Lease;
use App\Models\MaintenanceRequest;
use App\Models\Invoice;
use App\Models\Tenant;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function stats(Request $request): JsonResponse
    {
        // Périodes pour les tendances
        $now = now();
        $startOfMonth = $now->copy()->startOfMonth();
        $startOfLastMonth = $now->copy()->subMonth()->startOfMonth();
        $endOfLastMonth = $now->copy()->subMonth()->endOfMonth();
        $thirtyDaysAgo = $now->copy()->subDays(30);

        // Statistiques utilisateurs
        $totalUsers = User::count();
        $onlineUsers = User::where('last_activity_at', '>=', $now->copy()->subMinutes(5))->count();
        $offlineUsers = $totalUsers - $onlineUsers;

        $totalLandlords = User::role('landlord')->count();
        $totalTenants = User::role('tenant')->count();
        $suspendedUsers = User::where('status', 'suspended')->count();
        $deactivatedUsers = User::where('status', 'deactivated')->count();

        // Croissance utilisateurs (30 derniers jours)
        $newUsersThisMonth = User::where('created_at', '>=', $startOfMonth)->count();
        $newUsersLastMonth = User::whereBetween('created_at', [$startOfLastMonth, $endOfLastMonth])->count();
        $userGrowthRate = $newUsersLastMonth > 0 ? 
            round((($newUsersThisMonth - $newUsersLastMonth) / $newUsersLastMonth) * 100, 1) : 0;

        // Statistiques propriétés
        $totalProperties = Property::count();
        $newPropertiesThisMonth = Property::where('created_at', '>=', $startOfMonth)->count();
        
        // Taux d'occupation global
        $totalPropertiesWithLeases = Property::whereHas('leases', function($q) {
            $q->where('status', 'active');
        })->count();
        
        $globalOccupancyRate = $totalProperties > 0 ? 
            round(($totalPropertiesWithLeases / $totalProperties) * 100, 1) : 0;

        // Statistiques baux
        $totalLeases = Lease::count();
        $activeLeases = Lease::where('status', 'active')->count();
        $newLeasesThisMonth = Lease::where('created_at', '>=', $startOfMonth)->count();

        // Statistiques financières (plate-forme)
        $monthlyExpectedRent = Lease::where('status', 'active')
            ->whereBetween('start_date', [$startOfMonth, $now->copy()->endOfMonth()])
            ->sum('rent_amount');

        $monthlyCollectedRent = Invoice::where('status', 'paid')
            ->whereBetween('due_date', [$startOfMonth, $now->copy()->endOfMonth()])
            ->sum('amount_paid');

        $lastMonthExpectedRent = Lease::where('status', 'active')
            ->whereBetween('start_date', [$startOfLastMonth, $endOfLastMonth])
            ->sum('rent_amount');

        $lastMonthCollectedRent = Invoice::where('status', 'paid')
            ->whereBetween('due_date', [$startOfLastMonth, $endOfLastMonth])
            ->sum('amount_paid');

        $revenueGrowthRate = $lastMonthCollectedRent > 0 ? 
            round((($monthlyCollectedRent - $lastMonthCollectedRent) / $lastMonthCollectedRent) * 100, 1) : 0;

        $collectionRate = $monthlyExpectedRent > 0 ? 
            round(($monthlyCollectedRent / $monthlyExpectedRent) * 100, 1) : 0;

        // Statistiques maintenance
        $totalMaintenanceRequests = MaintenanceRequest::count();
        $openMaintenanceRequests = MaintenanceRequest::where('status', 'open')->count();
        $inProgressMaintenanceRequests = MaintenanceRequest::where('status', 'in_progress')->count();
        $resolvedMaintenanceRequests = MaintenanceRequest::where('status', 'resolved')->count();

        // Métriques paiements en ligne (FedaPay)
        $totalPayments = \App\Models\Payment::count();
        $fedapayPayments = \App\Models\Payment::where('payment_method', 'fedapay')->count();
        $successfulPayments = \App\Models\Payment::where('status', 'completed')->count();
        $fedapayConversionRate = $fedapayPayments > 0 ? 
            round(($successfulPayments / $fedapayPayments) * 100, 1) : 0;

        // Documents générés
        $rentReceiptsCount = \App\Models\RentReceipt::count();
        $propertyConditionReportsCount = \App\Models\PropertyConditionReport::count();
        $contractsCount = Lease::whereNotNull('contract_file_path')->count();

        // Tendances revenus (6 derniers mois)
        $revenueTrend = $this->getRevenueTrend(6);

        // Activité récente
        $recentActivity = $this->getRecentActivity();

        // Utilisateurs en ligne par rôle
        $onlineByRole = $this->getOnlineByRole();

        return response()->json([
            'kpi' => [
                'total_users' => $totalUsers,
                'online_users' => $onlineUsers,
                'offline_users' => $offlineUsers,
                'online_percentage' => $totalUsers > 0 ? round(($onlineUsers / $totalUsers) * 100, 1) : 0,
                'total_landlords' => $totalLandlords,
                'total_tenants' => $totalTenants,
                'suspended_users' => $suspendedUsers,
                'deactivated_users' => $deactivatedUsers,
                'user_growth_rate' => $userGrowthRate,
                'new_users_this_month' => $newUsersThisMonth,
            ],
            'properties' => [
                'total_properties' => $totalProperties,
                'new_properties_this_month' => $newPropertiesThisMonth,
                'global_occupancy_rate' => $globalOccupancyRate,
                'properties_with_leases' => $totalPropertiesWithLeases,
                'vacant_properties' => $totalProperties - $totalPropertiesWithLeases,
            ],
            'leases' => [
                'total_leases' => $totalLeases,
                'active_leases' => $activeLeases,
                'new_leases_this_month' => $newLeasesThisMonth,
                'lease_activation_rate' => $totalLeases > 0 ? 
                    round(($activeLeases / $totalLeases) * 100, 1) : 0,
            ],
            'financial' => [
                'monthly_expected_rent' => (float) $monthlyExpectedRent,
                'monthly_collected_rent' => (float) $monthlyCollectedRent,
                'collection_rate' => $collectionRate,
                'revenue_growth_rate' => $revenueGrowthRate,
                'last_month_expected_rent' => (float) $lastMonthExpectedRent,
                'last_month_collected_rent' => (float) $lastMonthCollectedRent,
            ],
            'payments' => [
                'total_payments' => $totalPayments,
                'fedapay_payments' => $fedapayPayments,
                'successful_payments' => $successfulPayments,
                'fedapay_conversion_rate' => $fedapayConversionRate,
            ],
            'documents' => [
                'rent_receipts_count' => $rentReceiptsCount,
                'property_condition_reports_count' => $propertyConditionReportsCount,
                'contracts_count' => $contractsCount,
                'total_documents' => $rentReceiptsCount + $propertyConditionReportsCount + $contractsCount,
            ],
            'maintenance' => [
                'total_requests' => $totalMaintenanceRequests,
                'open_requests' => $openMaintenanceRequests,
                'in_progress_requests' => $inProgressMaintenanceRequests,
                'resolved_requests' => $resolvedMaintenanceRequests,
            ],
            'charts' => [
                'revenue_trend' => $revenueTrend,
                'online_by_role' => $onlineByRole,
            ],
            'recent_activity' => $recentActivity,
            'updated_at' => $now->toISOString(),
        ]);
    }

    private function getRevenueTrend(int $months): array
    {
        $data = [];
        
        for ($i = $months - 1; $i >= 0; $i--) {
            $monthStart = now()->copy()->subMonths($i)->startOfMonth();
            $monthEnd = now()->copy()->subMonths($i)->endOfMonth();
            
            $expectedRent = Lease::where('status', 'active')
                ->whereBetween('start_date', [$monthStart, $monthEnd])
                ->sum('rent_amount');
            
            $collectedRent = Invoice::where('status', 'paid')
                ->whereBetween('due_date', [$monthStart, $monthEnd])
                ->sum('amount_paid');
            
            $data[] = [
                'month' => $monthStart->format('Y-m'),
                'month_label' => $monthStart->format('M Y'),
                'expected_rent' => (float) $expectedRent,
                'collected_rent' => (float) $collectedRent,
                'collection_rate' => $expectedRent > 0 ? round(($collectedRent / $expectedRent) * 100, 1) : 0,
            ];
        }
        
        return $data;
    }

    private function getOnlineByRole(): array
    {
        $onlineThreshold = now()->subMinutes(5);
        
        $onlineUsers = User::where('last_activity_at', '>=', $onlineThreshold)
            ->with('roles')
            ->get();

        $byRole = $onlineUsers->groupBy(function($user) {
            return $user->getRoleNames()->first() ?? 'unknown';
        })->map(function($group) {
            return $group->count();
        });

        return [
            'admin' => $byRole['admin'] ?? 0,
            'landlord' => $byRole['landlord'] ?? 0,
            'tenant' => $byRole['tenant'] ?? 0,
            'unknown' => $byRole['unknown'] ?? 0,
        ];
    }

    private function getRecentActivity(): array
    {
        $activity = [];
        $since = now()->subDays(7);

        // Nouveaux utilisateurs
        $newUsers = User::where('created_at', '>=', $since)
            ->with('roles')
            ->latest()
            ->take(5)
            ->get()
            ->map(function($user) {
                return [
                    'type' => 'user_registered',
                    'description' => 'Nouvel utilisateur: ' . $user->email,
                    'role' => $user->getRoleNames()->first(),
                    'created_at' => $user->created_at->toISOString(),
                ];
            });

        // Nouvelles propriétés
        $newProperties = Property::where('created_at', '>=', $since)
            ->with('landlord.user')
            ->latest()
            ->take(5)
            ->get()
            ->map(function($property) {
                return [
                    'type' => 'property_added',
                    'description' => 'Nouveau bien: ' . $property->name,
                    'landlord' => $property->landlord?->user?->email,
                    'created_at' => $property->created_at->toISOString(),
                ];
            });

        // Nouveaux baux
        $newLeases = Lease::where('created_at', '>=', $since)
            ->with(['property.landlord.user', 'tenant.user'])
            ->latest()
            ->take(5)
            ->get()
            ->map(function($lease) {
                return [
                    'type' => 'lease_created',
                    'description' => 'Nouveau bail: ' . $lease->lease_number,
                    'property' => $lease->property->name,
                    'landlord' => $lease->property->landlord?->user?->email,
                    'tenant' => $lease->tenant?->user?->email,
                    'created_at' => $lease->created_at->toISOString(),
                ];
            });

        // Paiements récents
        $recentPayments = \App\Models\Payment::where('created_at', '>=', $since)
            ->with(['invoice.lease.property.landlord.user', 'invoice.lease.tenant.user'])
            ->where('status', 'completed')
            ->latest()
            ->take(5)
            ->get()
            ->map(function($payment) {
                return [
                    'type' => 'payment_completed',
                    'description' => 'Paiement de ' . number_format($payment->amount, 2) . ' ' . ($payment->currency ?? 'XOF'),
                    'method' => $payment->payment_method,
                    'tenant' => $payment->invoice?->lease?->tenant?->user?->email,
                    'property' => $payment->invoice?->lease?->property?->name,
                    'created_at' => $payment->created_at->toISOString(),
                ];
            });

        // Documents générés récemment
        $recentRentReceipts = \App\Models\RentReceipt::where('created_at', '>=', $since)
            ->with(['property.landlord.user', 'tenant.user'])
            ->latest()
            ->take(3)
            ->get()
            ->map(function($receipt) {
                return [
                    'type' => 'rent_receipt_generated',
                    'description' => 'Quittance générée: ' . $receipt->reference,
                    'property' => $receipt->property?->name,
                    'tenant' => $receipt->tenant?->user?->email,
                    'month' => $receipt->paid_month,
                    'created_at' => $receipt->created_at->toISOString(),
                ];
            });

        $recentConditionReports = \App\Models\PropertyConditionReport::where('created_at', '>=', $since)
            ->with(['property.landlord.user'])
            ->latest()
            ->take(3)
            ->get()
            ->map(function($report) {
                return [
                    'type' => 'condition_report_created',
                    'description' => 'État des lieux: ' . ($report->type === 'entry' ? 'Entrée' : 'Sortie'),
                    'property' => $report->property?->name,
                    'landlord' => $report->property?->landlord?->user?->email,
                    'created_at' => $report->created_at->toISOString(),
                ];
            });

        // Comptes suspendus/désactivés
        $statusChanges = User::where(function($q) use ($since) {
                $q->where('suspended_at', '>=', $since)
                  ->orWhere('deactivated_at', '>=', $since);
            })
            ->with(['suspendedByAdmin', 'deactivatedByAdmin'])
            ->latest()
            ->take(5)
            ->get()
            ->map(function($user) {
                if ($user->suspended_at && $user->suspended_at >= $since) {
                    return [
                        'type' => 'user_suspended',
                        'description' => 'Compte suspendu: ' . $user->email,
                        'reason' => $user->suspension_reason,
                        'admin' => $user->suspendedByAdmin?->email,
                        'created_at' => $user->suspended_at->toISOString(),
                    ];
                }
                
                if ($user->deactivated_at && $user->deactivated_at >= $since) {
                    return [
                        'type' => 'user_deactivated',
                        'description' => 'Compte désactivé: ' . $user->email,
                        'reason' => $user->deactivation_reason,
                        'admin' => $user->deactivatedByAdmin?->email,
                        'created_at' => $user->deactivated_at->toISOString(),
                    ];
                }
                
                return null;
            })
            ->filter();

        return collect($newUsers)
            ->merge($newProperties)
            ->merge($newLeases)
            ->merge($recentPayments)
            ->merge($recentRentReceipts)
            ->merge($recentConditionReports)
            ->merge($statusChanges)
            ->sortByDesc('created_at')
            ->values()
            ->take(30)
            ->toArray();
    }
}
