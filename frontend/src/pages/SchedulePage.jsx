import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Package, 
  User, 
  Mail, 
  Phone, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  Info,
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';

export default function SchedulePage({ 
  pontos = [], 
  tiposResiduo = [], 
  preSelectedPonto = null, 
  onSuccessSchedule 
}) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    ponto_coleta_id: preSelectedPonto?.id || (pontos[0]?.id || ''),
    tipo_residuo_id: '',
    data: '',
    horario: '10:00',
    quantidade_itens: 1,
    peso_estimado_kg: '',
    descricao_itens: '',
    nome_cidadao: '',
    email_cidadao: '',
    telefone_cidadao: '',
  });

  useEffect(() => {
    if (preSelectedPonto) {
      setFormData(prev => ({ ...prev, ponto_coleta_id: preSelectedPonto.id }));
    }
  }, [preSelectedPonto]);

  // Set default min date (today) and min time (+2 hours)
  const hojeStr = new Date().toISOString().split('T')[0];
  
  const currentPonto = pontos.find(p => p.id === Number(formData.ponto_coleta_id));
  const currentTipo = tiposResiduo.find(t => t.id === Number(formData.tipo_residuo_id));

  // Filter types accepted by current selected ponto (RN-03)
  const acceptedTipos = currentPonto?.tipos_residuo || tiposResiduo;

  const handlePontoChange = (pontoId) => {
    setFormData(prev => ({
      ...prev,
      ponto_coleta_id: pontoId,
      // Reset waste type if not accepted by new point
      tipo_residuo_id: '',
    }));
  };

  const handleNext = () => {
    setError(null);
    if (step === 1) {
      if (!formData.ponto_coleta_id) {
        setError('Por favor, selecione um Ponto de Coleta na RMC.');
        return;
      }
      if (!formData.tipo_residuo_id) {
        setError('Por favor, selecione a categoria do lixo eletrônico (REEE).');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!formData.data) {
        setError('Por favor, selecione a data do descarte.');
        return;
      }
      if (!formData.horario) {
        setError('Por favor, selecione o horário.');
        return;
      }

      // Check RN-02: Minimum 2 hours in advance
      const scheduledDateTime = new Date(`${formData.data}T${formData.horario}`);
      const minAllowed = new Date(Date.now() + 2 * 60 * 60 * 1000);

      if (scheduledDateTime < minAllowed) {
        setError('RN-02: O agendamento precisa de no mínimo 2 horas de antecedência em relação ao horário atual.');
        return;
      }

      setStep(3);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.nome_cidadao || !formData.email_cidadao) {
      setError('Por favor, preencha seu nome e e-mail para emissão do comprovante.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        ponto_coleta_id: Number(formData.ponto_coleta_id),
        tipo_residuo_id: Number(formData.tipo_residuo_id),
        nome_cidadao: formData.nome_cidadao,
        email_cidadao: formData.email_cidadao,
        telefone_cidadao: formData.telefone_cidadao,
        data_hora: `${formData.data}T${formData.horario}:00`,
        quantidade_itens: Number(formData.quantidade_itens) || 1,
        peso_estimado_kg: formData.peso_estimado_kg ? Number(formData.peso_estimado_kg) : null,
        descricao_itens: formData.descricao_itens,
      };

      const res = await api.criarAgendamento(payload);

      if (res.success) {
        try {
          confetti({
            particleCount: 80,
            spread: 60,
            origin: { y: 0.6 }
          });
        } catch (_) {}

        if (onSuccessSchedule) {
          onSuccessSchedule(res.data);
        }
      }
    } catch (err) {
      setError(err.message || 'Erro ao processar o agendamento. Verifique as regras de negócio.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Header Banner */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary font-bold text-xs uppercase tracking-wider mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>RF-03 • Agendamento Inteligente RMC</span>
        </div>
        <h1 className="font-headline font-extrabold text-2xl sm:text-3xl text-on-surface">
          Agendar Descarte de Lixo Eletrônico
        </h1>
        <p className="text-sm text-on-surface-variant max-w-xl mx-auto mt-2">
          Escolha o ecoponto mais próximo, defina o horário de entrega e receba seu comprovante digital com QR Code.
        </p>
      </div>

      {/* Stepper Progress Bar */}
      <div className="flex items-center justify-between max-w-xl mx-auto mb-8 relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-surface-container w-full -z-0"></div>
        <div 
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary -z-0 transition-all duration-300"
          style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }}
        ></div>

        {[
          { num: 1, title: 'Local & Resíduo' },
          { num: 2, title: 'Data & Horário' },
          { num: 3, title: 'Seus Dados' },
        ].map((s) => (
          <div key={s.num} className="flex flex-col items-center gap-1.5 z-10 bg-background px-2">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
              step === s.num
                ? 'bg-primary text-white ring-4 ring-primary/20'
                : step > s.num
                ? 'bg-primary-emerald text-white'
                : 'bg-surface-container text-on-surface-variant'
            }`}>
              {step > s.num ? '✓' : s.num}
            </div>
            <span className="text-[11px] font-semibold text-on-surface">{s.title}</span>
          </div>
        ))}
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-error/10 border border-error/30 flex items-start gap-3 text-error text-xs sm:text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="flex flex-col">
            <span className="font-bold">Aviso de Validação</span>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Form Container */}
      <div className="bg-surface-container-lowest rounded-2xl border border-surface-container shadow-card p-6 sm:p-8">
        {/* STEP 1: Ponto & Categoria */}
        {step === 1 && (
          <div className="flex flex-col gap-6">
            <div>
              <label className="text-xs font-bold text-on-surface uppercase tracking-wider block mb-2">
                1. Selecione o Ponto de Coleta na RMC (RN-04)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-1">
                {pontos.map((ponto) => {
                  const isSelected = Number(formData.ponto_coleta_id) === ponto.id;
                  return (
                    <div
                      key={ponto.id}
                      onClick={() => handlePontoChange(ponto.id)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                          : 'border-surface-container hover:border-outline-variant hover:bg-surface-container-low'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold text-primary uppercase">{ponto.municipio}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-container font-semibold text-on-surface-variant">
                          {ponto.limite_diario} vagas/dia
                        </span>
                      </div>
                      <h4 className="font-headline font-bold text-xs text-on-surface line-clamp-1">{ponto.nome_local}</h4>
                      <p className="text-[11px] text-on-surface-variant line-clamp-1 mt-0.5">{ponto.endereco}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-on-surface uppercase tracking-wider">
                  2. Categoria do Lixo Eletrônico Aceito (RN-03)
                </label>
                <span className="text-[11px] text-primary font-medium">
                  {acceptedTipos.length} tipos aceitos neste ponto
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {acceptedTipos.map((tipo) => {
                  const isSelected = Number(formData.tipo_residuo_id) === tipo.id;
                  return (
                    <div
                      key={tipo.id}
                      onClick={() => setFormData(prev => ({ ...prev, tipo_residuo_id: tipo.id }))}
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5 ${
                        isSelected
                          ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                          : 'border-surface-container hover:border-outline-variant hover:bg-surface-container-low'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-primary text-white' : 'bg-surface-container text-on-surface-variant'
                      }`}>
                        <Package className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-headline font-bold text-xs text-on-surface">{tipo.categoria}</span>
                        <span className="text-[10px] text-on-surface-variant line-clamp-2 mt-0.5">{tipo.exemplos}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-surface-container">
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-container text-white font-semibold text-xs shadow-sm transition-all"
              >
                <span>Avançar para Data e Horário</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Data & Horário & Quantidade */}
        {step === 2 && (
          <div className="flex flex-col gap-6">
            <div className="p-3.5 rounded-xl bg-secondary-container/40 border border-secondary-container flex items-center gap-3 text-xs text-on-secondary-container">
              <Info className="w-5 h-5 shrink-0 text-secondary" />
              <div>
                <strong>Regra RN-02:</strong> Agendamentos requerem antecedência mínima de 2 horas. Horário de funcionamento do ecoponto: {currentPonto?.horario_funcionamento}.
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-on-surface flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-primary" />
                  <span>Data da Entrega</span>
                </label>
                <input
                  type="date"
                  min={hojeStr}
                  value={formData.data}
                  onChange={(e) => setFormData(prev => ({ ...prev, data: e.target.value }))}
                  className="px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-transparent focus:border-primary focus:bg-white text-xs font-medium text-on-surface outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-on-surface flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-primary" />
                  <span>Horário Pretendido</span>
                </label>
                <select
                  value={formData.horario}
                  onChange={(e) => setFormData(prev => ({ ...prev, horario: e.target.value }))}
                  className="px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-transparent focus:border-primary focus:bg-white text-xs font-medium text-on-surface outline-none cursor-pointer"
                >
                  <option value="08:30">08:30</option>
                  <option value="09:00">09:00</option>
                  <option value="09:30">09:30</option>
                  <option value="10:00">10:00</option>
                  <option value="10:30">10:30</option>
                  <option value="11:00">11:00</option>
                  <option value="11:30">11:30</option>
                  <option value="13:30">13:30</option>
                  <option value="14:00">14:00</option>
                  <option value="14:30">14:30</option>
                  <option value="15:00">15:00</option>
                  <option value="15:30">15:30</option>
                  <option value="16:00">16:00</option>
                  <option value="16:30">16:30</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-on-surface">Quantidade Estimada de Itens</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={formData.quantidade_itens}
                  onChange={(e) => setFormData(prev => ({ ...prev, quantidade_itens: e.target.value }))}
                  className="px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-transparent focus:border-primary focus:bg-white text-xs font-medium text-on-surface outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-on-surface">Peso Total Estimado (kg - opcional)</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="Ex: 4.5"
                  value={formData.peso_estimado_kg}
                  onChange={(e) => setFormData(prev => ({ ...prev, peso_estimado_kg: e.target.value }))}
                  className="px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-transparent focus:border-primary focus:bg-white text-xs font-medium text-on-surface outline-none"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-on-surface">Descrição dos Aparelhos (opcional)</label>
              <textarea
                rows="2"
                placeholder="Ex: 1 televisor LCD 32 pol. e 2 celulares antigos com carregador"
                value={formData.descricao_itens}
                onChange={(e) => setFormData(prev => ({ ...prev, descricao_itens: e.target.value }))}
                className="px-3.5 py-2 rounded-xl bg-surface-container-low border border-transparent focus:border-primary focus:bg-white text-xs text-on-surface outline-none resize-none"
              ></textarea>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-surface-container">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-on-surface-variant hover:bg-surface-container-low transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Voltar</span>
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-container text-white font-semibold text-xs shadow-sm transition-all"
              >
                <span>Avançar para Dados Pessoais</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Dados Pessoais & Confirmação */}
        {step === 3 && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container flex flex-col gap-2">
              <span className="text-xs font-bold text-primary uppercase tracking-wider">Resumo do Descarte</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-on-surface">
                <div><strong>Ecoponto:</strong> {currentPonto?.nome_local} ({currentPonto?.municipio})</div>
                <div><strong>Material:</strong> {currentTipo?.categoria}</div>
                <div><strong>Data & Hora:</strong> {formData.data} às {formData.horario}</div>
                <div><strong>Quantidade:</strong> {formData.quantidade_itens} item(ns)</div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label className="text-xs font-bold text-on-surface flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-primary" />
                  <span>Nome Completo do Cidadão *</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Seu nome completo"
                  value={formData.nome_cidadao}
                  onChange={(e) => setFormData(prev => ({ ...prev, nome_cidadao: e.target.value }))}
                  className="px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-transparent focus:border-primary focus:bg-white text-xs font-medium text-on-surface outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-on-surface flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-primary" />
                  <span>E-mail para Receber o Comprovante *</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="seuemail@exemplo.com"
                  value={formData.email_cidadao}
                  onChange={(e) => setFormData(prev => ({ ...prev, email_cidadao: e.target.value }))}
                  className="px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-transparent focus:border-primary focus:bg-white text-xs font-medium text-on-surface outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-on-surface flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-primary" />
                  <span>Telefone / WhatsApp (opcional)</span>
                </label>
                <input
                  type="tel"
                  placeholder="(19) 99999-9999"
                  value={formData.telefone_cidadao}
                  onChange={(e) => setFormData(prev => ({ ...prev, telefone_cidadao: e.target.value }))}
                  className="px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-transparent focus:border-primary focus:bg-white text-xs font-medium text-on-surface outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-surface-container">
              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={loading}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-on-surface-variant hover:bg-surface-container-low transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Voltar</span>
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-container text-white font-bold text-xs shadow-md transition-all disabled:opacity-50"
              >
                {loading ? 'Emitindo Comprovante...' : 'Confirmar e Gerar Voucher Digital'}
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
