<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Consulta;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class GraficoController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'data' => [
                'faturamento_mensal'   => $this->faturamentoMensal(),
                'consultas_por_status' => $this->consultasPorStatus(),
                'top_procedimentos'    => $this->topProcedimentos(),
            ],
        ]);
    }

    private function faturamentoMensal(): array
    {
        $meses = collect(range(5, 0))->map(fn ($i) => Carbon::now()->subMonths($i));

        $dados = Consulta::where('status', 'realizada')
            ->where('inicio', '>=', Carbon::now()->subMonths(5)->startOfMonth())
            ->selectRaw('YEAR(inicio) as ano, MONTH(inicio) as mes, SUM(valor_total) as total')
            ->groupByRaw('YEAR(inicio), MONTH(inicio)')
            ->get()
            ->keyBy(fn ($row) => "{$row->ano}-{$row->mes}");

        return $meses->map(function (Carbon $data) use ($dados) {
            $key   = "{$data->year}-{$data->month}";
            $total = $dados->get($key)?->total ?? 0;

            return [
                'mes'   => $data->isoFormat('MMM/YY'),
                'valor' => (float) $total,
            ];
        })->values()->toArray();
    }

    private function consultasPorStatus(): array
    {
        $labels = [
            'agendada'       => 'Agendada',
            'confirmada'     => 'Confirmada',
            'realizada'      => 'Realizada',
            'cancelada'      => 'Cancelada',
            'nao_compareceu' => 'Não compareceu',
        ];

        return Consulta::selectRaw('status, COUNT(*) as total')
            ->groupBy('status')
            ->get()
            ->map(fn ($row) => [
                'status' => $labels[$row->status] ?? $row->status,
                'total'  => (int) $row->total,
            ])
            ->values()
            ->toArray();
    }

    private function topProcedimentos(): array
    {
        $clinicaId = app()->bound('tenant_id') ? app('tenant_id') : null;

        return DB::table('consulta_procedimento')
            ->join('procedimentos', 'procedimentos.id', '=', 'consulta_procedimento.procedimento_id')
            ->join('consultas', 'consultas.id', '=', 'consulta_procedimento.consulta_id')
            ->where('consultas.status', 'realizada')
            ->when($clinicaId, fn ($q) => $q->where('consultas.clinica_id', $clinicaId))
            ->whereNull('procedimentos.deleted_at')
            ->selectRaw('procedimentos.nome, COUNT(*) as total')
            ->groupBy('procedimentos.nome')
            ->orderByDesc('total')
            ->limit(5)
            ->get()
            ->map(fn ($row) => [
                'nome'  => $row->nome,
                'total' => (int) $row->total,
            ])
            ->toArray();
    }
}
