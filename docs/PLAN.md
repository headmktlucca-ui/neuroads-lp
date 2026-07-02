# PLAN.md - Plano de Orquestração de Agentes (Ajustes da Página de Teste)

Este documento estabelece o plano de arquitetura e implementação para os ajustes finos de layout, remoção de elementos e nova interatividade de perfis de Agente na página `/temp-lp`.

---

## 🤖 Agentes e Papéis Selecionados
1. **`project-planner` (Planejador):** Estruturação de tarefas, alinhamento técnico e validação de requisitos.
2. **`frontend-specialist` (Desenvolvedor Front-end):** Implementação de layouts Light Neumorphism, integração de assets e lógica de estados interativos com Framer Motion.
3. **`test-engineer` (Engenheiro de Teste):** Execução de builds e verificação automática da integridade da aplicação.

---

## Proposed Changes

### [Componentes de UI & Animação]

#### [MODIFY] [radial-orbital-timeline.tsx](file:///c:/Users/claud/OneDrive/Documentos/NeuroAds/LP/src/components/ui/radial-orbital-timeline.tsx)
- **Remover Centro Fixo:** Remover o círculo branco central atual e o bloco de texto `"NEUROADS"` que fica abaixo dele.
- **Inserir Nova Imagem:** Centralizar a imagem `logo-heartbeat.png` (Anexo 02) exatamente na mesma posição central da órbita.
- **Bubble Click Event:** Garantir que o evento de clique de cada órbita propague para o pai a fim de atualizar o perfil ativo, usando a prop `onActiveItemChange`.

#### [MODIFY] [page.tsx](file:///c:/Users/claud/OneDrive/Documentos/NeuroAds/LP/src/app/temp-lp/page.tsx)
- **Ajustes de CTA (Anexo 04):**
  - Adicionar o texto `"Experimente por 14 dias sem custos."` logo abaixo do botão `"Ativar meu ecossistema"`.
  - Remover o botão secundário `"Ver agentes em ação"`.
  - Remover a seção de indicadores de métricas rápidas (`+312% ROI`, `10 Agentes`, `24/7`).
- **Implementação do Card de Perfil do Agente (Anexo 03):**
  - Criar um componente de perfil neumórfico claro baseado no layout do anexo 03 (Michael Chen):
    - **Lado Esquerdo:** Foto do avatar do agente selecionado (`rounded-3xl` e sombra suave).
    - **Lado Direito (Card sobreposto):** Nome do Agente, Função/Cargo, Biografia customizada e ícones de integração circulares neumórficos.
  - Renderizar este card dinamicamente **logo abaixo do botão "Ativar meu ecossistema"** (onde antes ficavam as estatísticas).
  - Configurar "Ulisses" como agente ativo padrão no carregamento inicial da página.

---

## Verification Plan

### Automated Verification
- Executar `npm run build` para garantir conformidade técnica.
- Rodar o script de verificação de linter.

### Manual Verification
- Clicar nos avatares da órbita e verificar se a foto, título e descrição no card sob o botão de CTA atualizam perfeitamente.
- Validar se o centro da órbita exibe o logo do batimento cardíaco puro.
