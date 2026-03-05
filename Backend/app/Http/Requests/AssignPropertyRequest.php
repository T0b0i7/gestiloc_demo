<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AssignPropertyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'property_id' => [
                'required',
                'exists:properties,id',
            ],
            'lease_id' => [
                'nullable',
                'exists:leases,id',
            ],
            'start_date' => [
                'nullable',
                'date',
                'before_or_equal:end_date',
            ],
            'end_date' => [
                'nullable',
                'date',
                'after_or_equal:start_date',
            ],
            'role' => [
                'nullable',
                'in:tenant,co-tenant,occupant',
            ],
            'share_percentage' => [
                'nullable',
                'numeric',
                'min:0',
                'max:100',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'property_id.required' => 'Le bien est requis',
            'property_id.exists' => 'Le bien sélectionné n\'existe pas',
            'lease_id.exists' => 'Le bail sélectionné n\'existe pas',
            'start_date.date' => 'La date de début doit être une date valide',
            'start_date.before_or_equal' => 'La date de début doit être antérieure ou égale à la date de fin',
            'end_date.date' => 'La date de fin doit être une date valide',
            'end_date.after_or_equal' => 'La date de fin doit être postérieure ou égale à la date de début',
            'role.in' => 'Le rôle doit être l\'un des suivants: tenant, co-tenant, occupant',
            'share_percentage.numeric' => 'Le pourcentage doit être un nombre',
            'share_percentage.min' => 'Le pourcentage ne peut pas être négatif',
            'share_percentage.max' => 'Le pourcentage ne peut pas dépasser 100%',
        ];
    }
}
