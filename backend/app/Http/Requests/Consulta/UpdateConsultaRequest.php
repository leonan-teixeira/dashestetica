<?php

namespace App\Http\Requests\Consulta;

use Illuminate\Foundation\Http\FormRequest;

class UpdateConsultaRequest extends FormRequest
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
            'inicio'                    => ['sometimes', 'date'],
            'fim'                       => ['sometimes', 'date', 'after:inicio'],
            'procedimentos'             => ['sometimes', 'array', 'min:1'],
            'procedimentos.*'           => ['integer', 'exists:procedimentos,id'],
            'observacoes'               => ['nullable', 'string'],
            'evolucao_clinica'          => ['nullable', 'string'],
            'forma_pagamento'           => ['nullable', 'string', 'max:50'],
            'valor_total'               => ['nullable', 'numeric', 'min:0'],
            'pago'                      => ['boolean'],
            'proxima_recomendacao_dias' => ['nullable', 'integer', 'min:1'],
        ];
    }
}
