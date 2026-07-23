'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, TrendingUp, ArrowRight,
  Zap, DollarSign, Shield, CheckCircle2, Lightbulb, Activity,
  Cpu, ChevronRight, Trash2, Check, Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { getFirebaseDb } from '../../../lib/firebase';
import { collection, onSnapshot, query, orderBy, doc, deleteDoc, addDoc } from 'firebase/firestore';
import { TEAM_AGENTS, TeamAgent } from '../../../data/team-agents';
// Removed IconSparkles3D
import {
  NeumorphicTileIcon,
  PageTitleIcon,
  IconNeuOpportunities,
  IconNeuWallet,
  IconNeuAlert,
  IconNeuUsers,
} from '../../../components/hub/NeumorphicMenuIcons';

/* ── Helper ── */
function findAgentByNameOrRole(agentStr?: string): TeamAgent | undefined {
  if (!agentStr) return undefined;
  const s = agentStr.toLowerCase();
  
  return TEAM_AGENTS.find(a => {
    const nameLower = a.nome.toLowerCase();
    const idLower = a.id.toLowerCase();
    const funcLower = a.funcao.toLowerCase();
    const catLower = a.categoria.toLowerCase();

    if (s.includes(nameLower) || s.includes(idLower)) return true;
    if (funcLower.includes(s) || s.includes(funcLower)) return true;
    if (catLower.includes(s) || s.includes(catLower)) return true;

    if (s.includes('tráfego') || s.includes('midia') || s.includes('mídia') || s.includes('performance')) return idLower === 'paola';
    if (s.includes('criativo') || s.includes('conteúdo') || s.includes('copy')) return idLower === 'lais';
    if (s.includes('dado') || s.includes('seo') || s.includes('inteligência')) return idLower === 'igor';
    if (s.includes('processo') || s.includes('técnico') || s.includes('automação') || s.includes('lances')) return idLower === 'heitor';
    if (s.includes('sdr') || s.includes('prospecção') || s.includes('aquisição')) return idLower === 'vitor';
    if (s.includes('closer') || s.includes('venda') || s.includes('conversão')) return idLower === 'breno';
    if (s.includes('suporte') || s.includes('atendimento')) return idLower === 'manu';
    if (s.includes('upsell') || s.includes('retenção') || s.includes('crm')) return idLower === 'raissa';
    if (s.includes('editorial') || s.includes('redação')) return idLower === 'taina';
    if (s.includes('chief') || s.includes('estratégia')) return idLower === 'ulisses';

    return false;
  });
}

/* ── Types ── */
type Priority = 'alta' | 'media' | 'baixa';
type Category = 'receita' | 'eficiencia' | 'risco' | 'crescimento';

type Opportunity = {
  id: string;
  priority: Priority;
  category: Category;
  title: string;
  impact: string;
  impactValue: string;
  rationale: string;
  actions: string[];
  agent: string;
  effort: 'baixo' | 'medio' | 'alto';
  timeframe: string;
  source: string[];
  createdAt?: number | string | { seconds: number; nanoseconds: number; toMillis?: () => number };
};

/* ── Config ── */
const PRIORITY_CONFIG = {
  alta:  { label: 'Prioridade Alta',   color: 'text-rose-600',    bg: 'bg-rose-500/10',    border: 'border-rose-500/30',    dot: 'bg-rose-500'    },
  media: { label: 'Prioridade Média',  color: 'text-amber-600',   bg: 'bg-amber-500/10',   border: 'border-amber-500/30',   dot: 'bg-amber-500'   },
  baixa: { label: 'Prioridade Baixa',  color: 'text-blue-600',    bg: 'bg-blue-500/10',    border: 'border-blue-500/30',    dot: 'bg-blue-500'    },
};

const CATEGORY_CONFIG = {
  receita:     { label: 'Receita',    icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-500/10' },
  eficiencia:  { label: 'Eficiência', icon: Zap,        color: 'text-orange-600',  bg: 'bg-orange-500/10'  },
  risco:       { label: 'Risco',      icon: Shield,     color: 'text-rose-600',    bg: 'bg-rose-500/10'    },
  crescimento: { label: 'Crescimento',icon: TrendingUp, color: 'text-[#FF5500]',    bg: 'bg-orange-500/10'  },
};

const EFFORT_LABEL = { baixo: 'Esforço Baixo', medio: 'Esforço Médio', alto: 'Esforço Alto' };
const FILTERS = ['Todas', 'Receita', 'Eficiência', 'Risco', 'Crescimento', 'Alta Prioridade'];

/* ── Components ── */
function KpiCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between p-4 rounded-2xl border border-slate-200/80 bg-white shadow-[0_4px_12px_rgba(0,0,0,0.03)] hover:shadow-md transition-all"
    >
      <div>
        <p className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1">{label}</p>
        <p className="text-[22px] sm:text-[24px] font-black text-[#1e293b] leading-none tracking-tight">{value}</p>
      </div>
      <div className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-white shadow-[0_3px_8px_rgba(0,0,0,0.06),0_1px_3px_rgba(0,0,0,0.04)] border border-slate-50/50 transition-transform duration-300 hover:scale-110">
        <Icon size={20} className="text-slate-700" />
      </div>
    </motion.div>
  );
}

function OpportunityCard({
  opp,
  index,
  userId,
}: {
  opp: Opportunity;
  index: number;
  userId?: string;
}) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [applying, setApplying] = useState(false);
  const [appliedSuccess, setAppliedSuccess] = useState(false);

  const priority = PRIORITY_CONFIG[opp.priority] || PRIORITY_CONFIG.media;
  const category = CATEGORY_CONFIG[opp.category] || CATEGORY_CONFIG.eficiencia;
  const CatIcon = category.icon;

  const matchedAgent = useMemo(() => findAgentByNameOrRole(opp.agent), [opp.agent]);

  const typeLabel = useMemo(() => {
    if (opp.category === 'risco') return { text: '⚠️ Risco Iminente', color: 'text-rose-600 bg-rose-50 border-rose-200' };
    if (opp.category === 'eficiencia' || opp.category === 'crescimento') return { text: '🔁 Padrão Detectado', color: 'text-blue-600 bg-blue-50 border-blue-200' };
    return { text: '💡 Oportunidade', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' };
  }, [opp.category]);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!userId || deleting) return;
    try {
      setDeleting(true);
      const db = getFirebaseDb();
      await deleteDoc(doc(db, 'users', userId, 'opportunities', opp.id));
    } catch (err) {
      console.error('Erro ao excluir oportunidade:', err);
      setDeleting(false);
    }
  };

  const handleApply = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!userId || applying || appliedSuccess) return;
    try {
      setApplying(true);
      const db = getFirebaseDb();

      const reportContent = `# Oportunidade Aplicada: ${opp.title}

## Visão Geral
- **Categoria**: ${opp.category}
- **Prioridade**: ${opp.priority}
- **Impacto Estimado**: ${opp.impactValue || opp.impact || 'N/A'}
- **Agente Responsável**: ${opp.agent || 'Ulisses'}
- **Prazo Estimado**: ${opp.timeframe || 'N/A'}
- **Esforço Necessário**: ${EFFORT_LABEL[opp.effort] || opp.effort || 'Médio'}
- **Fontes de Dados**: ${(opp.source || []).join(', ') || 'Operação do Agente'}
- **Data de Aplicação**: ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}

## Análise Detalhada do Agente
${opp.rationale || 'Nenhuma análise adicional registrada.'}

## Próximos Passos e Ações Aplicadas
${(opp.actions || []).map((a, i) => `${i + 1}. ${a}`).join('\n') || 'Passos operacionais recomendados foram aplicados.'}

---
*Este documento foi gravado automaticamente na sua Base de Conhecimento ao marcar a oportunidade como Aplicada.*`;

      const reportsRef = collection(db, 'users', userId, 'agent_reports');
      await addDoc(reportsRef, {
        reportTitle: opp.title,
        title: opp.title,
        reportContent: reportContent,
        content: reportContent,
        agentTitle: opp.agent || 'Ulisses',
        agentKey: (opp.agent || 'ulisses').toLowerCase(),
        category: opp.category || 'Oportunidades',
        tags: ['Oportunidade Aplicada', opp.category, opp.priority],
        createdAtMs: Date.now(),
        createdAt: new Date().toISOString(),
        appliedFrom: 'Oportunidades',
      });

      setAppliedSuccess(true);
      setApplying(false);
    } catch (err) {
      console.error('Erro ao salvar na Base de Conhecimento:', err);
      setApplying(false);
    }
  };

  const handleDiscussWithUlisses = (e: React.MouseEvent) => {
    e.stopPropagation();
    const promptText = `Olá Ulisses! Gostaria de discutir e analisar em profundidade a oportunidade: "${opp.title}".\n\n` +
      `• Categoria: ${opp.category}\n` +
      `• Prioridade: ${opp.priority}\n` +
      `• Impacto Estimado: ${opp.impactValue || opp.impact || 'Sob Demanda'}\n` +
      `• Agente Responsável: ${opp.agent || 'Ulisses'}\n` +
      `• Análise do Agente: ${opp.rationale || 'N/A'}\n` +
      `• Ações Recomendadas: ${(opp.actions || []).join('; ') || 'N/A'}\n\n` +
      `Por favor, elabore um plano executivo robusto e prático com orientações detalhadas de como devemos executar cada etapa para obter o máximo resultado.`;

    router.push(`/hub/assistente-ia?agent=ulisses&prompt=${encodeURIComponent(promptText)}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 }}
      className="rounded-2xl border border-slate-200/80 bg-white shadow-[0_4px_12px_rgba(0,0,0,0.03)] hover:shadow-md transition-all overflow-hidden"
    >
      {/* Header */}
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full text-left p-5 flex items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors"
      >
        <div className="flex items-start gap-4 flex-1 min-w-0">
          <NeumorphicTileIcon size="card" className="mt-0.5 shadow-sm">
            <CatIcon size={18} />
          </NeumorphicTileIcon>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              <span className={`inline-flex items-center gap-1.5 text-[9.5px] font-black px-2.5 py-0.5 rounded-full border ${typeLabel.color}`}>
                {typeLabel.text}
              </span>
              <span className={`inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full border ${priority.bg} ${priority.color} ${priority.border}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${priority.dot}`} />
                {priority.label}
              </span>
            </div>

            <h3 className="text-[14px] font-black text-[#1e293b] leading-snug">{opp.title}</h3>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2">
              <div className="flex items-center gap-1.5">
                <TrendingUp size={13} className="text-emerald-500" />
                <span className="text-[12px] text-slate-600 font-semibold">{opp.impact || 'Impacto'}:</span>
                <span className="text-[13px] font-black text-emerald-600">{opp.impactValue || '—'}</span>
              </div>
              {opp.timeframe && (
                <>
                  <span className="text-slate-300">·</span>
                  <span className="text-[11px] font-semibold text-slate-400">{opp.timeframe}</span>
                </>
              )}
              {opp.effort && (
                <>
                  <span className="text-slate-300">·</span>
                  <span className="text-[11px] font-semibold text-slate-400">{EFFORT_LABEL[opp.effort] || opp.effort}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ── Agent Avatar, Name & Role (Anexo 02) ── */}
        <div className="flex items-center gap-3 shrink-0 ml-2">
          {matchedAgent ? (
            <div className="flex items-center gap-3.5 p-2 px-3 rounded-2xl border border-slate-200/70 bg-slate-50/90 shadow-[0_2px_8px_rgba(0,0,0,0.02)] w-[250px] sm:w-[280px] md:w-[310px] shrink-0">
              <img
                src={matchedAgent.avatarSrc}
                alt={matchedAgent.nome}
                className="w-14 h-14 md:w-[68px] md:h-[68px] rounded-xl object-cover object-top border-2 border-white shadow-sm shrink-0 bg-slate-100"
              />
              <div className="text-left min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[13px] font-black text-slate-900 tracking-tight">{matchedAgent.nome}</span>
                  <span className="text-[8.5px] font-black uppercase px-2 py-0.5 rounded-full border border-orange-500/30 text-orange-600 bg-orange-500/10 tracking-wider">
                    {matchedAgent.categoria || opp.category}
                  </span>
                </div>
                <p className="text-[11px] font-semibold text-slate-600 leading-snug mt-1">
                  {matchedAgent.funcao}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 p-2 px-3 rounded-2xl border border-slate-200/70 bg-slate-50/90 w-[250px] sm:w-[280px] md:w-[310px] shrink-0">
              <span className="text-[12px] font-black text-slate-700">{opp.agent || 'Agente IA'}</span>
            </div>
          )}

          <ChevronRight
            size={18}
            className={`text-slate-400 shrink-0 transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`}
          />
        </div>
      </button>

      {/* Expanded body */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="body"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 pt-0 border-t border-white/40">
              {/* Rationale */}
              {opp.rationale && (
                <div className="mt-4 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb size={13} className="text-amber-500" />
                    <span className="text-[11px] font-black text-slate-500 uppercase tracking-wide">Análise do Agente</span>
                  </div>
                  <p className="text-[13px] text-slate-700 leading-relaxed font-medium">{opp.rationale}</p>
                </div>
              )}

              {/* Actions */}
              {opp.actions && opp.actions.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 size={13} className="text-emerald-500" />
                    <span className="text-[11px] font-black text-slate-500 uppercase tracking-wide">Próximos Passos</span>
                  </div>
                  <ul className="space-y-2">
                    {opp.actions.map((action, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <span className="mt-0.5 w-5 h-5 rounded-full border-2 border-[#FF5500]/30 bg-orange-500/5 flex items-center justify-center text-[10px] font-black text-[#FF5500] shrink-0">
                          {i + 1}
                        </span>
                        <span className="text-[12.5px] text-slate-700 font-semibold leading-snug">{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Sources + Action Buttons */}
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <Activity size={11} className="text-slate-400" />
                  <span className="text-[10px] font-bold text-slate-400">Fontes:</span>
                  {opp.source && opp.source.length > 0 ? (
                    opp.source.map(s => (
                      <span key={s} className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200/60 text-slate-600">
                        {s}
                      </span>
                    ))
                  ) : (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200/60 text-slate-600">Operações do Agente</span>
                  )}
                </div>

                {/* ── Button Group: Discutir com Ulisses | Excluir | Aplicada ── */}
                <div className="flex items-center gap-2 flex-wrap shrink-0">
                  {/* Discutir com Ulisses */}
                  <button
                    onClick={handleDiscussWithUlisses}
                    className="rounded-full px-4 py-2 text-[12px] font-black text-white bg-gradient-to-r from-[#FF5500] to-[#FF7700] hover:from-[#e04b00] hover:to-[#e06900] shadow-[0_4px_14px_rgba(255,85,0,0.35)] hover:shadow-[0_6px_18px_rgba(255,85,0,0.45)] transition-all cursor-pointer scale-100 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-1.5"
                  >
                    <span>Discutir com Ulisses</span>
                    <ArrowRight size={13} />
                  </button>

                  {/* Excluir */}
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="rounded-full px-4 py-2 text-[12px] font-black text-white bg-gradient-to-r from-rose-600 to-red-500 hover:from-rose-700 hover:to-red-600 shadow-[0_4px_14px_rgba(225,29,72,0.3)] hover:shadow-[0_6px_18px_rgba(225,29,72,0.4)] transition-all cursor-pointer scale-100 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    {deleting ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : (
                      <Trash2 size={13} />
                    )}
                    <span>Excluir</span>
                  </button>

                  {/* Aplicada */}
                  <button
                    onClick={handleApply}
                    disabled={applying || appliedSuccess}
                    className={`rounded-full px-4 py-2 text-[12px] font-black text-white transition-all cursor-pointer scale-100 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-1.5 ${
                      appliedSuccess
                        ? 'bg-slate-800 text-emerald-400 border border-emerald-500/40 shadow-none cursor-default'
                        : 'bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 shadow-[0_4px_14px_rgba(16,185,129,0.3)] hover:shadow-[0_6px_18px_rgba(16,185,129,0.4)]'
                    }`}
                  >
                    {applying ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : appliedSuccess ? (
                      <Check size={13} className="text-emerald-400" />
                    ) : (
                      <CheckCircle2 size={13} />
                    )}
                    <span>{appliedSuccess ? 'Salvo na Base!' : 'Aplicada'}</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ── Main Page ── */
export default function OportunidadesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('Todas');
  const [timePeriod, setTimePeriod] = useState<'todos' | 'hoje' | '7d' | '30d'>('todos');

  useEffect(() => {
    if (!user) {
      setOpportunities([]);
      setLoading(false);
      return;
    }
    try {
      const db = getFirebaseDb();
      const q = query(
        collection(db, 'users', user.uid, 'opportunities'),
        orderBy('createdAt', 'desc')
      );
      const unsub = onSnapshot(
        q,
        (snap) => {
          const docs: Opportunity[] = snap.docs.map((d) => ({
            id: d.id,
            ...(d.data() as Omit<Opportunity, 'id'>)
          }));
          setOpportunities(docs);
          setLoading(false);
        },
        () => {
          setOpportunities([]);
          setLoading(false);
        }
      );
      return () => unsub();
    } catch (err) {
      console.error('Error fetching opportunities:', err);
      setOpportunities([]);
      setLoading(false);
    }
  }, [user]);

  const activeOpportunities = useMemo(() => {
    return opportunities.filter(opp => {
      if (timePeriod === 'todos') return true;
      const timestamp = (() => {
        const cAt = opp.createdAt;
        if (!cAt) return 0;
        if (typeof cAt === 'number') return cAt;
        if (typeof cAt === 'object' && cAt && 'toMillis' in cAt && typeof cAt.toMillis === 'function') return cAt.toMillis();
        if (typeof cAt === 'object' && cAt && 'seconds' in cAt && typeof cAt.seconds === 'number') return cAt.seconds * 1000;
        if (typeof cAt === 'string') return new Date(cAt).getTime();
        return 0;
      })();
      
      if (!timestamp) return true;
      const diffMs = Date.now() - timestamp;
      
      if (timePeriod === 'hoje') return diffMs <= 24 * 3600 * 1000;
      if (timePeriod === '7d') return diffMs <= 7 * 24 * 3600 * 1000;
      if (timePeriod === '30d') return diffMs <= 30 * 24 * 3600 * 1000;
      return true;
    });
  }, [opportunities, timePeriod]);

  const activeAgents = useMemo(() => {
    const agentNamesSet = new Set(activeOpportunities.map(o => o.agent).filter(Boolean));
    const matched: TeamAgent[] = [];
    
    agentNamesSet.forEach(name => {
      const found = findAgentByNameOrRole(name);
      if (found && !matched.some(m => m.id === found.id)) {
        matched.push(found);
      }
    });

    return matched;
  }, [activeOpportunities]);

  const filtered = activeOpportunities.filter(opp => {
    if (activeFilter === 'Todas') return true;
    if (activeFilter === 'Alta Prioridade') return opp.priority === 'alta';
    const catMap: Record<string, Category> = {
      'Receita': 'receita',
      'Eficiência': 'eficiencia',
      'Risco': 'risco',
      'Crescimento': 'crescimento',
    };
    return opp.category === catMap[activeFilter];
  });

  const kpis = useMemo(() => {
    let totalImpact = 0;
    activeOpportunities.forEach(opp => {
      const valStr = opp.impactValue || '';
      const cleanVal = valStr.replace(/\./g, '');
      const match = cleanVal.match(/\d+/);
      if (match && valStr.includes('R$')) {
        totalImpact += parseInt(match[0], 10);
      }
    });

    const impactLabel = totalImpact > 0 
      ? `+R$ ${totalImpact.toLocaleString('pt-BR')}` 
      : 'R$ 0';

    return [
      { label: 'Oportunidades Identificadas', value: String(activeOpportunities.length), icon: IconNeuOpportunities },
      { label: 'Impacto Estimado / mês',       value: impactLabel,                       icon: IconNeuWallet },
      { label: 'Alta Prioridade',              value: String(activeOpportunities.filter(o => o.priority === 'alta').length), icon: IconNeuAlert },
      { label: 'Agentes Envolvidos',           value: String(new Set(activeOpportunities.map(o => o.agent).filter(Boolean)).size), icon: IconNeuUsers },
    ];
  }, [activeOpportunities]);

  const handleAskUlissesAll = () => {
    const robustPrompt = `Olá Ulisses! Realize uma análise executiva completa e de alto impacto sobre as seguintes oportunidades identificadas no nosso negócio:\n\n` +
      activeOpportunities.map((o, idx) => 
        `[Oportunidade ${idx + 1}] **${o.title}**\n` +
        `• Categoria: ${o.category} | Prioridade: ${o.priority} | Impacto: ${o.impactValue || o.impact || 'N/A'}\n` +
        `• Agente Responsável: ${o.agent || 'Ulisses'}\n` +
        `• Análise: ${o.rationale || 'N/A'}\n` +
        `• Próximos Passos Sugeridos: ${o.actions?.join('; ') || 'N/A'}\n`
      ).join('\n') +
      `\nPor favor, apresente um relatório robusto, elegante e extremamente profissional explicando em detalhes como cada uma dessas oportunidades foi identificada através dos nossos dados integrados e forneça o passo a passo de como cada oportunidade deve ser executada com a máxima precisão.`;

    router.push(`/hub/assistente-ia?agent=ulisses&prompt=${encodeURIComponent(robustPrompt)}`);
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="inline-block w-8 h-8 rounded-full border-2 border-[#FF5500] border-t-transparent animate-spin" />
        <p className="text-[13px] font-black text-slate-400 mt-3">Carregando oportunidades reais…</p>
      </div>
    );
  }

  if (opportunities.length === 0) {
    return (
      <div className="space-y-6 w-full">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <PageTitleIcon icon={IconNeuOpportunities} />
              Oportunidades
            </h1>
            <p className="text-sm font-semibold text-slate-500 mt-1 leading-relaxed">
              Insights e recomendações geradas em tempo real pelos Agentes IA ao executar operações.
            </p>
          </div>
        </motion.div>

        {/* Real Zero KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <KpiCard label="Oportunidades Identificadas" value="0" icon={IconNeuOpportunities} />
          <KpiCard label="Impacto Estimado / mês" value="R$ 0" icon={IconNeuWallet} />
          <KpiCard label="Alta Prioridade" value="0" icon={IconNeuAlert} />
          <KpiCard label="Agentes Envolvidos" value="0" icon={IconNeuUsers} />
        </div>

        {/* Empty state card */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-12 text-center flex flex-col items-center gap-4 shadow-[0_4px_12px_rgba(0,0,0,0.03)]">
          <div className="w-16 h-16 rounded-2xl bg-orange-500/8 border border-orange-500/15 flex items-center justify-center">
            <Sparkles size={28} className="text-[#FF5500]" />
          </div>
          <div>
            <p className="text-[16px] font-black text-[#0f172a]">Nenhuma oportunidade gerada ainda</p>
            <p className="text-[13px] text-slate-500 font-semibold mt-1 max-w-md mx-auto leading-relaxed">
              As oportunidades e recomendações verídicas serão listadas aqui automaticamente assim que os seus Agentes IA executarem operações e automações no sistema.
            </p>
          </div>
          <Link
            href="/hub/automacoes"
            className="rounded-full px-6 py-3 text-[13px] font-black text-white bg-gradient-to-r from-[#FF5500] to-[#FF7700] hover:from-[#e04b00] hover:to-[#e06900] shadow-[0_4px_14px_rgba(255,85,0,0.35)] transition-all scale-100 hover:scale-[1.02] active:scale-95 inline-flex items-center gap-2"
            style={{ textDecoration: 'none' }}
          >
            <Cpu size={15} />
            Executar Automação de Agente
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <PageTitleIcon icon={IconNeuOpportunities} />
            Oportunidades
          </h1>
          <p className="text-sm font-semibold text-slate-500 mt-1 leading-relaxed">
            Insights gerados pelos Agentes IA com base nos seus dados integrados — priorizados por impacto.
          </p>
        </div>
      </motion.div>

      {/* Real KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpis.map((kpi, i) => (
          <motion.div key={kpi.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <KpiCard {...kpi} />
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a] p-1.5 rounded-2xl border border-slate-800/80 shadow-[0_4px_14px_rgba(15,23,42,0.18)] flex-wrap w-full sm:w-auto">
        {FILTERS.map(f => {
          const isActive = activeFilter === f;
          return (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-3.5 py-1.5 rounded-xl text-[11px] font-black transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-[#FF5500] to-[#FF7700] text-white shadow-[0_2px_8px_rgba(255,85,0,0.35)] scale-[1.02]'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
              style={{ border: 'none' }}
            >
              {f}
            </button>
          );
        })}
      </div>

      {/* Agent Source Banner — Exibido somente com dados verídicos */}
      {activeAgents.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center gap-3.5 px-4 py-3.5 rounded-2xl border border-slate-200/80 bg-white shadow-[0_4px_12px_rgba(0,0,0,0.03)] flex-wrap sm:flex-nowrap"
        >
          <div className="flex -space-x-2.5 items-center shrink-0">
            {activeAgents.map((agent, i) => (
              <div
                key={agent.id}
                title={`${agent.nome} — ${agent.funcao}`}
                className="relative w-8 h-8 rounded-full border-2 border-white shadow-sm overflow-hidden bg-slate-100 transition-transform hover:scale-115 hover:z-30 cursor-pointer"
                style={{ zIndex: activeAgents.length - i }}
              >
                <img
                  src={agent.avatarSrc}
                  alt={agent.nome}
                  className="w-full h-full object-cover object-top"
                />
              </div>
            ))}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-black text-[#1e293b]">
              {activeAgents.length} Agente{activeAgents.length > 1 ? 's' : ''} IA participaram da execução das operações
            </p>
            <p className="text-[11px] text-slate-500 font-semibold truncate">
              {Array.from(new Set(activeOpportunities.flatMap(o => o.source || []))).length > 0
                ? `Baseado em: ${Array.from(new Set(activeOpportunities.flatMap(o => o.source || []))).join(' · ')}`
                : 'Baseado em dados integrados e operações executadas'}
            </p>
          </div>

          {/* Perguntar ao Ulisses */}
          <button
            onClick={handleAskUlissesAll}
            className="rounded-full px-4 py-2 text-[12px] font-black text-white bg-gradient-to-r from-[#FF5500] to-[#FF7700] hover:from-[#e04b00] hover:to-[#e06900] shadow-[0_4px_14px_rgba(255,85,0,0.35)] hover:shadow-[0_6px_18px_rgba(255,85,0,0.45)] transition-all cursor-pointer scale-100 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-1.5 shrink-0"
          >
            <span>Perguntar ao Ulisses</span>
            <ArrowRight size={13} />
          </button>
        </motion.div>
      )}

      {/* Opportunities list */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <Sparkles size={24} className="mx-auto mb-3 text-slate-300" />
            <p className="text-[13px] font-bold">Nenhuma oportunidade nesta categoria.</p>
          </div>
        ) : (
          filtered.map((opp, i) => (
            <OpportunityCard key={opp.id} opp={opp} index={i} userId={user?.uid} />
          ))
        )}
      </div>

      {/* Footer CTA */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex items-center justify-between gap-4 p-5 rounded-2xl border border-white/60 bg-gradient-to-r from-orange-500/8 via-[#eef2f7] to-[#eef2f7] shadow-[3px_3px_8px_#d1d9e6,_-3px_-3px_8px_#ffffff] flex-wrap sm:flex-nowrap"
      >
        <div>
          <p className="text-[14px] font-black text-[#1e293b]">Quer explorar mais oportunidades?</p>
          <p className="text-[12px] text-slate-500 font-semibold mt-0.5">
            Converse com o Ulisses e peça análises customizadas para o seu negócio.
          </p>
        </div>

        {/* Abrir Ulisses */}
        <Link
          href="/hub/assistente-ia?agent=ulisses"
          className="rounded-full px-5 py-2.5 text-[13px] font-black text-white bg-gradient-to-r from-[#FF5500] to-[#FF7700] hover:from-[#e04b00] hover:to-[#e06900] shadow-[0_4px_14px_rgba(255,85,0,0.35)] hover:shadow-[0_6px_18px_rgba(255,85,0,0.45)] transition-all cursor-pointer scale-100 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 shrink-0"
          style={{ textDecoration: 'none' }}
        >
          <Sparkles size={14} />
          <span>Abrir Ulisses</span>
        </Link>
      </motion.div>
    </div>
  );
}
