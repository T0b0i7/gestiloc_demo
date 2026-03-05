<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TrackUserActivity
{
    public function handle(Request $request, Closure $next)
    {
        $response = $next($request);

        // Mettre à jour last_activity_at uniquement pour les requêtes authentifiées
        if (Auth::check() && $request->isMethod('GET')) {
            $user = Auth::user();
            
            // Éviter les mises à jour trop fréquentes (max toutes les 2 minutes)
            if (!$user->last_activity_at || $user->last_activity_at->lt(now()->subMinutes(2))) {
                $user->updateLastActivity();
            }
        }

        return $response;
    }
}
