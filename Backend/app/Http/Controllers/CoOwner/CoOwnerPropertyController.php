<?php

namespace App\Http\Controllers\CoOwner;

use App\Http\Controllers\Controller;
use App\Models\Property;
use App\Models\CoOwner;
use App\Models\PropertyDelegation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Laravel\Sanctum\PersonalAccessToken;
use Illuminate\Http\JsonResponse;
use App\Models\User;
use Illuminate\Support\Facades\Mail;
use App\Mail\PropertyModifiedNotification;

class CoOwnerPropertyController extends Controller
{
    /**
     * Méthode utilitaire pour récupérer l'utilisateur authentifié
     */
    private function getAuthenticatedUser(Request $request)
    {
        // Vérifier l'authentification Sanctum (API) - PRIORITAIRE
        if ($request->bearerToken()) {
            $token = $request->bearerToken();
            $sanctumToken = PersonalAccessToken::findToken($token);
            if ($sanctumToken) {
                $user = $sanctumToken->tokenable;
                auth('web')->login($user);
                return $user;
            }
        }

        // Vérifier le token en paramètre (API dans l'URL)
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

    /**
     * Afficher le formulaire de création de bien
     */
    public function create(Request $request)
    {
        $user = $this->getAuthenticatedUser($request);

        if (!$user) {
            // Rediriger vers la page de login React avec le token
            $apiToken = $request->get('api_token');
            if ($apiToken) {
                return redirect('http://localhost:8080/login?api_token=' . $apiToken);
            }
            return redirect('http://localhost:8080/login');
        }

        if (!$user->hasRole('co_owner')) {
            return redirect('http://localhost:8080/dashboard')->with('error', 'Accès réservé aux copropriétaires');
        }

        $coOwner = $user->coOwner;
        if (!$coOwner) {
            return redirect('http://localhost:8080/dashboard')->with('error', 'Profil copropriétaire non trouvé');
        }

        Log::info('=== FORMULAIRE CRÉATION BIEN (COPRIO) ===', [
            'co_owner_id' => $coOwner->id,
            'landlord_id' => $coOwner->landlord_id,
            'user_email' => $user->email,
        ]);

        return view('co-owner.properties.create', compact('coOwner', 'user'));
    }

    /**
     * Enregistrer un nouveau bien
     */
    public function store(Request $request)
    {
        $user = $this->getAuthenticatedUser($request);

        if (!$user) {
            return back()->with('error', 'Veuillez vous connecter')->withInput();
        }

        if (!$user->hasRole('co_owner')) {
            return back()->with('error', 'Non autorisé')->withInput();
        }

        $coOwner = $user->coOwner;
        if (!$coOwner) {
            return back()->with('error', 'Profil copropriétaire non trouvé')->withInput();
        }

        // Validation avec les mêmes champs que React
        $validated = $request->validate([
            'property_type' => 'required|string|in:apartment,house,office,commercial,warehouse,parking,land,other',
            'status' => 'required|string|in:available,rented,maintenance,off_market',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:2000',
            'reference_code' => 'nullable|string|max:100',
            'address' => 'required|string|max:255',
            'district' => 'nullable|string|max:255',
            'city' => 'required|string|max:255',
            'state' => 'nullable|string|max:255',
            'zip_code' => 'required|string|max:20',
            'country' => 'nullable|string|max:255',
            'latitude' => 'nullable|string|max:50',
            'longitude' => 'nullable|string|max:50',
            'surface' => 'required|numeric|min:0',
            'floor' => 'nullable|integer|min:0',
            'total_floors' => 'nullable|integer|min:0',
            'room_count' => 'nullable|integer|min:0',
            'bedroom_count' => 'nullable|integer|min:0',
            'bathroom_count' => 'nullable|integer|min:0',
            'wc_count' => 'nullable|integer|min:0',
            'construction_year' => 'nullable|integer|min:1800|max:' . date('Y'),
            'rent_amount' => 'nullable|numeric|min:0',
            'charges_amount' => 'nullable|numeric|min:0',
            'caution' => 'nullable|numeric|min:0', // AJOUTÉ - Dépôt de garantie
            'has_garage' => 'nullable|boolean',
            'has_parking' => 'nullable|boolean',
            'is_furnished' => 'nullable|boolean',
            'has_elevator' => 'nullable|boolean',
            'has_balcony' => 'nullable|boolean',
            'has_terrace' => 'nullable|boolean',
            'has_cellar' => 'nullable|boolean',
            'amenities' => 'nullable|array',
            'amenities.*' => 'string',
            'photos' => 'nullable|array',
            'photos.*' => 'image|mimes:jpeg,png,jpg,gif|max:5120',
        ]);

        try {
            DB::beginTransaction();

            // Générer un code de référence unique si non fourni
            if (empty($validated['reference_code'])) {
                $validated['reference_code'] = 'PR-' . strtoupper(Str::random(6));
            }

            // Traiter les champs booléens
            $booleanFields = [
                'has_garage', 'has_parking', 'is_furnished',
                'has_elevator', 'has_balcony', 'has_terrace', 'has_cellar'
            ];

            foreach ($booleanFields as $field) {
                $validated[$field] = $request->has($field) ? true : false;
            }

            // Traiter les photos
            $photos = [];
            if ($request->hasFile('photos')) {
                foreach ($request->file('photos') as $photo) {
                    $path = $photo->store('properties', 'public');
                    $photos[] = $path;
                }
            }

            // Créer la propriété
            $property = Property::create([
                'uuid' => Str::uuid(),
                'landlord_id' => $coOwner->landlord_id,
                'user_id' => $user->id,
                'type' => $validated['property_type'],
                'name' => $validated['name'],
                'description' => $validated['description'] ?? null,
                'reference_code' => $validated['reference_code'],
                'address' => $validated['address'],
                'district' => $validated['district'] ?? null,
                'city' => $validated['city'],
                'state' => $validated['state'] ?? null,
                'zip_code' => $validated['zip_code'],
                'country' => $validated['country'] ?? null,
                'latitude' => $validated['latitude'] ?? null,
                'longitude' => $validated['longitude'] ?? null,
                'surface' => $validated['surface'],
                'floor' => $validated['floor'] ?? null,
                'total_floors' => $validated['total_floors'] ?? null,
                'room_count' => $validated['room_count'] ?? null,
                'bedroom_count' => $validated['bedroom_count'] ?? null,
                'bathroom_count' => $validated['bathroom_count'] ?? null,
                'wc_count' => $validated['wc_count'] ?? null,
                'construction_year' => $validated['construction_year'] ?? null,
                'rent_amount' => $validated['rent_amount'] ?? null,
                'charges_amount' => $validated['charges_amount'] ?? null,
                'caution' => $validated['caution'] ?? null, // AJOUTÉ
                'has_garage' => $validated['has_garage'],
                'has_parking' => $validated['has_parking'],
                'is_furnished' => $validated['is_furnished'],
                'has_elevator' => $validated['has_elevator'],
                'has_balcony' => $validated['has_balcony'],
                'has_terrace' => $validated['has_terrace'],
                'has_cellar' => $validated['has_cellar'],
                'amenities' => $validated['amenities'] ?? [],
                'photos' => $photos,
                'status' => $validated['status'],
                'meta' => [
                    'created_by_co_owner' => $coOwner->id,
                    'created_by_co_owner_name' => $coOwner->getDisplayNameAttribute(),
                    'landlord_id' => $coOwner->landlord_id,
                    'created_at' => now()->toDateTimeString(),
                ],
            ]);

            // Créer automatiquement une délégation pour ce bien
            $delegation = PropertyDelegation::create([
                'property_id' => $property->id,
                'landlord_id' => $coOwner->landlord_id,
                'co_owner_id' => $coOwner->id,
                'co_owner_type' => 'co_owner',
                'status' => 'active',
                'delegated_at' => now(),
                'permissions' => ['view', 'edit', 'manage_lease', 'collect_rent', 'manage_maintenance'],
                'delegation_type' => 'full',
                'notes' => 'Délégation automatique créée lors de l\'ajout du bien par le copropriétaire.',
            ]);

            DB::commit();

            Log::info('=== BIEN CRÉÉ PAR COPRIO ===', [
                'property_id' => $property->id,
                'property_name' => $property->name,
                'reference_code' => $property->reference_code,
                'co_owner_id' => $coOwner->id,
                'landlord_id' => $coOwner->landlord_id,
                'delegation_id' => $delegation->id,
                'caution' => $property->caution,
            ]);

            // ✅ REDIRECTION VERS LE FORMULAIRE DE CRÉATION AVEC MESSAGE DE SUCCÈS
            return redirect()
                ->route('co-owner.properties.create', ['api_token' => $request->get('api_token')])
                ->with('success', 'Bien créé avec succès ! Référence: ' . $property->reference_code);

        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Erreur création bien par co-propriétaire', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return back()
                ->with('error', 'Erreur lors de la création du bien: ' . $e->getMessage())
                ->withInput();
        }
    }

    /**
     * Mettre à jour une propriété (API)
     */
    public function updateProperty(Request $request, $propertyId): JsonResponse
    {
        $user = $request->user();

        if (!$user || !$user->hasRole('co_owner')) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $coOwner = CoOwner::where('user_id', $user->id)->first();
        if (!$coOwner) {
            return response()->json(['message' => 'Co-owner profile missing'], 422);
        }

        $delegation = PropertyDelegation::where('co_owner_id', $coOwner->id)
            ->where('property_id', $propertyId)
            ->where('status', 'active')
            ->first();

        if (!$delegation) {
            return response()->json(['message' => 'Property not delegated to this co-owner'], 403);
        }

        $property = Property::find($propertyId);
        if (!$property) {
            return response()->json(['message' => 'Property not found'], 404);
        }

        if (!in_array('edit', $delegation->permissions ?? [])) {
            return response()->json(['message' => 'No permission to edit this property'], 403);
        }

        Log::info('Données reçues pour modification', [
            'property_id' => $propertyId,
            'data' => $request->all(),
            'user_id' => $user->id
        ]);

        try {
            $validated = $request->validate([
                'name' => 'sometimes|nullable|string|max:255',
                'address' => 'sometimes|nullable|string|max:255',
                'district' => 'sometimes|nullable|string|max:255',
                'city' => 'sometimes|nullable|string|max:255',
                'state' => 'sometimes|nullable|string|max:255',
                'zip_code' => 'sometimes|nullable|string|max:20',
                'country' => 'sometimes|nullable|string|max:255',
                'latitude' => 'sometimes|nullable|string|max:50',
                'longitude' => 'sometimes|nullable|string|max:50',
                'surface' => 'sometimes|nullable|numeric|min:0',
                'floor' => 'sometimes|nullable|integer|min:0',
                'total_floors' => 'sometimes|nullable|integer|min:0',
                'room_count' => 'sometimes|nullable|integer|min:0',
                'bedroom_count' => 'sometimes|nullable|integer|min:0',
                'bathroom_count' => 'sometimes|nullable|integer|min:0',
                'wc_count' => 'sometimes|nullable|integer|min:0',
                'construction_year' => 'sometimes|nullable|integer|min:1800|max:' . date('Y'),
                'rent_amount' => 'sometimes|nullable|numeric|min:0',
                'charges_amount' => 'sometimes|nullable|numeric|min:0',
                'caution' => 'sometimes|nullable|numeric|min:0', // AJOUT ICI
                'property_type' => 'sometimes|nullable|string|max:255',
                'description' => 'sometimes|nullable|string|max:2000',
                'has_garage' => 'sometimes|boolean',
                'has_parking' => 'sometimes|boolean',
                'is_furnished' => 'sometimes|boolean',
                'has_elevator' => 'sometimes|boolean',
                'has_balcony' => 'sometimes|boolean',
                'has_terrace' => 'sometimes|boolean',
                'has_cellar' => 'sometimes|boolean',
                'reference_code' => 'sometimes|string|max:100',
                'status' => 'sometimes|nullable|string|in:available,rented,maintenance,off_market',
                'amenities' => 'sometimes|nullable|array',
                'amenities.*' => 'sometimes|string',
            ]);

            Log::info('Données validées', ['validated' => $validated]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Erreur de validation', [
                'errors' => $e->errors(),
                'data' => $request->all()
            ]);

            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        }

        // Convertir les chaînes vides en null
        foreach ($validated as $key => $value) {
            if ($value === '' || $value === null) {
                $validated[$key] = null;
            }
        }

        // Gérer le code de référence
        if (!isset($validated['reference_code']) || empty($validated['reference_code'])) {
            $validated['reference_code'] = $property->reference_code ?: 'REF-' . time();
        }

        // Traiter les champs booléens
        $booleanFields = ['has_garage', 'has_parking', 'is_furnished', 'has_elevator', 'has_balcony', 'has_terrace', 'has_cellar'];
        foreach ($booleanFields as $field) {
            if (isset($validated[$field])) {
                $validated[$field] = (bool) $validated[$field];
            }
        }

        $originalData = $property->toArray();

        try {
            // Mise à jour de la propriété
            $property->update($validated);

            // Enregistrer dans l'audit
            DB::table('property_modification_audits')->insert([
                'property_id' => $property->id,
                'co_owner_id' => $coOwner->id,
                'landlord_id' => $property->landlord_id,
                'original_data' => json_encode($originalData),
                'modified_data' => json_encode($validated),
                'status' => 'modified',
                'notification_sent_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // Envoyer une notification par email
            try {
                $landlord = User::find($property->landlord_id);
                if ($landlord && $landlord->email) {
                    Mail::to($landlord->email)->send(new PropertyModifiedNotification(
                        $property,
                        $coOwner,
                        $originalData,
                        $validated
                    ));
                }
            } catch (\Exception $e) {
                Log::error('Erreur lors de l\'envoi de l\'email', [
                    'error' => $e->getMessage(),
                ]);
            }

            Log::info('Propriété mise à jour avec succès', [
                'property_id' => $property->id,
            ]);

            $property->refresh();

            return response()->json([
                'message' => 'Propriété modifiée avec succès. Le propriétaire a été notifié par email.',
                'data' => $this->formatPropertyData($property, $coOwner, $delegation)
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur lors de la mise à jour de la propriété', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'message' => 'Erreur lors de la mise à jour: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Formater les données de la propriété pour la réponse JSON
     */
    private function formatPropertyData($property, $coOwner, $delegation)
    {
        return [
            'id' => $property->id,
            'uuid' => $property->uuid,
            'name' => $property->name,
            'reference_code' => $property->reference_code,
            'type' => $property->type,
            'status' => $property->status,
            'address' => $property->address,
            'city' => $property->city,
            'zip_code' => $property->zip_code,
            'surface' => $property->surface,
            'rent_amount' => $property->rent_amount,
            'charges_amount' => $property->charges_amount,
            'caution' => $property->caution,
            'photos' => $property->photos,
            'delegation' => [
                'id' => $delegation->id,
                'permissions' => $delegation->permissions,
                'delegation_type' => $delegation->delegation_type,
            ]
        ];
    }
}
