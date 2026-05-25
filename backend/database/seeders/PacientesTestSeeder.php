<?php

namespace Database\Seeders;

use App\Models\Paciente;
use App\Models\User;
use Illuminate\Database\Seeder;

class PacientesTestSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::where('email', 'leonan@inhubdigital.com.br')->firstOrFail();

        $pacientes = [
            [
                'nome_completo'   => 'Ana Carolina Ferreira',
                'cpf'             => '123.456.789-00',
                'data_nascimento' => '1990-03-15',
                'telefone'        => '(11) 98765-4321',
                'email'           => 'ana.carolina@email.com',
                'endereco'        => ['cep' => '01310-100', 'rua' => 'Av. Paulista', 'numero' => '1000', 'bairro' => 'Bela Vista', 'cidade' => 'São Paulo', 'uf' => 'SP'],
                'observacoes_gerais' => 'Pele sensível, evitar produtos com fragrância.',
            ],
            [
                'nome_completo'   => 'Mariana Souza Lima',
                'cpf'             => '234.567.890-11',
                'data_nascimento' => '1985-07-22',
                'telefone'        => '(11) 91234-5678',
                'email'           => 'mariana.lima@email.com',
                'endereco'        => ['cep' => '04038-001', 'rua' => 'R. Domingos de Morais', 'numero' => '200', 'bairro' => 'Vila Mariana', 'cidade' => 'São Paulo', 'uf' => 'SP'],
                'observacoes_gerais' => null,
            ],
            [
                'nome_completo'   => 'Juliana Costa Mendes',
                'cpf'             => '345.678.901-22',
                'data_nascimento' => '1995-11-08',
                'telefone'        => '(21) 99876-5432',
                'email'           => 'juliana.mendes@email.com',
                'endereco'        => ['cep' => '22070-900', 'rua' => 'Av. Atlântica', 'numero' => '50', 'bairro' => 'Copacabana', 'cidade' => 'Rio de Janeiro', 'uf' => 'RJ'],
                'observacoes_gerais' => 'Histórico de alergia a níquel.',
            ],
            [
                'nome_completo'   => 'Fernanda Oliveira Santos',
                'cpf'             => '456.789.012-33',
                'data_nascimento' => '1988-02-28',
                'telefone'        => '(11) 97654-3210',
                'email'           => null,
                'endereco'        => ['cep' => '05415-001', 'rua' => 'R. Oscar Freire', 'numero' => '800', 'bairro' => 'Jardins', 'cidade' => 'São Paulo', 'uf' => 'SP'],
                'observacoes_gerais' => 'Prefere atendimento no período da manhã.',
            ],
            [
                'nome_completo'   => 'Camila Rodrigues Alves',
                'cpf'             => '567.890.123-44',
                'data_nascimento' => '1992-09-14',
                'telefone'        => '(31) 98888-7777',
                'email'           => 'camila.alves@email.com',
                'endereco'        => ['cep' => '30130-110', 'rua' => 'Av. Afonso Pena', 'numero' => '1500', 'bairro' => 'Centro', 'cidade' => 'Belo Horizonte', 'uf' => 'MG'],
                'observacoes_gerais' => null,
            ],
            [
                'nome_completo'   => 'Beatriz Nascimento Carvalho',
                'cpf'             => '678.901.234-55',
                'data_nascimento' => '1997-04-03',
                'telefone'        => '(11) 95555-6666',
                'email'           => 'beatriz.carvalho@email.com',
                'endereco'        => ['cep' => '04547-001', 'rua' => 'Av. Brigadeiro Faria Lima', 'numero' => '3500', 'bairro' => 'Itaim Bibi', 'cidade' => 'São Paulo', 'uf' => 'SP'],
                'observacoes_gerais' => 'Gravidez em 2023. Verificar contraindicações.',
            ],
            [
                'nome_completo'   => 'Larissa Pereira Gomes',
                'cpf'             => '789.012.345-66',
                'data_nascimento' => '1983-12-19',
                'telefone'        => '(41) 93333-2222',
                'email'           => 'larissa.gomes@email.com',
                'endereco'        => ['cep' => '80010-020', 'rua' => 'R. XV de Novembro', 'numero' => '100', 'bairro' => 'Centro', 'cidade' => 'Curitiba', 'uf' => 'PR'],
                'observacoes_gerais' => null,
            ],
            [
                'nome_completo'   => 'Isabela Martins Vieira',
                'cpf'             => '890.123.456-77',
                'data_nascimento' => '2000-06-30',
                'telefone'        => '(11) 94444-3333',
                'email'           => 'isabela.vieira@email.com',
                'endereco'        => ['cep' => '01001-000', 'rua' => 'Praça da Sé', 'numero' => '1', 'bairro' => 'Sé', 'cidade' => 'São Paulo', 'uf' => 'SP'],
                'observacoes_gerais' => 'Primeira vez em clínica estética. Educação sobre procedimentos necessária.',
            ],
            [
                'nome_completo'   => 'Gabriela Azevedo Rocha',
                'cpf'             => '901.234.567-88',
                'data_nascimento' => '1978-08-11',
                'telefone'        => '(47) 99111-0000',
                'email'           => 'gabriela.rocha@email.com',
                'endereco'        => ['cep' => '89010-002', 'rua' => 'R. XV de Novembro', 'numero' => '222', 'bairro' => 'Centro', 'cidade' => 'Blumenau', 'uf' => 'SC'],
                'observacoes_gerais' => 'Uso contínuo de isotretinoína. Aguardar suspensão antes de alguns procedimentos.',
            ],
            [
                'nome_completo'   => 'Rafaela Teixeira Barbosa',
                'cpf'             => '012.345.678-99',
                'data_nascimento' => '1993-01-25',
                'telefone'        => '(11) 96666-5555',
                'email'           => 'rafaela.barbosa@email.com',
                'endereco'        => ['cep' => '09520-001', 'rua' => 'Av. Kennedy', 'numero' => '400', 'bairro' => 'Rudge Ramos', 'cidade' => 'São Bernardo do Campo', 'uf' => 'SP'],
                'observacoes_gerais' => null,
            ],
        ];

        // Desativa o TenantScope para não filtrar durante seed
        Paciente::withoutGlobalScope(\App\Scopes\TenantScope::class);

        foreach ($pacientes as $dados) {
            // Evita duplicatas
            if (Paciente::withoutGlobalScope(\App\Scopes\TenantScope::class)->where('cpf_hash', hash('sha256', preg_replace('/\D/', '', $dados['cpf'])))->exists()) {
                $this->command->warn("Pulando {$dados['nome_completo']} — CPF já cadastrado.");
                continue;
            }

            Paciente::create(array_merge($dados, [
                'clinica_id'              => $user->clinica_id,
                'user_id'                 => $user->id,
                'consentimento_aceito_em' => now(),
                'consentimento_versao'    => '1.0',
            ]));

            $this->command->info("Criado: {$dados['nome_completo']}");
        }

        $this->command->info('10 pacientes criados com sucesso.');
    }
}
