<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Consulta;
use App\Scopes\TenantScope;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Symfony\Component\HttpFoundation\StreamedResponse;

class FinanceiroController extends Controller
{
    // ── Helpers ───────────────────────────────────────────────────────────────

    private function baseQuery(Request $request)
    {
        $clinicaId = auth()->user()->clinica_id;

        $q = Consulta::withoutGlobalScope(TenantScope::class)
            ->where('clinica_id', $clinicaId)
            ->where('status', 'realizada')
            ->with('paciente:id,nome_completo');

        // Filtro de período
        $inicio = $request->input('data_inicio');
        $fim    = $request->input('data_fim');

        if ($inicio) {
            $q->whereDate('inicio', '>=', $inicio);
        }

        if ($fim) {
            $q->whereDate('inicio', '<=', $fim);
        }

        // Filtro forma pagamento
        if ($request->filled('forma_pagamento')) {
            $q->where('forma_pagamento', $request->forma_pagamento);
        }

        // Filtro pago/pendente
        if ($request->has('pago') && $request->input('pago') !== '') {
            $q->where('pago', filter_var($request->input('pago'), FILTER_VALIDATE_BOOLEAN));
        }

        // Busca por paciente
        if ($request->filled('busca')) {
            $q->whereHas('paciente', fn ($p) => $p->where('nome_completo', 'like', '%' . $request->busca . '%'));
        }

        return $q;
    }

    // ── Resumo ────────────────────────────────────────────────────────────────

    public function resumo(Request $request): JsonResponse
    {
        $clinicaId = auth()->user()->clinica_id;

        $base = Consulta::withoutGlobalScope(TenantScope::class)
            ->where('clinica_id', $clinicaId)
            ->where('status', 'realizada');

        // Período padrão: mês corrente se não informado
        $inicio = $request->input('data_inicio', Carbon::now()->startOfMonth()->toDateString());
        $fim    = $request->input('data_fim',    Carbon::now()->endOfMonth()->toDateString());

        $periodo = (clone $base)->whereDate('inicio', '>=', $inicio)->whereDate('inicio', '<=', $fim);

        $faturadoPeriodo  = (clone $periodo)->sum('valor_total');
        $recebidoPeriodo  = (clone $periodo)->where('pago', true)->sum('valor_total');
        $pendentesPeriodo = (clone $periodo)->where('pago', false)->sum('valor_total');

        // Mês anterior para comparação
        $inicioAnterior = Carbon::parse($inicio)->subMonth()->startOfMonth()->toDateString();
        $fimAnterior    = Carbon::parse($inicio)->subMonth()->endOfMonth()->toDateString();
        $faturadoAnterior = (clone $base)
            ->whereDate('inicio', '>=', $inicioAnterior)
            ->whereDate('inicio', '<=', $fimAnterior)
            ->sum('valor_total');

        $variacao = $faturadoAnterior > 0
            ? round((($faturadoPeriodo - $faturadoAnterior) / $faturadoAnterior) * 100, 1)
            : null;

        // Por forma de pagamento
        $porForma = (clone $periodo)
            ->selectRaw('forma_pagamento, SUM(valor_total) as total, COUNT(*) as qtd')
            ->groupBy('forma_pagamento')
            ->get()
            ->map(fn ($r) => [
                'forma' => $r->forma_pagamento ?? 'nao_informado',
                'total' => (float) $r->total,
                'qtd'   => (int) $r->qtd,
            ]);

        // Faturamento diário do período (para mini-gráfico)
        $porDia = (clone $periodo)
            ->selectRaw('DATE(inicio) as dia, SUM(valor_total) as total, SUM(CASE WHEN pago THEN valor_total ELSE 0 END) as recebido')
            ->groupByRaw('DATE(inicio)')
            ->orderBy('dia')
            ->get()
            ->map(fn ($r) => [
                'dia'      => $r->dia,
                'total'    => (float) $r->total,
                'recebido' => (float) $r->recebido,
            ]);

        // Total global de contas a receber (todas as datas)
        $totalPendente = (clone $base)->where('pago', false)->sum('valor_total');
        $qtdPendente   = (clone $base)->where('pago', false)->count();

        return response()->json([
            'periodo' => ['inicio' => $inicio, 'fim' => $fim],
            'faturado'          => (float) $faturadoPeriodo,
            'recebido'          => (float) $recebidoPeriodo,
            'pendente_periodo'  => (float) $pendentesPeriodo,
            'variacao_mes'      => $variacao,
            'total_pendente_geral' => (float) $totalPendente,
            'qtd_pendente_geral'   => (int) $qtdPendente,
            'por_forma'         => $porForma,
            'por_dia'           => $porDia,
        ]);
    }

    // ── Extrato paginado ──────────────────────────────────────────────────────

    public function extrato(Request $request): JsonResponse
    {
        $consultas = $this->baseQuery($request)
            ->orderByDesc('inicio')
            ->paginate(25);

        $items = $consultas->map(fn ($c) => [
            'id'               => $c->id,
            'paciente_id'      => $c->paciente_id,
            'paciente'         => $c->paciente?->nome_completo,
            'data'             => Carbon::parse($c->inicio)->toISOString(),
            'valor_total'      => (float) $c->valor_total,
            'forma_pagamento'  => $c->forma_pagamento,
            'pago'             => (bool) $c->pago,
            'observacoes'      => $c->observacoes,
        ]);

        return response()->json([
            'data' => $items,
            'meta' => [
                'current_page' => $consultas->currentPage(),
                'last_page'    => $consultas->lastPage(),
                'per_page'     => $consultas->perPage(),
                'total'        => $consultas->total(),
                'soma_filtro'  => (float) $this->baseQuery($request)->sum('valor_total'),
                'soma_recebido' => (float) $this->baseQuery($request)->where('pago', true)->sum('valor_total'),
            ],
        ]);
    }

    // ── Marcar como pago ──────────────────────────────────────────────────────

    public function marcarPago(Request $request, int $id): JsonResponse
    {
        $clinicaId = auth()->user()->clinica_id;

        $consulta = Consulta::withoutGlobalScope(TenantScope::class)
            ->where('clinica_id', $clinicaId)
            ->findOrFail($id);

        $data = $request->validate([
            'pago'            => 'required|boolean',
            'forma_pagamento' => 'nullable|string|in:pix,credito,debito,dinheiro,outro',
        ]);

        $consulta->update($data);

        return response()->json([
            'id'              => $consulta->id,
            'pago'            => $consulta->pago,
            'forma_pagamento' => $consulta->forma_pagamento,
        ]);
    }

    // ── Exportar CSV ──────────────────────────────────────────────────────────

    public function exportarCsv(Request $request): StreamedResponse
    {
        $consultas = $this->baseQuery($request)->orderByDesc('inicio')->get();

        $formas = [
            'pix'      => 'Pix',
            'credito'  => 'Cartão Crédito',
            'debito'   => 'Cartão Débito',
            'dinheiro' => 'Dinheiro',
            'outro'    => 'Outro',
        ];

        $headers = [
            'Content-Type'        => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="financeiro_' . now()->format('Y-m-d') . '.csv"',
        ];

        return response()->stream(function () use ($consultas, $formas) {
            $out = fopen('php://output', 'w');
            // BOM para Excel
            fprintf($out, chr(0xEF) . chr(0xBB) . chr(0xBF));

            fputcsv($out, ['Data', 'Paciente', 'Valor (R$)', 'Forma Pagamento', 'Pago'], ';');

            foreach ($consultas as $c) {
                fputcsv($out, [
                    Carbon::parse($c->inicio)->format('d/m/Y H:i'),
                    $c->paciente?->nome_completo ?? '—',
                    number_format((float) $c->valor_total, 2, ',', '.'),
                    $formas[$c->forma_pagamento] ?? ($c->forma_pagamento ?? '—'),
                    $c->pago ? 'Sim' : 'Não',
                ], ';');
            }

            fclose($out);
        }, 200, $headers);
    }

    // ── Faturamento mensal (últimos 12 meses) ─────────────────────────────────

    public function faturamentoMensal(): JsonResponse
    {
        $clinicaId = auth()->user()->clinica_id;

        $rows = Consulta::withoutGlobalScope(TenantScope::class)
            ->where('clinica_id', $clinicaId)
            ->where('status', 'realizada')
            ->whereDate('inicio', '>=', Carbon::now()->subMonths(11)->startOfMonth())
            ->selectRaw("DATE_FORMAT(inicio, '%Y-%m') as mes, SUM(valor_total) as total, SUM(CASE WHEN pago THEN valor_total ELSE 0 END) as recebido, COUNT(*) as consultas")
            ->groupByRaw("DATE_FORMAT(inicio, '%Y-%m')")
            ->orderBy('mes')
            ->get()
            ->map(fn ($r) => [
                'mes'      => $r->mes,
                'total'    => (float) $r->total,
                'recebido' => (float) $r->recebido,
                'consultas'=> (int) $r->consultas,
            ]);

        return response()->json($rows);
    }
}
