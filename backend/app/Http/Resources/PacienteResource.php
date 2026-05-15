<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PacienteResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'                      => $this->id,
            'nome_completo'           => $this->nome_completo,
            'cpf'                     => $this->cpf,
            'data_nascimento'         => $this->data_nascimento?->toDateString(),
            'telefone'                => $this->telefone,
            'email'                   => $this->email,
            'endereco'                => $this->endereco,
            'foto_perfil_path'        => $this->foto_perfil_path,
            'observacoes_gerais'      => $this->observacoes_gerais,
            'consentimento_aceito_em' => $this->consentimento_aceito_em?->toIso8601String(),
            'consentimento_versao'    => $this->consentimento_versao,
            'anonimizado_em'          => $this->anonimizado_em?->toIso8601String(),
            'created_at'              => $this->created_at->toIso8601String(),
            'anamnese'                => new AnamneseResource($this->whenLoaded('anamnese')),
        ];
    }
}
