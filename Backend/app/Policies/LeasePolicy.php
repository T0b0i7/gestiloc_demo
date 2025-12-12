<?php

namespace App\Policies;

use App\Models\Lease;
use App\Models\User;

class LeasePolicy
{
    public function view(User $user, Lease $lease): bool
    {
        if ($user->hasRole('admin')) return true;

        return $user->hasRole('landlord')
            && $user->landlord
            && $lease->property->landlord_id === $user->landlord->id;
    }

    public function update(User $user, Lease $lease): bool
    {
        return $this->view($user, $lease);
    }

    public function delete(User $user, Lease $lease): bool
    {
        return $this->view($user, $lease);
    }

    public function create(User $user): bool
    {
        return $user->hasRole('landlord');
    }
}
