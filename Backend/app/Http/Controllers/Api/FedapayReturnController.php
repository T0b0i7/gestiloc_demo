<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\Payment;
use App\Models\Transaction;
use App\Services\FedapayPayments;
use App\Services\RentReceiptService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class FedapayReturnController extends Controller
{
    public function __construct(
        private FedapayPayments $fedapay,
        private RentReceiptService $receipts
    ) {}

    public function handle(Request $request)
    {
        $paymentId = (int) $request->query('payment_id', 0);
        $frontStatus = strtolower((string) $request->query('status', ''));
        $front = rtrim(config('fedapay.front_url'), '/');

        $payment = $paymentId ? Payment::find($paymentId) : null;

        Log::info('[FedapayReturn] incoming', [
            'payment_id' => $paymentId,
            'status' => $frontStatus,
            'found' => (bool) $payment,
        ]);

        if (!$payment) {
            return redirect()->to($front . "/locataire/paiement/retour?status=unknown");
        }

        $txId = (string) ($payment->fedapay_transaction_id ?? '');
        if (!$txId) {
            Log::warning('[FedapayReturn] missing txId', ['payment_id' => $payment->id]);
            return redirect()->to($front . "/locataire/paiement/retour?status=" . urlencode($frontStatus) . "&invoice_id=" . $payment->invoice_id);
        }

        // ✅ Verify API (source de vérité)
        try {
            $verified = $this->fedapay->getTransaction($txId);
        } catch (\Throwable $e) {
            Log::error('[FedapayReturn] verify failed', [
                'payment_id' => $payment->id,
                'txId' => $txId,
                'err' => $e->getMessage(),
            ]);

            return redirect()->to($front . "/locataire/paiement/retour?status=" . urlencode($frontStatus) . "&invoice_id=" . $payment->invoice_id);
        }

        $tx = data_get($verified, 'response.v1/transaction')
            ?? data_get($verified, 'v1/transaction')
            ?? data_get($verified, 'data')
            ?? $verified;

        $realStatus = strtolower((string)(
            data_get($tx, 'status')
            ?? data_get($tx, 'attributes.status')
            ?? ''
        ));

        Log::info('[FedapayReturn] verified', [
            'payment_id' => $payment->id,
            'txId' => $txId,
            'real_status' => $realStatus,
        ]);

        $isPaid = in_array($realStatus, ['approved', 'paid', 'successful', 'success', 'completed'], true);
        $isFailed = in_array($realStatus, ['declined', 'failed', 'canceled', 'cancelled', 'refunded'], true);

        $invoice = Invoice::find($payment->invoice_id);

        DB::transaction(function () use ($payment, $invoice, $verified, $isPaid, $isFailed) {
            $payment->provider_payload = array_merge($payment->provider_payload ?? [], [
                'return_verified' => $verified,
            ]);

            if ($isPaid) {
                $payment->status = 'paid';
                $payment->paid_at = now();

                if ($invoice) {
                    $invoice->amount_paid = $invoice->amount_total;
                    $invoice->status = 'paid';
                    $invoice->save();

                    Transaction::firstOrCreate(
                        [
                            'invoice_id' => $invoice->id,
                            'transaction_reference' => $payment->fedapay_transaction_id ?? ('FEDAPAY-' . $payment->id),
                        ],
                        [
                            'payment_method' => 'fedapay',
                            'amount' => (float) $invoice->amount_total,
                            'payment_date' => now()->toDateString(),
                            'notes' => 'Paiement via FedaPay (return verify)',
                            'recorded_by' => null,
                        ]
                    );
                }
            } elseif ($isFailed) {
                $payment->status = 'failed';
            } else {
                $payment->status = 'pending';
            }

            $payment->save();
        });

        if ($isPaid && $invoice) {
            try {
                $this->receipts->generateForInvoice($invoice);
            } catch (\Throwable $e) {
                Log::warning('[FedapayReturn] receipt failed', [
                    'invoice_id' => $invoice->id,
                    'err' => $e->getMessage(),
                ]);
            }
        }

        Log::info('[FedapayReturn] done', [
            'payment_id' => $payment->id,
            'payment_status' => $payment->status,
            'invoice_id' => $invoice?->id,
            'invoice_status' => $invoice?->status,
        ]);

        return redirect()->to($front . "/locataire/paiement/retour?status=" . urlencode($frontStatus) . "&invoice_id=" . $payment->invoice_id);
    }
}
