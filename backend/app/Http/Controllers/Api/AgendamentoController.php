<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Agendamento;
use App\Models\PontoColeta;
use App\Models\TipoResiduo;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AgendamentoController extends Controller
{
    /**
     * Criar novo agendamento com validação estrita de RN-01, RN-02 e RN-03 (RF-03)
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'ponto_coleta_id' => 'required|exists:pontos_coleta,id',
            'tipo_residuo_id' => 'required|exists:tipos_residuo,id',
            'nome_cidadao' => 'required|string|max:255',
            'email_cidadao' => 'required|email|max:255',
            'telefone_cidadao' => 'nullable|string|max:50',
            'data_hora' => 'required|date',
            'quantidade_itens' => 'required|integer|min:1|max:100',
            'peso_estimado_kg' => 'nullable|numeric|min:0.1|max:500',
            'descricao_itens' => 'nullable|string|max:1000',
        ]);

        $ponto = PontoColeta::findOrFail($validated['ponto_coleta_id']);
        $tipoResiduo = TipoResiduo::findOrFail($validated['tipo_residuo_id']);
        $dataHora = Carbon::parse($validated['data_hora']);

        // RN-02: Antecedência mínima de 2 horas
        $limiteMinimo = now()->addHours(2);
        if ($dataHora->lt($limiteMinimo)) {
            return response()->json([
                'success' => false,
                'message' => 'RN-02: Os agendamentos de descarte só podem ser efetuados com no mínimo 2 horas de antecedência.',
                'horario_minimo_permitido' => $limiteMinimo->toIso8601String(),
            ], 422);
        }

        // RN-03: Classificação de Resíduos (O ponto deve aceitar o tipo informado)
        if (!$ponto->aceitaTipoResiduo($tipoResiduo->id)) {
            return response()->json([
                'success' => false,
                'message' => "RN-03: O ponto de coleta '{$ponto->nome_local}' não aceita resíduos da categoria '{$tipoResiduo->categoria}'.",
            ], 422);
        }

        // RN-01: Capacidade Média do Ponto (Não exceder o limite diário)
        $dataStr = $dataHora->toDateString();
        if (!$ponto->temCapacidadeDisponivel($dataStr)) {
            return response()->json([
                'success' => false,
                'message' => "RN-01: O limite diário de {$ponto->limite_diario} agendamentos para o ecoponto foi atingido nesta data ({$dataStr}). Por favor, selecione outro dia ou ponto de coleta.",
                'limite_diario' => $ponto->limite_diario,
                'agendamentos_existentes' => $ponto->getAgendamentosCountPorData($dataStr),
            ], 422);
        }

        // Gerar código único de validação (RF-07)
        $codigoValidacao = Agendamento::gerarCodigoValidacao();

        $agendamento = Agendamento::create([
            'codigo_validacao' => $codigoValidacao,
            'ponto_coleta_id' => $ponto->id,
            'tipo_residuo_id' => $tipoResiduo->id,
            'usuario_id' => $request->user()?->id,
            'nome_cidadao' => $validated['nome_cidadao'],
            'email_cidadao' => $validated['email_cidadao'],
            'telefone_cidadao' => $validated['telefone_cidadao'] ?? null,
            'data_hora' => $dataHora,
            'quantidade_itens' => $validated['quantidade_itens'],
            'peso_estimado_kg' => $validated['peso_estimado_kg'] ?? null,
            'descricao_itens' => $validated['descricao_itens'] ?? null,
            'status' => 'agendado',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Agendamento registrado com sucesso! Guarde seu código de validação.',
            'data' => $agendamento->load(['pontoColeta', 'tipoResiduo']),
        ], 201);
    }

    /**
     * Consultar agendamento por código de validação (RF-04 / RF-07)
     */
    public function show(string $codigo): JsonResponse
    {
        $agendamento = Agendamento::with(['pontoColeta.tiposResiduo', 'tipoResiduo'])
            ->where('codigo_validacao', strtoupper(trim($codigo)))
            ->first();

        if (!$agendamento) {
            return response()->json([
                'success' => false,
                'message' => 'Agendamento não encontrado com o código fornecido.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $agendamento,
        ]);
    }

    /**
     * Cancelar agendamento prévio via código de validação (RF-04)
     */
    public function cancelar(Request $request, string $codigo): JsonResponse
    {
        $agendamento = Agendamento::where('codigo_validacao', strtoupper(trim($codigo)))->first();

        if (!$agendamento) {
            return response()->json([
                'success' => false,
                'message' => 'Agendamento não encontrado.',
            ], 404);
        }

        if ($agendamento->status === 'cancelado') {
            return response()->json([
                'success' => false,
                'message' => 'Este agendamento já se encontra cancelado.',
            ], 400);
        }

        if ($agendamento->status === 'concluido') {
            return response()->json([
                'success' => false,
                'message' => 'Não é possível cancelar uma entrega já realizada e concluída no ecoponto.',
            ], 400);
        }

        $request->validate([
            'motivo' => 'nullable|string|max:500',
        ]);

        $agendamento->update([
            'status' => 'cancelado',
            'motivo_cancelamento' => $request->input('motivo', 'Cancelado pelo cidadão solicitante.'),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Agendamento cancelado com sucesso.',
            'data' => $agendamento->fresh(['pontoColeta', 'tipoResiduo']),
        ]);
    }

    /**
     * Confirmar recebimento do lixo eletrônico pelo operador do ecoponto (RF-06)
     */
    public function concluir(Request $request, string $codigo): JsonResponse
    {
        $agendamento = Agendamento::with('pontoColeta')
            ->where('codigo_validacao', strtoupper(trim($codigo)))
            ->first();

        if (!$agendamento) {
            return response()->json([
                'success' => false,
                'message' => 'Agendamento não encontrado para validação.',
            ], 404);
        }

        if ($agendamento->status === 'concluido') {
            return response()->json([
                'success' => false,
                'message' => 'Este agendamento já foi recebido e concluído anteriormente.',
                'data' => $agendamento,
            ], 400);
        }

        if ($agendamento->status === 'cancelado') {
            return response()->json([
                'success' => false,
                'message' => 'Este agendamento foi cancelado e não pode ser recebido.',
            ], 400);
        }

        $operadorNome = $request->user()?->name ?? $request->input('operador_responsavel', 'Operador de Plantão');

        $agendamento->update([
            'status' => 'concluido',
            'data_conclusao' => now(),
            'operador_responsavel' => $operadorNome,
        ]);

        // Incrementar peso coletado no ponto se especificado
        if ($agendamento->peso_estimado_kg && $agendamento->pontoColeta) {
            $agendamento->pontoColeta->increment('capacidade_atual_kg', $agendamento->peso_estimado_kg);
        }

        return response()->json([
            'success' => true,
            'message' => "Recebimento confirmado com sucesso! Voucher {$agendamento->codigo_validacao} validado.",
            'data' => $agendamento->fresh(['pontoColeta', 'tipoResiduo']),
        ]);
    }

    /**
     * Painel do Operador: listar agendamentos com filtro de data, status e ponto (RF-06 / RN-01)
     */
    public function operadorIndex(Request $request): JsonResponse
    {
        $pontoId = $request->input('ponto_id');
        $data = $request->input('data', date('Y-m-d'));
        $status = $request->input('status');

        $query = Agendamento::with(['tipoResiduo', 'pontoColeta'])
            ->orderBy('data_hora', 'asc');

        if ($pontoId) {
            $query->where('ponto_coleta_id', $pontoId);
        }

        if ($data) {
            $query->whereDate('data_hora', $data);
        }

        if ($status && $status !== 'todos') {
            $query->where('status', $status);
        }

        $agendamentos = $query->get();

        // Dados do ponto selecionado ou métricas gerais
        $ponto = $pontoId ? PontoColeta::find($pontoId) : null;
        $totalAgendados = $agendamentos->where('status', 'agendado')->count();
        $totalConcluidos = $agendamentos->where('status', 'concluido')->count();
        $totalCancelados = $agendamentos->where('status', 'cancelado')->count();

        return response()->json([
            'success' => true,
            'data' => $agendamentos,
            'metricas' => [
                'data_selecionada' => $data,
                'total_geral' => $agendamentos->count(),
                'total_agendados' => $totalAgendados,
                'total_concluidos' => $totalConcluidos,
                'total_cancelados' => $totalCancelados,
                'capacidade_diaria' => $ponto ? $ponto->limite_diario : null,
                'percentual_ocupacao_dia' => ($ponto && $ponto->limite_diario > 0)
                    ? round((($totalAgendados + $totalConcluidos) / $ponto->limite_diario) * 100, 1)
                    : null,
            ],
        ]);
    }
}
