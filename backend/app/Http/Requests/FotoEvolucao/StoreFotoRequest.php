<?php

namespace App\Http\Requests\FotoEvolucao;

use Illuminate\Foundation\Http\FormRequest;

class StoreFotoRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'fotos'          => ['required', 'array', 'min:1', 'max:10'],
            'fotos.*'        => ['required', 'file', 'image', 'mimes:jpeg,jpg,png,webp', 'max:10240'],
            'tipo'           => ['required', 'string', 'in:antes,durante,depois'],
            'observacao'     => ['nullable', 'string', 'max:500'],
        ];
    }
}
