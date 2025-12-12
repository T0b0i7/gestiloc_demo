<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray($request)
    {
        $data = [
            'id' => $this->id,
            'email' => $this->email,
            'phone' => $this->phone,
            'avatar_url' => $this->avatar_path ? asset('storage/' . $this->avatar_path) : null,
            'role' => $this->landlord ? 'landlord' : ($this->tenant ? 'tenant' : 'admin'),
            'created_at' => $this->created_at->format('d/m/Y'),
        ];

        // Fusionner les données spécifiques
        if ($this->relationLoaded('landlord') && $this->landlord) {
            $data = array_merge($data, [
                'first_name' => $this->landlord->first_name,
                'last_name' => $this->landlord->last_name,
                'company_name' => $this->landlord->company_name,
                'address' => $this->landlord->address_billing,
                'ifu' => $this->landlord->vat_number,
            ]);
        } elseif ($this->relationLoaded('tenant') && $this->tenant) {
            $data = array_merge($data, [
                'first_name' => $this->tenant->first_name,
                'last_name' => $this->tenant->last_name,
                'status' => $this->tenant->status,
                'solvency_score' => $this->tenant->solvency_score,
            ]);
        }

        return $data;
    }
}