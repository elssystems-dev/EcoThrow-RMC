const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const defaultHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const error = new Error(data?.message || 'Erro ao processar requisição');
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  // Pontos de Coleta
  getPontos: (params = {}) => {
    const query = new URLSearchParams();
    if (params.municipio) query.append('municipio', params.municipio);
    if (params.categoria_id) query.append('categoria_id', params.categoria_id);
    if (params.search) query.append('search', params.search);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return request(`/pontos${qs}`);
  },
  getPontoById: (id) => request(`/pontos/${id}`),
  createPonto: (pontoData) => request('/pontos', {
    method: 'POST',
    body: JSON.stringify(pontoData),
  }),

  // Tipos de Resíduo
  getTiposResiduo: () => request('/tipos-residuo'),

  // Agendamentos
  criarAgendamento: (agendamentoData) => request('/agendamentos', {
    method: 'POST',
    body: JSON.stringify(agendamentoData),
  }),
  getAgendamentoByCodigo: (codigo) => request(`/agendamentos/${codigo}`),
  cancelarAgendamento: (codigo, motivo) => request(`/agendamentos/${codigo}/cancelar`, {
    method: 'POST',
    body: JSON.stringify({ motivo }),
  }),
  concluirAgendamento: (codigo) => request(`/agendamentos/${codigo}/concluir`, {
    method: 'POST',
  }),
  getAgendamentosOperador: (pontoId, params = {}) => {
    const query = new URLSearchParams();
    if (pontoId) query.append('ponto_id', pontoId);
    if (params.status) query.append('status', params.status);
    if (params.data) query.append('data', params.data);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return request(`/operador/agendamentos${qs}`);
  },

  // Métricas e Telemetria
  getMetricasRMC: () => request('/dashboard/metricas'),
};
