<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\RentReceipt;
use App\Models\Lease;
use App\Models\Property;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class RentReceiptController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();

        Log::info('[RentReceiptController@index] incoming', [
            'auth_id' => $user?->id,
            'roles'   => $user?->roles?->pluck('name'),
            'query'   => $request->query(),
        ]);

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $type = $request->query('type'); // independent | invoice | null

        $q = RentReceipt::query()->latest();

        // ✅ BAILLEUR
        if ($user->hasRole('landlord')) {
            $q->where('landlord_id', $user->id);
        }
        // ✅ LOCATAIRE
        elseif ($user->hasRole('tenant')) {
            $tenant = $user->tenant;

            if (!$tenant) {
                return response()->json([
                    'message' => 'Tenant profile not found for this user.'
                ], 422);
            }

            // ✅ IMPORTANT : tenant_id = tenants.id
            $q->where('tenant_id', $tenant->id);
        } else {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        // ✅ filtre type si colonne existe
        if ($type && Schema::hasColumn('rent_receipts', 'type')) {
            $q->where('type', $type);
        }

        $rows = $q->with([
            'property',
            'lease',
            'tenant.user',   // ✅ email/phone côté locataire
            'landlord',      // ✅ bailleur user
        ])->get();

        return response()->json($rows);
    }

    /**
     * ✅ Création réservée au bailleur (quittance indépendante)
     */
    public function store(Request $request)
    {
        $user = Auth::user();

        Log::info('[RentReceiptController@store] incoming', [
            'auth_id' => $user?->id,
            'roles'   => $user?->roles?->pluck('name'),
            'payload' => $request->all(),
        ]);

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        if (!$user->hasRole('landlord')) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $validator = Validator::make($request->all(), [
            'lease_id'    => 'required|exists:leases,id',
            'type'        => 'required|in:independent,invoice',
            'paid_month'  => ['required', 'regex:/^\d{4}-\d{2}$/'],
            'issued_date' => 'required|date',
            'notes'       => 'nullable|string|max:2000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $lease = Lease::with(['property', 'tenant'])->find($request->lease_id);
        if (!$lease) return response()->json(['message' => 'Lease not found'], 404);

        $property = $lease->property;
        if (!$property) return response()->json(['message' => 'Property not found'], 404);

        // ✅ ownership tolérant (user_id OU landlord_id)
        $ownerByUserId = isset($property->user_id) && ((int)$property->user_id === (int)$user->id);
        $ownerByLandlordId = isset($property->landlord_id) && ((int)$property->landlord_id === (int)$user->id);

        if (!$ownerByUserId && !$ownerByLandlordId) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        [$yearStr, $monthStr] = explode('-', $request->paid_month);
        $year  = (int) $yearStr;
        $month = (int) $monthStr;

        $amount = (float) ($lease->rent_amount ?? 0);

        $reference = null;
        if (Schema::hasColumn('rent_receipts', 'reference')) {
            $reference = $this->nextReference($user->id, $year, $month);
        }

        $data = [
            'lease_id'    => $lease->id,
            'property_id' => $lease->property_id,
            'landlord_id' => $user->id,          // users.id
            'tenant_id'   => $lease->tenant_id,  // tenants.id ✅
            'status'      => 'issued',
            'notes'       => $request->notes,
        ];

        if (Schema::hasColumn('rent_receipts', 'reference') && $reference) {
            $data['reference'] = $reference;
        }
        if (Schema::hasColumn('rent_receipts', 'type')) {
            $data['type'] = $request->type;
        }
        if (Schema::hasColumn('rent_receipts', 'paid_month')) {
            $data['paid_month'] = $request->paid_month;
        }
        if (Schema::hasColumn('rent_receipts', 'month')) {
            $data['month'] = $month;
        }
        if (Schema::hasColumn('rent_receipts', 'year')) {
            $data['year'] = $year;
        }
        if (Schema::hasColumn('rent_receipts', 'issued_date')) {
            $data['issued_date'] = $request->issued_date;
        }
        if (Schema::hasColumn('rent_receipts', 'amount_paid')) {
            $data['amount_paid'] = $amount;
        }

        $receipt = RentReceipt::create($data);

        return response()->json($receipt->load([
            'property',
            'lease',
            'tenant.user',
            'landlord'
        ]), 201);
    }

    /**
     * ✅ Télécharger PDF quittance
     * - si rent_receipts.pdf_path existe => on sert le fichier
     * - sinon fallback vers /quittance-independent/{id} (PdfController)
     */
    public function pdf($id)
    {
        $user = Auth::user();
        if (!$user) return response()->json(['message' => 'Unauthenticated.'], 401);

        $receipt = RentReceipt::with(['property', 'lease', 'tenant.user', 'landlord'])->findOrFail($id);

        // ✅ ACL landlord
        if ($user->hasRole('landlord') && (int)$receipt->landlord_id !== (int)$user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // ✅ ACL tenant : tenant_id = tenants.id
        if ($user->hasRole('tenant')) {
            $tenant = $user->tenant;
            if (!$tenant) return response()->json(['message' => 'Tenant profile missing'], 422);

            if ((int)$receipt->tenant_id !== (int)$tenant->id) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }
        }

        // 1) Si le PDF est stocké
        if (Schema::hasColumn('rent_receipts', 'pdf_path') && $receipt->pdf_path) {
            if (Storage::disk('public')->exists($receipt->pdf_path)) {
                $filename = 'quittance-' . ($receipt->paid_month ?? $receipt->id) . '.pdf';
                return Storage::disk('public')->download($receipt->pdf_path, $filename);
            }
        }

        // 2) fallback : ton générateur existant
        return response()->json([
            'message' => 'PDF not stored. Use /quittance-independent/{id} to generate.',
            'fallback_url' => url("/api/quittance-independent/{$receipt->id}"),
        ], 200);
    }

    private function nextReference(int $landlordId, int $year, int $month): string
    {
        $prefix = sprintf('RR-%04d-%02d-', $year, $month);

        $last = RentReceipt::query()
            ->where('landlord_id', $landlordId)
            ->where('reference', 'like', $prefix . '%')
            ->orderByDesc('id')
            ->value('reference');

        if (!$last) return $prefix . '000001';

        $seq = (int) substr($last, -6);
        $seq++;

        return $prefix . str_pad((string) $seq, 6, '0', STR_PAD_LEFT);
    }
}
