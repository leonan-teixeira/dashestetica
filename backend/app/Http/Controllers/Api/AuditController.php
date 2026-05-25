<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Paciente;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OwenIt\Auditing\Models\Audit;

class AuditController extends Controller
{
    private const FIELD_LABELS = [
        // Paciente
        'nome_completo'            => 'Nome',
        'data_nascimento'          => 'Data de nascimento',
        'telefone'                 => 'Telefone',
        'email'                    => 'E-mail',
        'endereco'                 => 'Endereço',
        'observacoes_gerais'       => 'Observações',
        'anonimizado_em'           => 'Anonimizado em',
        // Anamnese
        'alergias'                 => 'Alergias',
        'medicamentos_uso_continuo' => 'Medicamentos',
        'condicoes_pre_existentes' => 'Condições pré-existentes',
        'gestante'                 => 'Gestante',
        'amamentando'              => 'Amamentando',
        'usa_anticoncepcional'     => 'Anticoncepcional',
        'fumante'                  => 'Fumante',
        'pratica_atividade_fisica' => 'Atividade física',
        'objetivo_tratamento'      => 'Objetivo',
        'observacoes'              => 'Observações',
        // Consulta
        'status'                   => 'Status',
        'valor_total'              => 'Valor total',
        'forma_pagamento'          => 'Forma de pagamento',
        'pago'                     => 'Pago',
        'evolucao_clinica'         => 'Evolução clínica',
        'inicio'                   => 'Início',
        'fim'                      => 'Fim',
    ];

    private const EVENT_LABELS = [
        'created' => 'Criado',
        'updated' => 'Atualizado',
        'deleted' => 'Excluído',
        'restored'=> 'Restaurado',
    ];

    private const MODEL_LABELS = [
        'App\\Models\\Paciente' => 'Paciente',
        'App\\Models\\Anamnese' => 'Anamnese',
        'App\\Models\\Consulta' => 'Consulta',
    ];

    public function porPaciente(Request $request, Paciente $paciente): JsonResponse
    {
        abort_if($paciente->clinica_id !== $request->user()->clinica_id, 403);

        $consultas = $paciente->consultas()->pluck('id');

        $audits = Audit::where(function ($q) use ($paciente, $consultas) {
                $q->where(fn ($q2) => $q2->where('auditable_type', 'App\\Models\\Paciente')
                        ->where('auditable_id', $paciente->id))
                  ->orWhere(fn ($q2) => $q2->where('auditable_type', 'App\\Models\\Anamnese')
                        ->where('auditable_id', $paciente->anamnese?->id ?? 0))
                  ->orWhere(fn ($q2) => $q2->where('auditable_type', 'App\\Models\\Consulta')
                        ->whereIn('auditable_id', $consultas));
            })
            ->orderByDesc('created_at')
            ->limit(100)
            ->get();

        $formatted = $audits->map(function (Audit $audit) {
            $changes = [];

            if ($audit->event === 'updated') {
                $old = $audit->old_values ?? [];
                $new = $audit->new_values ?? [];

                foreach ($new as $field => $newVal) {
                    if (in_array($field, ['updated_at', 'created_at', 'deleted_at', 'remember_token'])) continue;
                    $label  = self::FIELD_LABELS[$field] ?? $field;
                    $oldFmt = $this->formatValue($field, $old[$field] ?? null);
                    $newFmt = $this->formatValue($field, $newVal);
                    $changes[] = ['campo' => $label, 'de' => $oldFmt, 'para' => $newFmt];
                }
            }

            return [
                'id'         => $audit->id,
                'evento'     => self::EVENT_LABELS[$audit->event] ?? $audit->event,
                'modelo'     => self::MODEL_LABELS[$audit->auditable_type] ?? $audit->auditable_type,
                'alteracoes' => $changes,
                'usuario'    => $audit->user?->name ?? 'Sistema',
                'data'       => $audit->created_at->toIso8601String(),
            ];
        });

        return response()->json(['data' => $formatted]);
    }

    private function formatValue(string $field, mixed $value): string
    {
        if ($value === null) return '—';
        if (is_bool($value)) return $value ? 'Sim' : 'Não';
        if (is_array($value)) return json_encode($value, JSON_UNESCAPED_UNICODE);

        if ($field === 'pago') return $value ? 'Sim' : 'Não';
        if ($field === 'valor_total') return 'R$ ' . number_format((float) $value, 2, ',', '.');
        if (in_array($field, ['inicio', 'fim', 'data_nascimento', 'respondida_em'])) {
            try {
                return \Carbon\Carbon::parse($value)->format('d/m/Y H:i');
            } catch (\Throwable) {
                return (string) $value;
            }
        }

        return (string) $value;
    }
}
