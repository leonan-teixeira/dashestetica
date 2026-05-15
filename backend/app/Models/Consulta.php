<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use OwenIt\Auditing\Contracts\Auditable;

class Consulta extends Model implements Auditable
{
    use SoftDeletes, \OwenIt\Auditing\Auditable;

    protected $fillable = [
        'user_id',
        'paciente_id',
        'inicio',
        'fim',
        'status',
        'valor_total',
        'forma_pagamento',
        'pago',
        'observacoes',
        'evolucao_clinica',
        'proxima_recomendacao_dias',
    ];

    protected function casts(): array
    {
        return [
            'inicio'      => 'datetime',
            'fim'         => 'datetime',
            'valor_total' => 'decimal:2',
            'pago'        => 'boolean',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function paciente(): BelongsTo
    {
        return $this->belongsTo(Paciente::class);
    }

    public function procedimentos(): BelongsToMany
    {
        return $this->belongsToMany(Procedimento::class, 'consulta_procedimento')
            ->withPivot(['preco_aplicado', 'duracao_aplicada'])
            ->withTimestamps();
    }

    public function fotos(): HasMany
    {
        return $this->hasMany(FotoEvolucao::class);
    }

    public function lembretes(): HasMany
    {
        return $this->hasMany(Lembrete::class);
    }
}
