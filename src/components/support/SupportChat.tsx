'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Bot, ExternalLink, Headset } from 'lucide-react';
import { chatWithSupport } from '../../app/actions/chat-support';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const INITIAL_GREETING = "Olá! Sou o Estrategista Neural da NeuroAds. Minha missão é extrair o máximo de ROI da sua operação. Como posso te ajudar a escalar hoje?";

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
  const scrollRef = useRef<HTMLDivElement>(null);

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
        setMessages((prev) => [...prev, { role: 'assistant', content: result.content! }]);
        
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

  const getWhatsAppUrl = () => {
    const phoneNumber = "5551981758382"; 
    const baseMsg = `Olá, meu nome é ${clientName || 'visitante'}.\n\nAcabei de conversar com o NeuroBot e gostaria de suporte humano.\n\n*Resumo da Conversa:*\n${summary || 'O contato deseja falar com um especialista.'}`;
    return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(baseMsg)}`;
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] font-sans">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="absolute bottom-20 right-0 w-[90vw] sm:w-[380px] h-[600px] max-h-[75vh] bg-cream flex flex-col shadow-[20px_20px_60px_rgba(22,15,8,0.15)] border border-ink/10 overflow-hidden rounded-none"
          >
            {/* Header - Brutalist Ink */}
            <div className="p-6 bg-ink border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-brand flex items-center justify-center border border-white/10">
                  <Bot size={20} className="text-ink" />
                </div>
                <div>
                  <h3 className="text-[0.75rem] font-black tracking-[0.2em] text-cream uppercase italic font-serif">Suporte Neural</h3>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-brand animate-pulse" />
                    <span className="text-[9px] font-bold text-green-brand/60 tracking-wider uppercase">Bot Operacional</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/10 transition-colors text-white/50 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            {/* Messages Area - Cream with Grid */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide relative"
              style={{
                backgroundImage: `radial-gradient(circle, rgba(22,15,8,0.03) 1px, transparent 1px)`,
                backgroundSize: '20px 20px'
              }}
            >
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "flex flex-col max-w-[88%]",
                    msg.role === 'user' ? "ml-auto items-end" : "mr-auto items-start"
                  )}
                >
                  <div className={cn(
                    "px-5 py-4 text-[0.85rem] leading-[1.6] shadow-sm transition-all",
                    msg.role === 'user' 
                      ? "bg-green-brand text-ink font-semibold rounded-none border border-ink/5" 
                      : "bg-white border border-ink/10 text-ink rounded-none"
                  )}>
                    {msg.content}
                  </div>
                  <span className="text-[10px] font-bold text-ink/40 mt-2 uppercase tracking-widest italic font-serif">
                    {msg.role === 'user' ? 'Visitante' : 'NeuroBot'}
                  </span>
                </motion.div>
              ))}

              {isLoading && (
                <div className="flex items-center gap-2 text-ink/30 font-bold text-[9px] italic tracking-widest animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-green-brand" />
                  ANALISANDO SINAPSES...
                </div>
              )}
            </div>

            {/* Quick Actions & Input - Fixed Bottom */}
            <div className="p-6 bg-white border-t border-ink/5 space-y-4">
              {showSuggestions && (
                <div className="flex flex-wrap gap-2">
                  {SUGGESTIONS.map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(suggestion)}
                      className="px-3 py-1.5 border border-ink/10 hover:border-green-brand hover:bg-green-brand/5 text-[10px] font-bold text-ink/60 hover:text-ink transition-all uppercase tracking-wider"
                    >
                      {suggestion}
                    </button>
                  ))}
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
                  className="w-full py-3 bg-ink text-cream hover:bg-green-brand hover:text-ink transition-all flex items-center justify-center gap-3 group border border-ink"
                >
                  <Headset size={16} className="text-green-brand group-hover:text-ink transition-colors" />
                  <span className="text-[10px] font-black tracking-[0.2em] uppercase italic">
                    Conectar Especialista
                  </span>
                  <ExternalLink size={10} className="opacity-30" />
                </motion.a>
              )}

              {/* Input field - Brutalist */}
              <div className="relative group flex gap-2">
                <input
                  type="text"
                  value={input}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Solicite um diagnóstico..."
                  className="flex-1 bg-cream/50 border border-ink/10 focus:border-green-brand rounded-none py-3.5 px-5 text-sm text-ink placeholder:text-ink/30 focus:outline-none transition-all"
                />
                <button
                  onClick={() => handleSend()}
                  disabled={isLoading || !input.trim()}
                  className="px-4 bg-ink hover:bg-green-brand text-cream hover:text-ink transition-all disabled:opacity-30"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
