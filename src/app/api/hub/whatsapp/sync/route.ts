import { NextResponse } from 'next/server';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { getFirebaseDb } from '@/lib/firebase';
import { fetchKapsoMessages, type KapsoInboundMessage } from '@/lib/kapso';
import { generateVitorSdrResponse, getWhatsAppConnectionForUser, isMasterWhatsAppOwner, isSamePhoneNumber, type WhatsAppChatThread, type WhatsAppMessage } from '@/lib/whatsapp-hub';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { userId, apiKey: reqApiKey, phoneNumberId: reqPhoneId } = body || {};

    if (!userId && !reqApiKey) {
      return NextResponse.json({ error: 'userId ou credenciais Kapso necessárias.' }, { status: 400 });
    }

    let apiKey = reqApiKey;
    let phoneNumberId = reqPhoneId;

    if (userId && (!apiKey || !phoneNumberId)) {
      const conn = await getWhatsAppConnectionForUser(userId);
      if (conn) {
        apiKey = conn.apiKey;
        phoneNumberId = conn.phoneNumberId;
      }
    }

    // Fallback to environment credentials if process.env.KAPSO_API_KEY is available
    if (!apiKey) {
      apiKey = process.env.KAPSO_API_KEY || '';
    }
    if (!phoneNumberId) {
      phoneNumberId = process.env.KAPSO_PHONE_NUMBER_ID || '597907523413541';
    }

    if (!apiKey || !phoneNumberId) {
      return NextResponse.json({
        success: false,
        error: 'Nenhuma conexão ativa do WhatsApp Business (Kapso) encontrada.',
      }, { status: 400 });
    }

    // 1. Fetch live messages from Kapso Inbox API
    const kapsoRes = await fetchKapsoMessages(phoneNumberId, apiKey, 100);
    const kapsoMsgs = kapsoRes.messages || [];

    const db = getFirebaseDb();
    if (!db) {
      return NextResponse.json({ error: 'Banco de dados Firestore não inicializado.' }, { status: 500 });
    }

    // 2. Determine target user & master ownership
    const targetId = userId || process.env.LUCCA_DEFAULT_WORKSPACE_USER_ID || 'default_user';
    let isMaster = false;

    if (targetId) {
      const userDoc = await getDoc(doc(db, 'users', targetId));
      const userEmail = userDoc.data()?.email;
      if (userEmail && isMasterWhatsAppOwner(userEmail)) {
        isMaster = true;
      }
    }

    const userDocRef = doc(db, 'users', targetId, 'whatsapp_data', 'conversations');
    const userSnap = await getDoc(userDocRef);
    let chats: WhatsAppChatThread[] = [];

    if (userSnap.exists() && Array.isArray(userSnap.data()?.chats)) {
      chats = userSnap.data()?.chats as WhatsAppChatThread[];
    }

    // If master owner, also merge website landing page widget leads from public_whatsapp_chats/main
    if (isMaster) {
      const publicRef = doc(db, 'public_whatsapp_chats', 'main');
      const pubSnap = await getDoc(publicRef);
      if (pubSnap.exists() && Array.isArray(pubSnap.data()?.chats)) {
        const pubChats = pubSnap.data()?.chats as WhatsAppChatThread[];
        for (const pubChat of pubChats) {
          if (!chats.some((c) => c.id === pubChat.id || isSamePhoneNumber(c.leadPhone, pubChat.leadPhone))) {
            chats.push(pubChat);
          }
        }
      }
    }

    // 3. Process and merge messages from Kapso Inbox
    if (kapsoMsgs.length > 0) {
      const messagesByPhone: Record<string, KapsoInboundMessage[]> = {};

      for (const msg of kapsoMsgs) {
        const phone = msg.direction === 'outbound' ? (msg.to || '') : (msg.from || '');
        const cleanPhone = phone.replace(/\D/g, '');
        if (!cleanPhone) continue;

        if (!messagesByPhone[cleanPhone]) {
          messagesByPhone[cleanPhone] = [];
        }
        messagesByPhone[cleanPhone].push(msg);
      }

      for (const [phone, rawMsgs] of Object.entries(messagesByPhone)) {
        const threadId = `chat-${phone}`;
        const existingIdx = chats.findIndex((c) => c.id === threadId || isSamePhoneNumber(c.leadPhone, phone));

        const formattedMsgs: WhatsAppMessage[] = rawMsgs.map((m) => {
          const text = m.text?.body || m.body || '[Mensagem WhatsApp]';
          const isLead = m.direction !== 'outbound' && m.from === phone;
          const senderName = isLead
            ? (m.contact_name || `Contato ${phone}`)
            : (m.sender_name || 'Atendente (Kapso)');

          const rawTime = m.timestamp
            ? (typeof m.timestamp === 'number'
                ? new Date(m.timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : String(m.timestamp))
            : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

          return {
            id: m.id || `msg-${Date.now()}-${Math.random()}`,
            chatId: threadId,
            sender: isLead ? 'lead' : 'human',
            senderName,
            text,
            timestamp: rawTime,
            status: 'delivered',
          };
        });

        const lastRaw = rawMsgs[rawMsgs.length - 1];
        const lastText = lastRaw?.text?.body || lastRaw?.body || '[Mensagem WhatsApp]';
        const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        if (existingIdx >= 0) {
          const target = chats[existingIdx];
          const existingMsgIds = new Set(target.messages.map((m) => m.id));
          const newMsgs = formattedMsgs.filter((m) => !existingMsgIds.has(m.id));
          const hasNewLeadMsg = newMsgs.some((m) => m.sender === 'lead');

          let updatedStatus = target.status;
          let updatedMessages = [...target.messages, ...newMsgs];

          if (hasNewLeadMsg) {
            const aiResp = generateVitorSdrResponse(lastText, target.leadName);
            updatedStatus = aiResp.shouldHandoff ? 'human_pending' : 'ai_active';

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
            updatedMessages.push(aiMsg);
          }

          const updatedChat: WhatsAppChatThread = {
            ...target,
            lastMessage: lastText,
            lastMessageTime: nowTime,
            unreadCount: hasNewLeadMsg ? (target.unreadCount || 0) + newMsgs.length : target.unreadCount,
            status: updatedStatus,
            messages: updatedMessages,
            updatedAt: Date.now(),
          };

          chats.splice(existingIdx, 1);
          chats.unshift(updatedChat);
        } else {
          const aiResp = generateVitorSdrResponse(lastText, rawMsgs[0]?.contact_name || `Contato ${phone}`);
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
            leadName: rawMsgs[0]?.contact_name || `Contato ${phone}`,
            leadPhone: phone,
            funnelStage: 'Atração',
            status: aiResp.shouldHandoff ? 'human_pending' : 'ai_active',
            activeAgent: {
              id: 'vitor-sdr',
              name: 'Vitor (SDR)',
              role: 'Agente de Qualificação',
              avatar: '/images/vitor.png',
              color: '#FF6A00',
            },
            lastMessage: lastText,
            lastMessageTime: nowTime,
            unreadCount: 1,
            sentiment: 'warm',
            tags: ['WhatsApp Kapso'],
            messages: [...formattedMsgs, aiMsg],
            updatedAt: Date.now(),
          };

          chats.unshift(newChat);
        }
      }
    }

    // Save synced chats to Firestore user document
    await setDoc(userDocRef, { chats, updatedAt: Date.now() }, { merge: true });

    // If master owner, also update central public_whatsapp_chats/main for site widget live sync
    if (isMaster) {
      const publicRef = doc(db, 'public_whatsapp_chats', 'main');
      await setDoc(publicRef, { chats, updatedAt: Date.now() }, { merge: true });
    }

    return NextResponse.json({
      success: true,
      syncedMessagesCount: kapsoMsgs.length,
      chatsCount: chats.length,
      chats,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Falha na sincronização Kapso WhatsApp.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
