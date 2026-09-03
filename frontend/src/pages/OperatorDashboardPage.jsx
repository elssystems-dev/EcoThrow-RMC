import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  Search, 
  AlertTriangle, 
  UserCheck, 
  Building2, 
  QrCode, 
  Filter,
  Check,
  XCircle,
  TrendingUp,
  PackageCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';

export default function OperatorDashboardPage({ pontos = [] }) {
  const [selectedPontoId, setSelectedPontoId] = useState(pontos[0]?.id || '');
  const [dataSelecionada, setDataSelecionada] = useState(new Date().toISOString().split('T')[0]);
  const [statusFilter, setStatusFilter] = useState('todos');
  const [quickCode, setQuickCode] = useState('');
  const [agendamentos, setAgendamentos] = useState([]);
  const [metricas, setMetricas] = useState(null);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    if (pontos.length > 0 && !selectedPontoId) {
      setSelectedPontoId(pontos[0].id);
    }
  }, [pontos]);

  const carregarFila = async () => {
    if (!selectedPontoId) return;
    setLoading(true);
    try {
      const res = await api.getAgendamentosOperador(selectedPontoId, {
        data: dataSelecionada,
        status: statusFilter,
      });
      if (res.success) {
        setAgendamentos(res.data);
        setMetricas(res.metricas);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarFila();
  }, [selectedPontoId, dataSelecionada, statusFilter]);

  const currentPonto = pontos.find(p => p.id === Number(selectedPontoId));

  const handleConcluir = async (codigo) => {
    try {
      const res = await api.concluirAgendamento(codigo);
      if (res.success) {
        setFeedback({ type: 'success', message: res.message });
        try {
          confetti({ particleCount: 50, spread: 45 });
        } catch (_) {}
        carregarFila();
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Erro ao validar agendamento.' });
    }
  };

  const handleQuickValidate = (e) => {
    e.preventDefault();
    if (!quickCode.trim()) return;
    handleConcluir(quickCode.trim());
    setQuickCode('');
  };

  const percentualOcupacao = metricas?.percentual_ocupacao_dia || 0;
  const capacidadeColor = percentualOcupacao > 85 
    ? 'bg-red-500 text-red-700' 
    : percentualOcupacao > 60 
    ? 'bg-amber-500 text-amber-700' 
    : 'bg-primary text-primary';

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-6">
      {/* Title & Operator Strip */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-bold text-[11px] uppercase tracking-wider">
              RF-06 • Painel do Operador
            </span>
            <span className="text-outline-variant">•</span>
            <span className="text-xs text-on-surface-variant font-medium">Controle de Capacidade & Check-in</span>
          </div>
          <h1 className="font-headline font-extrabold text-2xl sm:text-3xl text-on-surface">
            Gestão Operacional de Ecoponto
          </h1>
        </div>

        {/* Ecopoint Select */}
        <div className="flex items-center gap-2 bg-surface-container-lowest p-2 rounded-2xl border border-surface-container shadow-sm">
          <Building2 className="w-4 h-4 text-primary shrink-0 ml-2" />
          <select
            value={selectedPontoId}
            onChange={(e) => setSelectedPontoId(e.target.value)}
            className="bg-transparent text-xs font-bold text-on-surface focus:outline-none pr-4 cursor-pointer"
          >
            {pontos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome_local} ({p.municipio})
              </option>
            ))}
          </select>
        </div>
      </div>

      {feedback && (
        <div className={`mb-6 p-4 rounded-xl border flex items-center justify-between gap-3 text-xs sm:text-sm ${
          feedback.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
            : 'bg-error/10 border-error/20 text-error'
        }`}>
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4" />}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="font-bold text-xs">✕</button>
        </div>
      )}

      {/* Top Cards: Capacity & Quick Scanner */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
        {/* Capacity Indicator Card (RN-01) - 7 cols */}
        <div className="lg:col-span-7 bg-surface-container-lowest p-6 rounded-2xl border border-surface-container shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="font-headline font-bold text-sm text-on-surface flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                <span>Capacidade Diária do Ecoponto (RN-01)</span>
              </span>
              <span className="text-xs font-bold text-on-surface">
                {metricas?.total_agendados + metricas?.total_concluidos || 0} / {metricas?.capacidade_diaria || currentPonto?.limite_diario || 25} agendamentos
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-surface-container-high h-3.5 rounded-full overflow-hidden mb-2">
              <div 
                className={`h-full transition-all duration-500 ${
                  percentualOcupacao > 85 ? 'bg-red-500' : percentualOcupacao > 60 ? 'bg-amber-500' : 'bg-primary'
                }`}
                style={{ width: `${Math.min(100, percentualOcupacao)}%` }}
              ></div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-on-surface-variant">
              <span>0% Ocupação</span>
              <span className="font-bold text-on-surface">{percentualOcupacao}% Ocupado</span>
              <span>100% Limite Máximo</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-surface-container/60 text-center">
            <div className="p-2 bg-surface-container-low rounded-xl">
              <span className="text-[10px] uppercase font-bold text-on-surface-variant block">Agendados</span>
              <span className="font-headline font-bold text-sm text-primary">{metricas?.total_agendados || 0}</span>
            </div>
            <div className="p-2 bg-surface-container-low rounded-xl">
              <span className="text-[10px] uppercase font-bold text-on-surface-variant block">Concluídos</span>
              <span className="font-headline font-bold text-sm text-emerald-600">{metricas?.total_concluidos || 0}</span>
            </div>
            <div className="p-2 bg-surface-container-low rounded-xl">
              <span className="text-[10px] uppercase font-bold text-on-surface-variant block">Cancelados</span>
              <span className="font-headline font-bold text-sm text-on-surface-variant">{metricas?.total_cancelados || 0}</span>
            </div>
          </div>
        </div>

        {/* Quick Voucher Scanner / Code Input - 5 cols */}
        <div className="lg:col-span-5 bg-gradient-to-br from-surface-container-lowest to-surface-container-low p-6 rounded-2xl border border-surface-container shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider mb-2">
              <QrCode className="w-4 h-4" />
              <span>Validação Rápida de Voucher</span>
            </div>
            <h3 className="font-headline font-bold text-sm text-on-surface mb-2">Check-in de Entrega no Portão</h3>
            <p className="text-xs text-on-surface-variant mb-4">
              Digite o código ou faça a leitura do QR Code do cidadão para confirmar o recebimento do lote.
            </p>
          </div>

          <form onSubmit={handleQuickValidate} className="flex gap-2">
            <input
              type="text"
              placeholder="ECO-RMC-2026-XXXX"
              value={quickCode}
              onChange={(e) => setQuickCode(e.target.value.toUpperCase())}
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-white border border-surface-container text-xs font-mono font-bold text-on-surface uppercase focus:border-primary outline-none"
            />
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-container text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1 shrink-0"
            >
              <PackageCheck className="w-4 h-4" />
              <span>Validar</span>
            </button>
          </form>
        </div>
      </div>

      {/* Filter Bar for Table */}
      <div className="bg-surface-container-lowest p-4 rounded-2xl border border-surface-container shadow-card mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-xs font-bold text-on-surface">
            <Calendar className="w-4 h-4 text-primary" />
            <span>Data:</span>
            <input
              type="date"
              value={dataSelecionada}
              onChange={(e) => setDataSelecionada(e.target.value)}
              className="px-2 py-1 rounded-lg bg-surface-container-low text-xs text-on-surface border border-transparent focus:border-primary outline-none"
            />
          </div>

          <div className="flex items-center gap-1.5 text-xs font-bold text-on-surface">
            <Filter className="w-4 h-4 text-primary" />
            <span>Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2 py-1 rounded-lg bg-surface-container-low text-xs text-on-surface border border-transparent focus:border-primary outline-none cursor-pointer"
            >
              <option value="todos">Todos os Status</option>
              <option value="agendado">Apenas Agendados</option>
              <option value="concluido">Apenas Concluídos</option>
              <option value="cancelado">Apenas Cancelados</option>
            </select>
          </div>
        </div>

        <span className="text-xs text-on-surface-variant font-medium">
          Exibindo {agendamentos.length} agendamentos no dia
        </span>
      </div>

      {/* Deliveries Queue Table */}
      <div className="bg-surface-container-lowest rounded-2xl border border-surface-container shadow-card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-on-surface-variant">
            Atualizando fila de entregas do ecoponto...
          </div>
        ) : agendamentos.length === 0 ? (
          <div className="p-12 text-center text-xs text-on-surface-variant">
            Nenhum agendamento encontrado para os filtros selecionados.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-container-low text-on-surface-variant uppercase text-[10px] font-bold border-b border-surface-container">
                <tr>
                  <th className="px-6 py-3.5">Código / Horário</th>
                  <th className="px-6 py-3.5">Cidadão Solicitante</th>
                  <th className="px-6 py-3.5">Resíduo (REEE)</th>
                  <th className="px-6 py-3.5">Quantidade / Peso</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Ação Operador</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container/60">
                {agendamentos.map((ag) => {
                  const hora = new Date(ag.data_hora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                  return (
                    <tr key={ag.id} className="hover:bg-surface-container-low/50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-mono font-bold text-on-surface block">{ag.codigo_validacao}</span>
                        <span className="text-[11px] text-primary flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3" />
                          <span>{hora}</span>
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span className="font-bold text-on-surface block">{ag.nome_cidadao}</span>
                        <span className="text-[11px] text-on-surface-variant">{ag.email_cidadao}</span>
                      </td>

                      <td className="px-6 py-4">
                        <span className="font-medium text-on-surface block">{ag.tipo_residuo?.categoria}</span>
                        {ag.descricao_itens && (
                          <span className="text-[10px] text-on-surface-variant line-clamp-1 italic">
                            "{ag.descricao_itens}"
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <span className="font-semibold text-on-surface block">{ag.quantidade_itens} un</span>
                        {ag.peso_estimado_kg && (
                          <span className="text-[10px] text-on-surface-variant">~{ag.peso_estimado_kg} kg</span>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        {ag.status === 'agendado' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700">
                            <Clock className="w-3 h-3" />
                            <span>Agendado</span>
                          </span>
                        )}
                        {ag.status === 'concluido' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Concluído</span>
                          </span>
                        )}
                        {ag.status === 'cancelado' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-50 text-red-700">
                            <XCircle className="w-3 h-3" />
                            <span>Cancelado</span>
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-right">
                        {ag.status === 'agendado' ? (
                          <button
                            onClick={() => handleConcluir(ag.codigo_validacao)}
                            className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 ml-auto"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Confirmar Recebimento (RF-06)</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-on-surface-variant italic">
                            {ag.status === 'concluido' ? 'Recebido' : 'Cancelado'}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
