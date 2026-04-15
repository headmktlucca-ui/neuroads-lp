import nodemailer from 'nodemailer';

function createTransporter() {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  if (!emailUser || !emailPass) {
    return null;
  }

  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // SSL
    auth: {
      user: emailUser,
      pass: emailPass,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
}

export async function sendDiagnosisEmail(to: string, userName: string, platform: string, diagnosisMarkdown: string) {
  const emailUser = process.env.EMAIL_USER;
  const transporter = createTransporter();

  if (!transporter || !emailUser) {
    console.warn('[Mail] EMAIL_USER/EMAIL_PASS não configurados.');
    return { success: false, error: 'Configuração ausente' };
  }

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #ffffff; padding: 40px; border: 1px solid #333;">
      <h1 style="color: #f9a620; text-transform: uppercase; letter-spacing: -1px; margin-bottom: 20px;">Relatório Neural NeuroAds</h1>
      <p style="color: #888; font-size: 14px;">Olá, <strong>${userName}</strong>,</p>
      <p style="color: #ccc; line-height: 1.6;">Seu diagnóstico automático para o canal <strong>${platform}</strong> acaba de ser concluído com sucesso.</p>

      <div style="background: #111; border-left: 4px solid #f9a620; padding: 20px; margin: 30px 0; color: #eee; font-family: monospace; white-space: pre-wrap;">
        ${diagnosisMarkdown}
      </div>

      <p style="color: #ccc;">Você também pode acessar este e outros diagnósticos no seu Histórico Neural.</p>

      <div style="margin-top: 40px; border-top: 1px solid #333; padding-top: 20px; text-align: center;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/historico" style="background: #f9a620; color: #000; padding: 12px 24px; text-decoration: none; font-weight: bold; text-transform: uppercase; font-size: 12px;">Ver no Painel</a>
      </div>

      <p style="color: #555; font-size: 10px; margin-top: 40px;">Este é um e-mail automático gerado pela NeuroAds AI.</p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"NeuroAds AI" <${emailUser}>`,
      to,
      subject: `[NeuroAds] Novo Diagnóstico Neural: ${platform}`,
      html,
    });
    console.log(`[Mail] Diagnóstico enviado para ${to}`);
    return { success: true };
  } catch (error) {
    console.error('[Mail] Erro ao enviar diagnóstico:', error);
    return { success: false, error: String(error) };
  }
}

export async function sendStrategyRequestEmail(
  to: string,
  userName: string,
  userEmail: string,
  userWebsite: string = '',
  userPhone: string = '',
  userSituation: string = '',
  selectedAgents: string[] = []
) {
  const emailUser = process.env.EMAIL_USER;
  const transporter = createTransporter();

  if (!transporter || !emailUser) {
    console.warn('[Mail] EMAIL_USER/EMAIL_PASS não configurados.');
    return { success: false, error: 'Configuração ausente' };
  }

  const agentsHtml = selectedAgents.length > 0
    ? selectedAgents.map(agent => `<li style="margin-bottom: 8px;">${agent}</li>`).join('')
    : '<li style="color: #64748b;">Nenhum agente selecionado</li>';

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0b; color: #ffffff; padding: 40px; border: 1px solid #1e293b; border-radius: 12px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #3b82f6; text-transform: uppercase; letter-spacing: 2px; font-size: 24px; margin: 0;">NeuroAds</h1>
        <p style="color: #64748b; font-size: 12px; margin-top: 5px;">STRATEGIC PLANNING REQUEST</p>
      </div>

      <div style="background: #111827; padding: 25px; border-radius: 8px; margin-bottom: 25px; border: 1px solid #1e293b;">
        <h2 style="color: #f1f5f9; font-size: 18px; margin-top: 0; border-bottom: 1px solid #334155; padding-bottom: 10px;">Dados do Lead</h2>
        <p style="margin: 10px 0; color: #cbd5e1;"><strong>Nome:</strong> ${userName}</p>
        <p style="margin: 10px 0; color: #cbd5e1;"><strong>E-mail:</strong> ${userEmail}</p>
        ${userPhone ? `<p style="margin: 10px 0; color: #cbd5e1;"><strong>WhatsApp:</strong> ${userPhone}</p>` : ''}
        ${userWebsite ? `<p style="margin: 10px 0; color: #cbd5e1;"><strong>Site:</strong> <a href="${userWebsite.startsWith('http') ? userWebsite : `https://${userWebsite}`}" style="color: #3b82f6;">${userWebsite}</a></p>` : ''}
        ${userSituation ? `<p style="margin: 10px 0; color: #cbd5e1;"><strong>Situação Atual:</strong> ${userSituation}</p>` : ''}
        <p style="margin: 10px 0; color: #cbd5e1;"><strong>Tag:</strong> <span style="background: #1e3a8a; color: #60a5fa; padding: 2px 8px; border-radius: 4px; font-size: 11px;">Planejamento Inicial</span></p>
      </div>

      <div style="margin-bottom: 30px;">
        <h2 style="color: #f1f5f9; font-size: 18px; margin-bottom: 15px;">Agentes / Ações Selecionados:</h2>
        <ul style="padding-left: 20px; color: #cbd5e1;">
          ${agentsHtml}
        </ul>
      </div>

      <div style="background: #1e293b; padding: 15px; border-radius: 6px; text-align: center; border: 1px solid #334155;">
        <p style="color: #94a3b8; font-size: 13px; margin: 0;">Este lead foi capturado através do Arsenal de Agentes na Landing Page.</p>
      </div>

      <p style="color: #475569; font-size: 10px; margin-top: 30px; text-align: center;">© 2026 NeuroAds - Insights Inteligentes. Todos os direitos reservados.</p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"NeuroAds Lead" <${emailUser}>`,
      to,
      replyTo: userEmail,
      subject: `🎯 Solicitação de Planejamento: ${userName}`,
      html,
    });
    console.log(`[Mail] Solicitação de planejamento enviada para ${to} | Lead: ${userEmail}`);
    return { success: true };
  } catch (error) {
    console.error('[Mail] Erro ao enviar e-mail de planejamento:', error);
    return { success: false, error: String(error) };
  }
}
