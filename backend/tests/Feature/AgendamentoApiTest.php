<?php

namespace Tests\Feature;

use App\Models\Agendamento;
use App\Models\PontoColeta;
use App\Models\TipoResiduo;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AgendamentoApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    public function test_pode_criar_agendamento_valido_e_obter_codigo(): void
    {
        $ponto = PontoColeta::first();
        $tipoAceito = $ponto->tiposResiduo()->first();

        $dados = [
            'ponto_coleta_id' => $ponto->id,
            'tipo_residuo_id' => $tipoAceito->id,
            'nome_cidadao' => 'Guilherme Biondo',
            'email_cidadao' => 'guilherme@teste.com',
            'telefone_cidadao' => '(19) 99888-7766',
            'data_hora' => now()->addDays(2)->setTime(14, 0)->toIso8601String(),
            'quantidade_itens' => 3,
            'peso_estimado_kg' => 4.5,
            'descricao_itens' => '3 mouses e 1 teclado gamer com defeito',
        ];

        $response = $this->postJson('/api/agendamentos', $dados);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'data' => [
                    'nome_cidadao' => 'Guilherme Biondo',
                    'status' => 'agendado',
                ]
            ]);

        $codigo = $response->json('data.codigo_validacao');
        $this->assertNotNull($codigo);
        $this->assertStringStartsWith('ECO-RMC-', $codigo);
    }

    public function test_rn02_rejeita_agendamento_com_menos_de_2_horas_de_antecedencia(): void
    {
        $ponto = PontoColeta::first();
        $tipoAceito = $ponto->tiposResiduo()->first();

        $dados = [
            'ponto_coleta_id' => $ponto->id,
            'tipo_residuo_id' => $tipoAceito->id,
            'nome_cidadao' => 'Eduardo Garcia',
            'email_cidadao' => 'eduardo@teste.com',
            'data_hora' => now()->addMinutes(30)->toIso8601String(), // Apenas 30 minutos! Menos que 2h
            'quantidade_itens' => 1,
        ];

        $response = $this->postJson('/api/agendamentos', $dados);

        $response->assertStatus(422)
            ->assertJson([
                'success' => false,
            ]);

        $this->assertStringContainsString('RN-02', $response->json('message'));
    }

    public function test_rn03_rejeita_agendamento_com_residuo_nao_aceito_pelo_ponto(): void
    {
        // Encontrar um ponto e um tipo de resíduo que ele NÃO aceita
        $ponto = PontoColeta::where('nome_local', 'Ecoponto Regional Sumaré Matão')->first();
        $tipoNaoAceito = TipoResiduo::where('categoria', 'Linha Branca & Grandes Portáteis')->first();

        // Garantir que o ponto não aceita este resíduo no teste
        $ponto->tiposResiduo()->detach($tipoNaoAceito->id);

        $dados = [
            'ponto_coleta_id' => $ponto->id,
            'tipo_residuo_id' => $tipoNaoAceito->id,
            'nome_cidadao' => 'Filipe Reis',
            'email_cidadao' => 'filipe@teste.com',
            'data_hora' => now()->addDays(1)->setTime(10, 0)->toIso8601String(),
            'quantidade_itens' => 1,
        ];

        $response = $this->postJson('/api/agendamentos', $dados);

        $response->assertStatus(422)
            ->assertJson([
                'success' => false,
            ]);

        $this->assertStringContainsString('RN-03', $response->json('message'));
    }

    public function test_rn01_rejeita_quando_atinge_capacidade_limite_diaria(): void
    {
        $ponto = PontoColeta::create([
            'nome_local' => 'Ponto Teste Pequeno',
            'municipio' => 'Campinas',
            'endereco' => 'Rua Teste, 10',
            'latitude' => -22.9,
            'longitude' => -47.0,
            'limite_diario' => 2, // Limite de apenas 2 agendamentos
        ]);

        $tipo = TipoResiduo::first();
        $ponto->tiposResiduo()->attach($tipo->id);

        $dataAlvo = now()->addDays(3)->setTime(14, 0);

        // Criar 2 agendamentos para preencher a cota diária
        Agendamento::create([
            'codigo_validacao' => 'ECO-TEST-1',
            'ponto_coleta_id' => $ponto->id,
            'tipo_residuo_id' => $tipo->id,
            'nome_cidadao' => 'User 1',
            'email_cidadao' => 'u1@test.com',
            'data_hora' => $dataAlvo,
            'quantidade_itens' => 1,
            'status' => 'agendado',
        ]);

        Agendamento::create([
            'codigo_validacao' => 'ECO-TEST-2',
            'ponto_coleta_id' => $ponto->id,
            'tipo_residuo_id' => $tipo->id,
            'nome_cidadao' => 'User 2',
            'email_cidadao' => 'u2@test.com',
            'data_hora' => $dataAlvo,
            'quantidade_itens' => 1,
            'status' => 'agendado',
        ]);

        // Tentativa de criar o 3º agendamento na mesma data
        $dados = [
            'ponto_coleta_id' => $ponto->id,
            'tipo_residuo_id' => $tipo->id,
            'nome_cidadao' => 'User 3',
            'email_cidadao' => 'u3@test.com',
            'data_hora' => $dataAlvo->copy()->addMinutes(30)->toIso8601String(),
            'quantidade_itens' => 1,
        ];

        $response = $this->postJson('/api/agendamentos', $dados);

        $response->assertStatus(422)
            ->assertJson([
                'success' => false,
            ]);

        $this->assertStringContainsString('RN-01', $response->json('message'));
    }

    public function test_pode_consultar_e_cancelar_agendamento(): void
    {
        $agendamento = Agendamento::where('status', 'agendado')->first();
        $this->assertNotNull($agendamento);

        // Consulta
        $resConsulta = $this->getJson("/api/agendamentos/{$agendamento->codigo_validacao}");
        $resConsulta->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'codigo_validacao' => $agendamento->codigo_validacao,
                ]
            ]);

        // Cancelamento (RF-04)
        $resCancel = $this->postJson("/api/agendamentos/{$agendamento->codigo_validacao}/cancelar", [
            'motivo' => 'Mudança de endereço/imprevisto pessoal',
        ]);

        $resCancel->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'status' => 'cancelado',
                ]
            ]);

        $this->assertEquals('cancelado', $agendamento->fresh()->status);
    }

    public function test_operador_pode_concluir_recebimento_de_lixo_eletronico(): void
    {
        $agendamento = Agendamento::where('status', 'agendado')->first();
        $this->assertNotNull($agendamento);

        $response = $this->postJson("/api/agendamentos/{$agendamento->codigo_validacao}/concluir", [
            'operador_responsavel' => 'Técnico Operador Campinas',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'status' => 'concluido',
                    'operador_responsavel' => 'Técnico Operador Campinas',
                ]
            ]);

        $this->assertEquals('concluido', $agendamento->fresh()->status);
        $this->assertNotNull($agendamento->fresh()->data_conclusao);
    }
}
