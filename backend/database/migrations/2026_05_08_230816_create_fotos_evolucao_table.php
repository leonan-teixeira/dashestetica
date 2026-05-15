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
        Schema::create('fotos_evolucao', function (Blueprint $table) {
            $table->id();
            $table->foreignId('paciente_id')->constrained()->cascadeOnDelete();
            $table->foreignId('consulta_id')->constrained()->cascadeOnDelete();
            $table->enum('tipo', ['antes', 'durante', 'depois']);
            $table->string('path', 500);
            $table->string('disk', 50)->default('local');
            $table->string('mime', 100);
            $table->unsignedBigInteger('tamanho_bytes');
            $table->unsignedInteger('largura')->nullable();
            $table->unsignedInteger('altura')->nullable();
            $table->text('observacao')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('paciente_id');
            $table->index('consulta_id');
            $table->index('tipo');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('fotos_evolucao');
    }
};
