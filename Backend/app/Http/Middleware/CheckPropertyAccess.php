<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CheckPropertyAccess
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle(Request $request, Closure $next)
    {
        $user = Auth::user();
        $property = $request->route('property');

        if (!$property) {
            return response()->json(['message' => 'Property not found'], 404);
        }

        // Admin a accès à tout
        if ($user->isAdmin()) {
            return $next($request);
        }

        // Propriétaire : vérifier que c'est sa propriété
        if ($user->isLandlord()) {
            if ($property->landlord_id === $user->landlord->id) {
                return $next($request);
            }
            
            // Si délégué à une agence, accès en lecture seule
            if ($property->delegations()->where('status', 'active')->exists()) {
                // Vérifier si c'est une requête en écriture
                if (in_array($request->method(), ['POST', 'PUT', 'PATCH', 'DELETE'])) {
                    return response()->json([
                        'message' => 'Accès en écriture refusé : propriété déléguée à une agence',
                        'read_only' => true
                    ], 403);
                }
                return $next($request);
            }
        }

        // Copropriétaire : vérifier qu'il gère cette propriété
        if ($user->isCoOwner()) {
            // Vérifier dans les deux tables possibles (landlords ou agencies)
            $delegation = null;
            
            // Chercher dans landlords (co-owners particuliers)
            if ($user->coOwner && $user->coOwner->isCoOwner()) {
                $delegation = $property->delegations()
                    ->where('co_owner_id', $user->coOwner->id)
                    ->where('co_owner_type', 'landlord')
                    ->where('status', 'active')
                    ->first();
            }
            
            // Chercher dans agencies (co-owners agences)
            if (!$delegation && $user->agency && $user->agency->isCoOwnerAgency()) {
                $delegation = $property->delegations()
                    ->where('co_owner_id', $user->agency->id)
                    ->where('co_owner_type', 'agency')
                    ->where('status', 'active')
                    ->first();
            }

            if ($delegation && $delegation->isActive()) {
                return $next($request);
            }
        }

        return response()->json(['message' => 'Non autorisé'], 403);
    }
}
