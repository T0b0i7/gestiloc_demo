<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notice;
use App\Models\Property;
use App\Models\Lease;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Mail;
use Carbon\Carbon;

class NoticeController extends Controller
{
    /* =========================
     * Helpers (email + format)
     * ========================= */

    private function appName(): string
    {
        return config('app.name', 'Gestiloc');
    }

    private function frontendUrl(): string
    {
        return rtrim(config('app.frontend_url', env('FRONTEND_URL', config('app.url'))), '/');
    }

    private function noticeRef(Notice $notice): string
    {
        // Réf lisible (si tu n'as pas uuid sur Notice)
        return 'NOTICE-' . str_pad((string) $notice->id, 6, '0', STR_PAD_LEFT);
    }

    private function formatDate(?string $ymd): string
    {
        if (!$ymd) return '—';
        try {
            return Carbon::parse($ymd)->format('d/m/Y');
        } catch (\Throwable $e) {
            return (string) $ymd;
        }
    }

    private function formatStatus(?string $status): string
    {
        return match ($status) {
            'pending' => 'En attente',
            'confirmed' => 'Confirmé',
            'cancelled' => 'Annulé',
            default => $status ? ucfirst($status) : '—',
        };
    }

    private function safeTenantName($notice): string
    {
        $first = (string) ($notice->tenant?->first_name ?? '');
        $last  = (string) ($notice->tenant?->last_name ?? '');
        $name = trim($first . ' ' . $last);

        if ($name === '') {
            $name = trim((string) ($notice->tenant?->user?->name ?? ''));
        }

        return $name !== '' ? $name : '—';
    }

    private function safePropertyLabel($notice): string
    {
        $p = $notice->property;
        if (!$p) return '—';

        $label = trim((string) ($p->address ?? ''));
        if (!empty($p->city)) $label .= ', ' . $p->city;
        return $label !== '' ? $label : '—';
    }

    private function resolveTenantEmailFromNotice(Notice $notice): ?string
    {
        $email = $notice->tenant?->user?->email ?? null;

        if (!$email && isset($notice->tenant?->email)) {
            $email = $notice->tenant->email;
        }

        return $email ?: null;
    }

    private function resolveLandlordEmailFromNotice(Notice $notice): ?string
    {
        
        // si landlord est un User directement -> email dispo
        $email = $notice->landlord?->email ?? null;

        // fallback: via property user_id / landlord_id si c'est un user id (pas un landlord profile)
        if (!$email && $notice->property) {
            // si property->user_id est le user bailleur
            if (!empty($notice->property->user_id) && method_exists(\App\Models\User::class, 'find')) {
                try {
                    $u = \App\Models\User::find((int) $notice->property->user_id);
                    $email = $u?->email ?: null;
                } catch (\Throwable $e) {}
            }
        }

        return $email ?: null;
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
              <div style="font-size:20px;font-weight:700;line-height:1.2;margin-top:6px;">{$title}</div>
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
<a href="{$u}" style="display:inline-block;background:#111827;color:#ffffff;text-decoration:none;padding:12px 16px;border-radius:12px;font-weight:700;font-size:14px;">
  {$l}
</a>
HTML;
    }

    private function noticeCardHtml(Notice $notice): string
    {
        $ref = e($this->noticeRef($notice));
        $type = e((string) ($notice->type ?? '—'));
        $status = e($this->formatStatus($notice->status ?? null));

        $property = e($this->safePropertyLabel($notice));
        $tenantName = e($this->safeTenantName($notice));

        $noticeDate = e($this->formatDate($notice->notice_date ?? null));
        $endDate = e($this->formatDate($notice->end_date ?? null));

        $reason = e((string) ($notice->reason ?? '—'));
        $notes = trim((string) ($notice->notes ?? ''));
        $notesHtml = $notes !== '' ? '<div style="margin-top:10px;font-size:13px;color:#374151;line-height:1.6;"><strong>Notes :</strong><br>' . nl2br(e($notes)) . '</div>' : '';

        return <<<HTML
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #eef2f7;border-radius:14px;overflow:hidden;">
  <tr>
    <td style="padding:14px 14px;background:#f9fafb;">
      <div style="font-size:14px;font-weight:800;color:#111827;">Préavis</div>
      <div style="font-size:13px;color:#6b7280;margin-top:4px;">Réf : {$ref}</div>
      <div style="font-size:13px;color:#6b7280;margin-top:4px;">Bien : {$property}</div>
      <div style="font-size:13px;color:#6b7280;margin-top:4px;">Locataire : {$tenantName}</div>
    </td>
  </tr>
  <tr>
    <td style="padding:14px;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
        <tr>
          <td style="font-size:13px;color:#374151;padding:6px 0;">Type</td>
          <td align="right" style="font-size:13px;color:#111827;font-weight:700;padding:6px 0;">{$type}</td>
        </tr>
        <tr>
          <td style="font-size:13px;color:#374151;padding:6px 0;">Statut</td>
          <td align="right" style="font-size:13px;color:#111827;font-weight:700;padding:6px 0;">{$status}</td>
        </tr>
        <tr>
          <td style="font-size:13px;color:#374151;padding:6px 0;">Date de préavis</td>
          <td align="right" style="font-size:13px;color:#111827;font-weight:700;padding:6px 0;">{$noticeDate}</td>
        </tr>
        <tr>
          <td style="font-size:13px;color:#374151;padding:6px 0;">Date de fin</td>
          <td align="right" style="font-size:13px;color:#111827;font-weight:700;padding:6px 0;">{$endDate}</td>
        </tr>
      </table>

      <div style="margin-top:10px;font-size:13px;color:#374151;line-height:1.6;">
        <strong>Motif :</strong><br>
        {$reason}
      </div>
      {$notesHtml}
    </td>
  </tr>
</table>
HTML;
    }

    private function sendHtmlEmail(string $to, string $subject, string $html): void
    {
        Mail::html($html, function ($message) use ($to, $subject) {
            $message->to($to)->subject($subject);
        });

        Log::info('[notice-mail] sent', ['to' => $to, 'subject' => $subject]);
    }

    private function trySendNoticeMail(string $to, string $subject, string $title, string $ref, string $contentHtml): void
    {
        try {
            $html = $this->mailLayoutHtml($title, e($ref), $contentHtml);
            $this->sendHtmlEmail($to, $subject, $html);
        } catch (\Throwable $e) {
            Log::error('[notice-mail] failed', [
                'to' => $to,
                'subject' => $subject,
                'error' => $e->getMessage(),
            ]);
        }
    }

    private function sendNoticeCreatedMails(Notice $notice, string $actorRole): void
    {
        // actorRole: 'tenant' | 'landlord'
        $notice->loadMissing(['property', 'tenant.user', 'landlord']);

        $ref = $this->noticeRef($notice);
        $dashboardUrl = $this->frontendUrl();

        $tenantEmail = $this->resolveTenantEmailFromNotice($notice);
        $landlordEmail = $this->resolveLandlordEmailFromNotice($notice);

        // 1) Locataire
        if ($tenantEmail) {
            $title = $actorRole === 'tenant'
                ? 'Demande de préavis envoyée ✅'
                : 'Préavis reçu 📌';

            $subject = $actorRole === 'tenant'
                ? "✅ Préavis envoyé : {$ref}"
                : "📌 Préavis : {$ref}";

            $intro = $actorRole === 'tenant'
                ? "Bonjour,<br><br>Votre demande de préavis a bien été envoyée au bailleur."
                : "Bonjour,<br><br>Un préavis a été créé par le bailleur. Vous pouvez consulter les détails ci-dessous.";

            $content = <<<HTML
<div style="font-size:14px;color:#374151;line-height:1.7;">
  {$intro}
</div>
<div style="height:14px"></div>
{$this->noticeCardHtml($notice)}
<div style="height:16px"></div>
{$this->buttonHtml('Ouvrir mon espace', $dashboardUrl)}
HTML;

            $this->trySendNoticeMail($tenantEmail, $subject, $title, $ref, $content);
        }

        // 2) Bailleur
        if ($landlordEmail) {
            $title = $actorRole === 'tenant'
                ? 'Nouvelle demande de préavis 📨'
                : 'Préavis créé (confirmation) ✅';

            $subject = $actorRole === 'tenant'
                ? "📨 Nouvelle demande de préavis : {$ref}"
                : "✅ Préavis créé : {$ref}";

            $intro = $actorRole === 'tenant'
                ? "Bonjour,<br><br>Un locataire vient d’envoyer une demande de préavis."
                : "Bonjour,<br><br>Votre préavis a été créé avec succès.";

            $content = <<<HTML
<div style="font-size:14px;color:#374151;line-height:1.7;">
  {$intro}
</div>
<div style="height:14px"></div>
{$this->noticeCardHtml($notice)}
<div style="height:16px"></div>
{$this->buttonHtml('Ouvrir le dashboard', $dashboardUrl)}
HTML;

            $this->trySendNoticeMail($landlordEmail, $subject, $title, $ref, $content);
        }
    }

    private function sendNoticeStatusChangedMails(Notice $notice, string $oldStatus, string $newStatus): void
    {
        $notice->loadMissing(['property', 'tenant.user', 'landlord']);

        $ref = $this->noticeRef($notice);
        $dashboardUrl = $this->frontendUrl();

        $tenantEmail = $this->resolveTenantEmailFromNotice($notice);
        $landlordEmail = $this->resolveLandlordEmailFromNotice($notice);

        $oldLabel = $this->formatStatus($oldStatus);
        $newLabel = $this->formatStatus($newStatus);

        $title = "Statut du préavis mis à jour";
        $subject = "🔔 Préavis {$ref} : {$newLabel}";

        $content = <<<HTML
<div style="font-size:14px;color:#374151;line-height:1.7;">
  Bonjour,<br><br>
  Le statut du préavis a changé : <strong>{$oldLabel}</strong> → <strong>{$newLabel}</strong>.
</div>
<div style="height:14px"></div>
{$this->noticeCardHtml($notice)}
<div style="height:16px"></div>
{$this->buttonHtml('Ouvrir le dashboard', $dashboardUrl)}
HTML;

        if ($tenantEmail) $this->trySendNoticeMail($tenantEmail, $subject, $title, $ref, $content);
        if ($landlordEmail) $this->trySendNoticeMail($landlordEmail, $subject, $title, $ref, $content);
    }

    private function sendNoticeDeletedMails(Notice $notice, string $actorRole): void
    {
        $notice->loadMissing(['property', 'tenant.user', 'landlord']);

        $ref = $this->noticeRef($notice);
        $dashboardUrl = $this->frontendUrl();

        $tenantEmail = $this->resolveTenantEmailFromNotice($notice);
        $landlordEmail = $this->resolveLandlordEmailFromNotice($notice);

        $title = "Préavis supprimé";
        $subject = "🗑️ Préavis supprimé : {$ref}";

        $who = $actorRole === 'tenant' ? 'le locataire' : 'le bailleur';

        $content = <<<HTML
<div style="font-size:14px;color:#374151;line-height:1.7;">
  Bonjour,<br><br>
  Le préavis <strong>{$ref}</strong> a été supprimé par {$who}.
</div>
<div style="height:14px"></div>
{$this->noticeCardHtml($notice)}
<div style="height:16px"></div>
{$this->buttonHtml('Ouvrir le dashboard', $dashboardUrl)}
HTML;

        if ($tenantEmail) $this->trySendNoticeMail($tenantEmail, $subject, $title, $ref, $content);
        if ($landlordEmail) $this->trySendNoticeMail($landlordEmail, $subject, $title, $ref, $content);
    }

    /* =========================
     * Controller actions
     * ========================= */

    public function index()
    {
        $user = Auth::user();

        Log::info('[NoticeController@index] incoming', [
            'auth_id' => $user?->id,
            'auth_email' => $user?->email,
            'roles' => method_exists($user, 'getRoleNames') ? $user->getRoleNames() : null,
        ]);

        if (!$user) return response()->json(['message' => 'Unauthenticated.'], 401);

        // ✅ Bailleur
        if (method_exists($user, 'hasRole') && $user->hasRole('landlord')) {
            $notices = Notice::with(['property', 'tenant.user', 'landlord'])
                ->where('landlord_id', $user->id)
                ->latest()
                ->get();

            return response()->json($notices);
        }

        // ✅ Locataire
        if (method_exists($user, 'hasRole') && $user->hasRole('tenant')) {
            $tenant = $user->tenant;
            if (!$tenant) {
                return response()->json(['message' => 'Tenant profile not found for this user.'], 422);
            }

            $notices = Notice::with(['property', 'tenant.user', 'landlord'])
                ->where('tenant_id', $tenant->id)
                ->latest()
                ->get();

            return response()->json($notices);
        }

        return response()->json(['message' => 'Forbidden'], 403);
    }

    /**
     * store gère 2 cas :
     * - landlord => crée un préavis bailleur
     * - tenant   => crée une demande de préavis locataire
     */
    public function store(Request $request)
    {
        $user = Auth::user();

        Log::info('[NoticeController@store] incoming', [
            'auth_id' => $user?->id,
            'auth_email' => $user?->email,
            'roles' => method_exists($user, 'getRoleNames') ? $user->getRoleNames() : null,
            'payload' => $request->all(),
        ]);

        if (!$user) return response()->json(['message' => 'Unauthenticated.'], 401);

        // =========================
        // CASE 1: TENANT CREATES
        // =========================
        if (method_exists($user, 'hasRole') && $user->hasRole('tenant')) {
            $tenant = $user->tenant;
            if (!$tenant) {
                return response()->json(['message' => 'Tenant profile not found for this user.'], 422);
            }

            $validator = Validator::make($request->all(), [
                'lease_id'    => ['required', 'exists:leases,id'],
                'reason'      => ['required', 'string', 'max:1000'],
                'end_date'    => ['required', 'date', 'after:today'],
                'notes'       => ['nullable', 'string', 'max:1000'],
                'notice_date' => ['nullable', 'date'],
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Validation error',
                    'errors'  => $validator->errors(),
                ], 422);
            }

            $lease = Lease::with('property')->find($request->lease_id);
            if (!$lease) return response()->json(['message' => 'Lease not found'], 404);

            if ((int) $lease->tenant_id !== (int) $tenant->id) {
                return response()->json(['message' => 'Forbidden (lease does not belong to tenant)'], 403);
            }

            $property = $lease->property ?: Property::find($lease->property_id);
            if (!$property) return response()->json(['message' => 'Property not found'], 404);

            $landlordId = $lease->landlord_id ?? null;

            if (!$landlordId) {
                if (!empty($property->user_id)) $landlordId = (int) $property->user_id;
                if (!$landlordId && !empty($property->landlord_id)) $landlordId = (int) $property->landlord_id;
            }

            if (!$landlordId) {
                return response()->json([
                    'message' => 'Impossible de déterminer le propriétaire (landlord_id) depuis le bail / bien.'
                ], 422);
            }

            try {
                $notice = Notice::create([
                    'property_id'  => (int) $property->id,
                    'landlord_id'  => (int) $landlordId,
                    'tenant_id'    => (int) $tenant->id,
                    'type'         => 'tenant',
                    'reason'       => $request->reason,
                    'notice_date'  => $request->notice_date ?: now()->toDateString(),
                    'end_date'     => $request->end_date,
                    'status'       => 'pending',
                    'notes'        => $request->notes,
                ]);

                $notice = $notice->load(['property', 'tenant.user', 'landlord']);

                // ✅ Emails
                $this->sendNoticeCreatedMails($notice, 'tenant');

                return response()->json($notice, 201);
            } catch (\Throwable $e) {
                Log::error('[NoticeController@store tenant] DB error', [
                    'message' => $e->getMessage(),
                    'trace' => $e->getTraceAsString(),
                    'resolved' => [
                        'property_id' => $property->id,
                        'tenant_id' => $tenant->id,
                        'landlord_id' => $landlordId,
                        'lease_id' => $lease->id,
                    ],
                ]);

                return response()->json([
                    'message' => 'Erreur lors de la création du préavis',
                    'error' => $e->getMessage(),
                ], 500);
            }
        }

        // =========================
        // CASE 2: LANDLORD CREATES
        // =========================
        if (method_exists($user, 'hasRole') && $user->hasRole('landlord')) {
            $validator = Validator::make($request->all(), [
                'property_id'  => 'required|exists:properties,id',
                'lease_id'     => 'nullable|exists:leases,id',
                'tenant_id'    => 'nullable|exists:tenants,id',
                'reason'       => 'required|string|max:1000',
                'notice_date'  => 'required|date',
                'end_date'     => 'required|date|after:notice_date',
                'notes'        => 'nullable|string|max:1000',
                'type'         => ['nullable', Rule::in(['landlord', 'tenant'])],
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Validation error',
                    'errors' => $validator->errors(),
                ], 422);
            }

            $property = Property::find($request->property_id);
            if (!$property) return response()->json(['message' => 'Property not found'], 404);

            $ownerByUserId = isset($property->user_id) && ((int) $property->user_id === (int) $user->id);
            $ownerByLandlordId = isset($property->landlord_id) && ((int) $property->landlord_id === (int) $user->id);

            if (!$ownerByUserId && !$ownerByLandlordId) {
                return response()->json(['message' => 'Forbidden'], 403);
            }

            $tenantId = $request->tenant_id;

            if (!$tenantId) {
                if ($request->filled('lease_id')) {
                    $lease = Lease::find($request->lease_id);
                    if (!$lease) return response()->json(['message' => 'Lease not found'], 404);

                    if ((int) $lease->property_id !== (int) $property->id) {
                        return response()->json(['message' => 'Lease does not belong to this property'], 422);
                    }

                    $tenantId = $lease->tenant_id;
                } else {
                    $lease = Lease::where('property_id', $property->id)
                        ->where('status', 'active')
                        ->latest()
                        ->first();

                    if (!$lease) {
                        return response()->json([
                            'message' => 'Aucun bail actif trouvé pour ce bien. Fournis lease_id ou tenant_id.'
                        ], 422);
                    }

                    $tenantId = $lease->tenant_id;
                }
            }

            try {
                $notice = Notice::create([
                    'property_id' => (int) $property->id,
                    'landlord_id' => (int) $user->id,
                    'tenant_id'   => (int) $tenantId,
                    'type'        => 'landlord',
                    'reason'      => $request->reason,
                    'notice_date' => $request->notice_date,
                    'end_date'    => $request->end_date,
                    'status'      => 'pending',
                    'notes'       => $request->notes,
                ]);

                $notice = $notice->load(['property', 'tenant.user', 'landlord']);

                // ✅ Emails
                $this->sendNoticeCreatedMails($notice, 'landlord');

                return response()->json($notice, 201);
            } catch (\Throwable $e) {
                Log::error('[NoticeController@store landlord] DB error', [
                    'message' => $e->getMessage(),
                    'trace' => $e->getTraceAsString(),
                ]);

                return response()->json([
                    'message' => 'Erreur lors de la création du préavis',
                    'error' => $e->getMessage(),
                ], 500);
            }
        }

        return response()->json(['message' => 'Forbidden'], 403);
    }

    /**
     * update:
     * - bailleur peut changer status + notes
     * - locataire peut annuler son préavis (pending -> cancelled) + notes
     */
    public function update(Request $request, Notice $notice)
    {
        $user = Auth::user();

        Log::info('[NoticeController@update] incoming', [
            'auth_id' => $user?->id,
            'notice_id' => $notice->id,
            'payload' => $request->all(),
        ]);

        if (!$user) return response()->json(['message' => 'Unauthenticated.'], 401);

        $isLandlord = method_exists($user, 'hasRole') && $user->hasRole('landlord');
        $isTenant   = method_exists($user, 'hasRole') && $user->hasRole('tenant');

        $tenantId = $user->tenant?->id;

        $canLandlord = $isLandlord && ((int) $user->id === (int) $notice->landlord_id);
        $canTenant   = $isTenant && $tenantId && ((int) $tenantId === (int) $notice->tenant_id);

        if (!$canLandlord && !$canTenant) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $oldStatus = (string) ($notice->status ?? '');

        if ($canLandlord) {
            $validator = Validator::make($request->all(), [
                'status' => 'sometimes|required|in:pending,confirmed,cancelled',
                'notes'  => 'nullable|string|max:1000',
            ]);
        } else {
            $validator = Validator::make($request->all(), [
                'status' => 'sometimes|required|in:cancelled',
                'notes'  => 'nullable|string|max:1000',
            ]);

            if ($request->filled('status') && $notice->status !== 'pending') {
                return response()->json(['message' => 'Impossible de modifier un préavis non "pending".'], 422);
            }
        }

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $notice->update($request->only(['status', 'notes']));
        $notice->load(['property', 'tenant.user', 'landlord']);

        $newStatus = (string) ($notice->status ?? '');

        // ✅ Emails si status a changé
        if ($request->filled('status') && $oldStatus !== $newStatus) {
            $this->sendNoticeStatusChangedMails($notice, $oldStatus, $newStatus);
        }

        return response()->json($notice);
    }

    public function destroy(Notice $notice)
    {
        $user = Auth::user();

        Log::info('[NoticeController@destroy] incoming', [
            'auth_id' => $user?->id,
            'notice_id' => $notice->id,
        ]);

        if (!$user) return response()->json(['message' => 'Unauthenticated.'], 401);

        $isLandlord = method_exists($user, 'hasRole') && $user->hasRole('landlord');
        $isTenant   = method_exists($user, 'hasRole') && $user->hasRole('tenant');

        $tenantId = $user->tenant?->id;

        $canLandlord = $isLandlord && ((int) $user->id === (int) $notice->landlord_id);
        $canTenant   = $isTenant && $tenantId && ((int) $tenantId === (int) $notice->tenant_id);

        if (!$canLandlord && !$canTenant) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        // on garde une copie chargée pour l'email avant delete
        $actorRole = $isTenant ? 'tenant' : 'landlord';
        $notice->load(['property', 'tenant.user', 'landlord']);
        $noticeSnapshot = clone $notice;

        $notice->delete();

        // ✅ Emails suppression
        $this->sendNoticeDeletedMails($noticeSnapshot, $actorRole);

        return response()->json(['message' => 'Préavis supprimé avec succès']);
    }
}
