# PLAN-prospector-reference.md

## Objetivo
Configurar o agente VITOR e a operação "Prospector Outbound" para aceitar documentos de referência salvos na Base de Conhecimento, substituindo a necessidade de preenchimento manual dos campos do formulário da direita.

## Orquestração (Agentes)
1. **project-planner**: Elaboração deste planejamento.
2. **backend-specialist**: Alteração de `lead-prospector.ts` e `lucca-hub-chat.ts` para ler os relatórios e injetar no prompt do Gemini.
3. **frontend-specialist**: Mapeamento do Select de relatórios no cockpit e bypass do `required` nos inputs.
4. **test-engineer**: Compilação TypeScript de segurança.

## Alterações Técnicas
- **Frontend (`page.tsx`)**: Query na coleção `agent_reports` do Firestore no client, exibição de dropdown sob as especialidades, passagem de `referenceReportId` no contexto.
- **Backend (`lucca-hub-chat.ts`)**: Leitura do relatório do Firestore Admin SDK usando o ID referenciado e extração do conteúdo.
- **Serviço (`lead-prospector.ts`)**: Adaptação do prompt para usar o documento de ICP se fornecido.
