<?php

namespace App\Http\Requests\Tenant;

use Illuminate\Foundation\Http\FormRequest;

class StoreTicketRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'subject'     => 'required|string|max:150',
            'description' => 'required|string|min:10',
            'priority'    => 'required|in:low,medium,high,emergency',
            'photos.*'    => 'nullable|image|max:5120',
        ];
    }
}
