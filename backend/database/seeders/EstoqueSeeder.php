<?php

namespace Database\Seeders;

use App\Models\MovimentacaoEstoque;
use App\Models\Produto;
use App\Models\User;
use App\Scopes\TenantScope;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class EstoqueSeeder extends Seeder
{
    public function run(): void
    {
        $user      = User::where('email', 'leonan@inhubdigital.com.br')->firstOrFail();
        $clinicaId = $user->clinica_id;

        $produtos = [
            // Descartáveis
            ['nome' => 'Luva descartável P',        'categoria' => 'Descartáveis', 'unidade' => 'cx',  'estoque_minimo' => 3,  'descricao' => 'Caixa com 100 unidades'],
            ['nome' => 'Luva descartável M',        'categoria' => 'Descartáveis', 'unidade' => 'cx',  'estoque_minimo' => 3,  'descricao' => 'Caixa com 100 unidades'],
            ['nome' => 'Seringa 1ml',               'categoria' => 'Descartáveis', 'unidade' => 'cx',  'estoque_minimo' => 2,  'descricao' => 'Caixa com 100 unidades'],
            ['nome' => 'Agulha 30G 4mm',            'categoria' => 'Descartáveis', 'unidade' => 'cx',  'estoque_minimo' => 2,  'descricao' => 'Ideal para toxina botulínica'],
            ['nome' => 'Agulha 27G 13mm',           'categoria' => 'Descartáveis', 'unidade' => 'cx',  'estoque_minimo' => 2,  'descricao' => null],
            ['nome' => 'Gaze estéril',              'categoria' => 'Descartáveis', 'unidade' => 'cx',  'estoque_minimo' => 5,  'descricao' => 'Pacote com 10 unidades'],
            ['nome' => 'Curativo transparente',     'categoria' => 'Descartáveis', 'unidade' => 'un',  'estoque_minimo' => 20, 'descricao' => null],

            // Antissépticos
            ['nome' => 'Álcool 70% 1L',             'categoria' => 'Antissépticos', 'unidade' => 'un', 'estoque_minimo' => 4,  'descricao' => null],
            ['nome' => 'Clorexidina 0,5% 500ml',    'categoria' => 'Antissépticos', 'unidade' => 'un', 'estoque_minimo' => 2,  'descricao' => null],
            ['nome' => 'PVPI degermante 1L',        'categoria' => 'Antissépticos', 'unidade' => 'un', 'estoque_minimo' => 2,  'descricao' => null],

            // Ativos e medicamentos
            ['nome' => 'Toxina Botulínica 100U',    'categoria' => 'Ativos',        'unidade' => 'fr', 'estoque_minimo' => 2,  'descricao' => 'Manter refrigerado 2–8°C'],
            ['nome' => 'Ácido Hialurônico 1ml',     'categoria' => 'Ativos',        'unidade' => 'un', 'estoque_minimo' => 3,  'descricao' => 'Preenchedor dérmico'],
            ['nome' => 'Vitamina C 10% 30ml',       'categoria' => 'Ativos',        'unidade' => 'un', 'estoque_minimo' => 5,  'descricao' => null],
            ['nome' => 'Colágeno Hidrolisado 30ml', 'categoria' => 'Ativos',        'unidade' => 'un', 'estoque_minimo' => 4,  'descricao' => null],
            ['nome' => 'Ácido Glicólico 30% 30ml',  'categoria' => 'Ativos',        'unidade' => 'un', 'estoque_minimo' => 3,  'descricao' => 'Peeling químico suave'],

            // Cosméticos
            ['nome' => 'Creme hidratante 50g',      'categoria' => 'Cosméticos',    'unidade' => 'un', 'estoque_minimo' => 5,  'descricao' => null],
            ['nome' => 'Sérum facial 30ml',         'categoria' => 'Cosméticos',    'unidade' => 'un', 'estoque_minimo' => 4,  'descricao' => null],
            ['nome' => 'Protetor solar FPS60 60g',  'categoria' => 'Cosméticos',    'unidade' => 'un', 'estoque_minimo' => 6,  'descricao' => null],

            // Equipamentos consumíveis
            ['nome' => 'Eletrodo descartável',      'categoria' => 'Equipamentos',  'unidade' => 'pc', 'estoque_minimo' => 10, 'descricao' => 'Para aparelho de eletroestimulação'],
            ['nome' => 'Gel condutor 1kg',          'categoria' => 'Equipamentos',  'unidade' => 'un', 'estoque_minimo' => 2,  'descricao' => 'Para ultrassom e eletroterapia'],
        ];

        $criados = [];

        foreach ($produtos as $dados) {
            // Evita duplicatas
            if (Produto::withoutGlobalScope(TenantScope::class)
                ->where('clinica_id', $clinicaId)
                ->where('nome', $dados['nome'])
                ->exists()
            ) {
                $this->command->warn("Pulando {$dados['nome']} — já existe.");
                continue;
            }

            $produto = Produto::create(array_merge($dados, [
                'clinica_id' => $clinicaId,
                'ativo'      => true,
            ]));

            $criados[] = $produto;
            $this->command->info("Produto criado: {$produto->nome}");
        }

        // Movimentações — entradas iniciais + algumas saídas
        $movimentos = [
            // [produto_idx, tipo, qtd, preco, dias_atras, motivo]
            [0,  'entrada', 5,  42.90,  60, 'Compra inicial'],
            [1,  'entrada', 5,  42.90,  60, 'Compra inicial'],
            [2,  'entrada', 4,  38.00,  55, 'Compra inicial'],
            [3,  'entrada', 3,  65.00,  55, 'Compra inicial'],
            [4,  'entrada', 3,  55.00,  55, 'Compra inicial'],
            [5,  'entrada', 10, 12.50,  50, 'Compra inicial'],
            [6,  'entrada', 50, 0.80,   50, 'Compra inicial'],
            [7,  'entrada', 8,  18.90,  45, 'Compra inicial'],
            [8,  'entrada', 4,  24.50,  45, 'Compra inicial'],
            [9,  'entrada', 3,  32.00,  45, 'Compra inicial'],
            [10, 'entrada', 5,  290.00, 40, 'Compra inicial — lote refrigerado'],
            [11, 'entrada', 6,  380.00, 40, 'Compra inicial'],
            [12, 'entrada', 10, 45.00,  35, 'Compra inicial'],
            [13, 'entrada', 8,  52.00,  35, 'Compra inicial'],
            [14, 'entrada', 6,  68.00,  35, 'Compra inicial'],
            [15, 'entrada', 10, 28.00,  30, 'Compra inicial'],
            [16, 'entrada', 8,  95.00,  30, 'Compra inicial'],
            [17, 'entrada', 12, 35.00,  30, 'Compra inicial'],
            [18, 'entrada', 30, 2.50,   25, 'Compra inicial'],
            [19, 'entrada', 4,  48.00,  25, 'Compra inicial'],

            // Reposições (mais recentes)
            [0,  'entrada', 3,  44.00,  20, 'Reposição'],
            [2,  'entrada', 2,  40.00,  18, 'Reposição'],
            [10, 'entrada', 3,  295.00, 15, 'Reposição — compra urgente'],
            [17, 'entrada', 6,  34.00,  12, 'Reposição'],

            // Saídas — uso em procedimentos
            [0,  'saida',  2,   null, 45, 'Uso em procedimentos'],
            [1,  'saida',  1,   null, 40, 'Uso em procedimentos'],
            [2,  'saida',  2,   null, 38, 'Uso em procedimentos'],
            [3,  'saida',  1,   null, 35, 'Uso em procedimentos'],
            [5,  'saida',  3,   null, 30, 'Uso em procedimentos'],
            [6,  'saida',  15,  null, 28, 'Uso em procedimentos'],
            [7,  'saida',  3,   null, 25, 'Uso em procedimentos'],
            [10, 'saida',  2,   null, 22, 'Aplicação em consultas'],
            [11, 'saida',  2,   null, 20, 'Aplicação em preenchimento'],
            [12, 'saida',  3,   null, 18, 'Uso em tratamentos'],
            [13, 'saida',  2,   null, 15, 'Uso em tratamentos'],
            [14, 'saida',  2,   null, 12, 'Peeling sessão em grupo'],
            [15, 'saida',  4,   null, 10, 'Pós-procedimento'],
            [16, 'saida',  3,   null, 8,  'Aplicação pós-laser'],
            [17, 'saida',  5,   null, 5,  'Proteção pós-procedimento'],
            [18, 'saida',  8,   null, 4,  'Sessão de eletroestimulação'],
            [19, 'saida',  1,   null, 3,  'Uso em ultrassom'],

            // Saídas que geram estoque baixo (para testar alertas)
            [0,  'saida',  4,   null, 2, 'Uso intenso — semana alta demanda'],
            [3,  'saida',  2,   null, 2, 'Uso em procedimentos'],
            [10, 'saida',  3,   null, 1, 'Sessões de botox'],
            [11, 'saida',  3,   null, 1, 'Preenchimento labial'],
        ];

        $movCriadas = 0;

        foreach ($movimentos as [$idx, $tipo, $qtd, $preco, $diasAtras, $motivo]) {
            if (!isset($criados[$idx])) {
                continue;
            }

            $produto = $criados[$idx];
            $data    = Carbon::now()->subDays($diasAtras)->subHours(rand(0, 8));

            MovimentacaoEstoque::create([
                'clinica_id'     => $clinicaId,
                'produto_id'     => $produto->id,
                'tipo'           => $tipo,
                'quantidade'     => $qtd,
                'preco_unitario' => $tipo === 'entrada' ? $preco : null,
                'motivo'         => $motivo,
                'observacao'     => null,
                'created_at'     => $data,
                'updated_at'     => $data,
            ]);

            $movCriadas++;
        }

        $this->command->info("\n{$movCriadas} movimentações criadas.");
        $this->command->info('Produtos com estoque baixo (para testar alertas): Luva P, Agulha 30G, Toxina Botulínica, Ácido Hialurônico.');
    }
}
