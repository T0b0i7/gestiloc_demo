<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CoOwner\CoOwnerTenantController;
use App\Http\Controllers\CoOwner\CoOwnerAssignPropertyController;
use App\Http\Controllers\CoOwner\CoOwnerLeaseController;
use App\Http\Controllers\CoOwner\CoOwnerLeaseDocumentController;
use App\Http\Controllers\CoOwner\CoOwnerMaintenanceController;
use App\Http\Controllers\CoOwner\CoOwnerRentReceiptController;
use App\Http\Controllers\CoOwner\CoOwnerNoticeController;
use App\Http\Controllers\CoOwner\CoOwnerPaymentController;
use App\Http\Controllers\CoOwner\CoOwnerAccountingController;
use App\Http\Controllers\CoOwner\CoOwnerInvoiceController;
use App\Http\Controllers\CoOwner\CoOwnerPropertyController;
use App\Http\Controllers\CoOwner\CoOwnerManagementController;
use App\Http\Controllers\CoOwner\CoOwnerConditionReportController;
use App\Http\Controllers\ReactRedirectController;
use App\Http\Controllers\Auth\LoginController;

// Page d'accueil Laravel (publique)
Route::get('/', function () {
    return view('welcome');
})->name('home');

// Route publique pour voir le dossier partagé
Route::get('/dossier-partage/{shareUrl}', function ($shareUrl) {
    return view('dossier-public', ['shareUrl' => $shareUrl]);
})->name('dossier.public');

// Routes de test Laravel (publiques)
Route::get('/test-laravel', function () {
    return "Page Laravel de test - Ça fonctionne !";
});

Route::get('/test-laravel-page', function () {
    return view('test-laravel');
});

// Routes de login/logout (publiques)
Route::get('/login', function () {
    // Si l'utilisateur a un token valide, rediriger vers le dashboard React
    if (request()->has('api_token') || request()->cookie('laravel_session')) {
        return "
            <script>
                const urlParams = new URLSearchParams(window.location.search);
                const apiToken = urlParams.get('api_token');
                if (apiToken) {
                    localStorage.setItem('token', apiToken);
                }
                window.location.href = '/coproprietaire/dashboard';
            </script>
        ";
    }
    return view('auth.login');
})->name('login');

// Route de déconnexion (publique)
Route::get('/logout', function () {
    auth()->logout();
    session()->flush();

    return "
        <!DOCTYPE html>
        <html>
        <head>
            <title>Déconnexion - GestiLoc</title>
            <style>
                body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 100vh;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    margin: 0;
                }
                .container {
                    text-align: center;
                    background: white;
                    padding: 3rem;
                    border-radius: 1rem;
                    box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                }
                .spinner {
                    border: 4px solid rgba(0,0,0,0.1);
                    border-left-color: #667eea;
                    border-radius: 50%;
                    width: 40px;
                    height: 40px;
                    animation: spin 1s linear infinite;
                    margin: 0 auto 1rem;
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            </style>
        </head>
        <body>
            <div class='container'>
                <div class='spinner'></div>
                <h2>Déconnexion en cours...</h2>
                <p>Redirection vers la page de connexion</p>
            </div>
            <script>
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                setTimeout(() => {
                    window.location.href = '/login';
                }, 1000);
            </script>
        </body>
        </html>
    ";
})->name('logout');

// Route pour les redirections React (publique)
Route::get('/redirect/{path?}', [ReactRedirectController::class, 'redirect'])
    ->where('path', '.*')
    ->name('react.redirect');

/*
|--------------------------------------------------------------------------
| ROUTES PROTÉGÉES PAR LE MIDDLEWARE AUTH.TOKEN
|--------------------------------------------------------------------------
*/
Route::middleware([\App\Http\Middleware\AuthenticateWithToken::class])->group(function () {


    /*
    |--------------------------------------------------------------------------
    | ROUTES COPROPRIÉTAIRE - PROTÉGÉES
    |--------------------------------------------------------------------------
    */

    // Routes pour les locataires
    Route::prefix('coproprietaire/tenants')->name('co-owner.tenants.')->group(function () {
        Route::get('/', [CoOwnerTenantController::class, 'index'])->name('index');
        Route::get('/create', [CoOwnerTenantController::class, 'create'])->name('create');
        Route::post('/', [CoOwnerTenantController::class, 'store'])->name('store');
        Route::get('/{tenant}', [CoOwnerTenantController::class, 'show'])->name('show');
            Route::get('/{tenant}/edit', [CoOwnerTenantController::class, 'edit'])->name('edit'); 
    Route::put('/{tenant}', [CoOwnerTenantController::class, 'update'])->name('update'); //
        Route::get('/{tenant}/assign', [CoOwnerTenantController::class, 'showAssignProperty'])->name('assign.show');
        Route::post('/{tenant}/assign', [CoOwnerTenantController::class, 'assignProperty'])->name('assign');
        Route::delete('/{tenant}/unassign/{property}', [CoOwnerTenantController::class, 'unassignProperty'])->name('unassign');
        Route::post('/{tenant}/resend-invitation', [CoOwnerTenantController::class, 'resendInvitation'])->name('resend-invitation');
        Route::put('/{tenant}/archive', [CoOwnerTenantController::class, 'archive'])->name('archive');
        Route::put('/{tenant}/restore', [CoOwnerTenantController::class, 'restore'])->name('restore');
    });

    // Routes pour la gestion des paiements
    Route::prefix('coproprietaire/paiements')->name('co-owner.payments.')->group(function () {
        Route::get('/', [CoOwnerPaymentController::class, 'index'])->name('index');
        Route::get('/create', [CoOwnerPaymentController::class, 'create'])->name('create');
        Route::post('/', [CoOwnerPaymentController::class, 'store'])->name('store');
        Route::get('/export', [CoOwnerPaymentController::class, 'export'])->name('export');
        Route::get('/rappels', [CoOwnerPaymentController::class, 'reminders'])->name('reminders');
        Route::get('/{payment}', [CoOwnerPaymentController::class, 'show'])->name('show');
        Route::post('/{payment}/rappel', [CoOwnerPaymentController::class, 'sendReminder'])->name('send-reminder');
        Route::put('/{payment}/archive', [CoOwnerPaymentController::class, 'archive'])->name('archive');
        Route::get('/{payment}/receipt', [CoOwnerPaymentController::class, 'generateReceipt'])->name('receipt');
        Route::post('/{payment}/send-receipt', [CoOwnerPaymentController::class, 'sendReceipt'])->name('send-receipt');
    });

    // Route etat des lieux
    Route::prefix('coproprietaire/etats-des-lieux')->name('co-owner.condition-reports.')->group(function () {
        Route::get('/create', [CoOwnerConditionReportController::class, 'create'])->name('create');
        Route::get('/', [CoOwnerConditionReportController::class, 'index'])->name('index');
        Route::post('/', [CoOwnerConditionReportController::class, 'store'])->name('store');
        Route::get('/bien/{propertyId}', [CoOwnerConditionReportController::class, 'index'])->name('by-property');
        Route::get('/{id}/edit', [CoOwnerConditionReportController::class, 'edit'])->name('edit');
        Route::put('/{id}', [CoOwnerConditionReportController::class, 'update'])->name('update');
        Route::get('/{id}', [CoOwnerConditionReportController::class, 'show'])->name('show');
        Route::post('/{id}/photos', [CoOwnerConditionReportController::class, 'addPhotos'])->name('add-photos');
        Route::delete('/{id}', [CoOwnerConditionReportController::class, 'destroy'])->name('destroy');
        Route::get('/{id}/download', [CoOwnerConditionReportController::class, 'downloadPdf'])->name('download');
    });

    // Routes pour assigner un bien
    Route::prefix('coproprietaire/assign-property')->name('co-owner.assign-property.')->group(function () {
        Route::get('/create', [CoOwnerAssignPropertyController::class, 'create'])->name('create');
        Route::post('/store', [CoOwnerAssignPropertyController::class, 'store'])->name('store');
    });

    // Routes pour les quittances
    Route::prefix('coproprietaire/quittances')->name('co-owner.quittances.')->group(function () {
        Route::get('/', [CoOwnerRentReceiptController::class, 'index'])->name('index');
        Route::get('/create', [CoOwnerRentReceiptController::class, 'create'])->name('create');
        Route::post('/', [CoOwnerRentReceiptController::class, 'store'])->name('store');
        Route::get('/{receipt}/download', [CoOwnerRentReceiptController::class, 'downloadPdf'])->name('download');
        Route::post('/{receipt}/send-email', [CoOwnerRentReceiptController::class, 'sendByEmail'])->name('send-email');
        Route::delete('/{receipt}', [CoOwnerRentReceiptController::class, 'destroy'])->name('destroy');
    });

    // Routes pour la gestion des copropriétaires
    Route::prefix('coproprietaire/gestionnaires')->name('co-owner.management.')->group(function () {
        Route::get('/', [CoOwnerManagementController::class, 'index'])->name('index');
        Route::get('/creer', [CoOwnerManagementController::class, 'create'])->name('create');
        Route::post('/inviter', [CoOwnerManagementController::class, 'invite'])->name('invite');
        Route::get('/{id}', [CoOwnerManagementController::class, 'show'])->name('show');
        Route::post('/{id}/revoke', [CoOwnerManagementController::class, 'revoke'])->name('revoke');
        Route::post('/{id}/reactivate', [CoOwnerManagementController::class, 'reactivate'])->name('reactivate');
        Route::post('/{id}/delegate', [CoOwnerManagementController::class, 'delegate'])->name('delegate');
        Route::delete('/delegations/{delegationId}/revoke', [CoOwnerManagementController::class, 'revokeDelegation'])->name('delegations.revoke');
        Route::post('/invitations/{id}/resend', [CoOwnerManagementController::class, 'resendInvitation'])->name('invitations.resend');
        Route::delete('/invitations/{id}/cancel', [CoOwnerManagementController::class, 'cancelInvitation'])->name('invitations.cancel');
    });

    // Routes factures
    Route::prefix('coproprietaire/factures')->name('co-owner.invoices.')->group(function () {
        Route::get('/', [CoOwnerInvoiceController::class, 'index'])->name('index');
        Route::get('/creer', [CoOwnerInvoiceController::class, 'create'])->name('create');
        Route::post('/', [CoOwnerInvoiceController::class, 'store'])->name('store');
        Route::get('/{id}', [CoOwnerInvoiceController::class, 'show'])->name('show');
        Route::get('/{id}/pdf', [CoOwnerInvoiceController::class, 'downloadPdf'])->name('pdf');
        Route::post('/{id}/rappel', [CoOwnerInvoiceController::class, 'sendReminder'])->name('reminder');
    });

    // Routes biens
    Route::prefix('coproprietaire/biens')->name('co-owner.properties.')->group(function () {
        Route::get('/create', [CoOwnerPropertyController::class, 'create'])->name('create');
        Route::post('/store', [CoOwnerPropertyController::class, 'store'])->name('store');
    });

    // Routes préavis
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

    // Routes maintenance
    Route::prefix('coproprietaire/maintenance')->name('co-owner.maintenance.')->group(function () {
        Route::get('/', [CoOwnerMaintenanceController::class, 'index'])->name('index');
        Route::get('/create', [CoOwnerMaintenanceController::class, 'create'])->name('create');
        Route::post('/store', [CoOwnerMaintenanceController::class, 'store'])->name('store');
        Route::get('/{maintenance}', [CoOwnerMaintenanceController::class, 'show'])->name('show');
        Route::get('/{maintenance}/edit', [CoOwnerMaintenanceController::class, 'edit'])->name('edit');
        Route::put('/{maintenance}/update', [CoOwnerMaintenanceController::class, 'update'])->name('update');
        Route::post('/{maintenance}/start', [CoOwnerMaintenanceController::class, 'start'])->name('start');
        Route::post('/{maintenance}/comment', [CoOwnerMaintenanceController::class, 'comment'])->name('comment');
        Route::post('/{maintenance}/reply', [CoOwnerMaintenanceController::class, 'replyToTenant'])->name('reply');
        Route::post('/{maintenance}/assign', [CoOwnerMaintenanceController::class, 'assign'])->name('assign');
        Route::post('/{maintenance}/resolve', [CoOwnerMaintenanceController::class, 'resolve'])->name('resolve');
        Route::post('/{maintenance}/cancel', [CoOwnerMaintenanceController::class, 'cancel'])->name('cancel');
    });

    // Routes baux
    Route::prefix('coproprietaire/leases')->name('co-owner.leases.')->group(function () {
        Route::get('/', [CoOwnerLeaseController::class, 'index'])->name('index');
        Route::get('/{lease}/documents', [CoOwnerLeaseDocumentController::class, 'index'])->name('documents.index');
        Route::get('/documents/{lease}/download', [CoOwnerLeaseDocumentController::class, 'downloadPdf'])->name('documents.download');
        Route::delete('/{lease}/documents/{document}', [CoOwnerLeaseDocumentController::class, 'destroy'])->name('documents.destroy');
        Route::get('/documents/{lease}/preview', [CoOwnerLeaseDocumentController::class, 'previewPdf'])->name('documents.preview');
    });

    // Route comptabilite
    Route::prefix('coproprietaire/comptabilite')->name('co-owner.accounting.')->group(function () {
        Route::get('/', [CoOwnerAccountingController::class, 'index'])->name('index');
        Route::get('/data', [CoOwnerAccountingController::class, 'getChartData'])->name('data');
        Route::get('/transactions', [CoOwnerAccountingController::class, 'getTransactions'])->name('transactions');
    });

    // Routes admin (protégées aussi)
    Route::prefix('admin')->name('admin.')->group(function () {
        Route::prefix('statistiques')->name('statistiques.')->group(function () {
            Route::get('/', [\App\Http\Controllers\Admin\StatistiqueController::class, 'index'])->name('index');
            Route::get('/export/{type}', [\App\Http\Controllers\Admin\StatistiqueController::class, 'export'])->name('export');
            Route::get('/api/user-growth', function () {
                $controller = new \App\Http\Controllers\Admin\StatistiqueController();
                return response()->json($controller->getChartData()['user_growth']);
            })->name('api.user-growth');
            Route::get('/api/revenue-trend', function () {
                $controller = new \App\Http\Controllers\Admin\StatistiqueController();
                return response()->json($controller->getChartData()['revenue_trend']);
            })->name('api.revenue-trend');
        });
    });

    // Routes logs admin
    Route::prefix('admin')->name('admin.')->group(function () {
        Route::prefix('logs')->name('logs.')->group(function () {
            Route::get('/', [\App\Http\Controllers\Admin\LogController::class, 'index'])->name('index');
            Route::get('/download/{filename}', [\App\Http\Controllers\Admin\LogController::class, 'download'])->name('download');
            Route::get('/clear/{filename}', [\App\Http\Controllers\Admin\LogController::class, 'clear'])->name('clear');
            Route::get('/clear-all', [\App\Http\Controllers\Admin\LogController::class, 'clearAll'])->name('clear-all');
            Route::get('/{filename}/{logId}', [\App\Http\Controllers\Admin\LogController::class, 'show'])->name('show');
            Route::get('/ajax', [\App\Http\Controllers\Admin\LogController::class, 'getLogsAjax'])->name('ajax');
            Route::get('/download-database', [\App\Http\Controllers\Admin\LogController::class, 'downloadDatabase'])->name('download-db');
        });
    });

    /*
    |--------------------------------------------------------------------------
    | ROUTES REACT - PROTÉGÉES AUSSI
    |--------------------------------------------------------------------------
    */
    Route::prefix('coproprietaire')->name('co-owner.react.')->group(function () {
        Route::get('/biens', function () {
            return view('react-app');
        });
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
        Route::get('/', function () {
            return view('react-app');
        });
    });

}); // Fin du groupe middleware auth.token

/*
|--------------------------------------------------------------------------
| Catch-all React - DOIT ÊTRE LA DERNIÈRE ROUTE
|--------------------------------------------------------------------------
*/
Route::get('/{any}', function () {
    return view('react-app');
})->where('any', '^(?!api).*$');
