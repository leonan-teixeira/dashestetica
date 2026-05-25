<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\ClinicaResource;
use App\Models\Clinica;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class ClinicaController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $clinicas = Clinica::with('users')
            ->when($request->search, fn ($q, $s) => $q->where('nome', 'like', "%{$s}%"))
            ->when($request->has('ativo'), fn ($q) => $q->where('ativo', $request->boolean('ativo')))
            ->orderBy('nome')
            ->paginate(20);

        return ClinicaResource::collection($clinicas);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'nome'                  => ['required', 'string', 'max:255'],
            'email_contato'         => ['required', 'email', 'unique:users,email'],
            'telefone'              => ['nullable', 'string', 'max:20'],
            'cnpj'                  => ['nullable', 'string', 'max:18'],
            'plano'                 => ['nullable', 'string', 'in:basico,pro,enterprise'],
            'assinatura_inicio'     => ['nullable', 'date'],
            'assinatura_fim'        => ['nullable', 'date', 'after_or_equal:assinatura_inicio'],
            'usuario_nome'          => ['required', 'string', 'max:255'],
            'usuario_senha'         => ['required', Password::min(8)],
        ]);

        $clinica = DB::transaction(function () use ($request) {
            $clinica = Clinica::create([
                'nome'              => $request->nome,
                'email_contato'     => $request->email_contato,
                'telefone'          => $request->telefone,
                'cnpj'              => $request->cnpj,
                'plano'             => $request->plano ?? 'basico',
                'assinatura_inicio' => $request->assinatura_inicio ?? now()->toDateString(),
                'assinatura_fim'    => $request->assinatura_fim,
                'ativo'             => true,
            ]);

            User::create([
                'clinica_id' => $clinica->id,
                'name'       => $request->usuario_nome,
                'email'      => $request->email_contato,
                'password'   => Hash::make($request->usuario_senha),
            ]);

            return $clinica;
        });

        $clinica->load('users');

        return response()->json(['data' => new ClinicaResource($clinica)], 201);
    }

    public function show(Clinica $clinica): JsonResponse
    {
        $clinica->load('users');

        return response()->json(['data' => new ClinicaResource($clinica)]);
    }

    public function update(Request $request, Clinica $clinica): JsonResponse
    {
        $request->validate([
            'nome'              => ['sometimes', 'string', 'max:255'],
            'email_contato'     => ['sometimes', 'email'],
            'telefone'          => ['nullable', 'string', 'max:20'],
            'cnpj'              => ['nullable', 'string', 'max:18'],
            'plano'             => ['nullable', 'string', 'in:basico,pro,enterprise'],
            'assinatura_inicio' => ['nullable', 'date'],
            'assinatura_fim'    => ['nullable', 'date'],
            'ativo'             => ['sometimes', 'boolean'],
        ]);

        $clinica->update($request->only([
            'nome', 'email_contato', 'telefone', 'cnpj',
            'plano', 'assinatura_inicio', 'assinatura_fim', 'ativo',
        ]));

        $clinica->load('users');

        return response()->json(['data' => new ClinicaResource($clinica)]);
    }

    public function destroy(Clinica $clinica): JsonResponse
    {
        $clinica->update(['ativo' => false]);

        return response()->json(['message' => 'Clínica desativada.']);
    }

    public function reativar(Clinica $clinica): JsonResponse
    {
        $clinica->update(['ativo' => true]);
        $clinica->load('users');

        return response()->json(['data' => new ClinicaResource($clinica)]);
    }
}
