<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Property;
use App\Models\PropertyReport;
use App\Models\Lease;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Carbon\Carbon;

class PropertyController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Property::with([
            'landlord.user',
            'leases',
            'pendingReports',
            'reports' => function($q) {
                $q->latest()->take(3);
            }
        ]);

        // Filtres avancés
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('address', 'like', "%{$search}%")
                  ->orWhere('reference_code', 'like', "%{$search}%")
                  ->orWhere('city', 'like', "%{$search}%")
                  ->orWhere('district', 'like', "%{$search}%")
                  ->orWhereHas('landlord.user', function($subQ) use ($search) {
                      $subQ->where('email', 'like', "%{$search}%");
                  });
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        if ($request->filled('city')) {
            $query->where('city', $request->city);
        }

        if ($request->filled('landlord_id')) {
            $query->where('landlord_id', $request->landlord_id);
        }

        if ($request->filled('has_reports')) {
            $hasReports = $request->boolean('has_reports');
            if ($hasReports) {
                $query->whereHas('reports');
            } else {
                $query->whereDoesntHave('reports');
            }
        }

        if ($request->filled('has_pending_reports')) {
            $hasPendingReports = $request->boolean('has_pending_reports');
            if ($hasPendingReports) {
                $query->whereHas('pendingReports');
            } else {
                $query->whereDoesntHave('pendingReports');
            }
        }

        // Filtres de loyer
        if ($request->filled('min_rent')) {
            $query->where('rent_amount', '>=', $request->min_rent);
        }

        if ($request->filled('max_rent')) {
            $query->where('rent_amount', '<=', $request->max_rent);
        }

        // Filtres de surface
        if ($request->filled('min_surface')) {
            $query->where('surface', '>=', $request->min_surface);
        }

        if ($request->filled('max_surface')) {
            $query->where('surface', '<=', $request->max_surface);
        }

        // Tri
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        
        if (in_array($sortBy, ['created_at', 'updated_at', 'name', 'rent_amount', 'city', 'status'])) {
            $query->orderBy($sortBy, $sortOrder);
        }

        $properties = $query->paginate($request->get('per_page', 20));

        return response()->json([
            'data' => $properties->items(),
            'meta' => [
                'current_page' => $properties->currentPage(),
                'last_page' => $properties->lastPage(),
                'per_page' => $properties->perPage(),
                'total' => $properties->total(),
            ],
        ]);
    }

    public function show(Property $property): JsonResponse
    {
        $property->load([
            'landlord.user',
            'leases.tenant.user',
            'leases' => function($q) {
                $q->latest();
            },
            'reports.reporter',
            'reports.reviewer',
            'conditionReports',
            'maintenanceRequests'
        ]);

        // Statistiques du bien
        $stats = $this->getPropertyStats($property);

        return response()->json([
            'property' => $property,
            'stats' => $stats,
        ]);
    }

    public function reports(Request $request): JsonResponse
    {
        $query = PropertyReport::with([
            'property.landlord.user',
            'reporter',
            'reviewer'
        ]);

        // Filtres
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('report_type')) {
            $query->where('report_type', $request->report_type);
        }

        if ($request->filled('property_id')) {
            $query->where('property_id', $request->property_id);
        }

        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        // Tri
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        
        if (in_array($sortBy, ['created_at', 'reviewed_at', 'status'])) {
            $query->orderBy($sortBy, $sortOrder);
        }

        $reports = $query->paginate($request->get('per_page', 20));

        return response()->json([
            'data' => $reports->items(),
            'meta' => [
                'current_page' => $reports->currentPage(),
                'last_page' => $reports->lastPage(),
                'per_page' => $reports->perPage(),
                'total' => $reports->total(),
            ],
        ]);
    }

    public function updateReportStatus(Request $request, PropertyReport $report): JsonResponse
    {
        $request->validate([
            'status' => ['required', Rule::in(['under_review', 'resolved', 'dismissed'])],
            'admin_notes' => 'nullable|string|max:1000',
        ]);

        $admin = $request->user();

        switch ($request->status) {
            case 'under_review':
                $report->markAsUnderReview($admin);
                break;
            case 'resolved':
                $report->markAsResolved($admin, $request->admin_notes);
                break;
            case 'dismissed':
                $report->markAsDismissed($admin, $request->admin_notes);
                break;
        }

        return response()->json([
            'message' => 'Statut du signalement mis à jour',
            'report' => $report->fresh(['reviewer'])
        ]);
    }

    public function analytics(Request $request): JsonResponse
    {
        // Période pour les analytics
        $period = $request->get('period', 'all'); // all, 30d, 90d, 1y
        $dateFilter = $this->getDateFilter($period);

        // Répartition géographique
        $geographicDistribution = Property::where('created_at', '>=', $dateFilter)
            ->select('city', DB::raw('count(*) as count'))
            ->groupBy('city')
            ->orderByDesc('count')
            ->limit(20)
            ->get();

        // Types de biens
        $propertyTypes = Property::where('created_at', '>=', $dateFilter)
            ->select('type', DB::raw('count(*) as count'))
            ->groupBy('type')
            ->orderByDesc('count')
            ->get();

        // Fourchettes de loyers
        $rentRanges = [
            ['min' => 0, 'max' => 25000, 'label' => '0 - 25,000 XOF'],
            ['min' => 25001, 'max' => 50000, 'label' => '25,001 - 50,000 XOF'],
            ['min' => 50001, 'max' => 100000, 'label' => '50,001 - 100,000 XOF'],
            ['min' => 100001, 'max' => 200000, 'label' => '100,001 - 200,000 XOF'],
            ['min' => 200001, 'max' => 999999999, 'label' => '+200,000 XOF'],
        ];

        $rentDistribution = [];
        foreach ($rentRanges as $range) {
            $count = Property::where('created_at', '>=', $dateFilter)
                ->where('rent_amount', '>=', $range['min'])
                ->where('rent_amount', '<=', $range['max'])
                ->count();
            
            $rentDistribution[] = [
                'range' => $range['label'],
                'count' => $count,
                'percentage' => 0, // Calculé après
            ];
        }

        // Calculer les pourcentages
        $totalProperties = Property::where('created_at', '>=', $dateFilter)->count();
        foreach ($rentDistribution as &$range) {
            $range['percentage'] = $totalProperties > 0 ? 
                round(($range['count'] / $totalProperties) * 100, 1) : 0;
        }

        // Statistiques de signalements
        $reportStats = PropertyReport::where('created_at', '>=', $dateFilter)
            ->selectRaw('
                COUNT(*) as total_reports,
                SUM(CASE WHEN status = "pending" THEN 1 ELSE 0 END) as pending_reports,
                SUM(CASE WHEN status = "resolved" THEN 1 ELSE 0 END) as resolved_reports,
                SUM(CASE WHEN status = "dismissed" THEN 1 ELSE 0 END) as dismissed_reports
            ')
            ->first();

        // Types de signalements
        $reportTypes = PropertyReport::where('created_at', '>=', $dateFilter)
            ->select('report_type', DB::raw('count(*) as count'))
            ->groupBy('report_type')
            ->orderByDesc('count')
            ->get();

        // Évolution dans le temps
        $propertyEvolution = $this->getPropertyEvolution($period);

        return response()->json([
            'geographic_distribution' => $geographicDistribution,
            'property_types' => $propertyTypes,
            'rent_distribution' => $rentDistribution,
            'report_stats' => $reportStats,
            'report_types' => $reportTypes,
            'property_evolution' => $propertyEvolution,
            'period' => $period,
            'total_properties' => $totalProperties,
            'updated_at' => now()->toISOString(),
        ]);
    }

    private function getPropertyStats(Property $property): array
    {
        $totalLeases = $property->leases()->count();
        $activeLeases = $property->leases()->where('status', 'active')->count();
        $totalReports = $property->reports()->count();
        $pendingReports = $property->pendingReports()->count();
        
        // Revenus totaux pour ce bien
        $totalRevenue = Lease::where('property_id', $property->id)
            ->join('invoices', 'leases.id', '=', 'invoices.lease_id')
            ->where('invoices.status', 'paid')
            ->sum('invoices.amount_paid');

        // Taux d'occupation
        $occupancyRate = $totalLeases > 0 ? 
            round(($activeLeases / $totalLeases) * 100, 1) : 0;

        return [
            'total_leases' => $totalLeases,
            'active_leases' => $activeLeases,
            'occupancy_rate' => $occupancyRate,
            'total_reports' => $totalReports,
            'pending_reports' => $pendingReports,
            'total_revenue' => (float) $totalRevenue,
        ];
    }

    private function getDateFilter(string $period): Carbon
    {
        return match($period) {
            '30d' => now()->subDays(30),
            '90d' => now()->subDays(90),
            '1y' => now()->subYear(),
            default => now()->subYears(10), // "all" - très loin dans le passé
        };
    }

    private function getPropertyEvolution(string $period): array
    {
        $months = match($period) {
            '30d' => 1,
            '90d' => 3,
            '1y' => 12,
            default => 12,
        };

        $data = [];
        for ($i = $months - 1; $i >= 0; $i--) {
            $monthStart = now()->copy()->subMonths($i)->startOfMonth();
            $monthEnd = now()->copy()->subMonths($i)->endOfMonth();
            
            $count = Property::whereBetween('created_at', [$monthStart, $monthEnd])->count();
            
            $data[] = [
                'month' => $monthStart->format('Y-m'),
                'month_label' => $monthStart->format('M Y'),
                'properties_added' => $count,
            ];
        }
        
        return $data;
    }
}
