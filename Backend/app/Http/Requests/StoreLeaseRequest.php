<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreLeaseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // controller checks ownership and tenant
    }

    public function rules(): array
    {
        return [
            'property_id' => 'required|exists:properties,id',
            'tenant_id'   => 'required|exists:tenants,id',

            // ✅ autorise aujourd’hui
            'start_date'  => 'required|date|after_or_equal:today',
            'end_date'    => 'nullable|date|after_or_equal:start_date',

            'rent_amount' => 'required|numeric|min:0.01',
            'deposit'     => 'nullable|numeric|min:0',

            'type'        => 'required|in:nu,meuble',

            // ✅ statuts de bail (tu peux ajouter 'rented' ici seulement si ton Lease.status l’utilise vraiment)
            'status'      => 'nullable|in:pending,active,terminated',

            'terms'       => 'nullable|array',
            'terms.*'     => 'nullable|string',
        ];
    }
}
