'use client';
import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import Image from 'next/image';
import AgentCard from './AgentCard';
import { agents } from '../../data/agents';
import type { Agent } from '../../data/agents';
import type { AgentPlanName } from '../../data/agent-pricing';
import { useAuth } from '../../context/AuthContext';
import { formatBRL, getAgentPricingProfile } from '../../data/agent-pricing';
import {
  type AgentContractStatus,
  getContractedAgentsFromProfile,
  getDefaultPlanName,
  slugifyAgentTitle,
} from '../../lib/hub-agents';
import { useRouter } from 'next/navigation';

const CATEGORIES = ['Todos', 'Performance', 'Inteligência', 'Criativos', 'Técnico', 'Ativos'];

const ACTIVE_CATEGORY = 'Ativos';
const ENABLED_AGENT_TITLE = 'SEO & GEO';

function formatDate(dateString?: string): string {
  if (!dateString) return 'A confirmar';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return 'A confirmar';
  return date.toLocaleDateString('pt-BR');
}

export default function AgentGrid() {
  const { profile } = useAuth();
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<AgentPlanName>('Growth');

  const contractedAgents = useMemo(() => {
    return getContractedAgentsFromProfile(profile);
  }, [profile]);

  const statusByTitle = useMemo(() => {
    const map = new Map<string, AgentContractStatus>();

    agents.forEach((agent) => {
      if (agent.title !== ENABLED_AGENT_TITLE) {
        map.set(agent.title, { isActive: false });
        return;
      }

      const fromProfile = contractedAgents.get(agent.title);
      if (fromProfile?.isActive) {
        map.set(agent.title, fromProfile);
        return;
      }

      const pricing = getAgentPricingProfile(agent.title);
      const growthPlan = pricing.plans.find((plan) => plan.name === 'Growth') ?? pricing.plans[0];
      map.set(agent.title, {
        isActive: true,
        planName: growthPlan.name,
        monthlyPrice: growthPlan.monthlyPrice,
        monthlyLimit: growthPlan.monthlyLimit,
      });
    });

    return map;
  }, [contractedAgents]);

  const activeAgentTitles = useMemo(() => {
    const titles = new Set<string>();
    statusByTitle.forEach((status, title) => {
      if (status.isActive) titles.add(title);
    });
    return titles;
  }, [statusByTitle]);

  const filteredAgents = useMemo(() => {
    if (activeCategory === 'Todos') {
      return [...agents].sort((a, b) => {
        const aPriority = activeAgentTitles.has(a.title) ? 1 : 0;
        const bPriority = activeAgentTitles.has(b.title) ? 1 : 0;
        return bPriority - aPriority;
      });
    }

    if (activeCategory === ACTIVE_CATEGORY) {
      return agents.filter(agent => activeAgentTitles.has(agent.title));
    }

    return agents.filter(agent => agent.category === activeCategory);
  }, [activeCategory, activeAgentTitles]);

  const selectedAgentPricing = selectedAgent ? getAgentPricingProfile(selectedAgent.title) : null;
  const selectedAgentContract = selectedAgent
    ? statusByTitle.get(selectedAgent.title) ?? { isActive: false }
    : { isActive: false };
  const selectedAgentSlug = selectedAgent ? slugifyAgentTitle(selectedAgent.title) : null;

  const handlePrimaryAction = () => {
    if (!selectedAgent || !selectedAgentPricing) return;

    if (selectedAgentContract.isActive) {
      if (!selectedAgentSlug) return;
      router.push(`/hub/agente/${selectedAgentSlug}`);
    }
  };

  return (
    <>
      <section className="relative w-full overflow-hidden">
        <div className="relative z-10 wrap py-8 md:py-12">
          {/* Header */}
          <div className="mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-8"
            >
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-text-main mb-4">
                Hub de <span className="grad-text-animated">Agentes Neurais</span>
              </h2>
              <p className="text-base md:text-lg text-text-muted leading-relaxed max-w-2xl">
                Acesse uma suite completa de ferramentas de inteligência autônoma projetadas para escalar suas operações e maximizar ROI.
              </p>
            </motion.div>

            {/* Category Filter */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              viewport={{ once: true }}
              className="flex flex-wrap gap-2"
            >
              {CATEGORIES.map((category) => (
                <motion.button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-4 md:px-6 py-2.5 rounded-2xl font-bold text-xs md:text-sm tracking-widest transition-all duration-300 ${
                    category === 'Todos' ? 'uppercase' : 'normal-case'
                  } ${
                    category === ACTIVE_CATEGORY
                      ? activeCategory === category
                        ? 'bg-gradient-to-br from-[#08B760] to-[#0A9D57] text-white border border-[#6EE7A9] shadow-[0_10px_24px_rgba(8,183,96,0.35)]'
                        : 'bg-white text-[#0A9D57] hover:text-[#067A43] border border-[#78D9A8] hover:border-[#0A9D57] shadow-[0_6px_14px_rgba(8,183,96,0.18)]'
                      : activeCategory === category
                        ? 'bg-gradient-to-br from-[#FF6B00] to-[#FF9D00] text-white border border-[#FFC8A6] shadow-[0_10px_24px_rgba(255,107,0,0.35)]'
                        : 'bg-white text-text-muted hover:text-text-main border border-[#FFE1CF] hover:border-[#FFBE94] shadow-[0_6px_14px_rgba(255,107,0,0.08)]'
                  }`}
                >
                  {category}
                </motion.button>
              ))}
            </motion.div>
          </div>

          {/* Agents Grid */}
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence mode="popLayout">
              {filteredAgents.map((agent, index) => {
                const pricingProfile = getAgentPricingProfile(agent.title);
                const contractStatus = statusByTitle.get(agent.title) ?? { isActive: false };
                return (
                <AgentCard
                  key={agent.title}
                  agent={agent}
                  onClick={() => {
                    setSelectedAgent(agent);
                    setSelectedPlan(getDefaultPlanName(contractStatus, pricingProfile));
                  }}
                  index={index}
                  startingPrice={pricingProfile.startingPrice}
                  contractStatus={contractStatus}
                />
                );
              })}
            </AnimatePresence>
          </motion.div>

          {/* Empty State */}
          {filteredAgents.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <p className="text-text-muted text-lg">
                {activeCategory === ACTIVE_CATEGORY
                  ? 'Você ainda não possui agentes ativos para exibição.'
                  : 'Nenhum agente encontrado nesta categoria.'}
              </p>
            </motion.div>
          )}
        </div>
      </section>

      {/* Agent Detail Modal */}
      <AnimatePresence>
        {selectedAgent && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedAgent(null)}
              className="absolute inset-0 bg-charcoal/60 backdrop-blur-sm"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-[1120px] rounded-[34px] p-[3px] bg-gradient-to-br from-[#FFEBDD] via-[#FFBE94] to-[#FF7A00] shadow-[0_18px_46px_rgba(255,107,0,0.2)] max-h-[92vh]"
            >
              <div className="relative rounded-[30px] border border-[#FFF1E8] bg-white overflow-hidden">
                {/* Header with gradient */}
                <div className="relative h-36 bg-gradient-to-br from-orange-light to-white flex items-end p-6 md:p-7 border-b border-border">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/20 to-transparent rounded-full blur-3xl" />

                  <div className="relative z-10 flex items-end gap-6 w-full">
                    <div className="w-24 h-24 rounded-[20px] p-[2px] bg-gradient-to-br from-[#FF6B00] via-[#FF8F1F] to-[#B83A00] shadow-[0_0_0_1px_rgba(255,107,0,0.7),0_14px_26px_rgba(255,107,0,0.24)]">
                      <div className="relative w-full h-full rounded-[18px] overflow-hidden bg-white">
                        <Image
                          src={selectedAgent.icon}
                          alt={selectedAgent.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </div>

                    <div className="flex-grow">
                      <div className="inline-block px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 mb-3">
                        <span className="text-xs font-bold text-primary uppercase tracking-widest">
                          {selectedAgent.category}
                        </span>
                      </div>
                      <h2 className="text-2xl md:text-4xl font-black text-text-main tracking-tight">
                        {selectedAgent.title}
                      </h2>
                    </div>

                    <button
                      onClick={() => setSelectedAgent(null)}
                      className="absolute top-5 right-5 p-2 bg-white hover:bg-bg-secondary text-text-main rounded-full transition-all border border-border"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 md:p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    <div className="space-y-5">
                      <div>
                        <h3 className="text-sm font-bold text-primary uppercase tracking-widest mb-2">
                          Descrição Completa
                        </h3>
                        <p className="text-[15px] text-text-muted leading-relaxed">
                          {selectedAgent.longDescription}
                        </p>
                      </div>

                      <div className="p-5 rounded-xl bg-bg-secondary border border-border">
                        <h3 className="text-sm font-bold text-primary uppercase tracking-widest mb-3">
                          Capacidades Principais
                        </h3>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <li className="flex items-start gap-2">
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                            <span className="text-sm text-text-muted">Análise em tempo real com atualização de dados</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                            <span className="text-sm text-text-muted">Sugestões inteligentes baseadas em IA neural</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                            <span className="text-sm text-text-muted">Integração automática com suas ferramentas</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                            <span className="text-sm text-text-muted">Relatórios e insights acionáveis</span>
                          </li>
                        </ul>
                      </div>
                    </div>

                    <div className="space-y-5">
                      <div className="p-5 rounded-xl bg-[#FFF8F3] border border-[#FFE4D1]">
                        <h3 className="text-sm font-bold text-primary uppercase tracking-widest mb-3">
                          Opções de Valores e Limites
                        </h3>

                        {!selectedAgentContract.isActive ? (
                          <>
                            <p className="text-sm text-text-muted mb-3">
                              a partir de <span className="font-bold text-primary">{formatBRL(selectedAgentPricing?.startingPrice ?? 29.9)}/mês</span>
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3 gap-2">
                              {selectedAgentPricing?.plans.map((plan) => (
                                <button
                                  key={plan.name}
                                  type="button"
                                  disabled={!selectedAgentContract.isActive}
                                  onClick={() => setSelectedPlan(plan.name)}
                                  className={`rounded-xl border bg-white p-3 text-left transition-all ${
                                    selectedPlan === plan.name
                                      ? 'border-[#FF8D46] shadow-[0_0_0_1px_rgba(255,141,70,0.35)]'
                                      : 'border-[#FFDCC7]'
                                  } ${!selectedAgentContract.isActive ? 'opacity-60 cursor-not-allowed' : ''}`}
                                >
                                  <p className="text-[11px] uppercase tracking-widest text-text-dim font-bold mb-1">{plan.name}</p>
                                  <p className="text-base font-black text-text-main mb-1">{formatBRL(plan.monthlyPrice)}/mês</p>
                                  <p className="text-xs text-text-muted">{plan.monthlyLimit} execuções/mês</p>
                                </button>
                              ))}
                            </div>
                          </>
                        ) : (
                          <div className="rounded-xl border border-[#B9EBD1] bg-white p-4 space-y-2">
                            <p className="text-sm font-bold text-[#0A9D57]">
                              {selectedAgentContract.planName || 'Plano ativo'} • {formatBRL(selectedAgentContract.monthlyPrice ?? selectedAgentPricing?.startingPrice ?? 29.9)}/mês
                            </p>
                            <p className="text-xs text-text-muted">
                              Limite: {selectedAgentContract.monthlyLimit ?? 'A confirmar'} exec./mês • Em uso: {selectedAgentContract.usageUsed ?? 'A confirmar'}
                            </p>
                            <p className="text-xs text-text-muted">
                              Próximo pagamento: {formatDate(selectedAgentContract.nextPaymentAt)}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row gap-3 pt-1">
                        <button
                          type="button"
                          onClick={handlePrimaryAction}
                          disabled={!selectedAgentContract.isActive}
                          className={`flex-grow hover:brightness-105 text-white px-6 py-3 font-bold rounded-lg uppercase tracking-widest transition-all text-sm flex items-center justify-center gap-2 ${
                            selectedAgentContract.isActive
                              ? 'bg-gradient-to-br from-[#08B760] to-[#0A9D57] shadow-[0_10px_24px_rgba(8,183,96,0.3)]'
                              : 'bg-gradient-to-br from-[#E2E8F0] to-[#CBD5E1] text-[#64748B] shadow-[0_8px_18px_rgba(148,163,184,0.25)] cursor-not-allowed'
                          }`}
                        >
                          {selectedAgentContract.isActive ? 'Acessar Agente →' : 'Em desenvolvimento'}
                        </button>
                        <button
                          onClick={() => setSelectedAgent(null)}
                          className="px-6 py-3 font-bold rounded-lg text-text-muted hover:text-text-main hover:bg-bg-secondary border border-border uppercase tracking-widest transition-all text-sm"
                        >
                          Fechar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
