<?php

namespace App\Services;

use App\Models\Consulta;
use App\Models\Lembrete;

class LembreteService
{
    public function criarLembretesParaConsulta(Consulta $consulta): void
    {
        $paciente = $consulta->paciente ?? $consulta->load('paciente')->paciente;

        // Lembrete 24h antes
        $agendado24h = $consulta->inicio->copy()->subHours(24);
        if ($agendado24h->isFuture()) {
            Lembrete::create([
                'consulta_id'   => $consulta->id,
                'paciente_id'   => $consulta->paciente_id,
                'tipo'          => 'confirmacao_24h',
                'canal'         => 'whatsapp',
                'agendado_para' => $agendado24h,
                'status'        => 'pendente',
                'mensagem'      => $this->montarMensagem24h($consulta),
            ]);
        }

        // Lembrete no dia (manhã)
        $agendadoDia = $consulta->inicio->copy()->startOfDay()->addHours(8);
        if ($agendadoDia->isFuture() && $agendadoDia->lt($agendado24h)) {
            Lembrete::create([
                'consulta_id'   => $consulta->id,
                'paciente_id'   => $consulta->paciente_id,
                'tipo'          => 'lembrete_dia',
                'canal'         => 'whatsapp',
                'agendado_para' => $agendadoDia,
                'status'        => 'pendente',
                'mensagem'      => $this->montarMensagemDia($consulta),
            ]);
        }
    }

    public function reenviar(Lembrete $lembrete): void
    {
        $lembrete->update([
            'status'        => 'pendente',
            'agendado_para' => now()->addMinutes(5),
            'ultimo_erro'   => null,
        ]);
    }

    private function montarMensagem24h(Consulta $consulta): string
    {
        $horario = $consulta->inicio->format('d/m/Y \à\s H:i');

        return "Olá! Lembramos que você tem uma consulta amanhã, {$horario}. Confirme sua presença respondendo SIM. 💆‍♀️";
    }

    private function montarMensagemDia(Consulta $consulta): string
    {
        $horario = $consulta->inicio->format('H:i');

        return "Bom dia! Sua consulta é hoje às {$horario}. Te esperamos! 💆‍♀️";
    }
}
