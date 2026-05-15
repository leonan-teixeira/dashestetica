<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ConsultaResource;
use App\Http\Resources\PacienteResource;
use App\Models\Consulta;
use App\Models\Paciente;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class DashboardController extends Controller
{
    public function resumo(Request $request): JsonResponse
    {
        $userId = $request->user()->id;
        $hoje   = Carbon::today();

        $consultasHoje = Consulta::where('user_id', $userId)
            ->whereDate('inicio', $hoje)
            ->whereNotIn('status', ['cancelada', 'nao_compareceu'])
            ->count();

        $proximasConsultas = Consulta::where('user_id', $userId)
            ->where('inicio', '>=', now())
            ->whereNotIn('status', ['cancelada', 'nao_compareceu'])
            ->orderBy('inicio')
            ->limit(5)
            ->with('paciente')
            ->get();

        $faturamentoMes = Consulta::where('user_id', $userId)
            ->whereMonth('inicio', $hoje->month)
            ->whereYear('inicio', $hoje->year)
            ->where('status', 'realizada')
            ->sum('valor_total');

        $totalPacientes = Paciente::where('user_id', $userId)->count();

        return response()->json([
            'data' => [
                'consultas_hoje'     => $consultasHoje,
                'proximas_consultas' => ConsultaResource::collection($proximasConsultas),
                'faturamento_mes'    => $faturamentoMes,
                'total_pacientes'    => $totalPacientes,
            ],
        ]);
    }

    public function agendaSemana(Request $request): JsonResponse
    {
        $userId = $request->user()->id;
        $inicio = Carbon::now()->startOfWeek();
        $fim    = Carbon::now()->endOfWeek();

        $consultas = Consulta::where('user_id', $userId)
            ->whereBetween('inicio', [$inicio, $fim])
            ->whereNotIn('status', ['cancelada'])
            ->with(['paciente', 'procedimentos'])
            ->orderBy('inicio')
            ->get();

        return response()->json([
            'data' => ConsultaResource::collection($consultas),
        ]);
    }

    public function pacientesRetorno(Request $request): JsonResponse
    {
        $userId = $request->user()->id;
        $dias   = (int) $request->get('dias', 30);

        $pacientes = Paciente::where('user_id', $userId)
            ->whereHas('consultas', function ($q) use ($dias) {
                $q->where('status', 'realizada')
                  ->whereNotNull('proxima_recomendacao_dias')
                  ->whereRaw('DATE_ADD(DATE(inicio), INTERVAL proxima_recomendacao_dias DAY) <= ?', [now()->addDays($dias)]);
            })
            ->whereDoesntHave('consultas', function ($q) {
                $q->where('inicio', '>=', now())
                  ->whereNotIn('status', ['cancelada', 'nao_compareceu']);
            })
            ->limit(20)
            ->get();

        return response()->json([
            'data' => PacienteResource::collection($pacientes),
        ]);
    }
}
