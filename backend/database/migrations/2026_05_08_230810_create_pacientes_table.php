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
        Schema::create('pacientes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('nome_completo');
            $table->text('cpf')->nullable();
            $table->string('cpf_hash', 64)->nullable()->unique();
            $table->date('data_nascimento')->nullable();
            $table->text('telefone')->nullable();
            $table->string('telefone_hash', 64)->nullable()->index();
            $table->text('email')->nullable();
            $table->json('endereco')->nullable();
            $table->string('foto_perfil_path', 500)->nullable();
            $table->text('observacoes_gerais')->nullable();
            $table->timestamp('consentimento_aceito_em')->nullable();
            $table->string('consentimento_versao', 20)->nullable();
            $table->timestamp('anonimizado_em')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('user_id');
            $table->fullText('nome_completo');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pacientes');
    }
};
