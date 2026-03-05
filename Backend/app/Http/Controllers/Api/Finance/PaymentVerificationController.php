<?php

namespace App\Http\Controllers\Api\Finance;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use Illuminate\Http\Request;

class PaymentVerificationController extends Controller
{
    /**
     * Vérifie le statut de paiement d'une facture.
     * GET /api/invoices/{id}/payment/verify?transaction_id=...
     */
    public function verify(Request $request, $id)
    {
        $invoice = Invoice::findOrFail($id);
        $user = auth()->user();

        $isOwner = $user->landlord && $invoice->lease->property->landlord_id === $user->landlord->id;
        $isTenant = $user->tenant && $invoice->lease->tenant_id === $user->tenant->id;

        if (! $isOwner && ! $isTenant) {
            return response()->json(['message' => 'Accès non autorisé.'], 403);
        }

        $payment = $invoice->payment;

        if (! $payment) {
            return response()->json([
                'status' => 'pending',
                'message' => 'Aucun paiement enregistré pour cette facture',
            ]);
        }

        return response()->json([
            'status' => $payment->status ?? 'unknown',
            'transaction_id' => $payment->fedapay_transaction_id ?? $payment->fedapay_reference ?? null,
            'paid_at' => $payment->paid_at ? $payment->paid_at->toDateTimeString() : null,
            'amount' => (float) ($payment->amount_total ?? $payment->amount_net ?? 0),
            'provider' => $payment->provider ?? null,
            'payment_id' => $payment->id,
        ]);
    }
}
