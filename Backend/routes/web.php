<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CoOwner\CoOwnerTenantController;

/*
|--------------------------------------------------------------------------
| Routes Laravel explicites (WEB)
|--------------------------------------------------------------------------
*/

// Page d’accueil Laravel (optionnelle)
Route::get('/', function () {
    return view('welcome');
})->name('home');

// Routes de test Laravel
Route::get('/test-laravel', function () {
    return "Page Laravel de test - Ça fonctionne !";
});

Route::get('/test-laravel-page', function () {
    return view('test-laravel');
});


/*
|--------------------------------------------------------------------------
| Routes Copropriétaire (SERVIES PAR LARAVEL)
| ⚠️ PAS de auth ici (React gère la sécurité)
|--------------------------------------------------------------------------
*/

Route::prefix('coproprietaire')->name('co-owner.')->group(function () {

    Route::prefix('tenants')->name('tenants.')->group(function () {

        // Liste des locataires
        Route::get('/', [CoOwnerTenantController::class, 'index'])
            ->name('index');

        // Création d’un locataire
        Route::get('/create', [CoOwnerTenantController::class, 'create'])
            ->name('create');

        // autres routes si besoin…
        // Route::post('/', ...)
    });
});


/*
|--------------------------------------------------------------------------
| Route login requise par Laravel (évite l’erreur 500)
|--------------------------------------------------------------------------
*/

Route::get('/login', function () {
    return redirect('/'); // redirige vers React
})->name('login');


/*
|--------------------------------------------------------------------------
| Catch-all React (TOUJOURS EN DERNIER)
|--------------------------------------------------------------------------
*/

Route::get('/{any}', function () {
    return view('react-app');
})->where('any', '^(?!api|coproprietaire|test-laravel|test-laravel-page).*$');
