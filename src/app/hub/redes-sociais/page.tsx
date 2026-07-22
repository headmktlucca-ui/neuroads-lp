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
  Sparkles,
  Plus,
  Loader2,
  RefreshCw,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { loadUserConnections, type ConnectionsMap } from '../../../lib/connector-save';
import { 
  extractSocialMetrics, 
  type AggregateSocialMetrics,
  type SocialPostItem 
} from '../../../lib/social-metrics-extractor';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { 
  IconSocialMedia3D,
  IconFollowers3D, 
  IconReach3D, 
  IconLikes3D, 
  IconEngagement3D 
} from '../../../components/hub/HubUiIcons3D';

// Helper to calculate dynamic comparison dates for period selector cards
function getComparisonDates(days: number) {
  const today = new Date();
  
  // Previous comparison period start and end
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

export default function RedesSociaisDashboardPage() {
  const { user } = useAuth();
  const [connections, setConnections] = useState<ConnectionsMap>({});
  const [selectedDays, setSelectedDays] = useState<number>(30); // Default active period: 30 days
  const [realMetrics, setRealMetrics] = useState<AggregateSocialMetrics | null>(null);
  const [isLoadingMetrics, setIsLoadingMetrics] = useState<boolean>(false);

  // Table Sorting state
  const [sortColumn, setSortColumn] = useState<keyof SocialPostItem>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    async function fetchConnectionsAndMetrics() {
      if (!user) return;
      setIsLoadingMetrics(true);
      try {
        const userConns = await loadUserConnections(user.uid);
        setConnections(userConns);

        const metrics = await extractSocialMetrics(user.uid, userConns, selectedDays);
        setRealMetrics(metrics);
      } catch (err) {
        console.error('Error loading social metrics:', err);
      } finally {
        setIsLoadingMetrics(false);
      }
    }

    fetchConnectionsAndMetrics();
  }, [user, selectedDays]);

  const refreshMetrics = async () => {
    if (!user) return;
    setIsLoadingMetrics(true);
    try {
      const userConns = await loadUserConnections(user.uid);
      setConnections(userConns);
      const metrics = await extractSocialMetrics(user.uid, userConns, selectedDays);
      setRealMetrics(metrics);
    } catch (err) {
      console.error('Error refreshing social metrics:', err);
    } finally {
      setIsLoadingMetrics(false);
    }
  };

  const activeChannels = useMemo(() => {
    return {
      instagram: Boolean(connections['instagram']?.isActive),
      linkedinPage: Boolean(connections['linkedinPage']?.isActive),
      tiktok: Boolean(connections['tiktok']?.isActive),
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

  const kpis = useMemo(() => {
    if (!hasConnected || !realMetrics) {
      return [
        { label: 'Seguidores Totais', value: '0', sub: 'Sem canais conectados', evolution: null, icon: IconFollowers3D, isNa: true },
        { label: 'Alcance Médio', value: '0', sub: 'Sem tráfego ativo', evolution: null, icon: IconReach3D, isNa: true },
        { label: 'Reações / Curtidas', value: '0', sub: 'Sem interações', evolution: null, icon: IconLikes3D, isNa: true },
        { label: 'Taxa de Engajamento', value: '0.0%', sub: 'Sem engajamento', evolution: null, icon: IconEngagement3D, isNa: true }
      ];
    }

    return [
      { 
        label: 'Seguidores Totais', 
        value: realMetrics.totalFollowers.toLocaleString('pt-BR'), 
        sub: realMetrics.followersSubtext, 
        evolution: realMetrics.followersEvolution,
        icon: IconFollowers3D, 
        isNa: false 
      },
      { 
        label: 'Alcance Médio', 
        value: realMetrics.totalReach.toLocaleString('pt-BR'), 
        sub: realMetrics.reachSubtext, 
        evolution: realMetrics.reachEvolution,
        icon: IconReach3D, 
        isNa: false 
      },
      { 
        label: 'Reações / Curtidas', 
        value: realMetrics.totalLikes.toLocaleString('pt-BR'), 
        sub: realMetrics.likesSubtext, 
        evolution: realMetrics.likesEvolution,
        icon: IconLikes3D, 
        isNa: false 
      },
      { 
        label: 'Taxa de Engajamento', 
        value: realMetrics.avgEngagementRate, 
        sub: realMetrics.engagementSubtext, 
        evolution: realMetrics.engagementEvolution,
        icon: IconEngagement3D, 
        isNa: false 
      }
    ];
  }, [hasConnected, realMetrics]);

  const growthChartData = useMemo(() => {
    if (!realMetrics?.growthData || realMetrics.growthData.length === 0) {
      return [];
    }
    return realMetrics.growthData;
  }, [realMetrics]);

  // Handle column sorting toggle
  const handleSort = (columnKey: keyof SocialPostItem) => {
    if (sortColumn === columnKey) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(columnKey);
      setSortDirection('desc');
    }
  };

  // Sort post list according to active column and direction
  const sortedPostsList = useMemo(() => {
    const rawPosts = realMetrics?.recentPosts ?? [];
    if (rawPosts.length === 0) return [];

    return [...rawPosts].sort((a, b) => {
      let valA: string | number = a[sortColumn];
      let valB: string | number = b[sortColumn];

      if (sortColumn === 'date') {
        const parseDate = (dStr: string) => {
          const parts = dStr.split('/');
          if (parts.length === 3) {
            return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0])).getTime();
          }
          return 0;
        };
        valA = parseDate(a.date);
        valB = parseDate(b.date);
      } else if (sortColumn === 'engagementRate') {
        valA = parseFloat(a.engagementRate) || 0;
        valB = parseFloat(b.engagementRate) || 0;
      }

      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortDirection === 'asc' ? valA - valB : valB - valA;
      }

      const strA = String(valA).toLowerCase();
      const strB = String(valB).toLowerCase();
      return sortDirection === 'asc' ? strA.localeCompare(strB) : strB.localeCompare(strA);
    }).slice(0, 10);
  }, [realMetrics, sortColumn, sortDirection]);

  return (
    <div className="space-y-6 text-slate-800 animate-in fade-in duration-300">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <IconSocialMedia3D size={32} />
            Redes Sociais
          </h1>
          <p className="text-sm font-semibold text-slate-500 mt-1 leading-relaxed">
            Acompanhe o engajamento orgânico, crescimento de comunidade e postagens extraídos diretamente dos seus canais ativos.
          </p>
        </div>

        {/* Refresh & Action Button */}
        <div className="flex items-center gap-3 self-start md:self-auto lg:mt-6">
          {connectedCount > 0 && (
            <button
              onClick={refreshMetrics}
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { key: 'instagram', name: 'Instagram', desc: 'Instagram Business Graph' },
          { key: 'linkedinPage', name: 'LinkedIn Page', desc: 'Página Corporativa B2B' },
          { key: 'tiktok', name: 'TikTok', desc: 'Perfil Criativo & Vídeos' }
        ].map((platform) => {
          const isConnected = activeChannels[platform.key as keyof typeof activeChannels];
          const channelDetail = realMetrics?.channelDetails?.[platform.key];
          return (
            <div 
              key={platform.key}
              className="rounded-2xl border border-slate-200/80 bg-white p-4 flex items-center justify-between shadow-sm hover:shadow-md transition-all"
            >
              <div>
                <p className="text-[14px] font-black text-slate-800 leading-tight">{platform.name}</p>
                <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
                  {isConnected && channelDetail?.accountName ? channelDetail.accountName : platform.desc}
                </p>
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

      {isLoadingMetrics && (
        <div className="flex items-center justify-center p-8 text-slate-500 gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-[#FF6A00]" />
          <span className="text-xs font-bold uppercase tracking-wider">Carregando métricas dos canais ativos...</span>
        </div>
      )}

      {!hasConnected ? (
        /* Empty State (Fundo branco) */
        <div className="rounded-[32px] border border-slate-200/80 bg-white p-8 text-center shadow-sm max-w-2xl mx-auto py-16">
          <div className="w-16 h-16 rounded-full border border-slate-200 bg-white shadow-sm flex items-center justify-center mx-auto mb-6 text-slate-400">
            <IconSocialMedia3D size={28} />
          </div>
          <h3 className="text-xl font-black text-slate-900 tracking-tight">Nenhum Canal Social Conectado</h3>
          <p className="text-sm font-semibold text-slate-500 mt-2 max-w-md mx-auto leading-relaxed">
            Conecte suas páginas corporativas do LinkedIn, Instagram ou TikTok para monitorar métricas e posts orgânicos automaticamente.
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
                      <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider mt-1">{kpi.label}</span>
                      <div className="shrink-0 flex items-center justify-center">
                        <KpiIcon size={34} className={kpi.isNa ? 'opacity-40 grayscale' : ''} />
                      </div>
                    </div>

                    <p className="text-2xl font-black text-slate-900 tracking-tight font-mono">{kpi.value}</p>
                    <p className="text-[10px] font-semibold text-slate-400 mt-0.5">{kpi.sub}</p>
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

          {/* Analytics Chart & Insights (Cards com fundo branco) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Chart Area */}
            <div className="lg:col-span-2 rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <Activity size={16} className="text-[#FF6A00]" />
                  <span className="text-[13px] font-black uppercase tracking-wider text-slate-900">
                    Crescimento de Audiência & Alcance ({selectedDays} dias)
                  </span>
                </div>
                <span className="text-[10px] font-bold text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full uppercase">
                  Últimos {selectedDays} dias
                </span>
              </div>

              <div className="h-60 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={growthChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(226,232,240,0.7)" />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                    <YAxis yAxisId="left" tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                    <RechartsTooltip 
                      contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)', fontSize: '11px', fontWeight: 'bold', backgroundColor: '#ffffff' }}
                      labelStyle={{ color: '#0f172a', marginBottom: '4px' }}
                    />
                    <Line yAxisId="left" type="monotone" dataKey="Seguidores" name="Seguidores" stroke="#FF6A00" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                    <Line yAxisId="right" type="monotone" dataKey="Alcance" name="Alcance" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="flex items-center justify-center gap-6 text-[10px] font-black uppercase text-slate-500 pt-4 border-t border-slate-100 mt-4">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FF6A00]" />
                  <span>Seguidores (Soma)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#2563eb]" />
                  <span>Alcance Orgânico</span>
                </div>
              </div>
            </div>

            {/* Social Insights Panel */}
            <div className="rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-sm flex flex-col gap-4 text-left">
              <div className="border-b border-slate-100 pb-3">
                <span className="text-[13px] font-black uppercase tracking-wider text-slate-900">Análise de IA de Conteúdo</span>
              </div>

              <div className="space-y-4">
                {(realMetrics?.insights && realMetrics.insights.length > 0) ? (
                  realMetrics.insights.map((insight, i) => (
                    <div 
                      key={i} 
                      className={`p-3.5 rounded-2xl flex items-start gap-3 border ${
                        insight.type === 'trending' ? 'bg-emerald-500/5 border-emerald-500/10' :
                        insight.type === 'recommendation' ? 'bg-blue-500/5 border-blue-500/10' :
                        'bg-amber-500/5 border-amber-500/10'
                      }`}
                    >
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border ${
                        insight.type === 'trending' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700' :
                        insight.type === 'recommendation' ? 'bg-blue-500/10 border-blue-500/20 text-blue-700' :
                        'bg-amber-500/10 border-amber-500/20 text-amber-700'
                      }`}>
                        {insight.type === 'trending' ? <TrendingUp size={14} /> :
                         insight.type === 'recommendation' ? <Sparkles size={14} /> :
                         <AlertTriangle size={14} />}
                      </div>
                      <div>
                        <p className="text-xs font-extrabold text-slate-800">{insight.title}</p>
                        <p className="text-[11px] text-slate-500 font-semibold leading-relaxed mt-1">
                          {insight.description}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-2xl">
                    <p className="text-xs font-extrabold text-slate-700">Aguardando dados de IA</p>
                    <p className="text-[11px] text-slate-500 mt-1">Carregando contexto dos canais para gerar recomendações.</p>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Social Posts Table with Interactive Sort (Fundo branco) */}
          <div className="rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-sm text-left">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <span className="text-[13px] font-black uppercase tracking-wider text-slate-900">
                Publicações Recentes (Canais Ativos)
              </span>
              <span className="text-xs font-bold text-slate-400">{sortedPostsList.length} posts identificados</span>
            </div>

            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider select-none">
                    {[
                      { key: 'platform', label: 'Plataforma', align: 'left' },
                      { key: 'title', label: 'Conteúdo / Título', align: 'left' },
                      { key: 'date', label: 'Data de Publicação', align: 'left' },
                      { key: 'reach', label: 'Alcance', align: 'right' },
                      { key: 'likes', label: 'Curtidas', align: 'right' },
                      { key: 'comments', label: 'Comentários', align: 'right' },
                      { key: 'shares', label: 'Compartilhamentos', align: 'right' },
                      { key: 'engagementRate', label: 'Taxa de Engajamento', align: 'right' },
                    ].map((col) => {
                      const isSorted = sortColumn === col.key;
                      return (
                        <th
                          key={col.key}
                          onClick={() => handleSort(col.key as keyof SocialPostItem)}
                          className={`py-3 px-4 cursor-pointer hover:text-slate-800 transition-colors ${
                            col.align === 'right' ? 'text-right' : 'text-left'
                          } ${isSorted ? 'text-[#FF6A00] font-black' : ''}`}
                        >
                          <div className={`inline-flex items-center gap-1 ${col.align === 'right' ? 'justify-end' : 'justify-start'}`}>
                            <span>{col.label}</span>
                            {isSorted ? (
                              sortDirection === 'asc' ? <ChevronUp size={13} /> : <ChevronDown size={13} />
                            ) : (
                              <ChevronDown size={12} className="opacity-0 group-hover:opacity-40 transition-opacity" />
                            )}
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {sortedPostsList.map((post) => (
                    <tr key={post.id} className="border-b border-slate-100 hover:bg-slate-50/70 transition-colors font-semibold">
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black ${
                          post.platform === 'LinkedIn Page' ? 'bg-sky-100 text-sky-800' :
                          post.platform === 'TikTok' ? 'bg-stone-800 text-white' :
                          'bg-pink-100 text-pink-800'
                        }`}>
                          {post.platform}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-800 font-extrabold max-w-[240px] truncate" title={post.title}>
                        {post.title}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 font-medium">{post.date}</td>
                      <td className="py-3.5 px-4 text-right font-mono">{post.reach.toLocaleString('pt-BR')}</td>
                      <td className="py-3.5 px-4 text-right font-mono">{post.likes.toLocaleString('pt-BR')}</td>
                      <td className="py-3.5 px-4 text-right font-mono">{post.comments.toLocaleString('pt-BR')}</td>
                      <td className="py-3.5 px-4 text-right font-mono">{post.shares.toLocaleString('pt-BR')}</td>
                      <td className="py-3.5 px-4 text-right font-mono text-[#FF6A00] font-black">{post.engagementRate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List */}
            <div className="block md:hidden space-y-4">
              {sortedPostsList.map((post) => (
                <div key={post.id} className="p-4 rounded-2xl border border-slate-200/80 bg-white shadow-sm flex flex-col gap-3">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                        post.platform === 'LinkedIn Page' ? 'bg-sky-100 text-sky-800' :
                        post.platform === 'TikTok' ? 'bg-stone-800 text-white' :
                        'bg-pink-100 text-pink-800'
                      }`}>
                        {post.platform}
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold">{post.date}</span>
                    </div>
                    <h4 className="text-[13px] font-extrabold text-[#0f172a] mt-1.5 leading-snug break-words">{post.title}</h4>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Alcance</p>
                      <p className="text-[11.5px] font-bold text-slate-700 mt-0.5 font-mono">{post.reach.toLocaleString('pt-BR')}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Engajamento</p>
                      <p className="text-[11.5px] font-extrabold text-[#FF6A00] mt-0.5 font-mono">{post.engagementRate}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 border-t border-slate-100 pt-2 font-mono">
                    <span>Curtidas: <strong className="text-slate-600">{post.likes.toLocaleString('pt-BR')}</strong></span>
                    <span>Comments: <strong className="text-slate-600">{post.comments.toLocaleString('pt-BR')}</strong></span>
                    <span>Shares: <strong className="text-slate-600">{post.shares.toLocaleString('pt-BR')}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
