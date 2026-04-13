'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, User, Bot, ExternalLink, Headset } from 'lucide-react';
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

export default function SupportChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const chatMessages = messages.concat(userMessage).map(m => ({
        role: m.role as 'user' | 'assistant' | 'system',
        content: m.content
      }));

      const result = await chatWithSupport(chatMessages);

      if (result.success && result.content) {
        setMessages((prev) => [...prev, { role: 'assistant', content: result.content! }]);
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

  return (
    <div className="fixed bottom-6 right-6 z-[100] font-sans">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20, filter: 'blur(10px)' }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.9, y: 20, filter: 'blur(10px)' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="absolute bottom-20 right-0 w-[90vw] sm:w-[400px] h-[600px] max-h-[70vh] glass-card rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col border border-white/10"
          >
            {/* Header */}
            <div className="p-6 bg-gradient-to-r from-black/80 to-[var(--color-surface-accent)] border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[var(--color-brand-orange)]/20 flex items-center justify-center border border-[var(--color-brand-orange)]/30 animate-pulse">
                  <Bot size={20} className="text-[var(--color-brand-orange)]" />
                </div>
                <div>
                  <h3 className="text-sm font-black tracking-widest text-white uppercase italic">Suporte Neural</h3>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-brand-green)] animate-pulse" />
                    <span className="text-[10px] font-mono text-[var(--color-brand-green)]/70 tracking-tighter uppercase">Agente IA Ativo</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/5 rounded-full transition-colors text-white/50 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            {/* Messages Area */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide bg-black/40"
            >
              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
                  <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center border border-white/10">
                    <MessageSquare size={32} className="text-white/20" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-black tracking-widest text-white uppercase italic">Inicie uma conversa</p>
                    <p className="text-[10px] text-white/40 max-w-[200px]">Tire dúvidas sobre tráfego pago, funis e IA.</p>
                  </div>
                </div>
              )}

              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={cn(
                    "flex flex-col max-w-[85%]",
                    msg.role === 'user' ? "ml-auto items-end" : "mr-auto items-start"
                  )}
                >
                  <div className={cn(
                    "px-4 py-3 rounded-2xl text-sm leading-relaxed",
                    msg.role === 'user' 
                      ? "bg-[var(--color-brand-orange)] text-black font-medium rounded-tr-none shadow-[0_10px_20px_rgba(249,166,32,0.1)]" 
                      : "bg-white/5 border border-white/10 text-white/90 rounded-tl-none"
                  )}>
                    {msg.content}
                  </div>
                  <span className="text-[9px] font-mono text-white/30 mt-1 uppercase tracking-tighter">
                    {msg.role === 'user' ? 'Você' : 'NeuroBot'}
                  </span>
                </motion.div>
              ))}

              {isLoading && (
                <div className="flex items-center gap-2 text-white/30 font-mono text-[10px] italic animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-[var(--color-brand-green)]" />
                  PROCESSANDO SINAPSES...
                </div>
              )}
            </div>

            {/* Quick Actions & Input */}
            <div className="p-6 bg-black/60 border-t border-white/5 space-y-4">
              {/* Persistent WhatsApp Button */}
              <a
                href="https://wa.me/5511999999999" // TODO: Atualizar com número real
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[var(--color-brand-green)]/30 transition-all rounded-xl flex items-center justify-center gap-2 group"
              >
                <Headset size={16} className="text-[var(--color-brand-green)] group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-black tracking-[0.2em] text-white uppercase italic group-hover:text-[var(--color-brand-green)] transition-colors">
                  Falar com Humano
                </span>
                <ExternalLink size={10} className="text-white/20" />
              </a>

              {/* Input field */}
              <div className="relative group">
                <input
                  type="text"
                  value={input}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Digite sua dúvida neural..."
                  className="w-full bg-black/40 border border-white/10 focus:border-[var(--color-brand-orange)]/50 rounded-2xl py-4 pl-5 pr-14 text-sm text-white placeholder:text-white/20 focus:outline-none transition-all"
                />
                <button
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                  className="absolute right-2 top-2 bottom-2 px-3 bg-[var(--color-brand-orange)] hover:bg-[var(--color-brand-orange-hover)] text-black rounded-xl transition-all disabled:opacity-30 disabled:grayscale"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Floating Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={cn(
          "relative p-5 rounded-full shadow-[0_15px_30px_rgba(0,0,0,0.4)] transition-all flex items-center justify-center overflow-hidden border",
          isOpen 
            ? "bg-white text-black border-white" 
            : "bg-black text-white border-white/10 hover:border-[var(--color-brand-orange)]/50"
        )}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
            >
              <X size={24} />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              className="flex items-center gap-3 px-2"
            >
              <MessageSquare size={24} className="text-[var(--color-brand-orange)]" />
              <span className="text-xs font-black tracking-[0.3em] uppercase italic pr-2">Suporte</span>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Animated background glow */}
        {!isOpen && (
          <div className="absolute inset-0 bg-gradient-to-tr from-[var(--color-brand-orange)]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        )}
      </motion.button>
    </div>
  );
}
