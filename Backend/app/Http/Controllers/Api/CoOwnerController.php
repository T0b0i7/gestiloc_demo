<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\InviteCoOwnerRequest;
use App\Models\CoOwnerInvitation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class CoOwnerController extends Controller
{
    /* =========================
     * Helpers emails
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

    private function landlordEmail(Request $request): ?string
    {
        return $request->user()?->email ?: null;
    }

    private function invitationRef(CoOwnerInvitation $inv): string
    {
        return 'CO-INV-' . str_pad((string) $inv->id, 6, '0', STR_PAD_LEFT);
    }

    private function coOwnerInviteCardHtml(CoOwnerInvitation $inv, string $signedUrl): string
    {
        $email = e((string) $inv->email);
        $name = e((string) $inv->name);
        $exp = $inv->expires_at ? e($inv->expires_at->format('d/m/Y H:i')) : '—';
        $cta = $this->buttonHtml('Créer mon compte', $signedUrl);

        return <<<HTML
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #eef2f7;border-radius:14px;overflow:hidden;">
  <tr>
    <td style="padding:14px 14px;background:#f9fafb;">
      <div style="font-size:14px;font-weight:900;color:#111827;">Invitation Copropriétaire</div>
      <div style="font-size:13px;color:#6b7280;margin-top:4px;">Nom : {$name}</div>
      <div style="font-size:13px;color:#6b7280;margin-top:4px;">Email : {$email}</div>
      <div style="font-size:13px;color:#6b7280;margin-top:4px;">Expire : {$exp}</div>
    </td>
  </tr>
  <tr>
    <td style="padding:14px;">
      <div style="font-size:13px;color:#374151;line-height:1.6;">
        Cliquez sur le bouton ci-dessous pour créer votre compte copropriétaire et définir votre mot de passe.
      </div>
      <div style="height:14px"></div>
      {$cta}
      <div style="height:10px"></div>
      <div style="font-size:12px;color:#6b7280;line-height:1.6;">
        Si le bouton ne fonctionne pas, copiez/coltez ce lien dans votre navigateur :
        <br><span style="word-break:break-all;">{e($signedUrl)}</span>
      </div>
    </td>
  </tr>
</table>
HTML;
    }

    private function inviteCardHtml(CoOwnerInvitation $inv, string $signedUrl, string $targetType): string
    {
        $email = e((string) $inv->email);
        $name = e((string) $inv->name);
        $exp = $inv->expires_at ? e($inv->expires_at->format('d/m/Y H:i')) : '—';
        $targetLabel = $targetType === 'co_owner' ? 'Copropriétaire' : 'Propriétaire';
        $cta = $this->buttonHtml('Créer mon compte', $signedUrl);

        return <<<HTML
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #eef2f7;border-radius:14px;overflow:hidden;">
  <tr>
    <td style="padding:14px 14px;background:#f9fafb;">
      <div style="font-size:14px;font-weight:900;color:#111827;">Invitation {$targetLabel}</div>
      <div style="font-size:13px;color:#6b7280;margin-top:4px;">Nom : {$name}</div>
      <div style="font-size:13px;color:#6b7280;margin-top:4px;">Email : {$email}</div>
      <div style="font-size:13px;color:#6b7280;margin-top:4px;">Expire : {$exp}</div>
    </td>
  </tr>
  <tr>
    <td style="padding:14px;">
      <div style="font-size:13px;color:#374151;line-height:1.6;">
        Cliquez sur le bouton ci-dessous pour créer votre compte {$targetLabel} et définir votre mot de passe.
      </div>
      <div style="height:14px"></div>
      {$cta}
      <div style="height:10px"></div>
      <div style="font-size:12px;color:#6b7280;line-height:1.6;">
        Si le bouton ne fonctionne pas, copiez/coltez ce lien dans votre navigateur :
        <br><span style="word-break:break-all;">{e($signedUrl)}</span>
      </div>
    </td>
  </tr>
</table>
HTML;
    }

    /**
     * Invite un copropriétaire OU un propriétaire (bidirectionnel).
     * - Crée une entrée dans co_owner_invitations
     * - Envoie un email avec un lien signé
     */
    public function invite(InviteCoOwnerRequest $request): JsonResponse
    {
        $data = $request->validated();
        $user = $request->user();

        // Vérifier que l'utilisateur peut inviter (landlord OU co_owner)
        if (! $user->isLandlord() && ! $user->isCoOwner()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        // Déterminer qui invite et qui est la cible
        if ($user->isLandlord()) {
            $invitedByType = 'landlord';
            $invitedById = $user->landlord->id;
            $targetType = 'co_owner';
            $landlordId = $user->landlord->id;
            $coOwnerUserId = null;
            $emailSubject = "✉️ Invitation Gestiloc Copropriétaire : ";
            $emailTitle = 'Invitation à créer votre compte copropriétaire ✉️';
            $confirmationTitle = 'Invitation copropriétaire envoyée ✅';
            $confirmationSubject = "✅ Invitation copropriétaire envoyée : ";
        } else {
            // Co-owner qui invite un landlord
            $invitedByType = 'co_owner';
            $invitedById = $user->id;
            $targetType = 'landlord';
            $landlordId = null;
            $coOwnerUserId = $user->id;
            $emailSubject = "✉️ Invitation Gestiloc Propriétaire : ";
            $emailTitle = 'Invitation à créer votre compte propriétaire ✉️';
            $confirmationTitle = 'Invitation propriétaire envoyée ✅';
            $confirmationSubject = "✅ Invitation propriétaire envoyée : ";
        }

        return DB::transaction(function () use ($data, $invitedByType, $invitedById, $targetType, $landlordId, $coOwnerUserId, $emailSubject, $emailTitle, $confirmationTitle, $confirmationSubject, $request, $user) {

            $invitation = CoOwnerInvitation::create([
                'invited_by_type' => $invitedByType,
                'invited_by_id' => $invitedById,
                'target_type' => $targetType,
                'landlord_id' => $landlordId,
                'co_owner_user_id' => $coOwnerUserId,
                'email' => $data['email'],
                'name' => trim(($data['first_name'] ?? '') . ' ' . ($data['last_name'] ?? '')),
                'token' => CoOwnerInvitation::makeToken(),
                'expires_at' => now()->addDays(7),
                'meta' => [
                    'first_name' => $data['first_name'] ?? null,
                    'last_name' => $data['last_name'] ?? null,
                    'company_name' => $data['company_name'] ?? null,
                    'phone' => $data['phone'] ?? null,
                    'is_professional' => $data['is_professional'] ?? false,
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

            // ✅ Email à la cible (invitation)
            $ref = $this->invitationRef($invitation);
            $toTarget = (string) $data['email'];
            $targetLabel = $targetType == 'co_owner' ? 'copropriétaire' : 'propriétaire';

            $content = <<<HTML
<div style="font-size:14px;color:#374151;line-height:1.7;">
  Bonjour,<br><br>
  Vous avez été invité(e) à rejoindre <strong>{$this->appName()}</strong> en tant que {$targetLabel}.
  Pour accéder à votre espace et définir votre mot de passe, utilisez l'invitation ci-dessous.
</div>
<div style="height:14px"></div>
{$this->inviteCardHtml($invitation, $signedUrl, $targetType)}
<div style="height:16px"></div>
{$this->buttonHtml('Ouvrir Gestiloc', $this->frontendUrl())}
HTML;

            $this->trySendMail($toTarget, $emailSubject . $ref, $emailTitle, $ref, $content);

            // ✅ Email à l'inviteur (confirmation)
            $toInviter = $user->email;
            if ($toInviter) {
                $targetLabel2 = $targetType == 'co_owner' ? 'copropriétaire' : 'propriétaire';
                $content2 = <<<HTML
<div style="font-size:14px;color:#374151;line-height:1.7;">
  Bonjour,<br><br>
  Votre invitation {$targetLabel2} a bien été envoyée.
</div>
<div style="height:14px"></div>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #eef2f7;border-radius:14px;overflow:hidden;">
  <tr>
    <td style="padding:14px;background:#f9fafb;">
      <div style="font-size:14px;font-weight:900;color:#111827;">Récap</div>
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
            } else {
                Log::warning('[co-owner-mail] inviter email missing (invite confirmation)', [
                    'invitation_id' => $invitation->id
                ]);
            }

            return response()->json([
                'message' => "Invitation {$targetLabel2} créée et email envoyé.",
                'invitation' => [
                    'id' => $invitation->id,
                    'email' => $invitation->email,
                    'expires_at' => $invitation->expires_at,
                    'target_type' => $targetType,
                ],
            ], 201);
        });
    }

    /**
     * Lister les copropriétaires et invitations d'un landlord
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        if (! $user->isLandlord()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $landlord = $user->landlord;

        // Récupérer les copropriétaires existants
        $coOwners = CoOwner::whereHas('user', function ($query) use ($landlord) {
                $query->whereHas('coOwnerInvitations', function ($q) use ($landlord) {
                    $q->where('landlord_id', $landlord->id);
                });
            })
            ->with('user:id,email')
            ->get(['id', 'user_id', 'first_name', 'last_name', 'company_name', 'is_professional']);

        $coOwnersList = $coOwners->map(function (CoOwner $coOwner) {
            $user = $coOwner->user;
            return [
                'id' => $coOwner->id,
                'first_name' => $coOwner->first_name,
                'last_name' => $coOwner->last_name,
                'full_name' => trim(($coOwner->first_name ?? '') . ' ' . ($coOwner->last_name ?? '')),
                'email' => $user->email ?? null,
                'company_name' => $coOwner->company_name,
                'is_professional' => $coOwner->is_professional,
            ];
        });

        // Récupérer les invitations en cours
        $invitations = CoOwnerInvitation::where('landlord_id', $landlord->id)
            ->whereNull('accepted_at')
            ->get([
                'id',
                'email',
                'name',
                'expires_at',
                'created_at',
            ]);

        return response()->json([
            'co_owners' => $coOwnersList,
            'invitations' => $invitations,
        ]);
    }
}
