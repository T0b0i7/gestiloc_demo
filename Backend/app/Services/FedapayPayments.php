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

        $landlordSubaccountRef = $lease->property?->landlord?->fedapay_subaccount_id; // acc_xxx

        // Phone must be E.164 usually (+229..., +33...)
        $rawPhone = (string) Arr::get($customer, 'phone', '');
        $phoneE164 = $this->normalizeE164($rawPhone);

        // Email optional; if you had "email not available" when creating customer separately:
        // -> here we DO NOT create customer separately. We just send email if present.
        $email = (string) Arr::get($customer, 'email', '');

        $payload = [
  "description" => "Paiement loyer - " . ($invoice->invoice_number ?? "FACTURE"),
  "amount" => (int) round((float) $invoice->amount_total), // FedaPay veut un entier
  "currency" => ["iso" => strtoupper(config('fedapay.currency', 'XOF'))],
  "callback_url" => rtrim(config('fedapay.front_url'), '/') . "/locataire/paiement/retour?status=success&invoice_id=".$invoice->id,
  "cancel_url"   => rtrim(config('fedapay.front_url'), '/') . "/locataire/paiement/retour?status=cancel&invoice_id=".$invoice->id,
  "customer" => [
    "firstname" => Arr::get($customer, 'firstname'),
    "lastname"  => Arr::get($customer, 'lastname'),
    "email"     => Arr::get($customer, 'email'),
    "phone_number" => [
      "number"  => $this->normalizeE164(Arr::get($customer, 'phone')), // ex: +22997808080
      "country" => "BJ", // ou dynamic si tu sais le pays
    ],
  ],
  "metadata" => [
    "payment_id" => $payment->id,
    "invoice_id" => $invoice->id,
    "lease_id" => $lease->id,
  ],
];
        // ✅ Subaccount (si tu en as un)
        // Attention: le nom exact dépend de l’API FedaPay.
        // Ici je garde une structure simple et je log si refusé.
        if (!empty($landlordSubaccountRef)) {
            $payload["transaction"]["metadata"]["landlord_subaccount_id"] = $landlordSubaccountRef;

            // ⚠️ Remplace par le champ EXACT supporté par ton contrat/API.
            // Si tu n’es pas sûr: commente ce bloc, teste d’abord sans split, puis réactive.
            $payload["transaction"]["sub_accounts_commissions"] = [
                [
                    "reference" => $landlordSubaccountRef, // acc_xxx
                    "amount"    => $net,
                ],
            ];
        }

        Log::info("FedaPay createCheckout payload (safe)", [
            "invoice_id"      => $invoice->id,
            "amount"          => (float) $invoice->amount_total,
            "currency"        => $currencyIso,
            "has_subaccount"  => !empty($landlordSubaccountRef),
            "has_phone"       => (bool) $phoneE164,
            "has_email"       => (bool) $email,
        ]);

        // 1) Create transaction
        $res = $this->client->post('/transactions', $payload);

// ✅ Normalisation : selon ton client, la transaction est dans response["v1/transaction"]
$tx = $res['response']['v1/transaction'] ?? $res['v1/transaction'] ?? $res['data'] ?? $res;

// Si ton FedapayClient renvoie parfois directement l'objet tx
if (isset($tx['response']['v1/transaction'])) {
    $tx = $tx['response']['v1/transaction'];
}

if (!is_array($tx) || empty($tx['id'])) {
    \Log::error("FedaPay create transaction unexpected response", ['response' => $res]);
    throw new \RuntimeException("Transaction introuvable (réponse FedaPay inattendue).");
}

$txId = (string) $tx['id'];
$reference = (string) ($tx['reference'] ?? '');
$paymentToken = (string) ($tx['payment_token'] ?? '');
$paymentUrl = (string) ($tx['payment_url'] ?? '');

// ✅ Si payment_url existe, c’est ça qu’il faut utiliser pour rediriger
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
    'reference' => $reference,
    'token' => $paymentToken,
    'checkout_url' => $checkoutUrl,
];
    }

    private function normalizeE164(string $phone): ?string
    {
        $p = trim($phone);
        if ($p === '') return null;

        // enlève espaces/parenthèses/tirets
        $p = preg_replace('/[^\d\+]/', '', $p) ?? $p;

        // déjà E.164
        if (preg_match('/^\+\d{8,15}$/', $p)) return $p;

        // si numéro sans + (ex: 229xxxxxxxx)
        if (preg_match('/^\d{8,15}$/', $p)) {
            return '+' . $p;
        }

        return null;
    }
}
