<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Consulta\StoreConsultaRequest;
use App\Http\Requests\Consulta\UpdateConsultaRequest;
use App\Http\Requests\Consulta\UpdateStatusRequest;
use App\Http\Resources\ConsultaResource;
use App\Models\Consulta;
use App\Models\Procedimento;
use App\Services\AgendamentoService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Carbon;

class ConsultaController extends Controller
{
    public function __construct(private AgendamentoService $agendamento) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $consultas = Consulta::query()
            ->where('user_id', $request->user()->id)
            ->when($request->paciente_id, fn ($q, $id) => $q->where('paciente_id', $id))
            ->when($request->status, fn ($q, $s) => $q->where('status', $s))
            ->when($request->data_inicio, fn ($q, $d) => $q->whereDate('inicio', '>=', $d))
            ->when($request->data_fim, fn ($q, $d) => $q->whereDate('inicio', '<=', $d))
            ->with(['paciente', 'procedimentos'])
            ->orderByDesc('inicio')
            ->paginate(20);

        return ConsultaResource::collection($consultas);
    }

    public function store(StoreConsultaRequest $request): JsonResponse
    {
        $consulta = $this->agendamento->agendar(
            $request->validated(),
            $request->user()->id
        );

        return response()->json(['data' => new ConsultaResource($consulta->load('procedimentos', 'paciente'))], 201);
    }

    public function show(Request $request, Consulta $consulta): JsonResponse
    {
        abort_if($consulta->user_id !== $request->user()->id, 403);

        $consulta->load(['paciente', 'procedimentos', 'fotos']);

        return response()->json(['data' => new ConsultaResource($consulta)]);
    }

    public function update(UpdateConsultaRequest $request, Consulta $consulta): JsonResponse
    {
        abort_if($consulta->user_id !== $request->user()->id, 403);

        $data = $request->validated();

        if (isset($data['inicio'], $data['fim'])) {
            $inicio = Carbon::parse($data['inicio']);
            $fim    = Carbon::parse($data['fim']);

            if ($this->agendamento->verificarConflito($request->user()->id, $inicio, $fim, $consulta->id)) {
                return response()->json(['message' => 'Conflito de horário.'], 422);
            }
        }

        if (isset($data['procedimentos'])) {
            $procedimentos = Procedimento::whereIn('id', $data['procedimentos'])
                ->where('user_id', $request->user()->id)
                ->get()
                ->mapWithKeys(fn ($p) => [$p->id => ['preco_aplicado' => $p->preco, 'duracao_aplicada' => $p->duracao_minutos]]);

            $consulta->procedimentos()->sync($procedimentos);
            unset($data['procedimentos']);
        }

        $consulta->update($data);

        return response()->json(['data' => new ConsultaResource($consulta->fresh()->load('procedimentos', 'paciente'))]);
    }

    public function destroy(Request $request, Consulta $consulta): JsonResponse
    {
        abort_if($consulta->user_id !== $request->user()->id, 403);

        $consulta->delete();

        return response()->json(null, 204);
    }

    public function updateStatus(UpdateStatusRequest $request, Consulta $consulta): JsonResponse
    {
        abort_if($consulta->user_id !== $request->user()->id, 403);

        $consulta->update(['status' => $request->status]);

        return response()->json(['data' => new ConsultaResource($consulta->fresh())]);
    }

    public function updateEvolucao(Request $request, Consulta $consulta): JsonResponse
    {
        abort_if($consulta->user_id !== $request->user()->id, 403);

        $request->validate([
            'evolucao_clinica'          => ['required', 'string'],
            'proxima_recomendacao_dias' => ['nullable', 'integer', 'min:1'],
        ]);

        $consulta->update($request->only('evolucao_clinica', 'proxima_recomendacao_dias'));

        return response()->json(['data' => new ConsultaResource($consulta->fresh())]);
    }
}
