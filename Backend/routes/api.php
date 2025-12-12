<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\TenantController;
use App\Http\Controllers\Api\PropertyController;
use App\Http\Controllers\Api\LeaseController;
use App\Http\Controllers\Api\Landlord\DashboardController;
use App\Http\Controllers\Api\Tenant\MyLeaseController;
use App\Http\Controllers\Api\Tenant\TicketController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\UploadController;
use App\Http\Controllers\Api\Finance\InvoiceController;
use App\Http\Controllers\Api\Finance\TransactionController;
use App\Http\Controllers\Api\Finance\PdfController;
use App\Http\Controllers\Api\PropertyConditionReportController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// ---------- Auth publics ----------
Route::post('auth/register/landlord', [AuthController::class, 'registerLandlord']);
Route::post('auth/login', [AuthController::class, 'login']);

// Le locataire définit son mot de passe après invitation
Route::post('auth/tenant/set-password', [AuthController::class, 'setPassword']);

// Le locataire clique sur le lien dans l’email -> acceptInvitation
Route::get('auth/tenant/accept-invitation/{invitationId}', [AuthController::class, 'acceptInvitation'])
    ->name('api.auth.accept-invitation');

Route::post('auth/tenant/complete-registration', [AuthController::class, 'completeTenantRegistration']);

// ---------- Routes protégées ----------
Route::middleware(['auth:sanctum'])->group(function () {

    // ---------- Finance (Bailleurs & Locataires) ----------
    Route::get('/invoices', [InvoiceController::class, 'index']);
    Route::get('/invoices/{id}', [InvoiceController::class, 'show']);
    Route::get('/invoices/{id}/pdf', [InvoiceController::class, 'downloadPdf']);

    // Génération PDF
    Route::prefix('pdf')->group(function () {
        Route::get('/quittance/{id}', [PdfController::class, 'generateQuittance']);
        Route::get('/avis-echeance/{id}', [PdfController::class, 'generateAvisEcheance']);
        Route::get('/contrat-bail/{uuid}', [PdfController::class, 'generateLeaseContract']);
        Route::get('/recap-bailleur', [PdfController::class, 'generateLandlordSummary']);
    });

    // ---------- BAILLEUR uniquement ----------
    Route::middleware('role:landlord')->group(function () {

        // Finance côté bailleur
        Route::post('/invoices/{id}/remind', [InvoiceController::class, 'sendReminder']);
        Route::post('/transactions', [TransactionController::class, 'store']);
        Route::get('/transactions', [TransactionController::class, 'index']);

        // Gestion des locataires (invitation, listing)
        Route::post('tenants/invite', [TenantController::class, 'invite']);
        Route::get('tenants', [TenantController::class, 'index']);

        // Dashboard bailleur
        Route::get('dashboard', [DashboardController::class, 'stats']);

        // Biens & baux
        Route::apiResource('properties', PropertyController::class)->except(['create', 'edit']);
        Route::apiResource('leases', LeaseController::class)->except(['update']);
        Route::post('leases/{uuid}/terminate', [LeaseController::class, 'terminate']);
        Route::get('/leases', [LeaseController::class, 'index']);
    });

    // ---------- ADMIN uniquement ----------
    Route::middleware('role:admin')->group(function () {
        // admin routes...
    });

    // ---------- LOCATAIRE ----------
    Route::middleware('role:tenant')->prefix('tenant')->group(function () {

        // Baux du locataire
        Route::get('my-leases', [MyLeaseController::class, 'index']);
        Route::get('my-leases/{uuid}', [MyLeaseController::class, 'show']);
        Route::get('my-leases/{uuid}/contract', [MyLeaseController::class, 'downloadContract']);
        Route::get('my-leases/{uuid}/invoices', [MyLeaseController::class, 'invoices']);

        // Tickets
        Route::apiResource('tickets', TicketController::class)->except(['update', 'destroy']);
        Route::post('tickets/{id}/close', [TicketController::class, 'close']);
    });

    // ---------- Fichiers / Upload (commun) ----------
    Route::post('/upload', [UploadController::class, 'store']);
    // Route::delete('/upload', [UploadController::class, 'destroy']);

    // ---------- Gestion des états des lieux ----------
    Route::prefix('properties/{property}/condition-reports')->group(function () {
        Route::get('/', [PropertyConditionReportController::class, 'index']);
        Route::post('/', [PropertyConditionReportController::class, 'store']);
        Route::get('/{report}', [PropertyConditionReportController::class, 'show']);
        Route::post('/{report}/photos', [PropertyConditionReportController::class, 'addPhotos']);
        Route::post('/{report}/sign', [PropertyConditionReportController::class, 'sign']);
        Route::delete('/{report}', [PropertyConditionReportController::class, 'destroy']);
    });

    // Pour les états des lieux liés à un bail
    Route::prefix('leases/{lease}')->group(function () {
        Route::get('/condition-reports', [PropertyConditionReportController::class, 'forLease']);
        Route::post('/condition-reports/entry', [PropertyConditionReportController::class, 'storeEntry']);
        Route::post('/condition-reports/exit', [PropertyConditionReportController::class, 'storeExit']);
    });

    // ---------- Profil utilisateur (commun) ----------
    // Route::get('/profile', [ProfileController::class, 'show']);
    // Route::put('/profile', [ProfileController::class, 'update']);
    // Route::put('/profile/password', [ProfileController::class, 'updatePassword']);
    // Route::post('/profile/avatar', [ProfileController::class, 'updateAvatar']);
});
