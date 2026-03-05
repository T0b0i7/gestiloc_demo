<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\User;
use App\Models\Landlord;
use App\Models\Tenant;
use App\Models\Property;
use App\Models\Agency;
use App\Models\CoOwner;
use App\Models\Lease;
use App\Models\RentReceipt;
use App\Models\MaintenanceRequest;

class StatistiqueController extends Controller
{
    /**
     * Afficher les statistiques globales
     */
    public function index()
    {
        // Statistiques des utilisateurs
        $userStats = $this->getUserStatistics();

        // Statistiques des propriétés
        $propertyStats = $this->getPropertyStatistics();

        // Statistiques financières
        $financialStats = $this->getFinancialStatistics();

        // Statistiques par mois (12 derniers mois)
        $monthlyStats = $this->getMonthlyStatistics();

        // Statistiques de plateforme
        $platformStats = $this->getPlatformStatistics();

        // Données pour les graphiques
        $chartData = $this->getChartData();

        return view('admin.statistiques.index', [
            'userStats' => $userStats,
            'propertyStats' => $propertyStats,
            'financialStats' => $financialStats,
            'monthlyStats' => $monthlyStats,
            'platformStats' => $platformStats,
            'chartData' => $chartData,
        ]);
    }

    /**
     * Exporter les données en CSV
     */
    public function export(Request $request, $type)
    {
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $type . '_' . date('Y-m-d') . '.csv"',
        ];

        switch ($type) {
            case 'users':
                return $this->exportUsers($headers);
            case 'co_owners':
                return $this->exportCoOwners($headers);
            case 'tenants':
                return $this->exportTenants($headers);
            case 'landlords':
                return $this->exportLandlords($headers);
            default:
                return redirect()->back()->with('error', 'Type d\'export non valide');
        }
    }

    /**
     * Statistiques des utilisateurs
     */
    private function getUserStatistics()
    {
        $totalUsers = User::count();
        $activeUsers = User::whereNotNull('email_verified_at')->count();

        return [
            'total_users' => $totalUsers,
            'active_users' => $activeUsers,
            'inactive_users' => $totalUsers - $activeUsers,
            'users_today' => User::whereDate('created_at', today())->count(),
            'users_this_month' => User::whereMonth('created_at', now()->month)->count(),
            'users_by_role' => [
                'co_owners' => CoOwner::count(),
                'tenants' => Tenant::count(),
                'landlords' => Landlord::count(),
                'agencies' => Agency::count(),
            ],
            'users_growth' => $this->calculateGrowth('users'),
        ];
    }

    /**
     * Statistiques des propriétés
     */
    private function getPropertyStatistics()
    {
        $totalProperties = Property::count();
        $availableProperties = Property::where('status', 'available')->count();
        $rentedProperties = Property::where('status', 'rented')->count();
        $maintenanceProperties = Property::where('status', 'maintenance')->count();

        return [
            'total_properties' => $totalProperties,
            'available_properties' => $availableProperties,
            'rented_properties' => $rentedProperties,
            'maintenance_properties' => $maintenanceProperties,
            'properties_by_type' => Property::select('type', DB::raw('count(*) as count'))
                ->groupBy('type')
                ->get()
                ->pluck('count', 'type')
                ->toArray(),
            'avg_rent_amount' => Property::where('status', 'rented')->avg('rent_amount') ?? 0,
            'total_rental_value' => Property::where('status', 'rented')->sum('rent_amount') ?? 0,
            'properties_growth' => $this->calculateGrowth('properties'),
        ];
    }

    /**
     * Statistiques financières
     */
    private function getFinancialStatistics()
    {
        $currentMonth = now()->format('Y-m');
        $currentYear = now()->year;

        $revenueThisMonth = RentReceipt::where('paid_month', $currentMonth)->sum('amount_paid') ?? 0;
        $revenueThisYear = RentReceipt::whereYear('issued_date', $currentYear)->sum('amount_paid') ?? 0;
        $totalRevenue = RentReceipt::sum('amount_paid') ?? 0;
        $avgReceipt = RentReceipt::avg('amount_paid') ?? 0;

        return [
            'total_revenue' => $totalRevenue,
            'revenue_this_month' => $revenueThisMonth,
            'revenue_this_year' => $revenueThisYear,
            'avg_rent_receipt' => $avgReceipt,
            'pending_payments' => 0,
            'overdue_payments' => 0,
            'revenue_growth' => $this->calculateRevenueGrowth(),
        ];
    }

    /**
     * Statistiques mensuelles (12 derniers mois)
     */
    private function getMonthlyStatistics()
    {
        $months = [];
        for ($i = 11; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $monthYear = $date->format('Y-m');
            $monthName = $date->translatedFormat('M Y');

            $months[$monthYear] = [
                'name' => $monthName,
                'new_users' => User::whereYear('created_at', $date->year)
                    ->whereMonth('created_at', $date->month)
                    ->count(),
                'new_properties' => Property::whereYear('created_at', $date->year)
                    ->whereMonth('created_at', $date->month)
                    ->count(),
                'revenue' => RentReceipt::where('paid_month', $monthYear)->sum('amount_paid') ?? 0,
                'rent_receipts' => RentReceipt::where('paid_month', $monthYear)->count(),
                'new_leases' => Lease::whereYear('created_at', $date->year)
                    ->whereMonth('created_at', $date->month)
                    ->count(),
            ];
        }

        return $months;
    }

    /**
     * Statistiques de plateforme
     */
    private function getPlatformStatistics()
    {
        return [
            'total_leases' => Lease::count(),
            'active_leases' => Lease::where('status', 'active')->count(),
            'inactive_leases' => Lease::where('status', 'inactive')->count(),
            'ending_leases' => Lease::where('end_date', '<=', now()->addDays(30))
                ->where('status', 'active')
                ->count(),
            'maintenance_requests' => MaintenanceRequest::count(),
            'open_maintenance' => MaintenanceRequest::where('status', 'open')->count(),
            'in_progress_maintenance' => MaintenanceRequest::where('status', 'in_progress')->count(),
            'completed_maintenance' => MaintenanceRequest::where('status', 'completed')->count(),
            'cities_with_properties' => Property::distinct('city')->count('city'),
            'top_cities' => Property::select('city', DB::raw('count(*) as count'))
                ->groupBy('city')
                ->orderByDesc('count')
                ->limit(5)
                ->get()
                ->toArray(),
        ];
    }

    /**
     * Données pour les graphiques
     */
    private function getChartData()
    {
        return [
            'user_growth' => $this->getUserGrowthData(),
            'revenue_trend' => $this->getRevenueTrendData(),
            'property_distribution' => $this->getPropertyDistributionData(),
            'rent_receipts_by_month' => $this->getRentReceiptsByMonthData(),
            'user_types_distribution' => $this->getUserTypesDistributionData(),
            'property_status_distribution' => $this->getPropertyStatusDistributionData(),
            'new_properties_by_month' => $this->getNewPropertiesByMonthData(),
            'lease_status_distribution' => $this->getLeaseStatusDistributionData(),
            'maintenance_status_distribution' => $this->getMaintenanceStatusDistributionData(),
            'properties_by_city' => $this->getPropertiesByCityData(),
        ];
    }

    /**
     * Croissance des utilisateurs (12 derniers mois)
     */
    private function getUserGrowthData()
    {
        $data = [];
        for ($i = 11; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $data[] = [
                'month' => $date->translatedFormat('M'),
                'users' => User::whereYear('created_at', $date->year)
                    ->whereMonth('created_at', $date->month)
                    ->count(),
            ];
        }
        return $data;
    }

    /**
     * Tendance des revenus (12 derniers mois)
     */
    private function getRevenueTrendData()
    {
        $data = [];
        for ($i = 11; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $monthYear = $date->format('Y-m');
            $data[] = [
                'month' => $date->translatedFormat('M'),
                'revenue' => RentReceipt::where('paid_month', $monthYear)->sum('amount_paid') ?? 0,
            ];
        }
        return $data;
    }

    /**
     * Distribution des types de propriétés
     */
    private function getPropertyDistributionData()
    {
        return Property::select('type', DB::raw('count(*) as count'))
            ->groupBy('type')
            ->get()
            ->map(function ($item) {
                return [
                    'type' => ucfirst($item->type),
                    'count' => $item->count,
                ];
            })
            ->toArray();
    }

    /**
     * Quittances par mois (6 derniers mois)
     */
    private function getRentReceiptsByMonthData()
    {
        $data = [];
        for ($i = 5; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $monthYear = $date->format('Y-m');
            $data[] = [
                'month' => $date->translatedFormat('M'),
                'count' => RentReceipt::where('paid_month', $monthYear)->count(),
                'amount' => RentReceipt::where('paid_month', $monthYear)->sum('amount_paid') ?? 0,
            ];
        }
        return $data;
    }

    /**
     * Distribution des types d'utilisateurs
     */
    private function getUserTypesDistributionData()
    {
        return [
            ['type' => 'Co-propriétaires', 'count' => CoOwner::count()],
            ['type' => 'Locataires', 'count' => Tenant::count()],
            ['type' => 'Propriétaires', 'count' => Landlord::count()],
            ['type' => 'Agences', 'count' => Agency::count()],
        ];
    }

    /**
     * Distribution des statuts de propriétés
     */
    private function getPropertyStatusDistributionData()
    {
        return Property::select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->get()
            ->map(function ($item) {
                return [
                    'status' => ucfirst($item->status),
                    'count' => $item->count,
                ];
            })
            ->toArray();
    }

    /**
     * Nouvelles propriétés par mois (6 derniers mois)
     */
    private function getNewPropertiesByMonthData()
    {
        $data = [];
        for ($i = 5; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $data[] = [
                'month' => $date->translatedFormat('M'),
                'count' => Property::whereYear('created_at', $date->year)
                    ->whereMonth('created_at', $date->month)
                    ->count(),
            ];
        }
        return $data;
    }

    /**
     * Distribution des statuts de contrats
     */
    private function getLeaseStatusDistributionData()
    {
        return Lease::select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->get()
            ->map(function ($item) {
                return [
                    'status' => ucfirst($item->status),
                    'count' => $item->count,
                ];
            })
            ->toArray();
    }

    /**
     * Distribution des statuts de maintenance
     */
    private function getMaintenanceStatusDistributionData()
    {
        return MaintenanceRequest::select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->get()
            ->map(function ($item) {
                return [
                    'status' => ucfirst($item->status),
                    'count' => $item->count,
                ];
            })
            ->toArray();
    }

    /**
     * Propriétés par ville (top 5)
     */
    private function getPropertiesByCityData()
    {
        return Property::select('city', DB::raw('count(*) as count'))
            ->whereNotNull('city')
            ->groupBy('city')
            ->orderByDesc('count')
            ->limit(5)
            ->get()
            ->map(function ($item) {
                return [
                    'city' => $item->city,
                    'count' => $item->count,
                ];
            })
            ->toArray();
    }

    /**
     * Calculer la croissance des utilisateurs
     */
    private function calculateGrowth($type)
    {
        $currentMonth = now()->month;
        $lastMonth = now()->subMonth()->month;

        switch ($type) {
            case 'users':
                $current = User::whereMonth('created_at', $currentMonth)->count();
                $previous = User::whereMonth('created_at', $lastMonth)->count();
                break;
            case 'properties':
                $current = Property::whereMonth('created_at', $currentMonth)->count();
                $previous = Property::whereMonth('created_at', $lastMonth)->count();
                break;
            default:
                return 0;
        }

        if ($previous == 0) {
            return $current > 0 ? 100 : 0;
        }

        return round((($current - $previous) / $previous) * 100, 2);
    }

    /**
     * Calculer la croissance des revenus
     */
    private function calculateRevenueGrowth()
    {
        $currentMonth = now()->format('Y-m');
        $lastMonth = now()->subMonth()->format('Y-m');

        $current = RentReceipt::where('paid_month', $currentMonth)->sum('amount_paid') ?? 0;
        $previous = RentReceipt::where('paid_month', $lastMonth)->sum('amount_paid') ?? 0;

        if ($previous == 0) {
            return $current > 0 ? 100 : 0;
        }

        return round((($current - $previous) / $previous) * 100, 2);
    }

    /**
     * Exporter les utilisateurs en CSV
     */
    private function exportUsers($headers)
    {
        $users = User::with(['landlord', 'tenant', 'coOwner', 'agency'])
            ->orderBy('created_at', 'desc')
            ->get();

        $callback = function() use ($users) {
            $file = fopen('php://output', 'w');

            // En-têtes
            fputcsv($file, [
                'ID', 'Email', 'Téléphone', 'Type',
                'Nom Complet', 'Date d\'inscription', 'Email Vérifié'
            ]);

            // Données
            foreach ($users as $user) {
                $userType = $this->getUserType($user);
                $fullName = $this->getUserFullName($user);

                fputcsv($file, [
                    $user->id,
                    $user->email,
                    $user->phone ?? 'N/A',
                    $userType,
                    $fullName,
                    $user->created_at->format('d/m/Y H:i'),
                    $user->email_verified_at ? 'Oui' : 'Non'
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Exporter les co-propriétaires en CSV
     */
    private function exportCoOwners($headers)
    {
        $coOwners = CoOwner::with('user')
            ->orderBy('created_at', 'desc')
            ->get();

        $callback = function() use ($coOwners) {
            $file = fopen('php://output', 'w');

            // En-têtes
            fputcsv($file, [
                'ID', 'Nom', 'Prénom', 'Email', 'Téléphone',
                'Type', 'Entreprise', 'IFU', 'RCCM',
                'Statut', 'Date d\'adhésion'
            ]);

            // Données
            foreach ($coOwners as $coOwner) {
                fputcsv($file, [
                    $coOwner->id,
                    $coOwner->last_name,
                    $coOwner->first_name,
                    $coOwner->user->email ?? 'N/A',
                    $coOwner->phone ?? 'N/A',
                    $coOwner->co_owner_type,
                    $coOwner->company_name ?? 'N/A',
                    $coOwner->ifu ?? 'N/A',
                    $coOwner->rccm ?? 'N/A',
                    $coOwner->status,
                    $coOwner->joined_at ? $coOwner->joined_at->format('d/m/Y') : 'N/A'
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Exporter les locataires en CSV
     */
    private function exportTenants($headers)
    {
        $tenants = Tenant::with('user')
            ->orderBy('created_at', 'desc')
            ->get();

        $callback = function() use ($tenants) {
            $file = fopen('php://output', 'w');

            // En-têtes
            fputcsv($file, [
                'ID', 'Nom', 'Prénom', 'Email', 'Statut',
                'Score de solvabilité', 'Date de création'
            ]);

            // Données
            foreach ($tenants as $tenant) {
                fputcsv($file, [
                    $tenant->id,
                    $tenant->last_name,
                    $tenant->first_name,
                    $tenant->user->email ?? 'N/A',
                    $this->translateStatus($tenant->status),
                    $tenant->solvency_score ?? 'N/A',
                    $tenant->created_at->format('d/m/Y')
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Exporter les propriétaires en CSV
     */
    private function exportLandlords($headers)
    {
        $landlords = Landlord::with('user')
            ->orderBy('created_at', 'desc')
            ->get();

        $callback = function() use ($landlords) {
            $file = fopen('php://output', 'w');

            // En-têtes
            fputcsv($file, [
                'ID', 'Nom', 'Prénom', 'Email', 'Entreprise',
                'Adresse de facturation', 'Numéro TVA', 'Date de création'
            ]);

            // Données
            foreach ($landlords as $landlord) {
                fputcsv($file, [
                    $landlord->id,
                    $landlord->last_name,
                    $landlord->first_name,
                    $landlord->user->email ?? 'N/A',
                    $landlord->company_name ?? 'N/A',
                    $landlord->address_billing ?? 'N/A',
                    $landlord->vat_number ?? 'N/A',
                    $landlord->created_at->format('d/m/Y')
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Helper: Obtenir le type d'utilisateur
     */
    private function getUserType($user)
    {
        if ($user->coOwner) return 'Co-propriétaire';
        if ($user->tenant) return 'Locataire';
        if ($user->landlord) return 'Propriétaire';
        if ($user->agency) return 'Agence';
        return 'Utilisateur';
    }

    /**
     * Helper: Obtenir le nom complet
     */
    private function getUserFullName($user)
    {
        if ($user->coOwner) {
            return trim($user->coOwner->first_name . ' ' . $user->coOwner->last_name);
        }
        if ($user->tenant) {
            return trim($user->tenant->first_name . ' ' . $user->tenant->last_name);
        }
        if ($user->landlord) {
            return trim($user->landlord->first_name . ' ' . $user->landlord->last_name);
        }
        return 'N/A';
    }

    /**
     * Helper: Traduire le statut
     */
    private function translateStatus($status)
    {
        $translations = [
            'candidate' => 'Candidat',
            'active' => 'Actif',
            'inactive' => 'Inactif',
            'suspended' => 'Suspendu',
        ];

        return $translations[$status] ?? $status;
    }
}
