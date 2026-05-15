<?php

namespace App\Http\Requests\Procedimento;

use Illuminate\Foundation\Http\FormRequest;

class StoreProcedimentoRequest extends FormRequest
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
            'nome'             => ['required', 'string', 'max:255'],
            'descricao'        => ['nullable', 'string'],
            'duracao_minutos'  => ['required', 'integer', 'min:5', 'max:480'],
            'preco'            => ['required', 'numeric', 'min:0'],
            'categoria'        => ['nullable', 'string', 'max:100'],
            'ativo'            => ['boolean'],
        ];
    }
}
