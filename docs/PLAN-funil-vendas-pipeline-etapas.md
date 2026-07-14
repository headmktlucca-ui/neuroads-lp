# PLAN-funil-vendas-pipeline-etapas: Etapas Complementares do Pipeline do Funil de Vendas

Este documento consolida a análise de todas as operações disponíveis dos Agentes IA da NeuroAds e traduz essa análise em um plano de etapas complementares para o pipeline Kanban da tela **Funil de Vendas** (`src/app/hub/funil-vendas/page.tsx`). Cobre o que já foi implementado nesta iteração e o que fica como backlog para as próximas.

---

## 1. Visão Geral (Overview)

O Kanban do Funil de Vendas (`STAGES`: Capturado → Qualificado → Proposta Enviada → Em Fechamento → Ganho) usava apenas 3 dos 9 Agentes do elenco (`src/data/team-agents.ts`): Vitor (SDR), Breno (Closer) e Heitor (Onboarding), com Tainá aparecendo só na ação "Nutrir". O funil terminava em "Ganho" sem continuidade, e não existia estado de perda — todo lead só podia avançar, nunca ser desqualificado, mesmo com o próprio prompt do Vitor prevendo esse cenário ("registrar como não qualificado").

A partir da análise das especialidades de cada Agente (Paola/Tráfego, Laís/Conteúdo, Heitor/Processos, Igor/Dados & SEO, Vitor/SDR, Manu/Suporte, Breno/Closer, Raíssa/Upsell & Reativação, Tainá/Nutrição, Ulisses/Chief of Staff), foram identificadas as lacunas abaixo e priorizadas por impacto × esforço.

---

## 2. Tipo do Projeto (Project Type)

**WEB** (Next.js / React / Firestore — componente client-side `FunilVendasPage`)

---

## 3. Critérios de Sucesso (Success Criteria)

- **Estado de perda real**: leads podem ser marcados como "Perdido" com motivo registrado, e reabertos manualmente.
- **Continuidade pós-venda**: leads "Ganho" podem ser roteados para gestão de conta ativa, acionando Manu (Suporte) e Raíssa (Upsell & Reativação).
- **Diagnóstico com dados reais**: um agente (Heitor) consegue apontar o gargalo do funil a partir do estado real dos leads, sem números fictícios.
- **KPIs consistentes**: os indicadores do topo da página refletem corretamente os novos estados (não contam "Perdido" como negociação ativa, não contam apenas "Ganho" como faturamento fechado).
- Compilação sem erros (`tsc --noEmit`) e lint sem novos warnings no arquivo alterado.

---

## 4. Etapas do Pipeline — Implementadas Nesta Iteração

### 4.1 Coluna "Perdido" (estado terminal fora do fluxo linear)
- Novo tipo `LeadStage` inclui `'perdido'`.
- Botão "Perdido" nos cards de Capturado/Qualificado/Proposta/Em Fechamento (`isPipelineStage(stage) && stage !== 'ganho'`) abre prompt de motivo e move o lead para a coluna, registrando no histórico.
- Botão "Reabrir Oportunidade" no card devolve o lead para "Capturado".
- Campo `lossReason` exibido no modal de detalhes do lead.

### 4.2 Coluna "Cliente Ativo" (continuidade pós-venda — Manu + Raíssa)
- Novo estado `'ativo'`, alcançado a partir de "Ganho" via ação "Ativar Gestão de Conta" (handoff simulado de Ulisses/Chief of Staff coordenando a equipe de Retenção).
- Dentro de "Cliente Ativo": ação "Verificar Saúde do Cliente" (Manu) e "Identificar Upsell" (Raíssa), que atualizam o histórico sem mudar de etapa — mapeiam diretamente para as especialidades reais desses agentes (`Atendimento 24/7`, `Upsell Inteligente`) descritas em `team-agents.ts`.

### 4.3 Diagnóstico de Funil (Heitor)
- Botão "Diagnosticar Funil" no cabeçalho abre modal calculado via `useMemo` sobre o estado real de `leads`: gargalo dominante (coluna com mais leads parados), contagem e valor por etapa, taxa de ganho vs. perda.
- Sem dados fictícios — tudo derivado do Kanban em memória/Firestore do usuário, na linha do princípio já adotado no restante do Hub (commit "Remove all fictional data and demo mode").

### 4.4 KPIs e navegação
- Linha de indicadores expandida de 4 para 6 cards: adicionados "Clientes Ativos" e "Taxa de Perda".
- Recalculo de "Em Negociação" (exclui Ganho/Ativo/Perdido), "Faturamento Fechado" (inclui Ganho + Ativo) e "Ticket Médio" (exclui Perdido) para não distorcer com os novos estados.
- Renderização de coluna extraída para função reutilizável `renderStageColumn`, compartilhada entre o grid principal (5 colunas) e a nova seção "Pós-Venda & Perdas" (2 colunas).

---

## 5. Backlog — Sugestões Ainda Não Implementadas

> [!IMPORTANT]
> Registradas aqui para não se perderem e para alinhar prioridade com o usuário antes da próxima iteração.

1. **Ações do agente com backend real**: hoje todas as operações (`handleExecuteAgentOperation`) são simuladas com `setTimeout` e texto fixo — consistente com o padrão já existente no arquivo, mas divergente do restante do Hub que já usa Server Actions reais (ex.: `src/app/actions/lucca-hub-chat.ts`, usado pelo Prospector Outbound do Vitor). Migrar as ações do funil para chamadas reais é o item de maior impacto para o produto parecer "vivo".
2. **Diagnóstico de Igor no funil**: usar as especialidades "Radar de Oportunidades" e "Diagnóstico de Landing Page" de Igor para sinalizar leads parados há muito tempo em uma etapa (hoje o diagnóstico de Heitor olha só a foto atual, não o tempo parado — falta timestamp de última mudança de etapa por lead).
3. **Atribuição de Paola por origem**: cruzar `originAgent`/canal com dados reais de investimento em mídia (quando os conectores de Google/Meta Ads estiverem integrados) para mostrar CAC real por origem, não só valor do negócio.
4. **Churn de "Cliente Ativo"**: hoje um lead em "Ativo" não pode ser marcado como perdido (churn) — o botão "Perdido" só aparece para as etapas pré-fechamento. Precisa de fluxo próprio de cancelamento, distinto de "oportunidade perdida".
5. **Playbook automatizado para as novas colunas**: o botão "⚡ Run" (playbook) continua restrito às colunas do pipeline principal (`isPipelineStage`); poderia existir um playbook de retenção que dispara health-check em lote para toda a coluna "Cliente Ativo".

---

## 6. Plano de Verificação (executado)

### Automatizado
- `npx tsc --noEmit -p tsconfig.json` — sem erros no arquivo alterado (erros pré-existentes em `HubDashboardLight.tsx` e em testes sem `@types/jest`, não relacionados a esta mudança).
- `npx eslint src/app/hub/funil-vendas/page.tsx` — 0 erros; 4 warnings, todos pré-existentes (imports não usados antes desta mudança).
- `npx next build` — Turbopack compilou o arquivo com sucesso; a etapa de type-check da build falha por um bug pré-existente e não relacionado em `HubDashboardLight.tsx` (referência solta a `isDemo`), fora do escopo desta tarefa.

### Manual (recomendado para o usuário)
1. Abrir `/hub/funil-vendas`, criar um lead novo e clicar em "Perdido" em um card de Capturado — confirmar prompt de motivo e card aparecendo na coluna "Perdido".
2. Clicar em "Reabrir Oportunidade" no card perdido — confirmar retorno para "Capturado".
3. Levar um lead até "Ganho" e clicar em "Ativar Gestão de Conta" — confirmar transição para "Cliente Ativo" e disponibilidade das ações de Manu/Raíssa.
4. Clicar em "Diagnosticar Funil" e conferir se os números batem com a contagem visual das colunas.
5. Conferir os 6 cards de KPI no topo após os passos acima.
