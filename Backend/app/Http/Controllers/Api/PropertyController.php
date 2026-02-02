<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePropertyRequest;
use App\Models\Property;
use App\Models\CoOwner;
use App\Models\PropertyDelegation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class PropertyController extends Controller
{
    /* =========================
     * Helpers
     * ========================= */

    private function getPhotoUrls(Property $property): array
    {
        $photos = $property->photos ?? [];
        $urls = [];

        foreach ($photos as $photo) {
            if (empty($photo)) continue;

            if (str_starts_with($photo, 'http://') || str_starts_with($photo, 'https://')) {
                $urls[] = $photo;
            } else {
                $cleanPath = str_replace('\\', '/', $photo);
                $cleanPath = ltrim($cleanPath, '/');

                if (Storage::disk('public')->exists($cleanPath)) {
                    $urls[] = Storage::disk('public')->url($cleanPath);
                } else {
                    Log::warning('Photo not found', ['path' => $cleanPath, 'property_id' => $property->id]);
                }
            }
        }

        return $urls;
    }

    /**
     * ✅ Vérifier si CE BIEN est délégué à une AGENCE
     */
    private function isPropertyDelegatedToAgency(Property $property): bool
    {
        return PropertyDelegation::where('property_id', $property->id)
            ->where('status', 'active')
            ->where('co_owner_type', 'agency')
            ->exists();
    }

    /**
     * ✅ Vérifier si CE BIEN est délégué à un CO-PROPRIÉTAIRE SIMPLE
     */
    private function isPropertyDelegatedToSimpleCoOwner(Property $property): bool
    {
        return PropertyDelegation::where('property_id', $property->id)
            ->where('status', 'active')
            ->where('co_owner_type', 'co_owner')
            ->exists();
    }

    /**
     * ✅ Déterminer si l'utilisateur peut MODIFIER une propriété
     */
    private function canEditProperty(Property $property, $user): bool
    {
        // 1. ADMIN : Peut tout modifier
        if ($user->isAdmin()) {
            return true;
        }

        // 2. LANDLORD : Propriétaire du bien
        if ($user->isLandlord()) {
            if ($user->landlord && $property->landlord_id === $user->landlord->id) {
                // ✅ RÈGLE : Si le bien est délégué à une AGENCE, le propriétaire perd ses droits
                if ($this->isPropertyDelegatedToAgency($property)) {
                    return false;
                }

                // ✅ Si le bien est délégué à un co-propriétaire SIMPLE, le propriétaire garde ses droits
                if ($this->isPropertyDelegatedToSimpleCoOwner($property)) {
                    return true;
                }

                return true; // Bien non délégué
            }
        }

        // 3. CO-OWNER : Copropriétaire ou Agence
        if ($user->isCoOwner()) {
            $coOwner = CoOwner::where('user_id', $user->id)->first();

            if (!$coOwner) {
                return false;
            }

            // ✅ AGENCES : Peuvent modifier SEULEMENT les biens qui leur sont délégués
            $isAgency = ($coOwner->co_owner_type === 'agency');

            if ($isAgency) {
                // Vérifie si cette agence a une délégation active sur ce bien
                return PropertyDelegation::where('property_id', $property->id)
                    ->where('co_owner_id', $coOwner->id)
                    ->where('status', 'active')
                    ->exists();
            }

            // ✅ COPROPRIÉTAIRES SIMPLES : Peuvent modifier les biens du landlord
            return $coOwner->landlord_id === $property->landlord_id;
        }

        return false;
    }

    /**
     * ✅ Obtenir le TYPE de délégation pour ce bien
     * Retourne: 'agency', 'co_owner', ou null
     */
    private function getDelegationType(Property $property): ?string
    {
        $delegation = PropertyDelegation::where('property_id', $property->id)
            ->where('status', 'active')
            ->first();

        return $delegation?->co_owner_type;
    }

    /**
     * ✅ Obtenir les informations de la délégation
     */
    private function getDelegationInfo(Property $property): ?array
    {
        $delegation = PropertyDelegation::where('property_id', $property->id)
            ->where('status', 'active')
            ->with('coOwner')
            ->first();

        if (!$delegation || !$delegation->coOwner) {
            return null;
        }

        return [
            'type' => $delegation->co_owner_type,
            'co_owner_name' => $delegation->coOwner->first_name . ' ' . $delegation->coOwner->last_name,
            'co_owner_company' => $delegation->coOwner->company_name,
            'delegated_at' => $delegation->delegated_at,
            'delegation_type' => $delegation->delegation_type,
            'permissions' => $delegation->permissions ?? [],
        ];
    }

    /**
     * ✅ Formater les données du bien pour l'API
     */
    private function formatPropertyForApi(Property $property, $user): array
    {
        $propertyArray = $property->toArray();

        // Ajouter les URLs des photos
        $propertyArray['photo_urls'] = $this->getPhotoUrls($property);
        $propertyArray['photos'] = $this->getPhotoUrls($property); // Pour compatibilité

        // Ajouter les permissions
        $propertyArray['can_edit'] = $this->canEditProperty($property, $user);
        $propertyArray['delegation_type'] = $this->getDelegationType($property);
        $propertyArray['delegation_info'] = $this->getDelegationInfo($property);

        // S'assurer que meta est un array
        if (is_string($property->meta)) {
            $propertyArray['meta'] = json_decode($property->meta, true) ?? [];
        } elseif (is_array($property->meta)) {
            $propertyArray['meta'] = $property->meta;
        } else {
            $propertyArray['meta'] = [];
        }

        return $propertyArray;
    }

    /* =========================
     * Actions CRUD
     * ========================= */

    /**
     * GET /api/properties
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        // ADMIN : Voir tout
        if ($user->isAdmin()) {
            $properties = Property::with(['landlord'])->latest()->paginate(20);
            $formattedProperties = $properties->getCollection()->map(function ($property) use ($user) {
                return $this->formatPropertyForApi($property, $user);
            });

            return response()->json([
                'data' => $formattedProperties,
                'current_page' => $properties->currentPage(),
                'last_page' => $properties->lastPage(),
                'per_page' => $properties->perPage(),
                'total' => $properties->total(),
            ]);
        }

        // LANDLORD : Voir ses propres biens
        if ($user->isLandlord()) {
            $landlord = $user->landlord;
            if (!$landlord) {
                return response()->json([
                    'data' => [],
                    'current_page' => 1,
                    'last_page' => 1,
                    'per_page' => 20,
                    'total' => 0,
                ]);
            }

            $properties = $landlord->properties()->with(['landlord'])->latest()->paginate(20);
            $formattedProperties = $properties->getCollection()->map(function ($property) use ($user) {
                return $this->formatPropertyForApi($property, $user);
            });

            return response()->json([
                'data' => $formattedProperties,
                'current_page' => $properties->currentPage(),
                'last_page' => $properties->lastPage(),
                'per_page' => $properties->perPage(),
                'total' => $properties->total(),
            ]);
        }

        // CO-OWNER : Voir les biens du landlord associé
        if ($user->isCoOwner()) {
            $coOwner = CoOwner::where('user_id', $user->id)->first();

            if (!$coOwner) {
                return response()->json([
                    'data' => [],
                    'current_page' => 1,
                    'last_page' => 1,
                    'per_page' => 20,
                    'total' => 0,
                ]);
            }

            $properties = Property::with(['landlord'])
                ->where('landlord_id', $coOwner->landlord_id)
                ->latest()
                ->paginate(20);

            $formattedProperties = $properties->getCollection()->map(function ($property) use ($user) {
                return $this->formatPropertyForApi($property, $user);
            });

            return response()->json([
                'data' => $formattedProperties,
                'current_page' => $properties->currentPage(),
                'last_page' => $properties->lastPage(),
                'per_page' => $properties->perPage(),
                'total' => $properties->total(),
            ]);
        }

        return response()->json(['message' => 'Forbidden'], 403);
    }

    /**
     * POST /api/properties
     */
    public function store(StorePropertyRequest $request): JsonResponse
    {
        $user = $request->user();

        if (!$user->isLandlord()) {
            return response()->json(['message' => 'Forbidden - Seuls les propriétaires peuvent créer des biens'], 403);
        }

        $landlord = $user->landlord;
        if (!$landlord) {
            return response()->json(['message' => 'Landlord profile missing'], 422);
        }

        $data = $request->validated();

        if (isset($data['photos']) && is_array($data['photos'])) {
            $data['photos'] = array_filter($data['photos'], function($photo) {
                return !empty($photo);
            });
        }

        $data['landlord_id'] = $landlord->id;
        $data['user_id'] = $user->id;

        $property = Property::create($data);
        $formattedProperty = $this->formatPropertyForApi($property, $user);

        Log::info('[Property] Created successfully', ['property_id' => $property->id, 'user_id' => $user->id]);

        return response()->json($formattedProperty, 201);
    }

    /**
     * GET /api/properties/{id}
     */
    public function show(Request $request, $id): JsonResponse
    {
        $property = Property::with(['landlord'])->findOrFail($id);
        $user = $request->user();

        $canView = false;

        if ($user->isAdmin()) {
            $canView = true;
        } elseif ($user->isLandlord()) {
            if ($user->landlord && $property->landlord_id === $user->landlord->id) {
                $canView = true;
            }
        } elseif ($user->isCoOwner()) {
            $coOwner = CoOwner::where('user_id', $user->id)->first();
            if ($coOwner && $coOwner->landlord_id === $property->landlord_id) {
                $canView = true;
            }
        }

        if (!$canView) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $formattedProperty = $this->formatPropertyForApi($property, $user);
        return response()->json($formattedProperty);
    }

    /**
     * PUT /api/properties/{id}
     */
    public function update(StorePropertyRequest $request, $id): JsonResponse
    {
        $property = Property::with(['landlord'])->findOrFail($id);
        $user = $request->user();

        // ✅ VÉRIFICATION : Utiliser canEditProperty
        if (!$this->canEditProperty($property, $user)) {
            $message = 'Forbidden - Vous n\'avez pas la permission de modifier ce bien';

            $delegationType = $this->getDelegationType($property);
            if ($delegationType === 'agency') {
                $message = 'Forbidden - Ce bien est géré par une agence. Vous avez uniquement un accès en lecture.';
            }

            return response()->json(['message' => $message], 403);
        }

        $data = $request->validated();

        if (isset($data['photos']) && is_array($data['photos'])) {
            $data['photos'] = array_filter($data['photos'], function($photo) {
                return !empty($photo);
            });
        }

        // Protection anti-mass assignment
        unset($data['landlord_id'], $data['user_id']);

        $property->update($data);
        $propertyFresh = $property->fresh();
        $formattedProperty = $this->formatPropertyForApi($propertyFresh, $user);

        Log::info('[Property] Updated successfully', [
            'property_id' => $propertyFresh->id,
            'user_id' => $user->id,
            'user_role' => $user->role
        ]);

        return response()->json($formattedProperty);
    }

    /**
     * DELETE /api/properties/{id}
     */
    public function destroy(Request $request, $id): JsonResponse
    {
        $property = Property::findOrFail($id);
        $user = $request->user();

        if (!$user->isAdmin()) {
            if (!$user->isLandlord()) {
                return response()->json(['message' => 'Forbidden - Seuls les propriétaires peuvent supprimer des biens'], 403);
            }
            if (!$user->landlord || $property->landlord_id !== $user->landlord->id) {
                return response()->json(['message' => 'Forbidden - Ce bien ne vous appartient pas'], 403);
            }
        }

        $property->delete();

        Log::info('[Property] Deleted successfully', [
            'property_id' => $id,
            'user_id' => $user->id
        ]);

        return response()->json(['message' => 'Property deleted']);
    }
}
