# CODEBASE.md — Mapa de Dependências NeuroAds

> Documento de referência rápida para agentes IA. Leia antes de modificar qualquer arquivo.
> Última atualização: 2026-06-22

---

## 🏗️ Stack

- **Framework:** Next.js 15 (App Router, `src/` directory)
- **CSS:** TailwindCSS v4 — configuração em `src/app/globals.css` via `@theme`
- **Auth + DB:** Firebase Auth + Firestore (`src/lib/firebase.ts`)
- **Pagamentos:** Stripe (`src/data/stripe-agent-price-ids.json`)
- **Animações:** Framer Motion
- **Fontes:** Inter (UI) + Manrope (Headings) via `next/font/google` em `layout.tsx`
- **Linguagem:** TypeScript strict

---

## 🎨 Design System

**Arquivo central:** `src/app/globals.css`

### Tokens da Landing Page (modo light)
| Token CSS | Valor | Uso |
|-----------|-------|-----|
| `--primary` | `#FF4D00` | CTA laranja principal |
| `--primary-h` | `#E64500` | Hover do CTA |
| `--charcoal` | `#0A0A0A` | Texto principal |

### Padrão Visual do Hub (modo dark — valores arbitrários ainda)
| Cor | Valor | Uso |
|-----|-------|-----|
| Fundo geral | `#08101e` | `bg-[#08101e]` no body do Hub |
| Cards | `#0d1a2a` | `bg-[#0d1a2a]/40` com opacidade |
| Cards alternativo | `#071a2e` | Usado no Dashboard |
| Borda padrão | `white/[0.08]` | `border-white/[0.08]` |
| Laranja Hub | `#FF6A00` | Acentos, bordas de destaque |

> ⚠️ **Gap:** Esses valores não estão em tokens do `@theme` ainda. Usar os valores acima ao editar arquivos do Hub para manter consistência.

### Padrão de Botões (Touch Targets)
- **CTA Primário:** `h-11` (44px) + `rounded-[12px]` + `px-6`
- **Botão Secundário:** `h-11` + `rounded-[12px]` + `border border-white/10 bg-white/5`
- **Botão Destrutivo:** `h-11` + `rounded-[12px]` + `border-[#FF4D4D] bg-[#FF4D4D]`
- **Nunca** use `h-9` ou `h-10` em CTAs do Hub (viola touch target mobile de 44px)

### Padrão de Cards
- **Seções grandes:** `rounded-3xl border border-[#FF6A00]/20 bg-[#0d1a2a]/40 backdrop-blur-md`
- **Cards médios:** `rounded-2xl border border-white/[0.08] bg-[#051120]/60`
- **Hover de card:** `hover:border-[#FF6A00]/40 hover:bg-[#0d1a2a]/70`

---

## 📁 Mapa de Arquivos por Feature

### Auth e Acesso
| Arquivo | Responsabilidade |
|---------|-----------------|
| `src/context/AuthContext.tsx` | Provider global de auth, expõe `user`, `profile`, `loading`, `premiumSyncing` |
| `src/lib/firebase.ts` | Inicialização do Firebase client-side |
| `src/lib/firebase-admin.ts` | Firebase Admin para Server Actions |
| `src/lib/hub-access.ts` | `resolveHubAccessState()` — lógica de acesso ao Hub |
| `src/lib/hub-profile.ts` | CRUD de perfil de usuário no Firestore |
| `src/app/login/` | Página de login |
| `src/app/cadastro/` | Página de cadastro |
| `src/app/onboarding/` | Fluxo pós-cadastro / pós-checkout |

### Agentes
| Arquivo | Responsabilidade |
|---------|-----------------|
| `src/data/agents.ts` | **Fonte de verdade** do catálogo (20 agentes, tipagem `Agent`) |
| `src/lib/hub-agents.ts` | `getAgentBySlug()`, `slugifyAgentTitle()`, `getContractedAgentsFromProfile()` |
| `src/lib/agent-status-cache.ts` | Cache local (localStorage) do status de ativação de agentes |
| `src/lib/agent-report-history.ts` | CRUD do histórico de relatórios no Firestore |
| `src/lib/agent-prompts.ts` | Prompts base para chamadas de IA dos agentes |
| `src/lib/prompt-master.ts` | Prompt mestre compartilhado entre agentes |

### Workspaces de Agentes (em `src/components/agents/`)
| Componente | Agente |
|-----------|--------|
| `TrafficAnalystWorkspace` | Analista de Tráfego |
| `RoasSimulatorWorkspace` | Simulador de ROAS |
| `FunnelPredictorWorkspace` | Preditor de Funil |
| `WasteAuditorWorkspace` | Auditor de Desperdício |
| `BudgetOptimizerWorkspace` | Otimizador de Orçamento |
| `CreativeGeneratorWorkspace` | Gerador de Criativos |
| `ConversionCopyWorkspace` | Gerador de Copies de Conversão |
| `CreativeAnalysisWorkspace` | Análise Viral |
| `LandingPageDiagnosisWorkspace` | Diagnóstico de Landing Page |
| `DnaBrandWorkspace` + `DnaBrandPresentationPanel` | DNA da Marca |
| `SeoGeoWorkspace` | SEO & GEO |
| `GenericAgentWorkspace` | Fallback para agentes sem workspace específico |

> ⚠️ **O roteamento para cada Workspace está em `src/app/hub/agente/[slug]/page.tsx`** via cadeia `if/else if` (1.252 linhas). Para adicionar um novo workspace, adicionar o import e o bloco `else if` neste arquivo.

### Conectores / Integrações
| Arquivo | Responsabilidade |
|---------|-----------------|
| `src/lib/connectors.ts` | Tipagem `ConnectorKey`, `CONNECTOR_DEFINITIONS[]`, `getConnectorStatusFromConnections()` |
| `src/lib/connector-auth.ts` | Fluxo OAuth para Google Ads, Meta Ads, GA4, etc. (26KB) |
| `src/app/hub/conectores/` | Página de gerenciamento de conectores |
| `src/app/hub/integracoes/` | Visão geral do status das integrações |

### Automações
| Arquivo | Responsabilidade |
|---------|-----------------|
| `src/lib/hub-automations.ts` | `buildAutomationTimestamps()`, scheduling |
| `src/lib/hub-automation-events.ts` | Eventos de automação |

### Stripe / Pagamentos
| Arquivo | Responsabilidade |
|---------|-----------------|
| `src/data/stripe-agent-price-ids.json` | Mapa de agente → Stripe Price ID |
| `src/data/stripe-offers.json` | Ofertas e planos |
| `src/data/agent-pricing.ts` | Preços dos planos |
| `src/lib/stripe-session-verifier.ts` | Verificação de checkout completado |

### Landing Page (Público)
| Arquivo | Responsabilidade |
|---------|-----------------|
| `src/app/page.tsx` | Entry point — renderiza `Suggestion5LandingPage` |
| `src/components/neuroads/Suggestion5LandingPage.tsx` | **LP ativa** (1.509 linhas) |
| `src/components/layout/PublicTopNav.tsx` | Nav pública com hamburger mobile |
| `src/components/neuroads/TemplateLandingPage.tsx` | Template alternativo (não ativo) |

### Hub Layout e Navegação
| Arquivo | Responsabilidade |
|---------|-----------------|
| `src/app/hub/layout.tsx` | Auth guard + `HubTopNav` + `HubFooter` |
| `src/components/hub/HubTopNav.tsx` | Nav interna do Hub |
| `src/components/hub/HubFooter.tsx` | Footer do Hub |
| `src/components/hub/LuccaHubSupportWidget.tsx` | Widget de suporte flutuante |

### Páginas do Hub
| Rota | Arquivo |
|------|---------|
| `/hub/dashboard` | `src/app/hub/dashboard/page.tsx` (531 linhas) |
| `/hub/laboratorio-agentes` | `src/app/hub/laboratorio-agentes/page.tsx` (676 linhas) |
| `/hub/agentes-ativos` | `src/app/hub/agentes-ativos/page.tsx` — usa mesmo componente do dashboard |
| `/hub/explorar` | `src/app/hub/explorar/page.tsx` (265 linhas) |
| `/hub/integracoes` | `src/app/hub/integracoes/page.tsx` (195 linhas) |
| `/hub/assistente-ia` | `src/app/hub/assistente-ia/page.tsx` |
| `/hub/automacoes` | `src/app/hub/automacoes/page.tsx` |
| `/hub/agente/[slug]` | `src/app/hub/agente/[slug]/page.tsx` (**1.252 linhas — CUIDADO**) |

---

## 🔑 Padrões de Código Obrigatórios

### 1. Leitura de Auth
```typescript
// ✅ Sempre assim
const { user, profile, loading } = useAuth();
if (!user) return null; // ou loading state

// ❌ Nunca assumir que user existe sem checar
```

### 2. Write no Firestore
```typescript
// ✅ Sempre com merge: true para não sobrescrever campos
const db = getFirebaseDb();
await setDoc(doc(db, 'users', user.uid), { ... }, { merge: true });
```

### 3. Status de Agentes no Firestore
```typescript
// Estrutura do perfil no Firestore:
profile.activeAgents = {
  [agentTitle]: {
    isActive: boolean,
    planName: string,        // 'Growth', 'Scale', etc.
    monthlyLimit: number,    // execuções por mês
    usageUsed: number,
    updatedAt: number,       // timestamp
  }
}
```

### 4. Conexões OAuth no Firestore
```typescript
// Estrutura das conexões:
profile.connections = {
  googleAds: ConnectorConnection | null,
  metaAds: ConnectorConnection | null,
  ga4: ConnectorConnection | null,
  // ... ver ConnectorKey em src/lib/connectors.ts
}
```

### 5. Novo Agente no Catálogo
Criamos uma automação para agilizar a criação de agentes!

Para adicionar um novo agente com Workspace funcional próprio, basta rodar no terminal:
\`\`\`bash
npm run create-agent "Nome do Agente"
\`\`\`

**O que o script faz automaticamente:**
1. Cria o componente funcional base em `src/components/agents/[NomeAgente]Workspace.tsx`.
2. Registra o agente e importa o componente no `src/lib/agent-workspace-registry.ts`.
3. Insere um modelo de dados base (title, descriptions, heroDescription, conectores e ícone) no final de `src/data/agents.ts`.

**Passos manuais restantes:**
1. Personalize os textos e conectores recém-criados no final de `src/data/agents.ts`.
2. Construa a UI interativa abrindo o `src/components/agents/[NomeAgente]Workspace.tsx`.
3. Adicione o Price ID em `src/data/stripe-agent-price-ids.json` (apenas se for vender o agente separadamente).

---

## ⚡ Comandos Úteis

```bash
# Desenvolvimento
npm run dev                                    # Inicia em localhost:3000

# Qualidade
python .agent/scripts/checklist.py .          # Auditoria rápida
python .agent/scripts/verify_all.py . --url http://localhost:3000  # Auditoria completa

# Scripts específicos
python .agent/skills/mobile-design/scripts/mobile_audit.py src/
python .agent/skills/seo-fundamentals/scripts/seo_checker.py .
```
