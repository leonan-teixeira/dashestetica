<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use OwenIt\Auditing\Contracts\Auditable;

class Paciente extends Model implements Auditable
{
    use SoftDeletes, \OwenIt\Auditing\Auditable;

    protected $fillable = [
        'user_id',
        'nome_completo',
        'cpf',
        'cpf_hash',
        'data_nascimento',
        'telefone',
        'telefone_hash',
        'email',
        'endereco',
        'foto_perfil_path',
        'observacoes_gerais',
        'consentimento_aceito_em',
        'consentimento_versao',
        'anonimizado_em',
    ];

    protected $hidden = ['cpf', 'telefone', 'email'];

    protected function casts(): array
    {
        return [
            'cpf'                    => 'encrypted',
            'telefone'               => 'encrypted',
            'email'                  => 'encrypted',
            'endereco'               => 'array',
            'data_nascimento'        => 'date',
            'consentimento_aceito_em' => 'datetime',
            'anonimizado_em'         => 'datetime',
        ];
    }

    public function setCpfAttribute(string $value): void
    {
        $this->attributes['cpf']      = encrypt($value);
        $this->attributes['cpf_hash'] = hash('sha256', preg_replace('/\D/', '', $value));
    }

    public function setTelefoneAttribute(string $value): void
    {
        $this->attributes['telefone']      = encrypt($value);
        $this->attributes['telefone_hash'] = hash('sha256', preg_replace('/\D/', '', $value));
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function anamnese(): HasOne
    {
        return $this->hasOne(Anamnese::class);
    }

    public function consultas(): HasMany
    {
        return $this->hasMany(Consulta::class);
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
