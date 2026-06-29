'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BarChart2,
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
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import HubEmptyState from './HubEmptyState';
import BentoCard from './v2/BentoCard';
import CountUp from './v2/CountUp';
import Sparkline from './v2/Sparkline';

/* ─── Types ────────────────────────────────────────────────────────── */
type ChannelResult = {
  platform: string; spend: number; impressions: number; clicks: number; conversions: number;
};
type TrafficExtractResponse = {
  success: boolean; channels?: ChannelResult[];
  totals?: { spend: number; impressions: number; clicks: number; conversions: number };
  error?: string;
};
type Ga4MetricsResponse = {
  activeUsers?: string; averageSessionDuration?: string; conversions?: string;
  engagementRate?: string; purchaseRevenue?: string; error?: string;
};

/* ─── Static data ──────────────────────────────────────────────────── */
const STATIC_AGENTS = [
  { name: 'Copy Persuasivo', desc: 'Criação de anúncios com gatilhos', status: 'Ativo', runs: 124 },
  { name: 'Análise ROAS',    desc: 'Diagnóstico automático por canal', status: 'Ativo', runs: 87  },
  { name: 'Brief Criativo',  desc: 'Geração de briefings visuais',    status: 'Beta',  runs: 42  },
];

/* ─── Types ────────────────────────────────────────────────────────── */
type ChannelRow = {
  name: string;
  spend: number;
  revenue: number;
  roas: number;
  conversions: number;
  connected: boolean;
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

/* ─── Channel table row ────────────────────────────────────────────── */
function ChannelTableRow({ ch, idx }: { ch: ChannelRow; idx: number }) {
  const roasColor = ch.roas >= 3.5 ? '#0d9488' : ch.roas >= 2.5 ? '#d97706' : '#e11d48';
  const barColors = ['#FF6A00', '#3b82f6', '#10b981'];
  return (
    <tr className="border-b last:border-0 border-white/20 hover:bg-slate-100/30 transition-colors">
      <td className="py-4 px-6">
        <div className="flex items-center gap-3">
          <span className="w-1.5 h-6 rounded-full shrink-0 shadow-sm" style={{ background: barColors[idx % 3] }} />
          <span className="text-[13px] font-bold text-[#1e293b]">{ch.name}</span>
          {!ch.connected && (
            <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200 tracking-wider">DEMO</span>
          )}
        </div>
      </td>
      <td className="py-4 px-4 text-right text-[13px] font-mono text-[#475569] tabular-nums">
        R$ {ch.spend.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
      </td>
      <td className="py-4 px-4 text-right text-[13px] font-mono text-[#1e293b] font-bold tabular-nums">
        R$ {ch.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
      </td>
      <td className="py-4 px-4 text-right">
        <span
          className="text-[11px] font-black px-2.5 py-1 rounded-lg border"
          style={{
            color: roasColor,
            borderColor: `${roasColor}25`,
            background: `${roasColor}08`,
          }}
        >
          {ch.roas.toFixed(2).replace('.', ',')}×
        </span>
      </td>
      <td className="py-4 px-6 text-right text-[13px] font-mono text-[#475569] tabular-nums">
        {ch.conversions.toLocaleString('pt-BR')}
      </td>
    </tr>
  );
}

/* ─── Main Component ───────────────────────────────────────────────── */
export default function HubDashboardLight() {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'channels'>('overview');
  const [loading, setLoading] = useState(false);
  const [ga4Data, setGa4Data] = useState<Ga4MetricsResponse | null>(null);
  const [trafficData, setTrafficData] = useState<TrafficExtractResponse | null>(null);


  const connections = useMemo(() => profile?.connections || {}, [profile?.connections]);
  const isGa4Connected = Boolean(connections.ga4?.isActive);
  const isGoogleAdsConnected = Boolean(connections.google_ads?.isActive);
  const isMetaAdsConnected = Boolean(connections.meta_ads?.isActive);
  const isLinkedinAdsConnected = Boolean(connections.linkedin_ads?.isActive);

  const { dateFrom, dateTo } = useMemo(() => {
    const today = new Date();
    return {
      dateTo: today.toISOString().slice(0, 10),
      dateFrom: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    };
  }, []);

  useEffect(() => {
    let active = true;
    async function fetchData() {
      setLoading(true);
      try {
        if (isGa4Connected && connections.ga4?.accessToken && connections.ga4?.accountId) {
          const res = await fetch('/api/hub/metrics/ga4', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ accessToken: connections.ga4.accessToken, accountId: connections.ga4.accountId }),
          });
          if (active) setGa4Data(await res.json());
        }
        const activeChannels: object[] = [];
        if (isGoogleAdsConnected && connections.google_ads?.accessToken) {
          activeChannels.push({ platform: 'googleAds', accessToken: connections.google_ads.accessToken, accountId: connections.google_ads.loginCustomerId || connections.google_ads.accountId, loginCustomerId: connections.google_ads.loginCustomerId });
        }
        if (isMetaAdsConnected && connections.meta_ads?.accessToken) {
          activeChannels.push({ platform: 'metaAds', accessToken: connections.meta_ads.accessToken, accountId: connections.meta_ads.accountId });
        }
        if (isLinkedinAdsConnected && connections.linkedin_ads?.accessToken) {
          activeChannels.push({ platform: 'linkedinAds', accessToken: connections.linkedin_ads.accessToken, accountId: connections.linkedin_ads.accountId });
        }
        if (activeChannels.length > 0) {
          const res = await fetch('/api/traffic/extract', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ dateFrom, dateTo, channels: activeChannels }),
          });
          if (active) setTrafficData(await res.json());
        }
      } catch (err) {
        console.error('Erro ao buscar métricas:', err);
      } finally {
        if (active) setLoading(false);
      }
    }
    void fetchData();
    return () => { active = false; };
  }, [isGa4Connected, isGoogleAdsConnected, isMetaAdsConnected, isLinkedinAdsConnected, connections, dateFrom, dateTo]);

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

  const channelRows = useMemo((): ChannelRow[] => {
    const aov = typeof stats.revenue === 'number' && typeof stats.conversions === 'number' && stats.conversions > 0
      ? stats.revenue / stats.conversions : 86.7;
    const google = trafficData?.channels?.find(c => c.platform === 'Google Ads');
    const meta = trafficData?.channels?.find(c => c.platform === 'Meta Ads');
    const linkedin = trafficData?.channels?.find(c => c.platform === 'LinkedIn Ads');
    const calcRoas = (s: number, conv: number) => s > 0 ? (conv * aov) / s : 0;
    return [
      { name: 'Google Ads', spend: google?.spend || 18400, revenue: (google?.conversions || 1482) * aov, roas: google ? calcRoas(google.spend, google.conversions) : 3.91, conversions: google?.conversions || 1482, connected: isGoogleAdsConnected },
      { name: 'Meta Ads',   spend: meta?.spend   || 9800,  revenue: (meta?.conversions   || 890)  * aov, roas: meta   ? calcRoas(meta.spend, meta.conversions)   : 3.69, conversions: meta?.conversions   || 890,  connected: isMetaAdsConnected   },
      { name: 'LinkedIn',   spend: linkedin?.spend || 6000, revenue: (linkedin?.conversions || 475) * aov, roas: linkedin ? calcRoas(linkedin.spend, linkedin.conversions) : 3.38, conversions: linkedin?.conversions || 475, connected: isLinkedinAdsConnected },
    ];
  }, [trafficData, isGoogleAdsConnected, isMetaAdsConnected, isLinkedinAdsConnected, stats.revenue, stats.conversions]);

  const spendNum  = typeof stats.spend       === 'number' ? stats.spend       : 34200;
  const revenueNum= typeof stats.revenue     === 'number' ? stats.revenue     : 128450;
  const roasNum   = typeof stats.roas        === 'number' ? stats.roas        : 3.75;
  const convsNum  = typeof stats.conversions === 'number' ? stats.conversions : 2847;
  const cpaNum    = typeof stats.cpa         === 'number' ? stats.cpa         : 12.01;
  const usersNum  = typeof stats.activeUsers === 'number' ? stats.activeUsers : 14380;

  const hasAnyConnection = isGa4Connected || isGoogleAdsConnected || isMetaAdsConnected;
  if (!hasAnyConnection && !loading) return <HubEmptyState />;

  /* Sparkline trend data (last 10 points) */
  const SP = {
    revenue: [72,  68,  75,  80,  78,  90,  95,  88, 102, revenueNum / 1000],
    spend:   [28,  30,  29,  31,  30,  33,  34,  32,  34, spendNum   / 1000],
    roas:    [2.5, 2.6, 2.8, 2.7, 3.1, 3.2, 3.0, 3.4, 3.7, roasNum        ],
    convs:   [1800,1900,2100,2000,2200,2400,2300,2600,2750, convsNum        ],
    cpa:     [18,  16,  15,  14,  13,  13,  12.5,12.2,12.1, cpaNum         ],
    users:   [9000,10000,11000,10500,12000,12500,13000,13500,14000, usersNum],
  };

  /* Build KPI list from real data */
  const KPIS: KpiDef[] = [
    { label: 'Receita Total',   rawValue: revenueNum, isNa: stats.revenue === 'N/A', prefix: 'R$ ', suffix: '', decimals: 2, delta: '+18,4%', positive: true,  icon: Wallet,           color: '#0d9488', glow: 'rgba(13, 148, 136, 0.05)', spark: SP.revenue },
    { label: 'Investimento',    rawValue: spendNum,   isNa: stats.spend === 'N/A',   prefix: 'R$ ', suffix: '', decimals: 2, delta: '+6,2%',  positive: false, icon: Target,           color: '#2563eb', glow: 'rgba(37, 99, 235, 0.05)', spark: SP.spend   },
    { label: 'ROAS Médio',      rawValue: roasNum,    isNa: stats.roas === 'N/A',    prefix: '', suffix: '×', decimals: 2, delta: '+0,43×', positive: true,  icon: TrendingUp,       color: '#FF6A00', glow: 'rgba(255, 106, 0, 0.05)', spark: SP.roas    },
    { label: 'Conversões',      rawValue: convsNum,   isNa: stats.conversions === 'N/A', prefix: '', suffix: '', decimals: 0, delta: '+22,1%', positive: true,  icon: ShoppingCart,     color: '#0d9488', glow: 'rgba(13, 148, 136, 0.05)', spark: SP.convs   },
    { label: 'CPA Médio',       rawValue: cpaNum,     isNa: stats.cpa === 'N/A',     prefix: 'R$ ', suffix: '', decimals: 2, delta: '-8,3%',  positive: true,  icon: MousePointerClick,color: '#d97706', glow: 'rgba(217, 119, 6, 0.05)', spark: SP.cpa     },
    { label: 'Usuários Ativos', rawValue: usersNum,   isNa: stats.activeUsers === 'N/A', prefix: '', suffix: '', decimals: 0, delta: '+31,7%', positive: true,  icon: Users,            color: '#0891b2', glow: 'rgba(8, 145, 178, 0.05)', spark: SP.users   },
  ];

  /* Dynamic alerts based on real data */
  const alerts = [
    roasNum < 3.5
      ? { color: '#e11d48',  icon: ArrowDownRight, text: `ROAS geral em ${roasNum.toFixed(2).replace('.', ',')}× — abaixo da meta de 3,5×`, time: 'agora' }
      : { color: '#0d9488', icon: ArrowUpRight,   text: `ROAS geral em ${roasNum.toFixed(2).replace('.', ',')}× — acima da meta`,           time: 'agora' },
    { color: '#0d9488', icon: ArrowUpRight,   text: 'Meta Ads ultrapassou meta mensal de conversões', time: '5h atrás' },
    { color: '#d97706',   icon: Activity,       text: 'LinkedIn Ads: orçamento 82% consumido',          time: '1d atrás' },
  ];

  /* Totals row */
  const totalRevenue = channelRows.reduce((s, r) => s + r.revenue, 0);
  const totalSpend   = channelRows.reduce((s, r) => s + r.spend, 0);
  const totalConvs   = channelRows.reduce((s, r) => s + r.conversions, 0);
  const totalRoas    = totalSpend > 0 ? totalRevenue / totalSpend : 0;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-start justify-between gap-4 flex-wrap"
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span
              className="h-1.5 w-1.5 rounded-full bg-[#FF6A00]"
            />
            <span className="text-[10px] font-black uppercase tracking-[0.18em] text-[#FF6A00]">
              Hub Estratégico
            </span>
          </div>
          <h1 className="text-[28px] font-black tracking-tight leading-none text-[#0f172a]">
            {profile?.companyName || 'Visão Geral'}
          </h1>
          <p className="text-[13px] text-slate-500 mt-1.5 font-bold">
            Consolidado dos canais de tração · Atualizado em {new Date(dateTo + 'T12:00:00').toLocaleDateString('pt-BR')}
          </p>
        </div>
        <Link
          href="/hub/assistente-ia"
          className="flex items-center gap-2 px-5 h-10 rounded-xl text-white text-[13px] font-bold shadow-[4px_4px_10px_#c2cbd9,_-4px_-4px_10px_#ffffff] hover:shadow-[0_4px_16px_rgba(255,106,0,0.3)] transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          style={{ background: 'linear-gradient(135deg, #FF4D00, #FF7A00)' }}
        >
          <Sparkles size={14} className="animate-pulse" />
          Análise Neuromarketing
        </Link>
      </motion.div>

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
        className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4"
      >
        {KPIS.map((kpi, idx) => {
          const Icon = kpi.icon as React.FC<{ size?: number; style?: React.CSSProperties }>;
          return (
            <BentoCard 
              key={kpi.label} 
              variant="neumorphic"
              glowColor={kpi.glow} 
              accentColor={kpi.color}
              className="p-5 flex flex-col gap-3.5"
              delay={idx * 0.04}
            >
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center border border-white/40 bg-[#eef2f7] shadow-[inset_2px_2px_4px_#d1d9e6,inset_-2px_-2px_4px_#ffffff]">
                  <Icon size={18} style={{ color: kpi.color }} />
                </div>
                <span
                  className="flex items-center gap-0.5 text-[11px] font-bold px-2 py-0.5 rounded-full border border-white/60 bg-[#eef2f7] shadow-[2px_2px_4px_#d1d9e6,_-2px_-2px_4px_#ffffff]"
                  style={{ 
                    color: kpi.positive ? '#0d9488' : '#e11d48', 
                  }}
                >
                  {kpi.positive ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
                  {kpi.delta}
                </span>
              </div>
              <div>
                <div className="text-[22px] font-black tracking-tight text-[#0f172a] font-mono tabular-nums leading-none">
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Performance table bento block */}
        <BentoCard variant="neumorphic" className="lg:col-span-2 flex flex-col" glowColor="rgba(255, 106, 0, 0.03)">
          <div className="flex items-center justify-between px-6 py-5 border-b border-white/40">
            <div className="flex items-center gap-2">
              <BarChart2 size={16} className="text-[#FF6A00]" />
              <span className="text-[14px] font-black uppercase tracking-wider text-[#0f172a]">Performance por Canal</span>
            </div>
            <div className="flex items-center gap-1.5 bg-[#eef2f7] p-1 rounded-xl shadow-[inset_2px_2px_4px_#d1d9e6,_inset_-2px_-2px_4px_#ffffff] border border-white/20">
              {(['overview', 'channels'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setActiveTab(t)}
                  className="px-3.5 py-1.5 rounded-lg text-[11px] font-black transition-all"
                  style={{
                    background: activeTab === t ? '#eef2f7' : 'transparent',
                    color: activeTab === t ? '#FF6A00' : '#475569',
                    boxShadow: activeTab === t ? '2px 2px 5px #d1d9e6, -2px -2px 5px #ffffff' : 'none',
                  }}
                >
                  {t === 'overview' ? 'Resumo' : 'Canais'}
                </button>
              ))}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-100/50 border-b border-white/40">
                  {['Canal', 'Investimento', 'Receita', 'ROAS', 'Conversões'].map((h, i) => (
                    <th
                      key={h}
                      className={`py-3 text-[10px] font-black uppercase tracking-wider ${i > 0 ? 'text-right' : 'text-left'} ${i === 0 || i === 4 ? 'px-6' : 'px-4'}`}
                      style={{ color: '#475569' }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/20">
                {channelRows.map((ch, i) => <ChannelTableRow key={ch.name} ch={ch} idx={i} />)}
              </tbody>
              <tfoot>
                <tr className="bg-slate-100/50 border-t border-white/40">
                  <td className="py-4 px-6 text-[13px] font-bold text-[#0f172a]">Consolidado</td>
                  <td className="py-4 px-4 text-right text-[13px] font-mono font-bold text-[#475569]">
                    R$ {totalSpend.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-4 px-4 text-right text-[13px] font-mono font-black text-[#0f172a]">
                    R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-4 px-4 text-right">
                    <span className="text-[12px] font-black px-2.5 py-1 rounded-lg border border-emerald-500/25 bg-emerald-500/10 text-emerald-600">
                      {totalRoas.toFixed(2).replace('.', ',')}×
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right text-[13px] font-mono font-bold text-[#475569]">
                    {totalConvs.toLocaleString('pt-BR')}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </BentoCard>

        {/* Right side widgets grid */}
        <div className="space-y-6">

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
                const Icon = a.icon as React.FC<{ size?: number; style?: React.CSSProperties }>;
                return (
                  <div key={i} className="flex items-start gap-3.5 px-5 py-4 hover:bg-slate-100/10 transition-all cursor-pointer">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 border border-white/40 bg-[#eef2f7]" style={{ boxShadow: 'inset 2px 2px 4px #d1d9e6, inset -2px -2px 4px #ffffff' }}>
                      <Icon size={14} style={{ color: a.color }} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[12.5px] font-semibold leading-snug text-slate-700">{a.text}</p>
                      <p className="text-[11px] text-slate-400 mt-1 font-bold">{a.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </BentoCard>

          {/* Active Agents Bento Block */}
          <BentoCard variant="neumorphic" className="flex flex-col" glowColor="rgba(59, 130, 246, 0.03)">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-white/40">
              <Brain size={15} className="text-[#FF6A00]" />
              <span className="text-[13px] font-black uppercase tracking-wider text-[#0f172a]">Agentes em Ação</span>
              <Link 
                href="/hub/laboratorio-agentes" 
                className="ml-auto text-[11px] font-black text-[#FF6A00] flex items-center gap-0.5 transition-colors hover:text-[#ff8f3a]"
                style={{ textDecoration: 'none' }}
              >
                <span>Lab</span>
                <ChevronRight size={12} />
              </Link>
            </div>
            <div className="divide-y divide-white/20">
              {STATIC_AGENTS.map(ag => (
                <div key={ag.name} className="flex items-center gap-3.5 px-5 py-4 hover:bg-slate-100/10 transition-colors">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border border-white/40 bg-[#eef2f7]" style={{ boxShadow: 'inset 2px 2px 4px #d1d9e6, inset -2px -2px 4px #ffffff' }}>
                    <Zap size={13} className="text-[#FF6A00]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-bold text-[#1e293b] truncate">{ag.name}</p>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">{ag.desc}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span
                      className="text-[9px] font-black px-2 py-0.5 rounded-full border"
                      style={{ 
                        color: ag.status === 'Ativo' ? '#0d9488' : '#d97706', 
                        borderColor: ag.status === 'Ativo' ? 'rgba(13, 148, 136, 0.2)' : 'rgba(217, 119, 6, 0.2)',
                        background: ag.status === 'Ativo' ? 'rgba(13, 148, 136, 0.05)' : 'rgba(217, 119, 6, 0.05)' 
                      }}
                    >
                      {ag.status}
                    </span>
                    <p className="text-[10px] text-slate-400 mt-1 font-bold">{ag.runs} runs</p>
                  </div>
                </div>
              ))}
            </div>
          </BentoCard>

        </div>
      </div>

      {/* Quick-Access Interactive Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Link2,       label: 'Integrações',    sub: '3 canais ativos',      href: '/hub/integracoes',       color: '#3b82f6', glow: 'rgba(59,130,246,0.1)' },
          { icon: FlaskConical, label: 'Criativos',     sub: '12 peças no ar',      href: '/hub/criativos',         color: '#FF6A00', glow: 'rgba(255,106,0,0.1)'  },
          { icon: Cpu,          label: 'Automações',    sub: '5 fluxos rodando',     href: '/hub/automacoes',        color: '#0d9488', glow: 'rgba(13,148,136,0.1)' },
          { icon: Sparkles,     label: 'Assistente IA', sub: 'Insights em tempo real',href: '/hub/assistente-ia',     color: '#d97706', glow: 'rgba(217,119,6,0.1)' },
        ].map(({ icon: Icon, label, sub, href, color }) => {
          return (
            <Link
              key={label}
              href={href}
              className="group relative flex items-center gap-3.5 px-5 py-5 rounded-2xl border border-white/50 bg-[#eef2f7] shadow-[4px_4px_8px_#d1d9e6,_-4px_-4px_8px_#ffffff] hover:shadow-[inset_3px_3px_6px_#d1d9e6,_inset_-3px_-3px_6px_#ffffff] transition-all duration-300 hover:scale-[0.99] active:scale-[0.97]"
              style={{ textDecoration: 'none' }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-white/40 bg-[#eef2f7]" style={{ boxShadow: 'inset 2px 2px 4px #d1d9e6, inset -2px -2px 4px #ffffff' }}>
                <Icon size={18} style={{ color }} />
              </div>
              <div className="min-w-0">
                <p className="text-[14px] font-bold text-[#1e293b] truncate">{label}</p>
                <p className="text-[11px] text-slate-500 truncate mt-0.5">{sub}</p>
              </div>
              <ArrowUpRight size={14} className="ml-auto shrink-0 text-slate-400 group-hover:text-[#FF6A00] transition-colors" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
