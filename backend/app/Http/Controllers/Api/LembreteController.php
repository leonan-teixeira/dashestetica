<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\LembreteResource;
use App\Jobs\EnviarLembreteJob;
use App\Models\Lembrete;
use App\Services\LembreteService;
use App\Services\WhatsAppService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class LembreteController extends Controller
{
    public function __construct(private LembreteService $lembreteService) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $lembretes = Lembrete::query()
            ->with('paciente:id,nome_completo')
            ->whereHas('paciente', fn ($q) => $q->where('user_id', $request->user()->id))
            ->when($request->status, fn ($q, $s) => $q->where('status', $s))
            ->when($request->paciente_id, fn ($q, $id) => $q->where('paciente_id', $id))
            ->orderByDesc('agendado_para')
            ->paginate(20);

        return LembreteResource::collection($lembretes);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'consulta_id'   => ['nullable', 'integer', 'exists:consultas,id'],
            'paciente_id'   => ['required', 'integer', 'exists:pacientes,id'],
            'tipo'          => ['required', 'string', 'in:confirmacao_24h,lembrete_dia,retorno_sugerido,personalizado'],
            'canal'         => ['required', 'string', 'in:whatsapp,sms,email'],
            'agendado_para' => ['required', 'date', 'after:now'],
            'mensagem'      => ['required', 'string'],
        ]);

        $lembrete = Lembrete::create($request->validated());

        return response()->json(['data' => new LembreteResource($lembrete)], 201);
    }

    public function destroy(Request $request, Lembrete $lembrete): JsonResponse
    {
        abort_if(
            $lembrete->paciente->user_id !== $request->user()->id,
            403
        );

        $lembrete->update(['status' => 'cancelado']);

        return response()->json(null, 204);
    }

    public function reenviar(Request $request, Lembrete $lembrete): JsonResponse
    {
        abort_if(
            $lembrete->paciente->user_id !== $request->user()->id,
            403
        );

        $lembrete->update([
            'status'        => 'pendente',
            'agendado_para' => now(),
            'ultimo_erro'   => null,
        ]);

        EnviarLembreteJob::dispatch($lembrete);

        return response()->json(['data' => new LembreteResource($lembrete->fresh())]);
    }

    public function status(): JsonResponse
    {
        $whats = WhatsAppService::fromConfig();
        return response()->json([
            'data' => [
                'configurado' => $whats->isConfigured(),
                'instance'    => config('services.evolution.instance'),
            ],
        ]);
    }
}
