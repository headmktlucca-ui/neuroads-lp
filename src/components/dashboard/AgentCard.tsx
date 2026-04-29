'use client';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Agent } from '../../data/agents';
import { TrendingUp, Zap } from 'lucide-react';

interface AgentCardProps {
  agent: Agent;
  onClick: () => void;
  index: number;
}

export default function AgentCard({ agent, onClick, index }: AgentCardProps) {
  // Mock results data
  const mockResults = {
    'Analista de Tráfego': { metric: 'ROI', value: '8.2x', trend: '+24%' },
    'Gerador de Criativos': { metric: 'CTR', value: '4.8%', trend: '+18%' },
    'Gerador de Copies de Conversão': { metric: 'Conv.', value: '12.5%', trend: '+31%' },
    'Análise Viral': { metric: 'Shares', value: '2.3k', trend: '+156%' },
    'Rastreador Cirúrgico': { metric: 'Precisão', value: '99.7%', trend: '+5%' },
    'Preditor de Funil': { metric: 'Acurácia', value: '94%', trend: '+12%' },
    'Diagnóstico de Landing Page': { metric: 'Score', value: '8.7/10', trend: '+22%' },
    'Simulador de ROAS': { metric: 'Ajuste', value: '±2%', trend: '-1%' },
    'Analisador de Público': { metric: 'Segmentos', value: '847', trend: '+43%' },
    'Diagnóstico de Funil': { metric: 'Conversão', value: '28%', trend: '+19%' },
    'Auditor de Desperdício': { metric: 'Economia', value: '$2.4k', trend: '+55%' },
    'Otimizador de Orçamento': { metric: 'Ganho', value: '15.3%', trend: '+44%' },
    'Gerador de Testes A/B': { metric: 'Testes', value: '124', trend: '+8%' },
    'Avaliador de Oferta': { metric: 'Score', value: '9.1/10', trend: '+7%' },
    'Radar de Oportunidades': { metric: 'Canais', value: '23', trend: '+67%' },
    'DNA da Marca': { metric: 'Docs', value: '5', trend: '+100%' },
    'Análise de Concorrentes': { metric: 'Monitorados', value: '142', trend: '+21%' },
    'Público-Alvo Ideal': { metric: 'Clusters', value: '67', trend: '+33%' },
  };

  const results = mockResults[agent.title as keyof typeof mockResults] || { metric: 'Performance', value: '98%', trend: '+22%' };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      viewport={{ once: true }}
      onClick={onClick}
      className="group relative h-full cursor-pointer"
    >
      <div className="relative h-full p-6 rounded-2xl border border-border bg-white hover:border-border-h hover:shadow-md transition-all duration-500 overflow-hidden flex flex-col">

        {/* Background gradient on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

        {/* Top accent */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-primary/15 to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

        {/* Icon & Title Section */}
        <div className="relative z-10 mb-5">
          <div className="relative w-14 h-14 rounded-xl overflow-hidden mb-4 shadow-md ring-1 ring-border group-hover:ring-primary/30 transition-all">
            <Image
              src={agent.icon}
              alt={agent.title}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500"
            />
          </div>
          <h3 className="text-base font-bold text-text-main tracking-tight group-hover:text-primary transition-colors duration-300">
            {agent.title}
          </h3>
        </div>

        {/* Description */}
        <p className="relative z-10 text-sm text-text-muted leading-relaxed mb-6 flex-grow line-clamp-3">
          {agent.description}
        </p>

        {/* Results Section */}
        <div className="relative z-10 p-4 rounded-lg bg-bg-secondary border border-border mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-text-dim uppercase tracking-widest">
              {results.metric}
            </span>
            <div className="flex items-center gap-1">
              {results.trend.startsWith('+') ? (
                <TrendingUp size={14} className="text-green-400" />
              ) : (
                <TrendingUp size={14} className="text-slate-500 rotate-180" />
              )}
              <span className={`text-xs font-bold ${results.trend.startsWith('+') ? 'text-green-400' : 'text-slate-400'}`}>
                {results.trend}
              </span>
            </div>
          </div>
          <div className="text-2xl font-black text-text-main tracking-tighter">
            {results.value}
          </div>
        </div>

        {/* Footer CTA */}
        <div className="relative z-10 pt-4 border-t border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap size={14} className="text-primary" />
            <span className="text-xs font-bold text-primary uppercase tracking-widest">
              Ativo
            </span>
          </div>
          <button className="text-xs font-bold text-text-dim group-hover:text-primary transition-colors flex items-center gap-1 uppercase tracking-widest">
            Acessar <span className="group-hover:translate-x-1 transition-transform">→</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
