<?php

namespace App\Http\Controllers\Api\Landlord;

use App\Http\Controllers\Controller;
use App\Http\Requests\Landlord\StorePropertyRequest;
use App\Http\Requests\Landlord\UpdatePropertyRequest;
use App\Http\Resources\PropertyResource;
use App\Models\Property;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;

class PropertyController extends Controller
{
    private function getLandlord()
    {
        return auth('sanctum')->user()->landlord;
    }

    private function appName(): string
    {
        return config('app.name', 'Gestiloc');
    }

    private function frontendUrl(): string
    {
        return rtrim(config('app.frontend_url', env('FRONTEND_URL', config('app.url'))), '/');
    }

    private function refFor(Property $property): string
    {
        $short = substr((string) $property->uuid, 0, 8);
        return 'PROP-' . strtoupper($short);
    }

    private function formatStatus(string $status): string
    {
        return match ($status) {
            'available' => 'Disponible',
            'rented' => 'Loué',
            'maintenance' => 'Maintenance',
            'archived' => 'Archivé',
            default => ucfirst(str_replace('_', ' ', $status)),
        };
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

    private function sendHtmlEmail(string $to, string $subject, string $html): void
    {
        Mail::html($html, function ($message) use ($to, $subject) {
            $message->to($to)->subject($subject);
        });

        \Log::info('[property-mail] sent', ['to' => $to, 'subject' => $subject]);
    }

    private function resolveLandlordEmail(): ?string
    {
        $user = auth('sanctum')->user() ?? auth('api')->user() ?? auth()->user();
        return $user?->email ?: null;
    }

    private function propertyCardHtml(Property $property): string
    {
        $name = e((string) ($property->name ?? 'Bien'));
        $address = e((string) ($property->address ?? '—'));
        $city = e((string) ($property->city ?? '—'));
        $ref = e((string) ($property->reference_code ?? '—'));
        $status = e($this->formatStatus((string) ($property->status ?? '')));

        $photos = is_array($property->photos ?? null) ? $property->photos : [];
        $photoHtml = '';
        if (!empty($photos)) {
            $u = e((string) $photos[0]);
            $photoHtml = <<<HTML
<tr>
  <td style="padding:14px;border-top:1px solid #eef2f7;">
    <img src="{$u}" alt="Photo du bien" width="600" style="max-width:100%;border-radius:14px;border:1px solid #eef2f7;display:block;">
  </td>
</tr>
HTML;
        }

        return <<<HTML
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #eef2f7;border-radius:14px;overflow:hidden;">
  <tr>
    <td style="padding:14px 14px;background:#f9fafb;">
      <div style="font-size:14px;font-weight:800;color:#111827;">{$name}</div>
      <div style="font-size:13px;color:#6b7280;margin-top:4px;">{$address} — {$city}</div>
    </td>
  </tr>
  <tr>
    <td style="padding:14px;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
        <tr>
          <td style="font-size:13px;color:#374151;padding:6px 0;">Référence</td>
          <td align="right" style="font-size:13px;color:#111827;font-weight:700;padding:6px 0;">{$ref}</td>
        </tr>
        <tr>
          <td style="font-size:13px;color:#374151;padding:6px 0;">Statut</td>
          <td align="right" style="font-size:13px;color:#111827;font-weight:700;padding:6px 0;">{$status}</td>
        </tr>
      </table>
    </td>
  </tr>
  {$photoHtml}
</table>
HTML;
    }

    private function sendPropertyCreatedMail(Property $property): void
    {
        $to = $this->resolveLandlordEmail();
        if (!$to) {
            \Log::warning('[property-mail] landlord email missing', ['property_id' => $property->id]);
            return;
        }

        $ref = $this->refFor($property);
        $title = 'Bien créé ✅';

        $content = <<<HTML
<div style="font-size:14px;color:#374151;line-height:1.7;">
  Bonjour,<br><br>
  Votre bien a été créé avec succès. Vous pouvez le gérer depuis votre tableau de bord.
</div>
<div style="height:14px"></div>
{$this->propertyCardHtml($property)}
<div style="height:16px"></div>
{$this->buttonHtml('Ouvrir le dashboard', $this->frontendUrl())}
HTML;

        $html = $this->mailLayoutHtml($title, e($ref), $content);
        $subject = "✅ Bien créé : {$ref}";

        $this->sendHtmlEmail($to, $subject, $html);
    }

    private function sendPropertyUpdatedMail(Property $property, array $changes): void
    {
        $to = $this->resolveLandlordEmail();
        if (!$to) {
            \Log::warning('[property-mail] landlord email missing', ['property_id' => $property->id]);
            return;
        }

        $ref = $this->refFor($property);
        $title = 'Bien mis à jour ✏️';

        $labels = [
            'name' => 'Nom',
            'address' => 'Adresse',
            'city' => 'Ville',
            'reference_code' => 'Référence',
            'status' => 'Statut',
            'photos' => 'Photos',
        ];

        $items = '';
        foreach ($changes as $field => $pair) {
            $label = $labels[$field] ?? ucfirst(str_replace('_', ' ', $field));
            $before = $pair['before'] ?? null;
            $after = $pair['after'] ?? null;

            if ($field === 'status') {
                $before = $before ? $this->formatStatus((string) $before) : $before;
                $after = $after ? $this->formatStatus((string) $after) : $after;
            }

            if ($field === 'photos') {
                $before = is_array($before) ? 'Mis à jour' : ($before ?? '—');
                $after = is_array($after) ? 'Mis à jour' : ($after ?? '—');
            }

            $items .= '<li style="margin-bottom:10px;">'
                . '<strong>' . e($label) . '</strong><br>'
                . '<span style="color:#6b7280;">Avant :</span> ' . e((string) ($before ?? '—')) . '<br>'
                . '<span style="color:#6b7280;">Après :</span> ' . e((string) ($after ?? '—')) .
                '</li>';
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
  Votre bien a été mis à jour. Voici un récapitulatif des changements :
</div>
<div style="height:12px"></div>
{$changesBox}
<div style="height:14px"></div>
{$this->propertyCardHtml($property)}
<div style="height:16px"></div>
{$this->buttonHtml('Ouvrir le dashboard', $this->frontendUrl())}
HTML;

        $html = $this->mailLayoutHtml($title, e($ref), $content);
        $subject = "✏️ Bien mis à jour : {$ref}";

        $this->sendHtmlEmail($to, $subject, $html);
    }

    private function sendPropertyDeletedMail(Property $property): void
    {
        $to = $this->resolveLandlordEmail();
        if (!$to) {
            \Log::warning('[property-mail] landlord email missing', ['property_id' => $property->id]);
            return;
        }

        $ref = $this->refFor($property);
        $title = 'Bien archivé 🗂️';

        $content = <<<HTML
<div style="font-size:14px;color:#374151;line-height:1.7;">
  Bonjour,<br><br>
  Votre bien a été archivé. Il n’apparaîtra plus dans la liste active, mais reste conservé dans l’historique.
</div>
<div style="height:14px"></div>
{$this->propertyCardHtml($property)}
<div style="height:16px"></div>
{$this->buttonHtml('Voir mes biens', $this->frontendUrl())}
HTML;

        $html = $this->mailLayoutHtml($title, e($ref), $content);
        $subject = "🗂️ Bien archivé : {$ref}";

        $this->sendHtmlEmail($to, $subject, $html);
    }

    public function index(Request $request)
    {
        $query = $this->getLandlord()->properties()->getQuery();

        if ($request->filled('city')) {
            $query->where('city', 'like', "%{$request->city}%");
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $term = $request->search;
            $query->where(function ($q) use ($term) {
                $q->where('name', 'like', "%{$term}%")
                    ->orWhere('address', 'like', "%{$term}%")
                    ->orWhere('reference_code', 'like', "%{$term}%");
            });
        }

        $properties = $query->latest()->paginate(10);

        return PropertyResource::collection($properties);
    }

    public function store(StorePropertyRequest $request)
    {
        $data = $request->validated();

        if ($request->hasFile('photos')) {
            $photos = [];
            foreach ($request->file('photos') as $photo) {
                $path = $photo->store('properties/photos', 'public');
                $photos[] = Storage::url($path);
            }
            $data['photos'] = $photos;
        }

        $property = $this->getLandlord()->properties()->create($data);

        // ✅ Email confirmation bailleur
        $this->sendPropertyCreatedMail($property);

        return new PropertyResource($property);
    }

    public function show($uuid)
    {
        $property = $this->getLandlord()->properties()
            ->where('uuid', $uuid)
            ->with(['leases.tenant'])
            ->firstOrFail();

        return new PropertyResource($property);
    }

    public function update(UpdatePropertyRequest $request, $uuid)
    {
        $property = $this->getLandlord()->properties()->where('uuid', $uuid)->firstOrFail();

        $data = $request->validated();

        if (isset($data['status']) && $data['status'] === 'maintenance') {
            if ($property->leases()->where('status', 'active')->exists()) {
                return response()->json(['message' => 'Impossible de passer en maintenance : un bail est en cours.'], 409);
            }
        }

        $before = $property->getOriginal();

        $property->update($data);

        $dirty = array_keys($property->getChanges());
        $changes = [];

        foreach ($dirty as $field) {
            $changes[$field] = [
                'before' => $before[$field] ?? null,
                'after' => $property->{$field},
            ];
        }

        if (!empty($changes)) {
            $this->sendPropertyUpdatedMail($property, $changes);
        }

        return new PropertyResource($property);
    }

    public function destroy($uuid)
    {
        $property = $this->getLandlord()->properties()->where('uuid', $uuid)->firstOrFail();

        if ($property->leases()->where('status', 'active')->exists()) {
            return response()->json([
                'message' => 'Impossible de supprimer ce bien car un locataire est en place.'
            ], 403);
        }

        $property->delete();

        // ✅ Email confirmation bailleur
        $this->sendPropertyDeletedMail($property);

        return response()->json(['message' => 'Bien archivé avec succès']);
    }
}
