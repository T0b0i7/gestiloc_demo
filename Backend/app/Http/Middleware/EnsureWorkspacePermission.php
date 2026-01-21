<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Services\WorkspaceAccessService;

class EnsureWorkspacePermission
{
    public function __construct(private WorkspaceAccessService $access) {}

    public function handle(Request $request, Closure $next, string $ability = 'view'): Response
    {
        $user = $request->user();
        if (!$user) return response()->json(['message' => 'Unauthenticated'], 401);

        if (!$this->access->can($user, $ability)) {
            return response()->json(['message' => 'Forbidden (workspace permission)'], 403);
        }

        return $next($request);
    }
}
