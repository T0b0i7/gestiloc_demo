<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\PaymentLink;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Mail;

class PaymentLinkController extends Controller
{

    // GET /api/pay-links/{token}
public function show(string $token)
{
    $link = PaymentLink::where('token', $token)->first();
    if (!$link) return response()->json(['message' => 'Lien invalide'], 404);

    if ($link->used_at) return response()->json(['message' => 'Lien déjà utilisé'], 410);
    if ($link->expires_at && $link->expires_at->isPast()) return response()->json(['message' => 'Lien expiré'], 410);

    $invoice = $link->invoice()
        ->with('lease.property.landlord.user', 'lease.tenant.user')
        ->first();

    if (!$invoice) return response()->json(['message' => 'Facture introuvable'], 404);

    $lease = $invoice->lease;
    $property = $lease?->property;
    $tenant = $lease?->tenant;
    $tenantUser = $tenant?->user;

    return response()->json([
        'token' => $token,
        'expires_at' => $link->expires_at,
        'invoice' => [
            'id' => $invoice->id,
            'invoice_number' => $invoice->invoice_number,
            'amount_total' => $invoice->amount_total,
            'balance_due' => $invoice->balance_due,
            'status' => $invoice->status,
            'period_start' => $invoice->period_start,
            'period_end' => $invoice->period_end,
            'due_date' => $invoice->due_date,
        ],
        'lease' => [
            'id' => $lease?->id,
            'uuid' => $lease?->uuid,
        ],
        'property' => [
            'id' => $property?->id,
            'address' => $property?->address,
            'city' => $property?->city,
        ],
        'tenant' => [
            'id' => $tenant?->id,
            'first_name' => $tenant?->first_name,
            'last_name' => $tenant?->last_name,
            'email' => $tenantUser?->email,
            'phone' => $tenantUser?->phone,
        ],
    ]);
}

    // POST /api/invoices/{id}/pay-link
    public function create(Request $request, $id)
    {
        $user = auth()->user();
        $invoice = Invoice::findOrFail($id);

        // Vérifier permission: bailleur ou admin
        if (!($user->landlord || $user->hasRole('admin'))) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $tenantId = $invoice->lease->tenant_id ?? null;

        $token = Str::random(48);
        $expires = now()->addHours($request->get('hours', 24));

        $link = PaymentLink::create([
            'invoice_id' => $invoice->id,
            'tenant_id' => $tenantId,
            'token' => $token,
            'expires_at' => $expires,
        ]);

        $url = rtrim(config('app.frontend_url', ''), '/') . '/pay-link/' . $token;

        // Optionnel: envoi email au locataire si demandé
        if ($request->boolean('send_email', true) && $invoice->lease && $invoice->lease->tenant && $invoice->lease->tenant->user) {
            try {
                $to = $invoice->lease->tenant->user->email;
                Mail::to($to)->queue(new \App\Mail\PaymentLinkMail($invoice, $url));
            } catch (\Throwable $e) {
                // ne pas échouer la création du lien si mail rate
            }
        }

        return response()->json(['url' => $url, 'expires_at' => $expires]);
    }

    // POST /api/pay-links/{token}/init
    public function init(Request $request, $token)
    {
        $link = PaymentLink::where('token', $token)->first();
        if (!$link) return response()->json(['message' => 'Lien invalide'], 404);

        if ($link->used_at) return response()->json(['message' => 'Lien déjà utilisé'], 410);
        if ($link->expires_at && $link->expires_at->isPast()) return response()->json(['message' => 'Lien expiré'], 410);

        $invoice = $link->invoice()->with('lease.property.landlord','lease.tenant.user')->first();
        if (!$invoice) return response()->json(['message' => 'Facture introuvable'], 404);

        // Créer/Récupérer Payment et initialiser via le service FedaPay
        $tenant = $invoice->lease->tenant;

        $payment = \App\Models\Payment::firstOrCreate(
            ['invoice_id' => $invoice->id, 'provider' => 'fedapay'],
            [
                'lease_id' => $invoice->lease->id,
                'tenant_id' => $tenant?->id,
                'landlord_user_id' => $invoice->lease->property->landlord->user_id ?? null,
                'status' => 'initiated',
                'currency' => config('fedapay.currency', 'XOF'),
                'amount_total' => $invoice->amount_total,
            ]
        );

        // appeler le service Fedapay pour créer checkout
        try {
            $fedapay = app(\App\Services\FedapayPayments::class);
            $customer = [
                'firstname' => $tenant->first_name ?? null,
                'lastname' => $tenant->last_name ?? null,
                'email' => $tenant->user->email ?? null,
                'phone' => $tenant->user->phone ?? null,
            ];

            $checkout = $fedapay->createCheckout($payment, $invoice, $invoice->lease, $customer);

            $payment->update(['status' => 'pending', 'checkout_url' => $checkout['checkout_url'] ?? null, 'fedapay_reference' => $checkout['reference'] ?? null]);

            
            return response()->json(['checkout_url' => $checkout['checkout_url']]);
        } catch (\Throwable $e) {
            return response()->json(['message' => 'Impossible d\'initialiser le paiement', 'error' => $e->getMessage()], 500);
        }
    }
}
