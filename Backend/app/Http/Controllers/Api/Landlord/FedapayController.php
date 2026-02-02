<?php

namespace App\Http\Controllers\Api\Landlord;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class FedapayController extends Controller
{
    // GET /api/landlord/fedapay
    public function show(Request $request)
    {
        $user = $request->user();

        $landlord = $user->landlord;
        if (!$landlord) {
            return response()->json(['message' => 'Landlord profile missing'], 422);
        }

       return response()->json([
    'fedapay_subaccount_id' => $landlord->fedapay_subaccount_id,
    'subaccount_reference' => $landlord->fedapay_subaccount_id, // garde compat si tu veux
    'is_ready' => (bool) $landlord->fedapay_subaccount_id,
    'fedapay_meta' => $landlord->fedapay_meta,
]);
    }

    // POST /api/landlord/fedapay/subaccount
    // Pour l’instant: on enregistre la reference acc_xxx (tu peux automatiser plus tard)
    // App\Http\Controllers\Api\Landlord\FedapayController.php

public function createOrUpdate(Request $request)
{
    $user = $request->user();
    $landlord = $user->landlord;

    if (!$landlord) {
        return response()->json(['message' => 'Landlord profile missing'], 422);
    }

    // ✅ On accepte les champs UI (même si tu n’en utilises pas encore côté FedaPay)
    $data = $request->validate([
        'subaccount_reference' => ['required', 'string', 'regex:/^acc_[A-Za-z0-9]+$/'],

        'payout_type'   => ['nullable', 'in:bank,mobile_money,bank_card'],
        'country'       => ['nullable', 'string', 'size:2'],
        'currency'      => ['nullable', 'string', 'min:3', 'max:3'],
        'account_name'  => ['nullable', 'string', 'max:120'],

        // mobile money
        'provider'      => ['nullable', 'string', 'max:40'],
        'phone'         => ['nullable', 'string', 'max:40'],

        // bank
        'bank_name'     => ['nullable', 'string', 'max:80'],
        'iban'          => ['nullable', 'string', 'max:60'],
        'account_number'=> ['nullable', 'string', 'max:60'],

        // card
        'card_token'    => ['nullable', 'string', 'max:120'],
        'card_brand'    => ['nullable', 'string', 'max:30'],
        'card_last4'    => ['nullable', 'string', 'max:4'],
        'card_exp_month'=> ['nullable', 'string', 'max:2'],
        'card_exp_year' => ['nullable', 'string', 'max:4'],
    ]);

    // ✅ Construire fedapay_meta (structure stable)
    $meta = [
        'payout_type'  => $data['payout_type'] ?? null,
        'country'      => $data['country'] ?? null,
        'currency'     => $data['currency'] ?? null,
        'account_name' => $data['account_name'] ?? null,
        'subaccount_reference' => $data['subaccount_reference'],

        'mobile_money' => [
            'provider' => $data['provider'] ?? null,
            'phone'    => $data['phone'] ?? null,
        ],

        'bank' => [
            'bank_name'      => $data['bank_name'] ?? null,
            'iban'           => $data['iban'] ?? null,
            'account_number' => $data['account_number'] ?? null,
        ],

        'bank_card' => [
            'card_token'     => $data['card_token'] ?? null,
            'card_brand'     => $data['card_brand'] ?? null,
            'card_last4'     => $data['card_last4'] ?? null,
            'card_exp_month' => $data['card_exp_month'] ?? null,
            'card_exp_year'  => $data['card_exp_year'] ?? null,
        ],
    ];

    $landlord->update([
        'fedapay_subaccount_id' => $data['subaccount_reference'],
        'fedapay_meta'          => $meta, // ✅ c’est ça qui manquait
    ]);

    return response()->json([
        'message' => 'Moyen de retrait enregistré',
        'fedapay_subaccount_id' => $landlord->fedapay_subaccount_id,
        'subaccount_reference'  => $landlord->fedapay_subaccount_id,
        'is_ready'              => (bool) $landlord->fedapay_subaccount_id,
        'fedapay_meta'          => $landlord->fedapay_meta,
    ]);
}
}
