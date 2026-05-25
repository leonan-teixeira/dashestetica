<?php

namespace App\Models;

use App\Scopes\TenantScope;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use OwenIt\Auditing\Contracts\Auditable;

class Anamnese extends Model implements Auditable
{
    use \OwenIt\Auditing\Auditable;

    protected static function booted(): void
    {
        static::addGlobalScope(new TenantScope());
    }

    protected $fillable = [
        'clinica_id',
        'paciente_id',
        'alergias',
        'medicamentos_uso_continuo',
        'condicoes_pre_existentes',
        'gestante',
        'amamentando',
        'usa_anticoncepcional',
        'fumante',
        'pratica_atividade_fisica',
        'objetivo_tratamento',
        'observacoes',
        'respondida_em',
    ];

    protected function casts(): array
    {
        return [
            'gestante'               => 'boolean',
            'amamentando'            => 'boolean',
            'usa_anticoncepcional'   => 'boolean',
            'fumante'                => 'boolean',
            'pratica_atividade_fisica' => 'boolean',
            'respondida_em'          => 'datetime',
        ];
    }

    public function paciente(): BelongsTo
    {
        return $this->belongsTo(Paciente::class);
    }
}
