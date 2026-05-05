import { NextRequest, NextResponse } from 'next/server';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { getFirebaseDb } from '../../../../../lib/firebase';

function inferFront(subject: string, body: string): 'Comercial' | 'Pós-venda' | 'Captação' | 'Suporte' {
  const text = `${subject} ${body}`.toLowerCase();
  if (/(erro|falha|suporte|ajuda|problema|bug)/.test(text)) return 'Suporte';
  if (/(renova|reembolso|cancel|churn|entrega|implant)/.test(text)) return 'Pós-venda';
  if (/(tráfego|campanha|leads|captação|seo|geo|google|meta)/.test(text)) return 'Captação';
  return 'Comercial';
}

export async function POST(request: NextRequest) {
  const auth = request.headers.get('authorization') || '';
  const token = process.env.EMAIL_INBOUND_WEBHOOK_TOKEN;
  const workspaceUserId = process.env.LUCCA_DEFAULT_WORKSPACE_USER_ID;

  if (!token) {
    return NextResponse.json({ ok: false, error: 'EMAIL_INBOUND_WEBHOOK_TOKEN não configurado.' }, { status: 500 });
  }

  if (!workspaceUserId) {
    return NextResponse.json({ ok: false, error: 'LUCCA_DEFAULT_WORKSPACE_USER_ID não configurado.' }, { status: 500 });
  }

  if (auth !== `Bearer ${token}`) {
    return NextResponse.json({ ok: false, error: 'Não autorizado.' }, { status: 401 });
  }

  const payload = await request.json().catch(() => null);
  if (!payload) {
    return NextResponse.json({ ok: false, error: 'Payload inválido.' }, { status: 400 });
  }

  const from = String(payload.from || payload.sender || 'desconhecido@dominio.com');
  const subject = String(payload.subject || 'Inbound Email');
  const body = String(payload.text || payload.body || payload.html || '[sem conteúdo textual]');
  const clientName = String(payload.clientName || from.split('@')[0] || 'Contato inbound');
  const front = inferFront(subject, body);

  const db = getFirebaseDb();

  await addDoc(collection(db, 'admin_workspaces', workspaceUserId, 'executive_tasks'), {
    front,
    clientName,
    title: `Inbound Email de ${clientName}`,
    details: `${subject}\n\n${body}`,
    channel: 'Email',
    owner: 'Lucca',
    status: 'Novo',
    priority: 'Média',
    score: 38,
    luccaSummary: 'Demanda captada automaticamente via Email. Aguardando triagem do Lucca.',
    dueDate: '',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  await addDoc(collection(db, 'admin_workspaces', workspaceUserId, 'crm_interactions'), {
    front,
    channel: 'email',
    to: from,
    subject,
    message: body,
    clientName,
    deliveryStatus: 'sent',
    deliveryError: '',
    providerMessageId: String(payload.messageId || ''),
    providerMeta: { inbound: true },
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return NextResponse.json({ ok: true });
}