'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import Image from 'next/image';
import AgentCard from './AgentCard';
import { agents } from '../../data/agents';
import type { Agent } from '../../data/agents';

const CATEGORIES = ['Todos', 'Performance', 'Inteligência', 'Criativos', 'Técnico'];

export default function AgentGrid() {
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  const filteredAgents = activeCategory === 'Todos'
    ? agents
    : agents.filter(agent => agent.category === activeCategory);

  return (
    <>
      <section className="relative w-full bg-black overflow-hidden">
        {/* Background Grid Pattern */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_100%_100%_at_50%_50%,#000_40%,transparent_100%)]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-8 lg:px-12 py-16 md:py-24">
          {/* Header */}
          <div className="mb-14">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-8"
            >
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-white mb-4">
                Hub de <span className="text-[#7BFBF0]">Agentes Neurais</span>
              </h2>
              <p className="text-base md:text-lg text-slate-300 leading-relaxed max-w-2xl">
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
                  className={`px-4 md:px-6 py-2.5 rounded-lg font-bold text-xs md:text-sm uppercase tracking-widest transition-all duration-300 ${
                    activeCategory === category
                      ? 'bg-[#7BFBF0] text-black shadow-[0_0_20px_rgba(123,251,240,0.3)]'
                      : 'bg-white/[0.06] text-slate-300 hover:bg-white/[0.1] border border-white/[0.1]'
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
              <p className="text-slate-400 text-lg">
                Nenhum agente encontrado nesta categoria.
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
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-2xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/[0.12] rounded-3xl overflow-hidden shadow-2xl backdrop-blur-xl max-h-[85vh] overflow-y-auto"
            >
              {/* Header with gradient */}
              <div className="relative h-40 bg-gradient-to-br from-[#7BFBF0]/15 to-transparent flex items-end p-8 border-b border-white/[0.1]">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#7BFBF0]/20 to-transparent rounded-full blur-3xl" />

                <div className="relative z-10 flex items-end gap-6 w-full">
                  <div className="relative w-24 h-24 rounded-2xl overflow-hidden shadow-2xl ring-2 ring-white/[0.15]">
                    <Image
                      src={selectedAgent.icon}
                      alt={selectedAgent.title}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="flex-grow">
                    <div className="inline-block px-3 py-1 rounded-lg bg-[#7BFBF0]/10 border border-[#7BFBF0]/30 mb-3">
                      <span className="text-xs font-bold text-[#7BFBF0] uppercase tracking-widest">
                        {selectedAgent.category}
                      </span>
                    </div>
                    <h2 className="text-3xl font-black text-white tracking-tight">
                      {selectedAgent.title}
                    </h2>
                  </div>

                  <button
                    onClick={() => setSelectedAgent(null)}
                    className="absolute top-6 right-6 p-2 bg-black/40 hover:bg-white/[0.1] text-white rounded-full transition-all border border-white/[0.1]"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-8">
                <div className="mb-8">
                  <h3 className="text-sm font-bold text-[#7BFBF0] uppercase tracking-widest mb-3">
                    Descrição Completa
                  </h3>
                  <p className="text-base text-slate-200 leading-relaxed">
                    {selectedAgent.longDescription}
                  </p>
                </div>

                {/* Benefits */}
                <div className="mb-8 p-6 rounded-xl bg-white/[0.03] border border-white/[0.08]">
                  <h3 className="text-sm font-bold text-[#7BFBF0] uppercase tracking-widest mb-4">
                    Capacidades Principais
                  </h3>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-3">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#7BFBF0] mt-2 flex-shrink-0" />
                      <span className="text-sm text-slate-300">Análise em tempo real com atualização de dados</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#7BFBF0] mt-2 flex-shrink-0" />
                      <span className="text-sm text-slate-300">Sugestões inteligentes baseadas em IA neural</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#7BFBF0] mt-2 flex-shrink-0" />
                      <span className="text-sm text-slate-300">Integração automática com suas ferramentas</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#7BFBF0] mt-2 flex-shrink-0" />
                      <span className="text-sm text-slate-300">Relatórios e insights acionáveis</span>
                    </li>
                  </ul>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-white/[0.08]">
                  <button className="flex-grow bg-[#7BFBF0] hover:bg-[#7BFBF0]/90 text-black px-6 py-3 font-bold rounded-lg uppercase tracking-widest transition-all text-sm flex items-center justify-center gap-2">
                    Acessar Agent →
                  </button>
                  <button
                    onClick={() => setSelectedAgent(null)}
                    className="px-6 py-3 font-bold rounded-lg text-slate-300 hover:text-white hover:bg-white/[0.05] border border-white/[0.1] uppercase tracking-widest transition-all text-sm"
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
