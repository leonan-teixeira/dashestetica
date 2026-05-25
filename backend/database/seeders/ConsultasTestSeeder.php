<?php

namespace Database\Seeders;

use App\Models\Consulta;
use App\Models\Paciente;
use App\Models\Procedimento;
use App\Models\User;
use App\Scopes\TenantScope;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class ConsultasTestSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::where('email', 'leonan@inhubdigital.com.br')->firstOrFail();
        $clinicaId = $user->clinica_id;

        // Garante que procedimentos existentes têm clinica_id
        DB::table('procedimentos')
            ->whereNull('clinica_id')
            ->update(['clinica_id' => $clinicaId, 'user_id' => $user->id]);

        $procedimentos = Procedimento::withoutGlobalScope(TenantScope::class)
            ->where('clinica_id', $clinicaId)
            ->where('ativo', true)
            ->get();

        if ($procedimentos->isEmpty()) {
            $this->command->error('Nenhum procedimento encontrado. Rode ProcedimentosSeeder primeiro.');
            return;
        }

        $pacientes = Paciente::withoutGlobalScope(TenantScope::class)
            ->where('clinica_id', $clinicaId)
            ->get();

        if ($pacientes->isEmpty()) {
            $this->command->error('Nenhum paciente encontrado. Rode PacientesTestSeeder primeiro.');
            return;
        }

        $agora = Carbon::now();

        // 20 consultas: passado + futuro + hoje
        $consultas = [
            // --- REALIZADAS (passado) ---
            ['paciente' => 0, 'procs' => [0, 1], 'dias' => -45, 'hora' => '09:00', 'status' => 'realizada',      'pago' => true,  'forma' => 'pix',        'evolucao' => 'Paciente respondeu bem ao tratamento. Retorno sugerido em 30 dias.', 'retorno' => 30],
            ['paciente' => 1, 'procs' => [2],    'dias' => -38, 'hora' => '10:30', 'status' => 'realizada',      'pago' => true,  'forma' => 'credito',    'evolucao' => 'Procedimento realizado sem intercorrências.', 'retorno' => null],
            ['paciente' => 2, 'procs' => [1, 3], 'dias' => -30, 'hora' => '14:00', 'status' => 'realizada',      'pago' => true,  'forma' => 'dinheiro',   'evolucao' => 'Ótima resposta. Pele mais uniforme.', 'retorno' => 21],
            ['paciente' => 3, 'procs' => [0],    'dias' => -25, 'hora' => '11:00', 'status' => 'realizada',      'pago' => true,  'forma' => 'pix',        'evolucao' => null, 'retorno' => null],
            ['paciente' => 4, 'procs' => [2, 4], 'dias' => -20, 'hora' => '15:30', 'status' => 'realizada',      'pago' => true,  'forma' => 'debito',     'evolucao' => 'Resultado satisfatório. Recomendado manutenção mensal.', 'retorno' => 30],
            ['paciente' => 5, 'procs' => [3],    'dias' => -15, 'hora' => '09:30', 'status' => 'realizada',      'pago' => false, 'forma' => 'credito',    'evolucao' => 'Sessão de manutenção realizada.', 'retorno' => null],
            ['paciente' => 6, 'procs' => [0, 2], 'dias' => -12, 'hora' => '13:00', 'status' => 'realizada',      'pago' => true,  'forma' => 'pix',        'evolucao' => 'Primeira sessão do protocolo de 4.', 'retorno' => 14],
            ['paciente' => 7, 'procs' => [1],    'dias' => -10, 'hora' => '16:00', 'status' => 'realizada',      'pago' => true,  'forma' => 'dinheiro',   'evolucao' => null, 'retorno' => null],

            // --- CANCELADA / NÃO COMPARECEU ---
            ['paciente' => 8, 'procs' => [4],    'dias' => -8,  'hora' => '10:00', 'status' => 'cancelada',      'pago' => false, 'forma' => null,         'evolucao' => null, 'retorno' => null],
            ['paciente' => 9, 'procs' => [2],    'dias' => -5,  'hora' => '14:30', 'status' => 'nao_compareceu', 'pago' => false, 'forma' => null,         'evolucao' => null, 'retorno' => null],

            // --- HOJE ---
            ['paciente' => 0, 'procs' => [3, 4], 'dias' => 0,   'hora' => '09:00', 'status' => 'confirmada',     'pago' => false, 'forma' => null,         'evolucao' => null, 'retorno' => null],
            ['paciente' => 2, 'procs' => [0],    'dias' => 0,   'hora' => '11:30', 'status' => 'agendada',       'pago' => false, 'forma' => null,         'evolucao' => null, 'retorno' => null],
            ['paciente' => 5, 'procs' => [1, 2], 'dias' => 0,   'hora' => '15:00', 'status' => 'confirmada',     'pago' => false, 'forma' => null,         'evolucao' => null, 'retorno' => null],

            // --- FUTURO PRÓXIMO ---
            ['paciente' => 1, 'procs' => [0, 3], 'dias' => 2,   'hora' => '10:00', 'status' => 'agendada',       'pago' => false, 'forma' => null,         'evolucao' => null, 'retorno' => null],
            ['paciente' => 3, 'procs' => [2],    'dias' => 3,   'hora' => '14:00', 'status' => 'agendada',       'pago' => false, 'forma' => null,         'evolucao' => null, 'retorno' => null],
            ['paciente' => 4, 'procs' => [1],    'dias' => 5,   'hora' => '09:30', 'status' => 'confirmada',     'pago' => false, 'forma' => null,         'evolucao' => null, 'retorno' => null],
            ['paciente' => 6, 'procs' => [0, 2], 'dias' => 7,   'hora' => '11:00', 'status' => 'agendada',       'pago' => false, 'forma' => null,         'evolucao' => null, 'retorno' => null],
            ['paciente' => 7, 'procs' => [3, 4], 'dias' => 10,  'hora' => '15:30', 'status' => 'agendada',       'pago' => false, 'forma' => null,         'evolucao' => null, 'retorno' => null],

            // --- FUTURO DISTANTE ---
            ['paciente' => 8, 'procs' => [2],    'dias' => 14,  'hora' => '13:00', 'status' => 'agendada',       'pago' => false, 'forma' => null,         'evolucao' => null, 'retorno' => null],
            ['paciente' => 9, 'procs' => [1, 3], 'dias' => 21,  'hora' => '10:00', 'status' => 'agendada',       'pago' => false, 'forma' => null,         'evolucao' => null, 'retorno' => null],
        ];

        $criadas = 0;

        foreach ($consultas as $cfg) {
            $paciente = $pacientes->get($cfg['paciente'] % $pacientes->count());
            $procs    = collect($cfg['procs'])
                ->map(fn ($i) => $procedimentos->get($i % $procedimentos->count()))
                ->filter()
                ->unique('id');

            $inicio = Carbon::parse($agora->copy()->addDays($cfg['dias'])->format('Y-m-d') . ' ' . $cfg['hora']);
            $duracao = $procs->sum('duracao_minutos') ?: 60;
            $fim    = $inicio->copy()->addMinutes($duracao);

            $valorTotal = $procs->sum('preco');

            $consulta = Consulta::withoutGlobalScope(TenantScope::class)->create([
                'clinica_id'                => $clinicaId,
                'user_id'                   => $user->id,
                'paciente_id'               => $paciente->id,
                'inicio'                    => $inicio,
                'fim'                       => $fim,
                'status'                    => $cfg['status'],
                'valor_total'               => $valorTotal,
                'forma_pagamento'           => $cfg['forma'],
                'pago'                      => $cfg['pago'],
                'evolucao_clinica'          => $cfg['evolucao'],
                'proxima_recomendacao_dias' => $cfg['retorno'],
            ]);

            $pivot = $procs->mapWithKeys(fn ($p) => [
                $p->id => ['preco_aplicado' => $p->preco, 'duracao_aplicada' => $p->duracao_minutos],
            ]);
            $consulta->procedimentos()->attach($pivot);

            $criadas++;
            $this->command->info("#{$criadas} [{$cfg['status']}] {$paciente->nome_completo} — {$inicio->format('d/m/Y H:i')}");
        }

        $this->command->info("\n{$criadas} consultas criadas.");
    }
}
