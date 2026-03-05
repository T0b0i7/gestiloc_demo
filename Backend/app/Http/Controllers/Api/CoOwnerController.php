<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\InviteCoOwnerRequest;
use App\Models\CoOwner;
use App\Models\CoOwnerInvitation;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Str;

class CoOwnerController extends Controller
{
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

        Log::info('[co-owner-mail] sent', ['to' => $to, 'subject' => $subject]);
    }

    private function trySendMail(string $to, string $subject, string $title, string $ref, string $contentHtml): void
    {
        try {
            $html = $this->mailLayoutHtml($title, e($ref), $contentHtml);
            $this->sendHtmlEmail($to, $subject, $html);
        } catch (\Throwable $e) {
            Log::error('[co-owner-mail] failed', [
                'to' => $to,
                'subject' => $subject,
                'error' => $e->getMessage(),
            ]);
        }
    }

    private function invitationRef(CoOwnerInvitation $inv): string
    {
        return 'CO-INV-' . str_pad((string) $inv->id, 6, '0', STR_PAD_LEFT);
    }

    private function inviteCardHtml(CoOwnerInvitation $inv, string $signedUrl, string $invitationType): string
    {
        $email = e((string) $inv->email);
        $name = e((string) $inv->name);
        $exp = $inv->expires_at ? e($inv->expires_at->format('d/m/Y H:i')) : '—';
        $cta = $this->buttonHtml('Créer mon compte', $signedUrl);

        $typeLabel = $invitationType === 'agency' ? 'Agence Immobilière' : 'Copropriétaire';

        return <<<HTML
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #eef2f7;border-radius:14px;overflow:hidden;">
  <tr>
    <td style="padding:14px 14px;background:#f9fafb;">
      <div style="font-size:14px;font-weight:900;color:#111827;">Invitation {$typeLabel}</div>
      <div style="font-size:13px;color:#6b7280;margin-top:4px;">Nom : {$name}</div>
      <div style="font-size:13px;color:#6b7280;margin-top:4px;">Email : {$email}</div>
      <div style="font-size:13px;color:#6b7280;margin-top:4px;">Expire : {$exp}</div>
    </td>
  </tr>
  <tr>
    <td style="padding:14px;">
      <div style="font-size:13px;color:#374151;line-height:1.6;">
        Cliquez sur le bouton ci-dessous pour créer votre compte {$typeLabel} et définir votre mot de passe.
      </div>
      <div style="height:14px"></div>
      {$cta}
      <div style="height:10px"></div>
      <div style="font-size:12px;color:#6b7280;line-height:1.6;">
        Si le bouton ne fonctionne pas, copiez/collez ce lien dans votre navigateur :
        <br><span style="word-break:break-all;">{$signedUrl}</span>
      </div>
    </td>
  </tr>
</table>
HTML;
    }

    public function invite(InviteCoOwnerRequest $request): JsonResponse
    {
        $data = $request->validated();
        $user = $request->user();

        if (!$user->isLandlord()) {
            return response()->json(['message' => 'Forbidden - Seuls les propriétaires peuvent inviter des gestionnaires'], 403);
        }

        $existingInvitation = CoOwnerInvitation::where('email', $data['email'])
            ->whereNull('accepted_at')
            ->where('expires_at', '>', now())
            ->first();

        if ($existingInvitation) {
            return response()->json([
                'message' => 'Une invitation est déjà en cours pour cet email',
                'invitation' => [
                    'id' => $existingInvitation->id,
                    'email' => $existingInvitation->email,
                    'expires_at' => $existingInvitation->expires_at,
                ]
            ], 409);
        }

        $existingUser = User::where('email', $data['email'])->first();
        if ($existingUser) {
            if ($existingUser->isCoOwner()) {
                return response()->json([
                    'message' => 'Cet utilisateur est déjà un co-propriétaire'
                ], 409);
            }

            if ($existingUser->isLandlord()) {
                return response()->json([
                    'message' => 'Cet utilisateur est déjà un propriétaire'
                ], 409);
            }
        }

        $invitationType = $data['invitation_type'];
        $isProfessional = $data['is_professional'];

        return DB::transaction(function () use ($data, $user, $invitationType, $isProfessional) {

            $invitation = CoOwnerInvitation::create([
                'invited_by_type' => 'landlord',
                'invited_by_id' => $user->landlord->id,
                'target_type' => 'co_owner',
                'landlord_id' => $user->landlord->id,
                'co_owner_user_id' => null,
                'email' => $data['email'],
                'name' => trim(($data['first_name'] ?? '') . ' ' . ($data['last_name'] ?? '')),
                'token' => CoOwnerInvitation::makeToken(),
                'expires_at' => now()->addDays(7),
                'meta' => [
                    'first_name' => $data['first_name'] ?? null,
                    'last_name' => $data['last_name'] ?? null,
                    'company_name' => $data['company_name'] ?? null,
                    'phone' => $data['phone'] ?? null,
                    'is_professional' => $isProfessional,
                    'invitation_type' => $invitationType,
                    'license_number' => $data['license_number'] ?? null,
                    'address_billing' => $data['address_billing'] ?? null,
                    'ifu' => $data['ifu'] ?? null,
                    'rccm' => $data['rccm'] ?? null,
                    'vat_number' => $data['vat_number'] ?? null,
                ],
            ]);

            $signedUrl = URL::temporarySignedRoute(
                'api.auth.accept-co-owner-invitation',
                now()->addDays(7),
                ['invitationId' => $invitation->id]
            );

            $ref = $this->invitationRef($invitation);
            $toTarget = $data['email'];

            if ($invitationType === 'agency') {
                $typeLabel = 'Agence Immobilière';
                $emailTitle = 'Invitation en tant qu\'Agence Immobilière ✉️';
                $emailSubject = "✉️ Invitation Gestiloc Agence : ";
                $welcomeText = "Vous avez été invité(e) à rejoindre <strong>{$this->appName()}</strong> en tant qu'agence immobilière.";
            } else {
                $typeLabel = 'Copropriétaire';
                $emailTitle = 'Invitation à créer votre compte copropriétaire ✉️';
                $emailSubject = "✉️ Invitation Gestiloc Copropriétaire : ";
                $welcomeText = "Vous avez été invité(e) à rejoindre <strong>{$this->appName()}</strong> en tant que copropriétaire.";
            }

            $content = <<<HTML
<div style="font-size:14px;color:#374151;line-height:1.7;">
  Bonjour,<br><br>
  {$welcomeText}
  Pour accéder à votre espace et définir votre mot de passe, utilisez l'invitation ci-dessous.
</div>
<div style="height:14px"></div>
{$this->inviteCardHtml($invitation, $signedUrl, $invitationType)}
<div style="height:16px"></div>
{$this->buttonHtml('Ouvrir Gestiloc', $this->frontendUrl())}
HTML;

            $this->trySendMail($toTarget, $emailSubject . $ref, $emailTitle, $ref, $content);

            $toInviter = $user->email;
            if ($toInviter) {
                $confirmationTitle = $invitationType === 'agency'
                    ? 'Invitation agence envoyée ✅'
                    : 'Invitation copropriétaire envoyée ✅';
                $confirmationSubject = $invitationType === 'agency'
                    ? "✅ Invitation agence envoyée : "
                    : "✅ Invitation copropriétaire envoyée : ";

                $content2 = <<<HTML
<div style="font-size:14px;color:#374151;line-height:1.7;">
  Bonjour,<br><br>
  Votre invitation {$typeLabel} a bien été envoyée.
</div>
<div style="height:14px"></div>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #eef2f7;border-radius:14px;overflow:hidden;">
  <tr>
    <td style="padding:14px;background:#f9fafb;">
      <div style="font-size:14px;font-weight:900;color:#111827;">Récap</div>
      <div style="font-size:13px;color:#6b7280;margin-top:4px;">Type : <strong>{$typeLabel}</strong></div>
      <div style="font-size:13px;color:#6b7280;margin-top:4px;">Nom : <strong>{e($invitation->name)}</strong></div>
      <div style="font-size:13px;color:#6b7280;margin-top:4px;">Email : <strong>{e($invitation->email)}</strong></div>
      <div style="font-size:13px;color:#6b7280;margin-top:4px;">Expire : <strong>{e($invitation->expires_at?->format('d/m/Y H:i') ?? '—')}</strong></div>
    </td>
  </tr>
</table>
<div style="height:16px"></div>
{$this->buttonHtml('Voir mes invitations', $this->frontendUrl())}
HTML;

                $this->trySendMail($toInviter, $confirmationSubject . $ref, $confirmationTitle, $ref, $content2);
            }

            return response()->json([
                'message' => "Invitation {$typeLabel} créée et email envoyé.",
                'invitation' => [
                    'id' => $invitation->id,
                    'email' => $invitation->email,
                    'expires_at' => $invitation->expires_at,
                    'invitation_type' => $invitationType,
                    'is_professional' => $isProfessional,
                ],
            ], 201);
        });
    }

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user->isLandlord()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $landlord = $user->landlord;

        $coOwners = CoOwner::with([
            'user:id,email,phone',
            'delegations.property'
        ])
        ->where('landlord_id', $landlord->id)
        ->get();

        $coOwnersList = $coOwners->map(function (CoOwner $coOwner) {
            $user = $coOwner->user;
            $meta = $coOwner->meta ?? [];

            $isProfessional = (bool) $coOwner->is_professional;

            // MODIFICATION IMPORTANTE ICI : utiliser co_owner_type au lieu de invitation_type
            $coOwnerType = $coOwner->co_owner_type
                ?? $meta['invitation_type']
                ?? ($isProfessional ? 'agency' : 'co_owner');

            $delegations = $coOwner->delegations ? $coOwner->delegations->map(function ($delegation) {
                $property = $delegation->property ?? null;

                return [
                    'id' => $delegation->id,
                    'property_id' => $delegation->property_id,
                    'property' => $property ? [
                        'id' => $property->id,
                        'name' => $property->name ?? 'Bien sans nom',
                        'address' => $property->address ?? '',
                        'city' => $property->city ?? '',
                        'postal_code' => $property->postal_code ?? '',
                        'rent_amount' => $property->rent_amount ?? null,
                        'surface' => $property->surface ?? null,
                        'property_type' => $property->property_type ?? '',
                        'status' => $property->status ?? ''
                    ] : null,
                    'status' => $delegation->status,
                    'permissions' => $delegation->permissions ?? [],
                    'delegated_at' => $delegation->delegated_at?->toISOString(),
                    'expires_at' => $delegation->expires_at?->toISOString(),
                    'notes' => $delegation->notes,
                    'delegation_type' => $delegation->delegation_type,
                    'created_at' => $delegation->created_at?->toISOString(),
                    'updated_at' => $delegation->updated_at?->toISOString()
                ];
            })->values()->toArray() : [];

            return [
                'id' => $coOwner->id,
                'user_id' => $coOwner->user_id,
                'first_name' => $coOwner->first_name ?? '',
                'last_name' => $coOwner->last_name ?? '',
                'full_name' => trim(($coOwner->first_name ?? '') . ' ' . ($coOwner->last_name ?? '')),
                'email' => $user ? $user->email : '',
                'company_name' => $coOwner->company_name ?? '',
                'phone' => $coOwner->phone ?? ($user ? $user->phone : '') ?? ($meta['phone'] ?? ''),
                'address_billing' => $coOwner->address_billing ?? '',
                'is_professional' => $isProfessional,
                'co_owner_type' => $coOwnerType,
                'invitation_type' => $meta['invitation_type'] ?? ($isProfessional ? 'agency' : 'co_owner'), 
                'license_number' => $coOwner->license_number ?? '',
                'ifu' => $coOwner->ifu ?? ($meta['ifu'] ?? ''),
                'rccm' => $coOwner->rccm ?? ($meta['rccm'] ?? ''),
                'vat_number' => $coOwner->vat_number ?? ($meta['vat_number'] ?? ''),
                'status' => $coOwner->status ?? 'active',
                'joined_at' => $coOwner->joined_at?->toISOString() ?? $coOwner->created_at?->toISOString(),
                'created_at' => $coOwner->created_at?->toISOString(),
                'updated_at' => $coOwner->updated_at?->toISOString(),
                'meta' => $meta,
                'delegations' => $delegations,
                'delegations_count' => count($delegations)
            ];
        })->values();

        $invitations = CoOwnerInvitation::where('landlord_id', $landlord->id)
            ->whereNull('accepted_at')
            ->where('expires_at', '>', now())
            ->get()
            ->map(function ($invitation) {
                $meta = $invitation->meta ?? [];

                return [
                    'id' => $invitation->id,
                    'email' => $invitation->email,
                    'name' => $invitation->name,
                    'expires_at' => $invitation->expires_at?->toISOString(),
                    'created_at' => $invitation->created_at?->toISOString(),
                    'is_professional' => $meta['is_professional'] ?? false,
                    'invitation_type' => $meta['invitation_type']
                        ?? (($meta['is_professional'] ?? false) ? 'agency' : 'co_owner'),
                ];
            })->values();

        return response()->json([
            'data' => [
                'co_owners' => $coOwnersList,
                'invitations' => $invitations,
            ]
        ]);
    }

    public function acceptInvitationAndCreateCoOwner($invitationId, Request $request)
    {
        try {
            if (!$request->hasValidSignature()) {
                return response()->json(['message' => 'Lien invalide ou expiré'], 401);
            }

            $invitation = CoOwnerInvitation::findOrFail($invitationId);

            if ($invitation->accepted_at) {
                return response()->json(['message' => 'Cette invitation a déjà été acceptée'], 400);
            }

            if ($invitation->expires_at && $invitation->expires_at->isPast()) {
                return response()->json(['message' => 'Cette invitation a expirée'], 400);
            }

            $meta = $invitation->meta ?? [];

            return DB::transaction(function () use ($invitation, $meta) {
                $existingUser = User::where('email', $invitation->email)->first();

                if (!$existingUser) {
                    $existingUser = User::create([
                        'email' => $invitation->email,
                        'name' => $invitation->name,
                        'password' => Hash::make(Str::random(16)),
                        'phone' => $meta['phone'] ?? null,
                    ]);
                }

                // Déterminer le type de co-owner
                $invitationType = $meta['invitation_type'] ?? ($meta['is_professional'] ? 'agency' : 'co_owner');
                $coOwnerType = $invitationType === 'agency' ? 'agency' : 'co_owner';

                $coOwner = CoOwner::create([
                    'user_id' => $existingUser->id,
                    'landlord_id' => $invitation->landlord_id,
                    'first_name' => $meta['first_name'] ?? '',
                    'last_name' => $meta['last_name'] ?? '',
                    'company_name' => $meta['company_name'] ?? null,
                    'phone' => $meta['phone'] ?? null,
                    'license_number' => $meta['license_number'] ?? null,
                    'is_professional' => $meta['is_professional'] ?? false,
                    'co_owner_type' => $coOwnerType, // Important: définir le type dans la colonne
                    'ifu' => $meta['ifu'] ?? null,
                    'rccm' => $meta['rccm'] ?? null,
                    'vat_number' => $meta['vat_number'] ?? null,
                    'address_billing' => $meta['address_billing'] ?? null,
                    'meta' => $meta,
                    'status' => 'active',
                    'joined_at' => now(),
                    'invitation_id' => $invitation->id,
                ]);

                $invitation->update([
                    'accepted_at' => now(),
                    'co_owner_user_id' => $existingUser->id
                ]);

                Log::info('Co-owner créé avec succès', [
                    'co_owner_id' => $coOwner->id,
                    'user_id' => $existingUser->id,
                    'landlord_id' => $invitation->landlord_id,
                    'invitation_id' => $invitation->id,
                    'co_owner_type' => $coOwnerType,
                    'is_professional' => $meta['is_professional'] ?? false
                ]);

                return response()->json([
                    'message' => 'Compte co-propriétaire créé avec succès',
                    'co_owner' => [
                        'id' => $coOwner->id,
                        'email' => $existingUser->email,
                        'first_name' => $coOwner->first_name,
                        'last_name' => $coOwner->last_name,
                        'co_owner_type' => $coOwnerType,
                        'is_professional' => $meta['is_professional'] ?? false
                    ],
                    'requires_password_setup' => true
                ]);
            });

        } catch (\Exception $e) {
            Log::error('Erreur acceptation invitation co-owner', [
                'invitation_id' => $invitationId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'message' => 'Erreur lors de l\'acceptation de l\'invitation',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
