'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  Share2, 
  TrendingUp, 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  ChevronRight, 
  Users, 
  Eye, 
  Heart, 
  MessageCircle, 
  MessageSquare,
  Sparkles,
  Plus
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { loadUserConnections, type ConnectionsMap } from '../../../lib/connector-save';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { 
  IconFollowers3D, 
  IconReach3D, 
  IconLikes3D, 
  IconEngagement3D 
} from '../../../components/hub/HubUiIcons3D';

// Mock publications for demo
const MOCK_POSTS = [
  { id: '1', platform: 'Instagram', title: 'Como a IA está revolucionando o comercial B2B', date: '12/07/2026', reach: 45000, likes: 2450, comments: 180, shares: 320, engagementRate: '6.5%' },
  { id: '2', platform: 'LinkedIn Page', title: 'Anunciando a nova rodada de investimento pré-seed da NeuroAds', date: '10/07/2026', reach: 18000, likes: 1120, comments: 85, shares: 140, engagementRate: '7.8%' },
  { id: '3', platform: 'Instagram', title: 'Bastidores: Nosso time de agentes virtuais em ação', date: '08/07/2026', reach: 35000, likes: 1840, comments: 95, shares: 110, engagementRate: '5.6%' },
  { id: '4', platform: 'TikTok', title: 'POV: Você colocou um SDR de IA para ligar para seus leads frios', date: '06/07/2026', reach: 125000, likes: 9200, comments: 450, shares: 1850, engagementRate: '9.2%' },
  { id: '5', platform: 'LinkedIn Page', title: 'Case de Sucesso: 4.8x de ROAS em 30 dias na Logística SA', date: '04/07/2026', reach: 12000, likes: 620, comments: 42, shares: 25, engagementRate: '5.8%' }
];

const FOLLOWERS_GROWTH_DATA = [
  { name: 'Seg', 'Seguidores': 24500, 'Alcance': 15000 },
  { name: 'Ter', 'Seguidores': 24650, 'Alcance': 18500 },
  { name: 'Qua', 'Seguidores': 24800, 'Alcance': 22000 },
  { name: 'Qui', 'Seguidores': 24920, 'Alcance': 19000 },
  { name: 'Sex', 'Seguidores': 25100, 'Alcance': 28000 },
  { name: 'Sáb', 'Seguidores': 25250, 'Alcance': 24000 },
  { name: 'Dom', 'Seguidores': 25380, 'Alcance': 17000 }
];

export default function RedesSociaisDashboardPage() {
  const { user } = useAuth();
  const [connections, setConnections] = useState<ConnectionsMap>({});
  const [demoMode, setDemoMode] = useState(false);

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
      instagram: Boolean(connections['instagram']?.isActive),
      linkedinPage: Boolean(connections['linkedinPage']?.isActive),
      tiktok: Boolean(connections['tiktok']?.isActive),
    };
  }, [connections]);

  const connectedCount = Object.values(activeChannels).filter(Boolean).length;
  const hasConnected = connectedCount > 0 || demoMode;

  const kpis = useMemo(() => {
    if (!hasConnected) {
      return [
        { label: 'Seguidores Totais', value: '0', sub: 'Sem canais conectados', icon: IconFollowers3D, isNa: true },
        { label: 'Alcance Médio', value: '0', sub: 'Sem tráfego ativo', icon: IconReach3D, isNa: true },
        { label: 'Reações / Curtidas', value: '0', sub: 'Sem interações', icon: IconLikes3D, isNa: true },
        { label: 'Taxa de Engajamento', value: '0.0%', sub: 'Sem engajamento', icon: IconEngagement3D, isNa: true }
      ];
    }

    return [
      { label: 'Seguidores Totais', value: '25.380', sub: '+3.2% esta semana', icon: IconFollowers3D, isNa: false },
      { label: 'Alcance Médio', value: '38.500', sub: 'Pessoas alcançadas', icon: IconReach3D, isNa: false },
      { label: 'Reações / Curtidas', value: '15.230', sub: 'Interações no período', icon: IconLikes3D, isNa: false },
      { label: 'Taxa de Engajamento', value: '7.1%', sub: 'Média de interações', icon: IconEngagement3D, isNa: false }
    ];
  }, [hasConnected]);

  return (
    <div className="space-y-6 text-slate-800 animate-in fade-in duration-300">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">
            <span>Operações</span>
            <ChevronRight size={12} />
            <span className="text-[#FF6A00]">Redes Sociais</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Share2 className="text-[#FF6A00]" size={28} />
            Mídias Sociais
          </h1>
          <p className="text-sm font-semibold text-slate-500 mt-1 leading-relaxed">
            Acompanhe o engajamento orgânico, crescimento de comunidade e postagens de sua marca.
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { key: 'instagram', name: 'Instagram', desc: 'Instagram Business Graph' },
          { key: 'linkedinPage', name: 'LinkedIn Page', desc: 'Página Corporativa B2B' },
          { key: 'tiktok', name: 'TikTok', desc: 'Perfil Criativo & Vídeos' }
        ].map((platform) => {
          const isConnected = activeChannels[platform.key as keyof typeof activeChannels] || demoMode;
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
            <Share2 size={28} />
          </div>
          <h3 className="text-xl font-black text-slate-900 tracking-tight">Nenhum Canal Social Conectado</h3>
          <p className="text-sm font-semibold text-slate-500 mt-2 max-w-md mx-auto leading-relaxed">
            Conecte suas páginas corporativas do LinkedIn, Instagram ou TikTok para monitorar métricas e posts orgânicos automaticamente.
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
                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider mt-1">{kpi.label}</span>
                    <div className="shrink-0 flex items-center justify-center">
                      <KpiIcon size={34} className={kpi.isNa ? 'opacity-40 grayscale' : ''} />
                    </div>
                  </div>

                  <p className="text-2xl font-black text-slate-900 tracking-tight font-mono">{kpi.value}</p>
                  <p className="text-[10px] font-semibold text-slate-500 mt-1">{kpi.sub}</p>
                </div>
              );
            })}
          </div>

          {/* Analytics Chart & Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Chart Area */}
            <div className="lg:col-span-2 rounded-[28px] border border-white/80 bg-[#eef2f7] p-6 shadow-[10px_10px_30px_#c2cbd9,_-10px_-10px_30px_#ffffff] flex flex-col justify-between">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <Activity size={16} className="text-[#FF6A00]" />
                  <span className="text-[13px] font-black uppercase tracking-wider text-slate-900">Crescimento de Audiência & Alcance</span>
                </div>
                <span className="text-[10px] font-bold text-slate-400 bg-white border border-slate-200 px-2 py-0.5 rounded-full uppercase">Últimos 7 dias</span>
              </div>

              <div className="h-60 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={FOLLOWERS_GROWTH_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(203,213,225,0.4)" />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                    <YAxis yAxisId="left" tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                    <RechartsTooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', fontSize: '11px', fontWeight: 'bold' }}
                      labelStyle={{ color: '#0f172a', marginBottom: '4px' }}
                    />
                    <Line yAxisId="left" type="monotone" dataKey="Seguidores" name="Seguidores" stroke="#FF6A00" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                    <Line yAxisId="right" type="monotone" dataKey="Alcance" name="Alcance" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="flex items-center justify-center gap-6 text-[10px] font-black uppercase text-slate-500 pt-4 border-t border-slate-200/50 mt-4">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FF6A00]" />
                  <span>Seguidores</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#2563eb]" />
                  <span>Alcance Orgânico</span>
                </div>
              </div>
            </div>

            {/* Social Insights Panel */}
            <div className="rounded-[28px] border border-white/80 bg-[#eef2f7] p-6 shadow-[10px_10px_30px_#c2cbd9,_-10px_-10px_30px_#ffffff] flex flex-col gap-4 text-left">
              <div className="border-b border-slate-200 pb-3">
                <span className="text-[13px] font-black uppercase tracking-wider text-slate-900">Análise de IA de Conteúdo</span>
              </div>

              <div className="space-y-4">
                <div className="p-3.5 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-700 shrink-0">
                    <TrendingUp size={14} />
                  </div>
                  <div>
                    <p className="text-xs font-extrabold text-slate-800">Vídeo Viral no TikTok</p>
                    <p className="text-[11px] text-slate-500 font-semibold leading-relaxed mt-1">
                      O post &quot;POV: Você colocou um SDR de IA&quot; obteve 125.000 visualizações e 9,2% de engajamento, acima da média.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 bg-blue-500/5 border border-blue-500/10 rounded-2xl flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-700 shrink-0">
                    <Sparkles size={14} />
                  </div>
                  <div>
                    <p className="text-xs font-extrabold text-slate-800">Recomendação da Laís (SEO/Conteúdo)</p>
                    <p className="text-[11px] text-slate-500 font-semibold leading-relaxed mt-1">
                      Adaptar o formato de roteiro do TikTok para um carrossel no Instagram focado em atração orgânica.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 bg-amber-500/5 border border-amber-500/10 rounded-2xl flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-700 shrink-0">
                    <AlertTriangle size={14} />
                  </div>
                  <div>
                    <p className="text-xs font-extrabold text-slate-800">Crescimento de LinkedIn Desacelerado</p>
                    <p className="text-[11px] text-slate-500 font-semibold leading-relaxed mt-1">
                      Falta de postagens corporativas frequentes reduziu o alcance semanal em 12%. Sugere-se manter 3 posts/semana.
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Social Posts Table */}
          <div className="rounded-[28px] border border-white/80 bg-[#eef2f7] p-6 shadow-[10px_10px_30px_#c2cbd9,_-10px_-10px_30px_#ffffff] text-left">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-4">
              <span className="text-[13px] font-black uppercase tracking-wider text-slate-900">Publicações Recentes</span>
              <span className="text-xs font-bold text-slate-400">{MOCK_POSTS.length} posts identificados</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="py-3 px-4">Plataforma</th>
                    <th className="py-3 px-4">Conteúdo / Título</th>
                    <th className="py-3 px-4">Data de Publicação</th>
                    <th className="py-3 px-4 text-right">Alcance</th>
                    <th className="py-3 px-4 text-right">Curtidas</th>
                    <th className="py-3 px-4 text-right">Comentários</th>
                    <th className="py-3 px-4 text-right">Compartilhamentos</th>
                    <th className="py-3 px-4 text-right">Taxa de Engajamento</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_POSTS.map((post) => (
                    <tr key={post.id} className="border-b border-slate-200/60 hover:bg-white/40 transition-colors font-semibold">
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
          </div>
        </>
      )}
    </div>
  );
}
