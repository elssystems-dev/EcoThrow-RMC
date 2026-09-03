<?php

use App\Http\Controllers\Api\AgendamentoController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\PontoColetaController;
use App\Http\Controllers\Api\TipoResiduoController;
use Illuminate\Support\Facades\Route;

// Rotas de Telemetria e Dashboard
Route::get('/dashboard/metricas', [DashboardController::class, 'metricas']);

// Rotas de Pontos de Coleta (RF-01, RF-02, RF-05, RN-04)
Route::get('/pontos', [PontoColetaController::class, 'index']);
Route::get('/pontos/{id}', [PontoColetaController::class, 'show'])->whereNumber('id');
Route::post('/pontos', [PontoColetaController::class, 'store']);

// Rotas de Tipos de Resíduos REEE
Route::get('/tipos-residuo', [TipoResiduoController::class, 'index']);

// Rotas de Agendamento (RF-03, RF-04, RF-07, RN-01, RN-02, RN-03)
Route::post('/agendamentos', [AgendamentoController::class, 'store']);
Route::get('/agendamentos/{codigo}', [AgendamentoController::class, 'show']);
Route::post('/agendamentos/{codigo}/cancelar', [AgendamentoController::class, 'cancelar']);
Route::post('/agendamentos/{codigo}/concluir', [AgendamentoController::class, 'concluir']); // Check-in Operador (RF-06)

// Rotas de Operação do Ecoponto (RF-06)
Route::get('/operador/agendamentos', [AgendamentoController::class, 'operadorIndex']);
