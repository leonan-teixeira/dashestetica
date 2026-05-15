<?php

namespace App\Http\Requests\Procedimento;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProcedimentoRequest extends FormRequest
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
            'nome'            => ['sometimes', 'string', 'max:255'],
            'descricao'       => ['nullable', 'string'],
            'duracao_minutos' => ['sometimes', 'integer', 'min:5', 'max:480'],
            'preco'           => ['sometimes', 'numeric', 'min:0'],
            'categoria'       => ['nullable', 'string', 'max:100'],
            'ativo'           => ['boolean'],
        ];
    }
}
