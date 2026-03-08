<?php

namespace App\Http\Controllers\CoOwner;

use App\Http\Controllers\Controller;
use App\Models\CoOwner;
use App\Models\PropertyDelegation;
use App\Models\Property;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Carbon\Carbon;
use Laravel\Sanctum\PersonalAccessToken;

class CoOwnerManagementController extends Controller
{
    /**
     * Méthode utilitaire pour récupérer l'utilisateur authentifié
     */
    private function getAuthenticatedUser(Request $request)
    {
        Log::info('=== CoOwnerManagementController::getAuthenticatedUser ===', [
            'has_bearer' => $request->bearerToken() ? 'oui' : 'non',
            'has_api_token' => $request->has('api_token') ? 'oui' : 'non',
            'api_token' => $request->get('api_token'),
            'auth_check' => auth()->check() ? 'oui' : 'non',
            'url' => $request->fullUrl()
        ]);

        if ($request->bearerToken()) {
            $token = $request->bearerToken();
            $sanctumToken = PersonalAccessToken::findToken($token);
            if ($sanctumToken) {
                $user = $sanctumToken->tokenable;
                auth('web')->login($user);
                Log::info('✅ Authentifié via Bearer', ['user_id' => $user->id]);
                return $user;
            }
        }

        if ($request->has('api_token')) {
            $token = $request->get('api_token');
            $sanctumToken = PersonalAccessToken::findToken($token);
            if ($sanctumToken) {
                $user = $sanctumToken->tokenable;
                auth('web')->login($user);
                Log::info('✅ Authentifié via api_token', ['user_id' => $user->id, 'token' => substr($token, 0, 10) . '...']);
                return $user;
            }
        }

        if (auth()->check()) {
            Log::info('✅ Authentifié via session web', ['user_id' => auth()->id()]);
            return auth()->user();
        }

        Log::warning('❌ Aucune authentification trouvée');
        return null;
    }

    /**
     * Afficher la liste des co-propriétaires et agences
     */
    public function index(Request $request)
    {
        Log::info('=== CoOwnerManagementController::index ===', [
            'url' => $request->fullUrl(),
            'method' => $request->method(),
            'api_token' => $request->get('api_token')
        ]);

        $user = $this->getAuthenticatedUser($request);

        if (!$user) {
            $apiToken = $request->get('api_token');
            if ($apiToken) {
                return redirect('http://localhost:8000/login?api_token=' . $apiToken);
            }
            return redirect('http://localhost:8000/login');
        }

        if (!$user->hasRole(['landlord', 'co_owner'])) {
            Log::warning('Utilisateur non autorisé', [
                'user_id' => $user->id,
                'roles' => $user->getRoleNames()
            ]);

            return view('errors.unauthorized', [
                'message' => 'Vous devez être propriétaire ou co-propriétaire pour accéder à cette page.'
            ]);
        }

        // Récupérer le co_owner_id de l'utilisateur connecté s'il est co_owner
        $currentCoOwner = null;
        if ($user->hasRole('co_owner')) {
            $currentCoOwner = CoOwner::where('user_id', $user->id)->first();
        }

        $search = $request->get('search');
        $type = $request->get('type', 'all');
        $status = $request->get('status', 'all');

        // Récupérer les IDs des co-propriétaires que CET utilisateur a invités
        $invitedCoOwnerIds = DB::table('co_owner_invitations')
            ->where('invited_by_id', $user->id)
            ->whereNotNull('accepted_at')
            ->whereNotNull('co_owner_user_id')
            ->pluck('co_owner_user_id')
            ->toArray();

        Log::info('IDs invités par l\'utilisateur (via invitations)', [
            'user_id' => $user->id,
            'invited_ids' => $invitedCoOwnerIds,
            'current_co_owner_id' => $currentCoOwner ? $currentCoOwner->id : null
        ]);

        // Construire la requête pour les co-propriétaires
        $coOwnersQuery = CoOwner::with(['user', 'delegations' => function($q) {
                $q->with('property');
            }])
            ->whereHas('user', function($q) {
                $q->whereHas('roles', function($r) {
                    $r->where('name', 'co_owner');
                });
            });

        // Filtrer selon le rôle de l'utilisateur
        if ($user->hasRole('landlord')) {
            $coOwnersQuery->where(function($query) use ($user, $invitedCoOwnerIds) {
                $query->where('landlord_id', $user->id);

                if (!empty($invitedCoOwnerIds)) {
                    $query->orWhereIn('id', $invitedCoOwnerIds);
                }
            });
        } else {
            if ($currentCoOwner) {
                $landlordId = $currentCoOwner->landlord_id;

                Log::info('Co_owner connecté', [
                    'co_owner_id' => $currentCoOwner->id,
                    'landlord_id' => $landlordId
                ]);

                $coOwnersQuery->where(function($query) use ($invitedCoOwnerIds, $landlordId, $currentCoOwner) {
                    $query->where('landlord_id', $landlordId);

                    if (!empty($invitedCoOwnerIds)) {
                        $query->orWhereIn('id', $invitedCoOwnerIds);
                    }
                });

                $coOwnersQuery->where('id', '!=', $currentCoOwner->id);
            } else {
                $coOwnersQuery->where(function($query) use ($invitedCoOwnerIds) {
                    if (!empty($invitedCoOwnerIds)) {
                        $query->whereIn('id', $invitedCoOwnerIds);
                    } else {
                        $query->whereRaw('1 = 0');
                    }
                });
            }
        }

        // Filtrer par recherche
        if ($search) {
            $coOwnersQuery->where(function($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhereHas('user', function($uq) use ($search) {
                      $uq->where('email', 'like', "%{$search}%");
                  })
                  ->orWhere('company_name', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        // Filtre par type
        if ($type !== 'all') {
            if ($type === 'agency') {
                $coOwnersQuery->where('is_professional', true)
                              ->where('co_owner_type', 'agency');
            } else {
                $coOwnersQuery->where('is_professional', false)
                              ->where('co_owner_type', 'simple');
            }
        }

        // Filtre par statut
        if ($status !== 'all') {
            $coOwnersQuery->where('status', $status);
        }

        $coOwners = $coOwnersQuery->orderBy('created_at', 'desc')->paginate(10);

        // Invitations en attente
        $invitations = DB::table('co_owner_invitations')
            ->where('invited_by_id', $user->id)
            ->where('target_type', 'co_owner')
            ->where('accepted_at', null)
            ->where('expires_at', '>', Carbon::now())
            ->orderBy('created_at', 'desc')
            ->get();

        // Statistiques
        $visibleCoOwnerIds = $coOwners->pluck('id')->toArray();

        $stats = [
            'total' => count($visibleCoOwnerIds),
            'co_owners' => 0,
            'agencies' => 0,
            'delegations_total' => 0,
        ];

        if (!empty($visibleCoOwnerIds)) {
            $stats['co_owners'] = CoOwner::whereIn('id', $visibleCoOwnerIds)
                ->where('is_professional', false)
                ->count();
            $stats['agencies'] = CoOwner::whereIn('id', $visibleCoOwnerIds)
                ->where('is_professional', true)
                ->count();
            $stats['delegations_total'] = PropertyDelegation::whereIn('co_owner_id', $visibleCoOwnerIds)
                ->count();
        }

        Log::info('✅ Données chargées', [
            'co_owners_count' => $coOwners->total(),
            'invitations_count' => $invitations->count(),
            'user_id' => $user->id,
            'user_role' => $user->getRoleNames(),
            'visible_ids' => $visibleCoOwnerIds,
            'current_co_owner_excluded' => $currentCoOwner ? $currentCoOwner->id : null
        ]);

        return view('co-owner.management.index', compact('coOwners', 'invitations', 'stats', 'search', 'type', 'status'));
    }

/**
 * Afficher les détails d'un co-propriétaire avec formulaire de délégation
 */
public function show(Request $request, $id)
{
    Log::info('=== CoOwnerManagementController::show ===', [
        'id' => $id,
        'url' => $request->fullUrl()
    ]);

    $user = $this->getAuthenticatedUser($request);

    if (!$user) {
        $apiToken = $request->get('api_token');
        if ($apiToken) {
            return redirect('http://localhost:8000/login?api_token=' . $apiToken);
        }
        return redirect('http://localhost:8000/login');
    }

    if (!$user->hasRole(['landlord', 'co_owner'])) {
        return view('errors.unauthorized', [
            'message' => 'Vous devez être propriétaire ou co-propriétaire pour accéder à cette page.'
        ]);
    }

    $currentCoOwner = null;
    if ($user->hasRole('co_owner')) {
        $currentCoOwner = CoOwner::where('user_id', $user->id)->first();

        if ($currentCoOwner && $currentCoOwner->id == $id) {
            abort(403, 'Vous ne pouvez pas voir votre propre profil ici.');
        }
    }

    $coOwner = CoOwner::with(['user', 'delegations' => function($q) {
            $q->with(['property', 'landlord'])
              ->orderBy('created_at', 'desc');
        }])
        ->where(function($query) use ($user, $id, $currentCoOwner) {
            if ($user->hasRole('landlord')) {
                $query->where('id', $id)
                      ->where(function($q) use ($user) {
                          $q->where('landlord_id', $user->id)
                            ->orWhereIn('id', function($sub) use ($user) {
                                $sub->select('co_owner_user_id')
                                    ->from('co_owner_invitations')
                                    ->where('invited_by_id', $user->id)
                                    ->whereNotNull('accepted_at');
                            });
                      });
            } else {
                $query->where('id', $id)
                      ->where(function($q) use ($currentCoOwner, $user) {
                          if ($currentCoOwner) {
                              $q->where('landlord_id', $currentCoOwner->landlord_id)
                                ->orWhereIn('id', function($sub) use ($user) {
                                    $sub->select('co_owner_user_id')
                                        ->from('co_owner_invitations')
                                        ->where('invited_by_id', $user->id)
                                        ->whereNotNull('accepted_at');
                                });
                          }
                      });
            }
        })
        ->first();

    if (!$coOwner) {
        abort(403, 'Vous n\'êtes pas autorisé à voir ce co-propriétaire.');
    }

    // Récupérer les propriétés disponibles pour délégation
    $availableProperties = [];

    if ($user->hasRole('landlord')) {
        // Pour un landlord: tous ses biens non délégués
        $availableProperties = Property::where('landlord_id', $user->id)
            ->whereDoesntHave('delegations', function($q) {
                $q->where('status', 'active');
            })
            ->get();
    } else {
        // Pour un co_owner: les biens qu'il peut déléguer
        if ($currentCoOwner) {
            Log::info('Recherche des biens disponibles pour co_owner', [
                'current_co_owner_id' => $currentCoOwner->id,
                'target_co_owner_id' => $coOwner->id,
                'landlord_id' => $currentCoOwner->landlord_id
            ]);

            // Récupérer les IDs des biens déjà délégués À CE CO-PROPRIÉTAIRE CIBLE
            $delegatedToTargetIds = PropertyDelegation::where('co_owner_id', $coOwner->id)
                ->where('status', 'active')
                ->pluck('property_id')
                ->toArray();

            Log::info('Biens déjà délégués à la cible', [
                'ids' => $delegatedToTargetIds
            ]);

            // Biens que ce co_owner peut déléguer:
            $availableProperties = Property::where('landlord_id', $currentCoOwner->landlord_id)
                ->where(function($query) use ($currentCoOwner) {
                    // Biens créés par ce co_owner
                    $query->whereJsonContains('meta->created_by_co_owner', $currentCoOwner->id)
                          // Biens délégués à ce co_owner avec permission de déléguer
                          ->orWhereHas('delegations', function($q) use ($currentCoOwner) {
                              $q->where('co_owner_id', $currentCoOwner->id)
                                ->where('status', 'active')
                                ->where(function($perm) {
                                    $perm->whereJsonContains('permissions', 'manage_delegations')
                                         ->orWhereJsonContains('permissions', 'edit');
                                });
                          });
                })
                // Exclure les biens déjà délégués À LA CIBLE
                ->whereNotIn('id', $delegatedToTargetIds)
                ->get();

            Log::info('Biens disponibles trouvés', [
                'count' => $availableProperties->count(),
                'ids' => $availableProperties->pluck('id')->toArray()
            ]);
        }
    }

    $delegationsHistory = PropertyDelegation::with(['property'])
        ->where('co_owner_id', $coOwner->id)
        ->orderBy('created_at', 'desc')
        ->get();

    // Liste des permissions disponibles
    $availablePermissions = [
        'view' => 'Voir le bien',
        'edit' => 'Modifier le bien',
        'manage_lease' => 'Gérer les baux',
        'collect_rent' => 'Collecter les loyers',
        'manage_maintenance' => 'Gérer la maintenance',
        'send_invoices' => 'Envoyer les factures',
        'manage_tenants' => 'Gérer les locataires',
        'view_documents' => 'Voir les documents',
        'manage_delegations' => 'Gérer les délégations'
    ];

    return view('co-owner.management.show', compact('coOwner', 'availableProperties', 'delegationsHistory', 'availablePermissions'));
}

    /**
     * Afficher le formulaire d'invitation
     */
    public function create(Request $request)
    {
        Log::info('=== CoOwnerManagementController::create ===', [
            'url' => $request->fullUrl()
        ]);

        $user = $this->getAuthenticatedUser($request);

        if (!$user) {
            $apiToken = $request->get('api_token');
            if ($apiToken) {
                return redirect('http://localhost:8000/login?api_token=' . $apiToken);
            }
            return redirect('http://localhost:8000/login');
        }

        if (!$user->hasRole(['landlord', 'co_owner'])) {
            return view('errors.unauthorized', [
                'message' => 'Vous devez être propriétaire ou co-propriétaire pour accéder à cette page.'
            ]);
        }

        return view('co-owner.management.create');
    }

/**
 * Envoyer une invitation
 */
public function invite(Request $request)
{
    Log::info('=== CoOwnerManagementController::invite ===', [
        'data' => $request->except(['api_token', '_token'])
    ]);

    $user = $this->getAuthenticatedUser($request);

    if (!$user) {
        if ($request->wantsJson()) {
            return response()->json(['success' => false, 'message' => 'Non authentifié'], 401);
        }
        $apiToken = $request->get('api_token');
        if ($apiToken) {
            return redirect('http://localhost:8000/login?api_token=' . $apiToken);
        }
        return redirect('http://localhost:8000/login');
    }

    if (!$user->hasRole(['landlord', 'co_owner'])) {
        if ($request->wantsJson()) {
            return response()->json(['success' => false, 'message' => 'Accès non autorisé'], 403);
        }
        return view('errors.unauthorized', [
            'message' => 'Vous devez être propriétaire ou co-propriétaire pour accéder à cette page.'
        ]);
    }

    if ($request->invitation_type === 'agency') {
        $validated = $request->validate([
            'email' => 'required|email',
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'company_name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:20',
            'ifu' => 'required|string|max:50',
            'rccm' => 'required|string|max:50',
            'vat_number' => 'nullable|string|max:50',
            'address_billing' => 'nullable|string|max:255',
        ]);
    } else {
        $validated = $request->validate([
            'email' => 'required|email',
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:20',
        ]);
    }

    // ✅ VÉRIFICATION DE L'EMAIL - DOIT ÊTRE UNIQUE
    // 1. Vérifier dans la table users (toujours sûre)
    $existingUser = User::where('email', $validated['email'])->first();
    if ($existingUser) {
        if ($existingUser->id == $user->id) {
            $errorMessage = 'Vous ne pouvez pas vous inviter vous-même.';
            if ($request->wantsJson()) {
                return response()->json(['success' => false, 'message' => $errorMessage], 422);
            }
            return back()->with('error', $errorMessage)->withInput();
        }

        $errorMessage = 'Cet email est déjà utilisé.';
        if ($request->wantsJson()) {
            return response()->json(['success' => false, 'message' => $errorMessage], 422);
        }
        return back()->with('error', $errorMessage)->withInput();
    }

    // 2. Vérifier dans la table co_owner_invitations
    $existingInvitation = DB::table('co_owner_invitations')
        ->where('email', $validated['email'])
        ->first();

    if ($existingInvitation) {
        if ($existingInvitation->accepted_at) {
            $errorMessage = 'Cet email a déjà été utilisé.';
            if ($request->wantsJson()) {
                return response()->json(['success' => false, 'message' => $errorMessage], 422);
            }
            return back()->with('error', $errorMessage)->withInput();
        }

        if (!$existingInvitation->accepted_at && Carbon::parse($existingInvitation->expires_at) > Carbon::now()) {
            $errorMessage = 'Une invitation est déjà en attente pour cet email.';
            if ($request->wantsJson()) {
                return response()->json(['success' => false, 'message' => $errorMessage], 422);
            }
            return back()->with('error', $errorMessage)->withInput();
        }

        DB::table('co_owner_invitations')
            ->where('id', $existingInvitation->id)
            ->delete();
    }

    // 3. Vérifier dans co_owners via la relation avec users (sûr)
    try {
        $existingCoOwner = CoOwner::whereHas('user', function($q) use ($validated) {
            $q->where('email', $validated['email']);
        })->first();

        if ($existingCoOwner) {
            $errorMessage = 'Cet email est déjà utilisé.';
            if ($request->wantsJson()) {
                return response()->json(['success' => false, 'message' => $errorMessage], 422);
            }
            return back()->with('error', $errorMessage)->withInput();
        }
    } catch (\Exception $e) {
        // Ignorer l'erreur, la table ou la colonne n'existe peut-être pas
        Log::warning('Erreur lors de la vérification dans co_owners', ['error' => $e->getMessage()]);
    }

    // 4. Vérifier dans landlords (ignore si erreur)
    try {
        $existingLandlord = DB::table('landlords')->where('email', $validated['email'])->first();
        if ($existingLandlord) {
            $errorMessage = 'Cet email est déjà utilisé.';
            if ($request->wantsJson()) {
                return response()->json(['success' => false, 'message' => $errorMessage], 422);
            }
            return back()->with('error', $errorMessage)->withInput();
        }
    } catch (\Exception $e) {
        // Ignorer l'erreur, la colonne 'email' n'existe probablement pas dans landlords
        Log::warning('Colonne email manquante dans landlords', ['error' => $e->getMessage()]);
    }

    // 5. Vérifier dans tenants (ignore si erreur)
    try {
        $existingTenant = DB::table('tenants')->where('email', $validated['email'])->first();
        if ($existingTenant) {
            $errorMessage = 'Cet email est déjà utilisé.';
            if ($request->wantsJson()) {
                return response()->json(['success' => false, 'message' => $errorMessage], 422);
            }
            return back()->with('error', $errorMessage)->withInput();
        }
    } catch (\Exception $e) {
        // Ignorer l'erreur, la colonne 'email' n'existe probablement pas dans tenants
        Log::warning('Colonne email manquante dans tenants', ['error' => $e->getMessage()]);
    }

    // ✅ VÉRIFICATION DU TÉLÉPHONE - DOIT ÊTRE UNIQUE (si fourni)
    if (!empty($validated['phone'])) {
        // 1. Vérifier dans users
        try {
            $existingUserPhone = User::where('phone', $validated['phone'])->first();
            if ($existingUserPhone) {
                $errorMessage = 'Ce numéro de téléphone est déjà utilisé.';
                if ($request->wantsJson()) {
                    return response()->json(['success' => false, 'message' => $errorMessage], 422);
                }
                return back()->with('error', $errorMessage)->withInput();
            }
        } catch (\Exception $e) {
            Log::warning('Erreur lors de la vérification téléphone dans users', ['error' => $e->getMessage()]);
        }

        // 2. Vérifier dans co_owners
        try {
            $existingCoOwnerPhone = CoOwner::where('phone', $validated['phone'])->first();
            if ($existingCoOwnerPhone) {
                $errorMessage = 'Ce numéro de téléphone est déjà utilisé.';
                if ($request->wantsJson()) {
                    return response()->json(['success' => false, 'message' => $errorMessage], 422);
                }
                return back()->with('error', $errorMessage)->withInput();
            }
        } catch (\Exception $e) {
            Log::warning('Erreur lors de la vérification téléphone dans co_owners', ['error' => $e->getMessage()]);
        }

        // 3. Vérifier dans landlords (ignore si erreur)
        try {
            $existingLandlordPhone = DB::table('landlords')->where('phone', $validated['phone'])->first();
            if ($existingLandlordPhone) {
                $errorMessage = 'Ce numéro de téléphone est déjà utilisé.';
                if ($request->wantsJson()) {
                    return response()->json(['success' => false, 'message' => $errorMessage], 422);
                }
                return back()->with('error', $errorMessage)->withInput();
            }
        } catch (\Exception $e) {
            Log::warning('Erreur lors de la vérification téléphone dans landlords', ['error' => $e->getMessage()]);
        }

        // 4. Vérifier dans tenants (ignore si erreur)
        try {
            $existingTenantPhone = DB::table('tenants')->where('phone', $validated['phone'])->first();
            if ($existingTenantPhone) {
                $errorMessage = 'Ce numéro de téléphone est déjà utilisé.';
                if ($request->wantsJson()) {
                    return response()->json(['success' => false, 'message' => $errorMessage], 422);
                }
                return back()->with('error', $errorMessage)->withInput();
            }
        } catch (\Exception $e) {
            Log::warning('Erreur lors de la vérification téléphone dans tenants', ['error' => $e->getMessage()]);
        }

        // 5. Vérifier dans les invitations (métadonnées)
        try {
            $invitationsWithPhone = DB::table('co_owner_invitations')
                ->where('accepted_at', null)
                ->where('expires_at', '>', Carbon::now())
                ->get();

            foreach ($invitationsWithPhone as $inv) {
                $invMeta = json_decode($inv->meta, true);
                if (isset($invMeta['phone']) && $invMeta['phone'] === $validated['phone']) {
                    $errorMessage = 'Ce numéro de téléphone est déjà utilisé dans une invitation en attente.';
                    if ($request->wantsJson()) {
                        return response()->json(['success' => false, 'message' => $errorMessage], 422);
                    }
                    return back()->with('error', $errorMessage)->withInput();
                }
            }
        } catch (\Exception $e) {
            Log::warning('Erreur lors de la vérification téléphone dans invitations', ['error' => $e->getMessage()]);
        }
    }

    try {
        DB::beginTransaction();

        $coOwnerId = null;
        $landlordId = null;

        if ($user->hasRole('landlord')) {
            $landlordId = $user->id;
        } else {
            $coOwner = CoOwner::where('user_id', $user->id)->first();
            if ($coOwner) {
                $coOwnerId = $coOwner->id;
                $landlordId = $coOwner->landlord_id;
            }
        }

        $token = Str::random(64);

        $meta = [
            'first_name' => $validated['first_name'],
            'last_name' => $validated['last_name'],
            'phone' => $validated['phone'] ?? null,
            'invitation_type' => $request->invitation_type,
            'is_professional' => $request->invitation_type === 'agency',
            'invited_by_role' => $user->hasRole('landlord') ? 'landlord' : 'co_owner',
            'co_owner_id' => $coOwnerId,
            'invited_by_name' => $user->name ?? $user->email,
        ];

        if ($request->invitation_type === 'agency') {
            $meta['company_name'] = $validated['company_name'] ?? null;
            $meta['ifu'] = $validated['ifu'] ?? null;
            $meta['rccm'] = $validated['rccm'] ?? null;
            $meta['vat_number'] = $validated['vat_number'] ?? null;
            $meta['address_billing'] = $validated['address_billing'] ?? null;
        }

        $invitationId = DB::table('co_owner_invitations')->insertGetId([
            'email' => $validated['email'],
            'name' => $validated['first_name'] . ' ' . $validated['last_name'],
            'token' => $token,
            'invited_by_type' => $user->hasRole('landlord') ? 'landlord' : 'co_owner',
            'invited_by_id' => $user->id,
            'target_type' => 'co_owner',
            'landlord_id' => $landlordId,
            'co_owner_user_id' => $coOwnerId,
            'meta' => json_encode($meta),
            'expires_at' => Carbon::now()->addDays(7),
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now(),
        ]);

        $invitation = DB::table('co_owner_invitations')->where('id', $invitationId)->first();

        try {
            Mail::to($validated['email'])->send(new \App\Mail\CoOwnerInvitation(
                $invitation,
                $token,
                $meta['invited_by_name']
            ));

            Log::info('Email d\'invitation envoyé', [
                'email' => $validated['email'],
                'invitation_id' => $invitationId
            ]);
        } catch (\Exception $e) {
            Log::error('Erreur envoi email invitation', [
                'error' => $e->getMessage(),
                'email' => $validated['email']
            ]);
        }

        DB::commit();

        $successMessage = $request->invitation_type === 'agency'
            ? 'Agence invitée avec succès. Un email a été envoyé.'
            : 'Co-propriétaire invité avec succès. Un email a été envoyé.';

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => $successMessage
            ]);
        }

        $redirectUrl = route('co-owner.management.index');
        if ($request->has('api_token')) {
            $redirectUrl .= '?api_token=' . $request->get('api_token');
        }

        return redirect($redirectUrl)
            ->with('success', $successMessage);

    } catch (\Exception $e) {
        DB::rollBack();
        Log::error('Erreur invitation: ' . $e->getMessage());

        if ($request->wantsJson()) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de l\'envoi de l\'invitation: ' . $e->getMessage()
            ], 500);
        }

        return back()->with('error', 'Erreur lors de l\'envoi de l\'invitation: ' . $e->getMessage())->withInput();
    }
}

/**
 * Déléguer un bien à un co-propriétaire
 */
public function delegate(Request $request, $id)
{
    Log::info('=== CoOwnerManagementController::delegate ===', [
        'co_owner_id' => $id,
        'data' => $request->except(['api_token', '_token'])
    ]);

    $user = $this->getAuthenticatedUser($request);

    if (!$user) {
        if ($request->wantsJson()) {
            return response()->json(['success' => false, 'message' => 'Non authentifié'], 401);
        }
        $apiToken = $request->get('api_token');
        if ($apiToken) {
            return redirect('http://localhost:8000/login?api_token=' . $apiToken);
        }
        return redirect('http://localhost:8000/login');
    }

    if (!$user->hasRole(['landlord', 'co_owner'])) {
        if ($request->wantsJson()) {
            return response()->json(['success' => false, 'message' => 'Accès non autorisé'], 403);
        }
        return back()->with('error', 'Accès non autorisé');
    }

    $validated = $request->validate([
        'property_id' => 'required|exists:properties,id',
        'expires_at' => 'nullable|date|after:today',
        'notes' => 'nullable|string|max:1000',
        'permissions' => 'nullable|array',
        'permissions.*' => 'string|in:view,edit,manage_lease,collect_rent,manage_maintenance,send_invoices,manage_tenants,view_documents,manage_delegations',
    ]);

    // Récupérer le co-owner cible
    $targetCoOwner = CoOwner::findOrFail($id);

    // Vérifier que l'utilisateur a le droit de déléguer à ce co-owner
    if ($user->hasRole('landlord')) {
        if ($targetCoOwner->landlord_id != $user->id) {
            return back()->with('error', 'Ce co-propriétaire ne vous appartient pas');
        }
    } else {
        $currentCoOwner = CoOwner::where('user_id', $user->id)->first();
        if (!$currentCoOwner) {
            return back()->with('error', 'Profil co-propriétaire non trouvé');
        }

        if ($targetCoOwner->landlord_id != $currentCoOwner->landlord_id) {
            return back()->with('error', 'Vous ne pouvez déléguer qu\'aux personnes de votre réseau');
        }
    }

    // Vérifier que la propriété appartient au bon landlord
    $property = Property::findOrFail($validated['property_id']);

    if ($property->landlord_id != $targetCoOwner->landlord_id) {
        return back()->with('error', 'Cette propriété n\'appartient pas au même propriétaire');
    }

    // Vérifier que la propriété n'est pas déjà déléguée À CE CO-PROPRIÉTAIRE CIBLE
    $existingDelegation = PropertyDelegation::where('property_id', $property->id)
        ->where('co_owner_id', $targetCoOwner->id)
        ->where('status', 'active')
        ->first();

    if ($existingDelegation) {
        $existingCoOwner = CoOwner::find($existingDelegation->co_owner_id);
        $existingName = $existingCoOwner ? $existingCoOwner->first_name . ' ' . $existingCoOwner->last_name : 'un gestionnaire';

        return back()->with('error', "Ce bien est déjà délégué à $existingName")->withInput();
    }



    try {
        DB::beginTransaction();

        $meta = $targetCoOwner->meta ?? [];
        $invitationType = $meta['invitation_type'] ?? ($targetCoOwner->is_professional ? 'agency' : 'co_owner');

        if ($invitationType === 'agency') {
            $permissions = [
                'view', 'edit', 'manage_lease', 'collect_rent',
                'manage_maintenance', 'send_invoices', 'manage_tenants',
                'view_documents', 'manage_delegations'
            ];
            $delegationType = 'full';
            $notes = $validated['notes'] ?? "Délégation complète à une agence.";
        } else {
            $permissions = $validated['permissions'] ?? ['view', 'edit'];
            $delegationType = 'shared';
            $notes = $validated['notes'] ?? "Délégation partagée à un copropriétaire.";
        }

        $delegation = PropertyDelegation::create([
            'property_id' => $property->id,
            'co_owner_id' => $targetCoOwner->id,
            'landlord_id' => $targetCoOwner->landlord_id,
            'co_owner_type' => $invitationType,
            'status' => 'active',
            'permissions' => $permissions,
            'delegation_type' => $delegationType,
            'delegated_at' => now(),
            'expires_at' => $validated['expires_at'] ?? null,
            'notes' => $notes,
        ]);

        try {
            if ($targetCoOwner->user && $targetCoOwner->user->email) {
                $propertyName = $property->name ?: 'Bien immobilier';
                $delegatorName = $user->name ?? ($user->hasRole('landlord') ? 'Le propriétaire' : 'Un copropriétaire');

                Mail::send('emails.property-delegated', [
                    'coOwnerName' => $targetCoOwner->first_name,
                    'propertyName' => $propertyName,
                    'propertyAddress' => $property->address,
                    'propertyCity' => $property->city,
                    'delegatorName' => $delegatorName,
                    'delegationType' => $delegationType === 'full' ? 'complète' : 'partagée',
                    'permissions' => $permissions,
                    'expiresAt' => $validated['expires_at'] ? Carbon::parse($validated['expires_at'])->format('d/m/Y') : null,
                    'notes' => $notes,
                    'dashboardUrl' => 'http://localhost:8080/coproprietaire/dashboard',
                ], function ($message) use ($targetCoOwner) {
                    $message->to($targetCoOwner->user->email)
                            ->subject('Un bien vous a été délégué');
                });

                Log::info('Email de délégation envoyé', [
                    'email' => $targetCoOwner->user->email,
                    'delegation_id' => $delegation->id
                ]);
            }
        } catch (\Exception $e) {
            Log::error('Erreur envoi email délégation', [
                'error' => $e->getMessage(),
                'co_owner_id' => $targetCoOwner->id
            ]);
        }

        DB::commit();

        $successMessage = "Bien délégué avec succès à {$targetCoOwner->first_name} {$targetCoOwner->last_name}. Un email de notification a été envoyé.";

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => $successMessage,
                'delegation' => $delegation
            ]);
        }

        $redirectUrl = route('co-owner.management.show', $id);
        if ($request->has('api_token')) {
            $redirectUrl .= '?api_token=' . $request->get('api_token');
        }

        return redirect($redirectUrl)->with('success', $successMessage);

    } catch (\Exception $e) {
        DB::rollBack();
        Log::error('Erreur délégation: ' . $e->getMessage(), [
            'trace' => $e->getTraceAsString()
        ]);

        if ($request->wantsJson()) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la délégation: ' . $e->getMessage()
            ], 500);
        }

        return back()->with('error', 'Erreur lors de la délégation: ' . $e->getMessage())->withInput();
    }
}

    /**
     * Révoquer une délégation
     */
    public function revokeDelegation(Request $request, $delegationId)
    {
        Log::info('=== CoOwnerManagementController::revokeDelegation ===', [
            'delegation_id' => $delegationId
        ]);

        $user = $this->getAuthenticatedUser($request);

        if (!$user) {
            if ($request->wantsJson()) {
                return response()->json(['success' => false, 'message' => 'Non authentifié'], 401);
            }
            $apiToken = $request->get('api_token');
            if ($apiToken) {
                return redirect('http://localhost:8000/login?api_token=' . $apiToken);
            }
            return redirect('http://localhost:8000/login');
        }

        if (!$user->hasRole(['landlord', 'co_owner'])) {
            if ($request->wantsJson()) {
                return response()->json(['success' => false, 'message' => 'Accès non autorisé'], 403);
            }
            return back()->with('error', 'Accès non autorisé');
        }

        try {
            $delegation = PropertyDelegation::findOrFail($delegationId);

            // Vérifier les droits
            if ($user->hasRole('landlord')) {
                // Un landlord peut révoquer ses délégations
                if ($delegation->landlord_id != $user->id) {
                    return back()->with('error', 'Cette délégation ne vous appartient pas');
                }
            } else {
                // Un co-owner peut révoquer les délégations qu'il a créées
                $currentCoOwner = CoOwner::where('user_id', $user->id)->first();
                if (!$currentCoOwner) {
                    return back()->with('error', 'Profil co-propriétaire non trouvé');
                }

                // Vérifier si ce co-owner a créé cette délégation
                $createdByThisCoOwner = DB::table('property_delegations')
                    ->where('id', $delegationId)
                    ->where('landlord_id', $currentCoOwner->landlord_id)
                    ->exists();

                if (!$createdByThisCoOwner) {
                    return back()->with('error', 'Vous n\'êtes pas autorisé à révoquer cette délégation');
                }

                // Ne pas révoquer les délégations de type 'full' (agence) si c'est un co-owner
                if ($delegation->delegation_type === 'full') {
                    return back()->with('error', 'Seul le propriétaire peut révoquer une délégation complète');
                }
            }

            DB::beginTransaction();

            $delegation->update([
                'status' => 'revoked',
                'revoked_at' => now()
            ]);

            // Envoyer un email de notification
            try {
                $targetCoOwner = CoOwner::find($delegation->co_owner_id);
                if ($targetCoOwner && $targetCoOwner->user && $targetCoOwner->user->email) {
                    $property = Property::find($delegation->property_id);
                    $propertyName = $property ? ($property->name ?: 'Bien immobilier') : 'un bien';

                    Mail::send('emails.delegation-revoked', [
                        'coOwnerName' => $targetCoOwner->first_name,
                        'propertyName' => $propertyName,
                    ], function ($message) use ($targetCoOwner) {
                        $message->to($targetCoOwner->user->email)
                                ->subject('Délégation révoquée');
                    });
                }
            } catch (\Exception $e) {
                Log::error('Erreur envoi email révocation', [
                    'error' => $e->getMessage()
                ]);
            }

            DB::commit();

            if ($request->wantsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Délégation révoquée avec succès'
                ]);
            }

            return back()->with('success', 'Délégation révoquée avec succès');

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Erreur révocation délégation: ' . $e->getMessage());

            if ($request->wantsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Erreur lors de la révocation: ' . $e->getMessage()
                ], 500);
            }

            return back()->with('error', 'Erreur lors de la révocation: ' . $e->getMessage());
        }
    }

/**
 * Révoquer un co-propriétaire
 */
public function revoke(Request $request, $id)
{
    Log::info('=== CoOwnerManagementController::revoke ===', [
        'co_owner_id' => $id,
        'url' => $request->fullUrl()
    ]);

    $user = $this->getAuthenticatedUser($request);

    if (!$user) {
        $apiToken = $request->get('api_token');
        if ($apiToken) {
            return redirect('http://localhost:8000/login?api_token=' . $apiToken);
        }
        return redirect('http://localhost:8000/login');
    }

    // Récupérer le co_owner à révoquer
    $targetCoOwner = CoOwner::findOrFail($id);

    // Vérifier les droits
    if ($user->hasRole('landlord')) {
        // Un landlord peut révoquer ses co-owners
        if ($targetCoOwner->landlord_id != $user->id) {
            return back()->with('error', 'Ce co-propriétaire ne vous appartient pas');
        }
    } else {
        // Un co-owner peut révoquer les personnes qu'il a invitées
        $currentCoOwner = CoOwner::where('user_id', $user->id)->first();
        if (!$currentCoOwner) {
            return back()->with('error', 'Profil co-propriétaire non trouvé');
        }

        // Vérifier que le co-owner cible a été invité par ce co-owner
        $invitedByCurrent = DB::table('co_owner_invitations')
            ->where('invited_by_id', $user->id)
            ->where('co_owner_user_id', $targetCoOwner->user_id)
            ->whereNotNull('accepted_at')
            ->exists();

        if (!$invitedByCurrent) {
            return back()->with('error', 'Vous ne pouvez révoquer que les personnes que vous avez invitées');
        }
    }

    try {
        DB::beginTransaction();

        // ✅ RÉVOQUER TOUTES LES DÉLÉGATIONS ACTIVES
        PropertyDelegation::where('co_owner_id', $targetCoOwner->id)
            ->where('status', 'active')
            ->update([
                'status' => 'revoked',
                'revoked_at' => now()
            ]);

        // ✅ DÉSACTIVER LE CO-PROPRIÉTAIRE DANS LA TABLE co_owners
        $targetCoOwner->status = 'inactive';
        $targetCoOwner->save();

        // ✅ OPTIONNEL : Mettre à jour l'utilisateur si nécessaire
        // Mais ce n'est pas obligatoire car le statut est dans co_owners
        // Si vous voulez quand même le faire :
        if ($targetCoOwner->user) {
            $targetCoOwner->user->status = 'deactivated';
            $targetCoOwner->user->save();
        }

        DB::commit();

        $redirectUrl = route('co-owner.management.show', $id);
        if ($request->has('api_token')) {
            $redirectUrl .= '?api_token=' . $request->get('api_token');
        }

        if ($request->wantsJson()) {
            return response()->json(['success' => true, 'message' => 'Co-propriétaire révoqué avec succès']);
        }

        return redirect($redirectUrl)
            ->with('success', 'Co-propriétaire révoqué avec succès');

    } catch (\Exception $e) {
        DB::rollBack();
        Log::error('Erreur révocation: ' . $e->getMessage(), [
            'trace' => $e->getTraceAsString()
        ]);

        if ($request->wantsJson()) {
            return response()->json(['success' => false, 'message' => 'Erreur lors de la révocation'], 500);
        }

        return back()->with('error', 'Erreur lors de la révocation');
    }
}

/**
 * Réactiver un co-propriétaire
 */
public function reactivate(Request $request, $id)
{
    Log::info('=== CoOwnerManagementController::reactivate ===', [
        'co_owner_id' => $id,
        'url' => $request->fullUrl()
    ]);

    $user = $this->getAuthenticatedUser($request);

    if (!$user) {
        $apiToken = $request->get('api_token');
        if ($apiToken) {
            return redirect('http://localhost:8000/login?api_token=' . $apiToken);
        }
        return redirect('http://localhost:8000/login');
    }

    // Récupérer le co_owner à réactiver
    $targetCoOwner = CoOwner::findOrFail($id);

    // Vérifier les droits
    if ($user->hasRole('landlord')) {
        // Un landlord peut réactiver ses co-owners
        if ($targetCoOwner->landlord_id != $user->id) {
            return back()->with('error', 'Ce co-propriétaire ne vous appartient pas');
        }
    } else {
        // Un co-owner peut réactiver les personnes qu'il a invitées
        $currentCoOwner = CoOwner::where('user_id', $user->id)->first();
        if (!$currentCoOwner) {
            return back()->with('error', 'Profil co-propriétaire non trouvé');
        }

        // Vérifier que le co-owner cible a été invité par ce co-owner
        $invitedByCurrent = DB::table('co_owner_invitations')
            ->where('invited_by_id', $user->id)
            ->where('co_owner_user_id', $targetCoOwner->user_id)
            ->whereNotNull('accepted_at')
            ->exists();

        if (!$invitedByCurrent) {
            return back()->with('error', 'Vous ne pouvez réactiver que les personnes que vous avez invitées');
        }
    }

    try {
        DB::beginTransaction();

        // ✅ RÉACTIVER LE CO-PROPRIÉTAIRE DANS LA TABLE co_owners
        $targetCoOwner->status = 'active';
        $targetCoOwner->save();

        // ✅ OPTIONNEL : Mettre à jour l'utilisateur si nécessaire
        // Mais ce n'est pas obligatoire car le statut est dans co_owners
        // Si vous voulez quand même le faire :
        if ($targetCoOwner->user && $targetCoOwner->user->status) {
            $targetCoOwner->user->status = 'active';
            $targetCoOwner->user->save();
        }

        DB::commit();

        $redirectUrl = route('co-owner.management.show', $id);
        if ($request->has('api_token')) {
            $redirectUrl .= '?api_token=' . $request->get('api_token');
        }

        if ($request->wantsJson()) {
            return response()->json(['success' => true, 'message' => 'Co-propriétaire réactivé avec succès']);
        }

        return redirect($redirectUrl)
            ->with('success', 'Co-propriétaire réactivé avec succès');

    } catch (\Exception $e) {
        DB::rollBack();
        Log::error('Erreur réactivation: ' . $e->getMessage(), [
            'trace' => $e->getTraceAsString()
        ]);

        if ($request->wantsJson()) {
            return response()->json(['success' => false, 'message' => 'Erreur lors de la réactivation'], 500);
        }

        return back()->with('error', 'Erreur lors de la réactivation');
    }
}

    /**
     * Renvoyer une invitation
     */
    public function resendInvitation(Request $request, $id)
    {
        $user = $this->getAuthenticatedUser($request);

        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Non authentifié'], 401);
        }

        try {
            $invitation = DB::table('co_owner_invitations')
                ->where('id', $id)
                ->where('invited_by_id', $user->id)
                ->where('accepted_at', null)
                ->first();

            if (!$invitation) {
                return response()->json(['success' => false, 'message' => 'Invitation non trouvée'], 404);
            }

            $newToken = Str::random(64);
            DB::table('co_owner_invitations')
                ->where('id', $id)
                ->update([
                    'token' => $newToken,
                    'expires_at' => Carbon::now()->addDays(7),
                    'updated_at' => Carbon::now()
                ]);

            $invitation = DB::table('co_owner_invitations')->where('id', $id)->first();
            $meta = json_decode($invitation->meta, true);

            try {
                Mail::to($invitation->email)->send(new \App\Mail\CoOwnerInvitation(
                    $invitation,
                    $newToken,
                    $meta['invited_by_name'] ?? $user->name ?? $user->email
                ));

                Log::info('Email d\'invitation renvoyé', [
                    'email' => $invitation->email,
                    'invitation_id' => $id
                ]);

                return response()->json([
                    'success' => true,
                    'message' => 'Invitation renvoyée avec succès'
                ]);
            } catch (\Exception $e) {
                Log::error('Erreur renvoi email invitation', [
                    'error' => $e->getMessage(),
                    'email' => $invitation->email
                ]);
                return response()->json([
                    'success' => false,
                    'message' => 'Erreur lors de l\'envoi de l\'email'
                ], 500);
            }

        } catch (\Exception $e) {
            Log::error('Erreur renvoi invitation: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du renvoi de l\'invitation'
            ], 500);
        }
    }

    /**
     * Annuler une invitation
     */
    public function cancelInvitation(Request $request, $id)
    {
        $user = $this->getAuthenticatedUser($request);

        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Non authentifié'], 401);
        }

        try {
            DB::table('co_owner_invitations')
                ->where('id', $id)
                ->where('invited_by_id', $user->id)
                ->where('accepted_at', null)
                ->delete();

            return response()->json([
                'success' => true,
                'message' => 'Invitation annulée avec succès'
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur annulation invitation: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de l\'annulation de l\'invitation'
            ], 500);
        }
    }
}
