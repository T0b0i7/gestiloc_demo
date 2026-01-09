<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Landlord;
use App\Models\Tenant;
use App\Models\Property;
use App\Models\Lease;
use App\Models\MaintenanceRequest;
use App\Models\Invoice;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Carbon\Carbon;

class UserController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = User::with(['landlord', 'tenant', 'suspendedByAdmin', 'deactivatedByAdmin'])
            ->withCount(['properties', 'leases']);

        // Filtres
        if ($request->filled('role')) {
            $query->role($request->role);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('online')) {
            $isOnline = $request->boolean('online');
            if ($isOnline) {
                $query->where('last_activity_at', '>=', now()->subMinutes(5));
            } else {
                $query->where(function($q) {
                    $q->whereNull('last_activity_at')
                      ->orWhere('last_activity_at', '<', now()->subMinutes(5));
                });
            }
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%")
                  ->orWhereHas('landlord', function($subQ) use ($search) {
                      $subQ->where('first_name', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%")
                        ->orWhere('company_name', 'like', "%{$search}%");
                  })
                  ->orWhereHas('tenant', function($subQ) use ($search) {
                      $subQ->where('first_name', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%");
                  });
            });
        }

        // Tri
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        
        if (in_array($sortBy, ['email', 'last_activity_at', 'created_at', 'status'])) {
            $query->orderBy($sortBy, $sortOrder);
        }

        $users = $query->paginate($request->get('per_page', 15));

        return response()->json([
            'data' => $users->items(),
            'meta' => [
                'current_page' => $users->currentPage(),
                'last_page' => $users->lastPage(),
                'per_page' => $users->perPage(),
                'total' => $users->total(),
            ],
        ]);
    }

    public function show(User $user): JsonResponse
    {
        $user->load([
            'landlord',
            'tenant', 
            'suspendedByAdmin:id,email',
            'deactivatedByAdmin:id,email'
        ]);

        $data = [
            'user' => $user,
            'summary' => $this->getUserSummary($user),
            'activity' => $this->getUserActivity($user),
        ];

        return response()->json($data);
    }

    private function getUserSummary(User $user): array
    {
        $summary = [
            'role' => null,
            'properties_count' => 0,
            'active_leases_count' => 0,
            'total_revenue' => 0,
            'maintenance_requests_count' => 0,
        ];

        if ($user->isLandlord()) {
            $summary['role'] = 'landlord';
            $landlord = $user->landlord;
            
            if ($landlord) {
                $summary['properties_count'] = $landlord->properties()->count();
                
                $activeLeases = Lease::whereHas('property', function($q) use ($landlord) {
                    $q->where('landlord_id', $landlord->id);
                })->where('status', 'active')->count();
                
                $summary['active_leases_count'] = $activeLeases;
                
                // Revenus totaux (factures payées)
                $totalRevenue = Invoice::whereHas('lease.property', function($q) use ($landlord) {
                    $q->where('landlord_id', $landlord->id);
                })->where('status', 'paid')->sum('amount_paid');
                
                $summary['total_revenue'] = (float) $totalRevenue;
                
                // Tickets maintenance
                $summary['maintenance_requests_count'] = MaintenanceRequest::whereHas('property', function($q) use ($landlord) {
                    $q->where('landlord_id', $landlord->id);
                })->count();
            }
        } elseif ($user->isTenant()) {
            $summary['role'] = 'tenant';
            $tenant = $user->tenant;
            
            if ($tenant) {
                $summary['active_leases_count'] = $tenant->leases()->where('status', 'active')->count();
                
                // Revenus payés par ce locataire
                $totalRevenue = Invoice::whereHas('lease', function($q) use ($tenant) {
                    $q->where('tenant_id', $tenant->id);
                })->where('status', 'paid')->sum('amount_paid');
                
                $summary['total_revenue'] = (float) $totalRevenue;
                
                // Tickets maintenance créés par ce locataire
                $summary['maintenance_requests_count'] = MaintenanceRequest::where('tenant_id', $tenant->id)->count();
            }
        } elseif ($user->isAdmin()) {
            $summary['role'] = 'admin';
        }

        return $summary;
    }

    private function getUserActivity(User $user): array
    {
        $activity = [];

        // Activité récente (derniers 30 jours)
        $thirtyDaysAgo = now()->subDays(30);

        if ($user->isLandlord() && $user->landlord) {
            // Nouveaux biens
            $newProperties = Property::where('landlord_id', $user->landlord->id)
                ->where('created_at', '>=', $thirtyDaysAgo)
                ->count();
            
            if ($newProperties > 0) {
                $activity[] = [
                    'type' => 'properties_added',
                    'count' => $newProperties,
                    'period' => '30_days',
                    'label' => "{$newProperties} bien(s) ajouté(s)"
                ];
            }

            // Nouveaux baux
            $newLeases = Lease::whereHas('property', function($q) use ($user) {
                $q->where('landlord_id', $user->landlord->id);
            })->where('created_at', '>=', $thirtyDaysAgo)->count();
            
            if ($newLeases > 0) {
                $activity[] = [
                    'type' => 'leases_created',
                    'count' => $newLeases,
                    'period' => '30_days',
                    'label' => "{$newLeases} bail(aux) créé(s)"
                ];
            }
        }

        // Dernière connexion
        if ($user->last_activity_at) {
            $activity[] = [
                'type' => 'last_login',
                'date' => $user->last_activity_at->toISOString(),
                'label' => 'Dernière connexion: ' . $user->last_activity_at->format('d/m/Y H:i')
            ];
        }

        return $activity;
    }

    public function suspend(Request $request, User $user): JsonResponse
    {
        $request->validate([
            'reason' => 'required|string|max:500',
        ]);

        if ($user->isAdmin()) {
            return response()->json([
                'message' => 'Impossible de suspendre un compte administrateur'
            ], 403);
        }

        if ($user->isSuspended()) {
            return response()->json([
                'message' => 'Ce compte est déjà suspendu'
            ], 422);
        }

        $user->suspend($request->reason, $request->user());

        return response()->json([
            'message' => 'Compte suspendu avec succès',
            'user' => $user->fresh(['suspendedByAdmin:id,email'])
        ]);
    }

    public function reactivate(Request $request, User $user): JsonResponse
    {
        if (!$user->isSuspended()) {
            return response()->json([
                'message' => 'Ce compte n\'est pas suspendu'
            ], 422);
        }

        $user->reactivate($request->user());

        return response()->json([
            'message' => 'Compte réactivé avec succès',
            'user' => $user->fresh()
        ]);
    }

    public function deactivate(Request $request, User $user): JsonResponse
    {
        $request->validate([
            'reason' => 'required|string|max:500',
        ]);

        if ($user->isAdmin()) {
            return response()->json([
                'message' => 'Impossible de désactiver un compte administrateur'
            ], 403);
        }

        if ($user->isDeactivated()) {
            return response()->json([
                'message' => 'Ce compte est déjà désactivé'
            ], 422);
        }

        $user->deactivate($request->reason, $request->user());

        return response()->json([
            'message' => 'Compte désactivé avec succès',
            'user' => $user->fresh(['deactivatedByAdmin:id,email'])
        ]);
    }

    public function impersonate(User $user): JsonResponse
    {
        if ($user->isAdmin()) {
            return response()->json([
                'message' => 'Impossible d\'impersonner un administrateur'
            ], 403);
        }

        if (!$user->isActive()) {
            return response()->json([
                'message' => 'Impossible d\'impersonner un compte non actif'
            ], 403);
        }

        // Créer un token d'impersonnation
        $token = $user->createToken('admin-impersonation', ['*'], now()->addHours(1));

        return response()->json([
            'message' => 'Impersonnation démarrée',
            'token' => $token->plainTextToken,
            'user' => $user,
            'expires_at' => $token->accessToken->expires_at
        ]);
    }

    public function getOnlineStats(): JsonResponse
    {
        $totalUsers = User::count();
        $onlineUsers = User::where('last_activity_at', '>=', now()->subMinutes(5))->count();
        $offlineUsers = $totalUsers - $onlineUsers;

        // Par rôle
        $onlineByRole = User::where('last_activity_at', '>=', now()->subMinutes(5))
            ->with('roles')
            ->get()
            ->groupBy(function($user) {
                return $user->getRoleNames()->first() ?? 'unknown';
            })
            ->map(function($group) {
                return $group->count();
            });

        return response()->json([
            'total_users' => $totalUsers,
            'online_users' => $onlineUsers,
            'offline_users' => $offlineUsers,
            'online_percentage' => $totalUsers > 0 ? round(($onlineUsers / $totalUsers) * 100, 1) : 0,
            'online_by_role' => $onlineByRole,
            'updated_at' => now()->toISOString()
        ]);
    }
}
