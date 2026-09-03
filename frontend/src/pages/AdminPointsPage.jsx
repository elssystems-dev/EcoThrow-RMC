import React, { useState } from 'react';
import { 
  Building2, 
  MapPin, 
  PlusCircle, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Sparkles,
  Layers,
  Phone,
  Mail,
  User
} from 'lucide-react';
import { api } from '../services/api';

export default function AdminPointsPage({ municipios = [], tiposResiduo = [], onPontoCreated }) {
  const [formData, setFormData] = useState({
    nome_local: '',
    municipio: municipios[0] || 'Campinas',
    endereco: '',
    bairro: '',
    cep: '',
    latitude: '-22.906400',
    longitude: '-47.061600',
    limite_diario: 25,
    horario_funcionamento: 'Segunda a Sexta: 08:00 às 17:00 | Sábado: 08:00 às 12:00',
    telefone_contato: '',
    email_contato: '',
    responsavel: '',
    capacidade_maxima_kg: 5000,
    tipos_residuo: tiposResiduo.map(t => t.id),
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleTipoToggle = (tipoId) => {
    setFormData(prev => {
      const exists = prev.tipos_residuo.includes(tipoId);
      const updated = exists 
        ? prev.tipos_residuo.filter(id => id !== tipoId)
        : [...prev.tipos_residuo, tipoId];
      return { ...prev, tipos_residuo: updated };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (formData.tipos_residuo.length === 0) {
      setError('Selecione pelo menos uma categoria de resíduo aceita.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        limite_diario: parseInt(formData.limite_diario, 10),
        capacidade_maxima_kg: parseFloat(formData.capacidade_maxima_kg),
      };

      const res = await api.createPonto(payload);
      if (res.success) {
        setSuccess(`Ponto de coleta "${res.data.nome_local}" homologado com sucesso na RMC!`);
        if (onPontoCreated) onPontoCreated();
      }
    } catch (err) {
      setError(err.message || 'Erro ao cadastrar ponto de coleta.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary font-bold text-xs uppercase tracking-wider mb-2">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>RF-05 / RN-04 • Homologação de Ecoponto</span>
        </div>
        <h1 className="font-headline font-extrabold text-2xl sm:text-3xl text-on-surface">
          Credenciamento de Ponto de Coleta
        </h1>
        <p className="text-sm text-on-surface-variant max-w-xl mx-auto mt-1">
          Cadastre novas estações de entrega voluntária e cooperativas nos 20 municípios da RMC com geolocalização.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-error/10 border border-error/30 flex items-center gap-3 text-error text-xs sm:text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-emerald-800 text-xs sm:text-sm">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-surface-container-lowest rounded-2xl border border-surface-container shadow-card p-6 sm:p-8 flex flex-col gap-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <label className="text-xs font-bold text-on-surface">Nome do Ecoponto / Cooperativa *</label>
            <input
              type="text"
              required
              placeholder="Ex: Ecoponto Municipal Taquaral"
              value={formData.nome_local}
              onChange={(e) => setFormData(prev => ({ ...prev, nome_local: e.target.value }))}
              className="px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-transparent focus:border-primary focus:bg-white text-xs text-on-surface outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-on-surface">Município da RMC (RN-04) *</label>
            <select
              value={formData.municipio}
              onChange={(e) => setFormData(prev => ({ ...prev, municipio: e.target.value }))}
              className="px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-transparent focus:border-primary focus:bg-white text-xs text-on-surface outline-none cursor-pointer"
            >
              {municipios.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-on-surface">Bairro</label>
            <input
              type="text"
              placeholder="Ex: Jardim Taquaral"
              value={formData.bairro}
              onChange={(e) => setFormData(prev => ({ ...prev, bairro: e.target.value }))}
              className="px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-transparent focus:border-primary focus:bg-white text-xs text-on-surface outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <label className="text-xs font-bold text-on-surface">Endereço Completo (Rua e Número) *</label>
            <input
              type="text"
              required
              placeholder="Ex: Av. Heitor Penteado, 1600"
              value={formData.endereco}
              onChange={(e) => setFormData(prev => ({ ...prev, endereco: e.target.value }))}
              className="px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-transparent focus:border-primary focus:bg-white text-xs text-on-surface outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-on-surface">Latitude Decimal *</label>
            <input
              type="number"
              step="any"
              required
              placeholder="Ex: -22.880000"
              value={formData.latitude}
              onChange={(e) => setFormData(prev => ({ ...prev, latitude: e.target.value }))}
              className="px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-transparent focus:border-primary focus:bg-white text-xs text-on-surface outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-on-surface">Longitude Decimal *</label>
            <input
              type="number"
              step="any"
              required
              placeholder="Ex: -47.050000"
              value={formData.longitude}
              onChange={(e) => setFormData(prev => ({ ...prev, longitude: e.target.value }))}
              className="px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-transparent focus:border-primary focus:bg-white text-xs text-on-surface outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-on-surface">Limite Diário de Agendamentos (RN-01) *</label>
            <input
              type="number"
              min="5"
              max="500"
              required
              value={formData.limite_diario}
              onChange={(e) => setFormData(prev => ({ ...prev, limite_diario: e.target.value }))}
              className="px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-transparent focus:border-primary focus:bg-white text-xs text-on-surface outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-on-surface">Horário de Funcionamento</label>
            <input
              type="text"
              value={formData.horario_funcionamento}
              onChange={(e) => setFormData(prev => ({ ...prev, horario_funcionamento: e.target.value }))}
              className="px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-transparent focus:border-primary focus:bg-white text-xs text-on-surface outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-on-surface">Telefone de Contato</label>
            <input
              type="text"
              placeholder="(19) 3000-0000"
              value={formData.telefone_contato}
              onChange={(e) => setFormData(prev => ({ ...prev, telefone_contato: e.target.value }))}
              className="px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-transparent focus:border-primary focus:bg-white text-xs text-on-surface outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-on-surface">Responsável Técnico / Gerente</label>
            <input
              type="text"
              placeholder="Ex: Coord. Marcos Silva"
              value={formData.responsavel}
              onChange={(e) => setFormData(prev => ({ ...prev, responsavel: e.target.value }))}
              className="px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-transparent focus:border-primary focus:bg-white text-xs text-on-surface outline-none"
            />
          </div>
        </div>

        {/* Categorias de Resíduos Aceitos */}
        <div className="flex flex-col gap-2 pt-2 border-t border-surface-container">
          <label className="text-xs font-bold text-on-surface uppercase tracking-wider">
            Categorias de E-Lixo Autorizadas (RN-03)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {tiposResiduo.map(tipo => {
              const isChecked = formData.tipos_residuo.includes(tipo.id);
              return (
                <label
                  key={tipo.id}
                  className={`p-3 rounded-xl border flex items-center gap-2.5 cursor-pointer select-none transition-all ${
                    isChecked ? 'border-primary bg-primary/5 text-primary' : 'border-surface-container hover:bg-surface-container-low text-on-surface-variant'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleTipoToggle(tipo.id)}
                    className="w-4 h-4 rounded text-primary accent-primary"
                  />
                  <div className="flex flex-col">
                    <span className="font-bold text-xs text-on-surface">{tipo.categoria}</span>
                    <span className="text-[10px] text-on-surface-variant line-clamp-1">{tipo.exemplos}</span>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-surface-container">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-container text-white font-bold text-xs shadow-md transition-all disabled:opacity-50"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{loading ? 'Homologando Ponto...' : 'Salvar e Credenciar Ecoponto na RMC'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
