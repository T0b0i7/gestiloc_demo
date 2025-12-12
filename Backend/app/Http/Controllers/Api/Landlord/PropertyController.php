<?php

namespace App\Http\Controllers\Api\Landlord;

use App\Http\Controllers\Controller;
use App\Http\Requests\Landlord\StorePropertyRequest;
use App\Http\Requests\Landlord\UpdatePropertyRequest;
use App\Http\Resources\PropertyResource; // À créer via: php artisan make:resource PropertyResource
use App\Models\Property;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class PropertyController extends Controller
{
    private function getLandlord()
    {
        return auth('sanctum')->user()->landlord;
    }

    /**
     * Liste des biens avec filtres (Ville, Statut, Recherche).
     */
    public function index(Request $request)
    {
        $query = $this->getLandlord()->properties()->getQuery();

        // Filtres
        if ($request->filled('city')) {
            $query->where('city', 'like', "%{$request->city}%");
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $term = $request->search;
            $query->where(function($q) use ($term) {
                $q->where('name', 'like', "%{$term}%")
                  ->orWhere('address', 'like', "%{$term}%")
                  ->orWhere('reference_code', 'like', "%{$term}%");
            });
        }

        // Tri par défaut : les plus récents
        $properties = $query->latest()->paginate(10);

        return PropertyResource::collection($properties);
    }

    /**
     * Créer un nouveau bien.
     */
    public function store(StorePropertyRequest $request)
    {
        // Les données sont déjà validées par StorePropertyRequest
        $data = $request->validated();

        // Gestion upload photos (simplifié)
        if ($request->hasFile('photos')) {
            $photos = [];
            foreach ($request->file('photos') as $photo) {
                $path = $photo->store('properties/photos', 'public');
                $photos[] = Storage::url($path);
            }
            $data['photos'] = $photos;
        }

        $property = $this->getLandlord()->properties()->create($data);

        return new PropertyResource($property);
    }

    /**
     * Détails d'un bien.
     */
    public function show($uuid)
    {
        // On cherche par UUID et on sécurise l'accès
        $property = $this->getLandlord()->properties()
            ->where('uuid', $uuid)
            ->with(['leases.tenant']) // Charger l'historique des baux
            ->firstOrFail();

        return new PropertyResource($property);
    }

    /**
     * Mettre à jour un bien.
     */
    public function update(UpdatePropertyRequest $request, $uuid)
    {
        $property = $this->getLandlord()->properties()->where('uuid', $uuid)->firstOrFail();

        $data = $request->validated();

        // Si on change le statut en "maintenance", vérifier qu'il n'y a pas de locataire actif
        if (isset($data['status']) && $data['status'] === 'maintenance') {
             if ($property->leases()->where('status', 'active')->exists()) {
                 return response()->json(['message' => 'Impossible de passer en maintenance : un bail est en cours.'], 409);
             }
        }

        $property->update($data);

        return new PropertyResource($property);
    }

    /**
     * Supprimer (Soft Delete) un bien.
     */
    public function destroy($uuid)
    {
        $property = $this->getLandlord()->properties()->where('uuid', $uuid)->firstOrFail();

        if ($property->leases()->where('status', 'active')->exists()) {
            return response()->json([
                'message' => 'Impossible de supprimer ce bien car un locataire est en place.'
            ], 403);
        }

        $property->delete();

        return response()->json(['message' => 'Bien archivé avec succès']);
    }
}
