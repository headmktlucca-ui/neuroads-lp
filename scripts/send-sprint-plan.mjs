import nodemailer from 'nodemailer';

const SMTP = {
  host: 'smtp.hostinger.com',
  port: 465,
  user: 'avante@neuroads.com.br',
  pass: 'Lsvfnzrx93310!',
};

const transporter = nodemailer.createTransport({
  host: SMTP.host,
  port: SMTP.port,
  secure: true,
  auth: { user: SMTP.user, pass: SMTP.pass },
  tls: { rejectUnauthorized: false },
});

const hoje = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });

function card(title, badge, badgeColor, rows) {
  const badgeBg = badgeColor === 'orange' ? '#f97316' : badgeColor === 'green' ? '#16a34a' : badgeColor === 'blue' ? '#2563eb' : '#7c3aed';
  const rowsHtml = rows.map(r => `
    <tr>
      <td style="padding:10px 12px;border-bottom:1px solid #1f1f1f;color:#d1d5db;font-size:13px;">${r.task}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #1f1f1f;color:#9ca3af;font-size:12px;white-space:nowrap;">${r.agent}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #1f1f1f;text-align:center;white-space:nowrap;">
        <span style="background:${r.urgColor || '#1f2937'};color:${r.urgText || '#9ca3af'};padding:2px 8px;border-radius:10px;font-size:11px;font-weight:600;">${r.prazo}</span>
      </td>
      <td style="padding:10px 12px;border-bottom:1px solid #1f1f1f;text-align:center;">
        <span style="font-size:16px;">${r.status}</span>
      </td>
    </tr>
  `).join('');

  return `
  <div style="margin-bottom:24px;border:1px solid #2a2a2a;border-radius:12px;overflow:hidden;">
    <div style="background:linear-gradient(90deg,#1a1a1a,#111);padding:14px 20px;display:flex;align-items:center;gap:12px;border-bottom:1px solid #2a2a2a;">
      <span style="background:${badgeBg};color:#fff;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">${badge}</span>
      <span style="color:#f3f4f6;font-size:15px;font-weight:700;">${title}</span>
    </div>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#111;">
      <thead>
        <tr style="background:#0d0d0d;">
          <th style="padding:8px 12px;text-align:left;color:#6b7280;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;border-bottom:1px solid #1f1f1f;">Atividade</th>
          <th style="padding:8px 12px;text-align:left;color:#6b7280;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;border-bottom:1px solid #1f1f1f;">Agente / Responsável</th>
          <th style="padding:8px 12px;text-align:center;color:#6b7280;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;border-bottom:1px solid #1f1f1f;">Prazo</th>
          <th style="padding:8px 12px;text-align:center;color:#6b7280;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;border-bottom:1px solid #1f1f1f;">Status</th>
        </tr>
      </thead>
      <tbody>${rowsHtml}</tbody>
    </table>
  </div>`;
}

const urgente = { urgColor: '#7f1d1d', urgText: '#fca5a5' };
const hoje2 = { urgColor: '#1c1917', urgText: '#d97706' };
const d3 = { urgColor: '#1a1a2e', urgText: '#818cf8' };
const d5 = { urgColor: '#0f1f0f', urgText: '#4ade80' };
const semana = { urgColor: '#1f1f1f', urgText: '#9ca3af' };

const html = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#080808;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<div style="max-width:740px;margin:0 auto;padding:28px 20px;">

  <!-- HEADER -->
  <div style="background:linear-gradient(135deg,#111 0%,#1a0a00 100%);border:1px solid #2a2a2a;border-radius:14px;padding:32px;margin-bottom:24px;text-align:center;">
    <div style="color:#f97316;font-size:10px;font-weight:700;letter-spacing:3px;text-transform:uppercase;margin-bottom:10px;">NeuroAds · Sistema de Agentes de IA</div>
    <h1 style="color:#fff;font-size:26px;font-weight:800;margin:0 0 8px;letter-spacing:-0.5px;">Sprint de Lançamento</h1>
    <p style="color:#9ca3af;font-size:14px;margin:0 0 16px;">Plano de curtíssimo prazo para conclusão e divulgação de assinaturas</p>
    <div style="display:inline-block;background:#f97316;color:#fff;padding:6px 20px;border-radius:20px;font-size:12px;font-weight:700;">
      ⏱ Meta: Site 100% funcional + campanha ativa em 7 dias
    </div>
  </div>

  <!-- NOTA EXECUTIVA -->
  <div style="background:#1a1a1a;border-left:4px solid #f97316;border-radius:0 8px 8px 0;padding:16px 20px;margin-bottom:24px;">
    <div style="color:#f97316;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">📋 Nota Executiva</div>
    <p style="color:#d1d5db;font-size:13px;line-height:1.7;margin:0;">
      O site NeuroAds está <strong style="color:#4ade80;">85% concluído</strong>. Todas as 20 páginas do hub estão funcionais, o fluxo de pagamento Stripe está integrado e os 19 agentes possuem workspaces operacionais.
      Os próximos 7 dias concentram <strong style="color:#f97316;">3 frentes paralelas</strong>: conclusão técnica, produção de conteúdo/legal e montagem da campanha de divulgação.
      Cada agente abaixo receberá sua missão e entregará ao respectivo prazo. Este email requer sua aprovação para liberar execução.
    </p>
  </div>

  <!-- VISÃO GERAL DO SPRINT -->
  <div style="display:grid;gap:12px;margin-bottom:24px;">
    <div style="background:#111;border:1px solid #2a2a2a;border-radius:10px;padding:16px 20px;">
      <div style="color:#f97316;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:12px;">📅 Cronograma — 7 dias</div>
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding:6px 0;border-bottom:1px solid #1f1f1f;">
            <span style="color:#fca5a5;font-weight:700;font-size:13px;">Dia 1 (Hoje)</span>
            <span style="color:#9ca3af;font-size:12px;margin-left:8px;">— Correções técnicas críticas · Claude Code</span>
          </td>
        </tr>
        <tr>
          <td style="padding:6px 0;border-bottom:1px solid #1f1f1f;">
            <span style="color:#fbbf24;font-weight:700;font-size:13px;">Dias 2–3</span>
            <span style="color:#9ca3af;font-size:12px;margin-left:8px;">— Conteúdo legal + SEO/GEO das páginas públicas</span>
          </td>
        </tr>
        <tr>
          <td style="padding:6px 0;border-bottom:1px solid #1f1f1f;">
            <span style="color:#a78bfa;font-weight:700;font-size:13px;">Dias 3–4</span>
            <span style="color:#9ca3af;font-size:12px;margin-left:8px;">— Inteligência de lançamento · Avatar + Concorrentes + DNA</span>
          </td>
        </tr>
        <tr>
          <td style="padding:6px 0;border-bottom:1px solid #1f1f1f;">
            <span style="color:#34d399;font-weight:700;font-size:13px;">Dias 4–5</span>
            <span style="color:#9ca3af;font-size:12px;margin-left:8px;">— Campanha de divulgação · Copies + Criativos + Mídia Paga</span>
          </td>
        </tr>
        <tr>
          <td style="padding:6px 0;border-bottom:1px solid #1f1f1f;">
            <span style="color:#60a5fa;font-weight:700;font-size:13px;">Dia 6</span>
            <span style="color:#9ca3af;font-size:12px;margin-left:8px;">— QA completo + deploy + credenciais rotacionadas</span>
          </td>
        </tr>
        <tr>
          <td style="padding:6px 0;">
            <span style="color:#4ade80;font-weight:700;font-size:13px;">Dia 7</span>
            <span style="color:#9ca3af;font-size:12px;margin-left:8px;">— 🚀 GO LIVE · Ativação de campanhas + monitoramento</span>
          </td>
        </tr>
      </table>
    </div>
  </div>

  <!-- FASE 1 -->
  ${card('FASE 1 — Correções Técnicas Críticas', 'Dia 1 · Hoje', 'orange', [
    { task: 'Remover workspace placeholder (NomeDoMeuAgenteWorkspace) do registry', agent: 'Claude Code', prazo: 'Hoje', ...urgente },
    { task: 'Corrigir links de Termos de Uso e Política de Privacidade (atualmente href="#")', agent: 'Claude Code', prazo: 'Hoje', ...urgente },
    { task: 'Adicionar variável AGENT_UPDATE_SECRET ao .env de produção', agent: 'Claude Code', prazo: 'Hoje', ...urgente },
    { task: 'Criar páginas /termos e /privacidade com conteúdo real (estrutura)', agent: 'Claude Code', prazo: 'Hoje', ...urgente },
    { task: 'Version bump: package.json 0.1.0 → 1.0.0', agent: 'Claude Code', prazo: 'Hoje', ...urgente },
    { task: 'Criar páginas 404 e 500 customizadas com identidade NeuroAds', agent: 'Claude Code', prazo: 'Hoje', ...urgente },
  ])}

  <!-- FASE 2 -->
  ${card('FASE 2 — Conteúdo Legal + SEO Pré-Lançamento', 'Dias 2–3', 'blue', [
    { task: 'Redigir Termos de Uso completo (NeuroAds SaaS, pagamentos, uso de IA)', agent: 'Agente Editorial', prazo: 'Dia 2', ...hoje2 },
    { task: 'Redigir Política de Privacidade completa (LGPD, cookies, dados de terceiros)', agent: 'Agente Editorial', prazo: 'Dia 2', ...hoje2 },
    { task: 'Auditoria técnica de SEO em todas as páginas públicas (meta tags, OG, Schema)', agent: 'SEO & GEO', prazo: 'Dia 3', ...d3 },
    { task: 'Verificar e otimizar citações de IA (GEO): ChatGPT, Gemini, Perplexity', agent: 'SEO & GEO', prazo: 'Dia 3', ...d3 },
    { task: 'Criar post de lançamento para o blog Além do Algoritmo (anúncio oficial)', agent: 'Agente Editorial', prazo: 'Dia 3', ...d3 },
    { task: 'Mapear keywords de cauda longa para o lançamento + Google Search Console setup', agent: 'SEO & GEO', prazo: 'Dia 3', ...d3 },
  ])}

  <!-- FASE 3 -->
  ${card('FASE 3 — Inteligência de Lançamento', 'Dias 3–4', 'purple', [
    { task: 'Construir Avatar Definitivo do assinante NeuroAds (dores, desejos, gatilhos)', agent: 'Público-Alvo Ideal', prazo: 'Dia 3', ...d3 },
    { task: 'Análise de concorrentes: quem está no mercado de SaaS de tráfego BR? (Top 5)', agent: 'Análise de Concorrentes', prazo: 'Dia 3', ...d3 },
    { task: 'Revisão do DNA da Marca para a campanha de lançamento (tom, ângulos, posicionamento)', agent: 'DNA da Marca', prazo: 'Dia 4', ...d3 },
    { task: 'Score de atratividade da oferta atual (R$79,90/mês vs benchmark do mercado)', agent: 'Avaliador de Oferta', prazo: 'Dia 4', ...d3 },
    { task: 'Radar de oportunidades: identificar canais com CPM barato para o lançamento', agent: 'Radar de Oportunidades', prazo: 'Dia 4', ...d3 },
  ])}

  <!-- FASE 4 -->
  ${card('FASE 4 — Campanha de Divulgação', 'Dias 4–5', 'green', [
    { task: '10 variações de headline de anúncio para assinatura NeuroAds (AIDA + PAS)', agent: 'Gerador de Copies', prazo: 'Dia 4', ...d5 },
    { task: 'Scripts de vídeo curto para Reels/Stories (3 versões: 15s / 30s / 60s)', agent: 'Gerador de Copies', prazo: 'Dia 4', ...d5 },
    { task: '3 briefs de criativo visual para feed estático + carrossel de produto', agent: 'Gerador de Criativos', prazo: 'Dia 5', ...d5 },
    { task: 'Estrutura de campanha Meta Ads: públicos, orçamento inicial, bid strategy', agent: 'Analista de Tráfego', prazo: 'Dia 5', ...d5 },
    { task: 'Simulação de ROAS para meta de 200 assinantes em 30 dias (budget necessário)', agent: 'Simulador de ROAS', prazo: 'Dia 5', ...d5 },
    { task: 'Análise de viral para identificar hooks de lançamento em alta no nicho', agent: 'Análise Viral', prazo: 'Dia 5', ...d5 },
  ])}

  <!-- FASE 5 -->
  ${card('FASE 5 — QA, Deploy e Go Live', 'Dias 6–7', 'orange', [
    { task: 'QA manual completo: Signup → Onboarding → Stripe → Hub → Ativação de agente', agent: 'Claude Code', prazo: 'Dia 6', ...semana },
    { task: 'Rotação de credenciais: Firebase key, Hostinger API, email app password', agent: 'Claude Code', prazo: 'Dia 6', ...semana },
    { task: 'Deploy para produção + verificação de build (Vercel/Hostinger)', agent: 'Claude Code', prazo: 'Dia 6', ...semana },
    { task: 'Configurar Stripe webhook em produção + testar pagamento real', agent: 'Claude Code', prazo: 'Dia 6', ...semana },
    { task: '🚀 GO LIVE · Ativar campanhas de divulgação + monitorar métricas', agent: 'Analista de Tráfego', prazo: 'Dia 7', ...semana },
    { task: 'Auditoria D+1: primeiros dados de acesso, bounce, conversão de trial', agent: 'Analista de Tráfego', prazo: 'Dia 7', ...semana },
  ])}

  <!-- RESUMO DE AGENTES -->
  <div style="background:#111;border:1px solid #2a2a2a;border-radius:10px;padding:20px;margin-bottom:24px;">
    <div style="color:#f97316;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:14px;">🤖 Agentes Acionados neste Sprint</div>
    <div style="display:flex;flex-wrap:wrap;gap:8px;">
      ${['Claude Code', 'Agente Editorial', 'SEO & GEO', 'Público-Alvo Ideal', 'Análise de Concorrentes', 'DNA da Marca', 'Avaliador de Oferta', 'Radar de Oportunidades', 'Gerador de Copies', 'Gerador de Criativos', 'Análise Viral', 'Analista de Tráfego', 'Simulador de ROAS'].map(a =>
        `<span style="background:#1f1f1f;border:1px solid #333;color:#d1d5db;padding:4px 10px;border-radius:20px;font-size:12px;">${a}</span>`
      ).join('')}
    </div>
  </div>

  <!-- APROVAÇÃO -->
  <div style="background:linear-gradient(135deg,#0a1a0a,#111);border:1px solid #1a3a1a;border-radius:12px;padding:24px;margin-bottom:24px;text-align:center;">
    <div style="color:#4ade80;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:10px;">✅ Aguardando Aprovação do Fundador</div>
    <p style="color:#9ca3af;font-size:13px;margin:0 0 16px;line-height:1.6;">
      Responda a este email com <strong style="color:#4ade80;">"APROVADO"</strong> para liberar a execução completa do sprint.<br>
      Ou indique ajustes específicos que serão incorporados antes do início.
    </p>
    <div style="color:#6b7280;font-size:11px;">Gerado em: ${hoje} · NeuroAds Agent System v1.0</div>
  </div>

  <!-- FOOTER -->
  <div style="text-align:center;color:#4b5563;font-size:11px;padding:0 20px;">
    <div>NeuroAds · Sistema de Agentes de IA · Sprint de Lançamento 2026</div>
    <div style="margin-top:4px;color:#374151;">Este planejamento foi gerado automaticamente com base no estado atual do projeto.</div>
  </div>

</div>
</body>
</html>`;

try {
  const result = await transporter.sendMail({
    from: '"NeuroAds Agent System" <avante@neuroads.com.br>',
    to: 'avante@neuroads.com.br',
    subject: `[NeuroAds] Sprint de Lançamento — Plano 7 dias · Aguardando Aprovação`,
    html,
    text: `Sprint de Lançamento NeuroAds — Plano de 7 dias\n\nFase 1 (Hoje): Correções técnicas críticas\nFase 2 (Dias 2-3): Conteúdo legal + SEO\nFase 3 (Dias 3-4): Inteligência de lançamento\nFase 4 (Dias 4-5): Campanha de divulgação\nFase 5 (Dias 6-7): QA, deploy e go live\n\nResponda APROVADO para liberar a execução.`,
  });
  console.log('✅ Email enviado com sucesso:', result.messageId);
} catch (err) {
  console.error('❌ Erro ao enviar:', err.message);
  process.exit(1);
}
