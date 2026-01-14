<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\TenantController;
use App\Http\Controllers\Api\CoOwnerController;
use App\Http\Controllers\Api\PropertyController;
use App\Http\Controllers\Api\LeaseController;
use App\Http\Controllers\Api\PropertyDelegationController;
use App\Http\Controllers\Api\Landlord\DashboardController;
use App\Http\Controllers\Api\Tenant\MyLeaseController;
use App\Http\Controllers\Api\Tenant\TicketController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\UploadController;
use App\Http\Controllers\Api\Finance\InvoiceController;
use App\Http\Controllers\Api\Finance\TransactionController;
use App\Http\Controllers\Api\Finance\PdfController;
use App\Http\Controllers\Api\Admin\FinanceController;
use App\Http\Controllers\Api\Admin\PaymentManagementController;
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
Route::post('auth/register/co-owner', [AuthController::class, 'registerCoOwner']);
Route::post('auth/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/tenant/invoices/{invoice}/receipt', [TenantQuittanceController::class, 'download']);
});

// Le locataire définit son mot de passe après invitation
Route::post('auth/tenant/set-password', [AuthController::class, 'setPassword']);

// Le locataire clique sur le lien dans l'email -> acceptInvitation
Route::get('auth/tenant/accept-invitation/{invitationId}', [AuthController::class, 'acceptInvitation'])
    ->name('api.auth.accept-invitation');

// Le copropriétaire définit son mot de passe après invitation
Route::post('auth/co-owner/set-password', [AuthController::class, 'setCoOwnerPassword']);

// Le copropriétaire clique sur le lien dans l'email -> acceptInvitation
Route::get('auth/co-owner/accept-invitation/{invitationId}', [AuthController::class, 'acceptCoOwnerInvitation'])
    ->name('api.auth.accept-co-owner-invitation');

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
    Route::get('/invoices/{id}/payment/verify', [\App\Http\Controllers\Api\Finance\PaymentVerificationController::class, 'verify']);
    Route::post('/invoices/{id}/pay-link', [\App\Http\Controllers\Api\PaymentLinkController::class, 'create']);



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
    
    // Délégations de propriétés
    Route::get('landlords/delegations', [PropertyDelegationController::class, 'listLandlordDelegations']);
    Route::post('properties/{property}/delegate', [PropertyDelegationController::class, 'delegate']);
    Route::post('properties/{property}/revoke-delegation', [PropertyDelegationController::class, 'revoke']);
    Route::put('delegations/{delegation}', [PropertyDelegationController::class, 'update']);
});

// Routes pour les copropriétaires
Route::middleware('role:co_owner')->group(function () {
    Route::get('co-owners/{coOwner}/delegations', [PropertyDelegationController::class, 'listCoOwnerDelegations']);
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

// ✅ CRUD PROPERTIES : landlord + agency (avec délégation)
Route::middleware(['auth:sanctum', 'property.access'])->group(function () {
    Route::get('/properties', [PropertyController::class, 'index']);
    Route::post('/properties', [PropertyController::class, 'store']);
    Route::get('/properties/{property}', [PropertyController::class, 'show']);
    Route::put('/properties/{property}', [PropertyController::class, 'update']);
    Route::delete('/properties/{property}', [PropertyController::class, 'destroy']);
});

    // ---------- BAILLEUR uniquement ----------
    Route::middleware('role:landlord')->group(function () {

        // Finance côté bailleur
        Route::post('/invoices', [InvoiceController::class, 'store']);
        Route::post('/invoices/{id}/remind', [InvoiceController::class, 'sendReminder']);
        Route::post('/transactions', [TransactionController::class, 'store']);
        Route::get('/transactions', [TransactionController::class, 'index']);

        // Gestion des locataires (invitation, listing)
        Route::post('tenants/invite', [TenantController::class, 'invite']);
        Route::get('tenants', [TenantController::class, 'index']);

        // Gestion des copropriétaires (invitation, listing)
        Route::post('co-owners/invite', [CoOwnerController::class, 'invite']);
        Route::get('co-owners', [CoOwnerController::class, 'index']);

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
    Route::middleware('role:admin')->prefix('admin')->group(function () {
        // Routes de gestion des finances
        Route::prefix('finance')->group(function () {
            Route::get('dashboard', [FinanceController::class, 'dashboard']);
            Route::get('transactions', [FinanceController::class, 'transactions']);
            Route::get('alerts', [FinanceController::class, 'alerts']);
            Route::post('reports', [FinanceController::class, 'reports']);
        });

        // Routes de gestion des paiements
        Route::prefix('payments')->group(function () {
            Route::get('/', [PaymentManagementController::class, 'index']);
            Route::get('{id}', [PaymentManagementController::class, 'show']);
            Route::post('{id}/confirm', [PaymentManagementController::class, 'confirm']);
            Route::post('{id}/reject', [PaymentManagementController::class, 'reject']);
            Route::post('{id}/refund', [PaymentManagementController::class, 'refund']);
            Route::get('{id}/receipt', [PaymentManagementController::class, 'downloadReceipt']);
            Route::get('statistics', [PaymentManagementController::class, 'statistics']);
        });
    });

    // Routes pour les copropriétaires
    Route::middleware('role:co_owner')->group(function () {
        Route::post('landlords/invite', [CoOwnerController::class, 'invite']);
        Route::get('my-invitations', [CoOwnerController::class, 'index']);
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

// Endpoint public pour initier paiement via token (pay-link)
Route::post('/pay-links/{token}/init', [\App\Http\Controllers\Api\PaymentLinkController::class, 'init']);
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
