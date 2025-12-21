<?php

namespace App\Policies;

use App\Models\Lease;
use App\Models\User;

class LeasePolicy
{
    public function view(User $user, Lease $lease): bool
    {
        if ($user->hasRole('admin')) {
            return true;
        }

        // ✅ Locataire : ne voit que ses propres baux
        if ($user->hasRole('tenant')) {
            return $user->tenant && $lease->tenant_id === $user->tenant->id;
        }

        // ✅ Propriétaire : ne voit que les baux des biens qu'il possède
        if ($user->hasRole('landlord')) {
            // évite crash si property pas chargée
            $propertyLandlordId = $lease->property?->landlord_id;

            return $user->landlord
                && $propertyLandlordId
                && (int) $propertyLandlordId === (int) $user->landlord->id;
        }

        return false;
    }

    public function create(User $user): bool
    {
        return $user->hasRole('admin') || $user->hasRole('landlord');
    }

    public function update(User $user, Lease $lease): bool
    {
        return $this->view($user, $lease);
    }

    public function delete(User $user, Lease $lease): bool
    {
        return $this->view($user, $lease);
    }
}
