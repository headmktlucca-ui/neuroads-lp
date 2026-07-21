import { NextRequest, NextResponse } from 'next/server';
import { addDoc, collection, doc, getDoc, getDocs, query, setDoc, serverTimestamp, where } from 'firebase/firestore';
import { getFirebaseDb } from '../../../../../lib/firebase';
import { generateVitorSdrResponse, isSamePhoneNumber, type WhatsAppChatThread, type WhatsAppMessage, type WhatsAppChatStatus } from '../../../../../lib/whatsapp-hub';
import { sendKapsoTextMessage } from '../../../../../lib/kapso';

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
  try {
    const payload = await request.json().catch(() => null);
    if (!payload) {
      return NextResponse.json({ ok: false, error: 'Payload inválido.' }, { status: 400 });
    }

    // 1. Support Kapso native payloads (whatsapp.message.received) and Meta raw forwarded payloads
    const isKapsoNative = payload?.event === 'whatsapp.message.received' || payload?.type === 'whatsapp.message.received';

    let phoneNumberId = '';
    let from = '';
    let textBody = '';
    let clientName = '';
    let messageId = '';

    if (isKapsoNative) {
      phoneNumberId = payload?.phone_number_id || payload?.data?.phone_number_id || payload?.customer_id || '';
      const msgData = payload?.data?.message || payload?.message;
      const contactData = payload?.data?.contact || payload?.contact;
      from = msgData?.from || '';
      textBody = msgData?.text?.body || msgData?.body || msgData?.caption || '[Mensagem WhatsApp]';
      clientName = contactData?.name || `Contato ${from}`;
      messageId = msgData?.id || `wamid-${Date.now()}`;
    } else {
      // Raw Meta payload
      const messageNode = payload?.entry?.[0]?.changes?.[0]?.value;
      const inboundMessage = messageNode?.messages?.[0];
      const contact = messageNode?.contacts?.[0];
      phoneNumberId = messageNode?.metadata?.phone_number_id || '';
      from = inboundMessage?.from || '';
      textBody = inboundMessage?.text?.body || inboundMessage?.caption || '[Mensagem sem texto]';
      clientName = contact?.profile?.name || `Contato ${from}`;
      messageId = inboundMessage?.id || `wamid-${Date.now()}`;
    }

    if (!from) {
      return NextResponse.json({ ok: true, ignored: 'Sem mensagens ou remetente no payload.' });
    }

    const db = getFirebaseDb();
    if (!db) {
      return NextResponse.json({ ok: false, error: 'Banco de dados não disponível.' }, { status: 500 });
    }

    // 2. Identify target user owning this phoneNumberId in Firestore
    let targetUserId = process.env.LUCCA_DEFAULT_WORKSPACE_USER_ID || '';
    let userApiKey = process.env.KAPSO_API_KEY || '';

    if (phoneNumberId) {
      try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('connections.whatsapp_business.metadata.phoneNumberId', '==', phoneNumberId));
        const querySnap = await getDocs(q);
        if (!querySnap.empty) {
          const matchedDoc = querySnap.docs[0];
          targetUserId = matchedDoc.id;
          const conn = matchedDoc.data()?.connections?.whatsapp_business;
          if (conn?.accessToken) {
            userApiKey = conn.accessToken;
          }
        }
      } catch (err) {
        console.warn('Error querying user by phoneNumberId:', err);
      }
    }

    // 3. Load user's conversations from Firestore & update live thread
    const userDocRef = doc(db, 'users', targetUserId || 'default_user', 'whatsapp_data', 'conversations');
    const userSnap = await getDoc(userDocRef);
    let chats: WhatsAppChatThread[] = [];

    if (userSnap.exists() && Array.isArray(userSnap.data()?.chats)) {
      chats = userSnap.data()?.chats as WhatsAppChatThread[];
    }

    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const cleanFrom = from.replace(/\D/g, '');
    const threadId = `chat-${cleanFrom}`;
    const existingIndex = chats.findIndex((c) => c.id === threadId || isSamePhoneNumber(c.leadPhone, from));

    const inboundMsg: WhatsAppMessage = {
      id: messageId,
      chatId: threadId,
      sender: 'lead',
      senderName: clientName,
      text: textBody,
      timestamp: nowTime,
      status: 'delivered',
    };

    if (existingIndex >= 0) {
      // Returning contact: re-activate AI response engine regardless of previous status (resolved/human_active)
      const target = chats[existingIndex];
      const leadName = target.leadName || clientName;
      
      const aiResp = generateVitorSdrResponse(textBody, leadName);
      const updatedStatus: WhatsAppChatStatus = aiResp.shouldHandoff ? 'human_pending' : 'ai_active';

      const aiMsg: WhatsAppMessage = {
        id: `ai-${Date.now()}`,
        chatId: target.id,
        sender: 'agent',
        senderName: target.activeAgent?.name || 'Vitor (SDR)',
        agentId: target.activeAgent?.id || 'vitor-sdr',
        text: aiResp.replyText,
        timestamp: nowTime,
        status: 'sent',
      };

      const updatedMessages = [...target.messages, inboundMsg, aiMsg];

      const updatedChat: WhatsAppChatThread = {
        ...target,
        leadName,
        lastMessage: textBody,
        lastMessageTime: nowTime,
        unreadCount: (target.unreadCount || 0) + 1,
        status: updatedStatus,
        handoffReason: aiResp.handoffReason || target.handoffReason,
        messages: updatedMessages,
        updatedAt: Date.now(),
      };

      // Remove from old position and push to front of inbox list
      chats.splice(existingIndex, 1);
      chats.unshift(updatedChat);

      // Auto-reply over Kapso
      if (phoneNumberId && userApiKey) {
        sendKapsoTextMessage(phoneNumberId, from, aiResp.replyText, userApiKey).catch(console.warn);
      }
    } else {
      // New conversation contact
      const aiResp = generateVitorSdrResponse(textBody, clientName);
      const aiMsg: WhatsAppMessage = {
        id: `ai-${Date.now()}`,
        chatId: threadId,
        sender: 'agent',
        senderName: 'Vitor (SDR)',
        agentId: 'vitor-sdr',
        text: aiResp.replyText,
        timestamp: nowTime,
        status: 'sent',
      };

      const newChat: WhatsAppChatThread = {
        id: threadId,
        leadName: clientName,
        leadPhone: from,
        funnelStage: 'Atração',
        status: aiResp.shouldHandoff ? 'human_pending' : 'ai_active',
        activeAgent: {
          id: 'vitor-sdr',
          name: 'Vitor (SDR)',
          role: 'Agente de Qualificação',
          avatar: '/images/vitor.png',
          color: '#FF6A00',
        },
        lastMessage: textBody,
        lastMessageTime: nowTime,
        unreadCount: 1,
        sentiment: 'warm',
        handoffReason: aiResp.handoffReason,
        tags: ['WhatsApp Kapso', 'Inbound'],
        messages: [inboundMsg, aiMsg],
        updatedAt: Date.now(),
      };

      chats.unshift(newChat);

      // Auto-reply over Kapso
      if (phoneNumberId && userApiKey) {
        sendKapsoTextMessage(phoneNumberId, from, aiResp.replyText, userApiKey).catch(console.warn);
      }
    }

    // Save updated chats back to user document in Firestore (triggers live update on WhatsApp page)
    await setDoc(userDocRef, { chats, updatedAt: Date.now() }, { merge: true });

    // Also update public channel if master workspace
    if (!targetUserId || targetUserId === process.env.LUCCA_DEFAULT_WORKSPACE_USER_ID) {
      const publicRef = doc(db, 'public_whatsapp_chats', 'main');
      await setDoc(publicRef, { chats, updatedAt: Date.now() }, { merge: true });
    }

    // 4. Log executive task & crm interaction if workspace ID is available
    if (targetUserId) {
      const front = detectFront(textBody);
      await addDoc(collection(db, 'admin_workspaces', targetUserId, 'executive_tasks'), {
        front,
        clientName,
        title: `Inbound WhatsApp (Kapso) de ${clientName}`,
        details: textBody,
        channel: 'WhatsApp',
        owner: 'Lucca',
        status: 'Novo',
        priority: 'Média',
        score: 40,
        luccaSummary: 'Mensagem recebida via Kapso. Processada pelos Agentes de IA.',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }).catch(console.warn);

      await addDoc(collection(db, 'admin_workspaces', targetUserId, 'crm_interactions'), {
        front,
        channel: 'whatsapp',
        to: from,
        subject: 'Inbound WhatsApp (Kapso)',
        message: textBody,
        clientName,
        deliveryStatus: 'received',
        providerMessageId: messageId,
        providerMeta: { inbound: true, kapso: true, phoneNumberId },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }).catch(console.warn);
    }

    return NextResponse.json({
      ok: true,
      provider: 'kapso',
      phoneNumberId,
      from,
      userId: targetUserId,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Falha no webhook WhatsApp Kapso.';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}