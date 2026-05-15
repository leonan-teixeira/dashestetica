<?php

namespace Database\Seeders;

use App\Models\Procedimento;
use App\Models\User;
use Illuminate\Database\Seeder;

class ProcedimentosSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::first();
        if (! $user) {
            $this->command->warn('Nenhum usuário encontrado. Crie um usuário primeiro.');
            return;
        }

        $procedimentos = [
            ['nome' => 'Limpeza de Pele Profunda',      'categoria' => 'facial',    'duracao_minutos' => 60,  'preco' => 150.00],
            ['nome' => 'Peeling Químico',                'categoria' => 'facial',    'duracao_minutos' => 45,  'preco' => 200.00],
            ['nome' => 'Microagulhamento',               'categoria' => 'facial',    'duracao_minutos' => 60,  'preco' => 350.00],
            ['nome' => 'Hidratação Facial',              'categoria' => 'facial',    'duracao_minutos' => 50,  'preco' => 120.00],
            ['nome' => 'Radiofrequência Facial',         'categoria' => 'facial',    'duracao_minutos' => 60,  'preco' => 280.00],
            ['nome' => 'Massagem Relaxante',             'categoria' => 'corporal',  'duracao_minutos' => 60,  'preco' => 130.00],
            ['nome' => 'Drenagem Linfática',             'categoria' => 'corporal',  'duracao_minutos' => 60,  'preco' => 140.00],
            ['nome' => 'Massagem Modeladora',            'categoria' => 'corporal',  'duracao_minutos' => 50,  'preco' => 160.00],
            ['nome' => 'Depilação Cera (pernas)',        'categoria' => 'depilacao', 'duracao_minutos' => 40,  'preco' => 80.00],
            ['nome' => 'Design de Sobrancelhas',         'categoria' => 'sobrancelha','duracao_minutos' => 30, 'preco' => 60.00],
            ['nome' => 'Henna de Sobrancelha',           'categoria' => 'sobrancelha','duracao_minutos' => 40, 'preco' => 70.00],
            ['nome' => 'Aplicação de Cílios (volume)',   'categoria' => 'cilios',    'duracao_minutos' => 120, 'preco' => 250.00],
        ];

        foreach ($procedimentos as $dados) {
            Procedimento::firstOrCreate(
                ['user_id' => $user->id, 'nome' => $dados['nome']],
                array_merge($dados, ['user_id' => $user->id, 'ativo' => true])
            );
        }

        $this->command->info('Procedimentos criados para o usuário: ' . $user->email);
    }
}
