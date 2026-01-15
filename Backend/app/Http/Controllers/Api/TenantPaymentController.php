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

    public function index(Request $request)
{
    $user = $request->user();
    $tenant = $user->tenant;

    if (!$tenant) {
        return response()->json(['data' => []]);
    }

    $invoices = \App\Models\Invoice::query()
        ->whereHas('lease', fn($q) => $q->where('tenant_id', $tenant->id))
        ->orderByDesc('due_date')
        ->get();

    return response()->json(['data' => $invoices]);
}

    public function __construct(private FedapayPayments $fedapay) {}

    /**
     * POST /tenant/invoices/{invoice}/pay
     * -> retourne checkout_url
     */
    public function payInvoice(Request $request, Invoice $invoice)
    {
        $user = Auth::user();
        if (!$user) return response()->json(['message' => 'Unauthenticated'], 401);

        if (!method_exists($user, 'hasRole') || !$user->hasRole('tenant')) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $tenant = $user->tenant;
        if (!$tenant) return response()->json(['message' => 'Tenant profile missing'], 422);

        $invoice->load('lease.property.landlord.user', 'lease.tenant.user');

        // sécurité: la facture appartient au tenant
        if ((int)$invoice->lease?->tenant_id !== (int)$tenant->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        if ($invoice->status === 'paid') {
            return response()->json(['message' => 'Déjà payée'], 422);
        }

        $lease = $invoice->lease;
        $property = $lease->property;
        $landlordUserId =
            $property?->landlord?->user_id
            ?? $property?->landlord_id // si c'est user_id direct chez toi (selon ta DB)
            ?? null;

        if (!$landlordUserId) {
            return response()->json(['message' => 'Impossible de trouver le propriétaire'], 422);
        }

        // créer / retrouver payment
        $payment = Payment::firstOrCreate(
            ['invoice_id' => $invoice->id, 'provider' => 'fedapay'],
            [
                'lease_id' => $lease->id,
                'tenant_id' => $tenant->id,
                'landlord_user_id' => (int)$landlordUserId,
                'status' => 'initiated',
                'currency' => config('fedapay.currency', 'XOF'),
                'amount_total' => $invoice->amount_total,
            ]
        );

        // si déjà checkout_url
        if ($payment->checkout_url && in_array($payment->status, ['initiated','pending'], true)) {
            return response()->json([
                'payment_id' => $payment->id,
                'checkout_url' => $payment->checkout_url,
            ]);
        }

        try {
            $customer = [
                'firstname' => $tenant->first_name,
                'lastname' => $tenant->last_name,
                'email' => $user->email,
                'phone' => $user->phone,
            ];

            $checkout = $this->fedapay->createCheckout($payment, $invoice, $lease, $customer);

            $payment->update(['status' => 'pending']);

            return response()->json([
                'payment_id' => $payment->id,
                'checkout_url' => $checkout['checkout_url'],
            ]);
        } catch (\Throwable $e) {
            Log::error('[TenantPaymentController@payInvoice] error', [
                'message' => $e->getMessage(),
            ]);
            return response()->json(['message' => 'Paiement indisponible', 'error' => $e->getMessage()], 500);
        }
    }
}
