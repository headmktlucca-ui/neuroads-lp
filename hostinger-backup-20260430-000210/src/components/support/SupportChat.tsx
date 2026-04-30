'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Bot, ExternalLink, Headset, Mic, Square, Trash2, Sparkles } from 'lucide-react';
import { chatWithSupport, transcribeAudio } from '../../app/actions/chat-support';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  buttons?: Array<{ label: string; url: string }>;
}

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "Bom dia";
  if (hour >= 12 && hour < 18) return "Boa tarde";
  return "Boa noite";
};

const INITIAL_GREETING = `${getGreeting()}! \n\nAqui é o Lucca, Secretário Executivo da NeuroAds.\n\nMinha missão é compreender sua necessidade e orquestrar a melhor solução técnica ou humana para você.\n\nEm que posso ser útil hoje?`;

const SUGGESTIONS = [
  "Escalar meu tráfego pago",
  "Criar um funil automático",
  "Diagnosticar erros na minha conta"
];

export default function SupportChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: INITIAL_GREETING }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showWhatsApp, setShowWhatsApp] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [clientName, setClientName] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  useEffect(() => {
    const handleOpenChat = () => setIsOpen(true);
    window.addEventListener('neuroads:open-chat', handleOpenChat);
    return () => window.removeEventListener('neuroads:open-chat', handleOpenChat);
  }, []);

  const handleSend = async (customInput?: string) => {
    const textToSend = customInput || input;
    if (!textToSend.trim() || isLoading) return;

    if (showSuggestions) setShowSuggestions(false);

    const userMessage: Message = { role: 'user', content: textToSend };
    setMessages((prev) => [...prev, userMessage]);
    if (!customInput) setInput('');
    setIsLoading(true);

    try {
      const chatMessages = messages.concat(userMessage).map(m => ({
        role: m.role as 'user' | 'assistant' | 'system',
        content: m.content
      }));

      const result = await chatWithSupport(chatMessages);

        if (result.success && result.content) {
          setMessages((prev) => [...prev, { 
            role: 'assistant', 
            content: result.content!,
            buttons: result.buttons
          }]);
  
          if (result.clientName) setClientName(result.clientName);
          if (result.summary) setSummary(result.summary);

        if (result.showHumanButton) {
          setShowWhatsApp(true);
        }
      } else {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: result.error || 'Desculpe, tive um problema técnico. Tente novamente.' }
        ]);
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Erro de conexão. Verifique sua internet.' }
      ]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        if (audioBlob.size > 0) {
          await handleAudioSubmit(audioBlob);
        }
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);
      timerRef.current = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Mic Error:', err);
      alert('Não foi possível acessar o microfone.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.onstop = null;
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const handleAudioSubmit = async (blob: Blob) => {
    setIsLoading(true);
    const formData = new FormData();
    formData.append('audio', blob, 'recording.webm');

    try {
      const result = await transcribeAudio(formData);
      if (result.success && result.text) {
        await handleSend(result.text);
      } else {
        alert(result.error || 'Erro na transcrição');
      }
    } catch (err) {
      console.error('Transcribe Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getWhatsAppUrl = () => {
    const phoneNumber = "5551981758382";
    const baseMsg = `Olá, meu nome é ${clientName || 'visitante'}.\n\nAcabei de conversar com o Lucca, seu Secretário Executivo, e gostaria de suporte humano.\n\n*Resumo da Necessidade:*\n${summary || 'O contato deseja falar com um especialista.'}`;
    return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(baseMsg)}`;
  };

  return (
    <>
      <AnimatePresence mode="wait">
        {isOpen && (
          <motion.div
            initial={isMobile ? { y: '100%', opacity: 0 } : { opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={isMobile ? { y: '100%', opacity: 0 } : { opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={cn(
              "fixed flex flex-col bg-white shadow-[0_20px_60px_rgba(0,0,0,0.15)] border-border overflow-hidden transition-all z-[600]",
              "inset-0 w-full h-[100dvh] rounded-none", // Mobile
              "sm:inset-auto sm:bottom-24 sm:right-6 sm:w-[390px] sm:h-[650px] sm:max-h-[85vh] sm:rounded-[32px] sm:border" // Desktop
            )}
          >
            {/* Header - Glassmorphism */}
            <div className={cn(
              "p-7 flex items-center justify-between z-10",
              "bg-white border-b border-border/50"
            )}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl shadow-lg shadow-primary/10 overflow-hidden relative border-2 border-white">
                  <Image 
                    src="/images/Avatar_Lucca_1000x1000.jpg" 
                    alt="Lucca Avatar" 
                    fill 
                    className="object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-[0.9rem] font-black tracking-tight text-text-main flex items-center gap-2">
                    Lucca <span className="w-1 h-1 rounded-full bg-border" /> <span className="text-primary italic">Suporte</span>
                  </h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                    <span className="text-[10px] font-bold text-text-dim tracking-wider uppercase">Disponível agora</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-10 h-10 flex items-center justify-center rounded-2xl bg-bg-secondary hover:bg-orange-50 hover:text-primary transition-all text-text-dim group active:scale-95"
                title="Fechar Chat"
              >
                <X size={20} className="group-hover:rotate-90 transition-transform duration-300" />
              </button>
            </div>

            {/* Messages Area - Light Premium Background with Subtle Pattern */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-hide relative bg-[#F9FAFB]"
              style={{
                backgroundImage: `radial-gradient(circle at 2px 2px, rgba(0,0,0,0.03) 1px, transparent 0)`,
                backgroundSize: '24px 24px'
              }}
            >
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "flex items-end gap-3 max-w-[90%]",
                    msg.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto flex-row"
                  )}
                >
                  {/* Icon/Avatar Container */}
                  <div className="flex-shrink-0 mb-1">
                    {msg.role === 'assistant' ? (
                      <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-primary border border-primary/10">
                        <Sparkles size={14} fill="currentColor" className="opacity-80" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full border-2 border-white shadow-md overflow-hidden relative bg-bg-secondary">
                        <Image 
                          src="/images/tools/publico_ideal.png" 
                          alt="User" 
                          fill 
                          className="object-cover"
                        />
                      </div>
                    )}
                  </div>

                  <div className={cn(
                    "flex flex-col",
                    msg.role === 'user' ? "items-end" : "items-start"
                  )}>
                    <div className={cn(
                      "px-5 py-4 text-[0.85rem] leading-[1.6] shadow-sm transition-all",
                      msg.role === 'user'
                        ? "bg-gradient-to-br from-[#FF6B00] to-[#FF9D00] text-white font-medium rounded-[20px] rounded-br-none shadow-orange-500/20"
                        : "bg-white border border-border/50 text-text-main font-medium rounded-[20px] rounded-bl-none shadow-sm"
                    )}>
                      {msg.content}
                    </div>

                    {/* Dynamic Buttons */}
                    {msg.buttons && msg.buttons.length > 0 && (
                      <div className="flex flex-col gap-2 w-full mt-3">
                        {msg.buttons.map((btn, btnIdx) => (
                          <a
                            key={btnIdx}
                            href={btn.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between gap-3 px-4 py-3 bg-white border border-border/50 hover:border-primary/30 hover:bg-orange-50/30 transition-all rounded-xl group"
                          >
                            <span className="text-[10px] font-bold text-text-main tracking-widest uppercase">
                              {btn.label}
                            </span>
                            <ExternalLink size={12} className="text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                          </a>
                        ))}
                      </div>
                    )}

                    <span className="text-[9px] font-bold text-text-dim mt-2 uppercase tracking-[0.2em] px-1">
                      {msg.role === 'user' ? 'Você' : 'LUCCA'}
                    </span>
                  </div>
                </motion.div>
              ))}

              {isLoading && (
                <div className="flex items-center gap-3 text-text-dim font-bold text-[9px] italic tracking-widest animate-pulse ml-11">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" />
                  </div>
                  PROCESSANDO...
                </div>
              )}
            </div>

            {/* Quick Actions & Input - Fixed Bottom */}
            <div className="p-6 bg-white border-t border-border/50 space-y-5">
              {showSuggestions && (
                <div className="flex flex-col gap-2">
                  <p className="text-[10px] font-bold text-text-dim uppercase tracking-widest ml-1">Sugestões de início</p>
                  <div className="flex flex-wrap gap-2">
                    {SUGGESTIONS.map((suggestion, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSend(suggestion)}
                        className="px-4 py-2.5 border border-border bg-white hover:border-primary/50 hover:bg-orange-50/50 text-[11px] font-bold text-text-main transition-all rounded-xl shadow-sm hover:shadow-md active:scale-95"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Conditional WhatsApp Call */}
              {showWhatsApp && (
                <motion.a
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  href={getWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 bg-grad-main text-white hover:shadow-[0_0_20px_rgba(59,111,255,0.3)] transition-all flex items-center justify-center gap-3 group rounded-xl border border-white/10"
                >
                  <Headset size={16} className="text-white" />
                  <span className="text-[10px] font-black tracking-[0.2em] uppercase italic">
                    Falar com Especialista
                  </span>
                  <ExternalLink size={10} className="opacity-50" />
                </motion.a>
              )}

              {/* Input field - Modern Glass */}
              <div className="relative group flex gap-2">
                {isRecording ? (
                  <div className="flex-1 flex items-center gap-4 bg-red-50 border border-red-100 rounded-2xl px-5 py-3 animate-pulse">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                    <span className="text-[11px] font-bold text-red-600 tracking-widest uppercase flex-1">
                      Gravando Áudio... {Math.floor(recordingSeconds / 60)}:{(recordingSeconds % 60).toString().padStart(2, '0')}
                    </span>
                    <button 
                      onClick={cancelRecording}
                      className="p-2 text-red-300 hover:text-red-600 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                    <button 
                      onClick={stopRecording}
                      className="w-12 h-12 bg-red-600 text-white rounded-2xl flex items-center justify-center hover:scale-105 transition-transform shadow-lg shadow-red-500/20"
                    >
                      <Square size={18} fill="white" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={input}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Escreva sua mensagem..."
                        className="w-full bg-bg-secondary border border-border focus:border-primary/30 focus:ring-4 focus:ring-primary/5 rounded-2xl py-4 pl-6 pr-14 text-sm text-text-main placeholder:text-text-dim focus:outline-none transition-all"
                      />
                      <button
                        onClick={startRecording}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-text-dim hover:text-primary transition-all group"
                      >
                        <Mic size={20} className="group-hover:scale-110 transition-transform" />
                      </button>
                    </div>
                    <button
                      onClick={() => handleSend()}
                      disabled={isLoading || !input.trim()}
                      className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FF6B00] to-[#FF9D00] hover:shadow-lg hover:shadow-orange-500/30 text-white transition-all disabled:opacity-30 disabled:grayscale flex items-center justify-center shadow-xl active:scale-95"
                    >
                      <Send size={22} className={cn(isLoading && "animate-pulse")} />
                    </button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Trigger Bubble */}
      <div className="fixed bottom-8 right-8 z-[100]">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "w-16 h-16 bg-gradient-to-br from-[#FF6B00] to-[#FF9D00] text-white rounded-[24px] flex items-center justify-center shadow-[0_15px_40px_rgba(255,107,0,0.4)] hover:scale-110 active:scale-95 transition-all group relative",
            isOpen ? "opacity-0 pointer-events-none scale-0" : "opacity-100 scale-100"
          )}
        >
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
          <div className="w-12 h-12 rounded-[16px] p-[2px] bg-gradient-to-br from-[#FF6B00] via-[#FF8F1F] to-[#B83A00] shadow-[0_0_0_1px_rgba(255,107,0,0.8),0_10px_24px_rgba(255,107,0,0.45)] relative group-hover:rotate-6 transition-transform duration-300">
            <div className="w-full h-full rounded-[14px] overflow-hidden relative bg-black/40">
              <Image
                src="/images/Avatar_Lucca_1000x1000.jpg"
                alt="Abrir chat com Lucca"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </button>
      </div>
    </>
  );
}
