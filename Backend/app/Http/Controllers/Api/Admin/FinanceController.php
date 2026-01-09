<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Invoice;
use App\Models\Transaction;
use App\Models\Lease;
use App\Models\Property;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Symfony\Component\HttpFoundation\StreamedResponse;

class FinanceController extends Controller
{
    public function dashboard(Request $request): JsonResponse
    {
        $period = $request->get('period', 'month'); // day, week, month, quarter, year
        $dateRange = $this->getDateRange($period);

        // Revenus totaux plate-forme
        $totalRevenue = Invoice::where('status', 'paid')
            ->whereBetween('paid_at', [$dateRange['start'], $dateRange['end']])
            ->sum('amount_paid');

        // Commissions plate-forme (ex: 5% des revenus)
        $commissionRate = config('gestiloc.commission_rate', 0.05);
        $totalCommissions = $totalRevenue * $commissionRate;

        // Transactions FedaPay
        $fedapayTransactions = Payment::where('payment_method', 'fedapay')
            ->whereBetween('created_at', [$dateRange['start'], $dateRange['end']])
            ->get();

        $successfulTransactions = $fedapayTransactions->where('status', 'completed');
        $failedTransactions = $fedapayTransactions->where('status', 'failed');
        $pendingTransactions = $fedapayTransactions->where('status', 'pending');

        // Métriques clés
        $totalTransactions = $fedapayTransactions->count();
        $successRate = $totalTransactions > 0 ? 
            round(($successfulTransactions->count() / $totalTransactions) * 100, 1) : 0;
        
        $averageTransactionAmount = $successfulTransactions->count() > 0 ? 
            $successfulTransactions->sum('amount') / $successfulTransactions->count() : 0;

        // Alertes
        $alerts = $this->getFinancialAlerts($dateRange);

        // Tendances
        $revenueTrend = $this->getRevenueTrend($period);
        $transactionTrend = $this->getTransactionTrend($period);

        return response()->json([
            'period' => $period,
            'date_range' => $dateRange,
            'revenue' => [
                'total_revenue' => (float) $totalRevenue,
                'total_commissions' => (float) $totalCommissions,
                'commission_rate' => $commissionRate * 100,
                'net_revenue' => (float) ($totalRevenue - $totalCommissions),
            ],
            'transactions' => [
                'total_transactions' => $totalTransactions,
                'successful_transactions' => $successfulTransactions->count(),
                'failed_transactions' => $failedTransactions->count(),
                'pending_transactions' => $pendingTransactions->count(),
                'success_rate' => $successRate,
                'average_amount' => (float) $averageTransactionAmount,
                'total_volume' => (float) $successfulTransactions->sum('amount'),
            ],
            'alerts' => $alerts,
            'trends' => [
                'revenue_trend' => $revenueTrend,
                'transaction_trend' => $transactionTrend,
            ],
            'updated_at' => now()->toISOString(),
        ]);
    }

    public function transactions(Request $request): JsonResponse
    {
        $query = Payment::with([
            'invoice.lease.property.landlord.user',
            'invoice.lease.tenant.user'
        ])->where('payment_method', 'fedapay');

        // Filtres
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        if ($request->filled('amount_min')) {
            $query->where('amount', '>=', $request->amount_min);
        }

        if ($request->filled('amount_max')) {
            $query->where('amount', '<=', $request->amount_max);
        }

        if ($request->filled('transaction_id')) {
            $query->where('transaction_id', 'like', "%{$request->transaction_id}%");
        }

        if ($request->filled('tenant_email')) {
            $query->whereHas('invoice.lease.tenant.user', function($q) use ($request) {
                $q->where('email', 'like', "%{$request->tenant_email}%");
            });
        }

        if ($request->filled('landlord_email')) {
            $query->whereHas('invoice.lease.property.landlord.user', function($q) use ($request) {
                $q->where('email', 'like', "%{$request->landlord_email}%");
            });
        }

        // Tri
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        
        if (in_array($sortBy, ['created_at', 'amount', 'status'])) {
            $query->orderBy($sortBy, $sortOrder);
        }

        $transactions = $query->paginate($request->get('per_page', 25));

        return response()->json([
            'data' => $transactions->items(),
            'meta' => [
                'current_page' => $transactions->currentPage(),
                'last_page' => $transactions->lastPage(),
                'per_page' => $transactions->perPage(),
                'total' => $transactions->total(),
            ],
        ]);
    }

    public function reports(Request $request): JsonResponse
    {
        $request->validate([
            'type' => 'required|in:revenue,transactions,commissions',
            'format' => 'required|in:csv,pdf',
            'period' => 'required|in:day,week,month,quarter,year,custom',
            'date_from' => 'required_if:period,custom|date',
            'date_to' => 'required_if:period,custom|date|after_or_equal:date_from',
        ]);

        $dateRange = $this->getDateRange($request->period, $request->date_from, $request->date_to);

        switch ($request->type) {
            case 'revenue':
                return $this->generateRevenueReport($dateRange, $request->format);
            case 'transactions':
                return $this->generateTransactionReport($dateRange, $request->format);
            case 'commissions':
                return $this->generateCommissionReport($dateRange, $request->format);
        }
    }

    public function alerts(Request $request): JsonResponse
    {
        $period = $request->get('period', 'week');
        $dateRange = $this->getDateRange($period);

        $alerts = $this->getFinancialAlerts($dateRange);

        return response()->json([
            'alerts' => $alerts,
            'period' => $period,
            'date_range' => $dateRange,
            'total_alerts' => count($alerts),
            'updated_at' => now()->toISOString(),
        ]);
    }

    private function getDateRange(string $period, ?string $customStart = null, ?string $customEnd = null): array
    {
        $now = now();

        return match($period) {
            'day' => [
                'start' => $now->copy()->startOfDay(),
                'end' => $now->copy()->endOfDay(),
            ],
            'week' => [
                'start' => $now->copy()->startOfWeek(),
                'end' => $now->copy()->endOfWeek(),
            ],
            'month' => [
                'start' => $now->copy()->startOfMonth(),
                'end' => $now->copy()->endOfMonth(),
            ],
            'quarter' => [
                'start' => $now->copy()->startOfQuarter(),
                'end' => $now->copy()->endOfQuarter(),
            ],
            'year' => [
                'start' => $now->copy()->startOfYear(),
                'end' => $now->copy()->endOfYear(),
            ],
            'custom' => [
                'start' => Carbon::parse($customStart)->startOfDay(),
                'end' => Carbon::parse($customEnd)->endOfDay(),
            ],
            default => [
                'start' => $now->copy()->startOfMonth(),
                'end' => $now->copy()->endOfMonth(),
            ],
        };
    }

    private function getFinancialAlerts(array $dateRange): array
    {
        $alerts = [];

        // 1. Paiements échoués élevés
        $failedPaymentsThreshold = config('gestiloc.alerts.failed_payments_threshold', 10);
        $failedPaymentsCount = Payment::where('payment_method', 'fedapay')
            ->where('status', 'failed')
            ->whereBetween('created_at', [$dateRange['start'], $dateRange['end']])
            ->count();

        if ($failedPaymentsCount >= $failedPaymentsThreshold) {
            $alerts[] = [
                'type' => 'high_failed_payments',
                'severity' => 'high',
                'title' => 'Taux d\'échec élevé',
                'description' => "{$failedPaymentsCount} paiements échoués sur la période",
                'threshold' => $failedPaymentsThreshold,
                'current_value' => $failedPaymentsCount,
                'created_at' => now()->toISOString(),
            ];
        }

        // 2. Fraudes suspectées (multiples tentatives depuis même IP)
        $suspiciousTransactions = Payment::where('payment_method', 'fedapay')
            ->where('status', 'failed')
            ->whereBetween('created_at', [$dateRange['start'], $dateRange['end']])
            ->select('ip_address', DB::raw('count(*) as attempt_count'))
            ->groupBy('ip_address')
            ->having('attempt_count', '>=', 5)
            ->get();

        if ($suspiciousTransactions->count() > 0) {
            $alerts[] = [
                'type' => 'suspicious_activity',
                'severity' => 'critical',
                'title' => 'Activité suspectée détectée',
                'description' => 'Multiples tentatives de paiement échouées depuis mêmes adresses IP',
                'details' => $suspiciousTransactions->toArray(),
                'created_at' => now()->toISOString(),
            ];
        }

        // 3. Seuil de revenus dépassé (positif)
        $revenueThreshold = config('gestiloc.alerts.revenue_threshold', 1000000);
        $currentRevenue = Invoice::where('status', 'paid')
            ->whereBetween('paid_at', [$dateRange['start'], $dateRange['end']])
            ->sum('amount_paid');

        if ($currentRevenue >= $revenueThreshold) {
            $alerts[] = [
                'type' => 'revenue_threshold_exceeded',
                'severity' => 'info',
                'title' => 'Seuil de revenus dépassé',
                'description' => 'Objectif de revenus atteint ou dépassé',
                'threshold' => $revenueThreshold,
                'current_value' => $currentRevenue,
                'created_at' => now()->toISOString(),
            ];
        }

        // 4. Transactions en attente prolongées
        $pendingThreshold = config('gestiloc.alerts.pending_threshold', 24); // heures
        $oldPendingTransactions = Payment::where('payment_method', 'fedapay')
            ->where('status', 'pending')
            ->where('created_at', '<', now()->subHours($pendingThreshold))
            ->count();

        if ($oldPendingTransactions > 0) {
            $alerts[] = [
                'type' => 'old_pending_transactions',
                'severity' => 'medium',
                'title' => 'Transactions en attente prolongées',
                'description' => "{$oldPendingTransactions} transactions en attente depuis plus de {$pendingThreshold}h",
                'threshold' => $pendingThreshold,
                'current_value' => $oldPendingTransactions,
                'created_at' => now()->toISOString(),
            ];
        }

        // 5. Volume anormal de transactions
        $avgDailyTransactions = $this->getAverageDailyTransactions();
        $todayTransactions = Payment::where('payment_method', 'fedapay')
            ->whereDate('created_at', now())
            ->count();

        $anomalyThreshold = $avgDailyTransactions * 3; // 3x la moyenne
        if ($todayTransactions > $anomalyThreshold) {
            $alerts[] = [
                'type' => 'transaction_volume_anomaly',
                'severity' => 'high',
                'title' => 'Volume de transactions anormal',
                'description' => "Volume aujourd'hui ({$todayTransactions}) largement supérieur à la moyenne ({$avgDailyTransactions})",
                'average' => $avgDailyTransactions,
                'current_value' => $todayTransactions,
                'threshold' => $anomalyThreshold,
                'created_at' => now()->toISOString(),
            ];
        }

        return $alerts;
    }

    private function getRevenueTrend(string $period): array
    {
        $data = [];
        $points = match($period) {
            'day' => 24,
            'week' => 7,
            'month' => 30,
            'quarter' => 12,
            'year' => 12,
            default => 30,
        };

        for ($i = $points - 1; $i >= 0; $i--) {
            $date = match($period) {
                'day' => now()->copy()->subHours($i),
                'week' => now()->copy()->subDays($i),
                'month' => now()->copy()->subDays($i),
                'quarter' => now()->copy()->subWeeks($i),
                'year' => now()->copy()->subMonths($i),
                default => now()->copy()->subDays($i),
            };

            $revenue = Invoice::where('status', 'paid')
                ->whereDate('paid_at', $date->toDateString())
                ->sum('amount_paid');

            $data[] = [
                'date' => $date->format('Y-m-d H:i:s'),
                'label' => $date->format($period === 'day' ? 'H:i' : 'd/m'),
                'revenue' => (float) $revenue,
            ];
        }

        return $data;
    }

    private function getTransactionTrend(string $period): array
    {
        $data = [];
        $points = match($period) {
            'day' => 24,
            'week' => 7,
            'month' => 30,
            'quarter' => 12,
            'year' => 12,
            default => 30,
        };

        for ($i = $points - 1; $i >= 0; $i--) {
            $date = match($period) {
                'day' => now()->copy()->subHours($i),
                'week' => now()->copy()->subDays($i),
                'month' => now()->copy()->subDays($i),
                'quarter' => now()->copy()->subWeeks($i),
                'year' => now()->copy()->subMonths($i),
                default => now()->copy()->subDays($i),
            };

            $transactions = Payment::where('payment_method', 'fedapay')
                ->whereDate('created_at', $date->toDateString())
                ->count();

            $data[] = [
                'date' => $date->format('Y-m-d H:i:s'),
                'label' => $date->format($period === 'day' ? 'H:i' : 'd/m'),
                'transactions' => $transactions,
            ];
        }

        return $data;
    }

    private function getAverageDailyTransactions(): float
    {
        $last30Days = now()->subDays(30);
        
        return Payment::where('payment_method', 'fedapay')
            ->where('created_at', '>=', $last30Days)
            ->count() / 30;
    }

    private function generateRevenueReport(array $dateRange, string $format): StreamedResponse
    {
        $data = Invoice::where('status', 'paid')
            ->whereBetween('paid_at', [$dateRange['start'], $dateRange['end']])
            ->with(['lease.property.landlord.user', 'lease.tenant.user'])
            ->get()
            ->map(function ($invoice) {
                return [
                    'Date' => $invoice->paid_at->format('d/m/Y H:i'),
                    'Référence' => $invoice->invoice_number,
                    'Propriétaire' => $invoice->lease->property->landlord->user->email,
                    'Locataire' => $invoice->lease->tenant->user->email,
                    'Bien' => $invoice->lease->property->name,
                    'Montant' => $invoice->amount_paid,
                    'Statut' => $invoice->status,
                ];
            });

        $filename = "revenus_{$dateRange['start']->format('Y-m-d')}_{$dateRange['end']->format('Y-m-d')}";

        return $this->exportData($data, $filename, $format);
    }

    private function generateTransactionReport(array $dateRange, string $format): StreamedResponse
    {
        $data = Payment::where('payment_method', 'fedapay')
            ->whereBetween('created_at', [$dateRange['start'], $dateRange['end']])
            ->with(['invoice.lease.property.landlord.user', 'invoice.lease.tenant.user'])
            ->get()
            ->map(function ($payment) {
                return [
                    'Date' => $payment->created_at->format('d/m/Y H:i'),
                    'ID Transaction' => $payment->transaction_id,
                    'Propriétaire' => $payment->invoice?->lease?->property?->landlord?->user?->email,
                    'Locataire' => $payment->invoice?->lease?->tenant?->user?->email,
                    'Montant' => $payment->amount,
                    'Devise' => $payment->currency ?? 'XOF',
                    'Statut' => $payment->status,
                    'Méthode' => $payment->payment_method,
                    'IP Adresse' => $payment->ip_address,
                ];
            });

        $filename = "transactions_fedapay_{$dateRange['start']->format('Y-m-d')}_{$dateRange['end']->format('Y-m-d')}";

        return $this->exportData($data, $filename, $format);
    }

    private function generateCommissionReport(array $dateRange, string $format): StreamedResponse
    {
        $commissionRate = config('gestiloc.commission_rate', 0.05);
        
        $data = Invoice::where('status', 'paid')
            ->whereBetween('paid_at', [$dateRange['start'], $dateRange['end']])
            ->with(['lease.property.landlord.user'])
            ->get()
            ->groupBy('lease.property.landlord_id')
            ->map(function ($invoices, $landlordId) {
                $landlord = $invoices->first()->lease->property->landlord;
                $totalRevenue = $invoices->sum('amount_paid');
                $commission = $totalRevenue * $commissionRate;

                return [
                    'Propriétaire' => $landlord->user->email,
                    'Nom' => $landlord->first_name . ' ' . $landlord->last_name,
                    'Entreprise' => $landlord->company_name,
                    'Revenus Totaux' => $totalRevenue,
                    'Commission (5%)' => $commission,
                    'Revenus Nets' => $totalRevenue - $commission,
                    'Nombre Transactions' => $invoices->count(),
                ];
            });

        $filename = "commissions_{$dateRange['start']->format('Y-m-d')}_{$dateRange['end']->format('Y-m-d')}";

        return $this->exportData($data, $filename, $format);
    }

    private function exportData($data, string $filename, string $format): StreamedResponse
    {
        if ($format === 'csv') {
            $headers = [
                'Content-Type' => 'text/csv',
                'Content-Disposition' => "attachment; filename=\"{$filename}.csv\"",
            ];

            $callback = function () use ($data) {
                $file = fopen('php://output', 'w');
                
                // En-tête CSV
                if ($data->isNotEmpty()) {
                    fputcsv($file, array_keys($data->first()));
                }
                
                // Données
                foreach ($data as $row) {
                    fputcsv($file, $row);
                }
                
                fclose($file);
            };

            return response()->stream($callback, 200, $headers);
        }

        // Pour PDF, vous pourriez intégrer une librairie comme DomPDF
        // Pour l'instant, retourner une réponse d'erreur
        return response()->json([
            'message' => 'Export PDF non implémenté - utiliser CSV',
            'filename' => "{$filename}.csv"
        ], 501);
    }
}
