'use client';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Agent } from '../../data/agents';
import { Zap } from 'lucide-react';
import { formatBRL } from '../../data/agent-pricing';
import type { AgentContractStatus } from '../../lib/hub-agents';

interface AgentCardProps {
  agent: Agent;
  onClick: () => void;
  index: number;
  startingPrice: number;
  contractStatus: AgentContractStatus;
}

function formatDate(dateString?: string): string {
  if (!dateString) return 'A confirmar';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return 'A confirmar';
  return date.toLocaleDateString('pt-BR');
}

export default function AgentCard({ agent, onClick, index, contractStatus }: Omit<AgentCardProps, 'startingPrice'>) {
  const isContractActive = true; // No Open Access Hub, todos os agentes estão ativos
  const cardShellClass = 'bg-gradient-to-br from-[#FFEBDD] via-[#FFBE94] to-[#FF7A00] shadow-[0_12px_28px_rgba(255,107,0,0.18)] group-hover:shadow-[0_18px_36px_rgba(255,107,0,0.24)]';
  const cardInnerClass = 'border-[#FFF1E8] bg-white';
  const iconShellClass = 'bg-gradient-to-br from-[#FF6B00] via-[#FF8F1F] to-[#B83A00] shadow-[0_0_0_1px_rgba(255,107,0,0.7),0_10px_20px_rgba(255,107,0,0.25)]';
  
  const titleClass = 'group-hover:text-primary';
  const footerTextClass = 'text-[#0A9D57]';
  const detailsButtonClass = 'text-text-dim group-hover:text-primary';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      viewport={{ once: true }}
      onClick={onClick}
      className="group relative h-full cursor-pointer"
    >
      <div className={`relative h-full p-[2px] rounded-[24px] transition-all duration-500 ${cardShellClass}`}>
        <div className={`relative h-full p-6 rounded-[22px] border overflow-hidden flex flex-col ${cardInnerClass}`}>

          {/* Background gradient on hover */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-gradient-to-br from-primary/8 via-transparent to-transparent" />

          {/* Top accent */}
          <div className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-gradient-to-bl from-primary/15 to-transparent" />

          {/* Icon & Title Section */}
          <div className="relative z-10 mb-5">
            <div className={`w-14 h-14 rounded-[14px] p-[2px] mb-4 ${iconShellClass}`}>
              <div className="relative w-full h-full rounded-[12px] overflow-hidden bg-white">
                <Image
                  src={agent.icon}
                  alt={agent.title}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
            </div>
            <h3 className={`text-base font-bold tracking-tight transition-colors duration-300 text-text-main ${titleClass}`}>
              {agent.title}
            </h3>
          </div>

          {/* Description */}
          <p className="relative z-10 text-sm leading-relaxed mb-6 flex-grow line-clamp-4 text-text-muted">
            {agent.description}
          </p>

          {/* Hub Access Badge */}
          <div className="relative z-10 mb-4 p-3 rounded-xl border border-[#E7F4EC] bg-[#F8FFFB]">
            <p className="text-xs font-bold text-[#0A9D57] flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#08B760] animate-pulse" />
              Acesso Neural Liberado
            </p>
          </div>

          {/* Footer CTA */}
          <div className="relative z-10 pt-4 border-t border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap size={14} className="text-[#0A9D57]" />
              <span className={`text-xs font-bold tracking-[0.08em] ${footerTextClass}`}>
                HUB ABERTO
              </span>
            </div>
            <button className={`text-xs font-bold transition-colors flex items-center gap-1 tracking-widest ${detailsButtonClass}`}>
              abrir agente <span className="group-hover:translate-x-1 transition-transform">→</span>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
