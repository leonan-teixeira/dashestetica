<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\MovimentacaoEstoqueResource;
use App\Http\Resources\ProdutoResource;
use App\Models\MovimentacaoEstoque;
use App\Models\Produto;
use App\Scopes\TenantScope;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\Rule;

class EstoqueController extends Controller
{
    // ── Produtos ──────────────────────────────────────────────────────────────

    public function indexProdutos(Request $request): AnonymousResourceCollection
    {
        $query = Produto::query();

        if ($request->filled('busca')) {
            $query->where('nome', 'like', '%' . $request->busca . '%');
        }

        if ($request->filled('categoria')) {
            $query->where('categoria', $request->categoria);
        }

        if ($request->has('ativo') && $request->ativo !== '') {
            $query->where('ativo', filter_var($request->ativo, FILTER_VALIDATE_BOOLEAN));
        }

        $produtos = $query->orderBy('nome')->paginate(20);

        return ProdutoResource::collection($produtos);
    }

    public function storeProduto(Request $request): ProdutoResource
    {
        $data = $request->validate([
            'nome'           => 'required|string|max:255',
            'descricao'      => 'nullable|string',
            'categoria'      => 'nullable|string|max:100',
            'unidade'        => 'nullable|string|max:20',
            'estoque_minimo' => 'nullable|numeric|min:0',
        ]);

        $data['clinica_id'] = auth()->user()->clinica_id;
        $data['ativo']      = true;

        return new ProdutoResource(Produto::create($data));
    }

    public function showProduto(int $id): ProdutoResource
    {
        $produto = Produto::findOrFail($id);
        abort_if($produto->clinica_id !== auth()->user()->clinica_id, 403);

        return new ProdutoResource($produto);
    }

    public function updateProduto(Request $request, int $id): ProdutoResource
    {
        $produto = Produto::findOrFail($id);
        abort_if($produto->clinica_id !== auth()->user()->clinica_id, 403);

        $data = $request->validate([
            'nome'           => 'sometimes|required|string|max:255',
            'descricao'      => 'nullable|string',
            'categoria'      => 'nullable|string|max:100',
            'unidade'        => 'nullable|string|max:20',
            'estoque_minimo' => 'nullable|numeric|min:0',
        ]);

        $produto->update($data);

        return new ProdutoResource($produto);
    }

    public function toggleAtivo(int $id): ProdutoResource
    {
        $produto = Produto::findOrFail($id);
        abort_if($produto->clinica_id !== auth()->user()->clinica_id, 403);

        $produto->update(['ativo' => !$produto->ativo]);

        return new ProdutoResource($produto);
    }

    public function destroyProduto(int $id): JsonResponse
    {
        $produto = Produto::findOrFail($id);
        abort_if($produto->clinica_id !== auth()->user()->clinica_id, 403);

        $produto->delete();

        return response()->json(['message' => 'Produto removido.']);
    }

    // ── Movimentações ─────────────────────────────────────────────────────────

    public function indexMovimentacoes(Request $request): AnonymousResourceCollection
    {
        $query = MovimentacaoEstoque::with('produto')->latest();

        if ($request->filled('produto_id')) {
            $query->where('produto_id', $request->produto_id);
        }

        if ($request->filled('tipo')) {
            $query->where('tipo', $request->tipo);
        }

        if ($request->filled('data_inicio')) {
            $query->whereDate('created_at', '>=', $request->data_inicio);
        }

        if ($request->filled('data_fim')) {
            $query->whereDate('created_at', '<=', $request->data_fim);
        }

        return MovimentacaoEstoqueResource::collection($query->paginate(30));
    }

    public function storeMovimentacao(Request $request): MovimentacaoEstoqueResource
    {
        $data = $request->validate([
            'produto_id'     => 'required|integer',
            'tipo'           => ['required', Rule::in(['entrada', 'saida'])],
            'quantidade'     => 'required|numeric|min:0.01',
            'preco_unitario' => 'nullable|numeric|min:0',
            'motivo'         => 'nullable|string|max:255',
            'observacao'     => 'nullable|string',
        ]);

        $produto = Produto::findOrFail($data['produto_id']);
        abort_if($produto->clinica_id !== auth()->user()->clinica_id, 403);

        if ($data['tipo'] === 'saida') {
            $estoqueAtual = $produto->estoque_atual;
            abort_if($estoqueAtual < $data['quantidade'], 422, 'Estoque insuficiente para saída.');
        }

        $data['clinica_id'] = auth()->user()->clinica_id;

        $mov = MovimentacaoEstoque::create($data);
        $mov->load('produto');

        return new MovimentacaoEstoqueResource($mov);
    }

    // ── Relatório ─────────────────────────────────────────────────────────────

    public function relatorio(): JsonResponse
    {
        $clinicaId = auth()->user()->clinica_id;

        $produtos = Produto::withoutGlobalScope(TenantScope::class)
            ->where('clinica_id', $clinicaId)
            ->get();

        $itens = $produtos->map(function (Produto $p) {
            $entradas = $p->movimentacoes()->where('tipo', 'entrada')->sum('quantidade');
            $saidas   = $p->movimentacoes()->where('tipo', 'saida')->sum('quantidade');
            $atual    = (float) ($entradas - $saidas);

            $valorTotal = $p->movimentacoes()
                ->where('tipo', 'entrada')
                ->whereNotNull('preco_unitario')
                ->selectRaw('SUM(quantidade * preco_unitario) as total')
                ->value('total');

            return [
                'id'             => $p->id,
                'nome'           => $p->nome,
                'categoria'      => $p->categoria,
                'unidade'        => $p->unidade,
                'estoque_minimo' => (float) $p->estoque_minimo,
                'estoque_atual'  => $atual,
                'estoque_baixo'  => $atual < (float) $p->estoque_minimo,
                'ativo'          => $p->ativo,
                'valor_investido' => $valorTotal ? round((float) $valorTotal, 2) : 0.0,
            ];
        });

        $totais = [
            'total_produtos'    => $itens->count(),
            'produtos_ativos'   => $itens->where('ativo', true)->count(),
            'produtos_inativos' => $itens->where('ativo', false)->count(),
            'alertas_estoque'   => $itens->where('ativo', true)->where('estoque_baixo', true)->count(),
            'valor_total_estoque' => $itens->where('ativo', true)->sum('valor_investido'),
        ];

        return response()->json([
            'totais' => $totais,
            'itens'  => $itens->values(),
        ]);
    }

    // ── Categorias ────────────────────────────────────────────────────────────

    public function categorias(): JsonResponse
    {
        $clinicaId = auth()->user()->clinica_id;

        $cats = Produto::withoutGlobalScope(TenantScope::class)
            ->where('clinica_id', $clinicaId)
            ->whereNotNull('categoria')
            ->distinct()
            ->pluck('categoria')
            ->sort()
            ->values();

        return response()->json($cats);
    }
}
