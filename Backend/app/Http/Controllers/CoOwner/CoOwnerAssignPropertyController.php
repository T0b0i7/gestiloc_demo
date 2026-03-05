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
use Illuminate\Support\Str;

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

        // Récupérer TOUS les biens délégués disponibles (pas déjà loués)
        $delegatedProperties = PropertyDelegation::where('co_owner_id', $coOwner->id)
            ->where('status', 'active')
            ->with('property')
            ->get()
            ->filter(function ($delegation) {
                // Vérifier que la propriété existe et n'est pas déjà louée
                if (!$delegation->property) {
                    return false;
                }

                $isRented = Lease::where('property_id', $delegation->property->id)
                    ->where('status', 'active')
                    ->exists();

                return !$isRented;
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

        // Validation - MODIFIÉ : 'nu' et 'meuble' au lieu de 'residential' et 'seasonal'
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
            // MODIFICATION ICI : 'nu' et 'meuble' au lieu de 'residential' et 'seasonal'
            'lease_type' => 'required|in:nu,meuble',
            'lease_status' => 'required|in:draft,active,pending_signature',
            'start_date' => 'required|date',
            'duration' => 'nullable|string|max:100',
            'rent_amount' => 'required|numeric|min:1',
            'guarantee_amount' => 'nullable|numeric|min:0',
            'billing_day' => 'required|integer|min:1|max:28',
            'payment_frequency' => 'required|in:monthly,quarterly,annually',
            'payment_mode' => 'nullable|string|max:100',
            'special_conditions' => 'nullable|string|max:5000',
        ]);

        try {
            DB::beginTransaction();

            // Générer un numéro de bail unique
            $leaseNumber = 'BAIL-' . date('Y') . '-' . str_pad(Lease::count() + 1, 4, '0', STR_PAD_LEFT);

            // Calculer la date de fin si une durée est spécifiée
            $endDate = null;
            if (!empty($validated['duration'])) {
                // Extraire le nombre d'années de la durée (ex: "2 ans" -> 2)
                preg_match('/(\d+)/', $validated['duration'], $matches);
                if (!empty($matches[1])) {
                    $years = (int) $matches[1];
                    $endDate = date('Y-m-d', strtotime($validated['start_date'] . ' + ' . $years . ' years'));
                }
            }

            // 1. Créer le bail
            $lease = Lease::create([
                'uuid' => Str::uuid(),
                'property_id' => $validated['property_id'],
                'tenant_id' => $validated['tenant_id'],
                'lease_number' => $leaseNumber,
                'type' => $validated['lease_type'], // Ici aussi : 'nu' ou 'meuble'
                'start_date' => $validated['start_date'],
                'end_date' => $endDate,
                'tacit_renewal' => true,
                'rent_amount' => $validated['rent_amount'],
                'charges_amount' => 0,
                'guarantee_amount' => $validated['guarantee_amount'] ?? 0,
                'prepaid_rent_months' => 0,
                'billing_day' => $validated['billing_day'],
                'payment_frequency' => $validated['payment_frequency'],
                'penalty_rate' => 0,
                'status' => $validated['lease_status'],
                'terms' => [
                    'payment_mode' => $validated['payment_mode'] ?? 'Espèce',
                    'special_conditions' => $validated['special_conditions'] ?? null,
                    'created_by_co_owner' => $coOwner->id,
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
                'end_date' => $endDate,
                'status' => $validated['lease_status'] === 'active' ? 'active' : 'pending',
            ]);

            // 3. Mettre à jour le statut du bien si le bail est actif
            if ($validated['lease_status'] === 'active') {
                $property = Property::find($validated['property_id']);
                $property->status = 'rented';
                $property->save();

                // 4. Mettre à jour le statut du locataire
                $tenant->status = 'active';
                $tenant->save();
            }

            DB::commit();

            Log::info('=== BAIL CRÉÉ PAR COPRIO ===', [
                'lease_id' => $lease->id,
                'lease_number' => $leaseNumber,
                'property_id' => $validated['property_id'],
                'tenant_id' => $validated['tenant_id'],
                'co_owner_id' => $coOwner->id,
                'rent_amount' => $validated['rent_amount'],
                'status' => $validated['lease_status'],
            ]);

            // REDIRECTION VERS LA MÊME PAGE avec message de succès
            return redirect()
                ->route('co-owner.assign-property.create')
                ->with('success', 'Contrat de location créé avec succès ! Numéro de bail: ' . $leaseNumber);

        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Erreur création bail par co-propriétaire', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'data' => $validated,
            ]);

            return back()
                ->with('error', 'Erreur lors de la création du contrat: ' . $e->getMessage())
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
