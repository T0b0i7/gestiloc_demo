<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\InviteTenantRequest;
use App\Http\Requests\AssignPropertyRequest;
use App\Models\TenantInvitation;
use App\Models\Tenant;
use App\Models\User;
use App\Models\Property;
use App\Models\PropertyUser;
use App\Models\Lease;
use App\Models\PropertyDelegation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

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
     * ✅ Vérifier si un bien est délégué à une AGENCE
     */
    private function isPropertyDelegatedToAgency(int $propertyId): bool
    {
        return PropertyDelegation::where('property_id', $propertyId)
            ->where('status', 'active')
            ->where('co_owner_type', 'agency')
            ->exists();
    }

    /**
     * ✅ Vérifier si un bien est délégué à un CO-PROPRIÉTAIRE SIMPLE
     */
    private function isPropertyDelegatedToCoOwner(int $propertyId): bool
    {
        return PropertyDelegation::where('property_id', $propertyId)
            ->where('status', 'active')
            ->where('co_owner_type', 'co_owner')
            ->exists();
    }

    /**
     * ✅ Obtenir les locataires actuels d'un bien
     */
    private function getCurrentTenantsForProperty(int $propertyId): array
    {
        $currentAssignments = PropertyUser::where('property_id', $propertyId)
            ->where('status', 'active')
            ->where(function($query) {
                $query->whereNull('end_date')
                    ->orWhere('end_date', '>=', now());
            })
            ->with(['tenant' => function($query) {
                $query->select('id', 'first_name', 'last_name');
            }])
            ->get();

        return $currentAssignments->map(function($assignment) {
            $tenant = $assignment->tenant;
            return [
                'id' => $tenant->id ?? null,
                'name' => $tenant ? ($tenant->first_name . ' ' . $tenant->last_name) : 'Inconnu',
                'start_date' => $assignment->start_date,
                'end_date' => $assignment->end_date,
            ];
        })->toArray();
    }

    /**
     * ✅ Nouvelle méthode : Obtenir les biens disponibles pour location
     */
    public function getAvailableProperties(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user->isLandlord()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $landlord = $user->landlord;
        if (!$landlord) {
            return response()->json(['message' => 'Landlord profile missing'], 422);
        }

        // Récupérer tous les biens du landlord
        $properties = Property::where('landlord_id', $landlord->id)
            ->with(['delegations' => function($query) {
                $query->where('status', 'active');
            }])
            ->get();

        $formattedProperties = $properties->map(function ($property) {
            // Vérifier si le bien est délégué à une agence
            $isDelegatedToAgency = $this->isPropertyDelegatedToAgency($property->id);

            // Vérifier si le bien est délégué à un co-propriétaire simple
            $isDelegatedToCoOwner = $this->isPropertyDelegatedToCoOwner($property->id);

            // Vérifier si le bien a déjà des locataires actuels
            $currentTenants = $this->getCurrentTenantsForProperty($property->id);
            $isAlreadyAssigned = !empty($currentTenants);

            // Règles de disponibilité :
            // 1. Si délégué à une agence → PAS disponible
            // 2. Si délégué à un co-propriétaire simple → DISPONIBLE (même avec des locataires existants, on peut en ajouter)
            // 3. Si déjà attribué (sans délégation) → PAS disponible
            $isAvailable = false;

            if ($isDelegatedToAgency) {
                // Cas 1 : Délégué à une agence → pas disponible
                $isAvailable = false;
            } elseif ($isDelegatedToCoOwner) {
                // Cas 2 : Délégué à un co-propriétaire simple → disponible
                // Un bien délégué à un co-propriétaire peut avoir plusieurs locataires
                $isAvailable = true;
            } elseif ($isAlreadyAssigned) {
                // Cas 3 : Déjà attribué sans délégation → pas disponible
                $isAvailable = false;
            } else {
                // Cas 4 : Pas délégué et pas attribué → disponible
                $isAvailable = true;
            }

            // Déterminer le type de délégation
            $delegationType = null;
            if ($isDelegatedToAgency) {
                $delegationType = 'agency';
            } elseif ($isDelegatedToCoOwner) {
                $delegationType = 'co_owner';
            } elseif ($property->delegations->isNotEmpty()) {
                $delegation = $property->delegations->first();
                $delegationType = $delegation->co_owner_type ?? null;
            }

            // Récupérer les infos de délégation
            $delegationInfo = null;
            $delegatedToName = null;
            if ($property->delegations->isNotEmpty()) {
                $delegation = $property->delegations->first();
                $delegationInfo = [
                    'co_owner_name' => $delegation->co_owner_name ?? null,
                    'co_owner_email' => $delegation->co_owner_email ?? null,
                ];
                $delegatedToName = $delegation->co_owner_name ?? null;
            }

            return [
                'id' => $property->id,
                'address' => $property->address,
                'city' => $property->city,
                'rent_amount' => $property->rent_amount,
                'is_available' => $isAvailable,
                'delegation_type' => $delegationType,
                'delegation_info' => $delegationInfo,
                'delegated_to_name' => $delegatedToName,
                'is_already_assigned' => $isAlreadyAssigned,
                'current_tenants' => $currentTenants,
                'current_tenant_name' => $isAlreadyAssigned && count($currentTenants) > 0 ? $currentTenants[0]['name'] : null,
                'category' => $this->determinePropertyCategory($isDelegatedToAgency, $isDelegatedToCoOwner, $isAlreadyAssigned, $isAvailable),
            ];
        });

        return response()->json([
            'available_properties' => $formattedProperties->where('is_available', true)->values(),
            'unavailable_properties' => $formattedProperties->where('is_available', false)->values(),
            'stats' => [
                'total' => $formattedProperties->count(),
                'available' => $formattedProperties->where('is_available', true)->count(),
                'delegated_to_agency' => $formattedProperties->where('delegation_type', 'agency')->count(),
                'delegated_to_coowner' => $formattedProperties->where('delegation_type', 'co_owner')->count(),
                'already_assigned' => $formattedProperties->where('is_already_assigned', true)->count(),
            ]
        ]);
    }

    /**
     * Détermine la catégorie d'un bien pour l'affichage
     */
    private function determinePropertyCategory(bool $isDelegatedToAgency, bool $isDelegatedToCoOwner, bool $isAlreadyAssigned, bool $isAvailable): string
    {
        if ($isDelegatedToAgency) {
            return 'delegated_agency';
        } elseif ($isDelegatedToCoOwner) {
            return 'delegated_coowner';
        } elseif ($isAlreadyAssigned && !$isAvailable) {
            return 'occupied';
        } elseif ($isAvailable) {
            return 'available';
        }

        return 'other';
    }

    /**
     * ✅ Nouvelle méthode : Obtenir les locataires actuels d'un bien
     */
    public function getPropertyCurrentTenants(Request $request, $propertyId): JsonResponse
    {
        $user = $request->user();

        if (!$user->isLandlord()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $property = Property::findOrFail($propertyId);
        $landlord = $user->landlord;

        // Vérifier que le bien appartient au landlord
        if ($property->landlord_id != $landlord->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $currentTenants = $this->getCurrentTenantsForProperty($propertyId);

        return response()->json([
            'property' => [
                'id' => $property->id,
                'address' => $property->address,
                'city' => $property->city,
            ],
            'tenants' => $currentTenants,
            'is_delegated_to_agency' => $this->isPropertyDelegatedToAgency($propertyId),
            'is_delegated_to_coowner' => $this->isPropertyDelegatedToCoOwner($propertyId),
            'is_available_for_rent' => empty($currentTenants) && !$this->isPropertyDelegatedToAgency($propertyId),
        ]);
    }

    /**
     * Invite un locataire (bailleur connecté).
     * - Crée une invitation ET un locataire avec un user temporaire
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
            Log::info('Tenant invitation data received:', $data);

            // Vérifier si l'email existe déjà
            $existingUser = User::where('email', $data['email'])->first();

            if ($existingUser) {
                // Si un utilisateur existe déjà avec cet email
                $tenantUser = $existingUser;
            } else {
                // Créer un user temporaire avec un mot de passe aléatoire
                $tempPassword = Hash::make(bin2hex(random_bytes(16)));

                $tenantUser = User::create([
                    'email' => $data['email'],
                    'phone' => $data['phone'] ?? null,
                    'password' => $tempPassword, // Mot de passe temporaire
                    'status' => 'pending', // Statut en attente de validation
                    'email_verified_at' => null, // Non vérifié
                ]);

                // Assigner le rôle de locataire
                $tenantUser->assignRole('tenant');
            }

            // Créer l'invitation
            $invitation = TenantInvitation::create([
                'landlord_id'    => $landlord->id,
                'tenant_user_id' => $tenantUser->id,
                'email'          => $data['email'],
                'name'           => trim(($data['first_name'] ?? '') . ' ' . ($data['last_name'] ?? '')),
                'token'          => TenantInvitation::makeToken(),
                'expires_at'     => now()->addDays(7),
                'meta'           => [
                    'first_name' => $data['first_name'] ?? null,
                    'last_name'  => $data['last_name'] ?? null,
                    'phone'      => $data['phone'] ?? null,
                ],
            ]);

            // Créer le locataire avec le user_id
            // Gérer le nom du garant (peut être un nom complet ou prénom + nom)
            $guarantorFirstName = $data['guarantor_first_name'] ?? null;
            $guarantorLastName = $data['guarantor_last_name'] ?? null;

            // Si only guarantor_name is provided, split it
            if (empty($guarantorFirstName) && !empty($data['guarantor_name'])) {
                $nameParts = explode(' ', trim($data['guarantor_name']), 2);
                $guarantorFirstName = $nameParts[0] ?? null;
                $guarantorLastName = $nameParts[1] ?? null;
            }

            $tenant = Tenant::create([
                'user_id' => $tenantUser->id,
                'first_name' => $data['first_name'] ?? '',
                'last_name' => $data['last_name'] ?? '',
                'status' => 'candidate', // Statut ENUM valide: 'candidate', 'active', 'inactive'
                'meta' => [
                    'landlord_id' => $landlord->id,
                    'invitation_email' => $data['email'],
                    'phone' => $data['phone'] ?? null,
                    'invitation_id' => $invitation->id,
                    'invitation_status' => 'invited',
                    // Informations personnelles
                    'birth_date' => $data['birth_date'] ?? null,
                    'birth_place' => $data['birth_place'] ?? null,
                    'address' => $data['address'] ?? null,
                    'city' => $data['city'] ?? null,
                    'country' => $data['country'] ?? null,
                    'marital_status' => $data['marital_status'] ?? null,
                    // Contact d'urgence
                    'emergency_contact_name' => $data['emergency_contact_name'] ?? null,
                    'emergency_contact_phone' => $data['emergency_contact_phone'] ?? null,
                    'emergency_contact_email' => $data['emergency_contact_email'] ?? null,
                    // Situation professionnelle
                    'profession' => $data['profession'] ?? null,
                    'employer' => $data['employer'] ?? null,
                    'contract_type' => $data['contract_type'] ?? null,
                    'monthly_income' => $data['monthly_income'] ?? null,
                    'annual_income' => $data['annual_income'] ?? null,
                    // Informations garant
                    'has_guarantor' => $data['has_guarantor'] ?? false,
                    'guarantor_first_name' => $guarantorFirstName,
                    'guarantor_last_name' => $guarantorLastName,
                    'guarantor_name' => $data['guarantor_name'] ?? null,
                    'guarantor_relationship' => $data['guarantor_relationship'] ?? null,
                    'guarantor_phone' => $data['guarantor_phone'] ?? null,
                    'guarantor_email' => $data['guarantor_email'] ?? null,
                    'guarantor_address' => $data['guarantor_address'] ?? null,
                    'guarantor_profession' => $data['guarantor_profession'] ?? null,
                    'guarantor_monthly_income' => $data['guarantor_monthly_income'] ?? null,
                    'guarantor_annual_income' => $data['guarantor_annual_income'] ?? null,
                    'guarantor_birth_date' => $data['guarantor_birth_date'] ?? null,
                    'guarantor_birth_place' => $data['guarantor_birth_place'] ?? null,
                    'guarantor_nationality' => $data['guarantor_nationality'] ?? null,
                ],
            ]);

            // Si un property_id est fourni, vérifier qu'il est disponible
            if (!empty($data['property_id'])) {
                $property = Property::find($data['property_id']);

                // Vérifier que le bien appartient au landlord
                if ($property && $property->landlord_id === $landlord->id) {
                    // Vérifier si le bien est délégué à une agence
                    if ($this->isPropertyDelegatedToAgency($property->id)) {
                        return response()->json([
                            'message' => 'Ce bien est délégué à une agence et ne peut pas être attribué.',
                            'property_id' => $property->id
                        ], 422);
                    }

                    // Vérifier si le bien a déjà des locataires (sauf si c'est un co-propriétaire simple)
                    $currentTenants = $this->getCurrentTenantsForProperty($property->id);
                    if (!empty($currentTenants) && !$this->isPropertyDelegatedToCoOwner($property->id)) {
                        return response()->json([
                            'message' => 'Ce bien est déjà attribué à un locataire.',
                            'property_id' => $property->id,
                            'current_tenant' => $currentTenants[0]['name']
                        ], 422);
                    }

                    // Assigner le bien
                    try {
                        $this->assignPropertyToTenantInternal(
                            $tenant->id,
                            $data['property_id'],
                            $landlord->id,
                            $data['lease_id'] ?? null,
                            $data['start_date'] ?? now(),
                            $data['end_date'] ?? null
                        );
                    } catch (\Exception $e) {
                        Log::warning('Failed to assign property during tenant invitation', [
                            'tenant_id' => $tenant->id,
                            'property_id' => $data['property_id'],
                            'error' => $e->getMessage()
                        ]);
                    }
                }
            }

            Log::info('Tenant invitation created:', [
                'invitation_id' => $invitation->id,
                'tenant_id' => $tenant->id,
                'user_id' => $tenantUser->id,
                'email' => $data['email'],
                'tenant_status' => $tenant->status
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
  Pour accéder à votre espace locataire et définir votre mot de passe, utilisez l'invitation ci-dessous.
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
                'tenant' => [
                    'id' => $tenant->id,
                    'first_name' => $tenant->first_name,
                    'last_name' => $tenant->last_name,
                    'status' => $tenant->status,
                    'user_id' => $tenant->user_id,
                ],
            ], 201);
        });
    }

    /**
     * Liste des locataires avec leurs biens
     */
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

        // Récupérer tous les locataires liés à ce landlord
        $tenants = Tenant::where(function($query) use ($landlord) {
                // Locataires avec landlord_id dans meta
                $query->where('meta->landlord_id', $landlord->id)
                      // OU locataires liés via des baux
                      ->orWhereHas('leases.property', function($q) use ($landlord) {
                          $q->where('landlord_id', $landlord->id);
                      });
            })
            ->with([
                'user:id,email,phone',
                'properties' => function($query) {
                    $query->select('properties.id', 'properties.name', 'properties.address', 'properties.city')
                          ->withPivot('role', 'start_date', 'end_date', 'status');
                }
            ])
            ->get([
                'id',
                'user_id',
                'first_name',
                'last_name',
                'status',
                'solvency_score',
                'meta',
            ]);

        $formattedTenants = $tenants->map(function (Tenant $tenant) {
            $user = $tenant->user;
            $meta = $tenant->meta ?? [];
            $properties = $tenant->properties ?? collect();

            // Les noms viennent TOUJOURS de la table tenants
            $firstName = $tenant->first_name;
            $lastName = $tenant->last_name;

            // Email et téléphone viennent du user OU du meta
            $email = $user->email ?? ($meta['invitation_email'] ?? null);
            $phone = $user->phone ?? ($meta['phone'] ?? null);

            // Déterminer le statut complet
            $status = $tenant->status ?? 'active';
            $invitationStatus = $meta['invitation_status'] ?? null;
            $fullStatus = ($status === 'candidate' && $invitationStatus) ? $invitationStatus : $status;

            // Formater les biens
            $formattedProperties = $properties->map(function ($property) {
                $pivot = $property->pivot;
                return [
                    'id' => $property->id,
                    'name' => $property->name,
                    'address' => $property->address,
                    'city' => $property->city,
                    'role' => $pivot->role ?? 'tenant',
                    'start_date' => $pivot->start_date ?? null,
                    'end_date' => $pivot->end_date ?? null,
                    'status' => $pivot->status ?? 'active',
                    'is_active' => ($pivot->status === 'active' &&
                                   (!$pivot->end_date || $pivot->end_date >= now())),
                ];
            });

            return [
                'id'             => $tenant->id,
                'user_id'        => $tenant->user_id,
                'first_name'     => $firstName,
                'last_name'      => $lastName,
                'full_name'      => trim(($firstName ?? '') . ' ' . ($lastName ?? '')),
                'email'          => $email,
                'phone'          => $phone,
                'status'         => $fullStatus,
                'solvency_score' => $tenant->solvency_score,
                'is_invited'     => $status === 'candidate' || $fullStatus === 'invited' ||
                                   (!empty($meta['invitation_id']) && empty($meta['accepted_at'])),
                'invitation_id'  => $meta['invitation_id'] ?? null,
                'properties'     => $formattedProperties,
                'active_property' => $formattedProperties->firstWhere('is_active', true),
                'properties_count' => $properties->count(),
            ];
        });

        // Récupérer les invitations en attente avec les informations du meta et du tenant associé
        $invitationsQuery = $landlord->invitations()
            ->whereNull('accepted_at')
            ->get();
        
        // Formater les invitations pour inclure first_name et last_name du meta, et le tenant_id associé
        $invitations = $invitationsQuery->map(function ($inv) {
            $meta = $inv->meta ?? [];
            
            // Chercher le tenant associé via tenant_user_id
            $tenantId = null;
            if ($inv->tenant_user_id) {
                $tenant = \App\Models\Tenant::where('user_id', $inv->tenant_user_id)->first();
                $tenantId = $tenant?->id;
            }
            
            return [
                'id' => $inv->id,
                'email' => $inv->email,
                'name' => $inv->name,
                'first_name' => $meta['first_name'] ?? null,
                'last_name' => $meta['last_name'] ?? null,
                'tenant_id' => $tenantId, // ID du locataire associé
                'expires_at' => $inv->expires_at,
                'created_at' => $inv->created_at,
            ];
        });

        return response()->json([
            'tenants'     => $formattedTenants,
            'invitations' => $invitations,
        ]);
    }

    /**
     * Attribuer un bien à un locataire
     */
    public function assignProperty(AssignPropertyRequest $request, $tenantId): JsonResponse
    {
        $user = $request->user();

        if (! $user->isLandlord()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $landlord = $user->landlord;
        if (! $landlord) {
            return response()->json(['message' => 'Landlord profile missing'], 422);
        }

        $tenant = Tenant::findOrFail($tenantId);

        // Vérifier que le locataire appartient au landlord
        if (($tenant->meta['landlord_id'] ?? null) != $landlord->id) {
            return response()->json(['message' => 'Tenant does not belong to this landlord'], 403);
        }

        $data = $request->validated();

        try {
            $assignment = $this->assignPropertyToTenantInternal(
                $tenant->id,
                $data['property_id'],
                $landlord->id,
                $data['lease_id'] ?? null,
                $data['start_date'] ?? now(),
                $data['end_date'] ?? null,
                $data['role'] ?? 'tenant',
                $data['share_percentage'] ?? null
            );

            return response()->json([
                'message' => 'Bien attribué avec succès',
                'assignment' => [
                    'id' => $assignment->id,
                    'property' => [
                        'id' => $assignment->property->id,
                        'name' => $assignment->property->name,
                        'address' => $assignment->property->address,
                    ],
                    'tenant' => [
                        'id' => $tenant->id,
                        'name' => $tenant->first_name . ' ' . $tenant->last_name,
                    ],
                    'start_date' => $assignment->start_date,
                    'end_date' => $assignment->end_date,
                    'status' => $assignment->status,
                ],
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage()
            ], 422);
        }
    }

    /**
     * Méthode interne pour attribuer un bien à un locataire
     */
    private function assignPropertyToTenantInternal(
        $tenantId,
        $propertyId,
        $landlordId,
        $leaseId = null,
        $startDate = null,
        $endDate = null,
        $role = 'tenant',
        $sharePercentage = null
    ) {
        $tenant = Tenant::findOrFail($tenantId);
        $property = Property::findOrFail($propertyId);

        // Vérifier que le bien appartient au landlord
        if ($property->landlord_id != $landlordId) {
            throw new \Exception('Le bien n\'appartient pas à ce propriétaire');
        }

        // Vérifier si le bien est délégué à une agence
        if ($this->isPropertyDelegatedToAgency($property->id)) {
            throw new \Exception('Ce bien est délégué à une agence et ne peut pas être attribué.');
        }

        // Vérifier si le bien a déjà des locataires actuels (sauf si c'est un co-propriétaire simple)
        $currentTenants = $this->getCurrentTenantsForProperty($property->id);
        if (!empty($currentTenants) && !$this->isPropertyDelegatedToCoOwner($property->id)) {
            throw new \Exception('Ce bien est déjà attribué à un locataire.');
        }

        // Vérifier si un bail est fourni
        if ($leaseId) {
            $lease = Lease::findOrFail($leaseId);
            if ($lease->property_id != $propertyId || $lease->tenant_id != $tenantId) {
                throw new \Exception('Le bail ne correspond pas au bien ou au locataire');
            }
        }

        // Créer l'attribution dans property_user
        return PropertyUser::assignPropertyToTenant(
            $propertyId,
            $tenant->user_id,
            $tenantId,
            $leaseId,
            $role,
            $sharePercentage,
            $startDate,
            $endDate
        );
    }

    /**
     * Retirer un bien d'un locataire
     */
    public function unassignProperty(Request $request, $tenantId, $propertyId): JsonResponse
    {
        $user = $request->user();

        if (! $user->isLandlord()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $landlord = $user->landlord;
        if (! $landlord) {
            return response()->json(['message' => 'Landlord profile missing'], 422);
        }

        $tenant = Tenant::findOrFail($tenantId);
        $property = Property::findOrFail($propertyId);

        // Vérifier que le bien appartient au landlord
        if ($property->landlord_id != $landlord->id) {
            return response()->json(['message' => 'Le bien n\'appartient pas à ce propriétaire'], 403);
        }

        // Terminer l'attribution
        $terminated = PropertyUser::terminateAssignment($propertyId, $tenant->user_id);

        if ($terminated) {
            return response()->json([
                'message' => 'Bien retiré du locataire avec succès'
            ]);
        }

        return response()->json([
            'message' => 'Aucune attribution active trouvée'
        ], 404);
    }

    /**
     * Obtenir les biens d'un locataire
     */
    public function getTenantProperties($tenantId): JsonResponse
    {
        $tenant = Tenant::findOrFail($tenantId);
        $properties = PropertyUser::getPropertiesForTenant($tenant->user_id, false);

        return response()->json([
            'tenant' => [
                'id' => $tenant->id,
                'name' => $tenant->first_name . ' ' . $tenant->last_name,
                'email' => $tenant->user->email ?? null,
            ],
            'properties' => $properties->map(function ($assignment) {
                return [
                    'assignment_id' => $assignment->id,
                    'property' => [
                        'id' => $assignment->property->id,
                        'name' => $assignment->property->name,
                        'address' => $assignment->property->address,
                        'city' => $assignment->property->city,
                    ],
                    'role' => $assignment->role,
                    'share_percentage' => $assignment->share_percentage,
                    'start_date' => $assignment->start_date,
                    'end_date' => $assignment->end_date,
                    'status' => $assignment->status,
                    'is_active' => $assignment->isActive(),
                    'lease' => $assignment->lease ? [
                        'id' => $assignment->lease->id,
                        'uuid' => $assignment->lease->uuid,
                        'start_date' => $assignment->lease->start_date,
                        'end_date' => $assignment->lease->end_date,
                    ] : null,
                ];
            }),
            'stats' => [
                'total_properties' => $properties->count(),
                'active_properties' => $properties->where('status', 'active')
                    ->where(function($item) {
                        return !$item->end_date || $item->end_date >= now();
                    })->count(),
                'past_properties' => $properties->where('status', 'terminated')
                    ->orWhere(function($item) {
                        return $item->status === 'active' && $item->end_date && $item->end_date < now();
                    })->count(),
            ]
        ]);
    }

    /**
     * Obtenir l'historique d'un bien
     */
    public function getPropertyHistory($propertyId): JsonResponse
    {
        $property = Property::findOrFail($propertyId);
        $history = PropertyUser::getPropertyHistory($propertyId);

        $formattedHistory = $history->map(function ($assignment) {
            return [
                'assignment_id' => $assignment->id,
                'tenant' => $assignment->user ? [
                    'id' => $assignment->user->id,
                    'name' => $assignment->user->first_name . ' ' . $assignment->user->last_name,
                    'email' => $assignment->user->email,
                ] : null,
                'tenant_details' => $assignment->tenant ? [
                    'id' => $assignment->tenant->id,
                    'first_name' => $assignment->tenant->first_name,
                    'last_name' => $assignment->tenant->last_name,
                ] : null,
                'role' => $assignment->role,
                'start_date' => $assignment->start_date,
                'end_date' => $assignment->end_date,
                'status' => $assignment->status,
                'duration_days' => $assignment->end_date ?
                    $assignment->start_date->diffInDays($assignment->end_date) : null,
                'lease' => $assignment->lease ? [
                    'id' => $assignment->lease->id,
                    'uuid' => $assignment->lease->uuid,
                ] : null,
            ];
        });

        return response()->json([
            'property' => [
                'id' => $property->id,
                'name' => $property->name,
                'address' => $property->address,
                'city' => $property->city,
            ],
            'history' => $formattedHistory,
            'stats' => PropertyUser::getOccupationStats($propertyId),
            'current_tenants' => $formattedHistory->where('status', 'active')
                ->where(function($item) {
                    return !$item['end_date'] || $item['end_date'] >= now();
                })->values(),
            'past_tenants' => $formattedHistory->where('status', 'terminated')
                ->orWhere(function($item) {
                    return $item['status'] === 'active' && $item['end_date'] && $item['end_date'] < now();
                })->values(),
        ]);
    }

    /**
     * Obtenir les statistiques d'occupation
     */
    public function getOccupationStats(Request $request): JsonResponse
    {
        $user = $request->user();

        if (! $user->isLandlord()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $landlord = $user->landlord;
        if (! $landlord) {
            return response()->json(['message' => 'Landlord profile missing'], 422);
        }

        // Récupérer tous les biens du landlord
        $properties = Property::where('landlord_id', $landlord->id)->get();

        $stats = [
            'total_properties' => $properties->count(),
            'occupied_properties' => 0,
            'vacant_properties' => 0,
            'total_tenants' => 0,
            'active_tenants' => 0,
            'average_occupancy_rate' => 0,
            'properties' => [],
        ];

        foreach ($properties as $property) {
            $propertyStats = PropertyUser::getOccupationStats($property->id);

            $stats['occupied_properties'] += $propertyStats['active_tenants'] > 0 ? 1 : 0;
            $stats['vacant_properties'] += $propertyStats['active_tenants'] == 0 ? 1 : 0;
            $stats['total_tenants'] += $propertyStats['total_assignments'];
            $stats['active_tenants'] += $propertyStats['active_tenants'];

            $stats['properties'][] = [
                'id' => $property->id,
                'name' => $property->name,
                'address' => $property->address,
                'stats' => $propertyStats,
            ];
        }

        if ($stats['total_properties'] > 0) {
            $stats['average_occupancy_rate'] = round(
                ($stats['occupied_properties'] / $stats['total_properties']) * 100, 2
            );
        }

        return response()->json($stats);
    }

    /**
     * ✅ Upload documents for a tenant
     */
    public function uploadDocuments(Request $request, $tenantId): JsonResponse
    {
        $user = $request->user();

        if (!$user->isLandlord()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $landlord = $user->landlord;
        if (!$landlord) {
            return response()->json(['message' => 'Landlord profile missing'], 422);
        }

        $tenant = Tenant::findOrFail($tenantId);

        // Vérifier que le locataire appartient au landlord
        if (($tenant->meta['landlord_id'] ?? null) != $landlord->id) {
            return response()->json(['message' => 'Tenant does not belong to this landlord'], 403);
        }

        $request->validate([
            'documents' => 'required|array',
            'documents.*' => 'file|max:15360', // 15MB max per file
            'document_types' => 'nullable|array',
        ]);

        $uploadedDocuments = [];
        $documentTypes = $request->input('document_types', []);

        if ($request->hasFile('documents')) {
            foreach ($request->file('documents') as $index => $file) {
                // Determine document type
                $docType = isset($documentTypes[$index]) ? $documentTypes[$index] : 'other';

                // Store file
                $path = $file->store('tenant-documents/' . $tenant->id, 'public');

                $uploadedDocuments[] = [
                    'original_name' => $file->getClientOriginalName(),
                    'stored_path' => $path,
                    'mime_type' => $file->getMimeType(),
                    'size' => $file->getSize(),
                    'type' => $docType,
                    'uploaded_at' => now()->toISOString(),
                ];
            }
        }

        // Get existing documents from tenant meta
        $existingDocs = $tenant->meta['documents'] ?? [];

        // Merge with new documents
        $allDocuments = array_merge($existingDocs, $uploadedDocuments);

        // Update tenant meta with documents
        $tenant->meta = array_merge($tenant->meta ?? [], [
            'documents' => $allDocuments,
        ]);
        $tenant->save();

        Log::info('Tenant documents uploaded', [
            'tenant_id' => $tenant->id,
            'document_count' => count($uploadedDocuments),
            'total_documents' => count($allDocuments),
        ]);

        return response()->json([
            'message' => 'Documents uploaded successfully',
            'documents' => $uploadedDocuments,
            'total_documents' => count($allDocuments),
        ], 201);
    }

    /**
     * ✅ List documents for a tenant
     */
    public function listDocuments(Request $request, $tenantId): JsonResponse
    {
        $user = $request->user();

        if (!$user->isLandlord()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $landlord = $user->landlord;
        if (!$landlord) {
            return response()->json(['message' => 'Landlord profile missing'], 422);
        }

        $tenant = Tenant::findOrFail($tenantId);

        // Vérifier que le locataire appartient au landlord
        if (($tenant->meta['landlord_id'] ?? null) != $landlord->id) {
            return response()->json(['message' => 'Tenant does not belong to this landlord'], 403);
        }

        $documents = $tenant->meta['documents'] ?? [];

        return response()->json([
            'documents' => $documents,
            'total_documents' => count($documents),
        ]);
    }
}
