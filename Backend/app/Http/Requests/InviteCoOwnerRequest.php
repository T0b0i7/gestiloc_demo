<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class InviteCoOwnerRequest extends FormRequest
{
    public function authorize(): bool
    {
        // controller checks landlord role, keep true here
        return true;
    }

    public function rules(): array
    {
        // Règles de base pour tous
        $rules = [
            'invitation_type' => 'required|in:co_owner,agency',
            'email' => 'required|email',
            'first_name' => 'required|string|max:100',
            'last_name' => 'required|string|max:100',
            'phone' => 'nullable|string|max:20',
            'company_name' => 'nullable|string|max:255',
            'license_number' => 'nullable|string|max:100',
            'address_billing' => 'nullable|string|max:500',
            'ifu' => 'nullable|string|max:50',
            'rccm' => 'nullable|string|max:50',
            'vat_number' => 'nullable|string|max:50',
        ];

        // Règles conditionnelles pour les agences
        if ($this->input('invitation_type') === 'agency') {
            $rules['ifu'] = 'required|string|max:50';
            $rules['rccm'] = 'required|string|max:50';
        }

        return $rules;
    }

    public function messages(): array
    {
        return [
            'invitation_type.required' => 'Le type d\'invitation est obligatoire',
            'invitation_type.in' => 'Le type d\'invitation doit être "co_owner" ou "agency"',
            'email.required' => 'L\'email est obligatoire',
            'email.email' => 'L\'email doit être valide',
            'first_name.required' => 'Le prénom est obligatoire',
            'first_name.max' => 'Le prénom ne doit pas dépasser 100 caractères',
            'last_name.required' => 'Le nom est obligatoire',
            'last_name.max' => 'Le nom ne doit pas dépasser 100 caractères',
            'ifu.required' => 'L\'IFU est obligatoire pour une agence',
            'rccm.required' => 'Le RCCM est obligatoire pour une agence',
        ];
    }

    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            // Si c'est une agence, on force is_professional à true
            if ($this->input('invitation_type') === 'agency') {
                $this->merge(['is_professional' => true]);
            } else {
                // Si c'est un co-propriétaire, is_professional est false par défaut
                $this->merge(['is_professional' => false]);
            }
        });
    }

    public function validated($key = null, $default = null)
    {
        // Inclure is_professional dans les données validées
        $validated = parent::validated();
        $validated['is_professional'] = $this->input('is_professional', false);
        
        return $key ? ($validated[$key] ?? $default) : $validated;
    }
}