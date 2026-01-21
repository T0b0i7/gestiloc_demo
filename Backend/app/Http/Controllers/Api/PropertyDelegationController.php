<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\DelegatePropertyRequest;
use App\Models\Property;
use App\Models\PropertyDelegation;
use App\Models\DelegationAudit;
use App\Models\Landlord;
use App\Models\Agency;
use App\Models\CoOwner;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PropertyDelegationController extends Controller
{
    /**
     * Déléguer une propriété à un copropriétaire
     * POST /api/properties/{property}/delegate
     */
    public function delegate(DelegatePropertyRequest $request, Property $property): JsonResponse
    {
        $user = auth()->user();
        
        // Logs de débogage détaillés
        \Log::info('=== DELEGATION ATTEMPT ===', [
            'property_id' => $property->id,
            'user_id' => $user?->id,
            'user_email' => $user?->email,
            'user_landlord_id' => $user?->landlord?->id,
            'property_landlord_id' => $property->landlord_id,
            'request_data' => $request->all()
        ]);

        // TODO: Remettre la vérification d'authentification après test
        // Pour le test, on permet à n'importe quel utilisateur de déléguer
        if (!$user) {
            \Log::error('User not authenticated');
            return response()->json(['message' => 'Non authentifié'], 401);
        }

        // Vérifier que le landlord possède bien cette propriété
        if (!$user->isLandlord() || $property->landlord_id !== $user->landlord->id) {
            // Pour le test, on autorise si c'est le landlord 1 ou si la propriété lui appartient
            if ($user->landlord_id !== 1 && $property->landlord_id !== $user->landlord->id) {
                \Log::warning('Unauthorized delegation attempt', [
                    'user_landlord_id' => $user->landlord_id,
                    'property_landlord_id' => $property->landlord_id
                ]);
                return response()->json(['message' => 'Non autorisé - Vous ne possédez pas cette propriété'], 403);
            }
        }

        // Vérifier qu'il n'y a pas déjà une délégation active
        $existingDelegation = PropertyDelegation::where('property_id', $property->id)
            ->where('status', 'active')
            ->first();

        if ($existingDelegation) {
            // Gestion des conflits : proposer de remplacer ou d'ajouter
            if ($request->has('force_replace') && $request->force_replace) {
                // Révoquer l'ancienne délégation
                DB::transaction(function () use ($existingDelegation, $user) {
                    $oldValues = $existingDelegation->toArray();
                    
                    $existingDelegation->update([
                        'status' => 'revoked',
                        'revoked_at' => now()
                    ]);

                    // Audit trail
                    DelegationAudit::createAudit(
                        $existingDelegation,
                        'revoked',
                        $oldValues,
                        ['status' => 'revoked', 'revoked_at' => now()],
                        'Remplacé par une nouvelle délégation',
                        $user,
                        $request->ip(),
                        $request->userAgent()
                    );
                });
            } else {
                return response()->json([
                    'message' => 'Cette propriété est déjà déléguée',
                    'conflict' => true,
                    'existing_delegation' => $existingDelegation->load(['property', 'coOwner']),
                    'suggestions' => [
                        'use_force_replace' => 'Utilisez force_replace=true pour remplacer la délégation existante'
                    ]
                ], 409);
            }
        }

        // Trouver le copropriétaire (particulier ou agence)
        \Log::info('Finding co-owner', [
            'co_owner_id' => $request->co_owner_id,
            'co_owner_type' => $request->co_owner_type
        ]);

        if ($request->co_owner_type === 'agency') {
            $coOwner = Agency::coOwnerAgencies()->findOrFail($request->co_owner_id);
            $coOwnerType = Agency::class; // Nom complet de la classe
            \Log::info('Found agency co-owner', ['agency_id' => $coOwner->id]);
        } else {
            // Chercher directement le CoOwner par ID
            $coOwner = CoOwner::with('user')->findOrFail($request->co_owner_id);
            $coOwnerType = CoOwner::class; // Pour les co-propriétaires
            \Log::info('Found co-owner', [
                'co_owner_id' => $coOwner->id,
                'user_id' => $coOwner->user_id,
                'user_email' => $coOwner->user->email ?? 'No user'
            ]);
        }

        // Créer la délégation
        $delegation = DB::transaction(function () use ($request, $property, $user, $coOwner, $coOwnerType) {
            $newDelegation = PropertyDelegation::create([
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

            // Audit trail
            DelegationAudit::createAudit(
                $newDelegation,
                'created',
                null,
                $newDelegation->toArray(),
                $request->notes ?: 'Création de délégation',
                $user,
                $request->ip(),
                $request->userAgent()
            );

            return $newDelegation;
        });

        return response()->json([
            'message' => 'Propriété déléguée avec succès',
            'delegation' => $delegation->load(['property', 'coOwner']),
            'audit_info' => [
                'created_at' => now(),
                'performed_by' => $user->email,
                'ip_address' => $request->ip()
            ]
        ], 201);
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

        DB::transaction(function () use ($delegation, $request, $user) {
            $oldValues = $delegation->toArray();
            
            $delegation->update([
                'status' => 'revoked',
                'revoked_at' => now()
            ]);

            // Audit trail
            DelegationAudit::createAudit(
                $delegation,
                'revoked',
                $oldValues,
                ['status' => 'revoked', 'revoked_at' => now()],
                $request->notes ?: 'Révocation de délégation',
                $user,
                $request->ip(),
                $request->userAgent()
            );
        });

        return response()->json([
            'message' => 'Délégation révoquée avec succès',
            'delegation' => $delegation->load(['property', 'coOwner']),
            'audit_info' => [
                'revoked_at' => now(),
                'performed_by' => $user->email,
                'ip_address' => $request->ip()
            ]
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

        DB::transaction(function () use ($delegation, $validated, $request, $user) {
            $oldValues = $delegation->toArray();
            
            $delegation->update($validated);

            // Audit trail pour les changements
            $changes = [];
            foreach ($validated as $key => $value) {
                if ($oldValues[$key] != $value) {
                    $changes[$key] = [
                        'old' => $oldValues[$key],
                        'new' => $value
                    ];
                }
            }

            if (!empty($changes)) {
                DelegationAudit::createAudit(
                    $delegation,
                    'updated',
                    $oldValues,
                    $delegation->fresh()->toArray(),
                    'Mise à jour de délégation: ' . implode(', ', array_keys($changes)),
                    $user,
                    $request->ip(),
                    $request->userAgent()
                );
            }
        });

        return response()->json([
            'message' => 'Délégation mise à jour avec succès',
            'delegation' => $delegation->load(['property', 'coOwner']),
            'audit_info' => [
                'updated_at' => now(),
                'performed_by' => $user->email,
                'ip_address' => $request->ip()
            ]
        ]);
    }
}
