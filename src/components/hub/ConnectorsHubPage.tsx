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
  Copy,
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
  impactLabel: string;
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

type PendingOAuthConnection = {
  connector: ConnectorKey;
  provider: string | null;
  accessToken: string;
  refreshToken: string | null;
  expiresIn: number | null;
  accountId: string | null;
};

const CONNECTOR_ITEMS: UiConnector[] = [
  {
    id: 'crm',
    connectorKey: 'crm',
    title: 'HubSpot',
    description: 'Sincronize leads, empresas e oportunidades para uma visão completa do funil.',
    category: 'vendas',
    impactLabel: 'R$ 1,28 mi / mês',
    lastSyncLabelWhenActive: 'Hoje, 08:45',
    isLiveConnector: true,
  },
  {
    id: 'rdStation',
    title: 'RD Station CRM',
    description: 'Centralize contatos, empresas e estágios do pipeline para acelerar repasse e previsibilidade comercial.',
    category: 'vendas',
    impactLabel: 'R$ 640 mil / mês',
    lastSyncLabelWhenActive: 'Nunca sincronizado',
    isLiveConnector: false,
  },
  {
    id: 'rdStationMarketing',
    title: 'RD Station Marketing',
    description: 'Conecte formulários, campanhas e automações para elevar a qualificação de leads com dados reais.',
    category: 'marketing',
    impactLabel: 'R$ 520 mil / mês',
    lastSyncLabelWhenActive: 'Nunca sincronizado',
    isLiveConnector: false,
  },
  {
    id: 'rdStationConversas',
    title: 'RD Station Conversas',
    description: 'Integre WhatsApp e canais de atendimento para dar escala ao time comercial sem perder contexto.',
    category: 'atendimento',
    impactLabel: 'R$ 290 mil / mês',
    lastSyncLabelWhenActive: 'Nunca sincronizado',
    isLiveConnector: false,
  },
  {
    id: 'googleAds',
    connectorKey: 'googleAds',
    title: 'Google Ads',
    description: 'Acompanhe campanhas, custos e conversões para otimizar seus investimentos.',
    category: 'marketing',
    impactLabel: 'R$ 980 mil / mês',
    lastSyncLabelWhenActive: 'Hoje, 08:32',
    isLiveConnector: true,
  },
  {
    id: 'metaAds',
    connectorKey: 'metaAds',
    title: 'Meta Ads',
    description: 'Importe dados de anúncios do Facebook e Instagram para análises mais precisas.',
    category: 'marketing',
    impactLabel: 'R$ 1,45 mi / mês',
    lastSyncLabelWhenActive: 'Hoje, 08:15',
    isLiveConnector: true,
  },
  {
    id: 'ga4',
    connectorKey: 'ga4',
    title: 'GA4',
    description: 'Monitore eventos, sessões e conversões para leitura real de funil e receita.',
    category: 'marketing',
    impactLabel: 'R$ 890 mil / mês',
    lastSyncLabelWhenActive: 'Hoje, 08:26',
    isLiveConnector: true,
  },
  {
    id: 'googleTrends',
    title: 'Google Trends',
    description: 'Capte tendências de busca para ajustar pauta, criativos e oferta com antecedência.',
    category: 'marketing',
    impactLabel: 'R$ 310 mil / mês',
    lastSyncLabelWhenActive: 'Nunca sincronizado',
    isLiveConnector: false,
  },
  {
    id: 'linkedinPage',
    title: 'LinkedIn Page',
    description: 'Acompanhe conteúdo orgânico, crescimento de audiência e sinais de intenção B2B.',
    category: 'atendimento',
    impactLabel: 'R$ 220 mil / mês',
    lastSyncLabelWhenActive: 'Nunca sincronizado',
    isLiveConnector: false,
  },
  {
    id: 'linkedinAds',
    connectorKey: 'linkedinAds',
    title: 'LinkedIn Ads',
    description: 'Meça campanhas B2B com foco em CPL qualificado e pipeline comercial.',
    category: 'marketing',
    impactLabel: 'R$ 760 mil / mês',
    lastSyncLabelWhenActive: 'Hoje, 07:58',
    isLiveConnector: true,
  },
  {
    id: 'instagram',
    connectorKey: 'instagram',
    title: 'Instagram',
    description: 'Consolide sinais de engajamento comercial e conteúdo com potencial de conversão.',
    category: 'atendimento',
    impactLabel: 'R$ 420 mil / mês',
    lastSyncLabelWhenActive: 'Nunca sincronizado',
    isLiveConnector: true,
  },
  {
    id: 'tiktok',
    title: 'Tik Tok',
    description: 'Mapeie comportamento de audiência e tendências de formato para escalar criativos.',
    category: 'atendimento',
    impactLabel: 'R$ 270 mil / mês',
    lastSyncLabelWhenActive: 'Nunca sincronizado',
    isLiveConnector: false,
  },
  {
    id: 'tiktokAds',
    title: 'Tik Tok Ads',
    description: 'Integre performance de mídia com custo por aquisição e receita incremental.',
    category: 'atendimento',
    impactLabel: 'R$ 530 mil / mês',
    lastSyncLabelWhenActive: 'Nunca sincronizado',
    isLiveConnector: false,
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
  metaAds: 'meta',
  instagram: 'meta',
  linkedinAds: 'linkedin',
  ga4: 'google',
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
  const [pendingMetaAdsConnection, setPendingMetaAdsConnection] = useState<PendingOAuthConnection | null>(null);
  const [metaAdsAccounts, setMetaAdsAccounts] = useState<MetaAdsAccountOption[]>([]);
  const [selectedMetaAdsAccountId, setSelectedMetaAdsAccountId] = useState('');
  const [metaAdsSelectionSaving, setMetaAdsSelectionSaving] = useState(false);
  const [pendingInstagramConnection, setPendingInstagramConnection] = useState<PendingOAuthConnection | null>(null);
  const [instagramAccounts, setInstagramAccounts] = useState<InstagramAccountOption[]>([]);
  const [selectedInstagramAccountId, setSelectedInstagramAccountId] = useState('');
  const [instagramSelectionSaving, setInstagramSelectionSaving] = useState(false);
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

  const clearPendingInstagramSelection = useCallback(() => {
    setPendingInstagramConnection(null);
    setInstagramAccounts([]);
    setSelectedInstagramAccountId('');
    setInstagramSelectionSaving(false);
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
                accessToken: payload.accessToken,
                refreshToken: payload.refreshToken ?? null,
                expiresIn: Number.isFinite(payload.expiresIn || NaN) ? payload.expiresIn : null,
                expiresAt: Number.isFinite(payload.expiresIn || NaN) ? now + Number(payload.expiresIn) * 1000 : null,
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

    if (!success && !error) return;

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
      ].forEach((param) => cleaned.delete(param));
      const query = cleaned.toString();
      const basePath = pathname || '/hub/conectores';
      router.replace(query ? `${basePath}?${query}` : basePath, { scroll: false });
    };

    if (error) {
      setConnectorError(`Falha ao conectar: ${error}`);
      setConnectorFeedback(null);
      clearPendingMetaAdsSelection();
      clearPendingInstagramSelection();
      clearConnectorQueryParams();
      return;
    }

    if (!isConnectorKey(connectorParam) || !accessToken) {
      setConnectorError('Conexão retornou sem dados suficientes para ativar o conector.');
      setConnectorFeedback(null);
      clearPendingMetaAdsSelection();
      clearPendingInstagramSelection();
      clearConnectorQueryParams();
      return;
    }

    const pendingPayload: PendingOAuthConnection = {
      connector: connectorParam,
      provider: provider ?? null,
      accessToken,
      refreshToken: refreshToken ?? null,
      expiresIn: Number.isFinite(expiresIn || NaN) ? Number(expiresIn) : null,
      accountId: accountId ?? null,
    };

    if (connectorParam === 'metaAds' && !pendingPayload.accountId) {
      const hydrateMetaAdsAccounts = async () => {
        try {
          setConnectorBusyKey('metaAds');
          const response = await fetch('/api/auth/connectors/metaAds/accounts', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ accessToken }),
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
            const persisted = await persistOAuthConnection(
              { ...pendingPayload, accountId: accounts[0].id },
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

    if (connectorParam === 'instagram' && !pendingPayload.accountId) {
      const hydrateInstagramAccounts = async () => {
        try {
          setConnectorBusyKey('instagram');
          const response = await fetch('/api/auth/connectors/instagram/accounts', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ accessToken }),
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
            const persisted = await persistOAuthConnection(
              { ...pendingPayload, accountId: accounts[0].id },
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

    const upsertConnection = async () => {
      await persistOAuthConnection(pendingPayload, 'Conector autenticado e salvo com sucesso.');
      clearPendingMetaAdsSelection();
      clearPendingInstagramSelection();
      clearConnectorQueryParams();
    };

    void upsertConnection();
  }, [clearPendingInstagramSelection, clearPendingMetaAdsSelection, pathname, persistOAuthConnection, router, searchParams, user]);

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

  const connectedCount = useMemo(
    () => CONNECTOR_ITEMS.filter((item) => isConnectorActive(item, connectorStatus)).length,
    [connectorStatus]
  );

  const estimatedRevenueLabel = useMemo(() => {
    const activeImpact = CONNECTOR_ITEMS.filter((item) => isConnectorActive(item, connectorStatus)).map((item) => item.impactLabel);
    if (activeImpact.length >= 4) return 'R$ 6,24 mi / mês';
    if (activeImpact.length === 3) return 'R$ 4,29 mi / mês';
    if (activeImpact.length === 2) return 'R$ 2,73 mi / mês';
    if (activeImpact.length === 1) return 'R$ 1,28 mi / mês';
    return 'R$ 0 / mês';
  }, [connectorStatus]);

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
    if (!profileConnections) return null;

    let latest: number | null = null;
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
  }, [profileConnections]);

  const healthTone = useMemo(() => getHealthTone(healthScore), [healthScore]);

  const handleDisconnect = async (connectorKey: ConnectorKey) => {
    if (!user) return;
    if (connectorKey === 'metaAds') {
      clearPendingMetaAdsSelection();
    }
    if (connectorKey === 'instagram') {
      clearPendingInstagramSelection();
    }
    setConnectorBusyKey(connectorKey);
    setConnectorError(null);
    setConnectorFeedback(null);

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

  const handleMetaAdsAccountSelection = async () => {
    if (!pendingMetaAdsConnection || !selectedMetaAdsAccountId) {
      setConnectorError('Selecione uma conta Meta Ads para continuar.');
      setConnectorFeedback(null);
      return;
    }

    setMetaAdsSelectionSaving(true);
    setConnectorBusyKey('metaAds');

    const persisted = await persistOAuthConnection(
      { ...pendingMetaAdsConnection, accountId: selectedMetaAdsAccountId },
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

    setInstagramSelectionSaving(true);
    setConnectorBusyKey('instagram');

    const persisted = await persistOAuthConnection(
      { ...pendingInstagramConnection, accountId: selectedInstagramAccountId },
      'Conta do Instagram vinculada com sucesso.'
    );

    if (persisted) {
      clearPendingInstagramSelection();
    }

    setInstagramSelectionSaving(false);
    setConnectorBusyKey(null);
  };

  const handleConnect = async (connectorKey: ConnectorKey) => {
    if (!user) return;
    setConnectorBusyKey(connectorKey);
    setConnectorError(null);
    setConnectorFeedback(null);

    const oauthProvider = OAUTH_CONNECTOR_PROVIDERS[connectorKey];
    if (oauthProvider) {
      window.location.href = getConnectorOAuthHref(connectorKey, oauthProvider);
      return;
    }

    setConnectorBusyKey(null);
  };

  const handleConnectorMenuAction = async (item: UiConnector, isActive: boolean, action: 'details' | 'docs' | 'copy-id' | 'toggle') => {
    setOpenConnectorMenuId(null);

    if (action === 'details') {
      setConnectorError(null);
      setConnectorFeedback(
        `${item.title}: ${isActive ? 'conector ativo' : 'conector pendente'} • impacto estimado ${item.impactLabel}.`
      );
      return;
    }

    if (action === 'docs') {
      const docsUrl = CONNECTOR_DOCS_URLS[item.id] ?? 'https://neuroads.com.br/conectores';
      window.open(docsUrl, '_blank', 'noopener,noreferrer');
      return;
    }

    if (action === 'copy-id') {
      try {
        await navigator.clipboard.writeText(item.id);
        setConnectorError(null);
        setConnectorFeedback(`ID técnico copiado: ${item.id}`);
      } catch {
        setConnectorFeedback(null);
        setConnectorError('Não foi possível copiar o ID técnico deste conector.');
      }
      return;
    }

    if (action === 'toggle') {
      if (!item.connectorKey) {
        setConnectorError(null);
        setConnectorFeedback(`${item.title}: canal em fase de implantação nesta versão do Hub.`);
        return;
      }

      if (isActive) {
        await handleDisconnect(item.connectorKey);
        return;
      }

      await handleConnect(item.connectorKey);
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
                                Última sincronização <span className="ml-2 font-semibold text-[#0F172A]">{isActive ? item.lastSyncLabelWhenActive : 'Nunca sincronizado'}</span>
                              </p>
                              <p className="mt-1 flex items-center gap-2 text-[#64748B]">
                                Impacto estimado
                                <Info className="h-4 w-4 text-[#94A3B8]" />
                                <span className="font-semibold text-[#12B76A]">{item.impactLabel}</span>
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                if (!item.connectorKey) {
                                  setConnectorFeedback(`${item.title}: canal em fase de implantação nesta versão do Hub.`);
                                  setConnectorError(null);
                                  return;
                                }
                                if (isActive) {
                                  void handleDisconnect(item.connectorKey);
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
                                    onClick={() => void handleConnectorMenuAction(item, isActive, 'copy-id')}
                                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-[14px] font-semibold text-[#344054] transition-colors hover:bg-[#F8FAFC] hover:text-[#FF6A00]"
                                    role="menuitem"
                                  >
                                    <Copy className="h-4 w-4 text-[#64748B]" />
                                    Copiar ID técnico
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => void handleConnectorMenuAction(item, isActive, 'toggle')}
                                    className="mt-1 flex w-full items-center gap-2 rounded-xl border border-[#FFD9BD] bg-[#FFF5EC] px-3 py-2 text-left text-[14px] font-semibold text-[#FF7A00] transition-colors hover:bg-[#FFEEDF]"
                                    role="menuitem"
                                  >
                                    <Link2 className="h-4 w-4" />
                                    {!item.connectorKey
                                      ? 'Canal em implantação'
                                      : isActive
                                        ? 'Desconectar conector'
                                        : 'Conectar conector'}
                                  </button>
                                </div>
                              ) : null}
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </div>

                <section className="mt-4 grid grid-cols-1 gap-3 rounded-2xl border border-[#243041] bg-[#0F172A] p-4 shadow-[0_12px_24px_rgba(2,6,23,0.35)] md:grid-cols-4">
                  <div>
                    <p className="text-[13px] text-[#9CB3D1]">Conectores ativos</p>
                    <p className="mt-1 text-[30px] font-black text-[#F8FAFC]">{connectedCount} <span className="text-[16px] font-semibold text-[#9CB3D1]">de {CONNECTOR_ITEMS.length}</span></p>
                  </div>
                  <div>
                    <p className="text-[13px] text-[#9CB3D1]">Impacto em receita rastreada</p>
                    <p className="mt-1 text-[28px] font-black text-[#F8FAFC]">{estimatedRevenueLabel}</p>
                    <p className="mt-1 text-[13px] text-[#4ADE80]">+18,7% vs. mês anterior</p>
                  </div>
                  <div>
                    <p className="text-[13px] text-[#9CB3D1]">Dados sincronizados (24h)</p>
                    <p className="mt-1 text-[28px] font-black text-[#F8FAFC]">1,2 mi</p>
                    <p className="mt-1 text-[13px] text-[#4ADE80]">+12,4% vs. 24h anteriores</p>
                  </div>
                  <div>
                    <p className="text-[13px] text-[#9CB3D1]">Taxa de sucesso (24h)</p>
                    <p className="mt-1 text-[28px] font-black text-[#F8FAFC]">99,2%</p>
                    <p className="mt-1 text-[13px] text-[#4ADE80]">Excelente</p>
                  </div>
                </section>

                {pendingMetaAdsConnection && metaAdsAccounts.length > 0 && (
                  <section className="mt-4 rounded-2xl border border-[#FED7AA] bg-[#FFF7ED] p-4">
                    <p className="text-[14px] font-black text-[#9A3412]">Selecione a conta Meta Ads para concluir</p>
                    <p className="mt-1 text-[13px] text-[#7C2D12]">
                      A autenticação foi concluída. Agora escolha qual conta de anúncios deve ser vinculada ao Hub.
                    </p>

                    <div className="mt-3 grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
                      <label className="flex flex-col gap-1 text-[13px] font-semibold text-[#7C2D12]">
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
                )}

                {pendingInstagramConnection && instagramAccounts.length > 0 && (
                  <section className="mt-4 rounded-2xl border border-[#C7D2FE] bg-[#EEF2FF] p-4">
                    <p className="text-[14px] font-black text-[#3730A3]">Selecione a conta Instagram para concluir</p>
                    <p className="mt-1 text-[13px] text-[#4338CA]">
                      A autenticação foi concluída. Agora escolha qual perfil comercial deve ser vinculado ao Hub.
                    </p>

                    <div className="mt-3 grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
                      <label className="flex flex-col gap-1 text-[13px] font-semibold text-[#3730A3]">
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
                )}

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
    </main>
  );
}
