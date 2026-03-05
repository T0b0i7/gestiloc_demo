<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string  $role
     */
    public function handle(Request $request, Closure $next, string $role): Response
    {
        $user = $request->user();

        if (! $user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        switch ($role) {
            case 'admin':
                if (! method_exists($user, 'isAdmin') || ! $user->isAdmin()) {
                    return response()->json(['message' => 'Forbidden'], 403);
                }
                break;

            case 'landlord':
                if (! method_exists($user, 'isLandlord') || ! $user->isLandlord()) {
                    return response()->json(['message' => 'Forbidden'], 403);
                }
                break;

            case 'tenant':
                if (! method_exists($user, 'isTenant') || ! $user->isTenant()) {
                    return response()->json(['message' => 'Forbidden'], 403);
                }
                break;

            default:
                return response()->json(['message' => 'Forbidden'], 403);
        }

        return $next($request);
    }
}
