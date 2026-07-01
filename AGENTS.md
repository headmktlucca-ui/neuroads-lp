# MEMÓRIA DO PROJETO - [Nome do Seu Projeto Aqui]

## 1. REGRAS DURAS
[Descreva aqui o que NUNCA deve ser feito neste projeto. Ex: Nunca usar "var", nunca fazer commits diretos na branch main, nunca expor chaves de API.]

## 2. STACK TÉCNICA
[Liste as linguagens, frameworks, bibliotecas e versões exatas. Ex: React 18, TypeScript 5, Node.js 20, TailwindCSS.]

## 3. PERFIL DO NEGÓCIO
[Descreva o produto, quem é o cliente e o modelo de receita para dar contexto às decisões técnicas. Ex: SaaS B2B focado em clínicas médicas, com modelo de assinatura mensal.]

## 4. PADRÕES DE CÓDIGO
[Defina as convenções do time. Ex: Usar camelCase para variáveis, PascalCase para componentes, componentes em pastas com index.ts, preferir imports absolutos.]

## 5. ROTINA
[Liste os comandos essenciais e fluxos diários. Ex: "npm run dev" para iniciar localmente, "npm run test" antes de cada PR.]

## 6. ANTI-REPETIÇÃO
[Registre decisões arquiteturais definitivas para a IA não sugerir refatorações inúteis. Ex: Já decidimos usar Context API em vez de Redux; não sugira trocar o ORM Prisma por outro.]

## 7. LINGUAGEM
[Liste termos específicos do seu negócio ou palavras proibidas. Ex: Chamar os usuários de "Membros" e não de "Clientes"; evitar o jargão "X".]

---

# ARQUITETURA DE COMUNICAÇÃO ENTRE AGENTES IA — NEUROADS
### Especificação técnica completa: orquestração, base de conhecimento e geração de insights

---

## 1. VISÃO GERAL DA ARQUITETURA

```
┌─────────────────────────────────────────────────────────────────────┐
│                        USUÁRIO LOGADO                               │
│                  (contexto, empresa, permissões)                    │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    ORQUESTRADOR CENTRAL                             │
│                        ULISSES                                      │
│          (roteia, prioriza, distribui, consolida)                   │
└────────┬──────────┬──────────┬──────────┬──────────┬───────────────┘
         │          │          │          │          │
    ┌────▼───┐ ┌────▼───┐ ┌───▼────┐ ┌───▼────┐ ┌──▼─────┐
    │ VITOR  │ │  MANU  │ │  IGOR  │ │ TAINÁ  │ │ BRENO  │
    │  SDR   │ │Suporte │ │ Dados  │ │Conteúdo│ │ Closer │
    └────┬───┘ └────┬───┘ └───┬────┘ └───┬────┘ └──┬─────┘
         │          │          │          │          │
    ┌────▼───┐ ┌────▼───┐ ┌───▼────┐ ┌───▼────┐ ┌──▼─────┐
    │ PAOLA  │ │ RAÍSSA │ │HEITOR  │ │  LAÍS  │ │ULISSES │
    │Tráfego │ │Upsell  │ │Processos│ │  SEO   │ │C.Staff │
    └────┬───┘ └────┬───┘ └───┬────┘ └───┬────┘ └──┬─────┘
         │          │          │          │          │
         └──────────┴──────────┴──────────┴──────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    CAMADA DE MEMÓRIA COMPARTILHADA                  │
│         Base de Conhecimento + Contexto do Usuário + Histórico      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 2. CAMADA DE BASE DE CONHECIMENTO (RAG)

### 2.1 O que é injetado por usuário logado

Cada usuário logado tem um espaço de conhecimento isolado. Ao iniciar uma sessão com qualquer agente, o sistema injeta automaticamente:

```
knowledge_base/
├── empresa/
│   ├── perfil.json           → Nome, setor, porte, ICP, ticket médio
│   ├── produto_servico.md    → Descrição detalhada do que oferecem
│   ├── precos.json           → Tabela de preços e condições
│   └── concorrentes.md       → Concorrentes mapeados
├── marca/
│   ├── brand_voice.md        → Tom de voz, linguagem proibida
│   ├── guidelines.md         → Identidade visual e verbal
│   └── exemplos.md           → Exemplos de conteúdo aprovado
├── clientes/
│   ├── base_ativa.csv        → Clientes ativos com histórico
│   ├── inativos.csv          → Clientes inativos e data último contato
│   └── feedbacks.md          → Avaliações e reclamações recentes
├── campanhas/
│   ├── historico_ads.json    → Performance de campanhas anteriores
│   └── criativos_ativos.md   → Criativos em veiculação
└── processos/
    ├── sla.json              → Prazos e responsáveis por etapa
    └── fluxogramas.md        → Mapeamento de processos internos
```

### 2.2 Como o RAG é aplicado em tempo real

```
FLUXO DE INJEÇÃO DE CONTEXTO

1. Usuário logado → sistema identifica user_id
2. Sistema carrega knowledge_base[user_id]
3. Agente recebe: system_prompt base + knowledge_base filtrado por relevância
4. Agente opera com contexto completo do negócio do usuário
5. Respostas e ações são salvas de volta na base (memória persistente)
```

---

## 3. PROTOCOLO DE COMUNICAÇÃO ENTRE AGENTES

### 3.1 Tipos de comunicação

```
TIPO A — HANDOFF (passagem de bastão)
Agente A conclui sua etapa e passa o resultado para Agente B continuar.
Exemplo: VITOR qualifica lead → passa para BRENO fechar

TIPO B — CONSULTA (pergunta pontual)
Agente A está em execução e consulta Agente B por uma informação específica.
Exemplo: TAINÁ criando conteúdo → consulta IGOR sobre métricas de engajamento recentes

TIPO C — ALERTA (notificação assíncrona)
Agente A detecta algo relevante para o domínio de outro agente e notifica.
Exemplo: MANU detecta padrão de reclamação → alerta TAINÁ para criar conteúdo de suporte

TIPO D — BRIEFING (reunião de contexto)
ULISSES consolida inputs de múltiplos agentes e distribui para todos.
Exemplo: Todo dia às 8h, ULISSES envia o status consolidado para cada agente
```

### 3.2 Formato padrão de mensagem entre agentes (Agent Message Protocol)

```json
{
  "from": "VITOR",
  "to": "BRENO",
  "type": "HANDOFF",
  "priority": "alta",
  "timestamp": "2026-06-30T08:42:00Z",
  "user_id": "user_abc123",
  "payload": {
    "lead": {
      "nome": "Carlos Souza",
      "cargo": "Diretor Comercial",
      "empresa": "Empresa X",
      "score": "Quente"
    },
    "dor_identificada": "Time de vendas sem processo de follow-up estruturado",
    "historico_contatos": ["Email 12/06", "LinkedIn 15/06", "Reply recebido 18/06"],
    "contexto_para_fechamento": "Carlos pediu proposta com foco em ROI. Budget confirmado. Decisão em até 2 semanas."
  },
  "instrucao": "Assumir conversa. Enviar proposta personalizada focando em tempo de retorno do investimento.",
  "insights_gerados": [
    "Lead comparou com concorrente X na última mensagem — oportunidade de diferenciação por suporte",
    "Empresa em fase de expansão (LinkedIn mostra 3 vagas abertas) — urgência de processo escalável",
    "Último contato foi sexta à tarde — abordagem ideal: segunda pela manhã"
  ]
}
```

### 3.3 Mapa de handoffs automáticos entre agentes

```
VITOR ──────────────────────────────────► BRENO
(lead qualificado, quente)                (iniciar fechamento)

VITOR ──────────────────────────────────► ULISSES
(reunião agendada)                        (bloquear agenda, preparar briefing)

MANU ───────────────────────────────────► RAÍSSA
(cliente insatisfeito resolvido)          (aguardar 7 dias, oferecer upsell)

MANU ───────────────────────────────────► TAINÁ
(padrão de dúvida recorrente detectado)  (criar conteúdo educativo sobre o tema)

IGOR ───────────────────────────────────► PAOLA
(campanha com ROAS abaixo do benchmark)  (revisar e otimizar imediatamente)

IGOR ───────────────────────────────────► VITOR
(lead visitou página de preços 3x)       (acionar sequência de prospecção ativa)

IGOR ───────────────────────────────────► RAÍSSA
(cliente com queda de uso > 30%)         (acionar campanha de reativação)

TAINÁ ──────────────────────────────────► LAÍS
(artigo publicado)                        (otimizar para SEO e distribuição)

PAOLA ──────────────────────────────────► TAINÁ
(criativo em fadiga detectado)           (gerar 3 variações de conteúdo)

BRENO ──────────────────────────────────► HEITOR
(contrato assinado / venda fechada)      (iniciar onboarding do cliente)

HEITOR ─────────────────────────────────► RAÍSSA
(onboarding concluído — dia 30)          (verificar satisfação + potencial upsell)

ULISSES ────────────────────────────────► TODOS
(briefing diário 8h)                     (status do negócio + prioridades do dia)
```

---

## 4. GERAÇÃO DE INSIGHTS — PROTOCOLO

### 4.1 Regra universal de insights

Cada agente, ao concluir qualquer tarefa, deve gerar entre **1 e 3 insights** sobre oportunidades identificadas durante a execução. Os insights são classificados por tipo:

```
TIPO 💡 OPORTUNIDADE     → Algo que pode ser aproveitado proativamente
TIPO ⚠️ RISCO IMINENTE   → Algo que pode se tornar problema se não tratado
TIPO 🔁 PADRÃO DETECTADO → Comportamento recorrente que merece atenção estratégica
```

### 4.2 Estrutura padrão de insight

```json
{
  "agente": "IGOR",
  "tipo": "OPORTUNIDADE",
  "titulo": "Pico de visitas na página de planos toda segunda-feira",
  "descricao": "Nas últimas 4 semanas, 68% das visitas à página de preços ocorreram entre segunda e terça. Isso sugere que decisores pesquisam fornecedores no início da semana.",
  "acao_sugerida": "Configurar VITOR para acionar follow-up ativo toda segunda às 8h para leads que visitaram a página de preços nos últimos 7 dias.",
  "impacto_estimado": "Potencial de aumentar taxa de agendamento em 20-35%",
  "urgencia": "média",
  "destino_handoff": "VITOR",
  "timestamp": "2026-06-30T08:00:00Z"
}
```

### 4.3 Insights por agente — exemplos de padrões a detectar

```
VITOR (SDR)
├── Insight 1: Segmento com maior taxa de resposta esta semana
├── Insight 2: Horário e canal com melhor abertura de e-mail
└── Insight 3: Objeção mais recorrente nos últimos 30 dias

MANU (Suporte)
├── Insight 1: Dúvida ou problema mais repetido nos últimos 7 dias
├── Insight 2: Cliente com múltiplos tickets (risco de churn)
└── Insight 3: Ticket resolvido que virou oportunidade de conteúdo

IGOR (Dados)
├── Insight 1: Métrica fora do padrão histórico (anomalia detectada)
├── Insight 2: Correlação entre comportamento de lead e conversão
└── Insight 3: Canal ou campanha com ROI acima da média

TAINÁ (Conteúdo)
├── Insight 1: Formato de conteúdo com maior engajamento recente
├── Insight 2: Tema com alto interesse e baixa cobertura da marca
└── Insight 3: Melhor horário de publicação por canal nesta semana

BRENO (Closer)
├── Insight 1: Objeção que mais adiou fechamentos nesta semana
├── Insight 2: Proposta com maior taxa de conversão (valor, formato, abordagem)
└── Insight 3: Lead esquecido no funil com potencial de reabordagem

PAOLA (Tráfego)
├── Insight 1: Criativo ou público com ROAS acima do esperado
├── Insight 2: Campanha drenando orçamento sem resultado proporcional
└── Insight 3: Oportunidade de segmento não explorado com baixo CPM

RAÍSSA (Upsell)
├── Insight 1: Segmento da base com maior propensão a upgrade agora
├── Insight 2: Cliente em risco de churn que ainda tem alto LTV potencial
└── Insight 3: Produto/plano mais aceito em campanhas de reativação

HEITOR (Processos)
├── Insight 1: Etapa de processo com maior tempo médio de travamento
├── Insight 2: Documento mais frequentemente solicitado mas não entregue
└── Insight 3: Processo que poderia ser automatizado com alto impacto

LAÍS (SEO)
├── Insight 1: Palavra-chave com volume crescente e baixa competição
├── Insight 2: Página do site perdendo posição (queda detectada)
└── Insight 3: Tema que concorrente está rankeando e empresa ainda não tem conteúdo

ULISSES (Chief of Staff)
├── Insight 1: Padrão de uso do tempo que está consumindo foco estratégico
├── Insight 2: Decisão pendente há mais de X dias com impacto relevante
└── Insight 3: Oportunidade de melhoria de processo detectada nos relatórios da semana
```

---

## 5. STACK TÉCNICA RECOMENDADA PARA IMPLEMENTAÇÃO

### 5.1 Opção A — Stack com n8n (recomendado para NeuroAds)

```
CAMADA         FERRAMENTA              FUNÇÃO
────────────────────────────────────────────────────────────
Orquestração   n8n                     Fluxos, triggers, handoffs
LLM            Claude API (Sonnet)     Cérebro de cada agente
RAG            Supabase + pgvector     Base de conhecimento vetorizada
Autenticação   Supabase Auth           Isolamento por user_id
Memória        Redis                   Memória de sessão (curto prazo)
Persistência   Supabase (PostgreSQL)   Histórico e insights salvos
Mensageria     Slack / WhatsApp API    Canal de saída para o usuário
CRM            HubSpot                 Registro de leads e clientes
Arquivos       Google Drive            Upload da base de conhecimento
```

### 5.2 Opção B — Stack simplificada para MVP rápido

```
CAMADA         FERRAMENTA              FUNÇÃO
────────────────────────────────────────────────────────────
Orquestração   n8n                     Fluxos básicos
LLM            Claude API              Agentes
RAG            Notion + embeddings     Base de conhecimento
Autenticação   Firebase Auth           Login do usuário
Persistência   Firebase Firestore      Dados e insights
Canal          WhatsApp Business API   Comunicação com usuário
```

---

## 6. FLUXO COMPLETO — EXEMPLO REAL DE OPERAÇÃO

```
CENÁRIO: Segunda-feira, 8h — início da semana operacional

1. ULISSES (briefing automático)
   → Consolida dados do fim de semana
   → Gera resumo: "3 leads quentes sem follow-up, 1 cliente com ticket aberto há 48h, ROAS da campanha B caindo"
   → Distribui briefing para VITOR, MANU e PAOLA com prioridades do dia
   → INSIGHT: "Dois leads visitaram a página de preços no sábado — janela de intenção ativa"

2. VITOR (prospecção ativa)
   → Recebe briefing do ULISSES
   → Identifica os 2 leads com visita recente à página de preços
   → Aciona sequência de abordagem personalizada para cada um
   → INSIGHT: "Lead da Empresa Y respondeu em menos de 10min — sinal de alta intenção"
   → HANDOFF → BRENO: "Lead pronto para conversa de fechamento"

3. BRENO (fechamento)
   → Recebe handoff do VITOR com contexto completo
   → Inicia conversa de vendas com o lead
   → Envia proposta personalizada
   → INSIGHT: "Lead pediu referências do setor de logística — base de conhecimento tem 2 cases relevantes"

4. MANU (suporte paralelo)
   → Resolve ticket aberto há 48h
   → Detecta que é a 3ª reclamação sobre o mesmo tema este mês
   → INSIGHT: "Padrão recorrente detectado: dúvida sobre integração com ERP — oportunidade de conteúdo"
   → HANDOFF → TAINÁ: "Criar artigo/FAQ sobre integração com ERP"
   → HANDOFF → RAÍSSA: "Cliente resolvido, aguardar 7 dias para oferta de upsell"

5. IGOR (inteligência)
   → Detecta ROAS da campanha B 32% abaixo da média histórica
   → INSIGHT: "Queda de performance coincide com mudança de criativo feita na quinta-feira"
   → HANDOFF → PAOLA: "Revisar campanha B — criativo novo pode ser o problema"

6. PAOLA (tráfego)
   → Recebe alerta do IGOR
   → Pausa o criativo novo, reativa o anterior
   → INSIGHT: "Público lookalike do segmento de tecnologia com CPM 40% menor que o atual — testar"
   → Registra ação com justificativa no log

7. ULISSES (consolidação noturna)
   → Coleta todos os insights do dia (1-3 por agente)
   → Gera relatório executivo para o usuário
   → Define prioridades para o dia seguinte
   → Entrega: "Hoje: 1 lead fechado, 2 em negociação, 3 tickets resolvidos, 1 campanha otimizada, 4 insights estratégicos gerados"
```

---

## 7. CONFIGURAÇÃO DO SISTEMA — CHECKLIST DE IMPLEMENTAÇÃO

```
FASE 1 — BASE DE CONHECIMENTO (Semana 1)
□ Criar estrutura de pastas por usuário no Supabase/Google Drive
□ Definir template de upload (perfil empresa, produto, preços, clientes)
□ Configurar pipeline de embeddings (texto → vetores) com pgvector
□ Testar recuperação de contexto relevante por query

FASE 2 — AGENTES INDIVIDUAIS (Semana 2)
□ Configurar cada agente com seu system prompt no Claude API
□ Injetar knowledge_base filtrado por user_id em cada chamada
□ Implementar geração obrigatória de 1-3 insights por execução
□ Testar isolamento de contexto entre usuários diferentes

FASE 3 — PROTOCOLO DE COMUNICAÇÃO (Semana 3)
□ Implementar Agent Message Protocol (AMP) no n8n
□ Configurar triggers de handoff automáticos (mapa da seção 3.3)
□ Implementar fila de mensagens para comunicação assíncrona
□ Testar fluxo completo Vitor → Breno → Heitor (prospecção até onboarding)

FASE 4 — ULISSES COMO ORQUESTRADOR (Semana 4)
□ Configurar briefing diário automático (cron 8h)
□ Implementar consolidação de insights de todos os agentes
□ Criar painel de visualização de insights para o usuário
□ Ativar relatório executivo semanal

FASE 5 — REFINAMENTO E ESCALA (Semana 5+)
□ Monitorar qualidade dos insights gerados
□ Ajustar thresholds de handoff automático
□ Adicionar novos arquivos à base de conhecimento conforme operação evolui
□ Implementar feedback loop: usuário avalia insight → agente aprende preferências
```

---

## 8. SEGURANÇA E ISOLAMENTO DE DADOS

```
PRINCÍPIO: Nenhum agente de um usuário acessa dados de outro usuário.

IMPLEMENTAÇÃO:
├── Cada chamada à API carrega user_id no header
├── Base de conhecimento particionada por user_id no banco
├── Insights e histórico isolados por tenant
├── Logs de comunicação entre agentes tagueados com user_id
└── Acesso à base de conhecimento requer autenticação ativa (token válido)

NÍVEIS DE PERMISSÃO:
├── ADMIN    → Acesso total + configuração de agentes
├── MANAGER  → Visualiza insights + aprova handoffs críticos
└── VIEWER   → Apenas relatórios consolidados
```

---

*Documento carregado por instrução para compreensão da arquitetura do projeto NeuroAds.*