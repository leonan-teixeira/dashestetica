<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AnamneseResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'                        => $this->id,
            'paciente_id'               => $this->paciente_id,
            'alergias'                  => $this->alergias,
            'medicamentos_uso_continuo' => $this->medicamentos_uso_continuo,
            'condicoes_pre_existentes'  => $this->condicoes_pre_existentes,
            'gestante'                  => $this->gestante,
            'amamentando'               => $this->amamentando,
            'usa_anticoncepcional'      => $this->usa_anticoncepcional,
            'fumante'                   => $this->fumante,
            'pratica_atividade_fisica'  => $this->pratica_atividade_fisica,
            'objetivo_tratamento'       => $this->objetivo_tratamento,
            'observacoes'               => $this->observacoes,
            'respondida_em'             => $this->respondida_em?->toIso8601String(),
            'updated_at'                => $this->updated_at->toIso8601String(),
        ];
    }
}
