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
    public function createOrUpdate(Request $request)
    {
        $user = $request->user();
        $landlord = $user->landlord;

        if (!$landlord) {
            return response()->json(['message' => 'Landlord profile missing'], 422);
        }

        $data = $request->validate([
            'subaccount_reference' => ['required', 'string', 'regex:/^acc_[A-Za-z0-9]+$/'],
        ]);

        $landlord->update([
            'fedapay_subaccount_id' => $data['subaccount_reference'],
        ]);

        return response()->json([
            'message' => 'Subaccount enregistré',
            'subaccount_reference' => $landlord->fedapay_subaccount_id,
        ]);
    }
}
