<?php

namespace App\Http\Controllers\CoOwner;

use App\Http\Controllers\Controller;
use App\Models\Lease;
use App\Models\CoOwner;
use App\Models\PropertyDelegation;
use App\Models\Property;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Laravel\Sanctum\PersonalAccessToken;

class CoOwnerLeaseController extends Controller
{
    /**
     * Afficher la liste des baux avec filtres
     */
    public function index(Request $request)
    {
        // Récupérer l'utilisateur depuis Sanctum
        $user = $this->getAuthenticatedUser($request);

        Log::info('=== LISTE DES BAUX (COPRIO) ===', [
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

        // Récupérer les IDs des biens délégués au co-propriétaire
        $delegatedPropertyIds = PropertyDelegation::where('co_owner_id', $coOwner->id)
            ->where('status', 'active')
            ->pluck('property_id')
            ->toArray();

        // Récupérer les biens pour le filtre dropdown
        $properties = Property::whereIn('id', $delegatedPropertyIds)
            ->orderBy('name')
            ->get();

        // Construire la requête des baux avec filtres
        $query = Lease::whereIn('property_id', $delegatedPropertyIds)
            ->with(['property', 'tenant.user']);

        // Filtre par bien (property)
        if ($request->filled('property_id') && $request->property_id !== 'all') {
            $query->where('property_id', $request->property_id);
        }

        // Filtre de recherche (nom du locataire, nom du bien, etc.)
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->whereHas('tenant', function($subQ) use ($search) {
                    $subQ->where('first_name', 'like', "%{$search}%")
                         ->orWhere('last_name', 'like', "%{$search}%");
                })
                ->orWhereHas('property', function($subQ) use ($search) {
                    $subQ->where('name', 'like', "%{$search}%")
                         ->orWhere('address', 'like', "%{$search}%");
                });
            });
        }

        // Filtre par statut
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $leases = $query->orderBy('created_at', 'desc')->get();

        Log::info('Baux récupérés', [
            'delegated_properties_count' => count($delegatedPropertyIds),
            'leases_count' => $leases->count(),
            'filters' => $request->only(['property_id', 'search', 'status'])
        ]);

        return view('co-owner.leases.index', compact('leases', 'properties', 'user'));
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
