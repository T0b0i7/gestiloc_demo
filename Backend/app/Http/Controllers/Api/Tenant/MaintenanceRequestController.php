<?php

namespace App\Http\Controllers\Api\Tenant;

use App\Http\Controllers\Controller;
use App\Http\Resources\MaintenanceRequestResource;
use App\Models\MaintenanceRequest;
use App\Models\Property;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;

class MaintenanceRequestController extends Controller
{
    private function tenantOrFail()
    {
        $user = auth()->user();
        if (!$user || !$user->isTenant() || !$user->tenant) {
            abort(403, 'Accès réservé aux locataires');
        }
        return $user->tenant;
    }

    private function appName(): string
    {
        return config('app.name', 'Gestiloc');
    }

    private function frontendUrl(): string
    {
        // Mets FRONTEND_URL dans ton .env (recommandé)
        return rtrim(config('app.frontend_url', env('FRONTEND_URL', config('app.url'))), '/');
    }

    private function refFor(MaintenanceRequest $incident): string
    {
        return 'INC-' . str_pad((string) $incident->id, 6, '0', STR_PAD_LEFT);
    }

    private function labelStatus(string $status): string
    {
        return match ($status) {
            'open' => 'Ouvert',
            'in_progress' => 'En cours',
            'resolved' => 'Résolu',
            'cancelled' => 'Annulé',
            default => ucfirst(str_replace('_', ' ', $status)),
        };
    }

    private function labelCategory(string $cat): string
    {
        return match ($cat) {
            'plumbing' => 'Plomberie',
            'electricity' => 'Électricité',
            'heating' => 'Chauffage',
            'other' => 'Autre',
            default => ucfirst($cat),
        };
    }

    private function labelPriority(string $p): string
    {
        return match ($p) {
            'low' => 'Faible',
            'medium' => 'Moyenne',
            'high' => 'Élevée',
            'emergency' => 'Urgence',
            default => ucfirst($p),
        };
    }

    private function propertyLabel(?Property $property): string
    {
        if (!$property) return '—';
        $label = (string) ($property->address ?? '');
        if (!empty($property->city)) $label .= ', ' . $property->city;
        return trim($label) !== '' ? $label : '—';
    }

    private function photoUrls(array $paths): array
    {
        // tes photos sont stockées sur disk "public" => /storage/...
        $urls = [];
        foreach ($paths as $p) {
            if (!is_string($p) || trim($p) === '') continue;
            $urls[] = asset('storage/' . ltrim($p, '/'));
        }
        return $urls;
    }

    /**
     * Email HTML "moderne" inline (simple, propre, sans dépendances).
     */
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

    private function incidentCardHtml(MaintenanceRequest $incident): string
    {
        $propertyLabel = e($this->propertyLabel($incident->property));
        $title = e((string) $incident->title);
        $category = e($this->labelCategory((string) $incident->category));
        $priority = e($this->labelPriority((string) $incident->priority));
        $status = e($this->labelStatus((string) $incident->status));

        $desc = trim((string) ($incident->description ?? ''));
        $descHtml = '';
        if ($desc !== '') {
            $descEsc = nl2br(e($desc));
            $descHtml = <<<HTML
<div style="margin-top:12px;font-size:13px;color:#374151;line-height:1.6;">
  <div style="font-weight:700;color:#111827;margin-bottom:6px;">Description</div>
  <div>{$descEsc}</div>
</div>
HTML;
        }

        $slotsHtml = '';
        $slots = $incident->preferred_slots ?? [];
        if (is_array($slots) && !empty($slots)) {
            $lis = '';
            foreach ($slots as $s) {
                if (!is_array($s)) continue;
                $d = e((string) ($s['date'] ?? '—'));
                $from = e((string) ($s['from'] ?? ''));
                $to = e((string) ($s['to'] ?? ''));
                $range = ($from && $to) ? " — {$from} → {$to}" : '';
                $lis .= "<li>{$d}{$range}</li>";
            }
            if ($lis !== '') {
                $slotsHtml = <<<HTML
<div style="margin-top:12px;font-size:13px;color:#374151;line-height:1.6;">
  <div style="font-weight:700;color:#111827;margin-bottom:6px;">Créneaux préférés</div>
  <ul style="margin:0;padding-left:18px;">{$lis}</ul>
</div>
HTML;
            }
        }

        $photos = $this->photoUrls(is_array($incident->photos ?? null) ? $incident->photos : []);
        $photosHtml = '';
        if (!empty($photos)) {
            $cells = '';
            foreach (array_slice($photos, 0, 3) as $url) {
                $u = e($url);
                $cells .= <<<HTML
<td style="padding-right:8px;">
  <img src="{$u}" alt="Photo" width="180" style="border-radius:12px;border:1px solid #eef2f7;display:block;">
</td>
HTML;
            }
            $more = count($photos) > 3 ? '<div style="font-size:12px;color:#6b7280;margin-top:6px;">+' . (count($photos) - 3) . ' photo(s) supplémentaire(s)</div>' : '';
            $photosHtml = <<<HTML
<div style="margin-top:12px;">
  <div style="font-size:13px;font-weight:700;color:#111827;margin-bottom:8px;">Photos</div>
  <table role="presentation" cellspacing="0" cellpadding="0"><tr>{$cells}</tr></table>
  {$more}
</div>
HTML;
        }

        return <<<HTML
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #eef2f7;border-radius:14px;overflow:hidden;">
  <tr>
    <td style="padding:14px 14px;background:#f9fafb;">
      <div style="font-size:14px;font-weight:700;color:#111827;">{$title}</div>
      <div style="font-size:13px;color:#6b7280;margin-top:4px;">Bien : {$propertyLabel}</div>
    </td>
  </tr>
  <tr>
    <td style="padding:14px;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
        <tr>
          <td style="font-size:13px;color:#374151;padding:6px 0;">Catégorie</td>
          <td align="right" style="font-size:13px;color:#111827;font-weight:600;padding:6px 0;">{$category}</td>
        </tr>
        <tr>
          <td style="font-size:13px;color:#374151;padding:6px 0;">Priorité</td>
          <td align="right" style="font-size:13px;color:#111827;font-weight:600;padding:6px 0;">{$priority}</td>
        </tr>
        <tr>
          <td style="font-size:13px;color:#374151;padding:6px 0;">Statut</td>
          <td align="right" style="font-size:13px;color:#111827;font-weight:600;padding:6px 0;">{$status}</td>
        </tr>
      </table>
      {$descHtml}
      {$slotsHtml}
      {$photosHtml}
    </td>
  </tr>
</table>
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

   private function sendHtmlEmail(string $to, string $subject, string $html): void
{
    Mail::html($html, function ($message) use ($to, $subject) {
        $message->to($to)->subject($subject);
    });

    \Log::info('[maintenance-mail] sent', ['to' => $to, 'subject' => $subject]);
}


    private function sendTenantCreatedMail(MaintenanceRequest $incident): void
    {
        $tenantEmail = $incident->tenant?->user?->email ?? null;
        if (!$tenantEmail) return;

        $ref = $this->refFor($incident);
        $title = 'Demande bien reçue ✅';

        $content = <<<HTML
<div style="font-size:14px;color:#374151;line-height:1.7;">
  Bonjour,<br><br>
  Nous confirmons la réception de votre demande. Elle a bien été enregistrée et sera traitée dès que possible.
</div>
<div style="height:14px"></div>
{$this->incidentCardHtml($incident)}
<div style="height:16px"></div>
{$this->buttonHtml('Suivre ma demande', $this->frontendUrl())}
<div style="margin-top:14px;font-size:12px;color:#6b7280;line-height:1.6;">
  Astuce : ajoutez un maximum de détails et de photos pour accélérer le traitement.
</div>
HTML;

        $html = $this->mailLayoutHtml($title, e($ref), $content);
        $subject = "✅ Demande reçue : {$ref} — {$incident->title}";

        $this->sendHtmlEmail($tenantEmail, $subject, $html);
    }

    private function sendLandlordCreatedMail(MaintenanceRequest $incident): void
    {
        $landlordEmail = $incident->property?->landlord?->user?->email ?? null;
        if (!$landlordEmail) return;

        $ref = $this->refFor($incident);
        $title = 'Nouvelle demande de maintenance 🛠️';

        $tenantName = trim(
            (string) ($incident->tenant?->first_name ?? '') . ' ' . (string) ($incident->tenant?->last_name ?? '')
        );
        $tenantLine = $tenantName !== '' ? "<br><br><strong>Locataire :</strong> " . e($tenantName) : "";

        $content = <<<HTML
<div style="font-size:14px;color:#374151;line-height:1.7;">
  Bonjour,<br><br>
  Un locataire vient de créer une nouvelle demande de maintenance.
  {$tenantLine}
</div>
<div style="height:14px"></div>
{$this->incidentCardHtml($incident)}
<div style="height:16px"></div>
{$this->buttonHtml('Voir & traiter la demande', $this->frontendUrl())}
<div style="margin-top:14px;font-size:12px;color:#6b7280;line-height:1.6;">
  Recommandation : passez le statut en “En cours” dès la prise en charge pour réduire les relances.
</div>
HTML;

        $html = $this->mailLayoutHtml($title, e($ref), $content);
        $subject = "🛠️ Nouvelle demande : {$ref} — {$incident->title}";

        $this->sendHtmlEmail($landlordEmail, $subject, $html);
    }

    /**
     * Email bailleur : demande modifiée par le locataire (liste des champs modifiés)
     *
     * @param array<string, array{before:mixed, after:mixed}> $changes
     */
    private function sendLandlordUpdatedByTenantMail(MaintenanceRequest $incident, array $changes): void
    {
        $landlordEmail = $incident->property?->landlord?->user?->email ?? null;
        if (!$landlordEmail) return;

        $ref = $this->refFor($incident);
        $title = 'Demande mise à jour par le locataire ✏️';

        $labels = [
            'title' => 'Titre',
            'category' => 'Catégorie',
            'priority' => 'Priorité',
            'description' => 'Description',
            'preferred_slots' => 'Créneaux préférés',
            'photos' => 'Photos',
        ];

        $items = '';
        foreach ($changes as $field => $pair) {
            $label = $labels[$field] ?? ucfirst(str_replace('_', ' ', (string) $field));

            $before = $pair['before'] ?? null;
            $after = $pair['after'] ?? null;

            if ($field === 'category') {
                $before = $before ? $this->labelCategory((string) $before) : $before;
                $after  = $after  ? $this->labelCategory((string) $after)  : $after;
            }
            if ($field === 'priority') {
                $before = $before ? $this->labelPriority((string) $before) : $before;
                $after  = $after  ? $this->labelPriority((string) $after)  : $after;
            }

            if (in_array($field, ['preferred_slots', 'photos'], true)) {
                $before = is_array($before) ? 'Mis à jour' : ($before ?? '—');
                $after  = is_array($after)  ? 'Mis à jour' : ($after ?? '—');
            }

            $beforeTxt = e(is_null($before) || $before === '' ? '—' : (string) $before);
            $afterTxt  = e(is_null($after)  || $after  === '' ? '—' : (string) $after);
            $labelEsc  = e($label);

            $items .= <<<HTML
<li style="margin-bottom:10px;">
  <strong>{$labelEsc}</strong><br>
  <span style="color:#6b7280;">Avant :</span> {$beforeTxt}<br>
  <span style="color:#6b7280;">Après :</span> {$afterTxt}
</li>
HTML;
        }

        $changesBox = <<<HTML
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #eef2f7;border-radius:14px;overflow:hidden;">
  <tr>
    <td style="padding:14px;background:#f9fafb;font-weight:700;color:#111827;">Changements</td>
  </tr>
  <tr>
    <td style="padding:14px;">
      <ul style="margin:0;padding-left:18px;font-size:13px;color:#374151;line-height:1.6;">
        {$items}
      </ul>
    </td>
  </tr>
</table>
HTML;

        $content = <<<HTML
<div style="font-size:14px;color:#374151;line-height:1.7;">
  Bonjour,<br><br>
  Le locataire a modifié une demande de maintenance. Voici les changements détectés :
</div>
<div style="height:12px"></div>
{$changesBox}
<div style="height:14px"></div>
{$this->incidentCardHtml($incident)}
<div style="height:16px"></div>
{$this->buttonHtml('Ouvrir la demande', $this->frontendUrl())}
HTML;

        $html = $this->mailLayoutHtml($title, e($ref), $content);
        $subject = "✏️ Mise à jour locataire : {$ref} — {$incident->title}";

        $this->sendHtmlEmail($landlordEmail, $subject, $html);
    }

    public function index(Request $request)
    {
        $tenant = $this->tenantOrFail();

        $q = MaintenanceRequest::query()
            ->where('tenant_id', $tenant->id)
            ->with(['property.landlord.user'])
            ->latest();

        if ($request->filled('status')) {
            $q->where('status', $request->string('status'));
        }
        if ($request->filled('property_id')) {
            $q->where('property_id', $request->integer('property_id'));
        }

        return MaintenanceRequestResource::collection($q->paginate(20));
    }

    public function show($id)
    {
        $tenant = $this->tenantOrFail();

        $incident = MaintenanceRequest::with(['property.landlord.user'])
            ->where('tenant_id', $tenant->id)
            ->findOrFail($id);

        return new MaintenanceRequestResource($incident);
    }

    public function store(Request $request)
    {
        $tenant = $this->tenantOrFail();

        $data = $request->validate([
            'property_id' => ['required', 'integer', 'exists:properties,id'],
            'title' => ['required', 'string', 'max:255'],
            'category' => ['required', 'in:plumbing,electricity,heating,other'],
            'priority' => ['required', 'in:low,medium,high,emergency'],
            'description' => ['nullable', 'string'],
            'preferred_slots' => ['nullable', 'array'],
            'preferred_slots.*.date' => ['required_with:preferred_slots', 'date_format:Y-m-d'],
            'preferred_slots.*.from' => ['required_with:preferred_slots', 'date_format:H:i'],
            'preferred_slots.*.to' => ['required_with:preferred_slots', 'date_format:H:i'],
            'photos' => ['nullable', 'array'],
            'photos.*' => ['string'],
        ]);

        $property = Property::findOrFail($data['property_id']);

        $hasLease = $property->leases()->where('tenant_id', $tenant->id)->exists();
        if (!$hasLease) {
            return response()->json(['message' => 'Vous n\'avez pas accès à ce bien.'], 403);
        }

        $incident = MaintenanceRequest::create([
            'property_id' => $property->id,
            'tenant_id' => $tenant->id,
            'landlord_id' => $property->landlord_id,

            'title' => $data['title'],
            'category' => $data['category'],
            'priority' => $data['priority'],
            'description' => $data['description'] ?? null,

            'preferred_slots' => $data['preferred_slots'] ?? [],
            'photos' => $data['photos'] ?? [],
            'status' => 'open',
        ]);

        // ⚠️ On charge tenant.user pour email locataire + bailleur
        $incident->load(['property.landlord.user', 'tenant.user', 'property']);

        // ✅ Emails
        $this->sendTenantCreatedMail($incident);
        $this->sendLandlordCreatedMail($incident);

        return (new MaintenanceRequestResource($incident))
            ->response()
            ->setStatusCode(201);
    }

    public function update(Request $request, $id)
    {
        $tenant = $this->tenantOrFail();

        $incident = MaintenanceRequest::where('tenant_id', $tenant->id)->findOrFail($id);

        if (in_array($incident->status, ['resolved', 'cancelled'], true)) {
            return response()->json(['message' => 'Incident non modifiable.'], 422);
        }

        $data = $request->validate([
            'title' => ['sometimes', 'string', 'max:255'],
            'category' => ['sometimes', 'in:plumbing,electricity,heating,other'],
            'priority' => ['sometimes', 'in:low,medium,high,emergency'],
            'description' => ['nullable', 'string'],
            'preferred_slots' => ['nullable', 'array'],
            'preferred_slots.*.date' => ['required_with:preferred_slots', 'date_format:Y-m-d'],
            'preferred_slots.*.from' => ['required_with:preferred_slots', 'date_format:H:i'],
            'preferred_slots.*.to' => ['required_with:preferred_slots', 'date_format:H:i'],
            'photos' => ['nullable', 'array'],
            'photos.*' => ['string'],
        ]);

        $before = $incident->getOriginal();

        $incident->fill($data);
        $dirtyFields = array_keys($incident->getDirty());
        $incident->save();

        $incident->load(['property.landlord.user', 'tenant.user', 'property']);

        if (!empty($dirtyFields)) {
            $changes = [];
            foreach ($dirtyFields as $field) {
                $changes[$field] = [
                    'before' => $before[$field] ?? null,
                    'after' => $incident->{$field},
                ];
            }
            $this->sendLandlordUpdatedByTenantMail($incident, $changes);
        }

        return new MaintenanceRequestResource($incident);
    }

    public function destroy($id)
    {
        $tenant = $this->tenantOrFail();
        $incident = MaintenanceRequest::where('tenant_id', $tenant->id)->findOrFail($id);
        $incident->delete();

        return response()->json(['message' => 'Supprimé']);
    }

    /**
     * Upload photos (multipart)
     * POST /api/tenant/incidents/upload
     */
    public function upload(Request $request)
    {
        $this->tenantOrFail();

        $request->validate([
            'files' => ['required'],
            'files.*' => ['image', 'max:5120'], // 5MB
        ]);

        $paths = [];
        foreach ((array) $request->file('files', []) as $file) {
            $paths[] = $file->store('maintenance', 'public');
        }

        return response()->json([
            'paths' => $paths,
        ]);
    }
}
