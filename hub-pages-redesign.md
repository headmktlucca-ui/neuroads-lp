# Redesenho das Páginas do Hub - Plano do Projeto

## Overview
Este projeto consiste em refatorar todas as subpáginas do Hub Estratégico do NeuroAds para seguir a mesma identidade visual e layout do dashboard principal (`/hub`). Atualmente, subpáginas como `/hub/conectores` ou `/hub/laboratorio-agentes` utilizam a barra de navegação pública (`Navbar` e `Footer`) com temas claros e sem a barra lateral `HubSidebar`. Vamos unificar as páginas usando um layout compartilhado Next.js e converter seus componentes e estilos para o tema escuro (dark mode premium).

## Project Type
WEB

## Success Criteria
- O build do projeto completa com sucesso (`npm run build`).
- Todas as 7 subpáginas indicadas carregam sem erros.
- A barra lateral de navegação `HubSidebar` é visível e funcional em todas as subpáginas.
- A imagem de fundo e o tema escuro premium são consistentes em todas as telas sob `/hub`.
- Nenhuma subpágina exibe a `Navbar` ou `Footer` públicas.

## Tech Stack
- React 19 / Next.js 15 (App Router)
- Tailwind CSS
- Lucide React (Ícones)
- Firebase Firestore (Autenticação e estado dos agentes)

## File Structure
- `src/app/hub/layout.tsx` (Novo layout unificado de proteção e estrutura de navegação do Hub)
- `src/app/hub/page.tsx` (Simplificação da página inicial do Hub)
- `src/components/hub/ConnectorsHubPage.tsx` (Ajustes de tema e remoção de Navbar/Footer)
- `src/app/hub/laboratorio-agentes/page.tsx` (Adaptação para o layout compartilhado e tema escuro)
- `src/components/hub/CategoryHubPageShell.tsx` (Restauração com suporte a tema escuro)
- `src/components/hub/CategoryAgentManagementSection.tsx` (Restauração com suporte a tema escuro)
- `src/app/hub/performance/page.tsx` (Correção de imports)
- `src/app/hub/criativos/page.tsx` (Correção de imports)
- `src/app/hub/inteligencia/page.tsx` (Correção de imports)
- `src/app/hub/tecnico/page.tsx` (Correção de imports)
- `src/app/hub/agentes-ativos/page.tsx` (Remoção de Navbar/Footer)
- `src/app/hub/dashboard/page.tsx` (Ajustes de tema escuro e layout)
- `src/app/hub/automacoes/page.tsx` (Conversão para tema escuro e remoção de Navbar/Footer)

## Task Breakdown

### TASK 1: Criar o Layout Compartilhado do Hub
- **Agente**: frontend-specialist
- **Skill**: nextjs-react-expert, clean-code
- **Priority**: P0
- **Dependencies**: Nenhuma
- **INPUT**: `src/app/hub/page.tsx`
- **OUTPUT**: `src/app/hub/layout.tsx`
- **VERIFY**: O arquivo é criado e o build do Next.js compila com sucesso. O layout renderiza o `HubSidebar`, carrega o estado de autenticação e injeta `children`.

### TASK 2: Simplificar a Página Inicial do Hub
- **Agente**: frontend-specialist
- **Skill**: clean-code
- **Priority**: P1
- **Dependencies**: TASK 1
- **INPUT**: `src/app/hub/page.tsx`
- **OUTPUT**: `src/app/hub/page.tsx` simplificado
- **VERIFY**: A página renderiza apenas `<HubDashboard />` sem duplicar a barra lateral ou suporte.

### TASK 3: Redesenhar a Página de Conectores
- **Agente**: frontend-specialist
- **Skill**: frontend-design, clean-code
- **Priority**: P1
- **Dependencies**: TASK 1
- **INPUT**: `src/components/hub/ConnectorsHubPage.tsx`
- **OUTPUT**: Componente atualizado no tema escuro, sem `Navbar`/`Footer`.
- **VERIFY**: A rota `/hub/conectores` exibe o layout escuro premium e a saúde das conexões se integra com o layout.

### TASK 4: Redesenhar o Laboratório de Agentes
- **Agente**: frontend-specialist
- **Skill**: frontend-design, clean-code
- **Priority**: P1
- **Dependencies**: TASK 1
- **INPUT**: `src/app/hub/laboratorio-agentes/page.tsx`
- **OUTPUT**: Página adaptada para o layout compartilhado e tema escuro.
- **VERIFY**: A rota `/hub/laboratorio-agentes` funciona no tema escuro sem Navbar/Footer.

### TASK 5: Restaurar e Estilizar CategoryHubPageShell e CategoryAgentManagementSection
- **Agente**: frontend-specialist
- **Skill**: frontend-design, clean-code
- **Priority**: P1
- **Dependencies**: TASK 1
- **INPUT**: Arquivos na pasta `scratch/` obtidos do git history.
- **OUTPUT**: `src/components/hub/CategoryHubPageShell.tsx` e `src/components/hub/CategoryAgentManagementSection.tsx` adaptados para o tema escuro.
- **VERIFY**: As páginas de categorias (/performance, /criativos, /inteligencia) voltam a compilar e exibem seus agentes correspondentes no tema escuro.

### TASK 6: Redesenhar as Páginas de Agentes Ativos e Dashboard Interno
- **Agente**: frontend-specialist
- **Skill**: frontend-design, clean-code
- **Priority**: P1
- **Dependencies**: TASK 1
- **INPUT**: `src/app/hub/dashboard/page.tsx` e `src/app/hub/agentes-ativos/page.tsx`
- **OUTPUT**: Páginas adaptadas para o layout compartilhado e estilizadas no tema escuro.
- **VERIFY**: A rota `/hub/agentes-ativos` exibe os agentes ativos com o tema escuro sem Navbar/Footer.

### TASK 7: Redesenhar a Página de Automações
- **Agente**: frontend-specialist
- **Skill**: frontend-design, clean-code
- **Priority**: P1
- **Dependencies**: TASK 1
- **INPUT**: `src/app/hub/automacoes/page.tsx`
- **OUTPUT**: Página adaptada para o layout escuro.
- **VERIFY**: A rota `/hub/automacoes` exibe a lista de automações ativas com o tema escuro e sem Navbar/Footer.

## Phase X: Verification
- Executar `npm run lint` para garantir integridade estática do código.
- Executar `npm run build` para garantir que o Next.js constrói a aplicação de produção sem erros de importação ou tipagem.
- Verificar visualmente no navegador se não há elementos com cores de texto claras em fundos claros ou quebras de contraste.
- Garantir que o "Purple Ban" (não usar tons de violeta/roxo genéricos) é respeitado.
