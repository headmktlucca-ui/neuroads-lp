# MEMÓRIA DO PROJETO - Neuroads LP

## 1. REGRAS DURAS

- **NUNCA** fazer commits diretamente na branch `main` — todo trabalho vai em branches de feature e passa por PR
- **NUNCA** expor chaves de API, secrets ou variáveis de ambiente no código-fonte; use `process.env.*`
- **NUNCA** usar `var` — apenas `const` e `let`
- **NUNCA** remover ou alterar as regras do Firestore (`firestore.rules`) sem revisar o impacto de segurança
- **NUNCA** fazer deploy sem rodar `npm run lint` e `npm run build` localmente antes
- **NUNCA** usar `any` no TypeScript sem justificativa explícita em comentário
- **NUNCA** instalar dependências desnecessárias — a bundle size impacta diretamente o performance de landing page
- **NUNCA** commitar arquivos `.env`, `.env.local` ou qualquer arquivo com credenciais reais
- **NUNCA** usar `console.log` em produção sem passar pelo módulo `src/lib/observability.ts`
- **NUNCA** criar rotas de API sem validar a origem/autenticação adequadamente

## 2. STACK TÉCNICA

### Frontend
- **Next.js** 16.2.1 com App Router (não Pages Router)
- **React** 19.2.4
- **TypeScript** 5 (modo strict habilitado)
- **Tailwind CSS** v4 via PostCSS (`@tailwindcss/postcss`)
- **Fontes:** Inter (UI geral), Manrope (headings) via Google Fonts

### Animações & Efeitos 3D
- **Framer Motion** 12.38.0 — animações de componentes React
- **GSAP** 3.15.0 — animações de timeline complexas
- **Lenis** 1.3.23 — scroll suave (`src/hooks/useLenisScroll.ts`)
- **Three.js** 0.184.0 + **React Three Fiber** 9.6.1 + **Drei** 10.7.7 — canvas 3D neural

### Backend & Integrações
- **Firebase** 12.11.0 (Auth via Google, Firestore como banco principal)
- **OpenAI** 6.33.0 (GPT-4o para suíte criativa)
- **@google/generative-ai** 0.24.1 (Gemini)
- **Stripe** 22.0.1 (pagamentos e billing de agentes)
- **Nodemailer** 8.0.5 (envio de e-mails via `src/lib/mail.ts`)

### Utilitários
- **clsx** 2.1.1 + **tailwind-merge** 3.5.0 — composição de classes CSS
- **Lucide React** 1.7.0 — ícones

### Alias de paths
```
@/* → ./src/*
```
Sempre use imports absolutos com `@/` ao referenciar código em `src/`.

## 3. PERFIL DO NEGÓCIO

**Neuroads** é uma plataforma SaaS B2B de marketing de performance + automação com IA para anunciantes brasileiros. O produto combina:

1. **Landing Page pública** — conversão de novos clientes (home `/`, páginas `/agentes-ia/*`, `/servicos/*`, `/a-neuroads/*`)
2. **Hub de Agentes IA** (`/hub/*`) — área logada onde clientes ativam e configuram agentes de IA para aquisição, conversão e inteligência de dados
3. **Suíte Criativa** (`/hub/criativos`) — geração de criativos, copies e ganchos virais via OpenAI
4. **Painel Admin** (`/admin`) — controle interno (CRM customizado, desk executivo Lucca)
5. **Integrações** — Google Ads (OAuth), WhatsApp webhook, e-mail inbound, Hostinger VPS

**Usuários:** Empresas e agências que anunciam no Google/Meta e querem automatizar tráfego e conversão.

**Modelo de receita:** Assinatura mensal por agente/tier (Freemium → Premium). Billing via Stripe com catálogo de preços em `src/data/stripe-agent-price-ids.json`.

**Domínio de produção:** `neuroads.com.br` (e subdomínios `*.neuroads.com.br`)

## 4. PADRÕES DE CÓDIGO

### Nomenclatura
- **Componentes React:** PascalCase → `AgentCard.tsx`
- **Variáveis e funções:** camelCase → `agentConfig`, `getAgentById`
- **Arquivos de configuração e utilitários:** kebab-case → `hub-agents.ts`, `admin-auth.ts`
- **Server Actions:** arquivo com sufixo descritivo em `src/app/actions/` → `creative-suite.ts`

### Estrutura de componentes
- Componentes em `src/components/<domínio>/NomeComponente.tsx` (arquivo único, não pasta)
- Sections da landing page ficam em `src/components/sections/`
- Componentes de layout global ficam em `src/components/layout/`

### TypeScript
- Interfaces e types no topo do arquivo, antes do componente
- Preferir `interface` para props de componentes, `type` para unions/aliases
- Server Actions devem ter retorno tipado explicitamente

### Server Actions vs API Routes
- Use **Server Actions** (`src/app/actions/`) para operações de formulário e mutations acionadas pelo cliente
- Use **API Routes** (`src/app/api/`) apenas para webhooks externos (Stripe, WhatsApp), OAuth callbacks e endpoints que precisam de resposta HTTP raw

### Estilização
- Tailwind classes direto no JSX — não criar CSS modules separados
- Para composição condicional de classes, sempre usar `clsx` + `twMerge` (importar de `src/lib/utils` ou usar inline)
- Animações complexas de entrada/saída com Framer Motion; tweens e timelines com GSAP

### Acessibilidade
- O hook `src/hooks/usePrefersReducedMotion.ts` DEVE ser respeitado em todas as animações — desativar efeitos quando `prefersReducedMotion === true`

## 5. ROTINA

### Desenvolvimento local
```bash
npm run dev          # Inicia servidor de desenvolvimento (porta 3000 por padrão)
npm run lint         # Verifica erros de ESLint
npm run build        # Build de produção (rodar antes de qualquer PR)
npm run start        # Servidor de produção local (após build)
```

### Operações & Stripe
```bash
npm run ops:check-prod-assets    # Verifica integridade dos assets de produção
npm run stripe:sync-agents       # Sincroniza catálogo de agentes no Stripe
npm run stripe:seed-offers       # Reseta e popula ofertas no Stripe (CUIDADO: destrutivo em prod)
```

### Variáveis de ambiente obrigatórias (`.env.local`)
```
# Firebase (cliente)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Servidor
OPENAI_API_KEY=
STRIPE_SECRET_KEY=
GOOGLE_ADS_CLIENT_ID=
GOOGLE_ADS_CLIENT_SECRET=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Deploy
- Plataforma alvo: **Hostinger VPS** — ver `DEPLOY_HOSTINGER.md` para procedimento completo
- Middleware (`src/middleware.ts`) define headers de cache: HTML sem cache (`no-store`), assets estáticos com cache longo
- Após deploy, rodar `npm run ops:check-prod-assets` para validar integridade

### Git flow
- Branch `main` → produção (protegida)
- Branches de feature: `feature/<descricao>` ou `fix/<descricao>`
- PRs obrigatórios para merge em `main`

## 6. ANTI-REPETIÇÃO (Decisões Arquiteturais Definitivas)

- **Banco de dados:** Firebase Firestore — não sugerir PostgreSQL, MySQL, Prisma ou qualquer SQL
- **Autenticação:** Firebase Auth (Google OAuth) — não trocar por NextAuth, Clerk ou Auth.js
- **Pagamentos:** Stripe — não sugerir Paddle, Hotmart ou outros
- **State management:** React Context API (`src/context/AuthContext.tsx`) — não adicionar Redux, Zustand ou Jotai
- **Estilos:** Tailwind CSS v4 — não adicionar styled-components, Emotion ou CSS Modules
- **Icons:** Lucide React — não adicionar react-icons, heroicons ou outros pacotes de ícone
- **Email:** Nodemailer (`src/lib/mail.ts`) — não adicionar Resend, SendGrid ou similares
- **App Router:** toda nova rota deve usar App Router (não Pages Router) com `page.tsx` e `layout.tsx`
- **Animações 3D:** o canvas neural em `/interativo` usa React Three Fiber + Three.js — não reescrever com WebGL puro ou babylon.js
- **Scroll suave:** Lenis (`src/hooks/useLenisScroll.ts`) — não adicionar locomotive-scroll ou scroll-behavior CSS

## 7. LINGUAGEM

### Termos do domínio (use sempre estes, nunca sinônimos)
- **Agentes** (não "bots", "assistentes" ou "ferramentas") — referência aos produtos de IA da Neuroads
- **Hub** (não "painel", "dashboard" ou "área do cliente") — a área logada principal
- **Suíte Criativa** (não "gerador" ou "criador") — módulo de geração de criativos com IA
- **Tráfego** (não "ads", "anúncios" em contextos técnicos) — tráfego pago gerenciado
- **Membros** (não "clientes", "usuários" ou "assinantes") — usuários logados com plano ativo
- **Lucca** — nome da IA executiva da Neurados (não "assistente", "bot" ou "chatbot")

### Idioma do código
- Nomes de variáveis, funções e componentes: **inglês**
- Strings visíveis ao usuário, comentários explicativos e documentação: **português brasileiro**

### Termos proibidos
- Não usar "cliente" para se referir a Membros
- Não usar "dashboard" no texto de UI — usar "Hub" ou nome específico da seção
- Não usar "chatbot" — usar "agente" ou "Lucca"
