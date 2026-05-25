<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
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
            'name'            => $this->name,
            'email'           => $this->email,
            'clinica_id'      => $this->clinica_id,
            'is_super_admin'  => $this->is_super_admin,
            'clinica'         => $this->whenLoaded('clinica', fn () => [
                'id'               => $this->clinica->id,
                'nome'             => $this->clinica->nome,
                'assinatura_ativa' => $this->clinica->assinaturaAtiva(),
                'assinatura_fim'   => $this->clinica->assinatura_fim?->toDateString(),
            ]),
        ];
    }
}
