<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CoOwner\CoOwnerTenantController;
use App\Http\Controllers\ReactRedirectController;
use App\Http\Controllers\CoOwner\CoOwnerAssignPropertyController;

// Page d'accueil Laravel
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
| Routes Copropriétaire
|--------------------------------------------------------------------------
*/

Route::prefix('coproprietaire')->name('co-owner.')->group(function () {

    // ✅ AJOUTER CETTE ROUTE POUR LES BIENS
    Route::get('/biens', function () {
        return view('react-app');
    });

    // Routes pour assigner un bien
    Route::prefix('assign-property')->name('assign-property.')->group(function () {
        // Formulaire d'assignation
        Route::get('/create', [CoOwnerAssignPropertyController::class, 'create'])
            ->name('create');

        // Traitement de l'assignation
        Route::post('/store', [CoOwnerAssignPropertyController::class, 'store'])
            ->name('store');
    });

    // Routes pour les locataires
    Route::prefix('tenants')->name('tenants.')->group(function () {
        // Liste des locataires
        Route::get('/', [CoOwnerTenantController::class, 'index'])
            ->name('index');

        // Formulaire création locataire
        Route::get('/create', [CoOwnerTenantController::class, 'create'])
            ->name('create');

        // Enregistrement locataire
        Route::post('/', [CoOwnerTenantController::class, 'store'])
            ->name('store');

        // Afficher un locataire
        Route::get('/{tenant}', [CoOwnerTenantController::class, 'show'])
            ->name('show');

        // Assigner une propriété (formulaire)
        Route::get('/{tenant}/assign', [CoOwnerTenantController::class, 'showAssignProperty'])
            ->name('assign.show');

        // Assigner une propriété (traitement)
        Route::post('/{tenant}/assign', [CoOwnerTenantController::class, 'assignProperty'])
            ->name('assign');

        // Désassigner une propriété
        Route::delete('/{tenant}/unassign/{property}', [CoOwnerTenantController::class, 'unassignProperty'])
            ->name('unassign');

        // Renvoyer invitation
        Route::post('/{tenant}/resend-invitation', [CoOwnerTenantController::class, 'resendInvitation'])
            ->name('resend-invitation');
    });

    // Routes React pour le co-propriétaire
    Route::get('/dashboard', function () {
        return view('react-app');
    });

    Route::get('/delegations', function () {
        return view('react-app');
    });

    Route::get('/locataires', function () {
        return view('react-app');
    });

    Route::get('/baux', function () {
        return view('react-app');
    });

    Route::get('/quittances', function () {
        return view('react-app');
    });

    Route::get('/finances', function () {
        return view('react-app');
    });

    Route::get('/documents', function () {
        return view('react-app');
    });

    Route::get('/profile', function () {
        return view('react-app');
    });

    Route::get('/parametres', function () {
        return view('react-app');
    });

    Route::get('/emettre-paiement', function () {
        return view('react-app');
    });

    Route::get('/retrait-methode', function () {
        return view('react-app');
    });

    Route::get('/audit', function () {
        return view('react-app');
    });

    Route::get('/inviter-proprietaire', function () {
        return view('react-app');
    });

    Route::get('/mes-delegations', function () {
        return view('react-app');
    });

    Route::get('/demandes-delegation', function () {
        return view('react-app');
    });

    // Route racine du coproprietaire
    Route::get('/', function () {
        return view('react-app');
    });
});

// Route de login vers Laravel
Route::get('/login', function () {
    // Rediriger vers la liste des locataires Laravel pour le moment
    return redirect('/coproprietaire/tenants');
})->name('login');

// Route de logout
Route::get('/logout', function () {
    // Supprimer le token du localStorage via JavaScript
    return "
        <script>
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        </script>
    ";
});

// Route pour les redirections React
Route::get('/redirect/{path?}', [ReactRedirectController::class, 'redirect'])
    ->where('path', '.*')
    ->name('react.redirect');
/*
|--------------------------------------------------------------------------
| Catch-all React
|--------------------------------------------------------------------------
*/

Route::get('/{any}', function () {
    return view('react-app');
})->where('any', '^(?!api|coproprietaire/tenants|coproprietaire/assign-property|test-laravel|test-laravel-page).*$');
