<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class DelegatePropertyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->user()->isLandlord();
    }

    public function rules(): array
    {
        return [
            'co_owner_id' => 'required|integer',
            'co_owner_type' => 'required|in:landlord,agency,co_owner',
            'expires_at' => 'nullable|date|after:today',
            'notes' => 'nullable|string|max:1000',
            'permissions' => 'nullable|array',
            'permissions.*' => 'string|in:manage_lease,collect_rent,manage_maintenance,send_invoices,manage_tenants,view_documents'
        ];
    }

    public function messages(): array
    {
        return [
            'co_owner_id.required' => 'Le copropriétaire est obligatoire',
            'co_owner_id.integer' => 'L\'identifiant du copropriétaire doit être un entier',
            'co_owner_type.required' => 'Le type de copropriétaire est obligatoire',
            'co_owner_type.in' => 'Le type doit être "landlord", "agency" ou "co_owner"',
            'expires_at.after' => 'La date d\'expiration doit être postérieure à aujourd\'hui',
            'permissions.*.in' => 'Permission non valide'
        ];
    }
}
