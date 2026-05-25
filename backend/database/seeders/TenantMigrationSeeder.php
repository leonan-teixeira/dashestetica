<?php

namespace Database\Seeders;

use App\Models\Clinica;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class TenantMigrationSeeder extends Seeder
{
    /**
     * Migra dados existentes para multi-tenant.
     * Agrupa usuários existentes em clínicas e cria super admin.
     * Rodar UMA vez após migration add_tenant_fields_to_tables.
     */
    public function run(): void
    {
        // Cria clínica para cada usuário existente sem clinica_id
        $users = User::whereNull('clinica_id')->where('is_super_admin', false)->get();

        foreach ($users as $user) {
            $clinica = Clinica::create([
                'nome'              => $user->name . ' — Clínica',
                'email_contato'     => $user->email,
                'plano'             => 'basico',
                'assinatura_inicio' => now()->toDateString(),
                'assinatura_fim'    => null,
                'ativo'             => true,
            ]);

            $user->update(['clinica_id' => $clinica->id]);

            // Atualiza todos os registros deste usuário
            $clinicaId = $clinica->id;

            DB::table('pacientes')->where('user_id', $user->id)->whereNull('clinica_id')
                ->update(['clinica_id' => $clinicaId]);

            DB::table('consultas')->where('user_id', $user->id)->whereNull('clinica_id')
                ->update(['clinica_id' => $clinicaId]);

            DB::table('procedimentos')->where('user_id', $user->id)->whereNull('clinica_id')
                ->update(['clinica_id' => $clinicaId]);

            // fotos, lembretes, anamneses — via paciente
            DB::table('fotos_evolucao')
                ->whereIn('paciente_id', DB::table('pacientes')->where('clinica_id', $clinicaId)->pluck('id'))
                ->whereNull('clinica_id')
                ->update(['clinica_id' => $clinicaId]);

            DB::table('lembretes')
                ->whereIn('paciente_id', DB::table('pacientes')->where('clinica_id', $clinicaId)->pluck('id'))
                ->whereNull('clinica_id')
                ->update(['clinica_id' => $clinicaId]);

            DB::table('anamneses')
                ->whereIn('paciente_id', DB::table('pacientes')->where('clinica_id', $clinicaId)->pluck('id'))
                ->whereNull('clinica_id')
                ->update(['clinica_id' => $clinicaId]);

            $this->command->info("Clínica criada para {$user->email} → ID {$clinicaId}");
        }

        // Cria super admin se não existir
        if (! User::where('is_super_admin', true)->exists()) {
            $admin = User::create([
                'name'           => 'Super Admin',
                'email'          => 'admin@admin.com',
                'password'       => Hash::make('Admin@123456'),
                'is_super_admin' => true,
            ]);
            $this->command->info("Super admin criado: admin@admin.com / Admin@123456");
            $this->command->warn("TROQUE A SENHA após o primeiro login!");
        }
    }
}
