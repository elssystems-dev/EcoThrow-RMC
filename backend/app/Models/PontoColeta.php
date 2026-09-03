<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PontoColeta extends Model
{
    use HasFactory;

    protected $table = 'pontos_coleta';

    protected $fillable = [
        'nome_local',
        'municipio',
        'endereco',
        'bairro',
        'cep',
        'latitude',
        'longitude',
        'limite_diario',
        'horario_funcionamento',
        'telefone_contato',
        'email_contato',
        'status_operacional',
        'responsavel',
        'capacidade_atual_kg',
        'capacidade_maxima_kg',
    ];

    protected $casts = [
        'latitude' => 'float',
        'longitude' => 'float',
        'limite_diario' => 'integer',
        'capacidade_atual_kg' => 'float',
        'capacidade_maxima_kg' => 'float',
    ];

    public function tiposResiduo(): BelongsToMany
    {
        return $this->belongsToMany(TipoResiduo::class, 'ponto_residuo', 'ponto_coleta_id', 'tipo_residuo_id')
            ->withTimestamps();
    }

    public function agendamentos(): HasMany
    {
        return $this->hasMany(Agendamento::class, 'ponto_coleta_id');
    }

    public function operadores(): HasMany
    {
        return $this->hasMany(User::class, 'ponto_coleta_id');
    }

    /**
     * Retorna a contagem de agendamentos para uma data específica
     */
    public function getAgendamentosCountPorData(string $date): int
    {
        return $this->agendamentos()
            ->whereDate('data_hora', $date)
            ->whereIn('status', ['agendado', 'concluido'])
            ->count();
    }

    /**
     * Verifica se o ponto tem capacidade disponível na data (RN-01)
     */
    public function temCapacidadeDisponivel(string $date): bool
    {
        $count = $this->getAgendamentosCountPorData($date);
        return $count < $this->limite_diario;
    }

    /**
     * Verifica se o ponto aceita o tipo de resíduo (RN-03)
     */
    public function aceitaTipoResiduo(int $tipoResiduoId): bool
    {
        return $this->tiposResiduo()->where('tipos_residuo.id', $tipoResiduoId)->exists();
    }

    /**
     * Calcula o percentual de ocupação em kg
     */
    public function getPercentualOcupacaoAttribute(): float
    {
        if ($this->capacidade_maxima_kg <= 0) return 0;
        return round(($this->capacidade_atual_kg / $this->capacidade_maxima_kg) * 100, 1);
    }
}
