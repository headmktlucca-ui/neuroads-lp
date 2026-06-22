# Edição: Hub Dashboard (HubDashboard.tsx)

Arquivo principal: `src/components/hub/HubDashboard.tsx`
Layout: `src/app/hub/layout.tsx`
Sidebar: `src/components/hub/HubSidebar.tsx`

---

## CRÍTICOS — resolver imediatamente

### 1. Empty state destrói o primeiro impacto do produto

Quando o usuário entra no Hub sem nenhum conector ativo, vê:
- 6 KPI cards com "N/A"
- 4 banners amarelos de aviso empilhados no painel direito
- Gráficos vazios

Essa é a pior primeira impressão possível para um novo cliente.

**O que fazer:** criar um componente `HubEmptyState` que substitui o layout principal quando `!isGa4Connected && !isGoogleAdsConnected && !isMetaAdsConnected`. Ele deve:

1. Mostrar uma mensagem de boas-vindas com o nome do usuário
2. Apresentar os 3 passos de conexão como um wizard visual:
   - Passo 1: Conectar GA4
   - Passo 2: Conectar Google Ads / Meta Ads
   - Passo 3: Ver seu painel em tempo real
3. Incluir um preview estático/animado do dashboard populado (como "veja como ficará")
4. CTA direto para `/hub/conectores`

```tsx
// Condição de entrada no HubDashboard.tsx
const hasAnyConnection = isGa4Connected || isGoogleAdsConnected || isMetaAdsConnected;

if (!hasAnyConnection && !loading) {
  return <HubEmptyState />;
}
```

---

### 2. Datas hardcoded nos fetches de métricas

**Localização:** linhas 95–96

```ts
const dateFrom = '2026-05-18';  // ← data fixa
const dateTo = '2026-06-17';    // ← data fixa
```

Após a data `2026-06-17`, o dashboard silenciosamente mostra dados de um período fixo do passado. O usuário não percebe.

**O que fazer:** calcular dinamicamente com base na data atual:

```ts
const today = new Date();
const dateTo = today.toISOString().slice(0, 10);
const dateFrom = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
```

Mover para fora do componente ou usar `useMemo` se precisar recomputar.

---

## MODERADOS — próxima sprint

### 3. Gráfico de tendência é SVG estático com dados hardcoded

**Localização:** linhas 797–846

O "Performance Trend Chart" tem:
- Coordenadas de path hardcoded (`M 20,85 Q 80,65 140,78 T 260,40...`)
- Tooltip fixo `"May 22 ROAS: 8.12x"` (linha 836)
- Labels de eixo X fixos (`May 18`, `May 20`, `May 22`, `May 24`)

Parece dinâmico mas é decorativo — não reflete dados reais de nenhuma conexão.

**O que fazer (opção A — Chart.js):** substituir por um `<canvas>` com Chart.js alimentado por `trafficData`:

```tsx
// Derivar pontos dos dados reais ou mostrar placeholder honesto
// Instalar: já incluído se Chart.js estiver no projeto, senão: npm i chart.js
```

**O que fazer (opção B — remover):** remover a seção de gráfico e expandir o `SalesFunnelWidget` que já usa dados reais. Mais clean, mais honesto.

---

### 4. Segmentos de audiência são dados mock mesmo com GA4 conectado

**Localização:** linhas 693–710

Os segmentos "High Intent Shoppers", "Lookalike 1%", "Cart Abandoners" são hardcoded e sempre aparecem quando `isGa4Connected = true`, independente do que a API real retorna.

**O que fazer:** duas opções:
- **Remover** os segmentos da seção Audience Insights e exibir apenas o que a API GA4 realmente devolve (faixa etária + gênero já chegam da API)
- **Marcar como ilustrativo** com um badge "Estimativa" ou tooltip explicando que são segmentos sugeridos, não dados reais conectados

---

## MENORES — polish

### 5. HubSidebar.tsx é código órfão

O componente `HubSidebar` está implementado com todos os links de navegação mas **nunca é importado ou renderizado** — o `hub/layout.tsx` usa `HubTopNav` em vez disso.

**O que fazer:** decidir a arquitetura de navegação:
- **Manter top nav:** deletar `HubSidebar.tsx` para não acumular código morto
- **Migrar para sidebar:** substituir `<HubTopNav />` no layout por `<HubSidebar />` + ajustar o `<main>` para ter `pl-64` em vez de `pt-[98px]`

---

### 6. Donut de alocação de orçamento é CSS simulado

**Localização:** linhas 1160–1168

Dois `border` sobrepostos e rotacionados tentam simular um gráfico de pizza. Com 5 categorias o resultado visual não transmite as proporções reais.

**O que fazer (opção A):** substituir por um doughnut Chart.js de ~80px de diâmetro:

```tsx
// Canvas de 80x80 com Chart.js doughnut
// Labels como legenda externa (já existe a lista abaixo)
```

**O que fazer (opção B — mais simples):** remover o pseudo-donut e transformar a seção em barras horizontais proporcionais:

```tsx
{budgetAllocationData.map(item => (
  <div>
    <div className="flex justify-between text-xs mb-1">
      <span>{item.label}</span>
      <span>{item.pct.toFixed(1)}%</span>
    </div>
    <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
      <div className="h-full rounded-full" style={{ width: `${item.pct}%`, backgroundColor: item.color }} />
    </div>
  </div>
))}
```

---

### 7. Cor do indicador ativo na sidebar não segue o brand

**Localização:** `HubSidebar.tsx`, linha 115

```tsx
className="... bg-[#09bd3c] shadow-[0_0_8px_rgba(9,189,60,0.7)]"  // verde
```

O brand color da NeuroAds é `#ff6a00` (laranja). A sidebar usa verde para o item ativo enquanto o Dashboard usa laranja como acento em todos os outros elementos.

**O que fazer:** trocar para `#ff6a00` se a sidebar for utilizada, ou deixar como está se o verde for intencional para diferenciar a navegação do conteúdo.

---

## Oportunidades de WoW para o Hub

Além das correções, estas adições aumentariam o impacto percebido:

### A. Widget "Próximas Ações" no topo do dashboard

Uma seção acima dos KPI cards com 2–3 ações recomendadas pela IA baseadas nos dados do usuário:
- "Seu CPL subiu 18% nos últimos 3 dias — revisar segmentação do Meta Ads"
- "Campanha 'Lançamento de Produto' com ROAS 9.78x — aumentar orçamento?"

Isso transforma o dashboard de "relatório passivo" em "consultor ativo".

### B. Mensagem de boas-vindas dinâmica no header

**Localização:** linha 574

O header atual mostra apenas `{profile?.companyName || 'Minha Empresa'}`. Adicionar contexto situacional:

```tsx
// Se ROAS subiu vs período anterior:
"Boa tarde, Lucca — seu ROAS está 12% acima da semana passada."

// Se CPA subiu:
"Atenção: o CPA do Meta Ads aumentou 23% hoje. Clique para ver."
```

---

## Ordem de execução sugerida

| # | Tarefa | Arquivo | Esforço | Impacto |
|---|--------|---------|---------|---------|
| 1 | Corrigir datas hardcoded | `HubDashboard.tsx` L95–96 | 5 min | Crítico |
| 2 | Criar HubEmptyState | novo componente | 3–4h | Alto |
| 3 | Remover ou substituir gráfico de tendência | `HubDashboard.tsx` L797–846 | 2h | Médio |
| 4 | Resolver sidebar órfã (manter ou deletar) | `HubSidebar.tsx` | 30 min | Médio |
| 5 | Corrigir segmentos mock na Audience Section | `HubDashboard.tsx` L693 | 1h | Médio |
| 6 | Substituir donut CSS por barras | `HubDashboard.tsx` L1160 | 45 min | Baixo |
| 7 | Widget "Próximas Ações" | novo componente | 4h | Alto |
