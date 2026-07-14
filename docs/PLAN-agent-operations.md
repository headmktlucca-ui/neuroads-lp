# Plano de Implementação — Otimização de Operações e Layout do Dashboard

Plano detalhado para remoção do campo de busca do cabeçalho, alteração dos chips de início de chat para "Sugestões:" e automatização da execução de operações por agente com análise real de conexões.

## User Review Required

> [!IMPORTANT]
> **Execução Automática de Operações:** Ao clicar em "Executar: [Operação]", o chat não apresentará mais formulários manuais estáticos para o usuário. Ele iniciará automaticamente a análise coletando o estado real das conexões integradas do Firestore.

> [!WARNING]
> **Parâmetros Dinâmicos:** Operações que dependiam de entradas específicas (como "URL da Landing Page" ou "Ticket Médio") agora farão a varredura automática no perfil cadastrado do usuário. Caso os dados não sejam localizados, o agente solicitará de forma conversacional e dinâmica após o primeiro retorno.

---

## Open Questions

> [!IMPORTANT]
> **Questão 1:** Para canais desconectados durante o auto-run das operações, devemos exibir uma mensagem descritiva solicitando a conexão ou apresentar um resumo com dados simulados/demo claramente identificados para fins de demonstração?
> *Opção recomendada:* Apresentar dados simulados/demo identificados como "Simulação (Canal Inativo)" para que o usuário conheça os relatórios, acompanhado de um aviso sugerindo a integração real.

> [!IMPORTANT]
> **Questão 2:** Deseja que a remoção do input de busca "Buscar no Hub..." seja mantida apenas no Dashboard principal, ou em toda a estrutura do Hub (layout comum)?
> *Opção recomendada:* Remover do layout comum `layout.tsx` para manter o cabeçalho limpo em todo o ecossistema do Dashboard.

---

## Proposed Changes

### Dashboard Layout

#### [MODIFY] [layout.tsx](file:///c:/Users/claud/OneDrive/Documentos/NeuroAds/LP/src/app/hub/layout.tsx)
- Remover o bloco do elemento de busca `<div className="flex items-center gap-2.5 flex-1 max-w-xs ...">...</div>` localizado na barra superior do layout de desktop (linhas 803-806).

---

### Assistente IA Chat

#### [MODIFY] [page.tsx](file:///c:/Users/claud/OneDrive/Documentos/NeuroAds/LP/src/app/hub/assistente-ia/page.tsx)
- Alterar o texto do cabeçalho de chips de recomendação de `"Próximos passos"` para `"Sugestões:"` (linha 1844).
- Substituir a validação/renderização de formulários manuais de especialidade para realizar a auto-execução imediata.
- Configurar o `useEffect` de carregamento de `specialtyTitle` para disparar a ação de chat correspondente à operação de forma assíncrona assim que a especialidade for ativada (similar ao fluxo existente do "DNA da Marca").

---

### AI Chat Engine

#### [MODIFY] [lucca-hub-chat.ts](file:///c:/Users/claud/OneDrive/Documentos/NeuroAds/LP/src/app/actions/lucca-hub-chat.ts)
- Atualizar a instrução do prompt de sistema para lidar com execuções automáticas de operações.
- Ajustar a IA para retornar:
  1. Status de conexões reais identificadas no contexto.
  2. Resumo executivo dos últimos 30 dias com base nas APIs de canais autenticados (GA4, Google Ads, Meta Ads, Search Console) ou dados consolidados em cache.
  3. Uma pergunta de fechamento solicitando ao usuário quais detalhes/filtros adicionais ele deseja aplicar.

---

## Verification Plan

### Automated Tests
- Executar `npm run build` para garantir integridade estrutural e tipagem TypeScript.
- Executar `npx eslint src/app/hub/layout.tsx src/app/hub/assistente-ia/page.tsx src/app/actions/lucca-hub-chat.ts` para conformidade de lint.

### Manual Verification
- Clicar nas operações de especialidade (ex: "Executar: Analista de Tráfego") no menu de início e validar o início automático do carregamento e resposta.
- Verificar o desaparecimento do campo de busca na barra superior do Dashboard.
