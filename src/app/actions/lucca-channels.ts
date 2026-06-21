'use server';

import { addDoc, collection, doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { getFirebaseDb } from '../../lib/firebase';
import { sendLuccaOperationalEmail } from '../../lib/mail';
import { logEvent, timed } from '../../lib/observability';

type ChannelType = 'email';
type FrontType = 'Comercial' | 'Pós-venda' | 'Captação' | 'Suporte';

export async function sendLuccaChannelMessageAction(input: {
  workspaceUserId: string;
  taskId?: string;
  front: FrontType;
  channel: ChannelType;
  to: string;
  subject?: string;
  message: string;
  clientName: string;
}) {
  if (!input.workspaceUserId) {
    return { success: false, error: 'workspaceUserId obrigatório.' };
  }

  if (!input.to?.trim() || !input.message?.trim()) {
    return { success: false, error: 'Destino e mensagem são obrigatórios.' };
  }

  let delivery:
    | { success: true; messageId?: string; providerMeta?: unknown }
    | { success: false; error: string };

  if (input.channel !== 'email') {
    return { success: false, error: 'Canal não suportado nesta versão operacional.' };
  }

  const subject = input.subject?.trim() || `Lucca | ${input.front} | ${input.clientName}`;

  const html = `
      <div style="font-family:'Inter',system-ui,-apple-system,sans-serif;max-width:640px;margin:0 auto;background:#ffffff;color:#0f172a;padding:24px;border:1px solid #e2e8f0;border-radius:12px;">
        <p style="font-size:12px;text-transform:uppercase;letter-spacing:.12em;color:#f97316;font-weight:700;margin:0 0 12px;">Lucca Secretário Executivo</p>
        <h2 style="margin:0 0 8px;font-size:22px;line-height:1.2;color:#0f172a;">${subject}</h2>
        <p style="margin:0 0 16px;color:#334155;font-size:14px;">Frente: <strong>${input.front}</strong> • Cliente: <strong>${input.clientName}</strong></p>
        <div style="background:#f8fafc;border:1px solid #e2e8f0;padding:16px;border-radius:10px;white-space:pre-wrap;font-size:14px;line-height:1.6;color:#0f172a;">${input.message}</div>
        <p style="margin:18px 0 0;font-size:12px;color:#64748b;">Mensagem enviada automaticamente pelo Lucca (NeuroAds).</p>
      </div>
    `;

  logEvent({
    event: 'lucca.email.dispatch.started',
    context: { workspaceUserId: input.workspaceUserId, hasTaskId: Boolean(input.taskId), front: input.front },
  });

  const attemptSend = async (attempt: number) => {
    const result = await sendLuccaOperationalEmail({
      to: input.to.trim(),
      subject,
      html,
      textFallback: input.message,
      replyTo: 'contato.neuroads@gmail.com',
    });
    logEvent({
      event: `lucca.email.dispatch.attempt_${attempt}`,
      level: result.success ? 'info' : 'warn',
      context: {
        workspaceUserId: input.workspaceUserId,
        success: result.success,
        error: result.success ? '' : result.error,
      },
    });
    return result;
  };

  const primary = await timed('lucca.email.send.primary', async () => attemptSend(1));
  if (!primary.success) {
    const secondary = await timed('lucca.email.send.retry', async () => attemptSend(2));
    if (!secondary.success) {
      delivery = { success: false, error: secondary.error || primary.error || 'Falha ao enviar email.' };
    } else {
      delivery = { success: true, messageId: secondary.messageId };
    }
  } else {
    delivery = { success: true, messageId: primary.messageId };
  }

  const db = getFirebaseDb();

  await addDoc(collection(db, 'admin_workspaces', input.workspaceUserId, 'crm_interactions'), {
    front: input.front,
    channel: input.channel,
    to: input.to.trim(),
    subject: input.subject?.trim() || '',
    message: input.message.trim(),
    clientName: input.clientName,
    deliveryStatus: delivery.success ? 'sent' : 'failed',
    deliveryError: delivery.success ? '' : delivery.error,
    providerMessageId: delivery.success ? delivery.messageId || '' : '',
    providerMeta: delivery.success ? delivery.providerMeta || {} : {},
    source: 'Lucca Desk Email',
    createdBy: 'lucca-desk',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  if (input.taskId) {
    const taskRef = doc(db, 'admin_workspaces', input.workspaceUserId, 'executive_tasks', input.taskId);
    await updateDoc(taskRef, {
      lastContactChannel: input.channel,
      lastContactAt: serverTimestamp(),
      source: 'Lucca Desk Email',
      updatedAt: serverTimestamp(),
    });
  }

  logEvent({
    event: 'lucca.email.dispatch.completed',
    level: delivery.success ? 'info' : 'warn',
    context: { workspaceUserId: input.workspaceUserId, success: delivery.success, error: delivery.success ? '' : delivery.error },
  });

  return delivery;
}
