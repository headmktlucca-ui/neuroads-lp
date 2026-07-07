'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Bot, ExternalLink, Lock,
  Send, Sparkles, Users, Paperclip, Mic, Terminal,
} from 'lucide-react';
import { getTeamAgentById } from '../../../../data/team-agents';
import { agents as allSpecialties } from '../../../../data/agents';
import { slugifyAgentTitle } from '../../../../lib/hub-agents';

// ─── Types ────────────────────────────────────────────────────────────────────

type ChatMessage = {
  id: string;
  role: 'user' | 'agent';
  content: string;
  ts: number;
};

// ─── Specialty card — all available, hover reveals "Entrar" ──────────────────

function SpecialtyCard({
  specialty,
  agentCor,
}: {
  specialty: (typeof allSpecialties)[number];
  agentCor: string;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="hub-neu-card flex flex-col gap-4 p-5 transition-all duration-300 overflow-hidden group cursor-pointer"
      style={{ borderLeft: `3px solid ${agentCor}` }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Top: icon + name */}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 shrink-0 rounded-xl overflow-hidden border border-white/40 bg-[#eef2f7] shadow-[inset_2px_2px_4px_#d1d9e6,_inset_-2px_-2px_4px_#ffffff]">
          <Image src={specialty.icon} alt={specialty.title} width={40} height={40} className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-[14px] font-black text-[#0f172a] leading-tight">{specialty.title}</h3>
          <p className="text-[12px] text-slate-500 font-semibold mt-1 line-clamp-2 leading-snug">{specialty.description}</p>
        </div>
      </div>

      {/* Hover "Entrar" button */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.18 }}
          >
            <Link
              href={`/hub/agente/${slugifyAgentTitle(specialty.title)}`}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-2xl text-[12px] font-black text-white transition-all hover:brightness-110 hover:scale-[1.01] active:scale-[0.99]"
              style={{ background: `linear-gradient(135deg, ${agentCor}, ${agentCor}cc)`, boxShadow: `0 3px 14px ${agentCor}40`, textDecoration: 'none' }}
            >
              <ExternalLink size={12} />
              Entrar
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Coming soon card ─────────────────────────────────────────────────────────

function ComingSoonCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="hub-neu-card flex flex-col gap-3 p-5 opacity-60">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 shrink-0 rounded-xl border border-slate-300/40 bg-slate-200/60 flex items-center justify-center">
          <Lock size={16} className="text-slate-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-[14px] font-black text-slate-400 leading-tight">{title}</h3>
          <p className="text-[12px] text-slate-400 font-semibold mt-1 line-clamp-2 leading-snug">{description}</p>
        </div>
      </div>
      <div className="flex items-center justify-center py-1.5 rounded-2xl border border-slate-300/40 bg-slate-200/40">
        <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">Em breve</span>
      </div>
    </div>
  );
}

// ─── Agent chat — style similar to assistente-ia (light, clean) ──────────────

function AgentChat({ agentNome, agentCor, agentFrase, agentAvatarSrc, agentPrompt }: {
  agentNome: string;
  agentCor: string;
  agentFrase: string;
  agentAvatarSrc: string;
  agentPrompt?: string;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [focused, setFocused] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);

  // Initialize message when component mounts or agentFrase changes
  useEffect(() => {
    setMessages([
      {
        id: '0',
        role: 'agent',
        content: `Olá! Sou ${agentNome}. ${agentFrase}\n\nComo posso ajudar hoje?`,
        ts: Date.now(),
      },
    ]);
  }, [agentNome, agentFrase]);

  useEffect(() => {
    if (messages.length > 1) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || isTyping) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: text, ts: Date.now() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    if (textRef.current) { textRef.current.style.height = 'auto'; }
    setIsTyping(true);

    try {
      const res = await fetch('/hub/assistente-ia/api', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          agentContext: agentPrompt || `Você é ${agentNome}, um Agente IA da equipe NeuroAds especializado em marketing B2B. Responda de forma direta, técnica e confiante como ${agentNome}.`,
        }),
      });
      const data = await res.json();
      const reply = data?.reply ?? `Entendido. Estou processando sua solicitação e retorno em instantes.`;
      setMessages((prev) => [...prev, { id: Date.now().toString(), role: 'agent', content: reply, ts: Date.now() }]);
    } catch {
      setMessages((prev) => [...prev, {
        id: Date.now().toString(),
        role: 'agent',
        content: `Conexão temporariamente indisponível. Tente novamente em instantes.`,
        ts: Date.now(),
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <div
      className="rounded-[24px] overflow-hidden flex flex-col bg-white border border-[#E5E7EB] shadow-[4px_4px_12px_#d1d9e6,_-4px_-4px_12px_#ffffff]"
      style={{ minHeight: 480, maxHeight: 600 }}
    >
      {/* Chat header — light style like assistente-ia */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-[#F3F4F6] bg-white shrink-0">
        <div className="relative w-9 h-9 shrink-0">
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{ background: `${agentCor}30` }}
            animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
          <div
            className="w-9 h-9 rounded-full overflow-hidden border-2"
            style={{ borderColor: `${agentCor}50` }}
          >
            <Image src={agentAvatarSrc} alt={agentNome} width={36} height={36} className="w-full h-full object-cover" />
          </div>
        </div>
        <div>
          <p className="text-[14px] font-black text-[#111827] leading-none">{agentNome}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] text-emerald-600 font-semibold">Online</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 bg-[#F9FAFB]">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              {!isUser && (
                <div className="w-7 h-7 rounded-full overflow-hidden shrink-0 border border-[#E5E7EB] shadow-sm mt-0.5">
                  <Image src={agentAvatarSrc} alt={agentNome} width={28} height={28} className="w-full h-full object-cover" />
                </div>
              )}

              {/* Bubble */}
              {isUser ? (
                <div className="bg-white border border-[#E5E7EB] rounded-2xl rounded-tr-sm px-4 py-3 text-[13px] text-[#111827] shadow-sm leading-relaxed max-w-[80%]">
                  {msg.content}
                </div>
              ) : (
                <div className="flex flex-col gap-1 max-w-[80%]">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{agentNome}</p>
                  <div className="text-[13px] text-[#374151] leading-relaxed whitespace-pre-wrap">
                    {msg.content}
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}

        {/* Typing indicator */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-start gap-2.5"
          >
            <div className="w-7 h-7 rounded-full overflow-hidden shrink-0 border border-[#E5E7EB] shadow-sm">
              <Image src={agentAvatarSrc} alt={agentNome} width={28} height={28} className="w-full h-full object-cover" />
            </div>
            <div className="px-4 py-3 rounded-2xl bg-white border border-[#E5E7EB] shadow-sm">
              <div className="flex gap-1.5 items-center h-4">
                {[0, 0.2, 0.4].map((d) => (
                  <motion.span
                    key={d}
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: agentCor }}
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1, repeat: Infinity, delay: d }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input — assistente-ia style */}
      <div className="shrink-0 px-4 pb-4 pt-2 border-t border-[#E5E7EB] bg-white">
        <div className={`relative flex items-end gap-1 bg-white border rounded-2xl px-1 py-1 shadow-sm transition-all duration-200 ${focused ? 'border-[#D1D5DB] shadow-[0_0_0_3px_rgba(0,0,0,0.06)]' : 'border-[#E5E7EB]'}`}>
          {/* Paperclip */}
          <button type="button" className="p-2 text-[#9CA3AF] hover:text-[#374151] transition-colors shrink-0">
            <Paperclip className="w-4 h-4" />
          </button>

          {/* Textarea */}
          <textarea
            ref={textRef}
            value={input}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onChange={e => {
              setInput(e.target.value);
              e.target.style.height = 'auto';
              e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
            }}
            onKeyDown={handleKey}
            disabled={isTyping}
            placeholder={isTyping ? `${agentNome} está pensando...` : `Fale com ${agentNome}…`}
            className="flex-1 min-h-[40px] max-h-[120px] bg-transparent border-none resize-none outline-none text-[14px] text-[#111827] placeholder:text-[#9CA3AF] py-2.5 px-1 leading-relaxed disabled:opacity-50"
            rows={1}
          />

          {/* Right buttons */}
          <div className="flex items-center gap-0.5 shrink-0 pb-1">
            <button type="button" className="p-2 text-[#9CA3AF] hover:text-[#374151] transition-colors">
              <Mic className="w-4 h-4" />
            </button>
            {/* Send */}
            <motion.button
              type="button"
              onClick={sendMessage}
              disabled={!input.trim() || isTyping}
              whileTap={{ scale: 0.88 }}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ml-0.5 ${input.trim() && !isTyping ? 'text-white shadow-md hover:opacity-90' : 'bg-[#E5E7EB] text-[#9CA3AF] cursor-not-allowed'}`}
              style={input.trim() && !isTyping ? { background: `linear-gradient(135deg, ${agentCor}, ${agentCor}cc)` } : {}}
            >
              <Send className="w-3.5 h-3.5" />
            </motion.button>
          </div>
        </div>
        <p className="text-center text-[10px] text-[#9CA3AF] mt-2">
          Powered by NeuroAds AI · Gemini
        </p>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function MembroPage() {
  const { id } = useParams<{ id: string }>();

  const teamAgent = getTeamAgentById(id as string);

  // Scroll to top on mount / id change — target the hub layout scroll container
  useEffect(() => {
    const container = document.getElementById('hub-scroll-container');
    if (container) {
      container.scrollTo({ top: 0, behavior: 'instant' });
    } else {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [id]);

  if (!teamAgent) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4 px-6">
        <Users size={36} className="text-slate-300" />
        <p className="text-[15px] font-black text-slate-400">Agente não encontrado.</p>
        <Link href="/hub/laboratorio-agentes" className="text-[13px] font-black text-[#FF6A00]" style={{ textDecoration: 'none' }}>
          ← Voltar ao Laboratório
        </Link>
      </div>
    );
  }

  const specialtiesForAgent = allSpecialties.filter((s) => teamAgent.specialtyTitles.includes(s.title));

  return (
    <div className="space-y-8 w-full px-6 pb-16 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* ── Back button ── */}
      <Link
        href="/hub/laboratorio-agentes"
        className="inline-flex items-center gap-2 mt-6 text-[12px] font-black text-slate-500 hover:text-[#FF6A00] transition-colors"
        style={{ textDecoration: 'none' }}
      >
        <ArrowLeft size={14} />
        Equipe de Agentes IA
      </Link>

      {/* ── Hero identity ── */}
      <div
        className="rounded-[28px] border border-white/60 bg-[#eef2f7] p-6 md:p-8 shadow-[6px_6px_16px_#d1d9e6,_-6px_-6px_16px_#ffffff]"
        style={{ borderLeft: `4px solid ${teamAgent.cor}` }}
      >
        <div className="flex items-start gap-6 flex-wrap">
          {/* Avatar — doubled size */}
          <div
            className="w-40 h-40 shrink-0 rounded-3xl overflow-hidden shadow-[6px_6px_18px_#d1d9e6,_-6px_-6px_18px_#ffffff] border-2 border-white/70"
            style={{ background: `radial-gradient(circle at 35% 35%, ${teamAgent.cor}35, ${teamAgent.cor}10)` }}
          >
            <Image
              src={teamAgent.avatarSrc}
              alt={teamAgent.nome}
              width={160}
              height={160}
              className="w-full h-full object-cover"
              priority
            />
          </div>

          {/* Identity block */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-[32px] font-black text-[#0f172a] tracking-tight leading-none">{teamAgent.nome}</span>
              <span
                className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border"
                style={{ color: teamAgent.cor, background: `${teamAgent.cor}15`, borderColor: `${teamAgent.cor}30` }}
              >
                {teamAgent.categoria}
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {teamAgent.genero === 'F' ? '♀ Agente Feminina' : '♂ Agente Masculino'}
              </span>
            </div>
            <p className="text-[14px] font-semibold text-slate-500 mt-1">{teamAgent.funcao}</p>
            <p className="text-[13px] font-medium text-slate-400 italic mt-2 leading-relaxed max-w-2xl">
              &ldquo;{teamAgent.tagline}&rdquo;
            </p>
            <p className="text-[13px] text-slate-600 font-semibold mt-3 leading-relaxed max-w-2xl">{teamAgent.descricao}</p>

            {/* Personality pills */}
            <div className="flex gap-2 flex-wrap mt-4">
              {teamAgent.personalidade.split(' · ').map((trait) => (
                <span
                  key={trait}
                  className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border border-white/40 bg-[#eef2f7] shadow-[2px_2px_4px_#d1d9e6,_-2px_-2px_4px_#ffffff] text-slate-500"
                >
                  {trait}
                </span>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="flex flex-col gap-3 shrink-0">
            <div className="text-center px-5 py-3 rounded-2xl border border-white/60 bg-[#eef2f7] shadow-[3px_3px_6px_#d1d9e6,_-3px_-3px_6px_#ffffff]">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Especialidades</p>
              <p className="text-[22px] font-black mt-1" style={{ color: teamAgent.cor }}>
                {specialtiesForAgent.length + teamAgent.comingSoonSpecialties.length}
              </p>
              <p className="text-[10px] text-slate-400 font-semibold">disponíveis</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Two-column layout: specialties + chat ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

        {/* Left: Specialties */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles size={14} style={{ color: teamAgent.cor }} />
            <h2 className="text-[15px] font-black text-[#0f172a] tracking-tight">
              Especialidades de {teamAgent.nome}
            </h2>
          </div>

          {specialtiesForAgent.length === 0 && teamAgent.comingSoonSpecialties.length > 0 && (
            <div className="rounded-2xl border border-slate-200/60 bg-[#eef2f7] p-4 shadow-[2px_2px_6px_#d1d9e6,_-2px_-2px_6px_#ffffff]">
              <p className="text-[12px] font-semibold text-slate-500 text-center">
                As especialidades de {teamAgent.nome} estão sendo finalizadas. Em breve disponíveis.
              </p>
            </div>
          )}

          {specialtiesForAgent.map((specialty) => (
            <SpecialtyCard
              key={specialty.title}
              specialty={specialty}
              agentCor={teamAgent.cor}
            />
          ))}

          {teamAgent.comingSoonSpecialties.map((cs) => (
            <ComingSoonCard key={cs.title} title={cs.title} description={cs.description} />
          ))}
        </div>

        {/* Right: Chat */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Bot size={14} style={{ color: teamAgent.cor }} />
            <h2 className="text-[15px] font-black text-[#0f172a] tracking-tight">
              Fale com {teamAgent.nome}
            </h2>
          </div>
          <AgentChat
            agentNome={teamAgent.nome}
            agentCor={teamAgent.cor}
            agentFrase={teamAgent.frase}
            agentAvatarSrc={teamAgent.avatarSrc}
            agentPrompt={teamAgent.prompt}
          />
        </div>
      </div>

      {/* ── Habilidades ── */}
      <div className="rounded-[24px] border border-white/60 bg-[#eef2f7] p-6 shadow-[4px_4px_10px_#d1d9e6,_-4px_-4px_10px_#ffffff]">
        <h2 className="text-[14px] font-black text-[#0f172a] uppercase tracking-widest mb-4" style={{ color: teamAgent.cor }}>
          Habilidades Principais
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {teamAgent.habilidades.map((h) => (
            <div key={h} className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: teamAgent.cor, boxShadow: `0 0 6px ${teamAgent.cor}` }} />
              <span className="text-[13px] text-slate-600 font-semibold">{h}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Script de Operação / Prompt ── */}
      <div className="rounded-[24px] border border-white/60 bg-[#eef2f7] p-6 shadow-[4px_4px_10px_#d1d9e6,_-4px_-4px_10px_#ffffff]">
        <div className="flex items-center gap-2 mb-4">
          <Terminal size={14} style={{ color: teamAgent.cor }} />
          <h2 className="text-[14px] font-black text-[#0f172a] uppercase tracking-widest">
            Script de Operação & Diretrizes (System Prompt)
          </h2>
        </div>
        <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 shadow-inner font-mono text-[12px] text-slate-300 whitespace-pre-wrap leading-relaxed overflow-x-auto max-h-[350px]">
          {teamAgent.prompt || `# IDENTIDADE
Você é ${teamAgent.nome}, o ${teamAgent.funcao} Autônomo da NeuroAds.

# CARGO E RESPONSABILIDADES
${teamAgent.habilidades.map((h) => `- ${h}`).join('\n')}

# TOM DE VOZ
${teamAgent.personalidade.replace(/ · /g, ', ')} — Direto, profissional e focado em resultados.

# REGRAS DE OPERAÇÃO
1. Responda de forma direta, técnica e confiante.
2. Toda recomendação deve ser fundamentada em dados e melhores práticas de mercado.
3. Se o usuário solicitar dados reais de plataformas não integradas, atue de forma simulada indicando a necessidade de conectar a fonte.`}
        </div>
      </div>
    </div>
  );
}
