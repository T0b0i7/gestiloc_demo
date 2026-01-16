<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\Payment;
use App\Services\FedapayPayments;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class TenantPaymentController extends Controller
{
    public function __construct(private FedapayPayments $fedapay) {}

    /* =========================
       TOKEN HELPERS (JWT)
    ========================= */

    private function jwtExp(?string $jwt): ?int
    {
        if (!$jwt) return null;

        $parts = explode('.', $jwt);
        if (count($parts) < 2) return null;

        $payload = $parts[1];

        // padding base64 (JWT = base64url)
        $payload .= str_repeat('=', (4 - strlen($payload) % 4) % 4);

        $json = base64_decode(strtr($payload, '-_', '+/'));
        if (!$json) return null;

        $data = json_decode($json, true);
        return isset($data['exp']) ? (int) $data['exp'] : null;
    }

    private function tokenRemainingSeconds(?string $jwt): ?int
    {
        $exp = $this->jwtExp($jwt);
        if (!$exp) return null;
        return $exp - time();
    }

    /** token encore OK si > minSeconds avant expiration */
    private function tokenIsFreshEnough(?string $jwt, int $minSeconds = 3600): bool
    {
        $rem = $this->tokenRemainingSeconds($jwt);
        return is_int($rem) && $rem > $minSeconds;
    }

    /* =========================
       GET /tenant/invoices
    ========================= */
    public function index(Request $request)
    {
        Log::info('[TenantPaymentController@index] start', [
            'user_id' => optional($request->user())->id,
        ]);

        $user = $request->user();
        $tenant = $user?->tenant;

        if (!$tenant) {
            Log::warning('[TenantPaymentController@index] tenant missing', [
                'user_id' => optional($user)->id,
            ]);
            return response()->json(['data' => []]);
        }

        $invoices = Invoice::query()
            ->whereHas('lease', fn($q) => $q->where('tenant_id', $tenant->id))
            ->orderByDesc('due_date')
            ->get();

        Log::info('[TenantPaymentController@index] success', [
            'user_id' => $user->id,
            'tenant_id' => $tenant->id,
            'count' => $invoices->count(),
        ]);

        return response()->json(['data' => $invoices]);
    }

    /* =========================
       POST /tenant/invoices/{invoice}/pay
    ========================= */
    public function payInvoice(Request $request, Invoice $invoice)
    {
        Log::info('[TenantPaymentController@payInvoice] start', [
            'route' => $request->path(),
            'invoice_id' => $invoice->id,
            'auth_user_id' => Auth::id(),
        ]);

        $user = Auth::user();
        if (!$user) {
            Log::warning('[TenantPaymentController@payInvoice] unauthenticated', [
                'invoice_id' => $invoice->id,
            ]);
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        Log::info('[TenantPaymentController@payInvoice] auth ok', [
            'user_id' => $user->id,
            'email' => $user->email ?? null,
            'phone' => $user->phone ?? null,
        ]);

        if (!method_exists($user, 'hasRole')) {
            Log::warning('[TenantPaymentController@payInvoice] hasRole missing on User model', [
                'user_id' => $user->id,
            ]);
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $hasTenantRole = $user->hasRole('tenant');
        Log::info('[TenantPaymentController@payInvoice] role check', [
            'user_id' => $user->id,
            'has_tenant_role' => $hasTenantRole,
        ]);

        if (!$hasTenantRole) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $tenant = $user->tenant;
        if (!$tenant) {
            Log::warning('[TenantPaymentController@payInvoice] tenant profile missing', [
                'user_id' => $user->id,
            ]);
            return response()->json(['message' => 'Tenant profile missing'], 422);
        }

        Log::info('[TenantPaymentController@payInvoice] tenant loaded', [
            'tenant_id' => $tenant->id,
            'tenant_first_name' => $tenant->first_name ?? null,
            'tenant_last_name' => $tenant->last_name ?? null,
        ]);

        $invoice->load('lease.property.landlord.user', 'lease.tenant.user');

        Log::info('[TenantPaymentController@payInvoice] invoice loaded', [
            'invoice_id' => $invoice->id,
            'invoice_status' => $invoice->status ?? null,
            'invoice_amount_total' => $invoice->amount_total ?? null,
            'lease_id' => data_get($invoice, 'lease.id'),
            'lease_tenant_id' => data_get($invoice, 'lease.tenant_id'),
            'property_id' => data_get($invoice, 'lease.property.id'),
            'property_landlord_id' => data_get($invoice, 'lease.property.landlord_id'),
            'landlord_user_id_rel' => data_get($invoice, 'lease.property.landlord.user_id'),
        ]);

        // sécurité: la facture appartient au tenant
        if ((int) $invoice->lease?->tenant_id !== (int) $tenant->id) {
            Log::warning('[TenantPaymentController@payInvoice] forbidden invoice does not belong to tenant', [
                'invoice_id' => $invoice->id,
                'tenant_id' => $tenant->id,
                'invoice_lease_tenant_id' => data_get($invoice, 'lease.tenant_id'),
            ]);
            return response()->json(['message' => 'Forbidden'], 403);
        }

        if (strtolower((string) $invoice->status) === 'paid') {
            Log::info('[TenantPaymentController@payInvoice] already paid', [
                'invoice_id' => $invoice->id,
            ]);
            return response()->json(['message' => 'Déjà payée'], 422);
        }

        $lease = $invoice->lease;
        $property = $lease?->property;

        $landlordUserId =
            $property?->landlord?->user_id
            ?? $property?->landlord_id
            ?? null;

        Log::info('[TenantPaymentController@payInvoice] landlord resolution', [
            'invoice_id' => $invoice->id,
            'lease_id' => optional($lease)->id,
            'property_id' => optional($property)->id,
            'landlord_user_id_resolved' => $landlordUserId,
            'landlord_user_id_from_rel' => $property?->landlord?->user_id ?? null,
            'property_landlord_id' => $property?->landlord_id ?? null,
        ]);

        if (!$landlordUserId) {
            Log::error('[TenantPaymentController@payInvoice] landlord missing', [
                'invoice_id' => $invoice->id,
                'lease_id' => optional($lease)->id,
                'property_id' => optional($property)->id,
            ]);
            return response()->json(['message' => 'Impossible de trouver le propriétaire'], 422);
        }

        Log::info('[TenantPaymentController@payInvoice] creating or fetching payment', [
            'invoice_id' => $invoice->id,
            'provider' => 'fedapay',
        ]);

        $payment = Payment::firstOrCreate(
            ['invoice_id' => $invoice->id, 'provider' => 'fedapay'],
            [
                'lease_id' => $lease->id,
                'tenant_id' => $tenant->id,
                'landlord_user_id' => (int) $landlordUserId,
                'status' => 'initiated',
                'currency' => config('fedapay.currency', 'XOF'),
                'amount_total' => (float) $invoice->amount_total,
            ]
        );

        Log::info('[TenantPaymentController@payInvoice] payment resolved', [
            'payment_id' => $payment->id,
            'payment_status' => $payment->status,
            'payment_currency' => $payment->currency ?? null,
            'payment_amount_total' => $payment->amount_total ?? null,
            'payment_checkout_url_exists' => !empty($payment->checkout_url),
            'payment_checkout_token_exists' => !empty($payment->checkout_token),
            'payment_tx_id' => $payment->fedapay_transaction_id ?? null,
        ]);

        /**
         * ✅ NOUVELLE METHODE:
         * On ne renvoie un ancien checkout_url QUE si le token est encore "fresh".
         * Sinon on regen un nouveau checkout.
         */
        $minSeconds = 3600; // 1h (tu peux mettre 86400 si tu veux 24h)
        $token = $payment->checkout_token ?? null;
        $rem = $this->tokenRemainingSeconds($token);

        Log::info('[TenantPaymentController@payInvoice] checkout cache check', [
            'payment_id' => $payment->id,
            'payment_status' => $payment->status,
            'has_checkout_url' => !empty($payment->checkout_url),
            'has_checkout_token' => !empty($token),
            'token_remaining_sec' => $rem,
            'min_seconds' => $minSeconds,
        ]);

        if (!empty($payment->checkout_url) && $this->tokenIsFreshEnough($token, $minSeconds)) {
            Log::info('[TenantPaymentController@payInvoice] returning existing checkout_url (fresh token)', [
                'payment_id' => $payment->id,
                'token_remaining_sec' => $rem,
            ]);

            return response()->json([
                'payment_id' => $payment->id,
                'checkout_url' => $payment->checkout_url,
            ]);
        }

        Log::info('[TenantPaymentController@payInvoice] token missing/expired/too close -> regenerate checkout', [
            'payment_id' => $payment->id,
            'token_remaining_sec' => $rem,
        ]);

        try {
            // nettoyer phone => éviter des 400 stricts côté provider
            $rawPhone = (string) ($user->phone ?? '');
            $normalizedPhone = preg_replace('/\D+/', '', $rawPhone);

            $customer = [
                'firstname' => $tenant->first_name,
                'lastname'  => $tenant->last_name,
                'email'     => $user->email,
                'phone'     => $normalizedPhone ?: null,
            ];

            Log::info('[TenantPaymentController@payInvoice] calling FedapayPayments::createCheckout', [
                'invoice_id' => $invoice->id,
                'payment_id' => $payment->id,
                'customer' => [
                    'firstname' => $customer['firstname'] ?? null,
                    'lastname' => $customer['lastname'] ?? null,
                    'email' => $customer['email'] ?? null,
                    'phone' => $customer['phone'] ?? null,
                ],
                'currency' => $payment->currency ?? config('fedapay.currency', 'XOF'),
                'amount_total' => (float) $invoice->amount_total,
            ]);

            $checkout = $this->fedapay->createCheckout($payment, $invoice, $lease, $customer);

            Log::info('[TenantPaymentController@payInvoice] fedapay checkout raw response', [
                'invoice_id' => $invoice->id,
                'payment_id' => $payment->id,
                'checkout' => $checkout,
            ]);

            // ✅ parsing robuste
            $checkoutUrl =
                $checkout['checkout_url']
                ?? $checkout['url']
                ?? $checkout['checkoutUrl']
                ?? data_get($checkout, 'checkout_url')
                ?? data_get($checkout, 'url')
                ?? data_get($checkout, 'data.checkout_url')
                ?? data_get($checkout, 'data.url')
                ?? null;

            $checkoutToken =
                $checkout['checkout_token']
                ?? $checkout['token']
                ?? data_get($checkout, 'checkout_token')
                ?? data_get($checkout, 'token')
                ?? data_get($checkout, 'data.checkout_token')
                ?? data_get($checkout, 'data.token')
                ?? null;

            $transactionId =
                $checkout['transaction_id']
                ?? data_get($checkout, 'transaction_id')
                ?? data_get($checkout, 'data.transaction_id')
                ?? data_get($checkout, 'data.id')
                ?? null;

            Log::info('[TenantPaymentController@payInvoice] parsed checkout fields', [
                'invoice_id' => $invoice->id,
                'payment_id' => $payment->id,
                'checkout_url_found' => !empty($checkoutUrl),
                'checkout_url' => $checkoutUrl,
                'checkout_token_found' => !empty($checkoutToken),
                'token_remaining_sec' => $this->tokenRemainingSeconds($checkoutToken),
                'transaction_id_found' => !empty($transactionId),
                'transaction_id' => $transactionId,
            ]);

            if (empty($checkoutUrl)) {
                Log::error('[TenantPaymentController@payInvoice] missing checkout_url after parsing', [
                    'invoice_id' => $invoice->id,
                    'payment_id' => $payment->id,
                    'checkout' => $checkout,
                ]);

                return response()->json([
                    'message' => 'Paiement indisponible (checkout_url manquant).',
                ], 502);
            }

            $payment->update([
                'status' => 'pending',
                'checkout_url' => $checkoutUrl,
                'checkout_token' => $checkoutToken ?: null,
                'fedapay_transaction_id' => $transactionId ?: $payment->fedapay_transaction_id,
            ]);

            Log::info('[TenantPaymentController@payInvoice] payment updated pending', [
                'payment_id' => $payment->id,
                'status' => 'pending',
                'checkout_url' => $checkoutUrl,
            ]);

            return response()->json([
                'payment_id' => $payment->id,
                'checkout_url' => $checkoutUrl,
            ]);
        } catch (\Throwable $e) {
            Log::error('[TenantPaymentController@payInvoice] exception', [
                'invoice_id' => $invoice->id,
                'payment_id' => $payment->id ?? null,
                'message' => $e->getMessage(),
                'class' => get_class($e),
                'trace' => substr($e->getTraceAsString(), 0, 4000),
            ]);

            return response()->json([
                'message' => 'Paiement indisponible',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
