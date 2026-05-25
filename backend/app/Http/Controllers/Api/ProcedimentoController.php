<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Procedimento\StoreProcedimentoRequest;
use App\Http\Requests\Procedimento\UpdateProcedimentoRequest;
use App\Http\Resources\ProcedimentoResource;
use App\Models\Procedimento;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ProcedimentoController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $procedimentos = Procedimento::query()
            ->when($request->categoria, fn ($q, $c) => $q->where('categoria', $c))
            ->when($request->has('ativo'), fn ($q) => $q->where('ativo', $request->boolean('ativo')))
            ->orderBy('nome')
            ->get();

        return ProcedimentoResource::collection($procedimentos);
    }

    public function store(StoreProcedimentoRequest $request): JsonResponse
    {
        $procedimento = Procedimento::create(array_merge(
            $request->validated(),
            [
                'clinica_id' => $request->user()->clinica_id,
                'user_id'    => $request->user()->id,
            ]
        ));

        return response()->json(['data' => new ProcedimentoResource($procedimento)], 201);
    }

    public function show(Request $request, Procedimento $procedimento): JsonResponse
    {
        abort_if($procedimento->clinica_id !== $request->user()->clinica_id, 403);

        return response()->json(['data' => new ProcedimentoResource($procedimento)]);
    }

    public function update(UpdateProcedimentoRequest $request, Procedimento $procedimento): JsonResponse
    {
        abort_if($procedimento->clinica_id !== $request->user()->clinica_id, 403);

        $procedimento->update($request->validated());

        return response()->json(['data' => new ProcedimentoResource($procedimento->fresh())]);
    }

    public function destroy(Request $request, Procedimento $procedimento): JsonResponse
    {
        abort_if($procedimento->clinica_id !== $request->user()->clinica_id, 403);

        $procedimento->delete();

        return response()->json(null, 204);
    }
}
