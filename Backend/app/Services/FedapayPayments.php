<?php

namespace App\Services\Fedapay;

use App\Models\Invoice;
use App\Models\Lease;
use App\Models\Payment;
use Illuminate\Support\Arr;

class FedapayPayments
{
    public function __construct(private FedapayClient $client) {}

    /**
     * Crée une transaction FedaPay et retourne checkout_url/token
     */
    public function createCheckout(Payment $payment, Invoice $invoice, Lease $lease, array $customer): array
    {
        // ANCIEN CODE: Calcul avec commission de 5%
        // $commissionRate = (float) config('fedapay.commission_rate', 0.05);
        // $fee = round(((float)$invoice->amount_total) * $commissionRate, 2);
        // $net = round(((float)$invoice->amount_total) - $fee, 2);
        
        // NOUVEAU CODE: Commission à 0% - tout le montant va au propriétaire
        $commissionRate = 0.00; // 0% au lieu de 5%
        $fee = 0.00; // Aucun frais prélevés
        $net = round((float)$invoice->amount_total, 2); // Le montant total va au propriétaire

        // Enregistre montants dès maintenant (même si pas payé)
        $payment->update([
            'amount_total' => $invoice->amount_total,
            'fee_amount' => $fee,
            'amount_net' => $net,
            'currency' => config('fedapay.currency', 'XOF'),
        ]);

        /**
         * ✅ IMPORTANT:
         * Selon ton contrat FedaPay, le split peut être différent.
         * Ici je mets un exemple de "split": platform fee + subaccount payout.
         */
        $landlordSubaccountId = $lease->property?->landlord?->fedapay_subaccount_id
            ?? null;

        $payload = [
            "transaction" => [
                "description" => "Paiement loyer - " . ($invoice->invoice_number ?? "FACTURE"),
                "amount" => (float) $invoice->amount_total,
                "currency" => config('fedapay.currency', 'XOF'),
                "callback_url" => rtrim(config('fedapay.front_url'), '/') . "/tenant/paiement/success",
                "cancel_url" => rtrim(config('fedapay.front_url'), '/') . "/tenant/paiement/cancel",
                "customer" => [
                    "firstname" => Arr::get($customer, 'firstname'),
                    "lastname" => Arr::get($customer, 'lastname'),
                    "email" => Arr::get($customer, 'email'),
                    "phone_number" => Arr::get($customer, 'phone'),
                ],

                // Meta pour relier le webhook à tes objets
                "metadata" => [
                    "payment_id" => $payment->id,
                    "invoice_id" => $invoice->id,
                    "lease_id" => $lease->id,
                ],
            ]
        ];

        // Si split possible:
        if ($landlordSubaccountId) {
            $payload["transaction"]["metadata"]["landlord_subaccount_id"] = $landlordSubaccountId;

            // ANCIEN CODE: Configuration avec commission de 5%
            // $payload["transaction"]["fees"] = [
            //     [
            //         "type" => "commission",
            //         "amount" => $fee,
            //         "currency" => config('fedapay.currency', 'XOF'),
            //     ]
            // ];
            
            // NOUVEAU CODE: Pas de frais - tout le montant va au propriétaire
            // Les frais sont maintenant à 0%, donc on n'envoie pas de section "fees"
            
            $payload["transaction"]["transfer"] = [
                "destination" => $landlordSubaccountId,
                "amount" => $net, // Maintenant $net = montant total (100%)
                "currency" => config('fedapay.currency', 'XOF'),
            ];
        }

        $res = $this->client->post('/transactions', $payload);

        $data = $res['data'] ?? $res;

        // Selon les retours FedaPay : adapte si needed
        $txId = (string)($data['id'] ?? '');
        $token = (string)($data['attributes']['token'] ?? $data['token'] ?? '');
        $checkoutUrl = $token ? "https://checkout.fedapay.com/?token={$token}" : null;

        $payment->update([
            'fedapay_transaction_id' => $txId ?: null,
            'checkout_token' => $token ?: null,
            'checkout_url' => $checkoutUrl,
            'provider_payload' => [
                'create_response' => $data,
            ],
        ]);

        return [
            'transaction_id' => $txId,
            'token' => $token,
            'checkout_url' => $checkoutUrl,
        ];
    }

    public function fetchTransaction(string $transactionId): array
    {
        return $this->client->get("/transactions/{$transactionId}");
    }
}
