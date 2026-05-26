<?php

namespace App\Models;

use App\Scopes\TenantScope;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ContaPagar extends Model
{
    protected $table = 'contas_pagar';

    protected $fillable = [
        'clinica_id',
        'descricao',
        'fornecedor',
        'categoria',
        'valor',
        'data_vencimento',
        'data_pagamento',
        'status',
        'forma_pagamento',
        'observacao',
        'recorrente',
        'recorrencia',
    ];

    protected $casts = [
        'valor'            => 'decimal:2',
        'data_vencimento'  => 'date',
        'data_pagamento'   => 'date',
        'recorrente'       => 'boolean',
    ];

    protected static function booted(): void
    {
        static::addGlobalScope(new TenantScope());

        // Auto-atualiza status vencido ao salvar
        static::saving(function (ContaPagar $conta) {
            if ($conta->status === 'pendente' && $conta->data_vencimento->isPast()) {
                $conta->status = 'vencido';
            }
        });
    }

    public function clinica(): BelongsTo
    {
        return $this->belongsTo(Clinica::class);
    }
}
