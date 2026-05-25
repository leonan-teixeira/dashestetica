<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProdutoResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'             => $this->id,
            'nome'           => $this->nome,
            'descricao'      => $this->descricao,
            'categoria'      => $this->categoria,
            'unidade'        => $this->unidade,
            'estoque_minimo' => (float) $this->estoque_minimo,
            'ativo'          => $this->ativo,
            'estoque_atual'  => $this->estoque_atual,
            'estoque_baixo'  => $this->estoque_baixo,
            'created_at'     => $this->created_at?->toISOString(),
            'updated_at'     => $this->updated_at?->toISOString(),
        ];
    }
}
