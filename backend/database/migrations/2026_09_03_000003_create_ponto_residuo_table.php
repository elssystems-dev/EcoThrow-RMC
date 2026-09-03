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
        Schema::create('ponto_residuo', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ponto_coleta_id')->constrained('pontos_coleta')->onDelete('cascade');
            $table->foreignId('tipo_residuo_id')->constrained('tipos_residuo')->onDelete('cascade');
            $table->timestamps();

            $table->unique(['ponto_coleta_id', 'tipo_residuo_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ponto_residuo');
    }
};
