<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Lembrete extends Model
{
    protected $fillable = [
        'consulta_id',
        'paciente_id',
        'tipo',
        'canal',
        'agendado_para',
        'enviado_em',
        'status',
        'tentativas',
        'ultimo_erro',
        'mensagem',
    ];

    protected function casts(): array
    {
        return [
            'agendado_para' => 'datetime',
            'enviado_em'    => 'datetime',
            'tentativas'    => 'integer',
        ];
    }

    public function consulta(): BelongsTo
    {
        return $this->belongsTo(Consulta::class);
    }

    public function paciente(): BelongsTo
    {
        return $this->belongsTo(Paciente::class);
    }
}
