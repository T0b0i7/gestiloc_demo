<?php
// app/Http/Middleware/AuthenticateWithToken.php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Laravel\Sanctum\PersonalAccessToken;

class AuthenticateWithToken
{
    public function handle(Request $request, Closure $next)
    {
        // 1. Vérifier si déjà authentifié par session
        if (auth()->check()) {
            return $next($request);
        }

        // 2. Vérifier le token dans l'URL (pour les redirections React)
        if ($request->has('api_token')) {
            $token = PersonalAccessToken::findToken($request->api_token);
            if ($token) {
                auth()->login($token->tokenable);
                return $next($request);
            }
        }

        // 3. Vérifier le token dans l'en-tête Authorization
        if ($request->bearerToken()) {
            $token = PersonalAccessToken::findToken($request->bearerToken());
            if ($token) {
                auth()->login($token->tokenable);
                return $next($request);
            }
        }

        return redirect()->route('login');
    }
}
