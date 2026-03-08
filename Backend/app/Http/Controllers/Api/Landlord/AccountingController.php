<?php

namespace App\Http\Controllers\Api\Landlord;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\Lease;
use App\Models\MaintenanceRequest;
use App\Models\Payment;
use App\Models\Property;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class AccountingController extends Controller
{
    /**
     * Obtenir les statistiques comptables du landlord
     */
    public function stats(Request $request): JsonResponse
    {
        $user = auth()->user();
        $landlordId = $user->landlord->id;
        $year = $request->get('year', date('Y'));

        // Récupérer les biens du landlord
        $properties = Property::where('landlord_id', $landlordId)->get();
        $propertyIds = $properties->pluck('id')->toArray();

        if (empty($propertyIds)) {
            return response()->json([
                'resultat_net' => 0,
                'resultat_net_formatted' => '0 €',
                'revenus' => 0,
                'revenus_formatted' => '0 €',
                'charges' => 0,
                'charges_formatted' => '0 €',
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
            ]);
        }

        // Revenus: paiements approuvés
        $revenus = Payment::whereHas('lease', function($q) use ($propertyIds) {
                $q->whereIn('property_id', $propertyIds);
            })
            ->where('status', 'approved')
            ->whereYear('paid_at', $year)
            ->sum('amount_total');

        // Charges: factures payées
        $charges = Invoice::whereHas('lease', function($q) use ($propertyIds) {
                $q->whereIn('property_id', $propertyIds);
            })
            ->whereYear('created_at', $year)
            ->where('status', 'paid')
            ->sum('amount_paid');

        // Coûts de maintenance
        $maintenanceCosts = MaintenanceRequest::whereIn('property_id', $propertyIds)
            ->whereYear('created_at', $year)
            ->sum('actual_cost');

        $totalCharges = $charges + $maintenanceCosts;
        $resultatNet = $revenus - $totalCharges;

        // Nombre de biens actifs
        $activeProperties = Lease::whereIn('property_id', $propertyIds)
            ->where('status', 'active')
            ->distinct('property_id')
            ->count('property_id');

        // Nombre de transactions
        $transactionsCount = Payment::whereHas('lease', function($q) use ($propertyIds) {
                $q->whereIn('property_id', $propertyIds);
            })
            ->where('status', 'approved')
            ->whereYear('paid_at', $year)
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

        // Répartition par bien
        $repartitionParBien = [];
        foreach ($properties as $property) {
            $propertyRevenus = Payment::whereHas('lease', function($q) use ($property) {
                    $q->where('property_id', $property->id);
                })
                ->where('status', 'approved')
                ->whereYear('paid_at', $year)
                ->sum('amount_total');

            $propertyCharges = Invoice::whereHas('lease', function($q) use ($property) {
                    $q->where('property_id', $property->id);
                })
                ->whereYear('created_at', $year)
                ->where('status', 'paid')
                ->sum('amount_paid');

            $propertyMaintenance = MaintenanceRequest::where('property_id', $property->id)
                ->whereYear('created_at', $year)
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

        return response()->json([
            'resultat_net' => $resultatNet,
            'resultat_net_formatted' => number_format($resultatNet, 0, ',', ' ') . ' €',
            'revenus' => $revenus,
            'revenus_formatted' => number_format($revenus, 0, ',', ' ') . ' €',
            'charges' => $totalCharges,
            'charges_formatted' => number_format($totalCharges, 0, ',', ' ') . ' €',
            'rentabilite' => round($rentabilite, 1),
            'active_properties' => $activeProperties,
            'transactions_count' => $transactionsCount,
            'occupancy_rate' => round($occupancyRate, 1),
            'occupied' => $occupiedProperties,
            'vacant' => $totalProperties - $occupiedProperties,
            'total_properties' => $totalProperties,
            'revenus_par_categorie' => [
                'Loyers perçus' => $revenus,
                'Charges récupérées' => 0,
                'Autres revenus' => 0,
            ],
            'charges_par_categorie' => [
                'Travaux et réparations' => $maintenanceCosts,
                'Factures payées' => $charges,
                'Assurances' => 0,
                'Taxes' => 0,
            ],
            'repartition_par_bien' => $repartitionParBien,
            'variation' => '0%',
        ]);
    }

    /**
     * Obtenir les transactions comptables
     */
    public function transactions(Request $request): JsonResponse
    {
        $user = auth()->user();
        $landlordId = $user->landlord->id;

        $propertyIds = Property::where('landlord_id', $landlordId)->pluck('id')->toArray();

        if (empty($propertyIds)) {
            return response()->json([]);
        }

        // Récupérer les paiements (revenus)
        $payments = Payment::whereHas('lease', function($q) use ($propertyIds) {
                $q->whereIn('property_id', $propertyIds);
            })
            ->where('status', 'approved')
            ->with(['lease.property', 'lease.tenant'])
            ->orderBy('paid_at', 'desc')
            ->take(50)
            ->get()
            ->map(function($payment) {
                $propertyName = $payment->lease->property
                    ? ($payment->lease->property->name ?? $payment->lease->property->address)
                    : 'N/A';

                return [
                    'id' => 'p_' . $payment->id,
                    'date' => $payment->paid_at,
                    'type' => 'REVENU',
                    'description' => 'Paiement de loyer' . ($payment->paid_at ? ' ' . \Carbon\Carbon::parse($payment->paid_at)->format('M Y') : ''),
                    'amount' => $payment->amount_total,
                    'category' => 'Loyer',
                    'property_name' => $propertyName,
                    'property_id' => $payment->lease->property_id,
                    'currency' => $payment->currency ?? '€'
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

                $categoryMap = [
                    'rent' => 'Loyer',
                    'deposit' => 'Dépôt de garantie',
                    'charge' => 'Charges',
                    'repair' => 'Réparations'
                ];

                return [
                    'id' => 'i_' . $invoice->id,
                    'date' => $invoice->created_at,
                    'type' => 'CHARGE',
                    'description' => ($invoice->invoice_number ?? 'Facture') . ' - ' . ($categoryMap[$invoice->type] ?? 'Autre'),
                    'amount' => $invoice->amount_paid,
                    'category' => $categoryMap[$invoice->type] ?? 'Autre',
                    'property_name' => $propertyName,
                    'property_id' => $invoice->lease->property_id,
                    'currency' => '€'
                ];
            });

        // Fusionner et trier par date
        $allTransactions = $payments
            ->toBase()
            ->merge($invoices)
            ->sortByDesc('date')
            ->take(50)
            ->values();

        return response()->json($allTransactions);
    }

    /**
     * Créer une nouvelle transaction comptable (revenu ou charge)
     */
    public function store(Request $request): JsonResponse
    {
        $user = auth()->user();
        $landlordId = $user->landlord->id;

        $validated = $request->validate([
            'type' => 'required|in:revenu,charge',
            'property_id' => 'required|exists:properties,id',
            'lease_id' => 'nullable|exists:leases,id',
            'category' => 'required|string',
            'description' => 'required|string',
            'amount' => 'required|numeric|min:0',
            'payment_date' => 'required|date',
            'payment_method' => 'nullable|string',
        ]);

        // Vérifier que le bien appartient bien au landlord
        $property = Property::where('id', $validated['property_id'])
            ->where('landlord_id', $landlordId)
            ->first();

        if (!$property) {
            return response()->json(['message' => 'Propriété non trouvée ou non autorisée'], 403);
        }

        if ($validated['type'] === 'revenu') {
            // Créer un Payment pour les revenus
            $payment = Payment::create([
                'lease_id' => $validated['lease_id'],
                'amount_total' => $validated['amount'],
                'amount' => $validated['amount'],
                'paid_at' => $validated['payment_date'],
                'status' => 'approved',
                'currency' => '€',
                'payment_method' => $validated['payment_method'] ?? 'bank_transfer',
            ]);

            return response()->json([
                'message' => 'Revenu créé avec succès',
                'data' => [
                    'id' => 'p_' . $payment->id,
                    'type' => 'REVENU',
                    'amount' => $payment->amount_total,
                    'payment_date' => $payment->paid_at,
                    'property_id' => $validated['property_id'],
                    'lease_id' => $validated['lease_id'],
                ]
            ], 201);
        }

        if ($validated['type'] === 'charge') {
            // Créer une Invoice pour les charges
            $invoice = Invoice::create([
                'lease_id' => $validated['lease_id'],
                'amount_due' => $validated['amount'],
                'amount_paid' => $validated['amount'],
                'type' => $validated['category'],
                'status' => 'paid',
                'description' => $validated['description'],
            ]);

            return response()->json([
                'message' => 'Charge créée avec succès',
                'data' => [
                    'id' => 'i_' . $invoice->id,
                    'type' => 'CHARGE',
                    'amount' => $invoice->amount_paid,
                    'created_at' => $invoice->created_at,
                    'property_id' => $validated['property_id'],
                    'lease_id' => $validated['lease_id'],
                ]
            ], 201);
        }

        return response()->json(['message' => 'Type invalide'], 400);
    }
}
