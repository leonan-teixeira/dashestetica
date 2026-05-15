<?php

namespace App\Http\Requests\Paciente;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePacienteRequest extends FormRequest
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
            'nome_completo'        => ['sometimes', 'string', 'min:3', 'max:255'],
            'data_nascimento'      => ['nullable', 'date'],
            'telefone'             => ['sometimes', 'string', 'min:10', 'max:20'],
            'email'                => ['nullable', 'email', 'max:255'],
            'endereco'             => ['nullable', 'array'],
            'endereco.cep'         => ['nullable', 'string', 'max:9'],
            'endereco.rua'         => ['nullable', 'string', 'max:255'],
            'endereco.numero'      => ['nullable', 'string', 'max:20'],
            'endereco.complemento' => ['nullable', 'string', 'max:100'],
            'endereco.bairro'      => ['nullable', 'string', 'max:100'],
            'endereco.cidade'      => ['nullable', 'string', 'max:100'],
            'endereco.uf'          => ['nullable', 'string', 'size:2'],
            'observacoes_gerais'   => ['nullable', 'string'],
        ];
    }
}
