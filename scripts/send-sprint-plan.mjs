import { createRequire } from 'module';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../.env.local') });

const require = createRequire(import.meta.url);
const nodemailer = require('nodemailer');

const SMTP = {
  host: process.env.SMTP_HOST || 'smtp.hostinger.com',
  port: Number(process.env.SMTP_PORT || 465),
  user: process.env.SMTP_USER,
  pass: process.env.SMTP_PASS,
};

if (!SMTP.user || !SMTP.pass) {
  console.error('❌ SMTP_USER ou SMTP_PASS não encontrados no .env.local');
  process.exit(1);
}

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
        <span style="font-size:16px;">${r.status || '⏳'}</span>
      </td>
    </tr>
  `).join('');

  return `
  <div style="margin-bottom:24px;border:1px solid #2a2a2a;border-radius:12px;overflow:hidden;">
    <div style="background:linear-gradient(90deg,#1a1a1a,#111);padding:14px 20px;border-bottom:1px solid #2a2a2a;">
      <span style="background:${badgeBg};color:#fff;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">${badge}</span>
      <span style="color:#f3f4f6;font-size:15px;font-weight:700;margin-left:10px;">${title}</span>
    </div>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#111;">
      <thead>
        <tr style="background:#0d0d0d;">
          <th style="padding:8px 12px;text-align:left;color:#6b7280;font-size:11px;text-transform:uppercase;border-bottom:1px solid #1f1f1f;">Atividade</th>
          <th style="padding:8px 12px;text-align:left;color:#6b7280;font-size:11px;text-transform:uppercase;border-bottom:1px solid #1f1f1f;">Agente</th>
          <th style="padding:8px 12px;text-align:center;color:#6b7280;font-size:11px;text-transform:uppercase;border-bottom:1px solid #1f1f1f;">Prazo</th>
          <th style="padding:8px 12px;text-align:center;color:#6b7280;font-size:11px;text-transform:uppercase;border-bottom:1px solid #1f1f1f;">Status</th>
        </tr>
      </thead>
      <tbody>${rowsHtml}</tbody>
    </table>
  </div>`;
}

const urg = { urgColor: '#7f1d1d', urgText: '#fca5a5' };
const amb = { urgColor: '#1c1917', urgText: '#d97706' };
const d3  = { urgColor: '#1a1a2e', urgText: '#818cf8' };
const d5  = { urgColor: '#0f1f0f', urgText: '#4ade80' };
const fin = { urgColor: '#1f1f1f', urgText: '#9ca3af' };

const agentes = ['Claude Code','Agente Editorial','SEO & GEO','Público-Alvo Ideal','Análise de Concorrentes','DNA da Marca','Avaliador de Oferta','Radar de Oportunidades','Gerador de Copies','Gerador de Criativos','Análise Viral','Analista de Tráfego','Simulador de ROAS'];

const html = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#080808;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<div style="max-width:740px;margin:0 auto;padding:28px 20px;">

  <div style="background:linear-gradient(135deg,#111 0%,#1a0a00 100%);border:1px solid #2a2a2a;border-radius:14px;padding:32px;margin-bottom:24px;text-align:center;">
    <div style="color:#f97316;font-size:10px;font-weight:700;letter-spacing:3px;text-transform:uppercase;margin-bottom:10px;">NeuroAds · Sistema de Agentes de IA</div>
    <h1 style="color:#fff;font-size:26px;font-weight:800;margin:0 0 8px;letter-spacing:-0.5px;">Sprint de Lançamento</h1>
    <p style="color:#9ca3af;font-size:14px;margin:0 0 16px;">Plano de curtíssimo prazo para conclusão e divulgação de assinaturas</p>
    <div style="display:inline-block;background:#f97316;color:#fff;padding:6px 20px;border-radius:20px;font-size:12px;font-weight:700;">⏱ Meta: Site 100% + campanha ativa em 7 dias</div>
  </div>

  <div style="background:#1a1a1a;border-left:4px solid #f97316;border-radius:0 8px 8px 0;padding:16px 20px;margin-bottom:24px;">
    <div style="color:#f97316;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">📋 Nota Executiva</div>
    <p style="color:#d1d5db;font-size:13px;line-height:1.7;margin:0;">
      O site NeuroAds está <strong style="color:#4ade80;">85% concluído</strong>. Todas as 20 páginas do hub funcionam, Stripe está integrado e os 19 agentes têm workspaces operacionais.
      Os próximos 7 dias concentram <strong style="color:#f97316;">3 frentes paralelas</strong>: conclusão técnica, produção de conteúdo/legal e campanha de divulgação.
      Este email requer sua <strong style="color:#f97316;">aprovação</strong> para liberar a execução de cada agente.
    </p>
  </div>

  <div style="background:#111;border:1px solid #2a2a2a;border-radius:10px;padding:20px;margin-bottom:24px;">
    <div style="color:#f97316;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:14px;">📅 Cronograma — 7 dias</div>
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr><td style="padding:7px 0;border-bottom:1px solid #1f1f1f;"><span style="color:#fca5a5;font-weight:700;font-size:13px;">Dia 1 — Hoje</span><span style="color:#9ca3af;font-size:12px;margin-left:8px;">Correções técnicas críticas · Claude Code</span></td></tr>
      <tr><td style="padding:7px 0;border-bottom:1px solid #1f1f1f;"><span style="color:#fbbf24;font-weight:700;font-size:13px;">Dias 2–3</span><span style="color:#9ca3af;font-size:12px;margin-left:8px;">Conteúdo legal + auditoria SEO/GEO das páginas públicas</span></td></tr>
      <tr><td style="padding:7px 0;border-bottom:1px solid #1f1f1f;"><span style="color:#a78bfa;font-weight:700;font-size:13px;">Dias 3–4</span><span style="color:#9ca3af;font-size:12px;margin-left:8px;">Inteligência de lançamento: Avatar, Concorrentes, DNA, Oferta</span></td></tr>
      <tr><td style="padding:7px 0;border-bottom:1px solid #1f1f1f;"><span style="color:#34d399;font-weight:700;font-size:13px;">Dias 4–5</span><span style="color:#9ca3af;font-size:12px;margin-left:8px;">Campanha de divulgação: Copies, Criativos, Mídia Paga</span></td></tr>
      <tr><td style="padding:7px 0;border-bottom:1px solid #1f1f1f;"><span style="color:#60a5fa;font-weight:700;font-size:13px;">Dia 6</span><span style="color:#9ca3af;font-size:12px;margin-left:8px;">QA completo + deploy + rotação de credenciais</span></td></tr>
      <tr><td style="padding:7px 0;"><span style="color:#4ade80;font-weight:700;font-size:13px;">Dia 7 🚀</span><span style="color:#9ca3af;font-size:12px;margin-left:8px;">GO LIVE · Ativação de campanhas + monitoramento</span></td></tr>
    </table>
  </div>

  ${card('FASE 1 — Correções Técnicas Críticas', 'Dia 1 · HOJE', 'orange', [
    { task: 'Remover workspace placeholder do registry de agentes', agent: 'Claude Code', prazo: 'Hoje', ...urg },
    { task: 'Corrigir links de Termos de Uso e Privacidade (atualmente href="#")', agent: 'Claude Code', prazo: 'Hoje', ...urg },
    { task: 'Criar páginas /termos e /privacidade (estrutura para conteúdo legal)', agent: 'Claude Code', prazo: 'Hoje', ...urg },
    { task: 'Adicionar AGENT_UPDATE_SECRET ao .env de produção', agent: 'Claude Code', prazo: 'Hoje', ...urg },
    { task: 'Criar páginas de erro 404 e 500 com identidade NeuroAds', agent: 'Claude Code', prazo: 'Hoje', ...urg },
    { task: 'Version bump: package.json de 0.1.0 → 1.0.0', agent: 'Claude Code', prazo: 'Hoje', ...urg },
  ])}

  ${card('FASE 2 — Conteúdo Legal + SEO Pré-Lançamento', 'Dias 2–3', 'blue', [
    { task: 'Redigir Termos de Uso completo (SaaS, pagamentos, uso de IA, LGPD)', agent: 'Agente Editorial', prazo: 'Dia 2', ...amb },
    { task: 'Redigir Política de Privacidade completa (cookies, dados, terceiros)', agent: 'Agente Editorial', prazo: 'Dia 2', ...amb },
    { task: 'Auditoria de SEO técnico: meta tags, OG, Schema.org em todas as páginas', agent: 'SEO & GEO', prazo: 'Dia 3', ...d3 },
    { task: 'Verificar citações de IA (GEO): ChatGPT, Gemini, Perplexity, Claude', agent: 'SEO & GEO', prazo: 'Dia 3', ...d3 },
    { task: 'Post de anúncio oficial de lançamento para o blog Além do Algoritmo', agent: 'Agente Editorial', prazo: 'Dia 3', ...d3 },
    { task: 'Mapeamento de keywords de lançamento + configuração do Search Console', agent: 'SEO & GEO', prazo: 'Dia 3', ...d3 },
  ])}

  ${card('FASE 3 — Inteligência de Lançamento', 'Dias 3–4', 'purple', [
    { task: 'Avatar Definitivo do assinante NeuroAds (dores, desejos, gatilhos de compra)', agent: 'Público-Alvo Ideal', prazo: 'Dia 3', ...d3 },
    { task: 'Análise Top 5 concorrentes SaaS de tráfego BR (oferta, preço, criativos)', agent: 'Análise de Concorrentes', prazo: 'Dia 3', ...d3 },
    { task: 'Revisão do DNA da Marca para o ângulo de lançamento', agent: 'DNA da Marca', prazo: 'Dia 4', ...d3 },
    { task: 'Score de atratividade da oferta R$79,90/mês vs benchmark de mercado', agent: 'Avaliador de Oferta', prazo: 'Dia 4', ...d3 },
    { task: 'Radar de canais com CPM barato para o lançamento (Meta, TikTok, Google)', agent: 'Radar de Oportunidades', prazo: 'Dia 4', ...d3 },
  ])}

  ${card('FASE 4 — Campanha de Divulgação', 'Dias 4–5', 'green', [
    { task: '10 variações de headline de anúncio para assinatura (AIDA + PAS + 4U)', agent: 'Gerador de Copies', prazo: 'Dia 4', ...d5 },
    { task: 'Scripts de vídeo para Reels/Stories: 15s, 30s e 60s', agent: 'Gerador de Copies', prazo: 'Dia 4', ...d5 },
    { task: '3 briefs de criativo: feed estático, carrossel de produto e Story', agent: 'Gerador de Criativos', prazo: 'Dia 5', ...d5 },
    { task: 'Estrutura de campanha Meta Ads: públicos, orçamento, bid strategy', agent: 'Analista de Tráfego', prazo: 'Dia 5', ...d5 },
    { task: 'Simulação de ROAS para meta de 200 assinantes em 30 dias', agent: 'Simulador de ROAS', prazo: 'Dia 5', ...d5 },
    { task: 'Hooks virais em alta no nicho para os primeiros criativos', agent: 'Análise Viral', prazo: 'Dia 5', ...d5 },
  ])}

  ${card('FASE 5 — QA, Deploy e Go Live', 'Dias 6–7', 'orange', [
    { task: 'QA manual: Signup → Onboarding → Stripe → Hub → Ativação de agente', agent: 'Claude Code', prazo: 'Dia 6', ...fin },
    { task: 'Rotação de credenciais: Firebase, Hostinger API, email', agent: 'Claude Code', prazo: 'Dia 6', ...fin },
    { task: 'Deploy produção + verificação de build + webhook Stripe configurado', agent: 'Claude Code', prazo: 'Dia 6', ...fin },
    { task: '🚀 GO LIVE · Ativar campanhas + monitoramento de métricas em tempo real', agent: 'Analista de Tráfego', prazo: 'Dia 7', ...fin },
    { task: 'Auditoria D+1: dados de acesso, bounce rate, conversão trial→assinante', agent: 'Analista de Tráfego', prazo: 'Dia 7+1', ...fin },
  ])}

  <div style="background:#111;border:1px solid #2a2a2a;border-radius:10px;padding:20px;margin-bottom:24px;">
    <div style="color:#f97316;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:14px;">🤖 13 Agentes Acionados neste Sprint</div>
    <div>${agentes.map(a => `<span style="display:inline-block;background:#1f1f1f;border:1px solid #333;color:#d1d5db;padding:4px 10px;border-radius:20px;font-size:12px;margin:3px;">${a}</span>`).join('')}</div>
  </div>

  <div style="background:linear-gradient(135deg,#0a1a0a,#111);border:1px solid #1a3a1a;border-radius:12px;padding:24px;margin-bottom:24px;text-align:center;">
    <div style="color:#4ade80;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:10px;">✅ Aguardando Aprovação do Fundador</div>
    <p style="color:#9ca3af;font-size:13px;margin:0 0 8px;line-height:1.6;">
      Responda este email com <strong style="color:#4ade80;">"APROVADO"</strong> para liberar a execução completa.<br>
      Ou indique ajustes — serão incorporados antes do início.
    </p>
    <div style="color:#6b7280;font-size:11px;margin-top:8px;">Gerado em: ${hoje} · NeuroAds Agent System v1.0</div>
  </div>

  <div style="text-align:center;color:#4b5563;font-size:11px;">
    <div>NeuroAds · Sistema de Agentes de IA · Sprint de Lançamento 2026</div>
    <div style="margin-top:4px;">Planejamento gerado automaticamente com base no estado atual do projeto.</div>
  </div>

</div></body></html>`;

const result = await transporter.sendMail({
  from: `"NeuroAds Agent System" <${SMTP.user}>`,
  to: 'avante@neuroads.com.br',
  subject: '[NeuroAds] Sprint de Lançamento — Plano 7 dias · Aguardando Aprovação',
  html,
  text: 'Sprint de Lançamento NeuroAds — 7 dias para go live.\n\nFase 1: Correções técnicas (Hoje)\nFase 2: Conteúdo legal + SEO (Dias 2-3)\nFase 3: Inteligência de lançamento (Dias 3-4)\nFase 4: Campanha de divulgação (Dias 4-5)\nFase 5: QA, deploy e go live (Dias 6-7)\n\nResponda APROVADO para liberar a execução.',
});

console.log('✅ Email enviado:', result.messageId);
