<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('clinicas', function (Blueprint $table) {
            $table->id();
            $table->string('nome');
            $table->string('email_contato')->nullable();
            $table->string('telefone')->nullable();
            $table->string('cnpj', 18)->nullable();
            $table->json('endereco')->nullable();
            $table->date('assinatura_inicio')->nullable();
            $table->date('assinatura_fim')->nullable();
            $table->string('plano', 50)->default('basico');
            $table->boolean('ativo')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('clinicas');
    }
};
