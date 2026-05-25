<?php

namespace App\Models;

use App\Scopes\TenantScope;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Produto extends Model
{
    protected $fillable = [
        'clinica_id',
        'nome',
        'descricao',
        'categoria',
        'unidade',
        'estoque_minimo',
        'ativo',
    ];

    protected $casts = [
        'estoque_minimo' => 'decimal:2',
        'ativo'          => 'boolean',
    ];

    protected static function booted(): void
    {
        static::addGlobalScope(new TenantScope());
    }

    public function clinica(): BelongsTo
    {
        return $this->belongsTo(Clinica::class);
    }

    public function movimentacoes(): HasMany
    {
        return $this->hasMany(MovimentacaoEstoque::class);
    }

    public function getEstoqueAtualAttribute(): float
    {
        $entradas = $this->movimentacoes()->where('tipo', 'entrada')->sum('quantidade');
        $saidas   = $this->movimentacoes()->where('tipo', 'saida')->sum('quantidade');
        return (float) ($entradas - $saidas);
    }

    public function getEstoqueBaixoAttribute(): bool
    {
        return $this->estoque_atual < $this->estoque_minimo;
    }
}
