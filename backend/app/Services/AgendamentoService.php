<?php

namespace App\Services;

use App\Models\Consulta;
use App\Models\Procedimento;
use Illuminate\Support\Carbon;
use Illuminate\Validation\ValidationException;

class AgendamentoService
{
    public function verificarConflito(int $userId, Carbon $inicio, Carbon $fim, ?int $ignorarConsultaId = null): bool
    {
        return Consulta::query()
            ->whereNotIn('status', ['cancelada', 'nao_compareceu'])
            ->when($ignorarConsultaId, fn ($q) => $q->where('id', '!=', $ignorarConsultaId))
            ->where(function ($q) use ($inicio, $fim) {
                $q->whereBetween('inicio', [$inicio, $fim])
                  ->orWhereBetween('fim', [$inicio, $fim])
                  ->orWhere(fn ($q) => $q->where('inicio', '<=', $inicio)->where('fim', '>=', $fim));
            })
            ->exists();
    }

    public function agendar(array $dados, int $userId): Consulta
    {
        $inicio = Carbon::parse($dados['inicio']);
        $fim    = Carbon::parse($dados['fim']);

        if ($this->verificarConflito($userId, $inicio, $fim)) {
            throw ValidationException::withMessages([
                'inicio' => 'Já existe consulta agendada nesse horário.',
            ]);
        }

        $clinicaId = auth()->user()->clinica_id;

        return \DB::transaction(function () use ($dados, $userId, $clinicaId, $inicio, $fim) {
            $procedimentos = Procedimento::whereIn('id', $dados['procedimentos'])->get();

            $valorTotal = $procedimentos->sum('preco');

            $consulta = Consulta::create([
                'clinica_id'                => $clinicaId,
                'user_id'                   => $userId,
                'paciente_id'               => $dados['paciente_id'],
                'inicio'                    => $inicio,
                'fim'                       => $fim,
                'status'                    => 'agendada',
                'valor_total'               => $valorTotal,
                'observacoes'               => $dados['observacoes'] ?? null,
                'forma_pagamento'           => $dados['forma_pagamento'] ?? null,
                'proxima_recomendacao_dias' => $dados['proxima_recomendacao_dias'] ?? null,
            ]);

            $pivot = $procedimentos->mapWithKeys(fn ($p) => [
                $p->id => ['preco_aplicado' => $p->preco, 'duracao_aplicada' => $p->duracao_minutos],
            ]);

            $consulta->procedimentos()->attach($pivot);

            if ($dados['criar_lembretes'] ?? true) {
                app(LembreteService::class)->criarLembretesParaConsulta($consulta);
            }

            return $consulta;
        });
    }
}
