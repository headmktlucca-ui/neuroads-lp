# Design Spec - Lucca Superagente Orquestrador

Data: 2026-05-19  
Status: Aprovado em revisão conversacional (pronto para revisão final do arquivo)

## 1. Objetivo

Transformar o chat do Lucca em um Superagente Orquestrador responsável por:

- acompanhar a execução das atividades autônomas dos agentes ativos;
- notificar imediatamente quando uma automação inicia a execução programada;
- notificar imediatamente quando uma automação conclui totalmente a atividade;
- organizar notificações por prioridade (`baixa`, `média`, `alta`) para facilitar a ação do usuário.

Escopo aprovado:

- canal 1: chat do Lucca no Hub;
- canal 2: central em `/hub/automacoes`.

## 2. Abordagem Arquitetural

Abordagem escolhida: **híbrida (Firestore + motor leve no cliente)**.

Motivos:

- persistência real de eventos operacionais;
- entrega incremental sem introduzir agora um worker dedicado;
- compatibilidade com a estrutura atual de `users/{uid}.automations`.

## 3. Modelo de Dados (Firestore)

Coleção proposta:

- `users/{uid}/automationEvents/{eventId}`

Campos por evento:

- `eventType`: `started | completed | delayed | failed`
- `executionKey`: chave idempotente da execução
- `automationKey`: identificador da automação
- `agentTitle`: nome do agente
- `agentCategory`: categoria do agente
- `scheduledAt`: timestamp previsto
- `startedAt`: timestamp de início real
- `completedAt`: timestamp de conclusão
- `durationMs`: duração da execução
- `impact`: `operational | conversion | revenue`
- `priority`: `low | medium | high`
- `priorityReason`: `default_medium | delayed_over_sla | execution_failed | financial_risk | completed_on_time`
- `status`: `open | acknowledged`
- `message`: texto pronto para render no chat/central
- `createdAt`: timestamp de criação
- `updatedAt`: timestamp da última atualização

Observação de compatibilidade:

- `users/{uid}.automations` continua sendo a fonte para rotinas ativas;
- `automationEvents` entra como trilha operacional e camada de notificação.

## 4. Regras de Prioridade

Regra base aprovada:

- todo evento nasce com prioridade `medium`.

Promoção para `high`:

- evento `failed`;
- evento `delayed` acima do SLA configurado;
- evento com risco de caixa (`impact = revenue`) combinado com atraso ou falha.

Redução para `low`:

- eventos informativos sem criticidade operacional/financeira imediata (ex.: conclusão no prazo sem risco).

## 5. Máquina de Estados Operacional

Transições principais:

1. `scheduled` -> gera evento `started` no início real.
2. `started` -> gera evento `completed` em sucesso.
3. `started` -> gera evento `delayed` quando excede janela esperada.
4. `started | delayed` -> gera evento `failed` em erro definitivo.
5. Evento nasce `open`; após leitura/ação do usuário, vira `acknowledged`.

## 6. Fluxo de Orquestração

1. Camada de monitoramento lê automações `active` do perfil.
2. Detecta mudança de execução e emite evento (`started/completed/delayed/failed`).
3. Calcula prioridade via matriz aprovada.
4. Persiste evento em `automationEvents` com `executionKey`.
5. Chat do Lucca consome eventos `open` e alerta imediatamente.
6. `/hub/automacoes` exibe Central de Notificações com filtros por prioridade e status.
7. Usuário marca item como `acknowledged` quando tratar a pendência.

## 7. Integração nos Arquivos Atuais

Arquivos existentes:

- `src/lib/hub-automations.ts`
- `src/components/hub/LuccaHubSupportWidget.tsx`
- `src/app/hub/automacoes/page.tsx`
- `src/app/hub/agente/[slug]/page.tsx`

Novo arquivo:

- `src/lib/hub-automation-events.ts`

Responsabilidades:

- `hub-automations.ts`: manter parsing atual e adicionar helpers de runtime (due/overdue/tempo de execução).
- `hub-automation-events.ts`: tipagens, normalização, prioridade, idempotência, utilitários de criação/atualização de evento.
- `LuccaHubSupportWidget.tsx`: assinatura de feed de eventos e render de alertas imediatos.
- `/hub/automacoes/page.tsx`: bloco "Central de Notificações" com filtros e ação de reconhecimento.
- `/hub/agente/[slug]/page.tsx`: reutilização da chave da automação e metadados para emissão consistente.

## 8. UX e Mensageria do Lucca

Padrões de mensagem:

- Início: "A automação {nome} iniciou agora. Prioridade média."
- Conclusão: "A automação {nome} concluiu com sucesso."
- Atraso/falha: "A automação {nome} exige atenção imediata. Prioridade alta."

Princípios:

- linguagem curta e acionável;
- foco em impacto operacional e financeiro;
- topo da fila sempre prioriza `high` e `open`.

## 9. Erros, Riscos e Mitigações

Riscos principais:

- duplicidade de eventos por refresh/reconexão;
- descompasso de relógio cliente vs timestamps persistidos;
- ruído excessivo de notificações em alto volume.

Mitigações:

- `executionKey` para idempotência por ciclo;
- fallback robusto de timestamps e ordenação por `createdAt desc`;
- deduplicação por janela curta e limitação de feed recente;
- guard clauses para não emitir evento quando estado não mudou.

## 10. Estratégia de Testes

Unitários:

- classificação de prioridade (`medium` base, promoção para `high`, redução para `low`);
- cálculo de atraso por SLA;
- idempotência via `executionKey`.

Integração:

- geração de eventos a partir de automações ativas;
- render do feed no widget;
- filtro e reconhecimento na central de notificações.

UI/Comportamento:

- início e conclusão aparecendo imediatamente no chat;
- central refletindo eventos em tempo real;
- transição `open -> acknowledged` persistindo após reload.

## 11. Rollout

Fase 1:

- adicionar camada de eventos + tipagem + persistência.

Fase 2:

- conectar widget Lucca para alertas imediatos.

Fase 3:

- adicionar central em `/hub/automacoes` com filtros e reconhecimento.

Fase 4:

- hardening (dedupe, limites de feed, refinamento de mensagens e SLA).

## 12. Critérios de Aceite

Critérios funcionais:

- toda automação ativa dispara notificação de início quando executa;
- toda automação ativa dispara notificação de conclusão ao finalizar;
- eventos com atraso/falha aparecem como prioridade alta;
- usuário consegue filtrar por `baixa/média/alta` e `abertas/reconhecidas`;
- reconhecimento da notificação persiste no Firestore.

Critérios de experiência:

- chat do Lucca exibe alertas operacionais sem atraso perceptível;
- central em `/hub/automacoes` facilita identificação do que precisa ação agora.

Critérios técnicos:

- ausência de eventos duplicados para a mesma execução;
- código compatível com os guards e o modelo atual do Hub;
- lint e type-check sem regressão nos arquivos alterados.

