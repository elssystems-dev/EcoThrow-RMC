import React, { useState } from 'react';
import { 
  Search, 
  MapPin, 
  Filter, 
  RotateCcw, 
  CheckCircle2, 
  Clock, 
  Phone, 
  ChevronRight, 
  Sparkles,
  Layers,
  ArrowRight,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import LeafletMap from '../components/LeafletMap';

export default function MapSearchPage({ 
  pontos = [], 
  tiposResiduo = [], 
  selectedMunicipio, 
  setSelectedMunicipio, 
  municipios = [], 
  onSchedulePonto,
  loading = false,
  error = null 
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoriaId, setSelectedCategoriaId] = useState(null);
  const [selectedPonto, setSelectedPonto] = useState(null);

  // Filtragem local combinada
  const filteredPontos = pontos.filter((p) => {
    // Filtro de município
    if (selectedMunicipio && p.municipio.toLowerCase() !== selectedMunicipio.toLowerCase()) {
      return false;
    }

    // Filtro de categoria de resíduo
    if (selectedCategoriaId) {
      const temCategoria = p.tipos_residuo?.some((tr) => tr.id === Number(selectedCategoriaId));
      if (!temCategoria) return false;
    }

    // Filtro de busca textual
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchNome = p.nome_local?.toLowerCase().includes(query);
      const matchEndereco = p.endereco?.toLowerCase().includes(query);
      const matchBairro = p.bairro?.toLowerCase().includes(query);
      const matchMunicipio = p.municipio?.toLowerCase().includes(query);
      if (!matchNome && !matchEndereco && !matchBairro && !matchMunicipio) return false;
    }

    return true;
  });

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategoriaId(null);
    setSelectedMunicipio('');
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-6">
      {/* Title & Context */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold text-[11px] uppercase tracking-wider">
              RF-01 / RF-02 • Geofencing RMC
            </span>
            <span className="text-outline-variant">•</span>
            <span className="text-xs text-on-surface-variant font-medium">OpenStreetMap & PNRS</span>
          </div>
          <h1 className="font-headline font-extrabold text-2xl sm:text-3xl text-on-surface tracking-tight">
            Mapeamento de Pontos de Coleta na RMC
          </h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Localize ecopontos credenciados, consulte categorias de e-lixo aceitas e agende entregas ambientalmente seguras.
          </p>
        </div>

        {/* Quick Stats Badges */}
        <div className="flex items-center gap-2">
          <div className="bg-surface-container-low px-3.5 py-2 rounded-xl border border-surface-container text-right">
            <span className="text-[10px] uppercase font-bold text-on-surface-variant block">Pontos Ativos</span>
            <span className="font-headline font-bold text-lg text-primary">{filteredPontos.length}</span>
          </div>
          <div className="bg-surface-container-low px-3.5 py-2 rounded-xl border border-surface-container text-right">
            <span className="text-[10px] uppercase font-bold text-on-surface-variant block">Municípios RMC</span>
            <span className="font-headline font-bold text-lg text-secondary">{municipios.length || 20}</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-error/10 border border-error/20 flex items-center gap-3 text-error text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Dual-Column Layout (Fiel ao Stitch) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Filters & List (5 cols on lg) */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          {/* Filter Controls Card */}
          <div className="bg-surface-container-lowest rounded-2xl p-5 border border-surface-container shadow-card flex flex-col gap-4">
            <div className="flex items-center justify-between pb-1 border-b border-surface-container/60">
              <span className="font-headline font-bold text-sm text-on-surface flex items-center gap-2">
                <Filter className="w-4 h-4 text-primary" />
                <span>Filtros de Busca</span>
              </span>
              <button
                type="button"
                onClick={resetFilters}
                className="flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary-container transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Limpar Filtros</span>
              </button>
            </div>

            {/* Municipality Dropdown */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-on-surface flex items-center justify-between">
                <span>Município da RMC</span>
                <span className="text-[11px] text-on-surface-variant font-normal">
                  {selectedMunicipio ? '1 selecionado' : 'Todos'}
                </span>
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-primary pointer-events-none" />
                <select
                  value={selectedMunicipio}
                  onChange={(e) => setSelectedMunicipio(e.target.value)}
                  className="w-full pl-9 pr-8 py-2.5 bg-surface-container-low rounded-xl text-xs font-medium text-on-surface border border-transparent focus:border-primary focus:bg-white focus:outline-none transition-all cursor-pointer"
                >
                  <option value="">Todos os 20 Municípios da RMC</option>
                  {municipios.map((mun) => (
                    <option key={mun} value={mun}>{mun}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Text Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por bairro, rua ou nome do ecoponto..."
                className="w-full pl-9 pr-3 py-2 bg-surface-container-low rounded-xl text-xs text-on-surface placeholder:text-outline border border-transparent focus:border-primary focus:bg-white focus:outline-none transition-all"
              />
            </div>

            {/* REEE Category Selector */}
            <div className="flex flex-col gap-2 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-on-surface">Categorias de Resíduo (REEE)</span>
                <span className="text-[10px] font-semibold text-primary uppercase">Classificação PNRS</span>
              </div>
              <div className="grid grid-cols-1 gap-1.5 max-h-52 overflow-y-auto pr-1">
                <button
                  type="button"
                  onClick={() => setSelectedCategoriaId(null)}
                  className={`flex items-center justify-between p-2 rounded-xl text-left text-xs transition-all ${
                    selectedCategoriaId === null
                      ? 'bg-primary/10 border border-primary/30 text-primary font-bold'
                      : 'hover:bg-surface-container-low text-on-surface-variant'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-surface-container flex items-center justify-center">
                      <Layers className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <span>Todas as Categorias</span>
                  </div>
                  <span className="text-[11px] px-1.5 py-0.5 rounded bg-surface-container font-semibold">
                    {pontos.length} pts
                  </span>
                </button>

                {tiposResiduo.map((tipo) => {
                  const isSelected = Number(selectedCategoriaId) === tipo.id;
                  return (
                    <button
                      key={tipo.id}
                      type="button"
                      onClick={() => setSelectedCategoriaId(isSelected ? null : tipo.id)}
                      className={`flex items-center justify-between p-2 rounded-xl text-left text-xs transition-all ${
                        isSelected
                          ? 'bg-primary/10 border border-primary/30 text-primary font-bold'
                          : 'hover:bg-surface-container-low text-on-surface-variant'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-primary-container/20 text-primary flex items-center justify-center font-bold text-[10px]">
                          ✓
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium text-on-surface">{tipo.categoria}</span>
                          <span className="text-[10px] text-on-surface-variant line-clamp-1">{tipo.exemplos}</span>
                        </div>
                      </div>
                      <span className="text-[11px] px-1.5 py-0.5 rounded bg-surface-container font-semibold text-on-surface-variant shrink-0 ml-1">
                        {tipo.pontos_coleta_count || 'Vários'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Results List */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-on-surface uppercase tracking-wider">
                Ecopontos Encontrados ({filteredPontos.length})
              </span>
              <span className="text-[11px] text-on-surface-variant">Clique para ver no mapa</span>
            </div>

            {loading ? (
              <div className="bg-surface-container-lowest p-8 rounded-2xl border border-surface-container text-center text-xs text-on-surface-variant">
                Carregando ecopontos da RMC...
              </div>
            ) : filteredPontos.length === 0 ? (
              <div className="bg-surface-container-lowest p-8 rounded-2xl border border-surface-container text-center text-xs text-on-surface-variant">
                Nenhum ponto de coleta atende aos filtros atuais. Tente limpar os filtros.
              </div>
            ) : (
              <div className="flex flex-col gap-3 max-h-[500px] overflow-y-auto pr-1">
                {filteredPontos.map((ponto) => {
                  const isSelected = selectedPonto?.id === ponto.id;
                  const ocupacao = ponto.percentual_ocupacao || 30;
                  const statusColor = ocupacao > 80 ? 'text-red-600 bg-red-50' : ocupacao > 50 ? 'text-amber-600 bg-amber-50' : 'text-emerald-700 bg-emerald-50';

                  return (
                    <div
                      key={ponto.id}
                      onClick={() => setSelectedPonto(ponto)}
                      className={`p-4 rounded-2xl bg-surface-container-lowest border transition-all cursor-pointer hover:shadow-md ${
                        isSelected 
                          ? 'border-primary shadow-soft ring-2 ring-primary/20 bg-primary/5' 
                          : 'border-surface-container hover:border-outline-variant'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div>
                          <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
                            {ponto.municipio}
                          </span>
                          <h3 className="font-headline font-bold text-sm text-on-surface">{ponto.nome_local}</h3>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${statusColor}`}>
                          {ponto.vagas_restantes_hoje ?? 20} vagas hoje
                        </span>
                      </div>

                      <p className="text-xs text-on-surface-variant flex items-center gap-1.5 mb-2">
                        <MapPin className="w-3.5 h-3.5 text-outline shrink-0" />
                        <span>{ponto.endereco} {ponto.bairro ? `• ${ponto.bairro}` : ''}</span>
                      </p>

                      <div className="flex items-center gap-3 text-[11px] text-on-surface-variant mb-3">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-primary shrink-0" />
                          <span className="line-clamp-1">{ponto.horario_funcionamento}</span>
                        </span>
                      </div>

                      {/* Badges de Categorias Aceitas */}
                      <div className="flex flex-wrap gap-1 mb-3">
                        {ponto.tipos_residuo?.map((t) => (
                          <span
                            key={t.id}
                            className="px-1.5 py-0.5 rounded bg-surface-container text-[10px] font-medium text-on-surface-variant"
                          >
                            {t.categoria}
                          </span>
                        ))}
                      </div>

                      {/* Action Button */}
                      <div className="flex items-center justify-between pt-2 border-t border-surface-container/60">
                        <span className="text-[11px] font-semibold text-secondary">
                          Capacidade: {ponto.limite_diario} descartes/dia
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSchedulePonto(ponto);
                          }}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary hover:bg-primary-container text-white text-xs font-semibold shadow-sm transition-all"
                        >
                          <span>Agendar Descarte</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Interactive Leaflet Map (7 cols on lg) */}
        <div className="lg:col-span-7 sticky top-24">
          <div className="h-[720px] rounded-2xl overflow-hidden shadow-soft border border-surface-container">
            <LeafletMap
              pontos={filteredPontos}
              selectedPonto={selectedPonto}
              onSelectPonto={(p) => setSelectedPonto(p)}
              onSchedulePonto={(p) => onSchedulePonto(p)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
