<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use App\Http\Middleware\RoleMiddleware;
use App\Http\Middleware\CheckPropertyAccess;
use Illuminate\Http\Middleware\HandleCors;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        api: __DIR__ . '/../routes/api.php',      // on charge bien routes/api.php
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        /**
         * CSRF
         * On désactive le CSRF pour toutes les routes (API + SPA avec Bearer token)
         * -> plus de 419 "Page Expired" sur tes requêtes React.
         */
        $middleware->validateCsrfTokens(except: ['*']);

        /**
         * CORS
         * On applique le middleware CORS aux groupes api et web.
         * La config détaillée est dans config/cors.php
         */
        $middleware->api([
            HandleCors::class,
        ]);

        

        $middleware->web([
            HandleCors::class,
        ]);

        /**
         * Alias de middlewares
         * Ici on déclare "role" pour pouvoir utiliser: middleware('role:landlord')
         */
        $middleware->alias([
            'role' => RoleMiddleware::class,
            'property.access' => CheckPropertyAccess::class,
            'workspace.permission' => \App\Http\Middleware\EnsureWorkspacePermission::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->render(function (\Spatie\Permission\Exceptions\RoleDoesNotExist $e, $request) {
            return response()->json([
                'status' => 'error',
                'message' => "Le rôle spécifié n'existe pas dans le système. Veuillez contacter l'administrateur.",
            ], 400);
        });

        $exceptions->render(function (\Spatie\Permission\Exceptions\UnauthorizedException $e, $request) {
            return response()->json([
                'status' => 'error',
                'message' => "Vous n'avez pas les permissions nécessaires pour effectuer cette action.",
            ], 403);
        });

        $exceptions->render(function (\Illuminate\Auth\AuthenticationException $e, $request) {
            return response()->json([
                'status' => 'error',
                'message' => "Sesssion expirée ou non authentifiée. Veuillez vous connecter.",
            ], 401);
        });

        $exceptions->render(function (\Symfony\Component\HttpKernel\Exception\NotFoundHttpException $e, $request) {
            return response()->json([
                'status' => 'error',
                'message' => "La ressource demandée n'existe pas.",
            ], 404);
        });
    })
    ->create();
