'use client';

import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  Send,
  Search,
  CheckCircle2,
  AlertTriangle,
  User,
  Bot,
  Zap,
  Phone,
  Flame,
  Clock,
  ChevronRight,
  Sparkles,
  ExternalLink,
  Shield,
  Filter,
  Paperclip,
  Smile,
  MoreVertical,
  Check,
  CheckCheck,
  UserCheck,
  RefreshCw,
  Info,
  X,
  FileText,
  Calendar,
  DollarSign,
  Tag,
  ArrowRight,
} from 'lucide-react';

import { useAuth } from '../../../context/AuthContext';
import { loadUserConnections, type ConnectionsMap } from '../../../lib/connector-save';
import {
  loadWhatsAppChats,
  saveWhatsAppChats,
  fetchFirestoreWhatsAppChats,
  subscribeToWhatsAppChats,
  isMasterWhatsAppOwner,
  MASTER_WHATSAPP_EMAIL,
  type WhatsAppChatThread,
  type WhatsAppMessage,
  type WhatsAppChatStatus,
  type LeadSentiment,
} from '../../../lib/whatsapp-hub';
import { IconWhatsapp3D, IconUsers3D, IconZap3D, IconSparklesPurple3D } from '../../../components/hub/HubUiIcons3D';

// Quick Response Templates
const QUICK_TEMPLATES = [
  {
    title: '📄 Enviar Proposta Comercial',
    text: 'Olá! Preparei a proposta comercial personalizada conforme conversamos. Você pode conferir os valores e condições no link seguro: https://neuroads.com.br/proposta',
  },
  {
    title: '📅 Agendar Demonstração',
    text: 'Podemos agendar uma breve demonstração de 15 minutos com nosso especialista de soluções? Qual horário fica melhor para você hoje ou amanhã?',
  },
  {
    title: '💳 Dados de Pagamento & Faturamento',
    text: 'Para prosseguir com a ativação da sua conta, os dados para faturamento ou chave Pix podem ser confirmados diretamente com nossa equipe comercial.',
  },
  {
    title: '🤝 SLA & Garantia de Performance',
    text: 'Garantimos 100% de disponibilidade dos Agentes IA 24/7 com resposta média inferior a 15 segundos para todos os seus leads no WhatsApp.',
  },
];

export default function WhatsAppHubPage() {
  const { user } = useAuth();
  const [connections, setConnections] = useState<ConnectionsMap>({});
  const [loadingConn, setLoadingConn] = useState(true);

  // Chat State
  const [chats, setChats] = useState<WhatsAppChatThread[]>([]);
  const [activeChatId, setActiveChatId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'human_pending' | 'ai_active' | 'human_active' | 'resolved'>('all');
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [sendMode, setSendMode] = useState<'human' | 'agent'>('human');
  const [showTemplates, setShowTemplates] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isMasterOwner = useMemo(() => {
    return isMasterWhatsAppOwner(user?.email);
  }, [user]);

  // Load WhatsApp connection state
  useEffect(() => {
    async function fetchConn() {
      setLoadingConn(true);
      try {
        if (user?.uid) {
          const map = await loadUserConnections(user.uid);
          setConnections(map);
        }
      } catch (err) {
        console.warn('Error loading connectors:', err);
      } finally {
        setLoadingConn(false);
      }
    }
    fetchConn();
  }, [user]);

  // Load Chats & Real-time Subscription (Multi-channel: Firestore, BroadcastChannel, Custom & Storage events)
  useEffect(() => {
    const localData = loadWhatsAppChats(user?.uid);
    setChats(localData);

    const handleChatsUpdate = (remoteChats: WhatsAppChatThread[]) => {
      if (Array.isArray(remoteChats)) {
        setChats(remoteChats);
      }
    };

    // 1. Real-time Firestore subscription
    const unsubscribeFirestore = subscribeToWhatsAppChats(user?.uid, user?.email, handleChatsUpdate);

    // 2. BroadcastChannel for instant cross-tab sync (0ms latency)
    let bc: BroadcastChannel | null = null;
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      bc = new BroadcastChannel('neuroads_wa_sync');
      bc.onmessage = (event) => {
        if (event.data?.chats && Array.isArray(event.data.chats)) {
          handleChatsUpdate(event.data.chats);
        }
      };
    }

    // 3. Custom Event for local window updates
    const handleCustomEvent = (e: Event) => {
      const customEvent = e as CustomEvent<WhatsAppChatThread[]>;
      if (Array.isArray(customEvent.detail)) {
        handleChatsUpdate(customEvent.detail);
      }
    };
    window.addEventListener('neuroads_wa_local_update', handleCustomEvent);

    // 4. Storage event for cross-tab updates
    const handleStorage = (e: StorageEvent) => {
      if (e.key && e.key.includes('neuroads_whatsapp_chats')) {
        const currentChats = loadWhatsAppChats(user?.uid);
        handleChatsUpdate(currentChats);
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      unsubscribeFirestore();
      if (bc) bc.close();
      window.removeEventListener('neuroads_wa_local_update', handleCustomEvent);
      window.removeEventListener('storage', handleStorage);
    };
  }, [user]);

  const [syncingKapso, setSyncingKapso] = useState(false);

  const syncKapsoMessages = useCallback(async () => {
    if (!user?.uid) return;
    try {
      setSyncingKapso(true);
      const res = await fetch('/api/hub/whatsapp/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.uid }),
      });
      const data = await res.json().catch(() => ({}));
      if (data?.success && Array.isArray(data.chats) && data.chats.length > 0) {
        setChats(data.chats);
      }
    } catch (err) {
      console.warn('Kapso auto-sync warning:', err);
    } finally {
      setSyncingKapso(false);
    }
  }, [user]);

  useEffect(() => {
    if (user?.uid) {
      syncKapsoMessages();
      const interval = setInterval(syncKapsoMessages, 10000);
      return () => clearInterval(interval);
    }
  }, [user, syncKapsoMessages]);

  // Sync back to storage on updates
  const updateAndSaveChats = (newChats: WhatsAppChatThread[]) => {
    setChats(newChats);
    saveWhatsAppChats(newChats, user?.uid, user?.email);
  };

  const activeChat = useMemo(() => {
    return chats.find((c) => c.id === activeChatId) || chats[0] || null;
  }, [chats, activeChatId]);

  // Auto scroll messages to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChat?.messages]);

  // Filtered Chats
  const filteredChats = useMemo(() => {
    return chats.filter((c) => {
      const matchesSearch =
        c.leadName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.leadPhone.includes(searchQuery) ||
        (c.leadCompany && c.leadCompany.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchesSearch) return false;

      if (filterStatus === 'all') return true;
      return c.status === filterStatus;
    });
  }, [chats, searchQuery, filterStatus]);

  // Summary Metrics
  const metrics = useMemo(() => {
    const total = chats.length;
    const pendingHuman = chats.filter((c) => c.status === 'human_pending').length;
    const aiActive = chats.filter((c) => c.status === 'ai_active').length;
    const humanActive = chats.filter((c) => c.status === 'human_active').length;
    const resolved = chats.filter((c) => c.status === 'resolved').length;
    return { total, pendingHuman, aiActive, humanActive, resolved };
  }, [chats]);

  const isConnected = useMemo(() => {
    if (connections.whatsapp && (connections.whatsapp.isActive || connections.whatsapp.accessToken)) return true;
    // Also true if env or mock mode is active
    return true;
  }, [connections]);

  const connectedPhoneNumber = useMemo(() => {
    const conn = connections.whatsapp;
    const phoneId = (conn?.metadata?.phoneNumberId as string) || (conn?.metadata?.phoneNumber as string) || conn?.accountId;
    if (phoneId) return `Kapso (${phoneId})`;
    return '+55 (11) 99887-6655 (Mestre)';
  }, [connections]);

  // Handlers
  const handleSendMessage = async () => {
    if (!inputText.trim() || !activeChat) return;

    const textToSend = inputText.trim();
    setInputText('');
    setSending(true);

    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newMessage: WhatsAppMessage = {
      id: `msg-${Date.now()}`,
      chatId: activeChat.id,
      sender: sendMode === 'human' ? 'human' : 'agent',
      senderName: sendMode === 'human' ? 'Você (Atendente)' : activeChat.activeAgent.name,
      agentId: sendMode === 'agent' ? activeChat.activeAgent.id : undefined,
      text: textToSend,
      timestamp: nowTime,
      status: 'sent',
    };

    const updatedMessages = [...activeChat.messages, newMessage];
    const newStatus: WhatsAppChatStatus = sendMode === 'human' ? 'human_active' : activeChat.status;

    const updatedChat: WhatsAppChatThread = {
      ...activeChat,
      messages: updatedMessages,
      lastMessage: textToSend,
      lastMessageTime: nowTime,
      unreadCount: 0,
      status: newStatus,
    };

    const updatedChatsList = chats.map((c) => (c.id === activeChat.id ? updatedChat : c));
    updateAndSaveChats(updatedChatsList);

    // Call server API route with Kapso credentials
    try {
      await fetch('/api/hub/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: activeChat.leadPhone,
          text: textToSend,
          userId: user?.uid,
          apiKey: connections.whatsapp?.accessToken,
          phoneNumberId: (connections.whatsapp?.metadata?.phoneNumberId as string) || connections.whatsapp?.accountId,
        }),
      });
    } catch (err) {
      console.warn('WhatsApp API send warning:', err);
    } finally {
      setSending(false);
    }
  };

  const handleTakeoverHuman = (chatId: string) => {
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const target = chats.find((c) => c.id === chatId);
    if (!target) return;

    const sysMsg: WhatsAppMessage = {
      id: `sys-${Date.now()}`,
      chatId,
      sender: 'system',
      senderName: 'Sistema NeuroAds',
      text: '👤 Atendimento assumido por Humano (Operador de Vendas). Agente IA pausado.',
      timestamp: nowTime,
    };

    const updatedChat: WhatsAppChatThread = {
      ...target,
      status: 'human_active',
      unreadCount: 0,
      messages: [...target.messages, sysMsg],
    };

    updateAndSaveChats(chats.map((c) => (c.id === chatId ? updatedChat : c)));
  };

  const handleReactivateAI = (chatId: string) => {
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const target = chats.find((c) => c.id === chatId);
    if (!target) return;

    const sysMsg: WhatsAppMessage = {
      id: `sys-${Date.now()}`,
      chatId,
      sender: 'system',
      senderName: 'Sistema NeuroAds',
      text: `🤖 Atendimento devolvido para a IA (${target.activeAgent.name}). Automação 24/7 reativada.`,
      timestamp: nowTime,
    };

    const updatedChat: WhatsAppChatThread = {
      ...target,
      status: 'ai_active',
      messages: [...target.messages, sysMsg],
    };

    updateAndSaveChats(chats.map((c) => (c.id === chatId ? updatedChat : c)));
  };

  const handleMarkResolved = (chatId: string) => {
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const target = chats.find((c) => c.id === chatId);
    if (!target) return;

    const sysMsg: WhatsAppMessage = {
      id: `sys-${Date.now()}`,
      chatId,
      sender: 'system',
      senderName: 'Sistema NeuroAds',
      text: '✅ Atendimento concluído e registrado no CRM.',
      timestamp: nowTime,
    };

    const updatedChat: WhatsAppChatThread = {
      ...target,
      status: 'resolved',
      messages: [...target.messages, sysMsg],
    };

    updateAndSaveChats(chats.map((c) => (c.id === chatId ? updatedChat : c)));
  };

  return (
    <div className="flex flex-col gap-5 max-w-[1600px] mx-auto p-4 md:p-6 text-slate-800">
      {/* ── Header Title & Connection Status Banner ── */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white/80 backdrop-blur-xl border border-white/60 p-5 rounded-3xl shadow-[4px_4px_12px_#d1d9e6,_-4px_-4px_12px_#ffffff]">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 shadow-inner">
            <IconWhatsapp3D size={38} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">WhatsApp Live &amp; Agentes IA</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-700 border border-emerald-200">
                Atendimento Ao Vivo
              </span>
              {isMasterOwner ? (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-600 text-white shadow-xs">
                  👑 Canal Mestre do Site (avante@neuroads.com.br)
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-purple-100 text-purple-800 border border-purple-200">
                  🔒 Canal Privado ({user?.email || 'Conta'})
                </span>
              )}
            </div>
            <p className="text-xs font-semibold text-slate-500 mt-0.5">
              Supervisione as conversas em tempo real entre seus leads e os Agentes IA. {isMasterOwner ? 'Você está gerenciando o canal central do Widget da página inicial do site.' : 'Você está visualizando seu ambiente de atendimento privado.'}
            </p>
          </div>
        </div>

        {/* WhatsApp Connection Card Indicator */}
        <div className="flex items-center gap-3 bg-slate-50 p-2.5 px-4 rounded-2xl border border-slate-200/80 shadow-sm shrink-0 w-full md:w-auto justify-between md:justify-end">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">WhatsApp Conectado</p>
              <p className="text-xs font-bold text-slate-800">{connectedPhoneNumber}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={syncKapsoMessages}
              disabled={syncingKapso}
              className="flex items-center gap-1.5 text-[11px] font-black text-slate-700 hover:text-slate-900 transition-colors bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 disabled:opacity-50"
              title="Buscar mensagens recentes diretamente da Inbox do Kapso"
            >
              <RefreshCw size={12} className={syncingKapso ? 'animate-spin text-[#FF6A00]' : ''} />
              {syncingKapso ? 'Sincronizando...' : 'Sincronizar'}
            </button>
            <Link
              href="/hub/integracoes"
              className="flex items-center gap-1 text-[11px] font-black text-[#FF6A00] hover:text-[#e05d00] transition-colors bg-white px-2.5 py-1.5 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300"
            >
              Integrações <ChevronRight size={12} />
            </Link>
          </div>
        </div>
      </div>

      {/* ── Summary KPI Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="rounded-2xl border border-white/60 bg-white p-4 shadow-[4px_4px_10px_#d1d9e6,_-4px_-4px_10px_#ffffff] flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Conversas Ativas</p>
            <p className="text-xl font-black text-slate-800">{metrics.total}</p>
          </div>
          <div className="shrink-0 p-2 rounded-xl bg-orange-500/10 text-orange-600">
            <IconUsers3D size={42} />
          </div>
        </div>

        <div
          className={`rounded-2xl border p-4 shadow-[4px_4px_10px_#d1d9e6,_-4px_-4px_10px_#ffffff] flex items-center justify-between transition-all ${
            metrics.pendingHuman > 0
              ? 'bg-amber-500/10 border-amber-400/50 ring-2 ring-amber-400/30'
              : 'border-white/60 bg-white'
          }`}
        >
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <p className="text-[10px] font-black uppercase tracking-wider text-amber-600">Aguardando Humano</p>
              {metrics.pendingHuman > 0 && (
                <span className="animate-pulse w-2 h-2 rounded-full bg-amber-500 shrink-0" />
              )}
            </div>
            <p className="text-xl font-black text-amber-700">{metrics.pendingHuman}</p>
          </div>
          <div className="shrink-0 p-2 rounded-xl bg-amber-500/20 text-amber-600">
            <AlertTriangle size={26} className={metrics.pendingHuman > 0 ? 'animate-bounce' : ''} />
          </div>
        </div>

        <div className="rounded-2xl border border-white/60 bg-white p-4 shadow-[4px_4px_10px_#d1d9e6,_-4px_-4px_10px_#ffffff] flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Com Agentes IA</p>
            <p className="text-xl font-black text-emerald-600">{metrics.aiActive}</p>
          </div>
          <div className="shrink-0 p-2 rounded-xl bg-emerald-500/10 text-emerald-600">
            <IconZap3D size={42} />
          </div>
        </div>

        <div className="rounded-2xl border border-white/60 bg-white p-4 shadow-[4px_4px_10px_#d1d9e6,_-4px_-4px_10px_#ffffff] flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Em Atendimento Humano</p>
            <p className="text-xl font-black text-blue-600">{metrics.humanActive}</p>
          </div>
          <div className="shrink-0 p-2 rounded-xl bg-purple-500/10 text-purple-600">
            <IconSparklesPurple3D size={42} />
          </div>
        </div>
      </div>

      {/* ── Main Split View (Chats List + Messages Window + Details) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[780px] min-h-[600px]">
        {/* Left Column: Chat List (4 cols) */}
        <div className="lg:col-span-4 flex flex-col bg-white rounded-3xl border border-white/60 shadow-[4px_4px_12px_#d1d9e6,_-4px_-4px_12px_#ffffff] overflow-hidden">
          {/* Search & Filter Header */}
          <div className="p-3.5 border-b border-slate-100 bg-slate-50/50 flex flex-col gap-2.5">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por nome, telefone ou empresa..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs font-semibold bg-white rounded-xl border border-slate-200 outline-none focus:border-[#FF6A00] transition-colors"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar text-[11px] font-bold">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-2.5 py-1 rounded-lg shrink-0 transition-all ${
                  filterStatus === 'all' ? 'bg-[#FF6A00] text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Todos ({metrics.total})
              </button>

              <button
                onClick={() => setFilterStatus('human_pending')}
                className={`px-2.5 py-1 rounded-lg shrink-0 flex items-center gap-1 transition-all ${
                  filterStatus === 'human_pending'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
                }`}
              >
                ⚠️ Humano ({metrics.pendingHuman})
              </button>

              <button
                onClick={() => setFilterStatus('ai_active')}
                className={`px-2.5 py-1 rounded-lg shrink-0 transition-all ${
                  filterStatus === 'ai_active' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                🤖 IA ({metrics.aiActive})
              </button>

              <button
                onClick={() => setFilterStatus('human_active')}
                className={`px-2.5 py-1 rounded-lg shrink-0 transition-all ${
                  filterStatus === 'human_active' ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                👤 Operador ({metrics.humanActive})
              </button>
            </div>
          </div>

          {/* Conversation Cards List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {filteredChats.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <MessageSquare size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-xs font-bold">Nenhuma conversa encontrada neste filtro.</p>
              </div>
            ) : (
              filteredChats.map((chat) => {
                const isSelected = activeChat?.id === chat.id;

                let statusBadge = (
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-100 text-emerald-700 flex items-center gap-1">
                    <Bot size={10} /> IA Ativa
                  </span>
                );

                if (chat.status === 'human_pending') {
                  statusBadge = (
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-amber-500 text-white animate-pulse flex items-center gap-1">
                      <AlertTriangle size={10} /> Handoff Humano
                    </span>
                  );
                } else if (chat.status === 'human_active') {
                  statusBadge = (
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-blue-100 text-blue-700 flex items-center gap-1">
                      <User size={10} /> Humano
                    </span>
                  );
                } else if (chat.status === 'resolved') {
                  statusBadge = (
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-slate-100 text-slate-600 flex items-center gap-1">
                      <CheckCircle2 size={10} /> Concluído
                    </span>
                  );
                }

                return (
                  <div
                    key={chat.id}
                    onClick={() => setActiveChatId(chat.id)}
                    className={`p-3.5 cursor-pointer transition-all flex items-start gap-3 relative ${
                      isSelected ? 'bg-orange-50/70 border-l-4 border-[#FF6A00]' : 'hover:bg-slate-50'
                    }`}
                  >
                    {/* Avatar */}
                    <div className="relative shrink-0">
                      {chat.avatarUrl ? (
                        <Image unoptimized src={chat.avatarUrl} alt={chat.leadName} width={42} height={42} className="rounded-2xl object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-2xl bg-slate-200 flex items-center justify-center font-bold text-slate-600 text-sm">
                          {chat.leadName[0]}
                        </div>
                      )}
                      <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <h4 className="text-xs font-black text-slate-900 truncate">{chat.leadName}</h4>
                        <span className="text-[10px] font-semibold text-slate-400 shrink-0">{chat.lastMessageTime}</span>
                      </div>

                      <div className="flex items-center gap-1.5 mb-1.5">
                        <span className="text-[10px] font-bold text-slate-500 truncate">{chat.leadCompany || chat.leadPhone}</span>
                        <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                          {chat.funnelStage}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-600 font-medium truncate mb-2">{chat.lastMessage}</p>

                      <div className="flex items-center justify-between gap-1">
                        <div className="flex items-center gap-1">
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: chat.activeAgent.color || '#FF6A00' }}
                          />
                          <span className="text-[10px] font-bold text-slate-500">{chat.activeAgent.name}</span>
                        </div>
                        {statusBadge}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Middle Column: Chat Window Stream (5 or 8 cols depending on sidebar) */}
        <div
          className={`flex flex-col bg-white rounded-3xl border border-white/60 shadow-[4px_4px_12px_#d1d9e6,_-4px_-4px_12px_#ffffff] overflow-hidden ${
            showSidebar ? 'lg:col-span-5' : 'lg:col-span-8'
          }`}
        >
          {activeChat ? (
            <>
              {/* Chat Window Header */}
              <div className="p-3.5 px-5 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-3">
                  {activeChat.avatarUrl ? (
                    <Image unoptimized src={activeChat.avatarUrl} alt={activeChat.leadName} width={40} height={40} className="rounded-2xl object-cover shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded-2xl bg-[#FF6A00]/10 text-[#FF6A00] flex items-center justify-center font-bold text-sm">
                      {activeChat.leadName[0]}
                    </div>
                  )}

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-black text-slate-900">{activeChat.leadName}</h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                        {activeChat.leadPhone}
                      </span>
                    </div>
                    <p className="text-[11px] font-semibold text-slate-500">
                      {activeChat.leadCompany || 'Lead Direct'} · Estágio: <strong className="text-slate-800">{activeChat.funnelStage}</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowSidebar(!showSidebar)}
                    className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-xl transition-colors text-xs font-bold flex items-center gap-1"
                    title="Alternar painel de inteligência"
                  >
                    <Info size={16} />
                    <span className="hidden sm:inline">Intel</span>
                  </button>
                </div>
              </div>

              {/* Handoff Alert Banner (If pending human takeover) */}
              <AnimatePresence>
                {activeChat.status === 'human_pending' && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="bg-amber-500/10 border-b border-amber-200 p-3.5 px-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shrink-0"
                  >
                    <div className="flex items-start gap-2.5">
                      <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5 animate-bounce" />
                      <div>
                        <p className="text-xs font-black text-amber-900">
                          Encaminhado para Atendimento Humano ({activeChat.activeAgent.name})
                        </p>
                        <p className="text-[11px] font-semibold text-amber-800 mt-0.5">
                          Motivo: {activeChat.handoffReason || 'Solicitação comercial do lead.'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                      <button
                        onClick={() => handleTakeoverHuman(activeChat.id)}
                        className="flex-1 sm:flex-none px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs shadow-xs transition-all flex items-center justify-center gap-1.5"
                      >
                        <UserCheck size={14} /> Assumir Atendimento
                      </button>

                      <button
                        onClick={() => handleReactivateAI(activeChat.id)}
                        className="flex-1 sm:flex-none px-3 py-1.5 rounded-xl bg-white border border-amber-300 text-amber-800 font-bold text-xs hover:bg-amber-100 transition-colors"
                      >
                        Manter IA
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Active Mode Control Strip */}
              <div className="bg-slate-100/70 border-b border-slate-200/60 p-2 px-5 flex items-center justify-between text-xs font-bold text-slate-600 shrink-0">
                <div className="flex items-center gap-2">
                  <span>Modo Atual:</span>
                  {activeChat.status === 'human_active' ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-black flex items-center gap-1">
                      <User size={11} /> Atendimento Humano Ativo (IA Pausada)
                    </span>
                  ) : activeChat.status === 'ai_active' ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-black flex items-center gap-1">
                      <Bot size={11} /> IA Respondendo ({activeChat.activeAgent.name})
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-300 text-slate-700 text-[10px] font-black">
                      {activeChat.status}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {activeChat.status === 'human_active' ? (
                    <button
                      onClick={() => handleReactivateAI(activeChat.id)}
                      className="text-[11px] font-bold text-emerald-700 hover:underline flex items-center gap-1"
                    >
                      <RefreshCw size={12} /> Devolver para IA
                    </button>
                  ) : (
                    <button
                      onClick={() => handleTakeoverHuman(activeChat.id)}
                      className="text-[11px] font-bold text-blue-700 hover:underline flex items-center gap-1"
                    >
                      <User size={12} /> Assumir Manualmente
                    </button>
                  )}
                </div>
              </div>

              {/* Message Stream Area */}
              <div className="flex-1 p-4 md:p-5 overflow-y-auto space-y-3.5 bg-gradient-to-b from-slate-50/40 to-slate-100/40">
                {activeChat.messages.map((msg) => {
                  if (msg.sender === 'system') {
                    return (
                      <div key={msg.id} className="flex justify-center my-3">
                        <div className="bg-amber-100/90 text-amber-900 border border-amber-300/80 px-3.5 py-1.5 rounded-2xl text-[11px] font-bold shadow-xs max-w-md text-center">
                          {msg.text}
                          <span className="block text-[9px] font-semibold text-amber-700 mt-0.5">{msg.timestamp}</span>
                        </div>
                      </div>
                    );
                  }

                  const isLead = msg.sender === 'lead';
                  const isAgent = msg.sender === 'agent';
                  const isHuman = msg.sender === 'human';

                  return (
                    <div key={msg.id} className={`flex ${isLead ? 'justify-start' : 'justify-end'} group`}>
                      <div className="max-w-[82%] sm:max-w-[75%]">
                        {/* Sender Label */}
                        <div className={`flex items-center gap-1.5 mb-1 text-[10px] font-black ${isLead ? 'text-slate-500' : isHuman ? 'text-emerald-700 justify-end' : 'text-purple-700 justify-end'}`}>
                          {isLead && <Phone size={10} />}
                          {isAgent && <Bot size={10} />}
                          {isHuman && <User size={10} />}
                          <span>{msg.senderName}</span>
                        </div>

                        {/* Message Bubble */}
                        <div
                          className={`p-3 px-4 rounded-2xl text-xs font-semibold leading-relaxed shadow-xs ${
                            isLead
                              ? 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-xs'
                              : isHuman
                              ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-tr-xs shadow-md'
                              : 'bg-gradient-to-r from-[#FF6A00] to-orange-600 text-white rounded-tr-xs shadow-md'
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{msg.text}</p>
                          <div className={`flex items-center justify-end gap-1 mt-1 text-[9px] font-semibold ${isLead ? 'text-slate-400' : 'text-white/80'}`}>
                            <span>{msg.timestamp}</span>
                            {!isLead && <CheckCheck size={11} className="text-white/90" />}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Composer (Bottom Bar) */}
              <div className="p-3.5 border-t border-slate-100 bg-white flex flex-col gap-2 shrink-0">
                {/* Mode Selector & Quick Templates Trigger */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
                    <button
                      onClick={() => setSendMode('human')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-black transition-all ${
                        sendMode === 'human' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      👤 Resposta Humana
                    </button>
                    <button
                      onClick={() => setSendMode('agent')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-black transition-all ${
                        sendMode === 'agent' ? 'bg-[#FF6A00] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      🤖 Como {activeChat.activeAgent.name}
                    </button>
                  </div>

                  <button
                    onClick={() => setShowTemplates(!showTemplates)}
                    className="text-xs font-black text-[#FF6A00] hover:underline flex items-center gap-1 bg-orange-50 px-2.5 py-1 rounded-xl border border-orange-200"
                  >
                    <FileText size={13} />
                    <span>Modelos de Resposta</span>
                  </button>
                </div>

                {/* Templates Popup Menu */}
                <AnimatePresence>
                  {showTemplates && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="bg-slate-50 border border-slate-200 p-2.5 rounded-2xl space-y-1.5"
                    >
                      <p className="text-[10px] font-black uppercase text-slate-400 px-2">Modelos Prontos para Envio:</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {QUICK_TEMPLATES.map((tmpl, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              setInputText(tmpl.text);
                              setShowTemplates(false);
                            }}
                            className="p-2 text-left bg-white hover:bg-orange-50/50 border border-slate-200 hover:border-orange-300 rounded-xl transition-all"
                          >
                            <p className="text-xs font-bold text-slate-800 truncate">{tmpl.title}</p>
                            <p className="text-[10px] text-slate-500 truncate">{tmpl.text}</p>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Input Text Area */}
                <div className="flex items-center gap-2 bg-slate-100/80 p-2 rounded-2xl border border-slate-200/80 focus-within:border-[#FF6A00] transition-colors">
                  <textarea
                    rows={2}
                    placeholder={`Digite sua resposta ${sendMode === 'human' ? 'como Atendente Humano' : `como ${activeChat.activeAgent.name}`}...`}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    className="flex-1 bg-transparent text-xs font-semibold text-slate-800 placeholder:text-slate-400 outline-none resize-none px-2 py-1"
                  />

                  <button
                    onClick={handleSendMessage}
                    disabled={sending || !inputText.trim()}
                    className={`p-3 rounded-xl font-bold text-white transition-all flex items-center justify-center shrink-0 ${
                      sending || !inputText.trim()
                        ? 'bg-slate-300 cursor-not-allowed'
                        : sendMode === 'human'
                        ? 'bg-emerald-600 hover:bg-emerald-700 shadow-md'
                        : 'bg-[#FF6A00] hover:bg-[#e05d00] shadow-md'
                    }`}
                  >
                    <Send size={16} />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500 space-y-3 bg-slate-50/50">
              <div className="p-4 rounded-3xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                <MessageSquare size={44} />
              </div>
              <div className="max-w-md">
                <h3 className="text-base font-black text-slate-900 mb-1">Nenhuma conversa ativa no momento</h3>
                <p className="text-xs font-semibold text-slate-500 leading-relaxed">
                  O widget de atendimento flutuante via WhatsApp na página inicial do site está ativo e pronto. Assim que um visitante ou lead iniciar uma conversa, ela aparecerá aqui em tempo real com a resposta automatizada do Vitor (Agente SDR).
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Lead Context & AI Intelligence Panel (3 cols) */}
        {showSidebar && activeChat && (
          <div className="lg:col-span-3 flex flex-col bg-white rounded-3xl border border-white/60 shadow-[4px_4px_12px_#d1d9e6,_-4px_-4px_12px_#ffffff] p-4 space-y-4 overflow-y-auto">
            {/* Lead Card Summary */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 text-center">
              {activeChat.avatarUrl ? (
                <Image unoptimized src={activeChat.avatarUrl} alt={activeChat.leadName} width={56} height={56} className="rounded-2xl mx-auto mb-2 object-cover" />
              ) : (
                <div className="w-14 h-14 rounded-2xl bg-[#FF6A00]/10 text-[#FF6A00] flex items-center justify-center font-black text-xl mx-auto mb-2">
                  {activeChat.leadName[0]}
                </div>
              )}
              <h3 className="text-sm font-black text-slate-900">{activeChat.leadName}</h3>
              <p className="text-xs font-semibold text-slate-500">{activeChat.leadPhone}</p>
              {activeChat.leadEmail && <p className="text-[11px] font-semibold text-[#FF6A00] truncate mt-0.5">{activeChat.leadEmail}</p>}
            </div>

            {/* AI Agent Status Card */}
            <div className="p-3.5 bg-gradient-to-br from-purple-500/5 to-orange-500/5 rounded-2xl border border-purple-500/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-purple-700 tracking-wider">Agente IA Ativo</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-white shadow-xs border border-slate-200">
                  <Bot size={18} className="text-[#FF6A00]" />
                </div>
                <div>
                  <p className="text-xs font-black text-slate-900">{activeChat.activeAgent.name}</p>
                  <p className="text-[10px] font-semibold text-slate-500">{activeChat.activeAgent.role}</p>
                </div>
              </div>
            </div>

            {/* Lead Tags & Sentiment */}
            <div className="space-y-2">
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Inteligência de Vendas</p>
              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs font-bold">
                <span>Termômetro:</span>
                {activeChat.sentiment === 'hot' && <span className="text-orange-600 font-black flex items-center gap-1">🔥 Quente (Alta Intenção)</span>}
                {activeChat.sentiment === 'warm' && <span className="text-amber-600 font-black flex items-center gap-1">⚡ Morno (Em Nutrição)</span>}
                {activeChat.sentiment === 'cold' && <span className="text-blue-600 font-black flex items-center gap-1">❄️ Frio</span>}
              </div>

              <div className="flex flex-wrap gap-1">
                {activeChat.tags.map((tag, i) => (
                  <span key={i} className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Notes Section */}
            <div className="space-y-1.5">
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Notas do Atendimento</p>
              <div className="p-3 bg-amber-500/10 border border-amber-300/60 rounded-xl text-xs font-semibold text-amber-900 leading-relaxed">
                {activeChat.notes || 'Sem observações adicionais gravadas.'}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <button
                onClick={() => handleMarkResolved(activeChat.id)}
                className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 size={14} /> Marcar como Concluído
              </button>

              <Link
                href="/hub/funil-vendas"
                className="w-full py-2 px-3 rounded-xl bg-white border border-slate-200 hover:border-[#FF6A00] text-slate-700 hover:text-[#FF6A00] font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <ExternalLink size={14} /> Ver no CRM de Vendas
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
