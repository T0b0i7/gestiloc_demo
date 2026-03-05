<?php

namespace App\Services\Admin\Dashboard;

use App\Models\Lease;

class LeaseStatsService
{
    public function overview(): array
    {
        $totalLeases = Lease::count();
        $activeLeases = Lease::where('status', 'active')->count();
        $newLeasesThisMonth = Lease::where('created_at', '>=', now()->startOfMonth())->count();

        return [
            'total_leases' => $totalLeases,
            'active_leases' => $activeLeases,
            'new_leases_this_month' => $newLeasesThisMonth,
            'lease_activation_rate' => $totalLeases > 0 ? round(($activeLeases / $totalLeases) * 100, 1) : 0,
        ];
    }
}
