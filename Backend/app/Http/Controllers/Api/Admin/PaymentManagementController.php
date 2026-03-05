<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Carbon\Carbon;

class PaymentManagementController extends Controller
{
    /**
     * Récupérer la liste des paiements avec filtres
     */
    public function index(Request $request): JsonResponse
    {
        $query = Payment::with([
            'invoice.lease.property',
            'invoice.lease.tenant.user'
        ]);

        // Filtre par statut
        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Filtre par date
        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        // Tri
        $sortBy = $request->get('sort', 'created_at_desc');
        match($sortBy) {
            'created_at_asc' => $query->orderBy('created_at', 'asc'),
            'created_at_desc' => $query->orderByDesc('created_at'),
            'amount_asc' => $query->orderBy('amount', 'asc'),
            'amount_desc' => $query->orderByDesc('amount'),
            default => $query->orderByDesc('created_at'),
        };

        $payments = $query->paginate(20);

        return response()->json([
            'data' => $payments->items(),
            'pagination' => [
                'total' => $payments->total(),
                'per_page' => $payments->perPage(),
                'current_page' => $payments->currentPage(),
                'last_page' => $payments->lastPage(),
            ],
        ]);
    }

    /**
     * Récupérer les détails d'un paiement
     */
    public function show($id): JsonResponse
    {
        $payment = Payment::with([
            'invoice.lease.property.landlord.user',
            'invoice.lease.tenant.user'
        ])->findOrFail($id);

        return response()->json([
            'data' => $payment,
        ]);
    }

    /**
     * Confirmer un paiement
     */
    public function confirm($id): JsonResponse
    {
        $payment = Payment::findOrFail($id);

        if ($payment->status !== 'pending') {
            return response()->json([
                'message' => 'Seuls les paiements en attente peuvent être confirmés',
            ], 422);
        }

        $payment->update([
            'status' => 'completed',
            'paid_at' => now(),
        ]);

        // Marquer la facture comme payée
        if ($payment->invoice) {
            $payment->invoice->update([
                'status' => 'paid',
                'amount_paid' => $payment->amount,
            ]);
        }

        return response()->json([
            'message' => 'Paiement confirmé avec succès',
            'data' => $payment,
        ]);
    }

    /**
     * Rejeter un paiement
     */
    public function reject($id, Request $request): JsonResponse
    {
        $payment = Payment::findOrFail($id);

        if ($payment->status !== 'pending') {
            return response()->json([
                'message' => 'Seuls les paiements en attente peuvent être rejetés',
            ], 422);
        }

        $payment->update([
            'status' => 'failed',
            'rejection_reason' => $request->get('reason', 'Rejeté manuellement'),
        ]);

        return response()->json([
            'message' => 'Paiement rejeté avec succès',
            'data' => $payment,
        ]);
    }

    /**
     * Rembourser un paiement
     */
    public function refund($id, Request $request): JsonResponse
    {
        $payment = Payment::findOrFail($id);

        if ($payment->status !== 'completed') {
            return response()->json([
                'message' => 'Seuls les paiements complétés peuvent être remboursés',
            ], 422);
        }

        $payment->update([
            'status' => 'refunded',
            'refunded_at' => now(),
            'refund_reason' => $request->get('reason', 'Remboursé manuellement'),
        ]);

        // Marquer la facture comme non payée si c'était le seul paiement
        if ($payment->invoice) {
            $payment->invoice->update([
                'status' => 'pending',
                'amount_paid' => 0,
            ]);
        }

        return response()->json([
            'message' => 'Paiement remboursé avec succès',
            'data' => $payment,
        ]);
    }

    /**
     * Télécharger le reçu d'un paiement
     */
    public function downloadReceipt($id)
    {
        $payment = Payment::with([
            'invoice.lease.property.landlord.user',
            'invoice.lease.tenant.user'
        ])->findOrFail($id);

        // Générer un PDF du reçu
        $html = view('receipts.payment', ['payment' => $payment])->render();
        
        // Vous pouvez utiliser DomPDF si installé
        // $pdf = PDF::loadHTML($html);
        // return $pdf->download('recu_' . $payment->id . '.pdf');

        // Pour l'instant, retourner les données en JSON
        return response()->json([
            'id' => $payment->id,
            'invoice_number' => $payment->invoice?->invoice_number,
            'transaction_id' => $payment->transaction_id,
            'amount' => $payment->amount,
            'currency' => $payment->currency,
            'status' => $payment->status,
            'payment_method' => $payment->payment_method,
            'created_at' => $payment->created_at,
            'paid_at' => $payment->paid_at,
            'tenant_name' => $payment->invoice?->lease?->tenant?->user?->name,
            'property_name' => $payment->invoice?->lease?->property?->name,
        ]);
    }

    /**
     * Obtenir les statistiques des paiements
     */
    public function statistics(Request $request): JsonResponse
    {
        $period = $request->get('period', 'month');
        $dateRange = $this->getDateRange($period);

        $totalPayments = Payment::whereBetween('created_at', [$dateRange['start'], $dateRange['end']])
            ->sum('amount');

        $completedPayments = Payment::where('status', 'completed')
            ->whereBetween('created_at', [$dateRange['start'], $dateRange['end']])
            ->sum('amount');

        $failedPayments = Payment::where('status', 'failed')
            ->whereBetween('created_at', [$dateRange['start'], $dateRange['end']])
            ->sum('amount');

        $refundedPayments = Payment::where('status', 'refunded')
            ->whereBetween('created_at', [$dateRange['start'], $dateRange['end']])
            ->sum('amount');

        $transactionCount = Payment::whereBetween('created_at', [$dateRange['start'], $dateRange['end']])
            ->count();

        $successRate = $transactionCount > 0 ? 
            round((Payment::where('status', 'completed')
                ->whereBetween('created_at', [$dateRange['start'], $dateRange['end']])
                ->count() / $transactionCount) * 100, 1) : 0;

        return response()->json([
            'period' => $period,
            'total_amount' => (float) $totalPayments,
            'completed_amount' => (float) $completedPayments,
            'failed_amount' => (float) $failedPayments,
            'refunded_amount' => (float) $refundedPayments,
            'transaction_count' => $transactionCount,
            'success_rate' => $successRate,
        ]);
    }

    /**
     * Obtenir la plage de dates pour une période
     */
    private function getDateRange(string $period): array
    {
        $end = now();
        $start = match($period) {
            'day' => now()->subDay(),
            'week' => now()->subWeek(),
            'month' => now()->subMonth(),
            'quarter' => now()->subQuarter(),
            'year' => now()->subYear(),
            default => now()->subMonth(),
        };

        return [
            'start' => $start->startOfDay(),
            'end' => $end->endOfDay(),
        ];
    }
}
