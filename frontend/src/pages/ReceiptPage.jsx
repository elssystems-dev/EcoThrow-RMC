import React, { useState, useEffect } from 'react';
import { 
  QrCode, 
  Search, 
  Printer, 
  XCircle, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Package, 
  User, 
  ShieldCheck, 
  AlertCircle,
  FileText,
  HelpCircle,
  Phone
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { api } from '../services/api';

export default function ReceiptPage({ initialAgendamento = null }) {
  const [codigoInput, setCodigoInput] = useState(initialAgendamento?.codigo_validacao || 'ECO-RMC-2026-A89F');
  const [agendamento, setAgendamento] = useState(initialAgendamento);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Modal Cancelamento
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [motivoCancelamento, setMotivoCancelamento] = useState('');
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (initialAgendamento) {
      setAgendamento(initialAgendamento);
      setCodigoInput(initialAgendamento.codigo_validacao);
    } else {
      // Auto-fetch default sample
      buscarPorCodigo('ECO-RMC-2026-A89F');
    }
  }, [initialAgendamento]);

  const buscarPorCodigo = async (cod) => {
    const query = cod || codigoInput;
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await api.getAgendamentoByCodigo(query.trim());
      if (res.success) {
        setAgendamento(res.data);
      }
    } catch (err) {
      setError(err.message || 'Código de agendamento não localizado na rede RMC.');
      setAgendamento(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelar = async (e) => {
    e.preventDefault();
    if (!agendamento) return;

    setCancelling(true);
    setError(null);

    try {
      const res = await api.cancelarAgendamento(agendamento.codigo_validacao, motivoCancelamento);
      if (res.success) {
        setAgendamento(res.data);
        setShowCancelModal(false);
        setSuccessMsg('Agendamento cancelado com sucesso. A vaga foi liberada para outro cidadão.');
      }
    } catch (err) {
      setError(err.message || 'Erro ao cancelar o agendamento.');
    } finally {
      setCancelling(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const dataFormatada = agendamento ? new Date(agendamento.data_hora).toLocaleString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }) : '';

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Title & Search bar */}
      <div className="text-center mb-8 no-print">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary font-bold text-xs uppercase tracking-wider mb-2">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>RF-07 • Comprovante & Voucher Digital</span>
        </div>
        <h1 className="font-headline font-extrabold text-2xl sm:text-3xl text-on-surface">
          Consulta de Comprovante de Descarte
        </h1>
        <p className="text-sm text-on-surface-variant max-w-xl mx-auto mt-1">
          Apresente o QR Code no ecoponto no dia e horário agendados para validação instantânea.
        </p>

        {/* Code Search */}
        <div className="max-w-md mx-auto mt-6 flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant" />
            <input
              type="text"
              placeholder="Ex: ECO-RMC-2026-A89F"
              value={codigoInput}
              onChange={(e) => setCodigoInput(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && buscarPorCodigo()}
              className="w-full pl-10 pr-4 py-2.5 bg-surface-container-low rounded-xl text-xs font-mono font-bold text-on-surface uppercase border border-surface-container focus:border-primary focus:bg-white outline-none"
            />
          </div>
          <button
            onClick={() => buscarPorCodigo()}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-container text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
          >
            {loading ? 'Buscando...' : 'Consultar'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-error/10 border border-error/30 flex items-center gap-3 text-error text-xs sm:text-sm no-print">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-emerald-800 text-xs sm:text-sm no-print">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {agendamento && (
        <div className="bg-surface-container-lowest rounded-3xl border border-surface-container shadow-card overflow-hidden">
          {/* Voucher Header Strip */}
          <div className="bg-gradient-to-r from-primary via-primary-emerald to-secondary p-6 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-white/80 uppercase tracking-wider block">
                  Voucher de Descarte Autorizado
                </span>
                <span className="font-mono font-extrabold text-xl sm:text-2xl text-white tracking-wider">
                  {agendamento.codigo_validacao}
                </span>
              </div>
            </div>

            {/* Status Pill */}
            <div>
              {agendamento.status === 'agendado' && (
                <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-white text-primary flex items-center gap-1.5 shadow-sm">
                  <Clock className="w-3.5 h-3.5 text-primary" />
                  <span>Agendamento Ativo</span>
                </span>
              )}
              {agendamento.status === 'concluido' && (
                <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-400 text-emerald-950 flex items-center gap-1.5 shadow-sm">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Descarte Concluído</span>
                </span>
              )}
              {agendamento.status === 'cancelado' && (
                <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-red-100 text-red-800 flex items-center gap-1.5">
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Cancelado</span>
                </span>
              )}
            </div>
          </div>

          {/* Voucher Body: QR Code & Detailed Grid */}
          <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            {/* Left QR Box (4 cols) */}
            <div className="md:col-span-4 flex flex-col items-center justify-center bg-surface-container-low p-6 rounded-2xl border border-surface-container text-center">
              <div className="p-3 bg-white rounded-xl shadow-sm border border-surface-container mb-3">
                <QRCodeSVG
                  value={`ECOTHROW-RMC:${agendamento.codigo_validacao}`}
                  size={160}
                  level="H"
                  includeMargin={true}
                />
              </div>
              <span className="font-mono text-xs font-bold text-on-surface tracking-wider">
                {agendamento.codigo_validacao}
              </span>
              <span className="text-[11px] text-on-surface-variant mt-1">
                Apresente na portaria do ecoponto
              </span>
            </div>

            {/* Right Details (8 cols) */}
            <div className="md:col-span-8 flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl bg-surface-container-low border border-surface-container/60">
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase flex items-center gap-1 mb-1">
                    <User className="w-3 h-3 text-primary" />
                    <span>Cidadão Solicitante</span>
                  </span>
                  <span className="text-xs font-bold text-on-surface block">{agendamento.nome_cidadao}</span>
                  <span className="text-[11px] text-on-surface-variant">{agendamento.email_cidadao}</span>
                </div>

                <div className="p-3.5 rounded-xl bg-surface-container-low border border-surface-container/60">
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase flex items-center gap-1 mb-1">
                    <Clock className="w-3 h-3 text-primary" />
                    <span>Data e Horário Agendado</span>
                  </span>
                  <span className="text-xs font-bold text-on-surface block">{dataFormatada}</span>
                  <span className="text-[11px] text-primary font-medium">Antecedência validada</span>
                </div>

                <div className="p-3.5 rounded-xl bg-surface-container-low border border-surface-container/60 sm:col-span-2">
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase flex items-center gap-1 mb-1">
                    <MapPin className="w-3 h-3 text-primary" />
                    <span>Ecoponto de Destino</span>
                  </span>
                  <span className="text-xs font-bold text-on-surface block">
                    {agendamento.ponto_coleta?.nome_local} ({agendamento.ponto_coleta?.municipio})
                  </span>
                  <span className="text-[11px] text-on-surface-variant block">
                    {agendamento.ponto_coleta?.endereco}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-surface-container-low border border-surface-container/60 sm:col-span-2">
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase flex items-center gap-1 mb-1">
                    <Package className="w-3 h-3 text-primary" />
                    <span>Resíduo Declarado (REEE)</span>
                  </span>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-on-surface">
                      {agendamento.tipo_residuo?.categoria} ({agendamento.quantidade_itens} un)
                    </span>
                    {agendamento.peso_estimado_kg && (
                      <span className="text-[11px] px-2 py-0.5 rounded bg-surface-container font-semibold">
                        ~{agendamento.peso_estimado_kg} kg
                      </span>
                    )}
                  </div>
                  {agendamento.descricao_itens && (
                    <p className="text-[11px] text-on-surface-variant mt-1 italic">
                      "{agendamento.descricao_itens}"
                    </p>
                  )}
                </div>
              </div>

              {/* Security & Instructions Banner */}
              <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 text-[11px] text-on-surface-variant flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>
                  <strong>Instruções de Transporte:</strong> Embale os itens para evitar quebra durante o trajeto. No momento da entrega, o operador realizará a pesagem e leitura do QR Code.
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons Footer */}
          <div className="bg-surface-container-low px-6 py-4 border-t border-surface-container flex flex-wrap items-center justify-between gap-3 no-print">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-xs font-semibold text-on-surface transition-colors"
            >
              <Printer className="w-4 h-4 text-primary" />
              <span>Imprimir / Salvar PDF</span>
            </button>

            {agendamento.status === 'agendado' && (
              <button
                onClick={() => setShowCancelModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-error hover:bg-error/10 transition-colors"
              >
                <XCircle className="w-4 h-4" />
                <span>Cancelar Agendamento (RF-04)</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Modal de Cancelamento (RF-04) */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl max-w-md w-full p-6 border border-surface-container shadow-modal">
            <h3 className="font-headline font-bold text-lg text-on-surface mb-2">Cancelar Agendamento</h3>
            <p className="text-xs text-on-surface-variant mb-4">
              Você tem certeza que deseja cancelar a entrega com código <strong>{agendamento?.codigo_validacao}</strong>?
            </p>

            <form onSubmit={handleCancelar} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-on-surface">Motivo do Cancelamento (opcional)</label>
                <textarea
                  rows="3"
                  placeholder="Ex: Imprevisto de horário, descarte realizado por outro meio..."
                  value={motivoCancelamento}
                  onChange={(e) => setMotivoCancelamento(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-surface-container-low border border-surface-container text-xs text-on-surface outline-none resize-none focus:border-primary"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-surface-container">
                <button
                  type="button"
                  onClick={() => setShowCancelModal(false)}
                  disabled={cancelling}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-on-surface-variant hover:bg-surface-container-low"
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  disabled={cancelling}
                  className="px-4 py-2 rounded-xl bg-error text-white text-xs font-bold shadow-sm transition-all disabled:opacity-50"
                >
                  {cancelling ? 'Cancelando...' : 'Confirmar Cancelamento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
