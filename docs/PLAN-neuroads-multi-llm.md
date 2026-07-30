# PLAN-neuroads-multi-llm.md - Planejamento de Implantação da Arquitetura Multi-LLM

Este documento detalha o planejamento de implantação da arquitetura multi-LLM heterogênea da NeuroAds, mapeando a infraestrutura atual acessível no projeto e estabelecendo a estratégia para divisão inteligente de tarefas entre os diferentes modelos de IA (GPT-5.5, Claude Sonnet 4, Claude Opus 4.x, Gemini 2.5 Pro, Gemini Flash/GPT-5.5 mini, e modelos especializados de visão computacional).

---

## 🎯 Análise e Distribuição de Responsabilidades da Arquitetura

Conforme a análise de requisitos, a plataforma adotará uma abordagem heterogênea (Multi-LLM) para otimizar latência, custo e qualidade:

| Agente / Componente | Modelo Recomendado | Escopo e Responsabilidade principal |
|---|---|---|
| **Orquestrador Central (Ulisses)** | **GPT-5.5** | Distribuição de tarefas, controle de memória, gerenciamento de contexto e consolidação de insights dos outros agentes. |
| **Planejamento Estratégico & Jurídico** | **Claude Opus 4.x** | Raciocínio longo, redação de contratos, análise de documentos regulatórios/corporativos extensos e decisões estratégicas de negócios. |
| **SDR, Comercial, Copywriting & Marketing** | **GPT-5.5** | Atendimento consultivo pré-vendas, personalização baseada em CRM (via RAG), persuasão, escrita de anúncios para tráfego (Google, Meta, TikTok) e SEO. |
| **Análise de Dados & Pesquisa na Web** | **Gemini 2.5 Pro** | Processamento de planilhas de performance, análise de grandes bases de clientes ativos, e síntese de informações da internet em tempo real. |
| **Atendimento 24/7 & Agentes Simples** | **GPT-5.5 mini** ou **Gemini Flash** | Suporte inicial escalável de baixíssimo custo e latência para interação direta por WhatsApp/E-mail. |
| **Geração & Auditoria de Código** | **Claude Sonnet 4** | Automações do sistema, criação de microsserviços, endpoints de API e refatoração/revisão de bugs de código. |
| **Eye Tracking & Visão Computacional** | **Modelos Especializados** (DeepGaze / CLIP / SAM / ViT) + **GPT-5.5** | Processamento visual de anúncios (geração de heatmaps preditivos e saliência visual) e posterior geração de relatório analítico em texto pelo GPT-5.5. |

---

## 🔍 Mapeamento da Infraestrutura Atual do Projeto

O NeuroAds LP já possui uma fundação sólida que facilitará a transição para essa arquitetura heterogênea:

1. **Server Actions de IA Existentes (`src/app/actions/`)**:
   - Várias actions já realizam chamadas à API da OpenAI (`model: 'gpt-4o'`) e Google Generative AI (Gemini).
   - Exemplos identificados:
     - [traffic-analysis-ai.ts](file:///c:/Users/claud/OneDrive/Documentos/NeuroAds/LP/src/app/actions/traffic-analysis-ai.ts) e [seo-geo-audit.ts](file:///c:/Users/claud/OneDrive/Documentos/NeuroAds/LP/src/app/actions/seo-geo-audit.ts) (OpenAI).
     - [lp-diagnostic.ts](file:///c:/Users/claud/OneDrive/Documentos/NeuroAds/LP/src/app/actions/lp-diagnostic.ts) e [dna-brand-deep-analysis.ts](file:///c:/Users/claud/OneDrive/Documentos/NeuroAds/LP/src/lib/dna-brand-deep-analysis.ts) (Gemini API via `GoogleGenAI`).
2. **Sistema de RAG e Embeddings (`src/lib/knowledge-rag.ts`)**:
   - Atualmente implementa embeddings locais usando `text-embedding-3-small` da OpenAI e faz o ranqueamento por similaridade de cosseno em memória diretamente nos dados recuperados do Firestore (limite de 60 candidatos por usuário).
3. **Módulo Agente Autônomo (`neuroads-agent/`)**:
   - Módulo Node.js/TypeScript isolado que orquestra ferramentas via **Composio** (integração nativa com HubSpot, Gmail e Slack) utilizando o Claude através do Vercel AI SDK.
4. **Base de Conhecimento (`neuroads-knowledge-hub/`)**:
   - Repositório local de informações estruturado em subpastas (`01-hubspot`, `02-firebase`, `04-content-seo`, etc.), que é usado para subsidiar as queries dos agentes.
5. **Configuração de Variáveis de Ambiente (`.env.example` / `.env.local`)**:
   - Possui campos para chaves da OpenAI (`OPENAI_API_KEY`), chaves do Firebase Admin, Stripe e tokens/chaves de integrações (Google Ads, Meta Ads, HubSpot, TikTok Ads).

---

## 🛠️ Passo a Passo para Implantação da Arquitetura Multi-LLM

A implantação da nova arquitetura heterogênea será dividida em 5 fases sequenciais:

### FASE 1: Roteador Centralizado de LLMs (LLM Router Factory)
Para evitar que cada Server Action instancie sua própria conexão de IA de forma hardcoded (ex: `new OpenAI()`), criaremos uma factory centralizada responsável por instanciar a API correta com o modelo configurado para cada agente.

- **Ação:** Criar `src/lib/llm-router.ts`.
- **Funcionamento:** Expor uma função `getAgentLLM(agentKey: string)` que lê as configurações do agente e retorna a instância apropriada (OpenAI SDK para GPT-5.5/GPT-5.5 mini, Anthropic SDK para Claude Sonnet/Opus, ou Google GenAI SDK para Gemini).

### FASE 2: Atualização e Conectividade das Variáveis de Ambiente
Atualizar os arquivos `.env` e `.env.local` com as novas credenciais de modelos.
- **Novas chaves necessárias:**
  - `ANTHROPIC_API_KEY` (para Claude Sonnet 4 e Claude Opus 4.x)
  - `GEMINI_API_KEY` (para Gemini 2.5 Pro e Gemini Flash)
  - `OPENAI_API_KEY` (para os modelos GPT-5.5 e GPT-5.5 mini)

### FASE 3: Refatoração das Server Actions dos Agentes
Substituir os imports diretos de `OpenAI` e `GoogleGenerativeAI` nas Server Actions pelo `llmRouter`.
- **Arquivos a alterar:**
  - [src/app/actions/traffic-analysis-ai.ts](file:///c:/Users/claud/OneDrive/Documentos/NeuroAds/LP/src/app/actions/traffic-analysis-ai.ts) -> Rota para **GPT-5.5**
  - [src/app/actions/seo-geo-audit.ts](file:///c:/Users/claud/OneDrive/Documentos/NeuroAds/LP/src/app/actions/seo-geo-audit.ts) -> Rota para **Gemini 2.5 Pro** (para pesquisa e auditoria SEO/GEO avançada)
  - [src/app/actions/conversion-copy-generator.ts](file:///c:/Users/claud/OneDrive/Documentos/NeuroAds/LP/src/app/actions/conversion-copy-generator.ts) -> Rota para **GPT-5.5** (Copywriting)
  - [src/app/actions/dna-brand.ts](file:///c:/Users/claud/OneDrive/Documentos/NeuroAds/LP/src/app/actions/dna-brand.ts) -> Rota para **Claude Opus 4.x** (Planejamento Estratégico de Marca)
  - [src/app/actions/landing-page-diagnosis.ts](file:///c:/Users/claud/OneDrive/Documentos/NeuroAds/LP/src/app/actions/landing-page-diagnosis.ts) -> Rota para **Claude Sonnet 4** (Geração/Auditoria de Código e Estrutura Técnica de LP)
  - [neuroads-agent/src/agent.ts](file:///c:/Users/claud/OneDrive/Documentos/NeuroAds/LP/neuroads-agent/src/agent.ts) -> Manter/Atualizar para **Claude Sonnet 4** via Vercel AI SDK para as ações de codificação/automação.

### FASE 4: Upgrade da Camada RAG & Banco Vetorial
Substituir a busca vetorial em memória local por uma solução corporativa escalável baseada em Qdrant ou Pinecone.
- **Ação:** Alterar [src/lib/knowledge-rag.ts](file:///c:/Users/claud/OneDrive/Documentos/NeuroAds/LP/src/lib/knowledge-rag.ts) para usar a biblioteca cliente do Qdrant/Pinecone.
- **Integração com Gemini 2.5 Pro:** Usar o Gemini 2.5 Pro para consolidar o contexto injetado a partir da base vetorial do Firestore/Qdrant devido a sua janela de contexto massiva.

### FASE 5: Pipeline de Eye Tracking & Análise Visual
Criar a infraestrutura de análise preditiva visual para criativos/landing pages.
- **Etapa 1:** Upload da imagem do anúncio pelo usuário.
- **Etapa 2:** Envio da imagem para um microsserviço especializado (Python) rodando DeepGaze III / SAM para gerar um Heatmap (mapa de calor de atenção).
- **Etapa 3:** Upload do Heatmap gerado e envio conjunta da imagem original + heatmap para a API do **GPT-5.5** (Visão) para gerar o relatório descritivo.

---

## 🧭 Guia para Localizar Chaves, Configurações e Arquivos Ocultos

Se alguma informação ou credencial não estiver listada nos arquivos de configuração do repositório, siga as orientações abaixo:

### 1. Chaves de API das LLMs
- **OpenAI (GPT-5.5 / 5.5 mini / Text Embeddings)**:
  - Acesse o [OpenAI API Dashboard](https://platform.openai.com/).
  - Vá em **API Keys** e gere uma chave. Adicione no `.env.local` como `OPENAI_API_KEY`.
- **Anthropic (Claude Sonnet 4 / Opus 4.x)**:
  - Acesse o [Anthropic Console](https://console.anthropic.com/).
  - Vá em **API Keys** e crie uma nova chave. Adicione no `.env.local` como `ANTHROPIC_API_KEY`.
- **Google AI Studio (Gemini 2.5 Pro / Flash)**:
  - Acesse o [Google AI Studio](https://aistudio.google.com/).
  - Vá em **Get API Key** e copie a chave. Adicione no `.env.local` como `GEMINI_API_KEY`.

### 2. Configurações de Banco de Dados e Firebase
- As credenciais de produção do Firebase estão no Firestore do projeto console da Google.
- Se precisar da chave privada Admin (para o `.env.local` como `FIREBASE_PRIVATE_KEY`):
  1. Vá ao **Firebase Console** -> Configurações do Projeto -> Contas de Serviço.
  2. Clique em **Gerar nova chave privada**.
  3. Baixe o JSON e extraia o `client_email` e `private_key`.

### 3. Conexões de Ferramentas / Composio (HubSpot, Slack, Gmail)
- Caso queira reconfigurar as ferramentas do agente autônomo em `neuroads-agent`:
  - Acesse o [Composio Dashboard](https://app.composio.dev/).
  - As chaves de conexão OAuth dos clientes da agência e logs de chamadas estão disponíveis no console Composio. A chave de integração principal é configurada como `COMPOSIO_API_KEY` no `.env` do microsserviço `neuroads-agent/`.

---

## 🛑 Socratic Gate (Perguntas para Definições de Design)

Para consolidar o plano de implantação, pedimos que avalie as seguintes decisões estratégicas:

1. **Roteador vs SDK Unificado (Vercel AI SDK):** Deseja que utilizemos o **Vercel AI SDK** (`@ai-sdk/openai`, `@ai-sdk/anthropic`, `@ai-sdk/google`) como camada única de abstração no projeto principal para facilitar a troca rápida de modelos, ou prefere instanciar os SDKs oficiais separadamente em arquivos dedicados?
2. **Solução de Eye Tracking:** O microsserviço de Visão Computacional (DeepGaze III / SAM) será hospedado de forma independente (ex.: container Docker em VPS/AWS EC2) ou usaremos alguma API externa integrada de predição visual?
3. **Escalonamento do RAG:** O banco de dados vetorial de escolha para a transição imediata será o **Qdrant** (rodando localmente/nuvem corporativa) ou prefere utilizar o **Supabase + pgvector** (reaproveitando a infraestrutura PostgreSQL se disponível)?

---

## 🏁 Plano de Verificação

### Testes de Integração
- Criar um script de sanidade em `scripts/test-llm-router.ts` que envie uma consulta de teste para cada um dos modelos roteados (GPT-5.5, Claude Sonnet, Gemini Pro) e valide a resposta.
- Executar o script localmente antes de atualizar as rotas em produção:
  ```bash
  npx tsx scripts/test-llm-router.ts
  ```

### Validações de Build e Lint
- Executar auditorias estáticas do projeto:
  ```bash
  npm run lint
  npx tsc --noEmit
  python .agent/scripts/verify_all.py . --url http://localhost:3000
  ```
