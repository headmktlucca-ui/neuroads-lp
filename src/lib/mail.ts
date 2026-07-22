import nodemailer from 'nodemailer';

function getMailEnv() {
  const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
  const smtpPort = Number(process.env.SMTP_PORT || 465);
  const smtpUser = process.env.SMTP_USER || process.env.EMAIL_USER;
  const smtpPass = process.env.SMTP_PASS || process.env.EMAIL_PASS;
  const smtpFrom = process.env.SMTP_FROM || (smtpUser ? `"NeuroAds AI" <${smtpUser}>` : undefined);

  return {
    smtpHost,
    smtpPort,
    smtpUser,
    smtpPass,
    smtpFrom,
  };
}

function createTransporter() {
  const { smtpHost, smtpPort, smtpUser, smtpPass } = getMailEnv();

  if (!smtpUser || !smtpPass) {
    return null;
  }

  return nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465, // SSL default
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
}

export async function sendLuccaOperationalEmail(input: {
  to: string;
  subject: string;
  html: string;
  textFallback?: string;
  replyTo?: string;
}) {
  const { smtpUser, smtpFrom } = getMailEnv();
  const transporter = createTransporter();

  if (!transporter || !smtpUser) {
    return { success: false, error: 'Configuração SMTP ausente (SMTP_USER/SMTP_PASS).' };
  }

  try {
    const result = await transporter.sendMail({
      from: smtpFrom || `"Lucca" <${smtpUser}>`,
      to: input.to,
      replyTo: input.replyTo,
      subject: input.subject,
      html: input.html,
      text: input.textFallback,
    });
    return { success: true, messageId: result.messageId };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Falha ao enviar email operacional do Lucca.',
    };
  }
}

export async function sendDiagnosisEmail(to: string, userName: string, platform: string, diagnosisMarkdown: string) {
  const { smtpUser, smtpFrom } = getMailEnv();
  const transporter = createTransporter();

  if (!transporter || !smtpUser) {
    console.warn('[Mail] SMTP_USER/SMTP_PASS (ou EMAIL_USER/EMAIL_PASS) não configurados.');
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
      from: smtpFrom || `"NeuroAds AI" <${smtpUser}>`,
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
  const { smtpUser, smtpFrom } = getMailEnv();
  const transporter = createTransporter();

  if (!transporter || !smtpUser) {
    console.warn('[Mail] SMTP_USER/SMTP_PASS (ou EMAIL_USER/EMAIL_PASS) não configurados.');
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
      from: smtpFrom || `"NeuroAds Lead" <${smtpUser}>`,
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

export async function sendDemoRequestEmail(input: {
  name: string;
  email: string;
  company: string;
}) {
  const { smtpUser } = getMailEnv();
  const transporter = createTransporter();

  const senderEmail = 'contato.neuroads@gmail.com';
  const recipientEmail = 'avante@neuroads.com.br';
  const subject = 'Nova Solicitação de Demonstração';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; color: #0f172a; padding: 32px; border: 1px solid #e2e8f0; border-radius: 16px; box-shadow: 0 4px 14px rgba(0,0,0,0.05);">
      <div style="text-align: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid #e2e8f0;">
        <h2 style="color: #FF5500; font-size: 22px; font-weight: 800; margin: 0; text-transform: uppercase; letter-spacing: 0.5px;">NeuroAds AI</h2>
        <p style="color: #64748b; font-size: 13px; font-weight: 600; margin-top: 4px;">Nova Solicitação de Demonstração</p>
      </div>

      <div style="background: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #cbd5e1; margin-bottom: 24px;">
        <h3 style="color: #0f172a; font-size: 15px; margin-top: 0; margin-bottom: 14px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">Dados do Lead / Usuário:</h3>
        <p style="margin: 8px 0; font-size: 14px; color: #334155;"><strong>Nome Completo:</strong> ${input.name}</p>
        <p style="margin: 8px 0; font-size: 14px; color: #334155;"><strong>E-mail Corporativo:</strong> <a href="mailto:${input.email}" style="color: #FF5500; text-decoration: none; font-weight: bold;">${input.email}</a></p>
        <p style="margin: 8px 0; font-size: 14px; color: #334155;"><strong>Empresa:</strong> ${input.company || 'Não informada'}</p>
        <p style="margin: 8px 0; font-size: 14px; color: #334155;"><strong>Data da Solicitação:</strong> ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}</p>
      </div>

      <div style="background: #0f172a; color: #ffffff; padding: 16px; border-radius: 10px; text-align: center; font-size: 12px; font-weight: 600;">
        Solicitação capturada pelo formulário "Solicitar Demonstração" na Landing Page.
      </div>

      <p style="color: #94a3b8; font-size: 11px; text-align: center; margin-top: 24px;">
        © 2026 NeuroAds — E-mail enviado de ${senderEmail} para ${recipientEmail}.
      </p>
    </div>
  `;

  if (!transporter) {
    console.warn('[Mail] Transporter não inicializado (verifique SMTP_USER/SMTP_PASS). Exibindo dados no console:');
    console.log(`[DEMO REQUEST LOG] From: ${senderEmail} | To: ${recipientEmail} | Subject: ${subject}`);
    console.log(`Dados: Nome=${input.name}, Email=${input.email}, Empresa=${input.company}`);
    return { success: true, logged: true };
  }

  try {
    const info = await transporter.sendMail({
      from: `"NeuroAds Contato" <${senderEmail}>`,
      to: recipientEmail,
      replyTo: input.email,
      subject,
      html,
      text: `Nova Solicitação de Demonstração\n\nNome: ${input.name}\nE-mail: ${input.email}\nEmpresa: ${input.company}`,
    });
    console.log(`[Mail] Solicitação de demonstração enviada para ${recipientEmail} (MessageID: ${info.messageId})`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('[Mail] Erro ao enviar e-mail de demonstração:', error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

