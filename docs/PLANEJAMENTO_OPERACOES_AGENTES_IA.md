# Planejamento de Sprint — Operações Pré-configuradas dos Agentes IA

**Objetivo do programa:** Configurar os prompts das operações pré-configuradas de todos os Agentes IA executadas em `hub/assistente-ia`, com autonomia máxima (mínima interação com o usuário), pesquisa profunda em web/redes sociais, uso dos canais conectados em Integrações, Base de Conhecimento como fonte primária, Salvar/Exportar nos resultados, refino via chat e Ulisses como orquestrador e auditor de qualidade.

---

## 1. Diagnóstico do estado atual (base do planejamento)

| Área | Estado hoje | Gap para o objetivo |
|---|---|---|
| Agentes | 10 agentes em `src/data/team-agents.ts`, cada um com system prompt de identidade | Prompts não cobrem operações individuais com protocolo de autonomia |
| Operações | 37 especialidades em `src/data/agents.ts` vinculadas via `specialtyTitles` | Sem prompt operacional próprio por especialidade |
| Chat | Server action `lucca-hub-chat.ts` (OpenAI `gpt-4o-mini`), streaming, formulários dinâmicos, painel esquerdo de resultados | Sem tool-calling para web search; modelo limitado para pesquisa profunda |
| Conectores | `src/lib/connectors.ts` + OAuth + refresh de token (`connector-refresh-server`); em expansão (gmail, googleCalendar, whatsapp em andamento) | Chat usa conexões de forma superficial (`describeConnections`); falta coleta real de dados por operação |
| Base de Conhecimento | Aba em `hub/configuracoes?tab=conhecimento` | Documentos não são injetados como contexto nas operações (sem RAG) |
| Exportar | Download CSV/texto no painel de resultados | Sem exportação PDF formatada |
| Salvar | Histórico de chat (`chat-history.ts`) | Sem "Salvar na Base de Conhecimento" personalizado |
| Ulisses | Persona orquestrador central (briefings) | Sem pipeline real de orquestração/auditoria dos resultados |

---

## 2. Meta do Sprint (frase única)

> **"Toda operação pré-configurada executa de ponta a ponta com autonomia: coleta dados dos canais conectados + Base de Conhecimento + web, só pergunta o que não conseguiu descobrir, e entrega um resultado auditado pelo Ulisses que pode ser salvo na Base ou exportado em PDF."**

---

## 3. Estrutura em 3 Sprints (2 semanas cada)

### Sprint 1 — Fundação: arquitetura de prompts + fontes de dados

| Prioridade | Item | Estimativa | Dependências |
|---|---|---|---|
| P0 | **Template mestre de prompt de operação** — estrutura padrão: objetivo, fontes obrigatórias (ordem: conectores → Base de Conhecimento → web), protocolo de autonomia ("nunca pergunte o que pode descobrir"), gate de pergunta única consolidada, formato de saída (JSON do painel esquerdo) | 5 pts | Nenhuma |
| P0 | **RAG da Base de Conhecimento** — indexar documentos enviados (Firestore/Storage + embeddings), recuperação por relevância à operação, injeção no contexto | 8 pts | Definir storage atual da aba Conhecimento |
| P0 | **Camada de coleta via conectores** — por operação, mapear quais conectores usa (ex: Simulador de ROAS → Google Ads + GA4); busca real de dados com `getValidAccessToken`; fallback declarado quando desconectado | 8 pts | Conectores gmail/calendar/whatsapp em andamento (trabalho atual do time) |
| P1 | **Pesquisa profunda web/social** — tool-calling com provedor de busca (ex: Tavily/Serper ou upgrade para modelo com web search nativo); sub-rotina "deep research" com N consultas e síntese | 8 pts | Decisão de provedor/custo |
| P2 | Telemetria mínima por operação (fontes usadas, perguntas feitas, tempo) | 3 pts | — |

**Sprint 1 total: 24–32 pts**

### Sprint 2 — Os 37 prompts + orquestração Ulisses

| Prioridade | Item | Estimativa | Dependências |
|---|---|---|---|
| P0 | **Escrita dos 37 prompts de operação** usando o template mestre, em lotes por agente: Paola (tráfego), Igor (dados), Laís (SEO/GEO), Tainá (conteúdo), Vitor (SDR), Breno (closer), Manu (suporte), Raíssa (upsell), Heitor (integrações), Ulisses (orquestração) — ~4 pts por agente | 20 pts | Sprint 1 (template + fontes) |
| P0 | **Pipeline Ulisses orquestrador** — toda operação passa por Ulisses: (1) ele roteia/despacha para o agente correto; (2) recebe o resultado bruto; (3) executa **passe de auditoria** (2ª chamada LLM) validando: apresentação visual (schema do painel), veracidade (números rastreáveis à fonte; sem invenção), coerência de insights/oportunidades; (4) aprova ou devolve para correção (máx. 1 retry) | 8 pts | Template de saída |
| P1 | **Gate de informação faltante** — quando a coleta não encontra um dado obrigatório, o agente monta UM formulário consolidado (usar `FormFields` existente no chat) em vez de múltiplas perguntas | 5 pts | Sprint 1 |
| P2 | Versionamento de prompts (mover de código para Firestore com fallback no código, permitindo ajustes sem deploy) | 5 pts | — |

**Sprint 2 total: 33–38 pts**

### Sprint 3 — Experiência do resultado: Salvar, Exportar, Refinar

| Prioridade | Item | Estimativa | Dependências |
|---|---|---|---|
| P0 | **Salvar na Base de Conhecimento** — botão no painel de resultados; modal com título, tags e pasta/categoria; grava como documento consultável pelas próximas operações (fecha o ciclo do RAG) | 5 pts | RAG (Sprint 1) |
| P0 | **Exportar PDF** — geração client-side (ex: `@react-pdf/renderer` ou `jsPDF` + template com identidade NeuroAds: logo, cores, tabelas, gráficos como imagem) | 8 pts | — |
| P0 | **Refino multi-turno** — chat mantém o resultado ativo como contexto; mensagens seguintes editam/refinam o painel (diff incremental, não regeneração cega); Ulisses re-audita alterações | 8 pts | Pipeline Ulisses |
| P1 | QA end-to-end das 37 operações (roteiro: executar cada uma com conta conectada de teste + Base populada; checar autonomia, fontes citadas, salvar, exportar, refinar) | 8 pts | Tudo anterior |
| P2 | Conjunto de avaliação (eval set) com 10 casos padrão para regressão de qualidade dos prompts | 5 pts | — |

**Sprint 3 total: 29–34 pts**

---

## 4. Capacidade e cadência

| Pessoa | Papel | Observação |
|---|---|---|
| Fundador (você) | Product owner + revisão de qualidade dos prompts | Aprova lotes de prompts por agente; testa com contas reais |
| Claude Code | Implementação (código + escrita dos prompts) | Executa os itens do backlog em sessões dirigidas |

Cadência sugerida: lotes de 1 agente por sessão na escrita dos prompts (10 sessões curtas no Sprint 2), com sua revisão do lote anterior antes do próximo. Planejar a ~75% da capacidade — o trabalho paralelo de conectores (gmail/calendar/whatsapp) vai consumir parte das sessões.

---

## 5. Riscos

| Risco | Impacto | Mitigação |
|---|---|---|
| `gpt-4o-mini` insuficiente para pesquisa profunda + auditoria | Resultados rasos, auditoria fraca | Roteamento por complexidade: mini para operações simples, modelo superior (GPT-4o / Claude com web search) para deep research e para o passe de auditoria do Ulisses |
| Custo de API por operação sobe (2 chamadas + busca web + RAG) | Margem do plano de créditos | Precificar operação em créditos por classe (leve/média/profunda); cache de pesquisas por 24h |
| Base de Conhecimento vazia no onboarding | RAG não agrega valor | Prompt trata ausência de docs como caminho normal (declara fonte "não disponível"); CTA no resultado sugerindo subir documentos |
| Conectores em expansão mudam a interface (`ConnectorStatus`) | Quebra da camada de coleta | Concluir o trabalho atual de conectores antes do item de coleta (há erro TS pendente em `Navbar.tsx` que já trava o build) |
| Alucinação de números | Perda de confiança (crítico no seu posicionamento "dados que provem retorno") | Regra dura no template: todo número deve citar fonte (conector/documento/web); auditoria do Ulisses rejeita números órfãos |

---

## 6. Definition of Done (por operação)

- [ ] Prompt segue o template mestre (fontes, autonomia, gate de pergunta, formato de saída)
- [ ] Executa sem nenhuma pergunta quando conectores + Base cobrem os dados
- [ ] Pergunta no máximo 1 vez (formulário consolidado) quando falta dado essencial
- [ ] Todo número no resultado tem fonte rastreável
- [ ] Passa pela auditoria do Ulisses (visual, veracidade, coerência)
- [ ] Salvar na Base e Exportar PDF funcionam no resultado
- [ ] Refino via chat altera o painel sem regenerar do zero
- [ ] Testado com conta conectada real ou fixture documentada

---

## 7. Orientações adicionais (recomendações do time)

1. **Contrato de saída estruturada**: definir um schema JSON único (`LuccaLeftPanelData` já existe — formalizar com validação Zod) e usar *structured outputs* do provedor. A auditoria do Ulisses fica muito mais barata validando schema + regras antes de gastar LLM.
2. **Ulisses como camada, não como gargalo**: a auditoria deve ser um passe rápido com regras objetivas (checklist) + veto de números sem fonte. Evitar re-escrita completa do resultado — devolve ao agente com apontamentos.
3. **Créditos por classe de operação**: alinhar com o plano (aba Valores & Recursos): operação leve (1 crédito), com conectores (2), deep research (4). Transparência de consumo no resultado.
4. **Citações visíveis**: exibir "Fontes: Google Ads (últimos 30d) · GA4 · doc 'Playbook Q3.pdf' · 3 páginas web" no rodapé de cada resultado — reforça o posicionamento de dados confiáveis e facilita a auditoria.
5. **LGPD/segurança**: dados coletados de conectores entram no contexto do LLM — registrar consentimento no onboarding do conector e nunca persistir dado bruto de terceiros na Base sem ação explícita do usuário (o "Salvar" resolve isso bem).
6. **Ordem de implementação dos agentes no Sprint 2**: começar por Paola e Igor (tráfego/dados — maior valor percebido e conectores prontos: Google Ads/GA4/Meta), terminar com Manu/Raíssa (dependem de CRM/WhatsApp ainda em construção).

---

## 8. Datas-chave (proposta)

| Data | Evento |
|---|---|
| Semana 1 | Início Sprint 1 — template mestre aprovado até o 3º dia |
| Fim semana 2 | Demo: 1 operação piloto (Simulador de ROAS da Paola) rodando ponta a ponta |
| Semana 3–4 | Sprint 2 — lotes de prompts + Ulisses; check-in na metade |
| Semana 5–6 | Sprint 3 — Salvar/Exportar/Refinar + QA das 37 operações |
| Fim semana 6 | Demo final + retro |

**Item de desbloqueio imediato (antes do Sprint 1):** corrigir o erro TypeScript em `Navbar.tsx:72` (mapa de instruções sem `googleCalendar`, `gmail`, `whatsapp`, `signature`, `helpdesk`) — hoje o build está travado.
