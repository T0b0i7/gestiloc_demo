<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PropertyDelegation;
use App\Models\CoOwner;
use App\Models\Property;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PropertyDelegationController extends Controller
{
    /**
     * Créer une délégation de propriété avec gestion des permissions selon le type
     */
    public function delegate(Request $request): JsonResponse
    {
        $user = $request->user();
        
        if (!$user->isLandlord()) {
            return response()->json(['message' => 'Seuls les propriétaires peuvent déléguer'], 403);
        }

        $validated = $request->validate([
            'property_id' => 'required|exists:properties,id',
            'co_owner_id' => 'required|exists:co_owners,id',
            'expires_at' => 'nullable|date|after:today',
            'notes' => 'nullable|string|max:1000',
            'permissions' => 'nullable|array',
        ]);

        // Vérifier que la propriété appartient au landlord
        $property = Property::where('id', $validated['property_id'])
            ->where('landlord_id', $user->landlord->id)
            ->firstOrFail();

        // Récupérer le co-owner
        $coOwner = CoOwner::findOrFail($validated['co_owner_id']);
        
        // Vérifier si c'est une agence ou un copropriétaire simple
        $meta = $coOwner->meta ?? [];
        $invitationType = $meta['invitation_type'] ?? ($coOwner->is_professional ? 'agency' : 'co_owner');

        // Définir les permissions selon le type
        if ($invitationType === 'agency') {
            // AGENCE = Gestion complète (pas de choix)
            $permissions = [
                'view',                 // Voir
                'edit',                 // Modifier
                'manage_lease',         // Gérer les baux
                'collect_rent',         // Collecter les loyers
                'manage_maintenance',   // Gérer la maintenance
                'send_invoices',        // Envoyer les factures
                'manage_tenants',       // Gérer les locataires
                'view_documents'        // Voir les documents
            ];
            $delegationType = 'full';
            $notes = "Délégation complète à une agence. Vous ne pourrez plus gérer ce bien, sauf en lecture seule.";
        } else {
            // COPROPRIÉTAIRE SIMPLE = Permissions personnalisables
            $permissions = $validated['permissions'] ?? ['view', 'edit', 'manage_lease'];
            $delegationType = 'shared';
            $notes = $validated['notes'] ?? "Délégation partagée à un copropriétaire simple.";
        }

        return DB::transaction(function () use (
            $property, 
            $coOwner, 
            $permissions, 
            $delegationType,
            $validated,
            $user,
            $notes,
            $invitationType
        ) {
            // Vérifier s'il existe déjà une délégation active pour CE BIEN (à n'importe quel co-owner)
            $existingDelegation = PropertyDelegation::where('property_id', $property->id)
                ->where('status', 'active')
                ->first();

            if ($existingDelegation) {
                // Récupérer le nom du co-owner qui a déjà la délégation
                $existingCoOwner = $existingDelegation->coOwner;
                $existingCoOwnerName = $existingCoOwner 
                    ? $existingCoOwner->first_name . ' ' . $existingCoOwner->last_name 
                    : 'un gestionnaire';
                
                return response()->json([
                    'message' => "Ce bien est déjà délégué à $existingCoOwnerName",
                    'conflict' => true,
                    'existing_delegation' => [
                        'id' => $existingDelegation->id,
                        'co_owner_id' => $existingDelegation->co_owner_id,
                        'co_owner_name' => $existingCoOwnerName,
                        'delegated_at' => $existingDelegation->created_at,
                        'delegation_type' => $existingDelegation->delegation_type,
                        'status' => $existingDelegation->status
                    ]
                ], 409);
            }

            // CORRECTION : Créer la délégation avec co_owner_type et delegated_at
            $delegation = PropertyDelegation::create([
                'property_id' => $property->id,
                'co_owner_id' => $coOwner->id,
                'landlord_id' => $user->landlord->id,
                'co_owner_type' => $invitationType, // AJOUT IMPORTANT
                'status' => 'active',
                'permissions' => $permissions,
                'delegation_type' => $delegationType,
                'delegated_at' => now(), // AJOUT IMPORTANT
                'expires_at' => $validated['expires_at'] ?? null,
                'notes' => $notes,
            ]);

            Log::info('Délégation créée', [
                'delegation_id' => $delegation->id,
                'property_id' => $property->id,
                'co_owner_id' => $coOwner->id,
                'co_owner_type' => $invitationType, // AJOUT LOG
                'type' => $delegationType,
                'permissions' => $permissions
            ]);

            return response()->json([
                'message' => 'Bien délégué avec succès',
                'data' => [
                    'id' => $delegation->id,
                    'property' => $property->name,
                    'co_owner' => $coOwner->first_name . ' ' . $coOwner->last_name,
                    'co_owner_type' => $invitationType, // AJOUT RÉPONSE
                    'delegation_type' => $delegationType,
                    'permissions' => $permissions,
                    'status' => 'active',
                    'delegated_at' => $delegation->delegated_at,
                    'notes' => $notes
                ]
            ], 201);
        });
    }

    /**
     * Révoquer une délégation - CORRECTION : ajouter revoked_at
     */
    public function revoke(Request $request, $delegationId): JsonResponse
    {
        $user = $request->user();
        
        if (!$user->isLandlord()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $delegation = PropertyDelegation::where('id', $delegationId)
            ->where('landlord_id', $user->landlord->id)
            ->firstOrFail();

        // Vérifier le type de délégation
        if ($delegation->delegation_type === 'full') {
            return response()->json([
                'message' => 'Impossible de révoquer une délégation complète (agence). Contactez l\'agence directement.'
            ], 403);
        }

        $delegation->update([
            'status' => 'revoked',
            'revoked_at' => now() // AJOUT IMPORTANT
        ]);

        Log::info('Délégation révoquée', [
            'delegation_id' => $delegation->id,
            'property_id' => $delegation->property_id,
            'co_owner_id' => $delegation->co_owner_id
        ]);

        return response()->json([
            'message' => 'Délégation révoquée avec succès'
        ]);
    }

    /**
     * Récupérer les délégations d'un co-owner
     */
    public function getCoOwnerDelegations(Request $request, $coOwnerId): JsonResponse
    {
        $user = $request->user();
        
        if (!$user->isLandlord()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $delegations = PropertyDelegation::where('co_owner_id', $coOwnerId)
            ->where('landlord_id', $user->landlord->id)
            ->with(['property'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'data' => $delegations
        ]);
    }

    /**
     * Lister les délégations d'un co-propriétaire (pour le landlord)
     * GET /api/landlords/co-owners/{coOwner}/delegations
     */
    public function listLandlordCoOwnerDelegations(CoOwner $coOwner): JsonResponse
    {
        $user = auth()->user();

        // Seul le landlord qui a invité ce co-owner ou l'admin peut voir
        if (!$user->isAdmin() && (!$user->isLandlord() || $user->landlord->id !== $coOwner->landlord_id)) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $delegations = $coOwner->delegations()
            ->with(['property', 'landlord.user'])
            ->latest()
            ->paginate(20);

        return response()->json([
            'data' => $delegations
        ]);
    }

    /**
     * Lister les délégations d'un copropriétaire
     * GET /api/co-owners/{coOwner}/delegations
     */
    public function listCoOwnerDelegations(CoOwner $coOwner): JsonResponse
    {
        $user = auth()->user();

        // Seul le copropriétaire concerné, le landlord propriétaire, ou l'admin peut voir
        if (!$user->isAdmin() && 
            (!$user->isCoOwner() || $user->coOwner->id !== $coOwner->id)) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $delegations = $coOwner->delegations()
            ->with(['property', 'landlord.user'])
            ->latest()
            ->paginate(20);

        return response()->json([
            'data' => $delegations
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
            ->with(['property', 'coOwner'])
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

        // Seul le propriétaire du bien peut modifier
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