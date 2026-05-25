<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MovimentacaoEstoqueResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'             => $this->id,
            'produto_id'     => $this->produto_id,
            'produto'        => $this->whenLoaded('produto', fn () => [
                'id'    => $this->produto->id,
                'nome'  => $this->produto->nome,
                'unidade' => $this->produto->unidade,
            ]),
            'tipo'           => $this->tipo,
            'quantidade'     => (float) $this->quantidade,
            'preco_unitario' => $this->preco_unitario !== null ? (float) $this->preco_unitario : null,
            'valor_total'    => $this->preco_unitario !== null
                ? round((float) $this->quantidade * (float) $this->preco_unitario, 2)
                : null,
            'motivo'         => $this->motivo,
            'observacao'     => $this->observacao,
            'created_at'     => $this->created_at?->toISOString(),
        ];
    }
}
