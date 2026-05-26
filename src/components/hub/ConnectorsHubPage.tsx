'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { doc, setDoc } from 'firebase/firestore';
import {
  AlertCircle,
  ArrowUpRight,
  BookOpenText,
  CheckCircle2,
  Clock3,
  EllipsisVertical,
  ExternalLink,
  Info,
  Link2,
  Plus,
  RefreshCw,
  TriangleAlert,
} from 'lucide-react';
import Navbar from '../layout/Navbar';
import Footer from '../layout/Footer';
import LuccaHubSupportWidget from './LuccaHubSupportWidget';
import { useAuth } from '../../context/AuthContext';
import { getFirebaseDb } from '../../lib/firebase';
import { getHubLoginRedirect, getHubOnboardingRedirect, resolveHubAccessState } from '../../lib/hub-access';
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
type UiCategory = 'marketing' | 'vendas' | 'atendimento';

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
    category: 'vendas',
    lastSyncLabelWhenActive: 'Hoje, 08:45',
    isLiveConnector: true,
  },
  {
    id: 'rdStation',
    connectorKey: 'rdStation',
    title: 'RD Station CRM',
    description: 'Centralize contatos, empresas e estágios do pipeline para acelerar repasse e previsibilidade comercial.',
    category: 'vendas',
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
    category: 'atendimento',
    lastSyncLabelWhenActive: 'Nunca sincronizado',
    isLiveConnector: true,
  },
  {
    id: 'googleAds',
    connectorKey: 'googleAds',
    title: 'Google Ads',
    description: 'Acompanhe campanhas, custos e conversões para otimizar seus investimentos.',
    category: 'marketing',
    lastSyncLabelWhenActive: 'Hoje, 08:32',
    isLiveConnector: true,
  },
  {
    id: 'metaAds',
    connectorKey: 'metaAds',
    title: 'Meta Ads',
    description: 'Importe dados de anúncios do Facebook e Instagram para análises mais precisas.',
    category: 'marketing',
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
    category: 'atendimento',
    lastSyncLabelWhenActive: 'Nunca sincronizado',
    isLiveConnector: true,
  },
  {
    id: 'linkedinAds',
    connectorKey: 'linkedinAds',
    title: 'LinkedIn Ads',
    description: 'Meça campanhas B2B com foco em CPL qualificado e pipeline comercial.',
    category: 'marketing',
    lastSyncLabelWhenActive: 'Hoje, 07:58',
    isLiveConnector: true,
  },
  {
    id: 'instagram',
    connectorKey: 'instagram',
    title: 'Instagram',
    description: 'Consolide sinais de engajamento comercial e conteúdo com potencial de conversão.',
    category: 'atendimento',
    lastSyncLabelWhenActive: 'Nunca sincronizado',
    isLiveConnector: true,
  },
  {
    id: 'tiktok',
    connectorKey: 'tiktok',
    title: 'Tik Tok',
    description: 'Mapeie comportamento de audiência e tendências de formato para escalar criativos.',
    category: 'atendimento',
    lastSyncLabelWhenActive: 'Nunca sincronizado',
    isLiveConnector: true,
  },
  {
    id: 'tiktokAds',
    connectorKey: 'tiktokAds',
    title: 'Tik Tok Ads',
    description: 'Integre performance de mídia com custo por aquisição e receita incremental.',
    category: 'atendimento',
    lastSyncLabelWhenActive: 'Nunca sincronizado',
    isLiveConnector: true,
  },
];

const CATEGORY_LABELS: Record<UiCategory | 'todos', string> = {
  todos: 'Todos',
  marketing: 'Marketing',
  vendas: 'Vendas',
  atendimento: 'Atendimento',
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
  crm: 'hubspot',
  warehouse: 'bigquery',
};

const CONNECTOR_DOCS_URLS: Partial<Record<UiConnectorId, string>> = {
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

function getHealthTone(score: number): {
  label: string;
  description: string;
  textClass: string;
  panelClass: string;
  iconClass: string;
} {
  if (score >= 90) {
    return {
      label: 'Excelente',
      description: 'Tudo funcionando como esperado.',
      textClass: 'text-[#12B76A]',
      panelClass: 'border border-[#CDEEDB] bg-[#F1FCF6]',
      iconClass: 'text-[#12B76A]',
    };
  }
  if (score >= 75) {
    return {
      label: 'Bom',
      description: 'Integrações estáveis com pequenos ajustes pendentes.',
      textClass: 'text-[#2D6CDF]',
      panelClass: 'border border-[#D3E3FF] bg-[#F4F8FF]',
      iconClass: 'text-[#2D6CDF]',
    };
  }
  if (score >= 50) {
    return {
      label: 'Atenção',
      description: 'Parte dos dados ainda depende de conectores pendentes.',
      textClass: 'text-[#F59E0B]',
      panelClass: 'border border-[#FDE7C2] bg-[#FFFAF0]',
      iconClass: 'text-[#F59E0B]',
    };
  }
  return {
    label: 'Crítico',
    description: 'Risco alto de dados incompletos no dashboard.',
    textClass: 'text-[#EF4444]',
    panelClass: '',
    iconClass: 'text-[#EF4444]',
  };
}

function HealthGauge({ value }: { value: number }) {
  const boundedValue = Math.max(0, Math.min(value, 100));
  const cx = 120;
  const cy = 118;
  const radius = 88;
  const strokeWidth = 16;
  const halfCircumference = Math.PI * radius;
  const dashOffset = halfCircumference * (1 - boundedValue / 100);

  const theta = Math.PI - (Math.PI * boundedValue) / 100;
  const indicatorX = cx + radius * Math.cos(theta);
  const indicatorY = cy - radius * Math.sin(theta);
  const trackColor = '#DDE3F2';
  const progressGradientId = 'connectorGaugeGradient';
  const indicatorColor = '#F59E0B';
  const valueColorClass = 'text-[#0F172A]';
  const subtitleColorClass = 'text-[#475569]';

  return (
    <div className="relative mt-6 flex flex-col items-center">
      <svg
        viewBox="0 0 240 140"
        className="h-[140px] w-[240px]"
        aria-label={`Saúde ${boundedValue} de 100`}
        role="img"
      >
        <path
          d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        <path
          d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
          fill="none"
          stroke={`url(#${progressGradientId})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={halfCircumference}
          strokeDashoffset={dashOffset}
        />
        <defs>
          <linearGradient id={progressGradientId} x1="32" y1="0" x2="208" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FF7A00" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>
        </defs>
        <circle cx={indicatorX} cy={indicatorY} r={7} fill={indicatorColor} />
      </svg>
      <p className={`-mt-5 text-[64px] font-light leading-none ${valueColorClass}`}>{boundedValue}</p>
      <p className={`text-[34px] leading-none ${subtitleColorClass}`}>de 100</p>
    </div>
  );
}

function BrandTile({ id }: { id: UiConnectorId }) {
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
  const [openConnectorMenuId, setOpenConnectorMenuId] = useState<UiConnectorId | null>(null);
  const [activeFilter, setActiveFilter] = useState<UiCategory | 'todos'>('todos');
  const [sortMode, setSortMode] = useState<'az'>('az');

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

  const clearRdCrmConfigModal = useCallback(() => {
    setIsRdCrmConfigModalOpen(false);
    setRdCrmAccessTokenInput('');
    setRdCrmRefreshTokenInput('');
    setRdCrmWebhookIdInput('');
    setRdCrmSaving(false);
  }, []);

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
                accountId: payload.accountId ?? null,
                loginCustomerId: payload.loginCustomerId ?? null,
                accessToken: payload.accessToken,
                refreshToken: payload.refreshToken ?? null,
                expiresIn: Number.isFinite(payload.expiresIn || NaN) ? payload.expiresIn : null,
                expiresAt: Number.isFinite(payload.expiresIn || NaN) ? now + Number(payload.expiresIn) * 1000 : null,
                metadata: payload.metadata ?? null,
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
      clearConnectorQueryParams();
      return;
    }

    const pendingPayload: PendingOAuthConnection = {
      connector: normalizedConnectorParam,
      provider: normalizedProvider,
      accessToken: normalizedAccessToken,
      refreshToken: normalizedRefreshToken ?? null,
      expiresIn: Number.isFinite(expiresIn || NaN) ? Number(expiresIn) : null,
      accountId: accountId ?? null,
      metadata: null,
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

    const upsertConnection = async () => {
      await persistOAuthConnection(pendingPayload, 'Conector autenticado e salvo com sucesso.');
      clearPendingMetaAdsSelection();
      clearPendingGoogleAdsSelection();
      clearPendingInstagramSelection();
      clearPendingGa4Selection();
      clearPendingGoogleTrendsSelection();
      clearConnectorQueryParams();
    };

    void upsertConnection();
  }, [
    clearPendingGa4Selection,
    clearPendingGoogleAdsSelection,
    clearPendingGoogleTrendsSelection,
    clearPendingInstagramSelection,
    clearPendingMetaAdsSelection,
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
      vendas: CONNECTOR_ITEMS.filter((item) => item.category === 'vendas').length,
      atendimento: CONNECTOR_ITEMS.filter((item) => item.category === 'atendimento').length,
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

  const healthTone = useMemo(() => getHealthTone(healthScore), [healthScore]);
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

    setGoogleAdsSelectionSaving(true);
    setConnectorBusyKey('googleAds');

    const persisted = await persistOAuthConnection(
      {
        ...pendingGoogleAdsConnection,
        accountId: selectedAccount.accountId,
        loginCustomerId: selectedAccount.loginCustomerId,
        metadata: {
          accountName: selectedAccount.name,
          isManager: selectedAccount.isManager,
          managerName: selectedAccount.managerName,
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

      <div className="relative flex-grow overflow-hidden pt-20 md:pt-28">
        <div
          className="pointer-events-none absolute inset-0 bg-top bg-repeat-y bg-[length:100%_auto]"
          style={{ backgroundImage: "url('/images/background_hub_repeat_flow.png')" }}
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-44 bg-gradient-to-b from-transparent via-[#f7f8fa]/75 to-bg-main" />

        <section className="relative z-10 mx-auto w-full max-w-[1536px] px-4 pb-10 font-sans md:px-6 md:pb-14">
          <div className="rounded-[24px] bg-transparent p-4 md:p-6">
            <header className="rounded-[28px] border border-[#0A2A55] bg-[linear-gradient(120deg,#041A44_0%,#06265B_52%,#031739_100%)] px-5 py-6 shadow-[0_18px_44px_rgba(2,12,36,0.34)] md:px-8 md:py-8">
              <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-[#FF7A00]">
                    Gestão de Conectores
                  </p>
                  <h1 className="mt-2 text-[30px] leading-[1.1] font-black tracking-tight text-white sm:text-[34px] md:text-[36px]">
                    Conectores
                  </h1>
                  <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[#C6D3E9] md:text-lg">
                    Seu ecossistema conectado com dados reais para decisões mais rápidas e escala previsível.
                  </p>
                  <p className="mt-2 text-sm font-semibold text-[#FF7A00]">
                    Menos ruptura entre canais, mais performance orientada por dados reais.
                  </p>
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-3 md:justify-end">
                  <Link
                    href="/conteudos/materias-de-apoio"
                    className="inline-flex h-12 items-center gap-2 rounded-[14px] border border-[#365B8E] bg-[#0A2A55] px-5 text-[14px] font-black tracking-wide text-white transition hover:bg-[#10366D]"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Ver documentação
                  </Link>
                  <button
                    type="button"
                    className="inline-flex h-12 items-center gap-2 rounded-[14px] bg-[#FF7A00] px-5 text-[14px] font-black tracking-wide text-white shadow-[0_12px_24px_rgba(255,122,0,0.35)] transition hover:bg-[#E56B00]"
                  >
                    <Plus className="h-4 w-4" />
                    Adicionar conector
                  </button>
                </div>
              </div>
            </header>

            <div className="mt-5 grid grid-cols-1 gap-4 xl:grid-cols-[1fr_360px]">
              <div>
                <div className="rounded-2xl border border-[#DDE3F2] bg-white p-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      {(['todos', 'marketing', 'vendas', 'atendimento'] as const).map((filter) => {
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

                    <label className="inline-flex items-center gap-2 rounded-xl border border-[#DDE3F2] bg-white px-3 py-2 text-[13px] text-[#475569]">
                      <span>Ordenar:</span>
                      <select
                        value={sortMode}
                        onChange={(event) => setSortMode(event.target.value as 'az')}
                        className="bg-transparent text-[13px] font-semibold text-[#0F172A] outline-none"
                      >
                        <option value="az">A-Z</option>
                      </select>
                    </label>
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
                <section className="overflow-hidden rounded-2xl border border-[#DDE3F2] bg-white shadow-[0_10px_20px_rgba(15,23,42,0.08)]">
                  <header className="bg-[#123A6B] px-5 py-3 text-center">
                    <h3 className="text-[25px] leading-[1.1] font-black tracking-tight text-white">Saúde das Integrações</h3>
                  </header>

                  <div className="px-5 pb-5">
                    <HealthGauge value={healthScore} />

                    <div className={`mt-5 rounded-xl p-3 text-center ${healthTone.panelClass}`}>
                      <p className={`inline-flex items-center gap-2 text-[26px] font-black ${healthTone.textClass}`}>
                        <CheckCircle2 className={`h-5 w-5 ${healthTone.iconClass}`} />
                        {healthTone.label}
                      </p>
                      <p className="mt-1 text-[16px] text-[#475569]">{healthTone.description}</p>
                    </div>

                    <div className="mt-4 border-t border-[#E2E8F0] pt-4">
                      <p className="inline-flex items-center gap-2 text-[14px] font-semibold text-[#64748B]">
                        <Clock3 className="h-4 w-4" />
                        Última sincronização geral
                      </p>
                      <p className="mt-1 text-[24px] font-black text-[#0F172A]">{formatLastSyncLabel(latestSyncTimestamp)}</p>
                    </div>
                  </div>
                </section>

                <section className="overflow-hidden rounded-2xl border border-[#DDE3F2] bg-white shadow-[0_10px_20px_rgba(15,23,42,0.08)]">
                  <header className="bg-[#123A6B] px-5 py-3 text-center">
                    <h3 className="text-[25px] leading-[1.1] font-black tracking-tight text-white">Alertas importantes</h3>
                  </header>

                  <article className="mt-4 px-5">
                    <p className="inline-flex items-center gap-2 text-[16px] font-black text-[#FFAB4D]">
                      <TriangleAlert className="h-4 w-4 text-[#FFAB4D]" />
                      Taxa de erro acima do ideal
                    </p>
                    <p className="mt-1 text-[14px] text-[#475569]">LinkedIn Ads</p>
                    <p className="text-[14px] text-[#475569]">Erro em 1,7% das sincronizações das últimas 24h.</p>
                    <button type="button" className="mt-3 inline-flex items-center gap-2 text-[14px] font-bold text-[#E56B00]">
                      Ver detalhes <ArrowUpRight className="h-4 w-4" />
                    </button>
                  </article>

                  <div className="mx-5 my-4 h-px bg-[#E2E8F0]" aria-hidden />

                  <article className="px-5">
                    <p className="inline-flex items-center gap-2 text-[16px] font-black text-[#2D6CDF]">
                      <AlertCircle className="h-4 w-4 text-[#2D6CDF]" />
                      Conector pendente
                    </p>
                    <p className="mt-1 text-[14px] text-[#475569]">RD Station ainda está em fase de implantação.</p>
                    <button type="button" className="mt-3 inline-flex items-center gap-2 text-[14px] font-bold text-[#E56B00]">
                      Ver plano de ativação <ArrowUpRight className="h-4 w-4" />
                    </button>
                  </article>

                  <button
                    type="button"
                    className="mx-5 my-5 inline-flex h-12 w-[calc(100%-40px)] items-center justify-center gap-2 rounded-xl border border-[#FFD9BD] bg-white text-[14px] font-black tracking-wide text-[#FF7A00] transition hover:bg-[#FFF5EC]"
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

      {isRdCrmConfigModalOpen && (
        <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#0F172A]/55 backdrop-blur-sm" />
          <section className="relative z-[1201] w-full max-w-3xl rounded-2xl border border-[#BFDBFE] bg-[#EFF6FF] p-5 shadow-[0_24px_48px_rgba(15,23,42,0.28)] md:p-6">
            <p className="text-[22px] font-black text-[#1E40AF]">Configurar RD Station CRM (API v2)</p>
            <p className="mt-2 text-[15px] text-[#1E3A8A]">
              Conforme a documentação oficial do CRM v2, a autenticação é via OAuth2 Bearer Token. Informe o Access Token
              ativo e, se disponível, o Refresh Token para renovação operacional.
            </p>

            <div className="mt-4 rounded-xl border border-[#93C5FD] bg-white p-3">
              <p className="text-[12px] font-bold uppercase tracking-wide text-[#1D4ED8]">Webhook receptor recomendado</p>
              <p className="mt-1 break-all text-[14px] font-semibold text-[#1E3A8A]">{rdCrmWebhookUrl}</p>
            </div>

            <div className="mt-5 grid gap-3">
              <label className="flex flex-col gap-2 text-[14px] font-semibold text-[#1E3A8A]">
                Access Token (Bearer) *
                <input
                  type="password"
                  value={rdCrmAccessTokenInput}
                  onChange={(event) => setRdCrmAccessTokenInput(event.target.value)}
                  className="h-11 rounded-xl border border-[#93C5FD] bg-white px-3 text-[14px] font-semibold text-[#1E3A8A] outline-none focus:border-[#3B82F6]"
                  placeholder="Cole o access_token OAuth2 do RD Station CRM"
                />
              </label>
              <label className="flex flex-col gap-2 text-[14px] font-semibold text-[#1E3A8A]">
                Refresh Token (opcional)
                <input
                  type="password"
                  value={rdCrmRefreshTokenInput}
                  onChange={(event) => setRdCrmRefreshTokenInput(event.target.value)}
                  className="h-11 rounded-xl border border-[#93C5FD] bg-white px-3 text-[14px] font-semibold text-[#1E3A8A] outline-none focus:border-[#3B82F6]"
                  placeholder="Cole o refresh_token para rotação de credenciais"
                />
              </label>
              <label className="flex flex-col gap-2 text-[14px] font-semibold text-[#1E3A8A]">
                ID do webhook no RD (opcional)
                <input
                  type="text"
                  value={rdCrmWebhookIdInput}
                  onChange={(event) => setRdCrmWebhookIdInput(event.target.value)}
                  className="h-11 rounded-xl border border-[#93C5FD] bg-white px-3 text-[14px] font-semibold text-[#1E3A8A] outline-none focus:border-[#3B82F6]"
                  placeholder="Ex.: UUID retornado em /crm/v2/webhooks"
                />
              </label>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-end gap-2">
              <button
                type="button"
                onClick={clearRdCrmConfigModal}
                className="inline-flex h-11 items-center justify-center rounded-xl border border-[#93C5FD] bg-white px-5 text-[14px] font-bold text-[#1E3A8A] transition hover:bg-[#E8F1FF]"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => void handleSaveRdCrmConfig()}
                disabled={rdCrmSaving}
                className="inline-flex h-11 items-center justify-center rounded-xl bg-[#1D4ED8] px-5 text-[14px] font-black text-white transition hover:bg-[#1E40AF] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {rdCrmSaving ? 'Salvando...' : 'Salvar configuração CRM'}
              </button>
            </div>
          </section>
        </div>
      )}

      {rdTokenModalConnector && (
        <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#0F172A]/55 backdrop-blur-sm" />
          <section className="relative z-[1201] w-full max-w-3xl rounded-2xl border border-[#FDBA74] bg-[#FFF7ED] p-5 shadow-[0_24px_48px_rgba(15,23,42,0.28)] md:p-6">
            <p className="text-[22px] font-black text-[#9A3412]">Conectar {rdTokenModalTitle} via tokens</p>
            <p className="mt-2 text-[16px] text-[#7C2D12]">
              Informe Token Público e Token Privado para manter a autenticação ativa no Hub. Esses dados serão salvos no
              perfil de integração para sincronizações futuras.
            </p>

            <div className="mt-5 grid gap-3">
              <label className="flex flex-col gap-2 text-[14px] font-semibold text-[#7C2D12]">
                Token Público
                <input
                  type="text"
                  value={rdPublicTokenInput}
                  onChange={(event) => setRdPublicTokenInput(event.target.value)}
                  className="h-11 rounded-xl border border-[#FDBA74] bg-white px-3 text-[14px] font-semibold text-[#7C2D12] outline-none focus:border-[#F97316]"
                  placeholder="Cole o Token Público do RD Station"
                />
              </label>
              <label className="flex flex-col gap-2 text-[14px] font-semibold text-[#7C2D12]">
                Token Privado
                <input
                  type="password"
                  value={rdPrivateTokenInput}
                  onChange={(event) => setRdPrivateTokenInput(event.target.value)}
                  className="h-11 rounded-xl border border-[#FDBA74] bg-white px-3 text-[14px] font-semibold text-[#7C2D12] outline-none focus:border-[#F97316]"
                  placeholder="Cole o Token Privado do RD Station"
                />
              </label>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-end gap-2">
              <button
                type="button"
                onClick={clearRdTokenModal}
                className="inline-flex h-11 items-center justify-center rounded-xl border border-[#FDBA74] bg-white px-5 text-[14px] font-bold text-[#9A3412] transition hover:bg-[#FFF1E5]"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => void handleSaveRdTokenConnection()}
                disabled={rdTokenSaving}
                className="inline-flex h-11 items-center justify-center rounded-xl bg-[#FF7A00] px-5 text-[14px] font-black text-white transition hover:bg-[#E66E00] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {rdTokenSaving ? 'Salvando...' : 'Salvar integração'}
              </button>
            </div>
          </section>
        </div>
      )}

      {isRdConversasWebhookModalOpen && (
        <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#0F172A]/55 backdrop-blur-sm" />
          <section className="relative z-[1201] w-full max-w-4xl rounded-2xl border border-[#BFDBFE] bg-[#EFF6FF] p-5 shadow-[0_24px_48px_rgba(15,23,42,0.28)] md:p-6">
            <p className="text-[22px] font-black text-[#1E40AF]">RD Station Conversas via webhook</p>
            <p className="mt-2 text-[15px] text-[#1E3A8A]">
              Configure o webhook no RD Station Conversas e depois marque como configurado para ativar o canal no Hub.
            </p>
            <ol className="mt-4 list-decimal space-y-2 pl-5 text-[14px] text-[#1E3A8A]">
              <li>Acesse o painel do RD Station Conversas e abra as integrações/webhooks do workspace.</li>
              <li>Crie um webhook com método `POST` apontando para a URL abaixo.</li>
              <li>Garanta resposta HTTP `2xx` no teste de validação do RD.</li>
              <li>Defina um segredo de assinatura no RD e guarde esse valor em ambiente seguro (recomendado).</li>
            </ol>
            <div className="mt-4 rounded-xl border border-[#93C5FD] bg-white p-3">
              <p className="text-[12px] font-bold uppercase tracking-wide text-[#1D4ED8]">URL de webhook (NeuroAds)</p>
              <p className="mt-1 break-all text-[14px] font-semibold text-[#1E3A8A]">{rdConversasWebhookUrl}</p>
            </div>
            <div className="mt-5 flex flex-wrap items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsRdConversasWebhookModalOpen(false)}
                className="inline-flex h-11 items-center justify-center rounded-xl border border-[#93C5FD] bg-white px-5 text-[14px] font-bold text-[#1E3A8A] transition hover:bg-[#E8F1FF]"
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
                className="inline-flex h-11 items-center justify-center rounded-xl bg-[#1D4ED8] px-5 text-[14px] font-black text-white transition hover:bg-[#1E40AF]"
              >
                Marcar como configurado
              </button>
            </div>
          </section>
        </div>
      )}

      {showGoogleAdsSelectionModal && (
        <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#0F172A]/55 backdrop-blur-sm" />
          <section className="relative z-[1201] w-full max-w-5xl rounded-2xl border border-[#FCD34D] bg-[#FFFBEB] p-5 shadow-[0_24px_48px_rgba(15,23,42,0.28)] md:p-6">
            <p className="text-[22px] font-black text-[#92400E]">Selecione a conta Google Ads para concluir</p>
            <p className="mt-2 text-[18px] text-[#A16207]">
              A autenticação foi concluída. Escolha a conta para vincular ao Hub. Se a origem for MCC, o vínculo já
              será salvo com o Login Customer ID correto.
            </p>

            <div className="mt-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
              <label className="flex flex-col gap-2 text-[20px] font-semibold text-[#92400E]">
                Conta Google Ads
                <select
                  value={selectedGoogleAdsAccountKey}
                  onChange={(event) => setSelectedGoogleAdsAccountKey(event.target.value)}
                  className="h-11 rounded-xl border border-[#FCD34D] bg-white px-3 text-[14px] font-semibold text-[#78350F] outline-none focus:border-[#F59E0B]"
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
                className="inline-flex h-11 items-center justify-center rounded-xl bg-[#F59E0B] px-5 text-[14px] font-black text-white transition hover:bg-[#D97706] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {googleAdsSelectionSaving ? 'Vinculando...' : 'Vincular conta'}
              </button>
            </div>
          </section>
        </div>
      )}

      {showMetaAdsSelectionModal && (
        <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#0F172A]/55 backdrop-blur-sm" />
          <section className="relative z-[1201] w-full max-w-5xl rounded-2xl border border-[#FED7AA] bg-[#FFF7ED] p-5 shadow-[0_24px_48px_rgba(15,23,42,0.28)] md:p-6">
            <p className="text-[22px] font-black text-[#9A3412]">Selecione a conta Meta Ads para concluir</p>
            <p className="mt-2 text-[18px] text-[#7C2D12]">
              A autenticação foi concluída. Agora escolha qual conta de anúncios deve ser vinculada ao Hub.
            </p>

            <div className="mt-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
              <label className="flex flex-col gap-2 text-[20px] font-semibold text-[#7C2D12]">
                Conta de anúncios
                <select
                  value={selectedMetaAdsAccountId}
                  onChange={(event) => setSelectedMetaAdsAccountId(event.target.value)}
                  className="h-11 rounded-xl border border-[#FDBA74] bg-white px-3 text-[14px] font-semibold text-[#7C2D12] outline-none focus:border-[#F97316]"
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
                className="inline-flex h-11 items-center justify-center rounded-xl bg-[#FF7A00] px-5 text-[14px] font-black text-white transition hover:bg-[#E66E00] disabled:cursor-not-allowed disabled:opacity-60"
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
          <section className="relative z-[1201] w-full max-w-5xl rounded-2xl border border-[#C7D2FE] bg-[#EEF2FF] p-5 shadow-[0_24px_48px_rgba(15,23,42,0.28)] md:p-6">
            <p className="text-[22px] font-black text-[#3730A3]">Selecione a conta Instagram para concluir</p>
            <p className="mt-2 text-[18px] text-[#4338CA]">
              A autenticação foi concluída. Agora escolha qual perfil comercial deve ser vinculado ao Hub.
            </p>

            <div className="mt-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
              <label className="flex flex-col gap-2 text-[20px] font-semibold text-[#3730A3]">
                Conta Instagram
                <select
                  value={selectedInstagramAccountId}
                  onChange={(event) => setSelectedInstagramAccountId(event.target.value)}
                  className="h-11 rounded-xl border border-[#A5B4FC] bg-white px-3 text-[14px] font-semibold text-[#312E81] outline-none focus:border-[#4F46E5]"
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
                className="inline-flex h-11 items-center justify-center rounded-xl bg-[#4F46E5] px-5 text-[14px] font-black text-white transition hover:bg-[#4338CA] disabled:cursor-not-allowed disabled:opacity-60"
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
          <section className="relative z-[1201] w-full max-w-5xl rounded-2xl border border-[#BFDBFE] bg-[#EFF6FF] p-5 shadow-[0_24px_48px_rgba(15,23,42,0.28)] md:p-6">
            <p className="text-[22px] font-black text-[#1D4ED8]">Selecione a conta GA4 para concluir</p>
            <p className="mt-2 text-[18px] text-[#1E40AF]">
              A autenticação foi concluída. Agora escolha qual conta do Google Analytics deve ser vinculada ao Hub.
            </p>

            <div className="mt-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
              <label className="flex flex-col gap-2 text-[20px] font-semibold text-[#1E40AF]">
                Conta GA4
                <select
                  value={selectedGa4AccountId}
                  onChange={(event) => setSelectedGa4AccountId(event.target.value)}
                  className="h-11 rounded-xl border border-[#93C5FD] bg-white px-3 text-[14px] font-semibold text-[#1E3A8A] outline-none focus:border-[#3B82F6]"
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
                className="inline-flex h-11 items-center justify-center rounded-xl bg-[#1D4ED8] px-5 text-[14px] font-black text-white transition hover:bg-[#1E40AF] disabled:cursor-not-allowed disabled:opacity-60"
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
          <section className="relative z-[1201] w-full max-w-5xl rounded-2xl border border-[#86EFAC] bg-[#F0FDF4] p-5 shadow-[0_24px_48px_rgba(15,23,42,0.28)] md:p-6">
            <p className="text-[22px] font-black text-[#166534]">Selecione a conta Google para concluir o Google Trends</p>
            <p className="mt-2 text-[18px] text-[#166534]">
              A autenticação foi concluída. Agora escolha qual conta Google deve ser usada no canal Google Trends.
            </p>

            <div className="mt-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
              <label className="flex flex-col gap-2 text-[20px] font-semibold text-[#166534]">
                Conta Google
                <select
                  value={selectedGoogleTrendsAccountId}
                  onChange={(event) => setSelectedGoogleTrendsAccountId(event.target.value)}
                  className="h-11 rounded-xl border border-[#86EFAC] bg-white px-3 text-[14px] font-semibold text-[#14532D] outline-none focus:border-[#22C55E]"
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
                className="inline-flex h-11 items-center justify-center rounded-xl bg-[#16A34A] px-5 text-[14px] font-black text-white transition hover:bg-[#15803D] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {googleTrendsSelectionSaving ? 'Vinculando...' : 'Vincular conta'}
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
