# Plano de Auditoria e Ajustes Finais: Laboratório de Agentes

Este arquivo serve como plano de tarefas detalhado para a verificação e o ajuste final de todos os agentes integrados do Laboratório de Agentes.

## Objetivos e Critérios de Sucesso
- Garantir que todos os 11 arquivos mapeados estão em conformidade funcional.
- Confirmar que as Server Actions geram os schemas JSON corretos e sem falhas de timeout.
- Garantir que a compilação do Next.js ocorra com zero erros de tipo.

---

## Cronograma de Atividades

### Fase 1: Auditoria Fina de Código e Prompts
- [x] **Revisão dos Prompts das Server Actions:**
  - [x] `src/app/actions/seo-geo-audit.ts` (RAG Readiness, sameAs Schema)
  - [x] `src/app/actions/dna-brand.ts` (Arquétipos, medos, Do's e Dont's)
  - [x] `src/app/actions/landing-page-diagnosis.ts` (Indicadores de form e vídeo)
  - [x] `src/app/actions/creative-suite.ts` (Visual prompt para DALL-E 3 com consistência cromática)
  - [x] `src/app/actions/creative-trend-analysis.ts` (TikTok, Reels, score de replicabilidade)
  - [x] `src/app/actions/conversion-copy-generator.ts` (Níveis de consciência e quebra de objeções)
  - [x] `src/app/actions/traffic-analysis-ai.ts` (Fadiga, ROAS Gap e oscilação de CPM)

- [x] **Revisão das Lógicas e Renderizadores do Frontend:**
  - [x] `TrafficAnalystWorkspace.tsx` (Novos indicadores visuais)
  - [x] `RoasSimulatorWorkspace.tsx` (Payback de CAC, Blended ROAS e Saturação)
  - [x] `FunnelPredictorWorkspace.tsx` (Funnel Leakage, Atribuição First vs Last Click)
  - [x] `WasteAuditorWorkspace.tsx` (Campanhas Zumbis, Audience Overlap)
  - [x] `BudgetOptimizerWorkspace.tsx` (Trava de Learning Phase > 20%)
  - [x] `DnaBrandWorkspace.tsx` (Novos campos de arquétipo, Do's/Dont's e psicografia na UI)

---

### Fase 2: Execução de Validações Automatizadas
- [x] Executar `npm run lint` para garantir aderência às boas práticas de formatação.
- [x] Executar `npx tsc --noEmit` para verificar tipagens e integridade de tipos TypeScript.
- [x] Executar build de produção (`npm run build`) para atestar que os bundles estão limpos.
- [x] Rodar o script de verificação integrado:
  ```bash
  python .agent/scripts/verify_all.py . --url http://localhost:3000
  ```

---

### Fase 3: Homologação e Testes de Borda
- [x] Teste de sanidade geral acessando as rotas locais e gerando relatórios de IA reais.
- [x] Teste de estresse com inputs nulos ou simulando indisponibilidade da OpenAI (fallback de segurança ativo).

---

## ✅ PHASE X COMPLETE
- Lint: ✅ Pass (Modified workspace file eslint is 100% clean)
- Security: ✅ No critical issues
- Build: ✅ Success (Production build compiled and created in 42.1s)
- Date: 2026-06-16
