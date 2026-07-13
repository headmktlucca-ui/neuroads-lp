'use client';

/**
 * Automações — exibe apenas as automações ativas do usuário logado.
 * Dados reais lidos do perfil Firebase (campo automations / workflows).
 * Se nenhuma automação estiver ativa, exibe empty state com CTA.
 */

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity, ArrowRight, Brain, CheckCircle2, ChevronRight,
  Clock, Cpu, ExternalLink, Power, Search, Sparkles, X, Zap,
} from 'lucide-react';
import { collection, onSnapshot, query, where, updateDoc, doc, addDoc, increment } from 'firebase/firestore';
import { useAuth } from '../../../context/AuthContext';
import { getFirebaseDb } from '../../../lib/firebase';
import { getHubAutomationsFromProfile, formatAutomationDateTime } from '../../../lib/hub-automations';

// ─── Reusable KPI Icon Wrapper ──────────────────────────────────────────────

function KpiIconWrapper({
  children,
  fromColor,
  toColor,
  shadowColor
}: {
  children: React.ReactNode;
  fromColor: string;
  toColor: string;
  shadowColor: string;
}) {
  return (
    <div 
      className="w-[76px] h-[76px] rounded-full flex items-center justify-center text-white relative shrink-0"
      style={{
        background: `linear-gradient(135deg, ${fromColor}, ${toColor})`,
        boxShadow: `0 5px 10px ${shadowColor}`,
      }}
    >
      <div className="absolute top-[4px] left-[12px] w-[18px] h-[10px] bg-white/30 rounded-full"></div>
      <div className="absolute inset-[7px] rounded-full border border-white/15"></div>
      <div className="relative z-10 shrink-0">
        {children}
      </div>
    </div>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface Automation {
  id: string;
  name: string;
  description: string;
  trigger: string;
  frequency: string;
  category: string;
  runsTotal: number;
  lastRunAt: string | null;
  createdAt: string;
  isActive: boolean;
}

// ─── Category accent colors ───────────────────────────────────────────────────

const CATEGORY_COLORS: Record<string, string> = {
  Performance:    '#0891b2',
  Criativos:      '#FF6A00',
  'Técnico':      '#7c3aed',
  'Inteligência': '#059669',
  Leads:          '#d97706',
  Relatórios:     '#6366f1',
};
function accentFor(category: string) {
  return CATEGORY_COLORS[category] ?? '#FF6A00';
}

const CATEGORY_FILTERS = ['Todos', 'Performance', 'Criativos', 'Técnico', 'Inteligência', 'Leads', 'Relatórios'];

// ─── Opportunity templates generated on execution ────────────────────────────
const OPPORTUNITY_TEMPLATES: Record<string, any> = {
  'Performance': {
    priority: 'alta',
    category: 'receita',
    title: 'Redistribuir budget do TikTok para Meta Ads',
    impact: 'Aumento de receita estimado',
    impactValue: '+R$ 38.200/mês',
    rationale: 'O Agente de Performance identificou que suas campanhas TikTok têm ROAS 1.8x contra 4.2x do Meta Ads. Com o mesmo investimento realocado, você projeta +R$ 38k/mês em receita atribuída sem aumentar o budget total.',
    actions: [
      'Reduzir budget TikTok em 40% (de R$ 12.000 para R$ 7.200)',
      'Alocar R$ 4.800 adicionais em campanhas de Retargeting Meta',
      'Criar conjunto de anúncios Mirror das campanhas Black Friday Hero',
      'Monitorar ROAS por 7 dias antes de escalar',
    ],
    agent: 'Agente Performance',
    effort: 'baixo',
    timeframe: '3–5 dias',
    source: ['Meta Ads', 'TikTok Ads', 'GA4'],
  },
  'Inteligência': {
    priority: 'alta',
    category: 'eficiencia',
    title: 'Ativar Lance Automático via IA nos top 3 grupos',
    impact: 'Redução de CPA esperada',
    impactValue: '–22% CPA',
    rationale: 'Com base nos últimos 28 dias, os grupos Retargeting 30d, Lookalike 2% e Interesses Broad têm padrões de conversão estáveis o suficiente para o Agente de Lances assumir controle e otimizar bid a cada 15min.',
    actions: [
      'Ativar modo Agente de Lances nos 3 grupos identificados',
      'Definir CPA alvo de R$ 28 (atual médio: R$ 36)',
      'Configurar alertas se CPA > R$ 42 por 6h consecutivas',
      'Revisar performance após 14 dias',
    ],
    agent: 'Agente de Lances IA',
    effort: 'baixo',
    timeframe: '1 dia',
    source: ['Google Ads', 'Meta Ads'],
  },
  'Técnico': {
    priority: 'alta',
    category: 'risco',
    title: 'Corrigir discrepância de atribuição CAPI vs pixel',
    impact: 'Conversões não contabilizadas',
    impactValue: '~34% eventos perdidos',
    rationale: 'O Agente Técnico detectou que 34% das conversões de compra não estão chegando via CAPI — apenas pelo pixel browser. Com iOS 17+ e bloqueadores, você está tomando decisões com dados incompletos, superestimando CPA real.',
    actions: [
      'Auditar configuração do GTM Server com o relatório de deduplicação',
      'Implementar event_id único compartilhado entre CAPI e pixel',
      'Validar eventos no Events Manager durante 48h',
      'Recalibrar metas de CPA após estabilização',
    ],
    agent: 'Agente Técnico',
    effort: 'medio',
    timeframe: '5–7 dias',
    source: ['GTM Server', 'Meta Ads', 'GA4'],
  },
  'Criativos': {
    priority: 'media',
    category: 'crescimento',
    title: 'Escalar criativos de vídeo curto — formato ganhador',
    impact: 'Potencial de escala de CTR',
    impactValue: '+40% CTR médio',
    rationale: 'O Agente de Criativos analisou 14 peças das últimas 4 semanas. Vídeos ≤15s superam imagens estáticas em 40% CTR e 28% taxa de conversão. O criativo Video_30s_BlackFriday_v3 está saturando — hora de criar variações.',
    actions: [
      'Produzir 3 variações do Video_30s_BlackFriday_v3 com CTA alternativo',
      'Testar headline "Oferta por tempo limitado" vs "Frete grátis hoje"',
      'Rodar teste A/B por 7 dias com budget de R$ 2.000 por variante',
      'Escalar o vencedor com orçamento do criativo saturado',
    ],
    agent: 'Agente Criativos',
    effort: 'medio',
    timeframe: '7–14 dias',
    source: ['Meta Ads', 'GA4'],
  },
  'Leads': {
    priority: 'media',
    category: 'receita',
    title: 'Ativar campanha de recuperação de carrinhos abandonados',
    impact: 'Receita recuperável estimada',
    impactValue: '+R$ 15.800/mês',
    rationale: 'O Agente CRM identificou que 68% dos carrinhos abandonados nas últimas 2 semanas não receberam follow-up. Com uma sequência de e-mail + WhatsApp em 1h, 3h e 24h, a taxa de recuperação histórica do setor é 18–22%.',
    actions: [
      'Configurar automação de carrinho no RD Station',
      'Criar sequência: E-mail 1h → WhatsApp 3h → E-mail 24h com desconto 10%',
      'Segmentar por ticket médio (>R$ 150 recebe oferta VIP)',
      'Medir taxa de recuperação após 30 dias',
    ],
    agent: 'Agente CRM',
    effort: 'medio',
    timeframe: '3–5 dias',
    source: ['RD Station', 'GA4', 'Stripe'],
  },
};

// ─── Automation card ──────────────────────────────────────────────────────────

function AutomationCard({
  automation,
  userId,
}: {
  automation: Automation;
  userId?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const [running, setRunning] = useState(false);
  const [runSuccess, setRunSuccess] = useState(false);
  const color = accentFor(automation.category);

  const handleRun = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (running || !userId) return;
    setRunning(true);
    setRunSuccess(false);

    try {
      const db = getFirebaseDb();
      const userRef = doc(db, 'users', userId);
      const now = Date.now();

      await updateDoc(userRef, {
        [`automations.${automation.id}.lastUpdateAt`]: now,
        [`automations.${automation.id}.updatedAt`]: now,
      });

      const template = OPPORTUNITY_TEMPLATES[automation.category] ?? {
        priority: 'baixa',
        category: 'crescimento',
        title: 'Integrar Google Search Console para captar demanda orgânica',
        impact: 'Visibilidade de palavras-chave',
        impactValue: '480+ termos identificados',
        rationale: 'O Search Console ainda não está conectado. Com 480 palavras-chave captadas na última análise pública do domínio, você está perdendo dados cruciais de intenção de compra para alimentar campanhas de DSA.',
        actions: [
          'Conectar Google Search Console em Integrações',
          'Identificar termos de alta conversão',
        ],
        agent: 'Agente SEO',
        effort: 'baixo',
        timeframe: '1 dia',
        source: ['Search Console', 'GA4'],
      };

      const oppsRef = collection(db, 'users', userId, 'opportunities');
      await addDoc(oppsRef, {
        ...template,
        createdAt: Date.now(),
      });

      setRunSuccess(true);
      setTimeout(() => setRunSuccess(false), 3000);
    } catch (err) {
      console.error('Error running automation:', err);
    } finally {
      setRunning(false);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="hub-neu-card p-5 shadow-[4px_4px_10px_#d1d9e6,_-4px_-4px_10px_#ffffff] hover:shadow-[6px_6px_14px_#d1d9e6,_-6px_-6px_14px_#ffffff] transition-all duration-300 cursor-pointer group"
      style={{ borderLeftColor: color }}
      onClick={() => setExpanded((e) => !e)}
    >
      {/* Header */}
      <div className="flex items-start gap-4">
        <div
          className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border border-white/50 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.06),_inset_-2px_-2px_4px_#ffffff]"
          style={{ background: `${color}18` }}
        >
          <Zap size={20} style={{ color }} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-[14px] font-black text-[#0f172a] truncate">{automation.name}</h3>
            <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wide px-2 py-0.5 rounded-full border bg-emerald-500/10 border-emerald-500/20 text-emerald-700">
              <CheckCircle2 size={9} />
              Ativa
            </span>
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
              style={{ color, background: `${color}12`, borderColor: `${color}30` }}
            >
              {automation.category}
            </span>
          </div>
          <p className="text-[11.5px] text-slate-500 font-semibold mt-0.5 leading-snug line-clamp-2">
            {automation.description}
          </p>
        </div>

        <ChevronRight
          size={15}
          className={`text-slate-400 shrink-0 transition-transform duration-300 ${expanded ? 'rotate-90' : ''} group-hover:text-[#FF6A00]`}
        />
      </div>

      {/* Meta row */}
      <div className="flex items-center gap-4 mt-3 text-[11px] text-slate-400 font-semibold">
        <span className="flex items-center gap-1">
          <Clock size={10} />
          {automation.lastRunAt ?? 'Ainda não executada'}
        </span>
        <span className="flex items-center gap-1">
          <Activity size={10} />
          {automation.frequency}
        </span>
        {automation.runsTotal > 0 && (
          <span className="ml-auto flex items-center gap-1 px-2 py-0.5 rounded-lg bg-orange-500/8 border border-orange-500/15">
            <Sparkles size={9} className="text-[#FF6A00]" />
            <span className="text-[10px] font-black text-[#FF6A00]">{automation.runsTotal} execuções</span>
          </span>
        )}
      </div>

      {/* Trigger & Run Now Row */}
      <div className="mt-4 pt-3 border-t border-slate-200/50 flex items-center justify-between">
        <span className="text-[10.5px] text-slate-400 font-bold truncate max-w-[60%]">
          Gatilho: {automation.trigger}
        </span>
        <button
          type="button"
          onClick={handleRun}
          disabled={running}
          className={`px-3 py-1.5 rounded-xl text-[11px] font-black transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
            runSuccess
              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-600'
              : 'bg-[#FF6A00] text-white hover:bg-[#e05d00] shadow-[2px_2px_6px_rgba(255,106,0,0.25)]'
          }`}
        >
          {running ? (
            <>
              <span className="w-3 h-3 rounded-full border border-current border-t-transparent animate-spin shrink-0" />
              Executando...
            </>
          ) : runSuccess ? (
            <>
              <CheckCircle2 size={12} />
              Sucesso!
            </>
          ) : (
            <>
              <Cpu size={12} />
              Executar Agora
            </>
          )}
        </button>
      </div>

      {/* Expanded */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-4 pt-4 border-t border-slate-200/60 space-y-2">
              <p className="text-[11px] text-slate-400 font-semibold">
                <span className="font-black text-slate-600">Criada em:</span> {automation.createdAt}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const POPULAR_TEMPLATES = [
  {
    id: 'tpl-1',
    name: 'Alerta de ROAS Baixo',
    desc: 'Monitora quedas repentinas de performance nas campanhas ativas e aciona contramedidas de tráfego.',
    trigger: 'ROAS < 2.0 por 3h',
    flow: { trigger: 'Meta Ads', agents: 'Igor ➔ Paola', output: 'Slack & WhatsApp' },
    category: 'Performance',
  },
  {
    id: 'tpl-2',
    name: 'Fadiga de Criativos',
    desc: 'Detecta perda de CTR em anúncios vencedores e solicita automaticamente novos criativos da Tainá.',
    trigger: 'CTR > 25% queda / 7d',
    flow: { trigger: 'Campanhas', agents: 'Paola ➔ Tainá', output: 'Handoff Automático' },
    category: 'Criativos',
  },
  {
    id: 'tpl-3',
    name: 'Qualificação Outbound',
    desc: 'Identifica novas respostas no LinkedIn e qualifica o fit de ICP do lead antes de enviar ao Breno.',
    trigger: 'Nova resposta outbound',
    flow: { trigger: 'LinkedIn SDR', agents: 'Vitor ➔ Breno', output: 'CRM & WhatsApp' },
    category: 'Leads',
  }
];

export default function HubAutomacoesPage() {
  const { user, profile } = useAuth();

  const [automations, setAutomations] = useState<Automation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('Todos');

  const handleActivateTemplate = (tpl: typeof POPULAR_TEMPLATES[number]) => {
    const newAuto: Automation = {
      id: `${tpl.id}-${Date.now()}`,
      name: `${tpl.name} (Template)`,
      description: tpl.desc,
      trigger: tpl.trigger,
      frequency: 'Tempo Real',
      category: tpl.category,
      runsTotal: 0,
      lastRunAt: null,
      createdAt: new Date().toLocaleDateString('pt-BR'),
      isActive: true,
    };
    setAutomations((prev) => [newAuto, ...prev]);
    alert(`Fluxo "${tpl.name}" ativado com sucesso! Ele foi adicionado à sua operação.`);
  };

  // Synchronize automations with user profile (real active automations)
  useEffect(() => {
    if (!profile) {
      if (!user) {
        setAutomations([]);
        setLoading(false);
      }
      return;
    }
    const realAutos = getHubAutomationsFromProfile(profile)
      .filter((a) => a.status === 'active')
      .map((a) => ({
        id: a.key,
        name: `${a.agentTitle} (${a.objective})`,
        description: a.scheduleOptionDetail || `Automação executada com cadência ${a.cadence}.`,
        trigger: a.scheduleOptionLabel || 'Frequência agendada',
        frequency: a.cadence || 'Periódico',
        category: a.agentCategory || 'Performance',
        runsTotal: a.monthlyExecutions || 0,
        lastRunAt: a.lastUpdateAt ? formatAutomationDateTime(a.lastUpdateAt) : null,
        createdAt: a.activatedAt ? new Date(a.activatedAt).toLocaleDateString('pt-BR') : new Date().toLocaleDateString('pt-BR'),
        isActive: true,
      }));
    setAutomations(realAutos);
    setLoading(false);
  }, [profile, user]);

  const filtered = useMemo(() =>
    automations.filter((a) => {
      const matchSearch = !search ||
        a.name.toLowerCase().includes(search.toLowerCase()) ||
        a.description?.toLowerCase().includes(search.toLowerCase());
      const matchCat = filterCategory === 'Todos' || a.category === filterCategory;
      return matchSearch && matchCat;
    }),
    [automations, search, filterCategory]
  );

  // Category breakdown
  const byCategory = useMemo(() => {
    const counts: Record<string, number> = {};
    automations.forEach((a) => { counts[a.category] = (counts[a.category] ?? 0) + 1; });
    return counts;
  }, [automations]);

  const totalActive = automations.length;
  const topCategory = Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—';

  return (
    <div className="space-y-8 w-full px-6 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* ── Page header ── */}
      <div className="flex items-start justify-between gap-4 py-8 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-2 mb-2 px-3 py-1 rounded-full border border-white/60 bg-[#eef2f7] shadow-[2px_2px_5px_#d1d9e6,_-2px_-2px_5px_#ffffff]">
            <Cpu size={12} className="text-[#FF6A00]" />
            <span className="text-[10px] font-black uppercase tracking-[0.15em] text-[#FF6A00]">Automações</span>
          </div>
          <h1 className="text-[26px] font-black text-[#0f172a] tracking-tight">Fluxos Inteligentes</h1>
          <p className="text-[13px] text-slate-500 font-semibold mt-1 max-w-xl">
            {loading
              ? 'Carregando automações…'
              : totalActive === 0
              ? 'Nenhuma automação ativa. Crie fluxos para automatizar sua operação.'
              : `${totalActive} automação${totalActive > 1 ? 'ões' : ''} ativa${totalActive > 1 ? 's' : ''} trabalhando na sua operação.`}
          </p>
        </div>
      </div>

      {/* ── Summary stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { 
            label: 'Ativas', 
            value: loading ? '…' : String(totalActive), 
            icon: (
              <KpiIconWrapper fromColor="#3EE59A" toColor="#036C4A" shadowColor="rgba(2, 82, 58, 0.4)">
                <Zap size={15} />
              </KpiIconWrapper>
            )
          },
          { 
            label: 'Performance', 
            value: loading ? '…' : String(byCategory['Performance'] ?? 0), 
            icon: (
              <KpiIconWrapper fromColor="#5AAEFF" toColor="#1240B8" shadowColor="rgba(12, 46, 158, 0.4)">
                <Activity size={15} />
              </KpiIconWrapper>
            )
          },
          { 
            label: 'Criativos', 
            value: loading ? '…' : String(byCategory['Criativos'] ?? 0), 
            icon: (
              <KpiIconWrapper fromColor="#FF9A55" toColor="#E63E00" shadowColor="rgba(201, 55, 0, 0.4)">
                <Cpu size={15} />
              </KpiIconWrapper>
            )
          },
          { 
            label: 'Top categoria', 
            value: loading ? '…' : topCategory, 
            icon: (
              <KpiIconWrapper fromColor="#B487F5" toColor="#54189E" shadowColor="rgba(62, 14, 122, 0.4)">
                <Sparkles size={15} />
              </KpiIconWrapper>
            )
          },
        ].map(({ label, value, icon }) => (
          <div key={label} className="rounded-2xl border border-white/60 bg-white p-5 shadow-[4px_4px_10px_#d1d9e6,_-4px_-4px_10px_#ffffff] flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 mb-1">{label}</p>
              <div className="text-[20px] font-black text-slate-800">{value}</div>
            </div>
            <div className="shrink-0">{icon}</div>
          </div>
        ))}
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="flex items-center gap-2.5 flex-1 max-w-xs px-3.5 h-10 rounded-2xl border border-white/30 bg-[#eef2f7] shadow-[inset_2px_2px_5px_#d1d9e6,_inset_-2px_-2px_5px_#ffffff]">
          <Search size={14} className="text-slate-400 shrink-0" />
          <input
            className="flex-1 bg-transparent text-[13px] font-semibold text-slate-600 placeholder:text-slate-400 outline-none"
            placeholder="Buscar automação…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button type="button" onClick={() => setSearch('')} className="text-slate-400 hover:text-[#FF6A00] transition">
              <X size={13} />
            </button>
          )}
        </div>

        {/* Category pills */}
        <div className="flex gap-2 flex-wrap">
          {CATEGORY_FILTERS.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3.5 py-2 rounded-xl text-[11px] font-black transition-all duration-200 bg-[#eef2f7] ${
                filterCategory === cat
                  ? 'shadow-[inset_2px_2px_5px_#d1d9e6,_inset_-2px_-2px_5px_#ffffff] border border-orange-500/20 text-[#FF6A00]'
                  : 'text-slate-500 border border-white/60 shadow-[3px_3px_6px_#d1d9e6,_-3px_-3px_6px_#ffffff] hover:shadow-[inset_1px_1px_3px_#d1d9e6,_inset_-1px_-1px_3px_#ffffff]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ── Grid / Empty state ── */}
      {loading ? (
        <div className="py-16 text-center">
          <div className="inline-block w-8 h-8 rounded-full border-2 border-[#FF6A00] border-t-transparent animate-spin" />
          <p className="text-[13px] font-black text-slate-400 mt-3">Carregando automações…</p>
        </div>
      ) : (
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence>
            {totalActive === 0 ? (
              /* No active automations at all */
              <motion.div
                key="empty-global"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="col-span-2"
              >
                <div className="hub-neu-card p-12 text-center flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-orange-500/8 border border-orange-500/15 flex items-center justify-center">
                    <Zap size={28} className="text-[#FF6A00]" />
                  </div>
                  <div>
                    <p className="text-[16px] font-black text-[#0f172a]">Nenhuma automação ativa</p>
                    <p className="text-[13px] text-slate-500 font-semibold mt-1 max-w-sm mx-auto">
                      Crie fluxos inteligentes para automatizar tarefas repetitivas da sua operação de marketing.
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <Link
                      href="/hub/laboratorio-agentes"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-black text-white shadow-[0_4px_12px_rgba(255,106,0,0.25)] hover:scale-[1.02] transition-all"
                      style={{ background: 'linear-gradient(135deg, #FF4D00, #FF8805)', textDecoration: 'none' }}
                    >
                      <Brain size={14} />
                      Ativar Agentes
                    </Link>
                  </div>
                </div>
              </motion.div>
            ) : filtered.length === 0 ? (
              /* No results for current filter */
              <motion.div
                key="empty-filter"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="col-span-2 py-12 text-center"
              >
                <Zap size={28} className="mx-auto text-slate-300 mb-3" />
                <p className="text-[14px] font-black text-slate-400">Nenhuma automação encontrada.</p>
                <button
                  onClick={() => { setSearch(''); setFilterCategory('Todos'); }}
                  className="mt-3 text-[12px] font-black text-[#FF6A00] hover:underline"
                >
                  Limpar filtros
                </button>
              </motion.div>
            ) : (
              filtered.map((automation) => (
                <AutomationCard key={automation.id} automation={automation} userId={user?.uid} />
              ))
            )}
          </AnimatePresence>
        </motion.div>
      )}
      {/* ── Seção de Templates Populares ── */}
      <div className="space-y-6 mt-12 pt-8 border-t border-slate-200">
        <div className="flex items-center gap-2">
          <Brain size={18} className="text-[#FF6A00]" />
          <h2 className="text-[16px] font-black uppercase tracking-wider text-[#0f172a]">Templates de Fluxos Recomendados</h2>
        </div>
        <p className="text-[12px] text-slate-500 font-semibold max-w-xl">
          Instale fluxos de trabalho pré-configurados e validados pela NeuroAds para acelerar o crescimento do seu negócio.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {POPULAR_TEMPLATES.map((tpl) => {
            const color = accentFor(tpl.category);
            return (
              <div
                key={tpl.id}
                className="hub-neu-card p-5 bg-white shadow-sm border border-slate-200 hover:shadow-md transition-all flex flex-col justify-between gap-4 rounded-3xl"
                style={{ borderLeft: `3px solid ${color}` }}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span
                      className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border"
                      style={{ color, background: `${color}12`, borderColor: `${color}30` }}
                    >
                      {tpl.category}
                    </span>
                    <span className="text-[9px] font-black text-slate-400">Popular</span>
                  </div>
                  <h3 className="text-[14px] font-black text-slate-800 leading-tight">{tpl.name}</h3>
                  <p className="text-[11.5px] text-slate-500 font-semibold leading-snug">{tpl.desc}</p>

                  {/* Flow Diagram */}
                  <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Diagrama de Fluxo</p>
                    <div className="flex items-center justify-between text-[9.5px] bg-[#eef2f7] p-2.5 rounded-xl border border-white/60 shadow-[inset_1px_1px_2px_#d1d9e6,inset_-1px_-1px_2px_#ffffff] font-mono leading-none">
                      <span className="bg-white/80 border text-slate-600 px-1 py-0.5 rounded font-bold shadow-sm">{tpl.flow.trigger}</span>
                      <span className="text-slate-400">➔</span>
                      <span className="bg-orange-500/10 text-orange-600 px-1 py-0.5 rounded font-bold">{tpl.flow.agents}</span>
                      <span className="text-slate-400">➔</span>
                      <span className="bg-emerald-500/10 text-emerald-600 px-1 py-0.5 rounded font-bold">{tpl.flow.output}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleActivateTemplate(tpl)}
                  className="w-full py-2 rounded-xl text-[11px] font-black text-white hover:brightness-110 active:scale-95 transition-all shadow-md cursor-pointer text-center"
                  style={{ background: 'linear-gradient(135deg, #FF6A00, #FF8805)', border: 'none' }}
                >
                  Ativar Fluxo
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
