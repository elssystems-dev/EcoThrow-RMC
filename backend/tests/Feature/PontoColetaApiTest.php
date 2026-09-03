<?php

namespace Tests\Feature;

use App\Models\PontoColeta;
use App\Models\TipoResiduo;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PontoColetaApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    public function test_pode_listar_pontos_de_coleta_na_rmc(): void
    {
        $response = $this->getJson('/api/pontos');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'total',
                'municipios_rmc',
                'data' => [
                    '*' => [
                        'id',
                        'nome_local',
                        'municipio',
                        'endereco',
                        'latitude',
                        'longitude',
                        'limite_diario',
                        'tipos_residuo',
                    ]
                ]
            ]);

        $this->assertTrue($response->json('total') >= 5);
    }

    public function test_pode_filtrar_pontos_por_municipio(): void
    {
        $response = $this->getJson('/api/pontos?municipio=Americana');

        $response->assertStatus(200);
        $dados = $response->json('data');

        $this->assertNotEmpty($dados);
        foreach ($dados as $ponto) {
            $this->assertEquals('Americana', $ponto['municipio']);
        }
    }

    public function test_pode_filtrar_pontos_por_categoria_de_residuo(): void
    {
        $tipo = TipoResiduo::where('categoria', 'Monitores e Telas')->first();
        $this->assertNotNull($tipo);

        $response = $this->getJson("/api/pontos?categoria_id={$tipo->id}");

        $response->assertStatus(200);
        $dados = $response->json('data');
        $this->assertNotEmpty($dados);

        foreach ($dados as $ponto) {
            $categoriasIds = collect($ponto['tipos_residuo'])->pluck('id')->toArray();
            $this->assertContains($tipo->id, $categoriasIds);
        }
    }

    public function test_rn04_geofencing_rejeita_cadastro_fora_da_rmc(): void
    {
        $tipo = TipoResiduo::first();

        $dadosIncorretos = [
            'nome_local' => 'Ecoponto São Paulo Capital',
            'municipio' => 'São Paulo', // Fora da RMC!
            'endereco' => 'Av. Paulista, 1000',
            'latitude' => -23.561684,
            'longitude' => -46.655981,
            'limite_diario' => 20,
            'tipos_residuo' => [$tipo->id],
        ];

        $response = $this->postJson('/api/pontos', $dadosIncorretos);

        $response->assertStatus(422)
            ->assertJson([
                'success' => false,
            ]);
    }

    public function test_rn04_geofencing_permite_cadastro_em_municipio_da_rmc(): void
    {
        $tipo = TipoResiduo::first();

        $dadosCorretos = [
            'nome_local' => 'Ecoponto Vinhedo Centro',
            'municipio' => 'Vinhedo', // Pertence à RMC
            'endereco' => 'Rua Nove de Julho, 500',
            'bairro' => 'Centro',
            'latitude' => -23.030100,
            'longitude' => -46.975200,
            'limite_diario' => 25,
            'tipos_residuo' => [$tipo->id],
        ];

        $response = $this->postJson('/api/pontos', $dadosCorretos);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'data' => [
                    'municipio' => 'Vinhedo',
                    'nome_local' => 'Ecoponto Vinhedo Centro',
                ]
            ]);
    }
}
