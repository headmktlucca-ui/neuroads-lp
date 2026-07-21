import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { getFirebaseDb } from './firebase';
import { syncWhatsAppChatsToCRM } from './crm-sync';

export const MASTER_WHATSAPP_EMAIL = 'avante@neuroads.com.br';

export function isMasterWhatsAppOwner(email?: unknown): boolean {
  if (typeof email !== 'string') return false;
  return email.trim().toLowerCase() === MASTER_WHATSAPP_EMAIL;
}

export type WhatsAppMessageSender = 'lead' | 'agent' | 'human' | 'system';

export interface WhatsAppMessage {
  id: string;
  chatId: string;
  sender: WhatsAppMessageSender;
  senderName: string;
  agentId?: string;
  text: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'document' | 'audio' | 'video';
  timestamp: string;
  status?: 'sent' | 'delivered' | 'read' | 'pending' | 'failed';
  handoffReason?: string;
}

export type WhatsAppChatStatus = 'ai_active' | 'human_pending' | 'human_active' | 'resolved';

export type LeadSentiment = 'hot' | 'warm' | 'cold' | 'risk';

export interface ActiveAgentInfo {
  id: string;
  name: string;
  role: string;
  avatar: string;
  color: string;
}

export interface WhatsAppChatThread {
  id: string;
  leadName: string;
  leadPhone: string;
  leadEmail?: string;
  leadCompany?: string;
  avatarUrl?: string;
  funnelStage: 'Atração' | 'Engajamento' | 'Conversão' | 'Retenção';
  status: WhatsAppChatStatus;
  activeAgent: ActiveAgentInfo;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  sentiment: LeadSentiment;
  handoffRequestedAt?: string;
  handoffReason?: string;
  tags: string[];
  notes?: string;
  messages: WhatsAppMessage[];
  updatedAt?: number;
}

/* ── Zero Mock Data — Real Conversations Only ───────────────────────────── */
export const INITIAL_WHATSAPP_CHATS: WhatsAppChatThread[] = [];

const STORAGE_KEY = 'neuroads_whatsapp_chats_v3';

export function getWhatsAppStorageKey(userId?: string | null): string {
  return userId ? `${STORAGE_KEY}_${userId}` : `${STORAGE_KEY}_guest`;
}

export function loadWhatsAppChats(userId?: string | null): WhatsAppChatThread[] {
  if (typeof window === 'undefined') return [];

  try {
    const key = getWhatsAppStorageKey(userId);
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Error loading WhatsApp chats:', err);
    return [];
  }
}

export function saveWhatsAppChats(
  chats: WhatsAppChatThread[],
  userId?: string | null,
  userEmail?: string | null
): void {
  if (typeof window === 'undefined') return;

  try {
    const key = getWhatsAppStorageKey(userId);
    localStorage.setItem(key, JSON.stringify(chats));

    // Also update guest key so visitor widget can load instantly
    try {
      localStorage.setItem('neuroads_whatsapp_chats_v3_guest', JSON.stringify(chats));
    } catch { /* noop */ }

    // Broadcast across same-origin tabs and windows instantly
    try {
      if ('BroadcastChannel' in window) {
        const bc = new BroadcastChannel('neuroads_wa_sync');
        bc.postMessage({ type: 'WA_CHATS_UPDATED', chats });
        bc.close();
      }
      window.dispatchEvent(new CustomEvent('neuroads_wa_local_update', { detail: chats }));
    } catch { /* noop */ }

    // Auto-sync WhatsApp evolution to CRM Funil de Vendas
    syncWhatsAppChatsToCRM(chats, userId).catch(console.warn);

    const db = getFirebaseDb();
    if (db) {
      // Update central public_whatsapp_chats/main ONLY when saved by master owner (avante@neuroads.com.br) or site visitor
      if (isMasterWhatsAppOwner(userEmail) || !userId) {
        const publicDocRef = doc(db, 'public_whatsapp_chats', 'main');
        setDoc(publicDocRef, { chats, updatedAt: Date.now() }, { merge: true }).catch(console.warn);
      }

      if (userId) {
        const userDocRef = doc(db, 'users', userId, 'whatsapp_data', 'conversations');
        setDoc(userDocRef, { chats, updatedAt: Date.now() }, { merge: true }).catch(console.warn);
      }
    }
  } catch (err) {
    console.error('Error saving WhatsApp chats:', err);
  }
}

export async function fetchFirestoreWhatsAppChats(
  userId?: string | null,
  userEmail?: string | null
): Promise<WhatsAppChatThread[] | null> {
  try {
    const db = getFirebaseDb();
    if (!db) return null;

    // Master owner loads central website channel
    if (isMasterWhatsAppOwner(userEmail)) {
      const publicRef = doc(db, 'public_whatsapp_chats', 'main');
      const pubSnap = await getDoc(publicRef);
      if (pubSnap.exists()) {
        const data = pubSnap.data();
        if (Array.isArray(data?.chats)) {
          return data.chats as WhatsAppChatThread[];
        }
      }
    }

    if (userId) {
      const docRef = doc(db, 'users', userId, 'whatsapp_data', 'conversations');
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        if (Array.isArray(data?.chats)) {
          return data.chats as WhatsAppChatThread[];
        }
      }
    }
  } catch (err) {
    console.warn('Error fetching Firestore WhatsApp chats:', err);
  }
  return null;
}

export function subscribeToWhatsAppChats(
  userId: string | null | undefined,
  userEmailOrCallback: string | null | undefined | ((chats: WhatsAppChatThread[]) => void),
  callback?: (chats: WhatsAppChatThread[]) => void
): () => void {
  const db = getFirebaseDb();
  if (!db) return () => {};

  let userEmail: string | null | undefined = null;
  let onUpdate: (chats: WhatsAppChatThread[]) => void = () => {};

  if (typeof userEmailOrCallback === 'function') {
    onUpdate = userEmailOrCallback;
  } else {
    userEmail = userEmailOrCallback;
    if (callback) onUpdate = callback;
  }

  // Master owner (avante@neuroads.com.br) or visitor receives live landing page widget messages
  const docRef = isMasterWhatsAppOwner(userEmail) || !userId
    ? doc(db, 'public_whatsapp_chats', 'main')
    : doc(db, 'users', userId, 'whatsapp_data', 'conversations');

  return onSnapshot(
    docRef,
    (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (Array.isArray(data?.chats)) {
          onUpdate(data.chats as WhatsAppChatThread[]);
        }
      }
    },
    (err) => {
      console.warn('WhatsApp real-time snapshot error:', err);
    }
  );
}

/* ── Vitor (SDR) AI Persona Response Engine for Live Site Visitor Chat ────── */

export function generateVitorSdrResponse(
  userText: string,
  visitorName: string
): { replyText: string; shouldHandoff: boolean; handoffReason?: string } {
  const lower = userText.toLowerCase();

  // Price / Quote / Discount / Handoff trigger
  if (
    lower.includes('preço') ||
    lower.includes('preco') ||
    lower.includes('valor') ||
    lower.includes('orcamento') ||
    lower.includes('orçamento') ||
    lower.includes('desconto') ||
    lower.includes('proposta') ||
    lower.includes('contratar') ||
    lower.includes('fechar') ||
    lower.includes('falar com humano') ||
    lower.includes('atendente')
  ) {
    return {
      replyText: `Olá ${visitorName}! Entendi perfeitamente sua busca por valores e condições de fechamento. Como nossos planos são dimensionados de acordo com o volume de leads e número de agentes da sua operação, estou acionando um Especialista Humano do nosso time para te apresentar a melhor proposta personalizada agora mesmo!`,
      shouldHandoff: true,
      handoffReason: `Visitante ${visitorName} solicitou cotação comercial/proposta no chat do site. Requer atendimento humano urgente.`,
    };
  }

  if (
    lower.includes('como funciona') ||
    lower.includes('agente') ||
    lower.includes('ia') ||
    lower.includes('automação') ||
    lower.includes('automacao') ||
    lower.includes('plataforma')
  ) {
    return {
      replyText: `Com a NeuroAds, ${visitorName}, seus Agentes de IA atendem leads no WhatsApp em menos de 10 segundos, qualificam a intenção de compra 24h por dia e passam o lead pronto para seu time de vendas fechar. Qual o nicho ou produto da sua empresa?`,
      shouldHandoff: false,
    };
  }

  if (lower.includes('olá') || lower.includes('ola') || lower.includes('oi') || lower.includes('bom dia') || lower.includes('boa tarde') || lower.includes('boa noite')) {
    return {
      replyText: `Olá, ${visitorName}! Que prazer te receber na NeuroAds. Sou o Vitor, Agente SDR de Inteligência Comercial. Como posso ajudar sua empresa a escalar vendas com IA hoje?`,
      shouldHandoff: false,
    };
  }

  return {
    replyText: `Excelente pergunta, ${visitorName}! Nossa tecnologia conecta diretamente ao seu WhatsApp Business e CRM para transformar visitantes e leads em vendas reais. Gostaria de agendar uma demonstração guiada de 15 minutos ou receber nossa proposta comercial?`,
    shouldHandoff: false,
  };
}

export async function getWhatsAppConnectionForUser(userId: string): Promise<{
  apiKey: string;
  phoneNumberId: string;
  provider: string;
} | null> {
  try {
    const db = getFirebaseDb();
    if (!db) return null;
    const snap = await getDoc(doc(db, 'users', userId));
    if (snap.exists()) {
      const connections = snap.data()?.connections;
      const waConn = connections?.whatsapp_business || connections?.whatsapp;
      if (waConn && (waConn.isActive || waConn.accessToken)) {
        return {
          apiKey: (waConn.accessToken as string) || '',
          phoneNumberId: ((waConn.metadata?.phoneNumberId as string) || waConn.accountId || '') as string,
          provider: ((waConn.metadata?.provider as string) || 'kapso') as string,
        };
      }
    }
  } catch (err) {
    console.warn('Error reading user whatsapp connection:', err);
  }
  return null;
}

export function isSamePhoneNumber(phoneA?: string, phoneB?: string): boolean {
  if (!phoneA || !phoneB) return false;
  const numA = phoneA.replace(/\D/g, '');
  const numB = phoneB.replace(/\D/g, '');
  if (!numA || !numB) return false;
  if (numA === numB) return true;
  const tailA = numA.slice(-8);
  const tailB = numB.slice(-8);
  return tailA === tailB;
}
