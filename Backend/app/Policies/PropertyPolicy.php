<?php

namespace App\Policies;

use App\Models\Property;
use App\Models\User;

class PropertyPolicy
{
    public function view(User $user, Property $property): bool
    {
        if ($user->hasRole('admin')) return true;

        return $user->hasRole('landlord')
            && $user->landlord
            && $property->landlord_id === $user->landlord->id;
    }

    public function update(User $user, Property $property): bool
    {
        return $this->view($user, $property);
    }

    public function delete(User $user, Property $property): bool
    {
        return $this->view($user, $property);
    }

    public function create(User $user): bool
    {
        return $user->hasRole('landlord') || $user->hasRole('admin');
    }
}
