<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ClinicaResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                => $this->id,
            'nome'              => $this->nome,
            'email_contato'     => $this->email_contato,
            'telefone'          => $this->telefone,
            'cnpj'              => $this->cnpj,
            'endereco'          => $this->endereco,
            'assinatura_inicio' => $this->assinatura_inicio?->toDateString(),
            'assinatura_fim'    => $this->assinatura_fim?->toDateString(),
            'plano'             => $this->plano,
            'ativo'             => $this->ativo,
            'assinatura_ativa'  => $this->assinaturaAtiva(),
            'usuario'           => $this->whenLoaded('users', fn () => $this->users->first()?->only(['id', 'name', 'email'])),
            'created_at'        => $this->created_at->toDateString(),
        ];
    }
}
