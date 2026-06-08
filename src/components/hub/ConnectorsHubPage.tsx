'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { doc, setDoc } from 'firebase/firestore';
import {
  ArrowRight,
  BookOpenText,
  Check,
  EllipsisVertical,
  ExternalLink,
  Info,
  Link2,
  Plus,
  RefreshCw,
  TriangleAlert,
  X,
  Building2,
  PlugZap,
  Globe,
  BookOpen,
  Crown,
  ShieldCheck,
  Workflow,
  User,
  Mail,
  Phone,
  CreditCard,
  DollarSign,
  Calendar,
  Fingerprint,
  Activity,
  Trash2,
  ShieldAlert,
} from 'lucide-react';
import Navbar from '../layout/Navbar';
import Footer from '../layout/Footer';
import LuccaHubSupportWidget from './LuccaHubSupportWidget';
import { useAuth } from '../../context/AuthContext';
import { getFirebaseDb } from '../../lib/firebase';
import { getHubLoginRedirect, getHubOnboardingRedirect, resolveHubAccessState } from '../../lib/hub-access';

const SETTINGS_MODAL_VIEWPORT = 'fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden px-2 py-2 sm:px-4 sm:py-4';
const SETTINGS_MODAL_BACKDROP = 'absolute inset-0 bg-[#0F172A]/40 backdrop-blur-md transition-opacity duration-300';
const SETTINGS_MODAL_FRAME = 'relative w-full max-h-[96vh] rounded-[24px] bg-white border border-slate-100/80 shadow-[0_24px_60px_-15px_rgba(15,23,42,0.12)] overflow-hidden animate-in fade-in zoom-in-95 duration-250';
const SETTINGS_MODAL_SURFACE = 'max-h-[calc(96vh-4px)] flex flex-col overflow-hidden h-full bg-white';
const PREMIUM_MODAL_HEADER = 'relative border-b border-[#1a365d]/40 bg-[#0d1e3d] px-6 py-5 flex flex-col gap-1 overflow-hidden';
const PREMIUM_MODAL_CLOSE_BUTTON = 'absolute right-5 top-5 rounded-full border border-white/10 bg-white/5 p-2 text-white/80 transition-all hover:bg-white/10 hover:text-white hover:scale-105 active:scale-95 shadow-sm z-50';
const SETTINGS_PANEL = 'rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.02)] transition-all duration-200 hover:border-slate-200/80 hover:shadow-[0_8px_30px_-6px_rgba(15,23,42,0.04)]';
const SETTINGS_LABEL = 'mb-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400';
const SETTINGS_INPUT = 'w-full rounded-xl border border-slate-200 bg-[#F8FAFC] px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition-all duration-200 focus:border-[#FF7A00] focus:bg-white focus:ring-2 focus:ring-[#FF7A00]/10';
const SETTINGS_SECONDARY_BUTTON = 'rounded-xl border border-slate-200 px-5 py-3 text-xs font-black uppercase tracking-widest text-[#667085] transition-all hover:bg-[#F8FAFC] hover:text-slate-700 hover:border-slate-300 active:scale-98';
const SETTINGS_PRIMARY_BUTTON = 'rounded-xl bg-gradient-to-r from-[#08B760] to-[#0A9D57] px-5 py-3 text-xs font-black uppercase tracking-widest text-white shadow-[0_8px_18px_rgba(10,157,87,0.15)] transition-all hover:brightness-105 active:scale-98';
import {
  CONNECTOR_CONNECTION_KEYS,
  DEFAULT_CONNECTOR_STATUS,
  getConnectorStatusFromConnections,
  type ConnectorConnection,
  type ConnectorKey,
  type ConnectorStatus,
} from '../../lib/connectors';

type UiConnectorId =
  | ConnectorKey
  | 'rdStation'
  | 'rdStationMarketing'
  | 'rdStationConversas'
  | 'googleTrends'
  | 'linkedinPage'
  | 'instagram'
  | 'tiktok'
  | 'tiktokAds';
type UiCategory = 'marketing' | 'ads' | 'crm' | 'social';

type UiConnector = {
  id: UiConnectorId;
  connectorKey?: ConnectorKey;
  title: string;
  description: string;
  category: UiCategory;
  lastSyncLabelWhenActive: string;
  isLiveConnector: boolean;
};

type MetaAdsAccountOption = {
  id: string;
  name: string;
  accountId: string;
  currency: string;
  status: string;
};

type InstagramAccountOption = {
  id: string;
  name: string;
  username: string;
  pageName: string;
  pageId: string;
};

type Ga4AccountOption = {
  id: string;
  name: string;
  accountId: string;
};

type HubSpotAccountOption = {
  id: string;
  name: string;
  accountId: string;
};

type StripeAccountBootstrap = {
  accountName?: string;
  accountEmail?: string;
  accountId?: string;
};

type ParsedHubSpotInstallUrl = {
  clientId: string;
  redirectUri: string;
  scope: string;
  optionalScope?: string;
};

type GoogleAdsAccountOption = {
  id: string;
  name: string;
  accountId: string;
  isManager: boolean;
  loginCustomerId: string | null;
  managerName: string | null;
};

type PendingOAuthConnection = {
  connector: ConnectorKey;
  provider: string | null;
  accessToken: string;
  refreshToken: string | null;
  expiresIn: number | null;
  accountId: string | null;
  loginCustomerId?: string | null;
  metadata?: Record<string, unknown> | null;
};

type InlineConnectorNotice = {
  connectorId: UiConnectorId;
  message: string;
  tone: 'info' | 'success' | 'error';
};

type RdTokenConnectorKey = 'rdStationMarketing';

const CONNECTOR_ITEMS: UiConnector[] = [
  {
    id: 'crm',
    connectorKey: 'crm',
    title: 'HubSpot',
    description: 'Sincronize leads, empresas e oportunidades para uma visão completa do funil.',
    category: 'crm',
    lastSyncLabelWhenActive: 'Hoje, 08:45',
    isLiveConnector: true,
  },
  {
    id: 'rdStation',
    connectorKey: 'rdStation',
    title: 'RD Station CRM',
    description: 'Centralize contatos, empresas e estágios do pipeline para acelerar repasse e previsibilidade comercial.',
    category: 'crm',
    lastSyncLabelWhenActive: 'Nunca sincronizado',
    isLiveConnector: true,
  },
  {
    id: 'rdStationMarketing',
    connectorKey: 'rdStationMarketing',
    title: 'RD Station Marketing',
    description: 'Conecte formulários, campanhas e automações para elevar a qualificação de leads com dados reais.',
    category: 'marketing',
    lastSyncLabelWhenActive: 'Nunca sincronizado',
    isLiveConnector: true,
  },
  {
    id: 'rdStationConversas',
    connectorKey: 'rdStationConversas',
    title: 'RD Station Conversas',
    description: 'Integre WhatsApp e canais de atendimento para dar escala ao time comercial sem perder contexto.',
    category: 'social',
    lastSyncLabelWhenActive: 'Nunca sincronizado',
    isLiveConnector: true,
  },
  {
    id: 'payments',
    connectorKey: 'payments',
    title: 'Stripe',
    description: 'Conecte pagamentos para liberar receita confirmada, LTV e conciliação comercial no Hub.',
    category: 'crm',
    lastSyncLabelWhenActive: 'Nunca sincronizado',
    isLiveConnector: true,
  },
  {
    id: 'googleAds',
    connectorKey: 'googleAds',
    title: 'Google Ads',
    description: 'Acompanhe campanhas, custos e conversões para otimizar seus investimentos.',
    category: 'ads',
    lastSyncLabelWhenActive: 'Hoje, 08:32',
    isLiveConnector: true,
  },
  {
    id: 'metaAds',
    connectorKey: 'metaAds',
    title: 'Meta Ads',
    description: 'Importe dados de anúncios do Facebook e Instagram para análises mais precisas.',
    category: 'ads',
    lastSyncLabelWhenActive: 'Hoje, 08:15',
    isLiveConnector: true,
  },
  {
    id: 'ga4',
    connectorKey: 'ga4',
    title: 'GA4',
    description: 'Monitore eventos, sessões e conversões para leitura real de funil e receita.',
    category: 'marketing',
    lastSyncLabelWhenActive: 'Hoje, 08:26',
    isLiveConnector: true,
  },
  {
    id: 'googleTrends',
    connectorKey: 'googleTrends',
    title: 'Google Trends',
    description: 'Capte tendências de busca para ajustar pauta, criativos e oferta com antecedência.',
    category: 'marketing',
    lastSyncLabelWhenActive: 'Nunca sincronizado',
    isLiveConnector: true,
  },
  {
    id: 'linkedinPage',
    connectorKey: 'linkedinPage',
    title: 'LinkedIn Page',
    description: 'Acompanhe conteúdo orgânico, crescimento de audiência e sinais de intenção B2B.',
    category: 'social',
    lastSyncLabelWhenActive: 'Nunca sincronizado',
    isLiveConnector: true,
  },
  {
    id: 'linkedinAds',
    connectorKey: 'linkedinAds',
    title: 'LinkedIn Ads',
    description: 'Meça campanhas B2B com foco em CPL qualificado e pipeline comercial.',
    category: 'ads',
    lastSyncLabelWhenActive: 'Hoje, 07:58',
    isLiveConnector: true,
  },
  {
    id: 'instagram',
    connectorKey: 'instagram',
    title: 'Instagram',
    description: 'Consolide sinais de engajamento comercial e conteúdo com potencial de conversão.',
    category: 'social',
    lastSyncLabelWhenActive: 'Nunca sincronizado',
    isLiveConnector: true,
  },
  {
    id: 'tiktok',
    connectorKey: 'tiktok',
    title: 'Tik Tok',
    description: 'Mapeie comportamento de audiência e tendências de formato para escalar criativos.',
    category: 'social',
    lastSyncLabelWhenActive: 'Nunca sincronizado',
    isLiveConnector: true,
  },
  {
    id: 'tiktokAds',
    connectorKey: 'tiktokAds',
    title: 'Tik Tok Ads',
    description: 'Integre performance de mídia com custo por aquisição e receita incremental.',
    category: 'ads',
    lastSyncLabelWhenActive: 'Nunca sincronizado',
    isLiveConnector: true,
  },
];

const CATEGORY_LABELS: Record<UiCategory | 'todos', string> = {
  todos: 'Todos',
  marketing: 'Marketing',
  ads: 'Ads',
  crm: 'CRM',
  social: 'Social',
};

const OAUTH_CONNECTOR_PROVIDERS: Partial<Record<ConnectorKey, string>> = {
  googleAds: 'google',
  googleTrends: 'google',
  metaAds: 'meta',
  instagram: 'meta',
  linkedinAds: 'linkedin',
  linkedinPage: 'linkedin',
  ga4: 'google',
  tiktok: 'tiktok',
  tiktokAds: 'tiktokAds',
  payments: 'stripe',
  warehouse: 'bigquery',
};

const CONNECTOR_DOCS_URLS: Partial<Record<UiConnectorId, string>> = {
  payments: 'https://stripe.com/docs/connect/oauth-reference',
  crm: 'https://developers.hubspot.com/docs/api/overview',
  rdStation: 'https://developers.rdstation.com/reference/overview',
  rdStationMarketing: 'https://developers.rdstation.com/reference/api-rd-station-doc',
  rdStationConversas: 'https://developers.rdstation.com/reference/acesse-a-api-do-rd-station-conversas',
  googleAds: 'https://developers.google.com/google-ads/api/docs/start',
  metaAds: 'https://developers.facebook.com/docs/marketing-apis',
  ga4: 'https://developers.google.com/analytics/devguides/reporting/data/v1',
  googleTrends: 'https://trends.google.com/trends/',
  linkedinPage: 'https://learn.microsoft.com/en-us/linkedin/marketing/community-management/shares',
  linkedinAds: 'https://learn.microsoft.com/en-us/linkedin/marketing/integrations/ads/advertising-api',
  instagram: 'https://developers.facebook.com/docs/instagram-platform',
  tiktok: 'https://developers.tiktok.com/',
  tiktokAds: 'https://ads.tiktok.com/marketing_api/docs',
};

function readRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object') return null;
  return value as Record<string, unknown>;
}

function readString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function isConnectorKey(value: string | null): value is ConnectorKey {
  if (!value) return false;
  return value in DEFAULT_CONNECTOR_STATUS;
}

function isConnectorActive(item: UiConnector, connectorStatus: ConnectorStatus): boolean {
  if (!item.connectorKey) return false;
  return Boolean(connectorStatus[item.connectorKey]);
}

function getConnectorOAuthHref(connectorKey: ConnectorKey, provider?: string) {
  const params = new URLSearchParams({
    next: '/hub/conectores',
  });
  if (provider) params.set('provider', provider);
  return `/api/auth/connectors/${connectorKey}/start?${params.toString()}`;
}

async function parseJsonOrThrow<T>(response: Response, defaultErrorMessage: string): Promise<T> {
  const raw = await response.text();
  try {
    return JSON.parse(raw) as T;
  } catch {
    const statusLabel = response.status ? ` (${response.status})` : '';
    throw new Error(`${defaultErrorMessage}${statusLabel}`);
  }
}

function formatLastSyncLabel(timestamp: number | null): string {
  if (!timestamp || !Number.isFinite(timestamp)) return 'Sem sincronização registrada';

  const now = new Date();
  const date = new Date(timestamp);
  const sameDay =
    now.getFullYear() === date.getFullYear() &&
    now.getMonth() === date.getMonth() &&
    now.getDate() === date.getDate();

  if (sameDay) {
    return `Hoje, ${new Intl.DateTimeFormat('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(date)}`;
  }

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date);
}

async function resolveHubSpotAccountIdentity(accessToken: string): Promise<{ accountName: string | null; accountId: string | null }> {
  const token = accessToken.trim();
  if (!token) return { accountName: null, accountId: null };

  try {
    const response = await fetch('https://api.hubapi.com/integrations/v1/me', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) return { accountName: null, accountId: null };

    const payload = (await response.json()) as Record<string, unknown>;
    const accountName =
      readString(payload.hub_domain as unknown) ||
      readString(payload.account_name as unknown) ||
      readString(payload.hub_name as unknown) ||
      readString(payload.name as unknown) ||
      null;

    const accountId =
      readString(payload.hub_id as unknown) ||
      readString(payload.portal_id as unknown) ||
      readString(payload.portalId as unknown) ||
      null;

    return { accountName, accountId };
  } catch {
    return { accountName: null, accountId: null };
  }
}

function parseHubSpotInstallUrl(raw: string): ParsedHubSpotInstallUrl | null {
  const input = raw.trim();
  if (!input) return null;
  try {
    const parsed = new URL(input);
    const isHubSpotHost = parsed.hostname.endsWith('hubspot.com');
    const hasOauthPath = parsed.pathname.includes('/oauth/authorize');
    if (!isHubSpotHost || !hasOauthPath) return null;

    const clientId = parsed.searchParams.get('client_id')?.trim() ?? '';
    const redirectUri = parsed.searchParams.get('redirect_uri')?.trim() ?? '';
    const scope = parsed.searchParams.get('scope')?.trim() ?? '';
    if (!clientId || !redirectUri || !scope) return null;
    const optionalScope = parsed.searchParams.get('optional_scope')?.trim() ?? '';

    return { clientId, redirectUri, scope, optionalScope: optionalScope || undefined };
  } catch {
    return null;
  }
}



function HealthGauge({ value }: { value: number }) {
  const boundedValue = Math.max(0, Math.min(value, 100));
  const cx = 120;
  const cy = 120;
  const radius = 82;
  const strokeWidth = 14;

  const scoreTone =
    boundedValue >= 70
      ? {
          valueColor: '#0F172A',
          needleStart: '#FFD37A',
          needleEnd: '#FF6A00',
          centerGlow: '#FDBA74',
        }
      : boundedValue >= 50
        ? {
            valueColor: '#0F172A',
            needleStart: '#FBBF24',
            needleEnd: '#F97316',
            centerGlow: '#FDBA74',
          }
        : {
            valueColor: '#0F172A',
            needleStart: '#FB7185',
            needleEnd: '#EF4444',
            centerGlow: '#FCA5A5',
          };

  const totalSegments = 8;
  const segmentAngle = Math.PI / totalSegments;
  const gapRad = 0.065;

  const segments = Array.from({ length: totalSegments }).map((_, idx) => {
    const startAngle = Math.PI - idx * segmentAngle - gapRad / 2;
    const endAngle = Math.PI - (idx + 1) * segmentAngle + gapRad / 2;

    const startX = cx + radius * Math.cos(startAngle);
    const startY = cy - radius * Math.sin(startAngle);
    const endX = cx + radius * Math.cos(endAngle);
    const endY = cy - radius * Math.sin(endAngle);

    let color = '#22C55E';
    if (idx >= 4 && idx <= 5) {
      color = '#F59E0B';
    } else if (idx >= 6) {
      color = '#EF4444';
    }

    const segmentPercentageEnd = ((idx + 1) / totalSegments) * 100;
    const isActive = boundedValue >= segmentPercentageEnd - 7;

    return {
      path: `M ${startX} ${startY} A ${radius} ${radius} 0 0 1 ${endX} ${endY}`,
      color,
      isActive,
    };
  });

  const trackPath = `M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`;
  const angleRad = Math.PI - (Math.PI * boundedValue) / 100;
  const needleLenStart = radius - 34;
  const needleLenEnd = radius + 10;
  const needleX1 = cx + needleLenStart * Math.cos(angleRad);
  const needleY1 = cy - needleLenStart * Math.sin(angleRad);
  const needleX2 = cx + needleLenEnd * Math.cos(angleRad);
  const needleY2 = cy - needleLenEnd * Math.sin(angleRad);

  return (
    <div className="relative mt-2 flex flex-col items-center justify-center">
      <div className="hub-health-orbit-bg pointer-events-none absolute inset-x-7 top-7 h-[130px]" aria-hidden />
      <svg
        viewBox="0 0 240 150"
        className="relative z-10 h-[152px] w-[250px] drop-shadow-[0_10px_20px_rgba(15,23,42,0.08)]"
        aria-label={`Saúde ${boundedValue} de 100`}
        role="img"
      >
        <defs>
          <linearGradient id="hubGaugeNeedleGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={scoreTone.needleStart} />
            <stop offset="100%" stopColor={scoreTone.needleEnd} />
          </linearGradient>
          <filter id="hubGaugeGlow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="2.4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <path
          d={trackPath}
          fill="none"
          stroke="#E9EDF4"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          opacity={0.85}
        />

        {segments.map((seg, i) => (
          <path
            key={i}
            d={seg.path}
            fill="none"
            stroke={seg.color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            className="transition-all duration-500"
            style={{
              opacity: seg.isActive ? 1 : 0.14,
              filter: seg.isActive ? 'url(#hubGaugeGlow)' : 'none',
            }}
          />
        ))}

        <line
          x1={needleX1}
          y1={needleY1}
          x2={needleX2}
          y2={needleY2}
          stroke="url(#hubGaugeNeedleGradient)"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <circle cx={cx} cy={cy} r="8.5" fill="#0F172A" />
        <circle cx={cx} cy={cy} r="5" fill={scoreTone.centerGlow} />
      </svg>

      <p
        className="absolute top-[60px] text-[56px] font-black leading-none tracking-tight"
        style={{ color: scoreTone.valueColor }}
      >
        {boundedValue}%
      </p>
    </div>
  );
}

function BrandTile({ id }: { id: UiConnectorId }) {
  if (id === 'payments') {
    return (
      <div className="flex h-full w-full items-center justify-center rounded-xl border border-[#E7ECF5] bg-white">
        <CreditCard className="h-8 w-8 text-[#635BFF]" />
      </div>
    );
  }

  if (id === 'rdStation') {
    return (
      <Image
        src="/images/connectors/rd-station-conversas-photorealistic-icon-hd-v1.png"
        alt="Ícone RD Station foto realista em fundo branco"
        width={88}
        height={88}
        className="h-full w-full rounded-xl object-cover"
      />
    );
  }

  if (id === 'rdStationMarketing') {
    return (
      <Image
        src="/images/connectors/rd-station-conversas-photorealistic-icon-hd-v1.png"
        alt="Ícone RD Station Marketing foto realista em fundo branco"
        width={88}
        height={88}
        className="h-full w-full rounded-xl object-cover"
      />
    );
  }

  if (id === 'rdStationConversas') {
    return (
      <Image
        src="/images/connectors/rd-station-conversas-photorealistic-icon-hd-v1.png"
        alt="Ícone RD Station Conversas foto realista em fundo branco"
        width={88}
        height={88}
        className="h-full w-full rounded-xl object-cover"
      />
    );
  }

  if (id === 'googleAds') {
    return (
      <Image
        src="/images/connectors/google-ads-icon-white-v1.png"
        alt="Ícone Google Ads com fundo branco"
        width={88}
        height={88}
        className="h-full w-full rounded-xl object-cover"
      />
    );
  }

  if (id === 'metaAds') {
    return (
      <Image
        src="/images/connectors/meta-ads-photorealistic-icon-hd-v1.png"
        alt="Ícone Meta Ads foto realista em fundo branco"
        width={88}
        height={88}
        className="h-full w-full rounded-xl object-cover"
      />
    );
  }

  if (id === 'crm') {
    return (
      <Image
        src="/images/connectors/hubspot-photorealistic-icon-hd-v1.png"
        alt="Ícone HubSpot foto realista em fundo branco"
        width={88}
        height={88}
        className="h-full w-full rounded-xl object-cover"
      />
    );
  }

  if (id === 'ga4') {
    return (
      <Image
        src="/images/connectors/ga4-photorealistic-icon-hd-v1.png"
        alt="Ícone GA4 foto realista em fundo branco"
        width={88}
        height={88}
        className="h-full w-full rounded-xl object-cover"
      />
    );
  }

  if (id === 'googleTrends') {
    return (
      <Image
        src="/images/connectors/google-trends-photorealistic-icon-hd-v1.png"
        alt="Ícone Google Trends foto realista em fundo branco"
        width={88}
        height={88}
        className="h-full w-full rounded-xl object-cover"
      />
    );
  }

  if (id === 'linkedinPage') {
    return (
      <Image
        src="/images/connectors/linkedin-page-photorealistic-icon-hd-v1.png"
        alt="Ícone LinkedIn Page foto realista em fundo branco"
        width={88}
        height={88}
        className="h-full w-full rounded-xl object-cover"
      />
    );
  }

  if (id === 'linkedinAds') {
    return (
      <Image
        src="/images/connectors/linkedin-ads-photorealistic-icon-hd-v1.png"
        alt="Ícone LinkedIn Ads foto realista em fundo branco"
        width={88}
        height={88}
        className="h-full w-full rounded-xl object-cover"
      />
    );
  }

  if (id === 'instagram') {
    return (
      <Image
        src="/images/connectors/instagram-photorealistic-icon-hd-v2.png"
        alt="Ícone Instagram foto realista em fundo branco"
        width={88}
        height={88}
        className="h-full w-full rounded-xl object-cover"
      />
    );
  }

  if (id === 'tiktok') {
    return (
      <Image
        src="/images/connectors/tiktok-icon-from-reference-v1.png"
        alt="Ícone Tik Tok oficial em fundo branco"
        width={88}
        height={88}
        className="h-full w-full rounded-xl object-cover"
      />
    );
  }

  if (id === 'tiktokAds') {
    return (
      <Image
        src="/images/connectors/tiktok-photorealistic-icon-hd-v2.png"
        alt="Ícone Tik Tok Ads foto realista em fundo branco"
        width={88}
        height={88}
        className="h-full w-full rounded-xl object-cover"
      />
    );
  }

  return (
    <svg viewBox="0 0 64 64" className="h-10 w-10" aria-hidden>
      <rect x="8" y="26" width="20" height="12" rx="5" fill="#36C5F0" transform="rotate(-25 18 32)" />
      <rect x="22" y="8" width="12" height="20" rx="5" fill="#2EB67D" />
      <rect x="34" y="22" width="20" height="12" rx="5" fill="#ECB22E" transform="rotate(25 44 28)" />
      <rect x="30" y="34" width="12" height="20" rx="5" fill="#E01E5A" />
    </svg>
  );
}

const ACCOUNT_SELECTION_MODAL_PANEL_CLASSNAME =
  'relative z-[1201] w-full max-w-5xl overflow-hidden rounded-2xl border border-[#173C6E] bg-[#060F24] p-5 shadow-[0_24px_48px_rgba(15,23,42,0.28)] md:p-6';
const ACCOUNT_SELECTION_MODAL_PANEL_STYLE = {
  backgroundImage:
    'radial-gradient(circle at 18% 18%, rgba(255,122,33,0.34) 0%, rgba(255,122,33,0.12) 28%, rgba(255,122,33,0) 52%), radial-gradient(circle at 88% 12%, rgba(45,128,255,0.28) 0%, rgba(45,128,255,0.10) 30%, rgba(45,128,255,0) 54%), linear-gradient(130deg, #07162F 0%, #0A2145 55%, #081A36 100%)',
} as const;
const ACCOUNT_SELECTION_MODAL_TITLE_CLASSNAME = 'text-[22px] font-black text-white';
const ACCOUNT_SELECTION_MODAL_DESCRIPTION_CLASSNAME = 'mt-2 text-[18px] text-white';
const ACCOUNT_SELECTION_MODAL_LABEL_CLASSNAME = 'flex flex-col gap-2 text-[20px] font-semibold text-white';
const ACCOUNT_SELECTION_MODAL_SELECT_CLASSNAME =
  'h-11 rounded-xl border border-[#A7B8D8] bg-white px-3 text-[14px] font-semibold text-[#0F172A] outline-none focus:border-[#FF8A3D]';
const ACCOUNT_SELECTION_MODAL_BUTTON_CLASSNAME =
  'inline-flex h-11 items-center justify-center rounded-xl bg-[#FF7A00] px-5 text-[14px] font-black text-white transition hover:bg-[#E66E00] disabled:cursor-not-allowed disabled:opacity-60';

export type AlertPriority = 'critico' | 'alto' | 'medio' | 'info';

export type AlertItem = {
  id: string;
  priority: AlertPriority;
  badgeText: string;
  hasGlowOrange?: boolean;
  time: string;
  title: string;
  description: string;
  detailText: string;
  status: 'active' | 'read' | 'completed';
  completedBy?: 'Você' | 'Agente NeuroAds';
  insights: string[];
  actionLink?: { label: string; url: string };
  readAt?: number;
  completedAt?: number;
};

const DEFAULT_ALERTS: AlertItem[] = [
  {
    id: 'alert-1',
    priority: 'critico',
    badgeText: 'Crítico',
    time: '11:04',
    title: 'Falha de Conexão API Pagamentos',
    description: '(Timeout: 15s)',
    detailText: 'A conexão com a API do gateway de pagamentos falhou repetidamente por timeout de 15 segundos durante a tentativa de sincronizar as últimas transações operacionais.',
    status: 'active',
    insights: [
      'O tempo de resposta do gateway excedeu o limite máximo configurado de 15 segundos.',
      'Verifique se há alguma instabilidade geral declarada no painel oficial de status do provedor.',
      'Uma nova tentativa de sincronização automática será executada em 10 minutos, ou você pode reconfigurar as credenciais caso o problema persista.'
    ],
    actionLink: { label: 'Verificar Status do Provedor', url: 'https://status.stripe.com' },
  },
  {
    id: 'alert-2',
    priority: 'critico',
    badgeText: 'Crítico',
    hasGlowOrange: true,
    time: '10:58',
    title: 'Alta Latência DB Clientes',
    description: '(Nível 4: 840ms)',
    detailText: 'O tempo médio de resposta do banco de dados de clientes ultrapassou o limite operacional seguro de 200ms, registrando latências elevadas de 840ms (Alerta Crítico Nível 4).',
    status: 'active',
    insights: [
      'A latência elevada afeta diretamente a sincronização de leads e o carregamento do funil comercial.',
      'Identificamos consultas concorrentes pesadas nas tabelas de histórico que podem ser otimizadas.',
      'Recomenda-se realizar a criação de um índice composto nas colunas mais acessadas do banco.'
    ],
    actionLink: { label: 'Otimizar Banco de Dados', url: '/hub/conectores' }
  },
  {
    id: 'alert-3',
    priority: 'medio',
    badgeText: 'Médio',
    time: '10:45',
    title: 'Sincronização ERP SAP parcial',
    description: '(Lote ID #881)',
    detailText: 'A sincronização diária com o ERP SAP falhou em alguns registros específicos processados no lote operacional #881.',
    status: 'active',
    insights: [
      'Os registros ignorados apresentam formatação inconsistente nos campos de SKU.',
      'O processamento dos demais 438 registros foi concluído com sucesso e está atualizado.',
      'Você pode consultar o log de sincronização para corrigir manualmente os dados afetados.'
    ],
    actionLink: { label: 'Ver Detalhes do Lote #881', url: '/hub/conectores' }
  },
  {
    id: 'alert-4',
    priority: 'alto',
    badgeText: 'Alto',
    time: '10:32',
    title: 'Erro de Autenticação OAuth2',
    description: '(HubSpot API)',
    detailText: 'A autenticação OAuth2 com o HubSpot foi interrompida porque o token de acesso expirou ou foi revogado nas configurações externas.',
    status: 'active',
    insights: [
      'A conexão está inativa, impedindo a sincronização em tempo real de novos contatos e empresas.',
      'Isso acontece frequentemente quando a senha da conta HubSpot é alterada ou o aplicativo integrado é desconectado.',
      'A reautenticação resolverá o problema imediatamente e restaurará a fila de sincronização.'
    ],
    actionLink: { label: 'Reconfigurar HubSpot CRM', url: '/hub/conectores' }
  },
  {
    id: 'alert-5',
    priority: 'info',
    badgeText: 'Info',
    time: '09:55',
    title: 'Nova Versão API Stripe disponível',
    description: 'v3.4.1',
    detailText: 'O Stripe disponibilizou uma nova versão (v3.4.1) da sua API de pagamentos recomendando a migração.',
    status: 'active',
    insights: [
      'A versão atual v3.2.0 continuará funcionando normalmente sem impactos operacionais imediatos.',
      'A nova versão traz melhorias no processamento de assinaturas e suporte a novos métodos de pagamento.',
      'Recomendamos planejar a migração da biblioteca técnica junto ao seu time de engenharia.'
    ],
    actionLink: { label: 'Documentação da API Stripe', url: 'https://stripe.com/docs/api' }
  },
  {
    id: 'alert-solved-1',
    priority: 'alto',
    badgeText: 'Alto',
    time: 'Ontem, 16:40',
    title: 'Flutuação Anômala de Tráfego API',
    description: '(Resolvido automaticamente)',
    detailText: 'Foi detectado um pico de tráfego 400% acima do padrão na API do Google Analytics 4, sugerindo um teste automatizado ou varredura anormal.',
    status: 'completed',
    completedBy: 'Agente NeuroAds',
    insights: [
      'A taxa de requisições foi normalizada após 15 minutos.',
      'O Agente de Infraestrutura da NeuroAds aplicou regras de rate-limiting temporárias.',
      'Nenhuma ação do usuário é necessária.'
    ],
    completedAt: Date.now() - 24 * 60 * 60 * 1000,
  },
  {
    id: 'alert-solved-2',
    priority: 'medio',
    badgeText: 'Médio',
    time: 'Ontem, 14:15',
    title: 'Sincronização de Tags de Remarketing',
    description: '(Lido pelo usuário)',
    detailText: 'Algumas tags de remarketing do Google Ads não estavam disparando nos pixels de checkout devido a uma atualização no container do GTM.',
    status: 'read',
    completedBy: 'Você',
    insights: [
      'O container do GTM foi republicado contendo as tags corrigidas.',
      'Os pixels voltaram a registrar eventos de compra normalmente.'
    ],
    readAt: Date.now() - 26 * 60 * 60 * 1000,
  }
];

export default function ConnectorsHubPage() {
  const { user, profile, loading, premiumSyncing } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [connectorStatus, setConnectorStatus] = useState<ConnectorStatus>(DEFAULT_CONNECTOR_STATUS);
  const [connectorBusyKey, setConnectorBusyKey] = useState<ConnectorKey | null>(null);
  const [connectorFeedback, setConnectorFeedback] = useState<string | null>(null);
  const [connectorError, setConnectorError] = useState<string | null>(null);
  const [inlineConnectorNotice, setInlineConnectorNotice] = useState<InlineConnectorNotice | null>(null);
  const [connectorSyncOverrides, setConnectorSyncOverrides] = useState<Partial<Record<ConnectorKey, number>>>({});
  const [pendingMetaAdsConnection, setPendingMetaAdsConnection] = useState<PendingOAuthConnection | null>(null);
  const [metaAdsAccounts, setMetaAdsAccounts] = useState<MetaAdsAccountOption[]>([]);
  const [selectedMetaAdsAccountId, setSelectedMetaAdsAccountId] = useState('');
  const [metaAdsSelectionSaving, setMetaAdsSelectionSaving] = useState(false);
  const [pendingGoogleAdsConnection, setPendingGoogleAdsConnection] = useState<PendingOAuthConnection | null>(null);
  const [googleAdsAccounts, setGoogleAdsAccounts] = useState<GoogleAdsAccountOption[]>([]);
  const [selectedGoogleAdsAccountKey, setSelectedGoogleAdsAccountKey] = useState('');
  const [googleAdsSelectionSaving, setGoogleAdsSelectionSaving] = useState(false);
  const [customClientCustomerId, setCustomClientCustomerId] = useState('');
  const [pendingInstagramConnection, setPendingInstagramConnection] = useState<PendingOAuthConnection | null>(null);
  const [instagramAccounts, setInstagramAccounts] = useState<InstagramAccountOption[]>([]);
  const [selectedInstagramAccountId, setSelectedInstagramAccountId] = useState('');
  const [instagramSelectionSaving, setInstagramSelectionSaving] = useState(false);
  const [pendingGa4Connection, setPendingGa4Connection] = useState<PendingOAuthConnection | null>(null);
  const [ga4Accounts, setGa4Accounts] = useState<Ga4AccountOption[]>([]);
  const [selectedGa4AccountId, setSelectedGa4AccountId] = useState('');
  const [ga4SelectionSaving, setGa4SelectionSaving] = useState(false);
  const [pendingGoogleTrendsConnection, setPendingGoogleTrendsConnection] = useState<PendingOAuthConnection | null>(null);
  const [googleTrendsAccounts, setGoogleTrendsAccounts] = useState<Ga4AccountOption[]>([]);
  const [selectedGoogleTrendsAccountId, setSelectedGoogleTrendsAccountId] = useState('');
  const [googleTrendsSelectionSaving, setGoogleTrendsSelectionSaving] = useState(false);
  const [pendingHubSpotConnection, setPendingHubSpotConnection] = useState<PendingOAuthConnection | null>(null);
  const [hubspotAccounts, setHubspotAccounts] = useState<HubSpotAccountOption[]>([]);
  const [selectedHubspotAccountId, setSelectedHubspotAccountId] = useState('');
  const [hubspotSelectionSaving, setHubspotSelectionSaving] = useState(false);
  const [isRdCrmConfigModalOpen, setIsRdCrmConfigModalOpen] = useState(false);
  const [rdCrmAccessTokenInput, setRdCrmAccessTokenInput] = useState('');
  const [rdCrmRefreshTokenInput, setRdCrmRefreshTokenInput] = useState('');
  const [rdCrmWebhookIdInput, setRdCrmWebhookIdInput] = useState('');
  const [rdCrmSaving, setRdCrmSaving] = useState(false);
  const [rdTokenModalConnector, setRdTokenModalConnector] = useState<RdTokenConnectorKey | null>(null);
  const [rdPublicTokenInput, setRdPublicTokenInput] = useState('');
  const [rdPrivateTokenInput, setRdPrivateTokenInput] = useState('');
  const [rdTokenSaving, setRdTokenSaving] = useState(false);
  const [isRdConversasWebhookModalOpen, setIsRdConversasWebhookModalOpen] = useState(false);
  const [isHubSpotConfigModalOpen, setIsHubSpotConfigModalOpen] = useState(false);
  const [hubspotAppIdInput, setHubspotAppIdInput] = useState('');
  const [hubspotClientIdInput, setHubspotClientIdInput] = useState('');
  const [hubspotClientSecretInput, setHubspotClientSecretInput] = useState('');
  const [hubspotInstallUrlInput, setHubspotInstallUrlInput] = useState('');
  const [hubspotSaving, setHubspotSaving] = useState(false);
  const [isStripeConfigModalOpen, setIsStripeConfigModalOpen] = useState(false);
  const [stripeConnectClientIdInput, setStripeConnectClientIdInput] = useState('');
  const [stripeAccountNameInput, setStripeAccountNameInput] = useState('');
  const [stripeAccountEmailInput, setStripeAccountEmailInput] = useState('');
  const [stripeAccountIdInput, setStripeAccountIdInput] = useState('');
  const [stripeSaving, setStripeSaving] = useState(false);
  const [openConnectorMenuId, setOpenConnectorMenuId] = useState<UiConnectorId | null>(null);
  const [activeFilter, setActiveFilter] = useState<UiCategory | 'todos'>('todos');
  const sortMode = 'az';

  const [alerts, setAlerts] = useState<AlertItem[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = window.localStorage.getItem('neuroads_hub_alerts');
      if (saved) {
        try {
          return JSON.parse(saved) as AlertItem[];
        } catch {
          // fallback
        }
      }
    }
    return DEFAULT_ALERTS;
  });

  useEffect(() => {
    window.localStorage.setItem('neuroads_hub_alerts', JSON.stringify(alerts));
  }, [alerts]);

  const [selectedAlert, setSelectedAlert] = useState<AlertItem | null>(null);
  const [isAllAlertsModalOpen, setIsAllAlertsModalOpen] = useState(false);
  const [activeAlertsTab, setActiveAlertsTab] = useState<'ativos' | 'historico'>('ativos');

  const accessState = useMemo(
    () => resolveHubAccessState({ loading, user, profile }),
    [loading, profile, user]
  );
  const isSyncingAccess = accessState === 'forbidden' && premiumSyncing;

  const clearPendingMetaAdsSelection = useCallback(() => {
    setPendingMetaAdsConnection(null);
    setMetaAdsAccounts([]);
    setSelectedMetaAdsAccountId('');
    setMetaAdsSelectionSaving(false);
  }, []);

  const clearPendingGoogleAdsSelection = useCallback(() => {
    setPendingGoogleAdsConnection(null);
    setGoogleAdsAccounts([]);
    setSelectedGoogleAdsAccountKey('');
    setGoogleAdsSelectionSaving(false);
    setCustomClientCustomerId('');
  }, []);

  const clearPendingInstagramSelection = useCallback(() => {
    setPendingInstagramConnection(null);
    setInstagramAccounts([]);
    setSelectedInstagramAccountId('');
    setInstagramSelectionSaving(false);
  }, []);

  const clearPendingGa4Selection = useCallback(() => {
    setPendingGa4Connection(null);
    setGa4Accounts([]);
    setSelectedGa4AccountId('');
    setGa4SelectionSaving(false);
  }, []);

  const clearPendingGoogleTrendsSelection = useCallback(() => {
    setPendingGoogleTrendsConnection(null);
    setGoogleTrendsAccounts([]);
    setSelectedGoogleTrendsAccountId('');
    setGoogleTrendsSelectionSaving(false);
  }, []);

  const clearPendingHubSpotSelection = useCallback(() => {
    setPendingHubSpotConnection(null);
    setHubspotAccounts([]);
    setSelectedHubspotAccountId('');
    setHubspotSelectionSaving(false);
  }, []);

  const clearRdCrmConfigModal = useCallback(() => {
    setIsRdCrmConfigModalOpen(false);
    setRdCrmAccessTokenInput('');
    setRdCrmRefreshTokenInput('');
    setRdCrmWebhookIdInput('');
    setRdCrmSaving(false);
  }, []);

  const clearHubSpotConfigModal = useCallback(() => {
    setIsHubSpotConfigModalOpen(false);
    setHubspotAppIdInput('');
    setHubspotClientIdInput('');
    setHubspotClientSecretInput('');
    setHubspotInstallUrlInput('');
    setHubspotSaving(false);
  }, []);

  const clearStripeConfigModal = useCallback(() => {
    setIsStripeConfigModalOpen(false);
    setStripeConnectClientIdInput('');
    setStripeAccountNameInput('');
    setStripeAccountEmailInput('');
    setStripeAccountIdInput('');
    setStripeSaving(false);
  }, []);

  const persistHubSpotCredentials = useCallback(
    async (appId: string, clientId: string, clientSecret: string, installUrl: string, parsedInstall: ParsedHubSpotInstallUrl) => {
      if (!user) return false;
      const now = Date.now();
      const trimmedAppId = appId.trim();
      const trimmedClientId = clientId.trim();
      const trimmedClientSecret = clientSecret.trim();
      const trimmedInstallUrl = installUrl.trim();

      try {
        await setDoc(
          doc(getFirebaseDb(), 'users', user.uid),
          {
            integrations: {
              hubspotOAuth: {
                appId: trimmedAppId || null,
                clientId: trimmedClientId || parsedInstall.clientId,
                clientSecret: trimmedClientSecret || null,
                redirectUri: parsedInstall.redirectUri,
                scope: parsedInstall.scope,
                optionalScope: parsedInstall.optionalScope || null,
                installUrl: trimmedInstallUrl || null,
                updatedAt: now,
              },
            },
            updatedAt: now,
          },
          { merge: true }
        );
        return true;
      } catch (saveError) {
        console.warn('Falha ao persistir credenciais do HubSpot:', saveError);
        return false;
      }
    },
    [user]
  );

  const persistStripeBootstrap = useCallback(
    async (clientId: string, account: StripeAccountBootstrap) => {
      if (!user) return false;
      const now = Date.now();
      const trimmedClientId = clientId.trim();

      try {
        await setDoc(
          doc(getFirebaseDb(), 'users', user.uid),
          {
            integrations: {
              stripeOAuth: {
                clientId: trimmedClientId,
                accountName: account.accountName?.trim() || null,
                accountEmail: account.accountEmail?.trim() || null,
                accountId: account.accountId?.trim() || null,
                updatedAt: now,
              },
            },
            updatedAt: now,
          },
          { merge: true }
        );
        return true;
      } catch (saveError) {
        console.warn('Falha ao persistir dados de bootstrap Stripe:', saveError);
        return false;
      }
    },
    [user]
  );

  const clearRdTokenModal = useCallback(() => {
    setRdTokenModalConnector(null);
    setRdPublicTokenInput('');
    setRdPrivateTokenInput('');
    setRdTokenSaving(false);
  }, []);

  const persistOAuthConnection = useCallback(
    async (payload: PendingOAuthConnection, successMessage: string) => {
      if (!user) return false;

      const now = Date.now();
      const connectionKey = CONNECTOR_CONNECTION_KEYS[payload.connector];
      const hubspotIdentity =
        payload.connector === 'crm'
          ? await resolveHubSpotAccountIdentity(payload.accessToken)
          : { accountName: null, accountId: null };
      const metadata = {
        ...(payload.metadata ?? {}),
        ...(hubspotIdentity.accountName ? { accountName: hubspotIdentity.accountName } : {}),
        ...(hubspotIdentity.accountId ? { accountId: hubspotIdentity.accountId } : {}),
      };
      const normalizedMetadata = Object.keys(metadata).length > 0 ? metadata : null;

      setConnectorStatus((prev) => {
        const nextStatus = { ...prev, [payload.connector]: true };
        const connectorsKey = `neuroads_dashboard_connectors_${user.uid}`;
        window.localStorage.setItem(connectorsKey, JSON.stringify(nextStatus));
        return nextStatus;
      });

      try {
        const db = getFirebaseDb();
        const userRef = doc(db, 'users', user.uid);
        await setDoc(
          userRef,
          {
            connections: {
              [connectionKey]: {
                isActive: true,
                provider: payload.provider ?? null,
                accountId: payload.accountId ?? hubspotIdentity.accountId ?? null,
                loginCustomerId: payload.loginCustomerId ?? null,
                accessToken: payload.accessToken,
                refreshToken: payload.refreshToken ?? null,
                expiresIn: Number.isFinite(payload.expiresIn || NaN) ? payload.expiresIn : null,
                expiresAt: Number.isFinite(payload.expiresIn || NaN) ? now + Number(payload.expiresIn) * 1000 : null,
                metadata: normalizedMetadata,
                connectedAt: now,
                updatedAt: now,
              },
            },
            updatedAt: now,
          },
          { merge: true }
        );
        setConnectorFeedback(successMessage);
        setConnectorError(null);
        return true;
      } catch (saveError) {
        console.warn('Falha ao persistir conexão OAuth:', saveError);
        setConnectorFeedback(null);
        setConnectorError('Conexão concluída, mas não foi possível salvar no banco.');
        return false;
      }
    },
    [user]
  );

  const persistRdTokenConnection = useCallback(
    async (connectorKey: RdTokenConnectorKey, publicToken: string, privateToken: string) => {
      if (!user) return false;

      const now = Date.now();
      const trimmedPublicToken = publicToken.trim();
      const trimmedPrivateToken = privateToken.trim();
      const connectionKey = CONNECTOR_CONNECTION_KEYS[connectorKey];

      setConnectorStatus((prev) => {
        const nextStatus = { ...prev, [connectorKey]: true };
        const connectorsKey = `neuroads_dashboard_connectors_${user.uid}`;
        window.localStorage.setItem(connectorsKey, JSON.stringify(nextStatus));
        return nextStatus;
      });

      try {
        const db = getFirebaseDb();
        const userRef = doc(db, 'users', user.uid);
        await setDoc(
          userRef,
          {
            connections: {
              [connectionKey]: {
                isActive: true,
                provider: 'rdstation-webhook',
                accessToken: trimmedPrivateToken,
                refreshToken: null,
                metadata: {
                  publicToken: trimmedPublicToken,
                  authMode: 'public-private-token',
                },
                connectedAt: now,
                updatedAt: now,
              },
            },
            updatedAt: now,
          },
          { merge: true }
        );
        setConnectorError(null);
        setConnectorFeedback('Credenciais RD Station salvas e integração ativada.');
        return true;
      } catch (saveError) {
        console.warn('Falha ao persistir credenciais RD Station:', saveError);
        setConnectorFeedback(null);
        setConnectorError('Não foi possível salvar as credenciais RD Station no banco.');
        return false;
      }
    },
    [user]
  );

  const persistRdCrmConnection = useCallback(
    async (accessToken: string, refreshToken: string, webhookId: string) => {
      if (!user) return false;

      const now = Date.now();
      const connectionKey = CONNECTOR_CONNECTION_KEYS.rdStation;
      const trimmedAccessToken = accessToken.trim();
      const trimmedRefreshToken = refreshToken.trim();
      const trimmedWebhookId = webhookId.trim();

      setConnectorStatus((prev) => {
        const nextStatus = { ...prev, rdStation: true };
        const connectorsKey = `neuroads_dashboard_connectors_${user.uid}`;
        window.localStorage.setItem(connectorsKey, JSON.stringify(nextStatus));
        return nextStatus;
      });

      try {
        const db = getFirebaseDb();
        const userRef = doc(db, 'users', user.uid);
        await setDoc(
          userRef,
          {
            connections: {
              [connectionKey]: {
                isActive: true,
                provider: 'rdstation-crm-v2-oauth2',
                accessToken: trimmedAccessToken,
                refreshToken: trimmedRefreshToken || null,
                metadata: {
                  authMode: 'oauth2-bearer',
                  webhookId: trimmedWebhookId || null,
                },
                connectedAt: now,
                updatedAt: now,
              },
            },
            updatedAt: now,
          },
          { merge: true }
        );
        setConnectorError(null);
        setConnectorFeedback('RD Station CRM configurado com OAuth2 Bearer e salvo com sucesso.');
        return true;
      } catch (saveError) {
        console.warn('Falha ao persistir configuração do RD Station CRM:', saveError);
        setConnectorFeedback(null);
        setConnectorError('Não foi possível salvar a configuração do RD Station CRM no banco.');
        return false;
      }
    },
    [user]
  );

  useEffect(() => {
    if (accessState === 'unauthenticated') {
      router.replace(getHubLoginRedirect(pathname));
      return;
    }
    if (accessState === 'forbidden' && !premiumSyncing) {
      router.replace(getHubOnboardingRedirect(pathname));
    }
  }, [accessState, pathname, premiumSyncing, router]);

  useEffect(() => {
    if (!user) return;

    const profileRecord = (profile as Record<string, unknown> | null) ?? null;
    let nextConnectorStatus = { ...DEFAULT_CONNECTOR_STATUS };

    try {
      const connectorsKey = `neuroads_dashboard_connectors_${user.uid}`;
      const connectorsRaw = window.localStorage.getItem(connectorsKey);
      if (connectorsRaw) {
        const parsed = JSON.parse(connectorsRaw) as Partial<ConnectorStatus>;
        nextConnectorStatus = {
          ...DEFAULT_CONNECTOR_STATUS,
          ...parsed,
        };
      }

      const profileConnections =
        (readRecord(profileRecord?.connections) as Record<string, ConnectorConnection | null | undefined> | null) ?? null;
      if (profileConnections) {
        const persistedStatus = getConnectorStatusFromConnections(profileConnections);
        nextConnectorStatus = {
          ...nextConnectorStatus,
          ...persistedStatus,
        };
      }
    } catch {
      nextConnectorStatus = { ...DEFAULT_CONNECTOR_STATUS };
    }

    setConnectorStatus(nextConnectorStatus);
  }, [profile, user]);

  useEffect(() => {
    if (!user) return;

    const success = searchParams.get('connector_auth_success');
    const error = searchParams.get('connector_auth_error');
    const connectorParam = searchParams.get('connector');
    const provider = searchParams.get('connector_provider');
    const accessToken = searchParams.get('connector_access_token');
    const refreshToken = searchParams.get('connector_refresh_token');
    const accountId = searchParams.get('connector_account_id');
    const expiresInRaw = searchParams.get('connector_expires_in');
    const expiresIn = expiresInRaw ? Number(expiresInRaw) : undefined;
    const legacyGoogleAdsError = searchParams.get('google_ads_error');
    const legacyGoogleAdsToken = searchParams.get('google_ads_token');
    const legacyGoogleAdsRefresh = searchParams.get('google_ads_refresh');

    const normalizedError = error ?? legacyGoogleAdsError;
    const normalizedAccessToken = accessToken ?? legacyGoogleAdsToken;
    const normalizedRefreshToken = refreshToken ?? legacyGoogleAdsRefresh;
    const normalizedConnectorParam =
      connectorParam ?? (legacyGoogleAdsError || legacyGoogleAdsToken ? 'googleAds' : null);
    const normalizedProvider = provider ?? (normalizedConnectorParam === 'googleAds' ? 'google' : null);
    const hasNormalizedSuccess = Boolean(success || legacyGoogleAdsToken);

    if (!hasNormalizedSuccess && !normalizedError) return;

    const clearConnectorQueryParams = () => {
      const cleaned = new URLSearchParams(searchParams.toString());
      [
        'connector_auth_success',
        'connector_auth_error',
        'connector',
        'connector_provider',
        'connector_access_token',
        'connector_refresh_token',
        'connector_account_id',
        'connector_expires_in',
        'google_ads_error',
        'google_ads_token',
        'google_ads_refresh',
      ].forEach((param) => cleaned.delete(param));
      const query = cleaned.toString();
      const basePath = pathname || '/hub/conectores';
      router.replace(query ? `${basePath}?${query}` : basePath, { scroll: false });
    };

    if (normalizedError) {
      setConnectorError(`Falha ao conectar: ${normalizedError}`);
      setConnectorFeedback(null);
      clearPendingMetaAdsSelection();
      clearPendingGoogleAdsSelection();
      clearPendingInstagramSelection();
      clearPendingGa4Selection();
      clearPendingGoogleTrendsSelection();
      clearPendingHubSpotSelection();
      clearStripeConfigModal();
      clearConnectorQueryParams();
      return;
    }

    if (!isConnectorKey(normalizedConnectorParam) || !normalizedAccessToken) {
      setConnectorError('Conexão retornou sem dados suficientes para ativar o conector.');
      setConnectorFeedback(null);
      clearPendingMetaAdsSelection();
      clearPendingGoogleAdsSelection();
      clearPendingInstagramSelection();
      clearPendingGa4Selection();
      clearPendingGoogleTrendsSelection();
      clearPendingHubSpotSelection();
      clearStripeConfigModal();
      clearConnectorQueryParams();
      return;
    }

    let stripeBootstrapMetadata: Record<string, unknown> | null = null;
    if (normalizedConnectorParam === 'payments' && typeof window !== 'undefined') {
      const bootstrapKey = `neuroads_stripe_pending_bootstrap_${user.uid}`;
      const raw = window.localStorage.getItem(bootstrapKey);
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as StripeAccountBootstrap;
          stripeBootstrapMetadata = {
            ...(parsed.accountName ? { accountName: parsed.accountName } : {}),
            ...(parsed.accountEmail ? { accountEmail: parsed.accountEmail } : {}),
            ...(parsed.accountId ? { preferredAccountId: parsed.accountId } : {}),
          };
        } catch {
          stripeBootstrapMetadata = null;
        }
        window.localStorage.removeItem(bootstrapKey);
      }
    }

    const pendingPayload: PendingOAuthConnection = {
      connector: normalizedConnectorParam,
      provider: normalizedProvider,
      accessToken: normalizedAccessToken,
      refreshToken: normalizedRefreshToken ?? null,
      expiresIn: Number.isFinite(expiresIn || NaN) ? Number(expiresIn) : null,
      accountId: accountId ?? null,
      metadata: stripeBootstrapMetadata,
    };

    if (normalizedConnectorParam === 'googleAds' && !pendingPayload.accountId) {
      const hydrateGoogleAdsAccounts = async () => {
        try {
          setConnectorBusyKey('googleAds');
          const endpointCandidates = [
            '/api/auth/connectors/google-ads/accounts',
            '/api/auth/connectors/googleAds/accounts',
          ];

          let payload: { accounts?: GoogleAdsAccountOption[]; error?: string } | null = null;
          let responseOk = false;
          let lastErrorMessage = '';

          for (const endpoint of endpointCandidates) {
            try {
              const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ accessToken: normalizedAccessToken }),
              });

              const parsed = await parseJsonOrThrow<{ accounts?: GoogleAdsAccountOption[]; error?: string }>(
                response,
                'Falha ao processar a resposta de contas do Google Ads.'
              );

              if (response.ok) {
                payload = parsed;
                responseOk = true;
                break;
              }

              lastErrorMessage = parsed.error || '';
              if (response.status !== 404) {
                payload = parsed;
                break;
              }
            } catch (candidateError) {
              lastErrorMessage =
                candidateError instanceof Error
                  ? candidateError.message
                  : 'Falha ao processar a resposta de contas do Google Ads.';
            }
          }

          if (!responseOk || !payload) {
            throw new Error(lastErrorMessage || 'Não foi possível listar as contas do Google Ads.');
          }

          const accounts = Array.isArray(payload.accounts) ? payload.accounts : [];
          if (accounts.length === 0) {
            clearPendingGoogleAdsSelection();
            setConnectorFeedback(null);
            setConnectorError('Autenticação concluída, mas nenhuma conta Google Ads disponível foi encontrada.');
            return;
          }

          if (accounts.length === 1) {
            const selectedAccount = accounts[0];
            const persisted = await persistOAuthConnection(
              {
                ...pendingPayload,
                accountId: selectedAccount.accountId,
                loginCustomerId: selectedAccount.loginCustomerId,
                metadata: {
                  accountName: selectedAccount.name,
                  isManager: selectedAccount.isManager,
                  managerName: selectedAccount.managerName,
                },
              },
              'Conector Google Ads autenticado e conta vinculada com sucesso.'
            );
            if (persisted) {
              clearPendingGoogleAdsSelection();
            }
            return;
          }

          setPendingGoogleAdsConnection(pendingPayload);
          setGoogleAdsAccounts(accounts);
          setSelectedGoogleAdsAccountKey(accounts[0].id);
          setConnectorError(null);
          setConnectorFeedback('Autenticação concluída. Selecione a conta Google Ads para finalizar a vinculação.');
        } catch (googleAdsError) {
          const message =
            googleAdsError instanceof Error ? googleAdsError.message : 'Falha ao carregar contas do Google Ads.';
          clearPendingGoogleAdsSelection();
          setConnectorFeedback(null);
          setConnectorError(message);
        } finally {
          setConnectorBusyKey(null);
          clearConnectorQueryParams();
        }
      };

      void hydrateGoogleAdsAccounts();
      return;
    }

    if (normalizedConnectorParam === 'metaAds' && !pendingPayload.accountId) {
      const hydrateMetaAdsAccounts = async () => {
        try {
          setConnectorBusyKey('metaAds');
          const response = await fetch('/api/auth/connectors/metaAds/accounts', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ accessToken: normalizedAccessToken }),
          });
          const payload = (await response.json()) as { accounts?: MetaAdsAccountOption[]; error?: string };

          if (!response.ok) {
            throw new Error(payload.error || 'Não foi possível listar as contas do Meta Ads.');
          }

          const accounts = Array.isArray(payload.accounts) ? payload.accounts : [];
          if (accounts.length === 0) {
            clearPendingMetaAdsSelection();
            setConnectorFeedback(null);
            setConnectorError('Autenticação concluída, mas nenhuma conta de anúncio disponível foi encontrada no Meta Ads.');
            return;
          }

          if (accounts.length === 1) {
            const selectedAccount = accounts[0];
            const persisted = await persistOAuthConnection(
              {
                ...pendingPayload,
                accountId: selectedAccount.id,
                metadata: {
                  accountName: selectedAccount.name,
                  accountCurrency: selectedAccount.currency,
                  accountStatus: selectedAccount.status,
                },
              },
              'Conector Meta Ads autenticado e conta vinculada com sucesso.'
            );
            if (persisted) {
              clearPendingMetaAdsSelection();
            }
            return;
          }

          setPendingMetaAdsConnection(pendingPayload);
          setMetaAdsAccounts(accounts);
          setSelectedMetaAdsAccountId(accounts[0].id);
          setConnectorError(null);
          setConnectorFeedback('Autenticação concluída. Selecione a conta do Meta Ads para finalizar a vinculação.');
        } catch (metaError) {
          const message = metaError instanceof Error ? metaError.message : 'Falha ao carregar contas do Meta Ads.';
          clearPendingMetaAdsSelection();
          setConnectorFeedback(null);
          setConnectorError(message);
        } finally {
          setConnectorBusyKey(null);
          clearConnectorQueryParams();
        }
      };

      void hydrateMetaAdsAccounts();
      return;
    }

    if (normalizedConnectorParam === 'instagram' && !pendingPayload.accountId) {
      const hydrateInstagramAccounts = async () => {
        try {
          setConnectorBusyKey('instagram');
          const response = await fetch('/api/auth/connectors/instagram/accounts', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ accessToken: normalizedAccessToken }),
          });
          const payload = (await response.json()) as { accounts?: InstagramAccountOption[]; error?: string };

          if (!response.ok) {
            throw new Error(payload.error || 'Não foi possível listar as contas do Instagram.');
          }

          const accounts = Array.isArray(payload.accounts) ? payload.accounts : [];
          if (accounts.length === 0) {
            clearPendingInstagramSelection();
            setConnectorFeedback(null);
            setConnectorError('Autenticação concluída, mas nenhuma conta comercial do Instagram foi encontrada.');
            return;
          }

          if (accounts.length === 1) {
            const selectedAccount = accounts[0];
            const persisted = await persistOAuthConnection(
              {
                ...pendingPayload,
                accountId: selectedAccount.id,
                metadata: {
                  accountName: selectedAccount.name,
                  username: selectedAccount.username,
                  pageName: selectedAccount.pageName,
                  pageId: selectedAccount.pageId,
                },
              },
              'Conector Instagram autenticado e conta vinculada com sucesso.'
            );
            if (persisted) {
              clearPendingInstagramSelection();
            }
            return;
          }

          setPendingInstagramConnection(pendingPayload);
          setInstagramAccounts(accounts);
          setSelectedInstagramAccountId(accounts[0].id);
          setConnectorError(null);
          setConnectorFeedback('Autenticação concluída. Selecione a conta do Instagram para finalizar a vinculação.');
        } catch (instagramError) {
          const message = instagramError instanceof Error ? instagramError.message : 'Falha ao carregar contas do Instagram.';
          clearPendingInstagramSelection();
          setConnectorFeedback(null);
          setConnectorError(message);
        } finally {
          setConnectorBusyKey(null);
          clearConnectorQueryParams();
        }
      };

      void hydrateInstagramAccounts();
      return;
    }

    if (normalizedConnectorParam === 'ga4' && !pendingPayload.accountId) {
      const hydrateGa4Accounts = async () => {
        try {
          setConnectorBusyKey('ga4');
          const response = await fetch('/api/auth/connectors/ga4/accounts', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ accessToken: normalizedAccessToken }),
          });
          const payload = (await response.json()) as { accounts?: Ga4AccountOption[]; error?: string };

          if (!response.ok) {
            throw new Error(payload.error || 'Não foi possível listar as contas do GA4.');
          }

          const accounts = Array.isArray(payload.accounts) ? payload.accounts : [];
          if (accounts.length === 0) {
            clearPendingGa4Selection();
            setConnectorFeedback(null);
            setConnectorError('Autenticação concluída, mas nenhuma conta GA4 disponível foi encontrada.');
            return;
          }

          if (accounts.length === 1) {
            const selectedAccount = accounts[0];
            const persisted = await persistOAuthConnection(
              {
                ...pendingPayload,
                accountId: selectedAccount.accountId,
                metadata: {
                  accountName: selectedAccount.name,
                },
              },
              'Conector GA4 autenticado e conta vinculada com sucesso.'
            );
            if (persisted) {
              clearPendingGa4Selection();
            }
            return;
          }

          setPendingGa4Connection(pendingPayload);
          setGa4Accounts(accounts);
          setSelectedGa4AccountId(accounts[0].accountId);
          setConnectorError(null);
          setConnectorFeedback('Autenticação concluída. Selecione a conta GA4 para finalizar a vinculação.');
        } catch (ga4Error) {
          const message = ga4Error instanceof Error ? ga4Error.message : 'Falha ao carregar contas do GA4.';
          clearPendingGa4Selection();
          setConnectorFeedback(null);
          setConnectorError(message);
        } finally {
          setConnectorBusyKey(null);
          clearConnectorQueryParams();
        }
      };

      void hydrateGa4Accounts();
      return;
    }

    if (normalizedConnectorParam === 'googleTrends' && !pendingPayload.accountId) {
      const hydrateGoogleTrendsAccounts = async () => {
        try {
          setConnectorBusyKey('googleTrends');
          const response = await fetch('/api/auth/connectors/googleTrends/accounts', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ accessToken: normalizedAccessToken }),
          });
          const payload = (await response.json()) as { accounts?: Ga4AccountOption[]; error?: string };

          if (!response.ok) {
            throw new Error(payload.error || 'Não foi possível listar as contas do Google Trends.');
          }

          const accounts = Array.isArray(payload.accounts) ? payload.accounts : [];
          if (accounts.length === 0) {
            clearPendingGoogleTrendsSelection();
            setConnectorFeedback(null);
            setConnectorError('Autenticação concluída, mas nenhuma conta Google disponível foi encontrada para o canal.');
            return;
          }

          if (accounts.length === 1) {
            const selectedAccount = accounts[0];
            const persisted = await persistOAuthConnection(
              {
                ...pendingPayload,
                accountId: selectedAccount.accountId,
                metadata: {
                  accountName: selectedAccount.name,
                },
              },
              'Conector Google Trends autenticado e conta vinculada com sucesso.'
            );
            if (persisted) {
              clearPendingGoogleTrendsSelection();
            }
            return;
          }

          setPendingGoogleTrendsConnection(pendingPayload);
          setGoogleTrendsAccounts(accounts);
          setSelectedGoogleTrendsAccountId(accounts[0].accountId);
          setConnectorError(null);
          setConnectorFeedback('Autenticação concluída. Selecione a conta Google para finalizar o Google Trends.');
        } catch (googleTrendsError) {
          const message =
            googleTrendsError instanceof Error
              ? googleTrendsError.message
              : 'Falha ao carregar contas do Google Trends.';
          clearPendingGoogleTrendsSelection();
          setConnectorFeedback(null);
          setConnectorError(message);
        } finally {
          setConnectorBusyKey(null);
          clearConnectorQueryParams();
        }
      };

      void hydrateGoogleTrendsAccounts();
      return;
    }

    if (normalizedConnectorParam === 'crm') {
      const hydrateHubSpotAccount = async () => {
        try {
          setConnectorBusyKey('crm');
          const identity = await resolveHubSpotAccountIdentity(normalizedAccessToken);
          if (!identity.accountName && !identity.accountId) {
            throw new Error('Não foi possível identificar a conta HubSpot autenticada.');
          }

          const resolvedAccountId = identity.accountId || `hub-${Date.now()}`;
          const resolvedAccountName = identity.accountName || `HubSpot ${resolvedAccountId}`;
          const options: HubSpotAccountOption[] = [
            {
              id: resolvedAccountId,
              name: resolvedAccountName,
              accountId: resolvedAccountId,
            },
          ];

          setPendingHubSpotConnection(pendingPayload);
          setHubspotAccounts(options);
          setSelectedHubspotAccountId(options[0].id);
          setConnectorError(null);
          setConnectorFeedback('Autenticação concluída. Confirme a conta HubSpot para finalizar a vinculação.');
        } catch (hubspotError) {
          const message =
            hubspotError instanceof Error ? hubspotError.message : 'Falha ao carregar os dados da conta HubSpot.';
          clearPendingHubSpotSelection();
          setConnectorFeedback(null);
          setConnectorError(message);
        } finally {
          setConnectorBusyKey(null);
          clearConnectorQueryParams();
        }
      };

      void hydrateHubSpotAccount();
      return;
    }

    const upsertConnection = async () => {
      await persistOAuthConnection(pendingPayload, 'Conector autenticado e salvo com sucesso.');
      clearPendingMetaAdsSelection();
      clearPendingGoogleAdsSelection();
      clearPendingInstagramSelection();
      clearPendingGa4Selection();
      clearPendingGoogleTrendsSelection();
      clearPendingHubSpotSelection();
      clearStripeConfigModal();
      clearConnectorQueryParams();
    };

    void upsertConnection();
  }, [
    clearPendingGa4Selection,
    clearPendingGoogleAdsSelection,
    clearPendingHubSpotSelection,
    clearPendingGoogleTrendsSelection,
    clearPendingInstagramSelection,
    clearPendingMetaAdsSelection,
    clearStripeConfigModal,
    pathname,
    persistOAuthConnection,
    router,
    searchParams,
    user,
  ]);

  useEffect(() => {
    const handleDocumentClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;
      if (target.closest('[data-connector-menu-root]')) return;
      setOpenConnectorMenuId(null);
    };

    document.addEventListener('mousedown', handleDocumentClick);
    return () => {
      document.removeEventListener('mousedown', handleDocumentClick);
    };
  }, []);

  const visibleConnectors = useMemo(() => {
    const filtered = CONNECTOR_ITEMS.filter((item) => activeFilter === 'todos' || item.category === activeFilter);
    if (sortMode === 'az') {
      return [...filtered].sort((a, b) => a.title.localeCompare(b.title, 'pt-BR'));
    }
    return filtered;
  }, [activeFilter, sortMode]);

  const filterCount = useMemo(() => {
    return {
      todos: CONNECTOR_ITEMS.length,
      marketing: CONNECTOR_ITEMS.filter((item) => item.category === 'marketing').length,
      ads: CONNECTOR_ITEMS.filter((item) => item.category === 'ads').length,
      crm: CONNECTOR_ITEMS.filter((item) => item.category === 'crm').length,
      social: CONNECTOR_ITEMS.filter((item) => item.category === 'social').length,
    };
  }, []);

  const profileConnections = useMemo(() => {
    const profileRecord = (profile as Record<string, unknown> | null) ?? null;
    return (readRecord(profileRecord?.connections) as Record<string, ConnectorConnection | null | undefined> | null) ?? null;
  }, [profile]);

  const trackedConnectorKeys = useMemo(
    () => [...new Set(CONNECTOR_ITEMS.map((item) => item.connectorKey).filter((key): key is ConnectorKey => Boolean(key)))],
    []
  );

  const trackedConnectorCount = useMemo(
    () => trackedConnectorKeys.length,
    [trackedConnectorKeys]
  );

  const activeTrackedConnectorCount = useMemo(
    () => trackedConnectorKeys.filter((key) => Boolean(connectorStatus[key])).length,
    [connectorStatus, trackedConnectorKeys]
  );

  const healthScore = useMemo(() => {
    if (trackedConnectorCount === 0) return 0;
    return Math.round((activeTrackedConnectorCount / trackedConnectorCount) * 100);
  }, [activeTrackedConnectorCount, trackedConnectorCount]);

  const activeAlerts = useMemo(() => alerts.filter((a) => a.status === 'active'), [alerts]);
  const historyAlerts = useMemo(() => alerts.filter((a) => a.status === 'read' || a.status === 'completed'), [alerts]);

  const healthStatus = useMemo(() => {
    if (healthScore >= 90) return { label: 'Excelente', bg: 'border-[#10B981]/20 bg-[#10B981]/8 text-[#10B981]' };
    if (healthScore >= 70) return { label: 'Bom', bg: 'border-[#10B981]/20 bg-[#10B981]/8 text-[#10B981]' };
    if (healthScore >= 50) return { label: 'Atenção', bg: 'border-[#F59E0B]/20 bg-[#F59E0B]/8 text-[#F59E0B]' };
    return { label: 'Crítico', bg: 'border-[#EF4444]/20 bg-[#EF4444]/8 text-[#EF4444]' };
  }, [healthScore]);

  const handleMarkAlertAsRead = useCallback((alertId: string) => {
    setAlerts((prev) =>
      prev.map((a) =>
        a.id === alertId
          ? { ...a, status: 'read', readAt: Date.now() }
          : a
      )
    );
    setSelectedAlert((prev) => (prev && prev.id === alertId ? { ...prev, status: 'read', readAt: Date.now() } : prev));
  }, []);

  const handleMarkAlertAsCompleted = useCallback((alertId: string) => {
    setAlerts((prev) =>
      prev.map((a) =>
        a.id === alertId
          ? { ...a, status: 'completed', completedBy: 'Você', completedAt: Date.now() }
          : a
      )
    );
    setSelectedAlert((prev) => (prev && prev.id === alertId ? { ...prev, status: 'completed', completedBy: 'Você', completedAt: Date.now() } : prev));
  }, []);

  const latestSyncTimestamp = useMemo(() => {
    let latest: number | null = null;

    for (const value of Object.values(connectorSyncOverrides)) {
      if (typeof value === 'number' && Number.isFinite(value)) {
        latest = latest == null ? value : Math.max(latest, value);
      }
    }

    if (!profileConnections) return latest;

    for (const connection of Object.values(profileConnections)) {
      if (!connection) continue;
      const candidate =
        typeof connection.updatedAt === 'number'
          ? connection.updatedAt
          : typeof connection.connectedAt === 'number'
            ? connection.connectedAt
            : null;
      if (candidate != null && Number.isFinite(candidate)) {
        latest = latest == null ? candidate : Math.max(latest, candidate);
      }
    }
    return latest;
  }, [connectorSyncOverrides, profileConnections]);

  const getConnectorAccountLabel = useCallback(
    (item: UiConnector, isActive: boolean): string => {
      if (!item.connectorKey) return 'Canal em implantação';
      if (!isActive) return 'Não autenticada';

      const connectionKey = CONNECTOR_CONNECTION_KEYS[item.connectorKey];
      const connection = profileConnections?.[connectionKey] ?? null;
      if (!connection) return 'Conta autenticada';

      const metadata = readRecord(connection.metadata);
      const accountName =
        readString(metadata?.accountName) ||
        readString(metadata?.hub_domain) ||
        readString(metadata?.account_name) ||
        readString(metadata?.hub_name) ||
        readString(metadata?.name) ||
        readString(metadata?.username) ||
        readString(metadata?.pageName);
      const accountId = readString(connection.accountId);
      const loginCustomerId = readString(connection.loginCustomerId);

      if (item.connectorKey === 'googleAds' && loginCustomerId) {
        if (accountName && accountId) return `${accountName} (${accountId}) • via MCC ${loginCustomerId}`;
        if (accountId) return `${accountId} • via MCC ${loginCustomerId}`;
      }

      if (accountName && accountId) return `${accountName} (${accountId})`;
      if (accountName) return accountName;
      if (accountId) return accountId;
      return 'Conta autenticada';
    },
    [profileConnections]
  );

  const getConnectorLastSyncLabel = useCallback(
    (item: UiConnector, isActive: boolean): string => {
      if (!item.connectorKey || !isActive) return 'Nunca sincronizado';

      const overrideTs = connectorSyncOverrides[item.connectorKey];
      if (typeof overrideTs === 'number' && Number.isFinite(overrideTs)) {
        return formatLastSyncLabel(overrideTs);
      }

      const connectionKey = CONNECTOR_CONNECTION_KEYS[item.connectorKey];
      const connection = profileConnections?.[connectionKey] ?? null;
      const syncTs =
        connection && typeof connection.updatedAt === 'number'
          ? connection.updatedAt
          : connection && typeof connection.connectedAt === 'number'
            ? connection.connectedAt
            : null;

      if (syncTs != null && Number.isFinite(syncTs)) {
        return formatLastSyncLabel(syncTs);
      }

      return item.lastSyncLabelWhenActive;
    },
    [connectorSyncOverrides, profileConnections]
  );


  const showGoogleAdsSelectionModal = Boolean(pendingGoogleAdsConnection && googleAdsAccounts.length > 0);
  const showMetaAdsSelectionModal = Boolean(!showGoogleAdsSelectionModal && pendingMetaAdsConnection && metaAdsAccounts.length > 0);
  const showInstagramSelectionModal = Boolean(
    !showGoogleAdsSelectionModal && !showMetaAdsSelectionModal && pendingInstagramConnection && instagramAccounts.length > 0
  );
  const showGa4SelectionModal = Boolean(
    !showGoogleAdsSelectionModal &&
      !showMetaAdsSelectionModal &&
      !showInstagramSelectionModal &&
      pendingGa4Connection &&
      ga4Accounts.length > 0
  );
  const showGoogleTrendsSelectionModal = Boolean(
    !showGoogleAdsSelectionModal &&
      !showMetaAdsSelectionModal &&
      !showInstagramSelectionModal &&
      !showGa4SelectionModal &&
      pendingGoogleTrendsConnection &&
      googleTrendsAccounts.length > 0
  );
  const showHubSpotSelectionModal = Boolean(
    !showGoogleAdsSelectionModal &&
      !showMetaAdsSelectionModal &&
      !showInstagramSelectionModal &&
      !showGa4SelectionModal &&
      !showGoogleTrendsSelectionModal &&
      pendingHubSpotConnection &&
      hubspotAccounts.length > 0
  );
  const rdTokenModalTitle = rdTokenModalConnector === 'rdStationMarketing' ? 'RD Station Marketing' : '';
  const rdCrmWebhookUrl =
    `${(process.env.NEXT_PUBLIC_APP_URL || 'https://neuroads.com.br').replace(/\/+$/g, '')}/api/webhooks/rd-station/crm`;
  const rdConversasWebhookUrl =
    `${(process.env.NEXT_PUBLIC_APP_URL || 'https://neuroads.com.br').replace(/\/+$/g, '')}/api/webhooks/rd-station/conversas`;

  const handleDisconnect = async (connectorKey: ConnectorKey) => {
    if (!user) return;
    if (connectorKey === 'metaAds') {
      clearPendingMetaAdsSelection();
    }
    if (connectorKey === 'googleAds') {
      clearPendingGoogleAdsSelection();
    }
    if (connectorKey === 'instagram') {
      clearPendingInstagramSelection();
    }
    if (connectorKey === 'ga4') {
      clearPendingGa4Selection();
    }
    if (connectorKey === 'googleTrends') {
      clearPendingGoogleTrendsSelection();
    }
    if (connectorKey === 'crm') {
      clearPendingHubSpotSelection();
    }
    if (connectorKey === 'rdStation') {
      clearRdCrmConfigModal();
    }
    if (connectorKey === 'rdStationMarketing') {
      clearRdTokenModal();
    }
    if (connectorKey === 'rdStationConversas') {
      setIsRdConversasWebhookModalOpen(false);
    }
    setConnectorBusyKey(connectorKey);
    setConnectorError(null);
    setConnectorFeedback(null);
    setInlineConnectorNotice(null);

    setConnectorStatus((prev) => {
      const nextStatus = { ...prev, [connectorKey]: false };
      const connectorsKey = `neuroads_dashboard_connectors_${user.uid}`;
      window.localStorage.setItem(connectorsKey, JSON.stringify(nextStatus));
      return nextStatus;
    });

    try {
      const db = getFirebaseDb();
      const userRef = doc(db, 'users', user.uid);
      const connectionKey = CONNECTOR_CONNECTION_KEYS[connectorKey];
      await setDoc(
        userRef,
        {
          connections: {
            [connectionKey]: {
              isActive: false,
              updatedAt: Date.now(),
            },
          },
          updatedAt: Date.now(),
        },
        { merge: true }
      );
      setConnectorFeedback('Conector desconectado com sucesso.');
    } catch (disconnectError) {
      console.warn('Falha ao desconectar conector:', disconnectError);
      setConnectorError('Não foi possível desconectar o conector no banco.');
    } finally {
      setConnectorBusyKey(null);
    }
  };

  const handleGoogleAdsAccountSelection = async () => {
    if (!pendingGoogleAdsConnection || !selectedGoogleAdsAccountKey) {
      setConnectorError('Selecione uma conta Google Ads para continuar.');
      setConnectorFeedback(null);
      return;
    }

    const selectedAccount = googleAdsAccounts.find((account) => account.id === selectedGoogleAdsAccountKey);
    if (!selectedAccount) {
      setConnectorError('A conta selecionada não foi encontrada. Tente novamente.');
      setConnectorFeedback(null);
      return;
    }

    let finalAccountId = selectedAccount.accountId;
    let finalLoginCustomerId = selectedAccount.loginCustomerId;
    let finalAccountName = selectedAccount.name;
    let finalIsManager = selectedAccount.isManager;

    if (selectedAccount.isManager) {
      const cleanCustomId = customClientCustomerId.replace(/[-\s]/g, '');
      if (!cleanCustomId) {
        setConnectorError('Por favor, informe o ID da conta cliente específica para a conta MCC.');
        setConnectorFeedback(null);
        return;
      }
      if (!/^\d{10}$/.test(cleanCustomId)) {
        setConnectorError('O ID da conta cliente deve conter exatamente 10 dígitos numéricos.');
        setConnectorFeedback(null);
        return;
      }
      finalAccountId = cleanCustomId;
      finalLoginCustomerId = selectedAccount.accountId; // The MCC ID acts as the login customer ID
      finalAccountName = `Conta ${cleanCustomId} (MCC: ${selectedAccount.name})`;
      finalIsManager = false; // It connects to a client, not manager itself
    }

    setGoogleAdsSelectionSaving(true);
    setConnectorBusyKey('googleAds');

    const persisted = await persistOAuthConnection(
      {
        ...pendingGoogleAdsConnection,
        accountId: finalAccountId,
        loginCustomerId: finalLoginCustomerId,
        metadata: {
          accountName: finalAccountName,
          isManager: finalIsManager,
          managerName: selectedAccount.name,
        },
      },
      'Conta Google Ads vinculada com sucesso.'
    );

    if (persisted) {
      clearPendingGoogleAdsSelection();
    }

    setGoogleAdsSelectionSaving(false);
    setConnectorBusyKey(null);
  };

  const handleMetaAdsAccountSelection = async () => {
    if (!pendingMetaAdsConnection || !selectedMetaAdsAccountId) {
      setConnectorError('Selecione uma conta Meta Ads para continuar.');
      setConnectorFeedback(null);
      return;
    }

    const selectedAccount = metaAdsAccounts.find((account) => account.id === selectedMetaAdsAccountId);

    setMetaAdsSelectionSaving(true);
    setConnectorBusyKey('metaAds');

    const persisted = await persistOAuthConnection(
      {
        ...pendingMetaAdsConnection,
        accountId: selectedMetaAdsAccountId,
        metadata: selectedAccount
          ? {
              accountName: selectedAccount.name,
              accountCurrency: selectedAccount.currency,
              accountStatus: selectedAccount.status,
            }
          : pendingMetaAdsConnection.metadata ?? null,
      },
      'Conta Meta Ads vinculada com sucesso.'
    );

    if (persisted) {
      clearPendingMetaAdsSelection();
    }

    setMetaAdsSelectionSaving(false);
    setConnectorBusyKey(null);
  };

  const handleInstagramAccountSelection = async () => {
    if (!pendingInstagramConnection || !selectedInstagramAccountId) {
      setConnectorError('Selecione uma conta do Instagram para continuar.');
      setConnectorFeedback(null);
      return;
    }

    const selectedAccount = instagramAccounts.find((account) => account.id === selectedInstagramAccountId);

    setInstagramSelectionSaving(true);
    setConnectorBusyKey('instagram');

    const persisted = await persistOAuthConnection(
      {
        ...pendingInstagramConnection,
        accountId: selectedInstagramAccountId,
        metadata: selectedAccount
          ? {
              accountName: selectedAccount.name,
              username: selectedAccount.username,
              pageName: selectedAccount.pageName,
              pageId: selectedAccount.pageId,
            }
          : pendingInstagramConnection.metadata ?? null,
      },
      'Conta do Instagram vinculada com sucesso.'
    );

    if (persisted) {
      clearPendingInstagramSelection();
    }

    setInstagramSelectionSaving(false);
    setConnectorBusyKey(null);
  };

  const handleGa4AccountSelection = async () => {
    if (!pendingGa4Connection || !selectedGa4AccountId) {
      setConnectorError('Selecione uma conta GA4 para continuar.');
      setConnectorFeedback(null);
      return;
    }

    const selectedAccount = ga4Accounts.find((account) => account.accountId === selectedGa4AccountId);

    setGa4SelectionSaving(true);
    setConnectorBusyKey('ga4');

    const persisted = await persistOAuthConnection(
      {
        ...pendingGa4Connection,
        accountId: selectedGa4AccountId,
        metadata: selectedAccount
          ? {
              accountName: selectedAccount.name,
            }
          : pendingGa4Connection.metadata ?? null,
      },
      'Conta GA4 vinculada com sucesso.'
    );

    if (persisted) {
      clearPendingGa4Selection();
    }

    setGa4SelectionSaving(false);
    setConnectorBusyKey(null);
  };

  const handleGoogleTrendsAccountSelection = async () => {
    if (!pendingGoogleTrendsConnection || !selectedGoogleTrendsAccountId) {
      setConnectorError('Selecione uma conta Google para continuar.');
      setConnectorFeedback(null);
      return;
    }

    const selectedAccount = googleTrendsAccounts.find((account) => account.accountId === selectedGoogleTrendsAccountId);

    setGoogleTrendsSelectionSaving(true);
    setConnectorBusyKey('googleTrends');

    const persisted = await persistOAuthConnection(
      {
        ...pendingGoogleTrendsConnection,
        accountId: selectedGoogleTrendsAccountId,
        metadata: selectedAccount
          ? {
              accountName: selectedAccount.name,
            }
          : pendingGoogleTrendsConnection.metadata ?? null,
      },
      'Conta Google Trends vinculada com sucesso.'
    );

    if (persisted) {
      clearPendingGoogleTrendsSelection();
    }

    setGoogleTrendsSelectionSaving(false);
    setConnectorBusyKey(null);
  };

  const handleHubSpotAccountSelection = async () => {
    if (!pendingHubSpotConnection || !selectedHubspotAccountId) {
      setConnectorError('Selecione a conta HubSpot para continuar.');
      setConnectorFeedback(null);
      return;
    }

    const selectedAccount = hubspotAccounts.find((account) => account.id === selectedHubspotAccountId);

    setHubspotSelectionSaving(true);
    setConnectorBusyKey('crm');

    const persisted = await persistOAuthConnection(
      {
        ...pendingHubSpotConnection,
        accountId: selectedAccount?.accountId ?? selectedHubspotAccountId,
        metadata: selectedAccount
          ? {
              accountName: selectedAccount.name,
              accountId: selectedAccount.accountId,
            }
          : pendingHubSpotConnection.metadata ?? null,
      },
      'Conta HubSpot vinculada com sucesso.'
    );

    if (persisted) {
      clearPendingHubSpotSelection();
    }

    setHubspotSelectionSaving(false);
    setConnectorBusyKey(null);
  };

  const handleStartHubSpotOAuth = async () => {
    const parsedInstall = parseHubSpotInstallUrl(hubspotInstallUrlInput);
    if (!hubspotAppIdInput.trim() || !hubspotClientIdInput.trim() || !hubspotClientSecretInput.trim() || !parsedInstall) {
      setConnectorFeedback(null);
      setConnectorError('Preencha ID do Aplicativo, ID do Cliente, Segredo do Cliente e uma URL de instalação OAuth válida do HubSpot.');
      return;
    }

    if (hubspotClientIdInput.trim() !== parsedInstall.clientId) {
      setConnectorFeedback(null);
      setConnectorError('O ID do Cliente informado não corresponde ao client_id presente na URL de instalação OAuth.');
      return;
    }

    setHubspotSaving(true);
    const saved = await persistHubSpotCredentials(
      hubspotAppIdInput,
      hubspotClientIdInput,
      hubspotClientSecretInput,
      hubspotInstallUrlInput,
      parsedInstall
    );
    setHubspotSaving(false);

    if (!saved) {
      setConnectorFeedback(null);
      setConnectorError('Não foi possível salvar os dados OAuth do HubSpot.');
      return;
    }

    setConnectorError(null);
    setConnectorFeedback('Credenciais salvas. Redirecionando para autenticação OAuth do HubSpot...');
    clearHubSpotConfigModal();
    const params = new URLSearchParams({
      next: '/hub/conectores',
      provider: OAUTH_CONNECTOR_PROVIDERS.crm || 'hubspot',
      hubspot_app_id: hubspotAppIdInput.trim(),
      hubspot_client_id: hubspotClientIdInput.trim(),
      hubspot_client_secret: hubspotClientSecretInput.trim(),
      hubspot_redirect_uri: parsedInstall.redirectUri,
    });
    if (parsedInstall.optionalScope) {
      params.set('hubspot_optional_scope', parsedInstall.optionalScope);
    }
    window.location.href = `/api/auth/connectors/crm/start?${params.toString()}`;
  };

  const handleStartStripeOAuth = async () => {
    const clientId = stripeConnectClientIdInput.trim();
    if (!clientId) {
      setConnectorFeedback(null);
      setConnectorError('Preencha o Connect Client ID do Stripe para iniciar a autenticação.');
      return;
    }

    const accountBootstrap: StripeAccountBootstrap = {
      accountName: stripeAccountNameInput.trim() || undefined,
      accountEmail: stripeAccountEmailInput.trim() || undefined,
      accountId: stripeAccountIdInput.trim() || undefined,
    };

    setStripeSaving(true);
    const saved = await persistStripeBootstrap(clientId, accountBootstrap);
    setStripeSaving(false);

    if (!saved) {
      setConnectorFeedback(null);
      setConnectorError('Não foi possível salvar os dados de configuração do Stripe.');
      return;
    }

    if (typeof window !== 'undefined' && user) {
      window.localStorage.setItem(
        `neuroads_stripe_pending_bootstrap_${user.uid}`,
        JSON.stringify(accountBootstrap)
      );
    }

    setConnectorError(null);
    setConnectorFeedback('Dados de Stripe salvos. Redirecionando para autenticação OAuth...');
    clearStripeConfigModal();
    const params = new URLSearchParams({
      next: '/hub/conectores',
      provider: OAUTH_CONNECTOR_PROVIDERS.payments || 'stripe',
      stripe_connect_client_id: clientId,
    });
    window.location.href = `/api/auth/connectors/payments/start?${params.toString()}`;
  };

  const handleSaveRdCrmConfig = async () => {
    if (!rdCrmAccessTokenInput.trim()) {
      setConnectorFeedback(null);
      setConnectorError('Preencha o Access Token (OAuth2 Bearer) para concluir a configuração do RD Station CRM.');
      return;
    }

    setRdCrmSaving(true);
    setConnectorBusyKey('rdStation');
    const saved = await persistRdCrmConnection(rdCrmAccessTokenInput, rdCrmRefreshTokenInput, rdCrmWebhookIdInput);
    setConnectorBusyKey(null);
    setRdCrmSaving(false);

    if (saved) {
      clearRdCrmConfigModal();
    }
  };

  const handleSaveRdTokenConnection = async () => {
    if (!rdTokenModalConnector) return;
    if (!rdPublicTokenInput.trim() || !rdPrivateTokenInput.trim()) {
      setConnectorFeedback(null);
      setConnectorError('Preencha Token Público e Token Privado para concluir a integração do RD Station Marketing.');
      return;
    }

    setRdTokenSaving(true);
    setConnectorBusyKey(rdTokenModalConnector);
    const saved = await persistRdTokenConnection(rdTokenModalConnector, rdPublicTokenInput, rdPrivateTokenInput);
    setConnectorBusyKey(null);
    setRdTokenSaving(false);

    if (saved) {
      clearRdTokenModal();
    }
  };

  const handleConnect = async (connectorKey: ConnectorKey) => {
    if (!user) return;
    setConnectorBusyKey(connectorKey);
    setConnectorError(null);
    setConnectorFeedback(null);
    setInlineConnectorNotice(null);

    if (connectorKey === 'crm') {
      setConnectorBusyKey(null);
      setIsHubSpotConfigModalOpen(true);
      return;
    }

    if (connectorKey === 'rdStation') {
      setConnectorBusyKey(null);
      setIsRdCrmConfigModalOpen(true);
      return;
    }

    if (connectorKey === 'rdStationMarketing') {
      setConnectorBusyKey(null);
      setRdTokenModalConnector(connectorKey);
      return;
    }

    if (connectorKey === 'rdStationConversas') {
      setConnectorBusyKey(null);
      setIsRdConversasWebhookModalOpen(true);
      return;
    }

    if (connectorKey === 'payments') {
      setConnectorBusyKey(null);
      setIsStripeConfigModalOpen(true);
      return;
    }

    const oauthProvider = OAUTH_CONNECTOR_PROVIDERS[connectorKey];
    if (oauthProvider) {
      window.location.href = getConnectorOAuthHref(connectorKey, oauthProvider);
      return;
    }

    setConnectorBusyKey(null);
  };

  const handleSync = async (item: UiConnector) => {
    if (!user || !item.connectorKey) return;

    const connectorKey = item.connectorKey;
    const connectionKey = CONNECTOR_CONNECTION_KEYS[connectorKey];
    const now = Date.now();

    setConnectorBusyKey(connectorKey);
    setConnectorError(null);
    setConnectorFeedback(null);
    setInlineConnectorNotice(null);

    try {
      const db = getFirebaseDb();
      const userRef = doc(db, 'users', user.uid);

      await setDoc(
        userRef,
        {
          connections: {
            [connectionKey]: {
              isActive: true,
              updatedAt: now,
            },
          },
          updatedAt: now,
        },
        { merge: true }
      );

      setConnectorStatus((prev) => {
        const nextStatus = { ...prev, [connectorKey]: true };
        const connectorsKey = `neuroads_dashboard_connectors_${user.uid}`;
        window.localStorage.setItem(connectorsKey, JSON.stringify(nextStatus));
        return nextStatus;
      });

      setConnectorSyncOverrides((prev) => ({ ...prev, [connectorKey]: now }));
      setInlineConnectorNotice({
        connectorId: item.id,
        message: `${item.title}: sincronização executada com sucesso.`,
        tone: 'success',
      });
    } catch (syncError) {
      console.warn('Falha ao sincronizar conector:', syncError);
      setInlineConnectorNotice({
        connectorId: item.id,
        message: `${item.title}: não foi possível sincronizar agora.`,
        tone: 'error',
      });
      setConnectorError('Não foi possível sincronizar o conector no banco.');
    } finally {
      setConnectorBusyKey(null);
    }
  };

  const handleConnectorMenuAction = async (
    item: UiConnector,
    isActive: boolean,
    action: 'details' | 'docs' | 'change-account' | 'disconnect'
  ) => {
    setOpenConnectorMenuId(null);

    if (action === 'details') {
      const accountLabel = getConnectorAccountLabel(item, isActive);
      setInlineConnectorNotice({
        connectorId: item.id,
        message: `${item.title}: ${isActive ? 'conector ativo' : 'conector pendente'} • conta sincronizada: ${accountLabel}.`,
        tone: 'info',
      });
      return;
    }

    if (action === 'docs') {
      const docsUrl = CONNECTOR_DOCS_URLS[item.id] ?? 'https://neuroads.com.br/conectores';
      window.open(docsUrl, '_blank', 'noopener,noreferrer');
      return;
    }

    if (action === 'change-account') {
      if (!item.connectorKey) {
        setInlineConnectorNotice({
          connectorId: item.id,
          message: `${item.title}: canal em fase de implantação nesta versão do Hub.`,
          tone: 'success',
        });
        return;
      }

      await handleConnect(item.connectorKey);
      return;
    }

    if (action === 'disconnect') {
      if (!item.connectorKey) {
        setInlineConnectorNotice({
          connectorId: item.id,
          message: `${item.title}: canal em fase de implantação nesta versão do Hub.`,
          tone: 'success',
        });
        return;
      }

      if (!isActive) {
        setInlineConnectorNotice({
          connectorId: item.id,
          message: `${item.title}: conector já está desconectado.`,
          tone: 'info',
        });
        return;
      }

      await handleDisconnect(item.connectorKey);
      return;
    }
  };

  if (accessState !== 'allowed') {
    return (
      <div className="min-h-screen bg-bg-main flex flex-col items-center justify-center gap-4 px-4">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        {isSyncingAccess ? (
          <div className="max-w-md rounded-2xl border border-[#FFD7BD] bg-[#FFF6EF] px-4 py-3 text-center">
            <p className="text-[12px] font-bold uppercase tracking-[0.08em] text-[#C2410C]">Configurando seu acesso</p>
            <p className="mt-1 text-[13px] text-[#9A3412]">Estamos preparando seu ambiente no Hub Estratégico.</p>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <main className="flex min-h-screen flex-col bg-bg-main">
      <Navbar />

      <div className="relative flex-grow overflow-hidden pt-24 md:pt-40">
        <div
          className="pointer-events-none absolute inset-0 bg-top bg-repeat-y bg-[length:100%_auto]"
          style={{ backgroundImage: "url('/images/background_hub_repeat_flow.png')" }}
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-44 bg-gradient-to-b from-transparent via-[#f7f8fa]/75 to-bg-main" />

        <section className="relative z-10 mx-auto w-full max-w-[1536px] px-4 pb-10 font-sans md:px-6 md:pb-14">
          <div className="rounded-[24px] bg-transparent p-4 md:p-6">
            <header className="relative overflow-hidden rounded-3xl border border-[#122034] bg-[#040a13] p-6 md:p-8 shadow-[0_16px_40px_rgba(2,8,22,0.35)]">
              <Image
                src="/images/template-match/metrics-wave-v1.png"
                alt=""
                fill
                className="pointer-events-none object-cover object-bottom opacity-[1]"
                priority
              />
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(3,8,15,0.9)_0%,rgba(3,8,15,0.92)_40%,rgba(3,8,15,0.14)_100%)]" />

              <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                <div>
                  <h1 className="text-[30px] leading-[1.1] font-black tracking-tight text-white sm:text-[34px] md:text-[36px]">
                    <span
                      className="bg-[length:200%_200%] bg-clip-text text-transparent"
                      style={{ backgroundImage: 'linear-gradient(135deg, #ff9a35 0%, #ff6a00 55%, #c84a00 100%)' }}
                    >
                      Conectores
                    </span>
                  </h1>
                  <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[#C6D3E9] md:text-lg">
                    Seu ecossistema conectado com dados reais para decisões mais rápidas e escala previsível.
                  </p>
                  <p className="mt-2 text-sm font-semibold text-[#FF6A00]">
                    Menos ruptura entre canais, mais performance orientada por dados reais.
                  </p>
              </div>
            </div>
          </header>

            <div className="mt-5 grid grid-cols-1 gap-4 xl:grid-cols-[1fr_360px]">
              <div>
                <div className="relative overflow-hidden rounded-3xl border border-[#DDE3F2] glassmorphism-light shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
                  <header className="bg-[#0d1e3d] px-6 py-5 border-b border-[#1a365d]/40 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-[#10b981] animate-pulse" />
                        <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">
                          Conectores Disponíveis
                        </h2>
                      </div>
                      <p className="text-xs font-semibold text-slate-300">
                        Ative e sincronize suas plataformas de anúncios, marketing e vendas.
                      </p>
                    </div>
                    <span className="border border-[#FF6A00] bg-[#FF6A00]/5 text-[#FF6A00] rounded-full px-3 py-1 text-[11px] font-bold whitespace-nowrap">
                      Canais: {filterCount.todos}
                    </span>
                  </header>

                  <div className="p-5 md:p-6">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2">
                        {(['todos', 'marketing', 'ads', 'crm', 'social'] as const).map((filter) => {
                          const isActive = activeFilter === filter;
                          return (
                            <button
                              key={filter}
                              type="button"
                              onClick={() => setActiveFilter(filter)}
                              className={`inline-flex items-center gap-2 rounded-[12px] border px-4 py-2 text-[14px] font-semibold transition ${
                                isActive
                                  ? 'border-[#FFB980] bg-[#FFF3E8] text-[#FF7A00]'
                                  : 'border-[#DDE3F2] bg-white text-[#334155] hover:text-[#0F172A]'
                              }`}
                            >
                              {CATEGORY_LABELS[filter]}
                              <span className="text-[13px] text-[#64748B]">{filterCount[filter]}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="mt-3 space-y-2">
                      {visibleConnectors.map((item) => {
                        const isActive = isConnectorActive(item, connectorStatus);
                        const isBusy = item.connectorKey ? connectorBusyKey === item.connectorKey : false;
                        const accountLabel = getConnectorAccountLabel(item, isActive);
                        const cardNotice = inlineConnectorNotice?.connectorId === item.id ? inlineConnectorNotice : null;
                        return (
                          <article
                            key={item.id}
                            className="grid grid-cols-1 gap-4 rounded-2xl border border-[#DDE3F2] bg-white p-4 shadow-[0_6px_14px_rgba(15,23,42,0.06)] transition-colors duration-200 hover:bg-[#F1F3F5] md:grid-cols-[94px_1.3fr_1.2fr_auto] md:items-center"
                          >
                            <div className="flex h-[88px] w-[88px] items-center justify-center rounded-2xl border border-[#E7ECF5] bg-[#FAFCFF]">
                              <BrandTile id={item.id} />
                            </div>

                            <div>
                              <h2 className="text-[26px] font-semibold leading-[1.1] tracking-tight text-[#0F172A]">{item.title}</h2>
                              <p className="mt-1 text-[15px] leading-[1.45] text-[#334155]">{item.description}</p>
                              <p className="mt-2 text-[12px] font-semibold text-[#64748B]">
                                Categoria: {CATEGORY_LABELS[item.category]}
                              </p>
                            </div>

                            <div>
                              <span
                                className={`inline-flex items-center gap-1 px-0 py-0 text-[12px] font-bold ${
                                  isActive ? 'text-[#12B76A]' : 'text-[#FF7A00]'
                                }`}
                              >
                                <span className={`inline-block h-2 w-2 rounded-full ${isActive ? 'bg-[#12B76A]' : 'bg-[#FF7A00]'}`} />
                                {isActive ? 'Conectado' : 'Pendente'}
                              </span>

                              <div className="mt-2 border-t border-[#E2E8F0] pt-2 text-[13px] text-[#64748B]">
                                <p>
                                  Última sincronização <span className="ml-2 font-semibold text-[#0F172A]">{getConnectorLastSyncLabel(item, isActive)}</span>
                                </p>
                                <p className="mt-1 flex items-center gap-2 text-[#64748B]">
                                  Conta sincronizada
                                  <span className="font-semibold text-[#0F172A]">{accountLabel}</span>
                                </p>
                              </div>
                            </div>

                            <div className="flex min-w-[220px] flex-col items-stretch gap-2">
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (!item.connectorKey) {
                                      setInlineConnectorNotice({
                                        connectorId: item.id,
                                        message: `${item.title}: canal em fase de implantação nesta versão do Hub.`,
                                        tone: 'success',
                                      });
                                      return;
                                    }
                                    if (isActive) {
                                      void handleSync(item);
                                      return;
                                    }
                                    void handleConnect(item.connectorKey);
                                  }}
                                  disabled={Boolean(isBusy)}
                                  className={`inline-flex h-12 items-center gap-2 rounded-[12px] px-4 text-[13px] font-black tracking-wide transition disabled:opacity-60 ${
                                    isActive
                                      ? 'border border-[#FFD4B2] bg-[#FFF8F2] text-[#F97316] hover:bg-[#FFF1E6]'
                                      : 'border border-[#FF7A00] bg-[#FF7A00] text-white shadow-[0_10px_20px_rgba(255,122,0,0.24)] hover:bg-[#E56B00]'
                                  }`}
                                >
                                  <RefreshCw className={`h-4 w-4 ${isBusy ? 'animate-spin' : ''}`} />
                                  {!item.connectorKey ? 'Em implantação' : isActive ? 'Sincronizar' : 'Configurar'}
                                </button>
                                <div className="relative" data-connector-menu-root>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setOpenConnectorMenuId((current) => (current === item.id ? null : item.id))
                                    }
                                    className="inline-flex h-10 w-10 items-center justify-center rounded-[12px] border border-[#DDE3F2] bg-white text-[#64748B] transition hover:text-[#0F172A]"
                                    aria-label={`Mais ações para ${item.title}`}
                                    aria-expanded={openConnectorMenuId === item.id}
                                    aria-haspopup="menu"
                                  >
                                    <EllipsisVertical className="h-4 w-4" />
                                  </button>

                                  {openConnectorMenuId === item.id ? (
                                    <div
                                      className="absolute right-0 top-11 z-20 w-56 rounded-2xl border border-[#E7EAF0] bg-white p-2 shadow-[0_14px_30px_rgba(15,23,42,0.12)]"
                                      role="menu"
                                      aria-label={`Ações para ${item.title}`}
                                    >
                                      <button
                                        type="button"
                                        onClick={() => void handleConnectorMenuAction(item, isActive, 'details')}
                                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-[14px] font-semibold text-[#344054] transition-colors hover:bg-[#F8FAFC] hover:text-[#FF6A00]"
                                        role="menuitem"
                                      >
                                        <Info className="h-4 w-4 text-[#64748B]" />
                                        Ver detalhes
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => void handleConnectorMenuAction(item, isActive, 'docs')}
                                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-[14px] font-semibold text-[#344054] transition-colors hover:bg-[#F8FAFC] hover:text-[#FF6A00]"
                                        role="menuitem"
                                      >
                                        <BookOpenText className="h-4 w-4 text-[#64748B]" />
                                        Documentação oficial
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => void handleConnectorMenuAction(item, isActive, 'change-account')}
                                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-[14px] font-semibold text-[#344054] transition-colors hover:bg-[#F8FAFC] hover:text-[#FF6A00]"
                                        role="menuitem"
                                      >
                                        <Link2 className="h-4 w-4 text-[#64748B]" />
                                        Alterar conta
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => void handleConnectorMenuAction(item, isActive, 'disconnect')}
                                        className="mt-1 flex w-full items-center gap-2 rounded-xl border border-[#FFD9BD] bg-[#FFF5EC] px-3 py-2 text-left text-[14px] font-semibold text-[#FF7A00] transition-colors hover:bg-[#FFEEDF]"
                                        role="menuitem"
                                      >
                                        <Link2 className="h-4 w-4" />
                                        Desconectar
                                      </button>
                                    </div>
                                  ) : null}
                                </div>
                              </div>
                              {cardNotice ? (
                                <div
                                  className={`rounded-[12px] border px-3 py-2 text-[13px] font-semibold ${
                                    cardNotice.tone === 'error'
                                      ? 'border-[#FFD8D8] bg-[#FFF5F5] text-[#EF4444]'
                                      : cardNotice.tone === 'success'
                                        ? 'border-[#BFE7CF] bg-[#F1FCF6] text-[#0F9D58]'
                                        : 'border-[#DDE3F2] bg-[#F8FAFC] text-[#334155]'
                                  }`}
                                >
                                  {cardNotice.message}
                                </div>
                              ) : null}
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {(connectorError || connectorFeedback) && (
                  <div
                    className={`mt-4 rounded-xl border px-4 py-3 text-[14px] font-semibold ${
                      connectorError
                        ? 'border-[#FFD8D8] bg-[#FFF5F5] text-[#EF4444]'
                        : 'border-[#CDEEDB] bg-[#F1FCF6] text-[#12B76A]'
                    }`}
                  >
                    {connectorError || connectorFeedback}
                  </div>
                )}
              </div>

              <aside className="space-y-4">
                {/* CARD 1: Saúde das Integrações */}
                <section className="relative overflow-hidden rounded-[24px] border border-white/70 bg-white/55 backdrop-blur-xl backdrop-saturate-150 shadow-[0_14px_36px_rgba(15,23,42,0.12)]">
                  {/* Top border ambient subtle accent */}
                  <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#F97316]/40 to-transparent" />
                  
                  <header className="border-b border-[#1a365d]/40 bg-[#0d1e3d] px-5 py-4 flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full animate-pulse ${healthScore > 50 ? 'bg-[#10b981]' : 'bg-[#EF4444]'}`} />
                        <h3 className="text-[13px] font-black tracking-wider uppercase text-white">
                          Saúde das Integrações
                        </h3>
                      </div>
                      <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest leading-none">
                        Monitoramento em tempo real
                      </p>
                    </div>
                    <span className="border border-[#FF6A00] bg-[#FF6A00]/5 text-[#FF6A00] rounded-full px-3 py-1 text-[11px] font-bold whitespace-nowrap">
                      {healthStatus.label}
                    </span>
                  </header>

                  <div className="p-5">
                    <div className="relative overflow-hidden rounded-[20px] border border-[#E8EEF7] bg-white/80 px-2 pb-3 pt-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]">
                      <div className="hub-health-interactive-bg pointer-events-none absolute inset-0" aria-hidden />
                      <div className="relative z-10 px-1 pb-2">
                      <HealthGauge value={healthScore} />

                      <div className="mt-3 flex flex-col items-center">
                        <span className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1 text-[13px] font-bold ${healthStatus.bg}`}>
                          <span className="h-2 w-2 rounded-full bg-current animate-pulse" />
                          {healthStatus.label}
                        </span>
                        <p className="mt-3 text-[14px] font-bold uppercase tracking-wider text-slate-800">Saúde Global</p>
                        <p className="mt-1 text-[12px] text-slate-400 font-semibold">
                          {formatLastSyncLabel(latestSyncTimestamp) || 'Sem sincronização'}
                        </p>
                      </div>
                      </div>
                    </div>

                    <div className="mt-5 grid grid-cols-3 gap-2 border-t border-slate-100 pt-4 text-center">
                      <div className="border-r border-slate-100 px-1">
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Integrações Ativas</p>
                        <p className="mt-1 text-[16px] font-black text-slate-800">
                          {activeTrackedConnectorCount}/{trackedConnectorCount}
                        </p>
                      </div>
                      <div className="border-r border-slate-100 px-1">
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Latência Média</p>
                        <p className="mt-1 text-[16px] font-black text-slate-800">112ms</p>
                      </div>
                      <div className="px-1">
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Falhas (24h)</p>
                        <p className="mt-1 text-[16px] font-black text-slate-800">3</p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* CARD 2: Alertas Importantes */}
                <section className="relative overflow-hidden rounded-[24px] border border-slate-200/80 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.03)]">
                  {/* Top border ambient subtle accent */}
                  <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#F97316]/40 to-transparent" />

                  <header className="bg-[#0d1e3d] px-5 py-4 border-b border-[#1a365d]/40 flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-[#EF4444] animate-pulse" />
                        <h3 className="text-[13px] font-black tracking-wider uppercase text-white">
                          Alertas Importantes
                        </h3>
                      </div>
                      <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest leading-none">
                        Atualizado há 2 min
                      </p>
                    </div>
                    <span className="border border-[#FF6A00] bg-[#FF6A00]/5 text-[#FF6A00] rounded-full px-3 py-1 text-[11px] font-bold whitespace-nowrap">
                      {activeAlerts.length} Ativos
                    </span>
                  </header>

                  <div className="p-5">
                    <div className="space-y-3">
                      {activeAlerts.length === 0 ? (
                        <div className="py-6 text-center text-slate-400 text-sm font-medium">
                          Não há alertas ativos no momento.
                        </div>
                      ) : (
                        activeAlerts.slice(0, 5).map((alert) => {
                          let borderLeftColor = 'bg-slate-400';
                          let badgeStyle = 'border-slate-400/20 bg-slate-500/8 text-slate-600';
                          let icon = <Info className="h-5 w-5 text-slate-500 shrink-0 mt-0.5" />;

                          if (alert.priority === 'critico') {
                            borderLeftColor = alert.hasGlowOrange ? 'bg-[#FF8A3D]' : 'bg-[#EF4444]';
                            badgeStyle = alert.hasGlowOrange
                              ? 'border-[#FF8A3D]/20 bg-[#FF8A3D]/8 text-[#FF8A3D]'
                              : 'border-[#EF4444]/20 bg-[#EF4444]/8 text-[#EF4444]';
                            icon = <TriangleAlert className={`h-5 w-5 shrink-0 mt-0.5 ${alert.hasGlowOrange ? 'text-[#FF8A3D]' : 'text-[#EF4444]'}`} />;
                          } else if (alert.priority === 'alto') {
                            borderLeftColor = 'bg-[#FF7A00]';
                            badgeStyle = 'border-[#FF7A00]/20 bg-[#FF7A00]/8 text-[#FF7A00]';
                            icon = <Link2 className="h-5 w-5 text-[#FF7A00] shrink-0 mt-0.5" />;
                          } else if (alert.priority === 'medio') {
                            borderLeftColor = 'bg-[#F59E0B]';
                            badgeStyle = 'border-[#F59E0B]/20 bg-[#F59E0B]/8 text-[#D97706]';
                            icon = <TriangleAlert className="h-5 w-5 text-[#F59E0B] shrink-0 mt-0.5" />;
                          }

                          return (
                            <article
                              key={alert.id}
                              onClick={() => setSelectedAlert(alert)}
                              className="group relative overflow-hidden rounded-[12px] border border-slate-100/80 bg-slate-50/60 pl-4 pr-3 py-3 shadow-sm transition hover:bg-slate-100/80 cursor-pointer flex items-center justify-between"
                            >
                              <div className={`absolute top-0 bottom-0 left-0 w-[3.5px] ${borderLeftColor}`} />
                              <div className="flex items-start gap-3">
                                {icon}
                                <div>
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${badgeStyle}`}>
                                      {alert.badgeText}
                                    </span>
                                    {alert.hasGlowOrange && (
                                      <span className="inline-flex items-center rounded-full border border-amber-500/20 bg-amber-500/8 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-600">
                                        Glow Orange
                                      </span>
                                    )}
                                    <span className="text-[11px] text-slate-400 font-semibold">{alert.time}</span>
                                  </div>
                                  <h4 className="text-[13px] font-bold text-slate-800 mt-1">
                                    {alert.title}
                                  </h4>
                                  <p className="text-[12px] text-slate-500 mt-0.5">
                                    {alert.description}{' '}
                                    {alert.priority === 'critico' && !alert.hasGlowOrange && (
                                      <span className="text-[#FF7A00] font-semibold hover:underline">
                                        [Mais Detalhes]
                                      </span>
                                    )}
                                  </p>
                                </div>
                              </div>
                              <ArrowRight className="h-4 w-4 text-[#FF7A00] transition group-hover:translate-x-1 shrink-0 ml-2" />
                            </article>
                          );
                        })
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setIsAllAlertsModalOpen(true);
                      setActiveAlertsTab('ativos');
                    }}
                    className="mt-6 w-full py-3 rounded-xl border border-[#FF7A00]/40 hover:border-[#FF7A00] text-[#FF7A00] font-bold text-xs uppercase tracking-wider transition-all duration-300 hover:bg-[#FF7A00]/5 flex items-center justify-center gap-2"
                  >
                    <TriangleAlert className="h-4 w-4" />
                    Ver todos os alertas
                  </button>
                </section>
              </aside>
            </div>
          </div>
        </section>
      </div>

      <Footer />
      <LuccaHubSupportWidget />

      {isStripeConfigModalOpen && (
        <div className={SETTINGS_MODAL_VIEWPORT}>
          <div onClick={clearStripeConfigModal} className={SETTINGS_MODAL_BACKDROP} />

          <div className={`${SETTINGS_MODAL_FRAME} max-w-3xl`}>
            <div className={SETTINGS_MODAL_SURFACE}>
              <div className={PREMIUM_MODAL_HEADER}>
                <div className="flex items-center justify-between w-full pr-12">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-[#10b981] animate-pulse" />
                      <h3 className="text-xl font-black text-white tracking-tight">Stripe</h3>
                    </div>
                    <p className="text-xs font-semibold text-slate-300">Configurar autenticação Stripe Connect</p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#635BFF]/15 border border-[#635BFF]/35 text-[#A29BFE] shrink-0 shadow-sm">
                    <CreditCard size={20} />
                  </div>
                </div>
                <button onClick={clearStripeConfigModal} className={PREMIUM_MODAL_CLOSE_BUTTON}>
                  <X size={16} />
                </button>
              </div>

              <div className="p-5 flex-1 overflow-y-auto custom-scrollbar space-y-4">
                <p className="text-sm text-slate-500 font-medium leading-relaxed">
                  Informe os dados da conta Stripe e siga para autenticação OAuth. Na próxima etapa, o Stripe permitirá escolher a conta desejada para conexão.
                </p>

                <div className="rounded-2xl border border-[#E8EDFF] bg-[#F6F8FF] p-4 text-[12px] text-[#344054]">
                  <p className="font-bold text-[#1D4ED8]">Onde encontrar os dados no Stripe</p>
                  <ul className="mt-2 list-disc space-y-1 pl-5">
                    <li>
                      <strong>Connect Client ID:</strong> Stripe Dashboard → <em>Developers</em> → <em>Connect settings</em> → campo
                      <strong> Client ID</strong> (formato <code className="rounded bg-white px-1">ca_...</code>).
                    </li>
                    <li>
                      <strong>Account ID:</strong> Stripe Dashboard → <em>Settings</em> → <em>Business settings</em> → <em>Account details</em> (formato <code className="rounded bg-white px-1">acct_...</code>).
                    </li>
                    <li>
                      <strong>E-mail da conta:</strong> o e-mail principal de login/financeiro da conta Stripe conectada.
                    </li>
                  </ul>
                  <a
                    href="https://dashboard.stripe.com/settings/connect"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-1 font-semibold text-[#1D4ED8] hover:underline"
                  >
                    Abrir Connect settings no Stripe
                    <ExternalLink size={12} />
                  </a>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="flex items-center gap-1.5 text-slate-400 mb-1.5">
                      <Fingerprint size={13} />
                      <span className={SETTINGS_LABEL}>Stripe Connect Client ID *</span>
                    </label>
                    <input
                      type="text"
                      value={stripeConnectClientIdInput}
                      onChange={(event) => setStripeConnectClientIdInput(event.target.value)}
                      className={SETTINGS_INPUT}
                      placeholder="Ex.: ca_XXXXXXXXXXXXXXXX"
                    />
                    <p className="mt-1 text-[11px] font-semibold text-slate-500">
                      Local: Developers → Connect settings → Client ID.
                    </p>
                  </div>

                  <div>
                    <label className="flex items-center gap-1.5 text-slate-400 mb-1.5">
                      <Building2 size={13} />
                      <span className={SETTINGS_LABEL}>Nome da Conta Stripe</span>
                    </label>
                    <input
                      type="text"
                      value={stripeAccountNameInput}
                      onChange={(event) => setStripeAccountNameInput(event.target.value)}
                      className={SETTINGS_INPUT}
                      placeholder="Ex.: NeuroAds Pagamentos"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-1.5 text-slate-400 mb-1.5">
                      <Mail size={13} />
                      <span className={SETTINGS_LABEL}>E-mail da Conta</span>
                    </label>
                    <input
                      type="email"
                      value={stripeAccountEmailInput}
                      onChange={(event) => setStripeAccountEmailInput(event.target.value)}
                      className={SETTINGS_INPUT}
                      placeholder="financeiro@empresa.com"
                    />
                    <p className="mt-1 text-[11px] font-semibold text-slate-500">
                      Use o e-mail principal da conta Stripe que será autenticada.
                    </p>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="flex items-center gap-1.5 text-slate-400 mb-1.5">
                      <CreditCard size={13} />
                      <span className={SETTINGS_LABEL}>Account ID (opcional)</span>
                    </label>
                    <input
                      type="text"
                      value={stripeAccountIdInput}
                      onChange={(event) => setStripeAccountIdInput(event.target.value)}
                      className={SETTINGS_INPUT}
                      placeholder="Ex.: acct_1234abcd"
                    />
                    <p className="mt-1 text-[11px] font-semibold text-slate-500">
                      Local: Settings → Business settings → Account details.
                    </p>
                  </div>
                </div>
              </div>

              <div className="px-5 pb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-slate-100 pt-4 bg-[#FAFBFC]">
                <p className="text-xs font-semibold text-slate-400">
                  O Stripe abrirá a tela oficial para autenticação e escolha da conta.
                </p>
                <div className="flex gap-3">
                  <button type="button" onClick={clearStripeConfigModal} className={SETTINGS_SECONDARY_BUTTON}>
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleStartStripeOAuth()}
                    disabled={stripeSaving}
                    className={SETTINGS_PRIMARY_BUTTON}
                  >
                    {stripeSaving ? 'Processando...' : 'Continuar com OAuth'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {isHubSpotConfigModalOpen && (
        <div className={SETTINGS_MODAL_VIEWPORT}>
          <div
            onClick={clearHubSpotConfigModal}
            className={SETTINGS_MODAL_BACKDROP}
          />

          <div className={`${SETTINGS_MODAL_FRAME} max-w-5xl`}>
            <div className={SETTINGS_MODAL_SURFACE}>
              <div className={PREMIUM_MODAL_HEADER}>
                <div className="flex items-center justify-between w-full pr-12">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-[#10b981] animate-pulse" />
                      <h3 className="text-xl font-black text-white tracking-tight">HubSpot CRM</h3>
                    </div>
                    <p className="text-xs font-semibold text-slate-300">Configurar HubSpot CRM (OAuth)</p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FF6B00]/10 border border-[#FF6B00]/30 text-[#FF6B00] shrink-0 shadow-sm">
                    <Building2 size={20} />
                  </div>
                </div>
                <button
                  onClick={clearHubSpotConfigModal}
                  className={PREMIUM_MODAL_CLOSE_BUTTON}
                >
                  <X size={16} />
                </button>
              </div>

              <div className="p-5 flex-1 overflow-y-auto custom-scrollbar space-y-4">
                <div className="rounded-2xl border border-orange-100 bg-orange-50/20 p-5 space-y-3">
                  <p className="font-bold flex items-center gap-1.5 text-[#FF6B00]"><Info size={16} className="shrink-0" /> Como obter suas credenciais no HubSpot:</p>
                  <ol className="list-decimal pl-5 space-y-2 text-[#7C2D12] font-semibold text-sm">
                    <li>
                      Para integração entre múltiplas contas, use <strong className="text-[#FF6B00]">OAuth</strong>. No HubSpot Developer, abra seu app, vá em <strong className="text-[#FF6B00]">Auth</strong> e copie <strong className="text-[#FF6B00]">Client ID</strong> e <strong className="text-[#FF6B00]">Client Secret</strong>.
                    </li>
                    <li>
                      Copie no HubSpot a <strong className="text-[#FF6B00]">URL de instalação OAuth</strong> (com parâmetros), pois ela contém o <code className="bg-[#FFF1E6] px-1 rounded">client_id</code>, <code className="bg-[#FFF1E6] px-1 rounded">redirect_uri</code> e os <code className="bg-[#FFF1E6] px-1 rounded">scopes</code>.
                    </li>
                    <li>
                      Essa URL precisa usar o callback do conector CRM. Exemplo de redirect esperado:
                      <div className="mt-2 space-y-1 rounded-xl border border-orange-200/70 bg-white/80 px-3 py-2 font-mono text-[12px] text-[#7C2D12]">
                        <p>https://neuroads.com.br/api/auth/connectors/crm/callback</p>
                        <p>http://localhost:3000/api/auth/connectors/crm/callback</p>
                      </div>
                    </li>
                    <li>
                      No app OAuth, habilite escopos mínimos de CRM para sincronização de funil:
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        <code className="bg-[#FFF1E6] px-1 rounded">oauth</code>
                        <code className="bg-[#FFF1E6] px-1 rounded">crm.objects.contacts.read</code>
                        <code className="bg-[#FFF1E6] px-1 rounded">crm.objects.contacts.write</code>
                        <code className="bg-[#FFF1E6] px-1 rounded">crm.objects.companies.read</code>
                        <code className="bg-[#FFF1E6] px-1 rounded">crm.objects.companies.write</code>
                        <code className="bg-[#FFF1E6] px-1 rounded">crm.objects.deals.read</code>
                        <code className="bg-[#FFF1E6] px-1 rounded">crm.objects.deals.write</code>
                      </div>
                    </li>
                    <li>
                      Referência oficial: <a href="https://developers.hubspot.com/docs/apps/developer-platform/build-apps/authentication/overview" target="_blank" rel="noopener noreferrer" className="underline font-bold hover:text-[#FF6B00]">Authentication Overview</a>, <a href="https://developers.hubspot.com/docs/apps/developer-platform/build-apps/authentication/oauth/working-with-oauth" target="_blank" rel="noopener noreferrer" className="underline font-bold hover:text-[#FF6B00]">Working with OAuth</a> e <a href="https://developers.hubspot.com/docs/apps/developer-platform/build-apps/authentication/scopes" target="_blank" rel="noopener noreferrer" className="underline font-bold hover:text-[#FF6B00]">Scopes</a>.
                    </li>
                  </ol>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="flex items-center gap-1.5 text-slate-400 mb-1.5">
                      <Building2 size={13} />
                      <span className={SETTINGS_LABEL}>ID do Aplicativo (App ID)</span>
                    </label>
                    <input
                      type="text"
                      value={hubspotAppIdInput}
                      onChange={(event) => setHubspotAppIdInput(event.target.value)}
                      className={SETTINGS_INPUT}
                      placeholder="ID do aplicativo no HubSpot Developer"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="flex items-center gap-1.5 text-slate-400 mb-1.5">
                      <User size={13} />
                      <span className={SETTINGS_LABEL}>ID do Cliente (Client ID)</span>
                    </label>
                    <input
                      type="text"
                      value={hubspotClientIdInput}
                      onChange={(event) => setHubspotClientIdInput(event.target.value)}
                      className={SETTINGS_INPUT}
                      placeholder="Client ID obtido no HubSpot Developer"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="flex items-center gap-1.5 text-slate-400 mb-1.5">
                      <PlugZap size={13} />
                      <span className={SETTINGS_LABEL}>Segredo do Cliente (Client Secret)</span>
                    </label>
                    <input
                      type="password"
                      value={hubspotClientSecretInput}
                      onChange={(event) => setHubspotClientSecretInput(event.target.value)}
                      className={SETTINGS_INPUT}
                      placeholder="Segredo do cliente obtido no HubSpot Developer Portal"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="flex items-center gap-1.5 text-slate-400 mb-1.5">
                      <Link2 size={13} />
                      <span className={SETTINGS_LABEL}>URL de Instalação OAuth</span>
                    </label>
                    <input
                      type="text"
                      value={hubspotInstallUrlInput}
                      onChange={(event) => setHubspotInstallUrlInput(event.target.value)}
                      className={SETTINGS_INPUT}
                      placeholder="Ex.: https://app.hubspot.com/oauth/authorize?client_id=...&redirect_uri=...&scope=..."
                    />
                    <p className="mt-2 text-[11px] font-semibold text-slate-500">
                      Informe a URL completa de instalação OAuth gerada no HubSpot Developer.
                    </p>
                  </div>
                </div>
              </div>

              <div className="px-5 pb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-slate-100 pt-4 bg-[#FAFBFC]">
                <p className="text-xs font-semibold text-slate-400">
                  Preencha ID do Aplicativo, ID do Cliente, Segredo do Cliente e URL de instalação OAuth.
                </p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={clearHubSpotConfigModal}
                    className={SETTINGS_SECONDARY_BUTTON}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleStartHubSpotOAuth}
                    disabled={hubspotSaving}
                    className={SETTINGS_PRIMARY_BUTTON}
                  >
                    {hubspotSaving ? 'Processando...' : 'Continuar com OAuth'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {isRdCrmConfigModalOpen && (
        <div className={SETTINGS_MODAL_VIEWPORT}>
          <div
            onClick={clearRdCrmConfigModal}
            className={SETTINGS_MODAL_BACKDROP}
          />

          <div className={`${SETTINGS_MODAL_FRAME} max-w-3xl`}>
            <div className={SETTINGS_MODAL_SURFACE}>
              <div className={PREMIUM_MODAL_HEADER}>
                <div className="flex items-center justify-between w-full pr-12">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-[#10b981] animate-pulse" />
                      <h3 className="text-xl font-black text-white tracking-tight">RD Station CRM</h3>
                    </div>
                    <p className="text-xs font-semibold text-slate-300">Configurar RD Station CRM (API v2)</p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FF6B00]/10 border border-[#FF6B00]/30 text-[#FF6B00] shrink-0 shadow-sm">
                    <PlugZap size={20} />
                  </div>
                </div>
                <button
                  onClick={clearRdCrmConfigModal}
                  className={PREMIUM_MODAL_CLOSE_BUTTON}
                >
                  <X size={16} />
                </button>
              </div>

              <div className="p-5 flex-1 overflow-y-auto custom-scrollbar space-y-4">
                <p className="text-sm text-slate-500 font-medium leading-relaxed">
                  Conforme a documentação oficial do CRM v2, a autenticação é via OAuth2 Bearer Token. Informe o Access Token ativo e, se disponível, o Refresh Token para renovação operacional.
                </p>

                <div className={SETTINGS_PANEL}>
                  <p className={SETTINGS_LABEL}>Webhook receptor recomendado</p>
                  <p className="break-all text-sm font-bold text-slate-800">{rdCrmWebhookUrl}</p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="flex items-center gap-1.5 text-slate-400 mb-1.5">
                      <PlugZap size={13} />
                      <span className={SETTINGS_LABEL}>Access Token (Bearer) *</span>
                    </label>
                    <input
                      type="password"
                      value={rdCrmAccessTokenInput}
                      onChange={(event) => setRdCrmAccessTokenInput(event.target.value)}
                      className={SETTINGS_INPUT}
                      placeholder="Cole o access_token OAuth2 do RD Station CRM"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-1.5 text-slate-400 mb-1.5">
                      <PlugZap size={13} />
                      <span className={SETTINGS_LABEL}>Refresh Token (opcional)</span>
                    </label>
                    <input
                      type="password"
                      value={rdCrmRefreshTokenInput}
                      onChange={(event) => setRdCrmRefreshTokenInput(event.target.value)}
                      className={SETTINGS_INPUT}
                      placeholder="Cole o refresh_token para rotação de credenciais"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-1.5 text-slate-400 mb-1.5">
                      <Building2 size={13} />
                      <span className={SETTINGS_LABEL}>ID do webhook no RD (opcional)</span>
                    </label>
                    <input
                      type="text"
                      value={rdCrmWebhookIdInput}
                      onChange={(event) => setRdCrmWebhookIdInput(event.target.value)}
                      className={SETTINGS_INPUT}
                      placeholder="Ex.: UUID retornado em /crm/v2/webhooks"
                    />
                  </div>
                </div>
              </div>

              <div className="px-5 pb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-slate-100 pt-4 bg-[#FAFBFC]">
                <p className="text-xs font-semibold text-slate-400">
                  Preencha os dados da integração.
                </p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={clearRdCrmConfigModal}
                    className={SETTINGS_SECONDARY_BUTTON}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleSaveRdCrmConfig()}
                    disabled={rdCrmSaving}
                    className={SETTINGS_PRIMARY_BUTTON}
                  >
                    {rdCrmSaving ? 'Salvando...' : 'Salvar configuração CRM'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {rdTokenModalConnector && (
        <div className={SETTINGS_MODAL_VIEWPORT}>
          <div
            onClick={clearRdTokenModal}
            className={SETTINGS_MODAL_BACKDROP}
          />

          <div className={`${SETTINGS_MODAL_FRAME} max-w-3xl`}>
            <div className={SETTINGS_MODAL_SURFACE}>
              <div className={PREMIUM_MODAL_HEADER}>
                <div className="flex items-center justify-between w-full pr-12">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-[#10b981] animate-pulse" />
                      <h3 className="text-xl font-black text-white tracking-tight">RD Station Marketing</h3>
                    </div>
                    <p className="text-xs font-semibold text-slate-300">Conectar RD Station Marketing via tokens</p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FF6B00]/10 border border-[#FF6B00]/30 text-[#FF6B00] shrink-0 shadow-sm">
                    <PlugZap size={20} />
                  </div>
                </div>
                <button
                  onClick={clearRdTokenModal}
                  className={PREMIUM_MODAL_CLOSE_BUTTON}
                >
                  <X size={16} />
                </button>
              </div>

              <div className="p-5 flex-1 overflow-y-auto custom-scrollbar space-y-4">
                <p className="text-sm text-slate-500 font-medium leading-relaxed">
                  Informe Token Público e Token Privado para manter a autenticação ativa no Hub. Esses dados serão salvos no perfil de integração para sincronizações futuras.
                </p>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="flex items-center gap-1.5 text-slate-400 mb-1.5">
                      <Globe size={13} />
                      <span className={SETTINGS_LABEL}>Token Público</span>
                    </label>
                    <input
                      type="text"
                      value={rdPublicTokenInput}
                      onChange={(event) => setRdPublicTokenInput(event.target.value)}
                      className={SETTINGS_INPUT}
                      placeholder="Cole o Token Público do RD Station"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-1.5 text-slate-400 mb-1.5">
                      <PlugZap size={13} />
                      <span className={SETTINGS_LABEL}>Token Privado</span>
                    </label>
                    <input
                      type="password"
                      value={rdPrivateTokenInput}
                      onChange={(event) => setRdPrivateTokenInput(event.target.value)}
                      className={SETTINGS_INPUT}
                      placeholder="Cole o Token Privado do RD Station"
                    />
                  </div>
                </div>
              </div>

              <div className="px-5 pb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-slate-100 pt-4 bg-[#FAFBFC]">
                <p className="text-xs font-semibold text-slate-400">
                  Preencha os dados da integração.
                </p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={clearRdTokenModal}
                    className={SETTINGS_SECONDARY_BUTTON}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleSaveRdTokenConnection()}
                    disabled={rdTokenSaving}
                    className={SETTINGS_PRIMARY_BUTTON}
                  >
                    {rdTokenSaving ? 'Salvando...' : 'Salvar integração'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {isRdConversasWebhookModalOpen && (
        <div className={SETTINGS_MODAL_VIEWPORT}>
          <div
            onClick={() => setIsRdConversasWebhookModalOpen(false)}
            className={SETTINGS_MODAL_BACKDROP}
          />

          <div className={`${SETTINGS_MODAL_FRAME} max-w-4xl`}>
            <div className={SETTINGS_MODAL_SURFACE}>
              <div className={PREMIUM_MODAL_HEADER}>
                <div className="flex items-center justify-between w-full pr-12">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-[#10b981] animate-pulse" />
                      <h3 className="text-xl font-black text-white tracking-tight">RD Station Conversas</h3>
                    </div>
                    <p className="text-xs font-semibold text-slate-300">Configurar RD Station Conversas via webhook</p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FF6B00]/10 border border-[#FF6B00]/30 text-[#FF6B00] shrink-0 shadow-sm">
                    <PlugZap size={20} />
                  </div>
                </div>
                <button
                  onClick={() => setIsRdConversasWebhookModalOpen(false)}
                  className={PREMIUM_MODAL_CLOSE_BUTTON}
                >
                  <X size={16} />
                </button>
              </div>

              <div className="p-5 flex-1 overflow-y-auto custom-scrollbar space-y-4">
                <div className="rounded-2xl border border-orange-100 bg-orange-50/20 p-5 space-y-3">
                  <p className="font-bold flex items-center gap-1.5 text-[#FF6B00]"><Info size={16} className="shrink-0" /> Como configurar o webhook no RD Station Conversas:</p>
                  <ol className="list-decimal pl-5 space-y-2 text-[#7C2D12] font-semibold text-sm">
                    <li>Acesse o painel do RD Station Conversas e abra as integrações/webhooks do workspace.</li>
                    <li>Crie um webhook com método `POST` apontando para a URL indicada abaixo.</li>
                    <li>Garanta resposta HTTP `2xx` no teste de validação do RD.</li>
                    <li>Defina um segredo de assinatura no RD e guarde esse valor em ambiente seguro (recomendado).</li>
                  </ol>
                </div>

                <div className={SETTINGS_PANEL}>
                  <p className={SETTINGS_LABEL}>URL de webhook (NeuroAds)</p>
                  <p className="break-all text-sm font-bold text-slate-800 font-mono bg-slate-50 px-3 py-2 rounded border border-slate-100">{rdConversasWebhookUrl}</p>
                </div>
              </div>

              <div className="px-5 pb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-slate-100 pt-4 bg-[#FAFBFC]">
                <p className="text-xs font-semibold text-slate-400">
                  Após configurar no RD, clique em marcar como configurado para ativar.
                </p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsRdConversasWebhookModalOpen(false)}
                    className={SETTINGS_SECONDARY_BUTTON}
                  >
                    Fechar
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      if (!user) return;
                      const now = Date.now();
                      const connectionKey = CONNECTOR_CONNECTION_KEYS.rdStationConversas;
                      setConnectorBusyKey('rdStationConversas');
                      try {
                        const db = getFirebaseDb();
                        const userRef = doc(db, 'users', user.uid);
                        await setDoc(
                          userRef,
                          {
                            connections: {
                              [connectionKey]: {
                                isActive: true,
                                provider: 'rdstation-webhook',
                                metadata: {
                                  authMode: 'webhook',
                                  webhookUrl: rdConversasWebhookUrl,
                                },
                                connectedAt: now,
                                updatedAt: now,
                              },
                            },
                            updatedAt: now,
                          },
                          { merge: true }
                        );
                        setConnectorStatus((prev) => {
                          const nextStatus = { ...prev, rdStationConversas: true };
                          const connectorsKey = `neuroads_dashboard_connectors_${user.uid}`;
                          window.localStorage.setItem(connectorsKey, JSON.stringify(nextStatus));
                          return nextStatus;
                        });
                        setConnectorFeedback('RD Station Conversas marcado como configurado via webhook.');
                        setConnectorError(null);
                        setIsRdConversasWebhookModalOpen(false);
                      } catch (error) {
                        console.warn('Falha ao salvar configuração do RD Station Conversas:', error);
                        setConnectorFeedback(null);
                        setConnectorError('Não foi possível salvar a configuração de webhook do RD Station Conversas.');
                      } finally {
                        setConnectorBusyKey(null);
                      }
                    }}
                    className={SETTINGS_PRIMARY_BUTTON}
                  >
                    Marcar como configurado
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showGoogleAdsSelectionModal && (() => {
        const selectedAccount = googleAdsAccounts.find((acc) => acc.id === selectedGoogleAdsAccountKey);
        return (
          <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-[#0F172A]/55 backdrop-blur-sm" />
            <section className={ACCOUNT_SELECTION_MODAL_PANEL_CLASSNAME} style={ACCOUNT_SELECTION_MODAL_PANEL_STYLE}>
              <p className={ACCOUNT_SELECTION_MODAL_TITLE_CLASSNAME}>Selecione a conta Google Ads para concluir</p>
              <p className={ACCOUNT_SELECTION_MODAL_DESCRIPTION_CLASSNAME}>
                A autenticação foi concluída. Escolha a conta para vincular ao Hub. Se a origem for MCC, você poderá informar o ID da conta cliente específica.
              </p>

              <div className="mt-4 flex flex-col gap-4">
                <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
                  <label className={ACCOUNT_SELECTION_MODAL_LABEL_CLASSNAME}>
                    Conta Google Ads
                    <select
                      value={selectedGoogleAdsAccountKey}
                      onChange={(event) => setSelectedGoogleAdsAccountKey(event.target.value)}
                      className={ACCOUNT_SELECTION_MODAL_SELECT_CLASSNAME}
                    >
                      {googleAdsAccounts.map((account) => {
                        const suffixMcc = account.loginCustomerId ? ` • via MCC ${account.loginCustomerId}` : '';
                        const type = account.isManager ? 'MCC' : 'Conta';
                        return (
                          <option key={account.id} value={account.id}>
                            [{type}] {account.name} ({account.accountId}){suffixMcc}
                          </option>
                        );
                      })}
                    </select>
                  </label>

                  <button
                    type="button"
                    onClick={() => void handleGoogleAdsAccountSelection()}
                    disabled={!selectedGoogleAdsAccountKey || googleAdsSelectionSaving}
                    className={ACCOUNT_SELECTION_MODAL_BUTTON_CLASSNAME}
                  >
                    {googleAdsSelectionSaving ? 'Vinculando...' : 'Vincular conta'}
                  </button>
                </div>

                {selectedAccount?.isManager && (
                  <div className="mt-2 flex flex-col gap-2 rounded-xl border border-[#FFD9BD]/30 bg-[#FFF5EC]/10 p-4">
                    <label className="flex flex-col gap-2 text-[18px] font-semibold text-white">
                      ID da Conta Cliente Específica (10 dígitos) *
                      <input
                        type="text"
                        value={customClientCustomerId}
                        onChange={(event) => setCustomClientCustomerId(event.target.value)}
                        placeholder="Ex: 123-456-7890"
                        className="h-11 rounded-xl border border-[#A7B8D8] bg-white px-3 text-[14px] font-semibold text-[#0F172A] outline-none focus:border-[#FF8A3D]"
                      />
                    </label>
                    <p className="text-[13px] text-[#C6D3E9]">
                      Como você selecionou uma conta administradora (MCC), informe o ID da conta cliente de 10 dígitos que deseja conectar para carregar as campanhas e métricas.
                    </p>
                  </div>
                )}
              </div>
            </section>
          </div>
        );
      })()}

      {showMetaAdsSelectionModal && (
        <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#0F172A]/55 backdrop-blur-sm" />
          <section className={ACCOUNT_SELECTION_MODAL_PANEL_CLASSNAME} style={ACCOUNT_SELECTION_MODAL_PANEL_STYLE}>
            <p className={ACCOUNT_SELECTION_MODAL_TITLE_CLASSNAME}>Selecione a conta Meta Ads para concluir</p>
            <p className={ACCOUNT_SELECTION_MODAL_DESCRIPTION_CLASSNAME}>
              A autenticação foi concluída. Agora escolha qual conta de anúncios deve ser vinculada ao Hub.
            </p>

            <div className="mt-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
              <label className={ACCOUNT_SELECTION_MODAL_LABEL_CLASSNAME}>
                Conta de anúncios
                <select
                  value={selectedMetaAdsAccountId}
                  onChange={(event) => setSelectedMetaAdsAccountId(event.target.value)}
                  className={ACCOUNT_SELECTION_MODAL_SELECT_CLASSNAME}
                >
                  {metaAdsAccounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.name} ({account.accountId}){account.currency ? ` • ${account.currency}` : ''}
                    </option>
                  ))}
                </select>
              </label>

              <button
                type="button"
                onClick={() => void handleMetaAdsAccountSelection()}
                disabled={!selectedMetaAdsAccountId || metaAdsSelectionSaving}
                className={ACCOUNT_SELECTION_MODAL_BUTTON_CLASSNAME}
              >
                {metaAdsSelectionSaving ? 'Vinculando...' : 'Vincular conta'}
              </button>
            </div>
          </section>
        </div>
      )}

      {showInstagramSelectionModal && (
        <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#0F172A]/55 backdrop-blur-sm" />
          <section className={ACCOUNT_SELECTION_MODAL_PANEL_CLASSNAME} style={ACCOUNT_SELECTION_MODAL_PANEL_STYLE}>
            <p className={ACCOUNT_SELECTION_MODAL_TITLE_CLASSNAME}>Selecione a conta Instagram para concluir</p>
            <p className={ACCOUNT_SELECTION_MODAL_DESCRIPTION_CLASSNAME}>
              A autenticação foi concluída. Agora escolha qual perfil comercial deve ser vinculado ao Hub.
            </p>

            <div className="mt-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
              <label className={ACCOUNT_SELECTION_MODAL_LABEL_CLASSNAME}>
                Conta Instagram
                <select
                  value={selectedInstagramAccountId}
                  onChange={(event) => setSelectedInstagramAccountId(event.target.value)}
                  className={ACCOUNT_SELECTION_MODAL_SELECT_CLASSNAME}
                >
                  {instagramAccounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.name}
                      {account.username ? ` (@${account.username})` : ''}
                      {account.pageName ? ` • Página: ${account.pageName}` : ''}
                    </option>
                  ))}
                </select>
              </label>

              <button
                type="button"
                onClick={() => void handleInstagramAccountSelection()}
                disabled={!selectedInstagramAccountId || instagramSelectionSaving}
                className={ACCOUNT_SELECTION_MODAL_BUTTON_CLASSNAME}
              >
                {instagramSelectionSaving ? 'Vinculando...' : 'Vincular conta'}
              </button>
            </div>
          </section>
        </div>
      )}

      {showGa4SelectionModal && (
        <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#0F172A]/55 backdrop-blur-sm" />
          <section className={ACCOUNT_SELECTION_MODAL_PANEL_CLASSNAME} style={ACCOUNT_SELECTION_MODAL_PANEL_STYLE}>
            <p className={ACCOUNT_SELECTION_MODAL_TITLE_CLASSNAME}>Selecione a conta GA4 para concluir</p>
            <p className={ACCOUNT_SELECTION_MODAL_DESCRIPTION_CLASSNAME}>
              A autenticação foi concluída. Agora escolha qual conta do Google Analytics deve ser vinculada ao Hub.
            </p>

            <div className="mt-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
              <label className={ACCOUNT_SELECTION_MODAL_LABEL_CLASSNAME}>
                Conta GA4
                <select
                  value={selectedGa4AccountId}
                  onChange={(event) => setSelectedGa4AccountId(event.target.value)}
                  className={ACCOUNT_SELECTION_MODAL_SELECT_CLASSNAME}
                >
                  {ga4Accounts.map((account) => (
                    <option key={account.id} value={account.accountId}>
                      {account.name} ({account.accountId})
                    </option>
                  ))}
                </select>
              </label>

              <button
                type="button"
                onClick={() => void handleGa4AccountSelection()}
                disabled={!selectedGa4AccountId || ga4SelectionSaving}
                className={ACCOUNT_SELECTION_MODAL_BUTTON_CLASSNAME}
              >
                {ga4SelectionSaving ? 'Vinculando...' : 'Vincular conta'}
              </button>
            </div>
          </section>
        </div>
      )}

      {showGoogleTrendsSelectionModal && (
        <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#0F172A]/55 backdrop-blur-sm" />
          <section className={ACCOUNT_SELECTION_MODAL_PANEL_CLASSNAME} style={ACCOUNT_SELECTION_MODAL_PANEL_STYLE}>
            <p className={ACCOUNT_SELECTION_MODAL_TITLE_CLASSNAME}>Selecione a conta Google para concluir o Google Trends</p>
            <p className={ACCOUNT_SELECTION_MODAL_DESCRIPTION_CLASSNAME}>
              A autenticação foi concluída. Agora escolha qual conta Google deve ser usada no canal Google Trends.
            </p>

            <div className="mt-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
              <label className="flex flex-col gap-2 text-[20px] font-semibold text-[#FFD6B6]">
                Conta Google
                <select
                  value={selectedGoogleTrendsAccountId}
                  onChange={(event) => setSelectedGoogleTrendsAccountId(event.target.value)}
                  className={ACCOUNT_SELECTION_MODAL_SELECT_CLASSNAME}
                >
                  {googleTrendsAccounts.map((account) => (
                    <option key={account.id} value={account.accountId}>
                      {account.name} ({account.accountId})
                    </option>
                  ))}
                </select>
              </label>

              <button
                type="button"
                onClick={() => void handleGoogleTrendsAccountSelection()}
                disabled={!selectedGoogleTrendsAccountId || googleTrendsSelectionSaving}
                className={ACCOUNT_SELECTION_MODAL_BUTTON_CLASSNAME}
              >
                {googleTrendsSelectionSaving ? 'Vinculando...' : 'Vincular conta'}
              </button>
            </div>
          </section>
        </div>
      )}

      {showHubSpotSelectionModal && (
        <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#0F172A]/55 backdrop-blur-sm" />
          <section className={ACCOUNT_SELECTION_MODAL_PANEL_CLASSNAME} style={ACCOUNT_SELECTION_MODAL_PANEL_STYLE}>
            <p className={ACCOUNT_SELECTION_MODAL_TITLE_CLASSNAME}>Selecione a conta HubSpot para concluir</p>
            <p className={ACCOUNT_SELECTION_MODAL_DESCRIPTION_CLASSNAME}>
              A autenticação OAuth foi concluída. Confirme qual conta HubSpot será vinculada ao canal CRM.
            </p>

            <div className="mt-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
              <label className={ACCOUNT_SELECTION_MODAL_LABEL_CLASSNAME}>
                Conta HubSpot
                <select
                  value={selectedHubspotAccountId}
                  onChange={(event) => setSelectedHubspotAccountId(event.target.value)}
                  className={ACCOUNT_SELECTION_MODAL_SELECT_CLASSNAME}
                >
                  {hubspotAccounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.name} ({account.accountId})
                    </option>
                  ))}
                </select>
              </label>

              <button
                type="button"
                onClick={() => void handleHubSpotAccountSelection()}
                disabled={!selectedHubspotAccountId || hubspotSelectionSaving}
                className={ACCOUNT_SELECTION_MODAL_BUTTON_CLASSNAME}
              >
                {hubspotSelectionSaving ? 'Vinculando...' : 'Vincular conta'}
              </button>
            </div>
          </section>
        </div>
      )}

      {/* MODAL 1: Detalhes do Alerta */}
      {selectedAlert && (
        <div className="fixed inset-0 z-[1250] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-[6px] transition-opacity duration-300" 
            onClick={() => setSelectedAlert(null)}
          />
          
          <section className="relative z-[1251] w-full max-w-2xl overflow-hidden rounded-[24px] border border-slate-200/80 bg-white p-6 md:p-8 shadow-[0_24px_50px_rgba(15,23,42,0.15)] animate-in fade-in zoom-in-95 duration-200">
            <div className={`absolute top-0 left-0 right-0 h-[4px] ${
              selectedAlert.priority === 'critico' ? 'bg-[#EF4444]' :
              selectedAlert.priority === 'alto' ? 'bg-[#FF7A00]' :
              selectedAlert.priority === 'medio' ? 'bg-[#F59E0B]' : 'bg-slate-400'
            }`} />

            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className={`inline-flex items-center rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${
                  selectedAlert.priority === 'critico' ? 'border-[#EF4444]/20 bg-[#EF4444]/8 text-[#EF4444]' :
                  selectedAlert.priority === 'alto' ? 'border-[#FF7A00]/20 bg-[#FF7A00]/8 text-[#FF7A00]' :
                  selectedAlert.priority === 'medio' ? 'border-[#F59E0B]/20 bg-[#F59E0B]/8 text-[#D97706]' :
                  'border-slate-400/20 bg-slate-500/8 text-slate-600'
                }`}>
                  {selectedAlert.badgeText}
                </span>
                <span className="text-[12px] text-slate-400 font-semibold">Emitido às {selectedAlert.time}</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAlert(null)}
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
                aria-label="Fechar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 flex items-start gap-4">
              <div className="mt-1 shrink-0">
                {selectedAlert.priority === 'critico' ? (
                  <TriangleAlert className={`h-7 w-7 ${selectedAlert.hasGlowOrange ? 'text-[#FF8A3D]' : 'text-[#EF4444]'}`} />
                ) : selectedAlert.priority === 'alto' ? (
                  <Link2 className="h-7 w-7 text-[#FF7A00]" />
                ) : selectedAlert.priority === 'medio' ? (
                  <TriangleAlert className="h-7 w-7 text-[#F59E0B]" />
                ) : (
                  <Info className="h-7 w-7 text-slate-500" />
                )}
              </div>
              <div>
                <h3 className="text-[20px] font-black text-slate-900 tracking-tight">{selectedAlert.title}</h3>
                <p className="mt-2 text-[15px] font-semibold text-slate-600 leading-relaxed">{selectedAlert.detailText}</p>
              </div>
            </div>

            <div className="mt-6 border-t border-slate-100 pt-6">
              <h4 className="text-[12px] font-extrabold uppercase tracking-wider text-slate-400">Insights de Resolução</h4>
              <ul className="mt-3 space-y-3">
                {selectedAlert.insights.map((insight, index) => (
                  <li key={index} className="flex items-start gap-3 text-[14px] text-slate-700">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#FF7A00]/10 text-[#FF7A00] text-[11px] font-bold mt-0.5">
                      {index + 1}
                    </span>
                    <span className="font-medium leading-relaxed">{insight}</span>
                  </li>
                ))}
              </ul>
            </div>

            {selectedAlert.actionLink && selectedAlert.status === 'active' && (
              <div className="mt-6 rounded-2xl border border-[#FF7A00]/25 bg-[#FF7A00]/5 p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <p className="text-[13px] font-bold text-slate-800">Link de Apoio Sugerido</p>
                  <p className="text-[12px] text-slate-600 mt-0.5">Use este link externo para realizar o diagnóstico direto.</p>
                </div>
                <a
                  href={selectedAlert.actionLink.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-[#FF7A00] px-4 text-[13px] font-extrabold text-white shadow-[0_4px_12px_rgba(255,122,0,0.2)] hover:bg-[#E66E00] hover:shadow-none transition"
                >
                  {selectedAlert.actionLink.label}
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            )}

            <div className="mt-8 flex flex-wrap items-center justify-end gap-3 border-t border-slate-100 pt-6">
              <button
                type="button"
                onClick={() => setSelectedAlert(null)}
                className="h-11 rounded-xl border border-slate-200 px-5 text-[14px] font-bold text-slate-600 hover:bg-slate-50 transition"
              >
                Voltar
              </button>

              {selectedAlert.status === 'active' && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      handleMarkAlertAsRead(selectedAlert.id);
                    }}
                    className="h-11 rounded-xl border border-[#FF7A00]/30 text-[#FF7A00] px-5 text-[14px] font-bold hover:bg-[#FF7A00]/5 transition"
                  >
                    Marcar como Lido
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleMarkAlertAsCompleted(selectedAlert.id);
                    }}
                    className="h-11 rounded-xl bg-[#10B981] px-5 text-[14px] font-extrabold text-white shadow-[0_4px_12px_rgba(16,185,129,0.2)] hover:bg-[#0E9F6E] transition flex items-center gap-1.5"
                  >
                    <Check className="h-4 w-4" />
                    Resolver Alerta
                  </button>
                </>
              )}
            </div>
          </section>
        </div>
      )}

      {/* MODAL 2: Lista Completa e Histórico de Alertas */}
      {isAllAlertsModalOpen && (
        <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-[6px] transition-opacity duration-300" 
            onClick={() => setIsAllAlertsModalOpen(false)}
          />
          
          <section className="relative z-[1201] w-full max-w-3xl overflow-hidden rounded-[24px] border border-slate-200/80 bg-white p-6 md:p-8 shadow-[0_24px_50px_rgba(15,23,42,0.15)] animate-in fade-in zoom-in-95 duration-200 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 shrink-0">
              <div>
                <h3 className="text-[20px] font-black text-slate-900 tracking-tight">Painel Central de Alertas</h3>
                <p className="text-[13px] text-slate-400 font-semibold mt-0.5">Gerenciamento e rastreamento de instabilidades</p>
              </div>
              <button
                type="button"
                onClick={() => setIsAllAlertsModalOpen(false)}
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
                aria-label="Fechar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 flex gap-1 rounded-xl bg-slate-100 p-1 shrink-0">
              <button
                type="button"
                onClick={() => setActiveAlertsTab('ativos')}
                className={`flex-1 py-2.5 rounded-lg text-[13px] font-bold transition flex items-center justify-center gap-2 ${
                  activeAlertsTab === 'ativos'
                    ? 'bg-white text-[#FF7A00] shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <TriangleAlert className="h-4 w-4" />
                Alertas Ativos ({activeAlerts.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveAlertsTab('historico')}
                className={`flex-1 py-2.5 rounded-lg text-[13px] font-bold transition flex items-center justify-center gap-2 ${
                  activeAlertsTab === 'historico'
                    ? 'bg-white text-[#FF7A00] shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Check className="h-4 w-4" />
                Histórico de Soluções ({historyAlerts.length})
              </button>
            </div>

            <div className="mt-5 overflow-y-auto pr-1 flex-1 min-h-[300px]">
              {activeAlertsTab === 'ativos' ? (
                <div className="space-y-3">
                  {activeAlerts.length === 0 ? (
                    <div className="py-12 text-center text-slate-400 text-[14px] font-semibold">
                      Parabéns! Não há nenhum alerta ativo em seu Connectors Hub.
                    </div>
                  ) : (
                    activeAlerts.map((alert) => {
                      let borderLeftColor = 'bg-slate-400';
                      let badgeStyle = 'border-slate-400/20 bg-slate-500/8 text-slate-600';
                      let icon = <Info className="h-5 w-5 text-slate-500 shrink-0 mt-0.5" />;

                      if (alert.priority === 'critico') {
                        borderLeftColor = alert.hasGlowOrange ? 'bg-[#FF8A3D]' : 'bg-[#EF4444]';
                        badgeStyle = alert.hasGlowOrange
                          ? 'border-[#FF8A3D]/20 bg-[#FF8A3D]/8 text-[#FF8A3D]'
                          : 'border-[#EF4444]/20 bg-[#EF4444]/8 text-[#EF4444]';
                        icon = <TriangleAlert className={`h-5 w-5 shrink-0 mt-0.5 ${alert.hasGlowOrange ? 'text-[#FF8A3D]' : 'text-[#EF4444]'}`} />;
                      } else if (alert.priority === 'alto') {
                        borderLeftColor = 'bg-[#FF7A00]';
                        badgeStyle = 'border-[#FF7A00]/20 bg-[#FF7A00]/8 text-[#FF7A00]';
                        icon = <Link2 className="h-5 w-5 text-[#FF7A00] shrink-0 mt-0.5" />;
                      } else if (alert.priority === 'medio') {
                        borderLeftColor = 'bg-[#F59E0B]';
                        badgeStyle = 'border-[#F59E0B]/20 bg-[#F59E0B]/8 text-[#D97706]';
                        icon = <TriangleAlert className="h-5 w-5 text-[#F59E0B] shrink-0 mt-0.5" />;
                      }

                      return (
                        <div
                          key={alert.id}
                          onClick={() => {
                            setSelectedAlert(alert);
                          }}
                          className="group relative overflow-hidden rounded-[16px] border border-slate-100/90 bg-slate-50/50 hover:bg-slate-50 pl-4 pr-3 py-4 shadow-sm transition hover:shadow cursor-pointer flex items-center justify-between"
                        >
                          <div className={`absolute top-0 bottom-0 left-0 w-[4.5px] ${borderLeftColor}`} />
                          <div className="flex items-start gap-3">
                            {icon}
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${badgeStyle}`}>
                                  {alert.badgeText}
                                </span>
                                {alert.hasGlowOrange && (
                                  <span className="inline-flex items-center rounded-full border border-amber-500/20 bg-amber-500/8 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-600">
                                    Glow Orange
                                  </span>
                                )}
                                <span className="text-[11px] text-slate-400 font-semibold">{alert.time}</span>
                              </div>
                              <h4 className="text-[14px] font-bold text-slate-800 mt-1">
                                {alert.title}
                              </h4>
                              <p className="text-[12px] text-slate-500 mt-0.5">
                                {alert.detailText}
                              </p>
                            </div>
                          </div>
                          <ArrowRight className="h-4 w-4 text-[#FF7A00] transition group-hover:translate-x-1 shrink-0 ml-2" />
                        </div>
                      );
                    })
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {historyAlerts.length === 0 ? (
                    <div className="py-12 text-center text-slate-400 text-[14px] font-semibold">
                      Não há histórico de alertas lidos ou concluídos.
                    </div>
                  ) : (
                    historyAlerts.map((alert) => {
                      const isCompleted = alert.status === 'completed';
                      const actionLabel = isCompleted ? 'Concluído' : 'Lido';
                      const solvedBy = alert.completedBy || 'Você';
                      
                      return (
                        <div
                          key={alert.id}
                          className="relative overflow-hidden rounded-[16px] border border-slate-100 bg-slate-50/20 pl-4 pr-4 py-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
                        >
                          <div className={`absolute top-0 bottom-0 left-0 w-[4.5px] ${isCompleted ? 'bg-[#10B981]' : 'bg-slate-300'}`} />
                          
                          <div className="flex items-start gap-3">
                            {isCompleted ? (
                              <Check className="h-5 w-5 text-[#10B981] shrink-0 mt-0.5" />
                            ) : (
                              <Info className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />
                            )}
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                                  isCompleted ? 'border-[#10B981]/20 bg-[#10B981]/8 text-[#10B981]' : 'border-slate-300 bg-slate-100 text-slate-500'
                                }`}>
                                  {actionLabel}
                                </span>
                                <span className="text-[11px] text-slate-400 font-semibold">{alert.time}</span>
                              </div>
                              <h4 className="text-[14px] font-bold text-slate-700 mt-1 line-through opacity-75">
                                {alert.title}
                              </h4>
                              <p className="text-[12px] text-slate-400 mt-0.5">
                                {alert.description}
                              </p>
                              <p className="text-[11px] mt-2 font-semibold text-slate-500 flex items-center gap-1.5 bg-slate-100/80 px-2 py-0.5 rounded-md w-max">
                                <span>Ação executada por:</span>
                                <span className={solvedBy.includes('Agente') ? 'text-[#10B981] font-bold' : 'text-[#FF7A00] font-bold'}>
                                  {solvedBy}
                                </span>
                              </p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => setSelectedAlert(alert)}
                            className="self-end md:self-center shrink-0 text-xs font-bold text-[#FF7A00] hover:underline"
                          >
                            Ver detalhes do histórico
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>

            <div className="mt-6 border-t border-slate-100 pt-4 shrink-0 flex justify-end">
              <button
                type="button"
                onClick={() => setIsAllAlertsModalOpen(false)}
                className="h-11 rounded-xl bg-slate-900 hover:bg-slate-800 px-6 text-[14px] font-extrabold text-white transition shadow-sm"
              >
                Fechar Painel
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
