import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Calendar, 
  QrCode, 
  LayoutDashboard, 
  PlusCircle, 
  Leaf, 
  CheckCircle2, 
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';
import { api } from '../services/api';

export default function Navbar({ activeTab, setActiveTab, selectedMunicipio, setSelectedMunicipio, municipios }) {
  const [metricas, setMetricas] = useState(null);

  useEffect(() => {
    api.getMetricasRMC().then(res => {
      if (res.success) {
        setMetricas(res.data);
      }
    }).catch(() => {});
  }, []);

  const navItems = [
    { id: 'mapa', label: 'Mapa & Pontos', icon: MapPin },
    { id: 'agendar', label: 'Agendar Descarte', icon: Calendar },
    { id: 'comprovante', label: 'Meus Comprovantes', icon: QrCode },
    { id: 'operador', label: 'Painel do Operador', icon: LayoutDashboard },
    { id: 'admin', label: 'Cadastrar Ponto', icon: PlusCircle },
  ];

  return (
    <header className="fixed top-0 w-full z-50 bg-surface/95 backdrop-blur-xl border-b border-surface-container-high/60 shadow-soft">
      {/* Top Banner Status Strip */}
      <div className="w-full bg-surface-container-low px-4 sm:px-8 py-2 border-b border-surface-container/50 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 text-on-surface-variant">
          <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-primary/20 text-primary text-[10px] font-bold">✓</span>
          <span className="font-semibold text-primary uppercase tracking-wider text-[11px]">Rede Integrada RMC</span>
          <span className="text-outline-variant">•</span>
          <span className="hidden sm:inline">Conformidade com a Política Nacional de Resíduos Sólidos (PNRS) & Geofencing ISO 29148</span>
        </div>
        <div className="flex items-center gap-3 text-on-surface-variant font-medium">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <strong className="text-on-surface">{metricas?.total_pontos_ativos || 9} Ecopontos</strong> Operando Hoje
          </span>
          <span className="text-outline-variant">•</span>
          <span className="flex items-center gap-1 text-tertiary">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{metricas?.rede_status || '98.4% Coleta Ativa'}</span>
          </span>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 h-18 flex items-center justify-between gap-4">
        {/* Logo & Brand */}
        <div 
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => setActiveTab('mapa')}
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary via-primary-emerald to-secondary flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
            <Leaf className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-headline font-bold text-xl text-primary tracking-tight">EcoThrow</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-secondary-container text-on-secondary-container">RMC</span>
            </div>
            <span className="text-[11px] text-on-surface-variant font-medium -mt-0.5 tracking-wider uppercase">
              Gestão Circular de E-Lixo
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 bg-surface-container-low p-1 rounded-xl border border-surface-container/60">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/60'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* City Filter & Quick Action */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-2 bg-surface-container-low px-3 py-1.5 rounded-lg border border-surface-container">
            <MapPin className="w-4 h-4 text-primary" />
            <select
              aria-label="Selecionar Município da RMC"
              value={selectedMunicipio}
              onChange={(e) => setSelectedMunicipio(e.target.value)}
              className="bg-transparent text-xs font-medium text-on-surface focus:outline-none cursor-pointer"
            >
              <option value="">Todos os 20 Municípios RMC</option>
              {municipios.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setActiveTab('agendar')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary hover:bg-primary-container text-white font-semibold text-xs shadow-sm transition-all hover:shadow"
          >
            <span>Descartar Agora</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Mobile Navigation Bar */}
      <div className="md:hidden flex items-center justify-around bg-surface border-t border-surface-container py-2 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg text-[10px] font-medium transition-colors ${
                isActive ? 'text-primary font-bold' : 'text-on-surface-variant'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label.split(' ')[0]}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
}
