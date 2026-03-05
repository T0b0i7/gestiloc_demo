<?php

namespace App\Services\Admin\Dashboard;

use App\Models\Property;

class PropertyStatsService
{
    public function overview(): array
    {
        $totalProperties = Property::count();

        $totalWithLeases = Property::whereHas('leases', fn($q) => $q->where('status', 'active'))->count();

        $newPropertiesThisMonth = Property::where('created_at', '>=', now()->startOfMonth())->count();

        $vacantProperties = $totalProperties - $totalWithLeases;

        return [
            'total_properties' => $totalProperties,
            'new_properties_this_month' => $newPropertiesThisMonth,
            'global_occupancy_rate' => $totalProperties > 0 ? round(($totalWithLeases / $totalProperties) * 100, 1) : 0,
            'properties_with_leases' => $totalWithLeases,
            'vacant_properties' => $vacantProperties,
        ];
    }
}
