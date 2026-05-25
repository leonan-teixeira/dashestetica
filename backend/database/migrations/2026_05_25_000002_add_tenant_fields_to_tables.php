<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('clinica_id')->nullable()->after('id')->constrained('clinicas')->nullOnDelete();
            $table->boolean('is_super_admin')->default(false)->after('remember_token');
        });

        $tables = ['pacientes', 'consultas', 'procedimentos', 'fotos_evolucao', 'lembretes', 'anamneses'];
        foreach ($tables as $tbl) {
            Schema::table($tbl, function (Blueprint $table) {
                $table->foreignId('clinica_id')->nullable()->after('id')->constrained('clinicas')->nullOnDelete();
                $table->index('clinica_id');
            });
        }

        // cpf_hash unique vira composite (clinica_id, cpf_hash)
        Schema::table('pacientes', function (Blueprint $table) {
            $table->dropUnique(['cpf_hash']);
            $table->unique(['clinica_id', 'cpf_hash']);
        });
    }

    public function down(): void
    {
        Schema::table('pacientes', function (Blueprint $table) {
            $table->dropUnique(['clinica_id', 'cpf_hash']);
            $table->unique(['cpf_hash']);
        });

        $tables = ['pacientes', 'consultas', 'procedimentos', 'fotos_evolucao', 'lembretes', 'anamneses'];
        foreach ($tables as $tbl) {
            Schema::table($tbl, function (Blueprint $table) {
                $table->dropForeign(['clinica_id']);
                $table->dropColumn('clinica_id');
            });
        }

        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['clinica_id']);
            $table->dropColumn(['clinica_id', 'is_super_admin']);
        });
    }
};
