<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class Agendamento extends Model
{
    use HasFactory;

    protected $table = 'agendamentos';

    protected $fillable = [
        'codigo_validacao',
        'ponto_coleta_id',
        'tipo_residuo_id',
        'usuario_id',
        'nome_cidadao',
        'email_cidadao',
        'telefone_cidadao',
        'data_hora',
        'quantidade_itens',
        'peso_estimado_kg',
        'descricao_itens',
        'status',
        'motivo_cancelamento',
        'data_conclusao',
        'operador_responsavel',
    ];

    protected $casts = [
        'data_hora' => 'datetime',
        'data_conclusao' => 'datetime',
        'quantidade_itens' => 'integer',
        'peso_estimado_kg' => 'float',
    ];

    public function pontoColeta(): BelongsTo
    {
        return $this->belongsTo(PontoColeta::class, 'ponto_coleta_id');
    }

    public function tipoResiduo(): BelongsTo
    {
        return $this->belongsTo(TipoResiduo::class, 'tipo_residuo_id');
    }

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }

    /**
     * Gera um código de validação único e legível (ex: ECO-RMC-2026-X7K9)
     */
    public static function gerarCodigoValidacao(): string
    {
        do {
            $ano = date('Y');
            $random = strtoupper(Str::random(5));
            $codigo = "ECO-RMC-{$ano}-{$random}";
        } while (static::where('codigo_validacao', $codigo)->exists());

        return $codigo;
    }
}
