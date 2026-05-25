<?php

namespace App\Models;

use App\Scopes\TenantScope;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FotoEvolucao extends Model
{
    use SoftDeletes;

    protected $table = 'fotos_evolucao';

    protected static function booted(): void
    {
        static::addGlobalScope(new TenantScope());
    }

    protected $fillable = [
        'clinica_id',
        'paciente_id',
        'consulta_id',
        'tipo',
        'path',
        'disk',
        'mime',
        'tamanho_bytes',
        'largura',
        'altura',
        'observacao',
    ];

    protected function casts(): array
    {
        return [
            'tamanho_bytes' => 'integer',
            'largura'       => 'integer',
            'altura'        => 'integer',
        ];
    }

    public function paciente(): BelongsTo
    {
        return $this->belongsTo(Paciente::class);
    }

    public function consulta(): BelongsTo
    {
        return $this->belongsTo(Consulta::class);
    }
}
