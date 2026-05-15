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
        Schema::create('consultas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('paciente_id')->constrained()->cascadeOnDelete();
            $table->dateTime('inicio');
            $table->dateTime('fim');
            $table->enum('status', ['agendada', 'confirmada', 'realizada', 'cancelada', 'nao_compareceu'])->default('agendada');
            $table->decimal('valor_total', 10, 2)->nullable();
            $table->string('forma_pagamento', 50)->nullable();
            $table->boolean('pago')->default(false);
            $table->text('observacoes')->nullable();
            $table->text('evolucao_clinica')->nullable();
            $table->unsignedInteger('proxima_recomendacao_dias')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('user_id');
            $table->index('paciente_id');
            $table->index('inicio');
            $table->index('status');
            $table->index(['user_id', 'inicio']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('consultas');
    }
};
