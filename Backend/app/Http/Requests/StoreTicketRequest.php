<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTicketRequest extends FormRequest
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
        return [
        'subject' => 'required|string|max:150',
        'description' => 'required|string|min:10',
        'priority' => 'required|in:low,medium,high,emergency',
        'photos.*' => 'nullable|image|max:5120', // Max 5MB par photo
    ];
    }
}
