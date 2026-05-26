<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ContaPagar;
use App\Scopes\TenantScope;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Validation\Rule;

class ContasPagarController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $q = ContaPagar::query();

        if ($request->filled('status')) {
            $q->where('status', $request->status);
        }

        if ($request->filled('categoria')) {
            $q->where('categoria', $request->categoria);
        }

        if ($request->filled('data_inicio')) {
            $q->whereDate('data_vencimento', '>=', $request->data_inicio);
        }

        if ($request->filled('data_fim')) {
            $q->whereDate('data_vencimento', '<=', $request->data_fim);
        }

        if ($request->filled('busca')) {
            $q->where(function ($sub) use ($request) {
                $sub->where('descricao', 'like', '%' . $request->busca . '%')
                    ->orWhere('fornecedor', 'like', '%' . $request->busca . '%');
            });
        }

        $contas = $q->orderBy('data_vencimento')->paginate(25);

        return response()->json([
            'data' => $contas->map(fn ($c) => $this->format($c)),
            'meta' => [
                'current_page'  => $contas->currentPage(),
                'last_page'     => $contas->lastPage(),
                'total'         => $contas->total(),
                'soma_filtro'   => (float) $q->sum('valor'),
                'soma_pendente' => (float) ContaPagar::query()
                    ->whereIn('status', ['pendente', 'vencido'])
                    ->sum('valor'),
            ],
        ]);
    }

    public function resumo(): JsonResponse
    {
        $clinicaId = auth()->user()->clinica_id;

        $base = ContaPagar::withoutGlobalScope(TenantScope::class)
            ->where('clinica_id', $clinicaId);

        // Auto-atualiza vencidas antes de calcular
        (clone $base)
            ->where('status', 'pendente')
            ->whereDate('data_vencimento', '<', today())
            ->update(['status' => 'vencido']);

        $totalPendente = (clone $base)->where('status', 'pendente')->sum('valor');
        $totalVencido  = (clone $base)->where('status', 'vencido')->sum('valor');
        $totalPagoMes  = (clone $base)
            ->where('status', 'pago')
            ->whereMonth('data_pagamento', now()->month)
            ->whereYear('data_pagamento', now()->year)
            ->sum('valor');
        $qtdVencido    = (clone $base)->where('status', 'vencido')->count();

        // Vencimentos próximos (próximos 7 dias)
        $proximas = (clone $base)
            ->where('status', 'pendente')
            ->whereBetween('data_vencimento', [today(), today()->addDays(7)])
            ->orderBy('data_vencimento')
            ->get()
            ->map(fn ($c) => $this->format($c));

        return response()->json([
            'total_pendente' => (float) $totalPendente,
            'total_vencido'  => (float) $totalVencido,
            'total_pago_mes' => (float) $totalPagoMes,
            'qtd_vencido'    => (int) $qtdVencido,
            'proximas_7dias' => $proximas,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'descricao'       => 'required|string|max:255',
            'fornecedor'      => 'nullable|string|max:255',
            'categoria'       => 'nullable|string|max:100',
            'valor'           => 'required|numeric|min:0.01',
            'data_vencimento' => 'required|date',
            'observacao'      => 'nullable|string',
            'recorrente'      => 'boolean',
            'recorrencia'     => ['nullable', Rule::in(['semanal', 'mensal', 'anual'])],
        ]);

        $data['clinica_id'] = auth()->user()->clinica_id;
        $data['status']     = 'pendente';

        $conta = ContaPagar::create($data);

        return response()->json(['data' => $this->format($conta)], 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $conta = ContaPagar::findOrFail($id);
        abort_if($conta->clinica_id !== auth()->user()->clinica_id, 403);

        $data = $request->validate([
            'descricao'       => 'sometimes|required|string|max:255',
            'fornecedor'      => 'nullable|string|max:255',
            'categoria'       => 'nullable|string|max:100',
            'valor'           => 'sometimes|required|numeric|min:0.01',
            'data_vencimento' => 'sometimes|required|date',
            'observacao'      => 'nullable|string',
            'recorrente'      => 'boolean',
            'recorrencia'     => ['nullable', Rule::in(['semanal', 'mensal', 'anual'])],
        ]);

        $conta->update($data);

        return response()->json(['data' => $this->format($conta->fresh())]);
    }

    public function pagar(Request $request, int $id): JsonResponse
    {
        $conta = ContaPagar::findOrFail($id);
        abort_if($conta->clinica_id !== auth()->user()->clinica_id, 403);

        $data = $request->validate([
            'data_pagamento'  => 'required|date',
            'forma_pagamento' => 'nullable|string|in:pix,credito,debito,dinheiro,transferencia,outro',
        ]);

        $conta->update([
            'status'          => 'pago',
            'data_pagamento'  => $data['data_pagamento'],
            'forma_pagamento' => $data['forma_pagamento'] ?? null,
        ]);

        // Se recorrente, gera próxima parcela automaticamente
        if ($conta->recorrente && $conta->recorrencia) {
            $proxVencimento = match ($conta->recorrencia) {
                'semanal' => Carbon::parse($conta->data_vencimento)->addWeek(),
                'mensal'  => Carbon::parse($conta->data_vencimento)->addMonth(),
                'anual'   => Carbon::parse($conta->data_vencimento)->addYear(),
            };

            ContaPagar::create([
                'clinica_id'      => $conta->clinica_id,
                'descricao'       => $conta->descricao,
                'fornecedor'      => $conta->fornecedor,
                'categoria'       => $conta->categoria,
                'valor'           => $conta->valor,
                'data_vencimento' => $proxVencimento,
                'status'          => 'pendente',
                'observacao'      => $conta->observacao,
                'recorrente'      => true,
                'recorrencia'     => $conta->recorrencia,
            ]);
        }

        return response()->json(['data' => $this->format($conta->fresh())]);
    }

    public function desfazerPagamento(int $id): JsonResponse
    {
        $conta = ContaPagar::findOrFail($id);
        abort_if($conta->clinica_id !== auth()->user()->clinica_id, 403);

        $conta->update([
            'status'          => 'pendente',
            'data_pagamento'  => null,
            'forma_pagamento' => null,
        ]);

        return response()->json(['data' => $this->format($conta->fresh())]);
    }

    public function destroy(int $id): JsonResponse
    {
        $conta = ContaPagar::findOrFail($id);
        abort_if($conta->clinica_id !== auth()->user()->clinica_id, 403);
        $conta->delete();
        return response()->json(['message' => 'Conta removida.']);
    }

    public function categorias(): JsonResponse
    {
        $clinicaId = auth()->user()->clinica_id;
        $cats = ContaPagar::withoutGlobalScope(TenantScope::class)
            ->where('clinica_id', $clinicaId)
            ->whereNotNull('categoria')
            ->distinct()->pluck('categoria')->sort()->values();
        return response()->json($cats);
    }

    private function format(ContaPagar $c): array
    {
        return [
            'id'              => $c->id,
            'descricao'       => $c->descricao,
            'fornecedor'      => $c->fornecedor,
            'categoria'       => $c->categoria,
            'valor'           => (float) $c->valor,
            'data_vencimento' => $c->data_vencimento?->toDateString(),
            'data_pagamento'  => $c->data_pagamento?->toDateString(),
            'status'          => $c->status,
            'forma_pagamento' => $c->forma_pagamento,
            'observacao'      => $c->observacao,
            'recorrente'      => $c->recorrente,
            'recorrencia'     => $c->recorrencia,
            'created_at'      => $c->created_at?->toISOString(),
        ];
    }
}
