<?php

namespace App\Http\Controllers\CoOwner;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use App\Models\User;
use App\Models\Property;
use App\Models\PropertyDelegation;
use App\Models\PropertyUser;
use App\Models\TenantInvitation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\URL;
use Illuminate\Validation\Rule;

class CoOwnerTenantController extends Controller
{
    /**
     * Afficher la liste des locataires
     */
    public function index(Request $request)
    {
        Log::info('=== ACCÈS PAGE LARAVEL ===', [
            'url' => $request->fullUrl(),
            'has_user' => $request->user() !== null,
            'timestamp' => now(),
        ]);

        return view('co-owner.tenants.index');
    }

    /**
     * Formulaire création locataire
     */
    public function create(Request $request)
    {
        Log::info('=== FORMULAIRE CRÉATION LARAVEL ===', [
            'has_user' => $request->user() !== null,
        ]);

        return view('co-owner.tenants.create');
    }

    /**
     * Enregistrement locataire
     */
    public function store(Request $request)
    {
        Log::info('=== ENREGISTREMENT LOCATAIRE LARAVEL ===', [
            'data_keys' => array_keys($request->all()),
            'has_user' => $request->user() !== null,
        ]);

        return redirect('/coproprietaire/tenants')
            ->with('success', 'Locataire créé avec succès !');
    }

    /**
     * Afficher un locataire
     */
    public function show(Request $request, Tenant $tenant)
    {
        $user = $request->user();
        $coOwner = $user?->coOwner;

        if (!$coOwner) {
            abort(403, 'Profil co-propriétaire non trouvé');
        }

        $this->checkTenantAccess($coOwner, $tenant);

        $tenant->load([
            'user',
            'leases.property',
            'leases' => function ($query) use ($coOwner) {
                $query->whereHas('property', function ($q) use ($coOwner) {
                    $q->whereIn(
                        'id',
                        PropertyDelegation::where('co_owner_id', $coOwner->id)
                            ->where('status', 'active')
                            ->pluck('property_id')
                    );
                });
            },
        ]);

        $availableProperties = $this->getAvailableProperties($coOwner);

        return view('co-owner.tenants.show', compact('tenant', 'availableProperties'));
    }

    /**
     * Formulaire assignation propriété
     */
    public function showAssignProperty(Request $request, Tenant $tenant)
    {
        $user = $request->user();
        $coOwner = $user?->coOwner;

        if (!$coOwner) {
            abort(403, 'Profil co-propriétaire non trouvé');
        }

        $this->checkTenantAccess($coOwner, $tenant);

        $availableProperties = $this->getAvailableProperties($coOwner);

        $assignedProperties = PropertyUser::where('tenant_id', $tenant->id)
            ->where('status', 'active')
            ->pluck('property_id')
            ->toArray();

        $availableProperties = $availableProperties->filter(
            fn ($property) => !in_array($property['id'], $assignedProperties)
        );

        return view('co-owner.tenants.assign-property', compact('tenant', 'availableProperties'));
    }

    /**
     * Assigner une propriété
     */
    public function assignProperty(Request $request, Tenant $tenant)
    {
        $user = $request->user();
        $coOwner = $user?->coOwner;

        if (!$coOwner) {
            return back()->with('error', 'Profil co-propriétaire non trouvé');
        }

        $this->checkTenantAccess($coOwner, $tenant);

        $delegatedPropertyIds = PropertyDelegation::where('co_owner_id', $coOwner->id)
            ->where('status', 'active')
            ->pluck('property_id')
            ->toArray();

        $validated = $request->validate([
            'property_id' => ['required', 'integer', Rule::in($delegatedPropertyIds)],
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after:start_date',
            'rent_amount' => 'required|numeric|min:0',
            'deposit_amount' => 'nullable|numeric|min:0',
        ]);

        try {
            DB::beginTransaction();

            $property = Property::findOrFail($validated['property_id']);

            PropertyUser::create([
                'property_id' => $property->id,
                'user_id' => $tenant->user_id,
                'tenant_id' => $tenant->id,
                'landlord_id' => $property->landlord_id,
                'role' => 'tenant',
                'share_percentage' => 100,
                'start_date' => $validated['start_date'],
                'end_date' => $validated['end_date'] ?? null,
                'status' => 'active',
                'meta' => [
                    'assigned_by_co_owner_id' => $coOwner->id,
                    'rent_amount' => $validated['rent_amount'],
                    'deposit_amount' => $validated['deposit_amount'] ?? null,
                ],
            ]);

            DB::commit();

            return redirect()
                ->route('co-owner.tenants.show', $tenant)
                ->with('success', 'Bien assigné avec succès.');

        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Erreur assignation propriété', [
                'error' => $e->getMessage(),
            ]);

            return back()->with('error', 'Erreur lors de l’assignation')->withInput();
        }
    }

    /**
     * Désassigner une propriété
     */
    public function unassignProperty(Request $request, Tenant $tenant, Property $property)
    {
        $coOwner = $request->user()?->coOwner;

        if (!$coOwner) {
            return back()->with('error', 'Profil co-propriétaire non trouvé');
        }

        $propertyUser = PropertyUser::where('property_id', $property->id)
            ->where('tenant_id', $tenant->id)
            ->where('status', 'active')
            ->first();

        if (!$propertyUser) {
            return back()->with('error', 'Aucune attribution active trouvée');
        }

        $propertyUser->update([
            'status' => 'terminated',
            'end_date' => now(),
        ]);

        return redirect()
            ->route('co-owner.tenants.show', $tenant)
            ->with('success', 'Bien désassigné avec succès.');
    }

    /**
     * Renvoyer invitation
     */
    public function resendInvitation(Request $request, Tenant $tenant)
    {
        $coOwner = $request->user()?->coOwner;

        if (!$coOwner) {
            return back()->with('error', 'Profil co-propriétaire non trouvé');
        }

        $this->checkTenantAccess($coOwner, $tenant);

        $invitation = TenantInvitation::updateOrCreate(
            [
                'tenant_user_id' => $tenant->user_id,
                'co_owner_id' => $coOwner->id,
            ],
            [
                'email' => $tenant->user->email,
                'name' => trim($tenant->first_name . ' ' . $tenant->last_name),
                'token' => TenantInvitation::makeToken(),
                'expires_at' => now()->addDays(7),
            ]
        );

        $this->sendInvitationEmail($invitation, $coOwner);

        return back()->with('success', 'Invitation renvoyée avec succès.');
    }

    /* ================== MÉTHODES PRIVÉES ================== */

    private function checkTenantAccess($coOwner, $tenant)
    {
        $delegatedPropertyIds = PropertyDelegation::where('co_owner_id', $coOwner->id)
            ->where('status', 'active')
            ->pluck('property_id')
            ->toArray();

        $hasAccess = $tenant->leases()
            ->whereIn('property_id', $delegatedPropertyIds)
            ->exists();

        if (!$hasAccess && ($tenant->meta['created_by_co_owner_id'] ?? null) !== $coOwner->id) {
            abort(403, 'Accès interdit');
        }
    }

    private function getAvailableProperties($coOwner)
    {
        return PropertyDelegation::where('co_owner_id', $coOwner->id)
            ->where('status', 'active')
            ->with('property')
            ->get()
            ->filter(fn ($d) => $d->property && $d->property->status === 'available')
            ->map(fn ($d) => [
                'id' => $d->property->id,
                'name' => $d->property->name,
                'address' => $d->property->address,
                'city' => $d->property->city,
                'rent_amount' => $d->property->rent_amount,
                'property_type' => $d->property->property_type,
                'surface' => $d->property->surface,
            ]);
    }

    private function sendInvitationEmail($invitation, $coOwner)
    {
        $signedUrl = URL::temporarySignedRoute(
            'api.auth.accept-invitation',
            now()->addDays(7),
            ['invitationId' => $invitation->id]
        );

        Mail::html(
            view('emails.co-owner.tenant-invitation', compact('invitation', 'coOwner', 'signedUrl'))->render(),
            fn ($m) => $m->to($invitation->email)->subject('Invitation – ' . config('app.name'))
        );
    }
}
