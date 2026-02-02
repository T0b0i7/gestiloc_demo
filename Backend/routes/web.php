<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CoOwner\CoOwnerTenantController;
use App\Http\Controllers\CoOwner\CoOwnerAssignPropertyController;
use App\Http\Controllers\CoOwner\CoOwnerLeaseController;
use App\Http\Controllers\CoOwner\CoOwnerLeaseDocumentController;
use App\Http\Controllers\CoOwner\CoOwnerMaintenanceController;
use App\Http\Controllers\CoOwner\CoOwnerRentReceiptController;
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

// Routes de login/logout
Route::get('/login', function () {
    return redirect('/coproprietaire/tenants');
})->name('login');

Route::get('/logout', function () {
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
| ROUTES LARAVEL SPÉCIFIQUES - DOIVENT ÊTRE DÉFINIES AVANT
|--------------------------------------------------------------------------
*/

// ✅ **TOUTES LES ROUTES LARAVEL DOIVENT ÊTRE ICI**

// Routes pour les locataires - Laravel
Route::prefix('coproprietaire/tenants')->name('co-owner.tenants.')->group(function () {
    Route::get('/', [CoOwnerTenantController::class, 'index'])->name('index');
    Route::get('/create', [CoOwnerTenantController::class, 'create'])->name('create');
    Route::post('/', [CoOwnerTenantController::class, 'store'])->name('store');
    Route::get('/{tenant}', [CoOwnerTenantController::class, 'show'])->name('show');
    Route::get('/{tenant}/assign', [CoOwnerTenantController::class, 'showAssignProperty'])->name('assign.show');
    Route::post('/{tenant}/assign', [CoOwnerTenantController::class, 'assignProperty'])->name('assign');
    Route::delete('/{tenant}/unassign/{property}', [CoOwnerTenantController::class, 'unassignProperty'])->name('unassign');
    Route::post('/{tenant}/resend-invitation', [CoOwnerTenantController::class, 'resendInvitation'])->name('resend-invitation');
});

// Routes pour assigner un bien - Laravel
Route::prefix('coproprietaire/assign-property')->name('co-owner.assign-property.')->group(function () {
    Route::get('/create', [CoOwnerAssignPropertyController::class, 'create'])->name('create');
    Route::post('/store', [CoOwnerAssignPropertyController::class, 'store'])->name('store');
});

// Routes pour les quittances - Laravel (TRÈS IMPORTANT)
Route::prefix('coproprietaire/quittances')->name('co-owner.quittances.')->group(function () {
    Route::get('/', [CoOwnerRentReceiptController::class, 'index'])->name('index');
    Route::get('/create', [CoOwnerRentReceiptController::class, 'create'])->name('create');
    Route::post('/', [CoOwnerRentReceiptController::class, 'store'])->name('store');
    Route::get('/{receipt}/download', [CoOwnerRentReceiptController::class, 'downloadPdf'])->name('download');
    Route::post('/{receipt}/send-email', [CoOwnerRentReceiptController::class, 'sendByEmail'])->name('send-email');
    Route::delete('/{receipt}', [CoOwnerRentReceiptController::class, 'destroy'])->name('destroy');
});

// Routes pour les préavis - Laravel
Route::prefix('coproprietaire/notices')->name('co-owner.notices.')->group(function () {
    Route::get('/', [CoOwnerNoticeController::class, 'index'])->name('index');
    Route::get('/create', [CoOwnerNoticeController::class, 'create'])->name('create');
    Route::post('/', [CoOwnerNoticeController::class, 'store'])->name('store');
    Route::get('/{notice}', [CoOwnerNoticeController::class, 'show'])->name('show');
    Route::get('/{notice}/edit', [CoOwnerNoticeController::class, 'edit'])->name('edit');
    Route::put('/{notice}', [CoOwnerNoticeController::class, 'update'])->name('update');
    Route::delete('/{notice}', [CoOwnerNoticeController::class, 'destroy'])->name('destroy');
    Route::post('/{notice}/status', [CoOwnerNoticeController::class, 'updateStatus'])->name('update-status');
});

// Routes pour la maintenance - Laravel
Route::prefix('coproprietaire/maintenance')->name('co-owner.maintenance.')->group(function () {
    Route::get('/', [CoOwnerMaintenanceController::class, 'index'])->name('index');
    Route::get('/{maintenance}', [CoOwnerMaintenanceController::class, 'show'])->name('show');
    Route::post('/{maintenance}/start', [CoOwnerMaintenanceController::class, 'start'])->name('start');
    Route::post('/{maintenance}/assign', [CoOwnerMaintenanceController::class, 'assign'])->name('assign');
    Route::post('/{maintenance}/resolve', [CoOwnerMaintenanceController::class, 'resolve'])->name('resolve');
    Route::post('/{maintenance}/cancel', [CoOwnerMaintenanceController::class, 'cancel'])->name('cancel');
    Route::post('/{maintenance}/comment', [CoOwnerMaintenanceController::class, 'comment'])->name('comment');
    Route::post('/{maintenance}/reply', [CoOwnerMaintenanceController::class, 'replyToTenant'])->name('reply');
});

// Routes pour les baux - Laravel
Route::prefix('coproprietaire/leases')->name('co-owner.leases.')->group(function () {
    Route::get('/', [CoOwnerLeaseController::class, 'index'])->name('index');
    Route::get('/{lease}/documents', [CoOwnerLeaseDocumentController::class, 'index'])->name('documents.index');
    Route::get('/documents/{lease}/download', [CoOwnerLeaseDocumentController::class, 'downloadPdf'])->name('documents.download');
    Route::delete('/{lease}/documents/{document}', [CoOwnerLeaseDocumentController::class, 'destroy'])->name('documents.destroy');
    Route::get('/documents/{lease}/preview', [CoOwnerLeaseDocumentController::class, 'previewPdf'])->name('documents.preview');
});

/*
|--------------------------------------------------------------------------
| ROUTES REACT - DÉFINIES APRÈS LES ROUTES LARAVEL
|--------------------------------------------------------------------------
*/

Route::prefix('coproprietaire')->name('co-owner.react.')->group(function () {
    // Routes React uniquement

    // AJOUTER CETTE ROUTE POUR LES BIENS
    Route::get('/biens', function () {
        return view('react-app');
    });

    Route::get('/dashboard', function () {
        return view('react-app');
    });

    Route::get('/delegations', function () {
        return view('react-app');
    });

    // Route React pour /locataires (différente de Laravel /tenants)
    Route::get('/locataires', function () {
        return view('react-app');
    });

    // Route React pour /baux (différente de Laravel /leases)
    Route::get('/baux', function () {
        return view('react-app');
    });

    // Route React pour /finances
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

    // Route racine React
    Route::get('/', function () {
        return view('react-app');
    });
});

/*
|--------------------------------------------------------------------------
| Catch-all React - DOIT ÊTRE ABSOLUMENT LA DERNIÈRE ROUTE
|--------------------------------------------------------------------------
*/

Route::get('/{any}', function () {
    return view('react-app');
})->where('any', '^(?!api).*$');
