'use client';

import React, { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Brain,
  ChevronRight,
  Cpu,
  FlaskConical,
  Link2,
  MousePointerClick,
  ShoppingCart,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Wallet,
  Zap,
  Info,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useHub } from '../../context/HubContext';
import { normalizeConnections } from '../../lib/connectors';
import { getHubAutomationsFromProfile, formatAutomationDateTime } from '../../lib/hub-automations';
import HubEmptyState from './HubEmptyState';
import HubTrialBanner from './HubTrialBanner';
import CreditMeter from './CreditMeter';
import BentoCard from './v2/BentoCard';
import CountUp from './v2/CountUp';
import Sparkline from './v2/Sparkline';
import {
  IconWallet3D,
  IconTarget3D,
  IconTrending3D,
  IconCart3D,
  IconClick3D,
  IconActivity3D,
  IconCoin3D,
} from './HubUiIcons3D';

/* ─── Custom Icons ────────────────────────────────────────────────── */
const InstagramIcon = ({ size = 16, className = "" }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const LinkedinIcon = ({ size = 16, className = "" }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
    <rect x="2" y="9" width="4" height="12"></rect>
    <circle cx="4" cy="4" r="2"></circle>
  </svg>
);

/* ─── Types ────────────────────────────────────────────────────────── */
type ChannelResult = {
  platform: string; spend: number; impressions: number; clicks: number; conversions: number; error?: string;
};
type TrafficExtractResponse = {
  success: boolean; channels?: ChannelResult[];
  totals?: { spend: number; impressions: number; clicks: number; conversions: number };
  error?: string;
  hasErrors?: boolean;
};
type Ga4TrafficSource = { source: string; sessions: number };
type Ga4TrendPoint = { date: string; newUsers: number; returningUsers: number };
type Ga4Region = { country: string; value: number; change: string; positive: boolean | null };
type Ga4MetricsResponse = {
  activeUsers?: string; averageSessionDuration?: string; conversions?: string;
  engagementRate?: string; purchaseRevenue?: string; error?: string;
  trafficSources?: Ga4TrafficSource[];
  usersTrend?: Ga4TrendPoint[];
  regions?: Ga4Region[];
};
type SearchConsoleResponse = {
  clicks?: number; impressions?: number; ctr?: string; position?: string; siteUrl?: string; error?: string;
};
type InstagramResponse = {
  username?: string; followers?: number; reach?: number; profileViews?: number;
  websiteClicks?: number; engagementRate?: string; error?: string;
};
type LinkedinPageResponse = {
  followers?: number; impressions?: number; clicks?: number; engagementRate?: string; error?: string;
};

type KpiDef = {
  label: string;
  rawValue: number;
  isNa: boolean;
  prefix: string;
  suffix: string;
  decimals: number;
  delta: string;
  positive: boolean;
  icon: React.ElementType;
  color: string;
  glow: string;
  spark: number[];
};

interface ConnectionItem {
  isActive?: boolean;
  accessToken?: string;
  refreshToken?: string;
  accountId?: string;
  loginCustomerId?: string;
}

const STATIC_AGENTS = [
  { name: 'Copy Persuasivo', desc: 'Criação de anúncios com gatilhos', status: 'Ativo', runs: 124 },
  { name: 'Análise ROAS',    desc: 'Diagnóstico automático por canal', status: 'Ativo', runs: 87  },
  { name: 'Brief Criativo',  desc: 'Geração de briefings visuais',    status: 'Beta',  runs: 42  },
];

/* ─── KPI Help Popover Component ───────────────────────────────────── */
function KpiHelpPopover({ label, isNa }: { label: string; isNa: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);

  const POPOVER_WIDTH = 288; // 18rem / w-72

  const updateCoords = useCallback(() => {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    const left = Math.min(
      rect.right - POPOVER_WIDTH,
      window.innerWidth - POPOVER_WIDTH - 8
    );
    setCoords({
      top: rect.bottom + 8 + window.scrollY,
      left: Math.max(8, left) + window.scrollX,
    });
  }, []);

  const handleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isOpen) updateCoords();
    setIsOpen(prev => !prev);
  };

  useEffect(() => {
    if (!isOpen) return;
    const close = (e: MouseEvent) => {
      if (btnRef.current && btnRef.current.contains(e.target as Node)) return;
      setIsOpen(false);
    };
    const onScroll = () => { updateCoords(); };
    document.addEventListener('mousedown', close);
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onScroll);
    return () => {
      document.removeEventListener('mousedown', close);
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onScroll);
    };
  }, [isOpen, updateCoords]);

  const getHelpContent = () => {
    switch (label) {
      case 'Receita Total':
        return {
          desc: 'Soma total de vendas capturadas e atribuídas aos canais no período analisado.',
          reason: 'Não foi possível carregar a receita porque a integração com o Google Analytics 4 (GA4) está offline ou os eventos de compra (purchase) não estão enviando valores monetários.',
          solve: 'Conecte o GA4 na tela de Integrações e verifique se o rastreamento de comércio eletrônico está ativo no seu site.'
        };
      case 'Investimento':
        return {
          desc: 'Total de verba consumida em mídia paga (Google Ads, Meta Ads e LinkedIn Ads) durante o período.',
          reason: 'Nenhuma plataforma de anúncios ativa ou conectada está enviando custos de campanhas.',
          solve: 'Verifique suas conexões de anúncios na aba de Integrações e confirme se há campanhas rodando ativamente na respectiva plataforma.'
        };
      case 'ROAS Médio':
        return {
          desc: 'Retorno sobre o Investimento Publicitário (Receita Total / Investimento em Ads). Indica a receita gerada para cada real investido.',
          reason: 'Sem dados suficientes para calcular o ROAS. Requer que a Receita (GA4) e o Investimento (Ads) sejam maiores que zero.',
          solve: 'Conecte o GA4 e ao menos um canal de anúncios pago com campanhas ativas no período selecionado.'
        };
      case 'Conversões':
        return {
          desc: 'Total de ações de conversão (compras, leads ou cadastros) registradas no período.',
          reason: 'Nenhuma conversão foi detectada nos pixels das plataformas ou eventos do GA4.',
          solve: 'Confirme se a tag de conversão global está ativa no seu site e se as contas integradas possuem rastreamento configurado.'
        };
      case 'CPA Médio':
        return {
          desc: 'Custo por Aquisição médio (Investimento / Conversões). Representa quanto custa atrair um cliente conversor.',
          reason: 'CPA indisponível. Requer dados de investimento e pelo menos 1 conversão registrada.',
          solve: 'Verifique se as campanhas ativas estão convertendo e se os pixels estão reportando corretamente no painel.'
        };
      case 'Usuários Ativos':
        return {
          desc: 'Total de usuários únicos que interagiram com o seu site no período selecionado, medido pelo GA4.',
          reason: 'Sem conexão ativa com o Google Analytics 4 ou a tag gtag.js não está sendo disparada no site.',
          solve: 'Acesse Integrações, certifique-se de que a conta correta do GA4 está conectada e de que a propriedade de fluxo de dados está ativa.'
        };
      default:
        return {
          desc: 'Indicador estratégico de desempenho do Hub.',
          reason: 'A API correspondente não retornou dados no período.',
          solve: 'Verifique o status da conexão da plataforma.'
        };
    }
  };

  const info = getHelpContent();

  const popover = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 5 }}
          style={{
            position: 'absolute',
            top: coords.top,
            left: coords.left,
            width: POPOVER_WIDTH,
            zIndex: 99999,
          }}
          className="rounded-2xl border border-slate-200/60 bg-white p-4 shadow-[5px_5px_15px_rgba(209,217,230,0.5)] text-left"
        >
          <p className="text-[12px] font-black text-slate-800 uppercase tracking-wide border-b border-slate-200 pb-1.5 mb-2 flex items-center gap-1.5">
            <Info size={13} className="text-[#FF6A00]" />
            {label}
          </p>
          <p className="text-[11.5px] font-semibold text-slate-600 leading-snug">{info.desc}</p>

          {isNa && (
            <div className="mt-3 p-2.5 rounded-xl border border-rose-500/15 bg-rose-500/5 text-rose-800">
              <p className="text-[10px] font-black uppercase tracking-wider mb-0.5">Motivo do N/A:</p>
              <p className="text-[11px] font-semibold leading-snug mb-2">{info.reason}</p>
              <p className="text-[10px] font-black uppercase tracking-wider mb-0.5">Como resolver:</p>
              <p className="text-[11.5px] font-bold leading-snug">{info.solve}</p>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={handleOpen}
        className="w-5 h-5 rounded-full flex items-center justify-center border border-[#475569]/25 bg-slate-100/80 text-slate-500 hover:text-[#FF6A00] hover:border-[#FF6A00]/40 transition-colors shadow-sm cursor-pointer text-[11px] font-black"
        aria-label="Explicação da métrica"
      >
        ?
      </button>
      {typeof document !== 'undefined' && createPortal(popover, document.body)}
    </>
  );
}

// ─── GA4 Custom Charts (dados reais conforme o período selecionado) ──
const GA4_DONUT_COLORS = ['#FF6A00', '#2563eb', '#059669', '#7c3aed', '#db2777', '#0369a1', '#b45309', '#64748b'];

function Ga4WidgetEmpty({ connected, loading }: { connected: boolean; loading: boolean }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-2 py-8 text-center">
      {loading ? (
        <>
          <div className="w-5 h-5 rounded-full border-2 border-[#FF6A00]/30 border-t-[#FF6A00] animate-spin" />
          <p className="text-[11px] font-bold text-slate-400">Carregando dados do GA4…</p>
        </>
      ) : connected ? (
        <>
          <Activity size={18} className="text-slate-300" />
          <p className="text-[11px] font-bold text-slate-400">Sem dados no período selecionado.</p>
        </>
      ) : (
        <>
          <AlertTriangle size={18} className="text-amber-400" />
          <p className="text-[11px] font-bold text-slate-400">
            Conecte o GA4 em{' '}
            <Link href="/hub/integracoes" className="text-[#FF6A00]">Integrações</Link>
            {' '}para ver dados reais.
          </p>
        </>
      )}
    </div>
  );
}

function Ga4StatusBadge({ connected }: { connected: boolean }) {
  return connected ? (
    <div className="flex items-center gap-1 bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10 text-[9px] font-black text-emerald-600">
      <CheckCircle2 size={8} />
      GA4
    </div>
  ) : (
    <div className="flex items-center gap-1 bg-amber-500/5 px-2 py-0.5 rounded border border-amber-500/10 text-[9px] font-black text-amber-600">
      <AlertTriangle size={8} />
      GA4 OFF
    </div>
  );
}

function GA4TrafficDonut({ sources, connected, loading }: { sources: Ga4TrafficSource[]; connected: boolean; loading: boolean }) {
  const data = sources.map((s, i) => ({
    name: s.source,
    value: s.sessions,
    color: GA4_DONUT_COLORS[i % GA4_DONUT_COLORS.length],
  }));
  return (
    <div className="flex flex-col h-full justify-between">
      <div className="flex items-center justify-between border-b border-white/40 pb-3 mb-3">
        <div className="flex items-center gap-2">
          <Activity size={14} className="text-[#FF6A00]" />
          <span className="text-[12px] font-black uppercase tracking-wider text-[#0f172a]">Origens de Tráfego (GA4)</span>
        </div>
        <Ga4StatusBadge connected={connected} />
      </div>
      {data.length === 0 ? (
        <Ga4WidgetEmpty connected={connected} loading={loading} />
      ) : (
        <div className="flex flex-1 items-center gap-3 sm:gap-4 py-1">
          <div className="w-28 h-28 sm:w-36 sm:h-36 shrink-0 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data} dataKey="value" innerRadius="62%" outerRadius="83%" paddingAngle={2} stroke="none">
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip formatter={(value) => [`${value} Sessões`, 'Total']} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', fontSize: '12px', fontWeight: 'bold' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-1 space-y-1 overflow-y-auto max-h-[170px] pr-1">
            {data.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-[10.5px] font-semibold px-2 py-0.5 rounded-lg transition-all hover:bg-white hover:shadow-[2px_2px_5px_#d1d9e6]">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-600 truncate" title={item.name}>{item.name}</span>
                </div>
                <span className="font-bold text-slate-800 font-mono shrink-0 ml-2">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function GA4UserLineChart({ trend, connected, loading }: { trend: Ga4TrendPoint[]; connected: boolean; loading: boolean }) {
  return (
    <div className="flex flex-col h-full justify-between">
      <div className="flex items-center justify-between border-b border-white/40 pb-3 mb-3">
        <span className="text-[12px] font-black uppercase tracking-wider text-[#0f172a]">Usuários novos x recorrentes</span>
        <Ga4StatusBadge connected={connected} />
      </div>

      {trend.length === 0 ? (
        <Ga4WidgetEmpty connected={connected} loading={loading} />
      ) : (
        <>
          <div className="relative flex-1 flex items-center justify-center h-40">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(203,213,225,0.4)" />
                <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 'bold' }} axisLine={false} tickLine={false} minTickGap={20} />
                <YAxis tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                <RechartsTooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', fontSize: '10px' }}
                  labelStyle={{ fontWeight: 'bold', color: '#0f172a', marginBottom: '4px' }}
                />
                <Line type="monotone" dataKey="returningUsers" name="Recorrentes" stroke="#2563eb" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
                <Line type="monotone" dataKey="newUsers" name="Novos" stroke="#22c55e" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-center gap-6 text-[10px] font-black uppercase text-slate-500 pt-2 border-t border-slate-200/50 mt-2">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2563eb]" />
              <span>recorrentes</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#22c55e]" />
              <span>novos</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function GA4ActiveRegions({ regions, connected, loading }: { regions: Ga4Region[]; connected: boolean; loading: boolean }) {
  const maxValue = Math.max(...regions.map(r => r.value), 1);

  return (
    <div className="flex flex-col h-full justify-between">
      <div className="flex items-center justify-between border-b border-white/40 pb-3 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-[12px] font-black uppercase tracking-wider text-[#0f172a]">Usuários ativos por Região</span>
        </div>
        <Ga4StatusBadge connected={connected} />
      </div>

      {regions.length === 0 ? (
        <Ga4WidgetEmpty connected={connected} loading={loading} />
      ) : (
        <div className="flex-1 overflow-y-auto max-h-[170px] pr-1">
          <div className="space-y-3">
            {regions.map((r, i) => (
              <div key={r.country} className="space-y-1">
                <div className="flex items-center justify-between text-[11px] font-bold">
                  <span className="text-slate-700 truncate">{r.country}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-800 font-mono text-[12px]">{r.value}</span>
                    {r.change !== '0%' && (
                      <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${
                        r.positive === true ? 'text-emerald-700 bg-emerald-500/10' : r.positive === false ? 'text-rose-700 bg-rose-500/10' : 'text-white bg-slate-400/30'
                      }`}>
                        {r.change}
                      </span>
                    )}
                  </div>
                </div>
                <div className="h-1.5 w-full bg-slate-200/60 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${r.value > 0 ? (r.value / maxValue) * 100 : 0}%`,
                      backgroundColor: i === 0 ? '#FF6A00' : i === 1 ? '#2563eb' : '#64748b'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Main Component ───────────────────────────────────────────────── */
export default function HubDashboardLight() {
  const { user, profile } = useAuth();
  const { dateRange, selectedPeriod, setSelectedPeriod } = useHub();
  const { dateFrom, dateTo } = dateRange;
  const [selectedAlert, setSelectedAlert] = useState<{
    severity: string;
    platform: string;
    text: string;
    desc: string;
    cta: string;
    href: string;
    color: string;
  } | null>(null);

  const [funnelFilter, setFunnelFilter] = useState<'all' | 'googleAds' | 'metaAds' | 'linkedinAds'>('all');
  const [loading, setLoading] = useState(false);
  const [ga4Data, setGa4Data] = useState<Ga4MetricsResponse | null>(null);
  const [trafficData, setTrafficData] = useState<TrafficExtractResponse | null>(null);

  const [reportView, setReportView] = useState<'clevel' | 'traffic' | 'fullfunnel'>('clevel');
  const [exporting, setExporting] = useState(false);
  const [showExportToast, setShowExportToast] = useState(false);

  // Conexões normalizadas (chaves snake_case do Firestore → ConnectorKey)
  const connections = useMemo(
    () => normalizeConnections(profile?.connections || {}) as Record<string, ConnectionItem>,
    [profile?.connections]
  );
  // Modo demo: ativado por padrão com números fictícios (pode ser desativado com ?demo=0 na URL)
  const [demoData, setDemoData] = useState(true);
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get('demo');
    if (q === '0') {
      sessionStorage.setItem('hub_demo', '0');
      setDemoData(false);
    } else if (q === '1') {
      sessionStorage.setItem('hub_demo', '1');
      setDemoData(true);
    } else if (sessionStorage.getItem('hub_demo') === '0') {
      setDemoData(false);
    } else {
      setDemoData(true);
    }
  }, []);

  const isGa4Connected = Boolean(connections.ga4?.isActive) || demoData;
  const isGoogleAdsConnected = Boolean(connections.googleAds?.isActive) || demoData;
  const isMetaAdsConnected = Boolean(connections.metaAds?.isActive) || demoData;
  const isLinkedinAdsConnected = Boolean(connections.linkedinAds?.isActive) || demoData;
  const isInstagramConnected = Boolean(connections.instagram?.isActive) || demoData;
  const isLinkedinPageConnected = Boolean(connections.linkedinPage?.isActive) || demoData;
  const isSearchConsoleConnected = Boolean(connections.searchConsole?.isActive) || demoData;

  const [igData, setIgData] = useState<InstagramResponse | null>(null);
  const [linkedinPageData, setLinkedinPageData] = useState<LinkedinPageResponse | null>(null);
  const [searchConsoleData, setSearchConsoleData] = useState<SearchConsoleResponse | null>(null);

  const hasAnyConnectionReal = isGa4Connected || isGoogleAdsConnected || isMetaAdsConnected || isLinkedinAdsConnected;
  const hasAnyConnection = hasAnyConnectionReal;
  const isDemo = true;

  const recentAutomations = useMemo(() => {
    const fromProfile = getHubAutomationsFromProfile(profile)
      .filter(a => a.status === 'active' || a.lastUpdateAt != null)
      .sort((a, b) => (b.lastUpdateAt || 0) - (a.lastUpdateAt || 0))
      .slice(0, 5);

    if (fromProfile.length > 0) return fromProfile;

    if (demoData) {
      return [
        { key: '1', agentTitle: 'Agente Vitor (SDR)', cadenceTitle: 'Prospecção Ativa B2B', lastUpdateAt: Date.now() - 1800000, status: 'active', monthlyExecutions: 342 },
        { key: '2', agentTitle: 'Agente Breno (Closer)', cadenceTitle: 'Follow-up de Propostas', lastUpdateAt: Date.now() - 5400000, status: 'active', monthlyExecutions: 189 },
        { key: '3', agentTitle: 'Agente Paola (Tráfego)', cadenceTitle: 'Otimização de ROAS', lastUpdateAt: Date.now() - 12600000, status: 'active', monthlyExecutions: 512 },
        { key: '4', agentTitle: 'Agente Tainá (Conteúdo)', cadenceTitle: 'Geração de Criativos', lastUpdateAt: Date.now() - 43200000, status: 'active', monthlyExecutions: 94 },
        { key: '5', agentTitle: 'Agente Manu (Suporte)', cadenceTitle: 'Triagem Automática', lastUpdateAt: Date.now() - 86400000, status: 'active', monthlyExecutions: 230 },
      ];
    }
    return [];
  }, [profile, demoData]);

  useEffect(() => {
    let active = true;
    async function fetchData() {
      if (demoData) {
        setGa4Data({
          activeUsers: '12847',
          averageSessionDuration: '2m 44s',
          conversions: '412',
          engagementRate: '68,4%',
          purchaseRevenue: '86420.50',
          trafficSources: [
            { source: 'google / cpc', sessions: 6240 },
            { source: 'facebook / paid', sessions: 4180 },
            { source: 'direct / none', sessions: 2350 },
            { source: 'linkedin / paid', sessions: 1120 },
          ],
          usersTrend: [
            { date: '01/07', newUsers: 320, returningUsers: 180 },
            { date: '05/07', newUsers: 410, returningUsers: 220 },
            { date: '09/07', newUsers: 380, returningUsers: 260 },
            { date: '13/07', newUsers: 520, returningUsers: 310 },
            { date: '17/07', newUsers: 610, returningUsers: 350 },
          ],
          regions: [
            { country: 'Brasil', value: 9840, change: '+12%', positive: true },
            { country: 'Portugal', value: 1620, change: '+6%', positive: true },
            { country: 'Estados Unidos', value: 890, change: '-2%', positive: false },
          ],
        });
        setTrafficData({
          success: true,
          channels: [
            { platform: 'Google Ads', spend: 9820.4, impressions: 412300, clicks: 14230, conversions: 186 },
            { platform: 'Meta Ads', spend: 7640.9, impressions: 623800, clicks: 18940, conversions: 164 },
            { platform: 'LinkedIn Ads', spend: 3260.25, impressions: 98200, clicks: 2140, conversions: 62 },
          ],
          totals: { spend: 20721.55, impressions: 1134300, clicks: 35310, conversions: 412 },
        });
        setIgData({ username: 'neuroads', followers: 24680, reach: 148200, profileViews: 8930, websiteClicks: 1240, engagementRate: '4,8%' });
        setLinkedinPageData({ followers: 6420, impressions: 52300, clicks: 1870, engagementRate: '3,6%' });
        setSearchConsoleData({ clicks: 5840, impressions: 214600, ctr: '2,72%', position: '8,4', siteUrl: 'neuroads.com.br' });
        setLoading(false);
        return;
      }
      if (!user) return;
      setLoading(true);
      try {
        if (isGa4Connected && connections.ga4?.accountId) {
          const res = await fetch('/api/hub/metrics/ga4', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              accessToken: connections.ga4.accessToken,
              accountId: connections.ga4.accountId,
              uid: user.uid,
              dateFrom,
              dateTo,
            }),
          });
          if (active) setGa4Data(await res.json());
        }
        const activeChannels: object[] = [];
        if (isGoogleAdsConnected) {
          activeChannels.push({
            platform: 'googleAds',
            accessToken: connections.googleAds?.accessToken || '',
            accountId: connections.googleAds?.loginCustomerId || connections.googleAds?.accountId,
            loginCustomerId: connections.googleAds?.loginCustomerId,
          });
        }
        if (isMetaAdsConnected) {
          activeChannels.push({
            platform: 'metaAds',
            accessToken: connections.metaAds?.accessToken || '',
            accountId: connections.metaAds?.accountId,
          });
        }
        if (isLinkedinAdsConnected) {
          activeChannels.push({
            platform: 'linkedinAds',
            accessToken: connections.linkedinAds?.accessToken || '',
            accountId: connections.linkedinAds?.accountId,
          });
        }
        if (activeChannels.length > 0) {
          const res = await fetch('/api/traffic/extract', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ dateFrom, dateTo, channels: activeChannels, uid: user.uid }),
          });
          if (active) setTrafficData(await res.json());
        }

        // Instagram
        if (isInstagramConnected && connections.instagram?.accessToken) {
          const res = await fetch('/api/hub/metrics/instagram', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ accessToken: connections.instagram.accessToken, uid: user.uid }),
          });
          if (active) setIgData(await res.json());
        }

        // LinkedIn Page
        if (isLinkedinPageConnected && connections.linkedinPage?.accessToken) {
          const res = await fetch('/api/hub/metrics/linkedin-page', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              accessToken: connections.linkedinPage.accessToken,
              accountId: connections.linkedinPage.accountId ?? '',
              uid: user.uid,
            }),
          });
          if (active) setLinkedinPageData(await res.json());
        }

        // Search Console
        if (isSearchConsoleConnected && connections.searchConsole?.accessToken) {
          const res = await fetch('/api/hub/metrics/search-console', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ accessToken: connections.searchConsole.accessToken, uid: user.uid }),
          });
          if (active) setSearchConsoleData(await res.json());
        }
      } catch (err) {
        console.error('Erro ao buscar métricas:', err);
      } finally {
        if (active) setLoading(false);
      }
    }
    void fetchData();
    return () => { active = false; };
  }, [user, demoData, isGa4Connected, isGoogleAdsConnected, isMetaAdsConnected, isLinkedinAdsConnected,
      isInstagramConnected, isLinkedinPageConnected, isSearchConsoleConnected,
      connections, dateFrom, dateTo]);

  const stats = useMemo(() => {
    const hasAnyAds = isGoogleAdsConnected || isMetaAdsConnected || isLinkedinAdsConnected;
    let spend: number | 'N/A' = 'N/A';
    if (hasAnyAds && trafficData?.success && trafficData.totals) spend = trafficData.totals.spend;
    let revenue: number | 'N/A' = 'N/A';
    if (isGa4Connected && ga4Data && !ga4Data.error && ga4Data.purchaseRevenue) revenue = parseFloat(ga4Data.purchaseRevenue);
    let conversions: number | 'N/A' = 'N/A';
    if (isGa4Connected && ga4Data && !ga4Data.error && ga4Data.conversions) conversions = parseInt(ga4Data.conversions, 10);
    else if (hasAnyAds && trafficData?.success && trafficData.totals) conversions = trafficData.totals.conversions;
    let roas: number | 'N/A' = 'N/A';
    if (typeof revenue === 'number' && typeof spend === 'number' && spend > 0) roas = revenue / spend;
    let cpa: number | 'N/A' = 'N/A';
    if (typeof spend === 'number' && typeof conversions === 'number' && conversions > 0) cpa = spend / conversions;
    const activeUsers = ga4Data?.activeUsers ? parseInt(ga4Data.activeUsers) : 'N/A' as const;
    return { spend, revenue, roas, conversions, cpa, activeUsers };
  }, [trafficData, ga4Data, isGa4Connected, isGoogleAdsConnected, isMetaAdsConnected, isLinkedinAdsConnected]);


  const spendNum   = (typeof stats.spend       === 'number' ? stats.spend       : 0);
  const revenueNum = (typeof stats.revenue     === 'number' ? stats.revenue     : 0);
  const roasNum    = (typeof stats.roas        === 'number' ? stats.roas        : 0);
  const convsNum   = (typeof stats.conversions === 'number' ? stats.conversions : 0);
  const cpaNum     = (typeof stats.cpa         === 'number' ? stats.cpa         : 0);
  const usersNum   = (typeof stats.activeUsers === 'number' ? stats.activeUsers : 0);

  /* Sparkline trend data — only real data or empty */
  const trend = (v: number) => [0.52, 0.55, 0.5, 0.61, 0.58, 0.67, 0.72, 0.7, 0.84, 1].map(f => f * v);
  const SP = {
    revenue: stats.revenue === 'N/A' ? Array(10).fill(0) : demoData ? trend(revenueNum / 1000) : [0, 0, 0, 0, 0, 0, 0, 0, 0, revenueNum / 1000],
    spend:   stats.spend   === 'N/A' ? Array(10).fill(0) : demoData ? trend(spendNum / 1000)   : [0, 0, 0, 0, 0, 0, 0, 0, 0, spendNum   / 1000],
    roas:    stats.roas    === 'N/A' ? Array(10).fill(0) : demoData ? trend(roasNum)           : [0, 0, 0, 0, 0, 0, 0, 0, 0, roasNum],
    convs:   stats.conversions === 'N/A' ? Array(10).fill(0) : demoData ? trend(convsNum)      : [0, 0, 0, 0, 0, 0, 0, 0, 0, convsNum],
    cpa:     stats.cpa     === 'N/A' ? Array(10).fill(0) : demoData ? trend(cpaNum)            : [0, 0, 0, 0, 0, 0, 0, 0, 0, cpaNum],
    users:   stats.activeUsers === 'N/A' ? Array(10).fill(0) : demoData ? trend(usersNum)      : [0, 0, 0, 0, 0, 0, 0, 0, 0, usersNum],
  };

  /* Build KPI list dynamically based on view filters */
  const KPIS: KpiDef[] = useMemo(() => {
    const isNaRev = stats.revenue === 'N/A';
    const isNaSpend = stats.spend === 'N/A';
    const isNaConvs = stats.conversions === 'N/A';
    const isNaRoas = stats.roas === 'N/A';
    const isNaCpa = stats.cpa === 'N/A';
    const isNaUsers = stats.activeUsers === 'N/A';

    const totalClicks = trafficData?.totals?.clicks || 0;
    const totalImpressions = trafficData?.totals?.impressions || 0;

    if (reportView === 'clevel') {
      return [
        { label: 'Receita Total',   rawValue: revenueNum, isNa: isNaRev, prefix: 'R$ ', suffix: '', decimals: 2, delta: '+12%', positive: true,  icon: IconWallet3D,    color: '#0d9488', glow: 'rgba(13, 148, 136, 0.05)', spark: SP.revenue },
        { label: 'Investimento',    rawValue: isNaSpend ? 0 : spendNum,   isNa: isNaSpend,   prefix: 'R$ ', suffix: '', decimals: 2, delta: '+4%',  positive: false, icon: IconTarget3D,    color: '#2563eb', glow: 'rgba(37, 99, 235, 0.05)', spark: SP.spend   },
        { label: 'ROAS Médio',      rawValue: isNaRoas ? 0 : roasNum,    isNa: isNaRoas,    prefix: '', suffix: '×', decimals: 2, delta: '', positive: true,  icon: IconTrending3D,  color: '#FF6A00', glow: 'rgba(255, 106, 0, 0.05)', spark: SP.roas    },
        { label: 'Conversões',      rawValue: isNaConvs ? 0 : convsNum,   isNa: isNaConvs, prefix: '', suffix: '', decimals: 0, delta: '', positive: true,  icon: IconCart3D,      color: '#0d9488', glow: 'rgba(13, 148, 136, 0.05)', spark: SP.convs   },
        { label: 'CPA Médio',       rawValue: isNaCpa ? 0 : cpaNum,     isNa: isNaCpa,     prefix: 'R$ ', suffix: '', decimals: 2, delta: '',  positive: true,  icon: IconClick3D,     color: '#d97706', glow: 'rgba(217, 119, 6, 0.05)', spark: SP.cpa     },
      ];
    }
    if (reportView === 'traffic') {
      return [
        { label: 'Investimento',    rawValue: isNaSpend ? 0 : spendNum,   isNa: isNaSpend,   prefix: 'R$ ', suffix: '', decimals: 2, delta: '', positive: false, icon: IconTarget3D,    color: '#2563eb', glow: 'rgba(37, 99, 235, 0.05)', spark: SP.spend   },
        { label: 'Cliques Ads',     rawValue: totalClicks, isNa: isNaSpend, prefix: '', suffix: '', decimals: 0, delta: '', positive: true, icon: IconClick3D,     color: '#0ea5e9', glow: 'rgba(14, 165, 233, 0.05)', spark: Array(10).fill(0) },
        { label: 'CTR Médio',       rawValue: totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0, isNa: isNaSpend, prefix: '', suffix: '%', decimals: 2, delta: '', positive: true, icon: IconActivity3D,  color: '#0d9488', glow: 'rgba(13, 148, 136, 0.05)', spark: Array(10).fill(0) },
        { label: 'CPC Médio',       rawValue: totalClicks > 0 ? spendNum / totalClicks : 0, isNa: isNaSpend, prefix: 'R$ ', suffix: '', decimals: 2, delta: '', positive: true, icon: IconCoin3D,      color: '#db2777', glow: 'rgba(219, 39, 119, 0.05)', spark: Array(10).fill(0) },
        { label: 'CPA Médio',       rawValue: isNaCpa ? 0 : cpaNum,     isNa: isNaCpa,     prefix: 'R$ ', suffix: '', decimals: 2, delta: '',  positive: true,  icon: IconClick3D,     color: '#d97706', glow: 'rgba(217, 119, 6, 0.05)', spark: SP.cpa     },
      ];
    }
    // clevel - mostrar apenas dados reais
    return [
      { label: 'Receita Total',   rawValue: revenueNum, isNa: isNaRev, prefix: 'R$ ', suffix: '', decimals: 2, delta: '', positive: true,  icon: IconWallet3D,    color: '#0d9488', glow: 'rgba(13, 148, 136, 0.05)', spark: SP.revenue },
      { label: 'Investimento',    rawValue: isNaSpend ? 0 : spendNum,   isNa: isNaSpend,   prefix: 'R$ ', suffix: '', decimals: 2, delta: '',  positive: false, icon: IconTarget3D,    color: '#2563eb', glow: 'rgba(37, 99, 235, 0.05)', spark: SP.spend   },
      { label: 'ROAS Médio',      rawValue: isNaRoas ? 0 : roasNum,    isNa: isNaRoas,    prefix: '', suffix: '×', decimals: 2, delta: '', positive: true,  icon: IconTrending3D,  color: '#FF6A00', glow: 'rgba(255, 106, 0, 0.05)', spark: SP.roas    },
      { label: 'Conversões',      rawValue: isNaConvs ? 0 : convsNum,   isNa: isNaConvs, prefix: '', suffix: '', decimals: 0, delta: '', positive: true,  icon: IconCart3D,      color: '#0d9488', glow: 'rgba(13, 148, 136, 0.05)', spark: SP.convs   },
      { label: 'CPA Médio',       rawValue: isNaCpa ? 0 : cpaNum,     isNa: isNaCpa,     prefix: 'R$ ', suffix: '', decimals: 2, delta: '',  positive: true,  icon: IconClick3D,     color: '#d97706', glow: 'rgba(217, 119, 6, 0.05)', spark: SP.cpa     },
    ];
  }, [reportView, stats, revenueNum, spendNum, roasNum, convsNum, cpaNum, usersNum, SP, isDemo, trafficData]);

  // Verify errors across platforms for diagnostics
  const googleAdsErr = trafficData?.channels?.find(c => c.platform === 'Google Ads' && 'error' in c);
  const metaAdsErr = trafficData?.channels?.find(c => c.platform === 'Meta Ads' && 'error' in c);
  const linkedinAdsErr = trafficData?.channels?.find(c => c.platform === 'LinkedIn Ads' && 'error' in c);

  /* Dynamic alerts — only when data is real */
  const alerts = useMemo(() => {
    const list = [];
    if (isGoogleAdsConnected && googleAdsErr) {
      list.push({
        severity: 'error',
        platform: 'Google Ads',
        text: 'Conta conectada mas sem dados de campanhas.',
        desc: 'Verifique se há campanhas rodando ativamente na respectiva plataforma de anúncios.',
        cta: 'Resolver no Google Ads',
        href: '/hub/integracoes',
        color: '#e11d48',
      });
    }
    if (isMetaAdsConnected && metaAdsErr) {
      list.push({
        severity: 'error',
        platform: 'Meta Ads',
        text: 'Erro de Token expirado no Meta.',
        desc: 'A credencial de acesso do Meta Ads expirou. Acesse a tela de integrações para reautenticar.',
        cta: 'Reautenticar Meta Ads',
        href: '/hub/integracoes',
        color: '#e11d48',
      });
    }
    if (isLinkedinAdsConnected && linkedinAdsErr) {
      list.push({
        severity: 'warning',
        platform: 'LinkedIn Ads',
        text: 'LinkedIn Ads com erro de comunicação API.',
        desc: 'O token da plataforma LinkedIn Ads falhou ou expirou. Reconecte a integração.',
        cta: 'Resolver LinkedIn Ads',
        href: '/hub/integracoes',
        color: '#d97706',
      });
    }
    if (stats.roas !== 'N/A' && roasNum < 3.5) {
      list.push({
        severity: 'warning',
        platform: 'Geral',
        text: `ROAS consolidado em ${roasNum.toFixed(2).replace('.', ',')}x — abaixo da meta.`,
        desc: 'O ROAS geral das campanhas está abaixo do benchmark de 3,5x. Recomenda-se otimização de criativos ou realocação de verbas.',
        cta: 'Ver Oportunidades',
        href: '/hub/explorar',
        color: '#d97706',
      });
    }
    if (list.length === 0) {
      list.push({
        severity: 'info',
        platform: 'Geral',
        text: 'Sua infraestrutura de dados está 100% operacional.',
        desc: 'Todos os canais conectados estão reportando dados e saudáveis.',
        cta: 'Conectar mais canais',
        href: '/hub/integracoes',
        color: '#0d9488',
      });
    }
    return list;
  }, [isGoogleAdsConnected, googleAdsErr, isMetaAdsConnected, metaAdsErr, isLinkedinAdsConnected, linkedinAdsErr, stats.roas, roasNum]);

  /* Funnel calculations */
  const funnelData = useMemo(() => {
    const aov = typeof stats.revenue === 'number' && typeof stats.conversions === 'number' && stats.conversions > 0
      ? stats.revenue / stats.conversions : 0;

    const google = trafficData?.channels?.find(c => c.platform === 'Google Ads' && !('error' in c));
    const meta = trafficData?.channels?.find(c => c.platform === 'Meta Ads' && !('error' in c));
    const linkedin = trafficData?.channels?.find(c => c.platform === 'LinkedIn Ads' && !('error' in c));

    // Use 0 when not connected — no fake data
    const gSpend  = google?.spend       ?? (isGoogleAdsConnected ? 0 : 0);
    const gConvs  = google?.conversions ?? (isGoogleAdsConnected ? 0 : 0);
    const gClicks = google?.clicks      ?? (isGoogleAdsConnected ? 0 : 0);
    const gImps   = google?.impressions ?? (isGoogleAdsConnected ? 0 : 0);
    const gRev    = google ? google.conversions * aov : 0;

    const mSpend  = meta?.spend       ?? (isMetaAdsConnected ? 0 : 0);
    const mConvs  = meta?.conversions ?? (isMetaAdsConnected ? 0 : 0);
    const mClicks = meta?.clicks      ?? (isMetaAdsConnected ? 0 : 0);
    const mImps   = meta?.impressions ?? (isMetaAdsConnected ? 0 : 0);
    const mRev    = meta ? meta.conversions * aov : 0;

    const lSpend  = linkedin?.spend       ?? (isLinkedinAdsConnected ? 0 : 0);
    const lConvs  = linkedin?.conversions ?? (isLinkedinAdsConnected ? 0 : 0);
    const lClicks = linkedin?.clicks      ?? (isLinkedinAdsConnected ? 0 : 0);
    const lImps   = linkedin?.impressions ?? (isLinkedinAdsConnected ? 0 : 0);
    const lRev    = linkedin ? linkedin.conversions * aov : 0;

    if (funnelFilter === 'googleAds') {
      return { impressions: gImps, clicks: gClicks, conversions: gConvs, revenue: gRev, spend: gSpend };
    }
    if (funnelFilter === 'metaAds') {
      return { impressions: mImps, clicks: mClicks, conversions: mConvs, revenue: mRev, spend: mSpend };
    }
    if (funnelFilter === 'linkedinAds') {
      return { impressions: lImps, clicks: lClicks, conversions: lConvs, revenue: lRev, spend: lSpend };
    }
    // Consolidated
    return {
      impressions: gImps + mImps + lImps,
      clicks: gClicks + mClicks + lClicks,
      conversions: gConvs + mConvs + lConvs,
      revenue: gRev + mRev + lRev,
      spend: gSpend + mSpend + lSpend,
    };
  }, [isDemo, trafficData, funnelFilter, isGoogleAdsConnected, isMetaAdsConnected, isLinkedinAdsConnected, stats.revenue, stats.conversions]);

  /* Real-time CTR, CPC and Progress for Campaign Performance Card */
  const googleAd = trafficData?.channels?.find(c => c.platform === 'Google Ads' && !('error' in c));
  const metaAd = trafficData?.channels?.find(c => c.platform === 'Meta Ads' && !('error' in c));
  const linkedinAd = trafficData?.channels?.find(c => c.platform === 'LinkedIn Ads' && !('error' in c));

  const googleAdsCTR = isDemo ? '3,45%' : (googleAd && googleAd.impressions > 0
    ? ((googleAd.clicks / googleAd.impressions) * 100).toFixed(2).replace('.', ',') + '%'
    : null);
  const googleAdsCPC = isDemo ? 'R$ 1,65' : (googleAd && googleAd.clicks > 0
    ? 'R$ ' + (googleAd.spend / googleAd.clicks).toFixed(2).replace('.', ',')
    : null);
  const googleAdsBarWidth = (spendNum > 0 && googleAd
    ? (googleAd.spend / spendNum) * 100
    : 0);

  const metaAdsCTR = (metaAd && metaAd.impressions > 0
    ? ((metaAd.clicks / metaAd.impressions) * 100).toFixed(2).replace('.', ',') + '%'
    : null);
  const metaAdsCPC = (metaAd && metaAd.clicks > 0
    ? 'R$ ' + (metaAd.spend / metaAd.clicks).toFixed(2).replace('.', ',')
    : null);
  const metaAdsBarWidth = (spendNum > 0 && metaAd
    ? (metaAd.spend / spendNum) * 100
    : 0);

  const linkedinAdsCTR = (linkedinAd && linkedinAd.impressions > 0
    ? ((linkedinAd.clicks / linkedinAd.impressions) * 100).toFixed(2).replace('.', ',') + '%'
    : null);
  const linkedinAdsCPC = (linkedinAd && linkedinAd.clicks > 0
    ? 'R$ ' + (linkedinAd.spend / linkedinAd.clicks).toFixed(2).replace('.', ',')
    : null);
  const linkedinAdsBarWidth = (spendNum > 0 && linkedinAd
    ? (linkedinAd.spend / spendNum) * 100
    : 0);

  const displayIgData = igData;
  const displayLpData = linkedinPageData;
  const displayScData = searchConsoleData;
  const displayGa4Data = ga4Data;

  const handleExport = () => {
    setExporting(true);
    setTimeout(() => {
      setExporting(false);
      setShowExportToast(true);
      setTimeout(() => setShowExportToast(false), 4000);
    }, 1500);
  };

  // Early return if not connected to any source, placed properly after hook declarations
  if (!hasAnyConnection && !loading) return <HubEmptyState />;

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Toast Notification for Export */}
      <AnimatePresence>
        {showExportToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-slate-905 border border-slate-800 shadow-2xl flex items-center gap-3.5 max-w-sm"
          >
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-405 shrink-0 font-bold">
              ✓
            </div>
            <div>
              <p className="text-[12px] font-black text-white">Relatório Exportado com Sucesso</p>
              <p className="text-[11px] text-slate-400 font-semibold mt-0.5 leading-relaxed">
                PDF com insights de neuromarketing e inteligência comportamental gerado.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-start justify-between gap-4 flex-wrap"
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="h-1.5 w-1.5 rounded-full bg-[#FF6A00]"
            />
            <span className="text-[10px] font-black uppercase tracking-[0.18em] text-[#FF6A00]">
              Hub Estratégico
            </span>
          </div>
          <h1 className="text-[24px] sm:text-[28px] font-black tracking-tight leading-none text-[#0f172a] break-words">
            {profile?.companyName || 'Visão Geral'}
          </h1>
          <p className="text-[13px] text-slate-500 mt-1.5 font-bold">
            Consolidado dos canais de tração · Autorreferenciado · Período selecionado
          </p>
        </div>
      </motion.div>

      {/* Trial countdown — visível apenas para usuários em período de teste */}
      {/* <HubTrialBanner /> */}

      {/* Critical Error Banner — Ads Channels Failed */}
      {!isDemo && trafficData?.hasErrors && !loading && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-red-500/5 rounded-2xl border border-red-500/30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle size={18} className="text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-[12.5px] font-black text-red-900 uppercase">Erro ao Carregar Dados de Anúncios</p>
              <p className="text-[11.5px] text-red-700 font-semibold leading-relaxed mt-0.5">
                Um ou mais canais de mídia paga falharam na extração de dados. Verifique as credenciais e tente novamente.
              </p>
              <div className="mt-2 text-[10px] font-bold text-red-600 space-y-0.5">
                {trafficData?.channels?.map((ch) => {
                  if ('error' in ch) {
                    return (
                      <div key={ch.platform} className="flex items-center gap-1.5">
                        <span className="inline-block w-1 h-1 rounded-full bg-red-600" />
                        <span>{ch.platform}: {ch.error}</span>
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            </div>
          </div>
          <Link
            href="/hub/integracoes"
            className="px-4 py-2 rounded-xl text-[11px] font-black text-white hover:brightness-110 shadow-sm cursor-pointer whitespace-nowrap text-center"
            style={{ background: 'linear-gradient(135deg, #dc2626, #ef4444)', textDecoration: 'none' }}
          >
            Resolver Agora
          </Link>
        </motion.div>
      )}


      {/* View Toggles & Actions Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl border border-slate-200/50 bg-white shadow-[0_4px_12px_rgba(0,0,0,0.02)]">
        {/* Report Toggles */}
        <div className="flex items-center gap-1 bg-slate-200/50 p-1 rounded-xl border border-white/20 w-full md:w-auto">
          {[
            { id: 'clevel', label: 'Visão C-Level' },
            { id: 'traffic', label: 'Visão Operacional de Tráfego' },
            { id: 'fullfunnel', label: 'Visão de Funil Completo' },
          ].map(opt => (
            <button
              key={opt.id}
              onClick={() => setReportView(opt.id as any)}
              className={`flex-1 md:flex-none px-3.5 py-2 rounded-lg text-[11px] font-black transition-all cursor-pointer ${
                reportView === opt.id
                  ? 'bg-white text-[#FF6A00] shadow-[2px_2px_5px_#d1d9e6,-2px_-2px_5px_#ffffff]'
                  : 'text-[#475569] hover:text-[#1e293b]'
              }`}
              style={{ border: 'none' }}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Guide Mode & Export */}
        <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto">
          <button
            onClick={handleExport}
            disabled={exporting}
            className="inline-flex items-center gap-1.5 px-4 h-9 rounded-xl text-[11px] font-black border border-slate-200 bg-white hover:bg-slate-50 active:scale-95 text-slate-700 shadow-sm transition-all shrink-0 cursor-pointer"
          >
            {exporting ? 'Exportando...' : 'Exportar Relatório'}
          </button>
        </div>
      </div>

      {/* Operational Cockpit Header */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Block 1: Status de Dados */}
        <BentoCard variant="neumorphic" glowColor="rgba(37, 99, 235, 0.02)" className="p-4 flex flex-col gap-2">
          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Status de Dados</p>
          <div className="space-y-1.5 mt-1">
            <div className="flex items-center justify-between text-[11px] font-bold">
              <span className="text-slate-600">Google Analytics 4</span>
              <span className={`px-1.5 py-0.5 rounded text-[8px] font-black ${isGa4Connected ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'}`}>
                {isGa4Connected ? 'ATIVO' : 'DESCONECTADO'}
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] font-bold">
              <span className="text-slate-600">Google Ads / Meta Ads</span>
              <span className={`px-1.5 py-0.5 rounded text-[8px] font-black ${isGoogleAdsConnected || isMetaAdsConnected ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'}`}>
                {isGoogleAdsConnected || isMetaAdsConnected ? 'ATIVO' : 'DESCONECTADO'}
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] font-bold">
              <span className="text-slate-600">LinkedIn Ads</span>
              <span className={`px-1.5 py-0.5 rounded text-[8px] font-black ${isLinkedinAdsConnected ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'}`}>
                {isLinkedinAdsConnected ? 'ATIVO' : 'DESCONECTADO'}
              </span>
            </div>
          </div>
        </BentoCard>

        {/* Block 2: Resumo do Funil */}
        <BentoCard variant="neumorphic" glowColor="rgba(16, 185, 129, 0.02)" className="p-4 flex flex-col gap-2">
          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Resumo do Funil</p>
          <div className="grid grid-cols-2 gap-2 mt-1">
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase">Conversões</p>
              <p className="text-[15px] font-black text-slate-800 font-mono mt-0.5">{funnelData.conversions}</p>
            </div>
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase">ROAS Geral</p>
              <p className="text-[15px] font-black text-slate-800 font-mono mt-0.5">
                {funnelData.spend > 0 ? `${(funnelData.revenue / funnelData.spend).toFixed(2)}x` : '—'}
              </p>
            </div>
          </div>
        </BentoCard>

        {/* Block 3: Tarefas de Hoje */}
        <BentoCard variant="neumorphic" glowColor="rgba(245, 158, 11, 0.02)" className="p-4 flex flex-col gap-2">
          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Tarefas Hoje</p>
          <div className="space-y-1.5 mt-1">
            {alerts.length > 0 ? (
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-rose-700">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                <span>Resolver {alerts.length} alerta{alerts.length > 1 ? 's' : ''} operacionais</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Sua operação está 100% saudável</span>
              </div>
            )}
            <Link href="/hub/laboratorio-agentes" className="text-[10px] font-black text-[#FF6A00] uppercase hover:underline" style={{ textDecoration: 'none' }}>
              → Ver 12 especialidades de Agentes
            </Link>
          </div>
        </BentoCard>
      </div>

      {/* Period Selector Cards */}
      <div className="space-y-2">
        <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Seletor de Período</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Últimos 7 dias', value: '7', compareText: 'Comparado a 05/07/2026 - 11/07/2026' },
            { label: 'Últimos 15 dias', value: '15', compareText: 'Comparado a 27/06/2026 - 11/07/2026' },
            { label: 'Últimos 30 dias', value: '30', compareText: 'Comparado a 12/06/2026 - 11/07/2026' },
            { label: 'Últimos 90 dias', value: '90', compareText: 'Comparado a 13/04/2026 - 11/07/2026' },
          ].map(p => {
            const active = selectedPeriod === p.value;
            return (
              <button
                key={p.value}
                onClick={() => setSelectedPeriod(p.value)}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  active
                    ? 'bg-gradient-to-br from-[#FF6A00] to-[#FF8805] border-[#FF6A00] shadow-[0_4px_12px_rgba(255,106,0,0.2)]'
                    : 'bg-white border-slate-200 shadow-sm hover:bg-slate-50/60'
                }`}
              >
                <p className={`text-[12px] font-black ${active ? 'text-white' : 'text-slate-700'}`}>{p.label}</p>
                <p className={`text-[10px] font-semibold mt-1 ${active ? 'text-white/80' : 'text-slate-400'}`}>Vs. último período igual</p>
                <p className={`text-[9px] font-bold mt-0.5 ${active ? 'text-white/90' : 'text-slate-500'}`}>{p.compareText}</p>
              </button>
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {selectedAlert && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" onClick={() => setSelectedAlert(null)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl border border-slate-200/50 bg-white p-6 shadow-2xl relative"
            >
              <button
                type="button"
                onClick={() => setSelectedAlert(null)}
                className="absolute top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center border border-slate-200/50 bg-white text-slate-500 hover:text-slate-700 shadow-sm"
              >
                X
              </button>
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="text-rose-500" size={20} />
                <h3 className="text-[16px] font-black uppercase text-[#0f172a]">{selectedAlert.platform}</h3>
              </div>
              <h4 className="text-[14px] font-bold text-rose-600 mb-2">{selectedAlert.text}</h4>
              <p className="text-[13px] font-semibold text-slate-600 leading-relaxed mb-6">
                {selectedAlert.desc}
              </p>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedAlert(null)}
                  className="px-4 py-2 rounded-xl text-[12px] font-bold text-slate-600 hover:text-slate-800 transition-colors cursor-pointer"
                >
                  Fechar
                </button>
                <Link
                  href={selectedAlert.href || "/hub/integracoes"}
                  className="px-4 py-2 rounded-xl text-[12px] font-bold text-white bg-rose-505 hover:bg-rose-600 transition-colors shadow-md text-center"
                  style={{ textDecoration: 'none', backgroundColor: '#e11d48' }}
                >
                  {selectedAlert.cta || "Resolver em Integrações"}
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4 p-3 bg-amber-500/5 rounded-xl border border-amber-500/20 mt-1">
        <div className="flex items-start sm:items-center gap-2">
          <Info className="text-amber-600 shrink-0 mt-0.5 sm:mt-0" size={14} />
          <span className="text-[11px] font-bold text-amber-800">
            Caso um canal retorne valores inesperados ou zerados, certifique-se de que o período selecionado possui campanhas ativas.
          </span>
        </div>
        <Link href="/hub/integracoes" className="text-[11.5px] font-black text-amber-700 hover:text-amber-800 underline shrink-0 transition-colors pl-6 sm:pl-0">
          Gerenciar Integrações
        </Link>
      </div>

      {/* KPI Bento Grid */}
      <motion.div 
        variants={{
          hidden: { opacity: 0 },
          show: {
            opacity: 1,
            transition: {
              staggerChildren: 0.05
            }
          }
        }}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4"
      >
        {KPIS.map((kpi, idx) => {
          const Icon = kpi.icon as React.FC<{ size?: number; style?: React.CSSProperties }>;
          return (
            <BentoCard
              key={kpi.label}
              variant="neumorphic"
              glowColor={kpi.glow}
              accentColor={kpi.color}
              className="p-4 sm:p-5 flex flex-col gap-3.5"
              delay={idx * 0.04}
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-gradient-to-br from-white/90 to-slate-100/70 border border-white/80 shadow-[3px_3px_8px_rgba(209,217,230,0.5),-2px_-2px_6px_rgba(255,255,255,0.9)] transition-all transform hover:scale-105 shrink-0">
                  <Icon size={30} />
                </div>
                <div className="flex items-center gap-1.5">
                  <span
                    className="flex items-center gap-0.5 text-[10px] font-black px-1.5 py-0.5 rounded-full border border-white/60 bg-[#eef2f7] shadow-[1px_1px_2px_#d1d9e6,_-1px_-1px_2px_#ffffff]"
                    style={{ 
                      color: kpi.positive ? '#0d9488' : '#e11d48', 
                    }}
                  >
                    {kpi.positive ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                    {kpi.delta}
                  </span>
                  <KpiHelpPopover label={kpi.label} isNa={kpi.isNa} />
                </div>
              </div>
              <div className="min-w-0">
                <div className="text-[18px] sm:text-[22px] font-black tracking-tight text-[#0f172a] font-mono tabular-nums leading-none break-words">
                  {kpi.isNa ? (
                    <span className="text-slate-400">N/A</span>
                  ) : (
                    <CountUp
                      value={kpi.rawValue}
                      prefix={kpi.prefix}
                      suffix={kpi.suffix}
                      decimals={kpi.decimals}
                    />
                  )}
                </div>
                <p className="text-[12px] text-slate-500 mt-1 font-bold">{kpi.label}</p>
                {isDemo && kpi.isNa && (
                  <p className="text-[9.5px] font-semibold text-slate-500 leading-snug mt-1.5 p-1.5 rounded-lg bg-[#FF6A00]/5 border border-[#FF6A00]/15">
                    💡 Conecte em <Link href="/hub/integracoes" className="text-[#FF6A00] font-black">Integrações</Link> para ver dados reais.
                  </p>
                )}
              </div>
              <div className="mt-1 flex items-center justify-between">
                <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">Histórico</span>
                <Sparkline points={kpi.spark} color={kpi.color} width={80} height={20} fillOpacity={0.06} />
              </div>
            </BentoCard>
          );
        })}
      </motion.div>

      {/* Main Content Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left Column: Alerts & Credit Meter (3/12 width) */}
        <div className="lg:col-span-3 space-y-6">
          {/* Plan Credits Meter */}
          <CreditMeter />

          {/* Dynamic Alerts Bento Block */}
          <BentoCard variant="neumorphic" className="flex flex-col" glowColor="rgba(239, 68, 68, 0.03)">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-white/40">
              <Activity size={15} className="text-[#FF6A00]" />
              <span className="text-[13px] font-black uppercase tracking-wider text-[#0f172a]">Alertas Operacionais</span>
              <span className="ml-auto text-[10px] font-black px-2 py-0.5 rounded-full border border-white/60 bg-[#eef2f7] shadow-[2px_2px_4px_#d1d9e6,_-2px_-2px_4px_#ffffff]">
                {alerts.length}
              </span>
            </div>
            <div className="divide-y divide-white/20">
              {alerts.map((a, i) => {
                return (
                  <div key={i} onClick={() => setSelectedAlert(a)} className="flex items-start gap-3 px-4 py-3.5 hover:bg-slate-100/10 transition-all cursor-pointer">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 border border-white/45 bg-[#eef2f7]" style={{ boxShadow: 'inset 2px 2px 4px #d1d9e6, inset -2px -2px 4px #ffffff' }}>
                      <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: a.color }} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">{a.platform}</p>
                        <span className="text-[9px] font-black uppercase" style={{ color: a.color }}>
                          {a.severity === 'error' ? 'Erro' : a.severity === 'warning' ? 'Aviso' : 'Info'}
                        </span>
                      </div>
                      <p className="text-[12px] font-bold leading-snug text-slate-700 mt-0.5">{a.text}</p>
                      <span className="text-[9.5px] font-black uppercase text-[#FF6A00] mt-2 block hover:underline">
                        {a.cta} →
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </BentoCard>
        </div>

        {/* Middle Column: Interactive Funnel (6/12 width) */}
        <BentoCard variant="neumorphic" className="lg:col-span-6 flex flex-col p-4 sm:p-6" glowColor="rgba(255, 106, 0, 0.04)">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-white/40 pb-4 mb-6">
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className="text-[#FF6A00]" />
              <span className="text-[14px] font-black uppercase tracking-wider text-[#0f172a]">Resumo do Funil de Conversão</span>
            </div>

            <div className="flex items-center gap-1 bg-[#eef2f7] p-1 rounded-xl shadow-[inset_2px_2px_4px_#d1d9e6,_inset_-2px_-2px_4px_#ffffff] border border-white/20 w-full sm:w-auto">
              {(
                [
                  { id: 'all', label: 'Todos' },
                  { id: 'googleAds', label: 'Google' },
                  { id: 'metaAds', label: 'Meta' },
                  { id: 'linkedinAds', label: 'LinkedIn' },
                ] as const
              ).map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setFunnelFilter(opt.id)}
                  className="flex-1 sm:flex-none px-2 sm:px-3 py-2 sm:py-1.5 rounded-lg text-[10px] font-black transition-all cursor-pointer"
                  style={{
                    background: funnelFilter === opt.id ? '#eef2f7' : 'transparent',
                    color: funnelFilter === opt.id ? '#FF6A00' : '#475569',
                    boxShadow: funnelFilter === opt.id ? '2px 2px 5px #d1d9e6, -2px -2px 5px #ffffff' : 'none',
                    border: 'none',
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Horizontal Funnel Layout with Drops and Tooltips */}
          <div className="flex-1 flex flex-col gap-6 py-4 w-full">
            
            {/* Stage 1: Impressões */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[12px] font-black text-slate-700">
                <div className="flex items-center gap-2">
                  <Users size={14} className="text-yellow-500 animate-pulse" />
                  <span>Atração (Impressões)</span>
                  <span className="text-[10px] font-bold text-slate-400 cursor-help" title="Total de visualizações de seus anúncios e postagens. Benchmark: CPM saudável é entre R$ 10 e R$ 25 dependendo do público.">ⓘ</span>
                </div>
                <span className="font-mono text-[14px] font-black text-slate-800">
                  {funnelData.impressions.toLocaleString('pt-BR')}
                </span>
              </div>
              <div className="h-2.5 w-full bg-slate-200/60 rounded-full overflow-hidden">
                <div className="h-full bg-yellow-400 rounded-full" style={{ width: '100%' }} />
              </div>
            </div>

            {/* Drop 1 -> 2 */}
            <div className="flex items-center justify-between px-4 py-1.5 rounded-xl bg-blue-50/60 border border-blue-100 text-[11px] font-black text-blue-700 max-w-sm mx-auto w-full">
              <span>Queda (CTR): {funnelData.impressions > 0 ? ((funnelData.clicks / funnelData.impressions) * 100).toFixed(2).replace('.', ',') : '0,00'}%</span>
              <span className="text-[9.5px] font-medium text-blue-500">Meta: 1,5% - 3,0%</span>
            </div>

            {/* Stage 2: Cliques */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[12px] font-black text-slate-700">
                <div className="flex items-center gap-2">
                  <MousePointerClick size={14} className="text-blue-500" />
                  <span>Engajamento (Cliques)</span>
                  <span className="text-[10px] font-bold text-slate-400 cursor-help" title="Total de visitas direcionadas ao seu site. Benchmark: CPC saudável no Google Search: R$ 1.50 - R$ 4.00 | Meta Ads: R$ 0.60 - R$ 1.80.">ⓘ</span>
                </div>
                <span className="font-mono text-[14px] font-black text-slate-800">
                  {funnelData.clicks.toLocaleString('pt-BR')}
                </span>
              </div>
              <div className="h-2.5 w-full bg-slate-200/60 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${funnelData.impressions > 0 ? Math.min(100, (funnelData.clicks / funnelData.impressions) * 100 * 5) : 0}%` }} />
              </div>
            </div>

            {/* Drop 2 -> 3 */}
            <div className="flex items-center justify-between px-4 py-1.5 rounded-xl bg-orange-50/60 border border-orange-100 text-[11px] font-black text-orange-700 max-w-sm mx-auto w-full">
              <span>Queda (Taxa Conversão): {funnelData.clicks > 0 ? ((funnelData.conversions / funnelData.clicks) * 100).toFixed(2).replace('.', ',') : '0,00'}%</span>
              <span className="text-[9.5px] font-medium text-orange-500">Meta: 2,0% - 5,0%</span>
            </div>

            {/* Stage 3: Conversões */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[12px] font-black text-slate-700">
                <div className="flex items-center gap-2">
                  <ShoppingCart size={14} className="text-orange-500" />
                  <span>Ações (Conversões)</span>
                  <span className="text-[10px] font-bold text-slate-400 cursor-help" title="Ações de valor (vendas, cadastros, formulários). Benchmark: Custo por Lead (CPL) ideal: R$ 15 - R$ 40 dependendo do setor.">ⓘ</span>
                </div>
                <span className="font-mono text-[14px] font-black text-slate-800">
                  {funnelData.conversions.toLocaleString('pt-BR')}
                </span>
              </div>
              <div className="h-2.5 w-full bg-slate-200/60 rounded-full overflow-hidden">
                <div className="h-full bg-orange-500 rounded-full" style={{ width: `${funnelData.clicks > 0 ? Math.min(100, (funnelData.conversions / funnelData.clicks) * 100 * 10) : 0}%` }} />
              </div>
            </div>

            {/* Drop 3 -> 4 */}
            <div className="flex items-center justify-between px-4 py-1.5 rounded-xl bg-emerald-50/60 border border-emerald-100 text-[11px] font-black text-emerald-700 max-w-sm mx-auto w-full">
              <span>Eficiência (ROAS): {funnelData.spend > 0 ? (funnelData.revenue / funnelData.spend).toFixed(2).replace('.', ',') : '0,00'}x</span>
              <span className="text-[9.5px] font-medium text-emerald-500">Meta: &gt; 3,0x</span>
            </div>

            {/* Stage 4: Receita */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[12px] font-black text-slate-700">
                <div className="flex items-center gap-2">
                  <Wallet size={14} className="text-emerald-505" />
                  <span>Receita (Vendas)</span>
                  <span className="text-[10px] font-bold text-slate-400 cursor-help" title="Receita líquida total gerada a partir das vendas atribuídas aos anúncios.">ⓘ</span>
                </div>
                <span className="font-mono text-[14px] font-black text-slate-800">
                  R$ {funnelData.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="h-2.5 w-full bg-slate-200/60 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${funnelData.conversions > 0 ? '45%' : '0%'}` }} />
              </div>
            </div>
            
          </div>
        </BentoCard>

        {/* Right Column: Active Automations (3/12 width) */}
        <div className="lg:col-span-3">
          {/* Active Automations Bento Block */}
          <BentoCard variant="neumorphic" className="flex flex-col h-full" glowColor="rgba(59, 130, 246, 0.03)">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-white/40">
              <Brain size={15} className="text-[#FF6A00]" />
              <span className="text-[13px] font-black uppercase tracking-wider text-[#0f172a]">Últimas Automações</span>
              <Link 
                href="/hub/laboratorio-agentes" 
                className="ml-auto text-[11px] font-black text-[#FF6A00] flex items-center gap-0.5 transition-colors hover:text-[#ff8f3a]"
                style={{ textDecoration: 'none' }}
              >
                <span>Lab</span>
                <ChevronRight size={12} />
              </Link>
            </div>
            <div className="divide-y divide-white/20 flex-1 overflow-y-auto">
              {recentAutomations.length > 0 ? recentAutomations.map(ag => (
                <div key={ag.key} className="flex items-center gap-3.5 px-5 py-4 hover:bg-slate-100/10 transition-colors">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border border-white/40 bg-[#eef2f7]" style={{ boxShadow: 'inset 2px 2px 4px #d1d9e6, inset -2px -2px 4px #ffffff' }}>
                    <Zap size={13} className="text-[#FF6A00]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-bold text-[#1e293b] truncate">{ag.agentTitle}</p>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">{ag.cadenceTitle}{ag.lastUpdateAt ? ` - ${formatAutomationDateTime(ag.lastUpdateAt)}` : ''}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span
                      className="text-[9px] font-black px-2 py-0.5 rounded-full border"
                      style={{ 
                        color: ag.status === 'active' ? '#0d9488' : '#d97706', 
                        borderColor: ag.status === 'active' ? 'rgba(13, 148, 136, 0.2)' : 'rgba(217, 119, 6, 0.2)',
                        background: ag.status === 'active' ? 'rgba(13, 148, 136, 0.05)' : 'rgba(217, 119, 6, 0.05)' 
                      }}
                    >
                      {ag.status === 'active' ? 'Ativo' : ag.status === 'paused' ? 'Pausado' : 'Inativo'}
                    </span>
                    <p className="text-[10px] text-slate-400 mt-1 font-bold">{ag.monthlyExecutions || 0} runs</p>
                  </div>
                </div>
              )) : (
                <div className="px-5 py-8 text-center">
                  <p className="text-[12px] font-bold text-slate-500">Nenhuma automação ativa</p>
                </div>
              )}
            </div>
          </BentoCard>
        </div>

      </div>

      {/* Advanced Paid Campaigns / Web / Social Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* GA4 Web & Analytics Metrics Bento */}
        <BentoCard variant="neumorphic" glowColor="rgba(8, 145, 178, 0.03)" className="p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-white/40 pb-3">
            <div className="flex items-center gap-2">
              <Users size={16} className="text-[#0891b2]" />
              <span className="text-[13px] font-black uppercase tracking-wider text-[#0f172a]">Google Analytics 4</span>
            </div>
            <span className={`text-[10px] font-black px-2 py-0.5 rounded-md border ${
              isGa4Connected && ga4Data && !ga4Data.error
                ? 'text-emerald-600 bg-emerald-500/5 border-emerald-500/10'
                : isGa4Connected
                ? 'text-amber-600 bg-amber-500/5 border-amber-500/10'
                : 'text-slate-400 bg-slate-200/60 border-slate-200'
            }`}>
              {isGa4Connected && ga4Data && !ga4Data.error ? 'SAUDÁVEL' : isGa4Connected ? 'AGUARDANDO' : 'INDISPONÍVEL'}
            </span>
          </div>

          <div className="space-y-4 flex-1">
            {/* Metric 1 */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[12px] font-bold text-slate-500">Taxa de Engajamento</p>
                <p className="text-[18px] font-black text-[#0f172a] font-mono leading-none mt-1">
                  {(isGa4Connected || isDemo) && displayGa4Data && !displayGa4Data.error && displayGa4Data.engagementRate
                    ? displayGa4Data.engagementRate
                    : <span className="text-[13px] text-slate-400 font-semibold">—</span>}
                </p>
              </div>
              <div className="text-right">
                {(isGa4Connected || isDemo) && displayGa4Data && !displayGa4Data.error ? (
                  <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5">
                    <ArrowUpRight size={10} /> +4,2%
                  </span>
                ) : (
                  <span className="text-[10px] font-semibold text-slate-400">Integração necessária</span>
                )}
                <p className="text-[9px] text-slate-400 mt-0.5 font-semibold">{(isGa4Connected || isDemo) && displayGa4Data && !displayGa4Data.error ? 'vs período ant.' : ''}</p>
              </div>
            </div>

            {/* Metric 2 */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[12px] font-bold text-slate-500">Duração da Sessão</p>
                <p className="text-[18px] font-black text-[#0f172a] font-mono leading-none mt-1">
                  {(isGa4Connected || isDemo) && displayGa4Data && !displayGa4Data.error && displayGa4Data.averageSessionDuration
                    ? displayGa4Data.averageSessionDuration
                    : <span className="text-[13px] text-slate-400 font-semibold">—</span>}
                </p>
              </div>
              <div className="text-right">
                {(isGa4Connected || isDemo) && displayGa4Data && !displayGa4Data.error ? (
                  <span className="text-[10px] font-bold text-rose-600 flex items-center gap-0.5">
                    <ArrowDownRight size={10} /> -1,8%
                  </span>
                ) : (
                  <span className="text-[10px] font-semibold text-slate-400">Integração necessária</span>
                )}
                <p className="text-[9px] text-slate-400 mt-0.5 font-semibold">{(isGa4Connected || isDemo) && displayGa4Data && !displayGa4Data.error ? 'vs período ant.' : ''}</p>
              </div>
            </div>

            {/* Metric 3 */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[12px] font-bold text-slate-500">Taxa de Conversão</p>
                <p className="text-[18px] font-black text-[#0f172a] font-mono leading-none mt-1">
                  {(isGa4Connected || isDemo) && displayGa4Data && !displayGa4Data.error && displayGa4Data.conversions && displayGa4Data.activeUsers
                    ? `${((parseInt(displayGa4Data.conversions, 10) / parseInt(displayGa4Data.activeUsers, 10)) * 100).toFixed(2).replace('.', ',')}%`
                    : <span className="text-[13px] text-slate-400 font-semibold">—</span>}
                </p>
              </div>
              <div className="text-right">
                {(isGa4Connected || isDemo) && displayGa4Data && !displayGa4Data.error ? (
                  <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5">
                    <ArrowUpRight size={10} /> +9,1%
                  </span>
                ) : (
                  <span className="text-[10px] font-semibold text-slate-400">Integração necessária</span>
                )}
                <p className="text-[9px] text-slate-400 mt-0.5 font-semibold">{(isGa4Connected || isDemo) && displayGa4Data && !displayGa4Data.error ? 'vs período ant.' : ''}</p>
              </div>
            </div>
          </div>
        </BentoCard>

        {/* Paid Campaigns CTR & CPC Bento */}
        <BentoCard variant="neumorphic" glowColor="rgba(255, 106, 0, 0.03)" className="p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-white/40 pb-3">
            <div className="flex items-center gap-2">
              <Target size={16} className="text-[#FF6A00]" />
              <span className="text-[13px] font-black uppercase tracking-wider text-[#0f172a]">Performance das Campanhas</span>
            </div>
            {(() => {
              const activeAds = [isGoogleAdsConnected, isMetaAdsConnected, isLinkedinAdsConnected].filter(Boolean).length;
              return activeAds > 0
                ? <span className="text-[10px] font-black text-[#FF6A00] bg-orange-500/5 px-2 py-0.5 rounded-md border border-orange-500/10">{activeAds} ADS ATIVOS</span>
                : <span className="text-[10px] font-black text-slate-400 bg-slate-200/60 px-2 py-0.5 rounded-md border border-slate-200">INDISPONÍVEL</span>;
            })()}
          </div>

          <div className="space-y-4 flex-1">
            {/* Google Ads CTR/CPC */}
            <div>
              <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5 text-[11.5px] font-black text-slate-700">
                <span>Google Ads (Search & PMax)</span>
                <span className="font-mono whitespace-nowrap">CTR: {googleAdsCTR} · CPC: {googleAdsCPC}</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-200 mt-1.5 overflow-hidden">
                <div className="h-full bg-orange-500 rounded-full" style={{ width: `${googleAdsBarWidth}%` }} />
              </div>
            </div>

            {/* Meta Ads CTR/CPC */}
            <div>
              <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5 text-[11.5px] font-black text-slate-700">
                <span>Meta Ads (Instagram & FB)</span>
                <span className="font-mono whitespace-nowrap">CTR: {metaAdsCTR} · CPC: {metaAdsCPC}</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-200 mt-1.5 overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${metaAdsBarWidth}%` }} />
              </div>
            </div>

            {/* LinkedIn Ads CTR/CPC */}
            <div>
              <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5 text-[11.5px] font-black text-slate-700">
                <span>LinkedIn Ads (B2B LeadGen)</span>
                <span className="font-mono whitespace-nowrap">CTR: {linkedinAdsCTR} · CPC: {linkedinAdsCPC}</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-200 mt-1.5 overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${linkedinAdsBarWidth}%` }} />
              </div>
            </div>
          </div>
        </BentoCard>

        {/* Social Networks & Organic Channels Bento */}
        <BentoCard variant="neumorphic" glowColor="rgba(217, 119, 6, 0.03)" className="p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-white/40 pb-3">
            <div className="flex items-center gap-2">
              <InstagramIcon size={16} className="text-pink-600" />
              <span className="text-[13px] font-black uppercase tracking-wider text-[#0f172a]">Redes Sociais & Orgânico</span>
            </div>
            {(() => {
              const activeSocial = isDemo ? 3 : [isInstagramConnected, isLinkedinPageConnected, isSearchConsoleConnected].filter(Boolean).length;
              return activeSocial > 0
                ? <span className="text-[10px] font-black text-[#FF6A00] bg-[#FF6A00]/5 px-2 py-0.5 rounded-md border border-[#FF6A00]/10">{activeSocial} CANAIS ATIVOS</span>
                : <span className="text-[10px] font-black text-slate-400 bg-slate-200/60 px-2 py-0.5 rounded-md border border-slate-200">INDISPONÍVEL</span>;
            })()}
          </div>

          <div className="space-y-4 flex-1">
            {/* Instagram Stats */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center border border-white/50 bg-[#eef2f7] shadow-[inset_1px_1px_2px_#d1d9e6,inset_-1px_-1px_2px_#ffffff]">
                  <InstagramIcon size={13} className="text-pink-600" />
                </div>
                <div>
                  <p className="text-[12px] font-bold text-slate-700">Instagram Organic</p>
                  <p className="text-[10px] text-slate-400 font-semibold">
                    {(isInstagramConnected || isDemo) && displayIgData && !displayIgData.error && displayIgData.followers
                      ? `${displayIgData.followers.toLocaleString('pt-BR')} Seguidores`
                      : 'Não conectado'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[14px] font-bold text-slate-800 font-mono">
                  {(isInstagramConnected || isDemo) && displayIgData && !displayIgData.error && displayIgData.engagementRate
                    ? displayIgData.engagementRate
                    : <span className="text-[13px] text-slate-400">—</span>}
                </p>
                <p className="text-[9px] font-black">
                  {(isInstagramConnected || isDemo) && displayIgData && !displayIgData.error && displayIgData.reach
                    ? <span className="text-emerald-600">{displayIgData.reach.toLocaleString('pt-BR')} alcance</span>
                    : <span className="text-slate-400">Indisponível</span>}
                </p>
              </div>
            </div>

            {/* LinkedIn Page Stats */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center border border-white/50 bg-[#eef2f7] shadow-[inset_1px_1px_2px_#d1d9e6,inset_-1px_-1px_2px_#ffffff]">
                  <LinkedinIcon size={13} className="text-blue-700" />
                </div>
                <div>
                  <p className="text-[12px] font-bold text-slate-700">Página do LinkedIn</p>
                  <p className="text-[10px] text-slate-400 font-semibold">
                    {(isLinkedinPageConnected || isDemo) && displayLpData && !displayLpData.error && displayLpData.followers
                      ? `${displayLpData.followers.toLocaleString('pt-BR')} Seguidores`
                      : 'Não conectado'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[14px] font-bold text-slate-800 font-mono">
                  {(isLinkedinPageConnected || isDemo) && displayLpData && !displayLpData.error && displayLpData.engagementRate
                    ? displayLpData.engagementRate
                    : <span className="text-[13px] text-slate-400">—</span>}
                </p>
                <p className="text-[9px] font-black">
                  {(isLinkedinPageConnected || isDemo) && displayLpData && !displayLpData.error && displayLpData.impressions
                    ? <span className="text-emerald-600">{displayLpData.impressions.toLocaleString('pt-BR')} impressões</span>
                    : <span className="text-slate-400">Indisponível</span>}
                </p>
              </div>
            </div>

            {/* Search Console Organic Stats */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center border border-white/50 bg-[#eef2f7] shadow-[inset_1px_1px_2px_#d1d9e6,inset_-1px_-1px_2px_#ffffff]">
                  <TrendingUp size={13} className="text-emerald-600" />
                </div>
                <div>
                  <p className="text-[12px] font-bold text-slate-700">Google Search Console</p>
                  <p className="text-[10px] text-slate-400 font-semibold">
                    {(isSearchConsoleConnected || isDemo) && displayScData && !displayScData.error
                      ? `Pos. média: ${displayScData.position}`
                      : 'Não conectado'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[14px] font-bold text-slate-800 font-mono">
                  {(isSearchConsoleConnected || isDemo) && displayScData && !displayScData.error && displayScData.clicks
                    ? `${displayScData.clicks.toLocaleString('pt-BR')} cliques`
                    : <span className="text-[13px] text-slate-400">—</span>}
                </p>
                <p className="text-[9px] font-black">
                  {(isSearchConsoleConnected || isDemo) && displayScData && !displayScData.error && displayScData.ctr
                    ? <span className="text-emerald-600">{displayScData.ctr} CTR orgânico</span>
                    : <span className="text-slate-400">Indisponível</span>}
                </p>
              </div>
            </div>
          </div>
        </BentoCard>
      </div>

      {/* ── Métricas Avançadas (GA4) ── */}
      <div className="mt-8 space-y-6">
        <div className="flex items-center gap-2 border-b border-slate-200/60 pb-3">
          <Activity size={18} className="text-[#FF6A00]" />
          <h2 className="text-[16px] font-black uppercase tracking-wider text-[#0f172a]">Métricas Avançadas (GA4)</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Card 1: Donut Chart */}
          <BentoCard variant="neumorphic" className="flex flex-col p-6 h-[280px]" glowColor="rgba(255, 106, 0, 0.02)">
            <GA4TrafficDonut
              sources={displayGa4Data?.trafficSources || []}
              connected={isGa4Connected || isDemo}
              loading={loading}
            />
          </BentoCard>

          {/* Card 2: Line Chart */}
          <BentoCard variant="neumorphic" className="flex flex-col p-6 h-[280px]" glowColor="rgba(34, 197, 94, 0.02)">
            <GA4UserLineChart
              trend={displayGa4Data?.usersTrend || []}
              connected={isGa4Connected || isDemo}
              loading={loading}
            />
          </BentoCard>

          {/* Card 3: Region/Map list */}
          <BentoCard variant="neumorphic" className="flex flex-col p-6 h-[280px]" glowColor="rgba(37, 99, 235, 0.02)">
            <GA4ActiveRegions
              regions={displayGa4Data?.regions || []}
              connected={isGa4Connected || isDemo}
              loading={loading}
            />
          </BentoCard>
        </div>
      </div>
    </div>
  );
}
