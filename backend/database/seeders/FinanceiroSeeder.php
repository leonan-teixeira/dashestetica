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

class FinanceiroSeeder extends Seeder
{
    public function run(): void
    {
        $user      = User::where('email', 'leonan@inhubdigital.com.br')->firstOrFail();
        $clinicaId = $user->clinica_id;

        $pacientes    = Paciente::withoutGlobalScope(TenantScope::class)->where('clinica_id', $clinicaId)->get();
        $procedimentos = Procedimento::withoutGlobalScope(TenantScope::class)->where('clinica_id', $clinicaId)->where('ativo', true)->get();

        if ($pacientes->isEmpty() || $procedimentos->isEmpty()) {
            $this->command->error('Rode PacientesTestSeeder e ProcedimentosSeeder antes.');
            return;
        }

        // ── 1. Atualiza formas de pagamento das consultas já existentes ────────
        $formas = ['pix', 'credito', 'debito', 'dinheiro', 'pix', 'pix']; // pix mais frequente

        $existentes = Consulta::withoutGlobalScope(TenantScope::class)
            ->where('clinica_id', $clinicaId)
            ->where('status', 'realizada')
            ->whereNull('forma_pagamento')
            ->get();

        foreach ($existentes as $c) {
            $c->update(['forma_pagamento' => $formas[array_rand($formas)]]);
        }

        $this->command->info("{$existentes->count()} consultas existentes atualizadas com forma de pagamento.");

        // ── 2. Cria consultas históricas (meses anteriores) para o gráfico ─────
        $historico = [];

        // Últimos 11 meses (mês atual já tem dados do ConsultasTestSeeder)
        for ($m = 11; $m >= 1; $m--) {
            $mesBase   = Carbon::now()->subMonths($m)->startOfMonth();
            $qtdMes    = rand(8, 18);

            for ($i = 0; $i < $qtdMes; $i++) {
                $paciente  = $pacientes->random();
                $nProcs    = rand(1, 3);
                $procs     = $procedimentos->random(min($nProcs, $procedimentos->count()));
                $valor     = $procs->sum('preco') ?: rand(150, 800);
                $pago      = rand(0, 100) > 10; // 90% pago
                $forma     = $pago ? $formas[array_rand($formas)] : null;
                $dia       = rand(1, 28);
                $hora      = sprintf('%02d:%02d', rand(8, 18), [0, 15, 30, 45][rand(0, 3)]);
                $inicio    = $mesBase->copy()->addDays($dia - 1)->setTimeFromTimeString($hora);
                $duracao   = $procs->sum('duracao_minutos') ?: 60;
                $fim       = $inicio->copy()->addMinutes($duracao);

                $historico[] = [
                    'clinica_id'      => $clinicaId,
                    'user_id'         => $user->id,
                    'paciente_id'     => $paciente->id,
                    'inicio'          => $inicio,
                    'fim'             => $fim,
                    'status'          => 'realizada',
                    'valor_total'     => $valor,
                    'forma_pagamento' => $forma,
                    'pago'            => $pago,
                    'created_at'      => $inicio,
                    'updated_at'      => $inicio,
                ];
            }
        }

        // Insere em lotes
        $chunks = array_chunk($historico, 50);
        $total  = 0;

        foreach ($chunks as $chunk) {
            DB::table('consultas')->insert($chunk);
            $total += count($chunk);
        }

        $this->command->info("{$total} consultas históricas criadas (11 meses anteriores).");

        // ── 3. Resumo por mês ─────────────────────────────────────────────────
        $porMes = DB::table('consultas')
            ->where('clinica_id', $clinicaId)
            ->where('status', 'realizada')
            ->selectRaw("DATE_FORMAT(inicio, '%Y-%m') as mes, COUNT(*) as qtd, SUM(valor_total) as total")
            ->groupByRaw("DATE_FORMAT(inicio, '%Y-%m')")
            ->orderBy('mes')
            ->get();

        $this->command->info("\nResumo por mês:");
        foreach ($porMes as $row) {
            $this->command->line("  {$row->mes} — {$row->qtd} consultas — R$ " . number_format($row->total, 2, ',', '.'));
        }
    }
}
