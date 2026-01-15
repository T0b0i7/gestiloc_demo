<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\InviteTenantRequest;
use App\Models\TenantInvitation;
use App\Models\Lease;
use App\Models\Tenant;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class TenantController extends Controller
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
                Cet email a été envoyé automatiquement. Si vous n’êtes pas concerné, vous pouvez l’ignorer.
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

        Log::info('[tenant-mail] sent', ['to' => $to, 'subject' => $subject]);
    }

    private function trySendMail(string $to, string $subject, string $title, string $ref, string $contentHtml): void
    {
        try {
            $html = $this->mailLayoutHtml($title, e($ref), $contentHtml);
            $this->sendHtmlEmail($to, $subject, $html);
        } catch (\Throwable $e) {
            Log::error('[tenant-mail] failed', [
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

    private function invitationRef(TenantInvitation $inv): string
    {
        return 'INV-' . str_pad((string) $inv->id, 6, '0', STR_PAD_LEFT);
    }

    private function tenantInviteCardHtml(TenantInvitation $inv, string $signedUrl): string
    {
        $email = e((string) $inv->email);
        $name = e((string) $inv->name);
        $exp = $inv->expires_at ? e($inv->expires_at->format('d/m/Y H:i')) : '—';
        $cta = $this->buttonHtml('Créer mon compte', $signedUrl);

        return <<<HTML
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #eef2f7;border-radius:14px;overflow:hidden;">
  <tr>
    <td style="padding:14px 14px;background:#f9fafb;">
      <div style="font-size:14px;font-weight:900;color:#111827;">Invitation</div>
      <div style="font-size:13px;color:#6b7280;margin-top:4px;">Locataire : {$name}</div>
      <div style="font-size:13px;color:#6b7280;margin-top:4px;">Email : {$email}</div>
      <div style="font-size:13px;color:#6b7280;margin-top:4px;">Expire : {$exp}</div>
    </td>
  </tr>
  <tr>
    <td style="padding:14px;">
      <div style="font-size:13px;color:#374151;line-height:1.6;">
        Cliquez sur le bouton ci-dessous pour créer votre compte et définir votre mot de passe.
      </div>
      <div style="height:14px"></div>
      {$cta}
      <div style="height:10px"></div>
      <div style="font-size:12px;color:#6b7280;line-height:1.6;">
        Si le bouton ne fonctionne pas, copiez/collez ce lien dans votre navigateur :
        <br><span style="word-break:break-all;">{e($signedUrl)}</span>
      </div>
    </td>
  </tr>
</table>
HTML;
    }

    /**
     * Invite un locataire (bailleur connecté).
     * - Crée une entrée dans tenant_invitations
     * - Envoie un email avec un lien signé
     */
    public function invite(InviteTenantRequest $request): JsonResponse
    {
        $data = $request->validated();
        $user = $request->user();

        if (! $user->isLandlord()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $landlord = $user->landlord;
        if (! $landlord) {
            return response()->json(['message' => 'Landlord profile missing'], 422);
        }

        return DB::transaction(function () use ($data, $landlord, $request) {

            $invitation = TenantInvitation::create([
                'landlord_id'    => $landlord->id,
                'tenant_user_id' => null,
                'email'          => $data['email'],
                'name'           => trim(($data['first_name'] ?? '') . ' ' . ($data['last_name'] ?? '')),
                'token'          => TenantInvitation::makeToken(),
                'expires_at'     => now()->addDays(7),
            ]);

            $signedUrl = URL::temporarySignedRoute(
                'api.auth.accept-invitation',
                now()->addDays(7),
                ['invitationId' => $invitation->id]
            );

            // ✅ Email au locataire (invitation)
            $ref = $this->invitationRef($invitation);
            $toTenant = (string) $data['email'];

            $title = 'Invitation à créer votre compte ✉️';
            $subject = "✉️ Invitation Gestiloc : {$ref}";

            $content = <<<HTML
<div style="font-size:14px;color:#374151;line-height:1.7;">
  Bonjour,<br><br>
  Vous avez été invité(e) à rejoindre <strong>{$this->appName()}</strong>.
  Pour accéder à votre espace locataire et définir votre mot de passe, utilisez l’invitation ci-dessous.
</div>
<div style="height:14px"></div>
{$this->tenantInviteCardHtml($invitation, $signedUrl)}
<div style="height:16px"></div>
{$this->buttonHtml('Ouvrir Gestiloc', $this->frontendUrl())}
HTML;

            $this->trySendMail($toTenant, $subject, $title, $ref, $content);

            // ✅ Email au bailleur (confirmation)
            $toLandlord = $this->landlordEmail($request);
            if ($toLandlord) {
                $title2 = 'Invitation envoyée ✅';
                $subject2 = "✅ Invitation envoyée : {$ref}";

                $content2 = <<<HTML
<div style="font-size:14px;color:#374151;line-height:1.7;">
  Bonjour,<br><br>
  Votre invitation a bien été envoyée au locataire.
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
{$this->buttonHtml('Voir mes locataires', $this->frontendUrl())}
HTML;

                $this->trySendMail($toLandlord, $subject2, $title2, $ref, $content2);
            } else {
                Log::warning('[tenant-mail] landlord email missing (invite confirmation)', [
                    'invitation_id' => $invitation->id
                ]);
            }

            return response()->json([
                'message'    => 'Invitation créée et email envoyé.',
                'invitation' => [
                    'id'         => $invitation->id,
                    'email'      => $invitation->email,
                    'expires_at' => $invitation->expires_at,
                ],
            ], 201);
        });
    }

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        if (! $user->isLandlord()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $landlord = $user->landlord;

        
if (! $landlord) {
    return response()->json(['message' => 'Landlord profile missing'], 422);
}


        $baseColumns = [
            'id',
            'user_id',
            'first_name',
            'last_name',
            'status',
            'solvency_score',
            'meta',
        ];

        $tenantsFromMeta = Tenant::where('meta->landlord_id', $landlord->id)
            ->with('user:id,email')
            ->get($baseColumns);

        $tenantsFromLeases = Tenant::whereHas('leases.property', function ($q) use ($landlord) {
                $q->where('landlord_id', $landlord->id);
            })
            ->with('user:id,email')
            ->get($baseColumns);

        $allTenants = $tenantsFromMeta
            ->concat($tenantsFromLeases)
            ->unique('id')
            ->values();

        $tenants = $allTenants->map(function (Tenant $tenant) {
            $user = $tenant->user;
            $meta = $tenant->meta ?? [];

            return [
                'id'             => $tenant->id,
                'first_name'     => $tenant->first_name,
                'last_name'      => $tenant->last_name,
                'full_name'      => trim(($tenant->first_name ?? '') . ' ' . ($tenant->last_name ?? '')),
                'email'          => $user->email ?? ($meta['invitation_email'] ?? null),
                'phone'          => $meta['phone'] ?? null,
                'status'         => $tenant->status ?? 'active',
                'solvency_score' => $tenant->solvency_score,
            ];
        });

        $invitations = $landlord->invitations()
            ->whereNull('accepted_at')
            ->get([
                'id',
                'email',
                'expires_at',
                'created_at',
            ]);

        return response()->json([
            'tenants'     => $tenants,
            'invitations' => $invitations,
        ]);
    }

    // app/Http/Controllers/Api/TenantLeaseController.php
    public function myLeases(Request $request)
    {
        $user = $request->user();

        if (!$user->isTenant()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $leases = Lease::with(['property', 'property.landlord'])
            ->where('tenant_id', $user->tenant->id)
            ->get();

        return response()->json($leases);
    }
}
