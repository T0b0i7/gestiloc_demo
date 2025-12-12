<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreLandlordRequest;
use App\Http\Requests\LoginRequest;
use App\Models\TenantInvitation;
use App\Models\User;
use App\Models\Tenant;
use App\Services\AuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    protected AuthService $authService;

    public function __construct(AuthService $authService)
    {
        $this->authService = $authService;
    }

    // Register landlord (creates user + landlord)
    public function registerLandlord(StoreLandlordRequest $request): JsonResponse
    {
        $result = $this->authService->registerLandlord($request->validated());

        return response()->json([
            'status' => 'success',
            'message' => 'Landlord registered successfully.',
            'data' => [
                'user' => $result['user'],
                'landlord' => $result['landlord']
            ]
        ], 201);
    }

    // Login
    public function login(LoginRequest $request): JsonResponse
    {
        $result = $this->authService->login($request->validated());

        return response()->json([
            'status' => 'success',
            'message' => 'Login successful.',
            'data' => $result
        ]);
    }

    /**
     * Appelé via le lien signé dans l'email.
     * Redirige vers le front avec token + email.
     */
    public function acceptInvitation(Request $request, $invitationId)
    {
        // Signature déjà vérifiée par Laravel (temporarySignedRoute)
        $invitation = TenantInvitation::where('id', $invitationId)
            ->whereNull('accepted_at')
            ->where('expires_at', '>', now())
            ->firstOrFail();

        $frontendUrl = config('app.frontend_url', 'http://localhost:8080');

        return redirect()->away(
            $frontendUrl .
            '/activation/locataire?token=' . urlencode($invitation->token) .
            '&email=' . urlencode($invitation->email)
        );
    }

    /**
     * Le locataire soumet son mot de passe depuis le front.
     * Crée / met à jour le User + crée Tenant + assigne le rôle tenant.
     */
    public function completeTenantRegistration(Request $request)
{
    $data = $request->validate([
        'token' => 'required|string',
        'email' => 'required|email',
        'password' => 'required|string|min:8|confirmed',
    ]);

    $invitation = TenantInvitation::where('token', $data['token'])
        ->where('email', $data['email'])
        ->whereNull('accepted_at')
        ->where('expires_at', '>', now())
        ->first();

    if (! $invitation) {
        throw ValidationException::withMessages([
            'token' => ['Invitation invalide ou expirée.'],
        ]);
    }

    // 1) Récupérer ou créer le user
    $user = User::where('email', $data['email'])->first();

    if (! $user) {
        // Découpe du nom "Prénom Nom" venant de l'invitation
        $parts = preg_split('/\s+/', $invitation->name, 2);
        $firstName = $parts[0] ?? null;
        $lastName  = $parts[1] ?? null;

        $user = User::create([
            'email'      => $invitation->email,
            'password'   => Hash::make($data['password']),
            'phone'      => null,
            'email_verified_at' => now(),
        ]);

        // Si tu veux stocker prénom/nom côté user aussi, ajoute les colonnes dans la table users
        // puis ici :
        // 'first_name' => $firstName,
        // 'last_name'  => $lastName,
    } else {
        $user->password = Hash::make($data['password']);
        $user->email_verified_at = $user->email_verified_at ?? now();
        $user->save();
    }

    // 2) Rôle tenant
    if (method_exists($user, 'assignRole')) {
        $user->assignRole('tenant');
    }

    // 3) Créer / lier le Tenant avec les bons champs
    $parts = preg_split('/\s+/', $invitation->name, 2);
    $firstName = $parts[0] ?? $invitation->name;
    $lastName  = $parts[1] ?? '';

    $tenant = Tenant::firstOrCreate(
        ['user_id' => $user->id],
        [
            'first_name'      => $firstName,
            'last_name'       => $lastName,
            'status'          => 'active',
            'solvency_score'  => 0,
            'meta'            => [
                'invitation_email' => $invitation->email,
                'landlord_id'      => $invitation->landlord_id,
                'invitation_id'    => $invitation->id,
            ],
        ]
    );

    // 4) Marquer l'invitation comme acceptée
    $invitation->accepted_at = now();
    $invitation->tenant_user_id = $user->id;
    $invitation->save();

    // 5) Générer un token pour connexion auto
    $token = $user->createToken('tenant-login')->plainTextToken;

    return response()->json([
        'message' => 'Compte locataire créé avec succès.',
        'token'   => $token,
        'user'    => [
            'id'    => $user->id,
            'email' => $user->email,
            'roles' => method_exists($user, 'getRoleNames')
                ? $user->getRoleNames()
                : ['tenant'],
        ],
        'tenant' => $tenant,
    ]);
    }

}
