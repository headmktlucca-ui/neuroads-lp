'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import {
  MessageSquare,
  X,
  Send,
  Bot,
  User,
  CheckCheck,
  Phone,
  Sparkles,
  ChevronRight,
  Shield,
} from 'lucide-react';
import {
  loadWhatsAppChats,
  saveWhatsAppChats,
  subscribeToWhatsAppChats,
  generateVitorSdrResponse,
  type WhatsAppChatThread,
  type WhatsAppMessage,
} from '../../lib/whatsapp-hub';
import { useAuth } from '../../context/AuthContext';
export function formatBrazilianPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (!digits) return '';
  if (digits.length <= 2) {
    return `(${digits}`;
  }
  if (digits.length <= 6) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
}

export default function WhatsAppFloatingWidget() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<'form' | 'chat'>('form');

  // Visitor info
  const [visitorName, setVisitorName] = useState('');
  const [visitorPhone, setVisitorPhone] = useState('');
  const [visitorCompany, setVisitorCompany] = useState('');

  // Active chat thread ID
  const [chatThreadId, setChatThreadId] = useState<string | null>(null);
  const [chatThread, setChatThread] = useState<WhatsAppChatThread | null>(null);

  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load existing session from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const savedSession = localStorage.getItem('neuroads_wa_visitor_session');
    if (savedSession) {
      try {
        const parsed = JSON.parse(savedSession);
        if (parsed.name && parsed.phone && parsed.threadId) {
          setVisitorName(parsed.name);
          setVisitorPhone(parsed.phone);
          setVisitorCompany(parsed.company || '');
          setChatThreadId(parsed.threadId);
          setStep('chat');
        }
      } catch (err) {
        console.warn('Error reading visitor session:', err);
      }
    }
  }, []);

  // Real-time multi-channel sync (Firestore, BroadcastChannel, Storage Event, Custom Event)
  useEffect(() => {
    const updateMatchingThread = (chats: WhatsAppChatThread[]) => {
      if (chatThreadId) {
        const found = chats.find((c) => c.id === chatThreadId);
        if (found) {
          setChatThread(found);
        }
      }
    };

    // 1. Real-time Firestore subscription
    const unsubscribeFirestore = subscribeToWhatsAppChats(user?.uid, user?.email, updateMatchingThread);

    // 2. BroadcastChannel for instant cross-tab sync (0ms latency)
    let bc: BroadcastChannel | null = null;
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      bc = new BroadcastChannel('neuroads_wa_sync');
      bc.onmessage = (event) => {
        if (event.data?.chats && Array.isArray(event.data.chats)) {
          updateMatchingThread(event.data.chats);
        }
      };
    }

    // 3. Custom Event for same-window local updates
    const handleCustomEvent = (e: Event) => {
      const customEvent = e as CustomEvent<WhatsAppChatThread[]>;
      if (Array.isArray(customEvent.detail)) {
        updateMatchingThread(customEvent.detail);
      }
    };
    window.addEventListener('neuroads_wa_local_update', handleCustomEvent);

    // 4. Storage event for cross-tab localStorage updates
    const handleStorage = (e: StorageEvent) => {
      if (e.key && e.key.includes('neuroads_whatsapp_chats')) {
        const currentChats = loadWhatsAppChats(user?.uid);
        updateMatchingThread(currentChats);
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      unsubscribeFirestore();
      if (bc) bc.close();
      window.removeEventListener('neuroads_wa_local_update', handleCustomEvent);
      window.removeEventListener('storage', handleStorage);
    };
  }, [chatThreadId, user]);

  // Fallback local load if chatThreadId exists but chatThread state is null
  useEffect(() => {
    if (chatThreadId && !chatThread) {
      const current = loadWhatsAppChats(user?.uid);
      const found = current.find((c) => c.id === chatThreadId);
      if (found) {
        setChatThread(found);
      }
    }
  }, [chatThreadId, chatThread, user]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (isOpen && step === 'chat') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatThread?.messages, isOpen, step, isTyping]);

  // Start chat session
  const handleStartChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitorName.trim() || !visitorPhone.trim()) return;

    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const threadId = `wa-lead-${Date.now()}`;

    const initialGreetingMessage: WhatsAppMessage = {
      id: `msg-greet-${Date.now()}`,
      chatId: threadId,
      sender: 'agent',
      senderName: 'Vitor (SDR)',
      agentId: 'vitor',
      text: `Olá ${visitorName.trim()}! Sou o Vitor, Agente SDR da NeuroAds. Como posso ajudar a impulsionar as vendas da sua empresa hoje?`,
      timestamp: nowTime,
      status: 'read',
    };

    const newThread: WhatsAppChatThread = {
      id: threadId,
      leadName: visitorName.trim(),
      leadPhone: visitorPhone.trim(),
      leadCompany: visitorCompany.trim() || 'Website Visitor',
      funnelStage: 'Atração',
      status: 'ai_active',
      activeAgent: {
        id: 'vitor',
        name: 'Vitor (SDR)',
        role: 'SDR & Qualificação',
        avatar: '/images/Avatar Agentes IA/Avatar_Vitor.png',
        color: '#FF6A00',
      },
      lastMessage: initialGreetingMessage.text,
      lastMessageTime: nowTime,
      unreadCount: 0,
      sentiment: 'warm',
      tags: ['Website Floating Widget', 'Inbound'],
      messages: [initialGreetingMessage],
      updatedAt: Date.now(),
    };

    // Save thread locally & firestore
    const currentChats = loadWhatsAppChats(user?.uid);
    const updatedChats = [newThread, ...currentChats.filter((c) => c.id !== threadId)];
    saveWhatsAppChats(updatedChats, user?.uid, user?.email);

    setChatThreadId(threadId);
    setChatThread(newThread);
    setStep('chat');

    // Save session in localStorage
    localStorage.setItem(
      'neuroads_wa_visitor_session',
      JSON.stringify({
        name: visitorName.trim(),
        phone: visitorPhone.trim(),
        company: visitorCompany.trim(),
        threadId,
      })
    );
  };

  // Send visitor message
  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    const userText = inputText.trim();
    setInputText('');
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    let activeId = chatThreadId;
    let activeThread = chatThread;

    const displayName = visitorName.trim() || 'Visitante Site';
    const displayPhone = visitorPhone.trim() || '+55 (11) 99999-0000';

    // Auto-create thread if missing
    if (!activeId || !activeThread) {
      activeId = `wa-lead-${Date.now()}`;
      setChatThreadId(activeId);

      const initialGreeting: WhatsAppMessage = {
        id: `msg-greet-${Date.now()}`,
        chatId: activeId,
        sender: 'agent',
        senderName: 'Vitor (SDR)',
        agentId: 'vitor',
        text: `Olá ${displayName}! Sou o Vitor, Agente SDR da NeuroAds. Como posso ajudar a impulsionar as vendas da sua empresa hoje?`,
        timestamp: nowTime,
        status: 'read',
      };

      activeThread = {
        id: activeId,
        leadName: displayName,
        leadPhone: displayPhone,
        leadCompany: visitorCompany.trim() || 'Website Visitor',
        funnelStage: 'Atração',
        status: 'ai_active',
        activeAgent: {
          id: 'vitor',
          name: 'Vitor (SDR)',
          role: 'SDR & Qualificação',
          avatar: '/images/Avatar Agentes IA/Avatar_Vitor.png',
          color: '#FF6A00',
        },
        lastMessage: initialGreeting.text,
        lastMessageTime: nowTime,
        unreadCount: 0,
        sentiment: 'warm',
        tags: ['Website Floating Widget', 'Inbound'],
        messages: [initialGreeting],
        updatedAt: Date.now(),
      };
    }

    const userMessage: WhatsAppMessage = {
      id: `msg-usr-${Date.now()}`,
      chatId: activeId,
      sender: 'lead',
      senderName: visitorName || 'Você',
      text: userText,
      timestamp: nowTime,
      status: 'sent',
    };

    const updatedMessages = [...activeThread.messages, userMessage];

    const updatedThread: WhatsAppChatThread = {
      ...activeThread,
      messages: updatedMessages,
      lastMessage: userText,
      lastMessageTime: nowTime,
      updatedAt: Date.now(),
    };

    // Save user message locally & firestore
    const currentChats = loadWhatsAppChats(user?.uid);
    const filtered = currentChats.filter((c) => c.id !== activeId);
    const updatedChats = [updatedThread, ...filtered];

    saveWhatsAppChats(updatedChats, user?.uid, user?.email);
    setChatThread(updatedThread);
    setStep('chat');

    // Save session in localStorage
    localStorage.setItem(
      'neuroads_wa_visitor_session',
      JSON.stringify({
        name: displayName,
        phone: displayPhone,
        company: visitorCompany.trim(),
        threadId: activeId,
      })
    );

    // If AI mode is active, trigger Vitor SDR response
    if (updatedThread.status === 'ai_active' || updatedThread.status === 'human_pending') {
      setIsTyping(true);

      setTimeout(() => {
        const { replyText, shouldHandoff, handoffReason } = generateVitorSdrResponse(
          userText,
          displayName
        );

        const aiTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        const aiMessage: WhatsAppMessage = {
          id: `msg-ai-${Date.now()}`,
          chatId: activeId!,
          sender: 'agent',
          senderName: 'Vitor (SDR)',
          agentId: 'vitor',
          text: replyText,
          timestamp: aiTime,
          status: 'sent',
        };

        const finalMessages = [...updatedThread.messages, aiMessage];
        const finalStatus = shouldHandoff ? 'human_pending' : updatedThread.status;

        const finalThread: WhatsAppChatThread = {
          ...updatedThread,
          messages: finalMessages,
          lastMessage: replyText,
          lastMessageTime: aiTime,
          status: finalStatus,
          sentiment: shouldHandoff ? 'hot' : updatedThread.sentiment,
          handoffReason: shouldHandoff ? handoffReason : updatedThread.handoffReason,
          handoffRequestedAt: shouldHandoff ? aiTime : updatedThread.handoffRequestedAt,
          updatedAt: Date.now(),
        };

        const reUpdatedChats = loadWhatsAppChats(user?.uid).map((c) =>
          c.id === activeId ? finalThread : c
        );
        saveWhatsAppChats(reUpdatedChats, user?.uid, user?.email);
        setChatThread(finalThread);
        setIsTyping(false);
      }, 1000);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* ── Chat Window Popup ── */}
      {isOpen && (
        <div className="mb-4 w-[340px] sm:w-[380px] h-[520px] rounded-3xl border border-slate-200/90 shadow-2xl bg-white flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-700 via-teal-800 to-slate-900 text-white p-3.5 px-4 flex items-center justify-between shrink-0 shadow-md">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 shrink-0">
                <div className="w-10 h-10 rounded-full border-2 border-emerald-400/50 overflow-hidden bg-slate-900 shadow-sm">
                  <Image
                    src={chatThread?.activeAgent?.avatar || '/images/Avatar Agentes IA/Avatar_Vitor.png'}
                    alt="Vitor (SDR NeuroAds)"
                    width={40}
                    height={40}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-900 shadow-xs z-10" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs font-black tracking-tight text-white">Vitor (SDR NeuroAds)</h3>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-emerald-500/30 text-emerald-300 border border-emerald-400/30">
                    IA 24h
                  </span>
                </div>
                <p className="text-[10px] font-semibold text-emerald-200/80">Atendimento WhatsApp em Tempo Real</p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-xl hover:bg-white/10 text-white/80 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          {step === 'form' ? (
            /* Visitor Identification Form */
            <div className="flex-1 p-5 flex flex-col justify-between bg-gradient-to-b from-slate-50 to-white">
              <div className="space-y-4">
                <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-2xl text-xs text-emerald-950 font-semibold leading-relaxed flex items-start gap-2.5">
                  <Sparkles size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-emerald-900">Seja bem-vindo à NeuroAds!</p>
                    <p className="text-[11px] text-emerald-800/90 mt-0.5">
                      Preencha seus dados para iniciar a conversa no WhatsApp com nosso Agente IA.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleStartChat} className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">
                      Seu Nome *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Carlos Eduardo"
                      value={visitorName}
                      onChange={(e) => setVisitorName(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-semibold bg-white rounded-xl border border-slate-200 outline-none focus:border-emerald-600 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">
                      Seu WhatsApp (com DDD) *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="Ex: (11) 99887-6655"
                      value={visitorPhone}
                      onChange={(e) => setVisitorPhone(formatBrazilianPhone(e.target.value))}
                      className="w-full px-3 py-2 text-xs font-semibold bg-white rounded-xl border border-slate-200 outline-none focus:border-emerald-600 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">
                      Sua Empresa / Segmento (Opcional)
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Clínica / Distribuidora / E-commerce"
                      value={visitorCompany}
                      onChange={(e) => setVisitorCompany(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-semibold bg-white rounded-xl border border-slate-200 outline-none focus:border-emerald-600 transition-colors"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    Iniciar Chat no WhatsApp <ChevronRight size={14} />
                  </button>
                </form>
              </div>

              <div className="flex items-center justify-center gap-1.5 text-[10px] font-bold text-slate-400 pt-2 border-t border-slate-100">
                <Shield size={12} className="text-emerald-600" />
                <span>Atendimento protegido &amp; gravado no Dashboard NeuroAds</span>
              </div>
            </div>
          ) : (
            /* Interactive Chat Stream */
            <div className="flex-1 flex flex-col bg-slate-50/50">
              {/* Message Stream */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3">
                {chatThread?.messages.map((msg) => {
                  const isLead = msg.sender === 'lead';
                  const isAgent = msg.sender === 'agent';
                  const isHuman = msg.sender === 'human';

                  return (
                    <div key={msg.id} className={`flex ${isLead ? 'justify-end' : 'justify-start'}`}>
                      <div className="max-w-[85%]">
                        <div className={`text-[9px] font-black mb-0.5 ${isLead ? 'text-right text-slate-400' : isHuman ? 'text-emerald-700' : 'text-purple-700'}`}>
                          {isLead ? 'Você' : isHuman ? '👤 Atendente Humano' : '🤖 Vitor (SDR)'}
                        </div>

                        <div
                          className={`p-3 rounded-2xl text-xs font-semibold leading-relaxed shadow-xs ${
                            isLead
                              ? 'bg-emerald-600 text-white rounded-tr-xs'
                              : isHuman
                              ? 'bg-blue-600 text-white rounded-tl-xs'
                              : 'bg-white text-slate-800 border border-slate-200/90 rounded-tl-xs'
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{msg.text}</p>
                          <span className={`block text-[9px] font-medium mt-1 text-right ${isLead || isHuman ? 'text-white/80' : 'text-slate-400'}`}>
                            {msg.timestamp}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-slate-200 p-2.5 px-3.5 rounded-2xl rounded-tl-xs text-xs text-slate-500 font-bold flex items-center gap-1.5 shadow-xs">
                      <span className="animate-pulse">Vitor está digitando...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Composer */}
              <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Digite sua mensagem..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSendMessage();
                  }}
                  className="flex-1 bg-slate-100 text-xs font-semibold px-3 py-2 rounded-xl outline-none focus:border-emerald-600 border border-transparent transition-colors"
                />

                <button
                  onClick={handleSendMessage}
                  disabled={!inputText.trim()}
                  className={`p-2.5 rounded-xl font-bold text-white transition-all flex items-center justify-center ${
                    inputText.trim() ? 'bg-emerald-600 hover:bg-emerald-700 shadow-xs' : 'bg-slate-300 cursor-not-allowed'
                  }`}
                >
                  <Send size={15} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Fixed Floating Button Trigger ── */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group relative flex items-center justify-center w-14 h-14 rounded-full text-white hover:scale-105 active:scale-95 transition-all duration-300"
        aria-label="Abrir WhatsApp Live Chat"
      >
        {/* Pulsing animated ring */}
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-30" />
        <span className="absolute inline-flex h-full w-full rounded-full border-2 border-emerald-400/40 rounded-full" />

        {/* Badge status dot */}
        <span className="absolute top-0 right-0 w-4 h-4 rounded-full bg-emerald-400 border-2 border-white flex items-center justify-center font-black text-[8px] text-slate-900 shadow-xs z-10">
          IA
        </span>

        {isOpen ? (
          <div className="relative z-10 w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-2xl">
            <X size={22} />
          </div>
        ) : (
          <Image
            src="/images/Logos/iconwhats.jpeg"
            alt="WhatsApp"
            width={56}
            height={56}
            className="w-14 h-14 object-contain rounded-full relative z-10 shadow-2xl"
          />
        )}

        {/* Hover Tooltip */}
        <span className="absolute right-16 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold whitespace-nowrap shadow-xl border border-slate-700 pointer-events-none">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Fale com nosso Agente IA
        </span>
      </button>
    </div>
  );
}
