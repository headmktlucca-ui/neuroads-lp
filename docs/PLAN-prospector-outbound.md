# PLAN-prospector-outbound: Prospecção de 50 Leads Reais por VITOR (SDR Autônomo)

Este documento apresenta o planejamento detalhado para a implementação da funcionalidade de prospecção profunda na internet pelo agente VITOR (SDR Autônomo), gerando 50 leads qualificados para a empresa do usuário e integrando-os diretamente ao Funil de Vendas do CRM.

---

## 1. Visão Geral (Overview)

A operação "Prospector Outbound" realizada pelo agente VITOR deve evoluir de uma simulação visual para uma rotina operacional funcional de prospecção automatizada. Ao ser acionada, ela identificará o perfil ideal de cliente (ICP) a partir do site da empresa cadastrado na conta e dos filtros de Segmento e Cargo inseridos pelo usuário. Em seguida, o sistema executará uma pesquisa na internet (utilizando a capacidade de busca nativa do modelo Gemini 2.5 Pro ou API de busca configurada) para obter 50 leads reais contendo Nome, Empresa, E-mail e WhatsApp válidos. Por fim, os leads serão deduplicados contra os leads já existentes no CRM e salvos no Firestore do usuário, aparecendo imediatamente na etapa "Capturado" da tela de Funil de Vendas.

---

## 2. Tipo do Projeto (Project Type)

**WEB** (Next.js / React / Firestore Server Actions)

---

## 3. Critérios de Sucesso (Success Criteria)

- **Identificação Automática de ICP**: Extração correta do perfil da empresa a partir do campo `site` do perfil do usuário logado.
- **Busca de 50 Leads**: Geração/Extração de exatamente 50 leads aderentes ao ICP.
- **Deduplicação de Contatos**: Garantia de que nenhum e-mail, telefone ou empresa duplicados sejam adicionados caso já existam no CRM do usuário.
- **Persistência no CRM**: Salvamento no caminho `users/{uid}/leads_funil/main` do Firestore, garantindo que o Kanban mostre os novos leads instantaneamente na coluna "Capturado".
- **Visualização de Resultados**: Exibição dos leads prospectados em formato tabular no painel esquerdo da tela de IA (`assistente-ia/page.tsx`).

---

## 4. Open Questions (Socratic Gate)

> [!IMPORTANT]
> **Questões fundamentais para alinhar com o usuário:**
> 1. **Uso de Inputs do Usuário**: A operação "Prospector Outbound" solicita "Segmento Alvo" e "Cargo do Decisor". Devemos combinar esses inputs com o conteúdo do site do usuário para refinar a busca?
> 2. **Motor de Busca**: Usaremos o modelo `gemini-2.5-pro` com a ferramenta de busca nativa (Google Search Tool) ativa para obter leads reais e atuais da internet?
> 3. **Regra de Deduplicação**: Para considerar um lead duplicado, a verificação deve comparar e-mail, telefone ou empresa (qualquer um deles coincidente) contra a lista existente?
> 4. **Tratamento de Limites**: Se a pesquisa profunda retornar menos de 50 leads válidos em um primeiro momento devido a restrições de busca, o agente deve tentar expandir os termos de busca para completar a lista dos 50 solicitados?

---

## 5. Estrutura de Arquivos Proposta

```
src/
├── app/
│   └── actions/
│       └── lucca-hub-chat.ts  <-- [MODIFY] Interceptar a execução do Vitor
└── lib/
    └── lead-prospector.ts     <-- [NEW] Motor de busca, extração e persistência de leads
```

---

## 6. Proposta de Mudanças (Task Breakdown)

### 🏗️ Fase 1: Foundation (Persistência e Conectividade)
*Responsável: database-architect | Skill: database-design*

#### [NEW] [lead-prospector.ts](file:///c:/Users/claud/OneDrive/Documentos/NeuroAds/LP/src/lib/lead-prospector.ts)
Criar utilitários para carregar leads existentes, realizar o enriquecimento contra o site do perfil e persistir a lista final deduplicada no Firestore.
- **INPUT**: `userId`, `site`, `segmento`, `cargo`, `existentes: Lead[]`
- **OUTPUT**: Salvar array de novos leads em `users/{userId}/leads_funil/main` no Firestore.
- **VERIFY**: Executar script de teste unitário verificando que a gravação não gera chaves duplicadas.

---

### 🧠 Fase 2: Core (Lógica de Prospecção)
*Responsável: backend-specialist | Skill: api-patterns*

#### [MODIFY] [lucca-hub-chat.ts](file:///c:/Users/claud/OneDrive/Documentos/NeuroAds/LP/src/app/actions/lucca-hub-chat.ts)
Modificar a função principal `chatWithLuccaHub` para interceptar quando `context.agentId === 'vitor'` e `context.specialty === 'Prospector Outbound'`.
- **INPUT**: Chamada de chat do Vitor com parâmetros no prompt.
- **OUTPUT**: Chamar o motor de prospecção, persistir no Firestore e retornar a resposta JSON contendo o relatório executivo no `message` e a lista dos 50 leads estruturada em `leftPanel.tableRows`.
- **VERIFY**: Validar que a API responde com o formato JSON esperado contendo as chaves `message` e `leftPanel`.

---

## 7. Plano de Verificação (Phase X)

### Testes Automatizados
- Executar `npx tsc --noEmit` para verificar a conformidade de tipos TS após as alterações.
- Criar teste unitário em `src/lib/__tests__/lead-prospector.test.ts` para validar o algoritmo de deduplicação.

### Verificação Manual
1. Abrir a tela de Integrações e certificar que um site fictício/real está configurado no perfil.
2. Ir até o assistente do Vitor (`/hub/assistente-ia?agent=vitor`) e clicar em "Prospector Outbound".
3. Preencher os parâmetros de Segmento e Cargo e clicar em "Executar Operação".
4. Confirmar que o painel esquerdo exibe a tabela com os 50 leads prospectados.
5. Acessar a tela "Funil de Vendas" (`/hub/funil-vendas`) e verificar se os 50 novos leads aparecem na coluna "Capturado" do Kanban.
6. Rodar novamente a operação e verificar se os novos leads não são duplicados.
