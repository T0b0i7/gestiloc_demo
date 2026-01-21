<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CoOwner;
use App\Models\Property;
use App\Models\PropertyDelegation;
use App\Models\Lease;
use App\Models\RentReceipt;
use App\Models\User;
use App\Models\Tenant;
use App\Models\Notice;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class CoOwnerMeController extends Controller
{
    /**
     * Récupérer le profil complet du co-propriétaire connecté
     */
    public function getProfile(Request $request): JsonResponse
    {
        $user = $request->user();
        
        if (!$user->isCoOwner()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $coOwner = $user->coOwner;
        if (!$coOwner) {
            return response()->json(['message' => 'Co-owner profile missing'], 422);
        }

        // Récupérer les statistiques
        $delegatedPropertiesCount = PropertyDelegation::where('co_owner_id', $coOwner->id)
            ->where('status', 'active')
            ->count();

        $activeLeasesCount = Lease::whereIn('property_id', function($query) use ($coOwner) {
            $query->select('property_id')
                ->from('property_delegations')
                ->where('co_owner_id', $coOwner->id)
                ->where('status', 'active');
        })->where('status', 'active')->count();

        $totalRentCollected = RentReceipt::whereIn('lease_id', function($query) use ($coOwner) {
            $query->select('id')
                ->from('leases')
                ->whereIn('property_id', function($subQuery) use ($coOwner) {
                    $subQuery->select('property_id')
                        ->from('property_delegations')
                        ->where('co_owner_id', $coOwner->id)
                        ->where('status', 'active');
                });
        })->where('status', 'paid')->sum('amount_paid');

        $profileData = [
            'id' => $coOwner->id,
            'user_id' => $coOwner->user_id,
            'first_name' => $coOwner->first_name,
            'last_name' => $coOwner->last_name,
            'email' => $user->email,
            'phone' => $coOwner->phone,
            'address' => $coOwner->address,
            'date_of_birth' => $coOwner->date_of_birth,
            'id_number' => $coOwner->id_number,
            'company_name' => $coOwner->company_name,
            'address_billing' => $coOwner->address_billing,
            'license_number' => $coOwner->license_number,
            'is_professional' => $coOwner->is_professional,
            'ifu' => $coOwner->ifu,
            'rccm' => $coOwner->rccm,
            'vat_number' => $coOwner->vat_number,
            'status' => $coOwner->status,
            'joined_at' => $coOwner->created_at,
            'created_at' => $coOwner->created_at,
            'updated_at' => $coOwner->updated_at,
            'statistics' => [
                'delegated_properties_count' => $delegatedPropertiesCount,
                'active_leases_count' => $activeLeasesCount,
                'total_rent_collected' => $totalRentCollected,
            ],
            'user' => [
                'id' => $user->id,
                'email' => $user->email,
                'email_verified_at' => $user->email_verified_at,
                'created_at' => $user->created_at,
                'last_login_at' => $user->last_login_at,
            ]
        ];

        return response()->json([
            'data' => $profileData
        ]);
    }

    /**
     * Mettre à jour le profil du co-propriétaire
     */
    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();
        
        if (!$user->isCoOwner()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $coOwner = $user->coOwner;
        if (!$coOwner) {
            return response()->json(['message' => 'Co-owner profile missing'], 422);
        }

        $validated = $request->validate([
            'first_name' => 'sometimes|string|max:255',
            'last_name' => 'sometimes|string|max:255',
            'phone' => 'sometimes|string|max:20',
            'address' => 'sometimes|string|max:255',
            'date_of_birth' => 'sometimes|date',
            'id_number' => 'sometimes|string|max:50',
            'company_name' => 'sometimes|string|max:255',
            'address_billing' => 'sometimes|string|max:255',
            'license_number' => 'sometimes|string|max:100',
            'ifu' => 'sometimes|string|max:50',
            'rccm' => 'sometimes|string|max:50',
            'vat_number' => 'sometimes|string|max:50',
        ]);

        // Mettre à jour le co-propriétaire
        $coOwner->update($validated);

        // Mettre à jour l'email utilisateur si fourni
        if ($request->has('email')) {
            $request->validate(['email' => 'required|email|unique:users,email,' . $user->id]);
            $user->update(['email' => $request->email]);
        }

        return response()->json([
            'message' => 'Profile updated successfully',
            'data' => $this->getProfile($request)->getData(true)
        ]);
    }

    /**
     * Récupérer les propriétés déléguées au co-propriétaire connecté
     */
    public function getDelegatedProperties(Request $request): JsonResponse
    {
        $user = $request->user();
        
        Log::info('CoOwnerMeController::getDelegatedProperties', [
            'user_id' => $user?->id,
            'user_email' => $user?->email,
            'user_roles' => $user?->roles,
            'is_co_owner' => $user?->isCoOwner(),
        ]);
        
        if (!$user) {
            return response()->json(['message' => 'User not authenticated'], 401);
        }
        
        if (!$user->isCoOwner()) {
            return response()->json(['message' => 'Forbidden - User is not a co-owner', 'user_roles' => $user->roles], 403);
        }

        $coOwner = $user->coOwner;
        if (!$coOwner) {
            return response()->json(['message' => 'Co-owner profile missing'], 422);
        }

        // Récupérer les délégations actives pour ce co-propriétaire
        $delegations = PropertyDelegation::where('co_owner_id', $coOwner->id)
            ->where('status', 'active')
            ->with('property')
            ->get();

        // Extraire les propriétés depuis les délégations
        $properties = $delegations->map(function ($delegation) use ($coOwner) {
            $property = $delegation->property;
            if (!$property) return null;

            // Vérifier si la propriété est louée
            $activeLease = Lease::where('property_id', $property->id)
                ->where('status', 'active')
                ->first();

            return [
                'id' => $property->id,
                'name' => $property->name,
                'address' => $property->address,
                'city' => $property->city,
                'postal_code' => $property->postal_code,
                'country' => $property->country,
                'rent_amount' => $property->rent_amount,
                'surface' => $property->surface,
                'property_type' => $property->property_type,
                'description' => $property->description,
                'photos' => $property->photos ?? [],
                'status' => $activeLease ? 'rented' : 'available',
                'created_at' => $property->created_at,
                'updated_at' => $property->updated_at,
                'landlord_id' => $property->landlord_id,
                'co_owner_id' => $coOwner->id,
                'delegation' => [
                    'id' => $delegation->id,
                    'status' => $delegation->status,
                    'permissions' => $delegation->permissions,
                    'expires_at' => $delegation->expires_at,
                ],
            ];
        })->filter()->values();

        return response()->json([
            'data' => $properties
        ]);
    }

    /**
     * Récupérer les baux du co-propriétaire
     */
    public function getLeases(Request $request): JsonResponse
    {
        $user = $request->user();
        
        if (!$user->isCoOwner()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $coOwner = $user->coOwner;
        if (!$coOwner) {
            return response()->json(['message' => 'Co-owner profile missing'], 422);
        }

        // Récupérer les propriétés déléguées
        $delegatedPropertyIds = PropertyDelegation::where('co_owner_id', $coOwner->id)
            ->where('status', 'active')
            ->pluck('property_id');

        // Récupérer les baux pour ces propriétés
        $leases = Lease::whereIn('property_id', $delegatedPropertyIds)
            ->with(['property', 'tenant'])
            ->get();

        $leasesData = $leases->map(function ($lease) {
            return [
                'id' => $lease->id,
                'property_id' => $lease->property_id,
                'tenant_id' => $lease->tenant_id,
                'rent_amount' => $lease->rent_amount,
                'deposit_amount' => $lease->deposit_amount,
                'start_date' => $lease->start_date,
                'end_date' => $lease->end_date,
                'status' => $lease->status,
                'created_at' => $lease->created_at,
                'updated_at' => $lease->updated_at,
                'property' => $lease->property,
                'tenant' => $lease->tenant,
            ];
        });

        return response()->json([
            'data' => $leasesData
        ]);
    }

    /**
     * Récupérer les quittances du co-propriétaire
     */
    public function getRentReceipts(Request $request): JsonResponse
    {
        $user = $request->user();
        
        if (!$user->isCoOwner()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $coOwner = $user->coOwner;
        if (!$coOwner) {
            return response()->json(['message' => 'Co-owner profile missing'], 422);
        }

        // Récupérer les propriétés déléguées
        $delegatedPropertyIds = PropertyDelegation::where('co_owner_id', $coOwner->id)
            ->where('status', 'active')
            ->pluck('property_id');

        // Récupérer les quittances pour ces propriétés
        $receipts = RentReceipt::whereIn('property_id', $delegatedPropertyIds)
            ->with(['lease', 'property'])
            ->orderBy('issued_date', 'desc')
            ->get();

        $receiptsData = $receipts->map(function ($receipt) {
            return [
                'id' => $receipt->id,
                'lease_id' => $receipt->lease_id,
                'paid_month' => $receipt->paid_month,
                'amount_paid' => $receipt->amount_paid,
                'payment_date' => $receipt->payment_date,
                'issued_date' => $receipt->issued_date,
                'status' => $receipt->status,
                'created_at' => $receipt->created_at,
                'lease' => $receipt->lease,
                'property' => $receipt->property,
            ];
        });

        return response()->json([
            'data' => $receiptsData
        ]);
    }

    /**
     * Récupérer les locataires du co-propriétaire
     */
    public function getTenants(Request $request): JsonResponse
    {
        $user = $request->user();
        
        if (!$user->isCoOwner()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $coOwner = $user->coOwner;
        if (!$coOwner) {
            return response()->json(['message' => 'Co-owner profile missing'], 422);
        }

        // Récupérer les propriétés déléguées
        $delegatedPropertyIds = PropertyDelegation::where('co_owner_id', $coOwner->id)
            ->where('status', 'active')
            ->pluck('property_id');

        // Récupérer les locataires pour ces propriétés
        $tenantIds = Lease::whereIn('property_id', $delegatedPropertyIds)
            ->where('status', 'active')
            ->pluck('tenant_id');

        $tenants = Tenant::whereIn('id', $tenantIds)->get();

        $tenantsData = $tenants->map(function ($tenant) {
            return [
                'id' => $tenant->id,
                'first_name' => $tenant->first_name,
                'last_name' => $tenant->last_name,
                'email' => $tenant->email,
                'phone' => $tenant->phone,
                'id_number' => $tenant->id_number,
                'address' => $tenant->address,
                'created_at' => $tenant->created_at,
                'updated_at' => $tenant->updated_at,
            ];
        });

        return response()->json([
            'data' => $tenantsData
        ]);
    }

    /**
     * Récupérer les notifications du co-propriétaire
     */
    public function getNotices(Request $request): JsonResponse
    {
        $user = $request->user();
        
        if (!$user->isCoOwner()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $coOwner = $user->coOwner;
        if (!$coOwner) {
            return response()->json(['message' => 'Co-owner profile missing'], 422);
        }

        // Récupérer les propriétés déléguées
        $delegatedPropertyIds = PropertyDelegation::where('co_owner_id', $coOwner->id)
            ->where('status', 'active')
            ->pluck('property_id');

        // Récupérer les notifications pour ces propriétés
        $notices = Notice::whereIn('property_id', $delegatedPropertyIds)
            ->with(['property', 'tenant'])
            ->orderBy('created_at', 'desc')
            ->get();

        $noticesData = $notices->map(function ($notice) {
            return [
                'id' => $notice->id,
                'property_id' => $notice->property_id,
                'tenant_id' => $notice->tenant_id,
                'type' => $notice->type,
                'title' => $notice->reason, // Utiliser 'reason' comme titre
                'description' => $notice->reason, // Utiliser 'reason' comme description
                'status' => $notice->status,
                'priority' => 'medium', // Champ par défaut
                'notice_date' => $notice->notice_date,
                'end_date' => $notice->end_date,
                'notes' => $notice->notes,
                'created_at' => $notice->created_at,
                'updated_at' => $notice->updated_at,
                'property' => $notice->property,
                'tenant' => $notice->tenant,
            ];
        });

        return response()->json([
            'data' => $noticesData
        ]);
    }

    /**
     * Récupérer les délégations du co-propriétaire
     */
    public function getDelegations(Request $request): JsonResponse
    {
        $user = $request->user();
        
        if (!$user->isCoOwner()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $coOwner = $user->coOwner;
        if (!$coOwner) {
            return response()->json(['message' => 'Co-owner profile missing'], 422);
        }

        $delegations = PropertyDelegation::where('co_owner_id', $coOwner->id)
            ->with(['property', 'landlord'])
            ->orderBy('created_at', 'desc')
            ->get();

        $delegationsData = $delegations->map(function ($delegation) {
            return [
                'id' => $delegation->id,
                'property_id' => $delegation->property_id,
                'co_owner_id' => $delegation->co_owner_id,
                'landlord_id' => $delegation->landlord_id,
                'status' => $delegation->status,
                'permissions' => $delegation->permissions,
                'created_at' => $delegation->created_at,
                'expires_at' => $delegation->expires_at,
                'property' => $delegation->property,
                'landlord' => $delegation->landlord,
            ];
        });

        return response()->json([
            'data' => $delegationsData
        ]);
    }

    /**
     * Mettre à jour une propriété déléguée
     */
    public function updateProperty(Request $request, $propertyId): JsonResponse
    {
        $user = $request->user();
        
        if (!$user->isCoOwner()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $coOwner = $user->coOwner;
        if (!$coOwner) {
            return response()->json(['message' => 'Co-owner profile missing'], 422);
        }

        // Vérifier que la propriété est bien déléguée à ce co-propriétaire
        $delegation = PropertyDelegation::where('co_owner_id', $coOwner->id)
            ->where('property_id', $propertyId)
            ->where('status', 'active')
            ->first();

        if (!$delegation) {
            return response()->json(['message' => 'Property not delegated to this co-owner'], 403);
        }

        // Vérifier que la propriété existe
        $property = Property::find($propertyId);
        if (!$property) {
            return response()->json(['message' => 'Property not found'], 404);
        }

        // Vérifier les permissions de modification
        if (!in_array('edit', $delegation->permissions ?? [])) {
            return response()->json(['message' => 'No permission to edit this property'], 403);
        }

        // Valider les données
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'address' => 'sometimes|string|max:255',
            'city' => 'sometimes|string|max:255',
            'postal_code' => 'sometimes|string|max:20',
            'country' => 'sometimes|string|max:255',
            'rent_amount' => 'sometimes|numeric|min:0',
            'surface' => 'sometimes|numeric|min:0',
            'type' => 'sometimes|string|max:255',
            'description' => 'sometimes|string|max:2000',
        ]);

        // Mettre à jour la propriété
        $property->update($validated);

        // Récupérer les données mises à jour
        $activeLease = Lease::where('property_id', $property->id)
            ->where('status', 'active')
            ->first();

        $propertyData = [
            'id' => $property->id,
            'name' => $property->name,
            'address' => $property->address,
            'city' => $property->city,
            'postal_code' => $property->zip_code,
            'country' => $property->country,
            'rent_amount' => $property->rent_amount,
            'surface' => $property->surface,
            'type' => $property->type,
            'description' => $property->description,
            'photos' => $property->photos ?? [],
            'status' => $activeLease ? 'rented' : 'available',
            'created_at' => $property->created_at,
            'updated_at' => $property->updated_at,
            'landlord_id' => $property->landlord_id,
            'co_owner_id' => $coOwner->id,
            'delegation' => [
                'id' => $delegation->id,
                'status' => $delegation->status,
                'permissions' => $delegation->permissions,
                'expires_at' => $delegation->expires_at,
            ],
        ];

        return response()->json([
            'data' => $propertyData
        ]);
    }

    /**
     * Accepter une délégation
     */
    public function acceptDelegation(Request $request, $delegationId): JsonResponse
    {
        $user = $request->user();
        
        if (!$user->isCoOwner()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $coOwner = $user->coOwner;
        if (!$coOwner) {
            return response()->json(['message' => 'Co-owner profile missing'], 422);
        }

        $delegation = PropertyDelegation::where('id', $delegationId)
            ->where('co_owner_id', $coOwner->id)
            ->first();

        if (!$delegation) {
            return response()->json(['message' => 'Délégation non trouvée'], 404);
        }

        if ($delegation->status !== 'pending') {
            return response()->json(['message' => 'Délégation non disponible'], 400);
        }

        $delegation->status = 'active';
        $delegation->save();

        Log::info('Co-owner accepted delegation', [
            'co_owner_id' => $coOwner->id,
            'delegation_id' => $delegationId,
            'property_id' => $delegation->property_id
        ]);

        return response()->json([
            'message' => 'Délégation acceptée avec succès',
            'data' => $delegation
        ]);
    }

    /**
     * Refuser une délégation
     */
    public function rejectDelegation(Request $request, $delegationId): JsonResponse
    {
        $user = $request->user();
        
        if (!$user->isCoOwner()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $coOwner = $user->coOwner;
        if (!$coOwner) {
            return response()->json(['message' => 'Co-owner profile missing'], 422);
        }

        $delegation = PropertyDelegation::where('id', $delegationId)
            ->where('co_owner_id', $coOwner->id)
            ->first();

        if (!$delegation) {
            return response()->json(['message' => 'Délégation non trouvée'], 404);
        }

        if ($delegation->status !== 'pending') {
            return response()->json(['message' => 'Délégation non disponible'], 400);
        }

        $delegation->status = 'revoked';
        $delegation->save();

        Log::info('Co-owner rejected delegation', [
            'co_owner_id' => $coOwner->id,
            'delegation_id' => $delegationId,
            'property_id' => $delegation->property_id,
            'reason' => $request->input('reason')
        ]);

        return response()->json([
            'message' => 'Délégation refusée'
        ]);
    }
}
