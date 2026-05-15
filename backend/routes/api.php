<?php

use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Api\PacienteController;
use App\Http\Controllers\Api\AnamneseController;
use App\Http\Controllers\Api\ProcedimentoController;
use App\Http\Controllers\Api\ConsultaController;
use App\Http\Controllers\Api\FotoEvolucaoController;
use App\Http\Controllers\Api\LembreteController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\AgendaController;
use Illuminate\Support\Facades\Route;

// Rotas públicas (com throttle específico para login)
Route::middleware('throttle:10,1')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
});

// Rotas autenticadas
Route::middleware(['auth:sanctum', 'throttle:api'])->group(function () {

    // Auth
    Route::get('/me', [AuthController::class, 'me']);
    Route::put('/me/senha', [AuthController::class, 'alterarSenha']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Pacientes
    Route::apiResource('pacientes', PacienteController::class);
    Route::get('/pacientes/{paciente}/exportar', [PacienteController::class, 'exportar']);
    Route::get('/pacientes/{paciente}/pdf', [PacienteController::class, 'exportarPdf'])->name('pacientes.pdf');
    Route::get('/pacientes/{paciente}/fotos', [FotoEvolucaoController::class, 'porPaciente']);

    // Anamnese
    Route::get('/pacientes/{paciente}/anamnese', [AnamneseController::class, 'show']);
    Route::post('/pacientes/{paciente}/anamnese', [AnamneseController::class, 'store']);
    Route::put('/pacientes/{paciente}/anamnese', [AnamneseController::class, 'update']);

    // Procedimentos
    Route::apiResource('procedimentos', ProcedimentoController::class);

    // Consultas
    Route::apiResource('consultas', ConsultaController::class);
    Route::patch('/consultas/{consulta}/status', [ConsultaController::class, 'updateStatus']);
    Route::patch('/consultas/{consulta}/evolucao', [ConsultaController::class, 'updateEvolucao']);
    Route::get('/consultas/{consulta}/comparativo', [FotoEvolucaoController::class, 'comparativo']);

    // Fotos (upload com throttle próprio)
    Route::middleware('throttle:30,1')->group(function () {
        Route::post('/consultas/{consulta}/fotos', [FotoEvolucaoController::class, 'store']);
    });
    Route::get('/fotos/{foto}/stream', [FotoEvolucaoController::class, 'stream'])->name('fotos.stream');
    Route::delete('/fotos/{foto}', [FotoEvolucaoController::class, 'destroy']);

    // Lembretes
    Route::get('/lembretes', [LembreteController::class, 'index']);
    Route::get('/lembretes/whatsapp/status', [LembreteController::class, 'status']);
    Route::post('/lembretes', [LembreteController::class, 'store']);
    Route::delete('/lembretes/{lembrete}', [LembreteController::class, 'destroy']);
    Route::post('/lembretes/{lembrete}/reenviar', [LembreteController::class, 'reenviar']);

    // Dashboard
    Route::get('/dashboard/resumo', [DashboardController::class, 'resumo']);
    Route::get('/dashboard/agenda-semana', [DashboardController::class, 'agendaSemana']);
    Route::get('/dashboard/pacientes-retorno', [DashboardController::class, 'pacientesRetorno']);

    // Agenda
    Route::get('/agenda/horarios-disponiveis', [AgendaController::class, 'horariosDisponiveis']);
    Route::get('/cep/{cep}', [AgendaController::class, 'cep']);
});
