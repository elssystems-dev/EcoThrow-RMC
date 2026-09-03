<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TipoResiduo;
use Illuminate\Http\JsonResponse;

class TipoResiduoController extends Controller
{
    /**
     * Listar todas as categorias de resíduos eletroeletrônicos (REEE)
     */
    public function index(): JsonResponse
    {
        $tipos = TipoResiduo::withCount('pontosColeta')->orderBy('id')->get();

        return response()->json([
            'success' => true,
            'total' => $tipos->count(),
            'data' => $tipos,
        ]);
    }
}
