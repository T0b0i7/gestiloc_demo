<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\Payment;
use App\Models\Transaction;
use App\Services\RentReceiptService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class FedapayWebhookController extends Controller
{
    public function __construct(private RentReceiptService $receipts) {}

    public function handle(Request $request)
    {
        // ✅ Vérifier la signature (à adapter selon header exact FedaPay)
        $secret = (string) config('fedapay.webhook_secret');
        $sig = $request->header('X-FEDAPAY-SIGNATURE'); // exemple; adapte au header réel de ton webhook
        $raw = $request->getContent();

        if ($secret) {
            $expected = hash_hmac('sha256', $raw, $secret);
            if (!$sig || !hash_equals($expected, $sig)) {
                Log::warning('[FedapayWebhook] invalid signature');
                return response()->json(['message' => 'Invalid signature'], 401);
            }
        }

        $payload = $request->all();

        // FedaPay envoie souvent un event + data transaction
        $event = $payload['event'] ?? null;
        $data = $payload['data'] ?? $payload;

        $txId = (string)($data['id'] ?? ($data['transaction']['id'] ?? ''));
        $status = (string)($data['status'] ?? ($data['attributes']['status'] ?? ''));

        $meta = $data['metadata'] ?? ($data['attributes']['metadata'] ?? []);
        $paymentId = $meta['payment_id'] ?? null;
        $invoiceId  = $meta['invoice_id'] ?? null;

        Log::info('[FedapayWebhook] incoming', [
            'event' => $event,
            'txId' => $txId,
            'status' => $status,
            'paymentId' => $paymentId,
            'invoiceId' => $invoiceId,
        ]);

        // ✅ retrouver Payment
        $payment = null;
        if ($paymentId) $payment = Payment::find($paymentId);
        if (!$payment && $txId) $payment = Payment::where('fedapay_transaction_id', $txId)->first();

        if (!$payment) {
            return response()->json(['message' => 'Payment not found'], 200);
        }

        $invoice = Invoice::find($payment->invoice_id);
        if (!$invoice) {
            return response()->json(['message' => 'Invoice not found'], 200);
        }

        // ✅ mapping statuts (adapter si FedaPay renvoie approved/paid/success)
        $approved = in_array($status, ['approved', 'paid', 'successful', 'success'], true);

        if ($approved) {
            // idempotent
            if ($payment->status !== 'approved') {
                $payment->update([
                    'status' => 'approved',
                    'paid_at' => now(),
                    'provider_payload' => array_merge($payment->provider_payload ?? [], [
                        'webhook' => $payload,
                    ]),
                ]);
            }

            // Marquer facture payée + créer transaction (si tu veux garder ton modèle Transaction)
            // On utilise ton modèle Transaction -> il met à jour invoice.amount_paid et status automatiquement
            Transaction::firstOrCreate(
                [
                    'invoice_id' => $invoice->id,
                    'transaction_reference' => $payment->fedapay_transaction_id ?? $txId ?? ('FEDAPAY-' . $payment->id),
                ],
                [
                    'payment_method' => 'fedapay',
                    'amount' => $invoice->balance_due, // reste à payer
                    'payment_date' => now()->toDateString(),
                    'notes' => 'Paiement via FedaPay',
                    'recorded_by' => null,
                ]
            );

            // Générer quittance (1 par facture)
            $this->receipts->generateForInvoice($invoice);

            // Marquer facture comme payée (idempotent)
            try {
                $invoice->update(['status' => 'paid']);
            } catch (\Throwable $e) {
                // ignore
            }

            // Invalider les pay-links associés
            try {
                \App\Models\PaymentLink::where('invoice_id', $invoice->id)->update(['used_at' => now()]);
            } catch (\Throwable $e) {
                // ignore
            }

            return response()->json(['message' => 'ok'], 200);
        }

        // sinon statut refusé/annulé
        if (in_array($status, ['declined', 'cancelled', 'failed'], true)) {
            $payment->update([
                'status' => $status,
                'provider_payload' => array_merge($payment->provider_payload ?? [], [
                    'webhook' => $payload,
                ]),
            ]);
            return response()->json(['message' => 'ok'], 200);
        }

        // pending, processing, etc.
        $payment->update([
            'status' => 'pending',
            'provider_payload' => array_merge($payment->provider_payload ?? [], [
                'webhook' => $payload,
            ]),
        ]);

        return response()->json(['message' => 'ok'], 200);
    }
}
