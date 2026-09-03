import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Navigation, Clock, Phone, ArrowRight, ShieldCheck } from 'lucide-react';

// Custom SVG Icons for collection points
const createCustomIcon = (isSelected = false) => {
  const bg = isSelected ? '#006948' : '#059669';
  const scale = isSelected ? 'scale(1.2)' : 'scale(1)';
  const border = isSelected ? '3px solid #ffffff' : '2px solid #ffffff';

  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div style="
        background: ${bg};
        width: 38px;
        height: 38px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg) ${scale};
        display: flex;
        align-items: center;
        justify-content: center;
        border: ${border};
        box-shadow: 0 4px 12px rgba(0, 105, 72, 0.4);
        transition: transform 0.2s ease;
      ">
        <svg style="transform: rotate(45deg); width: 18px; height: 18px; color: white;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
        </svg>
      </div>
    `,
    iconSize: [38, 38],
    iconAnchor: [19, 38],
    popupAnchor: [0, -36],
  });
};

function ChangeView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, zoom, { animate: true });
    }
  }, [center, zoom, map]);
  return null;
}

export default function LeafletMap({ 
  pontos = [], 
  selectedPonto = null, 
  onSelectPonto, 
  onSchedulePonto,
  center = [-22.9064, -47.0616], // Campinas Centro
  zoom = 11
}) {
  const mapRef = useRef(null);

  return (
    <div className="w-full h-full min-h-[460px] rounded-2xl overflow-hidden shadow-soft border border-surface-container bg-surface-container-low relative">
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        className="w-full h-full z-10"
        ref={mapRef}
      >
        <ChangeView center={selectedPonto ? [selectedPonto.latitude, selectedPonto.longitude] : center} zoom={selectedPonto ? 14 : zoom} />
        
        {/* OpenStreetMap Tile Layer */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        {/* Ecopoints Markers */}
        {pontos.map((ponto) => {
          const isSelected = selectedPonto?.id === ponto.id;
          return (
            <Marker
              key={ponto.id}
              position={[ponto.latitude, ponto.longitude]}
              icon={createCustomIcon(isSelected)}
              eventHandlers={{
                click: () => {
                  if (onSelectPonto) onSelectPonto(ponto);
                },
              }}
            >
              <Popup className="custom-popup" minWidth={280}>
                <div className="p-1">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-primary uppercase tracking-wider mb-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Ecoponto Credenciado RMC</span>
                  </div>
                  <h4 className="font-headline font-bold text-sm text-on-surface mb-1">{ponto.nome_local}</h4>
                  <p className="text-xs text-on-surface-variant flex items-center gap-1 mb-2">
                    <MapPin className="w-3.5 h-3.5 text-outline shrink-0" />
                    <span>{ponto.endereco} - {ponto.municipio}</span>
                  </p>

                  <div className="bg-surface-container-low p-2 rounded-lg mb-2 text-[11px] space-y-1">
                    <div className="flex items-center gap-1 text-on-surface">
                      <Clock className="w-3 h-3 text-primary shrink-0" />
                      <span>{ponto.horario_funcionamento}</span>
                    </div>
                    {ponto.telefone_contato && (
                      <div className="flex items-center gap-1 text-on-surface-variant">
                        <Phone className="w-3 h-3 text-secondary shrink-0" />
                        <span>{ponto.telefone_contato}</span>
                      </div>
                    )}
                  </div>

                  {/* Resíduos aceitos */}
                  <div className="mb-3">
                    <span className="text-[10px] font-semibold text-outline-variant block mb-1">Materiais Aceitos:</span>
                    <div className="flex flex-wrap gap-1">
                      {ponto.tipos_residuo?.slice(0, 4).map((tr) => (
                        <span key={tr.id} className="text-[10px] bg-surface-container px-1.5 py-0.5 rounded text-on-surface-variant">
                          {tr.categoria}
                        </span>
                      ))}
                      {(ponto.tipos_residuo?.length || 0) > 4 && (
                        <span className="text-[10px] bg-surface-container px-1.5 py-0.5 rounded text-primary font-medium">
                          +{ponto.tipos_residuo.length - 4}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1 border-t border-surface-container">
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${ponto.latitude},${ponto.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-1.5 px-2 text-center rounded-lg bg-surface-container hover:bg-surface-container-high text-[11px] font-medium text-on-surface transition-colors flex items-center justify-center gap-1"
                    >
                      <Navigation className="w-3 h-3" />
                      <span>Como Chegar</span>
                    </a>
                    <button
                      onClick={() => onSchedulePonto && onSchedulePonto(ponto)}
                      className="flex-1 py-1.5 px-2 text-center rounded-lg bg-primary hover:bg-primary-container text-white text-[11px] font-semibold transition-colors flex items-center justify-center gap-1 shadow-sm"
                    >
                      <span>Agendar</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Floating Info Overlay */}
      <div className="absolute top-4 left-4 z-20 bg-surface/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-surface-container shadow-sm text-xs flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
        <span className="font-semibold text-on-surface">{pontos.length} Pontos no Mapa</span>
        <span className="text-outline-variant">•</span>
        <span className="text-on-surface-variant">OpenStreetMap RMC</span>
      </div>
    </div>
  );
}
