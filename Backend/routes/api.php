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
use App\Http\Controllers\Api\NoticeController;
use App\Http\Controllers\Api\RentReceiptController;
use App\Http\Controllers\Api\Tenant\MaintenanceRequestController as TenantMaintenanceRequestController;
use App\Http\Controllers\Api\Tenant\TenantRentReceiptController as TenantRentReceiptController;
use App\Http\Controllers\Api\Landlord\MaintenanceRequestController as LandlordMaintenanceRequestController;
use App\Http\Controllers\Api\TenantPaymentController;
use App\Http\Controllers\Api\FedapayWebhookController;
use App\Http\Controllers\Api\TenantQuittanceController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// ---------- Auth publics ----------
Route::post('auth/register/landlord', [AuthController::class, 'registerLandlord']);
Route::post('auth/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/tenant/invoices/{invoice}/receipt', [TenantQuittanceController::class, 'download']);
});

// Le locataire définit son mot de passe après invitation
Route::post('auth/tenant/set-password', [AuthController::class, 'setPassword']);

// Le locataire clique sur le lien dans l’email -> acceptInvitation
Route::get('auth/tenant/accept-invitation/{invitationId}', [AuthController::class, 'acceptInvitation'])
    ->name('api.auth.accept-invitation');

Route::post('auth/tenant/complete-registration', [AuthController::class, 'completeTenantRegistration']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/tenant/invoices/{invoice}/pay', [TenantPaymentController::class, 'payInvoice']);
});

// webhook: pas d'auth
Route::post('/webhooks/fedapay', [FedapayWebhookController::class, 'handle']);



// ---------- Routes protégées ----------
Route::middleware(['auth:sanctum'])->group(function () {

    Route::apiResource('notices', NoticeController::class)->except(['edit','create']);
    Route::get('/quittance-independent/{id}', [\App\Http\Controllers\Api\Finance\PdfController::class, 'generateIndependentRentReceipt']);

    // ---------- Finance (Bailleurs & Locataires) ----------
    Route::get('/invoices', [InvoiceController::class, 'index']);
    Route::get('/invoices/{id}', [InvoiceController::class, 'show']);
    Route::get('/invoices/{id}/pdf', [InvoiceController::class, 'downloadPdf']);



    // Génération PDF
    Route::prefix('pdf')->group(function () {
        Route::get('/quittance/{id}', [PdfController::class, 'generateQuittance']);
        Route::get('/avis-echeance/{id}', [PdfController::class, 'generateAvisEcheance']);
        Route::get('/contrat-bail/{uuid}', [PdfController::class, 'generateLeaseContract']);
        
        // Génération du contrat de location
        Route::post('/generate-rental-contract', [\App\Http\Controllers\Api\Contract\RentalContractController::class, 'generatePdf']);
        Route::get('/recap-bailleur', [PdfController::class, 'generateLandlordSummary']);
    });

    // ...

Route::middleware('role:tenant')->prefix('tenant')->group(function () {

    // ...
    Route::get('incidents', [TenantMaintenanceRequestController::class, 'index']);
    Route::post('incidents', [TenantMaintenanceRequestController::class, 'store']);
    Route::get('incidents/{id}', [TenantMaintenanceRequestController::class, 'show']);
    Route::put('incidents/{id}', [TenantMaintenanceRequestController::class, 'update']);
    Route::delete('incidents/{id}', [TenantMaintenanceRequestController::class, 'destroy']);
    Route::post('incidents/upload', [TenantMaintenanceRequestController::class, 'upload']);
});

Route::middleware('role:landlord')->group(function () {
    // ...
    Route::get('incidents', [LandlordMaintenanceRequestController::class, 'index']);
    Route::get('incidents/{id}', [LandlordMaintenanceRequestController::class, 'show']);
    Route::put('incidents/{id}', [LandlordMaintenanceRequestController::class, 'update']);
});

// ✅ LISTE QUITTANCES : landlord + tenant
Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/rent-receipts', [\App\Http\Controllers\Api\RentReceiptController::class, 'index']);
    Route::get('/rent-receipts/{id}/pdf', [\App\Http\Controllers\Api\RentReceiptController::class, 'pdf']);
});

// ✅ CRUD QUITTANCES : landlord only
Route::middleware(['auth:sanctum', 'role:landlord'])->group(function () {
    Route::post('/rent-receipts', [\App\Http\Controllers\Api\RentReceiptController::class, 'store']);
    Route::put('/rent-receipts/{rentReceipt}', [\App\Http\Controllers\Api\RentReceiptController::class, 'update']);
    Route::delete('/rent-receipts/{rentReceipt}', [\App\Http\Controllers\Api\RentReceiptController::class, 'destroy']);
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
        Route::get('/tenant/leases', [TenantController::class, 'myLeases']);
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
