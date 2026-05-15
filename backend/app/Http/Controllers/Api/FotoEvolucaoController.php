<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\FotoEvolucao\StoreFotoRequest;
use App\Http\Resources\FotoEvolucaoResource;
use App\Models\Consulta;
use App\Models\FotoEvolucao;
use App\Models\Paciente;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Storage;

class FotoEvolucaoController extends Controller
{
    public function store(StoreFotoRequest $request, Consulta $consulta): JsonResponse
    {
        abort_if($consulta->user_id !== $request->user()->id, 403);

        $fotos = [];
        foreach ($request->file('fotos') as $file) {
            $path = $file->store("pacientes/{$consulta->paciente_id}/consultas/{$consulta->id}", 'local');

            $fotos[] = FotoEvolucao::create([
                'paciente_id'   => $consulta->paciente_id,
                'consulta_id'   => $consulta->id,
                'tipo'          => $request->tipo,
                'path'          => $path,
                'disk'          => 'local',
                'mime'          => $file->getMimeType(),
                'tamanho_bytes' => $file->getSize(),
                'observacao'    => $request->observacao,
            ]);
        }

        return response()->json([
            'data' => FotoEvolucaoResource::collection(collect($fotos)),
        ], 201);
    }

    public function porPaciente(Request $request, Paciente $paciente): AnonymousResourceCollection
    {
        abort_if($paciente->user_id !== $request->user()->id, 403);

        $fotos = FotoEvolucao::where('paciente_id', $paciente->id)
            ->when($request->tipo, fn ($q, $t) => $q->where('tipo', $t))
            ->when($request->consulta_id, fn ($q, $id) => $q->where('consulta_id', $id))
            ->orderByDesc('created_at')
            ->get();

        return FotoEvolucaoResource::collection($fotos);
    }

    public function comparativo(Request $request, Consulta $consulta): JsonResponse
    {
        abort_if($consulta->user_id !== $request->user()->id, 403);

        $fotos = $consulta->fotos()->orderBy('tipo')->get();

        return response()->json(['data' => FotoEvolucaoResource::collection($fotos)]);
    }

    public function stream(Request $request, FotoEvolucao $foto): \Symfony\Component\HttpFoundation\StreamedResponse
    {
        $consulta = $foto->consulta;
        abort_if($consulta->user_id !== $request->user()->id, 403);

        $disk = Storage::disk($foto->disk);
        abort_unless($disk->exists($foto->path), 404);

        return $disk->response($foto->path, null, [
            'Content-Type' => $foto->mime ?? 'image/jpeg',
            'Cache-Control' => 'private, max-age=3600',
        ]);
    }

    public function destroy(Request $request, FotoEvolucao $foto): JsonResponse
    {
        $consulta = $foto->consulta;
        abort_if($consulta->user_id !== $request->user()->id, 403);

        Storage::disk($foto->disk)->delete($foto->path);
        $foto->delete();

        return response()->json(null, 204);
    }
}
