<?php

namespace App\Policies;

use App\Models\Property;
use App\Models\PropertyConditionReport;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class PropertyConditionReportPolicy
{
    use HandlesAuthorization;

    public function viewAny(User $user, Property $property)
    {
        // Le propriétaire du bien ou un administrateur peut voir les états des lieux
        return $user->isAdmin() || 
               $property->landlord_id === $user->id ||
               $property->tenants()->where('user_id', $user->id)->exists();
    }

    public function view(User $user, PropertyConditionReport $report, Property $property)
    {
        // Vérifier que le rapport appartient bien à la propriété
        if ($report->property_id !== $property->id) {
            return false;
        }

        // Le propriétaire du bien, un administrateur ou un locataire du bien peut voir un état des lieux
        return $user->isAdmin() || 
               $property->landlord_id === $user->id ||
               $property->tenants()->where('user_id', $user->id)->exists();
    }

    public function create(User $user, Property $property)
    {
        // Seul le propriétaire du bien ou un administrateur peut créer un état des lieux
        return $user->isAdmin() || $property->landlord_id === $user->id;
    }

    public function update(User $user, PropertyConditionReport $report, Property $property)
    {
        // Vérifier que le rapport appartient bien à la propriété
        if ($report->property_id !== $property->id) {
            return false;
        }

        // Seul le propriétaire du bien ou un administrateur peut mettre à jour un état des lieux
        return $user->isAdmin() || $property->landlord_id === $user->id;
    }

    public function delete(User $user, PropertyConditionReport $report, Property $property)
    {
        // Vérifier que le rapport appartient bien à la propriété
        if ($report->property_id !== $property->id) {
            return false;
        }

        // Seul le propriétaire du bien ou un administrateur peut supprimer un état des lieux
        return $user->isAdmin() || $property->landlord_id === $user->id;
    }
}
