'use client';

import { motion } from 'framer-motion';
import {
  Activity,
  ArrowUpRight,
  Brain,
  Flame,
  Radio,
  Sparkles,
  TrendingUp,
  Users,
  Wallet,
  Zap,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import BentoCard from '../../components/hub/v2/BentoCard';
import CountUp from '../../components/hub/v2/CountUp';
import Sparkline from '../../components/hub/v2/Sparkline';

const NEON = {
  violet: '#a855f7',
  cyan: '#22d3ee',
  emerald: '#34d399',
  amber: '#fbbf24',
  rose: '#fb7185',
  pink: '#ec4899',
};

const channels = [
  { name: 'Google Ads', roas: 8.35, share: 32.5, color: NEON.cyan, points: [7.9, 8.1, 8.0, 8.4, 8.2, 8.3, 8.35] },
  { name: 'TikTok Ads', roas: 9.47, share: 18.7, color: NEON.pink, points: [8.8, 9.2, 9.0, 9.6, 9.3, 9.5, 9.47] },
  { name: 'Meta Ads', roas: 6.21, share: 24.3, color: NEON.violet, points: [6.5, 6.3, 6.1, 6.4, 6.0, 6.3, 6.21] },
  { name: 'YouTube Ads', roas: 5.32, share: 9.5, color: NEON.rose, points: [5.0, 5.2, 5.1, 5.5, 5.2, 5.4, 5.32] },
  { name: 'LinkedIn Ads', roas: 4.38, share: 8.2, color: NEON.emerald, points: [4.0, 4.2, 4.1, 4.5, 4.3, 4.4, 4.38] },
  { name: 'Instagram Ads', roas: 7.12, share: 6.8, color: NEON.amber, points: [6.8, 7.0, 6.9, 7.3, 7.1, 7.0, 7.12] },
];

const activities = [
  { platform: 'Google Ads', detail: 'Nova conversão atribuída', value: '+R$ 128,50', color: NEON.cyan, time: '2s' },
  { platform: 'TikTok Ads', detail: 'ROAS otimizado +12%', value: '9.47x', color: NEON.pink, time: '8s' },
  { platform: 'Meta Ads', detail: 'Novo lead captado', value: 'CPL R$ 34', color: NEON.violet, time: '14s' },
  { platform: 'Instagram', detail: 'Conjunto pausado (CPA)', value: 'auto', color: NEON.rose, time: '22s' },
  { platform: 'YouTube', detail: 'Vídeo concluído 75%', value: '+vw', color: NEON.amber, time: '31s' },
];

const audience = [
  { label: 'High Intent', pct: 35.6, color: NEON.cyan },
  { label: 'Lookalike 1%', pct: 24.3, color: NEON.violet },
  { label: 'Cart Abandoners', pct: 18.7, color: NEON.pink },
  { label: 'Blog Readers', pct: 12.7, color: NEON.amber },
  { label: 'Outros', pct: 8.7, color: NEON.emerald },
];

export default function HubNovoPage() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 3500);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#05050b] text-white">
      {/* Background orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-40 -left-32 h-[520px] w-[520px] rounded-full opacity-50 blur-[120px]"
          style={{ background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)' }}
          animate={{ x: [0, 60, 0], y: [0, 40, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute top-1/3 -right-32 h-[460px] w-[460px] rounded-full opacity-40 blur-[120px]"
          style={{ background: 'radial-gradient(circle, #06b6d4 0%, transparent 70%)' }}
          animate={{ x: [0, -50, 0], y: [0, 60, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-0 left-1/3 h-[400px] w-[400px] rounded-full opacity-30 blur-[120px]"
          style={{ background: 'radial-gradient(circle, #ec4899 0%, transparent 70%)' }}
          animate={{ x: [0, 80, 0], y: [0, -40, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-[1440px] px-6 py-10 lg:px-10 lg:py-14">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-10 flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center"
        >
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 backdrop-blur-xl">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/70">
                Hub · Tempo real
              </span>
            </div>
            <h1 className="bg-gradient-to-br from-white via-white to-white/40 bg-clip-text text-5xl font-black leading-[1.05] tracking-tight text-transparent lg:text-6xl">
              Comando central
              <br />
              <span
                className="bg-gradient-to-r bg-clip-text text-transparent"
                style={{ backgroundImage: `linear-gradient(90deg, ${NEON.violet}, ${NEON.cyan}, ${NEON.pink})` }}
              >
                NeuroAds
              </span>
            </h1>
            <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-white/50">
              Seus agentes de IA monitorando 6 canais em tempo real. ROAS, conversões e otimizações
              em um único painel.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-bold text-white/80 backdrop-blur-xl transition-all hover:border-white/20 hover:text-white">
              <span className="relative z-10 flex items-center gap-2">
                <Brain className="h-4 w-4" /> Assistente
              </span>
            </button>
            <button
              className="group relative overflow-hidden rounded-2xl px-5 py-3 text-sm font-bold text-white shadow-[0_8px_30px_-8px_rgba(168,85,247,0.6)] transition-all hover:scale-[1.02]"
              style={{
                background: `linear-gradient(135deg, ${NEON.violet} 0%, ${NEON.pink} 100%)`,
              }}
            >
              <span className="relative z-10 flex items-center gap-2">
                Nova campanha <ArrowUpRight className="h-4 w-4" />
              </span>
            </button>
          </div>
        </motion.header>

        {/* Bento grid */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-6 lg:grid-cols-12">
          {/* HERO — Receita */}
          <BentoCard
            className="md:col-span-6 lg:col-span-7 lg:row-span-2"
            glowColor="rgba(168, 85, 247, 0.4)"
            accentColor={NEON.violet}
            delay={0.05}
          >
            <div className="flex h-full flex-col justify-between p-7 lg:p-9">
              <div className="flex items-start justify-between">
                <div>
                  <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-500/10 px-3 py-1">
                    <Sparkles className="h-3 w-3 text-violet-300" />
                    <span className="text-[10px] font-black uppercase tracking-[0.18em] text-violet-200">
                      Receita total · 30d
                    </span>
                  </div>
                  <div className="flex items-baseline gap-3">
                    <span
                      className="bg-gradient-to-br from-white to-white/60 bg-clip-text text-7xl font-black leading-none tracking-tight text-transparent lg:text-8xl"
                      style={{ textShadow: '0 0 80px rgba(168,85,247,0.3)' }}
                    >
                      <CountUp value={1284732} prefix="R$ " duration={2} />
                    </span>
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-[13px]">
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-1 font-bold text-emerald-300">
                      <TrendingUp className="h-3 w-3" /> +18,72%
                    </span>
                    <span className="text-white/40">vs. período anterior</span>
                  </div>
                </div>
                <div className="hidden lg:block">
                  <Sparkline points={[150, 160, 155, 170, 185, 178, 192, 188, 210, 225, 240]} color={NEON.violet} width={220} height={70} />
                </div>
              </div>

              {/* Mini KPIs inside hero */}
              <div className="mt-8 grid grid-cols-3 gap-4 border-t border-white/[0.06] pt-6">
                {[
                  { label: 'Investimento', value: 'R$ 247k', color: NEON.amber, trend: '+12,4%' },
                  { label: 'Conversões', value: '12.847', color: NEON.cyan, trend: '+14,9%' },
                  { label: 'Ticket médio', value: 'R$ 100', color: NEON.emerald, trend: '+3,1%' },
                ].map((k) => (
                  <div key={k.label} className="space-y-1">
                    <div className="text-[10px] font-black uppercase tracking-widest text-white/40">
                      {k.label}
                    </div>
                    <div className="text-2xl font-black text-white">{k.value}</div>
                    <div className="text-[11px] font-bold" style={{ color: k.color }}>
                      ↑ {k.trend}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </BentoCard>

          {/* ROAS card */}
          <BentoCard
            className="md:col-span-3 lg:col-span-5"
            glowColor="rgba(52, 211, 153, 0.4)"
            accentColor={NEON.emerald}
            delay={0.1}
          >
            <div className="flex h-full flex-col justify-between p-7">
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1">
                  <Zap className="h-3 w-3 text-emerald-300" />
                  <span className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-200">
                    ROAS médio
                  </span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-white/30">live</span>
              </div>
              <div>
                <div
                  className="bg-gradient-to-br from-emerald-300 to-emerald-500 bg-clip-text text-6xl font-black leading-none text-transparent"
                  style={{ textShadow: '0 0 60px rgba(52,211,153,0.4)' }}
                >
                  <CountUp value={7.57} decimals={2} suffix="x" duration={1.8} />
                </div>
                <div className="mt-3 text-[13px] text-white/50">
                  Para cada R$ 1 investido, você gerou{' '}
                  <span className="font-bold text-emerald-300">R$ 7,57</span>
                </div>
              </div>
            </div>
          </BentoCard>

          {/* Canais bento */}
          <BentoCard
            className="md:col-span-3 lg:col-span-5"
            glowColor="rgba(34, 211, 238, 0.35)"
            accentColor={NEON.cyan}
            delay={0.15}
          >
            <div className="flex h-full flex-col p-7">
              <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Radio className="h-4 w-4 text-cyan-300" />
                  <h3 className="text-[13px] font-black uppercase tracking-[0.16em] text-white/80">
                    Performance por canal
                  </h3>
                </div>
                <span className="rounded-full bg-white/[0.05] px-2 py-0.5 text-[10px] font-bold text-white/60">
                  ROAS
                </span>
              </div>
              <div className="flex-1 space-y-3.5">
                {channels.map((ch, i) => (
                  <motion.div
                    key={ch.name}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.06 }}
                    className="flex items-center gap-3"
                  >
                    <div className="flex w-32 items-center gap-2">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ background: ch.color, boxShadow: `0 0 8px ${ch.color}` }}
                      />
                      <span className="text-[12.5px] font-semibold text-white/85">{ch.name}</span>
                    </div>
                    <div className="relative flex-1 overflow-hidden rounded-full bg-white/[0.04]">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(ch.roas / 10) * 100}%` }}
                        transition={{ duration: 1.2, delay: 0.4 + i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                        className="h-1.5 rounded-full"
                        style={{
                          background: `linear-gradient(90deg, ${ch.color}80, ${ch.color})`,
                          boxShadow: `0 0 12px ${ch.color}80`,
                        }}
                      />
                    </div>
                    <div className="w-14 text-right">
                      <span className="font-mono text-[13px] font-black" style={{ color: ch.color }}>
                        {ch.roas.toFixed(2)}x
                      </span>
                    </div>
                    <div className="w-[60px]">
                      <Sparkline points={ch.points} color={ch.color} width={60} height={20} fillOpacity={0.12} />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </BentoCard>

          {/* Live activity */}
          <BentoCard
            className="md:col-span-3 lg:col-span-4 lg:row-span-2"
            glowColor="rgba(251, 113, 133, 0.35)"
            accentColor={NEON.rose}
            delay={0.2}
          >
            <div className="flex h-full flex-col p-7">
              <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                  >
                    <Activity className="h-4 w-4 text-rose-300" />
                  </motion.div>
                  <h3 className="text-[13px] font-black uppercase tracking-[0.16em] text-white/80">
                    Stream ao vivo
                  </h3>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/15 px-2 py-0.5 text-[10px] font-bold text-rose-300">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-rose-400" /> ao vivo
                </span>
              </div>

              <div key={tick} className="flex-1 space-y-3 overflow-hidden">
                {activities.map((a, i) => (
                  <motion.div
                    key={`${tick}-${a.platform}-${i}`}
                    initial={{ opacity: 0, y: 12, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: i * 0.08, duration: 0.5 }}
                    className="group/row relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3 backdrop-blur-sm transition-all hover:border-white/[0.14] hover:bg-white/[0.04]"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[11px] font-black"
                        style={{
                          background: `linear-gradient(135deg, ${a.color}30, ${a.color}10)`,
                          color: a.color,
                          boxShadow: `inset 0 0 12px ${a.color}20`,
                        }}
                      >
                        {a.platform.charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate text-[12.5px] font-bold text-white">
                            {a.platform}
                          </span>
                          <span className="text-[10px] font-mono text-white/30">há {a.time}</span>
                        </div>
                        <p className="mt-0.5 truncate text-[11.5px] text-white/55">{a.detail}</p>
                        <p className="mt-1 text-[11px] font-bold" style={{ color: a.color }}>
                          {a.value}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </BentoCard>

          {/* Audience donut */}
          <BentoCard
            className="md:col-span-3 lg:col-span-4"
            glowColor="rgba(251, 191, 36, 0.35)"
            accentColor={NEON.amber}
            delay={0.25}
          >
            <div className="flex h-full flex-col p-7">
              <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-amber-300" />
                  <h3 className="text-[13px] font-black uppercase tracking-[0.16em] text-white/80">
                    Audiência
                  </h3>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-white/30">
                  segmentos
                </span>
              </div>

              <div className="flex flex-1 items-center gap-5">
                <DonutChart segments={audience} />
                <div className="flex-1 space-y-2">
                  {audience.map((s, i) => (
                    <motion.div
                      key={s.label}
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + i * 0.06 }}
                      className="flex items-center gap-2 text-[11.5px]"
                    >
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ background: s.color, boxShadow: `0 0 6px ${s.color}` }}
                      />
                      <span className="flex-1 text-white/65">{s.label}</span>
                      <span className="font-mono font-bold text-white">{s.pct}%</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </BentoCard>

          {/* Top Campaign */}
          <BentoCard
            className="md:col-span-3 lg:col-span-4"
            glowColor="rgba(236, 72, 153, 0.35)"
            accentColor={NEON.pink}
            delay={0.3}
          >
            <div className="flex h-full flex-col p-7">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Flame className="h-4 w-4 text-pink-300" />
                  <h3 className="text-[13px] font-black uppercase tracking-[0.16em] text-white/80">
                    Top campanha
                  </h3>
                </div>
                <span className="rounded-full bg-pink-500/15 px-2 py-0.5 text-[10px] font-bold text-pink-300">
                  #1
                </span>
              </div>
              <div className="flex-1">
                <div className="text-lg font-black leading-tight text-white">
                  Lançamento Produto Verão 2026
                </div>
                <div className="mt-1 text-[11px] text-white/40">Google Ads · iniciada há 12d</div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3">
                    <div className="text-[10px] font-black uppercase tracking-wider text-white/40">
                      ROAS
                    </div>
                    <div className="mt-1 text-2xl font-black text-pink-300">9.78x</div>
                  </div>
                  <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3">
                    <div className="text-[10px] font-black uppercase tracking-wider text-white/40">
                      Investido
                    </div>
                    <div className="mt-1 text-2xl font-black text-white">R$ 15k</div>
                  </div>
                </div>

                <div className="mt-4 inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-1 text-[11px] font-bold text-emerald-300">
                  <TrendingUp className="h-3 w-3" /> +28,7% esta semana
                </div>
              </div>
            </div>
          </BentoCard>

          {/* AI assistant */}
          <BentoCard
            className="md:col-span-6 lg:col-span-8"
            glowColor="rgba(34, 211, 238, 0.4)"
            accentColor={NEON.cyan}
            delay={0.35}
          >
            <div className="relative flex h-full flex-col justify-between gap-6 overflow-hidden p-7 md:flex-row md:items-center md:p-9">
              <div className="relative z-10 max-w-xl">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-1">
                  <motion.div
                    animate={{ rotate: [0, 12, -12, 0] }}
                    transition={{ duration: 4, repeat: Infinity }}
                  >
                    <Brain className="h-3 w-3 text-cyan-300" />
                  </motion.div>
                  <span className="text-[10px] font-black uppercase tracking-[0.18em] text-cyan-200">
                    Insight IA · agora
                  </span>
                </div>
                <h3 className="text-2xl font-black leading-tight text-white lg:text-3xl">
                  Realocando R$ 12k de{' '}
                  <span className="text-rose-300">Meta</span> para{' '}
                  <span className="text-cyan-300">TikTok</span>, projeção de{' '}
                  <span
                    className="bg-gradient-to-r from-emerald-300 to-emerald-500 bg-clip-text text-transparent"
                  >
                    +R$ 47k em receita
                  </span>{' '}
                  esta semana.
                </h3>
                <p className="mt-3 text-[13px] text-white/45">
                  Detectei queda de 18% no ROAS de Meta e crescimento sustentado de 23% no TikTok há
                  9 dias.
                </p>
                <div className="mt-5 flex flex-wrap items-center gap-2">
                  <button
                    className="rounded-2xl px-4 py-2.5 text-sm font-bold text-[#05050b] shadow-[0_8px_30px_-8px_rgba(34,211,238,0.6)] transition-transform hover:scale-[1.02]"
                    style={{
                      background: `linear-gradient(135deg, ${NEON.cyan} 0%, ${NEON.emerald} 100%)`,
                    }}
                  >
                    Aplicar realocação
                  </button>
                  <button className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-bold text-white/80 backdrop-blur-xl transition-colors hover:border-white/20 hover:text-white">
                    Ver simulação
                  </button>
                </div>
              </div>

              <div className="relative hidden h-40 w-40 shrink-0 md:block">
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: `conic-gradient(from 0deg, ${NEON.cyan}, ${NEON.violet}, ${NEON.pink}, ${NEON.cyan})`,
                    filter: 'blur(24px)',
                    opacity: 0.6,
                  }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                />
                <div className="absolute inset-3 rounded-full border border-white/10 bg-[#05050b]/80 backdrop-blur-xl" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Wallet className="h-12 w-12 text-cyan-300" />
                </div>
              </div>
            </div>
          </BentoCard>
        </div>
      </div>
    </div>
  );
}

function DonutChart({ segments }: { segments: { label: string; pct: number; color: string }[] }) {
  const size = 130;
  const stroke = 14;
  const radius = (size - stroke) / 2;
  const circ = 2 * Math.PI * radius;
  let offset = 0;
  const total = segments.reduce((sum, s) => sum + s.pct, 0);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={stroke} />
        {segments.map((s, i) => {
          const length = (s.pct / total) * circ;
          const el = (
            <motion.circle
              key={s.label}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={s.color}
              strokeWidth={stroke}
              strokeLinecap="round"
              strokeDasharray={`${length} ${circ}`}
              strokeDashoffset={-offset}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 + i * 0.1, duration: 0.6 }}
              style={{ filter: `drop-shadow(0 0 6px ${s.color})` }}
            />
          );
          offset += length;
          return el;
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Total</span>
        <span className="text-xl font-black text-white">2.4M</span>
      </div>
    </div>
  );
}
