import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import MapSearchPage from './pages/MapSearchPage';
import SchedulePage from './pages/SchedulePage';
import ReceiptPage from './pages/ReceiptPage';
import OperatorDashboardPage from './pages/OperatorDashboardPage';
import AdminPointsPage from './pages/AdminPointsPage';
import { api } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('mapa');
  const [selectedMunicipio, setSelectedMunicipio] = useState('');
  const [pontos, setPontos] = useState([]);
  const [tiposResiduo, setTiposResiduo] = useState([]);
  const [municipios, setMunicipios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cross-page state transfers
  const [preSelectedPonto, setPreSelectedPonto] = useState(null);
  const [lastCreatedAgendamento, setLastCreatedAgendamento] = useState(null);

  const carregarDados = async () => {
    setLoading(true);
    setError(null);
    try {
      const [pontosRes, tiposRes] = await Promise.all([
        api.getPontos(),
        api.getTiposResiduo(),
      ]);

      if (pontosRes.success) {
        setPontos(pontosRes.data);
        setMunicipios(pontosRes.municipios_rmc || []);
      }
      if (tiposRes.success) {
        setTiposResiduo(tiposRes.data);
      }
    } catch (err) {
      setError('Não foi possível conectar à API do EcoThrow RMC. Verifique se o servidor Laravel está em execução.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const handleScheduleFromMap = (ponto) => {
    setPreSelectedPonto(ponto);
    setActiveTab('agendar');
  };

  const handleSuccessSchedule = (agendamento) => {
    setLastCreatedAgendamento(agendamento);
    setActiveTab('comprovante');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-on-surface">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedMunicipio={selectedMunicipio}
        setSelectedMunicipio={setSelectedMunicipio}
        municipios={municipios}
      />

      {/* Main Content Area */}
      <main className="flex-1 pt-24 sm:pt-28">
        {activeTab === 'mapa' && (
          <MapSearchPage
            pontos={pontos}
            tiposResiduo={tiposResiduo}
            selectedMunicipio={selectedMunicipio}
            setSelectedMunicipio={setSelectedMunicipio}
            municipios={municipios}
            onSchedulePonto={handleScheduleFromMap}
            loading={loading}
            error={error}
          />
        )}

        {activeTab === 'agendar' && (
          <SchedulePage
            pontos={pontos}
            tiposResiduo={tiposResiduo}
            preSelectedPonto={preSelectedPonto}
            onSuccessSchedule={handleSuccessSchedule}
          />
        )}

        {activeTab === 'comprovante' && (
          <ReceiptPage
            initialAgendamento={lastCreatedAgendamento}
          />
        )}

        {activeTab === 'operador' && (
          <OperatorDashboardPage
            pontos={pontos}
          />
        )}

        {activeTab === 'admin' && (
          <AdminPointsPage
            municipios={municipios}
            tiposResiduo={tiposResiduo}
            onPontoCreated={() => {
              carregarDados();
              setActiveTab('mapa');
            }}
          />
        )}
      </main>

      <Footer />
    </div>
  );
}
