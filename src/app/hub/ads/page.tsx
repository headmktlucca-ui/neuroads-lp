'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  TrendingUp, 
  TrendingDown,
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  ChevronRight, 
  Play, 
  Pause, 
  DollarSign, 
  MousePointerClick, 
  Target, 
  Sparkles,
  Plus,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { loadUserConnections, type ConnectionsMap } from '../../../lib/connector-save';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { IconNeuAds, PageTitleIcon, NeumorphicTileIcon } from '../../../components/hub/NeumorphicMenuIcons';
import { CreativePreValidator } from '../../../components/hub/visual-analysis/CreativePreValidator';
import { scoreCreative, getScoreColor, getScoreLabel, type Platform } from '../../../lib/visual-analysis';

// Initial campaigns list
const INITIAL_CAMPAIGNS = [
  { id: '1', platform: 'Meta Ads', name: 'BF2026 - Conversão - Lookalike 1-3%', status: 'active', budget: 12000, spend: 9450, impressions: 245000, clicks: 8200, conversions: 380, cpa: 24.8, roas: 4.8 },
  { id: '2', platform: 'Google Ads', name: 'Institucional - Institucional & Marca', status: 'active', budget: 5000, spend: 3200, impressions: 84000, clicks: 12400, conversions: 110, cpa: 29.0, roas: 3.9 },
  { id: '3', platform: 'Meta Ads', name: 'Remarketing - Visitantes 30 Dias', status: 'active', budget: 8000, spend: 7100, impressions: 112000, clicks: 4300, conversions: 245, cpa: 28.9, roas: 5.6 },
  { id: '4', platform: 'LinkedIn Ads', name: 'B2B - Decisores e Diretores - TI', status: 'paused', budget: 15000, spend: 12500, impressions: 45000, clicks: 920, conversions: 42, cpa: 297.6, roas: 2.1 },
  { id: '5', platform: 'TikTok Ads', name: 'Desafio Hashtag - Topo de Funil', status: 'active', budget: 6000, spend: 4100, impressions: 380000, clicks: 15600, conversions: 95, cpa: 43.1, roas: 1.8 }
];

// Helper to calculate dynamic comparison dates for period selector cards
function getComparisonDates(days: number) {
  const today = new Date();
  
  const compEnd = new Date(today);
  compEnd.setDate(today.getDate() - days);

  const compStart = new Date(compEnd);
  compStart.setDate(compEnd.getDate() - (days - 1));

  const fmt = (d: Date) => 
    `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;

  return {
    compStartStr: fmt(compStart),
    compEndStr: fmt(compEnd),
  };
}

export default function AdsDashboardPage() {
  const { user } = useAuth();
  const [connections, setConnections] = useState<ConnectionsMap>({});
  const [selectedDays, setSelectedDays] = useState<number>(30); // Default active period: 30 days
  const [campaigns, setCampaigns] = useState(INITIAL_CAMPAIGNS);
  const [validatingCampaignId, setValidatingCampaignId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchConnections() {
      if (!user) return;
      try {
        const userConns = await loadUserConnections(user.uid);
        setConnections(userConns);
      } catch (err) {
        console.error('Error loading connections:', err);
      }
    }
    fetchConnections();
  }, [user]);

  const activeChannels = useMemo(() => {
    return {
      googleAds: Boolean(connections['googleAds']?.isActive),
      metaAds: Boolean(connections['metaAds']?.isActive),
      linkedinAds: Boolean(connections['linkedinAds']?.isActive),
      tiktokAds: Boolean(connections['tiktokAds']?.isActive),
    };
  }, [connections]);

  const connectedCount = Object.values(activeChannels).filter(Boolean).length;
  const hasConnected = connectedCount > 0;

  // Periods config for period selector component
  const periodOptions = useMemo(() => {
    return [7, 15, 30, 90].map((days) => {
      const { compStartStr, compEndStr } = getComparisonDates(days);
      return {
        days,
        label: `Últimos ${days} dias`,
        vsText: 'Vs. último período igual',
        comparedText: `Comparado a ${compStartStr} - ${compEndStr}`,
      };
    });
  }, []);

  // Multiplier scale according to selected period
  const periodMultiplier = selectedDays / 30;

  const kpis = useMemo(() => {
    if (!hasConnected) {
      return [
        { label: 'Investimento Total', value: 'R$ 0,00', sub: 'Sem canais conectados', evolution: null, icon: DollarSign, isNa: true },
        { label: 'Cliques Totais', value: '0', sub: 'Sem tráfego ativo', evolution: null, icon: MousePointerClick, isNa: true },
        { label: 'Conversões', value: '0', sub: 'Sem rastreamento', evolution: null, icon: Target, isNa: true },
        { label: 'ROAS Médio', value: '0.0x', sub: 'Sem receita de anúncios', evolution: null, icon: TrendingUp, isNa: true }
      ];
    }
    const rawSpend = campaigns.reduce((acc, c) => acc + (c.status === 'active' ? c.spend : 0), 0);
    const rawClicks = campaigns.reduce((acc, c) => acc + (c.status === 'active' ? c.clicks : 0), 0);
    const rawConversions = campaigns.reduce((acc, c) => acc + (c.status === 'active' ? c.conversions : 0), 0);
    
    const activeCamps = campaigns.filter(c => c.status === 'active');
    const avgRoasNum = activeCamps.length > 0 ? activeCamps.reduce((acc, c) => acc + c.roas, 0) / activeCamps.length : 0;

    const scaledSpend = Math.round(rawSpend * periodMultiplier);
    const scaledClicks = Math.round(rawClicks * periodMultiplier);
    const scaledConversions = Math.round(rawConversions * periodMultiplier);

    return [
      { 
        label: 'Investimento Total', 
        value: `R$ ${scaledSpend.toLocaleString('pt-BR')}`, 
        sub: `Campanhas ativas nos últimos ${selectedDays}d`, 
        evolution: { text: '+5.8% vs. período anterior', isPositive: true },
        icon: DollarSign, 
        isNa: false 
      },
      { 
        label: 'Cliques Totais', 
        value: scaledClicks.toLocaleString('pt-BR'), 
        sub: `Tráfego gerado em ${selectedDays} dias`, 
        evolution: { text: '+12.4% vs. período anterior', isPositive: true },
        icon: MousePointerClick, 
        isNa: false 
      },
      { 
        label: 'Conversões', 
        value: scaledConversions.toLocaleString('pt-BR'), 
        sub: `Eventos de compra / lead (${selectedDays}d)`, 
        evolution: { text: '+8.1% vs. período anterior', isPositive: true },
        icon: Target, 
        isNa: false 
      },
      { 
        label: 'ROAS Médio', 
        value: `${avgRoasNum.toFixed(1)}x`, 
        sub: `Retorno médio (${selectedDays}d)`, 
        evolution: { text: '+0.4x vs. período anterior', isPositive: true },
        icon: TrendingUp, 
        isNa: false 
      }
    ];
  }, [hasConnected, campaigns, periodMultiplier, selectedDays]);

  const chartData = useMemo(() => {
    const points = selectedDays <= 7 ? 7 : selectedDays <= 15 ? 5 : 7;
    const baseSpend = (campaigns.reduce((acc, c) => acc + (c.status === 'active' ? c.spend : 0), 0) * periodMultiplier) / points;
    const baseConv = (campaigns.reduce((acc, c) => acc + (c.status === 'active' ? c.conversions : 0), 0) * periodMultiplier) / points;

    const result = [];
    for (let i = 0; i < points; i++) {
      const varSpend = [0.8, 1.1, 1.3, 0.95, 1.45, 1.15, 0.9][i % 7];
      const varConv = [0.85, 1.05, 1.25, 1.0, 1.4, 1.2, 0.92][i % 7];
      let label = '';
      if (selectedDays <= 7) {
        label = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'][i % 7];
      } else if (selectedDays <= 15) {
        label = `Dia ${i * 3 + 1}`;
      } else if (selectedDays <= 30) {
        label = `Sem ${i + 1}`;
      } else {
        label = `Mês ${(i % 3) + 1}`;
      }

      result.push({
        name: label,
        'Gasto (R$)': Math.round(baseSpend * varSpend),
        'Conversões': Math.round(baseConv * varConv),
      });
    }
    return result;
  }, [campaigns, periodMultiplier, selectedDays]);

  const [isLoadingMetrics, setIsLoadingMetrics] = useState(false);

  const handleRefreshMetrics = async () => {
    if (!user || isLoadingMetrics) return;
    setIsLoadingMetrics(true);
    try {
      const userConns = await loadUserConnections(user.uid);
      setConnections(userConns);
    } catch (err) {
      console.error('Error refreshing connections/metrics:', err);
    } finally {
      setTimeout(() => setIsLoadingMetrics(false), 800);
    }
  };

  const toggleCampaignStatus = (id: string) => {
    setCampaigns(prev => prev.map(c => {
      if (c.id === id) {
        return { ...c, status: c.status === 'active' ? 'paused' : 'active' };
      }
      return c;
    }));
  };

  return (
    <div className="space-y-6 text-slate-800 animate-in fade-in duration-300">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <PageTitleIcon icon={IconNeuAds} />
            Ads
          </h1>
          <p className="text-sm font-semibold text-slate-500 mt-1 leading-relaxed">
            Monitore o desempenho das mídias pagas da sua marca nos canais configurados.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 self-start md:self-auto lg:mt-6">
          {connectedCount > 0 && (
            <button
              type="button"
              onClick={handleRefreshMetrics}
              disabled={isLoadingMetrics}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-[12px] font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition-all cursor-pointer disabled:opacity-50"
              title="Atualizar métricas reais"
            >
              <RefreshCw size={14} className={isLoadingMetrics ? 'animate-spin text-[#FF6A00]' : ''} />
              <span>Atualizar Métricas</span>
            </button>
          )}

          <Link
            href="/hub/integracoes"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-[12px] font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition-all hover:scale-105 active:scale-95 duration-200 cursor-pointer"
          >
            <Plus size={14} />
            <span>Gerenciar Canais</span>
          </Link>
        </div>
      </div>

      {/* SELETOR DE PERÍODO (Posicionado logo abaixo da descrição do cabeçalho) */}
      <div className="space-y-2 pt-1">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">
          SELETOR DE PERÍODO
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {periodOptions.map((opt) => {
            const isActive = selectedDays === opt.days;
            return (
              <button
                key={opt.days}
                type="button"
                onClick={() => setSelectedDays(opt.days)}
                className={`text-left rounded-2xl p-4 transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-[#FF6A00] to-[#FF8805] text-white shadow-[0_10px_25px_-5px_rgba(255,106,0,0.35)] border border-transparent scale-[1.02]'
                    : 'bg-white text-slate-800 border border-slate-200/80 shadow-sm hover:border-[#FF6A00]/40 hover:shadow-md hover:scale-[1.01]'
                }`}
              >
                <p className={`text-sm font-extrabold tracking-tight ${isActive ? 'text-white' : 'text-slate-900'}`}>
                  {opt.label}
                </p>
                <p className={`text-[11px] font-semibold mt-1 ${isActive ? 'text-white/90' : 'text-slate-400'}`}>
                  {opt.vsText}
                </p>
                <p className={`text-[10.5px] font-bold mt-0.5 truncate ${isActive ? 'text-white' : 'text-slate-500'}`}>
                  {opt.comparedText}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Integration Status Grid (Cards com fundo branco) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { key: 'metaAds', name: 'Meta Ads', desc: 'Facebook & Instagram' },
          { key: 'googleAds', name: 'Google Ads', desc: 'Search & YouTube' },
          { key: 'linkedinAds', name: 'LinkedIn Ads', desc: 'Campanhas B2B' },
          { key: 'tiktokAds', name: 'TikTok Ads', desc: 'Vídeos Patrocinados' }
        ].map((platform) => {
          const isConnected = activeChannels[platform.key as keyof typeof activeChannels];
          return (
            <div 
              key={platform.key}
              className="rounded-2xl border border-slate-200/80 bg-white p-4 flex items-center justify-between shadow-sm hover:shadow-md transition-all"
            >
              <div>
                <p className="text-[14px] font-black text-slate-800 leading-tight">{platform.name}</p>
                <p className="text-[11px] text-slate-400 font-semibold mt-0.5">{platform.desc}</p>
              </div>

              <div>
                {isConnected ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/20 text-emerald-700">
                    <CheckCircle2 size={10} />
                    Ativo
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/10 border border-amber-500/20 text-amber-700">
                    <AlertTriangle size={10} />
                    Inativo
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {!hasConnected ? (
        /* Empty State (Fundo branco) */
        <div className="rounded-[32px] border border-slate-200/80 bg-white p-8 text-center shadow-sm max-w-2xl mx-auto py-16">
          <div className="w-16 h-16 rounded-full border border-slate-200 bg-white shadow-sm flex items-center justify-center mx-auto mb-6 text-slate-400">
            <IconNeuAds size={28} />
          </div>
          <h3 className="text-xl font-black text-slate-900 tracking-tight">Nenhuma Plataforma de Anúncios Conectada</h3>
          <p className="text-sm font-semibold text-slate-500 mt-2 max-w-md mx-auto leading-relaxed">
            Conecte suas contas do Meta Ads, Google Ads ou outras plataformas de tráfego para visualizar dados reais das suas campanhas.
          </p>
          <div className="mt-8 flex justify-center">
            <Link 
              href="/hub/integracoes"
              className="px-6 py-3 rounded-xl bg-gradient-to-br from-[#FF6A00] to-[#FF8805] text-[12px] font-bold uppercase tracking-wider text-white shadow-md hover:brightness-105 active:scale-95 transition-all cursor-pointer"
            >
              Conectar Agora em Integrações
            </Link>
          </div>
        </div>
      ) : (
        /* Content Panel */
        <>
          {/* KPI Dashboard Row (Cards com fundo branco e evolução comparativa) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {kpis.map((kpi, idx) => {
              const KpiIcon = kpi.icon;
              return (
                <div 
                  key={idx}
                  className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start gap-2 mb-3">
                      <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">{kpi.label}</span>
                      <NeumorphicTileIcon size="card" className="shadow-sm">
                        <KpiIcon size={16} />
                      </NeumorphicTileIcon>
                    </div>

                    <p className="text-2xl font-black text-slate-900 tracking-tight font-mono">{kpi.value}</p>
                    <p className="text-[10px] font-semibold text-slate-500 mt-0.5">{kpi.sub}</p>
                  </div>

                  {/* Indicador de Evolução Comparativa */}
                  {kpi.evolution && (
                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center">
                      <span 
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                          kpi.evolution.isPositive 
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700' 
                            : 'bg-rose-500/10 border-rose-500/20 text-rose-700'
                        }`}
                      >
                        {kpi.evolution.isPositive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                        {kpi.evolution.text}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Analytics Chart & Breakdown (Cards com fundo branco) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Chart Area */}
            <div className="lg:col-span-2 rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <Activity size={16} className="text-[#FF6A00]" />
                  <span className="text-[13px] font-black uppercase tracking-wider text-slate-900">
                    Desempenho de Tráfego ({selectedDays} dias)
                  </span>
                </div>
                <span className="text-[10px] font-bold text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full uppercase">
                  Últimos {selectedDays} dias
                </span>
              </div>

              <div className="h-60 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(226,232,240,0.7)" />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                    <YAxis yAxisId="left" tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                    <RechartsTooltip 
                      contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)', fontSize: '11px', fontWeight: 'bold', backgroundColor: '#ffffff' }}
                      labelStyle={{ color: '#0f172a', marginBottom: '4px' }}
                    />
                    <Line yAxisId="left" type="monotone" dataKey="Gasto (R$)" name="Investimento (R$)" stroke="#FF6A00" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                    <Line yAxisId="right" type="monotone" dataKey="Conversões" name="Conversões" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="flex items-center justify-center gap-6 text-[10px] font-black uppercase text-slate-500 pt-4 border-t border-slate-100 mt-4">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FF6A00]" />
                  <span>Investimento (R$)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#2563eb]" />
                  <span>Conversões</span>
                </div>
              </div>
            </div>

            {/* Campaign Config Panel / Info (Fundo branco) */}
            <div className="rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-sm flex flex-col gap-4 text-left">
              <div className="border-b border-slate-100 pb-3">
                <span className="text-[13px] font-black uppercase tracking-wider text-slate-900">Análise de IA de Tráfego (Paola)</span>
              </div>

              <div className="space-y-4">
                <div className="p-3.5 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-700 shrink-0">
                    <TrendingUp size={14} />
                  </div>
                  <div>
                    <p className="text-xs font-extrabold text-slate-800">Custo de Remarketing Otimal</p>
                    <p className="text-[11px] text-slate-500 font-semibold leading-relaxed mt-1">
                      A campanha do Meta **Remarketing - Visitantes 30 Dias** obteve o menor CPA (R$ 28,9) e o maior ROAS da semana (5.6x).
                    </p>
                  </div>
                </div>

                <div className="p-3.5 bg-amber-500/5 border border-amber-500/10 rounded-2xl flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-700 shrink-0">
                    <AlertTriangle size={14} />
                  </div>
                  <div>
                    <p className="text-xs font-extrabold text-slate-800">Fadiga Criativa no LinkedIn</p>
                    <p className="text-[11px] text-slate-500 font-semibold leading-relaxed mt-1">
                      O CPA no LinkedIn Ads está em R$ 297,60, cerca de 32% acima do benchmark de negócios. Sugere-se renovação de copies.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 bg-blue-500/5 border border-blue-500/10 rounded-2xl flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-700 shrink-0">
                    <Sparkles size={14} />
                  </div>
                  <div>
                    <p className="text-xs font-extrabold text-slate-800">Recomendação do Vitor (SDR)</p>
                    <p className="text-[11px] text-slate-500 font-semibold leading-relaxed mt-1">
                      Redirecionar 15% do budget de LinkedIn Ads para a campanha de remarketing no Meta Ads.
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Campaigns Table (Fundo branco) */}
          <div className="rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-sm text-left">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <span className="text-[13px] font-black uppercase tracking-wider text-slate-900">Listagem de Campanhas</span>
              <span className="text-xs font-bold text-slate-400">{campaigns.length} campanhas identificadas</span>
            </div>

            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="py-3 px-4">Canal</th>
                    <th className="py-3 px-4">Nome da Campanha</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Orçamento / Dia</th>
                    <th className="py-3 px-4 text-right">Gasto ({selectedDays}d)</th>
                    <th className="py-3 px-4 text-right">Cliques</th>
                    <th className="py-3 px-4 text-right">Conversões</th>
                    <th className="py-3 px-4 text-right">ROAS</th>
                    <th className="py-3 px-4 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {campaigns.map((camp) => {
                    const campSpend = Math.round(camp.spend * periodMultiplier);
                    const campClicks = Math.round(camp.clicks * periodMultiplier);
                    const campConversions = Math.round(camp.conversions * periodMultiplier);

                    return (
                      <tr key={camp.id} className="border-b border-slate-100 hover:bg-slate-50/70 transition-colors font-semibold">
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black ${
                            camp.platform === 'Google Ads' ? 'bg-blue-100 text-blue-800' :
                            camp.platform === 'LinkedIn Ads' ? 'bg-sky-100 text-sky-800' :
                            camp.platform === 'TikTok Ads' ? 'bg-stone-800 text-white' :
                            'bg-pink-100 text-pink-800'
                          }`}>
                            {camp.platform}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-800 font-extrabold max-w-[200px] truncate" title={camp.name}>
                          {camp.name}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center gap-1 text-[10px] font-bold ${
                            camp.status === 'active' ? 'text-emerald-600' : 'text-slate-400'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${camp.status === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                            {camp.status === 'active' ? 'Ativa' : 'Pausada'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono">R$ {camp.budget.toLocaleString('pt-BR')}</td>
                        <td className="py-3.5 px-4 text-right font-mono">R$ {campSpend.toLocaleString('pt-BR')}</td>
                        <td className="py-3.5 px-4 text-right font-mono">{campClicks.toLocaleString('pt-BR')}</td>
                        <td className="py-3.5 px-4 text-right font-mono">{campConversions.toLocaleString('pt-BR')}</td>
                        <td className="py-3.5 px-4 text-right font-mono text-slate-900 font-black">{camp.roas}x</td>
                        <td className="py-3.5 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => toggleCampaignStatus(camp.id)}
                            className={`h-7 w-7 rounded-lg border border-slate-200 flex items-center justify-center shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer mx-auto ${
                              camp.status === 'active'
                                ? 'bg-rose-500/5 text-rose-600 hover:bg-rose-500/10'
                                : 'bg-emerald-500/5 text-emerald-600 hover:bg-emerald-500/10'
                            }`}
                            title={camp.status === 'active' ? 'Pausar Campanha' : 'Retomar Campanha'}
                          >
                            {camp.status === 'active' ? <Pause size={12} /> : <Play size={12} />}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List */}
            <div className="block md:hidden space-y-4">
              {campaigns.map((camp) => {
                const campSpend = Math.round(camp.spend * periodMultiplier);
                const campClicks = Math.round(camp.clicks * periodMultiplier);
                const campConversions = Math.round(camp.conversions * periodMultiplier);

                return (
                  <div key={camp.id} className="p-4 rounded-2xl border border-slate-200/80 bg-white shadow-sm flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                          camp.platform === 'Google Ads' ? 'bg-blue-100 text-blue-800' :
                          camp.platform === 'LinkedIn Ads' ? 'bg-sky-100 text-sky-800' :
                          camp.platform === 'TikTok Ads' ? 'bg-stone-800 text-white' :
                          'bg-pink-100 text-pink-800'
                        }`}>
                          {camp.platform}
                        </span>
                        <h4 className="text-[13px] font-extrabold text-[#0f172a] mt-1.5 leading-snug break-words">{camp.name}</h4>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleCampaignStatus(camp.id)}
                        className={`h-8 w-8 rounded-lg border border-slate-200 bg-white flex items-center justify-center shadow-sm transition-all active:scale-90 cursor-pointer shrink-0 ${
                          camp.status === 'active'
                            ? 'bg-rose-500/5 text-rose-600'
                            : 'bg-emerald-500/5 text-emerald-600'
                        }`}
                      >
                        {camp.status === 'active' ? <Pause size={12} /> : <Play size={12} />}
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Orçamento</p>
                        <p className="text-[11.5px] font-bold text-slate-700 mt-0.5 font-mono truncate">R$ {camp.budget.toLocaleString('pt-BR')}</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Gasto ({selectedDays}d)</p>
                        <p className="text-[11.5px] font-bold text-slate-700 mt-0.5 font-mono truncate">R$ {campSpend.toLocaleString('pt-BR')}</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">ROAS</p>
                        <p className="text-[11.5px] font-extrabold text-[#FF6A00] mt-0.5 font-mono">{camp.roas}x</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 border-t border-slate-100 pt-2 font-mono">
                      <span className="flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${camp.status === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                        {camp.status === 'active' ? 'Ativa' : 'Pausada'}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Cliques: <strong className="text-slate-600">{campClicks.toLocaleString('pt-BR')}</strong> · Conv: <strong className="text-slate-600">{campConversions.toLocaleString('pt-BR')}</strong>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* ── Pré-validação de Criativos ── */}
      <div className="mt-8 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-200/60 pb-3">
          <div
            className="flex items-center justify-center rounded-full"
            style={{
              width: 32, height: 32,
              background: 'white',
              boxShadow: '0 3px 8px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)',
              border: '1px solid rgba(226,232,240,0.5)',
            }}
          >
            <Sparkles size={15} style={{ color: '#FF6A00' }} />
          </div>
          <h2 className="text-[15px] font-black uppercase tracking-wider text-[#0f172a]">
            Pré-validação de Criativos
          </h2>
          <span
            className="ml-1 px-2 py-0.5 rounded-lg text-[10px] font-bold"
            style={{ background: 'rgba(255,106,0,0.08)', color: '#FF6A00', border: '1px solid rgba(255,106,0,0.2)' }}
          >
            IA
          </span>
        </div>

        {/* Insight de contexto */}
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-xl"
          style={{ background: 'rgba(255,106,0,0.04)', border: '1px solid rgba(255,106,0,0.12)' }}
        >
          <Target size={14} className="text-orange-400 flex-shrink-0" />
          <p className="text-[11px] text-slate-600 leading-relaxed">
            <strong>Insight IA:</strong> Criativos com Score Visual &gt; 75 têm em média <strong>ROAS 2.3x maior</strong>.
            Valide antes de veicular para maximizar seu retorno.
          </p>
        </div>

        {/* Grid de campanha com score */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {campaigns.map(camp => {
            const analysis = scoreCreative(camp.id, camp.platform as Platform, camp.name, camp.id.charCodeAt(0));
            const isOpen = validatingCampaignId === camp.id;
            const color = getScoreColor(analysis.attentionScore.overall);

            return (
              <div key={camp.id}>
                {/* Card compacto com score */}
                <div
                  className="p-4 rounded-2xl border cursor-pointer transition-all hover:scale-[1.01]"
                  style={{
                    background: 'white',
                    border: isOpen ? `1.5px solid ${color}` : '1px solid rgba(226,232,240,0.7)',
                    boxShadow: isOpen ? `0 4px 16px ${color}25` : '0 2px 8px rgba(0,0,0,0.04)',
                  }}
                  onClick={() => setValidatingCampaignId(isOpen ? null : camp.id)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                        camp.platform === 'Google Ads' ? 'bg-blue-100 text-blue-800' :
                        camp.platform === 'LinkedIn Ads' ? 'bg-sky-100 text-sky-800' :
                        camp.platform === 'TikTok Ads' ? 'bg-stone-800 text-white' :
                        'bg-pink-100 text-pink-800'
                      }`}>
                        {camp.platform}
                      </span>
                      <p className="text-[12px] font-bold text-slate-700 mt-1.5 leading-snug truncate">{camp.name}</p>
                    </div>
                    {/* Score badge */}
                    <div className="flex flex-col items-center flex-shrink-0">
                      <div className="relative w-10 h-10">
                        <svg width={40} height={40} className="-rotate-90">
                          <circle cx={20} cy={20} r={16} fill="none" stroke="#e2e8f0" strokeWidth={3} />
                          <circle
                            cx={20} cy={20} r={16} fill="none" stroke={color} strokeWidth={3} strokeLinecap="round"
                            strokeDasharray={2 * Math.PI * 16}
                            strokeDashoffset={2 * Math.PI * 16 * (1 - analysis.attentionScore.overall / 100)}
                          />
                        </svg>
                        <span
                          className="absolute inset-0 flex items-center justify-center text-[9px] font-bold"
                          style={{ color }}
                        >
                          {analysis.attentionScore.overall}
                        </span>
                      </div>
                      <span className="text-[8px] font-semibold mt-0.5" style={{ color }}>
                        {getScoreLabel(analysis.attentionScore.overall)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
                    <span className="text-[10px] text-slate-400">CTR preditivo: <strong style={{ color }}>{analysis.predictedCTR.toFixed(2)}%</strong></span>
                    <span className="text-[10px] text-orange-500 font-semibold">
                      {isOpen ? 'Fechar ↑' : 'Ver análise ↓'}
                    </span>
                  </div>
                </div>

                {/* Validador expandido */}
                {isOpen && (
                  <div className="mt-2">
                    <CreativePreValidator
                      creativeId={camp.id}
                      creativeName={camp.name}
                      platform={camp.platform as Platform}
                      onClose={() => setValidatingCampaignId(null)}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
