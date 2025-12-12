<?php

namespace App\Services;

use App\Models\Property;
use App\Models\Landlord;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Auth;

class PropertyService
{
    /**
     * Get all properties based on user role
     */
    public function getAllProperties(): Collection
    {
        $user = Auth::user();

        if ($user->isAdmin()) {
            return Property::with(['landlord.user'])->get();
        }

        if ($user->isLandlord()) {
            $landlord = $user->landlord;
            return $landlord ? $landlord->properties()->with(['leases.tenant'])->get() : collect([]);
        }

        return collect([]);
    }

    /**
     * Get paginated properties
     */
    public function getPaginatedProperties(int $perPage = 20): \Illuminate\Contracts\Pagination\LengthAwarePaginator
    {
        $user = Auth::user();

        if ($user->isAdmin()) {
            return Property::with(['landlord.user'])->paginate($perPage);
        }

        if ($user->isLandlord()) {
            $landlord = $user->landlord;
            return $landlord ? $landlord->properties()->with(['leases.tenant'])->paginate($perPage) : collect([]);
        }

        return collect([]);
    }

    /**
     * Create a new property
     */
    public function createProperty(array $data): Property
    {
        $user = Auth::user();
        $landlord = $user->landlord;

        if (!$landlord) {
            throw new \Exception('Landlord profile not found');
        }

        $data['landlord_id'] = $landlord->id;

        return Property::create($data);
    }

    /**
     * Update a property
     */
    public function updateProperty(Property $property, array $data): Property
    {
        $user = Auth::user();

        // Check ownership or admin rights
        if ($user->isLandlord()) {
            if (!$user->landlord || $property->landlord_id !== $user->landlord->id) {
                throw new \Exception('Unauthorized to update this property');
            }
        } elseif (!$user->isAdmin()) {
            throw new \Exception('Unauthorized');
        }

        $property->update($data);
        return $property->fresh();
    }

    /**
     * Delete a property
     */
    public function deleteProperty(Property $property): bool
    {
        $user = Auth::user();

        // Check ownership or admin rights
        if ($user->isLandlord()) {
            if (!$user->landlord || $property->landlord_id !== $user->landlord->id) {
                throw new \Exception('Unauthorized to delete this property');
            }
        } elseif (!$user->isAdmin()) {
            throw new \Exception('Unauthorized');
        }

        return $property->delete();
    }

    /**
     * Get property by ID with authorization check
     */
    public function getPropertyById(int $id): Property
    {
        $property = Property::with(['landlord.user', 'leases.tenant'])->findOrFail($id);
        $user = Auth::user();

        // Check ownership or admin rights
        if ($user->isLandlord()) {
            if (!$user->landlord || $property->landlord_id !== $user->landlord->id) {
                throw new \Exception('Unauthorized to view this property');
            }
        } elseif (!$user->isAdmin()) {
            throw new \Exception('Unauthorized');
        }

        return $property;
    }
}
