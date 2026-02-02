<?php

namespace App\Http\Controllers\CoOwner;

use App\Http\Controllers\Controller;
use App\Models\MaintenanceRequest;
use App\Models\CoOwner;
use App\Models\PropertyDelegation; // ⬅️ LE BON NOM ICI
use App\Models\User;
use Laravel\Sanctum\PersonalAccessToken;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class CoOwnerMaintenanceController extends Controller
{
    private function getCoOwner()
    {
        if (Auth::check()) {
            $user = Auth::user();
            if ($user && $this->isCoOwner($user)) {
                return CoOwner::where('user_id', $user->id)->firstOrFail();
            }
        }

        $token = request()->query('api_token');
        if ($token) {
            $accessToken = PersonalAccessToken::findToken($token);

            if ($accessToken) {
                $user = $accessToken->tokenable;

                if ($user && $this->isCoOwner($user)) {
                    Auth::login($user);
                    return CoOwner::where('user_id', $user->id)->firstOrFail();
                }
            }
        }

        abort(403, 'Accès réservé aux copropriétaires/agences. Veuillez vous reconnecter.');
    }

    private function isCoOwner($user)
    {
        return $user->coOwner !== null;
    }

    private function getDelegatedProperties()
    {
        $coOwner = $this->getCoOwner();

        return PropertyDelegation::where('co_owner_id', $coOwner->id) // ⬅️ CORRIGÉ ICI
            ->where('status', 'active')
            ->with('property')
            ->get()
            ->pluck('property')
            ->filter()
            ->pluck('id')
            ->toArray();
    }

    private function appName(): string
    {
        return config('app.name', 'Gestiloc');
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

    private function sendHtmlEmail(string $to, string $subject, string $html): void
    {
        Mail::html($html, function ($message) use ($to, $subject) {
            $message->to($to)->subject($subject);
        });

        Log::info('[maintenance-reply-mail] sent', ['to' => $to, 'subject' => $subject]);
    }

    private function incidentCardHtml(MaintenanceRequest $incident, bool $includeDetails = true): string
    {
        $property = $incident->property;
        $propertyLabel = $property ? e($property->address . ', ' . ($property->city ?? '')) : 'Bien non spécifié';
        $title = e((string) $incident->title);

        $categoryLabels = [
            'plumbing' => 'Plomberie',
            'electricity' => 'Électricité',
            'heating' => 'Chauffage',
            'other' => 'Autre',
        ];

        $priorityLabels = [
            'low' => 'Faible',
            'medium' => 'Moyenne',
            'high' => 'Élevée',
            'emergency' => 'Urgence',
        ];

        $statusLabels = [
            'open' => 'Ouvert',
            'in_progress' => 'En cours',
            'resolved' => 'Résolu',
            'cancelled' => 'Annulé',
        ];

        $category = e($categoryLabels[$incident->category] ?? $incident->category);
        $priority = e($priorityLabels[$incident->priority] ?? $incident->priority);
        $status = e($statusLabels[$incident->status] ?? $incident->status);

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

        $photosHtml = '';
        if ($includeDetails && !empty($incident->photos)) {
            $photos = is_array($incident->photos) ? $incident->photos : [];
            $cells = '';
            foreach (array_slice($photos, 0, 3) as $url) {
                $fullUrl = asset('storage/' . ltrim($url, '/'));
                $u = e($fullUrl);
                $cells .= <<<HTML
<td style="padding-right:8px;">
  <img src="{$u}" alt="Photo" width="180" style="border-radius:12px;border:1px solid #eef2f7;display:block;">
</td>
HTML;
            }
            if ($cells) {
                $more = count($photos) > 3 ? '<div style="font-size:12px;color:#6b7280;margin-top:6px;">+' . (count($photos) - 3) . ' photo(s) supplémentaire(s)</div>' : '';
                $photosHtml = <<<HTML
<div style="margin-top:12px;">
  <div style="font-size:13px;font-weight:700;color:#111827;margin-bottom:8px;">Photos</div>
  <table role="presentation" cellspacing="0" cellpadding="0"><tr>{$cells}</tr></table>
  {$more}
</div>
HTML;
            }
        }

        $detailsHtml = $includeDetails ? $descHtml . $slotsHtml . $photosHtml : '';

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
      {$detailsHtml}
    </td>
  </tr>
</table>
HTML;
    }

    private function sendReplyEmail(MaintenanceRequest $incident, string $message, string $status): void
    {
        $tenantEmail = $incident->tenant?->user?->email ?? null;
        if (!$tenantEmail) return;

        $ref = 'MAINT-' . str_pad((string) $incident->id, 6, '0', STR_PAD_LEFT);

        $coOwner = $this->getCoOwner();
        $coOwnerName = $coOwner->first_name . ' ' . $coOwner->last_name;
        if (trim($coOwnerName) === '') {
            $coOwnerName = $coOwner->company_name ?? 'Le gestionnaire';
        }

        $statusLabels = [
            'in_progress' => 'prise en charge',
            'resolved' => 'résolution',
            'cancelled' => 'annulation',
        ];

        $title = 'Réponse à votre demande de maintenance ✨';
        $subject = "✨ Réponse à votre demande : {$ref} — {$incident->title}";

        $messageEsc = nl2br(e($message));
        $actionText = isset($statusLabels[$status]) ? "votre demande a été marquée comme <strong>{$statusLabels[$status]}</strong>" : "une action a été prise sur votre demande";

        $content = <<<HTML
<div style="font-size:14px;color:#374151;line-height:1.7;">
  Bonjour,<br><br>
  <strong>{$coOwnerName}</strong> vous répond concernant votre demande de maintenance.
  {$actionText}.
</div>

<div style="margin-top:16px;padding:14px;background:#f0f9ff;border-radius:12px;border-left:4px solid #3b82f6;">
  <div style="font-size:13px;font-weight:700;color:#111827;margin-bottom:8px;">Message de {$coOwnerName} :</div>
  <div style="font-size:14px;color:#374151;line-height:1.6;">{$messageEsc}</div>
</div>

<div style="height:14px"></div>
{$this->incidentCardHtml($incident, false)}

<div style="height:16px"></div>
{$this->buttonHtml('Voir ma demande', url('/tenant/dashboard'))}
<div style="margin-top:14px;font-size:12px;color:#6b7280;line-height:1.6;">
  Vous pouvez répondre directement à cet email si vous avez d'autres questions.
</div>
HTML;

        $html = $this->mailLayoutHtml($title, e($ref), $content);
        $this->sendHtmlEmail($tenantEmail, $subject, $html);
    }

    public function index()
    {
        try {
            $coOwner = $this->getCoOwner();
            $delegatedProperties = $this->getDelegatedProperties();

            if (empty($delegatedProperties)) {
                return view('co-owner.maintenance.index', [
                    'maintenanceRequests' => collect(),
                    'stats' => [
                        'total' => 0,
                        'open' => 0,
                        'in_progress' => 0,
                        'resolved' => 0,
                        'properties' => 0,
                    ],
                    'coOwner' => $coOwner,
                    'delegations' => [],
                ]);
            }

            $maintenanceRequests = MaintenanceRequest::whereIn('property_id', $delegatedProperties)
                ->with(['property', 'tenant.user', 'landlord.user'])
                ->orderBy('created_at', 'desc')
                ->get();

            $stats = [
                'total' => $maintenanceRequests->count(),
                'open' => $maintenanceRequests->where('status', 'open')->count(),
                'in_progress' => $maintenanceRequests->where('status', 'in_progress')->count(),
                'resolved' => $maintenanceRequests->where('status', 'resolved')->count(),
                'cancelled' => $maintenanceRequests->where('status', 'cancelled')->count(),
                'properties' => count($delegatedProperties),
            ];

            $delegations = PropertyDelegation::where('co_owner_id', $coOwner->id) // ⬅️ CORRIGÉ ICI
                ->where('status', 'active')
                ->with('property')
                ->get();

            return view('co-owner.maintenance.index', [
                'maintenanceRequests' => $maintenanceRequests,
                'stats' => $stats,
                'coOwner' => $coOwner,
                'delegations' => $delegations,
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur accès maintenance copropriétaire: ' . $e->getMessage());
            return redirect('/login')->with('error', 'Session expirée. Veuillez vous reconnecter.');
        }
    }

    public function show(MaintenanceRequest $maintenance)
    {
        $coOwner = $this->getCoOwner();
        $delegatedProperties = $this->getDelegatedProperties();

        if (!in_array($maintenance->property_id, $delegatedProperties)) {
            abort(403, 'Vous n\'avez pas accès à cette demande');
        }

        $maintenance->load(['property', 'tenant.user', 'landlord.user']);

        return view('co-owner.maintenance.show', [
            'maintenance' => $maintenance,
            'coOwner' => $coOwner,
        ]);
    }

    public function start(MaintenanceRequest $maintenance, Request $request)
    {
        $coOwner = $this->getCoOwner();
        $delegatedProperties = $this->getDelegatedProperties();

        if (!in_array($maintenance->property_id, $delegatedProperties)) {
            abort(403, 'Vous n\'avez pas accès à cette demande');
        }

        $request->validate([
            'provider' => 'nullable|string|max:255',
            'estimated_date' => 'nullable|date',
        ]);

        $maintenance->update([
            'status' => 'in_progress',
            'assigned_provider' => $request->input('provider'),
        ]);

        $message = "Votre demande de maintenance a été prise en charge. " .
                  ($request->input('provider') ? "Prestataire assigné : " . $request->input('provider') . ". " : "") .
                  ($request->input('estimated_date') ? "Date estimée d'intervention : " . $request->input('estimated_date') . ". " : "") .
                  "Nous vous tiendrons informé de l'avancement.";

        $this->sendReplyEmail($maintenance, $message, 'in_progress');

        return redirect()
            ->route('co-owner.maintenance.show', $maintenance)
            ->with('success', 'Demande marquée comme "en cours" et notification envoyée au locataire.');
    }

    public function assign(MaintenanceRequest $maintenance, Request $request)
    {
        $coOwner = $this->getCoOwner();
        $delegatedProperties = $this->getDelegatedProperties();

        if (!in_array($maintenance->property_id, $delegatedProperties)) {
            abort(403, 'Vous n\'avez pas accès à cette demande');
        }

        $request->validate([
            'provider' => 'required|string|max:255',
            'contact_info' => 'nullable|string|max:500',
            'estimated_cost' => 'nullable|numeric|min:0',
        ]);

        $maintenance->update([
            'assigned_provider' => $request->input('provider'),
        ]);

        $message = "Un prestataire a été assigné à votre demande : " . $request->input('provider') . ". " .
                  ($request->input('contact_info') ? "Contact : " . $request->input('contact_info') . ". " : "") .
                  ($request->input('estimated_cost') ? "Coût estimé : " . number_format($request->input('estimated_cost'), 2) . " €. " : "") .
                  "Vous serez informé de la date d'intervention.";

        $this->sendReplyEmail($maintenance, $message, 'in_progress');

        return redirect()
            ->route('co-owner.maintenance.show', $maintenance)
            ->with('success', 'Prestataire assigné et notification envoyée au locataire.');
    }

    public function resolve(MaintenanceRequest $maintenance, Request $request)
    {
        $coOwner = $this->getCoOwner();
        $delegatedProperties = $this->getDelegatedProperties();

        if (!in_array($maintenance->property_id, $delegatedProperties)) {
            abort(403, 'Vous n\'avez pas accès à cette demande');
        }

        $request->validate([
            'resolution_details' => 'nullable|string|max:1000',
            'actual_cost' => 'nullable|numeric|min:0',
        ]);

        $maintenance->update([
            'status' => 'resolved',
            'resolved_at' => now(),
        ]);

        $message = "Votre demande de maintenance a été résolue. " .
                  ($request->input('resolution_details') ? "Détails : " . $request->input('resolution_details') . ". " : "") .
                  ($request->input('actual_cost') ? "Coût final : " . number_format($request->input('actual_cost'), 2) . " €. " : "") .
                  "Merci de nous informer si le problème persiste.";

        $this->sendReplyEmail($maintenance, $message, 'resolved');

        return redirect()
            ->route('co-owner.maintenance.show', $maintenance)
            ->with('success', 'Demande marquée comme résolue et notification envoyée au locataire.');
    }

    public function cancel(MaintenanceRequest $maintenance, Request $request)
    {
        $coOwner = $this->getCoOwner();
        $delegatedProperties = $this->getDelegatedProperties();

        if (!in_array($maintenance->property_id, $delegatedProperties)) {
            abort(403, 'Vous n\'avez pas accès à cette demande');
        }

        $request->validate([
            'reason' => 'required|string|max:500',
        ]);

        $maintenance->update([
            'status' => 'cancelled',
        ]);

        $message = "Votre demande de maintenance a été annulée. Raison : " . $request->input('reason') . ". " .
                  "Si le problème persiste, vous pouvez créer une nouvelle demande.";

        $this->sendReplyEmail($maintenance, $message, 'cancelled');

        return redirect()
            ->route('co-owner.maintenance.show', $maintenance)
            ->with('success', 'Demande annulée et notification envoyée au locataire.');
    }

    public function replyToTenant(MaintenanceRequest $maintenance, Request $request)
    {
        $coOwner = $this->getCoOwner();
        $delegatedProperties = $this->getDelegatedProperties();

        if (!in_array($maintenance->property_id, $delegatedProperties)) {
            abort(403, 'Vous n\'avez pas accès à cette demande');
        }

        $request->validate([
            'message' => 'required|string|min:10|max:2000',
        ]);

        $this->sendReplyEmail($maintenance, $request->input('message'), $maintenance->status);

        return redirect()
            ->route('co-owner.maintenance.show', $maintenance)
            ->with('success', 'Votre réponse a été envoyée au locataire par email.');
    }
}
