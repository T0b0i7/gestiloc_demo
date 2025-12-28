<?php

namespace App\Http\Controllers\Api\Landlord;

use App\Http\Controllers\Controller;
use App\Http\Requests\Landlord\StoreLeaseRequest;
use App\Http\Requests\Landlord\TerminateLeaseRequest;
use App\Http\Resources\LeaseResource;
use App\Models\Lease;
use App\Models\Invoice;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Carbon\Carbon;

class LeaseController extends Controller
{
    private function getLandlord()
    {
        return auth('api')->user()->landlord;
    }

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
        // uuid est déjà parfait comme ref, on ajoute un prefix lisible
        $short = substr((string) $lease->uuid, 0, 8);
        return 'LEASE-' . strtoupper($short);
    }

    private function formatMoney($amount): string
    {
        // Montants souvent stockés en string/decimal
        $n = is_numeric($amount) ? (float) $amount : 0.0;
        return number_format($n, 2, ',', ' ') . ' €';
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

        \Log::info('[lease-mail] sent', ['to' => $to, 'subject' => $subject]);
    }

    private function resolveTenantEmail(Lease $lease): ?string
    {
        // Selon ton modèle: tenant.user.email (vu dans les incidents)
        $email = $lease->tenant?->user?->email ?? null;

        // fallback si tenant a un champ email direct
        if (!$email && isset($lease->tenant?->email)) {
            $email = $lease->tenant->email;
        }

        return $email ?: null;
    }

    private function resolveLandlordEmail(Lease $lease): ?string
    {
        // bailleur connecté (souvent l’email de notif)
        $email = auth('api')->user()?->email ?? null;

        // fallback: via property.landlord.user.email si chargé
        if (!$email) {
            $email = $lease->property?->landlord?->user?->email ?? null;
        }

        // fallback: landlord.email direct
        if (!$email && isset($lease->property?->landlord?->email)) {
            $email = $lease->property->landlord->email;
        }

        return $email ?: null;
    }

    private function leaseSummaryCardHtml(Lease $lease): string
    {
        $propertyLabel = '—';
        if ($lease->property) {
            $propertyLabel = trim((string) ($lease->property->address ?? ''));
            if (!empty($lease->property->city)) $propertyLabel .= ', ' . $lease->property->city;
            if ($propertyLabel === '') $propertyLabel = '—';
        }

        $tenantName = '—';
        if ($lease->tenant) {
            $tenantName = trim((string) ($lease->tenant->first_name ?? '') . ' ' . (string) ($lease->tenant->last_name ?? ''));
            if ($tenantName === '') $tenantName = '—';
        }

        $start = $lease->start_date ? Carbon::parse($lease->start_date)->format('d/m/Y') : '—';
        $end = $lease->end_date ? Carbon::parse($lease->end_date)->format('d/m/Y') : '—';

        $rent = $this->formatMoney($lease->rent_amount);
        $charges = $this->formatMoney($lease->charges_amount ?? 0);
        $guarantee = $this->formatMoney($lease->guarantee_amount ?? 0);

        $status = e((string) $lease->status);

        return <<<HTML
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #eef2f7;border-radius:14px;overflow:hidden;">
  <tr>
    <td style="padding:14px 14px;background:#f9fafb;">
      <div style="font-size:14px;font-weight:700;color:#111827;">Bail</div>
      <div style="font-size:13px;color:#6b7280;margin-top:4px;">Bien : {e($propertyLabel)}</div>
      <div style="font-size:13px;color:#6b7280;margin-top:4px;">Locataire : {e($tenantName)}</div>
    </td>
  </tr>
  <tr>
    <td style="padding:14px;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
        <tr>
          <td style="font-size:13px;color:#374151;padding:6px 0;">Début</td>
          <td align="right" style="font-size:13px;color:#111827;font-weight:600;padding:6px 0;">{$start}</td>
        </tr>
        <tr>
          <td style="font-size:13px;color:#374151;padding:6px 0;">Fin</td>
          <td align="right" style="font-size:13px;color:#111827;font-weight:600;padding:6px 0;">{$end}</td>
        </tr>
        <tr>
          <td style="font-size:13px;color:#374151;padding:6px 0;">Loyer</td>
          <td align="right" style="font-size:13px;color:#111827;font-weight:600;padding:6px 0;">{$rent}</td>
        </tr>
        <tr>
          <td style="font-size:13px;color:#374151;padding:6px 0;">Charges</td>
          <td align="right" style="font-size:13px;color:#111827;font-weight:600;padding:6px 0;">{$charges}</td>
        </tr>
        <tr>
          <td style="font-size:13px;color:#374151;padding:6px 0;">Caution</td>
          <td align="right" style="font-size:13px;color:#111827;font-weight:600;padding:6px 0;">{$guarantee}</td>
        </tr>
        <tr>
          <td style="font-size:13px;color:#374151;padding:6px 0;">Statut</td>
          <td align="right" style="font-size:13px;color:#111827;font-weight:600;padding:6px 0;">{$status}</td>
        </tr>
      </table>
    </td>
  </tr>
</table>
HTML;
    }

    private function sendLeaseCreatedMails(Lease $lease, float $firstInvoiceAmount = 0.0): void
    {
        $lease->loadMissing(['property.landlord.user', 'tenant.user', 'property', 'tenant']);

        $ref = $this->leaseRef($lease);

        // 1) Email locataire : bail créé
        $tenantEmail = $this->resolveTenantEmail($lease);
        if ($tenantEmail) {
            $title = 'Nouveau bail créé ✅';

            $firstInvoiceLine = '';
            if ($firstInvoiceAmount > 0) {
                $firstInvoiceLine = '<div style="margin-top:10px;font-size:13px;color:#374151;line-height:1.6;">'
                    . 'Un premier paiement a été généré (caution / avance) : <strong>' . e($this->formatMoney($firstInvoiceAmount)) . '</strong>.'
                    . '</div>';
            }

            $content = <<<HTML
<div style="font-size:14px;color:#374151;line-height:1.7;">
  Bonjour,<br><br>
  Votre bail vient d’être créé. Vous pouvez consulter les détails depuis votre espace.
</div>
<div style="height:14px"></div>
{$this->leaseSummaryCardHtml($lease)}
{$firstInvoiceLine}
<div style="height:16px"></div>
{$this->buttonHtml('Ouvrir mon espace', $this->frontendUrl())}
HTML;

            $html = $this->mailLayoutHtml($title, e($ref), $content);
            $subject = "✅ Bail créé : {$ref}";

            $this->sendHtmlEmail($tenantEmail, $subject, $html);
        } else {
            \Log::warning('[lease-mail] tenant email missing', ['lease_id' => $lease->id]);
        }

        // 2) Email bailleur : confirmation
        $landlordEmail = $this->resolveLandlordEmail($lease);
        if ($landlordEmail) {
            $title = 'Bail créé (confirmation) 🧾';

            $firstInvoiceLine = '';
            if ($firstInvoiceAmount > 0) {
                $firstInvoiceLine = '<div style="margin-top:10px;font-size:13px;color:#374151;line-height:1.6;">'
                    . 'Première facture générée : <strong>' . e($this->formatMoney($firstInvoiceAmount)) . '</strong>.'
                    . '</div>';
            }

            $content = <<<HTML
<div style="font-size:14px;color:#374151;line-height:1.7;">
  Bonjour,<br><br>
  Le bail a été créé avec succès et le bien a été marqué comme “loué”.
</div>
<div style="height:14px"></div>
{$this->leaseSummaryCardHtml($lease)}
{$firstInvoiceLine}
<div style="height:16px"></div>
{$this->buttonHtml('Voir les baux', $this->frontendUrl())}
HTML;

            $html = $this->mailLayoutHtml($title, e($ref), $content);
            $subject = "🧾 Bail créé : {$ref}";

            $this->sendHtmlEmail($landlordEmail, $subject, $html);
        } else {
            \Log::warning('[lease-mail] landlord email missing', ['lease_id' => $lease->id]);
        }
    }

    private function sendLeaseTerminatedMails(Lease $lease, string $endDateYmd): void
    {
        $lease->loadMissing(['property.landlord.user', 'tenant.user', 'property', 'tenant']);
        $ref = $this->leaseRef($lease);

        $end = Carbon::parse($endDateYmd)->format('d/m/Y');

        // Locataire
        $tenantEmail = $this->resolveTenantEmail($lease);
        if ($tenantEmail) {
            $title = 'Bail résilié';

            $content = <<<HTML
<div style="font-size:14px;color:#374151;line-height:1.7;">
  Bonjour,<br><br>
  Votre bail a été résilié. Date de fin : <strong>{$end}</strong>.
</div>
<div style="height:14px"></div>
{$this->leaseSummaryCardHtml($lease)}
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
        $landlordEmail = $this->resolveLandlordEmail($lease);
        if ($landlordEmail) {
            $title = 'Bail résilié (confirmation)';

            $content = <<<HTML
<div style="font-size:14px;color:#374151;line-height:1.7;">
  Bonjour,<br><br>
  Le bail a été résilié. Date de fin : <strong>{$end}</strong>. Le bien est maintenant “disponible”.
</div>
<div style="height:14px"></div>
{$this->leaseSummaryCardHtml($lease)}
<div style="height:16px"></div>
{$this->buttonHtml('Voir les baux', $this->frontendUrl())}
HTML;

            $html = $this->mailLayoutHtml($title, e($ref), $content);
            $subject = "✅ Bail résilié : {$ref}";

            $this->sendHtmlEmail($landlordEmail, $subject, $html);
        } else {
            \Log::warning('[lease-mail] landlord email missing', ['lease_id' => $lease->id]);
        }
    }

    public function index(Request $request)
    {
        $query = Lease::whereHas('property', function ($q) {
            $q->where('landlord_id', $this->getLandlord()->id);
        });

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        return LeaseResource::collection($query->with(['property', 'tenant'])->latest()->paginate(15));
    }

    public function store(StoreLeaseRequest $request)
    {
        $data = $request->validated();

        $property = $this->getLandlord()->properties()->find($data['property_id']);
        if (!$property) {
            return response()->json(['message' => 'Propriété introuvable ou accès refusé.'], 403);
        }

        if ($property->status === 'rented') {
            return response()->json(['message' => 'Ce bien est déjà loué.'], 409);
        }

        return DB::transaction(function () use ($data, $property) {
            $lease = Lease::create([
                'property_id' => $property->id,
                'tenant_id' => $data['tenant_id'],
                'start_date' => $data['start_date'],
                'end_date' => $data['end_date'] ?? null,
                'rent_amount' => $data['rent_amount'],
                'charges_amount' => $data['charges_amount'] ?? 0,
                'guarantee_amount' => $data['guarantee_amount'] ?? 0,
                'prepaid_rent_months' => $data['prepaid_rent_months'] ?? 0,
                'billing_day' => $data['billing_day'] ?? 1,
                'status' => 'active',
            ]);

            $property->update(['status' => 'rented']);

            $totalFirstInvoice = (float) ($lease->guarantee_amount ?? 0) + ((float) ($lease->rent_amount ?? 0) * (int) ($lease->prepaid_rent_months ?? 0));

            if ($totalFirstInvoice > 0) {
                Invoice::create([
                    'lease_id' => $lease->id,
                    'type' => 'deposit',
                    'due_date' => Carbon::parse($data['start_date']),
                    'period_start' => Carbon::parse($data['start_date']),
                    'period_end' => Carbon::parse($data['start_date'])->addMonths((int) ($lease->prepaid_rent_months ?? 0)),
                    'amount_total' => $totalFirstInvoice,
                    'status' => 'pending'
                ]);
            }

            // ✅ Emails (locataire + bailleur)
            $this->sendLeaseCreatedMails($lease, $totalFirstInvoice);

            return new LeaseResource($lease->load(['property', 'tenant']));
        });
    }

    public function show($uuid)
    {
        $lease = Lease::where('uuid', $uuid)
            ->whereHas('property', function ($q) {
                $q->where('landlord_id', $this->getLandlord()->id);
            })
            ->with(['property', 'tenant', 'invoices'])
            ->firstOrFail();

        return new LeaseResource($lease);
    }

    public function terminate(TerminateLeaseRequest $request, $uuid)
    {
        $lease = Lease::where('uuid', $uuid)->with(['property', 'tenant', 'property.landlord.user', 'tenant.user'])->firstOrFail();

        if ($lease->property->landlord_id !== $this->getLandlord()->id) {
            abort(403);
        }

        $date = $request->input('end_date', now());
        $endDateYmd = Carbon::parse($date)->toDateString();

        DB::transaction(function () use ($lease, $endDateYmd) {
            $lease->update([
                'status' => 'terminated',
                'end_date' => $endDateYmd
            ]);

            $lease->property->update(['status' => 'available']);
        });

        // ✅ Emails (locataire + bailleur)
        $this->sendLeaseTerminatedMails($lease->fresh(), $endDateYmd);

        return response()->json(['message' => 'Bail résilié avec succès. Le bien est à nouveau disponible.']);
    }
}
