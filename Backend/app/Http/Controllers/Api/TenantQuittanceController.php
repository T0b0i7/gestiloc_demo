<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class TenantQuittanceController extends Controller
{
    public function download(Invoice $invoice)
    {
        $user = Auth::user();
        if (!$user) return response()->json(['message' => 'Unauthenticated'], 401);

        if (!method_exists($user, 'hasRole') || !$user->hasRole('tenant')) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $tenant = $user->tenant;
        if (!$tenant) return response()->json(['message' => 'Tenant missing'], 422);

        $invoice->load('lease');

        if ((int)$invoice->lease->tenant_id !== (int)$tenant->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $receipt = $invoice->rentReceipt;
        if (!$receipt || !$receipt->pdf_path) {
            return response()->json(['message' => 'Quittance indisponible'], 404);
        }

        $path = $receipt->pdf_path;
        if (!Storage::disk('public')->exists($path)) {
            return response()->json(['message' => 'Fichier introuvable'], 404);
        }

        return Storage::disk('public')->download($path, $receipt->receipt_number . '.pdf');
    }
}
