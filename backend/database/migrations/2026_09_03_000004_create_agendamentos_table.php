<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('agendamentos', function (Blueprint $table) {
            $table->id();
            $table->string('codigo_validacao')->unique()->index(); // Ex: ECO-RMC-2026-A89F (RF-07)
            $table->foreignId('ponto_coleta_id')->constrained('pontos_coleta')->onDelete('restrict');
            $table->foreignId('tipo_residuo_id')->constrained('tipos_residuo')->onDelete('restrict');
            $table->foreignId('usuario_id')->nullable()->constrained('users')->onDelete('set null');
            $table->string('nome_cidadao');
            $table->string('email_cidadao');
            $table->string('telefone_cidadao')->nullable();
            $table->dateTime('data_hora'); // RN-02: Minimo 2h de antecedência
            $table->integer('quantidade_itens')->default(1);
            $table->decimal('peso_estimado_kg', 8, 2)->nullable();
            $table->text('descricao_itens')->nullable();
            $table->enum('status', ['agendado', 'concluido', 'cancelado', 'nao_compareceu'])->default('agendado');
            $table->text('motivo_cancelamento')->nullable();
            $table->dateTime('data_conclusao')->nullable();
            $table->string('operador_responsavel')->nullable();
            $table->timestamps();

            $table->index(['ponto_coleta_id', 'data_hora']);
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('agendamentos');
    }
};
