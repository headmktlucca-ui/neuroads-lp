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

export default function AgentCard({ agent, onClick, index, startingPrice, contractStatus }: AgentCardProps) {
  const isContractActive = contractStatus.isActive;
  const planName = contractStatus.planName || 'Plano ativo';
  const planPrice = contractStatus.monthlyPrice ?? startingPrice;
  const monthlyLimit = contractStatus.monthlyLimit;
  const usageUsed = contractStatus.usageUsed;
  const nextPaymentLabel = formatDate(contractStatus.nextPaymentAt);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      viewport={{ once: true }}
      onClick={onClick}
      className="group relative h-full cursor-pointer"
    >
      <div className="relative h-full p-[2px] rounded-[24px] bg-gradient-to-br from-[#FFEBDD] via-[#FFBE94] to-[#FF7A00] shadow-[0_12px_28px_rgba(255,107,0,0.18)] transition-all duration-500 group-hover:shadow-[0_18px_36px_rgba(255,107,0,0.24)]">
        <div className="relative h-full p-6 rounded-[22px] border border-[#FFF1E8] bg-white overflow-hidden flex flex-col">

          {/* Background gradient on hover */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

          {/* Top accent */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-primary/15 to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

          {/* Icon & Title Section */}
          <div className="relative z-10 mb-5">
            <div className="w-14 h-14 rounded-[14px] p-[2px] bg-gradient-to-br from-[#FF6B00] via-[#FF8F1F] to-[#B83A00] shadow-[0_0_0_1px_rgba(255,107,0,0.7),0_10px_20px_rgba(255,107,0,0.25)] mb-4">
              <div className="relative w-full h-full rounded-[12px] overflow-hidden bg-white">
                <Image
                  src={agent.icon}
                  alt={agent.title}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
            </div>
            <h3 className="text-base font-bold text-text-main tracking-tight group-hover:text-primary transition-colors duration-300">
              {agent.title}
            </h3>
          </div>

          {/* Description */}
          <p className="relative z-10 text-sm text-text-muted leading-relaxed mb-6 flex-grow line-clamp-4">
            {agent.description}
          </p>

          {/* Commercial info */}
          <div className="relative z-10 mb-4 p-4 rounded-xl border border-[#FFE8D6] bg-[#FFF8F3]">
            {!isContractActive ? (
              <p className="text-xs md:text-sm font-semibold text-[#B94A00] tracking-wide">
                a partir de {formatBRL(startingPrice)}/mês
              </p>
            ) : (
              <div className="space-y-1">
                <p className="text-xs md:text-sm font-bold text-[#0A9D57]">
                  {planName} • {formatBRL(planPrice)}/mês
                </p>
                <p className="text-[11px] md:text-xs text-text-muted">
                  Limite: {monthlyLimit ?? 'A confirmar'} exec./mês • Em uso: {usageUsed ?? 'A confirmar'}
                </p>
                <p className="text-[11px] md:text-xs text-text-muted">
                  Próximo pagamento: {nextPaymentLabel}
                </p>
              </div>
            )}
          </div>

          {/* Footer CTA */}
          <div className="relative z-10 pt-4 border-t border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap size={14} className={isContractActive ? 'text-[#0A9D57]' : 'text-primary'} />
              <span className="text-xs font-bold tracking-[0.08em] text-[#0A9D57]">
                {isContractActive ? 'Contratado' : 'Contratar'}
              </span>
            </div>
            <button className="text-xs font-bold text-text-dim group-hover:text-primary transition-colors flex items-center gap-1 tracking-widest">
              + detalhes <span className="group-hover:translate-x-1 transition-transform">→</span>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
