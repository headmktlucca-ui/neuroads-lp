'use client';
import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import Image from 'next/image';
import AgentCard from './AgentCard';
import { agents } from '../../data/agents';
import type { Agent } from '../../data/agents';
import { useAuth } from '../../context/AuthContext';

const CATEGORIES = ['Todos', 'Performance', 'Inteligência', 'Criativos', 'Técnico', 'Ativos'];

const ACTIVE_CATEGORY = 'Ativos';

function normalizeActiveAgentTitles(input: unknown): Set<string> {
  const titles = new Set<string>();

  if (Array.isArray(input)) {
    for (const item of input) {
      if (typeof item === 'string' && item.trim()) {
        titles.add(item.trim());
        continue;
      }

      if (item && typeof item === 'object') {
        const maybeRecord = item as Record<string, unknown>;
        const isActive = maybeRecord.isActive !== false;
        const name = typeof maybeRecord.title === 'string'
          ? maybeRecord.title
          : typeof maybeRecord.name === 'string'
            ? maybeRecord.name
            : typeof maybeRecord.agentTitle === 'string'
              ? maybeRecord.agentTitle
              : null;

        if (isActive && name && name.trim()) {
          titles.add(name.trim());
        }
      }
    }
    return titles;
  }

  if (input && typeof input === 'object') {
    for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
      if (typeof value === 'boolean') {
        if (value && key.trim()) {
          titles.add(key.trim());
        }
        continue;
      }

      if (value && typeof value === 'object') {
        const maybeRecord = value as Record<string, unknown>;
        const isActive = maybeRecord.isActive !== false;
        const name = typeof maybeRecord.title === 'string'
          ? maybeRecord.title
          : typeof maybeRecord.name === 'string'
            ? maybeRecord.name
            : key;

        if (isActive && name.trim()) {
          titles.add(name.trim());
        }
      }
    }
  }

  return titles;
}

export default function AgentGrid() {
  const { profile } = useAuth();
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  const activeAgentTitles = useMemo(() => {
    if (!profile) return new Set<string>();

    const dynamicProfile = profile as unknown as Record<string, unknown>;
    const possibleSources: unknown[] = [
      dynamicProfile.activeAgents,
      dynamicProfile.contractedAgents,
      dynamicProfile.hiredAgents,
      dynamicProfile.selectedAgents,
      dynamicProfile.userAgents
    ];

    for (const source of possibleSources) {
      const normalized = normalizeActiveAgentTitles(source);
      if (normalized.size > 0) {
        return normalized;
      }
    }

    return new Set<string>();
  }, [profile]);

  const filteredAgents = useMemo(() => {
    if (activeCategory === 'Todos') {
      return agents;
    }

    if (activeCategory === ACTIVE_CATEGORY) {
      return agents.filter(agent => activeAgentTitles.has(agent.title));
    }

    return agents.filter(agent => agent.category === activeCategory);
  }, [activeCategory, activeAgentTitles]);

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
                  className={`px-4 md:px-6 py-2.5 rounded-2xl font-bold text-xs md:text-sm uppercase tracking-widest transition-all duration-300 ${
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
              {filteredAgents.map((agent, index) => (
                <AgentCard
                  key={agent.title}
                  agent={agent}
                  onClick={() => setSelectedAgent(agent)}
                  index={index}
                />
              ))}
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
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
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
              className="relative w-full max-w-2xl bg-white border border-border rounded-3xl overflow-hidden shadow-2xl max-h-[85vh] overflow-y-auto"
            >
              {/* Header with gradient */}
              <div className="relative h-40 bg-gradient-to-br from-orange-light to-white flex items-end p-8 border-b border-border">
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
                    <h2 className="text-3xl font-black text-text-main tracking-tight">
                      {selectedAgent.title}
                    </h2>
                  </div>

                  <button
                    onClick={() => setSelectedAgent(null)}
                    className="absolute top-6 right-6 p-2 bg-white hover:bg-bg-secondary text-text-main rounded-full transition-all border border-border"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-8">
                <div className="mb-8">
                  <h3 className="text-sm font-bold text-primary uppercase tracking-widest mb-3">
                    Descrição Completa
                  </h3>
                  <p className="text-base text-text-muted leading-relaxed">
                    {selectedAgent.longDescription}
                  </p>
                </div>

                {/* Benefits */}
                <div className="mb-8 p-6 rounded-xl bg-bg-secondary border border-border">
                  <h3 className="text-sm font-bold text-primary uppercase tracking-widest mb-4">
                    Capacidades Principais
                  </h3>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-3">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                      <span className="text-sm text-text-muted">Análise em tempo real com atualização de dados</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                      <span className="text-sm text-text-muted">Sugestões inteligentes baseadas em IA neural</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                      <span className="text-sm text-text-muted">Integração automática com suas ferramentas</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                      <span className="text-sm text-text-muted">Relatórios e insights acionáveis</span>
                    </li>
                  </ul>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-border">
                  <button className="flex-grow bg-gradient-to-br from-[#FF6B00] to-[#FF9D00] hover:brightness-105 text-white px-6 py-3 font-bold rounded-lg uppercase tracking-widest transition-all text-sm flex items-center justify-center gap-2 shadow-[0_10px_24px_rgba(255,107,0,0.3)]">
                    Acessar Agent →
                  </button>
                  <button
                    onClick={() => setSelectedAgent(null)}
                    className="px-6 py-3 font-bold rounded-lg text-text-muted hover:text-text-main hover:bg-bg-secondary border border-border uppercase tracking-widest transition-all text-sm"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
