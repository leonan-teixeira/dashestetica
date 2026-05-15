<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ConsultaResource extends JsonResource
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
            'inicio'                    => $this->inicio->toIso8601String(),
            'fim'                       => $this->fim->toIso8601String(),
            'status'                    => $this->status,
            'valor_total'               => $this->valor_total,
            'forma_pagamento'           => $this->forma_pagamento,
            'pago'                      => $this->pago,
            'observacoes'               => $this->observacoes,
            'evolucao_clinica'          => $this->evolucao_clinica,
            'proxima_recomendacao_dias' => $this->proxima_recomendacao_dias,
            'created_at'                => $this->created_at->toIso8601String(),
            'paciente'                  => new PacienteResource($this->whenLoaded('paciente')),
            'procedimentos'             => ProcedimentoResource::collection($this->whenLoaded('procedimentos')),
            'fotos'                     => FotoEvolucaoResource::collection($this->whenLoaded('fotos')),
        ];
    }
}
