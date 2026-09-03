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
        Schema::create('tipos_residuo', function (Blueprint $table) {
            $table->id();
            $table->string('categoria');
            $table->text('descricao')->nullable();
            $table->text('exemplos')->nullable();
            $table->string('icone')->default('devices');
            $table->string('cor_badge')->default('#006194');
            $table->text('instrucoes_descarte')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tipos_residuo');
    }
};
