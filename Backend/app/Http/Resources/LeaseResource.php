<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class LeaseResource extends JsonResource
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
            'uuid' => $this->uuid,
            'property_id' => $this->property_id,
            'tenant_id' => $this->tenant_id,

            'property' => $this->whenLoaded('property', function () {
                $p = $this->property;

                $landlord = null;
                if ($p->relationLoaded('landlord') && $p->landlord) {
                    $l = $p->landlord;

                    $u = ($l->relationLoaded('user') && $l->user) ? $l->user : null;

                    // Nom = company_name si présent, sinon first_name + last_name
                    $name = $l->company_name
                        ? $l->company_name
                        : trim(($l->first_name ?? '') . ' ' . ($l->last_name ?? ''));

                    $landlord = $this->clean([
                        'id' => $l->id,
                        'full_name' => $name !== '' ? $name : null,
                        'email' => $u?->email ?? null,
                        'phone' => $u?->phone ?? null,
                    ]);
                }

                return $this->clean([
                    'id' => $p->id,
                    'address' => $p->address,
                    'city' => $p->city,

                    // ton modèle Property utilise zip_code
                    'zip_code' => $p->zip_code,
                    // compat si ton front lit postal_code
                    'postal_code' => $p->zip_code,

                    'surface' => (float) $p->surface,
                    'room_count' => (int) $p->room_count,
                    'bathroom_count' => $p->bathroom_count !== null ? (int) $p->bathroom_count : null,

                    // photos = cast array
                    'photos' => is_array($p->photos) ? $p->photos : [],

                    'landlord' => $landlord,
                ]);
            }),

            'start_date' => optional($this->start_date)->format('Y-m-d'),
            'end_date' => $this->end_date ? $this->end_date->format('Y-m-d') : null,

            'rent_amount' => (float) ($this->rent_amount ?? 0),
            'charges_amount' => (float) ($this->charges_amount ?? 0),

            // ton modèle Lease utilise guarantee_amount (pas deposit)
            'deposit' => $this->guarantee_amount !== null ? (float) $this->guarantee_amount : null,
            'guarantee_amount' => $this->guarantee_amount !== null ? (float) $this->guarantee_amount : null,

            'status' => $this->status,

            'invoices' => $this->whenLoaded('invoices', function () {
                return $this->invoices->map(function ($invoice) {
                    return $this->clean([
                        'id' => $invoice->id,
                        'amount' => (float) $invoice->amount,
                        'due_date' => optional($invoice->due_date)->format('Y-m-d'),
                        'status' => $invoice->status,
                        'type' => $invoice->type,
                        'created_at' => optional($invoice->created_at)->toDateTimeString(),
                        'updated_at' => optional($invoice->updated_at)->toDateTimeString(),
                    ]);
                })->values();
            }),

            'created_at' => optional($this->created_at)->toDateTimeString(),
            'updated_at' => optional($this->updated_at)->toDateTimeString(),
        ]);
    }
}
