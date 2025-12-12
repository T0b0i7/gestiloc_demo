<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use App\Http\Middleware\RoleMiddleware;
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
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })
    ->create();
