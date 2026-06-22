# Edição: Landing Page (Suggestion5LandingPage.tsx)

Arquivo: `src/components/neuroads/Suggestion5LandingPage.tsx`

---

## CRÍTICOS — resolver imediatamente

### 1. Depoimentos nunca renderizados (dead code)

O array `testimonials` (linha 42) tem 3 depoimentos completos com nome, cargo e avatar — mas nenhum JSX os exibe em nenhum momento da página.

**O que fazer:** criar uma seção `<section>` entre "Segmentos Impactados" e o "FAQ", renderizando os 3 cards de depoimento. Sugestão de layout: grid de 3 colunas no desktop, stack no mobile. Cada card com foto, quote em destaque, nome e cargo.

Dados prontos no código:
```ts
{ quote, name, role, avatar } // Flávio Almeida, Bruno Ribeiro, Emanuel Silva
```

---

### 2. Página termina sem CTA de fechamento

Após o FAQ a página encerra. Nenhum CTA ou seção de fechamento. Usuário que chegou ao fim da jornada fica sem destino.

**O que fazer:** adicionar uma seção antes do `</main>` de fechamento com:
- Headline emocional (ex: "Pronto para transformar cada real investido em resultado mensurável?")
- CTA primário: "Agendar diagnóstico gratuito" → abre o chat Lucca
- CTA secundário outline: "Explorar o Hub" → `/hub`
- Background com gradiente sutil para diferenciar visualmente do FAQ

---

### 3. Link do WhatsApp com número placeholder

**Localização:** linha 1210

```tsx
href="https://wa.me/5511999999999"  // ← número falso em produção
```

**O que fazer:** substituir pelo número real do WhatsApp comercial da NeuroAds.

---

## MODERADOS — próxima sprint

### 4. Headline do hero pequena demais

**Localização:** linha 343

```tsx
className="text-[40px] font-black leading-[1.08]..."
```

40px é modesto para uma LP de alto impacto. Páginas que geram efeito WoW no primeiro scroll começam em 60–72px desktop.

**O que fazer:**
```tsx
className="text-[42px] md:text-[58px] lg:text-[68px] font-black leading-[1.05]..."
```
Reduzir `max-w` do parágrafo de suporte de 520px para 480px para compensar o headline maior.

---

### 5. Hero sem prova social above the fold

Nenhum número, logo ou prova social visível sem scrollar. O visitante vê apenas headline + CTA, sem âncora de credibilidade.

**O que fazer:** adicionar logo abaixo do CTA (dentro do bloco de badges), antes do `border-t`:

```tsx
<div className="flex items-center gap-4 text-xs text-white/50 pt-1">
  <span className="font-bold text-white/70">25+ empresas</span>
  <span>·</span>
  <span>R$ 2M+ em mídia gerenciada</span>
  <span>·</span>
  <span className="text-emerald-400 font-bold">ROAS médio 7.5x</span>
</div>
```

Ou uma row de logos de clientes (5–6 logos em cinza com opacity 40%).

---

### 6. Apenas 1 CTA de alto compromisso no hero

"Fale com um especialista" exige alta intenção de compra. Usuários em fase de descoberta não convertem aqui e saem sem alternativa.

**O que fazer:** adicionar CTA secundário logo abaixo do botão primário:

```tsx
<Link
  href="/hub"
  className="w-full justify-center inline-flex items-center gap-2 rounded-full border border-white/20 hover:border-white/40 transition-all px-8 py-3.5 text-[13px] font-bold text-white/80 hover:text-white"
>
  Explorar o Hub
  <ArrowRight size={14} />
</Link>
```

---

## MENORES — polish

### 7. Feature badges com leitura invertida no hero

**Localização:** linhas 374–401

Os badges (texto → ícone, alinhado à direita) têm ordem de leitura não convencional. O padrão esperado é ícone → texto.

**O que fazer:** avaliar se o alinhamento direito é proposital (harmonia com a sidebar direita). Se não for intencional, trocar a ordem dentro de cada `flex items-center gap-3`:

```tsx
// Atual: <div> texto </div> + <span> ícone </span>
// Proposto: <span> ícone </span> + <div> texto </div>
// E remover justify-end / text-right
```

---

### 8. Seção "Agentes em Destaque" sem CTA interno por card

Os 8 cards de agentes (linha 703) têm "Usar Agente" linkando todos para `/agentes-ia`. Falta diferenciação — todos têm o mesmo destino.

**O que fazer (opcional):** se cada agente tiver uma página própria, usar `agent.href` individualmente. Se não, considerar trocar "Usar Agente" por "Ver detalhes" ou remover o link e usar apenas o botão "Explorar todos" já existente no header da seção.

---

## Ordem de execução sugerida

| # | Tarefa | Esforço | Impacto |
|---|--------|---------|---------|
| 1 | Corrigir link WhatsApp | 2 min | Crítico |
| 2 | Renderizar seção de depoimentos | 1h | Alto |
| 3 | Adicionar CTA de fechamento | 45min | Alto |
| 4 | Aumentar headline do hero | 10min | Médio |
| 5 | Adicionar prova social no hero | 20min | Médio |
| 6 | Adicionar CTA secundário no hero | 15min | Médio |
| 7 | Revisar ordem dos badges | 20min | Baixo |
