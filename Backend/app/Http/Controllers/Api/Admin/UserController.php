<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\Admin\UserResource;
use App\Models\User;
use App\Models\Property;
use App\Models\Lease;
use App\Models\Invoice;
use App\Models\MaintenanceRequest;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class UserController extends Controller
{
    /**
     * LISTE DES UTILISATEURS (ADMIN)
     */
    public function index(Request $request): JsonResponse
    {
        $query = User::query()->with([
            'roles',
            'landlord',
            'tenant',
            'agency',
        ]);

        /* ======================
         * FILTRE PAR TYPE MÉTIER
         * ====================== */
        if ($request->filled('type')) {
            match ($request->type) {
                'admin' =>
                    $query->whereHas('roles', fn ($q) => $q->where('name', 'admin')),

                'tenant' =>
                    $query->whereHas('roles', fn ($q) => $q->where('name', 'tenant')),

                'landlord' =>
                    $query->whereHas('roles', fn ($q) => $q->where('name', 'landlord'))
                          ->whereHas('landlord', fn ($q) => $q->where('owner_type', 'landlord')),

                'co_owner' =>
                    $query->whereHas('roles', fn ($q) => $q->where('name', 'landlord'))
                          ->whereHas('landlord', fn ($q) => $q->where('owner_type', 'co_owner')),

                'agency' =>
                    $query->whereHas('roles', fn ($q) => $q->where('name', 'agency')),

                default => null,
            };
        }

        /* ======================
         * RECHERCHE TRANSVERSE
         * ====================== */
        if ($request->filled('search')) {
            $search = $request->search;

            $query->where(function ($q) use ($search) {
                $q->where('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%")
                  ->orWhereHas('landlord', fn ($q) =>
                        $q->where('first_name', 'like', "%{$search}%")
                          ->orWhere('last_name', 'like', "%{$search}%")
                          ->orWhere('company_name', 'like', "%{$search}%"))
                  ->orWhereHas('tenant', fn ($q) =>
                        $q->where('first_name', 'like', "%{$search}%")
                          ->orWhere('last_name', 'like', "%{$search}%"))
                  ->orWhereHas('agency', fn ($q) =>
                        $q->where('company_name', 'like', "%{$search}%"));
            });
        }

        /* ======================
         * TRI & PAGINATION
         * ====================== */
        $sortable = ['created_at', 'email'];
        $sortBy = in_array($request->sort_by, $sortable) ? $request->sort_by : 'created_at';
        $sortOrder = $request->get('sort_order', 'desc');

        $users = $query
            ->orderBy($sortBy, $sortOrder)
            ->paginate($request->get('per_page', 15));

        return UserResource::collection($users)->response();
    }

    /**
     * DÉTAIL D’UN UTILISATEUR
     */
    public function show(User $user): JsonResponse
    {
        $user->load(['roles', 'landlord', 'tenant', 'agency']);

        return response()->json([
            'user'     => new UserResource($user),
            'summary'  => $this->buildSummary($user),
            'activity' => $this->buildActivity($user),
        ]);
    }

    /**
     * SYNTHÈSE MÉTIER (ADMIN)
     */
    private function buildSummary(User $user): array
    {
        /* ========= ADMIN ========= */
        if ($user->isAdmin()) {
            return ['role' => 'admin'];
        }

        /* ========= TENANT ========= */
        if ($user->isTenant() && $user->tenant) {
            return [
                'role' => 'tenant',
                'active_leases' => $user->tenant->leases()->where('status', 'active')->count(),
                'total_paid' => (float) Invoice::whereHas('lease', fn ($q) =>
                    $q->where('tenant_id', $user->tenant->id)
                )->where('status', 'paid')->sum('amount_paid'),
                'maintenance_requests' =>
                    MaintenanceRequest::where('tenant_id', $user->tenant->id)->count(),
            ];
        }

        /* ========= LANDLORD / CO-OWNER ========= */
        if ($user->isLandlord() && $user->landlord) {
            $landlord = $user->landlord;

            return [
                'role' => $landlord->isCoOwner() ? 'co_owner' : 'landlord',
                'properties' => $landlord->properties()->count(),
                'active_leases' => Lease::whereHas('property', fn ($q) =>
                    $q->where('landlord_id', $landlord->id)
                )->where('status', 'active')->count(),
                'total_revenue' => (float) Invoice::whereHas('lease.property', fn ($q) =>
                    $q->where('landlord_id', $landlord->id)
                )->where('status', 'paid')->sum('amount_paid'),
                'maintenance_requests' => MaintenanceRequest::whereHas('property', fn ($q) =>
                    $q->where('landlord_id', $landlord->id)
                )->count(),
            ];
        }

        /* ========= AGENCY ========= */
        if ($user->agency) {
            return [
                'role' => 'agency',
                'managed_properties' => $user->agency->managedProperties()->count(),
                'delegations' => $user->agency->delegations()->count(),
            ];
        }

        return [];
    }

    /**
     * ACTIVITÉ RÉCENTE (30 JOURS)
     */
    private function buildActivity(User $user): array
    {
        $activity = [];
        $since = now()->subDays(30);

        if ($user->isLandlord() && $user->landlord) {
            $newProperties = Property::where('landlord_id', $user->landlord->id)
                ->where('created_at', '>=', $since)->count();

            if ($newProperties > 0) {
                $activity[] = [
                    'type' => 'properties_added',
                    'count' => $newProperties,
                    'label' => "{$newProperties} bien(s) ajouté(s)",
                ];
            }
        }

        if ($user->isTenant() && $user->tenant) {
            $payments = Invoice::whereHas('lease', fn ($q) =>
                $q->where('tenant_id', $user->tenant->id)
            )->where('created_at', '>=', $since)->count();

            if ($payments > 0) {
                $activity[] = [
                    'type' => 'payments',
                    'count' => $payments,
                    'label' => "{$payments} paiement(s) effectué(s)",
                ];
            }
        }

        if ($user->last_activity_at) {
            $activity[] = [
                'type' => 'last_login',
                'date' => $user->last_activity_at->toISOString(),
                'label' => 'Dernière connexion',
            ];
        }

        return $activity;
    }

    /**
     * SUSPENDRE UN UTILISATEUR
     */
    public function suspend(User $user): JsonResponse
    {
        // Vérifier que l'utilisateur n'est pas déjà suspendu
        if ($user->status === 'suspended') {
            return response()->json([
                'message' => 'User is already suspended',
                'error' => 'already_suspended'
            ], 400);
        }

        // Vérifier qu'on ne peut pas suspendre un admin
        if ($user->isAdmin()) {
            return response()->json([
                'message' => 'Cannot suspend admin users',
                'error' => 'cannot_suspend_admin'
            ], 403);
        }

        // Mettre à jour le statut et enregistrer la suspension
        $user->update([
            'status' => 'suspended',
            'suspended_at' => now(),
            'suspended_by' => auth()->id(),
            'suspension_reason' => request('reason', 'Administrative suspension')
        ]);

        // Révoquer tous les tokens d'authentification
        $user->tokens()->delete();

        return response()->json([
            'message' => 'User suspended successfully',
            'user' => new UserResource($user)
        ]);
    }

    /**
     * RÉACTIVER UN UTILISATEUR
     */
    public function reactivate(User $user): JsonResponse
    {
        // Vérifier que l'utilisateur est bien suspendu
        if ($user->status !== 'suspended') {
            return response()->json([
                'message' => 'User is not suspended',
                'error' => 'not_suspended'
            ], 400);
        }

        // Mettre à jour le statut
        $user->update([
            'status' => 'active',
            'suspended_at' => null,
            'suspended_by' => null,
            'suspension_reason' => null
        ]);

        return response()->json([
            'message' => 'User reactivated successfully',
            'user' => new UserResource($user)
        ]);
    }

    /**
     * DÉSACTIVER UN UTILISATEUR
     */
    public function deactivate(User $user): JsonResponse
    {
        // Vérifier qu'on ne peut pas désactiver un admin
        if ($user->isAdmin()) {
            return response()->json([
                'message' => 'Cannot deactivate admin users',
                'error' => 'cannot_deactivate_admin'
            ], 403);
        }

        // Vérifier que l'utilisateur n'est pas déjà désactivé
        if ($user->status === 'deactivated') {
            return response()->json([
                'message' => 'User is already deactivated',
                'error' => 'already_deactivated'
            ], 400);
        }

        // Mettre à jour le statut
        $user->update([
            'status' => 'deactivated',
            'deactivated_at' => now(),
            'deactivated_by' => auth()->id(),
            'deactivation_reason' => request('reason', 'Administrative deactivation')
        ]);

        // Révoquer tous les tokens d'authentification
        $user->tokens()->delete();

        return response()->json([
            'message' => 'User deactivated successfully',
            'user' => new UserResource($user)
        ]);
    }

    /**
     * IMPOSSONNER UN UTILISATEUR
     */
    public function impersonate(User $user): JsonResponse
    {
        // Vérifier que l'utilisateur n'est pas suspendu/désactivé
        if (in_array($user->status, ['suspended', 'deactivated'])) {
            return response()->json([
                'message' => 'Cannot impersonate suspended or deactivated users',
                'error' => 'cannot_impersonate'
            ], 403);
        }

        // Vérifier qu'on ne peut pas impersonner un admin
        if ($user->isAdmin()) {
            return response()->json([
                'message' => 'Cannot impersonate admin users',
                'error' => 'cannot_impersonate_admin'
            ], 403);
        }

        // Créer un token d'impersonation
        $token = $user->createToken('impersonation', [
            'impersonated_by' => auth()->id(),
            'impersonated_at' => now()->toISOString()
        ]);

        return response()->json([
            'message' => 'Impersonation successful',
            'token' => $token->plainTextToken,
            'user' => new UserResource($user),
            'expires_at' => $token->accessToken->expires_at
        ]);
    }

    /**
     * SUPPRIMER UN UTILISATEUR
     */
    public function destroy(User $user): JsonResponse
    {
        // Vérifier qu'on ne peut pas supprimer un admin
        if ($user->isAdmin()) {
            return response()->json([
                'message' => 'Cannot delete admin users',
                'error' => 'cannot_delete_admin'
            ], 403);
        }

        // Vérifier les dépendances avant suppression
        $dependencies = [];

        if ($user->isLandlord() && $user->landlord) {
            $propertiesCount = $user->landlord->properties()->count();
            if ($propertiesCount > 0) {
                $dependencies[] = "{$propertiesCount} properties";
            }
        }

        if ($user->isTenant() && $user->tenant) {
            $leasesCount = $user->tenant->leases()->count();
            if ($leasesCount > 0) {
                $dependencies[] = "{$leasesCount} active leases";
            }
        }

        if (!empty($dependencies)) {
            return response()->json([
                'message' => 'Cannot delete user with active dependencies',
                'error' => 'has_dependencies',
                'dependencies' => $dependencies
            ], 400);
        }

        // Soft delete
        $user->delete();

        return response()->json([
            'message' => 'User deleted successfully'
        ]);
    }
}
