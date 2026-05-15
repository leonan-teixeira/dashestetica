<?php

namespace App\Http\Requests\Anamnese;

use Illuminate\Foundation\Http\FormRequest;

class StoreAnamneseRequest extends FormRequest
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
            'alergias'                  => ['nullable', 'string'],
            'medicamentos_uso_continuo' => ['nullable', 'string'],
            'condicoes_pre_existentes'  => ['nullable', 'string'],
            'gestante'                  => ['boolean'],
            'amamentando'               => ['boolean'],
            'usa_anticoncepcional'      => ['boolean'],
            'fumante'                   => ['boolean'],
            'pratica_atividade_fisica'  => ['boolean'],
            'objetivo_tratamento'       => ['nullable', 'string'],
            'observacoes'               => ['nullable', 'string'],
            'respondida_em'             => ['nullable', 'date'],
        ];
    }
}
