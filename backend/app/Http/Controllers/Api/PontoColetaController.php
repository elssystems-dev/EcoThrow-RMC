<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PontoColeta;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PontoColetaController extends Controller
{
    /**
     * Lista de municípios oficiais da Região Metropolitana de Campinas (RN-04)
     */
    public const MUNICIPIOS_RMC = [
        'Campinas', 'Americana', 'Indaiatuba', 'Sumaré', 'Hortolândia',
        'Paulínia', 'Valinhos', 'Vinhedo', 'Santa Bárbara d\'Oeste',
        'Jaguariúna', 'Cosmópolis', 'Nova Odessa', 'Monte Mor', 'Itatiba',
        'Artur Nogueira', 'Pedreira', 'Holambra', 'Morungaba',
        'Santo Antônio de Posse', 'Engenheiro Coelho'
    ];

    /**
     * Listar pontos de coleta com filtros de município, resíduo e busca textual (RF-01 / RF-02)
     */
    public function index(Request $request): JsonResponse
    {
        $query = PontoColeta::with('tiposResiduo')
            ->where('status_operacional', 'ativo');

        // Filtro por Município (Case-insensitive)
        if ($request->filled('municipio')) {
            $municipio = $request->input('municipio');
            $query->whereRaw('LOWER(municipio) LIKE ?', ['%' . strtolower($municipio) . '%']);
        }

        // Filtro por Categoria de Resíduo (ID)
        if ($request->filled('categoria_id')) {
            $categoriaId = (int)$request->input('categoria_id');
            $query->whereHas('tiposResiduo', function ($q) use ($categoriaId) {
                $q->where('tipos_residuo.id', $categoriaId);
            });
        }

        // Busca textual por nome, bairro ou endereço
        if ($request->filled('search')) {
            $search = strtolower($request->input('search'));
            $query->where(function ($q) use ($search) {
                $q->whereRaw('LOWER(nome_local) LIKE ?', ["%{$search}%"])
                  ->orWhereRaw('LOWER(bairro) LIKE ?', ["%{$search}%"])
                  ->orWhereRaw('LOWER(endereco) LIKE ?', ["%{$search}%"]);
            });
        }

        $pontos = $query->orderBy('municipio')->orderBy('nome_local')->get();

        // Anexar contagem de agendamentos para a data de hoje
        $hoje = date('Y-m-d');
        $pontos->each(function ($ponto) use ($hoje) {
            $ponto->agendamentos_hoje = $ponto->getAgendamentosCountPorData($hoje);
            $ponto->vagas_restantes_hoje = max(0, $ponto->limite_diario - $ponto->agendamentos_hoje);
        });

        return response()->json([
            'success' => true,
            'total' => $pontos->count(),
            'municipios_rmc' => self::MUNICIPIOS_RMC,
            'data' => $pontos,
        ]);
    }

    /**
     * Exibir detalhes de um ponto específico
     */
    public function show(int $id): JsonResponse
    {
        $ponto = PontoColeta::with(['tiposResiduo'])->find($id);

        if (!$ponto) {
            return response()->json([
                'success' => false,
                'message' => 'Ponto de coleta não encontrado.',
            ], 404);
        }

        $hoje = date('Y-m-d');
        $ponto->agendamentos_hoje = $ponto->getAgendamentosCountPorData($hoje);
        $ponto->vagas_restantes_hoje = max(0, $ponto->limite_diario - $ponto->agendamentos_hoje);

        return response()->json([
            'success' => true,
            'data' => $ponto,
        ]);
    }

    /**
     * Cadastrar novo ponto de coleta com validação de Geofencing RMC (RF-05 / RN-04)
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'nome_local' => 'required|string|max:255',
            'municipio' => 'required|string',
            'endereco' => 'required|string|max:255',
            'bairro' => 'nullable|string|max:100',
            'cep' => 'nullable|string|max:20',
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'limite_diario' => 'required|integer|min:1|max:500',
            'horario_funcionamento' => 'nullable|string|max:255',
            'telefone_contato' => 'nullable|string|max:50',
            'email_contato' => 'nullable|email|max:100',
            'responsavel' => 'nullable|string|max:100',
            'capacidade_maxima_kg' => 'nullable|numeric|min:100',
            'tipos_residuo' => 'required|array|min:1',
            'tipos_residuo.*' => 'exists:tipos_residuo,id',
        ]);

        // RN-04: Geofencing da RMC
        $municipioEncontrado = false;
        foreach (self::MUNICIPIOS_RMC as $mun) {
            if (strcasecmp($mun, $validated['municipio']) === 0) {
                $validated['municipio'] = $mun;
                $municipioEncontrado = true;
                break;
            }
        }

        if (!$municipioEncontrado) {
            return response()->json([
                'success' => false,
                'message' => 'RN-04: O cadastro de pontos de coleta é restrito aos municípios da Região Metropolitana de Campinas (RMC).',
                'municipios_permitidos' => self::MUNICIPIOS_RMC,
            ], 422);
        }

        $tiposResiduo = $validated['tipos_residuo'];
        unset($validated['tipos_residuo']);

        $ponto = PontoColeta::create($validated);
        $ponto->tiposResiduo()->sync($tiposResiduo);

        return response()->json([
            'success' => true,
            'message' => 'Ponto de coleta credenciado com sucesso na RMC.',
            'data' => $ponto->load('tiposResiduo'),
        ], 201);
    }
}
