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
        Schema::create('pontos_coleta', function (Blueprint $table) {
            $table->id();
            $table->string('nome_local');
            $table->string('municipio'); // Restrito a municípios da RMC (RN-04)
            $table->string('endereco');
            $table->string('bairro')->nullable();
            $table->string('cep')->nullable();
            $table->decimal('latitude', 10, 7);
            $table->decimal('longitude', 10, 7);
            $table->integer('limite_diario')->default(25); // Capacidade diária máxima (RN-01)
            $table->string('horario_funcionamento')->default('Seg-Sex: 08:00 às 17:00 | Sáb: 08:00 às 12:00');
            $table->string('telefone_contato')->nullable();
            $table->string('email_contato')->nullable();
            $table->string('status_operacional')->default('ativo');
            $table->string('responsavel')->nullable();
            $table->decimal('capacidade_atual_kg', 10, 2)->default(0);
            $table->decimal('capacidade_maxima_kg', 10, 2)->default(5000);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pontos_coleta');
    }
};
