<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProcedimentoResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'              => $this->id,
            'nome'            => $this->nome,
            'descricao'       => $this->descricao,
            'duracao_minutos' => $this->duracao_minutos,
            'preco'           => $this->preco,
            'categoria'       => $this->categoria,
            'ativo'           => $this->ativo,
            'created_at'      => $this->created_at->toIso8601String(),
        ];
    }
}
