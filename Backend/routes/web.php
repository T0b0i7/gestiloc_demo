<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CoOwner\CoOwnerTenantController;
use App\Http\Controllers\CoOwner\CoOwnerAssignPropertyController;
use App\Http\Controllers\CoOwner\CoOwnerLeaseController;
use App\Http\Controllers\CoOwner\CoOwnerLeaseDocumentController;
use App\Http\Controllers\CoOwner\CoOwnerNoticeController;
use App\Http\Controllers\ReactRedirectController;

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


// Routes pour les préavis des co-propriétaires
Route::prefix('notices')->name('notices.')->group(function () {

    // Liste des préavis
    Route::get('/', [CoOwnerNoticeController::class, 'index'])
        ->name('index');

    // Formulaire création préavis
    Route::get('/create', [CoOwnerNoticeController::class, 'create'])
        ->name('create');

    // Enregistrer préavis
    Route::post('/', [CoOwnerNoticeController::class, 'store'])
        ->name('store');

    // Afficher un préavis
    Route::get('/{notice}', [CoOwnerNoticeController::class, 'show'])
        ->name('show');

    // Modifier un préavis (formulaire)
    Route::get('/{notice}/edit', [CoOwnerNoticeController::class, 'edit'])
        ->name('edit');

    // Mettre à jour un préavis
    Route::put('/{notice}', [CoOwnerNoticeController::class, 'update'])
        ->name('update');

    // Supprimer un préavis
    Route::delete('/{notice}', [CoOwnerNoticeController::class, 'destroy'])
        ->name('destroy');

    // Changer le statut (confirmé/annulé)
    Route::post('/{notice}/status', [CoOwnerNoticeController::class, 'updateStatus'])
        ->name('update-status');
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

    // ✅ NOUVELLES ROUTES POUR LA GESTION DES BAUX
    Route::prefix('leases')->name('leases.')->group(function () {
        // Liste des baux
        Route::get('/', [CoOwnerLeaseController::class, 'index'])
            ->name('index');

        // Afficher les documents d'un bail
        Route::get('/{lease}/documents', [CoOwnerLeaseDocumentController::class, 'index'])
            ->name('documents.index');

        // Télécharger un document PDF
        Route::get('/documents/{lease}/download', [CoOwnerLeaseDocumentController::class, 'downloadPdf'])
            ->name('documents.download');

    // Supprimer un document
Route::delete('/{lease}/documents/{document}', [CoOwnerLeaseDocumentController::class, 'destroy'])
    ->name('documents.destroy');


             // Afficher les documents d'un bail
    Route::get('/{lease}/documents', [CoOwnerLeaseDocumentController::class, 'index'])
        ->name('documents.index');

    // Télécharger un document PDF
    Route::get('/documents/{lease}/download', [CoOwnerLeaseDocumentController::class, 'downloadPdf'])
        ->name('documents.download');

    // Prévisualiser un document PDF
    Route::get('/documents/{lease}/preview', [CoOwnerLeaseDocumentController::class, 'previewPdf'])
        ->name('documents.preview');

    // Supprimer un document
    Route::delete('/documents/{document}', [CoOwnerLeaseDocumentController::class, 'destroy'])
        ->name('documents.destroy');
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
})->where('any', '^(?!api|coproprietaire/tenants|coproprietaire/assign-property|coproprietaire/leases|test-laravel|test-laravel-page).*$');
