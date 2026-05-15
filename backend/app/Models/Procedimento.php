<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Procedimento extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'user_id',
        'nome',
        'descricao',
        'duracao_minutos',
        'preco',
        'categoria',
        'ativo',
    ];

    protected function casts(): array
    {
        return [
            'preco'           => 'decimal:2',
            'duracao_minutos' => 'integer',
            'ativo'           => 'boolean',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function consultas(): BelongsToMany
    {
        return $this->belongsToMany(Consulta::class, 'consulta_procedimento')
            ->withPivot(['preco_aplicado', 'duracao_aplicada'])
            ->withTimestamps();
    }
}
