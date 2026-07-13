# Planejamento — Correção dos Indicadores Reais no Dashboard (hub)

**Objetivo:** Fazer os KPIs do Dashboard (`hub/page.tsx` → `HubDashboardLight.tsx`) exibirem os números reais extraídos dos canais que o usuário integrou (Google Ads, Meta Ads, LinkedIn Ads, GA4, Search Console, Instagram, LinkedIn Page), em vez de zeros ou "N/A" persistentes.

---

## 1. Mapa da estrutura atual

```
hub/page.tsx
  └─ HubDashboardLight.tsx  (componente ativo — HubDashboard.tsx é código morto, não é renderizado por nenhuma rota)
       ├─ connections = normalizeConnections(profile.connections)   [lib/connectors.ts]
       ├─ fetch /api/hub/metrics/ga4            (GA4 Data API)
       ├─ fetch /api/traffic/extract            (Google Ads + Meta Ads + LinkedIn Ads, em paralelo)
       ├─ fetch /api/hub/metrics/instagram
       ├─ fetch /api/hub/metrics/linkedin-page
       ├─ fetch /api/hub/metrics/search-console
       └─ stats = useMemo(...) → spend/revenue/roas/conversions/cpa/activeUsers → KPI cards
```

Conexões são gravadas por `persistOAuthConnection()` dentro de `ConnectorsHubPage.tsx` (4437 linhas — tela de Integrações), usando `CONNECTOR_CONNECTION_KEYS` de `lib/connectors.ts` como chave de armazenamento (`google_ads`, `meta_ads`, `linkedin_ads`, `search_console`, `linkedin_page`, `ga4`, `instagram`).

## 2. O que investiguei e **descartei** como causa (evidência no código)

Antes de propor correções, verifiquei três hipóteses óbvias de bug e as **três estão corretas no código atual** — não são a causa:

| Hipótese descartada | Evidência |
|---|---|
| Chaves incompatíveis (`connections.googleAds` vs `connections.google_ads` salvo no Firestore) | `HubDashboardLight.tsx:474` já chama `normalizeConnections()` — a função de `lib/connectors.ts` que traduz corretamente snake_case (Firestore) → camelCase (`ConnectorKey`). Confirmado lendo a implementação de `normalizeConnections` e `CONNECTOR_CONNECTION_KEYS`. |
| `expiresIn`/`expiresAt` nunca gravado, causando token sempre "não expirado" e nunca renovado | `persistOAuthConnection` (ConnectorsHubPage.tsx:1179-1180) grava `expiresAt = now + expiresIn*1000` corretamente, e o callback OAuth (`callback/route.ts:93-95`) repassa `expires_in` do provedor via query string. |
| `GOOGLE_ADS_DEVELOPER_TOKEN` ausente no ambiente | Presente em `.env.local` (não valido se o **valor** é de acesso Basic ou Test — ver risco #1 abaixo, que é uma questão de configuração de conta, não de código). |

Registro isso explicitamente para não desperdiçar um sprint "corrigindo" algo que já funciona.

## 3. Causa raiz confirmada e problemas reais encontrados

### 3.1 — KPIs principais ignoram erros por canal (bug confirmado, maior impacto)

Em `HubDashboardLight.tsx`:
- A rota `/api/traffic/extract` (`src/app/api/traffic/extract/route.ts:198-208`) já captura erro por canal (token inválido, conta não informada, developer token rejeitado, etc.) e retorna `{ spend: 0, impressions: 0, ..., error: "<mensagem real da API>" }` **por canal**, dentro de uma resposta com `success: true` no nível raiz.
- O `useMemo` que calcula `stats` (linhas 588-603) lê **apenas** `trafficData.totals.spend/conversions`, somando os canais **sem checar se algum deles retornou `error`**.
- Resultado: se Google Ads falhar (ex.: developer token em nível "Test Account", conta não compartilhada, token expirado sem refresh — ver 3.2) e Meta Ads funcionar, o KPI de "Investimento" mostra só o valor do Meta, silenciosamente, como se fosse o total real — sem nenhum sinal visual de que uma fonte está quebrada.
- Se **todos** os canais de mídia falharem, o KPI mostra **R$ 0,00**, que é visualmente idêntico a "conectado e sem gasto no período" — exatamente o sintoma relatado ("não apresenta números reais").
- **O dado do erro já existe** (`googleAdsErr`/`metaAdsErr`/`linkedinAdsErr`, linhas 673-675) e é usado para alimentar um card de alertas mais abaixo na página — mas os **KPIs principais no topo não usam a mesma informação**. É uma falha de amarração entre dois blocos de UI que já leem a mesma resposta da API.

### 3.2 — Meta Ads não tem renovação automática de token

`lib/connector-refresh-server.ts:78,104` só implementa renovação server-side para `['ga4','googleAds','searchConsole','warehouse']` (fluxo OAuth padrão do Google) e `['linkedinAds','linkedinPage']` (fluxo do LinkedIn). Para `metaAds`, a função cai no `else` (linha 128-131) e **devolve o token salvo sem tentar renovar**. Tokens de longa duração do Meta expiram (~60 dias) e não seguem o grant `refresh_token` padrão OAuth2 — exigem uma troca específica (`fb_exchange_token`) que hoje não existe no projeto. Qualquer conta Meta Ads conectada há mais de ~2 meses vai falhar silenciosamente (cai no caso 3.1).

### 3.3 — Mensagem de erro do Meta Ads é fixa, não reflete a causa real

Em `HubDashboardLight.tsx:691-700`, quando `metaAdsErr` existe, o alerta sempre mostra o texto fixo *"Erro de Token expirado no Meta"* — independentemente de a API ter retornado outro motivo (permissão insuficiente, conta de anúncio não encontrada, moeda, etc.). Isso engana o diagnóstico: o usuário tenta reautenticar quando o problema pode ser outro (ex.: `accountId` errado).

### 3.4 — Token em texto plano na URL de redirect do OAuth (risco de segurança, fora do escopo do sintoma, mas encontrado na varredura)

`callback/route.ts:86` coloca `connector_access_token` como **query parameter** na URL de redirecionamento — visível em histórico do navegador, logs de proxy/CDN e no `Referer` de eventuais recursos de terceiros carregados na página de destino. Recomendo tratar isso num item de hardening separado (não é a causa do sintoma atual, mas é uma exposição real).

### 3.5 — Risco de configuração de conta (não é código, mas é a causa nº 1 mais comum na prática)

O `GOOGLE_ADS_DEVELOPER_TOKEN` pode estar em nível de acesso **"Test Account"** (padrão do Google ao emitir o token) — nesse nível, a API **rejeita qualquer customer ID que não seja uma conta de teste**, mesmo com OAuth válido. Isso é indistinguível, pelo comportamento observado, dos bugs de 3.1 sem olhar a mensagem de erro real — que é precisamente o que 3.1 esconde hoje. **A correção de 3.1 é pré-requisito para até conseguirmos diagnosticar isso.**

---

## 4. Plano de correção (1 sprint, ~2 semanas)

| Prioridade | Item | O que fazer | Estimativa |
|---|---|---|---|
| P0 | **Fazer os KPIs principais respeitarem erro por canal** | No `useMemo` de `stats` (HubDashboardLight.tsx), quando `googleAdsErr`/`metaAdsErr`/`linkedinAdsErr` existir, excluir aquele canal do somatório de `spend`/`conversions` (em vez de tratá-lo como zero) e sinalizar visualmente o KPI como "parcial" (ex.: badge "2 de 3 canais reportando") em vez de silenciar o problema | 5 pts |
| P0 | **Banner de erro visível acima dos KPIs** | Promover os itens de `alerts` com `severity: 'error'` para um banner fixo no topo do dashboard (não só na lista de atividades), com a mensagem real vinda de `channel.error` — substitui o texto fixo do item 3.3 | 3 pts |
| P0 | **Renovação de token do Meta Ads** | Implementar troca de longo prazo (`GET /oauth/access_token?grant_type=fb_exchange_token`) em `connector-refresh-server.ts`, com o mesmo contrato de retorno dos outros provedores | 5 pts |
| P1 | **Diagnóstico de nível do Developer Token do Google Ads** | Ao detectar erro `PERMISSION_DENIED`/`DEVELOPER_TOKEN_NOT_APPROVED` na resposta do Google Ads (`traffic/extract` já recebe o texto bruto do erro), traduzir para uma mensagem específica e acionável no banner do item acima, em vez do genérico "sem dados de campanhas" | 3 pts |
| P1 | **Remover `HubDashboard.tsx` (código morto)** | Componente não é renderizado por nenhuma rota; mantê-lo só confunde investigações futuras (foi a primeira pista falsa desta análise) | 1 pt |
| P2 | **Segurança: parar de trafegar token na URL de redirect** | Trocar `connector_access_token` na query string por: (a) persistir a conexão direto no callback (mover a escrita do Firestore do client para o server, usando firebase-admin) ou (b) usar um cookie httpOnly de curta duração como ponte até o client consumir e descartar | 5 pts |
| P2 | **Teste com conta real de cada canal** | Validar ponta a ponta a extração real de Google Ads, Meta Ads, LinkedIn Ads, GA4 e Search Console com uma conta conectada de verdade, incluindo o caso "token propositalmente inválido" para confirmar que o banner de erro aparece corretamente | 5 pts |

**Total: ~27 pts**

---

## 5. Definition of Done

- [ ] KPI de Investimento/ROAS/CPA nunca mostra "R$ 0,00" quando na verdade há erro de canal — mostra o valor real dos canais que funcionaram + aviso do que falhou
- [ ] Banner de erro no topo do dashboard mostra a mensagem real da API (não texto fixo genérico)
- [ ] Meta Ads renova token automaticamente antes de expirar
- [ ] `HubDashboard.tsx` removido do repositório
- [ ] Testado com pelo menos 1 conta real por canal (Google Ads, Meta Ads, LinkedIn Ads, GA4)
- [ ] Token de acesso não aparece mais na URL após o OAuth

---

## 6. Observação sobre o pedido original

Notei que o comando recebido veio via `/find-skills`, mas o conteúdo do pedido era uma solicitação de análise + planejamento (padrão `/sprint-planning`). Segui a intenção real do pedido — investigação de código + plano de correção — em vez de buscar uma skill externa, já que a tarefa era claramente sobre o projeto NeuroAds, não sobre "encontrar uma ferramenta".
