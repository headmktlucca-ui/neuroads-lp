import { NextRequest, NextResponse } from 'next/server';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { getFirebaseDb } from '../../../../../lib/firebase';

const FRONT_KEYWORDS = [
  { front: 'Suporte', terms: ['erro', 'falha', 'suporte', 'ajuda', 'problema', 'bug'] },
  { front: 'Pós-venda', terms: ['renovação', 'upgrade', 'cancel', 'churn', 'reembolso', 'entrega'] },
  { front: 'Captação', terms: ['tráfego', 'campanha', 'leads', 'captação', 'google', 'meta'] },
  { front: 'Comercial', terms: ['proposta', 'orçamento', 'fechar', 'valor', 'contrato', 'negociação'] },
] as const;

function detectFront(message: string): 'Comercial' | 'Pós-venda' | 'Captação' | 'Suporte' {
  const text = message.toLowerCase();
  for (const rule of FRONT_KEYWORDS) {
    if (rule.terms.some((term) => text.includes(term))) {
      return rule.front;
    }
  }
  return 'Comercial';
}

export async function GET(request: NextRequest) {
  const mode = request.nextUrl.searchParams.get('hub.mode');
  const token = request.nextUrl.searchParams.get('hub.verify_token');
  const challenge = request.nextUrl.searchParams.get('hub.challenge');
  const verifyToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || 'neuroads_whatsapp_verify_token_2026';

  if (mode === 'subscribe' && token && challenge) {
    if (token === verifyToken || token === 'neuroads_whatsapp_verify_token_2026') {
      return new NextResponse(challenge, {
        status: 200,
        headers: { 'Content-Type': 'text/plain' },
      });
    }
  }

  return NextResponse.json({ ok: false, error: 'Webhook verification failed' }, { status: 403 });
}

export async function POST(request: NextRequest) {
  const workspaceUserId = process.env.LUCCA_DEFAULT_WORKSPACE_USER_ID;
  if (!workspaceUserId) {
    return NextResponse.json({ ok: false, error: 'LUCCA_DEFAULT_WORKSPACE_USER_ID não configurado.' }, { status: 500 });
  }

  const payload = await request.json().catch(() => null);
  if (!payload) {
    return NextResponse.json({ ok: false, error: 'Payload inválido.' }, { status: 400 });
  }

  const messageNode = payload?.entry?.[0]?.changes?.[0]?.value;
  const inboundMessage = messageNode?.messages?.[0];
  const contact = messageNode?.contacts?.[0];

  if (!inboundMessage) {
    return NextResponse.json({ ok: true, ignored: 'Sem mensagens no payload.' });
  }

  const textBody = inboundMessage?.text?.body || '[Mensagem sem texto]';
  const from = inboundMessage?.from || 'Desconhecido';
  const clientName = contact?.profile?.name || `Contato ${from}`;
  const front = detectFront(textBody);

  const db = getFirebaseDb();

  await addDoc(collection(db, 'admin_workspaces', workspaceUserId, 'executive_tasks'), {
    front,
    clientName,
    title: `Inbound WhatsApp de ${clientName}`,
    details: textBody,
    channel: 'WhatsApp',
    owner: 'Lucca',
    status: 'Novo',
    priority: 'Média',
    score: 40,
    luccaSummary: 'Demanda captada automaticamente via WhatsApp. Aguardando triagem operacional.',
    dueDate: '',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  await addDoc(collection(db, 'admin_workspaces', workspaceUserId, 'crm_interactions'), {
    front,
    channel: 'whatsapp',
    to: from,
    subject: 'Inbound WhatsApp',
    message: textBody,
    clientName,
    deliveryStatus: 'sent',
    deliveryError: '',
    providerMessageId: inboundMessage?.id || '',
    providerMeta: { inbound: true },
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return NextResponse.json({ ok: true });
}