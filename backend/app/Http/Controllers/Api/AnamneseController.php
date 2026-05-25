<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Anamnese\StoreAnamneseRequest;
use App\Http\Resources\AnamneseResource;
use App\Models\Paciente;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AnamneseController extends Controller
{
    public function show(Request $request, Paciente $paciente): JsonResponse
    {
        abort_if($paciente->clinica_id !== $request->user()->clinica_id, 403);

        $anamnese = $paciente->anamnese;

        if (! $anamnese) {
            return response()->json(['data' => null]);
        }

        return response()->json(['data' => new AnamneseResource($anamnese)]);
    }

    public function store(StoreAnamneseRequest $request, Paciente $paciente): JsonResponse
    {
        abort_if($paciente->clinica_id !== $request->user()->clinica_id, 403);
        abort_if($paciente->anamnese !== null, 409, 'Paciente já possui anamnese.');

        $anamnese = $paciente->anamnese()->create(array_merge(
            $request->validated(),
            [
                'clinica_id'    => $request->user()->clinica_id,
                'respondida_em' => now(),
            ]
        ));

        return response()->json(['data' => new AnamneseResource($anamnese)], 201);
    }

    public function update(StoreAnamneseRequest $request, Paciente $paciente): JsonResponse
    {
        abort_if($paciente->clinica_id !== $request->user()->clinica_id, 403);

        $anamnese = $paciente->anamnese ?? $paciente->anamnese()->create(['respondida_em' => now()]);
        $anamnese->update($request->validated());

        return response()->json(['data' => new AnamneseResource($anamnese->fresh())]);
    }
}
