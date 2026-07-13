# PLAN-publico-alvo-ideal.md

## Objetivo

Implementar a funcionalidade de análise de público-alvo a partir do site do usuário para o agente IGOR. A operação utiliza pesquisa profunda com a ferramenta Google Search integrada para gerar um relatório completo de ICP e salvá-lo na Base de Conhecimento.

## Orquestração (Agentes Envolvidos)

1. **project-planner**: Elaboração deste planejamento.
2. **backend-specialist**: Criação do serviço `publico-alvo-prospector.ts` e interceptador no `lucca-hub-chat.ts`.
3. **frontend-specialist**: Garantir o mapeamento correto de inputs na página de assistente-ia.
4. **test-engineer**: Validação do build e lint do TypeScript.

## Detalhes Técnicos

- O interceptador captura `context.agentId === 'igor'` e `context.specialty === 'Público-Alvo Ideal'`.
- Realiza chamada ao modelo `gemini-2.5-pro` com a ferramenta de busca para rastrear o site do cliente, concorrentes, e proporções demográficas do nicho.
- Retorna um relatório em markdown completo estruturado para ser indexado pelo RAG.
