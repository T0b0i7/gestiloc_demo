<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\Payment;
use App\Models\Transaction;
use App\Services\FedapayPayments;
use App\Services\RentReceiptService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class FedapayWebhookController extends Controller
{
    public function __construct(
        private RentReceiptService $receipts,
        private FedapayPayments $fedapay
    ) {}

    public function handle(Request $request)
    {
        $payload = $request->all();

        // 🔎 Extraction robuste du txId
        $txId = (string)(
            data_get($payload, 'data.id')
            ?? data_get($payload, 'data.transaction.id')
            ?? data_get($payload, 'transaction.id')
            ?? data_get($payload, 'id')
            ?? ''
        );

        $event = (string) (data_get($payload, 'event') ?? '');

        Log::info('[FedapayWebhook] incoming', [
            'event' => $event,
            'txId'  => $txId,
        ]);

        if (!$txId) {
            Log::warning('[FedapayWebhook] missing txId', ['payload_keys' => array_keys($payload)]);
            return response()->json(['message' => 'ok'], 200);
        }

        // ✅ VERIFY API (source de vérité)
        try {
            $verified = $this->fedapay->getTransaction($txId);
        } catch (\Throwable $e) {
            Log::error('[FedapayWebhook] verify API failed', [
                'txId' => $txId,
                'err' => $e->getMessage(),
            ]);
            return response()->json(['message' => 'ok'], 200);
        }

        $tx = data_get($verified, 'response.v1/transaction')
            ?? data_get($verified, 'v1/transaction')
            ?? data_get($verified, 'data')
            ?? $verified;

        $realStatus = strtolower((string) (data_get($tx, 'status') ?? ''));

        $meta = data_get($tx, 'metadata')
            ?? data_get($tx, 'attributes.metadata')
            ?? [];

        $paymentId = $meta['payment_id'] ?? null;

        Log::info('[FedapayWebhook] verified', [
            'txId' => $txId,
            'realStatus' => $realStatus,
            'paymentId' => $paymentId,
        ]);

        // ✅ retrouver Payment
        $payment = null;
        if ($paymentId) $payment = Payment::find($paymentId);
        if (!$payment) $payment = Payment::where('provider', 'fedapay')->where('fedapay_transaction_id', $txId)->first();
        if (!$payment) $payment = Payment::where('provider', 'fedapay')->where('fedapay_reference', (string) (data_get($tx, 'reference') ?? ''))->first();

        if (!$payment) {
            Log::warning('[FedapayWebhook] Payment not found', [
                'txId' => $txId,
                'paymentId' => $paymentId,
            ]);
            return response()->json(['message' => 'ok'], 200);
        }

        // ✅ sync txId si manquant
        if (empty($payment->fedapay_transaction_id)) {
            $payment->fedapay_transaction_id = $txId;
            $payment->save();
        }

        $invoice = Invoice::find($payment->invoice_id);
        if (!$invoice) {
            Log::warning('[FedapayWebhook] Invoice not found', [
                'payment_id' => $payment->id,
                'invoice_id' => $payment->invoice_id,
            ]);
            return response()->json(['message' => 'ok'], 200);
        }

        $isPaid = in_array($realStatus, ['approved', 'paid', 'successful', 'success', 'completed'], true);
        $isFailed = in_array($realStatus, ['declined', 'failed', 'canceled', 'cancelled', 'refunded'], true);

        DB::transaction(function () use ($payment, $invoice, $payload, $verified, $isPaid, $isFailed, $realStatus, $txId) {
            // stocker payloads
            $payment->provider_payload = array_merge($payment->provider_payload ?? [], [
                'webhook' => $payload,
                'verified' => $verified,
            ]);

            if ($isPaid) {
                if ($payment->status !== 'paid') {
                    $payment->status = 'paid';
                    $payment->paid_at = now();
                }

                // facture payée
                if (strtolower((string) $invoice->status) !== 'paid') {
                    $invoice->amount_paid = $invoice->amount_total;
                    $invoice->status = 'paid';
                    $invoice->save();
                }

                // transaction interne idempotente
                Transaction::firstOrCreate(
                    [
                        'invoice_id' => $invoice->id,
                        'transaction_reference' => $payment->fedapay_transaction_id ?? $txId,
                    ],
                    [
                        'payment_method' => 'fedapay',
                        'amount' => (float) $invoice->amount_total,
                        'payment_date' => now()->toDateString(),
                        'notes' => 'Paiement via FedaPay',
                        'recorded_by' => null,
                    ]
                );
            } elseif ($isFailed) {
                $payment->status = 'failed';
            } else {
                $payment->status = 'pending';
            }

            $payment->save();
        });

        // quittance après transaction (hors DB::transaction)
        if ($isPaid) {
            try {
                $this->receipts->generateForInvoice($invoice);
            } catch (\Throwable $e) {
                Log::warning('[FedapayWebhook] receipt generation failed', [
                    'invoice_id' => $invoice->id,
                    'err' => $e->getMessage(),
                ]);
            }

            try {
                \App\Models\PaymentLink::where('invoice_id', $invoice->id)->update(['used_at' => now()]);
            } catch (\Throwable $e) {
                // ignore
            }
        }

        Log::info('[FedapayWebhook] done', [
            'payment_id' => $payment->id,
            'payment_status' => $payment->status,
            'invoice_id' => $invoice->id,
            'invoice_status' => $invoice->status,
        ]);

        return response()->json(['message' => 'ok'], 200);
    }
}
