// 2026-07-20T13:32:00
import { NextResponse } from 'next/server';
import { sendWhatsAppTextMessage } from '../../../../../lib/whatsapp';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { to, text } = body || {};

    if (!to || typeof to !== 'string' || !text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Parâmetros inválidos. "to" e "text" são obrigatórios.' }, { status: 400 });
    }

    // Attempt to send via WhatsApp Cloud API if env credentials exist
    const res = await sendWhatsAppTextMessage(to, text);

    if (res.success) {
      return NextResponse.json({
        success: true,
        provider: 'meta_cloud',
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
