<?php

namespace App\Services\Admin\Dashboard;

use App\Models\Lease;
use App\Models\Invoice;

class FinanceStatsService
{
    public function monthlyOverview(): array
    {
        $now = now();
        $startOfMonth = $now->copy()->startOfMonth();
        $startOfLastMonth = $now->copy()->subMonth()->startOfMonth();
        $endOfLastMonth = $now->copy()->subMonth()->endOfMonth();

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

        $revenueGrowthRate = $lastMonthCollectedRent > 0
            ? round((($monthlyCollectedRent - $lastMonthCollectedRent) / $lastMonthCollectedRent) * 100, 1)
            : 0;

        $collectionRate = $monthlyExpectedRent > 0
            ? round(($monthlyCollectedRent / $monthlyExpectedRent) * 100, 1)
            : 0;

        return [
            'monthly_expected_rent' => (float) $monthlyExpectedRent,
            'monthly_collected_rent' => (float) $monthlyCollectedRent,
            'last_month_expected_rent' => (float) $lastMonthExpectedRent,
            'last_month_collected_rent' => (float) $lastMonthCollectedRent,
            'collection_rate' => $collectionRate,
            'revenue_growth_rate' => $revenueGrowthRate,
        ];
    }

    public function revenueTrend(int $months = 6): array
    {
        $data = [];

        for ($i = $months - 1; $i >= 0; $i--) {
            $monthStart = now()->subMonths($i)->startOfMonth();
            $monthEnd = now()->subMonths($i)->endOfMonth();

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
}
