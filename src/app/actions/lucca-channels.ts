'use server';

import { addDoc, collection, doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { getFirebaseDb } from '../../lib/firebase';
import { sendLuccaOperationalEmail } from '../../lib/mail';
import { sendWhatsAppTextMessage } from '../../lib/whatsapp';

type ChannelType = 'email' | 'whatsapp';
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

  if (input.channel === 'email') {
    const subject = input.subject?.trim() || `Lucca | ${input.front} | ${input.clientName}`;

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;background:#ffffff;color:#0f172a;padding:24px;border:1px solid #e2e8f0;border-radius:12px;">
        <p style="font-size:12px;text-transform:uppercase;letter-spacing:.12em;color:#f97316;font-weight:700;margin:0 0 12px;">Lucca Secretário Executivo</p>
        <h2 style="margin:0 0 8px;font-size:22px;line-height:1.2;color:#0f172a;">${subject}</h2>
        <p style="margin:0 0 16px;color:#334155;font-size:14px;">Frente: <strong>${input.front}</strong> • Cliente: <strong>${input.clientName}</strong></p>
        <div style="background:#f8fafc;border:1px solid #e2e8f0;padding:16px;border-radius:10px;white-space:pre-wrap;font-size:14px;line-height:1.6;color:#0f172a;">${input.message}</div>
        <p style="margin:18px 0 0;font-size:12px;color:#64748b;">Mensagem enviada automaticamente pelo Lucca (NeuroAds).</p>
      </div>
    `;

    const result = await sendLuccaOperationalEmail({
      to: input.to.trim(),
      subject,
      html,
      textFallback: input.message,
    });

    if (!result.success) {
      delivery = { success: false, error: result.error || 'Falha ao enviar email.' };
    } else {
      delivery = { success: true, messageId: result.messageId };
    }
  } else {
    const waResult = await sendWhatsAppTextMessage(input.to.trim(), input.message.trim());

    if (!waResult.success) {
      delivery = { success: false, error: waResult.error || 'Falha ao enviar WhatsApp.' };
    } else {
      delivery = {
        success: true,
        messageId: waResult.messageId,
        providerMeta: { contactWaId: waResult.contactWaId },
      };
    }
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
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  if (input.taskId) {
    const taskRef = doc(db, 'admin_workspaces', input.workspaceUserId, 'executive_tasks', input.taskId);
    await updateDoc(taskRef, {
      lastContactChannel: input.channel,
      lastContactAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  return delivery;
}