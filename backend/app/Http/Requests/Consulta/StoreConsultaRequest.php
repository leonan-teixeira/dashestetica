<?php

namespace App\Http\Requests\Consulta;

use Illuminate\Foundation\Http\FormRequest;

class StoreConsultaRequest extends FormRequest
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
            'paciente_id'               => ['required', 'integer', 'exists:pacientes,id'],
            'inicio'                    => ['required', 'date', 'after:now'],
            'fim'                       => ['required', 'date', 'after:inicio'],
            'procedimentos'             => ['required', 'array', 'min:1'],
            'procedimentos.*'           => ['integer', 'exists:procedimentos,id'],
            'observacoes'               => ['nullable', 'string'],
            'forma_pagamento'           => ['nullable', 'string', 'max:50'],
            'proxima_recomendacao_dias' => ['nullable', 'integer', 'min:1'],
            'criar_lembretes'           => ['boolean'],
        ];
    }
}
