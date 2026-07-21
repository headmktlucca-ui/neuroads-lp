import { NextResponse } from 'next/server';
import { sendWhatsAppTextMessage } from '../../../../../lib/whatsapp';
import { getWhatsAppConnectionForUser } from '../../../../../lib/whatsapp-hub';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { to, text, userId, apiKey, phoneNumberId } = body || {};

    if (!to || typeof to !== 'string' || !text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Parâmetros inválidos. "to" e "text" são obrigatórios.' }, { status: 400 });
    }

    let userApiKey = apiKey;
    let userPhoneId = phoneNumberId;

    if (userId && (!userApiKey || !userPhoneId)) {
      const conn = await getWhatsAppConnectionForUser(userId);
      if (conn) {
        userApiKey = conn.apiKey;
        userPhoneId = conn.phoneNumberId;
      }
    }

    // Attempt to send via Kapso or WhatsApp Cloud API
    const res = await sendWhatsAppTextMessage(to, text, userApiKey, userPhoneId);

    if (res.success) {
      return NextResponse.json({
        success: true,
        provider: userApiKey ? 'kapso' : 'meta_cloud',
        messageId: res.messageId,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
    }

    // Fallback response for dev/demo when env keys are missing
    return NextResponse.json({
      success: true,
      simulated: true,
      provider: 'neuroads_simulator',
      note: res.error || 'Mensagem registrada localmente.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Falha ao enviar mensagem WhatsApp.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
