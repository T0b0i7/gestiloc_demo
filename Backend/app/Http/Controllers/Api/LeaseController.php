<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreLeaseRequest;
use App\Models\Lease;
use App\Models\Property;
use App\Models\Tenant;
use App\Models\PropertyUser;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Carbon\Carbon;

class LeaseController extends Controller
{
    /**
     * ✅ Ajuste ces 2 constantes selon tes valeurs réelles en DB
     */
    private const PROPERTY_STATUS_RENTED = 'rented';

    // ⚠️ Mets ici le vrai statut "disponible" chez toi
    private const PROPERTY_STATUS_AVAILABLE = 'available';

    /**
     * ✅ Statuts de bail considérés comme "en cours"
     */
    private const LEASE_OPEN_STATUSES = ['active', 'pending'];

    private function appName(): string
    {
        return config('app.name', 'Gestiloc');
    }

    private function frontendUrl(): string
    {
        return rtrim(config('app.frontend_url', env('FRONTEND_URL', config('app.url'))), '/');
    }

    private function leaseRef(Lease $lease): string
    {
        $uuid = (string) ($lease->uuid ?? '');
        $short = $uuid ? strtoupper(substr($uuid, 0, 8)) : str_pad((string) $lease->id, 6, '0', STR_PAD_LEFT);
        return 'LEASE-' . $short;
    }

    private function formatMoney($amount): string
    {
        $n = is_numeric($amount) ? (float) $amount : 0.0;
        return number_format($n, 2, ',', ' ') . ' €';
    }

    private function propertyLabel(?Property $property): string
    {
        if (!$property) return '-';
        $label = (string) ($property->address ?? '');
        if (!empty($property->city)) $label .= ', ' . $property->city;
        return trim($label) !== '' ? $label : '-';
    }

    private function resolveTenantEmail(?Tenant $tenant, Request $request): ?string
    {
        $email = $tenant?->user?->email ?? null;

        if (!$email && isset($tenant?->email)) {
            $email = $tenant->email;
        }

        if (!$email) {
            $email = $request->user()?->email;
        }

        return $email ?: null;
    }

    private function resolveLandlordEmail(Request $request): ?string
    {
        return $request->user()?->email ?: null;
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
<a href="{$u}" style="display:inline-block;background:#111827;color:#ffffff;text-decoration:none;padding:12px 16px;border-radius:12px;font-weight:700;font-size:14px;">
  {$l}
</a>
HTML;
    }

    private function leaseCardHtml(Lease $lease): string
    {
        $property = e($this->propertyLabel($lease->property ?? null));

        $tenantName = '-';
        if ($lease->tenant) {
            $tenantName = trim((string) ($lease->tenant->first_name ?? '') . ' ' . (string) ($lease->tenant->last_name ?? ''));
            if ($tenantName === '') $tenantName = '-';
        }
        $tenantName = e($tenantName);

        $start = $lease->start_date ? e(Carbon::parse($lease->start_date)->format('d/m/Y')) : '-';
        $end = $lease->end_date ? e(Carbon::parse($lease->end_date)->format('d/m/Y')) : '-';

        $rent = e($this->formatMoney($lease->rent_amount ?? 0));
        $deposit = e($this->formatMoney($lease->deposit ?? 0));

        $status = e((string) ($lease->status ?? '-'));
        $type = e((string) ($lease->type ?? '-'));

        return <<<HTML
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #eef2f7;border-radius:14px;overflow:hidden;">
  <tr>
    <td style="padding:14px 14px;background:#f9fafb;">
      <div style="font-size:14px;font-weight:800;color:#111827;">Bail</div>
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
          <td style="font-size:13px;color:#374151;padding:6px 0;">Début</td>
          <td align="right" style="font-size:13px;color:#111827;font-weight:700;padding:6px 0;">{$start}</td>
        </tr>
        <tr>
          <td style="font-size:13px;color:#374151;padding:6px 0;">Fin</td>
          <td align="right" style="font-size:13px;color:#111827;font-weight:700;padding:6px 0;">{$end}</td>
        </tr>
        <tr>
          <td style="font-size:13px;color:#374151;padding:6px 0;">Loyer</td>
          <td align="right" style="font-size:13px;color:#111827;font-weight:700;padding:6px 0;">{$rent}</td>
        </tr>
        <tr>
          <td style="font-size:13px;color:#374151;padding:6px 0;">Dépôt</td>
          <td align="right" style="font-size:13px;color:#111827;font-weight:700;padding:6px 0;">{$deposit}</td>
        </tr>
      </table>
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

        \Log::info('[lease-mail] sent', ['to' => $to, 'subject' => $subject]);
    }

    private function sendLeaseCreatedMails(Request $request, Lease $lease): void
    {
        $lease->loadMissing(['property', 'tenant', 'tenant.user']);
        $ref = $this->leaseRef($lease);

        // Locataire
        $tenantEmail = $this->resolveTenantEmail($lease->tenant, $request);
        if ($tenantEmail) {
            $title = 'Nouveau bail créé ✅';

            $content = <<<HTML
<div style="font-size:14px;color:#374151;line-height:1.7;">
  Bonjour,<br><br>
  Un nouveau bail vient d'être créé pour vous. Vous pouvez consulter les détails depuis votre espace.
</div>
<div style="height:14px"></div>
{$this->leaseCardHtml($lease)}
<div style="height:16px"></div>
{$this->buttonHtml('Ouvrir mon espace', $this->frontendUrl())}
HTML;

            $html = $this->mailLayoutHtml($title, e($ref), $content);
            $subject = "✅ Bail créé : {$ref}";
            $this->sendHtmlEmail($tenantEmail, $subject, $html);
        } else {
            \Log::warning('[lease-mail] tenant email missing', ['lease_id' => $lease->id]);
        }

        // Bailleur
        $landlordEmail = $this->resolveLandlordEmail($request);
        if ($landlordEmail) {
            $title = 'Bail créé (confirmation) 🧾';

            $content = <<<HTML
<div style="font-size:14px;color:#374151;line-height:1.7;">
  Bonjour,<br><br>
  Le bail a été créé avec succès. Vous pouvez le retrouver dans votre tableau de bord.
</div>
<div style="height:14px"></div>
{$this->leaseCardHtml($lease)}
<div style="height:16px"></div>
{$this->buttonHtml('Voir mes baux', $this->frontendUrl())}
HTML;

            $html = $this->mailLayoutHtml($title, e($ref), $content);
            $subject = "🧾 Bail créé : {$ref}";
            $this->sendHtmlEmail($landlordEmail, $subject, $html);
        } else {
            \Log::warning('[lease-mail] landlord email missing', ['lease_id' => $lease->id]);
        }
    }

    private function sendLeaseTerminatedMails(Request $request, Lease $lease, string $endDateYmd): void
    {
        $lease->loadMissing(['property', 'tenant', 'tenant.user']);
        $ref = $this->leaseRef($lease);

        $end = Carbon::parse($endDateYmd)->format('d/m/Y');

        // Locataire
        $tenantEmail = $this->resolveTenantEmail($lease->tenant, $request);
        if ($tenantEmail) {
            $title = 'Bail résilié';

            $content = <<<HTML
<div style="font-size:14px;color:#374151;line-height:1.7;">
  Bonjour,<br><br>
  Votre bail a été résilié. Date de fin : <strong>{$end}</strong>.
</div>
<div style="height:14px"></div>
{$this->leaseCardHtml($lease)}
<div style="height:16px"></div>
{$this->buttonHtml('Accéder à mon espace', $this->frontendUrl())}
HTML;

            $html = $this->mailLayoutHtml($title, e($ref), $content);
            $subject = "📌 Bail résilié : {$ref}";
            $this->sendHtmlEmail($tenantEmail, $subject, $html);
        } else {
            \Log::warning('[lease-mail] tenant email missing', ['lease_id' => $lease->id]);
        }

        // Bailleur
        $landlordEmail = $this->resolveLandlordEmail($request);
        if ($landlordEmail) {
            $title = 'Bail résilié (confirmation)';

            $content = <<<HTML
<div style="font-size:14px;color:#374151;line-height:1.7;">
  Bonjour,<br><br>
  Le bail a été résilié. Date de fin : <strong>{$end}</strong>. Le bien est maintenant "disponible".
</div>
<div style="height:14px"></div>
{$this->leaseCardHtml($lease)}
<div style="height:16px"></div>
{$this->buttonHtml('Voir mes baux', $this->frontendUrl())}
HTML;

            $html = $this->mailLayoutHtml($title, e($ref), $content);
            $subject = "✅ Bail résilié : {$ref}";
            $this->sendHtmlEmail($landlordEmail, $subject, $html);
        } else {
            \Log::warning('[lease-mail] landlord email missing', ['lease_id' => $lease->id]);
        }
    }

    /**
     * ✅ Créer un bail + attribution automatique dans property_user
     */
    public function store(StoreLeaseRequest $request): JsonResponse
    {
        $data = $request->validated();
        $user = $request->user();

        if (!$user || !$user->isLandlord()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $landlord = $user->landlord;
        if (!$landlord) {
            return response()->json(['message' => 'Landlord profile missing'], 422);
        }

        return DB::transaction(function () use ($data, $landlord, $request, $user) {

            // 🔒 Lock du bien pour éviter les conflits
            $property = Property::whereKey($data['property_id'])
                ->lockForUpdate()
                ->firstOrFail();

            // Vérifier que le bien appartient au landlord
            if ((int) $property->landlord_id !== (int) $landlord->id) {
                return response()->json(['message' => 'You do not own this property'], 403);
            }

            // ✅ Vérifier si le bien est déjà loué
            if (($property->status ?? null) === self::PROPERTY_STATUS_RENTED) {
                return response()->json([
                    'message' => 'Ce bien est déjà loué.',
                    'errors' => [
                        'property_id' => ['Ce bien est déjà loué.']
                    ]
                ], 422);
            }

            // ✅ Vérifier qu'il n'existe pas déjà un bail "en cours"
            $alreadyOpen = Lease::query()
                ->where('property_id', $property->id)
                ->whereIn('status', self::LEASE_OPEN_STATUSES)
                ->exists();

            if ($alreadyOpen) {
                return response()->json([
                    'message' => 'Ce bien a déjà un bail en cours.',
                    'errors' => [
                        'property_id' => ['Ce bien a déjà un bail en cours.']
                    ]
                ], 422);
            }

            $tenant = Tenant::findOrFail($data['tenant_id']);

            // ✅ 1. Créer le bail
            $lease = Lease::create([
                'property_id' => $property->id,
                'tenant_id'   => $tenant->id,
                'start_date'  => $data['start_date'],
                'end_date'    => $data['end_date'] ?? null,
                'rent_amount' => $data['rent_amount'],
                'deposit'     => $data['deposit'] ?? null,
                'type'        => $data['type'],
                'status'      => $data['status'] ?? 'active',
                'terms'       => $data['terms'] ?? null,
            ]);

            // ✅ 2. Mettre à jour le statut du bien
            $property->status = self::PROPERTY_STATUS_RENTED;
            $property->save();

            // ✅ 3. CRITIQUE : Créer l'attribution dans property_user
            try {
                $propertyUser = PropertyUser::create([
                    'property_id' => $property->id,
                    'user_id' => $tenant->user_id,
                    'tenant_id' => $tenant->id,
                    'lease_id' => $lease->id,
                    'landlord_id' => $landlord->id,
                    'role' => 'tenant',
                    'share_percentage' => 100,
                    'start_date' => $data['start_date'],
                    'end_date' => $data['end_date'] ?? null,
                    'status' => 'active',
                ]);

                \Log::info('PropertyUser created for lease', [
                    'lease_id' => $lease->id,
                    'property_user_id' => $propertyUser->id,
                    'property_id' => $property->id,
                    'tenant_id' => $tenant->id,
                    'user_id' => $tenant->user_id
                ]);

            } catch (\Exception $e) {
                \Log::error('Failed to create PropertyUser for lease', [
                    'lease_id' => $lease->id,
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString()
                ]);

                // Annuler la transaction si l'attribution échoue
                throw $e;
            }

            // ✅ 4. Envoyer les emails
            $this->sendLeaseCreatedMails($request, $lease);

            // ✅ 5. Retourner la réponse avec toutes les relations
            $lease->load(['property', 'tenant', 'tenant.user', 'propertyAssignments']);

            return response()->json([
                'message' => 'Bail créé avec succès et locataire attribué au bien',
                'lease' => $lease,
                'property_assignment' => $propertyUser ?? null,
            ], 201);
        });
    }

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user || !$user->hasRole('landlord') || !$user->landlord) {
            return response()->json(['message' => 'Accès réservé aux propriétaires'], 403);
        }

        $leases = Lease::query()
            ->whereHas('property', function ($q) use ($user) {
                $q->where('landlord_id', $user->landlord->id);
            })
            ->with(['property', 'tenant', 'tenant.user', 'propertyAssignments'])
            ->orderByDesc('created_at')
            ->get();

        return response()->json($leases->values());
    }

    /**
     * ✅ Résilier un bail + terminer l'attribution dans property_user
     */
    public function terminate(Request $request, string $uuid): JsonResponse
    {
        $user = $request->user();

        if (!$user || !$user->isLandlord() || !$user->landlord) {
            return response()->json(['message' => 'Accès réservé aux propriétaires'], 403);
        }

        $landlordId = (int) $user->landlord->id;

        // validation end_date (optionnelle)
        $data = $request->validate([
            'end_date' => ['nullable', 'date'],
        ]);

        $endDateYmd = isset($data['end_date'])
            ? Carbon::parse($data['end_date'])->toDateString()
            : now()->toDateString();

        $lease = Lease::where('uuid', $uuid)
            ->with(['property', 'tenant', 'tenant.user', 'propertyAssignments'])
            ->firstOrFail();

        if ((int) $lease->property?->landlord_id !== $landlordId) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        DB::transaction(function () use ($lease, $endDateYmd, $user) {
            // ✅ 1. Mettre à jour le bail
            $lease->update([
                'status'   => 'terminated',
                'end_date' => $endDateYmd,
            ]);

            // ✅ 2. Libérer le bien
            if ($lease->property) {
                $lease->property->update(['status' => self::PROPERTY_STATUS_AVAILABLE]);
            }

            // ✅ 3. CRITIQUE : Terminer l'attribution dans property_user
            $propertyAssignments = PropertyUser::where('lease_id', $lease->id)
                ->orWhere(function($query) use ($lease) {
                    $query->where('property_id', $lease->property_id)
                          ->where('tenant_id', $lease->tenant_id)
                          ->where('status', 'active');
                })
                ->get();

            foreach ($propertyAssignments as $assignment) {
                $assignment->update([
                    'end_date' => $endDateYmd,
                    'status' => 'terminated',
                ]);

                \Log::info('PropertyUser terminated for lease', [
                    'lease_id' => $lease->id,
                    'property_user_id' => $assignment->id,
                    'end_date' => $endDateYmd
                ]);
            }
        });

        $lease = $lease->fresh()->load(['property', 'tenant', 'tenant.user', 'propertyAssignments']);

        // ✅ 4. Envoyer les emails
        $this->sendLeaseTerminatedMails($request, $lease, $endDateYmd);

        return response()->json([
            'message' => 'Bail résilié avec succès. Le bien est maintenant disponible.',
            'lease' => $lease,
        ]);
    }

    /**
     * ✅ Récupérer un bail spécifique
     */
    public function show($uuid): JsonResponse
    {
        $lease = Lease::where('uuid', $uuid)
            ->with(['property', 'tenant', 'tenant.user', 'propertyAssignments.property'])
            ->firstOrFail();

        return response()->json($lease);
    }

    /**
     * ✅ Mettre à jour un bail
     */
    public function update(Request $request, $uuid): JsonResponse
    {
        $lease = Lease::where('uuid', $uuid)
            ->with(['property', 'tenant'])
            ->firstOrFail();

        $user = $request->user();
        if (!$user || !$user->isLandlord() || !$user->landlord) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        if ((int) $lease->property?->landlord_id !== (int) $user->landlord->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $data = $request->validate([
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after:start_date',
            'rent_amount' => 'nullable|numeric|min:0',
            'status' => 'nullable|in:pending,active,terminated',
        ]);

        DB::transaction(function () use ($lease, $data) {
            // Mettre à jour le bail
            $lease->update($data);

            // Si la date de fin change, mettre à jour l'attribution property_user
            if (isset($data['end_date']) && $lease->propertyAssignments->isNotEmpty()) {
                foreach ($lease->propertyAssignments as $assignment) {
                    $assignment->update([
                        'end_date' => $data['end_date'],
                        'status' => $data['status'] ?? $assignment->status,
                    ]);
                }
            }

            // Si le statut change, mettre à jour l'attribution
            if (isset($data['status'])) {
                foreach ($lease->propertyAssignments as $assignment) {
                    $assignment->update(['status' => $data['status']]);
                }
            }
        });

        $lease->refresh()->load(['property', 'tenant', 'tenant.user', 'propertyAssignments']);

        return response()->json([
            'message' => 'Bail mis à jour avec succès',
            'lease' => $lease,
        ]);
    }

    /**
     * ✅ Supprimer un bail (soft delete)
     */
    public function destroy($uuid): JsonResponse
    {
        $lease = Lease::where('uuid', $uuid)
            ->with(['property', 'propertyAssignments'])
            ->firstOrFail();

        DB::transaction(function () use ($lease) {
            // 1. Terminer les attributions property_user
            foreach ($lease->propertyAssignments as $assignment) {
                $assignment->update([
                    'end_date' => now(),
                    'status' => 'terminated',
                ]);
            }

            // 2. Libérer le bien si nécessaire
            if ($lease->property && $lease->status !== 'terminated') {
                $lease->property->update(['status' => self::PROPERTY_STATUS_AVAILABLE]);
            }

            // 3. Soft delete le bail
            $lease->delete();
        });

        return response()->json([
            'message' => 'Bail supprimé avec succès',
        ]);
    }
}
