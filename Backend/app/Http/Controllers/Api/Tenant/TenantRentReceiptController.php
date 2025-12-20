<?php

namespace App\Http\Controllers\Api\Tenant;

use App\Http\Controllers\Controller;
use App\Models\RentReceipt;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class TenantRentReceiptController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();

        Log::info('[TenantRentReceiptController@index] incoming', [
            'auth_id' => $user?->id,
            'roles'   => $user?->roles?->pluck('name'),
            'query'   => $request->query(),
        ]);

        $type = $request->query('type'); // independent | invoice | null

        $q = RentReceipt::query()
            ->latest()
            ->where('tenant_id', $user->id) // ✅ tenant_id = users.id
            ->with([
                'property',
                'lease.tenant.user',
                'landlord',
            ]);

        if ($type) {
            // si colonne type pas migrée, ça plantera => à toi de garder ton Schema::hasColumn si besoin
            $q->where('type', $type);
        }

        $rows = $q->get();

        return response()->json($rows);
    }

    public function show($id)
    {
        $user = Auth::user();

        $receipt = RentReceipt::with(['property', 'lease.tenant.user', 'landlord'])
            ->findOrFail($id);

        if ((int)$receipt->tenant_id !== (int)$user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json($receipt);
    }

    public function pdf($id)
    {
        $user = Auth::user();

        $receipt = RentReceipt::with(['property', 'lease.tenant.user', 'landlord'])
            ->findOrFail($id);

        if ((int)$receipt->tenant_id !== (int)$user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // ✅ Si tu as déjà un pdf_path stocké (dompdf), on renvoie direct
        if (!empty($receipt->pdf_path) && Storage::disk('public')->exists($receipt->pdf_path)) {
            $filename = ($receipt->reference ?: "quittance-{$receipt->id}") . '.pdf';

            return Storage::disk('public')->download($receipt->pdf_path, $filename, [
                'Content-Type' => 'application/pdf',
            ]);
        }

        // ✅ Fallback si pas de PDF : tu peux renvoyer 404
        // ou déclencher génération si tu veux (avec ton service).
        // Ici je fais simple: 404 explicite.
        return response()->json([
            'message' => 'PDF indisponible pour cette quittance (pdf_path manquant).'
        ], 404);
    }
}
