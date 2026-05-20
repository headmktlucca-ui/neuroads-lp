'use client';

import { useEffect, useMemo, useState } from 'react';
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

type UiConnectorId = ConnectorKey | 'slack';
type UiCategory = 'marketing' | 'vendas' | 'atendimento';

type UiConnector = {
  id: UiConnectorId;
  title: string;
  description: string;
  category: UiCategory;
  impactLabel: string;
  lastSyncLabelWhenActive: string;
  isLiveConnector: boolean;
};

const CONNECTOR_ITEMS: UiConnector[] = [
  {
    id: 'crm',
    title: 'HubSpot',
    description: 'Sincronize leads, empresas e oportunidades para uma visão completa do funil.',
    category: 'marketing',
    impactLabel: 'R$ 1,28 mi / mês',
    lastSyncLabelWhenActive: 'Hoje, 08:45',
    isLiveConnector: true,
  },
  {
    id: 'googleAds',
    title: 'Google Ads',
    description: 'Acompanhe campanhas, custos e conversões para otimizar seus investimentos.',
    category: 'marketing',
    impactLabel: 'R$ 980 mil / mês',
    lastSyncLabelWhenActive: 'Hoje, 08:32',
    isLiveConnector: true,
  },
  {
    id: 'metaAds',
    title: 'Meta Ads',
    description: 'Importe dados de anúncios do Facebook e Instagram para análises mais precisas.',
    category: 'marketing',
    impactLabel: 'R$ 1,45 mi / mês',
    lastSyncLabelWhenActive: 'Hoje, 08:15',
    isLiveConnector: true,
  },
  {
    id: 'payments',
    title: 'Stripe',
    description: 'Concilie pagamentos, assinaturas e receitas em tempo real.',
    category: 'vendas',
    impactLabel: 'R$ 2,56 mi / mês',
    lastSyncLabelWhenActive: 'Hoje, 08:40',
    isLiveConnector: true,
  },
  {
    id: 'slack',
    title: 'Slack',
    description: 'Receba alertas e insights importantes diretamente nos seus canais.',
    category: 'atendimento',
    impactLabel: 'R$ 120 mil / mês',
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
  linkedinAds: 'linkedin',
  ga4: 'google',
  crm: 'hubspot',
  payments: 'stripe',
  warehouse: 'bigquery',
};

const CONNECTOR_DOCS_URLS: Partial<Record<UiConnectorId, string>> = {
  crm: 'https://developers.hubspot.com/docs/api/overview',
  googleAds: 'https://developers.google.com/google-ads/api/docs/start',
  metaAds: 'https://developers.facebook.com/docs/marketing-apis',
  payments: 'https://docs.stripe.com/',
  slack: 'https://api.slack.com/',
};

function readRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object') return null;
  return value as Record<string, unknown>;
}

function isConnectorKey(value: string | null): value is ConnectorKey {
  if (!value) return false;
  return value in DEFAULT_CONNECTOR_STATUS;
}

function isConnectorActive(id: UiConnectorId, connectorStatus: ConnectorStatus): boolean {
  if (id === 'slack') return false;
  return Boolean(connectorStatus[id]);
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
      <svg viewBox="0 0 64 64" className="h-10 w-10" aria-hidden>
        <path
          d="M10 41.5c4.5-15.7 9.8-23.6 15.8-23.6 5.1 0 7.8 7.4 12.2 14.6 3.6 5.9 6.4 9 8.8 9 3.2 0 5.2-3.3 7.2-12.3"
          fill="none"
          stroke="#1877F2"
          strokeWidth="6.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (id === 'crm') {
    return (
      <svg viewBox="0 0 64 64" className="h-10 w-10" aria-hidden>
        <circle cx="32" cy="32" r="9" fill="none" stroke="#F97316" strokeWidth="5" />
        <circle cx="14" cy="14" r="5" fill="#FB923C" />
        <circle cx="50" cy="14" r="5" fill="#FB923C" />
        <circle cx="14" cy="50" r="5" fill="#FB923C" />
        <path d="M18.5 18.5L26 26M45.5 18.5L38 26M18.5 45.5L26 38" stroke="#F97316" strokeWidth="4" strokeLinecap="round" />
      </svg>
    );
  }

  if (id === 'payments') {
    return (
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFF1E6] text-[34px] font-black leading-none text-[#F97316]">
        S
      </div>
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
  const [openConnectorMenuId, setOpenConnectorMenuId] = useState<UiConnectorId | null>(null);
  const [activeFilter, setActiveFilter] = useState<UiCategory | 'todos'>('todos');
  const [sortMode, setSortMode] = useState<'az'>('az');

  const accessState = useMemo(
    () => resolveHubAccessState({ loading, user, profile }),
    [loading, profile, user]
  );
  const isSyncingAccess = accessState === 'forbidden' && premiumSyncing;

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
      clearConnectorQueryParams();
      return;
    }

    if (!isConnectorKey(connectorParam) || !accessToken) {
      setConnectorError('Conexão retornou sem dados suficientes para ativar o conector.');
      setConnectorFeedback(null);
      clearConnectorQueryParams();
      return;
    }

    const now = Date.now();
    const connectionKey = CONNECTOR_CONNECTION_KEYS[connectorParam];

    setConnectorStatus((prev) => {
      const nextStatus = { ...prev, [connectorParam]: true };
      const connectorsKey = `neuroads_dashboard_connectors_${user.uid}`;
      window.localStorage.setItem(connectorsKey, JSON.stringify(nextStatus));
      return nextStatus;
    });

    const upsertConnection = async () => {
      try {
        const db = getFirebaseDb();
        const userRef = doc(db, 'users', user.uid);
        await setDoc(
          userRef,
          {
            connections: {
              [connectionKey]: {
                isActive: true,
                provider: provider ?? null,
                accountId: accountId ?? null,
                accessToken,
                refreshToken: refreshToken ?? null,
                expiresIn: Number.isFinite(expiresIn || NaN) ? expiresIn : null,
                expiresAt: Number.isFinite(expiresIn || NaN) ? now + Number(expiresIn) * 1000 : null,
                connectedAt: now,
                updatedAt: now,
              },
            },
            updatedAt: now,
          },
          { merge: true }
        );
        setConnectorFeedback('Conector autenticado e salvo com sucesso.');
        setConnectorError(null);
      } catch (saveError) {
        console.warn('Falha ao persistir conexão OAuth:', saveError);
        setConnectorFeedback(null);
        setConnectorError('Conexão concluída, mas não foi possível salvar no banco.');
      } finally {
        clearConnectorQueryParams();
      }
    };

    void upsertConnection();
  }, [pathname, router, searchParams, user]);

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
    () => CONNECTOR_ITEMS.filter((item) => isConnectorActive(item.id, connectorStatus)).length,
    [connectorStatus]
  );

  const estimatedRevenueLabel = useMemo(() => {
    const activeImpact = CONNECTOR_ITEMS.filter((item) => isConnectorActive(item.id, connectorStatus)).map((item) => item.impactLabel);
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

  const trackedConnectorCount = useMemo(
    () => Object.keys(DEFAULT_CONNECTOR_STATUS).length,
    []
  );

  const activeTrackedConnectorCount = useMemo(
    () => Object.values(connectorStatus).filter((status) => status).length,
    [connectorStatus]
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
      if (item.id === 'slack') {
        setConnectorError(null);
        setConnectorFeedback('Conector Slack ainda não foi configurado nesta versão.');
        return;
      }

      if (isActive) {
        await handleDisconnect(item.id);
        return;
      }

      await handleConnect(item.id);
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
                      const isActive = isConnectorActive(item.id, connectorStatus);
                      const isBusy = item.id !== 'slack' && connectorBusyKey === item.id;
                      return (
                        <article
                          key={item.id}
                          className="grid grid-cols-1 gap-4 rounded-2xl border border-[#DDE3F2] bg-white p-4 shadow-[0_6px_14px_rgba(15,23,42,0.06)] transition-colors duration-200 hover:bg-[#F8FAFC] md:grid-cols-[94px_1.3fr_1.2fr_auto] md:items-center"
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
                                if (item.id === 'slack') {
                                  setConnectorFeedback('Conector Slack ainda não foi configurado nesta versão.');
                                  setConnectorError(null);
                                  return;
                                }
                                if (isActive) {
                                  void handleDisconnect(item.id);
                                  return;
                                }
                                void handleConnect(item.id);
                              }}
                              disabled={Boolean(isBusy)}
                              className={`inline-flex h-12 items-center gap-2 rounded-[12px] px-4 text-[13px] font-black tracking-wide transition disabled:opacity-60 ${
                                isActive
                                  ? 'border border-[#FFD4B2] bg-[#FFF8F2] text-[#F97316] hover:bg-[#FFF1E6]'
                                  : 'border border-[#FF7A00] bg-[#FF7A00] text-white shadow-[0_10px_20px_rgba(255,122,0,0.24)] hover:bg-[#E56B00]'
                              }`}
                            >
                              <RefreshCw className={`h-4 w-4 ${isBusy ? 'animate-spin' : ''}`} />
                              {item.id === 'slack' ? 'Configurar' : isActive ? 'Sincronizar' : 'Configurar'}
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
                                    {item.id === 'slack'
                                      ? 'Configurar conector'
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

                <section className="mt-4 grid grid-cols-1 gap-3 rounded-2xl border border-[#DDE3F2] bg-white p-4 md:grid-cols-4">
                  <div>
                    <p className="text-[13px] text-[#64748B]">Conectores ativos</p>
                    <p className="mt-1 text-[30px] font-black text-[#0F172A]">{connectedCount} <span className="text-[16px] font-semibold text-[#64748B]">de {CONNECTOR_ITEMS.length}</span></p>
                  </div>
                  <div>
                    <p className="text-[13px] text-[#64748B]">Impacto em receita rastreada</p>
                    <p className="mt-1 text-[28px] font-black text-[#0F172A]">{estimatedRevenueLabel}</p>
                    <p className="mt-1 text-[13px] text-[#12B76A]">+18,7% vs. mês anterior</p>
                  </div>
                  <div>
                    <p className="text-[13px] text-[#64748B]">Dados sincronizados (24h)</p>
                    <p className="mt-1 text-[28px] font-black text-[#0F172A]">1,2 mi</p>
                    <p className="mt-1 text-[13px] text-[#12B76A]">+12,4% vs. 24h anteriores</p>
                  </div>
                  <div>
                    <p className="text-[13px] text-[#64748B]">Taxa de sucesso (24h)</p>
                    <p className="mt-1 text-[28px] font-black text-[#0F172A]">99,2%</p>
                    <p className="mt-1 text-[13px] text-[#12B76A]">Excelente</p>
                  </div>
                </section>

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
                    <p className="mt-1 text-[14px] text-[#475569]">Gateway de Pagamentos</p>
                    <p className="text-[14px] text-[#475569]">Erro em 2,1% dos registros.</p>
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
                    <p className="mt-1 text-[14px] text-[#475569]">Slack ainda não foi configurado.</p>
                    <button type="button" className="mt-3 inline-flex items-center gap-2 text-[14px] font-bold text-[#E56B00]">
                      Configurar agora <ArrowUpRight className="h-4 w-4" />
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
