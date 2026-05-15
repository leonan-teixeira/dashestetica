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
        Schema::create('anamneses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('paciente_id')->constrained()->cascadeOnDelete();
            $table->text('alergias')->nullable();
            $table->text('medicamentos_uso_continuo')->nullable();
            $table->text('condicoes_pre_existentes')->nullable();
            $table->boolean('gestante')->default(false);
            $table->boolean('amamentando')->default(false);
            $table->boolean('usa_anticoncepcional')->default(false);
            $table->boolean('fumante')->default(false);
            $table->boolean('pratica_atividade_fisica')->default(false);
            $table->text('objetivo_tratamento')->nullable();
            $table->text('observacoes')->nullable();
            $table->timestamp('respondida_em')->nullable();
            $table->timestamps();

            $table->index('paciente_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('anamneses');
    }
};
