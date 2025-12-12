<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProfileRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
         $userId = auth()->id();
    return [
        'first_name' => 'required|string|max:50',
        'last_name' => 'required|string|max:50',
        'email' => 'required|email|unique:users,email,' . $userId, // Ignore l'email actuel
        'phone' => 'required|string|unique:users,phone,' . $userId,
        'address' => 'nullable|string', // Pour le bailleur
        'ifu_number' => 'nullable|string', // Pour le bailleur (Bénin)
    ];
    }
}
