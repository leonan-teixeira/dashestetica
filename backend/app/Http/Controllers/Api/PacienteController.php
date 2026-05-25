<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Paciente\StorePacienteRequest;
use App\Http\Requests\Paciente\UpdatePacienteRequest;
use App\Http\Resources\PacienteResource;
use App\Models\Paciente;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Symfony\Component\HttpFoundation\Response;

class PacienteController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $pacientes = Paciente::query()
            ->when($request->search, function ($q, $s) {
                // FULLTEXT ignora termos < 4 chars — fallback para LIKE
                strlen($s) >= 4
                    ? $q->whereFullText('nome_completo', $s)
                    : $q->where('nome_completo', 'like', "%{$s}%");
            })
            ->when($request->cpf_hash, fn ($q, $h) => $q->where('cpf_hash', hash('sha256', preg_replace('/\D/', '', $h))))
            ->orderBy('nome_completo')
            ->paginate(20);

        return PacienteResource::collection($pacientes);
    }

    public function store(StorePacienteRequest $request): JsonResponse
    {
        $paciente = Paciente::create(array_merge(
            $request->validated(),
            [
                'clinica_id'           => $request->user()->clinica_id,
                'user_id'              => $request->user()->id,
                'consentimento_aceito_em' => now(),
                'consentimento_versao' => $request->consentimento_versao ?? '1.0',
            ]
        ));

        return response()->json(['data' => new PacienteResource($paciente)], 201);
    }

    public function show(Request $request, Paciente $paciente): JsonResponse
    {
        $this->authorizeOwnership($request, $paciente);

        $paciente->load('anamnese');

        return response()->json(['data' => new PacienteResource($paciente)]);
    }

    public function update(UpdatePacienteRequest $request, Paciente $paciente): JsonResponse
    {
        $this->authorizeOwnership($request, $paciente);

        $paciente->update($request->validated());

        return response()->json(['data' => new PacienteResource($paciente->fresh())]);
    }

    public function destroy(Request $request, Paciente $paciente): JsonResponse
    {
        $this->authorizeOwnership($request, $paciente);

        // LGPD Art. 18 — direito ao esquecimento via anonimização (preserva histórico).
        $hashId = substr(hash('sha256', $paciente->id . $paciente->user_id . now()->timestamp), 0, 8);

        $paciente->update([
            'nome_completo'       => "Paciente Anonimizado #{$hashId}",
            'cpf'                 => "anon-{$hashId}",
            'telefone'            => "anon-{$hashId}",
            'email'               => "anon-{$hashId}@anon.local",
            'data_nascimento'     => null,
            'endereco'            => null,
            'foto_perfil_path'    => null,
            'observacoes_gerais'  => null,
            'anonimizado_em'      => now(),
        ]);

        $paciente->anamnese()->delete();
        $paciente->fotos()->each(function ($foto) {
            \Illuminate\Support\Facades\Storage::disk($foto->disk)->delete($foto->path);
            $foto->delete();
        });

        return response()->json(['message' => 'Paciente anonimizado.'], 200);
    }

    public function exportar(Request $request, Paciente $paciente): JsonResponse
    {
        $this->authorizeOwnership($request, $paciente);

        $paciente->load(['anamnese', 'consultas.procedimentos', 'fotos']);

        return response()->json(['data' => new PacienteResource($paciente)]);
    }

    public function exportarPdf(Request $request, Paciente $paciente): Response
    {
        $this->authorizeOwnership($request, $paciente);

        $paciente->load(['anamnese', 'consultas.procedimentos']);

        $pdf = Pdf::loadView('pdf.paciente', ['paciente' => $paciente])
            ->setPaper('a4');

        $nome = preg_replace('/[^a-zA-Z0-9_-]/', '_', $paciente->nome_completo);

        return $pdf->download("historico_{$nome}_{$paciente->id}.pdf");
    }

    private function authorizeOwnership(Request $request, Paciente $paciente): void
    {
        abort_if($paciente->clinica_id !== $request->user()->clinica_id, 403);
    }
}
