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
        Schema::create('consulta_procedimento', function (Blueprint $table) {
            $table->id();
            $table->foreignId('consulta_id')->constrained()->cascadeOnDelete();
            $table->foreignId('procedimento_id')->constrained()->cascadeOnDelete();
            $table->decimal('preco_aplicado', 10, 2);
            $table->unsignedInteger('duracao_aplicada');
            $table->timestamps();

            $table->unique(['consulta_id', 'procedimento_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('consulta_procedimento');
    }
};
