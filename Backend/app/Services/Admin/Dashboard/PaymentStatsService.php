<?php

namespace App\Services\Admin\Dashboard;

use App\Models\Payment;

class PaymentStatsService
{
    public function overview(): array
    {
        $totalPayments = Payment::count();
        $fedapayPayments = Payment::where('payment_method', 'fedapay')->count();
        $successfulPayments = Payment::where('status', 'completed')->count();
        $failedPayments = Payment::where('status', 'failed')->count();

        $fedapayConversionRate = $fedapayPayments > 0
            ? round(($successfulPayments / $fedapayPayments) * 100, 1)
            : 0;

        return [
            'total_payments' => $totalPayments,
            'fedapay_payments' => $fedapayPayments,
            'successful_payments' => $successfulPayments,
            'failed_payments' => $failedPayments,
            'fedapay_conversion_rate' => $fedapayConversionRate,
        ];
    }

    public function recentPayments(int $limit = 5): array
    {
        return Payment::with(['invoice.lease.property.landlord.user', 'invoice.lease.tenant.user'])
            ->where('status', 'completed')
            ->latest()
            ->take($limit)
            ->get()
            ->map(fn($payment) => [
                'amount' => (float) $payment->amount_total,
                'currency' => $payment->currency ?? 'XOF',
                'method' => $payment->payment_method,
                'tenant' => $payment->tenant?->user?->email,
                'property' => $payment->lease?->property?->name,
                'paid_at' => $payment->paid_at?->toISOString(),
            ])
            ->toArray();
    }
}
