<?php

namespace App\Http\Controllers\Api\CoOwner;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class FedapayController extends Controller
{
    // GET /api/co-owners/me/fedapay
    public function show(Request $request)
    {
        $user = $request->user();
        
        $coOwner = $user->coOwner;
        if (!$coOwner) {
            return response()->json(['message' => 'Co-owner profile missing'], 422);
        }

       return response()->json([
            'fedapay_subaccount_id' => $coOwner->fedapay_subaccount_id,
            'subaccount_reference' => $coOwner->fedapay_subaccount_id,
            'is_ready' => (bool) $coOwner->fedapay_subaccount_id,
            'fedapay_meta' => $coOwner->fedapay_meta,
        ]);
    }

    // POST /api/co-owners/me/fedapay/subaccount
    public function createOrUpdate(Request $request)
    {
        $user = $request->user();
        
        $coOwner = $user->coOwner;
        if (!$coOwner) {
            return response()->json(['message' => 'Co-owner profile missing'], 422);
        }

        $request->validate([
            'account_name' => 'required|string|max:255',
            'account_number' => 'required|string|max:255',
            'bank_name' => 'nullable|string|max:255',
            'bank_code' => 'nullable|string|max:50',
            'branch_code' => 'nullable|string|max:50',
            'swift_code' => 'nullable|string|max:50',
            'iban' => 'nullable|string|max:50',
            'routing_number' => 'nullable|string|max:50',
            'address' => 'nullable|string|max:500',
            'city' => 'nullable|string|max:255',
            'country' => 'nullable|string|max:2',
            'currency' => 'nullable|string|max:3',
        ]);

        $coOwner->update([
            'fedapay_subaccount_id' => $request->account_number,
            'fedapay_meta' => $request->only([
                'account_name', 'account_number', 'bank_name', 'bank_code',
                'branch_code', 'swift_code', 'iban', 'routing_number',
                'address', 'city', 'country', 'currency'
            ])
        ]);

        return response()->json(['message' => 'Méthode de retrait mise à jour avec succès']);
    }
}
