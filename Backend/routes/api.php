<?php


use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\TenantController;
use App\Http\Controllers\Api\CoOwnerController;
use App\Http\Controllers\Api\CoOwnerMeController;
use App\Http\Controllers\Api\PropertyController;
use App\Http\Controllers\Api\LeaseController;
use App\Http\Controllers\Api\PropertyDelegationController;
use App\Http\Controllers\Api\Landlord\DashboardController as LandlordDashboardController;
use App\Http\Controllers\Api\Tenant\MyLeaseController;
use App\Http\Controllers\Api\Tenant\TicketController;
use App\Http\Controllers\Api\UploadController;
use App\Http\Controllers\Api\Finance\InvoiceController;
use App\Http\Controllers\Api\Finance\TransactionController;
use App\Http\Controllers\Api\Finance\PdfController;
use App\Http\Controllers\Api\Admin\DashboardController;
use App\Http\Controllers\Api\Admin\FinanceController;
use App\Http\Controllers\Api\Admin\UserController;
use App\Http\Controllers\Api\Admin\PaymentManagementController;
use App\Http\Controllers\Api\PropertyConditionReportController;
use App\Http\Controllers\Api\NoticeController;
use App\Http\Controllers\Api\RentReceiptController;
use App\Http\Controllers\Api\Tenant\MaintenanceRequestController as TenantMaintenanceRequestController;
use App\Http\Controllers\Api\Landlord\MaintenanceRequestController as LandlordMaintenanceRequestController;
use App\Http\Controllers\Api\Landlord\AccountingController;
use App\Http\Controllers\Api\Landlord\AccountingController as LandlordAccountingController;
use App\Http\Controllers\Api\Landlord\DocumentArchiveController;
use App\Http\Controllers\Api\Landlord\SettingsController;
use App\Http\Controllers\Api\Landlord\LandlordNotificationController;
use App\Http\Controllers\Api\TenantPaymentController;
use App\Http\Controllers\Api\FedapayWebhookController;
use App\Http\Controllers\Api\TenantQuittanceController;
use App\Http\Controllers\Api\PaymentLinkController;
use App\Http\Controllers\Api\Landlord\FedapayController as LandlordFedapayController;
use App\Http\Controllers\Api\CoOwner\FedapayController as CoOwnerFedapayController;
use App\Http\Controllers\Api\FedapayReturnController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

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

    // Tenant direct pay
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

    /* ========= Upload ========= */
    Route::post('/upload', [UploadController::class, 'store']);

    /* ========= Condition Reports ========= */
    // Route pour un bien spécifique
    Route::prefix('properties/{property}/condition-reports')->group(function () {
        Route::get('/', [PropertyConditionReportController::class, 'index']);
        Route::post('/', [PropertyConditionReportController::class, 'store']);
        Route::get('/{report}', [PropertyConditionReportController::class, 'show']);
        Route::post('/{report}/photos', [PropertyConditionReportController::class, 'addPhotos']);
        Route::post('/{report}/sign', [PropertyConditionReportController::class, 'sign']);
        Route::delete('/{report}', [PropertyConditionReportController::class, 'destroy']);
    });

    // Route globale pour tous les états des lieux du landlord
    Route::get('/condition-reports', [PropertyConditionReportController::class, 'index']);

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





           // NOUVELLE ROUTE POUR LES INFORMATIONS DU PROPRIÉTAIRE
        Route::get('landlord-info', [\App\Http\Controllers\Api\Tenant\MyLeaseController::class, 'getLandlordInfo']);

                  Route::get('dashboard', [\App\Http\Controllers\Api\Tenant\MyLeaseController::class, 'dashboardData']);

        Route::get('notifications', [\App\Http\Controllers\Api\Tenant\MyLeaseController::class, 'notifications']);
        Route::post('notifications/{id}/read', [\App\Http\Controllers\Api\Tenant\MyLeaseController::class, 'markNotificationAsRead']);
        Route::post('notifications/read-all', [\App\Http\Controllers\Api\Tenant\MyLeaseController::class, 'markAllNotificationsAsRead']);

        //Invitation proprietaire
           Route::post('/invite-landlord', [\App\Http\Controllers\Api\Tenant\TenantInvitationController::class, 'inviteLandlord']);

                 // Routes pour les tâches
        Route::apiResource('tasks', \App\Http\Controllers\Api\Tenant\TaskController::class);

              // Routes pour les notes
        Route::get('/notes', [\App\Http\Controllers\Api\Tenant\NoteController::class, 'index']);
        Route::get('/notes/{id}', [\App\Http\Controllers\Api\Tenant\NoteController::class, 'show']);
        Route::post('/notes', [\App\Http\Controllers\Api\Tenant\NoteController::class, 'store']);
        Route::put('/notes/{id}', [\App\Http\Controllers\Api\Tenant\NoteController::class, 'update']);
        Route::delete('/notes/{id}', [\App\Http\Controllers\Api\Tenant\NoteController::class, 'destroy']);

        // Routes pour les fichiers
        Route::post('/notes/{id}/files', [\App\Http\Controllers\Api\Tenant\NoteController::class, 'addFiles']);
        Route::delete('/notes/{id}/files', [\App\Http\Controllers\Api\Tenant\NoteController::class, 'deleteFile']);

        // Route pour les contacts partageables
        Route::get('/shareable-contacts', [\App\Http\Controllers\Api\Tenant\NoteController::class, 'getShareableContacts']);


        // Routes pour les paramètres
        Route::get('/settings', [\App\Http\Controllers\Api\Tenant\SettingsController::class, 'index']);
        Route::put('/settings/password', [\App\Http\Controllers\Api\Tenant\SettingsController::class, 'updatePassword']);
        Route::put('/settings/preferences', [\App\Http\Controllers\Api\Tenant\SettingsController::class, 'updatePreferences']);
        Route::put('/settings/notifications', [\App\Http\Controllers\Api\Tenant\SettingsController::class, 'updateNotifications']);
        Route::put('/settings/privacy', [\App\Http\Controllers\Api\Tenant\SettingsController::class, 'updatePrivacy']);
        Route::post('/settings/2fa/enable', [\App\Http\Controllers\Api\Tenant\SettingsController::class, 'enableTwoFactor']);
        Route::post('/settings/2fa/disable', [\App\Http\Controllers\Api\Tenant\SettingsController::class, 'disableTwoFactor']);
        Route::get('/settings/download-data', [\App\Http\Controllers\Api\Tenant\SettingsController::class, 'downloadData']);
        Route::delete('/settings/account', [\App\Http\Controllers\Api\Tenant\SettingsController::class, 'deleteAccount']);

        // Routes pour le profil du locataire
        Route::prefix('profile')->group(function () {
            Route::get('/', [\App\Http\Controllers\Api\Tenant\ProfileController::class, 'show']);
            Route::put('/personal', [\App\Http\Controllers\Api\Tenant\ProfileController::class, 'updatePersonal']);
            Route::put('/address', [\App\Http\Controllers\Api\Tenant\ProfileController::class, 'updateAddress']);
            Route::put('/professional', [\App\Http\Controllers\Api\Tenant\ProfileController::class, 'updateProfessional']);
            Route::put('/emergency', [\App\Http\Controllers\Api\Tenant\ProfileController::class, 'updateEmergency']);
            Route::put('/guarantor', [\App\Http\Controllers\Api\Tenant\ProfileController::class, 'updateGuarantor']);
        });

        // Routes pour les documents
        Route::prefix('documents')->group(function () {
            Route::get('/', [\App\Http\Controllers\Api\Tenant\DocumentController::class, 'index']);
            Route::get('/templates', [\App\Http\Controllers\Api\Tenant\DocumentController::class, 'templates']);
            Route::get('/shareable-contacts', [\App\Http\Controllers\Api\Tenant\DocumentController::class, 'getShareableContacts']);
            Route::get('/filters/options', [\App\Http\Controllers\Api\Tenant\DocumentController::class, 'getFilterOptions']);
            Route::post('/', [\App\Http\Controllers\Api\Tenant\DocumentController::class, 'store']);
            Route::get('/{id}', [\App\Http\Controllers\Api\Tenant\DocumentController::class, 'show']);
            Route::put('/{id}', [\App\Http\Controllers\Api\Tenant\DocumentController::class, 'update']);
            Route::delete('/{id}', [\App\Http\Controllers\Api\Tenant\DocumentController::class, 'destroy']);
            Route::post('/{id}/archive', [\App\Http\Controllers\Api\Tenant\DocumentController::class, 'archive']);
            Route::post('/{id}/restore', [\App\Http\Controllers\Api\Tenant\DocumentController::class, 'restore']);
            Route::get('/{id}/download', [\App\Http\Controllers\Api\Tenant\DocumentController::class, 'download']);
            Route::get('/{id}/pdf', [\App\Http\Controllers\Api\Tenant\DocumentController::class, 'downloadPdf']);
        });

        // Routes pour le dossier
        Route::prefix('dossier')->group(function () {
            Route::get('/', [\App\Http\Controllers\Api\Tenant\DossierController::class, 'show']);
            Route::put('/', [\App\Http\Controllers\Api\Tenant\DossierController::class, 'update']);
            Route::get('/shareable-contacts', [\App\Http\Controllers\Api\Tenant\DossierController::class, 'getShareableContacts']);
            Route::post('/publish', [\App\Http\Controllers\Api\Tenant\DossierController::class, 'publish']);
            Route::get('/preview', [\App\Http\Controllers\Api\Tenant\DossierController::class, 'preview']);
            Route::get('/download', [\App\Http\Controllers\Api\Tenant\DossierController::class, 'download']);
            Route::get('/public/{shareUrl}', [\App\Http\Controllers\Api\Tenant\DossierController::class, 'publicShow']);
        });

        // Routes pour les paiements
        Route::prefix('payments')->group(function () {
            Route::get('/dashboard', [\App\Http\Controllers\Api\Tenant\TenantPaymentController::class, 'dashboard']);
            Route::get('/invoices', [\App\Http\Controllers\Api\Tenant\TenantPaymentController::class, 'invoices']);
            Route::get('/history', [\App\Http\Controllers\Api\Tenant\TenantPaymentController::class, 'history']);
            Route::get('/properties', [\App\Http\Controllers\Api\Tenant\TenantPaymentController::class, 'properties']);
            Route::get('/filters/options', [\App\Http\Controllers\Api\Tenant\TenantPaymentController::class, 'getFilterOptions']);
            Route::get('/stats/monthly', [\App\Http\Controllers\Api\Tenant\TenantPaymentController::class, 'monthlyStats']);
            Route::get('/check-status/{paymentId}', [\App\Http\Controllers\Api\Tenant\TenantPaymentController::class, 'checkStatus']);
            Route::post('/pay/{leaseId}', [\App\Http\Controllers\Api\Tenant\TenantPaymentController::class, 'payMonthly']);
            Route::get('/receipt/{paymentId}', [\App\Http\Controllers\Api\Tenant\TenantPaymentController::class, 'downloadReceipt']);
        });

        // Route pour payer une facture existante
        Route::post('/invoices/{invoice}/pay', [\App\Http\Controllers\Api\Tenant\TenantPaymentController::class, 'payInvoice']);
    });

    /* =========================
    |  LANDLORD ONLY
    |========================= */
    Route::middleware(['role:landlord'])->group(function () {

        // Dashboard bailleur
        Route::get('dashboard', [LandlordDashboardController::class, 'stats']);

        // Tenants
        Route::post('tenants/invite', [TenantController::class, 'invite']);
        Route::get('tenants', [TenantController::class, 'index']);

        // ✅ NOUVELLES ROUTES - Gestion des biens des locataires
        Route::post('tenants/{tenant}/assign-property', [TenantController::class, 'assignProperty']);
        Route::delete('tenants/{tenant}/properties/{property}', [TenantController::class, 'unassignProperty']);
        Route::get('tenants/{tenant}/properties', [TenantController::class, 'getTenantProperties']);
        Route::get('properties/{property}/history', [TenantController::class, 'getPropertyHistory']);
        Route::get('occupation-stats', [TenantController::class, 'getOccupationStats']);

        // ✅ NOUVELLES ROUTES - Documents des locataires
        Route::post('tenants/{tenant}/documents', [TenantController::class, 'uploadDocuments']);
        Route::get('tenants/{tenant}/documents', [TenantController::class, 'listDocuments']);

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
        Route::post('incidents', [LandlordMaintenanceRequestController::class, 'store']);
        Route::get('incidents/{id}', [LandlordMaintenanceRequestController::class, 'show']);
        Route::put('incidents/{id}', [LandlordMaintenanceRequestController::class, 'update']);

        // Audit trails
        Route::get('delegations/{delegation}/audits', [\App\Http\Controllers\Api\DelegationAuditController::class, 'index']);
        Route::get('properties/{property}/delegation-audits', [\App\Http\Controllers\Api\DelegationAuditController::class, 'propertyAudits']);
        Route::get('landlords/delegation-audit-stats', [\App\Http\Controllers\Api\DelegationAuditController::class, 'stats']);

        // ✅ Fedapay settings (payout)
        Route::get('landlord/fedapay', [LandlordFedapayController::class, 'show']);
        Route::post('landlord/fedapay/subaccount', [LandlordFedapayController::class, 'createOrUpdate']);

        // ✅ Comptabilité - Stats et transactions
        Route::get('accounting/stats', [AccountingController::class, 'stats']);
        Route::get('accounting/transactions', [AccountingController::class, 'transactions']);
        Route::post('accounting/transactions', [AccountingController::class, 'store']);

        // ✅ Archives de documents
        Route::get('archives', [DocumentArchiveController::class, 'index']);
        Route::get('archives/stats', [DocumentArchiveController::class, 'stats']);

        // ✅ Notifications du landlord
        Route::get('notifications', [LandlordNotificationController::class, 'index']);
        Route::post('notifications/{id}/read', [LandlordNotificationController::class, 'markAsRead']);
        Route::post('notifications/read-all', [LandlordNotificationController::class, 'markAllAsRead']);

        // ✅ Paramètres du landlord
        Route::get('settings', [SettingsController::class, 'index']);
        Route::put('settings/profile', [SettingsController::class, 'updateProfile']);
        Route::put('settings/password', [SettingsController::class, 'updatePassword']);
        Route::put('settings/preferences', [SettingsController::class, 'updatePreferences']);
        Route::put('settings/notifications', [SettingsController::class, 'updateNotifications']);
        Route::put('settings/privacy', [SettingsController::class, 'updatePrivacy']);
        Route::post('settings/2fa/enable', [SettingsController::class, 'enableTwoFactor']);
        Route::post('settings/2fa/disable', [SettingsController::class, 'disableTwoFactor']);
        Route::get('settings/download-data', [SettingsController::class, 'downloadData']);
        Route::delete('settings/account', [SettingsController::class, 'deleteAccount']);
    });

    /* =========================
    |  CO_OWNER ONLY
    |========================= */
    Route::middleware(['auth:sanctum'])->prefix('co-owners/me')->group(function () {
        // Profile
        Route::get('profile', [CoOwnerMeController::class, 'getProfile']);
        Route::put('profile', [CoOwnerMeController::class, 'updateProfile']);

        // Properties management
        Route::get('delegated-properties', [CoOwnerMeController::class, 'getDelegatedProperties']);
        Route::put('properties/{propertyId}', [CoOwnerMeController::class, 'updateProperty']);
        Route::post('properties/{propertyId}/photos', [CoOwnerMeController::class, 'uploadPropertyPhotos']);

        // Property audit history
        Route::get('properties/{propertyId}/audit-history', [CoOwnerMeController::class, 'getPropertyAuditHistory']);

        // Leases and receipts
        Route::get('leases', [CoOwnerMeController::class, 'getLeases']);
        Route::get('receipts', [CoOwnerMeController::class, 'getRentReceipts']);

        // Tenants and notices
        Route::get('tenants', [CoOwnerMeController::class, 'getTenants']);
        Route::get('notices', [CoOwnerMeController::class, 'getNotices']);

        // Delegations
        Route::get('delegations', [CoOwnerMeController::class, 'getDelegations']);
        Route::post('delegations/{delegationId}/accept', [CoOwnerMeController::class, 'acceptDelegation']);
        Route::post('delegations/{delegationId}/reject', [CoOwnerMeController::class, 'rejectDelegation']);

        // Fedapay
        Route::get('fedapay', [CoOwnerFedapayController::class, 'show']);
        Route::post('fedapay/subaccount', [CoOwnerFedapayController::class, 'createOrUpdate']);
    });

    /* =========================
    |  ROUTES API POUR RÉACT
    |========================= */
    // Routes pour les biens délégués
    Route::get('/co-owners/me/delegated-properties', [CoOwnerMeController::class, 'getDelegatedProperties']);

    // Routes pour les délégations
    Route::get('/co-owners/me/delegations', [CoOwnerMeController::class, 'getDelegations']);
    Route::post('/co-owners/me/delegations/{delegationId}/accept', [CoOwnerMeController::class, 'acceptDelegation']);
    Route::post('/co-owners/me/delegations/{delegationId}/reject', [CoOwnerMeController::class, 'rejectDelegation']);

    // Routes pour les locataires (co-owner)
    Route::get('/co-owners/me/tenants', [CoOwnerMeController::class, 'getTenants']);

    // Routes pour les baux (co-owner)
    Route::get('/co-owners/me/leases', [CoOwnerMeController::class, 'getLeases']);

    // Routes pour les quittances (co-owner)
    Route::get('/co-owners/me/receipts', [CoOwnerMeController::class, 'getRentReceipts']);

    // Routes pour les notifications (co-owner)
    Route::get('/co-owners/me/notices', [CoOwnerMeController::class, 'getNotices']);

    /* =========================
    |  ADMIN ONLY
    |========================= */
    Route::middleware(['role:admin'])->prefix('admin')->group(function () {
        // Dashboard admin


        /* ======================
         * GESTION UTILISATEURS
         * ====================== */
        Route::get('/users', [UserController::class, 'index'])
            ->name('users.index');

        Route::get('/users/{user}', [UserController::class, 'show'])
            ->name('users.show');

        /* ======================
         * ACTIONS ADMIN
         * ====================== */
        Route::post('/users/{user}/suspend', [UserController::class, 'suspend'])
            ->name('users.suspend');

        Route::post('/users/{user}/reactivate', [UserController::class, 'reactivate'])
            ->name('users.reactivate');

        Route::post('/users/{user}/deactivate', [UserController::class, 'deactivate'])
            ->name('users.deactivate');

        /* ======================
         * IMPERSONATION
         * ====================== */
        Route::post('/users/{user}/impersonate', [UserController::class, 'impersonate'])
            ->name('users.impersonate');

        /* ======================
         * SUPPRESSION
         * ====================== */
        Route::delete('/users/{user}', [UserController::class, 'destroy'])
            ->name('users.destroy');

        /* ======================
         * STATS
         * ====================== */
        Route::get('/users-stats/online', [UserController::class, 'getOnlineStats'])
            ->name('users.stats.online');

        // Dashboard admin
        Route::get('dashboard/stats', [DashboardController::class, 'stats'])
            ->name('admin.dashboard.stats');

        // admin routes...
    });
});
