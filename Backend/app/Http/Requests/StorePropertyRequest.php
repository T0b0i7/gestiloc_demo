<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePropertyRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Les rôles sont gérés dans le controller
        return true;
    }

    public function rules(): array
    {
        return [
            // Type de bien (doit matcher ce que tu utilises côté front)
            'type' => 'required|string|in:apartment,house,office,commercial,parking,other',

            // Titre / nom du bien : on accepte title OU name
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

            // Détails techniques
            'surface'        => 'nullable|numeric|min:0|max:9999.99',
            'room_count'     => 'nullable|integer|min:0',
            'bedroom_count'  => 'nullable|integer|min:0',
            'bathroom_count' => 'nullable|integer|min:0',

            // Financier
            'rent_amount'    => 'nullable|numeric|min:0|max:999999.99',
            'charges_amount' => 'nullable|numeric|min:0|max:999999.99',

            // Statut : bien aligné avec la migration
            'status' => 'required|in:available,rented,maintenance,off_market',

            // Référence interne
            'reference_code' => 'nullable|string|regex:/^[A-Z0-9\-]+$/|max:50|unique:properties,reference_code',

            // Amenities
            'amenities'   => 'nullable|array',
            'amenities.*' => 'string',

            // Photos (ton front envoie un tableau d’URL, pas des fichiers ici)
            'photos'   => 'nullable|array',
            'photos.*' => 'string', // ou 'url' si tu veux strict

            // Meta (JSON libre)
            'meta' => 'nullable|array',
        ];
    }

    protected function prepareForValidation(): void
{
    // On recopie le titre dans name si besoin
    $this->merge([
        'name' => $this->input('name') ?? $this->input('title'),
    ]);

    // Si charges_amount est vide ou null → on met 0
    $charges = $this->input('charges_amount');

    if ($charges === null || $charges === '') {
        $this->merge([
            'charges_amount' => 0,
        ]);
    }
}

}
