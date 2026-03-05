<?php

namespace App\Http\Controllers\CoOwner;

use App\Http\Controllers\Controller;
use App\Models\Notice;
use App\Models\Lease;
use App\Models\Property;
use App\Models\PropertyDelegation;
use Laravel\Sanctum\PersonalAccessToken;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Carbon\Carbon;
use Illuminate\Support\Str;

class CoOwnerNoticeController extends Controller
{
    /**
     * Récupérer l'utilisateur authentifié
     */
    private function getAuthenticatedUser(Request $request)
    {
        if ($request->bearerToken()) {
            $token = $request->bearerToken();
            $sanctumToken = PersonalAccessToken::findToken($token);
            if ($sanctumToken) {
                $user = $sanctumToken->tokenable;
                auth('web')->login($user);
                return $user;
            }
        }

        if ($request->has('api_token')) {
            $token = $request->get('api_token');
            $sanctumToken = PersonalAccessToken::findToken($token);
            if ($sanctumToken) {
                $user = $sanctumToken->tokenable;
                auth('web')->login($user);
                return $user;
            }
        }

        if (auth()->check()) {
            return auth()->user();
        }

        return null;
    }

    /**
     * Liste des préavis avec filtres
     */
    public function index(Request $request)
    {
        $user = $this->getAuthenticatedUser($request);

        if (!$user || !$user->hasRole('co_owner')) {
            return redirect()->route('login')->with('error', 'Veuillez vous connecter');
        }

        $coOwner = $user->coOwner;
        if (!$coOwner) {
            return redirect()->route('login')->with('error', 'Profil co-propriétaire non trouvé');
        }

        // Récupérer les IDs des biens délégués
        $delegatedPropertyIds = PropertyDelegation::where('co_owner_id', $coOwner->id)
            ->where('status', 'active')
            ->pluck('property_id')
            ->toArray();

        if (empty($delegatedPropertyIds)) {
            return view('co-owner.notices.index', [
                'notices' => collect(),
                'totalNotices' => 0,
                'pendingNotices' => 0,
                'confirmedNotices' => 0,
                'activeLeases' => 0,
                'properties' => collect(),
                'statusFilter' => 'all',
                'searchTerm' => '',
                'propertyFilter' => '',
                'typeFilter' => '',
                'user' => $user
            ]);
        }

        // Statistiques globales
        $totalNotices = Notice::whereIn('property_id', $delegatedPropertyIds)->count();
        $pendingNotices = Notice::whereIn('property_id', $delegatedPropertyIds)
            ->where('status', 'pending')
            ->count();
        $confirmedNotices = Notice::whereIn('property_id', $delegatedPropertyIds)
            ->where('status', 'confirmed')
            ->count();
        $activeLeases = Lease::whereIn('property_id', $delegatedPropertyIds)
            ->where('status', 'active')
            ->count();

        // Query de base pour les préavis
        $query = Notice::whereIn('property_id', $delegatedPropertyIds)
            ->with(['property', 'tenant.user', 'landlord']);

        // Appliquer les filtres
        $statusFilter = $request->get('status', 'all');
        $searchTerm = $request->get('search', '');
        $propertyFilter = $request->get('property_id', '');
        $typeFilter = $request->get('type', '');

        // Filtre par statut
        if ($statusFilter !== 'all') {
            $query->where('status', $statusFilter);
        }

        // Filtre par bien
        if ($propertyFilter) {
            $query->where('property_id', $propertyFilter);
        }

        // Filtre par type
        if ($typeFilter) {
            $query->where('type', $typeFilter);
        }

        // Filtre par recherche
        if ($searchTerm) {
            $query->where(function($q) use ($searchTerm) {
                $q->where('reason', 'like', "%{$searchTerm}%")
                  ->orWhereHas('tenant', function($tenantQuery) use ($searchTerm) {
                      $tenantQuery->where('first_name', 'like', "%{$searchTerm}%")
                                  ->orWhere('last_name', 'like', "%{$searchTerm}%");
                  })
                  ->orWhereHas('property', function($propertyQuery) use ($searchTerm) {
                      $propertyQuery->where('address', 'like', "%{$searchTerm}%")
                                    ->orWhere('city', 'like', "%{$searchTerm}%");
                  });
            });
        }

        // Récupérer les préavis avec pagination
        $notices = $query->orderBy('notice_date', 'desc')
            ->orderBy('created_at', 'desc')
            ->paginate(9);

        // Liste des propriétés pour le filtre
        $properties = Property::whereIn('id', $delegatedPropertyIds)
            ->orderBy('address')
            ->get();

        return view('co-owner.notices.index', compact(
            'notices',
            'totalNotices',
            'pendingNotices',
            'confirmedNotices',
            'activeLeases',
            'properties',
            'statusFilter',
            'searchTerm',
            'propertyFilter',
            'typeFilter',
            'user'
        ));
    }

    /**
     * Afficher le formulaire de création
     */
    public function create(Request $request)
    {
        $user = $this->getAuthenticatedUser($request);

        if (!$user || !$user->hasRole('co_owner')) {
            return redirect()->route('login')->with('error', 'Veuillez vous connecter');
        }

        $coOwner = $user->coOwner;
        if (!$coOwner) {
            return redirect()->route('login')->with('error', 'Profil co-propriétaire non trouvé');
        }

        // Récupérer les IDs des biens délégués
        $delegatedPropertyIds = PropertyDelegation::where('co_owner_id', $coOwner->id)
            ->where('status', 'active')
            ->pluck('property_id')
            ->toArray();

        if (empty($delegatedPropertyIds)) {
            return redirect()->route('co-owner.notices.index')
                ->with('error', 'Aucun bien délégué trouvé');
        }

        // Récupérer les baux actifs
        $leases = Lease::whereIn('property_id', $delegatedPropertyIds)
            ->where('status', 'active')
            ->with(['property', 'tenant.user'])
            ->get();

        if ($leases->isEmpty()) {
            return redirect()->route('co-owner.notices.index')
                ->with('error', 'Aucun bail actif trouvé pour vos biens délégués');
        }

        return view('co-owner.notices.create', compact('leases', 'user'));
    }

    /**
     * Enregistrer un nouveau préavis
     */
    public function store(Request $request)
    {
        $user = $this->getAuthenticatedUser($request);

        if (!$user || !$user->hasRole('co_owner')) {
            return redirect()->route('login')->with('error', 'Veuillez vous connecter');
        }

        $coOwner = $user->coOwner;
        if (!$coOwner) {
            return redirect()->route('login')->with('error', 'Profil co-propriétaire non trouvé');
        }

        // Validation
        $validator = Validator::make($request->all(), [
            'lease_id'    => ['required', 'exists:leases,id'],
            'reason'      => ['required', 'string', 'max:1000'],
            'notice_date' => ['required', 'date'],
            'end_date'    => ['required', 'date', 'after:notice_date'],
            'notes'       => ['nullable', 'string', 'max:1000'],
            'type'        => ['required', 'in:landlord,tenant'],
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        // Vérifier que le bail appartient à un bien délégué
        $lease = Lease::with('property')->find($request->lease_id);

        if (!$lease) {
            return back()->with('error', 'Bail non trouvé')->withInput();
        }

        $isDelegated = PropertyDelegation::where('property_id', $lease->property_id)
            ->where('co_owner_id', $coOwner->id)
            ->where('status', 'active')
            ->exists();

        if (!$isDelegated) {
            return back()->with('error', 'Vous n\'avez pas accès à ce bail')->withInput();
        }

        try {
            // Déterminer le landlord_id (propriétaire principal)
            $landlordId = null;
            if ($lease->property) {
                $landlordId = $lease->property->landlord_id ?? $lease->property->user_id;
            }

            if (!$landlordId) {
                return back()->with('error', 'Impossible de déterminer le propriétaire principal')->withInput();
            }

            // Créer le préavis
            $notice = Notice::create([
                'property_id'  => $lease->property_id,
                'landlord_id'  => $landlordId,
                'tenant_id'    => $lease->tenant_id,
                'type'         => $request->type,
                'reason'       => $request->reason,
                'notice_date'  => $request->notice_date,
                'end_date'     => $request->end_date,
                'status'       => 'pending',
                'notes'        => $request->notes,
                'created_by'   => 'co_owner',
                'co_owner_id'  => $coOwner->id,
            ]);

            // Envoyer les emails
            $this->sendNoticeCreatedMails($notice);

            Log::info('Préavis créé par co-propriétaire', [
                'notice_id' => $notice->id,
                'co_owner_id' => $coOwner->id,
                'lease_id' => $lease->id,
            ]);

            return redirect()->route('co-owner.notices.index')
                ->with('success', 'Préavis créé avec succès. Des emails ont été envoyés.');

        } catch (\Exception $e) {
            Log::error('Erreur création préavis co-propriétaire', [
                'error' => $e->getMessage(),
                'co_owner_id' => $coOwner->id,
                'request' => $request->all(),
            ]);

            return back()->with('error', 'Erreur lors de la création du préavis: ' . $e->getMessage())->withInput();
        }
    }

    /**
     * Afficher les détails d'un préavis
     */
    public function show(Request $request, Notice $notice)
    {
        $user = $this->getAuthenticatedUser($request);

        if (!$user || !$user->hasRole('co_owner')) {
            return redirect()->route('login')->with('error', 'Veuillez vous connecter');
        }

        $coOwner = $user->coOwner;
        if (!$coOwner) {
            return redirect()->route('login')->with('error', 'Profil co-propriétaire non trouvé');
        }

        // Vérifier que le préavis appartient à un bien délégué
        $isDelegated = PropertyDelegation::where('property_id', $notice->property_id)
            ->where('co_owner_id', $coOwner->id)
            ->where('status', 'active')
            ->exists();

        if (!$isDelegated) {
            return redirect()->route('co-owner.notices.index')
                ->with('error', 'Vous n\'avez pas accès à ce préavis');
        }

        // Charger les relations
        $notice->load(['property', 'tenant.user', 'landlord']);

        return view('co-owner.notices.show', compact('notice', 'user'));
    }

    /**
     * Formulaire d'édition
     */
    public function edit(Request $request, Notice $notice)
    {
        $user = $this->getAuthenticatedUser($request);

        if (!$user || !$user->hasRole('co_owner')) {
            return redirect()->route('login')->with('error', 'Veuillez vous connecter');
        }

        $coOwner = $user->coOwner;
        if (!$coOwner) {
            return redirect()->route('login')->with('error', 'Profil co-propriétaire non trouvé');
        }

        // Vérifier que le préavis appartient à un bien délégué
        $isDelegated = PropertyDelegation::where('property_id', $notice->property_id)
            ->where('co_owner_id', $coOwner->id)
            ->where('status', 'active')
            ->exists();

        if (!$isDelegated) {
            return redirect()->route('co-owner.notices.index')
                ->with('error', 'Vous n\'avez pas accès à ce préavis');
        }

        // Récupérer les baux délégués pour le formulaire
        $delegatedPropertyIds = PropertyDelegation::where('co_owner_id', $coOwner->id)
            ->where('status', 'active')
            ->pluck('property_id')
            ->toArray();

        $leases = Lease::whereIn('property_id', $delegatedPropertyIds)
            ->where('status', 'active')
            ->with(['property', 'tenant.user'])
            ->get();

        return view('co-owner.notices.edit', compact('notice', 'leases', 'user'));
    }

    /**
     * Mettre à jour un préavis
     */
    public function update(Request $request, Notice $notice)
    {
        $user = $this->getAuthenticatedUser($request);

        if (!$user || !$user->hasRole('co_owner')) {
            return redirect()->route('login')->with('error', 'Veuillez vous connecter');
        }

        $coOwner = $user->coOwner;
        if (!$coOwner) {
            return redirect()->route('login')->with('error', 'Profil co-propriétaire non trouvé');
        }

        // Vérifier que le préavis appartient à un bien délégué
        $isDelegated = PropertyDelegation::where('property_id', $notice->property_id)
            ->where('co_owner_id', $coOwner->id)
            ->where('status', 'active')
            ->exists();

        if (!$isDelegated) {
            return back()->with('error', 'Vous n\'avez pas accès à ce préavis');
        }

        // Validation
        $validator = Validator::make($request->all(), [
            'reason'      => ['required', 'string', 'max:1000'],
            'notice_date' => ['required', 'date'],
            'end_date'    => ['required', 'date', 'after:notice_date'],
            'notes'       => ['nullable', 'string', 'max:1000'],
            'type'        => ['required', 'in:landlord,tenant'],
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        try {
            $oldStatus = $notice->status;

            $notice->update([
                'reason'      => $request->reason,
                'notice_date' => $request->notice_date,
                'end_date'    => $request->end_date,
                'notes'       => $request->notes,
                'type'        => $request->type,
            ]);

            Log::info('Préavis modifié par co-propriétaire', [
                'notice_id' => $notice->id,
                'co_owner_id' => $coOwner->id,
            ]);

            return redirect()->route('co-owner.notices.show', $notice)
                ->with('success', 'Préavis modifié avec succès');

        } catch (\Exception $e) {
            Log::error('Erreur modification préavis', [
                'error' => $e->getMessage(),
                'notice_id' => $notice->id,
            ]);

            return back()->with('error', 'Erreur lors de la modification du préavis: ' . $e->getMessage())->withInput();
        }
    }

    /**
     * Mettre à jour le statut d'un préavis
     */
    public function updateStatus(Request $request, Notice $notice)
    {
        $user = $this->getAuthenticatedUser($request);

        if (!$user || !$user->hasRole('co_owner')) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $coOwner = $user->coOwner;
        if (!$coOwner) {
            return response()->json(['message' => 'Profil co-propriétaire non trouvé'], 422);
        }

        // Vérifier que le préavis appartient à un bien délégué
        $isDelegated = PropertyDelegation::where('property_id', $notice->property_id)
            ->where('co_owner_id', $coOwner->id)
            ->where('status', 'active')
            ->exists();

        if (!$isDelegated) {
            return response()->json(['message' => 'Vous n\'avez pas accès à ce préavis'], 403);
        }

        $validator = Validator::make($request->all(), [
            'status' => 'required|in:confirmed,cancelled',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        try {
            $oldStatus = $notice->status;
            $notice->update(['status' => $request->status]);

            Log::info('Statut préavis modifié', [
                'notice_id' => $notice->id,
                'old_status' => $oldStatus,
                'new_status' => $request->status,
                'co_owner_id' => $coOwner->id,
            ]);

            return back()->with('success', 'Statut du préavis mis à jour');

        } catch (\Exception $e) {
            Log::error('Erreur changement statut préavis', [
                'error' => $e->getMessage(),
                'notice_id' => $notice->id,
            ]);

            return back()->with('error', 'Erreur lors du changement de statut: ' . $e->getMessage());
        }
    }

    /**
     * Supprimer un préavis
     */
    public function destroy(Request $request, Notice $notice)
    {
        $user = $this->getAuthenticatedUser($request);

        if (!$user || !$user->hasRole('co_owner')) {
            return back()->with('error', 'Non autorisé');
        }

        $coOwner = $user->coOwner;
        if (!$coOwner) {
            return back()->with('error', 'Profil co-propriétaire non trouvé');
        }

        // Vérifier que le préavis appartient à un bien délégué
        $isDelegated = PropertyDelegation::where('property_id', $notice->property_id)
            ->where('co_owner_id', $coOwner->id)
            ->where('status', 'active')
            ->exists();

        if (!$isDelegated) {
            return back()->with('error', 'Vous n\'avez pas accès à ce préavis');
        }

        try {
            $notice->delete();

            Log::info('Préavis supprimé par co-propriétaire', [
                'notice_id' => $notice->id,
                'co_owner_id' => $coOwner->id,
            ]);

            return redirect()->route('co-owner.notices.index')
                ->with('success', 'Préavis supprimé avec succès');

        } catch (\Exception $e) {
            Log::error('Erreur suppression préavis', [
                'error' => $e->getMessage(),
                'notice_id' => $notice->id,
            ]);

            return back()->with('error', 'Erreur lors de la suppression du préavis: ' . $e->getMessage());
        }
    }

    /**
     * Helpers pour les emails
     */
    private function appName(): string
    {
        return config('app.name', 'Gestiloc');
    }

    private function noticeRef(Notice $notice): string
    {
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

    private function noticeCardHtml(Notice $notice): string
    {
        $ref = e($this->noticeRef($notice));
        $type = e((string) ($notice->type === 'landlord' ? 'Bailleur' : 'Locataire'));
        $status = e($this->formatStatus($notice->status ?? null));

        $property = $notice->property;
        $propertyLabel = $property ? e($property->address . ', ' . $property->city) : '—';

        $tenant = $notice->tenant;
        $tenantName = $tenant ? e($tenant->first_name . ' ' . $tenant->last_name) : '—';

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
      <div style="font-size:13px;color:#6b7280;margin-top:4px;">Bien : {$propertyLabel}</div>
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

    private function sendNoticeCreatedMails(Notice $notice): void
    {
        try {
            $notice->load(['property', 'tenant.user', 'landlord']);

            $ref = $this->noticeRef($notice);
            $dashboardUrl = url('/');

            // Email au locataire
            $tenantEmail = $notice->tenant->user->email ?? $notice->tenant->email ?? null;
            if ($tenantEmail) {
                $subject = "📌 Nouveau préavis : {$ref}";
                $title = "Préavis reçu";

                $content = <<<HTML
<div style="font-size:14px;color:#374151;line-height:1.7;">
  Bonjour,<br><br>
  Un préavis a été créé par le gestionnaire du bien.
</div>
<div style="height:14px"></div>
{$this->noticeCardHtml($notice)}
<div style="height:16px"></div>
{$this->buttonHtml('Voir le préavis', $dashboardUrl)}
HTML;

                $html = $this->mailLayoutHtml($title, $ref, $content);
                Mail::html($html, function ($message) use ($tenantEmail, $subject) {
                    $message->to($tenantEmail)->subject($subject);
                });
            }

            // Email au propriétaire principal
            $landlordEmail = $notice->landlord->email ?? null;
            if ($landlordEmail) {
                $subject = "✅ Préavis créé : {$ref}";
                $title = "Préavis créé par co-propriétaire";

                $content = <<<HTML
<div style="font-size:14px;color:#374151;line-height:1.7;">
  Bonjour,<br><br>
  Un préavis a été créé par un co-propriétaire pour l'un de vos biens.
</div>
<div style="height:14px"></div>
{$this->noticeCardHtml($notice)}
<div style="height:16px"></div>
{$this->buttonHtml('Voir le dashboard', $dashboardUrl)}
HTML;

                $html = $this->mailLayoutHtml($title, $ref, $content);
                Mail::html($html, function ($message) use ($landlordEmail, $subject) {
                    $message->to($landlordEmail)->subject($subject);
                });
            }

        } catch (\Throwable $e) {
            Log::error('[co-owner-notice-mail] failed', [
                'notice_id' => $notice->id,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
