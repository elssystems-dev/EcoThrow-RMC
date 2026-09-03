# Especificação de Requisitos de Software (SRS)

## Sistema de Agendamento e Mapeamento de Lixo Eletrônico (EcoDescarte RMC)

**Conforme a Norma ISO/IEC/IEEE 29148:2018**

---

## 1. Introdução

### 1.1 Propósito
O propósito deste documento é definir a Especificação de Requisitos de Software (SRS) para o sistema **EcoDescarte RMC**. O objetivo principal do sistema é facilitar o descarte ambientalmente correto de resíduos eletroeletrônicos na Região Metropolitana de Campinas (RMC), conectando cidadãos a pontos de coleta credenciados e cooperativas de reciclagem por meio de localização geográfica e agendamentos.

### 1.2 Escopo do Sistema
O **EcoDescarte RMC** é uma aplicação web voltada para:
* **Cidadãos/Geradores de Resíduos:** Localização de pontos de coleta próximos, consulta de materiais aceitos e agendamento de entregas.
* **Pontos de Coleta/Cooperativas:** Gestão de horários disponíveis, recebimento e confirmação de agendamentos.
* **Administradores:** Cadastro e homologação de novos pontos de coleta na RMC.

### 1.3 Definições, Acrônimos e Abreviações
* **RMC:** Região Metropolitana de Campinas.
* **REEE:** Resíduos de Equipamentos Eletroeletrônicos (Lixo Eletrônico).
* **CRUD:** *Create, Read, Update, Delete* (Operações básicas de banco de dados).
* **RF:** Requisito Funcional.
* **RNF:** Requisito Não Funcional.
* **RN:** Regra de Negócio.

### 1.4 Visão Geral do Documento
Este documento descreve os requisitos do sistema em conformidade com as diretrizes da ISO/IEC/IEEE 29148:2018, cobrindo a descrição geral, requisitos funcionais e não funcionais, regras de negócio, restrições tecnológicas e modelagem de dados.

---

## 2. Descrição Geral

### 2.1 Perspectiva do Produto
O EcoDescarte RMC é um sistema autônomo baseado na arquitetura Web (Cliente-Servidor). Ele se integra a serviços de mapas (como Leaflet/OpenStreetMap ou Google Maps API) para renderização visual e geolocalização dos pontos de coleta na região.

### 2.2 Funções do Produto
* Mapeamento interativo de pontos de coleta na RMC.
* Filtro de busca por tipo de resíduo (monitores, baterias, grandes portpáveis, etc.) e município.
* Agendamento de horário para entrega de REEE.
* Painel de gerenciamento para administradores dos pontos de coleta.
* Emissão de comprovante digital de agendamento.

### 2.3 Classes de Usuários e Características
1. **Cidadão (Usuário Final):** Acessa o sistema para buscar pontos e agendar entregas. Possui conhecimentos básicos de navegação web.
2. **Operador de Ponto de Coleta:** Responsável por gerenciar o fluxo de recebimento do lixo eletrônico.
3. **Administrador do Sistema:** Acessa o painel master para cadastrar e validar novos pontos de coleta.

---

## 3. Requisitos Específicos

### 3.1 Requisitos Funcionais (RF)

| ID | Nome | Descrição | Prioridade |
| :--- | :--- | :--- | :--- |
| **RF-01** | Visualizar Mapa de Pontos | O sistema deve exibir um mapa interativo contendo os pontos de coleta credenciados na RMC. | Alta |
| **RF-02** | Filtrar Pontos de Coleta | O cidadão deve poder filtrar pontos por município (ex: Campinas, Americana, Sumaré) e tipo de resíduo. | Alta |
| **RF-03** | Agendar Entrega | O sistema deve permitir que um cidadão selecione um ponto, escolha data/horário e agende o descarte. | Alta |
| **RF-04** | Cancelar Agendamento | O cidadão deve poder cancelar um agendamento prévio informando o código da reserva. | Média |
| **RF-05** | Cadastrar Ponto de Coleta | O administrador deve poder cadastrar novos pontos de coleta com endereço, horário e tipos de resíduos aceitos. | Alta |
| **RF-06** | Confirmar Recebimento | O operador do ponto deve conseguir marcar um agendamento como "Concluído" no sistema. | Média |
| **RF-07** | Gerar Comprovante | O sistema deve gerar uma confirmação digital (com código único/QR Code) após a conclusão do agendamento. | Baixa |

---

### 3.2 Requisitos Não Funcionais (RNF)

| ID | Categoria | Descrição | Prioridade |
| :--- | :--- | :--- | :--- |
| **RNF-01** | Usabilidade | A interface deve ser responsiva, adaptando-se a dispositivos móveis e desktops. | Alta |
| **RNF-02** | Desempenho | O carregamento inicial do mapa e dos marcadores deve ocorrer em até 3 segundos sob conexões 3G/4G padrão. | Média |
| **RNF-03** | Segurança | Todas as senhas de usuários e administradores devem ser armazenadas com criptografia (ex: Hash bcrypt). | Alta |
| **RNF-04** | Disponibilidade | O sistema deve manter alta disponibilidade (meta de 99% em ambiente de produção). | Média |
| **RNF-05** | Manutenibilidade | O código-fonte deve ser documentado e estruturado no padrão MVC ou arquitetura modular simples. | Alta |

---

### 3.3 Regras de Negócio (RN)

* **RN-01 (Capacidade Média do Ponto):** Um ponto de coleta não pode receber agendamentos além do seu limite diário configurado pelo operador.
* **RN-02 (Antecedência Mínima):** Os agendamentos de descarte só podem ser feitos com pelo menos 2 horas de antecedência.
* **RN-03 (Classificação de Resíduos):** O agendamento só pode ser efetuado se o tipo do resíduo informado pelo usuário for expressamente aceito pelo ponto selecionado.
* **RN-04 (Geofencing da Região):** O cadastro de novos pontos de coleta é restrito aos municípios pertencentes à Região Metropolitana de Campinas (RMC).

---

### 3.4 Restrições do Sistema

* **RES-01:** O sistema deve ser desenvolvido utilizando tecnologias acessíveis e gratuitas (Open-Source).
* **RES-02:** A solução deve ser implementada no prazo estipulado pela disciplina do curso de Desenvolvimento de Sistemas do SENAI.
* **RES-03:** A API de mapas não deve gerar custos operacionais (uso recomendado de OpenStreetMap via LeafletJS).

---

## 4. Modelagem de Dados

### 4.1 Entidades Principais e Atributos

1. **Usuario**
   * `id_usuario` (PK, Int, Auto Increment)
   * `nome` (Varchar 100)
   * `email` (Varchar 100, Unique)
   * `senha_hash` (Varchar 255)
   * `tipo_perfil` (Enum: 'CIDADAO', 'OPERADOR', 'ADMIN')

2. **PontoColeta**
   * `id_ponto` (PK, Int, Auto Increment)
   * `nome_local` (Varchar 100)
   * `municipio` (Varchar 50)
   * `endereco` (Varchar 200)
   * `latitude` (Decimal 10, 8)
   * `longitude` (Decimal 11, 8)
   * `limite_diario` (Int)

3. **TipoResiduo**
   * `id_residuo` (PK, Int, Auto Increment)
   * `categoria` (Varchar 50) — *Ex: Monitores, Pilhas/Baterias, Eletrodomésticos*
   * `descricao` (Text)

4. **Agendamento**
   * `id_agendamento` (PK, Int, Auto Increment)
   * `id_usuario` (FK -> Usuario)
   * `id_ponto` (FK -> PontoColeta)
   * `id_residuo` (FK -> TipoResiduo)
   * `data_hora` (Datetime)
   * `status` (Enum: 'PENDENTE', 'CONCLUIDO', 'CANCELADO')
   * `codigo_validacao` (Varchar 10)

### 4.2 Diagrama Entidade-Relacionamento (Relacionamentos)
* Um **PontoColeta** pode aceitar vários **TiposResiduo** (Relacionamento N:M através de tabela intermediária `Ponto_Residuo`).
* Um **Usuario** pode realizar múltiplos **Agendamentos** (Relacionamento 1:N).
* Um **PontoColeta** possui múltiplos **Agendamentos** (Relacionamento 1:N).

---

## 5. Sugestão de Arquitetura e Tecnologias

Para o seu desenvolvimento com suporte de IA no SENAI:
* **Front-end:** HTML5, CSS3 (Bootstrap ou Tailwind), JavaScript.
* **Back-end:** Node.js (Express) ou Python (Flask / FastAPI).
* **Banco de Dados:** SQLite (fácil configuração em desenvolvimento) ou MySQL / PostgreSQL.
* **Mapas:** Leaflet.js com azulejos de mapa OpenStreetMap (100% gratuito e sem necessidade de cartão de crédito).