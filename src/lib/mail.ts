import nodemailer from 'nodemailer';

export async function sendDiagnosisEmail(to: string, userName: string, platform: string, diagnosisMarkdown: string) {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS; // Use Gmail App Password

  if (!emailUser || !emailPass) {
    console.warn('Configurações de E-mail (EMAIL_USER/EMAIL_PASS) não configuradas.');
    return { success: false, error: 'Configuração ausente' };
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });

    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #ffffff; padding: 40px; border: 1px solid #333;">
        <h1 style="color: #f9a620; text-transform: uppercase; letter-spacing: -1px; margin-bottom: 20px;">Relatório Neural NeuroAds</h1>
        <p style="color: #888; font-size: 14px;">Olá, <strong>${userName}</strong>,</p>
        <p style="color: #ccc; line-height: 1.6;">Seu diagnóstico automático para o canal <strong>${platform}</strong> acaba de ser concluído com sucesso.</p>
        
        <div style="background: #111; border-left: 4px solid #f9a620; padding: 20px; margin: 30px 0; color: #eee; font-family: monospace; white-space: pre-wrap;">
          ${diagnosisMarkdown}
        </div>

        <p style="color: #ccc;">Você também pode acessar este e outros diagnósticos no seu Histórico Neural.</p>
        
        <div style="margin-top: 40px; border-top: 1px solid #333; pt: 20px; text-align: center;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/historico" style="background: #f9a620; color: #000; padding: 12px 24px; text-decoration: none; font-weight: bold; text-transform: uppercase; font-size: 12px;">Ver no Painel</a>
        </div>
        
        <p style="color: #555; font-size: 10px; margin-top: 40px;">Este é um e-mail automático gerado pela NeuroAds AI. Você recebeu este e-mail porque ativou a automação para este canal.</p>
      </div>
    `;

    await transporter.sendMail({
      from: `"NeuroAds AI" <${emailUser}>`,
      to: to,
      subject: `[NeuroAds] Novo Diagnóstico Neural: ${platform}`,
      html: html,
    });

    return { success: true };
  } catch (error) {
    console.error('Erro ao enviar e-mail via Gmail:', error);
    return { success: false, error };
  }
}
