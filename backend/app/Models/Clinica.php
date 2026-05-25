<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Clinica extends Model
{
    protected $fillable = [
        'nome',
        'email_contato',
        'telefone',
        'cnpj',
        'endereco',
        'assinatura_inicio',
        'assinatura_fim',
        'plano',
        'ativo',
    ];

    protected function casts(): array
    {
        return [
            'endereco'          => 'array',
            'assinatura_inicio' => 'date',
            'assinatura_fim'    => 'date',
            'ativo'             => 'boolean',
        ];
    }

    public function assinaturaAtiva(): bool
    {
        if (! $this->ativo) {
            return false;
        }

        if ($this->assinatura_fim === null) {
            return true;
        }

        return $this->assinatura_fim->isFuture() || $this->assinatura_fim->isToday();
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }
}
