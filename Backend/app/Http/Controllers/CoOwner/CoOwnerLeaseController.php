<?php

namespace App\Http\Controllers\CoOwner;

use App\Http\Controllers\Controller;
use App\Models\Lease;
use App\Models\CoOwner;
use App\Models\PropertyDelegation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Laravel\Sanctum\PersonalAccessToken;

class CoOwnerLeaseController extends Controller
{
    /**
     * Afficher la liste des baux
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

        // Récupérer les baux pour ces biens
        $leases = Lease::whereIn('property_id', $delegatedPropertyIds)
            ->with(['property', 'tenant.user'])
            ->orderBy('created_at', 'desc')
            ->get();

        Log::info('Baux récupérés', [
            'delegated_properties_count' => count($delegatedPropertyIds),
            'leases_count' => $leases->count(),
        ]);

        return view('co-owner.leases.index', compact('leases', 'user'));
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
