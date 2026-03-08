<?php

namespace App\Http\Controllers\Api\Landlord;

use App\Http\Controllers\Controller;
use App\Http\Resources\MaintenanceRequestResource;
use App\Models\MaintenanceRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class MaintenanceRequestController extends Controller
{
    private function landlordOrFail()
    {
        $user = auth()->user();
        if (!$user || !$user->isLandlord() || !$user->landlord) {
            abort(403, 'Accès réservé aux bailleurs');
        }
        return $user->landlord;
    }

    private function appName(): string
    {
        return config('app.name', 'Gestiloc');
    }

    private function frontendUrl(): string
    {
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

    private function propertyLabel($property): string
    {
        if (!$property) return '—';
        $label = (string) ($property->address ?? '');
        if (!empty($property->city)) $label .= ', ' . $property->city;
        return trim($label) !== '' ? $label : '—';
    }

    private function photoUrls(array $paths): array
    {
        $urls = [];
        foreach ($paths as $p) {
            if (!is_string($p) || trim($p) === '') continue;
            $urls[] = asset('storage/' . ltrim($p, '/'));
        }
        return $urls;
    }

    private function resolveTenantEmail(MaintenanceRequest $incident): ?string
    {
        $email = $incident->tenant?->user?->email ?? null;
        if (!$email && isset($incident->tenant?->email)) $email = $incident->tenant->email;
        return $email ?: null;
    }

    private function resolveLandlordEmail(MaintenanceRequest $incident): ?string
    {
        // Ici, le bailleur connecté n'est pas forcément l'email de notification (mais souvent oui)
        $email = $incident->property?->landlord?->user?->email ?? auth()->user()?->email ?? null;
        if (!$email && isset($incident->property?->landlord?->email)) $email = $incident->property->landlord->email;
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

        $assigned = trim((string) ($incident->assigned_provider ?? ''));
        $assignedHtml = $assigned !== ''
            ? '<div style="margin-top:12px;font-size:13px;color:#374151;line-height:1.6;"><div style="font-weight:700;color:#111827;margin-bottom:6px;">Prestataire</div><div>' . e($assigned) . '</div></div>'
            : '';

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
      {$assignedHtml}
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

    private function sendTenantStatusChangedMail(MaintenanceRequest $incident, string $oldStatus, string $newStatus): void
    {
        $tenantEmail = $this->resolveTenantEmail($incident);
        if (!$tenantEmail) {
            \Log::warning('[maintenance-mail] tenant email missing', ['incident_id' => $incident->id]);
            return;
        }

        $ref = $this->refFor($incident);
        $title = 'Statut mis à jour 🔔';

        $old = e($this->labelStatus($oldStatus));
        $new = e($this->labelStatus($newStatus));

        $assigned = trim((string) ($incident->assigned_provider ?? ''));
        $assignedHtml = $assigned !== ''
            ? '<div style="margin-top:12px;"><div style="font-weight:700;color:#111827;margin-bottom:6px;">Prestataire</div><div style="font-size:13px;color:#374151;line-height:1.6;">' . e($assigned) . '</div></div>'
            : '';

        $content = <<<HTML
<div style="font-size:14px;color:#374151;line-height:1.7;">
  Bonjour,<br><br>
  Votre demande de maintenance a été mise à jour.
</div>
<div style="height:12px"></div>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #eef2f7;border-radius:14px;overflow:hidden;">
  <tr>
    <td style="padding:14px;background:#f9fafb;">
      <div style="font-size:14px;font-weight:800;color:#111827;">{e($incident->title)}</div>
      <div style="font-size:13px;color:#6b7280;margin-top:4px;">Référence : <strong>{$ref}</strong></div>
    </td>
  </tr>
  <tr>
    <td style="padding:14px;font-size:13px;color:#374151;line-height:1.7;">
      <div><span style="color:#6b7280;">Avant :</span> <strong>{$old}</strong></div>
      <div><span style="color:#6b7280;">Maintenant :</span> <strong>{$new}</strong></div>
      {$assignedHtml}
    </td>
  </tr>
</table>
<div style="height:16px"></div>
{$this->buttonHtml('Voir le détail', $this->frontendUrl())}
HTML;

        $html = $this->mailLayoutHtml($title, e($ref), $content);
        $subject = "🔔 Statut mis à jour : {$ref} — {$this->labelStatus($newStatus)}";

        $this->sendHtmlEmail($tenantEmail, $subject, $html);
    }

    public function index(Request $request)
    {
        $landlord = $this->landlordOrFail();

        $q = MaintenanceRequest::query()
            ->where('landlord_id', $landlord->id)
            ->with(['property.landlord.user', 'tenant.user'])
            ->latest();

        if ($request->filled('status')) $q->where('status', $request->string('status'));
        if ($request->filled('property_id')) $q->where('property_id', $request->integer('property_id'));

        return MaintenanceRequestResource::collection($q->paginate(20));
    }

    public function show($id)
    {
        $landlord = $this->landlordOrFail();

        $incident = MaintenanceRequest::with(['property.landlord.user', 'tenant.user'])
            ->where('landlord_id', $landlord->id)
            ->findOrFail($id);

        return new MaintenanceRequestResource($incident);
    }

    public function store(Request $request)
    {
        $landlord = $this->landlordOrFail();

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
            'assigned_provider' => ['nullable', 'string', 'max:255'],
        ]);

        // Verify the property belongs to this landlord
        $property = \App\Models\Property::where('id', $data['property_id'])
            ->where('landlord_id', $landlord->id)
            ->first();

        if (!$property) {
            return response()->json(['message' => 'Ce bien ne vous appartient pas.'], 403);
        }

        $incident = MaintenanceRequest::create([
            'property_id' => $property->id,
            'landlord_id' => $landlord->id,
            'tenant_id' => null, // Created by landlord, no tenant associated
            'title' => $data['title'],
            'category' => $data['category'],
            'priority' => $data['priority'],
            'description' => $data['description'] ?? null,
            'preferred_slots' => $data['preferred_slots'] ?? [],
            'photos' => $data['photos'] ?? [],
            'assigned_provider' => $data['assigned_provider'] ?? null,
            'status' => 'open',
        ]);

        $incident->load(['property.landlord.user', 'tenant.user', 'property']);

        return (new MaintenanceRequestResource($incident))
            ->response()
            ->setStatusCode(201);
    }

    public function update(Request $request, $id)
    {
        $landlord = $this->landlordOrFail();

        $incident = MaintenanceRequest::where('landlord_id', $landlord->id)->findOrFail($id);

        $data = $request->validate([
            'status' => ['sometimes', 'in:open,in_progress,resolved,cancelled'],
            'assigned_provider' => ['nullable', 'string', 'max:255'],
        ]);

        $oldStatus = $incident->status;

        if (isset($data['status']) && $data['status'] === 'resolved') {
            $incident->resolved_at = now();
        }
        if (isset($data['status']) && in_array($data['status'], ['open', 'in_progress', 'cancelled'], true)) {
            $incident->resolved_at = null;
        }

        $incident->fill($data);
        $incident->save();

        $incident->load(['property.landlord.user', 'tenant.user', 'property', 'tenant']);

        // ✅ Email locataire si statut changé
        $newStatus = $incident->status;
        if (isset($data['status']) && $oldStatus !== $newStatus) {
            $this->sendTenantStatusChangedMail($incident, $oldStatus, $newStatus);
        }

        return new MaintenanceRequestResource($incident);
    }
}
