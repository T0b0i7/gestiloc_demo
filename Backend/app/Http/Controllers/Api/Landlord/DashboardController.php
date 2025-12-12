<?php

namespace App\Http\Controllers\Api\Landlord;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\Lease;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DashboardController extends Controller
{
    private function getLandlord()
    {
        return auth()->user()->landlord;
    }

    public function stats()
    {
        $landlordId = $this->getLandlord()->id;

        // 1. Chiffres clés
        $totalProperties = $this->getLandlord()->properties()->count();

        $activeLeases = Lease::whereHas('property', function ($q) use ($landlordId) {
            $q->where('landlord_id', $landlordId);
        })->where('status', 'active')->count();

        // Taux d'occupation
        $occupancyRate = $totalProperties > 0
            ? round(($activeLeases / $totalProperties) * 100)
            : 0;

        // 2. Finances du mois en cours
        $startOfMonth = Carbon::now()->startOfMonth();
        $endOfMonth = Carbon::now()->endOfMonth();

        // Récupérer les factures liées aux baux de ce propriétaire pour ce mois
        $monthlyFinancials = Invoice::whereHas('lease.property', function ($q) use ($landlordId) {
            $q->where('landlord_id', $landlordId);
        })
        ->whereBetween('due_date', [$startOfMonth, $endOfMonth])
        ->select(
            DB::raw('SUM(amount_total) as expected'),
            DB::raw('SUM(amount_paid) as collected')
        )->first();

        // 3. Derniers baux signés (pour liste rapide)
        $latestLeases = Lease::whereHas('property', function ($q) use ($landlordId) {
                $q->where('landlord_id', $landlordId);
            })
            ->with(['property:id,name', 'tenant:id,first_name,last_name'])
            ->latest()
            ->take(5)
            ->get()
            ->map(function($lease) {
                return [
                    'id' => $lease->uuid,
                    'property' => $lease->property->name,
                    'tenant' => $lease->tenant->first_name . ' ' . $lease->tenant->last_name,
                    'date' => $lease->start_date->format('d/m/Y'),
                    'status' => $lease->status
                ];
            });

        return response()->json([
            'kpi' => [
                'total_properties' => $totalProperties,
                'active_tenants' => $activeLeases,
                'occupancy_rate' => $occupancyRate,
                'revenue_expected' => (float) $monthlyFinancials->expected ?? 0,
                'revenue_collected' => (float) $monthlyFinancials->collected ?? 0,
            ],
            'charts' => [
                // Ici on pourrait ajouter des données pour un graph sur 6 mois
                'revenue_trend' => $this->getRevenueTrend($landlordId)
            ],
            'recent_leases' => $latestLeases
        ]);
    }

    // Helper pour générer des données de graphique sur 6 mois
    private function getRevenueTrend($landlordId)
    {
        return Invoice::whereHas('lease.property', function ($q) use ($landlordId) {
                $q->where('landlord_id', $landlordId);
            })
            ->where('status', 'paid')
            ->where('created_at', '>=', Carbon::now()->subMonths(6))
            ->select(
                DB::raw("DATE_FORMAT(created_at, '%Y-%m') as month"),
                DB::raw('SUM(amount_paid) as total')
            )
            ->groupBy('month')
            ->orderBy('month')
            ->get();
    }
}
