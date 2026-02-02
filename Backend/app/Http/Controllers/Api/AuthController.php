<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreLandlordRequest;
use App\Http\Requests\StoreCoOwnerRequest;
use App\Http\Requests\LoginRequest;
use App\Models\TenantInvitation;
use App\Models\CoOwnerInvitation;
use App\Models\User;
use App\Models\Tenant;
use App\Models\CoOwner;
use App\Models\Landlord;
use App\Services\AuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;

class AuthController extends Controller
{
    protected AuthService $authService;

    public function __construct(AuthService $authService)
    {
        $this->authService = $authService;
    }

    /* =========================
     * Helpers emails (modern HTML)
     * ========================= */

    private function appName(): string
    {
        return config('app.name', 'Gestiloc');
    }

    private function frontendUrl(): string
    {
        return rtrim(config('app.frontend_url', env('FRONTEND_URL', config('app.url'))), '/');
    }

    private function mailLayoutHtml(string $title, string $ref, string $contentHtml): string
    {
        $appName = e($this->appName());
        $year = date('Y');

        return <<<HTML
<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
</head>
<body style="margin:0;padding:0;background:#f6f7fb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;color:#111827;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f6f7fb;padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="640" cellspacing="0" cellpadding="0" style="max-width:640px;width:100%;background:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 12px 30px rgba(17,24,39,0.08);">
          <tr>
            <td style="padding:20px 22px;background:linear-gradient(135deg,#111827,#374151);color:#fff;">
              <div style="font-size:14px;opacity:.9;">{$appName}</div>
              <div style="font-size:20px;font-weight:800;line-height:1.2;margin-top:6px;">{$title}</div>
              <div style="font-size:13px;opacity:.9;margin-top:6px;">
                Référence : <strong>{$ref}</strong>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:22px;">
              {$contentHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:18px 22px;border-top:1px solid #eef2f7;background:#fbfcff;">
              <div style="font-size:12px;color:#6b7280;line-height:1.6;">
                Cet email a été envoyé automatiquement. Si vous n'êtes pas concerné, vous pouvez l'ignorer.
              </div>
              <div style="font-size:12px;color:#6b7280;margin-top:8px;">
                © {$year} {$appName}
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
HTML;
    }

    private function buttonHtml(string $label, string $url): string
    {
        $l = e($label);
        $u = e($url);

        return <<<HTML
<a href="{$u}" style="display:inline-block;background:#111827;color:#ffffff;text-decoration:none;padding:12px 16px;border-radius:12px;font-weight:800;font-size:14px;">
  {$l}
</a>
HTML;
    }

    private function sendHtmlEmail(string $to, string $subject, string $html): void
    {
        Mail::html($html, function ($message) use ($to, $subject) {
            $message->to($to)->subject($subject);
        });

        Log::info('[auth-mail] sent', ['to' => $to, 'subject' => $subject]);
    }

    private function trySendMail(string $to, string $subject, string $title, string $ref, string $contentHtml): void
    {
        try {
            $html = $this->mailLayoutHtml($title, e($ref), $contentHtml);
            $this->sendHtmlEmail($to, $subject, $html);
        } catch (\Throwable $e) {
            Log::error('[auth-mail] failed', [
                'to' => $to,
                'subject' => $subject,
                'error' => $e->getMessage(),
            ]);
        }
    }

    private function invitationRef(TenantInvitation $invitation): string
    {
        return 'INV-' . str_pad((string) $invitation->id, 6, '0', STR_PAD_LEFT);
    }

    private function coOwnerInvitationRef(CoOwnerInvitation $invitation): string
    {
        return 'CO-INV-' . str_pad((string) $invitation->id, 6, '0', STR_PAD_LEFT);
    }

    private function resolveLandlordEmailFromInvitation(TenantInvitation $invitation): ?string
    {
        $email = $invitation->landlord?->user?->email ?? null;
        if ($email) return $email;

        if (!empty($invitation->landlord_id)) {
            $u = User::find($invitation->landlord_id);
            if ($u?->email) return $u->email;
        }

        if (!empty($invitation->landlord_id)) {
            $landlord = Landlord::find($invitation->landlord_id);
            if ($landlord && !empty($landlord->user_id)) {
                $u = User::find($landlord->user_id);
                if ($u?->email) return $u->email;
            }
        }

        return null;
    }

    private function welcomeCoOwnerContentHtml(User $user, CoOwner $coOwner): string
    {
        $email = e((string) $user->email);
        $name = e(trim(($coOwner->first_name ?? '') . ' ' . ($coOwner->last_name ?? '')) ?: 'Votre compte');

        $cta = $this->buttonHtml('Accéder à mon espace', $this->frontendUrl());

        return <<<HTML
<div style="font-size:14px;color:#374151;line-height:1.7;">
  Bonjour <strong>{$name}</strong>,<br><br>
  Votre compte copropriétaire est maintenant <strong>activé</strong>. Vous pouvez vous connecter et accéder à votre espace.
</div>

<div style="height:14px"></div>

<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #eef2f7;border-radius:14px;overflow:hidden;">
  <tr>
    <td style="padding:14px;background:#f9fafb;">
      <div style="font-size:14px;font-weight:900;color:#111827;">Vos identifiants</div>
      <div style="font-size:13px;color:#6b7280;margin-top:6px;">Email : <strong>{$email}</strong></div>
    </td>
  </tr>
  <tr>
    <td style="padding:14px;">
      <div style="font-size:13px;color:#374151;line-height:1.6;">
        Vous pouvez dès maintenant consulter vos informations, les délégations reçues, et gérer vos biens.
      </div>
      <div style="height:14px"></div>
      {$cta}
    </td>
  </tr>
</table>

<div style="height:14px"></div>
<div style="font-size:12px;color:#6b7280;line-height:1.6;">
  Conseil sécurité : ne partagez jamais votre mot de passe.
</div>
HTML;
    }

    private function landlordCoOwnerActivatedContentHtml(CoOwnerInvitation $invitation, User $coOwnerUser, CoOwner $coOwner): string
    {
        $coOwnerName = e(trim(($coOwner->first_name ?? '') . ' ' . ($coOwner->last_name ?? '')) ?: ($invitation->name ?? 'Copropriétaire'));
        $coOwnerEmail = e((string) $coOwnerUser->email);

        $cta = $this->buttonHtml('Ouvrir le dashboard', $this->frontendUrl());

        return <<<HTML
<div style="font-size:14px;color:#374151;line-height:1.7;">
  Bonjour,<br><br>
  Bonne nouvelle : le copropriétaire invité a finalisé son inscription et son compte est maintenant <strong>actif</strong>.
</div>

<div style="height:14px"></div>

<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #eef2f7;border-radius:14px;overflow:hidden;">
  <tr>
    <td style="padding:14px;background:#f9fafb;">
      <div style="font-size:14px;font-weight:900;color:#111827;">Copropriétaire activé</div>
      <div style="font-size:13px;color:#6b7280;margin-top:6px;">Nom : <strong>{$coOwnerName}</strong></div>
      <div style="font-size:13px;color:#6b7280;margin-top:6px;">Email : <strong>{$coOwnerEmail}</strong></div>
    </td>
  </tr>
  <tr>
    <td style="padding:14px;">
      <div style="font-size:13px;color:#374151;line-height:1.6;">
        Vous pouvez maintenant lui déléguer des propriétés et gérer les collaborations.
      </div>
      <div style="height:14px"></div>
      {$cta}
    </td>
  </tr>
</table>
HTML;
    }

    private function welcomeTenantContentHtml(User $user, Tenant $tenant): string
    {
        $email = e((string) $user->email);
        $name = e(trim(($tenant->first_name ?? '') . ' ' . ($tenant->last_name ?? '')) ?: 'Votre compte');

        $cta = $this->buttonHtml('Accéder à mon espace', $this->frontendUrl());

        return <<<HTML
<div style="font-size:14px;color:#374151;line-height:1.7;">
  Bonjour <strong>{$name}</strong>,<br><br>
  Votre compte locataire est maintenant <strong>activé</strong>. Vous pouvez vous connecter et accéder à votre espace.
</div>

<div style="height:14px"></div>

<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #eef2f7;border-radius:14px;overflow:hidden;">
  <tr>
    <td style="padding:14px;background:#f9fafb;">
      <div style="font-size:14px;font-weight:900;color:#111827;">Vos identifiants</div>
      <div style="font-size:13px;color:#6b7280;margin-top:6px;">Email : <strong>{$email}</strong></div>
    </td>
  </tr>
  <tr>
    <td style="padding:14px;">
      <div style="font-size:13px;color:#374151;line-height:1.6;">
        Vous pouvez dès maintenant consulter vos informations, vos baux, et échanger avec votre bailleur.
      </div>
      <div style="height:14px"></div>
      {$cta}
    </td>
  </tr>
</table>

<div style="height:14px"></div>
<div style="font-size:12px;color:#6b7280;line-height:1.6;">
  Conseil sécurité : ne partagez jamais votre mot de passe.
</div>
HTML;
    }

    private function landlordTenantActivatedContentHtml(TenantInvitation $invitation, User $tenantUser, Tenant $tenant): string
    {
        $tenantName = e(trim(($tenant->first_name ?? '') . ' ' . ($tenant->last_name ?? '')) ?: ($invitation->name ?? 'Locataire'));
        $tenantEmail = e((string) $tenantUser->email);

        $cta = $this->buttonHtml('Ouvrir le dashboard', $this->frontendUrl());

        return <<<HTML
<div style="font-size:14px;color:#374151;line-height:1.7;">
  Bonjour,<br><br>
  Bonne nouvelle : le locataire invité a finalisé son inscription et son compte est maintenant <strong>actif</strong>.
</div>

<div style="height:14px"></div>

<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #eef2f7;border-radius:14px;overflow:hidden;">
  <tr>
    <td style="padding:14px;background:#f9fafb;">
      <div style="font-size:14px;font-weight:900;color:#111827;">Locataire activé</div>
      <div style="font-size:13px;color:#6b7280;margin-top:6px;">Nom : <strong>{$tenantName}</strong></div>
      <div style="font-size:13px;color:#6b7280;margin-top:6px;">Email : <strong>{$tenantEmail}</strong></div>
    </td>
  </tr>
  <tr>
    <td style="padding:14px;">
      <div style="font-size:13px;color:#374151;line-height:1.6;">
        Vous pouvez maintenant lui attribuer un bail, gérer les échanges, et suivre les demandes.
      </div>
      <div style="height:14px"></div>
      {$cta}
    </td>
  </tr>
</table>
HTML;
    }

    /* =========================
     * Auth endpoints
     * ========================= */

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

    /**
     * Register co-owner (creates user + co-owner record)
     */
    public function registerCoOwner(StoreCoOwnerRequest $request): JsonResponse
    {
        $data = $request->validated();
        $result = $this->authService->registerCoOwner($data);

        return response()->json([
            'status' => 'success',
            'message' => 'Co-owner registered successfully',
            'data' => $result
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
     * Appelé via le lien signé dans l'email pour les copropriétaires.
     * Redirige vers le front avec token + email.
     */
    public function acceptCoOwnerInvitation(Request $request, $invitationId)
    {
        $invitation = CoOwnerInvitation::where('id', $invitationId)
            ->whereNull('accepted_at')
            ->where('expires_at', '>', now())
            ->firstOrFail();

        $frontendUrl = config('app.frontend_url', 'http://localhost:8080');

        return redirect()->away(
            rtrim($frontendUrl, '/') .
            '/activation/coproprietaire?token=' . urlencode($invitation->token) .
            '&email=' . urlencode($invitation->email)
        );
    }

    /**
     * Le copropriétaire soumet son mot de passe depuis le front.
     * Crée / met à jour le User + crée CoOwner + assigne le rôle co_owner.
     * ✅ Envoie: Bienvenue copropriétaire + Notification bailleur
     */
    public function setCoOwnerPassword(Request $request)
    {
        try {
            $data = $request->validate([
                'token' => 'required|string',
                'email' => 'required|email',
                'password' => 'required|string|min:8|confirmed',
            ]);

            $invitation = CoOwnerInvitation::where('token', $data['token'])
                ->where('email', $data['email'])
                ->whereNull('accepted_at')
                ->where('expires_at', '>', now())
                ->first();

            if (!$invitation) {
                throw ValidationException::withMessages([
                    'token' => ['Invitation invalide ou expirée.'],
                ]);
            }

            // ✅ Prépare ref email
            $ref = $this->coOwnerInvitationRef($invitation);

            // Utiliser une transaction pour gérer les erreurs
            return DB::transaction(function () use ($data, $invitation, $ref) {
                // 1) Récupérer ou créer le user avec vérification du téléphone
                $user = User::where('email', $data['email'])->first();
                $phoneFromInvitation = $invitation->meta['phone'] ?? null;

                if (!$user) {
                    // Vérifier si le numéro de téléphone existe déjà avant de créer l'utilisateur
                    if ($phoneFromInvitation && User::where('phone', $phoneFromInvitation)->exists()) {
                        throw ValidationException::withMessages([
                            'phone' => ['Ce numéro de téléphone est déjà utilisé par un autre compte. Veuillez utiliser un numéro différent.'],
                        ]);
                    }

                    $user = User::create([
                        'email' => $invitation->email,
                        'password' => Hash::make($data['password']),
                        'phone' => $phoneFromInvitation,
                        'email_verified_at' => now(),
                    ]);
                } else {
                    // Vérifier si on essaie de mettre à jour avec un téléphone déjà utilisé par un autre utilisateur
                    if ($phoneFromInvitation &&
                        $user->phone !== $phoneFromInvitation &&
                        User::where('phone', $phoneFromInvitation)->where('id', '!=', $user->id)->exists()) {
                        throw ValidationException::withMessages([
                            'phone' => ['Ce numéro de téléphone est déjà utilisé par un autre compte. Veuillez utiliser un numéro différent.'],
                        ]);
                    }

                    $user->password = Hash::make($data['password']);
                    $user->email_verified_at = $user->email_verified_at ?? now();
                    if ($phoneFromInvitation) {
                        $user->phone = $phoneFromInvitation;
                    }
                    $user->save();
                }

                // 2) Rôle co_owner
                if (method_exists($user, 'assignRole')) {
                    $user->assignRole('co_owner');
                }

                // 3) Créer / lier le CoOwner
                $parts = preg_split('/\s+/', (string) $invitation->name, 2);
                $firstName = $invitation->meta['first_name'] ?? $parts[0] ?? ($invitation->name ?? 'Copropriétaire');
                $lastName  = $invitation->meta['last_name'] ?? $parts[1] ?? '';

                // ✅ CORRECTION ICI : Utiliser updateOrCreate au lieu de firstOrCreate
                $coOwner = CoOwner::updateOrCreate(
                    ['user_id' => $user->id],
                    [
                        'first_name' => $firstName,
                        'last_name' => $lastName,
                        'company_name' => $invitation->meta['company_name'] ?? null,
                        'address_billing' => $invitation->meta['address_billing'] ?? null,
                        'phone' => $invitation->meta['phone'] ?? null,
                        'license_number' => $invitation->meta['license_number'] ?? null,
                        'is_professional' => $invitation->meta['is_professional'] ?? false,
                        'ifu' => $invitation->meta['ifu'] ?? null,
                        'rccm' => $invitation->meta['rccm'] ?? null,
                        'vat_number' => $invitation->meta['vat_number'] ?? null,
                        'meta' => $invitation->meta ?? null,
                        'landlord_id' => $invitation->landlord_id,
                        'invitation_id' => $invitation->id,
                        'status' => 'active',
                        'joined_at' => now(),
                    ]
                );

                // 4) Marquer l'invitation comme acceptée
                $invitation->accepted_at = now();
                $invitation->co_owner_user_id = $user->id;
                $invitation->save();

                // 5) Générer un token pour connexion auto
                $token = $user->createToken('co-owner-login')->plainTextToken;

                // ✅ EMAILS (les vrais)
                // A) Bienvenue copropriétaire
                $coOwnerTitle = 'Bienvenue ! Votre compte copropriétaire est activé ✅';
                $coOwnerSubject = "🎉 Bienvenue sur {$this->appName()}";
                $coOwnerContent = $this->welcomeCoOwnerContentHtml($user, $coOwner);
                $this->trySendMail($user->email, $coOwnerSubject, $coOwnerTitle, $ref, $coOwnerContent);

                // B) Info bailleur
                $landlordEmail = $this->resolveLandlordEmailFromCoOwnerInvitation($invitation);
                if ($landlordEmail) {
                    $landlordTitle = 'Copropriétaire activé ✅';
                    $landlordSubject = "✅ Copropriétaire activé : {$user->email}";
                    $landlordContent = $this->landlordCoOwnerActivatedContentHtml($invitation, $user, $coOwner);
                    $this->trySendMail($landlordEmail, $landlordSubject, $landlordTitle, $ref, $landlordContent);
                } else {
                    Log::warning('[auth-mail] landlord email missing (co-owner activation)', [
                        'invitation_id' => $invitation->id,
                        'landlord_id' => $invitation->landlord_id,
                    ]);
                }

                return response()->json([
                    'message' => 'Compte copropriétaire créé avec succès.',
                    'token'   => $token,
                    'user'    => [
                        'id'    => $user->id,
                        'email' => $user->email,
                        'roles' => method_exists($user, 'getRoleNames')
                            ? $user->getRoleNames()
                            : ['co_owner'],
                    ],
                    'co_owner' => $coOwner,
                ]);
            });

        } catch (ValidationException $e) {
            // Erreur de validation (y compris notre vérification de téléphone)
            throw $e;

        } catch (QueryException $e) {
            // Erreur SQL (contrainte d'unicité)
            if ($e->getCode() == '23000' && str_contains($e->getMessage(), 'users_phone_unique')) {
                Log::error('Erreur téléphone dupliqué lors de la création de co-owner', [
                    'email' => $data['email'] ?? null,
                    'phone' => $invitation->meta['phone'] ?? null,
                    'error' => $e->getMessage(),
                ]);

                throw ValidationException::withMessages([
                    'phone' => [
                        'Ce numéro de téléphone est déjà utilisé dans le système. ' .
                        'Si c\'est votre numéro, veuillez contacter l\'assistance. ' .
                        'Sinon, utilisez un numéro différent.'
                    ],
                ]);
            }

            // Autre erreur SQL
            Log::error('Erreur SQL lors de la création de co-owner', [
                'email' => $data['email'] ?? null,
                'error' => $e->getMessage(),
            ]);

            throw ValidationException::withMessages([
                'database' => ['Une erreur de base de données est survenue. Veuillez réessayer plus tard.'],
            ]);

        } catch (\Exception $e) {
            // Erreur générale
            Log::error('Erreur lors de la création de co-owner', [
                'email' => $data['email'] ?? null,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            throw ValidationException::withMessages([
                'general' => ['Une erreur est survenue lors de la création de votre compte. Veuillez réessayer.'],
            ]);
        }
    }

    private function resolveLandlordEmailFromCoOwnerInvitation(CoOwnerInvitation $invitation): ?string
    {
        // Cas A: relation ->landlord->user->email
        $email = $invitation->landlord?->user?->email ?? null;
        if ($email) return $email;

        // Cas B: landlord_id est un users.id (rare mais possible)
        if (!empty($invitation->landlord_id)) {
            $u = User::find($invitation->landlord_id);
            if ($u?->email) return $u->email;
        }

        // Cas C: landlord_id est un landlords.id -> on retrouve user via landlord.user_id
        if (!empty($invitation->landlord_id)) {
            $landlord = Landlord::find($invitation->landlord_id);
            if ($landlord && !empty($landlord->user_id)) {
                $u = User::find($landlord->user_id);
                if ($u?->email) return $u->email;
            }
        }

        return null;
    }

    /**
     * Appelé via le lien signé dans l'email.
     * Redirige vers le front avec token + email.
     */
    public function acceptInvitation(Request $request, $invitationId)
    {
        $invitation = TenantInvitation::where('id', $invitationId)
            ->whereNull('accepted_at')
            ->where('expires_at', '>', now())
            ->firstOrFail();

        $frontendUrl = config('app.frontend_url', 'http://localhost:8080');

        return redirect()->away(
            rtrim($frontendUrl, '/') .
            '/activation/locataire?token=' . urlencode($invitation->token) .
            '&email=' . urlencode($invitation->email)
        );
    }

    /**
     * Le locataire soumet son mot de passe depuis le front.
     * Crée / met à jour le User + crée Tenant + assigne le rôle tenant.
     * ✅ Envoie: Bienvenue locataire + Notification bailleur
     */
    public function completeTenantRegistration(Request $request)
    {
        try {
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

            if (!$invitation) {
                throw ValidationException::withMessages([
                    'token' => ['Invitation invalide ou expirée.'],
                ]);
            }

            Log::info('Tenant invitation found:', [
                'id' => $invitation->id,
                'email' => $invitation->email,
                'meta' => $invitation->meta,
                'phone_in_meta' => $invitation->meta['phone'] ?? 'null'
            ]);

            // ✅ Prépare ref email
            $ref = $this->invitationRef($invitation);

            // Utiliser une transaction pour gérer les erreurs
            return DB::transaction(function () use ($data, $invitation, $ref) {
                // 1) Récupérer ou créer le user avec vérification du téléphone
                $user = User::where('email', $data['email'])->first();
                $phoneFromInvitation = $invitation->meta['phone'] ?? null;

                if (!$user) {
                    // Vérifier si le numéro de téléphone existe déjà avant de créer l'utilisateur
                    if ($phoneFromInvitation && User::where('phone', $phoneFromInvitation)->exists()) {
                        throw ValidationException::withMessages([
                            'phone' => ['Ce numéro de téléphone est déjà utilisé par un autre compte. Veuillez utiliser un numéro différent.'],
                        ]);
                    }

                    $user = User::create([
                        'email' => $invitation->email,
                        'password' => Hash::make($data['password']),
                        'phone' => $phoneFromInvitation,
                        'email_verified_at' => now(),
                    ]);

                    Log::info('New tenant user created:', ['id' => $user->id, 'phone' => $user->phone]);
                } else {
                    // Vérifier si on essaie de mettre à jour avec un téléphone déjà utilisé par un autre utilisateur
                    if ($phoneFromInvitation &&
                        $user->phone !== $phoneFromInvitation &&
                        User::where('phone', $phoneFromInvitation)->where('id', '!=', $user->id)->exists()) {
                        throw ValidationException::withMessages([
                            'phone' => ['Ce numéro de téléphone est déjà utilisé par un autre compte. Veuillez utiliser un numéro différent.'],
                        ]);
                    }

                    $user->password = Hash::make($data['password']);
                    $user->email_verified_at = $user->email_verified_at ?? now();
                    if ($phoneFromInvitation) {
                        $user->phone = $phoneFromInvitation;
                    }
                    $user->save();

                    Log::info('Existing tenant user updated:', ['id' => $user->id, 'phone' => $user->phone]);
                }

                // 2) Rôle tenant
                if (method_exists($user, 'assignRole')) {
                    $user->assignRole('tenant');
                }

                // 3) Créer / lier le Tenant
                $parts = preg_split('/\s+/', (string) $invitation->name, 2);
                $firstName = $parts[0] ?? ($invitation->name ?? 'Locataire');
                $lastName  = $parts[1] ?? '';

                $tenant = Tenant::firstOrCreate(
                    ['user_id' => $user->id],
                    [
                        'first_name' => $firstName,
                        'last_name' => $lastName,
                        'status' => 'active',
                        'solvency_score' => 0,
                        'meta' => [
                            'invitation_email' => $invitation->email,
                            'landlord_id' => $invitation->landlord_id,
                            'invitation_id' => $invitation->id,
                        ],
                    ]
                );

                // 4) Marquer l'invitation comme acceptée
                $invitation->accepted_at = now();
                $invitation->tenant_user_id = $user->id;
                $invitation->save();

                // 5) Générer un token pour connexion auto
                $token = $user->createToken('tenant-login')->plainTextToken;

                // ✅ EMAILS (les vrais)
                // A) Bienvenue locataire
                $tenantTitle = 'Bienvenue ! Votre compte est activé ✅';
                $tenantSubject = "🎉 Bienvenue sur {$this->appName()}";
                $tenantContent = $this->welcomeTenantContentHtml($user, $tenant);
                $this->trySendMail($user->email, $tenantSubject, $tenantTitle, $ref, $tenantContent);

                // B) Info bailleur
                $landlordEmail = $this->resolveLandlordEmailFromInvitation($invitation);
                if ($landlordEmail) {
                    $landlordTitle = 'Locataire activé ✅';
                    $landlordSubject = "✅ Locataire activé : {$user->email}";
                    $landlordContent = $this->landlordTenantActivatedContentHtml($invitation, $user, $tenant);
                    $this->trySendMail($landlordEmail, $landlordSubject, $landlordTitle, $ref, $landlordContent);
                } else {
                    Log::warning('[auth-mail] landlord email missing (tenant activation)', [
                        'invitation_id' => $invitation->id,
                        'landlord_id' => $invitation->landlord_id,
                    ]);
                }

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
            });

        } catch (ValidationException $e) {
            // Erreur de validation (y compris notre vérification de téléphone)
            throw $e;

        } catch (QueryException $e) {
            // Erreur SQL (contrainte d'unicité)
            if ($e->getCode() == '23000' && str_contains($e->getMessage(), 'users_phone_unique')) {
                Log::error('Erreur téléphone dupliqué lors de la création de locataire', [
                    'email' => $data['email'] ?? null,
                    'phone' => $invitation->meta['phone'] ?? null,
                    'error' => $e->getMessage(),
                ]);

                throw ValidationException::withMessages([
                    'phone' => [
                        'Ce numéro de téléphone est déjà utilisé dans le système. ' .
                        'Si c\'est votre numéro, veuillez contacter l\'assistance. ' .
                        'Sinon, utilisez un numéro différent.'
                    ],
                ]);
            }

            // Autre erreur SQL
            Log::error('Erreur SQL lors de la création de locataire', [
                'email' => $data['email'] ?? null,
                'error' => $e->getMessage(),
            ]);

            throw ValidationException::withMessages([
                'database' => ['Une erreur de base de données est survenue. Veuillez réessayer plus tard.'],
            ]);

        } catch (\Exception $e) {
            // Erreur générale
            Log::error('Erreur lors de la création de locataire', [
                'email' => $data['email'] ?? null,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            throw ValidationException::withMessages([
                'general' => ['Une erreur est survenue lors de la création de votre compte. Veuillez réessayer.'],
            ]);
        }
    }
}
