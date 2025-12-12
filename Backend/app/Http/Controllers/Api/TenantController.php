<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\InviteTenantRequest;
use App\Models\TenantInvitation;
use App\Models\User;
use App\Models\Lease;
use App\Models\Tenant;
use App\Models\Property;
use App\Models\Landlord;
use App\Notifications\TenantInvitationNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\URL;

class TenantController extends Controller
{
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

        return DB::transaction(function () use ($data, $landlord) {

            // Ici on NE crée pas de User.
            $invitation = TenantInvitation::create([
                'landlord_id'    => $landlord->id,
                'tenant_user_id' => null,
                'email'          => $data['email'],
                'name'           => $data['first_name'] . ' ' . $data['last_name'],
                'token'          => TenantInvitation::makeToken(),
                'expires_at'     => now()->addDays(7),
            ]);

            // Lien signé vers l'API -> redirigé ensuite vers le front
            $signedUrl = URL::temporarySignedRoute(
                'api.auth.accept-invitation',
                now()->addDays(7),
                ['invitationId' => $invitation->id]
            );

            // Envoi de la notif email (Notification Laravel)
            \Illuminate\Support\Facades\Notification::route('mail', $data['email'])
                ->notify(new TenantInvitationNotification($invitation, $signedUrl));

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

    // Colonnes qui existent vraiment dans la table tenants
    $baseColumns = [
        'id',
        'user_id',
        'first_name',
        'last_name',
        'status',
        'solvency_score',
        'meta',
    ];

    // 1) Locataires liés via meta->landlord_id (invitation + inscription)
    $tenantsFromMeta = Tenant::where('meta->landlord_id', $landlord->id)
        ->with('user:id,email')
        ->get($baseColumns);

    // 2) Locataires qui ont un bail sur un bien de ce bailleur
    $tenantsFromLeases = Tenant::whereHas('leases.property', function ($q) use ($landlord) {
            $q->where('landlord_id', $landlord->id);
        })
        ->with('user:id,email')
        ->get($baseColumns);

    // 3) Fusion + suppression des doublons
    $allTenants = $tenantsFromMeta
        ->concat($tenantsFromLeases)
        ->unique('id')
        ->values();

    // 4) Mapping vers format propre pour le front
    $tenants = $allTenants->map(function (Tenant $tenant) {
        $user = $tenant->user;          // peut être null
        $meta = $tenant->meta ?? [];    // array grâce au cast

        return [
            'id'             => $tenant->id,
            'first_name'     => $tenant->first_name,
            'last_name'      => $tenant->last_name,
            'full_name'      => trim(($tenant->first_name ?? '') . ' ' . ($tenant->last_name ?? '')),
            'email'          => $user->email ?? ($meta['invitation_email'] ?? null),
            // phone stocké éventuellement dans meta
            'phone'          => $meta['phone'] ?? null,
            'status'         => $tenant->status ?? 'active',
            'solvency_score' => $tenant->solvency_score,
        ];
    });

    // 5) Invitations en attente pour ce bailleur
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

}
