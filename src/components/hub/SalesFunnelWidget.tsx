'use client';

import React, { useState, useEffect } from 'react';
import { HelpCircle, X } from 'lucide-react';

type SalesFunnelWidgetProps = {
  isGa4Connected: boolean;
  isGoogleAdsConnected: boolean;
  isMetaAdsConnected: boolean;
  isLinkedinAdsConnected: boolean;
  ga4Data: {
    activeUsers?: string;
    conversions?: string;
    purchaseRevenue?: string;
    error?: string;
  } | null;
  trafficData: {
    success: boolean;
    channels?: Array<{
      platform: string;
      spend: number;
      impressions: number;
      clicks: number;
      conversions: number;
    }>;
  } | null;
  conversions: number | 'N/A';
};

export default function SalesFunnelWidget({
  isGa4Connected,
  isGoogleAdsConnected,
  isMetaAdsConnected,
  isLinkedinAdsConnected,
  ga4Data,
  trafficData,
  conversions,
}: SalesFunnelWidgetProps) {
  const [hoveredStage, setHoveredStage] = useState<number | null>(null);

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // ── helpers ─────────────────────────────────────────────────────────
  const fmt = (val: number | 'N/A'): string => {
    if (val === 'N/A') return 'N/A';
    if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
    if (val >= 1_000) return `${(val / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
    return val.toLocaleString('pt-BR');
  };

  const numFmt = (val: number): string => val.toLocaleString('pt-BR');

  // ── data derivation ──────────────────────────────────────────────────
  const googleCh = trafficData?.channels?.find((c) => c.platform === 'Google Ads');
  const metaCh   = trafficData?.channels?.find((c) => c.platform === 'Meta Ads');
  const linkedCh = trafficData?.channels?.find((c) => c.platform === 'LinkedIn Ads');

  const gImpr = googleCh?.impressions ?? 0;
  const mImpr = metaCh?.impressions ?? 0;
  const lImpr = linkedCh?.impressions ?? 0;

  const gClks = googleCh?.clicks ?? 0;
  const mClks = metaCh?.clicks ?? 0;
  const lClks = linkedCh?.clicks ?? 0;

  const hasAds = isGoogleAdsConnected || isMetaAdsConnected || isLinkedinAdsConnected;

  const totalImpressions: number | 'N/A' = hasAds ? gImpr + mImpr + lImpr : 'N/A';
  const totalClicks:      number | 'N/A' = hasAds ? gClks + mClks + lClks : 'N/A';
  const activeUsers:      number | 'N/A' = isGa4Connected && ga4Data && !ga4Data.error && ga4Data.activeUsers
    ? parseInt(ga4Data.activeUsers, 10)
    : 'N/A';

  // ── stage config ─────────────────────────────────────────────────────
  const stages = [
    { id: 1, label: 'AWARENESS',     color: '#38bdf8', value: totalImpressions, pct: '+15.3%' },
    { id: 2, label: 'CONSIDERATION', color: '#0ea5e9', value: totalClicks,      pct: '+12.7%' },
    { id: 3, label: 'INTENT',        color: '#10b981', value: activeUsers,       pct: '+9.3%'  },
    { id: 4, label: 'CONVERSION',    color: '#4ade80', value: conversions,       pct: '+18.6%' },
  ];

  // ── tooltip content map ───────────────────────────────────────────────
  const tooltip = (id: number) => {
    switch (id) {
      case 1: return {
        title: 'Origem: Impressões',
        badge: 'Awareness',
        color: '#38bdf8',
        shadow: 'rgba(56,189,248,0.25)',
        rows: [
          { label: 'Google Ads',  connected: isGoogleAdsConnected,  val: numFmt(gImpr) },
          { label: 'Meta Ads',    connected: isMetaAdsConnected,     val: numFmt(mImpr) },
          { label: 'LinkedIn Ads',connected: isLinkedinAdsConnected, val: numFmt(lImpr) },
        ],
      };
      case 2: return {
        title: 'Origem: Cliques',
        badge: 'Consideration',
        color: '#0ea5e9',
        shadow: 'rgba(14,165,233,0.25)',
        rows: [
          { label: 'Google Ads',  connected: isGoogleAdsConnected,  val: numFmt(gClks) },
          { label: 'Meta Ads',    connected: isMetaAdsConnected,     val: numFmt(mClks) },
          { label: 'LinkedIn Ads',connected: isLinkedinAdsConnected, val: numFmt(lClks) },
        ],
      };
      case 3: return {
        title: 'Origem: Usuários Ativos',
        badge: 'Intent (GA4)',
        color: '#10b981',
        shadow: 'rgba(16,185,129,0.25)',
        rows: [
          { label: 'Google Analytics 4', connected: isGa4Connected, val: activeUsers !== 'N/A' ? numFmt(activeUsers) : 'N/A' },
        ],
      };
      case 4: return {
        title: 'Origem: Conversões',
        badge: 'Conversion',
        color: '#4ade80',
        shadow: 'rgba(74,222,128,0.25)',
        rows: [
          { label: 'GA4 Conversions', connected: isGa4Connected,        val: ga4Data?.conversions ? numFmt(parseInt(ga4Data.conversions, 10)) : 'N/A' },
          { label: 'Google Ads',      connected: isGoogleAdsConnected,  val: numFmt(googleCh?.conversions ?? 0) },
          { label: 'Meta Ads',        connected: isMetaAdsConnected,     val: numFmt(metaCh?.conversions ?? 0) },
          { label: 'LinkedIn Ads',    connected: isLinkedinAdsConnected, val: numFmt(linkedCh?.conversions ?? 0) },
        ],
      };
      default: return null;
    }
  };

  // ── funnel geometry config ────────────────────────────────────────────
  // Each layer: trapezoid defined by top-ellipse (cy, rx, ry) → bottom-ellipse (cy2, rx2, ry2)
  const layers = [
    { id: 1, fill: 'url(#fg-cyan)',   stroke: '#38bdf8', topCy: 38,  topRx: 220, topRy: 24, botCy: 115, botRx: 165, botRy: 18 },
    { id: 2, fill: 'url(#fg-slate)',  stroke: '#94a3b8', topCy: 118, topRx: 162, topRy: 17, botCy: 195, botRx: 115, botRy: 13 },
    { id: 3, fill: 'url(#fg-green)',  stroke: '#10b981', topCy: 198, topRx: 112, topRy: 12, botCy: 272, botRx:  72, botRy:  9 },
    { id: 4, fill: 'url(#fg-glow)',   stroke: '#4ade80', topCy: 275, topRx:  70, topRy:  8, botCy: 338, botRx:  42, botRy:  6 },
  ];

  const textPositions = [54, 148, 228, 305];

  // Build a trapezoid path from two ellipses
  const trapPath = (topCy: number, topRx: number, topRy: number, botCy: number, botRx: number, botRy: number) =>
    `M ${250 - topRx},${topCy} A ${topRx},${topRy} 0 0,0 ${250 + topRx},${topCy}` +
    ` L ${250 + botRx},${botCy} A ${botRx},${botRy} 0 0,1 ${250 - botRx},${botCy} Z`;

  // Tooltip vertical offsets: render above hovered layer when near bottom
  const tooltipTop = [72, 162, 238, 200];

  return (
    <section
      className="rounded-[24px] border border-white/[0.10] bg-[#0a0a0a]/82 p-5 backdrop-blur-xl shadow-[0_12px_40px_rgba(2,8,22,0.55)] relative flex flex-col items-center"
      style={{ minHeight: 460 }}
    >
      {/* Header */}
      <div className="w-full flex justify-between items-center border-b border-white/[0.08] pb-2.5 mb-4">
        <h2 className="text-[13px] font-black uppercase tracking-wider text-[#a3b8cc]">
          Marketing Funnel
        </h2>
        <span className="text-[11px] text-white/35 flex items-center gap-1 font-semibold">
          <HelpCircle className="h-3 w-3" /> Hover para detalhes
        </span>
      </div>

      {/* SVG + text overlays wrapper */}
      <div className="relative w-full max-w-[440px] select-none" style={{ height: 380 }}>

        {/* SVG cone layers */}
        <svg
          viewBox="0 0 500 380"
          className="absolute inset-0 w-full h-full overflow-visible"
          style={{ pointerEvents: 'none' }}
        >
          <defs>
            <linearGradient id="fg-cyan" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#7dd3fc" stopOpacity="0.30" />
              <stop offset="100%" stopColor="#0369a1" stopOpacity="0.08" />
            </linearGradient>
            <linearGradient id="fg-slate" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#94a3b8" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#1e293b" stopOpacity="0.08" />
            </linearGradient>
            <linearGradient id="fg-green" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#34d399" stopOpacity="0.40" />
              <stop offset="100%" stopColor="#064e3b" stopOpacity="0.08" />
            </linearGradient>
            <linearGradient id="fg-glow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#86efac" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#166534" stopOpacity="0.10" />
            </linearGradient>
            <filter id="fg-blur" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="5" />
            </filter>
          </defs>

          {/* Render layers back-to-front */}
          {layers.map((l) => {
            const isHovered   = hoveredStage === l.id;
            const isDimmed    = hoveredStage !== null && hoveredStage !== l.id;
            return (
              <g key={l.id} opacity={isDimmed ? 0.30 : 1} style={{ transition: 'opacity .25s' }}>
                {/* Glow blur copy for bottom-most layer */}
                {l.id === 4 && (
                  <path
                    d={trapPath(l.topCy, l.topRx, l.topRy, l.botCy, l.botRx, l.botRy)}
                    fill="#4ade80"
                    fillOpacity="0.18"
                    filter="url(#fg-blur)"
                  />
                )}
                {/* Main body */}
                <path
                  d={trapPath(l.topCy, l.topRx, l.topRy, l.botCy, l.botRx, l.botRy)}
                  fill={l.fill}
                  stroke={l.stroke}
                  strokeWidth={isHovered ? 2.2 : 1.4}
                />
                {/* Bottom ellipse rim (front arc) */}
                <ellipse
                  cx="250" cy={l.botCy}
                  rx={l.botRx} ry={l.botRy}
                  fill="none"
                  stroke={l.stroke}
                  strokeWidth={isHovered ? 2.2 : 1.4}
                />
                {/* Dashed back arc of top ellipse */}
                <path
                  d={`M ${250 - l.topRx},${l.topCy} A ${l.topRx},${l.topRy} 0 0,1 ${250 + l.topRx},${l.topCy}`}
                  fill="none"
                  stroke={l.stroke}
                  strokeWidth="0.8"
                  strokeDasharray="4 3"
                  opacity="0.6"
                />
                {/* Solid front arc of top ellipse */}
                <path
                  d={`M ${250 - l.topRx},${l.topCy} A ${l.topRx},${l.topRy} 0 0,0 ${250 + l.topRx},${l.topCy}`}
                  fill="none"
                  stroke={l.stroke}
                  strokeWidth={isHovered ? 2.2 : 1.4}
                />
              </g>
            );
          })}

          {/* Bottom glow ring (Conversion platform) */}
          <ellipse cx="250" cy="344" rx="52" ry="8" fill="none" stroke="#4ade80" strokeWidth="1.5" opacity={hoveredStage === 4 || hoveredStage === null ? 0.7 : 0.2} filter="url(#fg-blur)" style={{ transition: 'opacity .25s' }} />
          <ellipse cx="250" cy="344" rx="66" ry="11" fill="none" stroke="#4ade80" strokeWidth="0.6" opacity={hoveredStage === 4 || hoveredStage === null ? 0.4 : 0.1} style={{ transition: 'opacity .25s' }} />
        </svg>

        {/* Invisible hover-target divs (one per layer) */}
        {layers.map((l, i) => (
          <div
            key={l.id}
            className="absolute left-0 right-0 cursor-pointer"
            style={{ top: i === 0 ? 0 : textPositions[i - 1] + 10, height: 82, zIndex: 10 }}
            onMouseEnter={() => setHoveredStage(l.id)}
            onMouseLeave={() => setHoveredStage(null)}
          />
        ))}

        {/* Text labels for each stage */}
        {stages.map((s, i) => (
          <div
            key={s.id}
            className="absolute left-1/2 flex flex-col items-center cursor-pointer"
            style={{ top: textPositions[i], transform: 'translateX(-50%)', zIndex: 20, opacity: hoveredStage !== null && hoveredStage !== s.id ? 0.35 : 1, transition: 'opacity .25s' }}
            onMouseEnter={() => setHoveredStage(s.id)}
            onMouseLeave={() => setHoveredStage(null)}
          >
            <span className="text-[9px] font-black tracking-[0.15em] uppercase" style={{ color: s.color }}>{s.label}</span>
            <span className="text-[17px] font-black leading-none text-white mt-0.5">{fmt(s.value)}</span>
            <span className="text-[9px] font-bold mt-0.5" style={{ color: s.color }}>{s.pct}</span>
          </div>
        ))}

        {/* Balloon Tooltips */}
        {hoveredStage !== null && (() => {
          const t = tooltip(hoveredStage);
          if (!t) return null;
          return (
            <div
              className={`${
                isMobile
                  ? 'absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-[90%] max-w-[280px] z-50 pointer-events-auto'
                  : 'absolute left-full ml-4 z-50 w-56 pointer-events-none'
              } rounded-2xl p-4 text-[11px] backdrop-blur-xl transition-all duration-150`}
              style={{
                top: isMobile ? '50%' : tooltipTop[hoveredStage - 1],
                background: 'rgba(4,12,24,0.95)',
                border: `1px solid ${t.color}40`,
                boxShadow: `0 16px 48px ${t.shadow}`,
              }}
            >
              {/* Arrow pointing left back to funnel */}
              {!isMobile && (
                <div
                  className="absolute -left-[7px] top-5 w-3 h-3 rotate-45"
                  style={{ background: 'rgba(4,12,24,0.92)', border: `1px solid ${t.color}40`, borderRight: 'none', borderTop: 'none' }}
                />
              )}
              <div className="flex items-center justify-between mb-2.5">
                <span className="font-black uppercase tracking-wider text-[10px]" style={{ color: t.color }}>
                  {t.title}
                </span>
                <div className="flex items-center gap-1.5">
                  <span
                    className="text-[8px] font-bold px-1.5 py-0.5 rounded-full"
                    style={{ background: `${t.color}18`, color: '#fff' }}
                  >
                    {t.badge}
                  </span>
                  {isMobile && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setHoveredStage(null);
                      }}
                      className="text-white/40 hover:text-white transition-colors cursor-pointer p-0.5"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                {t.rows.map((row) => (
                  <div key={row.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span
                        className="h-1.5 w-1.5 rounded-full flex-shrink-0"
                        style={{ background: row.connected ? t.color : '#6b7280' }}
                      />
                      <span className="text-[#a3b8cc] font-semibold">{row.label}</span>
                    </div>
                    <span
                      className={`font-black text-[11px] ${row.connected ? 'text-white' : 'text-[#4b5563]'}`}
                    >
                      {row.connected ? row.val : '—'}
                    </span>
                  </div>
                ))}
              </div>
              {/* Connection status note when not connected */}
              {t.rows.every((r) => !r.connected) && (
                <p className="mt-2.5 text-[9px] text-amber-400/70 font-semibold border-t border-white/5 pt-2">
                  Conecte canais em /hub/conectores para ver dados reais.
                </p>
              )}
            </div>
          );
        })()}

      </div>
    </section>
  );
}
