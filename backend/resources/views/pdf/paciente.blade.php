<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title>Histórico — {{ $paciente->nome_completo }}</title>
    <style>
        @page { margin: 30px 35px; }
        * { box-sizing: border-box; }
        body { font-family: DejaVu Sans, sans-serif; font-size: 11px; color: #1f1124; margin: 0; }
        h1, h2, h3 { font-weight: 700; margin: 0; color: #2d1340; }
        h1 { font-size: 22px; }
        h2 { font-size: 14px; margin-top: 18px; padding-bottom: 4px; border-bottom: 2px solid #b34d8e; color: #b34d8e; }
        h3 { font-size: 12px; margin-bottom: 4px; color: #4a2257; }
        .header { display: table; width: 100%; padding-bottom: 12px; border-bottom: 2px solid #b34d8e; margin-bottom: 18px; }
        .header-left { display: table-cell; vertical-align: middle; }
        .header-right { display: table-cell; vertical-align: middle; text-align: right; font-size: 9px; color: #777; }
        .brand { font-size: 10px; color: #b34d8e; text-transform: uppercase; letter-spacing: 2px; font-weight: 700; }
        .grid { display: table; width: 100%; margin-top: 6px; }
        .row { display: table-row; }
        .cell { display: table-cell; padding: 4px 8px; vertical-align: top; width: 50%; }
        .label { font-size: 8px; text-transform: uppercase; letter-spacing: 1px; color: #888; font-weight: 700; }
        .value { font-size: 11px; color: #1f1124; }
        .box { background: #faf5f9; border: 1px solid #e8d6e2; border-radius: 6px; padding: 10px 12px; margin-top: 6px; }
        .consulta { border: 1px solid #e8d6e2; border-radius: 6px; padding: 10px 12px; margin-bottom: 8px; page-break-inside: avoid; }
        .consulta-head { display: table; width: 100%; margin-bottom: 6px; }
        .consulta-data { display: table-cell; font-weight: 700; color: #2d1340; }
        .status { display: table-cell; text-align: right; }
        .badge { display: inline-block; padding: 2px 8px; border-radius: 999px; font-size: 9px; font-weight: 700; }
        .b-agendada { background: #fef3c7; color: #92400e; }
        .b-confirmada { background: #d1fae5; color: #065f46; }
        .b-realizada { background: #dbeafe; color: #1e40af; }
        .b-cancelada { background: #fee2e2; color: #991b1b; }
        .b-nao_compareceu { background: #f3f4f6; color: #4b5563; }
        .procs { font-size: 10px; color: #666; }
        .empty { color: #999; font-style: italic; padding: 8px 0; }
        .footer { position: fixed; bottom: 10px; left: 0; right: 0; text-align: center; font-size: 8px; color: #999; }
        .check { display: inline-block; width: 10px; height: 10px; border: 1px solid #b34d8e; border-radius: 2px; margin-right: 4px; vertical-align: middle; }
        .check.on { background: #b34d8e; }
    </style>
</head>
<body>
    <div class="header">
        <div class="header-left">
            <div class="brand">Estética Studio</div>
            <h1>{{ $paciente->nome_completo }}</h1>
        </div>
        <div class="header-right">
            Emitido em<br>
            {{ now()->format('d/m/Y H:i') }}
        </div>
    </div>

    <h2>Dados pessoais</h2>
    <div class="grid">
        <div class="row">
            <div class="cell">
                <div class="label">CPF</div>
                <div class="value">{{ $paciente->cpf ?? '—' }}</div>
            </div>
            <div class="cell">
                <div class="label">Data de nascimento</div>
                <div class="value">{{ optional($paciente->data_nascimento)->format('d/m/Y') ?? '—' }}</div>
            </div>
        </div>
        <div class="row">
            <div class="cell">
                <div class="label">Telefone</div>
                <div class="value">{{ $paciente->telefone ?? '—' }}</div>
            </div>
            <div class="cell">
                <div class="label">E-mail</div>
                <div class="value">{{ $paciente->email ?? '—' }}</div>
            </div>
        </div>
        @if($paciente->endereco)
        <div class="row">
            <div class="cell" style="width:100%">
                <div class="label">Endereço</div>
                <div class="value">
                    {{ collect([
                        $paciente->endereco['logradouro'] ?? null,
                        $paciente->endereco['numero'] ?? null,
                        $paciente->endereco['bairro'] ?? null,
                        $paciente->endereco['cidade'] ?? null,
                        $paciente->endereco['uf'] ?? null,
                        $paciente->endereco['cep'] ?? null,
                    ])->filter()->implode(', ') ?: '—' }}
                </div>
            </div>
        </div>
        @endif
    </div>

    @if($paciente->observacoes_gerais)
        <div class="box">
            <div class="label">Observações</div>
            <div class="value">{{ $paciente->observacoes_gerais }}</div>
        </div>
    @endif

    @if($paciente->anamnese)
        <h2>Anamnese</h2>
        @php $a = $paciente->anamnese; @endphp
        <div class="grid">
            <div class="row">
                <div class="cell">
                    <div class="label">Alergias</div>
                    <div class="value">{{ $a->alergias ?: '—' }}</div>
                </div>
                <div class="cell">
                    <div class="label">Medicamentos contínuos</div>
                    <div class="value">{{ $a->medicamentos_uso_continuo ?: '—' }}</div>
                </div>
            </div>
            <div class="row">
                <div class="cell">
                    <div class="label">Condições pré-existentes</div>
                    <div class="value">{{ $a->condicoes_pre_existentes ?: '—' }}</div>
                </div>
                <div class="cell">
                    <div class="label">Objetivo do tratamento</div>
                    <div class="value">{{ $a->objetivo_tratamento ?: '—' }}</div>
                </div>
            </div>
        </div>
        <div style="margin-top:8px">
            <span class="check {{ $a->gestante ? 'on' : '' }}"></span> Gestante &nbsp;
            <span class="check {{ $a->amamentando ? 'on' : '' }}"></span> Amamentando &nbsp;
            <span class="check {{ $a->usa_anticoncepcional ? 'on' : '' }}"></span> Anticoncepcional &nbsp;
            <span class="check {{ $a->fumante ? 'on' : '' }}"></span> Fumante &nbsp;
            <span class="check {{ $a->pratica_atividade_fisica ? 'on' : '' }}"></span> Atividade física
        </div>
        @if($a->observacoes)
            <div class="box">{{ $a->observacoes }}</div>
        @endif
    @endif

    <h2>Histórico de consultas ({{ $paciente->consultas->count() }})</h2>
    @forelse($paciente->consultas->sortByDesc('inicio') as $c)
        <div class="consulta">
            <div class="consulta-head">
                <div class="consulta-data">
                    {{ $c->inicio->format('d/m/Y H:i') }} – {{ $c->fim->format('H:i') }}
                </div>
                <div class="status">
                    <span class="badge b-{{ $c->status }}">{{ str_replace('_', ' ', ucfirst($c->status)) }}</span>
                </div>
            </div>
            @if($c->procedimentos->count())
                <div class="procs">
                    <strong>Procedimentos:</strong>
                    {{ $c->procedimentos->pluck('nome')->implode(', ') }}
                </div>
            @endif
            @if($c->valor_total)
                <div class="procs">
                    <strong>Valor:</strong>
                    R$ {{ number_format((float) $c->valor_total, 2, ',', '.') }}
                </div>
            @endif
            @if($c->evolucao_clinica)
                <div style="margin-top:6px; font-size:10px; color:#444; white-space:pre-wrap;">{{ $c->evolucao_clinica }}</div>
            @endif
            @if($c->observacoes)
                <div style="margin-top:4px; font-size:10px; color:#666;">Obs.: {{ $c->observacoes }}</div>
            @endif
        </div>
    @empty
        <div class="empty">Nenhuma consulta registrada.</div>
    @endforelse

    <div class="footer">
        Documento confidencial — Estética Studio · Conformidade LGPD · Página <span class="pagenum"></span>
    </div>
</body>
</html>
