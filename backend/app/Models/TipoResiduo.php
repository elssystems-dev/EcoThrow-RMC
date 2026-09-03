<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TipoResiduo extends Model
{
    use HasFactory;

    protected $table = 'tipos_residuo';

    protected $fillable = [
        'categoria',
        'descricao',
        'exemplos',
        'icone',
        'cor_badge',
        'instrucoes_descarte',
    ];

    public function pontosColeta(): BelongsToMany
    {
        return $this->belongsToMany(PontoColeta::class, 'ponto_residuo', 'tipo_residuo_id', 'ponto_coleta_id')
            ->withTimestamps();
    }

    public function agendamentos(): HasMany
    {
        return $this->hasMany(Agendamento::class, 'tipo_residuo_id');
    }
}
