'use client';

import React, { useState } from 'react';
import { Send, Bot, User, Sparkles, Paperclip, Mic } from 'lucide-react';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

export default function HubAssistentePage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Olá! Sou o Lucca, seu consultor de marketing movido por IA. Como posso ajudar a otimizar suas campanhas hoje?',
    }
  ]);
  const [input, setInput] = useState('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setMessages((prev) => [...prev, { id: Date.now().toString(), role: 'user', content: input }]);
    setInput('');
    
    // Mock response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'Analisando os dados da sua conta... Posso sugerir uma otimização no público-alvo da campanha principal para reduzir o CPA em cerca de 15%. Deseja ver os detalhes?',
        }
      ]);
    }, 1000);
  };

  return (
    <div className="px-6 flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Header */}
      <header className="py-8 border-b border-white/[0.06] mb-8">
        <div className="flex items-start justify-between gap-6 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="h-1.5 w-1.5 rounded-full bg-[#FF6A00] shadow-[0_0_6px_rgba(255,106,0,0.8)] animate-pulse" />
              <span className="text-[11px] font-black uppercase tracking-[0.16em] text-[#FF6A00]">Assistente IA</span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight leading-tight">Converse com o Lucca</h1>
            <p className="text-[#8fa0b5] text-[15px] mt-2 max-w-xl leading-relaxed">
              Seu consultor de marketing movido por IA. Pergunte sobre campanhas, métricas e estratégias — Lucca analisa seus dados em tempo real.
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#0d1a2a]/60 border border-[#FF6A00]/20 backdrop-blur-md shrink-0">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)] animate-pulse" />
            <span className="text-[13px] font-bold text-white">Sempre</span>
            <span className="text-[13px] text-[#8fa0b5]">online</span>
          </div>
        </div>
      </header>

    <div className="flex flex-col h-[calc(100vh-310px)] w-full max-w-4xl mx-auto rounded-3xl bg-[#0d1a2a]/40 border border-[#FF6A00]/20 backdrop-blur-md overflow-hidden relative shadow-[0_0_80px_rgba(0,0,0,0.5)]">
      
      {/* Header */}
      <header className="flex items-center gap-4 p-5 border-b border-white/[0.06] bg-white/[0.02]">
        <div className="relative shrink-0">
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#FF6A00]/30 shadow-[0_0_15px_rgba(255,106,0,0.3)]">
            <img src="/images/Avatar_Lucca_Novo.jpeg" alt="Lucca" className="w-full h-full object-cover" />
          </div>
          <div className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-[#0d1a2a]" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            Lucca | Gestão & Estratégia <Sparkles className="w-4 h-4 text-[#FF6A00]" />
          </h2>
          <p className="text-[13px] text-emerald-400 font-medium">Agente de Operações IA</p>
        </div>
      </header>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-subtle">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex items-start gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
            {/* Avatar */}
            {msg.role === 'user' ? (
              <div className="w-10 h-10 shrink-0 rounded-full flex items-center justify-center border bg-white/[0.05] border-white/[0.1]">
                <User className="w-5 h-5 text-white/70" />
              </div>
            ) : (
              <div className="w-10 h-10 shrink-0 rounded-full overflow-hidden border border-[#FF6A00]/30 shadow-[0_0_8px_rgba(255,106,0,0.2)]">
                <img src="/images/Avatar_Lucca_Novo.jpeg" alt="Lucca" className="w-full h-full object-cover" />
              </div>
            )}

            {/* Bubble */}
            <div className={`max-w-[80%] rounded-2xl p-4 text-[14px] leading-relaxed ${
              msg.role === 'user'
                ? 'bg-[#FF6A00] text-white rounded-tr-sm'
                : 'bg-[#152336] text-white/90 border border-white/[0.06] rounded-tl-sm shadow-[0_4px_24px_rgba(0,0,0,0.2)]'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-gradient-to-t from-[#08101e] to-transparent">
        <form onSubmit={handleSend} className="relative flex items-end gap-2 bg-[#0d1a2a] border border-white/[0.1] rounded-2xl p-2 focus-within:border-white/[0.2] focus-within:ring-1 focus-within:ring-white/[0.1] transition-all shadow-lg">
          
          <button type="button" className="p-3 text-[#8fa0b5] hover:text-white transition-colors shrink-0">
            <Paperclip className="w-5 h-5" />
          </button>
          
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend(e);
              }
            }}
            placeholder="Pergunte ao Lucca sobre suas campanhas..."
            className="flex-1 max-h-32 min-h-[44px] bg-transparent border-none text-white placeholder:text-[#8fa0b5] resize-none py-3 px-2 focus:ring-0 text-[14px]"
            rows={1}
          />
          
          <div className="flex items-center gap-1 shrink-0 pb-1 pr-1">
            <button type="button" className="p-2 text-[#8fa0b5] hover:text-white transition-colors">
              <Mic className="w-5 h-5" />
            </button>
            <button 
              type="submit" 
              disabled={!input.trim()}
              className="p-2.5 bg-gradient-to-r from-[#F24900] to-[#FF8805] hover:from-[#d93f00] hover:to-[#e07500] disabled:bg-white/[0.05] disabled:text-white/20 text-white rounded-xl transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
        <div className="text-center mt-3">
          <span className="text-[11px] text-[#8fa0b5]">O Lucca pode cometer erros. Considere verificar as métricas importantes.</span>
        </div>
      </div>

    </div>
    </div>
  );
}
