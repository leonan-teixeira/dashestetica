<?php

namespace App\Http\Requests\Consulta;

use Illuminate\Foundation\Http\FormRequest;

class UpdateStatusRequest extends FormRequest
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
            'status' => ['required', 'string', 'in:agendada,confirmada,realizada,cancelada,nao_compareceu'],
        ];
    }
}
