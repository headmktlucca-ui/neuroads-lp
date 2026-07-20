import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { getFirebaseDb } from './firebase';
import type { WhatsAppChatThread } from './whatsapp-hub';

export interface LeadLog {
  timestamp: number;
  agentName: string;
  agentCor: string;
  message: string;
}

export type CRMStage = 'capturado' | 'qualificado' | 'proposta' | 'fechamento' | 'ganho';

export interface CRMLead {
  id: string;
  name: string;
  company: string;
  value: number;
  email: string;
  phone: string;
  stage: CRMStage;
  originAgent: string;
  originAgentCor: string;
  statusText: string;
  history: LeadLog[];
  createdAt: number;
  updatedAt?: number;
}

/* ── Stage Mapper from WhatsApp Evolution to CRM Kanban ─────────────────── */

export function mapWhatsAppToCRMStage(chat: WhatsAppChatThread): CRMStage {
  if (chat.status === 'resolved') {
    return 'ganho';
  }
  if (chat.status === 'human_active') {
    return 'fechamento';
  }
  if (chat.status === 'human_pending' || chat.handoffReason) {
    return 'proposta';
  }
  if (chat.sentiment === 'hot' || chat.funnelStage === 'Conversão' || chat.funnelStage === 'Engajamento') {
    return 'qualificado';
  }
  return 'capturado';
}

function calculateEstimatedValue(stage: CRMStage): number {
  switch (stage) {
    case 'ganho':
      return 15000;
    case 'fechamento':
      return 12000;
    case 'proposta':
      return 8500;
    case 'qualificado':
      return 5000;
    case 'capturado':
    default:
      return 3500;
  }
}

function getCRMStorageKey(userId?: string | null): string {
  return userId ? `leads_funil_${userId}` : 'leads_funil_guest';
}

/* ── Sync WhatsApp Chats into CRM Funil de Vendas ───────────────────────── */

export async function syncWhatsAppChatsToCRM(
  chats: WhatsAppChatThread[],
  userId?: string | null
): Promise<CRMLead[]> {
  if (typeof window === 'undefined') return [];

  const key = getCRMStorageKey(userId);
  let existingLeads: CRMLead[] = [];

  // Read current CRM leads
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      existingLeads = JSON.parse(raw);
    }
  } catch (err) {
    console.warn('Error reading local CRM leads:', err);
  }

  const updatedLeads = [...existingLeads];

  for (const chat of chats) {
    const targetStage = mapWhatsAppToCRMStage(chat);
    const existingIndex = updatedLeads.findIndex(
      (l) => l.phone === chat.leadPhone || l.id === chat.id || l.id === `crm-${chat.id}`
    );

    // Build history from messages
    const historyLogs: LeadLog[] = chat.messages.map((m) => ({
      timestamp: Date.now(),
      agentName: m.sender === 'agent' ? m.senderName : m.sender === 'human' ? 'HUMANO (Vendas)' : m.senderName,
      agentCor: m.sender === 'agent' ? '#34D399' : m.sender === 'human' ? '#60A5FA' : '#FBBF24',
      message: `[WhatsApp] ${m.senderName}: ${m.text}`,
    }));

    if (existingIndex >= 0) {
      // Update existing lead with new stage & last activity
      const current = updatedLeads[existingIndex];
      updatedLeads[existingIndex] = {
        ...current,
        name: chat.leadName || current.name,
        company: chat.leadCompany || current.company,
        email: chat.leadEmail || current.email,
        phone: chat.leadPhone || current.phone,
        stage: targetStage,
        value: calculateEstimatedValue(targetStage),
        statusText: `[WhatsApp ${chat.activeAgent.name}] ${chat.lastMessage}`,
        originAgent: `WhatsApp (${chat.activeAgent.name})`,
        originAgentCor: chat.activeAgent.color || '#34D399',
        history: historyLogs.length > 0 ? historyLogs : current.history,
        updatedAt: Date.now(),
      };
    } else {
      // Create new CRM lead from WhatsApp conversation
      const newCRMLead: CRMLead = {
        id: `crm-${chat.id}`,
        name: chat.leadName,
        company: chat.leadCompany || 'Lead Direct WhatsApp',
        value: calculateEstimatedValue(targetStage),
        email: chat.leadEmail || `${chat.leadPhone.replace(/\D/g, '')}@whatsapp.lead`,
        phone: chat.leadPhone,
        stage: targetStage,
        originAgent: `WhatsApp (${chat.activeAgent.name})`,
        originAgentCor: chat.activeAgent.color || '#34D399',
        statusText: `[WhatsApp] ${chat.lastMessage}`,
        history: historyLogs,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      updatedLeads.unshift(newCRMLead);
    }
  }

  // Persist locally
  try {
    localStorage.setItem(key, JSON.stringify(updatedLeads));
  } catch (err) {
    console.warn('Error writing local CRM leads:', err);
  }

  // Sync to Firestore
  try {
    const db = getFirebaseDb();
    if (db) {
      if (userId) {
        const docRef = doc(db, 'users', userId, 'leads_funil', 'main');
        await setDoc(docRef, { leads: updatedLeads, updatedAt: Date.now() }, { merge: true });
      } else {
        const publicDocRef = doc(db, 'public_leads_funil', 'main');
        await setDoc(publicDocRef, { leads: updatedLeads, updatedAt: Date.now() }, { merge: true });
      }
    }
  } catch (err) {
    console.warn('Firestore CRM sync warning:', err);
  }

  return updatedLeads;
}

/* ── Subscribe to Realtime CRM Lead Updates ────────────────────────────── */

export function subscribeToCRMLeads(
  userId: string | null | undefined,
  onUpdate: (leads: CRMLead[]) => void
): () => void {
  const db = getFirebaseDb();
  if (!db) return () => {};

  const docRef = userId
    ? doc(db, 'users', userId, 'leads_funil', 'main')
    : doc(db, 'public_leads_funil', 'main');

  return onSnapshot(
    docRef,
    (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (Array.isArray(data?.leads)) {
          onUpdate(data.leads as CRMLead[]);
        }
      }
    },
    (err) => {
      console.warn('CRM leads real-time snapshot error:', err);
    }
  );
}
