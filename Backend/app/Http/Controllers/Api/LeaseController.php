<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreLeaseRequest;
use App\Models\Lease;
use App\Models\Property;
use App\Models\Tenant;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class LeaseController extends Controller
{
    // Create a lease — only landlord owning the property can create
    public function store(StoreLeaseRequest $request): JsonResponse
    {
        $data = $request->validated();
        $user = $request->user();

        if (!$user->isLandlord()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $landlord = $user->landlord;
        if (! $landlord) {
            return response()->json(['message' => 'Landlord profile missing'], 422);
        }

        $property = Property::findOrFail($data['property_id']);

        if ($property->landlord_id !== $landlord->id) {
            return response()->json(['message' => 'You do not own this property'], 403);
        }

        $tenant = Tenant::findOrFail($data['tenant_id']);

        // create lease in transaction and update property status to rented if status active
        return DB::transaction(function () use ($data, $property, $tenant) {

            $lease = Lease::create([
                'property_id' => $property->id,
                'tenant_id' => $tenant->id,
                'start_date' => $data['start_date'],
                'end_date' => $data['end_date'] ?? null,
                'rent_amount' => $data['rent_amount'],
                'deposit' => $data['deposit'] ?? null,
                'type' => $data['type'],
                'status' => $data['status'] ?? 'active',
                'terms' => $data['terms'] ?? null,
            ]);

            if ($lease->status === 'active') {
                $property->status = 'rented';
                $property->save();
            }

            return response()->json($lease, 201);
        });
    }

    public function index(Request $request)
{
    $leases = Lease::with(['property', 'tenant'])
        ->orderByDesc('created_at')
        ->get();

    return response()->json($leases);
}


    // Optional: end lease, list leases etc (not fully expanded here)
}
