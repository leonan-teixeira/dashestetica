<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Consulta;
use App\Models\Lembrete;
use App\Models\Paciente;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Carbon;

class NotificacaoController extends Controller
{
    public function index(): JsonResponse
    {
        $hoje = Carbon::today();

        $consultasHoje = Consulta::whereDate('inicio', $hoje)
            ->whereIn('status', ['agendada', 'confirmada'])
            ->with('paciente:id,nome_completo')
            ->orderBy('inicio')
            ->limit(10)
            ->get()
            ->map(fn ($c) => [
                'tipo'    => 'consulta_hoje',
                'titulo'  => $c->paciente?->nome_completo ?? 'Paciente',
                'corpo'   => 'Consulta às ' . Carbon::parse($c->inicio)->format('H:i'),
                'link'    => "/consultas/{$c->id}",
                'data'    => $c->inicio,
            ]);

        $lembretesFalhados = Lembrete::where('status', 'erro')
            ->with('paciente:id,nome_completo')
            ->orderByDesc('updated_at')
            ->limit(10)
            ->get()
            ->map(fn ($l) => [
                'tipo'    => 'lembrete_falhou',
                'titulo'  => 'Lembrete falhou — ' . ($l->paciente?->nome_completo ?? 'Paciente'),
                'corpo'   => $l->ultimo_erro ?? 'Erro ao enviar lembrete',
                'link'    => '/configuracoes',
                'data'    => $l->updated_at,
            ]);

        $retornosSugeridos = Paciente::whereNull('anonimizado_em')
            ->whereHas('consultas', function ($q) {
                $q->where('status', 'realizada')
                  ->whereNotNull('proxima_recomendacao_dias')
                  ->whereRaw('DATE_ADD(DATE(inicio), INTERVAL proxima_recomendacao_dias DAY) <= NOW()');
            })
            ->whereDoesntHave('consultas', function ($q) {
                $q->where('inicio', '>=', now())
                  ->whereNotIn('status', ['cancelada', 'nao_compareceu']);
            })
            ->limit(5)
            ->get()
            ->map(fn ($p) => [
                'tipo'    => 'retorno_sugerido',
                'titulo'  => 'Retorno sugerido — ' . $p->nome_completo,
                'corpo'   => 'Paciente pode estar aguardando novo agendamento',
                'link'    => "/pacientes/{$p->id}",
                'data'    => now()->toIso8601String(),
            ]);

        $todas = $consultasHoje
            ->concat($lembretesFalhados)
            ->concat($retornosSugeridos)
            ->sortByDesc('data')
            ->values();

        return response()->json([
            'data'  => $todas,
            'total' => $todas->count(),
        ]);
    }
}
