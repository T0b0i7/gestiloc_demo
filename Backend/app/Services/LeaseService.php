<?php

namespace App\Services;

use App\Models\Lease;
use App\Models\Property;
use App\Models\Tenant;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class LeaseService
{
    /**
     * Create a new lease
     */
    public function createLease(array $data): Lease
    {
        $user = Auth::user();

        if (!$user->isLandlord()) {
            throw new \Exception('Only landlords can create leases');
        }

        $landlord = $user->landlord;
        if (!$landlord) {
            throw new \Exception('Landlord profile not found');
        }

        $property = Property::findOrFail($data['property_id']);

        // Verify property ownership
        if ($property->landlord_id !== $landlord->id) {
            throw new \Exception('You do not own this property');
        }

        $tenant = Tenant::findOrFail($data['tenant_id']);

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

            // Update property status if lease is active
            if ($lease->status === 'active') {
                $property->status = 'rented';
                $property->save();
            }

            return $lease;
        });
    }

    /**
     * Get leases for user's properties (landlord)
     */
    public function getLeasesForLandlord(): \Illuminate\Database\Eloquent\Collection
    {
        $user = Auth::user();

        if (!$user->isLandlord()) {
            throw new \Exception('Only landlords can access leases');
        }

        $landlord = $user->landlord;
        if (!$landlord) {
            return collect([]);
        }

        return Lease::whereHas('property', function ($query) use ($landlord) {
            $query->where('landlord_id', $landlord->id);
        })->with(['property', 'tenant.user'])->get();
    }

    /**
     * Get leases for specific tenant
     */
    public function getLeasesForTenant(Tenant $tenant): \Illuminate\Database\Eloquent\Collection
    {
        $user = Auth::user();

        // Tenant can only see their own leases, admin can see all
        if ($tenant->user_id !== $user->id && !$user->isAdmin()) {
            throw new \Exception('Unauthorized to view these leases');
        }

        return $tenant->leases()->with(['property.landlord.user'])->get();
    }

    /**
     * Update lease status
     */
    public function updateLeaseStatus(Lease $lease, string $status): Lease
    {
        $user = Auth::user();

        // Check authorization
        if ($user->isLandlord()) {
            if (!$user->landlord || $lease->property->landlord_id !== $user->landlord->id) {
                throw new \Exception('Unauthorized to update this lease');
            }
        } elseif (!$user->isAdmin()) {
            throw new \Exception('Unauthorized');
        }

        $lease->status = $status;
        $lease->save();

        // Update property status if lease is terminated
        if ($status === 'terminated') {
            $property = $lease->property;
            $activeLeases = $property->leases()->where('status', 'active')->count();
            if ($activeLeases === 0) {
                $property->status = 'available';
                $property->save();
            }
        }

        return $lease->fresh();
    }
}
