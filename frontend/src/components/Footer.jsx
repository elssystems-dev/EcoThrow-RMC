import React from 'react';
import { Leaf, ShieldCheck, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full bg-surface-container-low border-t border-surface-container py-8 px-4 sm:px-8 mt-16 no-print">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white">
            <Leaf className="w-4 h-4" />
          </div>
          <div>
            <span className="font-headline font-bold text-sm text-primary">EcoThrow RMC</span>
            <p className="text-[11px] text-on-surface-variant">
              Sistema de Agendamento e Mapeamento de Lixo Eletrônico • ISO/IEC/IEEE 29148:2018
            </p>
          </div>
        </div>

        <div className="text-center md:text-right text-xs text-on-surface-variant">
          <p className="font-medium text-on-surface">
            Região Metropolitana de Campinas (RMC) • Parceria com Cooperativas Locais
          </p>
          <p className="text-[11px] mt-0.5 text-outline">
            Desenvolvido por: <strong className="text-on-surface">Filipe Augusto Reis, Eduardo Lucas Garcia e Guilherme Prestes Bosco Biondo</strong>
          </p>
        </div>
      </div>
    </footer>
  );
}
