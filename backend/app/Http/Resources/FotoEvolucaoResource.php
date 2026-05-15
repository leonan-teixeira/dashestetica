<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FotoEvolucaoResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'            => $this->id,
            'paciente_id'   => $this->paciente_id,
            'consulta_id'   => $this->consulta_id,
            'tipo'          => $this->tipo,
            'url'           => route('fotos.stream', $this->id),
            'mime'          => $this->mime,
            'tamanho_bytes' => $this->tamanho_bytes,
            'largura'       => $this->largura,
            'altura'        => $this->altura,
            'observacao'    => $this->observacao,
            'created_at'    => $this->created_at->toIso8601String(),
        ];
    }
}
