<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\DelegatePropertyRequest;
use App\Models\Property;
use App\Models\PropertyDelegation;
use App\Models\Landlord;
use App\Models\Agency;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PropertyDelegationController extends Controller
{
    /**
     * Déléguer une propriété à un copropriétaire
     * POST /api/properties/{property}/delegate
     */
    public function delegate(DelegatePropertyRequest $request, Property $property): JsonResponse
    {
        $user = auth()->user();

        // Vérifier que le landlord possède bien cette propriété
        if (!$user->isLandlord() || $property->landlord_id !== $user->landlord->id) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        // Vérifier qu'il n'y a pas déjà une délégation active
        $existingDelegation = PropertyDelegation::where('property_id', $property->id)
            ->where('status', 'active')
            ->first();

        if ($existingDelegation) {
            return response()->json([
                'message' => 'Cette propriété est déjà déléguée',
                'delegation' => $existingDelegation
            ], 400);
        }

        // Trouver le copropriétaire (particulier ou agence)
        if ($request->co_owner_type === 'agency') {
            $coOwner = Agency::coOwnerAgencies()->findOrFail($request->co_owner_id);
            $coOwnerType = 'agency';
        } else {
            $coOwner = Landlord::coOwners()->findOrFail($request->co_owner_id);
            $coOwnerType = 'landlord';
        }

        // Créer la délégation
        $delegation = PropertyDelegation::create([
            'property_id' => $property->id,
            'landlord_id' => $user->landlord->id,
            'co_owner_id' => $coOwner->id,
            'co_owner_type' => $coOwnerType,
            'status' => 'active',
            'delegated_at' => now(),
            'expires_at' => $request->expires_at,
            'notes' => $request->notes,
            'permissions' => $request->permissions ?? [
                'manage_lease',
                'collect_rent',
                'manage_maintenance',
                'send_invoices'
            ],
        ]);

        return response()->json([
            'message' => 'Propriété déléguée avec succès',
            'delegation' => $delegation->load(['property', 'coOwner'])
        ]);
    }

    /**
     * Révoquer une délégation
     * POST /api/properties/{property}/revoke-delegation
     */
    public function revoke(Request $request, Property $property): JsonResponse
    {
        $user = auth()->user();

        // Vérifier que le landlord possède bien cette propriété
        if (!$user->isLandlord() || $property->landlord_id !== $user->landlord->id) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $delegation = PropertyDelegation::where('property_id', $property->id)
            ->where('status', 'active')
            ->first();

        if (!$delegation) {
            return response()->json(['message' => 'Aucune délégation active trouvée'], 404);
        }

        $delegation->update([
            'status' => 'revoked',
            'revoked_at' => now()
        ]);

        return response()->json([
            'message' => 'Délégation révoquée avec succès',
            'delegation' => $delegation
        ]);
    }

    /**
     * Lister les délégations d'un copropriétaire
     * GET /api/co-owners/{coOwner}/delegations
     */
    public function listCoOwnerDelegations(Landlord $coOwner): JsonResponse
    {
        $user = auth()->user();

        // Seul le copropriétaire concerné ou l'admin peut voir
        if (!$user->isAdmin() && (!$user->isCoOwner() || $user->coOwner->id !== $coOwner->id)) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $delegations = $coOwner->delegations()
            ->with(['property', 'landlord.user'])
            ->latest()
            ->paginate(20);

        return response()->json([
            'delegations' => $delegations
        ]);
    }

    /**
     * Lister les délégations d'un propriétaire
     * GET /api/landlords/delegations
     */
    public function listLandlordDelegations(): JsonResponse
    {
        $user = auth()->user();

        if (!$user->isLandlord()) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $delegations = PropertyDelegation::where('landlord_id', $user->landlord->id)
            ->with(['property', 'agency'])
            ->latest()
            ->paginate(20);

        return response()->json([
            'delegations' => $delegations
        ]);
    }

    /**
     * Mettre à jour une délégation
     * PUT /api/delegations/{delegation}
     */
    public function update(Request $request, PropertyDelegation $delegation): JsonResponse
    {
        $user = auth()->user();

        // Seul le propriétaire du bien ou l'agence peut modifier
        if (!$user->isLandlord() || $delegation->landlord_id !== $user->landlord->id) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $validated = $request->validate([
            'expires_at' => 'nullable|date|after:now',
            'notes' => 'nullable|string|max:1000',
            'permissions' => 'nullable|array',
            'permissions.*' => 'string'
        ]);

        $delegation->update($validated);

        return response()->json([
            'message' => 'Délégation mise à jour avec succès',
            'delegation' => $delegation->load(['property', 'coOwner'])
        ]);
    }
}
