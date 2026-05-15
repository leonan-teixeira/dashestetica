<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('lembretes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('consulta_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('paciente_id')->constrained()->cascadeOnDelete();
            $table->enum('tipo', ['confirmacao_24h', 'lembrete_dia', 'retorno_sugerido', 'personalizado']);
            $table->enum('canal', ['whatsapp', 'sms', 'email']);
            $table->dateTime('agendado_para');
            $table->timestamp('enviado_em')->nullable();
            $table->enum('status', ['pendente', 'enviado', 'falhou', 'cancelado'])->default('pendente');
            $table->unsignedTinyInteger('tentativas')->default(0);
            $table->text('ultimo_erro')->nullable();
            $table->text('mensagem');
            $table->timestamps();

            $table->index('agendado_para');
            $table->index('status');
            $table->index(['status', 'agendado_para']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lembretes');
    }
};
