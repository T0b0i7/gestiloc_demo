<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class InvoiceResource extends JsonResource
{
    private function clean(array $arr): array
    {
        // retire null / "" mais garde 0
        return array_filter($arr, function ($v) {
            if ($v === null) return false;
            if (is_string($v) && trim($v) === '') return false;
            return true;
        });
    }

    public function toArray($request)
    {
        return $this->clean([
            'id' => $this->id,
            'lease_id' => $this->lease_id,
            'invoice_number' => $this->invoice_number,
            'type' => $this->type,
            'due_date' => optional($this->due_date)->format('Y-m-d'),
            'period_start' => $this->period_start ? $this->period_start->format('Y-m-d') : null,
            'period_end' => $this->period_end ? $this->period_end->format('Y-m-d') : null,
            'amount_total' => (float) $this->amount_total,
            'amount_paid' => (float) $this->amount_paid,
            'balance_due' => (float) $this->balance_due,
            'payment_method' => $this->payment_method,
            'status' => $this->status,
            'pdf_path' => $this->pdf_path,
            'sent_at' => $this->sent_at ? $this->sent_at->format('Y-m-d H:i:s') : null,

            'lease' => $this->whenLoaded('lease', function () {
                $lease = $this->lease;

                $tenant = null;
                if ($lease->relationLoaded('tenant') && $lease->tenant) {
                    $t = $lease->tenant;
                    $u = ($t->relationLoaded('user') && $t->user) ? $t->user : null;

                    $tenant = $this->clean([
                        'id' => $t->id,
                        'full_name' => trim(($t->first_name ?? '') . ' ' . ($t->last_name ?? '')),
                        'email' => $u?->email ?? null,
                        'phone' => $u?->phone ?? null,
                    ]);
                }

                $property = null;
                if ($lease->relationLoaded('property') && $lease->property) {
                    $p = $lease->property;

                    $property = $this->clean([
                        'id' => $p->id,
                        'name' => $p->name,
                        'address' => $p->address,
                        'city' => $p->city,
                        'zip_code' => $p->zip_code,
                        'surface' => (float) $p->surface,
                        'room_count' => (int) $p->room_count,
                    ]);
                }

                return $this->clean([
                    'id' => $lease->id,
                    'rent_amount' => (float) ($lease->rent_amount ?? 0),
                    'charges_amount' => (float) ($lease->charges_amount ?? 0),
                    'tenant' => $tenant,
                    'property' => $property,
                ]);
            }),

            'transactions' => $this->whenLoaded('transactions', function () {
                return $this->transactions->map(function ($transaction) {
                    return $this->clean([
                        'id' => $transaction->id,
                        'amount' => (float) $transaction->amount,
                        'payment_method' => $transaction->payment_method,
                        'status' => $transaction->status,
                        'created_at' => optional($transaction->created_at)->toDateTimeString(),
                    ]);
                })->values();
            }),

            'created_at' => optional($this->created_at)->toDateTimeString(),
            'updated_at' => optional($this->updated_at)->toDateTimeString(),
        ]);
    }
}
