<?php

namespace App\Services;

use App\Models\Invoice;
use App\Models\Lease;
use App\Models\Payment;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Log;

class FedapayPayments
{
    public function __construct(private FedapayClient $client) {}

    public function createCheckout(Payment $payment, Invoice $invoice, Lease $lease, array $customer): array
    {
        $currencyIso = strtoupper((string) config('fedapay.currency', 'XOF'));

        // 0% commission
        $fee = 0.0;
        $net = round((float) $invoice->amount_total, 2);

        $payment->update([
            'amount_total' => $invoice->amount_total,
            'fee_amount'   => $fee,
            'amount_net'   => $net,
            'currency'     => $currencyIso,
        ]);

        // Phone must be E.164 usually (+229..., +33...)
        $rawPhone = (string) Arr::get($customer, 'phone', '');
        $phoneE164 = $this->normalizeE164($rawPhone);

        // ✅ BACKEND base URL (NE PAS mettre ça dans l'array)
        $back = rtrim((string) config('fedapay.back_url', config('app.url')), '/');

        $payload = [
            "description" => "Paiement loyer - " . ($invoice->invoice_number ?? "FACTURE"),
            "amount" => (int) round((float) $invoice->amount_total), // FedaPay veut un entier
            "currency" => ["iso" => $currencyIso],

            // ✅ IMPORTANT: retour vers le BACKEND (pas le front)
            "callback_url" => $back . "/api/fedapay/return?status=success&payment_id=" . $payment->id,
            "cancel_url"   => $back . "/api/fedapay/return?status=cancel&payment_id=" . $payment->id,

            "customer" => [
                "firstname" => Arr::get($customer, 'firstname'),
                "lastname"  => Arr::get($customer, 'lastname'),
                "email"     => Arr::get($customer, 'email'),
                "phone_number" => [
                    "number"  => $phoneE164, // ex: +22997808080
                    "country" => "BJ",       // à rendre dynamique si tu veux
                ],
            ],

            // ✅ metadata: clef pour retrouver Payment/Invoice dans webhook
            "metadata" => [
                "payment_id" => $payment->id,
                "invoice_id" => $invoice->id,
                "lease_id"   => $lease->id,
            ],
        ];

        Log::info("FedaPay createCheckout payload (safe)", [
            "invoice_id"     => $invoice->id,
            "amount"         => (float) $invoice->amount_total,
            "currency"       => $currencyIso,
            "back_url"       => $back,
            "has_phone"      => (bool) $phoneE164,
            "has_email"      => (bool) Arr::get($customer, 'email'),
        ]);

        $res = $this->client->post('/transactions', $payload);

        $tx = $res['response']['v1/transaction'] ?? $res['v1/transaction'] ?? $res['data'] ?? $res;
        if (isset($tx['response']['v1/transaction'])) {
            $tx = $tx['response']['v1/transaction'];
        }

        if (!is_array($tx) || empty($tx['id'])) {
            Log::error("FedaPay create transaction unexpected response", ['response' => $res]);
            throw new \RuntimeException("Transaction introuvable (réponse FedaPay inattendue).");
        }

        $txId = (string) $tx['id'];
        $reference = (string) ($tx['reference'] ?? '');
        $paymentToken = (string) ($tx['payment_token'] ?? '');
        $paymentUrl = (string) ($tx['payment_url'] ?? '');
        $checkoutUrl = $paymentUrl ?: null;

        $payment->update([
            'fedapay_transaction_id' => $txId ?: null,
            'fedapay_reference'      => $reference ?: null,
            'checkout_token'         => $paymentToken ?: null,
            'checkout_url'           => $checkoutUrl,
            'provider_payload'       => [
                'create_response' => $res,
            ],
        ]);

        return [
            'transaction_id' => $txId,
            'reference'      => $reference,
            'token'          => $paymentToken,
            'checkout_url'   => $checkoutUrl,
        ];
    }

    // ✅ VERIFY API
    public function getTransaction(string $txId): array
    {
        return $this->client->get('/transactions/' . $txId);
    }

    private function normalizeE164(string $phone): ?string
    {
        $p = trim($phone);
        if ($p === '') return null;

        $p = preg_replace('/[^\d\+]/', '', $p) ?? $p;

        if (preg_match('/^\+\d{8,15}$/', $p)) return $p;

        if (preg_match('/^\d{8,15}$/', $p)) {
            return '+' . $p;
        }

        return null;
    }
}
