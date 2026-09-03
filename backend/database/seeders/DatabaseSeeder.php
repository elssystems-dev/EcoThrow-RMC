<?php

namespace Database\Seeders;

use App\Models\Agendamento;
use App\Models\PontoColeta;
use App\Models\TipoResiduo;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Criar Categorias de Resíduos (REEE)
        $tipos = [
            [
                'categoria' => 'Monitores e Telas',
                'descricao' => 'Monitores CRT, telas LCD/LED, notebooks e televisores de qualquer polegada.',
                'exemplos' => 'Monitores de computador, smart TVs, notebooks avariados, tablets com display trincado.',
                'icone' => 'tv',
                'cor_badge' => '#006194',
                'instrucoes_descarte' => 'Manter as telas íntegras se possível para evitar dispersão de mercúrio e fósforo.',
            ],
            [
                'categoria' => 'Pilhas e Baterias Portáteis',
                'descricao' => 'Pilhas alcalinas, baterias de lítio de celulares, no-breaks e baterias recarregáveis.',
                'exemplos' => 'Pilhas AA/AAA, baterias de smartphone, baterias 9V, power banks, baterias de ferramentas.',
                'icone' => 'battery_charging_full',
                'cor_badge' => '#006948',
                'instrucoes_descarte' => 'Isolar os terminais com fita adesiva para evitar curto-circuito durante o transporte.',
            ],
            [
                'categoria' => 'Linha Branca & Grandes Portáteis',
                'descricao' => 'Equipamentos volumosos como refrigeradores, micro-ondas, fornos elétricos e ar-condicionado.',
                'exemplos' => 'Micro-ondas, mini-refrigeradores, aspiradores de pó, fornos elétricos, máquinas de lavar.',
                'icone' => 'kitchen',
                'cor_badge' => '#2b6954',
                'instrucoes_descarte' => 'Desconectar da tomada com 24h de antecedência e remover qualquer fluido interno.',
            ],
            [
                'categoria' => 'Placas e Componentes Eletrônicos',
                'descricao' => 'Placas de circuito impresso (PCB), placas-mãe, placas de vídeo, fontes ATX e memórias.',
                'exemplos' => 'Motherboards antigas, memórias RAM, fontes de alimentação, processadores, servidores desativados.',
                'icone' => 'memory',
                'cor_badge' => '#007bb9',
                'instrucoes_descarte' => 'Transportar em caixas secas e protegidas de umidade.',
            ],
            [
                'categoria' => 'Pequenos Eletroportáteis',
                'descricao' => 'Eletrodomésticos portáteis de cozinha, cuidados pessoais e escritório.',
                'exemplos' => 'Liquidificadores, ferros de passar, secadores de cabelo, batedeiras, impressoras domésticas.',
                'icone' => 'blender',
                'cor_badge' => '#059669',
                'instrucoes_descarte' => 'Enrolar o cabo ao redor do aparelho para facilitar a pesagem e organização.',
            ],
            [
                'categoria' => 'Celulares, Telefonia & Redes',
                'descricao' => 'Smartphones, telefones sem fio, roteadores Wi-Fi, switches de rede, modems e cabos.',
                'exemplos' => 'iPhones/Androids antigos, modems de fibra, cabos USB/HDMI, fones de ouvido bluetooth.',
                'icone' => 'smartphone',
                'cor_badge' => '#004b73',
                'instrucoes_descarte' => 'Realizar a restauração de fábrica para remoção de dados pessoais antes da entrega.',
            ],
            [
                'categoria' => 'Lâmpadas Eletrônicas & LED',
                'descricao' => 'Lâmpadas fluorescentes compactas, tubulares e lâmpadas de LED comerciais/residenciais.',
                'exemplos' => 'Lâmpadas LED bulbo, fitas LED com reatores, luminárias de emergência.',
                'icone' => 'lightbulb',
                'cor_badge' => '#d97706',
                'instrucoes_descarte' => 'Acondicionar em embalagens originais ou envolvidas em papelão para evitar quebra.',
            ],
        ];

        $modelosTipos = [];
        foreach ($tipos as $t) {
            $modelosTipos[] = TipoResiduo::create($t);
        }

        // 2. Criar Pontos de Coleta na RMC (Campinas, Americana, Indaiatuba, Sumaré, Hortolândia, Paulínia, Valinhos)
        $pontos = [
            [
                'nome_local' => 'Ecoponto Municipal Barão Geraldo',
                'municipio' => 'Campinas',
                'endereco' => 'Av. Santa Isabel, 1125',
                'bairro' => 'Barão Geraldo',
                'cep' => '13084-012',
                'latitude' => -22.8228100,
                'longitude' => -47.0874500,
                'limite_diario' => 30,
                'horario_funcionamento' => 'Segunda a Sábado: 07:00 às 18:00 | Domingo: 08:00 às 12:00',
                'telefone_contato' => '(19) 3756-9000',
                'email_contato' => 'ecoponto.barao@campinas.sp.gov.br',
                'status_operacional' => 'ativo',
                'responsavel' => 'Eng. Marcos Vinícius Toledo',
                'capacidade_atual_kg' => 1450.00,
                'capacidade_maxima_kg' => 5000.00,
                'tipos_aceitos' => [0, 1, 2, 3, 4, 5, 6],
            ],
            [
                'nome_local' => 'Ecoponto Central DIC VI (Ouro Verde)',
                'municipio' => 'Campinas',
                'endereco' => 'Rua Antônio Meneghetti, 450',
                'bairro' => 'DIC VI (Distrito Ouro Verde)',
                'cep' => '13054-610',
                'latitude' => -22.9642500,
                'longitude' => -47.1215400,
                'limite_diario' => 40,
                'horario_funcionamento' => 'Segunda a Sábado: 07:30 às 17:30',
                'telefone_contato' => '(19) 3226-4411',
                'email_contato' => 'ecoponto.dic@campinas.sp.gov.br',
                'status_operacional' => 'ativo',
                'responsavel' => 'Coord. Roberta Camargo',
                'capacidade_atual_kg' => 3200.00,
                'capacidade_maxima_kg' => 6000.00,
                'tipos_aceitos' => [0, 1, 2, 3, 4, 5],
            ],
            [
                'nome_local' => 'Ecoponto Parque Prado / Cambuí Sul',
                'municipio' => 'Campinas',
                'endereco' => 'Av. Washington Luiz, 2800',
                'bairro' => 'Parque Prado',
                'cep' => '13044-000',
                'latitude' => -22.9351000,
                'longitude' => -47.0512000,
                'limite_diario' => 25,
                'horario_funcionamento' => 'Segunda a Sexta: 08:00 às 17:00 | Sábado: 08:00 às 14:00',
                'telefone_contato' => '(19) 3234-8890',
                'email_contato' => 'ecoponto.prado@campinas.sp.gov.br',
                'status_operacional' => 'ativo',
                'responsavel' => 'Téc. Fernando Albuquerque',
                'capacidade_atual_kg' => 1120.00,
                'capacidade_maxima_kg' => 4000.00,
                'tipos_aceitos' => [0, 1, 3, 4, 5, 6],
            ],
            [
                'nome_local' => 'Central de Reciclagem Eletrônica Americana',
                'municipio' => 'Americana',
                'endereco' => 'Rua Ipiranga, 890',
                'bairro' => 'Jardim Ipiranga',
                'cep' => '13468-520',
                'latitude' => -22.7389000,
                'longitude' => -47.3321000,
                'limite_diario' => 35,
                'horario_funcionamento' => 'Segunda a Sexta: 08:00 às 17:00',
                'telefone_contato' => '(19) 3475-1020',
                'email_contato' => 'ecoponto@americana.sp.gov.br',
                'status_operacional' => 'ativo',
                'responsavel' => 'Eng. Patrícia Silveira',
                'capacidade_atual_kg' => 2100.00,
                'capacidade_maxima_kg' => 4500.00,
                'tipos_aceitos' => [0, 1, 2, 3, 4, 5],
            ],
            [
                'nome_local' => 'Ecoponto Parque Ecológico Indaiatuba',
                'municipio' => 'Indaiatuba',
                'endereco' => 'Av. Engenheiro Fábio Roberto Barnabé, 3400',
                'bairro' => 'Jardim Morada do Sol',
                'cep' => '13348-000',
                'latitude' => -23.0902000,
                'longitude' => -47.2185000,
                'limite_diario' => 30,
                'horario_funcionamento' => 'Segunda a Sábado: 08:00 às 17:00',
                'telefone_contato' => '(19) 3834-9200',
                'email_contato' => 'meioambiente@indaiatuba.sp.gov.br',
                'status_operacional' => 'ativo',
                'responsavel' => 'Biólogo Carlos Eduardo Nogueira',
                'capacidade_atual_kg' => 890.00,
                'capacidade_maxima_kg' => 3500.00,
                'tipos_aceitos' => [0, 1, 3, 4, 5, 6],
            ],
            [
                'nome_local' => 'Cooperativa Recicla Paulínia Tecnológica',
                'municipio' => 'Paulínia',
                'endereco' => 'Av. José Paulino, 2100',
                'bairro' => 'Santa Cecília',
                'cep' => '13140-000',
                'latitude' => -22.7634000,
                'longitude' => -47.1539000,
                'limite_diario' => 25,
                'horario_funcionamento' => 'Segunda a Sexta: 08:00 às 16:30',
                'telefone_contato' => '(19) 3874-5500',
                'email_contato' => 'recicla@paulinia.sp.gov.br',
                'status_operacional' => 'ativo',
                'responsavel' => 'Coop. Juliana Martins',
                'capacidade_atual_kg' => 1980.00,
                'capacidade_maxima_kg' => 3000.00,
                'tipos_aceitos' => [0, 1, 2, 3, 4, 5, 6],
            ],
            [
                'nome_local' => 'Ecoponto Regional Sumaré Matão',
                'municipio' => 'Sumaré',
                'endereco' => 'Av. Emílio Bôscolo, 120',
                'bairro' => 'Jardim Matão',
                'cep' => '13180-000',
                'latitude' => -22.8210000,
                'longitude' => -47.2660000,
                'limite_diario' => 30,
                'horario_funcionamento' => 'Segunda a Sábado: 07:30 às 17:00',
                'telefone_contato' => '(19) 3828-9100',
                'email_contato' => 'ecoponto.matao@sumare.sp.gov.br',
                'status_operacional' => 'ativo',
                'responsavel' => 'Inspetor Laércio Ramos',
                'capacidade_atual_kg' => 2450.00,
                'capacidade_maxima_kg' => 4000.00,
                'tipos_aceitos' => [0, 1, 4, 5],
            ],
            [
                'nome_local' => 'Ponto Verde Hortolândia Remanso',
                'municipio' => 'Hortolândia',
                'endereco' => 'Rua Tereza Ana Cecon Breda, 750',
                'bairro' => 'Vila Real / Remanso',
                'cep' => '13183-250',
                'latitude' => -22.8580000,
                'longitude' => -47.2200000,
                'limite_diario' => 25,
                'horario_funcionamento' => 'Segunda a Sexta: 08:00 às 17:00 | Sábado: 08:00 às 12:00',
                'telefone_contato' => '(19) 3965-1400',
                'email_contato' => 'meioambiente@hortolandia.sp.gov.br',
                'status_operacional' => 'ativo',
                'responsavel' => 'Gerente Vanessa Prado',
                'capacidade_atual_kg' => 1350.00,
                'capacidade_maxima_kg' => 3500.00,
                'tipos_aceitos' => [0, 1, 3, 4, 5, 6],
            ],
            [
                'nome_local' => 'Ecoponto Valinhos Country / Ortizes',
                'municipio' => 'Valinhos',
                'endereco' => 'Rodovia Flávio de Carvalho, 420',
                'bairro' => 'Ortizes',
                'cep' => '13275-000',
                'latitude' => -22.9710000,
                'longitude' => -46.9950000,
                'limite_diario' => 20,
                'horario_funcionamento' => 'Segunda a Sexta: 08:00 às 17:00',
                'telefone_contato' => '(19) 3871-3300',
                'email_contato' => 'ecoponto@valinhos.sp.gov.br',
                'status_operacional' => 'ativo',
                'responsavel' => 'Téc. Rodrigo Mendes',
                'capacidade_atual_kg' => 620.00,
                'capacidade_maxima_kg' => 2500.00,
                'tipos_aceitos' => [0, 1, 2, 3, 4, 5],
            ],
        ];

        $modelosPontos = [];
        foreach ($pontos as $p) {
            $tiposAceitos = $p['tipos_aceitos'];
            unset($p['tipos_aceitos']);

            $ponto = PontoColeta::create($p);
            $modelosPontos[] = $ponto;

            // Vincular tipos aceitos
            foreach ($tiposAceitos as $idx) {
                if (isset($modelosTipos[$idx])) {
                    $ponto->tiposResiduo()->attach($modelosTipos[$idx]->id);
                }
            }
        }

        // 3. Criar Usuários Padrão
        $admin = User::create([
            'name' => 'Administrador Geral RMC',
            'email' => 'admin@ecothrow.rmc.br',
            'password' => Hash::make('admin123'),
            'tipo_perfil' => 'admin',
            'telefone' => '(19) 99123-4567',
        ]);

        $operadorBarao = User::create([
            'name' => 'Marcos Vinícius Toledo',
            'email' => 'operador.barao@ecothrow.rmc.br',
            'password' => Hash::make('operador123'),
            'tipo_perfil' => 'operador',
            'telefone' => '(19) 98877-6655',
            'ponto_coleta_id' => $modelosPontos[0]->id,
        ]);

        $operadorDic = User::create([
            'name' => 'Roberta Camargo',
            'email' => 'operador.dic@ecothrow.rmc.br',
            'password' => Hash::make('operador123'),
            'tipo_perfil' => 'operador',
            'telefone' => '(19) 97766-5544',
            'ponto_coleta_id' => $modelosPontos[1]->id,
        ]);

        $cidadao = User::create([
            'name' => 'Filipe Augusto Reis',
            'email' => 'filipe.reis@email.com',
            'password' => Hash::make('cidadao123'),
            'tipo_perfil' => 'cidadao',
            'telefone' => '(19) 98111-2233',
        ]);

        // 4. Criar Agendamentos de Demonstração
        $hoje = now();
        $amanha = now()->addDay();

        Agendamento::create([
            'codigo_validacao' => 'ECO-RMC-2026-A89F',
            'ponto_coleta_id' => $modelosPontos[0]->id, // Barão Geraldo
            'tipo_residuo_id' => $modelosTipos[0]->id, // Monitores e Telas
            'usuario_id' => $cidadao->id,
            'nome_cidadao' => 'Filipe Augusto Reis',
            'email_cidadao' => 'filipe.reis@email.com',
            'telefone_cidadao' => '(19) 98111-2233',
            'data_hora' => $hoje->copy()->setTime(14, 30),
            'quantidade_itens' => 2,
            'peso_estimado_kg' => 8.50,
            'descricao_itens' => '1 monitor LCD 21 polegadas Samsung e 1 notebook Dell antigo com tela quebrada.',
            'status' => 'agendado',
        ]);

        Agendamento::create([
            'codigo_validacao' => 'ECO-RMC-2026-B44E',
            'ponto_coleta_id' => $modelosPontos[0]->id, // Barão Geraldo
            'tipo_residuo_id' => $modelosTipos[1]->id, // Pilhas e Baterias
            'nome_cidadao' => 'Mariana Silveira',
            'email_cidadao' => 'mariana.silveira@gmail.com',
            'telefone_cidadao' => '(19) 99345-6789',
            'data_hora' => $hoje->copy()->setTime(16, 00),
            'quantidade_itens' => 15,
            'peso_estimado_kg' => 1.20,
            'descricao_itens' => 'Lote com 15 pilhas recarregáveis e 2 baterias de no-break desgastadas.',
            'status' => 'agendado',
        ]);

        Agendamento::create([
            'codigo_validacao' => 'ECO-RMC-2026-C12X',
            'ponto_coleta_id' => $modelosPontos[0]->id, // Barão Geraldo
            'tipo_residuo_id' => $modelosTipos[5]->id, // Celulares
            'nome_cidadao' => 'Lucas Biondo',
            'email_cidadao' => 'lucas.biondo@live.com',
            'telefone_cidadao' => '(19) 98222-3344',
            'data_hora' => $hoje->copy()->setTime(10, 00),
            'quantidade_itens' => 3,
            'peso_estimado_kg' => 0.80,
            'descricao_itens' => '3 smartphones antigos e 2 carregadores sem uso.',
            'status' => 'concluido',
            'data_conclusao' => $hoje->copy()->setTime(10, 15),
            'operador_responsavel' => 'Marcos Vinícius Toledo',
        ]);

        Agendamento::create([
            'codigo_validacao' => 'ECO-RMC-2026-D99P',
            'ponto_coleta_id' => $modelosPontos[1]->id, // DIC VI
            'tipo_residuo_id' => $modelosTipos[2]->id, // Linha Branca
            'nome_cidadao' => 'Eduardo Garcia',
            'email_cidadao' => 'eduardo.garcia@senai.br',
            'telefone_cidadao' => '(19) 97111-9988',
            'data_hora' => $amanha->copy()->setTime(11, 00),
            'quantidade_itens' => 1,
            'peso_estimado_kg' => 18.00,
            'descricao_itens' => '1 forno micro-ondas digital 30L com defeito no magnetron.',
            'status' => 'agendado',
        ]);
    }
}
