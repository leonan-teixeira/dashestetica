<?php

namespace App\Console\Commands;

use App\Jobs\EnviarLembreteJob;
use App\Models\Lembrete;
use Illuminate\Console\Command;

class ProcessarLembretesCommand extends Command
{
    protected $signature = 'lembretes:processar
                            {--limit=100 : Máximo de lembretes a processar por execução}';

    protected $description = 'Despacha jobs para enviar lembretes WhatsApp pendentes vencidos.';

    public function handle(): int
    {
        $limit = (int) $this->option('limit');

        $lembretes = Lembrete::query()
            ->where('status', 'pendente')
            ->where('canal', 'whatsapp')
            ->where('agendado_para', '<=', now())
            ->orderBy('agendado_para')
            ->limit($limit)
            ->get();

        if ($lembretes->isEmpty()) {
            $this->info('Nenhum lembrete pendente.');
            return self::SUCCESS;
        }

        foreach ($lembretes as $lembrete) {
            EnviarLembreteJob::dispatch($lembrete);
        }

        $this->info("Despachados {$lembretes->count()} lembrete(s).");

        return self::SUCCESS;
    }
}
