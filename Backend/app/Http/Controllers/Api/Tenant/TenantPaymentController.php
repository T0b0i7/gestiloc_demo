<?php
// app/Http/Controllers/Api/Tenant/TenantPaymentController.php

namespace App\Http\Controllers\Api\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\Payment;
use App\Models\Lease;
use App\Models\Property;
use App\Models\Tenant;
use App\Models\User;
use App\Models\PropertyDelegation;
use App\Mail\PaymentNotificationMail;
use App\Services\FedapayPayments;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Carbon\Carbon;

class TenantPaymentController extends Controller
{
    private FedapayPayments $fedapay;

    public function __construct(FedapayPayments $fedapay)
    {
        $this->fedapay = $fedapay;
    }

    private function getTenant()
    {
        $user = Auth::user();
        if (!$user || !$user->hasRole('tenant')) return null;
        return $user->tenant;
    }
private function formatPhoneForFedapay(?string $phone): ?string
{
    if (empty($phone)) return null;
    $clean = preg_replace('/[^0-9]/', '', $phone);
    if (empty($clean)) return null;

    // Déjà complet avec indicatif : 22901XXXXXXXX (12 chiffres)
    if (strlen($clean) === 12 && substr($clean, 0, 3) === '229') {
        return '+' . $clean;
    }

    // Avec indicatif sans + : 229 + 01XXXXXXXX (11 chiffres)
    if (strlen($clean) === 11 && substr($clean, 0, 3) === '229') {
        return '+' . $clean;
    }

    // Numéro local béninois 10 chiffres : 01XXXXXXXX
    if (strlen($clean) === 10 && substr($clean, 0, 2) === '01') {
        return '+229' . $clean;
    }

    // Ancien format 8 chiffres (avant migration)
    if (strlen($clean) === 8) {
        return '+22901' . $clean; // Ajouter 01 pour le nouveau format
    }

    return null; // Rejeter tout le reste
}

    /**
     * CORRECTION CRITIQUE :
     * Valide et formate le téléphone AVANT toute écriture en base.
     */
    private function resolveAndValidatePhone(Request $request, User $user): array
    {
        $phoneInput = $request->input('phone_number') ?? $user->phone ?? null;

        if (empty($phoneInput)) {
            return ['success' => false, 'response' => response()->json([
                'success' => false,
                'message' => 'Numéro de téléphone requis. Veuillez saisir votre numéro Mobile Money.',
            ], 422)];
        }

        $formatted = $this->formatPhoneForFedapay($phoneInput);

        if (empty($formatted)) {
            return ['success' => false, 'response' => response()->json([
                'success' => false,
                'message' => 'Numéro de téléphone invalide. Format attendu : +229 XX XX XX XX',
            ], 422)];
        }

        $digits = preg_replace('/[^0-9]/', '', $formatted);
        if (strlen($digits) < 10) {
            return ['success' => false, 'response' => response()->json([
                'success' => false,
                'message' => 'Numéro de téléphone trop court. Format attendu : +229 XX XX XX XX',
            ], 422)];
        }

        return ['success' => true, 'phone' => $formatted];
    }

    private function checkExistingPaymentForMonth(int $leaseId, int $year, int $month): ?array
    {
        $approved = Payment::where('lease_id', $leaseId)->where('status', 'approved')
            ->whereYear('paid_at', $year)->whereMonth('paid_at', $month)->first();
        if ($approved) return ['exists' => true, 'type' => 'approved', 'payment' => $approved, 'message' => 'Ce mois a déjà été payé'];

        $pending = Payment::where('lease_id', $leaseId)->whereIn('status', ['initiated', 'pending'])
            ->whereYear('created_at', $year)->whereMonth('created_at', $month)->first();
        if ($pending) return ['exists' => true, 'type' => 'pending', 'payment' => $pending, 'message' => 'Un paiement est déjà en cours pour ce mois'];

        return null;
    }

    private function getMonthsSinceLeaseStart(Lease $lease): array
    {
        $start   = Carbon::parse($lease->start_date)->startOfMonth();
        $end     = Carbon::now()->endOfMonth();
        $months  = [];
        $current = $start->copy();
        while ($current->lessThanOrEqualTo($end)) {
            $months[] = $current->copy();
            $current->addMonth();
        }
        return $months;
    }

    /* ===== GET /tenant/payments/dashboard ===== */
    public function dashboard(Request $request)
    {
        try {
            $tenant = $this->getTenant();
            if (!$tenant) return response()->json(['success' => false, 'message' => 'Accès réservé aux locataires'], 403);

            $leases      = Lease::where('tenant_id', $tenant->id)->where('status', 'active')->with(['property'])->get();
            $invoices    = Invoice::whereHas('lease', fn($q) => $q->where('tenant_id', $tenant->id))->with(['lease.property'])->orderBy('period_start', 'desc')->get();
            $allPayments = Payment::where('tenant_id', $tenant->id)->with(['lease.property', 'invoice'])->orderBy('created_at', 'desc')->get();
            $approved    = $allPayments->where('status', 'approved');

            $stats = [
                'total_paid'          => $approved->sum('amount_total'),
                'total_pending'       => $allPayments->whereIn('status', ['initiated', 'pending'])->sum('amount_total'),
                'total_overdue'       => 0,
                'payments_count'      => $approved->count(),
                'invoices_count'      => $invoices->count(),
                'active_leases_count' => $leases->count(),
            ];

            $chartData = [];
            $hasData   = false;
            for ($i = 11; $i >= 0; $i--) {
                $month    = now()->subMonths($i);
                $monthKey = $month->format('Y-m');
                $total    = 0;
                $count    = 0;
                foreach ($approved as $p) {
                    if ($p->paid_at && Carbon::parse($p->paid_at)->format('Y-m') === $monthKey) {
                        $total += $p->amount_total;
                        $count++;
                    }
                }
                if ($total > 0) $hasData = true;
                $chartData[] = ['month' => $month->format('M Y'), 'amount' => $total, 'count' => $count, 'formatted_amount' => number_format($total, 0, ',', ' ') . ' FCFA'];
            }

            $propertiesData = [];
            $totalOverdue   = 0;
            $now            = now();

            foreach ($leases as $lease) {
                $currentMonthPaid = Payment::where('lease_id', $lease->id)->where('status', 'approved')
                    ->whereYear('paid_at', $now->year)->whereMonth('paid_at', $now->month)->exists();

                $pendingPayment = Payment::where('lease_id', $lease->id)->whereIn('status', ['initiated', 'pending'])
                    ->whereYear('created_at', $now->year)->whereMonth('created_at', $now->month)->first();

                $unpaidMonths = [];
                $totalUnpaid  = 0;
                foreach ($this->getMonthsSinceLeaseStart($lease) as $md) {
                    if ($md->format('Y-m') === $now->format('Y-m')) continue;
                    $paid = Payment::where('lease_id', $lease->id)->where('status', 'approved')
                        ->whereYear('paid_at', $md->year)->whereMonth('paid_at', $md->month)->exists();
                    if (!$paid) {
                        $unpaidMonths[] = $md->format('F Y');
                        $totalUnpaid += $lease->rent_amount + ($lease->charges_amount ?? 0);
                    }
                }
                $totalOverdue += $totalUnpaid;

                $recentPayments = Payment::where('lease_id', $lease->id)->orderBy('created_at', 'desc')->limit(5)->get()
                    ->map(fn($p) => [
                        'id'           => $p->id,
                        'amount_total' => $p->amount_total,
                        'status'       => $p->status,
                        'paid_at'      => $p->paid_at,
                        'created_at'   => $p->created_at,
                        'display_date' => $p->paid_at ?? $p->created_at,
                        'checkout_url' => $p->checkout_url,
                    ]);

                $propertiesData[] = [
                    'lease'                  => $lease,
                    'property'               => $lease->property,
                    'current_month_paid'     => $currentMonthPaid,
                    'pending_payment'        => $pendingPayment,
                    'has_pending_payment'    => !is_null($pendingPayment),
                    'pending_payment_id'     => $pendingPayment?->id,
                    'pending_payment_status' => $pendingPayment?->status,
                    'pending_checkout_url'   => $pendingPayment?->checkout_url,
                    'unpaid_count'           => count($unpaidMonths),
                    'unpaid_months'          => $unpaidMonths,
                    'total_unpaid'           => $totalUnpaid,
                    'recent_payments'        => $recentPayments,
                    'rent_amount'            => $lease->rent_amount,
                    'charges'                => $lease->charges_amount ?? 0,
                    'total_monthly'          => $lease->rent_amount + ($lease->charges_amount ?? 0),
                ];
            }

            $stats['total_overdue'] = $totalOverdue;

            return response()->json(['success' => true, 'data' => [
                'leases'         => $leases,
                'invoices'       => $invoices,
                'payments'       => $allPayments,
                'stats'          => $stats,
                'chart_data'     => $chartData,
                'has_chart_data' => $hasData,
                'properties'     => $propertiesData,
            ]]);

        } catch (\Exception $e) {
            Log::error('Erreur dashboard: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Erreur lors du chargement'], 500);
        }
    }

    /* ===== GET /tenant/payments/invoices ===== */
    public function invoices(Request $request)
    {
        try {
            $tenant = $this->getTenant();
            if (!$tenant) return response()->json(['success' => false, 'message' => 'Accès réservé'], 403);

            $query = Invoice::whereHas('lease', fn($q) => $q->where('tenant_id', $tenant->id))->with(['lease.property']);
            if ($request->property_id) $query->whereHas('lease', fn($q) => $q->where('property_id', $request->property_id));
            if ($request->status === 'paid')    $query->where('status', 'paid');
            if ($request->status === 'pending') $query->where('status', 'pending');
            if ($request->month) $query->whereMonth('period_start', $request->month);
            if ($request->year)  $query->whereYear('period_start', $request->year);
            if ($request->search) {
                $s = $request->search;
                $query->where(fn($q) => $q->where('invoice_number', 'like', "%{$s}%")
                    ->orWhereHas('lease.property', fn($sq) => $sq->where('name', 'like', "%{$s}%")));
            }
            return response()->json(['success' => true, 'data' => $query->orderBy('period_start', 'desc')->paginate($request->input('per_page', 20))]);
        } catch (\Exception $e) {
            Log::error('Erreur factures: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Erreur'], 500);
        }
    }

    /* ===== GET /tenant/payments/history ===== */
    public function history(Request $request)
    {
        try {
            $tenant = $this->getTenant();
            if (!$tenant) return response()->json(['success' => false, 'message' => 'Accès réservé'], 403);

            $query = Payment::where('tenant_id', $tenant->id)->with(['lease.property', 'invoice']);
            if ($request->property_id) $query->whereHas('lease', fn($q) => $q->where('property_id', $request->property_id));
            if ($request->status) $query->where('status', $request->status);
            if ($request->month)  $query->where(fn($q) => $q->whereMonth('paid_at', $request->month)->orWhereMonth('created_at', $request->month));
            if ($request->year)   $query->where(fn($q) => $q->whereYear('paid_at', $request->year)->orWhereYear('created_at', $request->year));
            return response()->json(['success' => true, 'data' => $query->orderBy('created_at', 'desc')->paginate($request->input('per_page', 20))]);
        } catch (\Exception $e) {
            Log::error('Erreur historique: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Erreur'], 500);
        }
    }

    /* ===== POST /tenant/payments/pay/{leaseId} ===== */
    public function payMonthly(Request $request, $leaseId)
    {
        try {
            $tenant = $this->getTenant();
            if (!$tenant) return response()->json(['success' => false, 'message' => 'Accès réservé'], 403);

            $user = Auth::user();

            // ══ ÉTAPE 1 : Valider téléphone AVANT toute écriture en base ══
            $phoneResult = $this->resolveAndValidatePhone($request, $user);
            if (!$phoneResult['success']) return $phoneResult['response'];
            $formattedPhone = $phoneResult['phone'];

            // ══ ÉTAPE 2 : Récupérer le bail ══
            $lease = Lease::where('id', $leaseId)->where('tenant_id', $tenant->id)->where('status', 'active')
                ->with(['property.landlord.user', 'property'])->first();
            if (!$lease) return response()->json(['success' => false, 'message' => 'Bail non trouvé'], 404);

            $now         = now();
            $month       = $request->input('month', $now->month);
            $year        = $request->input('year', $now->year);
            $paymentDate = Carbon::create($year, $month, 1)->startOfMonth();
            $leaseStart  = Carbon::parse($lease->start_date)->startOfMonth();

            if ($paymentDate->lessThan($leaseStart)) {
                return response()->json(['success' => false, 'message' => 'Date antérieure au début du bail'], 422);
            }

            // ══ ÉTAPE 3 : Vérifier paiement existant ══
            $existing = $this->checkExistingPaymentForMonth($lease->id, $year, $month);
            if ($existing) {
                if ($existing['type'] === 'pending' && $existing['payment']->checkout_url) {
                    return response()->json([
                        'success'          => true,
                        'message'          => 'Paiement déjà en cours',
                        'payment_id'       => $existing['payment']->id,
                        'checkout_url'     => $existing['payment']->checkout_url,
                        'existing_payment' => true,
                    ]);
                }
                return response()->json(['success' => false, 'message' => $existing['message']], 422);
            }

            // ══ ÉTAPE 4 : Vérifier facture existante ══
            $existingInvoice = Invoice::where('lease_id', $lease->id)->whereYear('period_start', $year)->whereMonth('period_start', $month)->first();
            if ($existingInvoice) return response()->json(['success' => false, 'message' => 'Une facture existe déjà pour cette période'], 422);

            $landlordUserId = $lease->property->landlord?->user_id ?? $lease->property->landlord_id;
            if (!$landlordUserId) return response()->json(['success' => false, 'message' => 'Propriétaire non trouvé'], 422);
            if (empty($user->email)) return response()->json(['success' => false, 'message' => 'Email locataire manquant'], 422);

            $amount = $lease->rent_amount + ($lease->charges_amount ?? 0);

            // ══ ÉTAPE 5 : Tout valide → créer facture + paiement ══
            $invoiceCount = Invoice::whereYear('created_at', date('Y'))->count() + 1;
            $invoice = Invoice::create([
                'lease_id'       => $lease->id,
                'invoice_number' => 'FACT-' . date('Y') . '-' . str_pad($invoiceCount, 4, '0', STR_PAD_LEFT),
                'type'           => 'rent',
                'due_date'       => $paymentDate->copy()->addDays(30),
                'period_start'   => $paymentDate->copy()->startOfMonth(),
                'period_end'     => $paymentDate->copy()->endOfMonth(),
                'amount_total'   => (float) $amount,
                'amount_paid'    => 0,
                'status'         => 'pending',
                'pdf_path'       => null,
                'sent_at'        => null,
            ]);

            $payment = Payment::create([
                'invoice_id'       => $invoice->id,
                'lease_id'         => $lease->id,
                'tenant_id'        => $tenant->id,
                'landlord_user_id' => (int) $landlordUserId,
                'provider'         => 'fedapay',
                'status'           => 'initiated',
                'currency'         => config('fedapay.currency', 'XOF'),
                'amount_total'     => (float) $amount,
            ]);

            // ══ ÉTAPE 6 : Appel FedaPay ══
            $customer = [
                'firstname' => $tenant->first_name,
                'lastname'  => $tenant->last_name,
                'email'     => $user->email,
                'phone'     => ['number' => $formattedPhone, 'country' => 'BJ'],
            ];

            try {
                $checkout = $this->fedapay->createCheckout($payment, $invoice, $lease, $customer);
            } catch (\Exception $e) {
                // FedaPay refusé → rollback propre, rien ne reste en base
                $payment->delete();
                $invoice->delete();
                Log::error('Erreur FEDAPAY payMonthly: ' . $e->getMessage());
                return response()->json(['success' => false, 'message' => 'Numéro refusé par le service de paiement. Vérifiez votre numéro Mobile Money.'], 422);
            }

            $checkoutUrl = $checkout['checkout_url'] ?? $checkout['url'] ?? data_get($checkout, 'data.checkout_url');
            if (empty($checkoutUrl)) {
                $payment->delete();
                $invoice->delete();
                return response()->json(['success' => false, 'message' => 'Erreur initialisation du paiement'], 502);
            }

            $payment->update([
                'status'                 => 'pending',
                'checkout_url'           => $checkoutUrl,
                'fedapay_transaction_id' => data_get($checkout, 'data.transaction_id') ?? data_get($checkout, 'data.id'),
            ]);

            return response()->json(['success' => true, 'message' => 'Paiement initialisé', 'payment_id' => $payment->id, 'checkout_url' => $checkoutUrl]);

        } catch (\Exception $e) {
            Log::error('Erreur payMonthly: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Erreur lors du paiement'], 500);
        }
    }

    /* ===== POST /tenant/invoices/{invoiceId}/pay ===== */
    public function payInvoice(Request $request, $invoiceId)
    {
        try {
            $tenant = $this->getTenant();
            if (!$tenant) return response()->json(['success' => false, 'message' => 'Accès réservé'], 403);

            $user = Auth::user();

            // ══ ÉTAPE 1 : Valider téléphone AVANT toute écriture en base ══
            $phoneResult = $this->resolveAndValidatePhone($request, $user);
            if (!$phoneResult['success']) return $phoneResult['response'];
            $formattedPhone = $phoneResult['phone'];

            $invoice = Invoice::with(['lease.property.landlord.user'])->findOrFail($invoiceId);
            if ($invoice->lease->tenant_id !== $tenant->id) return response()->json(['success' => false, 'message' => 'Facture non trouvée'], 404);
            if ($invoice->status === 'paid') return response()->json(['success' => false, 'message' => 'Facture déjà payée'], 422);

            $lease = $invoice->lease;

            if ($invoice->period_start) {
                $pd = Carbon::parse($invoice->period_start);
                $ex = $this->checkExistingPaymentForMonth($lease->id, $pd->year, $pd->month);
                if ($ex && $ex['type'] === 'approved') return response()->json(['success' => false, 'message' => 'Cette période a déjà été payée'], 422);
            }

            // Paiement en cours existant → renvoyer checkout_url directement
            $existingPayment = Payment::where('invoice_id', $invoice->id)->whereIn('status', ['initiated', 'pending'])->first();
            if ($existingPayment?->checkout_url) {
                return response()->json([
                    'success'          => true,
                    'message'          => 'Paiement déjà en cours',
                    'payment_id'       => $existingPayment->id,
                    'checkout_url'     => $existingPayment->checkout_url,
                    'existing_payment' => true,
                ]);
            }

            $landlordUserId = $lease->property->landlord?->user_id ?? $lease->property->landlord_id;
            if (!$landlordUserId) return response()->json(['success' => false, 'message' => 'Propriétaire non trouvé'], 422);

            $payment = Payment::create([
                'invoice_id'       => $invoice->id,
                'lease_id'         => $lease->id,
                'tenant_id'        => $tenant->id,
                'landlord_user_id' => (int) $landlordUserId,
                'provider'         => 'fedapay',
                'status'           => 'initiated',
                'currency'         => config('fedapay.currency', 'XOF'),
                'amount_total'     => (float) $invoice->amount_total,
            ]);

            $customer = [
                'firstname' => $tenant->first_name,
                'lastname'  => $tenant->last_name,
                'email'     => $user->email,
                'phone'     => ['number' => $formattedPhone, 'country' => 'BJ'],
            ];

            try {
                $checkout = $this->fedapay->createCheckout($payment, $invoice, $lease, $customer);
            } catch (\Exception $e) {
                $payment->delete();
                Log::error('Erreur FEDAPAY payInvoice: ' . $e->getMessage());
                return response()->json(['success' => false, 'message' => 'Numéro refusé par le service de paiement. Vérifiez votre numéro Mobile Money.'], 422);
            }

            $checkoutUrl = $checkout['checkout_url'] ?? $checkout['url'] ?? data_get($checkout, 'data.checkout_url');
            if (empty($checkoutUrl)) {
                $payment->delete();
                return response()->json(['success' => false, 'message' => 'Erreur initialisation'], 502);
            }

            $payment->update([
                'status'                 => 'pending',
                'checkout_url'           => $checkoutUrl,
                'fedapay_transaction_id' => data_get($checkout, 'data.transaction_id') ?? data_get($checkout, 'data.id'),
            ]);

            return response()->json(['success' => true, 'message' => 'Paiement initialisé', 'payment_id' => $payment->id, 'checkout_url' => $checkoutUrl]);

        } catch (\Exception $e) {
            Log::error('Erreur payInvoice: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Erreur'], 500);
        }
    }

    /* ===== GET /tenant/payments/receipt/{paymentId} ===== */
    public function downloadReceipt($paymentId)
    {
        try {
            $tenant = $this->getTenant();
            if (!$tenant) return response()->json(['success' => false, 'message' => 'Accès réservé'], 403);

            $payment = Payment::where('tenant_id', $tenant->id)->with(['lease.property', 'lease.tenant', 'invoice'])->findOrFail($paymentId);
            if ($payment->status !== 'approved') return response()->json(['success' => false, 'message' => 'Paiement non validé'], 422);

            $pdf = Pdf::loadView('pdf.quittance_paiement', [
                'payment'   => $payment,
                'tenant'    => $tenant,
                'lease'     => $payment->lease,
                'property'  => $payment->lease->property,
                'invoice'   => $payment->invoice,
                'date'      => now()->format('d/m/Y'),
                'reference' => 'QUIT-' . $payment->id . '-' . date('Ymd'),
            ])->setPaper('A4', 'portrait');

            return $pdf->download('quittance_' . $payment->id . '_' . date('Y-m-d') . '.pdf');
        } catch (\Exception $e) {
            Log::error('Erreur téléchargement: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Erreur téléchargement'], 500);
        }
    }

    /* ===== GET /tenant/payments/filters/options ===== */
    public function getFilterOptions(Request $request)
    {
        try {
            $tenant = $this->getTenant();
            if (!$tenant) return response()->json(['success' => false, 'message' => 'Accès réservé'], 403);

            $properties   = Property::whereHas('leases', fn($q) => $q->where('tenant_id', $tenant->id))->get(['id', 'name']);
            $months       = array_map(fn($i) => ['value' => $i, 'label' => Carbon::create()->month($i)->format('F')], range(1, 12));
            $paymentYears = Payment::where('tenant_id', $tenant->id)->selectRaw('YEAR(COALESCE(paid_at, created_at)) as year')->distinct()->pluck('year')->toArray();
            $invoiceYears = Invoice::whereHas('lease', fn($q) => $q->where('tenant_id', $tenant->id))->selectRaw('YEAR(period_start) as year')->distinct()->pluck('year')->toArray();
            $leaseYears   = Lease::where('tenant_id', $tenant->id)->selectRaw('YEAR(start_date) as year')->distinct()->pluck('year')->toArray();
            $allYears     = array_unique(array_merge($paymentYears, $invoiceYears, $leaseYears));
            sort($allYears);
            if (empty($allYears)) $allYears = [now()->year];

            return response()->json(['success' => true, 'data' => ['properties' => $properties, 'months' => $months, 'years' => $allYears]]);
        } catch (\Exception $e) {
            Log::error('Erreur options: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Erreur'], 500);
        }
    }

    /* ===== GET /tenant/payments/check-status/{paymentId} ===== */
    public function checkStatus($paymentId)
    {
        try {
            $tenant = $this->getTenant();
            if (!$tenant) return response()->json(['success' => false, 'message' => 'Accès réservé'], 403);

            $payment = Payment::where('tenant_id', $tenant->id)->with(['invoice'])->findOrFail($paymentId);
            return response()->json(['success' => true, 'data' => [
                'status'         => $payment->status,
                'paid_at'        => $payment->paid_at,
                'created_at'     => $payment->created_at,
                'invoice_status' => $payment->invoice?->status,
            ]]);
        } catch (\Exception $e) {
            Log::error('Erreur vérification: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Erreur'], 500);
        }
    }

    /* ===== POST /fedapay/webhook ===== */
    public function webhook(Request $request)
    {
        try {
            $payload       = $request->all();
            $transactionId = $payload['transaction']['id'] ?? null;
            $status        = $payload['transaction']['status'] ?? null;
            if (!$transactionId) return response()->json(['message' => 'ID manquant'], 400);

            $payment = Payment::where('fedapay_transaction_id', $transactionId)->first();
            if (!$payment) return response()->json(['message' => 'Non trouvé'], 404);

            if (in_array($status, ['approved', 'accepted'])) {
                DB::transaction(function () use ($payment) {
                    if ($payment->invoice?->period_start) {
                        $pd = Carbon::parse($payment->invoice->period_start);
                        Payment::where('lease_id', $payment->lease_id)->where('id', '!=', $payment->id)
                            ->whereYear('created_at', $pd->year)->whereMonth('created_at', $pd->month)->update(['status' => 'cancelled']);
                        Invoice::where('lease_id', $payment->lease_id)->where('id', '!=', $payment->invoice_id)
                            ->whereYear('period_start', $pd->year)->whereMonth('period_start', $pd->month)->update(['status' => 'cancelled']);
                    }
                    $payment->update(['status' => 'approved', 'paid_at' => now()]);
                    if ($payment->invoice) $payment->invoice->update(['status' => 'paid', 'amount_paid' => $payment->amount_total]);
                    $this->sendPaymentNotifications($payment);
                });
                Log::info('Paiement approuvé', ['payment_id' => $payment->id]);
            } elseif (in_array($status, ['declined', 'canceled'])) {
                $payment->update(['status' => 'declined']);
            }

            return response()->json(['message' => 'OK']);
        } catch (\Exception $e) {
            Log::error('Erreur webhook: ' . $e->getMessage());
            return response()->json(['message' => 'Erreur'], 500);
        }
    }

    private function sendPaymentNotifications(Payment $payment)
    {
        try {
            if ($payment->landlord_user_id) {
                $landlord = User::find($payment->landlord_user_id);
                if ($landlord?->email) Mail::to($landlord->email)->queue(new PaymentNotificationMail($payment, 'landlord'));
            }
            $delegations = PropertyDelegation::where('property_id', $payment->lease->property->id)
                ->where('status', 'active')->with(['coOwner.user'])->get();
            foreach ($delegations as $d) {
                if ($d->coOwner?->user?->email) Mail::to($d->coOwner->user->email)->queue(new PaymentNotificationMail($payment, 'co_owner', $d));
            }
        } catch (\Exception $e) {
            Log::error('Erreur notifications: ' . $e->getMessage());
        }
    }
}
