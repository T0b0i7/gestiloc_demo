<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\TenantController;
use App\Http\Controllers\Api\CoOwnerController;
use App\Http\Controllers\Api\CoOwnerMeController;
use App\Http\Controllers\Api\PropertyController;
use App\Http\Controllers\Api\LeaseController;
use App\Http\Controllers\Api\PropertyDelegationController;
use App\Http\Controllers\Api\Landlord\DashboardController;
use App\Http\Controllers\Api\Tenant\MyLeaseController;
use App\Http\Controllers\Api\Tenant\TicketController;
use App\Http\Controllers\Api\UploadController;
use App\Http\Controllers\Api\Finance\InvoiceController;
use App\Http\Controllers\Api\Finance\TransactionController;
use App\Http\Controllers\Api\Finance\PdfController;
use App\Http\Controllers\Api\PropertyConditionReportController;
use App\Http\Controllers\Api\NoticeController;
use App\Http\Controllers\Api\RentReceiptController;
use App\Http\Controllers\Api\Tenant\MaintenanceRequestController as TenantMaintenanceRequestController;
use App\Http\Controllers\Api\Landlord\MaintenanceRequestController as LandlordMaintenanceRequestController;
use App\Http\Controllers\Api\TenantPaymentController;
use App\Http\Controllers\Api\FedapayWebhookController;
use App\Http\Controllers\Api\TenantQuittanceController;
use App\Http\Controllers\Api\PaymentLinkController;
use App\Http\Controllers\Api\Landlord\FedapayController as LandlordFedapayController;
use App\Http\Controllers\Api\CoOwner\FedapayController as CoOwnerFedapayController;
use App\Http\Controllers\Api\FedapayReturnController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

/* =========================
|  PUBLIC AUTH
|========================= */
Route::post('auth/register/landlord', [AuthController::class, 'registerLandlord']);
Route::post('auth/register/co-owner', [AuthController::class, 'registerCoOwner']);
Route::post('auth/login', [AuthController::class, 'login']);

// Tenant invitation flow
Route::post('auth/tenant/set-password', [AuthController::class, 'setPassword']);
Route::get('auth/tenant/accept-invitation/{invitationId}', [AuthController::class, 'acceptInvitation'])
    ->name('api.auth.accept-invitation');
Route::post('auth/tenant/complete-registration', [AuthController::class, 'completeTenantRegistration']);

// Co-owner invitation flow
Route::post('auth/co-owner/set-password', [AuthController::class, 'setCoOwnerPassword']);
Route::get('auth/co-owner/accept-invitation/{invitationId}', [AuthController::class, 'acceptCoOwnerInvitation'])
    ->name('api.auth.accept-co-owner-invitation');

/* =========================
|  PUBLIC PAYMENT
|========================= */

// webhook: pas d'auth (public)
Route::post('/webhooks/fedapay', [FedapayWebhookController::class, 'handle']);
Route::get('/fedapay/return', [FedapayReturnController::class, 'handle']);

// ✅ pay-link public (le locataire n'est pas connecté)
Route::get('/pay-links/{token}', [\App\Http\Controllers\Api\PaymentLinkController::class, 'show']);
Route::post('/pay-links/{token}/init', [\App\Http\Controllers\Api\PaymentLinkController::class, 'init']);


/* =========================
|  PROTECTED (auth:sanctum)
|========================= */
Route::middleware(['auth:sanctum'])->group(function () {

    // Notices
    Route::apiResource('notices', NoticeController::class)->except(['edit','create']);

    // Quittance independent
    Route::get('/quittance-independent/{id}', [PdfController::class, 'generateIndependentRentReceipt']);

    // Download tenant receipt (protected)
    Route::get('/tenant/invoices/{invoice}/receipt', [TenantQuittanceController::class, 'download']);

    // Tenant direct pay (si tu l'utilises)
    Route::post('/tenant/invoices/{invoice}/pay', [TenantPaymentController::class, 'payInvoice']);

    /* ========= Finance (commun auth) ========= */
    Route::get('/invoices', [InvoiceController::class, 'index']);
    Route::get('/invoices/{id}', [InvoiceController::class, 'show']);
    Route::get('/invoices/{id}/pdf', [InvoiceController::class, 'downloadPdf']);
    Route::get('/invoices/{id}/payment/verify', [\App\Http\Controllers\Api\Finance\PaymentVerificationController::class, 'verify']);

    // pay-link creation (proprio/admin)
    Route::post('/invoices/{id}/pay-link', [PaymentLinkController::class, 'create']);

    /* ========= PDF ========= */
    Route::prefix('pdf')->group(function () {
        Route::get('/quittance/{id}', [PdfController::class, 'generateQuittance']);
        Route::get('/avis-echeance/{id}', [PdfController::class, 'generateAvisEcheance']);
        Route::get('/contrat-bail/{uuid}', [PdfController::class, 'generateLeaseContract']);

        Route::post('/generate-rental-contract', [\App\Http\Controllers\Api\Contract\RentalContractController::class, 'generatePdf']);
        Route::get('/recap-bailleur', [PdfController::class, 'generateLandlordSummary']);
    });

    /* ========= Rent receipts ========= */
    // LISTE quittances : landlord + tenant
    Route::get('/rent-receipts', [RentReceiptController::class, 'index']);
    Route::get('/rent-receipts/{id}/pdf', [RentReceiptController::class, 'pdf']);

    // CRUD quittances : landlord only
    Route::middleware(['role:landlord'])->group(function () {
        Route::post('/rent-receipts', [RentReceiptController::class, 'store']);
        Route::put('/rent-receipts/{rentReceipt}', [RentReceiptController::class, 'update']);
        Route::delete('/rent-receipts/{rentReceipt}', [RentReceiptController::class, 'destroy']);
    });

    /* ========= Upload ========= */
    Route::post('/upload', [UploadController::class, 'store']);

    /* ========= Condition Reports ========= */
    Route::prefix('properties/{property}/condition-reports')->group(function () {
        Route::get('/', [PropertyConditionReportController::class, 'index']);
        Route::post('/', [PropertyConditionReportController::class, 'store']);
        Route::get('/{report}', [PropertyConditionReportController::class, 'show']);
        Route::post('/{report}/photos', [PropertyConditionReportController::class, 'addPhotos']);
        Route::post('/{report}/sign', [PropertyConditionReportController::class, 'sign']);
        Route::delete('/{report}', [PropertyConditionReportController::class, 'destroy']);
    });

    Route::prefix('leases/{lease}')->group(function () {
        Route::get('/condition-reports', [PropertyConditionReportController::class, 'forLease']);
        Route::post('/condition-reports/entry', [PropertyConditionReportController::class, 'storeEntry']);
        Route::post('/condition-reports/exit', [PropertyConditionReportController::class, 'storeExit']);
    });

    /* =========================
    |  DÉLÉGATIONS DE PROPRIÉTÉ (COMMUN)
    |========================= */
    // Routes accessibles par landlords ET co-owners
    Route::prefix('property-delegations')->group(function () {
        Route::post('/', [PropertyDelegationController::class, 'delegate']);
        Route::delete('/{delegation}', [PropertyDelegationController::class, 'revoke']);
        Route::get('/co-owner/{coOwnerId}', [PropertyDelegationController::class, 'getCoOwnerDelegations']);
    });

    // Routes pour les co-owners (acceptation/rejet des délégations)
    Route::get('/co-owners/me/delegations', [CoOwnerMeController::class, 'getDelegations']);
    Route::post('/co-owners/me/delegations/{delegationId}/accept', [CoOwnerMeController::class, 'acceptDelegation']);
    Route::post('/co-owners/me/delegations/{delegationId}/reject', [CoOwnerMeController::class, 'rejectDelegation']);

    /* =========================
    |  TENANT ONLY
    |========================= */
    Route::middleware(['role:tenant'])->prefix('tenant')->group(function () {
        Route::get('my-leases', [MyLeaseController::class, 'index']);
        Route::get('my-leases/{uuid}', [MyLeaseController::class, 'show']);
        Route::get('my-leases/{uuid}/contract', [MyLeaseController::class, 'downloadContract']);
        Route::get('my-leases/{uuid}/invoices', [MyLeaseController::class, 'invoices']);

        Route::apiResource('tickets', TicketController::class)->except(['update', 'destroy']);
        Route::post('tickets/{id}/close', [TicketController::class, 'close']);

        Route::get('incidents', [TenantMaintenanceRequestController::class, 'index']);
        Route::post('incidents', [TenantMaintenanceRequestController::class, 'store']);
        Route::get('incidents/{id}', [TenantMaintenanceRequestController::class, 'show']);
        Route::put('incidents/{id}', [TenantMaintenanceRequestController::class, 'update']);
        Route::delete('incidents/{id}', [TenantMaintenanceRequestController::class, 'destroy']);
        Route::post('incidents/upload', [TenantMaintenanceRequestController::class, 'upload']);
       
        Route::get('invoices', [\App\Http\Controllers\Api\TenantPaymentController::class, 'index']);
    });

    /* =========================
    |  LANDLORD ONLY
    |========================= */
    Route::middleware(['role:landlord'])->group(function () {

        // Dashboard bailleur
        Route::get('dashboard', [DashboardController::class, 'stats']);

        // Tenants
        Route::post('tenants/invite', [TenantController::class, 'invite']);
        Route::get('tenants', [TenantController::class, 'index']);

        // Co-owners
        Route::post('co-owners/invite', [CoOwnerController::class, 'invite']);
        Route::get('co-owners', [CoOwnerController::class, 'index']);

        // Transactions
        Route::post('/transactions', [TransactionController::class, 'store']);
        Route::get('/transactions', [TransactionController::class, 'index']);

        // Invoices landlord
        Route::post('/invoices', [InvoiceController::class, 'store']);
        Route::post('/invoices/{id}/remind', [InvoiceController::class, 'sendReminder']);

        // Leases & properties
        Route::apiResource('properties', PropertyController::class)->except(['create', 'edit']);
        Route::apiResource('leases', LeaseController::class)->except(['update']);
        Route::post('leases/{uuid}/terminate', [LeaseController::class, 'terminate']);
        Route::get('/leases', [LeaseController::class, 'index']);

        // Incidents landlord
        Route::get('incidents', [LandlordMaintenanceRequestController::class, 'index']);
        Route::get('incidents/{id}', [LandlordMaintenanceRequestController::class, 'show']);
        Route::put('incidents/{id}', [LandlordMaintenanceRequestController::class, 'update']);

        // Delegations (anciennes routes - DOUBLONS, À SUPPRIMER SI VOUS UTILISEZ LES NOUVELLES)
        // Route::get('landlords/delegations', [PropertyDelegationController::class, 'listLandlordDelegations']);
        // Route::get('landlords/co-owners/{coOwner}/delegations', [PropertyDelegationController::class, 'listLandlordCoOwnerDelegations']);
        // Route::post('properties/{property}/delegate', [PropertyDelegationController::class, 'delegate']);
        // Route::post('properties/{property}/revoke-delegation', [PropertyDelegationController::class, 'revoke']);
        // Route::put('delegations/{delegation}', [PropertyDelegationController::class, 'update']);
        
        // Audit trails
        Route::get('delegations/{delegation}/audits', [\App\Http\Controllers\Api\DelegationAuditController::class, 'index']);
        Route::get('properties/{property}/delegation-audits', [\App\Http\Controllers\Api\DelegationAuditController::class, 'propertyAudits']);
        Route::get('landlords/delegation-audit-stats', [\App\Http\Controllers\Api\DelegationAuditController::class, 'stats']);

        // ✅ Fedapay settings (payout)
        Route::get('landlord/fedapay', [LandlordFedapayController::class, 'show']);
        Route::post('landlord/fedapay/subaccount', [LandlordFedapayController::class, 'createOrUpdate']);
    });

    /* =========================
    |  CO_OWNER ONLY
    |========================= */
    Route::middleware(['auth:sanctum'])->group(function () {
        // Routes pour le co-propriétaire connecté (co-owners/me/*)
        Route::get('co-owners/me/profile', [CoOwnerMeController::class, 'getProfile']);
        Route::put('co-owners/me/profile', [CoOwnerMeController::class, 'updateProfile']);
        Route::get('co-owners/me/delegated-properties', [CoOwnerMeController::class, 'getDelegatedProperties']);
        Route::get('co-owners/me/leases', [CoOwnerMeController::class, 'getLeases']);
        Route::get('co-owners/me/receipts', [CoOwnerMeController::class, 'getRentReceipts']);
        Route::get('co-owners/me/tenants', [CoOwnerMeController::class, 'getTenants']);
        Route::get('co-owners/me/notices', [CoOwnerMeController::class, 'getNotices']);
        /* ========= CO-OWNER: Gestion des photos ========= */
Route::post('/co-owners/me/properties/{propertyId}/photos', [CoOwnerMeController::class, 'uploadPropertyPhotos']);
        
        // Routes FedaPay (co-propriétaire)
        Route::get('co-owners/me/fedapay', [CoOwnerFedapayController::class, 'show']);
        Route::post('co-owners/me/fedapay/subaccount', [CoOwnerFedapayController::class, 'createOrUpdate']);
        
        // Routes pour les propriétés
        Route::put('co-owners/me/properties/{propertyId}', [CoOwnerMeController::class, 'updateProperty']);
        
        Route::middleware(['role:co_owner'])->group(function () {
            // Route::get('co-owners/{coOwner}/delegations', [PropertyDelegationController::class, 'listCoOwnerDelegations']);
            // Route::post('landlords/invite', [CoOwnerController::class, 'invite']);
            // Route::get('my-invitations', [CoOwnerController::class, 'index']);
        });
    });

    /* =========================
    |  ADMIN ONLY
    |========================= */
    Route::middleware(['role:admin'])->group(function () {
        // admin routes...
    });
});