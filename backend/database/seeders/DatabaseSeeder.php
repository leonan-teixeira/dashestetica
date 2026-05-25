<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            TenantMigrationSeeder::class,   // cria clínica + super admin
            PacientesTestSeeder::class,     // 10 pacientes
            ConsultasTestSeeder::class,     // 20 consultas (mês atual)
            FinanceiroSeeder::class,        // 11 meses históricos + formas pagamento
            EstoqueSeeder::class,           // 20 produtos + movimentações
        ]);
    }
}
