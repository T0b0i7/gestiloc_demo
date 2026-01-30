<?php

namespace App\Http\Controllers\CoOwner;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use App\Models\User;
use App\Models\Property;
use App\Models\PropertyDelegation;
use App\Models\PropertyUser;
use App\Models\TenantInvitation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Laravel\Sanctum\PersonalAccessToken;
use Illuminate\Support\Facades\Mail;

class CoOwnerTenantController extends Controller
{
    /**
     * Afficher la liste des locataires
     */
    public function index(Request $request)
    {
        // Récupérer l'utilisateur depuis Sanctum
        $user = $this->getAuthenticatedUser($request);

        Log::info('=== ACCÈS PAGE LARAVEL (COPRIO) ===', [
            'url' => $request->fullUrl(),
            'user_id' => $user ? $user->id : null,
            'user_email' => $user ? $user->email : null,
            'timestamp' => now(),
        ]);

        if (!$user) {
            return redirect()->route('login')->with('error', 'Veuillez vous connecter');
        }

        // Vérifier que c'est un co-propriétaire
        if (!$user->hasRole('co_owner')) {
            return view('co-owner.unauthorized')->with('error', 'Accès réservé aux co-propriétaires');
        }

        // Récupérer le co-propriétaire lié à l'utilisateur
        $coOwner = $user->coOwner;
        if (!$coOwner) {
            return view('co-owner.unauthorized')->with('error', 'Profil co-propriétaire non trouvé');
        }

        // Liste des locataires gérés par ce co-propriétaire (via landlord_id dans meta)
        $tenants = Tenant::where('meta->landlord_id', $coOwner->landlord_id)
            ->get();

        return view('co-owner.tenants.index', compact('tenants', 'user'));
    }

    /**
     * Formulaire création locataire
     */
    public function create(Request $request)
    {
        // Récupérer l'utilisateur depuis Sanctum
        $user = $this->getAuthenticatedUser($request);

        Log::info('=== FORMULAIRE CRÉATION LARAVEL (COPRIO) ===', [
            'user_id' => $user ? $user->id : null,
            'user_email' => $user ? $user->email : null,
        ]);

        if (!$user) {
            return redirect()->route('login')->with('error', 'Veuillez vous connecter');
        }

        // Vérifier que c'est un co-propriétaire
        if (!$user->hasRole('co_owner')) {
            return redirect()->route('login')->with('error', 'Accès réservé aux co-propriétaires');
        }

        $coOwner = $user->coOwner;
        if (!$coOwner) {
            return redirect()->route('login')->with('error', 'Profil co-propriétaire non trouvé');
        }

        return view('co-owner.tenants.create', compact('user', 'coOwner'));
    }

    /**
     * Enregistrement locataire - SIMILAIRE AU BAILIEUR
     */
    public function store(Request $request)
    {
        // Récupérer l'utilisateur depuis Sanctum
        $user = $this->getAuthenticatedUser($request);

        Log::info('=== ENREGISTREMENT LOCATAIRE LARAVEL (COPRIO) ===', [
            'data_keys' => array_keys($request->all()),
            'user_id' => $user ? $user->id : null,
            'user_email' => $user ? $user->email : null,
            'user_roles' => $user ? $user->getRoleNames() : null,
        ]);

        // Vérifier l'authentification
        if (!$user) {
            Log::error('Aucun utilisateur authentifié trouvé');
            return back()
                ->with('error', 'Vous devez être connecté pour créer un locataire')
                ->withInput();
        }

        // Vérifier que c'est un co-propriétaire
        if (!$user->hasRole('co_owner')) {
            Log::error('Utilisateur non autorisé', [
                'user_id' => $user->id,
                'roles' => $user->getRoleNames()
            ]);
            return back()
                ->with('error', 'Accès réservé aux co-propriétaires')
                ->withInput();
        }

        // Récupérer le co-propriétaire
        $coOwner = $user->coOwner;
        if (!$coOwner) {
            return back()
                ->with('error', 'Profil co-propriétaire non trouvé')
                ->withInput();
        }

        // Validation - SIMILAIRE AU BAILIEUR
        $validated = $request->validate([
            'first_name' => 'required|string|max:100',
            'last_name' => 'required|string|max:100',
            'email' => 'required|email',
            'phone' => 'nullable|string|max:20',
            'birth_date' => 'required|date',
            'birth_place' => 'required|string|max:200',
            'marital_status' => 'nullable|string',
            'profession' => 'required|string|max:200',
            'employer' => 'nullable|string|max:200',
            'annual_income' => 'nullable|numeric|min:0',
            'contract_type' => 'nullable|string',
            'address' => 'required|string|max:255',
            'zip_code' => 'required|string|max:10',
            'city' => 'required|string|max:100',
            'country' => 'required|string|max:100',
            'emergency_contact_name' => 'nullable|string|max:200',
            'emergency_contact_phone' => 'nullable|string|max:20',
            'notes' => 'nullable|string',
            'guarantor_name' => 'nullable|string|max:200',
            'guarantor_phone' => 'nullable|string|max:20',
            'guarantor_email' => 'nullable|email',
            'guarantor_profession' => 'nullable|string|max:200',
            'guarantor_income' => 'nullable|numeric|min:0',
            'guarantor_address' => 'nullable|string|max:255',
        ]);

        try {
            // DÉBUT DE LA TRANSACTION - SIMILAIRE AU BAILIEUR
            return DB::transaction(function () use ($validated, $user, $coOwner, $request) {
                Log::info('Début création locataire par co-propriétaire', [
                    'co_owner_id' => $coOwner->id,
                    'co_owner_email' => $user->email,
                    'tenant_email' => $validated['email']
                ]);

                // 1. Vérifier si l'email existe déjà (comme le bailleur)
                $existingUser = User::where('email', $validated['email'])->first();

                if ($existingUser) {
                    // Si un utilisateur existe déjà avec cet email
                    $tenantUser = $existingUser;
                } else {
                    // Créer un user temporaire avec un mot de passe aléatoire
                    $tempPassword = Hash::make(bin2hex(random_bytes(16)));

                    $tenantUser = User::create([
                        'email' => $validated['email'],
                        'phone' => $validated['phone'] ?? null,
                        'password' => $tempPassword,
                        'status' => 'pending',
                        'email_verified_at' => null,
                    ]);

                    // Assigner le rôle de locataire
                    $tenantUser->assignRole('tenant');
                }

                // 2. Créer l'invitation (comme le bailleur)
                $invitation = TenantInvitation::create([
                    'landlord_id'    => $coOwner->landlord_id, // Landlord du co-propriétaire
                    'tenant_user_id' => $tenantUser->id,
                    'email'          => $validated['email'],
                    'name'           => trim($validated['first_name'] . ' ' . $validated['last_name']),
                    'token'          => TenantInvitation::makeToken(),
                    'expires_at'     => now()->addDays(7),
                    'meta'           => [
                        'first_name' => $validated['first_name'],
                        'last_name'  => $validated['last_name'],
                        'phone'      => $validated['phone'] ?? null,
                        'invited_by' => 'co_owner',
                        'co_owner_id' => $coOwner->id,
                    ],
                ]);

                // 3. Créer le locataire AVEC user_id = utilisateur locataire (comme le bailleur)
                $tenant = Tenant::create([
                    'user_id' => $tenantUser->id, // ✅ User du LOCATAIRE, pas du co-propriétaire
                    'first_name' => $validated['first_name'],
                    'last_name' => $validated['last_name'],
                    'email' => $validated['email'],
                    'phone' => $validated['phone'] ?? null,
                    'birth_date' => $validated['birth_date'],
                    'birth_place' => $validated['birth_place'],
                    'marital_status' => $validated['marital_status'] ?? 'single',
                    'profession' => $validated['profession'],
                    'employer' => $validated['employer'] ?? null,
                    'annual_income' => $validated['annual_income'] ?? null,
                    'contract_type' => $validated['contract_type'] ?? null,
                    'emergency_contact_name' => $validated['emergency_contact_name'] ?? null,
                    'emergency_contact_phone' => $validated['emergency_contact_phone'] ?? null,
                    'notes' => $validated['notes'] ?? null,
                    'status' => 'candidate', // Comme le bailleur
                    'address' => $validated['address'],
                    'zip_code' => $validated['zip_code'],
                    'city' => $validated['city'],
                    'country' => $validated['country'],
                    'meta' => [
                        'landlord_id' => $coOwner->landlord_id,
                        'invitation_email' => $validated['email'],
                        'phone' => $validated['phone'] ?? null,
                        'invitation_id' => $invitation->id,
                        'invitation_status' => 'invited',
                        'invited_by_co_owner' => $coOwner->id,
                        'co_owner_id' => $coOwner->id,
                        'guarantor' => [
                            'name' => $validated['guarantor_name'] ?? null,
                            'phone' => $validated['guarantor_phone'] ?? null,
                            'email' => $validated['guarantor_email'] ?? null,
                            'profession' => $validated['guarantor_profession'] ?? null,
                            'income' => $validated['guarantor_income'] ?? null,
                            'address' => $validated['guarantor_address'] ?? null,
                        ],
                    ],
                ]);

                // 4. Générer le lien d'invitation (comme le bailleur)
                $signedUrl = URL::temporarySignedRoute(
                    'api.auth.accept-invitation',
                    now()->addDays(7),
                    ['invitationId' => $invitation->id]
                );

                Log::info('Locataire créé avec succès par co-propriétaire', [
                    'tenant_id' => $tenant->id,
                    'tenant_email' => $tenant->email,
                    'tenant_user_id' => $tenant->user_id,
                    'co_owner_id' => $coOwner->id,
                    'co_owner_email' => $user->email,
                    'invitation_id' => $invitation->id,
                ]);

                // 5. Envoyer l'email d'invitation (comme le bailleur)
                $this->sendInvitationEmail($tenant, $invitation, $signedUrl, $user);

                return redirect()
                    ->route('co-owner.tenants.index')
                    ->with('success', 'Locataire créé avec succès ! Un email d\'invitation a été envoyé.');

            });

        } catch (\Exception $e) {
            Log::error('Erreur création locataire par co-propriétaire', [
                'error' => $e->getMessage(),
                'co_owner_id' => $user->id,
                'trace' => $e->getTraceAsString()
            ]);

            return back()
                ->with('error', 'Erreur lors de la création du locataire: ' . $e->getMessage())
                ->withInput();
        }
    }

    /**
     * Envoyer l'email d'invitation - CORRIGÉ
     */
    private function sendInvitationEmail($tenant, $invitation, $signedUrl, $coOwnerUser)
    {
        try {
            $appName = config('app.name', 'Gestiloc');
            $frontendUrl = rtrim(config('app.frontend_url', env('FRONTEND_URL', config('app.url'))), '/');

            $ref = 'INV-' . str_pad((string) $invitation->id, 6, '0', STR_PAD_LEFT);
            $toTenant = $tenant->email;

            // VÉRIFIER que l'email n'est pas null
            if (empty($toTenant)) {
                Log::error('Email du locataire est vide', [
                    'tenant_id' => $tenant->id,
                    'invitation_id' => $invitation->id
                ]);
                return;
            }

            $title = 'Invitation à créer votre compte ✉️';
            $subject = "✉️ Invitation $appName : $ref";

            $content = <<<HTML
<div style="font-size:14px;color:#374151;line-height:1.7;">
  Bonjour {$tenant->first_name},<br><br>
  Vous avez été invité(e) à rejoindre <strong>{$appName}</strong> par {$coOwnerUser->email}.
  Pour accéder à votre espace locataire et définir votre mot de passe, utilisez le lien ci-dessous.
</div>
<div style="height:14px"></div>
<div style="border:1px solid #eef2f7;border-radius:14px;overflow:hidden;">
  <div style="padding:14px;background:#f9fafb;">
    <div style="font-size:14px;font-weight:900;color:#111827;">Invitation</div>
    <div style="font-size:13px;color:#6b7280;margin-top:4px;">Locataire : {$tenant->first_name} {$tenant->last_name}</div>
    <div style="font-size:13px;color:#6b7280;margin-top:4px;">Email : {$tenant->email}</div>
  </div>
  <div style="padding:14px;">
    <div style="font-size:13px;color:#374151;line-height:1.6;">
      Cliquez sur le bouton ci-dessous pour créer votre compte et définir votre mot de passe.
    </div>
    <div style="height:14px"></div>
    <a href="{$signedUrl}" style="display:inline-block;background:#111827;color:#ffffff;text-decoration:none;padding:12px 16px;border-radius:12px;font-weight:800;font-size:14px;">
      Créer mon compte
    </a>
  </div>
</div>
<div style="height:16px"></div>
<a href="{$frontendUrl}" style="display:inline-block;background:#111827;color:#ffffff;text-decoration:none;padding:12px 16px;border-radius:12px;font-weight:800;font-size:14px;">
  Ouvrir {$appName}
</a>
HTML;

            // Envoyer l'email avec vérification
            Mail::html($content, function ($message) use ($toTenant, $subject) {
                if (empty($toTenant)) {
                    throw new \Exception("L'adresse email est vide");
                }
                $message->to($toTenant)->subject($subject);
            });

            Log::info('Email d\'invitation envoyé', [
                'to' => $toTenant,
                'invitation_id' => $invitation->id
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur envoi email invitation', [
                'error' => $e->getMessage(),
                'tenant_id' => $tenant->id,
                'tenant_email' => $tenant->email ?? 'null',
                'invitation_id' => $invitation->id
            ]);

            // Ne pas propager l'erreur, juste la logger
            // L'utilisateur est créé même si l'email échoue
        }
    }

    /**
     * Afficher un locataire
     */
    public function show(Request $request, $tenantId)
    {
        // Récupérer l'utilisateur depuis Sanctum
        $user = $this->getAuthenticatedUser($request);

        if (!$user || !$user->hasRole('co_owner')) {
            return redirect()->route('login')->with('error', 'Non autorisé');
        }

        $coOwner = $user->coOwner;
        if (!$coOwner) {
            return redirect()->route('login')->with('error', 'Profil co-propriétaire non trouvé');
        }

        $tenant = Tenant::where('id', $tenantId)
            ->where('meta->landlord_id', $coOwner->landlord_id) // Vérifier que le locataire appartient au même landlord
            ->firstOrFail();

        Log::info('=== AFFICHAGE LOCATAIRE (COPRIO) ===', [
            'tenant_id' => $tenantId,
            'co_owner_id' => $user->id,
        ]);

        return view('co-owner.tenants.show', compact('tenant', 'user'));
    }

    /**
     * Formulaire assignation propriété
     */
    public function showAssignProperty(Request $request, $tenantId)
    {
        // Récupérer l'utilisateur depuis Sanctum
        $user = $this->getAuthenticatedUser($request);

        if (!$user || !$user->hasRole('co_owner')) {
            return redirect()->route('login')->with('error', 'Non autorisé');
        }

        $coOwner = $user->coOwner;
        if (!$coOwner) {
            return redirect()->route('login')->with('error', 'Profil co-propriétaire non trouvé');
        }

        $tenant = Tenant::where('id', $tenantId)
            ->where('meta->landlord_id', $coOwner->landlord_id)
            ->firstOrFail();

        // Récupérer les propriétés déléguées à ce co-propriétaire
        $delegatedProperties = PropertyDelegation::where('co_owner_id', $coOwner->id)
            ->where('status', 'active')
            ->with('property')
            ->get()
            ->pluck('property');

        Log::info('=== FORMULAIRE ASSIGNATION (COPRIO) ===', [
            'tenant_id' => $tenantId,
            'co_owner_id' => $user->id,
            'properties_count' => $delegatedProperties->count(),
        ]);

        return view('co-owner.tenants.assign-property', compact('tenant', 'delegatedProperties', 'user'));
    }

    /**
     * Assigner une propriété
     */
    public function assignProperty(Request $request, $tenantId)
    {
        // Récupérer l'utilisateur depuis Sanctum
        $user = $this->getAuthenticatedUser($request);

        if (!$user || !$user->hasRole('co_owner')) {
            return back()->with('error', 'Non autorisé');
        }

        $coOwner = $user->coOwner;
        if (!$coOwner) {
            return back()->with('error', 'Profil co-propriétaire non trouvé');
        }

        $validated = $request->validate([
            'property_id' => 'required|exists:properties,id',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after:start_date',
        ]);

        // Vérifier que la propriété est déléguée à ce co-propriétaire
        $delegation = PropertyDelegation::where('property_id', $validated['property_id'])
            ->where('co_owner_id', $coOwner->id)
            ->where('status', 'active')
            ->first();

        if (!$delegation) {
            return back()
                ->with('error', 'Cette propriété ne vous est pas déléguée')
                ->withInput();
        }

        // Vérifier que le locataire appartient au même landlord
        $tenant = Tenant::where('id', $tenantId)
            ->where('meta->landlord_id', $coOwner->landlord_id)
            ->firstOrFail();

        try {
            // Assigner la propriété au locataire
            PropertyUser::assignPropertyToTenant(
                $validated['property_id'],
                $tenant->user_id,
                $tenant->id,
                null, // lease_id
                'tenant', // role
                null, // share_percentage
                $validated['start_date'] ?? now(),
                $validated['end_date'] ?? null
            );

            Log::info('=== ASSIGNATION PROPRIÉTÉ (COPRIO) ===', [
                'tenant_id' => $tenantId,
                'property_id' => $validated['property_id'],
                'co_owner_id' => $user->id,
            ]);

            return redirect()
                ->route('co-owner.tenants.show', $tenantId)
                ->with('success', 'Bien assigné avec succès.');

        } catch (\Exception $e) {
            Log::error('Erreur assignation propriété', [
                'error' => $e->getMessage(),
                'tenant_id' => $tenantId,
                'property_id' => $validated['property_id']
            ]);

            return back()
                ->with('error', 'Erreur lors de l\'assignation: ' . $e->getMessage())
                ->withInput();
        }
    }

    /**
     * Désassigner une propriété
     */
    public function unassignProperty(Request $request, $tenantId, $propertyId)
    {
        // Récupérer l'utilisateur depuis Sanctum
        $user = $this->getAuthenticatedUser($request);

        if (!$user || !$user->hasRole('co_owner')) {
            return back()->with('error', 'Non autorisé');
        }

        $coOwner = $user->coOwner;
        if (!$coOwner) {
            return back()->with('error', 'Profil co-propriétaire non trouvé');
        }

        // Vérifier que la propriété est déléguée à ce co-propriétaire
        $delegation = PropertyDelegation::where('property_id', $propertyId)
            ->where('co_owner_id', $coOwner->id)
            ->where('status', 'active')
            ->first();

        if (!$delegation) {
            return back()->with('error', 'Cette propriété ne vous est pas déléguée');
        }

        // Vérifier que le locataire appartient au même landlord
        $tenant = Tenant::where('id', $tenantId)
            ->where('meta->landlord_id', $coOwner->landlord_id)
            ->firstOrFail();

        try {
            // Terminer l'attribution
            $terminated = PropertyUser::terminateAssignment($propertyId, $tenant->user_id);

            if ($terminated) {
                Log::info('=== DÉSASSIGNATION (COPRIO) ===', [
                    'tenant_id' => $tenantId,
                    'property_id' => $propertyId,
                    'co_owner_id' => $user->id,
                ]);

                return redirect()
                    ->route('co-owner.tenants.show', $tenantId)
                    ->with('success', 'Bien désassigné avec succès.');
            }

            return back()->with('error', 'Aucune attribution active trouvée');

        } catch (\Exception $e) {
            Log::error('Erreur désassignation', [
                'error' => $e->getMessage(),
                'tenant_id' => $tenantId,
                'property_id' => $propertyId
            ]);

            return back()->with('error', 'Erreur lors de la désassignation: ' . $e->getMessage());
        }
    }

    /**
     * Renvoyer invitation
     */
    public function resendInvitation(Request $request, $tenantId)
    {
        // Récupérer l'utilisateur depuis Sanctum
        $user = $this->getAuthenticatedUser($request);

        if (!$user || !$user->hasRole('co_owner')) {
            return back()->with('error', 'Non autorisé');
        }

        $coOwner = $user->coOwner;
        if (!$coOwner) {
            return back()->with('error', 'Profil co-propriétaire non trouvé');
        }

        $tenant = Tenant::where('id', $tenantId)
            ->where('meta->landlord_id', $coOwner->landlord_id)
            ->firstOrFail();

        $invitation = TenantInvitation::where('email', $tenant->email)
            ->whereNull('accepted_at')
            ->where('expires_at', '>', now())
            ->first();

        if (!$invitation) {
            return back()->with('error', 'Aucune invitation valide trouvée');
        }

        try {
            // Régénérer le lien
            $signedUrl = URL::temporarySignedRoute(
                'api.auth.accept-invitation',
                now()->addDays(7),
                ['invitationId' => $invitation->id]
            );

            // Renvoyer l'email
            $this->sendInvitationEmail($tenant, $invitation, $signedUrl, $user);

            Log::info('=== RENVOI INVITATION (COPRIO) ===', [
                'tenant_id' => $tenantId,
                'co_owner_id' => $user->id,
            ]);

            return back()->with('success', 'Invitation renvoyée avec succès.');

        } catch (\Exception $e) {
            Log::error('Erreur renvoi invitation', [
                'error' => $e->getMessage(),
                'tenant_id' => $tenantId
            ]);

            return back()->with('error', 'Erreur lors du renvoi de l\'invitation: ' . $e->getMessage());
        }
    }

    /**
     * Méthode utilitaire pour récupérer l'utilisateur authentifié
     * depuis Sanctum (token) ou session web
     */
    private function getAuthenticatedUser(Request $request)
    {
        // 1. Vérifier l'authentification Sanctum (API)
        if ($request->bearerToken()) {
            $token = $request->bearerToken();
            $sanctumToken = PersonalAccessToken::findToken($token);

            if ($sanctumToken) {
                $user = $sanctumToken->tokenable;

                // Connecter l'utilisateur dans la session web
                auth('web')->login($user);

                Log::debug('Utilisateur récupéré depuis Sanctum', [
                    'user_id' => $user->id,
                    'email' => $user->email,
                ]);

                return $user;
            }
        }

        // 2. Vérifier le token en paramètre (pour les liens)
        if ($request->has('api_token')) {
            $token = $request->get('api_token');
            $sanctumToken = PersonalAccessToken::findToken($token);

            if ($sanctumToken) {
                $user = $sanctumToken->tokenable;
                auth('web')->login($user);

                Log::debug('Utilisateur récupéré depuis token param', [
                    'user_id' => $user->id,
                ]);

                return $user;
            }
        }

        // 3. Vérifier l'authentification web (session)
        if (auth()->check()) {
            $user = auth()->user();

            Log::debug('Utilisateur récupéré depuis session web', [
                'user_id' => $user->id,
            ]);

            return $user;
        }

        // 4. Essayer de récupérer depuis le header Authorization (fallback)
        $authHeader = $request->header('Authorization');
        if ($authHeader && str_starts_with($authHeader, 'Bearer ')) {
            $token = str_replace('Bearer ', '', $authHeader);
            $sanctumToken = PersonalAccessToken::findToken($token);

            if ($sanctumToken) {
                $user = $sanctumToken->tokenable;
                auth('web')->login($user);

                Log::debug('Utilisateur récupéré depuis header Auth', [
                    'user_id' => $user->id,
                ]);

                return $user;
            }
        }

        Log::warning('Aucun utilisateur authentifié trouvé', [
            'has_bearer_token' => $request->bearerToken() ? 'yes' : 'no',
            'has_api_token_param' => $request->has('api_token') ? 'yes' : 'no',
            'auth_check' => auth()->check() ? 'yes' : 'no',
            'has_auth_header' => $authHeader ? 'yes' : 'no',
        ]);

        return null;
    }
}
