<?php

namespace App\Jobs;

use App\Models\Lembrete;
use App\Services\WhatsAppService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Throwable;

class EnviarLembreteJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $backoff = 60;

    public function __construct(public Lembrete $lembrete) {}

    public function handle(WhatsAppService $whats): void
    {
        $lembrete = $this->lembrete->fresh();
        if (! $lembrete || in_array($lembrete->status, ['enviado', 'cancelado'], true)) {
            return;
        }

        $paciente = $lembrete->paciente;
        if (! $paciente || $paciente->anonimizado_em) {
            $lembrete->update([
                'status'      => 'cancelado',
                'ultimo_erro' => 'Paciente anonimizado ou removido.',
            ]);
            return;
        }

        if (empty($paciente->telefone)) {
            $lembrete->update([
                'status'      => 'falhou',
                'ultimo_erro' => 'Paciente sem telefone cadastrado.',
                'tentativas'  => $lembrete->tentativas + 1,
            ]);
            return;
        }

        try {
            $whats->enviarTexto($paciente->telefone, $lembrete->mensagem);

            $lembrete->update([
                'status'     => 'enviado',
                'enviado_em' => now(),
                'tentativas' => $lembrete->tentativas + 1,
                'ultimo_erro' => null,
            ]);
        } catch (Throwable $e) {
            $lembrete->update([
                'status'      => $this->attempts() >= $this->tries ? 'falhou' : 'pendente',
                'ultimo_erro' => substr($e->getMessage(), 0, 1000),
                'tentativas'  => $lembrete->tentativas + 1,
            ]);

            throw $e;
        }
    }

    public function failed(Throwable $e): void
    {
        $lembrete = $this->lembrete->fresh();
        if ($lembrete && $lembrete->status !== 'enviado') {
            $lembrete->update([
                'status'      => 'falhou',
                'ultimo_erro' => substr($e->getMessage(), 0, 1000),
            ]);
        }
    }
}
