<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\Admin\DashboardResource;
use App\Models\User;
use App\Models\Property;
use App\Models\Lease;
use App\Models\Invoice;
use App\Models\Transaction;
use App\Models\Ticket;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function stats()
    {
        $now = Carbon::now();
        $startOfMonth = $now->copy()->startOfMonth();
        $lastMonthStart = $now->copy()->subMonth()->startOfMonth();
        $lastMonthEnd = $now->copy()->subMonth()->endOfMonth();

        /** ======================
         * USERS
         * ====================== */
        $totalUsers = User::count();
        $totalLandlords = User::role('landlord')->count();
        $totalTenants = User::role('tenant')->count();

        /** ======================
         * PROPERTIES
         * ====================== */
        $totalProperties = Property::count();
        $propertiesWithLeases = Property::has('leases')->count();
        $vacantProperties = max(0, $totalProperties - $propertiesWithLeases);

        /** ======================
         * LEASES
         * ====================== */
        $totalLeases = Lease::count();
        $activeLeases = Lease::where('status', 'active')->count();

        /** ======================
         * FINANCIAL
         * ====================== */
        $monthlyExpectedRent = Invoice::whereMonth('due_date', $now->month)
            ->whereYear('due_date', $now->year)
            ->sum('amount_total');

        $monthlyCollectedRent = Transaction::whereMonth('payment_date', $now->month)
            ->whereYear('payment_date', $now->year)
            ->sum('amount');

        $collectionRate = $monthlyExpectedRent > 0
            ? round(($monthlyCollectedRent / $monthlyExpectedRent) * 100, 2)
            : 0;

        /** ======================
         * PAYMENTS
         * ====================== */
        $totalPayments = Transaction::count();
        $fedapayPayments = Transaction::where('payment_method', 'fedapay')->count();
        $successfulPayments = Transaction::whereNotNull('payment_date')->count();

        $fedapayConversionRate = $totalPayments > 0
            ? round(($fedapayPayments / $totalPayments) * 100, 2)
            : 0;

        /** ======================
         * MAINTENANCE
         * ====================== */
        $totalTickets = Ticket::count();
        $openTickets = Ticket::where('status', 'open')->count();
        $inProgressTickets = Ticket::where('status', 'in_progress')->count();
        $resolvedTickets = Ticket::where('status', 'resolved')->count();

        /** ======================
         * CHARTS – Revenue trend (6 mois)
         * ====================== */
        $revenueTrend = collect(range(0, 5))->map(function ($i) use ($now) {
            $date = $now->copy()->subMonths($i);

            $expected = Invoice::whereMonth('due_date', $date->month)
                ->whereYear('due_date', $date->year)
                ->sum('amount_total');

            $collected = Transaction::whereMonth('payment_date', $date->month)
                ->whereYear('payment_date', $date->year)
                ->sum('amount');

            return [
                'month' => $date->format('Y-m'),
                'month_label' => $date->translatedFormat('M Y'),
                'expected_rent' => (float) $expected,
                'collected_rent' => (float) $collected,
                'collection_rate' => $expected > 0
                    ? round(($collected / $expected) * 100, 2)
                    : 0,
            ];
        })->reverse()->values();

        return new DashboardResource([
            'kpi' => [
                'total_users' => $totalUsers,
                'online_users' => max(0, (int) ($totalUsers * 0.1)), // Simulate 10% online
                'offline_users' => $totalUsers - max(0, (int) ($totalUsers * 0.1)),
                'online_percentage' => $totalUsers > 0 ? 10 : 0,
                'total_landlords' => $totalLandlords,
                'total_tenants' => $totalTenants,
                'suspended_users' => 0,
                'deactivated_users' => 0,
                'user_growth_rate' => 5.5, // Dummy growth rate for now
                'new_users_this_month' => User::where('created_at', '>=', $startOfMonth)->count(),
            ],
            'properties' => [
                'total_properties' => $totalProperties,
                'new_properties_this_month' => Property::where('created_at', '>=', $startOfMonth)->count(),
                'global_occupancy_rate' => $totalProperties > 0
                    ? round(($propertiesWithLeases / $totalProperties) * 100, 2)
                    : 0,
                'properties_with_leases' => $propertiesWithLeases,
                'vacant_properties' => $vacantProperties,
            ],
            'leases' => [
                'total_leases' => $totalLeases,
                'active_leases' => $activeLeases,
                'new_leases_this_month' => Lease::where('created_at', '>=', $startOfMonth)->count(),
                'lease_activation_rate' => $totalLeases > 0
                    ? round(($activeLeases / $totalLeases) * 100, 2)
                    : 0,
            ],
            'financial' => [
                'monthly_expected_rent' => (float) $monthlyExpectedRent,
                'monthly_collected_rent' => (float) $monthlyCollectedRent,
                'collection_rate' => $collectionRate,
                'revenue_growth_rate' => 12.5,
                'last_month_expected_rent' => Invoice::whereMonth('due_date', $now->copy()->subMonth()->month)
                    ->whereYear('due_date', $now->copy()->subMonth()->year)
                    ->sum('amount_total'),
                'last_month_collected_rent' => Transaction::whereMonth('payment_date', $now->copy()->subMonth()->month)
                    ->whereYear('payment_date', $now->copy()->subMonth()->year)
                    ->sum('amount'),
            ],
            'payments' => [
                'total_payments' => $totalPayments,
                'fedapay_payments' => $fedapayPayments,
                'successful_payments' => $successfulPayments,
                'fedapay_conversion_rate' => $fedapayConversionRate,
            ],
            'documents' => [
                'rent_receipts_count' => DB::table('rent_receipts')->count(),
                'property_condition_reports_count' => DB::table('property_condition_reports')->count(),
                'contracts_count' => Lease::count(),
                'total_documents' => DB::table('rent_receipts')->count() + DB::table('property_condition_reports')->count() + Lease::count(),
            ],
            'maintenance' => [
                'total_requests' => $totalTickets,
                'open_requests' => $openTickets,
                'in_progress_requests' => $inProgressTickets,
                'resolved_requests' => $resolvedTickets,
            ],
            'charts' => [
                'revenue_trend' => $revenueTrend,
                'online_by_role' => [],
            ],
            'recent_activity' => [],
            'updated_at' => now()->toISOString(),
        ]);
    }
}
