<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Consulta;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class AgendaController extends Controller
{
    public function horariosDisponiveis(Request $request): JsonResponse
    {
        $request->validate([
            'data'             => ['required', 'date'],
            'duracao_minutos'  => ['required', 'integer', 'min:5'],
            'ignorar_consulta' => ['nullable', 'integer'],
        ]);

        $userId  = $request->user()->id;
        $data    = Carbon::parse($request->data);
        $duracao = (int) $request->duracao_minutos;

        $consultasDia = Consulta::where('user_id', $userId)
            ->whereDate('inicio', $data)
            ->whereNotIn('status', ['cancelada', 'nao_compareceu'])
            ->when($request->ignorar_consulta, fn ($q, $id) => $q->where('id', '!=', $id))
            ->orderBy('inicio')
            ->get(['inicio', 'fim']);

        $horarioInicio = $data->copy()->setHour(8)->setMinute(0);
        $horarioFim    = $data->copy()->setHour(20)->setMinute(0);
        $slots         = [];
        $atual         = $horarioInicio->copy();

        while ($atual->copy()->addMinutes($duracao)->lte($horarioFim)) {
            $fimSlot  = $atual->copy()->addMinutes($duracao);
            $ocupado  = $consultasDia->contains(function ($c) use ($atual, $fimSlot) {
                return $atual->lt($c->fim) && $fimSlot->gt($c->inicio);
            });

            if (! $ocupado) {
                $slots[] = [
                    'inicio' => $atual->toIso8601String(),
                    'fim'    => $fimSlot->toIso8601String(),
                ];
            }

            $atual->addMinutes(30);
        }

        return response()->json(['data' => $slots]);
    }

    public function cep(Request $request, string $cep): JsonResponse
    {
        $cep = preg_replace('/\D/', '', $cep);

        if (strlen($cep) !== 8) {
            return response()->json(['message' => 'CEP inválido.'], 422);
        }

        $response = \Http::get("https://viacep.com.br/ws/{$cep}/json/");

        if ($response->failed() || isset($response->json()['erro'])) {
            return response()->json(['message' => 'CEP não encontrado.'], 404);
        }

        $data = $response->json();

        return response()->json([
            'data' => [
                'cep'    => $data['cep'],
                'rua'    => $data['logradouro'],
                'bairro' => $data['bairro'],
                'cidade' => $data['localidade'],
                'uf'     => $data['uf'],
            ],
        ]);
    }
}
