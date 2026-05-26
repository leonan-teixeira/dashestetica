<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('contas_pagar', function (Blueprint $table) {
            $table->id();
            $table->foreignId('clinica_id')->constrained()->cascadeOnDelete();
            $table->string('descricao');
            $table->string('fornecedor')->nullable();
            $table->string('categoria', 100)->nullable();
            $table->decimal('valor', 10, 2);
            $table->date('data_vencimento');
            $table->date('data_pagamento')->nullable();
            $table->enum('status', ['pendente', 'pago', 'vencido'])->default('pendente');
            $table->string('forma_pagamento', 50)->nullable();
            $table->text('observacao')->nullable();
            $table->boolean('recorrente')->default(false);
            $table->string('recorrencia', 20)->nullable(); // mensal, semanal, anual
            $table->timestamps();

            $table->index(['clinica_id', 'status']);
            $table->index(['clinica_id', 'data_vencimento']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('contas_pagar');
    }
};
