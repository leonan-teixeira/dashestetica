<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LembreteResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'            => $this->id,
            'consulta_id'   => $this->consulta_id,
            'paciente_id'   => $this->paciente_id,
            'tipo'          => $this->tipo,
            'canal'         => $this->canal,
            'agendado_para' => $this->agendado_para->toIso8601String(),
            'enviado_em'    => $this->enviado_em?->toIso8601String(),
            'status'        => $this->status,
            'tentativas'    => $this->tentativas,
            'ultimo_erro'   => $this->ultimo_erro,
            'mensagem'      => $this->mensagem,
            'created_at'    => $this->created_at->toIso8601String(),
            'paciente'      => $this->whenLoaded('paciente', fn () => [
                'id'            => $this->paciente->id,
                'nome_completo' => $this->paciente->nome_completo,
            ]),
        ];
    }
}
