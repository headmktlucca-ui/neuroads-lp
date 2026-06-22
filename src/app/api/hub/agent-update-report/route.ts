import { NextRequest, NextResponse } from 'next/server';
import { sendLuccaOperationalEmail } from '../../../../lib/mail';

export const runtime = 'nodejs';

interface AgentUpdatePayload {
  secret: string;
  agentSlug: string;
  agentTitle: string;
  hasImprovements: boolean;
  summary: string;
  improvements: Array<{
    section: string;
    current: string;
    suggested: string;
    reason: string;
  }>;
  updatedPromptContent?: string;
  researchSources?: string[];
}

function buildEmailHtml(payload: AgentUpdatePayload): string {
  const statusBadge = payload.hasImprovements
    ? `<span style="background:#f97316;color:#fff;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:700;">MELHORIAS IDENTIFICADAS</span>`
    : `<span style="background:#22c55e;color:#fff;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:700;">AGENTE ATUALIZADO ✓</span>`;

  const improvementsHtml = payload.improvements.length > 0
    ? payload.improvements.map((imp, i) => `
      <div style="border:1px solid #2a2a2a;border-radius:8px;padding:16px;margin-bottom:12px;">
        <div style="color:#f97316;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">
          Melhoria #${i + 1} — ${imp.section}
        </div>
        <div style="margin-bottom:8px;">
          <div style="color:#6b7280;font-size:11px;margin-bottom:4px;">ATUAL:</div>
          <div style="background:#1a1a1a;border-radius:4px;padding:8px;font-size:13px;color:#9ca3af;font-family:monospace;">${imp.current}</div>
        </div>
        <div style="margin-bottom:8px;">
          <div style="color:#22c55e;font-size:11px;margin-bottom:4px;">SUGERIDO:</div>
          <div style="background:#1a1a1a;border-radius:4px;padding:8px;font-size:13px;color:#d1fae5;font-family:monospace;">${imp.suggested}</div>
        </div>
        <div style="color:#6b7280;font-size:12px;font-style:italic;">💡 ${imp.reason}</div>
      </div>
    `).join('')
    : '<p style="color:#6b7280;font-style:italic;">Nenhuma melhoria necessária nesta semana.</p>';

  const sourcesHtml = payload.researchSources && payload.researchSources.length > 0
    ? `<div style="margin-top:24px;padding:16px;background:#111;border-radius:8px;">
        <div style="color:#6b7280;font-size:11px;font-weight:700;text-transform:uppercase;margin-bottom:8px;">FONTES DE PESQUISA</div>
        <ul style="margin:0;padding-left:20px;color:#6b7280;font-size:12px;">
          ${payload.researchSources.map(s => `<li>${s}</li>`).join('')}
        </ul>
      </div>`
    : '';

  const updatedPromptSection = payload.updatedPromptContent
    ? `<div style="margin-top:24px;padding:16px;background:#0a1a0a;border:1px solid #1a3a1a;border-radius:8px;">
        <div style="color:#22c55e;font-size:11px;font-weight:700;text-transform:uppercase;margin-bottom:8px;">CONTEÚDO ATUALIZADO DO ARTIFACT</div>
        <pre style="color:#86efac;font-size:11px;white-space:pre-wrap;font-family:monospace;overflow:auto;max-height:400px;">${payload.updatedPromptContent}</pre>
      </div>`
    : '';

  return `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#0d0d0d;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:680px;margin:0 auto;padding:24px;">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#1a1a1a,#0d0d0d);border:1px solid #2a2a2a;border-radius:12px;padding:28px;margin-bottom:20px;text-align:center;">
      <div style="color:#f97316;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin-bottom:8px;">NeuroAds · Revisão Semanal de Agentes</div>
      <h1 style="color:#fff;font-size:22px;font-weight:700;margin:0 0 8px;">${payload.agentTitle}</h1>
      <div style="margin-top:12px;">${statusBadge}</div>
    </div>

    <!-- Summary -->
    <div style="background:#1a1a1a;border-radius:10px;padding:20px;margin-bottom:16px;">
      <div style="color:#f97316;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:10px;">SUMÁRIO DA PESQUISA</div>
      <p style="color:#d1d5db;font-size:14px;line-height:1.6;margin:0;">${payload.summary}</p>
    </div>

    <!-- Improvements -->
    <div style="background:#1a1a1a;border-radius:10px;padding:20px;margin-bottom:16px;">
      <div style="color:#f97316;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:12px;">
        MELHORIAS IDENTIFICADAS (${payload.improvements.length})
      </div>
      ${improvementsHtml}
    </div>

    ${updatedPromptSection}
    ${sourcesHtml}

    <!-- Footer -->
    <div style="text-align:center;margin-top:24px;padding:16px;color:#4b5563;font-size:11px;">
      <div>Gerado automaticamente pelo Sistema de Auto-Atualização de Agentes · NeuroAds</div>
      <div style="margin-top:4px;">Revisão semanal · ${new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
    </div>

  </div>
</body>
</html>`;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as AgentUpdatePayload;

    if (body.secret !== process.env.AGENT_UPDATE_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!body.agentSlug || !body.agentTitle) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const subject = body.hasImprovements
      ? `[NeuroAds Agentes] ${body.agentTitle} — ${body.improvements.length} melhorias identificadas`
      : `[NeuroAds Agentes] ${body.agentTitle} — Revisão concluída, sem alterações`;

    await sendLuccaOperationalEmail({
      to: 'avante@neuroads.com.br',
      subject,
      html: buildEmailHtml(body),
      textFallback: `Revisão semanal do agente ${body.agentTitle}.\n\n${body.summary}\n\nMelhorias: ${body.improvements.length}`,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[agent-update-report] Erro:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
