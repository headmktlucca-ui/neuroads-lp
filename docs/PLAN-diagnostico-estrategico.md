# PLAN: Diagnóstico Estratégico de Presença Digital (Agente Laís)

## CONTEXT & OBJECTIVE
Implementation of the **Strategic Diagnosis Modal** ("Diagnóstico Estratégico de Presença Digital" / "AI Brand Intelligence Report") led by **Agent Laís** (SEO, GEO & Brand Intelligence Specialist).

---

## DELIVERABLES

1. **Homepage Hero Cleanup (`src/app/page.tsx`)**:
   - Remove outdated text `"Experimente por 14 dias sem custos."`.
   - Add new executive button `"Diagnóstico Estratégico"` right below *"Ativar meu ecossistema"*.

2. **Strategic Diagnosis Modal (`src/components/neuroads/StrategicDiagnosisModal.tsx`)**:
   - Header with Agent Laís avatar (`/images/Avatar Agentes IA/Avatar_Lais.png`), title, role ("Especialista em SEO, GEO & Inteligência de Marca"), and 1st person intro.
   - 6-Stage Conversion & Analysis Flow:
     - **Stage 1 (Form)**: Inputs for Company Name, Website, Instagram, LinkedIn (Required) + Industry Segment (Optional).
     - **Stage 2 (Progress)**: Live simulated AI analysis progress bars (Website, SEO, Instagram, LinkedIn, Competitors, AI/GEO).
     - **Stage 3 (Partial Preview)**: ~30% report preview (Scores, Summary, Brand Identity, ICP, 3 Opportunities, 2 Competitors, 3 Quick Wins) with blur gradient lock.
     - **Stage 4 (Unlock Card)**: Gated form capturing Name & Professional E-mail to unlock full report.
     - **Stage 5 (Full 3-Page Report)**:
       - *Page 1 (Executive Diagnosis)*: Scores, Company Overview, Brand Identity/Voice, ICP, SEO & GEO Position (AI Readiness: ChatGPT, Perplexity, Gemini).
       - *Page 2 (Opportunities)*: Competitor Benchmark (up to 5), Content Opportunities, SEO Checklist (5 items), GEO Checklist (5 items: `llms.txt`, Schema, FAQ, Entities), Commercial Opportunities (Short/Medium/Long term), Recommended Campaigns.
       - *Page 3 (Action Plan)*: 5 Quick Wins, 5 High Priorities, 90-Day Sequential Roadmap, AI Executive Conclusion.
     - **Stage 6 (Download & WhatsApp)**: WhatsApp field capture + PDF download trigger (`window.print()` / PDF export).

3. **Backend Lead Integration (`src/app/api/access/route.ts` & `src/lib/mail.ts`)**:
   - Store captured leads and optionally notify `avante@neuroads.com.br`.

---

## VERIFICATION
- Run `npm run build` to verify zero errors across all 140+ routes.
