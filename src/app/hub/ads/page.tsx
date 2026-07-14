'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  Megaphone, 
  TrendingUp, 
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
  Plus
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { loadUserConnections, type ConnectionsMap } from '../../../lib/connector-save';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

// Mock campaigns for demo
const MOCK_CAMPAIGNS = [
  { id: '1', platform: 'Meta Ads', name: 'BF2026 - Conversão - Lookalike 1-3%', status: 'active', budget: 12000, spend: 9450, impressions: 245000, clicks: 8200, conversions: 380, cpa: 24.8, roas: 4.8 },
  { id: '2', platform: 'Google Ads', name: 'Institucional - Institucional & Marca', status: 'active', budget: 5000, spend: 3200, impressions: 84000, clicks: 12400, conversions: 110, cpa: 29.0, roas: 3.9 },
  { id: '3', platform: 'Meta Ads', name: 'Remarketing - Visitantes 30 Dias', status: 'active', budget: 8000, spend: 7100, impressions: 112000, clicks: 4300, conversions: 245, cpa: 28.9, roas: 5.6 },
  { id: '4', platform: 'LinkedIn Ads', name: 'B2B - Decisores e Diretores - TI', status: 'paused', budget: 15000, spend: 12500, impressions: 45000, clicks: 920, conversions: 42, cpa: 297.6, roas: 2.1 },
  { id: '5', platform: 'TikTok Ads', name: 'Desafio Hashtag - Topo de Funil', status: 'active', budget: 6000, spend: 4100, impressions: 380000, clicks: 15600, conversions: 95, cpa: 43.1, roas: 1.8 }
];

const CHART_DATA = [
  { name: 'Seg', 'Gasto (R$)': 1200, 'Conversões': 45 },
  { name: 'Ter', 'Gasto (R$)': 1500, 'Conversões': 58 },
  { name: 'Qua', 'Gasto (R$)': 1800, 'Conversões': 72 },
  { name: 'Qui', 'Gasto (R$)': 1400, 'Conversões': 61 },
  { name: 'Sex', 'Gasto (R$)': 2100, 'Conversões': 85 },
  { name: 'Sáb', 'Gasto (R$)': 1600, 'Conversões': 69 },
  { name: 'Dom', 'Gasto (R$)': 1300, 'Conversões': 52 }
];

export default function AdsDashboardPage() {
  const { user } = useAuth();
  const [connections, setConnections] = useState<ConnectionsMap>({});
  const [demoMode, setDemoMode] = useState(false);
  const [campaigns, setCampaigns] = useState(MOCK_CAMPAIGNS);

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
  const hasConnected = connectedCount > 0 || demoMode;

  const kpis = useMemo(() => {
    if (!hasConnected) {
      return [
        { label: 'Investimento Total', value: 'R$ 0,00', sub: 'Sem canais conectados', icon: DollarSign, isNa: true },
        { label: 'Cliques Totais', value: '0', sub: 'Sem tráfego ativo', icon: MousePointerClick, isNa: true },
        { label: 'Conversões', value: '0', sub: 'Sem rastreamento', icon: Target, isNa: true },
        { label: 'ROAS Médio', value: '0.0x', sub: 'Sem receita de anúncios', icon: TrendingUp, isNa: true }
      ];
    }
    const totalSpend = campaigns.reduce((acc, c) => acc + (c.status === 'active' ? c.spend : 0), 0);
    const totalClicks = campaigns.reduce((acc, c) => acc + (c.status === 'active' ? c.clicks : 0), 0);
    const totalConversions = campaigns.reduce((acc, c) => acc + (c.status === 'active' ? c.conversions : 0), 0);
    const avgRoas = (campaigns.reduce((acc, c) => acc + (c.status === 'active' ? c.roas : 0), 0) / campaigns.filter(c => c.status === 'active').length).toFixed(1);

    return [
      { label: 'Investimento Total', value: `R$ ${totalSpend.toLocaleString('pt-BR')}`, sub: 'Campanhas ativas no período', icon: DollarSign, isNa: false },
      { label: 'Cliques Totais', value: totalClicks.toLocaleString('pt-BR'), sub: 'Tráfego gerado via anúncios', icon: MousePointerClick, isNa: false },
      { label: 'Conversões', value: totalConversions.toLocaleString('pt-BR'), sub: 'Eventos de compra / lead', icon: Target, isNa: false },
      { label: 'ROAS Médio', value: `${avgRoas}x`, sub: 'Retorno sobre investimento', icon: TrendingUp, isNa: false }
    ];
  }, [hasConnected, campaigns]);

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
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">
            <span>Operações</span>
            <ChevronRight size={12} />
            <span className="text-[#FF6A00]">Ads</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Megaphone className="text-[#FF6A00]" size={28} />
            Campanhas Patrocinadas
          </h1>
          <p className="text-sm font-semibold text-slate-500 mt-1 leading-relaxed">
            Monitore o desempenho das mídias pagas da sua marca nos canais configurados.
          </p>
        </div>

        {/* Demo Toggle & Action Button */}
        <div className="flex items-center gap-3 self-start md:self-auto">
          {connectedCount === 0 && (
            <label className="relative inline-flex items-center cursor-pointer select-none">
              <input 
                type="checkbox" 
                checked={demoMode} 
                onChange={(e) => setDemoMode(e.target.checked)} 
                className="sr-only peer"
              />
              <div className="w-10 h-6 bg-slate-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF6B00]"></div>
              <span className="ml-2 text-xs font-bold text-slate-500 uppercase tracking-wide">Modo Demo</span>
            </label>
          )}

          <Link
            href="/hub/integracoes"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/50 bg-[#eef2f7] text-[12px] font-bold text-slate-600 shadow-[3px_3px_6px_#d1d9e6,_-3px_-3px_6px_#ffffff] hover:shadow-[inset_2px_2px_4px_#d1d9e6,_inset_-2px_-2px_4px_#ffffff] transition-all hover:scale-105 active:scale-95 duration-200 cursor-pointer"
          >
            <Plus size={14} />
            <span>Gerenciar Canais</span>
          </Link>
        </div>
      </div>

      {/* Integration Status Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { key: 'metaAds', name: 'Meta Ads', desc: 'Facebook & Instagram' },
          { key: 'googleAds', name: 'Google Ads', desc: 'Search & YouTube' },
          { key: 'linkedinAds', name: 'LinkedIn Ads', desc: 'Campanhas B2B' },
          { key: 'tiktokAds', name: 'TikTok Ads', desc: 'Vídeos Patrocinados' }
        ].map((platform) => {
          const isConnected = activeChannels[platform.key as keyof typeof activeChannels] || (demoMode && platform.key !== 'linkedinAds');
          return (
            <div 
              key={platform.key}
              className="rounded-2xl border border-white/80 bg-[#eef2f7] p-4 flex items-center justify-between shadow-[5px_5px_15px_#c2cbd9,_-5px_-5px_15px_#ffffff] transition-all hover:scale-[1.02]"
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
        /* Empty State */
        <div className="rounded-[32px] border border-white/80 bg-[#eef2f7] p-8 text-center shadow-[10px_10px_30px_#c2cbd9,_-10px_-10px_30px_#ffffff] max-w-2xl mx-auto py-16">
          <div className="w-16 h-16 rounded-full border border-white bg-[#eef2f7] shadow-[4px_4px_10px_#c2cbd9,_-4px_-4px_10px_#ffffff] flex items-center justify-center mx-auto mb-6 text-slate-400">
            <Megaphone size={28} />
          </div>
          <h3 className="text-xl font-black text-slate-900 tracking-tight">Nenhuma Plataforma de Anúncios Conectada</h3>
          <p className="text-sm font-semibold text-slate-500 mt-2 max-w-md mx-auto leading-relaxed">
            Conecte suas contas do Meta Ads, Google Ads ou outras plataformas de tráfego para visualizar dados reais das suas campanhas.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <button 
              onClick={() => setDemoMode(true)}
              className="px-5 py-2.5 rounded-xl border border-[#FF6A00]/20 bg-[#FF6A00]/5 text-[12px] font-bold uppercase tracking-wider text-[#FF6A00] hover:bg-[#FF6A00]/10 transition-all cursor-pointer"
            >
              Visualizar Dados Demo
            </button>
            <Link 
              href="/hub/integracoes"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-br from-[#FF6A00] to-[#FF8805] text-[12px] font-bold uppercase tracking-wider text-white shadow-[3px_3px_6px_rgba(255,106,0,0.2),_-3px_-3px_6px_#ffffff] hover:brightness-105 active:scale-95 transition-all cursor-pointer"
            >
              Conectar Agora
            </Link>
          </div>
        </div>
      ) : (
        /* Content Panel */
        <>
          {/* KPI Dashboard Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {kpis.map((kpi, idx) => {
              const KpiIcon = kpi.icon;
              return (
                <div 
                  key={idx}
                  className="rounded-2xl border border-white/80 bg-[#eef2f7] p-5 shadow-[6px_6px_18px_#c2cbd9,_-6px_-6px_18px_#ffffff]"
                >
                  <div className="flex justify-between items-start gap-2 mb-3">
                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">{kpi.label}</span>
                    <div className="w-7 h-7 rounded-xl border border-white/60 bg-white flex items-center justify-center text-slate-500 shadow-sm">
                      <KpiIcon size={14} className={kpi.isNa ? 'text-slate-300' : 'text-[#FF6A00]'} />
                    </div>
                  </div>

                  <p className="text-2xl font-black text-slate-900 tracking-tight font-mono">{kpi.value}</p>
                  <p className="text-[10px] font-semibold text-slate-500 mt-1">{kpi.sub}</p>
                </div>
              );
            })}
          </div>

          {/* Analytics Chart & Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Chart Area */}
            <div className="lg:col-span-2 rounded-[28px] border border-white/80 bg-[#eef2f7] p-6 shadow-[10px_10px_30px_#c2cbd9,_-10px_-10px_30px_#ffffff] flex flex-col justify-between">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <Activity size={16} className="text-[#FF6A00]" />
                  <span className="text-[13px] font-black uppercase tracking-wider text-slate-900">Desempenho Semanal</span>
                </div>
                <span className="text-[10px] font-bold text-slate-400 bg-white border border-slate-200 px-2 py-0.5 rounded-full uppercase">Últimos 7 dias</span>
              </div>

              <div className="h-60 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={CHART_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(203,213,225,0.4)" />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                    <YAxis yAxisId="left" tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                    <RechartsTooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', fontSize: '11px', fontWeight: 'bold' }}
                      labelStyle={{ color: '#0f172a', marginBottom: '4px' }}
                    />
                    <Line yAxisId="left" type="monotone" dataKey="Gasto (R$)" name="Investimento (R$)" stroke="#FF6A00" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                    <Line yAxisId="right" type="monotone" dataKey="Conversões" name="Conversões" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="flex items-center justify-center gap-6 text-[10px] font-black uppercase text-slate-500 pt-4 border-t border-slate-200/50 mt-4">
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

            {/* Campaign Config Panel / Info */}
            <div className="rounded-[28px] border border-white/80 bg-[#eef2f7] p-6 shadow-[10px_10px_30px_#c2cbd9,_-10px_-10px_30px_#ffffff] flex flex-col gap-4 text-left">
              <div className="border-b border-slate-200 pb-3">
                <span className="text-[13px] font-black uppercase tracking-wider text-slate-900">Análise de IA de Tráfego</span>
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

          {/* Campaigns Table */}
          <div className="rounded-[28px] border border-white/80 bg-[#eef2f7] p-6 shadow-[10px_10px_30px_#c2cbd9,_-10px_-10px_30px_#ffffff] text-left">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-4">
              <span className="text-[13px] font-black uppercase tracking-wider text-slate-900">Listagem de Campanhas</span>
              <span className="text-xs font-bold text-slate-400">{campaigns.length} campanhas identificadas</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="py-3 px-4">Canal</th>
                    <th className="py-3 px-4">Nome da Campanha</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Orçamento / Dia</th>
                    <th className="py-3 px-4 text-right">Gasto</th>
                    <th className="py-3 px-4 text-right">Cliques</th>
                    <th className="py-3 px-4 text-right">Conversões</th>
                    <th className="py-3 px-4 text-right">ROAS</th>
                    <th className="py-3 px-4 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {campaigns.map((camp) => (
                    <tr key={camp.id} className="border-b border-slate-200/60 hover:bg-white/40 transition-colors font-semibold">
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
                      <td className="py-3.5 px-4 text-right font-mono">R$ {camp.spend.toLocaleString('pt-BR')}</td>
                      <td className="py-3.5 px-4 text-right font-mono">{camp.clicks.toLocaleString('pt-BR')}</td>
                      <td className="py-3.5 px-4 text-right font-mono">{camp.conversions.toLocaleString('pt-BR')}</td>
                      <td className="py-3.5 px-4 text-right font-mono text-slate-900 font-black">{camp.roas}x</td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => toggleCampaignStatus(camp.id)}
                          className={`h-7 w-7 rounded-lg border border-white/60 flex items-center justify-center shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer mx-auto ${
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
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
