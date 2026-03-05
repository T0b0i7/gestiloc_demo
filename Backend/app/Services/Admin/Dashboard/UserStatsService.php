<?php

namespace App\Services\Admin\Dashboard;

use App\Models\User;
use Carbon\Carbon;

class UserStatsService
{
    public function kpi(): array
    {
        $now = now();
        $startOfMonth = $now->copy()->startOfMonth();
        $startOfLastMonth = $now->copy()->subMonth()->startOfMonth();
        $endOfLastMonth = $now->copy()->subMonth()->endOfMonth();

        $totalUsers = User::count();
        $onlineUsers = User::where('last_activity_at', '>=', $now->copy()->subMinutes(5))->count();
        $offlineUsers = $totalUsers - $onlineUsers;

        $newUsersThisMonth = User::where('created_at', '>=', $startOfMonth)->count();
        $newUsersLastMonth = User::whereBetween('created_at', [$startOfLastMonth, $endOfLastMonth])->count();
        $userGrowthRate = $newUsersLastMonth > 0
            ? round((($newUsersThisMonth - $newUsersLastMonth) / $newUsersLastMonth) * 100, 1)
            : 0;

        return [
            'total_users' => $totalUsers,
            'online_users' => $onlineUsers,
            'offline_users' => $offlineUsers,
            'online_percentage' => $totalUsers > 0 ? round(($onlineUsers / $totalUsers) * 100, 1) : 0,
            'new_users_this_month' => $newUsersThisMonth,
            'user_growth_rate' => $userGrowthRate,
            'total_landlords' => User::role('landlord')->count(),
            'total_tenants' => User::role('tenant')->count(),
            'suspended_users' => User::where('status', 'suspended')->count(),
            'deactivated_users' => User::where('status', 'deactivated')->count(),
        ];
    }

    public function onlineByRole(): array
    {
        $threshold = now()->subMinutes(5);

        $onlineUsers = User::where('last_activity_at', '>=', $threshold)->with('roles')->get();

        $grouped = $onlineUsers->groupBy(fn($user) => $user->getRoleNames()->first() ?? 'unknown')
                               ->map(fn($group) => $group->count());

        return [
            'admin' => $grouped['admin'] ?? 0,
            'landlord' => $grouped['landlord'] ?? 0,
            'tenant' => $grouped['tenant'] ?? 0,
            'unknown' => $grouped['unknown'] ?? 0,
        ];
    }
}
