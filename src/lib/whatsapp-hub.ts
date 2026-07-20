import { doc, getDoc, setDoc } from 'firebase/firestore';
import { getFirebaseDb } from './firebase';

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
}

/* ── Initial Mock / Default Threads for Immediate Rich Experience ──────── */

export const INITIAL_WHATSAPP_CHATS: WhatsAppChatThread[] = [
  {
    id: 'wa-chat-1',
    leadName: 'Carlos Eduardo',
    leadPhone: '+55 (11) 98765-4321',
    leadEmail: 'carlos.eduardo@directborrachas.com.br',
    leadCompany: 'Direct Borrachas S.A.',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    funnelStage: 'Conversão',
    status: 'human_pending',
    activeAgent: {
      id: 'vitor',
      name: 'Vitor (SDR)',
      role: 'SDR & Qualificação',
      avatar: '/avatars/vitor.png',
      color: '#FF6A00',
    },
    lastMessage: 'Preciso fechar ainda hoje com o desconto mencionado. Pode me mandar a proposta ajustada?',
    lastMessageTime: '11:42',
    unreadCount: 2,
    sentiment: 'hot',
    handoffRequestedAt: '11:40',
    handoffReason: 'Lead solicitou proposta comercial customizada e desconto especial para fechamento hoje. Requer atendimento humano urgente.',
    tags: ['Decisor', 'Orçamento Solicitado', 'Prioridade Alta'],
    notes: 'Cliente interessado no plano Max Anual. Comparou com concorrente X. Aceita contrato de 12 meses.',
    messages: [
      {
        id: 'm1',
        chatId: 'wa-chat-1',
        sender: 'lead',
        senderName: 'Carlos Eduardo',
        text: 'Olá! Vi o anúncio da NeuroAds sobre automação de vendas por IA. Como funciona o plano para equipe de 10 vendedores?',
        timestamp: '11:20',
      },
      {
        id: 'm2',
        chatId: 'wa-chat-1',
        sender: 'agent',
        senderName: 'Vitor (SDR)',
        agentId: 'vitor',
        text: 'Olá Carlos! Que excelente iniciativa! Nossos Agentes de IA assumem a prospecção e qualificam leads 24h por dia no WhatsApp e e-mail. Para uma equipe do seu porte, o plano Enterprise/Max oferece multi-agentes simultâneos. Qual é o seu nicho atual?',
        timestamp: '11:22',
      },
      {
        id: 'm3',
        chatId: 'wa-chat-1',
        sender: 'lead',
        senderName: 'Carlos Eduardo',
        text: 'Somos distribuidora industrial. Temos cerca de 300 leads entrando por semana, mas o time demora para responder.',
        timestamp: '11:26',
      },
      {
        id: 'm4',
        chatId: 'wa-chat-1',
        sender: 'agent',
        senderName: 'Vitor (SDR)',
        agentId: 'vitor',
        text: 'Perfeito! Com essa demanda, nossa IA responde em menos de 10 segundos, qualifica o perfil de compra do cliente e transfere o lead quente direto para seus vendedores no WhatsApp com resumo pronto!',
        timestamp: '11:28',
      },
      {
        id: 'm5',
        chatId: 'wa-chat-1',
        sender: 'lead',
        senderName: 'Carlos Eduardo',
        text: 'Sensacional. Qual o investimento e prazo para rodar? Se tiver desconto comercial para contrato anual fechamos hoje.',
        timestamp: '11:38',
      },
      {
        id: 'm6',
        chatId: 'wa-chat-1',
        sender: 'system',
        senderName: 'Sistema NeuroAds',
        text: '⚡ Vitor (SDR) identificou oportunidade de fechamento e encaminhou este atendimento para um Especialista Humano. Motivo: Lead pediu proposta customizada com desconto comercial.',
        timestamp: '11:40',
        handoffReason: 'Lead solicitou proposta comercial customizada e desconto especial para fechamento hoje. Requer atendimento humano urgente.',
      },
      {
        id: 'm7',
        chatId: 'wa-chat-1',
        sender: 'lead',
        senderName: 'Carlos Eduardo',
        text: 'Preciso fechar ainda hoje com o desconto mencionado. Pode me mandar a proposta ajustada?',
        timestamp: '11:42',
      },
    ],
  },
  {
    id: 'wa-chat-2',
    leadName: 'Dra. Mariana Costa',
    leadPhone: '+55 (21) 99123-8877',
    leadEmail: 'contato@clinicadermatoshine.com.br',
    leadCompany: 'Clínica Dermato Shine',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    funnelStage: 'Engajamento',
    status: 'ai_active',
    activeAgent: {
      id: 'taina',
      name: 'Tainá (Nutrição)',
      role: 'Nutrição & Conteúdo',
      avatar: '/avatars/taina.png',
      color: '#3EE59A',
    },
    lastMessage: 'Enviei o e-book com os 5 protocolos de rejuvenescimento no seu e-mail! Gostaria de agendar uma demonstração rápida?',
    lastMessageTime: '10:15',
    unreadCount: 0,
    sentiment: 'warm',
    tags: ['Estética', 'Inbound Marketing', 'Nutrição Ativa'],
    notes: 'Interessada em automação de agendamentos no WhatsApp da clínica.',
    messages: [
      {
        id: 'm21',
        chatId: 'wa-chat-2',
        sender: 'lead',
        senderName: 'Dra. Mariana Costa',
        text: 'Bom dia! Baixei o material sobre marketing médico e gostaria de tirar dúvidas.',
        timestamp: '09:50',
      },
      {
        id: 'm22',
        chatId: 'wa-chat-2',
        sender: 'agent',
        senderName: 'Tainá (Nutrição)',
        agentId: 'taina',
        text: 'Olá Dra. Mariana! Que ótimo ter você por aqui. Nossa IA foi treinada com as melhores práticas de atração ética para clínicas e profissionais de saúde.',
        timestamp: '09:52',
      },
      {
        id: 'm23',
        chatId: 'wa-chat-2',
        sender: 'agent',
        senderName: 'Tainá (Nutrição)',
        agentId: 'taina',
        text: 'Enviei o e-book com os 5 protocolos de rejuvenescimento no seu e-mail! Gostaria de agendar uma demonstração rápida?',
        timestamp: '10:15',
      },
    ],
  },
  {
    id: 'wa-chat-3',
    leadName: 'Ricardo Santos',
    leadPhone: '+55 (31) 97788-5544',
    leadEmail: 'ricardo@logisticaexpress.com',
    leadCompany: 'Logística Express',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    funnelStage: 'Conversão',
    status: 'human_active',
    activeAgent: {
      id: 'breno',
      name: 'Breno (Closer)',
      role: 'Fechamento & Propostas',
      avatar: '/avatars/breno.png',
      color: '#5AAEFF',
    },
    lastMessage: 'Proposta enviada no seu WhatsApp! Me avise quando puder validar o contrato.',
    lastMessageTime: '09:30',
    unreadCount: 0,
    sentiment: 'hot',
    tags: ['Proposta Enviada', 'Atendimento Humano', 'Logística'],
    notes: 'Reunião realizada ontem. Atendente humano assumiu para detalhar cláusula de SLA.',
    messages: [
      {
        id: 'm31',
        chatId: 'wa-chat-3',
        sender: 'lead',
        senderName: 'Ricardo Santos',
        text: 'Olá, conferi os detalhes da reunião de ontem.',
        timestamp: '09:10',
      },
      {
        id: 'm32',
        chatId: 'wa-chat-3',
        sender: 'system',
        senderName: 'Sistema NeuroAds',
        text: '👤 Atendimento assumido por Humano (Operador de Vendas).',
        timestamp: '09:15',
      },
      {
        id: 'm33',
        chatId: 'wa-chat-3',
        sender: 'human',
        senderName: 'Você (Atendente)',
        text: 'Proposta enviada no seu WhatsApp! Me avise quando puder validar o contrato.',
        timestamp: '09:30',
      },
    ],
  },
  {
    id: 'wa-chat-4',
    leadName: 'Amanda Oliveira',
    leadPhone: '+55 (41) 98877-1122',
    leadEmail: 'amanda@techedu.com.br',
    leadCompany: 'TechEdu E-learning',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    funnelStage: 'Retenção',
    status: 'resolved',
    activeAgent: {
      id: 'manu',
      name: 'Manu (Suporte)',
      role: 'Sucesso do Cliente',
      avatar: '/avatars/manu.png',
      color: '#B487F5',
    },
    lastMessage: 'Dúvida sobre integração via webhook resolvida com sucesso. Obrigado!',
    lastMessageTime: 'Ontem',
    unreadCount: 0,
    sentiment: 'warm',
    tags: ['Suporte Concluído', 'Integração Webhook'],
    notes: 'Cliente ativa no plano Pro.',
    messages: [
      {
        id: 'm41',
        chatId: 'wa-chat-4',
        sender: 'lead',
        senderName: 'Amanda Oliveira',
        text: 'Como configuro o webhook de retorno de cadastro?',
        timestamp: 'Ontem 14:10',
      },
      {
        id: 'm42',
        chatId: 'wa-chat-4',
        sender: 'agent',
        senderName: 'Manu (Suporte)',
        agentId: 'manu',
        text: 'Oi Amanda! Você encontra a chave do Webhook em Integrações > Webhooks Globais. Basta colar a URL de destino!',
        timestamp: 'Ontem 14:12',
      },
      {
        id: 'm43',
        chatId: 'wa-chat-4',
        sender: 'lead',
        senderName: 'Amanda Oliveira',
        text: 'Dúvida sobre integração via webhook resolvida com sucesso. Obrigado!',
        timestamp: 'Ontem 14:20',
      },
    ],
  },
];

/* ── Storage & Sync Functions ───────────────────────────────────────────── */

const STORAGE_KEY = 'neuroads_whatsapp_chats_v1';

export function getWhatsAppStorageKey(userId?: string | null): string {
  return userId ? `${STORAGE_KEY}_${userId}` : `${STORAGE_KEY}_guest`;
}

export function loadWhatsAppChats(userId?: string | null): WhatsAppChatThread[] {
  if (typeof window === 'undefined') return INITIAL_WHATSAPP_CHATS;

  try {
    const key = getWhatsAppStorageKey(userId);
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(INITIAL_WHATSAPP_CHATS));
      return INITIAL_WHATSAPP_CHATS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_WHATSAPP_CHATS;
  } catch (err) {
    console.error('Error loading WhatsApp chats:', err);
    return INITIAL_WHATSAPP_CHATS;
  }
}

export function saveWhatsAppChats(chats: WhatsAppChatThread[], userId?: string | null): void {
  if (typeof window === 'undefined') return;

  try {
    const key = getWhatsAppStorageKey(userId);
    localStorage.setItem(key, JSON.stringify(chats));

    // Also async save to Firestore if user logged in
    if (userId) {
      const db = getFirebaseDb();
      if (db) {
        const docRef = doc(db, 'users', userId, 'whatsapp_data', 'conversations');
        setDoc(docRef, { chats, updatedAt: Date.now() }, { merge: true }).catch((err) => {
          console.warn('Non-fatal error syncing WhatsApp chats to Firestore:', err);
        });
      }
    }
  } catch (err) {
    console.error('Error saving WhatsApp chats:', err);
  }
}

export async function fetchFirestoreWhatsAppChats(userId: string): Promise<WhatsAppChatThread[] | null> {
  try {
    const db = getFirebaseDb();
    if (!db) return null;

    const docRef = doc(db, 'users', userId, 'whatsapp_data', 'conversations');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      if (Array.isArray(data?.chats) && data.chats.length > 0) {
        return data.chats as WhatsAppChatThread[];
      }
    }
  } catch (err) {
    console.warn('Error fetching Firestore WhatsApp chats:', err);
  }
  return null;
}
