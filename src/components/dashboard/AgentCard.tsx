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
  const cardShellClass = isContractActive
    ? 'bg-gradient-to-br from-[#FFEBDD] via-[#FFBE94] to-[#FF7A00] shadow-[0_12px_28px_rgba(255,107,0,0.18)] group-hover:shadow-[0_18px_36px_rgba(255,107,0,0.24)]'
    : 'bg-gradient-to-br from-[#F8FAFC] via-[#EEF2F7] to-[#E2E8F0] shadow-[0_10px_24px_rgba(148,163,184,0.18)] group-hover:shadow-[0_14px_28px_rgba(148,163,184,0.22)]';
  const cardInnerClass = isContractActive
    ? 'border-[#FFF1E8] bg-white'
    : 'border-[#E2E8F0] bg-[#F8FAFC]';
  const iconShellClass = isContractActive
    ? 'bg-gradient-to-br from-[#FF6B00] via-[#FF8F1F] to-[#B83A00] shadow-[0_0_0_1px_rgba(255,107,0,0.7),0_10px_20px_rgba(255,107,0,0.25)]'
    : 'bg-gradient-to-br from-[#E2E8F0] via-[#CBD5E1] to-[#94A3B8] shadow-[0_0_0_1px_rgba(148,163,184,0.55),0_10px_20px_rgba(148,163,184,0.18)]';
  const pricingClass = isContractActive
    ? 'border-[#E7F4EC] bg-[#F8FFFB]'
    : 'border-[#DCE3EE] bg-[#F1F5F9]';
  const pricingTextClass = isContractActive ? 'text-[#0A9D57]' : 'text-[#64748B]';
  const titleClass = isContractActive
    ? 'group-hover:text-primary'
    : 'group-hover:text-slate-700';
  const footerTextClass = isContractActive ? 'text-[#0A9D57]' : 'text-[#64748B]';
  const detailsButtonClass = isContractActive
    ? 'text-text-dim group-hover:text-primary'
    : 'text-slate-500 group-hover:text-slate-700';

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
          <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none ${
            isContractActive
              ? 'bg-gradient-to-br from-primary/8 via-transparent to-transparent'
              : 'bg-gradient-to-br from-slate-500/8 via-transparent to-transparent'
          }`} />

          {/* Top accent */}
          <div className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none ${
            isContractActive
              ? 'bg-gradient-to-bl from-primary/15 to-transparent'
              : 'bg-gradient-to-bl from-slate-400/20 to-transparent'
          }`} />

          {/* Icon & Title Section */}
          <div className="relative z-10 mb-5">
            <div className={`w-14 h-14 rounded-[14px] p-[2px] mb-4 ${iconShellClass}`}>
              <div className="relative w-full h-full rounded-[12px] overflow-hidden bg-white">
                <Image
                  src={agent.icon}
                  alt={agent.title}
                  fill
                  className={`object-cover group-hover:scale-110 transition-transform duration-500 ${
                    isContractActive ? '' : 'grayscale-[35%] saturate-[0.7]'
                  }`}
                />
              </div>
            </div>
            <h3 className={`text-base font-bold text-text-main tracking-tight transition-colors duration-300 ${titleClass}`}>
              {agent.title}
            </h3>
          </div>

          {/* Description */}
          <p className="relative z-10 text-sm text-text-muted leading-relaxed mb-6 flex-grow line-clamp-4">
            {agent.description}
          </p>

          {/* Commercial info */}
          <div className={`relative z-10 mb-4 p-4 rounded-xl border ${pricingClass}`}>
            {!isContractActive ? (
              <p className={`text-xs md:text-sm font-semibold tracking-wide ${pricingTextClass}`}>
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
              <Zap size={14} className={isContractActive ? 'text-[#0A9D57]' : 'text-[#64748B]'} />
              <span className={`text-xs font-bold tracking-[0.08em] ${footerTextClass}`}>
                {isContractActive ? 'Contratado' : 'Em desenvolvimento'}
              </span>
            </div>
            <button className={`text-xs font-bold transition-colors flex items-center gap-1 tracking-widest ${detailsButtonClass}`}>
              + detalhes <span className="group-hover:translate-x-1 transition-transform">→</span>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
