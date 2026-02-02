<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CheckCoOwner
{
    /**
     * Vérifier que l'utilisateur est un co-propriétaire
     */
    public function handle(Request $request, Closure $next)
    {
        $user = Auth::user();

        // 1. Vérifier si l'utilisateur est authentifié
        if (!$user) {
            if ($request->expectsJson()) {
                return response()->json(['message' => 'Non authentifié'], 401);
            }
            return redirect()->route('login')->with('error', 'Veuillez vous connecter');
        }

        // 2. Vérifier si l'utilisateur a le rôle 'co_owner'
        if (!$user->hasRole('co_owner')) {
            if ($request->expectsJson()) {
                return response()->json(['message' => 'Accès réservé aux co-propriétaires'], 403);
            }
            return redirect('/')->with('error', 'Accès non autorisé. Vous devez être co-propriétaire.');
        }

        // 3. Vérifier si l'utilisateur a un profil co-propriétaire
        if (!$user->coOwner) {
            if ($request->expectsJson()) {
                return response()->json(['message' => 'Profil co-propriétaire manquant'], 422);
            }
            return redirect('/')->with('error', 'Profil co-propriétaire incomplet. Veuillez contacter l\'administrateur.');
        }

        // 4. Vérifier si le profil co-propriétaire est actif
        if ($user->coOwner->status !== 'active') {
            if ($request->expectsJson()) {
                return response()->json(['message' => 'Compte co-propriétaire désactivé'], 403);
            }
            return redirect('/')->with('error', 'Votre compte co-propriétaire n\'est pas actif.');
        }

        return $next($request);
    }
}
