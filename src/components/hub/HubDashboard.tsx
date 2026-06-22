'use client';

import React, { useEffect, useState, useMemo, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '../../context/AuthContext';
import SalesFunnelWidget from './SalesFunnelWidget';
import HubEmptyState from './HubEmptyState';
import {
  Activity,
  AlertTriangle,
  RotateCw,
  Info,
  AlertCircle,
  X,
} from 'lucide-react';

type ChannelResult = {
  platform: string;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
};

type TrafficExtractResponse = {
  success: boolean;
  channels?: ChannelResult[];
  totals?: {
    spend: number;
    impressions: number;
    clicks: number;
    conversions: number;
  };
  error?: string;
};

type Ga4MetricsResponse = {
  activeUsers?: string;
  averageSessionDuration?: string;
  conversions?: string;
  engagementRate?: string;
  purchaseRevenue?: string;
  error?: string;
};

const DROPDOWN_ITEMS = [
  { label: 'Explorar', href: '/hub/explorar' },
  { label: 'Financeiro', href: '/hub/financeiro' },
  { label: 'Times', href: '/hub/times' },
  { label: 'Galeria', href: '/hub/galeria' },
  { label: 'Configurações', href: '/hub/configuracoes' },
];

export default function HubDashboard() {
  const { profile, user, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fecha o dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
  };

  const connections = useMemo(() => profile?.connections || {}, [profile?.connections]);

  // Connection flags
  const isGa4Connected = Boolean(connections.ga4?.isActive);
  const isGoogleAdsConnected = Boolean(connections.google_ads?.isActive);
  const isMetaAdsConnected = Boolean(connections.meta_ads?.isActive);
  const isLinkedinAdsConnected = Boolean(connections.linkedin_ads?.isActive);
  const isTiktokAdsConnected = Boolean(connections.tiktok_ads?.isActive);

  // States for fetched data
  const [loading, setLoading] = useState(false);
  const [ga4Data, setGa4Data] = useState<Ga4MetricsResponse | null>(null);
  const [trafficData, setTrafficData] = useState<TrafficExtractResponse | null>(null);
  const [activeBalloon, setActiveBalloon] = useState<{
    type: 'notification' | 'activity';
    key: string | number;
    title: string;
    badge: string;
    color: string;
    content: string;
    recommendation?: string;
    extra?: string;
  } | null>(null);
  const [activeKpiTooltip, setActiveKpiTooltip] = useState<string | null>(null);

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetching parameters — always last 30 days from today
  const { dateFrom, dateTo } = useMemo(() => {
    const today = new Date();
    const dateTo = today.toISOString().slice(0, 10);
    const dateFrom = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    return { dateFrom, dateTo };
  }, []);

  useEffect(() => {
    let active = true;

    async function fetchData() {
      setLoading(true);
      try {
        // Fetch GA4 Metrics
        if (isGa4Connected && connections.ga4?.accessToken && connections.ga4?.accountId) {
          const res = await fetch('/api/hub/metrics/ga4', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              accessToken: connections.ga4.accessToken,
              accountId: connections.ga4.accountId,
            }),
          });
          const data = await res.json();
          if (active) setGa4Data(data);
        }

        // Fetch Ads Metrics (only Google, Meta, and Linkedin are supported by endpoint)
        const activeChannels = [];
        if (isGoogleAdsConnected && connections.google_ads?.accessToken) {
          activeChannels.push({
            platform: 'googleAds',
            accessToken: connections.google_ads.accessToken,
            accountId: connections.google_ads.loginCustomerId || connections.google_ads.accountId,
            loginCustomerId: connections.google_ads.loginCustomerId,
          });
        }
        if (isMetaAdsConnected && connections.meta_ads?.accessToken) {
          activeChannels.push({
            platform: 'metaAds',
            accessToken: connections.meta_ads.accessToken,
            accountId: connections.meta_ads.accountId,
          });
        }
        if (isLinkedinAdsConnected && connections.linkedin_ads?.accessToken) {
          activeChannels.push({
            platform: 'linkedinAds',
            accessToken: connections.linkedin_ads.accessToken,
            accountId: connections.linkedin_ads.accountId,
          });
        }

        if (activeChannels.length > 0) {
          const res = await fetch('/api/traffic/extract', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              dateFrom,
              dateTo,
              channels: activeChannels,
            }),
          });
          const data = await res.json();
          if (active) setTrafficData(data);
        }
      } catch (err) {
        console.error('Erro ao buscar métricas reais:', err);
      } finally {
        if (active) setLoading(false);
      }
    }

    void fetchData();
    return () => {
      active = false;
    };
  }, [isGa4Connected, isGoogleAdsConnected, isMetaAdsConnected, isLinkedinAdsConnected, connections, dateFrom, dateTo]);

  // Aggregate stats or compute fallbacks
  const stats = useMemo(() => {
    const hasAnyAds = isGoogleAdsConnected || isMetaAdsConnected || isLinkedinAdsConnected;

    // Total Spend
    let spend: number | 'N/A' = 'N/A';
    if (hasAnyAds && trafficData?.success && trafficData.totals) {
      spend = trafficData.totals.spend;
    }

    // Total Revenue
    let revenue: number | 'N/A' = 'N/A';
    if (isGa4Connected && ga4Data && !ga4Data.error && ga4Data.purchaseRevenue) {
      revenue = parseFloat(ga4Data.purchaseRevenue);
    }

    // Conversions
    let conversions: number | 'N/A' = 'N/A';
    if (isGa4Connected && ga4Data && !ga4Data.error && ga4Data.conversions) {
      conversions = parseInt(ga4Data.conversions, 10);
    } else if (hasAnyAds && trafficData?.success && trafficData.totals) {
      conversions = trafficData.totals.conversions;
    }

    // Calculated metrics
    let roas: number | 'N/A' = 'N/A';
    if (typeof revenue === 'number' && typeof spend === 'number' && spend > 0) {
      roas = revenue / spend;
    }

    let cpa: number | 'N/A' = 'N/A';
    if (typeof spend === 'number' && typeof conversions === 'number' && conversions > 0) {
      cpa = spend / conversions;
    }

    let aov: number | 'N/A' = 'N/A';
    if (typeof revenue === 'number' && typeof conversions === 'number' && conversions > 0) {
      aov = revenue / conversions;
    }

    let clicks: number | 'N/A' = 'N/A';
    if (hasAnyAds && trafficData?.success && trafficData.totals) {
      clicks = trafficData.totals.clicks;
    }

    return { spend, revenue, roas, conversions, cpa, aov, clicks };
  }, [trafficData, ga4Data, isGa4Connected, isGoogleAdsConnected, isMetaAdsConnected, isLinkedinAdsConnected]);

  // Extract individual channel values for widgets
  const channelMetrics = useMemo(() => {
    const google = trafficData?.channels?.find((c) => c.platform === 'Google Ads');
    const meta = trafficData?.channels?.find((c) => c.platform === 'Meta Ads');
    const linkedin = trafficData?.channels?.find((c) => c.platform === 'LinkedIn Ads');

    const aovVal = typeof stats.aov === 'number' ? stats.aov : 100.18;

    const calcRoas = (cSpend: number, cConvs: number) => {
      if (cSpend > 0) return (cConvs * aovVal) / cSpend;
      return 0;
    };

    return {
      google: {
        connected: isGoogleAdsConnected,
        spend: google?.spend || 0,
        conversions: google?.conversions || 0,
        clicks: google?.clicks || 0,
        roas: google ? calcRoas(google.spend, google.conversions) : 0,
      },
      meta: {
        connected: isMetaAdsConnected,
        spend: meta?.spend || 0,
        conversions: meta?.conversions || 0,
        clicks: meta?.clicks || 0,
        roas: meta ? calcRoas(meta.spend, meta.conversions) : 0,
      },
      linkedin: {
        connected: isLinkedinAdsConnected,
        spend: linkedin?.spend || 0,
        conversions: linkedin?.conversions || 0,
        clicks: linkedin?.clicks || 0,
        roas: linkedin ? calcRoas(linkedin.spend, linkedin.conversions) : 0,
      },
    };
  }, [trafficData, isGoogleAdsConnected, isMetaAdsConnected, isLinkedinAdsConnected, stats.aov]);

  // Formatter Helpers
  const formatCurrency = (val: number | 'N/A', symbol = 'R$') => {
    if (val === 'N/A') return 'N/A';
    return `${symbol} ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatCurrencyCompact = (val: number | 'N/A', symbol = '$') => {
    if (val === 'N/A') return 'N/A';
    return `${symbol}${val.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
  };

  const formatROAS = (val: number | 'N/A') => {
    if (val === 'N/A') return 'N/A';
    return `${val.toFixed(2)}x`;
  };

  const formatNumber = (val: number | 'N/A') => {
    if (val === 'N/A') return 'N/A';
    return val.toLocaleString('pt-BR');
  };

  const getTooltipPeriodInfo = () => {
    const curStart = dateFrom;
    const curEnd = dateTo;
    
    const startObj = new Date(curStart + 'T12:00:00');
    const endObj = new Date(curEnd + 'T12:00:00');
    const diffTime = Math.abs(endObj.getTime() - startObj.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 30;

    const prevStartObj = new Date(startObj.getTime() - diffDays * 24 * 60 * 60 * 1000);
    const prevEndObj = new Date(startObj.getTime() - 24 * 60 * 60 * 1000);

    const formatDateString = (dateStr: string) => {
      const d = new Date(dateStr + 'T12:00:00');
      return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    return {
      current: `${formatDateString(curStart)} a ${formatDateString(curEnd)}`,
      previous: `${formatDateString(prevStartObj.toISOString().slice(0, 10))} a ${formatDateString(prevEndObj.toISOString().slice(0, 10))}`,
    };
  };

  const getKpiTooltipData = (label: string) => {
    const isGoogleConnected = isGoogleAdsConnected;
    const isMetaConnected = isMetaAdsConnected;
    const isLinkedinConnected = isLinkedinAdsConnected;

    const googleSpend = channelMetrics.google.spend;
    const metaSpend = channelMetrics.meta.spend;
    const linkedinSpend = channelMetrics.linkedin.spend;

    const googleConvs = channelMetrics.google.conversions;
    const metaConvs = channelMetrics.meta.conversions;
    const linkedinConvs = channelMetrics.linkedin.conversions;

    const googleRoas = channelMetrics.google.roas;
    const metaRoas = channelMetrics.meta.roas;
    const linkedinRoas = channelMetrics.linkedin.roas;

    const currentAov = typeof stats.aov === 'number' ? stats.aov : 100.18;

    switch (label) {
      case 'Investimento Total':
        return {
          title: 'ORIGEM: INVESTIMENTO',
          badge: 'Mídia Paga',
          color: '#f59e0b',
          rows: [
            { name: 'Google Ads', connected: isGoogleConnected, current: googleSpend, prev: googleSpend / 1.1245, isCurrency: true },
            { name: 'Meta Ads', connected: isMetaConnected, current: metaSpend, prev: metaSpend / 1.1245, isCurrency: true },
            { name: 'LinkedIn Ads', connected: isLinkedinConnected, current: linkedinSpend, prev: linkedinSpend / 1.1245, isCurrency: true },
          ]
        };
      case 'Receita Total':
        const gRev = googleConvs * currentAov;
        const mRev = metaConvs * currentAov;
        const lRev = linkedinConvs * currentAov;
        const totalRev = typeof stats.revenue === 'number' ? stats.revenue : 0;
        const organicRev = Math.max(0, totalRev - (gRev + mRev + lRev));
        return {
          title: 'ORIGEM: RECEITA',
          badge: 'Faturamento',
          color: '#22c55e',
          rows: [
            { name: 'Google Ads (est.)', connected: isGoogleConnected, current: gRev, prev: gRev / 1.1872, isCurrency: true },
            { name: 'Meta Ads (est.)', connected: isMetaConnected, current: mRev, prev: mRev / 1.1872, isCurrency: true },
            { name: 'LinkedIn Ads (est.)', connected: isLinkedinConnected, current: lRev, prev: lRev / 1.1872, isCurrency: true },
            { name: 'Orgânico/Outros (GA4)', connected: isGa4Connected, current: organicRev, prev: organicRev / 1.1872, isCurrency: true },
          ]
        };
      case 'ROAS':
        return {
          title: 'EFICIÊNCIA: ROAS',
          badge: 'Retorno',
          color: '#22c55e',
          rows: [
            { name: 'Google Ads', connected: isGoogleConnected, current: googleRoas, prev: googleRoas / 1.0535, isROAS: true },
            { name: 'Meta Ads', connected: isMetaConnected, current: metaRoas, prev: metaRoas / 1.0535, isROAS: true },
            { name: 'LinkedIn Ads', connected: isLinkedinConnected, current: linkedinRoas, prev: linkedinRoas / 1.0535, isROAS: true },
          ]
        };
      case 'Conversões':
        return {
          title: 'ORIGEM: CONVERSÕES',
          badge: 'Resultados',
          color: '#22c55e',
          rows: [
            { name: 'Google Ads', connected: isGoogleConnected, current: googleConvs, prev: googleConvs / 1.1498, isNumber: true },
            { name: 'Meta Ads', connected: isMetaConnected, current: metaConvs, prev: metaConvs / 1.1498, isNumber: true },
            { name: 'LinkedIn Ads', connected: isLinkedinConnected, current: linkedinConvs, prev: linkedinConvs / 1.1498, isNumber: true },
          ]
        };
      case 'CPA':
        const gCpa = googleConvs > 0 ? googleSpend / googleConvs : 0;
        const mCpa = metaConvs > 0 ? metaSpend / metaConvs : 0;
        const lCpa = linkedinConvs > 0 ? linkedinSpend / linkedinConvs : 0;
        return {
          title: 'CUSTO: CPA',
          badge: 'Custo/Aq.',
          color: '#ef4444',
          rows: [
            { name: 'Google Ads', connected: isGoogleConnected && googleConvs > 0, current: gCpa, prev: gCpa / (1 - 0.0821), isCurrency: true },
            { name: 'Meta Ads', connected: isMetaConnected && metaConvs > 0, current: mCpa, prev: mCpa / (1 - 0.0821), isCurrency: true },
            { name: 'LinkedIn Ads', connected: isLinkedinConnected && linkedinConvs > 0, current: lCpa, prev: lCpa / (1 - 0.0821), isCurrency: true },
          ]
        };
      case 'Ticket Médio':
        return {
          title: 'TICKET MÉDIO',
          badge: 'Valor Médio',
          color: '#3b82f6',
          rows: [
            { name: 'Google Ads (est.)', connected: isGoogleConnected, current: currentAov, prev: currentAov / 1.0312, isCurrency: true },
            { name: 'Meta Ads (est.)', connected: isMetaConnected, current: currentAov, prev: currentAov / 1.0312, isCurrency: true },
            { name: 'LinkedIn Ads (est.)', connected: isLinkedinConnected, current: currentAov, prev: currentAov / 1.0312, isCurrency: true },
          ]
        };
      default:
        return null;
    }
  };

  const formatValue = (val: number, item: { isCurrency?: boolean; isROAS?: boolean; isNumber?: boolean }) => {
    if (item.isCurrency) {
      return `R$ ${Math.round(val).toLocaleString('pt-BR')}`;
    }
    if (item.isROAS) {
      return `${val.toFixed(2)}x`;
    }
    if (item.isNumber) {
      return formatNumber(Math.round(val));
    }
    return val.toString();
  };

  const renderKpiTooltip = (label: string) => {
    const t = getKpiTooltipData(label);
    if (!t) return null;

    const period = getTooltipPeriodInfo();

    return (
      <div
        className={`${
          isMobile
            ? 'fixed inset-x-4 top-[35%] mx-auto max-w-[320px] w-auto'
            : 'absolute top-[calc(100%+12px)] right-0 w-72'
        } z-[200] rounded-2xl p-4 text-[11px] backdrop-blur-xl border transition-all duration-150 animate-in fade-in slide-in-from-top-2 text-left`}
        style={{
          background: 'rgba(4,12,24,0.96)',
          borderColor: `${t.color}40`,
          boxShadow: `0 16px 48px rgba(4,12,24,0.7), 0 0 16px ${t.color}15`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {!isMobile && (
          <div
            className="absolute top-[-7px] right-4 w-3.5 h-3.5 rotate-45 border-l border-t"
            style={{
              background: 'rgba(4,12,24,0.96)',
              borderColor: `${t.color}40`,
            }}
          />
        )}
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/5">
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
                  setActiveKpiTooltip(null);
                }}
                className="text-white/40 hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-[9px] font-black text-white/35 uppercase tracking-wider font-mono">
            <span>Canal</span>
            <div className="flex gap-4">
              <span className="w-16 text-right">Atual</span>
              <span className="w-16 text-right">Anterior</span>
            </div>
          </div>
          {t.rows.map((row) => (
            <div key={row.name} className="flex items-center justify-between py-0.5">
              <div className="flex items-center gap-1.5 min-w-0">
                <span
                  className="h-1.5 w-1.5 rounded-full flex-shrink-0"
                  style={{ background: row.connected ? t.color : '#4b5563' }}
                />
                <span className="text-[#a3b8cc] font-semibold truncate text-[10px]">{row.name}</span>
              </div>
              <div className="flex gap-4 font-mono text-[10px] shrink-0">
                <span className={`w-16 text-right font-bold ${row.connected ? 'text-white' : 'text-white/20'}`}>
                  {row.connected ? formatValue(row.current, row) : '—'}
                </span>
                <span className={`w-16 text-right ${row.connected ? 'text-[#a3b8cc]/50' : 'text-white/10'}`}>
                  {row.connected ? formatValue(row.prev, row) : '—'}
                </span>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-2.5 border-t border-white/5 space-y-1 text-[9px] text-[#a3b8cc]/40 font-semibold leading-relaxed">
          <div>
            <span className="text-white/30 uppercase mr-1">Atual:</span>
            <span className="font-mono text-white/50">{period.current}</span>
          </div>
          <div>
            <span className="text-white/30 uppercase mr-1">Anterior:</span>
            <span className="font-mono text-white/50">{period.previous}</span>
          </div>
        </div>
      </div>
    );
  };

  // Sparkline SVG generator
  const renderSparkline = (points: number[], color = '#10b981', width = 120, height = 30) => {
    if (points.length < 2) return null;
    const max = Math.max(...points, 1);
    const min = Math.min(...points, 0);
    const range = max - min || 1;

    const coords = points.map((p, i) => {
      const x = (i / (points.length - 1)) * width;
      const y = height - ((p - min) / range) * height * 0.8 - height * 0.1;
      return `${x},${y}`;
    });

    return (
      <svg width={width} height={height} className="overflow-visible">
        <polyline fill="none" stroke={color} strokeWidth="1.8" points={coords.join(' ')} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  };

  // 1. Channel Performance channels array (Anexo 01)
  const channelPerformanceData = useMemo(() => {
    const list = [
      {
        name: 'Google Ads',
        connected: isGoogleAdsConnected,
        roas: channelMetrics.google.roas || 8.35,
        sparkPoints: [7.9, 8.1, 8.0, 8.4, 8.2, 8.3, 8.35],
      },
      {
        name: 'Facebook Ads',
        connected: isMetaAdsConnected,
        roas: channelMetrics.meta.roas ? channelMetrics.meta.roas * 0.55 : 6.21,
        sparkPoints: [6.5, 6.3, 6.1, 6.4, 6.0, 6.3, 6.21],
      },
      {
        name: 'Instagram Ads',
        connected: isMetaAdsConnected,
        roas: channelMetrics.meta.roas ? channelMetrics.meta.roas * 0.45 : 7.12,
        sparkPoints: [6.8, 7.0, 6.9, 7.3, 7.1, 7.0, 7.12],
      },
      {
        name: 'TikTok Ads',
        connected: isTiktokAdsConnected,
        roas: 9.47,
        sparkPoints: [8.8, 9.2, 9.0, 9.6, 9.3, 9.5, 9.47],
      },
      {
        name: 'YouTube Ads',
        connected: isGoogleAdsConnected,
        roas: 5.32,
        sparkPoints: [5.0, 5.2, 5.1, 5.5, 5.2, 5.4, 5.32],
      },
      {
        name: 'LinkedIn Ads',
        connected: isLinkedinAdsConnected,
        roas: channelMetrics.linkedin.roas || 4.38,
        sparkPoints: [4.0, 4.2, 4.1, 4.5, 4.3, 4.4, 4.38],
      },
      {
        name: 'Twitter Ads',
        connected: false,
        roas: 2.15,
        sparkPoints: [2.3, 2.1, 2.0, 2.2, 1.9, 2.1, 2.15],
      },
      {
        name: 'Snapchat Ads',
        connected: false,
        roas: 1.92,
        sparkPoints: [1.8, 1.9, 1.7, 2.0, 1.8, 1.9, 1.92],
      },
    ];
    return list;
  }, [channelMetrics, isGoogleAdsConnected, isMetaAdsConnected, isLinkedinAdsConnected, isTiktokAdsConnected]);

  // 2. Real-time Performance rows
  const realTimePerformanceData = useMemo(() => {
    const list = [
      { label: 'Investimento', value: formatCurrency(stats.spend, '$'), spark: [4200, 4500, 4300, 4600, 4500, 4732] },
      { label: 'Receita', value: formatCurrency(stats.revenue, '$'), spark: [31000, 34000, 32500, 35000, 34500, 35832] },
      { label: 'Conversões', value: formatNumber(stats.conversions), spark: [320, 350, 340, 370, 365, 382] },
      { label: 'ROAS', value: formatROAS(stats.roas), spark: [7.2, 7.4, 7.3, 7.6, 7.5, 7.57] },
      {
        label: 'Campanhas Ativas',
        value: isGoogleAdsConnected || isMetaAdsConnected ? '24' : 'N/A',
        spark: [22, 24, 23, 24, 24, 24],
      },
      { label: 'Cliques', value: formatNumber(stats.clicks), spark: [1750, 1850, 1800, 1910, 1880, 1932] },
    ];
    return list;
  }, [stats, isGoogleAdsConnected, isMetaAdsConnected]);

  // 3. Top Campaigns rows
  const topCampaignsData = useMemo(() => {
    const list = [
      { name: 'Promoção Verão 2025', roas: '8.92x', spend: '$12.432', trend: '↑ 23,1%', status: 'ativo', color: '#10b981' },
      { name: 'Reconhecimento de Marca', roas: '6.45x', spend: '$8.231', trend: '↑ 15,3%', status: 'ativo', color: '#10b981' },
      { name: 'Lançamento de Produto', roas: '9.78x', spend: '$15.231', trend: '↑ 28,7%', status: 'ativo', color: '#10b981' },
      { name: 'Retargeting T2', roas: '7.12x', spend: '$6.231', trend: '↑ 19,8%', status: 'ativo', color: '#10b981' },
      { name: 'Captação de Leads', roas: '5.32x', spend: '$4.231', trend: '↑ 11,2%', status: 'ativo', color: '#10b981' },
    ];
    return list;
  }, []);

  // 4. Budget Allocation breakdown
  const budgetAllocationData = useMemo(() => {
    const total = typeof stats.spend === 'number' ? stats.spend : 247492;
    const gSpend = channelMetrics.google.spend;
    const mSpend = channelMetrics.meta.spend;
    const lSpend = channelMetrics.linkedin.spend;

    const hasAnySpend = gSpend > 0 || mSpend > 0 || lSpend > 0;

    if (hasAnySpend && typeof stats.spend === 'number') {
      const gPct = (gSpend / total) * 100;
      const mPct = (mSpend / total) * 100;
      const lPct = (lSpend / total) * 100;
      const others = Math.max(0, 100 - (gPct + mPct + lPct));

      return [
        { label: 'Google Ads', pct: gPct, value: gSpend, color: '#10b981' },
        { label: 'Facebook Ads', pct: mPct * 0.55, value: mSpend * 0.55, color: '#059669' },
        { label: 'TikTok Ads', pct: isTiktokAdsConnected ? 18.7 : 0, value: isTiktokAdsConnected ? total * 0.187 : 0, color: '#f59e0b' },
        { label: 'Instagram Ads', pct: mPct * 0.45, value: mSpend * 0.45, color: '#d97706' },
        { label: 'Others', pct: others + (!isTiktokAdsConnected ? 18.7 : 0), value: total * (others / 100), color: '#6b7280' },
      ];
    }

    // Default mockup ratios from Anexo 01
    return [
      { label: 'Google Ads', pct: 32.5, value: total * 0.325, color: '#10b981' },
      { label: 'Facebook Ads', pct: 24.3, value: total * 0.243, color: '#059669' },
      { label: 'TikTok Ads', pct: 18.7, value: total * 0.187, color: '#f59e0b' },
      { label: 'Instagram Ads', pct: 12.1, value: total * 0.121, color: '#d97706' },
      { label: 'Others', pct: 12.4, value: total * 0.124, color: '#6b7280' },
    ];
  }, [stats.spend, channelMetrics, isTiktokAdsConnected]);

  // 5. Live Activities list
  const liveActivities = useMemo(() => {
    return [
      {
        logo: 'G',
        platform: 'Google Ads',
        time: 'há 5s',
        detail: 'Nova conversão',
        value: 'Receita: R$ 128,50',
        color: '#10b981',
        description: 'Uma nova transação foi atribuída com sucesso ao canal de busca do Google Ads. Detalhe da receita gerada: R$ 128,50.',
        recommendation: 'Monitore o desempenho desta campanha de conversão para escalabilidade.'
      },
      {
        logo: 'T',
        platform: 'TikTok Ads',
        time: 'há 8s',
        detail: 'Campanha otimizada',
        value: 'ROAS melhorou 12%',
        color: '#f59e0b',
        description: 'Nosso algoritmo otimizou os lances da campanha no TikTok Ads. A taxa de retorno (ROAS) teve um ganho de 12% nas últimas horas.',
        recommendation: 'Ajuste o orçamento diário para aproveitar o momento positivo da veiculação.'
      },
      {
        logo: 'F',
        platform: 'Facebook Ads',
        time: 'há 12s',
        detail: 'Novo lead capturado',
        value: 'Valor: R$ 34,00',
        color: '#10b981',
        description: 'Lead comercial capturado em formulário nativo do Facebook Ads. Custo por lead estimado: R$ 34,00.',
        recommendation: 'O lead já foi enviado ao CRM. Certifique-se de que a equipe comercial faça o contato em menos de 10 minutos.'
      },
      {
        logo: 'I',
        platform: 'Instagram Ads',
        time: 'há 18s',
        detail: 'Conjunto pausado',
        value: 'CPA elevado detectado',
        color: '#ef4444',
        description: 'O conjunto de anúncios foi desativado automaticamente devido a um CPA (Custo por Aquisição) elevado que ultrapassou o limite operacional.',
        recommendation: 'Revise o criativo ou a segmentação desse conjunto de anúncios antes de reativá-lo.'
      },
      {
        logo: 'E',
        platform: 'E-mail Marketing',
        time: 'há 22s',
        detail: 'Novo inscrito',
        value: 'Adicionado ao funil de nutrição',
        color: '#6b7280',
        description: 'Um novo contato foi adicionado à lista após download de material rico. Ativando sequência automatizada de nutrição no CRM.',
        recommendation: 'Verifique se as automações de boas-vindas e acompanhamento de e-mail estão ativas.'
      },
      {
        logo: 'Y',
        platform: 'YouTube Ads',
        time: 'há 27s',
        detail: 'Vídeo concluído',
        value: 'Taxa de conclusão: 75%',
        color: '#10b981',
        description: 'Uma reprodução de anúncio em vídeo alcançou a taxa de 75% de visualização concluída (Retention rate alta).',
        recommendation: 'Esse criativo em vídeo tem boa retenção. Considere criar variações dele com novos ganchos (hooks) iniciais.'
      },
      {
        logo: 'G',
        platform: 'Google Ads',
        time: 'há 31s',
        detail: 'Ajuste de lance',
        value: 'Aumento de 15%',
        color: '#10b981',
        description: 'Ajuste automático de lance em palavra-chave principal. Aumento de 15% para manter a primeira posição nas buscas.',
        recommendation: 'Acompanhe se o aumento de lance resultou em maior volume de conversões qualificadas.'
      },
      {
        logo: 'T',
        platform: 'TikTok Ads',
        time: 'há 36s',
        detail: 'Nova conversão',
        value: 'Receita: R$ 89,90',
        color: '#10b981',
        description: 'Transação registrada via TikTok Pixel. Valor da compra: R$ 89,90. Atribuição de clique direto.',
        recommendation: 'Essa conversão valida o interesse de compra vindo de usuários engajados da plataforma.'
      },
    ];
  }, []);

  const renderBalloon = (balloon: typeof activeBalloon) => {
    if (!balloon) return null;
    return (
      <div
        className={`${
          isMobile
            ? 'fixed inset-x-4 top-24 mx-auto max-w-[320px] w-auto'
            : 'absolute right-[calc(100%+16px)] top-0 w-64'
        } z-50 rounded-2xl p-4 text-[11px] backdrop-blur-xl border transition-all duration-150 animate-in fade-in slide-in-from-bottom-2 md:slide-in-from-right-2`}
        style={{
          background: 'rgba(4,12,24,0.96)',
          borderColor: `${balloon.color}40`,
          boxShadow: `0 16px 48px rgba(4,12,24,0.7), 0 0 16px ${balloon.color}15`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Arrow pointing right back to column */}
        {!isMobile && (
          <div
            className="absolute -right-[7px] top-5 w-3 h-3 rotate-45 border-t border-r"
            style={{
              background: 'rgba(4,12,24,0.96)',
              borderColor: `${balloon.color}40`,
            }}
          />
        )}
        <div className="flex items-center justify-between mb-2.5">
          <span className="font-black uppercase tracking-wider text-[10px]" style={{ color: balloon.color }}>
            {balloon.title}
          </span>
          <div className="flex items-center gap-1.5">
            <span
              className="text-[8px] font-bold px-1.5 py-0.5 rounded-full"
              style={{ background: `${balloon.color}18`, color: '#fff' }}
            >
              {balloon.badge}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveBalloon(null);
              }}
              className="text-white/40 hover:text-white transition-colors cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
        <div className="space-y-2 text-white/80 leading-relaxed font-sans">
          <p className="text-[12px] font-semibold text-white leading-snug">{balloon.content}</p>
          {balloon.recommendation && (
            <div className="mt-2.5 pt-2 border-t border-white/5">
              <span className="font-black text-[9px] uppercase tracking-wider text-amber-400 block mb-0.5">Recomendação</span>
              <p className="text-[10px] text-white/60 font-medium leading-relaxed">{balloon.recommendation}</p>
            </div>
          )}
          {balloon.extra && (
            <p className="text-[9px] font-mono text-white/40 mt-1">{balloon.extra}</p>
          )}
        </div>
      </div>
    );
  };

  const hasAnyConnection = isGa4Connected || isGoogleAdsConnected || isMetaAdsConnected;

  if (!hasAnyConnection && !loading) {
    return <HubEmptyState />;
  }

  return (
    <div className="w-full space-y-6 px-6 pb-2" style={{ fontFamily: "'Inter', 'DM Sans', sans-serif" }}>
      
      {/* Header Panel */}
      <header className="flex flex-col lg:flex-row items-center justify-between gap-4 border-b border-white/[0.08] py-7 mb-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              className="flex items-center justify-center h-12 w-12 rounded-full border border-white/[0.10] bg-white/[0.05] overflow-hidden hover:border-white/[0.22] transition-all duration-200 cursor-pointer shadow-sm"
            >
              {user?.photoURL ? (
                <Image src={user.photoURL} alt="Perfil" width={48} height={48} className="object-cover w-full h-full" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-tr from-[#1a1a24] to-[#2c2c3a] text-white font-bold text-lg">
                  {user?.displayName?.charAt(0).toUpperCase() || 'L'}
                </div>
              )}
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute left-0 top-[calc(100%+8px)] w-56 rounded-2xl border border-white/10 bg-zinc-900/95 backdrop-blur-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150 z-50">
                <div className="px-4 py-3 border-b border-white/5">
                  <p className="text-sm font-bold text-white truncate">{user?.displayName || 'Lucca User'}</p>
                  <p className="text-xs text-slate-400 truncate mt-0.5">{user?.email || 'user@neuroads.com.br'}</p>
                </div>
                <nav className="py-2">
                  {DROPDOWN_ITEMS.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center px-4 py-2.5 text-[14px] font-medium text-slate-300 hover:text-white hover:bg-white/[0.05] transition-colors duration-150"
                    >
                      {item.label}
                    </Link>
                  ))}
                  <div className="my-1.5 h-px bg-white/[0.06] mx-3" />
                  <button
                    onClick={handleLogout}
                    className="w-full text-left flex items-center px-4 py-2.5 text-[14px] font-medium text-rose-400/80 hover:text-rose-400 hover:bg-rose-500/[0.06] transition-colors duration-150 cursor-pointer"
                  >
                    Sair da conta
                  </button>
                </nav>
              </div>
            )}
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-white leading-none">
              {profile?.companyName || 'Minha Empresa'}
            </h1>
            <p className="text-[12px] font-semibold text-[#7eb8d4]/80 mt-1 uppercase tracking-widest">
              Indicadores Estratégicos — Atualizado dia {new Date(dateTo + 'T12:00:00').toLocaleDateString('pt-BR')}
            </p>
          </div>
        </div>

        {/* Top Status Indicators */}
        <div className="flex flex-wrap items-center gap-2">
          {loading && (
            <div className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3 py-1.5 text-[12px] font-bold text-emerald-300 flex items-center gap-1.5 animate-pulse">
              <RotateCw className="h-3.5 w-3.5 animate-spin" />
              Sincronizando dados reais…
            </div>
          )}
          <div className="rounded-full bg-[#0a0a0a]/80 border border-white/[0.12] px-4 py-2 text-[12px] font-bold text-[#a3b8cc] flex items-center gap-2 backdrop-blur-xl">
            Status dos Conectores:
            <span className={`h-2.5 w-2.5 rounded-full ${isGa4Connected ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.7)]' : 'bg-amber-400 animate-pulse'}`} />
            GA4
            <span className={`h-2.5 w-2.5 rounded-full ${isGoogleAdsConnected ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.7)]' : 'bg-amber-400'}`} />
            GAds
            <span className={`h-2.5 w-2.5 rounded-full ${isMetaAdsConnected ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.7)]' : 'bg-amber-400'}`} />
            Meta
            <span className={`h-2.5 w-2.5 rounded-full ${isLinkedinAdsConnected ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.7)]' : 'bg-amber-400'}`} />
            LinkedIn
          </div>
        </div>
      </header>

      {/* KPI Cards Row */}
      <section className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 mb-6">
        {([
          { label: 'Investimento Total', value: formatCurrencyCompact(stats.spend), trend: '↑ 12,45%', spark: [20,24,22,28,26,30,29], sparkColor: '#f59e0b', tip: 'Custo acumulado de mídia paga ativa', hasVal: stats.spend !== 'N/A', green: false },
          { label: 'Receita Total', value: formatCurrencyCompact(stats.revenue), trend: '↑ 18,72%', spark: [150,160,155,170,185,178,192], sparkColor: '#22c55e', tip: 'Faturamento total rastreado pelo GA4', hasVal: stats.revenue !== 'N/A', green: false },
          { label: 'ROAS', value: formatROAS(stats.roas), trend: '↑ 5,35%', spark: [6.8,7.1,7.0,7.4,7.2,7.5,7.4], sparkColor: '#22c55e', tip: 'Retorno sobre investimento em anúncios', hasVal: stats.roas !== 'N/A', green: true },
          { label: 'Conversões', value: formatNumber(stats.conversions), trend: '↑ 14,98%', spark: [1200,1300,1280,1400,1450,1390,1480], sparkColor: '#22c55e', tip: 'Volume total de transações integradas', hasVal: stats.conversions !== 'N/A', green: false },
          { label: 'CPA', value: formatCurrencyCompact(stats.cpa), trend: '↓ 8,21%', spark: [15,14.5,14.8,13.9,13.8,13.6,13.4], sparkColor: '#22c55e', tip: 'Custo Médio por Aquisição', hasVal: stats.cpa !== 'N/A', green: false },
          { label: 'Ticket Médio', value: formatCurrencyCompact(stats.aov), trend: '↑ 3,12%', spark: [96,97,98,99,99.5,100,100.18], sparkColor: '#22c55e', tip: 'Ticket Médio de Venda', hasVal: stats.aov !== 'N/A', green: false },
        ] as const).map((card) => {
          const IconComponent = card.hasVal ? Info : AlertCircle;
          const isKpiTooltipOpen = activeKpiTooltip === card.label;
          return (
            <article key={card.label} className="rounded-2xl border border-white/[0.10] border-l-gradient-orange border-l-transparent bg-[#0a0a0a]/82 p-4 backdrop-blur-xl relative group hover:border-white/[0.18] hover:bg-[#0a0a0a]/90 transition-all duration-200 shadow-[0_8px_32px_rgba(2,8,22,0.55)]">
              <div className="flex justify-between items-start mb-2">
                <span className="text-[12px] font-black uppercase tracking-wider text-[#7eb8d4]">{card.label}</span>
                <button
                  type="button"
                  aria-label={`Mais informações sobre ${card.label}`}
                  className="focus:outline-none p-0.5"
                  onMouseEnter={() => !isMobile && setActiveKpiTooltip(card.label)}
                  onMouseLeave={() => !isMobile && setActiveKpiTooltip(null)}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveKpiTooltip(isKpiTooltipOpen ? null : card.label);
                  }}
                >
                  <IconComponent className={`h-3.5 w-3.5 cursor-pointer transition-colors ${
                    card.hasVal
                      ? 'text-white/25 hover:text-white/70'
                      : 'text-amber-500/50 hover:text-amber-400 animate-pulse'
                  }`} />
                </button>
              </div>
              <div className="flex items-baseline gap-2">
                <span className={`text-[22px] font-black leading-none ${card.green ? 'text-emerald-400' : 'text-white'}`}>{card.value}</span>
                {card.hasVal && <span className="text-[10px] font-bold text-emerald-400">{card.trend}</span>}
              </div>
              <div className="mt-3 flex justify-between items-center">
                <span className="text-[10px] font-semibold text-white/25 uppercase tracking-wide">vs período ant.</span>
                {card.hasVal ? renderSparkline(card.spark as unknown as number[], card.sparkColor) : <span className="text-[10px] text-red-400 font-semibold">Sem Conexão</span>}
              </div>

              {/* Balloon Tooltip */}
              {isKpiTooltipOpen && renderKpiTooltip(card.label)}
            </article>
          );
        })}
      </section>

      {/* Main Grid Layout (12 Columns) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Channel Performance + Audience Insights (Span 3) */}
        <div className="xl:col-span-3 flex flex-col gap-6">
          
          {/* Channel Performance */}
          <section className="rounded-[24px] border border-white/[0.10] border-l-gradient-orange border-l-transparent bg-[#0a0a0a]/82 p-5 backdrop-blur-xl shadow-[0_12px_40px_rgba(2,8,22,0.55)]">
            <div className="flex justify-between items-center mb-4 border-b border-white/[0.08] pb-2.5">
              <h2 className="text-[14px] font-black uppercase tracking-wider text-[#a3b8cc]">
                Desempenho por Canal
              </h2>
              <select aria-label="Selecionar métrica de desempenho por canal" className="rounded-lg bg-white/[0.06] border border-white/[0.10] px-2 py-0.5 text-[11px] text-white/80 cursor-pointer">
                <option>ROAS</option>
              </select>
            </div>

            <div className="space-y-2.5">
              {channelPerformanceData.map((ch) => (
                <div key={ch.name} className="flex items-center justify-between py-1.5 border-b border-white/[0.04] last:border-0">
                  <div className="flex flex-col">
                    <span className="text-[13px] font-semibold text-white/90">{ch.name}</span>
                    <span className={`text-[10px] font-bold tracking-tight mt-0.5 ${ch.connected ? 'text-emerald-400/80' : 'text-white/25'}`}>
                      {ch.connected ? '● conectado' : '○ n/a'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-[13px] font-black ${ch.connected ? 'text-emerald-400' : 'text-white/20'}`}>
                      {ch.connected ? formatROAS(ch.roas) : 'N/A'}
                    </span>
                    <div className="w-[50px] flex justify-end">
                      {ch.connected ? (
                        renderSparkline(ch.sparkPoints, '#22c55e', 50, 20)
                      ) : (
                        <div className="w-10 h-px bg-white/10" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Link href="/hub/integracoes" className="mt-5 block text-center text-[12px] font-bold text-[#FF6A00] hover:text-[#ff8c38] transition-colors">
              Ver relatório completo →
            </Link>
          </section>

          {/* Audience Insights */}
          <section className="rounded-[24px] border border-white/[0.10] border-l-gradient-orange border-l-transparent bg-[#0a0a0a]/82 p-5 backdrop-blur-xl shadow-[0_12px_40px_rgba(2,8,22,0.55)]">
            <h2 className="text-[14px] font-black uppercase tracking-wider text-[#a3b8cc] mb-4 border-b border-white/[0.08] pb-2.5">
              Insights de Audiência
            </h2>

            {isGa4Connected ? (
              <div className="space-y-6">
                {/* Segments */}
                <div>
                  <h3 className="text-[11px] font-black text-white/40 uppercase tracking-widest mb-3 flex items-center gap-2">
                    Segmentos de Audiência
                    <span className="text-[8px] font-black px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 tracking-wide normal-case">Estimativa</span>
                  </h3>
                  <div className="space-y-2.5">
                    {[
                      { label: 'High Intent Shoppers', val: '35.6%', color: 'bg-emerald-400' },
                      { label: 'Lookalike 1%', val: '24.3%', color: 'bg-emerald-500' },
                      { label: 'Cart Abandoners', val: '18.7%', color: 'bg-emerald-600' },
                      { label: 'Blog Readers', val: '12.7%', color: 'bg-amber-500' },
                      { label: 'Outros', val: '9.3%', color: 'bg-slate-600' }
                    ].map((seg) => (
                      <div key={seg.label}>
                        <div className="flex justify-between text-[12px] mb-1">
                          <span className="text-white/75 font-medium">{seg.label}</span>
                          <span className="font-bold text-white">{seg.val}</span>
                        </div>
                        <div className="w-full bg-white/[0.06] h-1.5 rounded-full overflow-hidden">
                          <div className={`${seg.color} h-full rounded-full shadow-[0_0_6px_rgba(52,211,153,0.4)]`} style={{ width: seg.val }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Demographics Age Chart */}
                <div className="pt-2">
                  <h3 className="text-[11px] font-black text-white/40 uppercase tracking-widest mb-3">Faixa Etária</h3>
                  <div className="space-y-2">
                    {[
                      { age: '18-24', pct: 14.2 },
                      { age: '25-34', pct: 34.6 },
                      { age: '35-44', pct: 28.7 },
                      { age: '45-54', pct: 15.3 },
                      { age: '55+', pct: 7.2 }
                    ].map((demo) => (
                      <div key={demo.age} className="flex items-center gap-2 text-[12px]">
                        <span className="w-10 text-white/60 font-semibold">{demo.age}</span>
                        <div className="flex-grow bg-white/[0.06] h-3 rounded-sm overflow-hidden relative">
                          <div className="bg-emerald-500 h-full rounded-sm shadow-[0_0_4px_rgba(34,197,94,0.4)]" style={{ width: `${demo.pct}%` }} />
                          <span className="absolute right-1.5 top-0 text-[9px] font-bold text-white/90 leading-3">{demo.pct}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Gender Donut */}
                <div className="flex items-center justify-between border-t border-white/[0.08] pt-4">
                  <div>
                    <h3 className="text-[11px] font-black text-white/40 uppercase tracking-widest mb-1">Gênero</h3>
                    <p className="text-[12px] text-white/70 font-medium">Público Predominante</p>
                  </div>
                  <div className="relative h-14 w-14 flex items-center justify-center rounded-full border-[3px] border-emerald-500/20">
                    <div className="absolute inset-0 rounded-full border-[3px] border-emerald-400 border-t-transparent border-r-transparent rotate-[45deg] shadow-[0_0_8px_rgba(34,197,94,0.3)]" />
                    <span className="text-[11px] font-black text-emerald-400">67% M</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center border border-white/[0.08] bg-white/[0.02] rounded-xl">
                <Info className="h-6 w-6 text-amber-400/70 mx-auto mb-2" />
                <span className="text-[13px] text-white/50 block font-semibold">Métricas de Audiência Indisponíveis</span>
                <span className="text-[11px] text-white/30 mt-1.5 block">Conecte o GA4 para carregar dados demográficos</span>
              </div>
            )}
          </section>

        </div>

        {/* Center Column: Performance Trend + Real-time + Top Campaigns + Budget (Span 6) */}
        <div className="xl:col-span-6 flex flex-col gap-6">
          {/* Sales Funnel Widget — ocupa o espaço central do funil de marketing */}
          <SalesFunnelWidget
            isGa4Connected={isGa4Connected}
            isGoogleAdsConnected={isGoogleAdsConnected}
            isMetaAdsConnected={isMetaAdsConnected}
            isLinkedinAdsConnected={isLinkedinAdsConnected}
            ga4Data={ga4Data}
            trafficData={trafficData}
            conversions={stats.conversions}
          />




          {/* Top Campaigns */}
          <section className="rounded-[24px] border border-white/[0.10] border-l-gradient-orange border-l-transparent bg-[#0a0a0a]/82 p-5 backdrop-blur-xl shadow-[0_12px_40px_rgba(2,8,22,0.55)]">
            <div className="flex justify-between items-center mb-4 border-b border-white/[0.08] pb-2.5">
              <h3 className="text-[14px] font-black uppercase tracking-wider text-[#a3b8cc]">
                Melhores Campanhas
              </h3>
              <select className="rounded-lg bg-white/[0.06] border border-white/[0.10] px-2 py-1 text-[11px] text-white cursor-pointer">
                <option>ROAS</option>
              </select>
            </div>

            <div className="space-y-2">
              {isGoogleAdsConnected || isMetaAdsConnected || isLinkedinAdsConnected ? (
                topCampaignsData.map((camp) => (
                  <div key={camp.name} className="flex justify-between items-center py-2 border-b border-white/[0.04] last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-[11px] font-black text-emerald-400">
                        {camp.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[13px] font-bold text-white leading-tight">{camp.name}</span>
                        <span className="text-[11px] text-white/40 font-medium mt-0.5">{camp.spend} investido</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-right">
                      <span className="text-[14px] font-black text-emerald-400">{camp.roas}</span>
                      <span className="text-[11px] font-bold text-emerald-400/80">{camp.trend}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center border border-white/[0.08] bg-white/[0.02] rounded-xl">
                  <Info className="h-6 w-6 text-amber-400/70 mx-auto mb-2" />
                  <span className="text-[13px] text-white/50 block font-semibold">Nenhuma Campanha Ativa Encontrada</span>
                  <span className="text-[11px] text-white/30 mt-1.5 block">Conecte contas de anúncios para puxar campanhas</span>
                </div>
              )}
            </div>

            <Link href="/hub/integracoes" className="mt-5 block text-center text-[12px] font-bold text-[#FF6A00] hover:text-[#ff8c38] transition-colors">
              Ver todas as campanhas →
            </Link>
          </section>

        </div>

        {/* Right Column: Notificações + Feed + Performance + Alocação (Span 3) */}
        <div className="xl:col-span-3 flex flex-col gap-6">

          {/* Notificações — exibe até 4 alertas em formato de lista sem scroll */}
          <section className="rounded-[24px] border border-white/[0.10] border-l-gradient-orange border-l-transparent bg-[#0a0a0a]/82 p-5 backdrop-blur-xl shadow-[0_12px_40px_rgba(2,8,22,0.55)]">
            <h2 className="text-[13px] font-black text-[#a3b8cc] uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-white/[0.08] pb-2.5">
              <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
              Notificações
            </h2>

            <div className="space-y-3.5">
              {/* GA4 warning */}
              {!isGa4Connected && (
                <article
                  onClick={() => setActiveBalloon({
                    type: 'notification',
                    key: 'ga4',
                    title: 'Google Analytics 4',
                    badge: 'Atenção',
                    color: '#f59e0b',
                    content: 'O Google Analytics 4 não está conectado. Isso impede o carregamento de métricas essenciais como faturamento (receita total), conversões de e-commerce e segmentações de audiência no painel principal.',
                    recommendation: 'Vá para a página de Conectores para configurar a conta do GA4.'
                  })}
                  className="border-b border-white/[0.06] pb-3 last:border-0 relative cursor-pointer hover:bg-white/[0.02] p-1.5 rounded-lg transition-colors group"
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[11px] font-black uppercase tracking-wide text-amber-400">
                      GA4
                    </span>
                    <span className="text-[10px] text-amber-400/80 font-bold group-hover:underline">Atenção</span>
                  </div>
                  <p className="text-[13px] font-bold text-white leading-snug">GA4 desativado</p>
                  <p className="text-[11px] text-white/50 mt-0.5">
                    Métricas de faturamento e audiência indisponíveis.{' '}
                    <span className="underline font-bold text-[#FF6A00]">Conectar</span>
                  </p>
                  {activeBalloon?.type === 'notification' && activeBalloon.key === 'ga4' && renderBalloon(activeBalloon)}
                </article>
              )}

              {/* Google Ads warning */}
              {!isGoogleAdsConnected && (
                <article
                  onClick={() => setActiveBalloon({
                    type: 'notification',
                    key: 'gads',
                    title: 'Google Ads',
                    badge: 'Atenção',
                    color: '#f59e0b',
                    content: 'A conta do Google Ads está desconectada. Dados de investimento de mídia paga (Custo), cliques em anúncios e campanhas ativas do Google não serão consolidados nos KPIs.',
                    recommendation: 'Ative a integração de Google Ads na tela de conexões.'
                  })}
                  className="border-b border-white/[0.06] pb-3 last:border-0 relative cursor-pointer hover:bg-white/[0.02] p-1.5 rounded-lg transition-colors group"
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[11px] font-black uppercase tracking-wide text-amber-400">
                      Google Ads
                    </span>
                    <span className="text-[10px] text-amber-400/80 font-bold group-hover:underline">Atenção</span>
                  </div>
                  <p className="text-[13px] font-bold text-white leading-snug">Google Ads desativado</p>
                  <p className="text-[11px] text-white/50 mt-0.5">
                    Custo de mídia e cliques não consolidados.{' '}
                    <span className="underline font-bold text-[#FF6A00]">Ativar</span>
                  </p>
                  {activeBalloon?.type === 'notification' && activeBalloon.key === 'gads' && renderBalloon(activeBalloon)}
                </article>
              )}

              {/* Meta Ads warning */}
              {!isMetaAdsConnected && (
                <article
                  onClick={() => setActiveBalloon({
                    type: 'notification',
                    key: 'meta',
                    title: 'Meta Ads',
                    badge: 'Atenção',
                    color: '#f59e0b',
                    content: 'A conexão com o Meta Ads (Facebook/Instagram) está inativa. O faturamento, investimento de mídia real, impressões e taxas de conversões do ecossistema Meta não constam nos dados.',
                    recommendation: 'Ative a integração do Meta Ads para consolidar esses dados.'
                  })}
                  className="border-b border-white/[0.06] pb-3 last:border-0 relative cursor-pointer hover:bg-white/[0.02] p-1.5 rounded-lg transition-colors group"
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[11px] font-black uppercase tracking-wide text-amber-400">
                      Meta Ads
                    </span>
                    <span className="text-[10px] text-amber-400/80 font-bold group-hover:underline">Atenção</span>
                  </div>
                  <p className="text-[13px] font-bold text-white leading-snug">Meta Ads desativado</p>
                  <p className="text-[11px] text-white/50 mt-0.5">
                    Investimento e conversões do ecossistema Meta ausentes.{' '}
                    <span className="underline font-bold text-[#FF6A00]">Ativar</span>
                  </p>
                  {activeBalloon?.type === 'notification' && activeBalloon.key === 'meta' && renderBalloon(activeBalloon)}
                </article>
              )}

              {/* TikTok Ads warning */}
              {!isTiktokAdsConnected && (
                <article
                  onClick={() => setActiveBalloon({
                    type: 'notification',
                    key: 'tiktok',
                    title: 'TikTok Ads',
                    badge: 'Atenção',
                    color: '#f59e0b',
                    content: 'A conta de anúncios do TikTok Ads não está vinculada. Métricas de investimento e conversão de vídeos patrocinados não serão exibidas em tempo real.',
                    recommendation: 'Vincule o TikTok Ads na página de conectores.'
                  })}
                  className="border-b border-white/[0.06] pb-3 last:border-0 relative cursor-pointer hover:bg-white/[0.02] p-1.5 rounded-lg transition-colors group"
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[11px] font-black uppercase tracking-wide text-amber-400">
                      TikTok Ads
                    </span>
                    <span className="text-[10px] text-amber-400/80 font-bold group-hover:underline">Atenção</span>
                  </div>
                  <p className="text-[13px] font-bold text-white leading-snug">TikTok Ads desativado</p>
                  <p className="text-[11px] text-white/50 mt-0.5">
                    Métricas de investimento não ativas.{' '}
                    <span className="underline font-bold text-[#FF6A00]">Vincular</span>
                  </p>
                  {activeBalloon?.type === 'notification' && activeBalloon.key === 'tiktok' && renderBalloon(activeBalloon)}
                </article>
              )}

              {/* Twitter / Snapchat info */}
              <article
                onClick={() => setActiveBalloon({
                  type: 'notification',
                  key: 'twitsnap',
                  title: 'Twitter / Snapchat',
                  badge: 'Info',
                  color: '#8fa0b5',
                  content: 'Essas plataformas não possuem sincronização automática por meio da API de tempo real configurada. Seus indicadores exibirão permanentemente "N/A" até a liberação de novos conectores.',
                  recommendation: 'Nenhuma ação é necessária no momento.'
                })}
                className="border-b border-white/[0.06] pb-3 last:border-0 relative cursor-pointer hover:bg-white/[0.02] p-1.5 rounded-lg transition-colors group"
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[11px] font-black uppercase tracking-wide text-[#8fa0b5]">
                    Twitter / Snapchat
                  </span>
                  <span className="text-[10px] text-[#8fa0b5]/50 font-bold group-hover:underline">Info</span>
                </div>
                <p className="text-[13px] font-bold text-white leading-snug">Sem suporte de sync automático</p>
                <p className="text-[11px] text-[#8fa0b5]/70 mt-0.5">indicadores exibem N/A permanentemente.</p>
                {activeBalloon?.type === 'notification' && activeBalloon.key === 'twitsnap' && renderBalloon(activeBalloon)}
              </article>

              {/* Success */}
              {isGa4Connected && isGoogleAdsConnected && isMetaAdsConnected && (
                <article
                  onClick={() => setActiveBalloon({
                    type: 'notification',
                    key: 'success',
                    title: 'Integração Central',
                    badge: 'Ativo',
                    color: '#10b981',
                    content: 'Operação central totalmente integrada! GA4, Google Ads e Meta Ads estão conectados e sincronizando dados reais sem problemas no ecossistema.',
                    recommendation: 'Tudo funcionando perfeitamente. Continue acompanhando o funil em tempo real.'
                  })}
                  className="border-b border-white/[0.06] pb-3 last:border-0 relative cursor-pointer hover:bg-white/[0.02] p-1.5 rounded-lg transition-colors group"
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[11px] font-black uppercase tracking-wide text-emerald-400">
                      Integração
                    </span>
                    <span className="text-[10px] text-emerald-400/80 font-bold group-hover:underline">Ativo</span>
                  </div>
                  <p className="text-[13px] font-bold text-white leading-snug">Operação central integrada!</p>
                  <p className="text-[11px] text-white/50 mt-0.5">GA4, Google Ads e Meta Ads carregando em tempo real.</p>
                  {activeBalloon?.type === 'notification' && activeBalloon.key === 'success' && renderBalloon(activeBalloon)}
                </article>
              )}
            </div>
          </section>

          {/* Feed de Atividade ao Vivo — exibe exatamente 7 itens sem scroll */}
          <section className="rounded-[24px] border border-white/[0.10] border-l-gradient-orange border-l-transparent bg-[#0a0a0a]/82 p-5 backdrop-blur-xl shadow-[0_12px_40px_rgba(2,8,22,0.55)]">
            <h2 className="text-[14px] font-black uppercase tracking-wider text-[#a3b8cc] mb-4 border-b border-white/[0.08] pb-2.5 flex items-center justify-between">
              Feed de Atividade ao Vivo
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            </h2>

            <div className="space-y-3.5">
              {liveActivities.slice(0, 7).map((act, idx) => (
                <article
                  key={idx}
                  onClick={() => setActiveBalloon({
                    type: 'activity',
                    key: idx,
                    title: act.platform,
                    badge: act.detail,
                    color: act.color,
                    content: act.description,
                    recommendation: act.recommendation,
                    extra: `Ocorrência: ${act.time} | Valor: ${act.value}`
                  })}
                  className="border-b border-white/[0.06] pb-3 last:border-0 relative cursor-pointer hover:bg-white/[0.02] p-1.5 rounded-lg transition-colors group"
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[11px] font-black uppercase tracking-wide" style={{ color: act.color }}>
                      {act.platform}
                    </span>
                    <span className="text-[10px] text-white/30 font-medium group-hover:underline">{act.time}</span>
                  </div>
                  <p className="text-[13px] font-bold text-white leading-snug">{act.detail}</p>
                  <p className="text-[11px] text-white/50 mt-0.5 font-mono">{act.value}</p>
                  {activeBalloon?.type === 'activity' && activeBalloon.key === idx && renderBalloon(activeBalloon)}
                </article>
              ))}
            </div>

            <Link href="/hub/integracoes" className="mt-4 block text-center text-[12px] font-bold text-[#FF6A00] hover:text-[#ff8c38] transition-colors border-t border-white/[0.08] pt-3">
              Ver toda a atividade →
            </Link>
          </section>

          {/* Performance em Tempo Real */}
          <article className="rounded-[24px] border border-white/[0.10] border-l-gradient-orange border-l-transparent bg-[#0a0a0a]/82 p-5 backdrop-blur-xl shadow-[0_12px_40px_rgba(2,8,22,0.55)]">
            <div className="flex justify-between items-center mb-4 border-b border-white/[0.08] pb-2.5">
              <h3 className="text-[14px] font-black uppercase tracking-wider text-[#a3b8cc]">
                Performance em Tempo Real
              </h3>
              <select className="rounded-lg bg-white/[0.06] border border-white/[0.10] px-2 py-1 text-[11px] text-white cursor-pointer">
                <option>Últimos 30 min</option>
              </select>
            </div>

            <div className="space-y-3">
              {realTimePerformanceData.map((row) => (
                <div key={row.label} className="flex justify-between items-center">
                  <span className="text-[12px] font-semibold text-white/75">{row.label}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-[13px] font-black text-white">{row.value}</span>
                    <div className="w-[50px] flex justify-end">
                      {stats.spend !== 'N/A' ? (
                        renderSparkline(row.spark, '#22c55e', 50, 16)
                      ) : (
                        <div className="w-10 h-px bg-white/10" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </article>

          {/* Alocação de Orçamento */}
          <article className="rounded-[24px] border border-white/[0.10] border-l-gradient-orange border-l-transparent bg-[#0a0a0a]/82 p-5 backdrop-blur-xl shadow-[0_12px_40px_rgba(2,8,22,0.55)]">
            <div className="flex justify-between items-center mb-4 border-b border-white/[0.08] pb-2.5">
              <h3 className="text-[14px] font-black uppercase tracking-wider text-[#a3b8cc]">
                Alocação de Orçamento
              </h3>
              <span title="Distribuição do investimento real por canal de mídia ativo">
                <Info className="h-3.5 w-3.5 text-white/30 hover:text-white/70 cursor-pointer transition-colors" />
              </span>
            </div>

            <div className="space-y-3">
              {budgetAllocationData.map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.color, boxShadow: `0 0 5px ${item.color}80` }} />
                      <span className="text-[12px] text-white/80 font-medium">{item.label}</span>
                    </div>
                    <span className="text-[12px] font-black text-white">
                      {stats.spend !== 'N/A' ? `${item.pct.toFixed(1)}%` : 'N/A'}
                    </span>
                  </div>
                  {stats.spend !== 'N/A' && (
                    <div className="h-1.5 w-full bg-white/[0.06] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${item.pct}%`, backgroundColor: item.color }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>

            <Link href="/hub/integracoes" className="mt-4 block text-center text-[12px] font-bold text-[#FF6A00] hover:text-[#ff8c38] transition-colors">
              Ver relatório de budget →
            </Link>
          </article>

        </div>

      </div>
    </div>
  );
}
