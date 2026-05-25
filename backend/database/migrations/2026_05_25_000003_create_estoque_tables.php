<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('produtos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('clinica_id')->constrained()->cascadeOnDelete();
            $table->string('nome');
            $table->text('descricao')->nullable();
            $table->string('categoria', 100)->nullable();
            $table->string('unidade', 20)->default('un');
            $table->decimal('estoque_minimo', 10, 2)->default(5);
            $table->boolean('ativo')->default(true);
            $table->timestamps();

            $table->index('clinica_id');
        });

        Schema::create('movimentacoes_estoque', function (Blueprint $table) {
            $table->id();
            $table->foreignId('clinica_id')->constrained()->cascadeOnDelete();
            $table->foreignId('produto_id')->constrained('produtos')->cascadeOnDelete();
            $table->enum('tipo', ['entrada', 'saida']);
            $table->decimal('quantidade', 10, 2);
            $table->decimal('preco_unitario', 10, 2)->nullable();
            $table->string('motivo', 255)->nullable();
            $table->text('observacao')->nullable();
            $table->timestamps();

            $table->index(['clinica_id', 'produto_id']);
            $table->index('tipo');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('movimentacoes_estoque');
        Schema::dropIfExists('produtos');
    }
};
