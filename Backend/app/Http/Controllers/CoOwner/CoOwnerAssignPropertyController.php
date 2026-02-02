<?php

namespace App\Http\Controllers\CoOwner;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use App\Models\Property;
use App\Models\PropertyDelegation;
use App\Models\PropertyUser;
use App\Models\Lease;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Laravel\Sanctum\PersonalAccessToken;

class CoOwnerAssignPropertyController extends Controller
{
    /**
     * Afficher le formulaire d'assignation de bien
     */
    public function create(Request $request)
    {
        // Récupérer l'utilisateur depuis Sanctum
        $user = $this->getAuthenticatedUser($request);

        Log::info('=== FORMULAIRE ASSIGNATION BIEN (COPRIO) ===', [
            'user_id' => $user ? $user->id : null,
            'user_email' => $user ? $user->email : null,
        ]);

        if (!$user) {
            return redirect()->route('login')->with('error', 'Veuillez vous connecter');
        }

        // Vérifier que c'est un co-propriétaire
        if (!$user->hasRole('co_owner')) {
            return redirect()->route('login')->with('error', 'Accès réservé aux co-propriétaires');
        }

        $coOwner = $user->coOwner;
        if (!$coOwner) {
            return redirect()->route('login')->with('error', 'Profil co-propriétaire non trouvé');
        }

        // Récupérer TOUS les biens délégués (pas de filtre sur les baux)
        $delegatedProperties = PropertyDelegation::where('co_owner_id', $coOwner->id)
            ->where('status', 'active')
            ->with('property') // Charge la relation property
            ->get()
            ->filter(function ($delegation) {
                return $delegation->property !== null; // Vérifie seulement que la propriété existe
            })
            ->map(function ($delegation) {
                return $delegation->property;
            });

        // Récupérer les locataires disponibles (ceux sans bail actif)
        $tenants = Tenant::where('meta->landlord_id', $coOwner->landlord_id)
            ->whereDoesntHave('leases', function($query) {
                $query->where('status', 'active');
            })
            ->with('user')
            ->get();

        Log::info('Données pour formulaire assignation', [
            'properties_count' => $delegatedProperties->count(),
            'properties' => $delegatedProperties->pluck('id')->toArray(),
            'tenants_count' => $tenants->count(),
            'co_owner_id' => $coOwner->id,
            'landlord_id' => $coOwner->landlord_id,
        ]);

        return view('co-owner.assign-property.create', compact('delegatedProperties', 'tenants', 'user'));
    }

    /**
     * Assigner un bien à un locataire
     */
    public function store(Request $request)
    {
        // Récupérer l'utilisateur depuis Sanctum
        $user = $this->getAuthenticatedUser($request);

        if (!$user || !$user->hasRole('co_owner')) {
            return back()->with('error', 'Non autorisé')->withInput();
        }

        $coOwner = $user->coOwner;
        if (!$coOwner) {
            return back()->with('error', 'Profil co-propriétaire non trouvé')->withInput();
        }

        // Validation
        $validated = $request->validate([
            'property_id' => [
                'required',
                'exists:properties,id',
                function ($attribute, $value, $fail) use ($coOwner) {
                    // Vérifier que le bien est délégué au co-propriétaire
                    $delegation = PropertyDelegation::where('property_id', $value)
                        ->where('co_owner_id', $coOwner->id)
                        ->where('status', 'active')
                        ->first();

                    if (!$delegation) {
                        $fail('Ce bien ne vous est pas délégué.');
                    }

                    // Vérifier que le bien n'est pas déjà loué
                    $isRented = Lease::where('property_id', $value)
                        ->where('status', 'active')
                        ->exists();

                    if ($isRented) {
                        $fail('Ce bien est déjà loué.');
                    }
                }
            ],
            'tenant_id' => [
                'required',
                'exists:tenants,id',
                function ($attribute, $value, $fail) use ($coOwner) {
                    // Vérifier que le locataire appartient au même landlord
                    $tenant = Tenant::find($value);
                    if (!$tenant || ($tenant->meta['landlord_id'] ?? null) != $coOwner->landlord_id) {
                        $fail('Ce locataire ne vous est pas associé.');
                    }

                    // Vérifier que le locataire n'a pas déjà un bail actif
                    $hasActiveLease = Lease::where('tenant_id', $value)
                        ->where('status', 'active')
                        ->exists();

                    if ($hasActiveLease) {
                        $fail('Ce locataire a déjà un bail actif.');
                    }
                }
            ],
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after:start_date',
            'rent_amount' => 'required|numeric|min:1',
            'deposit_amount' => 'nullable|numeric|min:0',
            'type' => 'required|in:nu,meuble',
            'charges_amount' => 'nullable|numeric|min:0',
            'payment_day' => 'required|integer|min:1|max:28',
            'notice_period' => 'nullable|integer|min:0',
            'furniture_inventory' => 'nullable|string',
            'special_conditions' => 'nullable|string',
        ]);

        try {
            DB::beginTransaction();

            // 1. Créer le bail
            $lease = Lease::create([
                'property_id' => $validated['property_id'],
                'tenant_id' => $validated['tenant_id'],
                'start_date' => $validated['start_date'],
                'end_date' => $validated['end_date'],
                'rent_amount' => $validated['rent_amount'],
                'deposit_amount' => $validated['deposit_amount'] ?? 0,
                'type' => $validated['type'],
                'charges_amount' => $validated['charges_amount'] ?? 0,
                'payment_day' => $validated['payment_day'],
                'notice_period' => $validated['notice_period'] ?? 30,
                'status' => 'active',
                'meta' => [
                    'created_by_co_owner' => $coOwner->id,
                    'furniture_inventory' => $validated['furniture_inventory'] ?? null,
                    'special_conditions' => $validated['special_conditions'] ?? null,
                ],
            ]);

            // 2. Assigner la propriété au locataire
            $tenant = Tenant::find($validated['tenant_id']);

            PropertyUser::create([
                'property_id' => $validated['property_id'],
                'user_id' => $tenant->user_id,
                'tenant_id' => $validated['tenant_id'],
                'lease_id' => $lease->id,
                'role' => 'tenant',
                'share_percentage' => 100,
                'start_date' => $validated['start_date'],
                'end_date' => $validated['end_date'],
                'status' => 'active',
            ]);

            // 3. Mettre à jour le statut du bien
            $property = Property::find($validated['property_id']);
            $property->status = 'rented';
            $property->save();

            // 4. Mettre à jour le statut du locataire
            $tenant->status = 'active';
            $tenant->save();

            DB::commit();

            Log::info('=== BAIL CRÉÉ PAR COPRIO ===', [
                'lease_id' => $lease->id,
                'property_id' => $validated['property_id'],
                'tenant_id' => $validated['tenant_id'],
                'co_owner_id' => $coOwner->id,
                'rent_amount' => $validated['rent_amount'],
            ]);

            return redirect()
                ->route('co-owner.tenants.index')
                ->with('success', 'Bien assigné au locataire avec succès ! Le bail a été créé.');

        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Erreur création bail par co-propriétaire', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'data' => $validated,
            ]);

            return back()
                ->with('error', 'Erreur lors de la création du bail: ' . $e->getMessage())
                ->withInput();
        }
    }

    /**
     * Méthode utilitaire pour récupérer l'utilisateur authentifié
     */
    private function getAuthenticatedUser(Request $request)
    {
        // Vérifier l'authentification Sanctum (API)
        if ($request->bearerToken()) {
            $token = $request->bearerToken();
            $sanctumToken = PersonalAccessToken::findToken($token);

            if ($sanctumToken) {
                $user = $sanctumToken->tokenable;
                auth('web')->login($user);
                return $user;
            }
        }

        // Vérifier le token en paramètre
        if ($request->has('api_token')) {
            $token = $request->get('api_token');
            $sanctumToken = PersonalAccessToken::findToken($token);

            if ($sanctumToken) {
                $user = $sanctumToken->tokenable;
                auth('web')->login($user);
                return $user;
            }
        }

        // Vérifier l'authentification web
        if (auth()->check()) {
            return auth()->user();
        }

        return null;
    }
}
