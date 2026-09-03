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
        Schema::table('users', function (Blueprint $table) {
            $table->string('tipo_perfil')->default('cidadao'); // 'cidadao', 'operador', 'admin'
            $table->string('telefone')->nullable();
            $table->foreignId('ponto_coleta_id')->nullable()->constrained('pontos_coleta')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['ponto_coleta_id']);
            $table->dropColumn(['tipo_perfil', 'telefone', 'ponto_coleta_id']);
        });
    }
};
