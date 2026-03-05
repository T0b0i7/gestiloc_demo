<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePropertyRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Les rôles sont gérés dans le controller
        return true;
    }

    public function rules(): array
    {
        /**
         * IMPORTANT
         * Compatible avec :
         * - PUT /properties/{id}
         * - PUT /properties/{property} (model binding)
         */
        $routeProperty = $this->route('property');
        $propertyId = is_object($routeProperty) ? $routeProperty->id : $routeProperty;
        $propertyId = $propertyId ?: $this->route('id');

        return [
            // Type de bien
            'type' => 'required|string|in:apartment,house,office,commercial,parking,other',

            // Nom / Titre
            'title' => 'nullable|string|max:255|required_without:name',
            'name'  => 'nullable|string|max:255|required_without:title',

            // Description
            'description' => 'nullable|string|max:2000',

            // Adresse
            'address'  => 'required|string|max:500',
            'district' => 'nullable|string|max:255',
            'city'     => 'required|string|max:100',
            'state'    => 'nullable|string|max:100',
            'zip_code' => 'nullable|string|max:20',

            // Géoloc
            'latitude'  => 'nullable|numeric',
            'longitude' => 'nullable|numeric',

            // Caractéristiques
            'surface'        => 'nullable|numeric|min:0|max:9999.99',
            'room_count'     => 'nullable|integer|min:0',
            'bedroom_count'  => 'nullable|integer|min:0',
            'bathroom_count' => 'nullable|integer|min:0',

            // Financier
            'rent_amount'    => 'nullable|numeric|min:0|max:999999.99',
            'charges_amount' => 'nullable|numeric|min:0|max:999999.99',

            // Statut
            'status' => 'required|in:available,rented,maintenance,off_market',

            /**
             * ✅ FIX MAJEUR
             * unique MAIS on ignore l’ID du bien en cours (UPDATE)
             */
            'reference_code' => [
                'nullable',
                'string',
                'regex:/^[A-Z0-9\-]+$/',
                'max:50',
                Rule::unique('properties', 'reference_code')->ignore($propertyId),
            ],

            // Amenities
            'amenities'   => 'nullable|array',
            'amenities.*' => 'string',

            // Photos (URLs)
            'photos'   => 'nullable|array',
            'photos.*' => 'string',

            // Meta
            'meta' => 'nullable|array',
        ];
    }

    protected function prepareForValidation(): void
    {
        // Si title est fourni → on le copie dans name
        $this->merge([
            'name' => $this->input('name') ?? $this->input('title'),
        ]);

        // charges_amount vide → 0
        if ($this->input('charges_amount') === null || $this->input('charges_amount') === '') {
            $this->merge([
                'charges_amount' => 0,
            ]);
        }
    }
}
