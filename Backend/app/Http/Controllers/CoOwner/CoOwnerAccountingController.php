<?php

namespace App\Http\Controllers\CoOwner;

use App\Http\Controllers\Controller;
use App\Models\CoOwner;
use App\Models\PropertyDelegation;
use App\Models\Property;
use App\Models\Lease;
use App\Models\Payment;
use App\Models\Invoice;
use App\Models\MaintenanceRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Laravel\Sanctum\PersonalAccessToken;
use Carbon\Carbon;

class CoOwnerAccountingController extends Controller
{
    private function getCoOwner()
    {
        if (Auth::check()) {
            $user = Auth::user();
            if ($user && $this->isCoOwner($user)) {
                return CoOwner::where('user_id', $user->id)->firstOrFail();
            }
        }

        $token = request()->query('api_token');
        if ($token) {
            $accessToken = PersonalAccessToken::findToken($token);
            if ($accessToken) {
                $user = $accessToken->tokenable;
                if ($user && $this->isCoOwner($user)) {
                    Auth::login($user);
                    return CoOwner::where('user_id', $user->id)->firstOrFail();
                }
            }
        }

        abort(403, 'Accès réservé aux copropriétaires.');
    }

    private function isCoOwner($user)
    {
        return $user->coOwner !== null;
    }

    private function getDelegatedPropertyIds()
    {
        $coOwner = $this->getCoOwner();
        return PropertyDelegation::where('co_owner_id', $coOwner->id)
            ->where('status', 'active')
            ->pluck('property_id')
            ->toArray();
    }

    public function index(Request $request)
    {
        try {
            $coOwner = $this->getCoOwner();
            $propertyIds = $this->getDelegatedPropertyIds();

            if (empty($propertyIds)) {
                return view('co-owner.accounting.index', [
                    'stats' => $this->getEmptyStats(),
                    'transactions' => collect(),
                    'properties' => collect(),
                    'years' => [date('Y')],
                    'currentYear' => date('Y'),
                    'chartData' => $this->getEmptyChartData(),
                ]);
            }

            // Récupérer les biens pour les filtres
            $properties = Property::whereIn('id', $propertyIds)
                ->orderBy('name')
                ->get(['id', 'name', 'address', 'city']);

            // Années disponibles à partir des paiements
            $years = Payment::whereHas('lease', function($q) use ($propertyIds) {
                    $q->whereIn('property_id', $propertyIds);
                })
                ->selectRaw('YEAR(paid_at) as year')
                ->whereNotNull('paid_at')
                ->distinct()
                ->orderBy('year', 'desc')
                ->pluck('year')
                ->toArray();

            if (empty($years)) {
                $years = [date('Y')];
            }

            $currentYear = $request->get('year', date('Y'));

            // Statistiques basées sur les paiements de l'année en cours
            $revenus = Payment::whereHas('lease', function($q) use ($propertyIds) {
                    $q->whereIn('property_id', $propertyIds);
                })
                ->where('status', 'approved')
                ->whereYear('paid_at', $currentYear)
                ->sum('amount_total');

            // Factures payées (charges)
            $charges = Invoice::whereHas('lease', function($q) use ($propertyIds) {
                    $q->whereIn('property_id', $propertyIds);
                })
                ->whereYear('created_at', $currentYear)
                ->where('status', 'paid')
                ->sum('amount_paid');

            // Coûts de maintenance
            $maintenanceCosts = MaintenanceRequest::whereIn('property_id', $propertyIds)
                ->whereYear('created_at', $currentYear)
                ->sum('actual_cost');

            $totalCharges = $charges + $maintenanceCosts;
            $resultatNet = $revenus - $totalCharges;

            // Nombre de biens actifs
            $activeProperties = Lease::whereIn('property_id', $propertyIds)
                ->where('status', 'active')
                ->distinct('property_id')
                ->count('property_id');

            // Nombre de transactions (paiements)
            $transactionsCount = Payment::whereHas('lease', function($q) use ($propertyIds) {
                    $q->whereIn('property_id', $propertyIds);
                })
                ->where('status', 'approved')
                ->whereYear('paid_at', $currentYear)
                ->count();

            // Taux de rentabilité
            $rentabilite = $revenus > 0 ? ($resultatNet / $revenus) * 100 : 0;

            // Taux d'occupation
            $totalProperties = count($propertyIds);
            $occupiedProperties = Lease::whereIn('property_id', $propertyIds)
                ->where('status', 'active')
                ->distinct('property_id')
                ->count('property_id');
            $occupancyRate = $totalProperties > 0 ? ($occupiedProperties / $totalProperties) * 100 : 0;

            // Répartition par catégorie de revenus
            $revenusParCategorie = [
                'Loyers perçus' => $revenus,
                'Charges récupérées' => 0,
                'Autres revenus' => 0,
            ];

            // Répartition par catégorie de charges
            $chargesParCategorie = [
                'Travaux et réparations' => $maintenanceCosts,
                'Factures payées' => $charges,
                'Assurances' => 0,
                'Taxes' => 0,
            ];

            // Répartition par bien
            $repartitionParBien = [];
            foreach ($properties as $property) {
                $propertyRevenus = Payment::whereHas('lease', function($q) use ($property) {
                        $q->where('property_id', $property->id);
                    })
                    ->where('status', 'approved')
                    ->whereYear('paid_at', $currentYear)
                    ->sum('amount_total');

                $propertyCharges = Invoice::whereHas('lease', function($q) use ($property) {
                        $q->where('property_id', $property->id);
                    })
                    ->whereYear('created_at', $currentYear)
                    ->where('status', 'paid')
                    ->sum('amount_paid');

                $propertyMaintenance = MaintenanceRequest::where('property_id', $property->id)
                    ->whereYear('created_at', $currentYear)
                    ->sum('actual_cost');

                $totalChargesProperty = $propertyCharges + $propertyMaintenance;
                $resultatProperty = $propertyRevenus - $totalChargesProperty;

                if ($propertyRevenus > 0 || $totalChargesProperty > 0) {
                    $repartitionParBien[$property->name ?? $property->address] = [
                        'revenus' => $propertyRevenus,
                        'charges' => $totalChargesProperty,
                        'resultat' => $resultatProperty,
                    ];
                }
            }

            // Transactions récentes
            $transactions = $this->getTransactionsQuery($propertyIds, $request);

            // Stats avec formatage FCFA
            $stats = [
                'resultat_net' => $resultatNet,
                'resultat_net_formatted' => number_format($resultatNet, 0, ',', ' ') . ' FCFA',
                'revenus' => $revenus,
                'revenus_formatted' => number_format($revenus, 0, ',', ' ') . ' FCFA',
                'charges' => $totalCharges,
                'charges_formatted' => number_format($totalCharges, 0, ',', ' ') . ' FCFA',
                'rentabilite' => round($rentabilite, 1),
                'active_properties' => $activeProperties,
                'transactions_count' => $transactionsCount,
                'occupancy_rate' => round($occupancyRate, 1),
                'occupied' => $occupiedProperties,
                'vacant' => $totalProperties - $occupiedProperties,
                'total_properties' => $totalProperties,
                'revenus_par_categorie' => $revenusParCategorie,
                'charges_par_categorie' => $chargesParCategorie,
                'repartition_par_bien' => $repartitionParBien,
                'variation' => $this->calculateVariation($propertyIds, $currentYear),
            ];

            // Données pour les graphiques (basées sur les paiements)
            $chartData = $this->getChartDataForYear($propertyIds, $currentYear);

            return view('co-owner.accounting.index', compact(
                'stats',
                'transactions',
                'properties',
                'years',
                'currentYear',
                'chartData'
            ));

        } catch (\Exception $e) {
            Log::error('Erreur comptabilité: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);

            return response()->view('co-owner.accounting.index', [
                'error' => 'Erreur lors du chargement des données: ' . $e->getMessage(),
                'stats' => $this->getEmptyStats(),
                'transactions' => collect(),
                'properties' => collect(),
                'years' => [date('Y')],
                'currentYear' => date('Y'),
                'chartData' => $this->getEmptyChartData(),
            ], 500);
        }
    }

    private function getTransactionsQuery($propertyIds, Request $request)
    {
        // Récupérer les paiements
        $payments = Payment::whereHas('lease', function($q) use ($propertyIds) {
                $q->whereIn('property_id', $propertyIds);
            })
            ->where('status', 'approved')
            ->with([
                'lease.property',
                'lease.tenant',
                'invoice'
            ])
            ->orderBy('paid_at', 'desc')
            ->take(50)
            ->get()
            ->map(function($payment) {
                $tenantName = $payment->lease->tenant
                    ? $payment->lease->tenant->first_name . ' ' . $payment->lease->tenant->last_name
                    : 'Locataire';

                $propertyName = $payment->lease->property
                    ? ($payment->lease->property->name ?? $payment->lease->property->address)
                    : 'N/A';

                // Description basée sur la date de paiement
                $description = 'Paiement de loyer';
                if ($payment->paid_at) {
                    $description .= ' ' . $payment->paid_at->format('M Y');
                }

                return (object) [
                    'id' => 'p_' . $payment->id,
                    'date' => $payment->paid_at,
                    'type' => 'REVENU',
                    'description' => $description,
                    'amount' => $payment->amount_total,
                    'category' => 'Loyer',
                    'lease_id' => $payment->lease_id,
                    'property_name' => $propertyName,
                    'property_id' => $payment->lease->property_id,
                    'currency' => $payment->currency ?? 'FCFA'
                ];
            });

        // Récupérer les factures payées (charges)
        $invoices = Invoice::whereHas('lease', function($q) use ($propertyIds) {
                $q->whereIn('property_id', $propertyIds);
            })
            ->with(['lease.property'])
            ->where('status', 'paid')
            ->orderBy('created_at', 'desc')
            ->take(50)
            ->get()
            ->map(function($invoice) {
                $propertyName = $invoice->lease->property
                    ? ($invoice->lease->property->name ?? $invoice->lease->property->address)
                    : 'N/A';

                // Catégorie basée sur le type
                $categoryMap = [
                    'rent' => 'Loyer',
                    'deposit' => 'Dépôt de garantie',
                    'charge' => 'Charges',
                    'repair' => 'Réparations'
                ];

                $category = $categoryMap[$invoice->type] ?? 'Autre';

                return (object) [
                    'id' => 'i_' . $invoice->id,
                    'date' => $invoice->created_at,
                    'type' => 'CHARGE',
                    'description' => $invoice->invoice_number . ' - ' . $category,
                    'amount' => $invoice->amount_paid,
                    'category' => $category,
                    'lease_id' => $invoice->lease_id,
                    'property_name' => $propertyName,
                    'property_id' => $invoice->lease->property_id,
                    'currency' => 'FCFA'
                ];
            });

        // Fusionner et trier
        $allTransactions = $payments->merge($invoices)
            ->sortByDesc('date')
            ->take(50);

        // Appliquer les filtres
        if ($request->filled('property_id') && $request->property_id !== 'all') {
            $allTransactions = $allTransactions->filter(function($transaction) use ($request) {
                return $transaction->property_id == $request->property_id;
            });
        }

        if ($request->filled('category') && $request->category !== 'all') {
            if ($request->category === 'revenu') {
                $allTransactions = $allTransactions->where('type', 'REVENU');
            } elseif ($request->category === 'charge') {
                $allTransactions = $allTransactions->where('type', 'CHARGE');
            }
        }

        return $allTransactions;
    }



    private function getChartDataForYear($propertyIds, $year)
{
    $data = [];
    $months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];

    for ($i = 1; $i <= 12; $i++) {
        // Loyers reçus (paiements approuvés) pour le mois et l'année spécifiques
        $received = Payment::whereHas('lease', function($q) use ($propertyIds) {
                $q->whereIn('property_id', $propertyIds);
            })
            ->where('status', 'approved')
            ->whereYear('paid_at', $year)
            ->whereMonth('paid_at', $i)
            ->sum('amount_total');

        $data[] = [
            'month' => $months[$i - 1],
            'received' => round($received, 0),
            'average' => $this->getAverageForMonth($propertyIds, $i), // Moyenne pour ce mois
        ];
    }

    return $data;
}

private function getAverageForMonth($propertyIds, $month)
{
    // Moyenne historique pour ce mois
    $total = Payment::whereHas('lease', function($q) use ($propertyIds) {
            $q->whereIn('property_id', $propertyIds);
        })
        ->where('status', 'approved')
        ->whereMonth('paid_at', $month)
        ->sum('amount_total');

    $yearsCount = Payment::whereHas('lease', function($q) use ($propertyIds) {
            $q->whereIn('property_id', $propertyIds);
        })
        ->where('status', 'approved')
        ->whereMonth('paid_at', $month)
        ->selectRaw('YEAR(paid_at) as year')
        ->distinct()
        ->count();

    return $yearsCount > 0 ? ($total / $yearsCount) : 0;
}

    private function getAverageMonthlyPayment($propertyIds)
    {
        // Calculer la moyenne des paiements par mois
        $total = Payment::whereHas('lease', function($q) use ($propertyIds) {
                $q->whereIn('property_id', $propertyIds);
            })
            ->where('status', 'approved')
            ->sum('amount_total');

        $monthsCount = Payment::whereHas('lease', function($q) use ($propertyIds) {
                $q->whereIn('property_id', $propertyIds);
            })
            ->where('status', 'approved')
            ->selectRaw('YEAR(paid_at) as year, MONTH(paid_at) as month')
            ->distinct()
            ->count();

        return $monthsCount > 0 ? ($total / $monthsCount) : 0;
    }

    private function calculateVariation($propertyIds, $currentYear)
    {
        try {
            $previousYear = $currentYear - 1;

            // Revenus de l'année en cours
            $currentRevenue = Payment::whereHas('lease', function($q) use ($propertyIds) {
                    $q->whereIn('property_id', $propertyIds);
                })
                ->where('status', 'approved')
                ->whereYear('paid_at', $currentYear)
                ->sum('amount_total');

            // Revenus de l'année précédente
            $previousRevenue = Payment::whereHas('lease', function($q) use ($propertyIds) {
                    $q->whereIn('property_id', $propertyIds);
                })
                ->where('status', 'approved')
                ->whereYear('paid_at', $previousYear)
                ->sum('amount_total');

            if ($previousRevenue == 0) {
                return $currentRevenue > 0 ? '+100%' : '0%';
            }

            $variation = (($currentRevenue - $previousRevenue) / $previousRevenue) * 100;
            $sign = $variation >= 0 ? '+' : '';

            return $sign . round($variation, 1) . '%';
        } catch (\Exception $e) {
            return '0%';
        }
    }

    public function getChartData(Request $request)
    {
        try {
            $propertyIds = $this->getDelegatedPropertyIds();
            $year = $request->get('year', date('Y'));

            return response()->json([
                'data' => $this->getChartDataForYear($propertyIds, $year)
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'data' => $this->getEmptyChartData()
            ]);
        }
    }

    private function getEmptyStats()
    {
        return [
            'resultat_net' => 0,
            'resultat_net_formatted' => '0 FCFA',
            'revenus' => 0,
            'revenus_formatted' => '0 FCFA',
            'charges' => 0,
            'charges_formatted' => '0 FCFA',
            'rentabilite' => 0,
            'active_properties' => 0,
            'transactions_count' => 0,
            'occupancy_rate' => 0,
            'occupied' => 0,
            'vacant' => 0,
            'total_properties' => 0,
            'revenus_par_categorie' => [],
            'charges_par_categorie' => [],
            'repartition_par_bien' => [],
            'variation' => '0%',
        ];
    }

    private function getEmptyChartData()
    {
        $months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
        $data = [];

        for ($i = 1; $i <= 12; $i++) {
            $data[] = [
                'month' => $months[$i - 1],
                'received' => 0,
                'average' => 0,
            ];
        }

        return $data;
    }
}
