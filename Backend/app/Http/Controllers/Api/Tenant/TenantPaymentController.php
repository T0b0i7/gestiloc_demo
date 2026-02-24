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
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Carbon\Carbon;

class TenantPaymentController extends Controller
{
    private FedapayPayments $fedapay;

    public function __construct(FedapayPayments $fedapay)
    {
        $this->fedapay = $fedapay;
    }

    /**
     * Récupérer le tenant connecté
     */
    private function getTenant()
    {
        $user = Auth::user();

        if (!$user || !$user->hasRole('tenant')) {
            return null;
        }

        return $user->tenant;
    }

    /**
     * Formater le numéro de téléphone pour FEDAPAY - VERSION CORRIGÉE
     */
    private function formatPhoneForFedapay(?string $phone): ?string
    {
        if (empty($phone)) {
            return null;
        }

        // Supprimer tous les caractères non numériques
        $clean = preg_replace('/[^0-9]/', '', $phone);

        // Si le numéro est vide après nettoyage
        if (empty($clean)) {
            return null;
        }

        // Format attendu par FedaPay: +229XXXXXXXX
        // Pour le Bénin, ajouter l'indicatif +229
        if (strlen($clean) === 8) {
            return '+229' . $clean;
        }
        if (strlen($clean) === 9) {
            // Si le numéro commence par 0, on l'enlève
            if (substr($clean, 0, 1) === '0') {
                $clean = substr($clean, 1);
            }
            return '+229' . $clean;
        }
        if (strlen($clean) === 10) {
            // Enlever les 3 premiers chiffres (229) s'ils sont présents
            if (substr($clean, 0, 3) === '229') {
                $clean = substr($clean, 3);
            }
            return '+229' . $clean;
        }
        if (strlen($clean) === 12 && substr($clean, 0, 3) === '229') {
            return '+' . $clean;
        }

        return '+' . $clean;
    }

    /**
     * Vérifier si un paiement existe déjà pour un mois donné
     */
    private function checkExistingPaymentForMonth(int $leaseId, int $year, int $month): ?array
    {
        // Vérifier paiement approuvé
        $approved = Payment::where('lease_id', $leaseId)
            ->where('status', 'approved')
            ->whereYear('paid_at', $year)
            ->whereMonth('paid_at', $month)
            ->first();

        if ($approved) {
            return [
                'exists' => true,
                'type' => 'approved',
                'payment' => $approved,
                'message' => 'Ce mois a déjà été payé'
            ];
        }

        // Vérifier paiement en cours
        $pending = Payment::where('lease_id', $leaseId)
            ->whereIn('status', ['initiated', 'pending'])
            ->whereYear('created_at', $year)
            ->whereMonth('created_at', $month)
            ->first();

        if ($pending) {
            return [
                'exists' => true,
                'type' => 'pending',
                'payment' => $pending,
                'message' => 'Un paiement est déjà en cours pour ce mois'
            ];
        }

        return null;
    }

    /**
     * Obtenir la liste des mois depuis le début du bail
     */
    private function getMonthsSinceLeaseStart(Lease $lease): array
    {
        $startDate = Carbon::parse($lease->start_date)->startOfMonth();
        $endDate = Carbon::now()->endOfMonth();

        $months = [];
        $current = $startDate->copy();

        while ($current->lessThanOrEqualTo($endDate)) {
            $months[] = $current->copy();
            $current->addMonth();
        }

        return $months;
    }

    /* =========================
       GET /tenant/payments/dashboard
    ========================= */
    public function dashboard(Request $request)
    {
        try {
            $tenant = $this->getTenant();

            if (!$tenant) {
                return response()->json([
                    'success' => false,
                    'message' => 'Accès réservé aux locataires'
                ], 403);
            }

            // Récupérer tous les baux actifs
            $leases = Lease::where('tenant_id', $tenant->id)
                ->where('status', 'active')
                ->with(['property'])
                ->get();

            // Récupérer toutes les factures
            $invoices = Invoice::whereHas('lease', function($q) use ($tenant) {
                    $q->where('tenant_id', $tenant->id);
                })
                ->with(['lease.property'])
                ->orderBy('period_start', 'desc')
                ->get();

            // Récupérer tous les paiements
            $allPayments = Payment::where('tenant_id', $tenant->id)
                ->with(['lease.property', 'invoice'])
                ->orderBy('created_at', 'desc')
                ->get();

            // Récupérer uniquement les paiements approuvés pour les stats
            $approvedPayments = $allPayments->where('status', 'approved');

            // Statistiques
            $stats = [
                'total_paid' => $approvedPayments->sum('amount_total'),
                'total_pending' => $allPayments->whereIn('status', ['initiated', 'pending'])->sum('amount_total'),
                'total_overdue' => 0,
                'payments_count' => $approvedPayments->count(),
                'invoices_count' => $invoices->count(),
                'active_leases_count' => $leases->count(),
            ];

            // Graphique - 12 derniers mois
            $chartData = [];
            $hasData = false;

            for ($i = 11; $i >= 0; $i--) {
                $month = now()->subMonths($i);
                $monthKey = $month->format('Y-m');
                $monthLabel = $month->format('M Y');

                // Calculer le total payé pour ce mois
                $monthTotal = 0;
                $monthCount = 0;

                foreach ($approvedPayments as $payment) {
                    if ($payment->paid_at) {
                        $paymentMonth = Carbon::parse($payment->paid_at)->format('Y-m');
                        if ($paymentMonth === $monthKey) {
                            $monthTotal += $payment->amount_total;
                            $monthCount++;
                        }
                    }
                }

                // Si on a des paiements pour ce mois
                if ($monthTotal > 0) {
                    $hasData = true;
                }

                $chartData[] = [
                    'month' => $monthLabel,
                    'amount' => $monthTotal,
                    'count' => $monthCount,
                    'formatted_amount' => number_format($monthTotal, 0, ',', ' ') . ' FCFA'
                ];
            }

            Log::info('Chart Data calculé:', ['data' => $chartData, 'hasData' => $hasData]);

            // Données des propriétés
            $propertiesData = [];
            $totalOverdue = 0;
            $currentDate = now();

            foreach ($leases as $lease) {
                // Mois en cours
                $currentMonthPaid = Payment::where('lease_id', $lease->id)
                    ->where('status', 'approved')
                    ->whereYear('paid_at', $currentDate->year)
                    ->whereMonth('paid_at', $currentDate->month)
                    ->exists();

                // Paiement en cours pour le mois en cours
                $pendingPayment = Payment::where('lease_id', $lease->id)
                    ->whereIn('status', ['initiated', 'pending'])
                    ->whereYear('created_at', $currentDate->year)
                    ->whereMonth('created_at', $currentDate->month)
                    ->first();

                // Calcul des impayés
                $unpaidMonths = [];
                $totalUnpaid = 0;

                $monthsSinceStart = $this->getMonthsSinceLeaseStart($lease);

                foreach ($monthsSinceStart as $monthDate) {
                    if ($monthDate->format('Y-m') === $currentDate->format('Y-m')) {
                        continue;
                    }

                    $paid = Payment::where('lease_id', $lease->id)
                        ->where('status', 'approved')
                        ->whereYear('paid_at', $monthDate->year)
                        ->whereMonth('paid_at', $monthDate->month)
                        ->exists();

                    if (!$paid) {
                        $unpaidMonths[] = $monthDate->format('F Y');
                        $totalUnpaid += $lease->rent_amount + ($lease->charges_amount ?? 0);
                    }
                }

                $totalOverdue += $totalUnpaid;

                // 5 derniers paiements
                $recentPayments = Payment::where('lease_id', $lease->id)
                    ->orderBy('created_at', 'desc')
                    ->limit(5)
                    ->get()
                    ->map(function ($payment) {
                        return [
                            'id' => $payment->id,
                            'amount_total' => $payment->amount_total,
                            'status' => $payment->status,
                            'paid_at' => $payment->paid_at,
                            'created_at' => $payment->created_at,
                            'display_date' => $payment->paid_at ?? $payment->created_at,
                            'checkout_url' => $payment->checkout_url,
                        ];
                    });

                $propertiesData[] = [
                    'lease' => $lease,
                    'property' => $lease->property,
                    'current_month_paid' => $currentMonthPaid,
                    'pending_payment' => $pendingPayment,
                    'has_pending_payment' => !is_null($pendingPayment),
                    'pending_payment_id' => $pendingPayment?->id,
                    'pending_payment_status' => $pendingPayment?->status,
                    'pending_checkout_url' => $pendingPayment?->checkout_url,
                    'unpaid_count' => count($unpaidMonths),
                    'unpaid_months' => $unpaidMonths,
                    'total_unpaid' => $totalUnpaid,
                    'recent_payments' => $recentPayments,
                    'rent_amount' => $lease->rent_amount,
                    'charges' => $lease->charges_amount ?? 0,
                    'total_monthly' => $lease->rent_amount + ($lease->charges_amount ?? 0),
                ];
            }

            $stats['total_overdue'] = $totalOverdue;

            return response()->json([
                'success' => true,
                'data' => [
                    'leases' => $leases,
                    'invoices' => $invoices,
                    'payments' => $allPayments,
                    'stats' => $stats,
                    'chart_data' => $chartData,
                    'has_chart_data' => $hasData,
                    'properties' => $propertiesData,
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur dashboard: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du chargement'
            ], 500);
        }
    }

    /* =========================
       GET /tenant/payments/invoices
    ========================= */
    public function invoices(Request $request)
    {
        try {
            $tenant = $this->getTenant();

            if (!$tenant) {
                return response()->json([
                    'success' => false,
                    'message' => 'Accès réservé'
                ], 403);
            }

            $query = Invoice::whereHas('lease', function($q) use ($tenant) {
                    $q->where('tenant_id', $tenant->id);
                })
                ->with(['lease.property']);

            if ($request->property_id) {
                $query->whereHas('lease', function($q) use ($request) {
                    $q->where('property_id', $request->property_id);
                });
            }

            if ($request->status) {
                if ($request->status === 'paid') {
                    $query->where('status', 'paid');
                } elseif ($request->status === 'pending') {
                    $query->where('status', 'pending');
                }
            }

            if ($request->month) {
                $query->whereMonth('period_start', $request->month);
            }
            if ($request->year) {
                $query->whereYear('period_start', $request->year);
            }

            if ($request->search) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('invoice_number', 'like', "%{$search}%")
                      ->orWhereHas('lease.property', function($sq) use ($search) {
                          $sq->where('name', 'like', "%{$search}%");
                      });
                });
            }

            $invoices = $query->orderBy('period_start', 'desc')
                ->paginate($request->input('per_page', 20));

            return response()->json([
                'success' => true,
                'data' => $invoices
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur factures: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur'
            ], 500);
        }
    }

    /* =========================
       GET /tenant/payments/history
    ========================= */
    public function history(Request $request)
    {
        try {
            $tenant = $this->getTenant();

            if (!$tenant) {
                return response()->json([
                    'success' => false,
                    'message' => 'Accès réservé'
                ], 403);
            }

            $query = Payment::where('tenant_id', $tenant->id)
                ->with(['lease.property', 'invoice']);

            if ($request->property_id) {
                $query->whereHas('lease', function($q) use ($request) {
                    $q->where('property_id', $request->property_id);
                });
            }

            if ($request->status) {
                $query->where('status', $request->status);
            }

            if ($request->month) {
                $query->where(function($q) use ($request) {
                    $q->whereMonth('paid_at', $request->month)
                      ->orWhereMonth('created_at', $request->month);
                });
            }
            if ($request->year) {
                $query->where(function($q) use ($request) {
                    $q->whereYear('paid_at', $request->year)
                      ->orWhereYear('created_at', $request->year);
                });
            }

            $payments = $query->orderBy('created_at', 'desc')
                ->paginate($request->input('per_page', 20));

            return response()->json([
                'success' => true,
                'data' => $payments
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur historique: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur'
            ], 500);
        }
    }

    /* =========================
       POST /tenant/payments/pay/{leaseId}
    ========================= */
    public function payMonthly(Request $request, $leaseId)
    {
        try {
            $tenant = $this->getTenant();

            if (!$tenant) {
                return response()->json([
                    'success' => false,
                    'message' => 'Accès réservé'
                ], 403);
            }

            $lease = Lease::where('id', $leaseId)
                ->where('tenant_id', $tenant->id)
                ->where('status', 'active')
                ->with(['property.landlord.user', 'property'])
                ->first();

            if (!$lease) {
                return response()->json([
                    'success' => false,
                    'message' => 'Bail non trouvé'
                ], 404);
            }

            $currentDate = now();
            $month = $request->input('month', $currentDate->month);
            $year = $request->input('year', $currentDate->year);

            $paymentDate = Carbon::create($year, $month, 1)->startOfMonth();
            $leaseStartDate = Carbon::parse($lease->start_date)->startOfMonth();

            if ($paymentDate->lessThan($leaseStartDate)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Date antérieure au début du bail'
                ], 422);
            }

            // Vérification des paiements existants
            $existingPayment = $this->checkExistingPaymentForMonth($lease->id, $year, $month);

            if ($existingPayment) {
                if ($existingPayment['type'] === 'pending' && $existingPayment['payment']->checkout_url) {
                    return response()->json([
                        'success' => true,
                        'message' => 'Paiement déjà en cours',
                        'payment_id' => $existingPayment['payment']->id,
                        'checkout_url' => $existingPayment['payment']->checkout_url,
                        'existing_payment' => true
                    ]);
                }

                return response()->json([
                    'success' => false,
                    'message' => $existingPayment['message']
                ], 422);
            }

            // Vérifier s'il existe déjà une facture
            $existingInvoice = Invoice::where('lease_id', $lease->id)
                ->whereYear('period_start', $year)
                ->whereMonth('period_start', $month)
                ->first();

            if ($existingInvoice) {
                return response()->json([
                    'success' => false,
                    'message' => 'Une facture existe déjà pour cette période'
                ], 422);
            }

            // Créer la facture
            $amount = $lease->rent_amount + ($lease->charges_amount ?? 0);
            $invoiceCount = Invoice::whereYear('created_at', date('Y'))->count() + 1;

            $invoice = Invoice::create([
                'lease_id' => $lease->id,
                'invoice_number' => 'FACT-' . date('Y') . '-' . str_pad($invoiceCount, 4, '0', STR_PAD_LEFT),
                'type' => 'rent',
                'due_date' => $paymentDate->copy()->addDays(30),
                'period_start' => $paymentDate->copy()->startOfMonth(),
                'period_end' => $paymentDate->copy()->endOfMonth(),
                'amount_total' => (float) $amount,
                'amount_paid' => 0,
                'status' => 'pending',
                'pdf_path' => null,
                'sent_at' => null,
            ]);

            $landlordUserId = $lease->property->landlord?->user_id ?? $lease->property->landlord_id;

            if (!$landlordUserId) {
                return response()->json([
                    'success' => false,
                    'message' => 'Propriétaire non trouvé'
                ], 422);
            }

            // Créer le paiement
            $payment = Payment::create([
                'invoice_id' => $invoice->id,
                'lease_id' => $lease->id,
                'tenant_id' => $tenant->id,
                'landlord_user_id' => (int) $landlordUserId,
                'provider' => 'fedapay',
                'status' => 'initiated',
                'currency' => config('fedapay.currency', 'XOF'),
                'amount_total' => (float) $amount,
            ]);

            // Préparer les données client
            $user = Auth::user();
            $phoneNumber = $request->input('phone_number') ?? $user->phone;
            $formattedPhone = $this->formatPhoneForFedapay($phoneNumber);

            // Validation du téléphone
            if (empty($formattedPhone)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Numéro de téléphone invalide. Format attendu: +229 XX XX XX XX'
                ], 422);
            }

            $customer = [
                'firstname' => $tenant->first_name,
                'lastname'  => $tenant->last_name,
                'email'     => $user->email,
                'phone'     => [
                    'number' => $formattedPhone,
                    'country' => 'BJ'
                ],
            ];

            if (empty($customer['email'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Email manquant'
                ], 422);
            }

            try {
                $checkout = $this->fedapay->createCheckout($payment, $invoice, $lease, $customer);
            } catch (\Exception $e) {
                Log::error('Erreur FEDAPAY: ' . $e->getMessage());
                return response()->json([
                    'success' => false,
                    'message' => 'Service de paiement indisponible. Vérifiez votre numéro de téléphone.'
                ], 502);
            }

            $checkoutUrl = $checkout['checkout_url'] ?? $checkout['url'] ?? data_get($checkout, 'data.checkout_url');

            if (empty($checkoutUrl)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Erreur initialisation du paiement'
                ], 502);
            }

            $payment->update([
                'status' => 'pending',
                'checkout_url' => $checkoutUrl,
                'fedapay_transaction_id' => data_get($checkout, 'data.transaction_id') ?? data_get($checkout, 'data.id'),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Paiement initialisé',
                'payment_id' => $payment->id,
                'checkout_url' => $checkoutUrl,
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur paiement: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du paiement'
            ], 500);
        }
    }

    /* =========================
       POST /tenant/invoices/{invoiceId}/pay
    ========================= */
    public function payInvoice(Request $request, $invoiceId)
    {
        try {
            $tenant = $this->getTenant();

            if (!$tenant) {
                return response()->json([
                    'success' => false,
                    'message' => 'Accès réservé'
                ], 403);
            }

            $invoice = Invoice::with(['lease.property.landlord.user'])
                ->findOrFail($invoiceId);

            if ($invoice->lease->tenant_id !== $tenant->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Facture non trouvée'
                ], 404);
            }

            if ($invoice->status === 'paid') {
                return response()->json([
                    'success' => false,
                    'message' => 'Facture déjà payée'
                ], 422);
            }

            $lease = $invoice->lease;

            // Vérifier si la période a déjà un paiement approuvé
            if ($invoice->period_start) {
                $periodDate = Carbon::parse($invoice->period_start);
                $existingPayment = $this->checkExistingPaymentForMonth(
                    $lease->id,
                    $periodDate->year,
                    $periodDate->month
                );

                if ($existingPayment && $existingPayment['type'] === 'approved') {
                    return response()->json([
                        'success' => false,
                        'message' => 'Cette période a déjà été payée'
                    ], 422);
                }
            }

            // Vérifier les paiements en cours
            $existingPayment = Payment::where('invoice_id', $invoice->id)
                ->whereIn('status', ['initiated', 'pending'])
                ->first();

            if ($existingPayment) {
                if ($existingPayment->checkout_url) {
                    return response()->json([
                        'success' => true,
                        'message' => 'Paiement déjà en cours',
                        'payment_id' => $existingPayment->id,
                        'checkout_url' => $existingPayment->checkout_url,
                        'existing_payment' => true
                    ]);
                }
                $payment = $existingPayment;
            } else {
                $landlordUserId = $lease->property->landlord?->user_id ?? $lease->property->landlord_id;

                if (!$landlordUserId) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Propriétaire non trouvé'
                    ], 422);
                }

                $payment = Payment::create([
                    'invoice_id' => $invoice->id,
                    'lease_id' => $lease->id,
                    'tenant_id' => $tenant->id,
                    'landlord_user_id' => (int) $landlordUserId,
                    'provider' => 'fedapay',
                    'status' => 'initiated',
                    'currency' => config('fedapay.currency', 'XOF'),
                    'amount_total' => (float) $invoice->amount_total,
                ]);
            }

            // Préparer les données client
            $user = Auth::user();
            $phoneNumber = $request->input('phone_number') ?? $user->phone;
            $formattedPhone = $this->formatPhoneForFedapay($phoneNumber);

            if (empty($formattedPhone)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Numéro de téléphone invalide'
                ], 422);
            }

            $customer = [
                'firstname' => $tenant->first_name,
                'lastname'  => $tenant->last_name,
                'email'     => $user->email,
                'phone'     => [
                    'number' => $formattedPhone,
                    'country' => 'BJ'
                ],
            ];

            try {
                $checkout = $this->fedapay->createCheckout($payment, $invoice, $lease, $customer);
            } catch (\Exception $e) {
                Log::error('Erreur FEDAPAY: ' . $e->getMessage());
                return response()->json([
                    'success' => false,
                    'message' => 'Service de paiement indisponible'
                ], 502);
            }

            $checkoutUrl = $checkout['checkout_url'] ?? $checkout['url'] ?? data_get($checkout, 'data.checkout_url');

            if (empty($checkoutUrl)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Erreur initialisation'
                ], 502);
            }

            $payment->update([
                'status' => 'pending',
                'checkout_url' => $checkoutUrl,
                'fedapay_transaction_id' => data_get($checkout, 'data.transaction_id') ?? data_get($checkout, 'data.id'),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Paiement initialisé',
                'payment_id' => $payment->id,
                'checkout_url' => $checkoutUrl,
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur paiement facture: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur'
            ], 500);
        }
    }

    /* =========================
       GET /tenant/payments/receipt/{paymentId}
    ========================= */
    public function downloadReceipt($paymentId)
    {
        try {
            $tenant = $this->getTenant();

            if (!$tenant) {
                return response()->json([
                    'success' => false,
                    'message' => 'Accès réservé'
                ], 403);
            }

            $payment = Payment::where('tenant_id', $tenant->id)
                ->with(['lease.property', 'lease.tenant', 'invoice'])
                ->findOrFail($paymentId);

            if ($payment->status !== 'approved') {
                return response()->json([
                    'success' => false,
                    'message' => 'Paiement non validé'
                ], 422);
            }

            $data = [
                'payment' => $payment,
                'tenant' => $tenant,
                'lease' => $payment->lease,
                'property' => $payment->lease->property,
                'invoice' => $payment->invoice,
                'date' => now()->format('d/m/Y'),
                'reference' => 'QUIT-' . $payment->id . '-' . date('Ymd')
            ];

            $pdf = Pdf::loadView('pdf.quittance_paiement', $data);
            $pdf->setPaper('A4', 'portrait');

            $filename = 'quittance_' . $payment->id . '_' . date('Y-m-d') . '.pdf';

            return $pdf->download($filename);

        } catch (\Exception $e) {
            Log::error('Erreur téléchargement: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur téléchargement'
            ], 500);
        }
    }

    /* =========================
       GET /tenant/payments/filters/options
    ========================= */
    public function getFilterOptions(Request $request)
    {
        try {
            $tenant = $this->getTenant();

            if (!$tenant) {
                return response()->json([
                    'success' => false,
                    'message' => 'Accès réservé'
                ], 403);
            }

            $properties = Property::whereHas('leases', function($q) use ($tenant) {
                $q->where('tenant_id', $tenant->id);
            })->get(['id', 'name']);

            $months = [];
            for ($i = 1; $i <= 12; $i++) {
                $months[] = [
                    'value' => $i,
                    'label' => Carbon::create()->month($i)->format('F')
                ];
            }

            $paymentYears = Payment::where('tenant_id', $tenant->id)
                ->selectRaw('YEAR(COALESCE(paid_at, created_at)) as year')
                ->distinct()
                ->pluck('year')
                ->toArray();

            $invoiceYears = Invoice::whereHas('lease', function($q) use ($tenant) {
                    $q->where('tenant_id', $tenant->id);
                })
                ->selectRaw('YEAR(period_start) as year')
                ->distinct()
                ->pluck('year')
                ->toArray();

            $leaseYears = Lease::where('tenant_id', $tenant->id)
                ->selectRaw('YEAR(start_date) as year')
                ->distinct()
                ->pluck('year')
                ->toArray();

            $allYears = array_unique(array_merge($paymentYears, $invoiceYears, $leaseYears));
            sort($allYears);

            if (empty($allYears)) {
                $allYears = [now()->year];
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'properties' => $properties,
                    'months' => $months,
                    'years' => $allYears,
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur options: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur'
            ], 500);
        }
    }

    /* =========================
       GET /tenant/payments/check-status/{paymentId}
    ========================= */
    public function checkStatus($paymentId)
    {
        try {
            $tenant = $this->getTenant();

            if (!$tenant) {
                return response()->json([
                    'success' => false,
                    'message' => 'Accès réservé'
                ], 403);
            }

            $payment = Payment::where('tenant_id', $tenant->id)
                ->with(['invoice'])
                ->findOrFail($paymentId);

            return response()->json([
                'success' => true,
                'data' => [
                    'status' => $payment->status,
                    'paid_at' => $payment->paid_at,
                    'created_at' => $payment->created_at,
                    'invoice_status' => $payment->invoice?->status,
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur vérification: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur'
            ], 500);
        }
    }

    /**
     * Webhook FEDAPAY
     */
    public function webhook(Request $request)
    {
        try {
            $payload = $request->all();
            Log::info('Webhook reçu', ['payload' => $payload]);

            $transactionId = $payload['transaction']['id'] ?? null;
            $status = $payload['transaction']['status'] ?? null;

            if (!$transactionId) {
                return response()->json(['message' => 'ID manquant'], 400);
            }

            $payment = Payment::where('fedapay_transaction_id', $transactionId)->first();

            if (!$payment) {
                Log::warning('Paiement non trouvé');
                return response()->json(['message' => 'Non trouvé'], 404);
            }

            if ($status === 'approved' || $status === 'accepted') {
                DB::transaction(function () use ($payment) {
                    // Vérifier qu'aucun autre paiement approuvé n'existe
                    if ($payment->invoice && $payment->invoice->period_start) {
                        $periodDate = Carbon::parse($payment->invoice->period_start);

                        // Marquer les autres paiements comme annulés
                        Payment::where('lease_id', $payment->lease_id)
                            ->where('id', '!=', $payment->id)
                            ->whereYear('created_at', $periodDate->year)
                            ->whereMonth('created_at', $periodDate->month)
                            ->update(['status' => 'cancelled']);

                        // Marquer les autres factures comme annulées
                        Invoice::where('lease_id', $payment->lease_id)
                            ->where('id', '!=', $payment->invoice_id)
                            ->whereYear('period_start', $periodDate->year)
                            ->whereMonth('period_start', $periodDate->month)
                            ->update(['status' => 'cancelled']);
                    }

                    $payment->update([
                        'status' => 'approved',
                        'paid_at' => now(),
                    ]);

                    if ($payment->invoice) {
                        $payment->invoice->update([
                            'status' => 'paid',
                            'amount_paid' => $payment->amount_total,
                        ]);
                    }

                    $this->sendPaymentNotifications($payment);
                });

                Log::info('Paiement approuvé', ['payment_id' => $payment->id]);
            } elseif ($status === 'declined' || $status === 'canceled') {
                $payment->update(['status' => 'declined']);
            }

            return response()->json(['message' => 'OK']);

        } catch (\Exception $e) {
            Log::error('Erreur webhook: ' . $e->getMessage());
            return response()->json(['message' => 'Erreur'], 500);
        }
    }

    /**
     * Envoyer les notifications
     */
    private function sendPaymentNotifications(Payment $payment)
    {
        try {
            if ($payment->landlord_user_id) {
                $landlord = User::find($payment->landlord_user_id);
                if ($landlord && $landlord->email) {
                    Mail::to($landlord->email)->queue(new PaymentNotificationMail($payment, 'landlord'));
                }
            }

            $delegations = PropertyDelegation::where('property_id', $payment->lease->property->id)
                ->where('status', 'active')
                ->with(['coOwner.user'])
                ->get();

            foreach ($delegations as $delegation) {
                if ($delegation->coOwner?->user?->email) {
                    Mail::to($delegation->coOwner->user->email)
                        ->queue(new PaymentNotificationMail($payment, 'co_owner', $delegation));
                }
            }

        } catch (\Exception $e) {
            Log::error('Erreur envoi notifications: ' . $e->getMessage());
        }
    }
}
