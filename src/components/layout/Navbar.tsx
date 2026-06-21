'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useCallback, useEffect, useMemo, useState, Fragment, useRef } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { collection, deleteDoc, doc, getDocs, setDoc } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import { ChevronDown, LogOut, X, PlugZap, CheckCircle2, Gauge, AlertTriangle, Building2, Crown, ShieldCheck, Workflow, User, Mail, Phone, Globe, BookOpen, CreditCard, DollarSign, Calendar, Fingerprint, Activity, Trash2, ShieldAlert, RefreshCw } from 'lucide-react';
import { getFirebaseDb } from '../../lib/firebase';
import { HTTPS_PREFIX, isHttpsPlaceholderOnly, normalizeHttpsMaskedUrlInput } from '../../lib/url-mask';
import { getContractedAgentsFromProfile } from '../../lib/hub-agents';
import { getHubProfileSummary } from '../../lib/hub-profile';
import { getHubAutomationsFromProfile } from '../../lib/hub-automations';
import { agents } from '../../data/agents';
import {
  AGENT_STATUS_UPDATED_EVENT,
  readAgentStatusOverrides,
  type AgentStatusOverrides,
} from '../../lib/agent-status-cache';
import {
  CONNECTOR_CONNECTION_KEYS,
  CONNECTOR_DEFINITIONS,
  DEFAULT_CONNECTOR_STATUS,
  getConnectorStatusFromConnections,
  type ConnectorConnection,
  type ConnectorKey,
  type ConnectorStatus,
} from '../../lib/connectors';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'Bom dia';
  if (hour >= 12 && hour < 18) return 'Boa tarde';
  return 'Boa noite';
}

function getFirstName(fullName: string | null | undefined): string {
  if (!fullName) return '';
  return fullName.split(' ')[0];
}

function readString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function readRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object') return null;
  return value as Record<string, unknown>;
}

const DEFAULT_COMPANY_FORM = {
  companyName: '',
  site: HTTPS_PREFIX,
  instagram: '',
  linkedin: '',
  tiktok: '',
  blog: '',
};

const DEFAULT_CONNECTOR_CONFIG = {
  hubspotPortalId: '',
  hubspotPipelineId: '',
  hubspotDealStageId: '',
  hubspotLifecycleStageField: 'lifecyclestage',
  refreshFrequency: '15 min',
};

const CONNECTOR_CONFIG_OPTIONS = {
  refreshFrequency: ['5 min', '15 min', '30 min', '60 min', '6 h', '24 h'],
} as const;

const CONNECTOR_HELP_BY_KEY: Record<ConnectorKey, { title: string; steps: string[] }> = {
  googleAds: {
    title: 'Google Ads API',
    steps: [
      'Crie um app OAuth no Google Cloud e ative a Google Ads API.',
      'Adicione os Redirect URIs exatos: https://neuroads.com.br/api/auth/connectors/googleAds/callback e http://localhost:3000/api/auth/connectors/googleAds/callback.',
      'Se o fluxo legado ainda estiver em uso (ex.: alguns agentes), também adicione: https://neuroads.com.br/api/auth/google-ads/callback e http://localhost:3000/api/auth/google-ads/callback.',
      'Preencha GOOGLE_OAUTH_CLIENT_ID e GOOGLE_OAUTH_CLIENT_SECRET no ambiente.',
      'Clique em Conectar e autorize a conta de mídia usada na operação.',
    ],
  },
  metaAds: {
    title: 'Meta Ads API',
    steps: [
      'Configure um app no Meta for Developers com produto Facebook Login.',
      'Ative Client OAuth Login e Web OAuth Login no Facebook Login > Settings.',
      'Adicione os redirects: https://neuroads.com.br/api/auth/connectors/metaAds/callback e http://localhost:3000/api/auth/connectors/metaAds/callback.',
      'Defina META_APP_ID e META_APP_SECRET nas variáveis do projeto.',
      'Conecte a conta e valide acesso às contas de anúncio no Business Manager.',
    ],
  },
  instagram: {
    title: 'Instagram Graph API',
    steps: [
      'No app da Meta, habilite Instagram Graph API e Facebook Login.',
      'Ative Client OAuth Login e Web OAuth Login no Facebook Login > Settings.',
      'Adicione os redirects: https://neuroads.com.br/api/auth/connectors/instagram/callback e http://localhost:3000/api/auth/connectors/instagram/callback.',
      'Garanta permissões instagram_basic, pages_show_list e pages_read_engagement.',
      'Conecte e selecione o perfil comercial/creator que será vinculado no Hub.',
    ],
  },
  linkedinAds: {
    title: 'LinkedIn Ads API',
    steps: [
      'Crie um app no LinkedIn Developer Portal com permissão de Ads Reporting.',
      'Configure o redirect URI: https://neuroads.com.br/api/auth/connectors/linkedinAds/callback (e localhost para testes).',
      'Configure LINKEDIN_ADS_CLIENT_ID e LINKEDIN_ADS_CLIENT_SECRET no ambiente.',
      'Autorize o app usando um usuário com acesso às contas de anúncio B2B.',
    ],
  },
  linkedinPage: {
    title: 'LinkedIn Page API',
    steps: [
      'No LinkedIn Developer Portal, habilite produtos de Community Management para leitura/publicação em páginas.',
      'Configure o redirect URI: https://neuroads.com.br/api/auth/connectors/linkedinPage/callback (e localhost para testes).',
      'Configure LINKEDIN_PAGE_CLIENT_ID e LINKEDIN_PAGE_CLIENT_SECRET (ou reutilize as chaves do LinkedIn Ads).',
      'Autorize com um usuário admin da página que será sincronizada no Hub.',
    ],
  },
  rdStation: {
    title: 'RD Station CRM API',
    steps: [
      'A API v2 do RD CRM usa OAuth2 Bearer Token.',
      'No Hub, clique em conectar e informe o Access Token (e opcionalmente Refresh Token).',
      'Configure webhooks no endpoint /crm/v2/webhooks para enviar eventos ao endpoint da NeuroAds.',
      'Os dados de autenticação ficam salvos no perfil para manter a integração ativa.',
    ],
  },
  rdStationMarketing: {
    title: 'RD Station Marketing API',
    steps: [
      'Use integração via webhook com Token Público e Token Privado (sem OAuth).',
      'No Hub, clique em conectar e informe os dois tokens da conta RD Marketing.',
      'Os tokens ficam vinculados ao usuário para manter sincronização ativa.',
      'Valide os eventos de webhook que devem ser enviados para a NeuroAds.',
    ],
  },
  rdStationConversas: {
    title: 'RD Station Conversas API',
    steps: [
      'Configure a integração via webhook no RD Station Conversas.',
      'Use a URL de destino do Hub: https://neuroads.com.br/api/webhooks/rd-station/conversas.',
      'Garanta método POST e resposta 2xx na validação do webhook.',
      'Após configurar no RD, marque o canal como configurado no Hub.',
    ],
  },
  ga4: {
    title: 'GA4 Data API',
    steps: [
      'Ative a Google Analytics Data API no mesmo projeto OAuth do Google.',
      'Adicione os Redirect URIs exatos: https://neuroads.com.br/api/auth/connectors/ga4/callback e http://localhost:3000/api/auth/connectors/ga4/callback.',
      'Conecte com um usuário que tenha permissão de leitura na propriedade GA4.',
    ],
  },
  searchConsole: {
    title: 'Google Search Console',
    steps: [
      'Ative o fluxo OAuth Google no mesmo projeto usado pelos conectores GA4/Google Ads.',
      'Adicione os Redirect URIs exatos: https://neuroads.com.br/api/auth/connectors/searchConsole/callback e http://localhost:3000/api/auth/connectors/searchConsole/callback.',
      'Conecte com um usuário Google que tenha as contas que serão usadas para leitura de tendências.',
      'Durante o login, selecione a conta correta quando o Google exibir múltiplas contas.',
    ],
  },
  serverTracking: {
    title: 'GTM Server + CAPI',
    steps: [
      'Valide se o container server-side está ativo e recebendo eventos.',
      'Mantenha a frequência de atualização definida para evitar atraso no dashboard.',
      'Ative este canal apenas após validar deduplicação entre web e server.',
    ],
  },
  tiktok: {
    title: 'TikTok API',
    steps: [
      'No TikTok for Developers, habilite Login Kit e registre o callback https://neuroads.com.br/api/auth/connectors/tiktok/callback.',
      'Defina TIKTOK_CLIENT_KEY e TIKTOK_CLIENT_SECRET no ambiente.',
      'Se precisar sobrescrever rotas, use TIKTOK_AUTH_URL e TIKTOK_TOKEN_URL.',
      'Configure TIKTOK_SCOPE conforme os dados que deseja sincronizar (ex.: user.info.basic).',
    ],
  },
  tiktokAds: {
    title: 'TikTok Ads API',
    steps: [
      'No TikTok Ads Marketing API, libere OAuth do app para a conta anunciante.',
      'Registre callback https://neuroads.com.br/api/auth/connectors/tiktokAds/callback.',
      'Defina TIKTOK_ADS_APP_ID (ou TIKTOK_ADS_CLIENT_ID) e TIKTOK_ADS_SECRET (ou TIKTOK_ADS_CLIENT_SECRET).',
      'Se necessário, sobrescreva endpoints via TIKTOK_ADS_AUTH_URL e TIKTOK_ADS_TOKEN_URL.',
    ],
  },
  crm: {
    title: 'CRM HubSpot',
    steps: [
      'No HubSpot Developer, configure o redirect URI: https://neuroads.com.br/api/auth/connectors/crm/callback.',
      'Defina HUBSPOT_CLIENT_ID, HUBSPOT_CLIENT_SECRET e NEXT_PUBLIC_APP_URL no ambiente.',
      'Use escopos mínimos oauth, crm.objects.contacts.read e crm.objects.deals.read antes de conectar.',
    ],
  },
  payments: {
    title: 'Stripe/Pagamentos',
    steps: [
      'Ative o Stripe Connect OAuth e configure STRIPE_CONNECT_CLIENT_ID.',
      'Garanta STRIPE_SECRET_KEY válida no ambiente de produção e homologação.',
      'Conecte a conta Stripe principal para liberar receita e LTV no dashboard.',
    ],
  },
  warehouse: {
    title: 'BigQuery/Data Warehouse',
    steps: [
      'Ative BigQuery API no Google Cloud e habilite acesso de leitura.',
      'Use o mesmo OAuth do Google com redirect /api/auth/connectors/warehouse/callback.',
      'Conecte somente após validar dataset e projeto de consolidação de dados.',
    ],
  },
};

function ensureOption(value: string, options: readonly string[], fallback: string): string {
  return options.includes(value) ? value : fallback;
}

function normalizeConnectorConfig(config: Partial<typeof DEFAULT_CONNECTOR_CONFIG>): typeof DEFAULT_CONNECTOR_CONFIG {
  const hubspotPortalId = readString(config.hubspotPortalId);
  const hubspotPipelineId = readString(config.hubspotPipelineId);
  const hubspotDealStageId = readString(config.hubspotDealStageId);
  const hubspotLifecycleStageField =
    readString(config.hubspotLifecycleStageField) || DEFAULT_CONNECTOR_CONFIG.hubspotLifecycleStageField;
  const refreshFrequency = ensureOption(
    readString(config.refreshFrequency),
    CONNECTOR_CONFIG_OPTIONS.refreshFrequency,
    DEFAULT_CONNECTOR_CONFIG.refreshFrequency
  );
  return { hubspotPortalId, hubspotPipelineId, hubspotDealStageId, hubspotLifecycleStageField, refreshFrequency };
}

const PLAN_AGENT_CAPACITY: Record<string, number> = {
  Lite: 5,
  Start: 10,
  Growth: 15,
  'Pro Scale': 20,
  Enterprise: 50,
};

const ACCOUNT_DELETE_FLAG_PREFIX = 'neuroads_account_delete_in_progress_';
const OAUTH_CONNECTOR_PROVIDERS: Partial<Record<ConnectorKey, string>> = {
  googleAds: 'google',
  searchConsole: 'google',
  metaAds: 'meta',
  instagram: 'meta',
  linkedinAds: 'linkedin',
  linkedinPage: 'linkedin',
  ga4: 'google',
  crm: 'hubspot',
  payments: 'stripe',
  tiktok: 'tiktok',
  tiktokAds: 'tiktokAds',
  warehouse: 'bigquery',
};

function isConnectorKey(value: string | null): value is ConnectorKey {
  if (!value) return false;
  return value in DEFAULT_CONNECTOR_STATUS;
}

function formatCurrencyFromCents(cents: number | null): string {
  if (cents == null || !Number.isFinite(cents)) return 'Não informado';
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatDateTime(value: number | null): string {
  if (!value || !Number.isFinite(value)) return 'Não informado';
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'full',
    timeStyle: 'short',
    timeZone: 'America/Sao_Paulo',
  }).format(new Date(value));
}

function formatTrialRemaining(remainingMs: number | null): string {
  if (remainingMs == null || remainingMs <= 0) return 'Encerrado';
  const totalHours = Math.floor(remainingMs / (1000 * 60 * 60));
  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;
  return `${days}d ${hours}h restantes`;
}

const SETTINGS_MODAL_VIEWPORT =
  'fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden px-3 py-3 sm:px-4 sm:py-4';
const SETTINGS_MODAL_BACKDROP = 'absolute inset-0 bg-[#0F172A]/40 backdrop-blur-md transition-opacity duration-300';
const SETTINGS_MODAL_FRAME =
  'relative w-full max-h-[92vh] rounded-[24px] bg-white border border-slate-100/80 shadow-[0_24px_60px_-15px_rgba(15,23,42,0.12)] overflow-hidden animate-in fade-in zoom-in-95 duration-250';
const SETTINGS_MODAL_SURFACE = 'max-h-[calc(92vh-4px)] flex flex-col overflow-hidden h-full bg-white';
const SETTINGS_MODAL_HEADER = 'relative border-b border-slate-100 bg-[#FAFBFC] px-6 py-5 flex flex-col';
const SETTINGS_MODAL_CLOSE_BUTTON =
  'absolute right-5 top-5 rounded-full border border-slate-200/80 bg-white p-2 text-slate-500 transition-all hover:bg-slate-50 hover:text-slate-700 hover:scale-105 active:scale-95 shadow-sm';
const PREMIUM_MODAL_HEADER = 'relative border-b border-[#1a365d]/40 bg-[#0d1e3d] px-6 py-5 flex flex-col gap-1 overflow-hidden';
const PREMIUM_MODAL_CLOSE_BUTTON = 'absolute right-5 top-5 rounded-full border border-white/10 bg-white/5 p-2 text-white/80 transition-all hover:bg-white/10 hover:text-white hover:scale-105 active:scale-95 shadow-sm z-50';
const SETTINGS_PANEL =
  'rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.02)] transition-all duration-200 hover:border-slate-200/80 hover:shadow-[0_8px_30px_-6px_rgba(15,23,42,0.04)]';
const SETTINGS_LABEL = 'mb-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400';
const SETTINGS_INPUT =
  'w-full rounded-xl border border-slate-200 bg-[#F8FAFC] px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition-all duration-200 focus:border-[#FF7A00] focus:bg-white focus:ring-2 focus:ring-[#FF7A00]/10';
const SETTINGS_SECONDARY_BUTTON =
  'rounded-xl border border-slate-200 px-5 py-3 text-xs font-black uppercase tracking-widest text-[#667085] transition-all hover:bg-[#F8FAFC] hover:text-slate-700 hover:border-slate-300 active:scale-98';
const SETTINGS_PRIMARY_BUTTON =
  'rounded-xl bg-gradient-to-r from-[#08B760] to-[#0A9D57] px-5 py-3 text-xs font-black uppercase tracking-widest text-white shadow-[0_8px_18px_rgba(10,157,87,0.15)] transition-all hover:brightness-105 active:scale-98';
const SETTINGS_TOAST_BASE =
  'fixed bottom-4 right-4 z-[10020] rounded-xl px-4 py-3 text-sm font-bold shadow-[0_16px_35px_-20px_rgba(15,23,42,0.6)] animate-in fade-in slide-in-from-bottom-2 duration-200';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLabSubmenuOpen, setIsLabSubmenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isCompanyOpen, setIsCompanyOpen] = useState(false);
  const [isConnectorsOpen, setIsConnectorsOpen] = useState(false);
  const [isFinanceOpen, setIsFinanceOpen] = useState(false);
  const [companySaved, setCompanySaved] = useState(false);
  const [connectorsSaved, setConnectorsSaved] = useState(false);
  const [connectorFeedback, setConnectorFeedback] = useState<string | null>(null);
  const [connectorError, setConnectorError] = useState<string | null>(null);
  const [connectorBusyKey, setConnectorBusyKey] = useState<ConnectorKey | null>(null);
  const [companyForm, setCompanyForm] = useState(DEFAULT_COMPANY_FORM);
  const [connectorStatus, setConnectorStatus] = useState<ConnectorStatus>(DEFAULT_CONNECTOR_STATUS);
  const [connectorConfig, setConnectorConfig] = useState(DEFAULT_CONNECTOR_CONFIG);
  const [agentStatusVersion, setAgentStatusVersion] = useState(0);
  const [whatsApp, setWhatsApp] = useState('');
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [isManagingPlan, setIsManagingPlan] = useState(false);
  const [deleteAccountError, setDeleteAccountError] = useState<string | null>(null);
  const [settingsToast, setSettingsToast] = useState<{ message: string; variant: 'success' | 'error' } | null>(null);
  const [isCompanySelectorOpen, setIsCompanySelectorOpen] = useState(false);
  const [localCompanies, setLocalCompanies] = useState<Array<{ uid: string; companyName: string; email: string }> | null>(null);
  const [isRefreshingCompanies, setIsRefreshingCompanies] = useState(false);
  const [isMetricsVisible, setIsMetricsVisible] = useState(true);
  const lastScrollY = useRef(0);
  const companySelectorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Scroll down -> hide, Scroll up -> show
      if (currentScrollY > lastScrollY.current && currentScrollY > 60) {
        setIsMetricsVisible(false);
      } else if (currentScrollY < lastScrollY.current) {
        setIsMetricsVisible(true);
      }
      
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (companySelectorRef.current && !companySelectorRef.current.contains(event.target as Node)) {
        setIsCompanySelectorOpen(false);
      }
    };

    if (isCompanySelectorOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isCompanySelectorOpen]);

  const { user, userEmail, profile, logout, isAdmin, isSuperAdmin, actingUid, setActingUid, availableCompanies } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const displayCompanies = localCompanies || availableCompanies;

  const handleRefreshCompanies = async () => {
    setIsRefreshingCompanies(true);
    try {
      const db = getFirebaseDb();
      const snapshot = await getDocs(collection(db, 'users'));
      const companiesList: Array<{ uid: string; companyName: string; email: string }> = [];
      
      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        const email = String(data.authEmail || data.email || '').trim();
        const profileDetails = data.profileDetails as Record<string, unknown> | null;
        const onboarding = data.onboarding as Record<string, unknown> | null;

        const companyName = String(
          data.companyName ??
          data.company ??
          onboarding?.companyName ??
          onboarding?.company ??
          profileDetails?.companyName ??
          profileDetails?.company ??
          ''
        ).trim();

        if (email && companyName && companyName.toLowerCase() !== 'sua empresa' && companyName !== 'undefined') {
          companiesList.push({
            uid: doc.id,
            companyName,
            email,
          });
        }
      });

      // Sort A-Z
      companiesList.sort((a, b) => a.companyName.localeCompare(b.companyName, 'pt-BR'));
      setLocalCompanies(companiesList);
      showSettingsToast('Lista de empresas atualizada com sucesso!', 'success');
    } catch (err) {
      console.error('Failed to refresh companies:', err);
      showSettingsToast('Falha ao atualizar a lista de empresas.', 'error');
    } finally {
      setIsRefreshingCompanies(false);
    }
  };
  const searchParams = useSearchParams();
  const [currentHash, setCurrentHash] = useState('');

  const showSettingsToast = useCallback((message: string, variant: 'success' | 'error' = 'success') => {
    setSettingsToast({ message, variant });
  }, []);

  useEffect(() => {
    if (!settingsToast) return;
    const timeoutId = window.setTimeout(() => setSettingsToast(null), 2200);
    return () => window.clearTimeout(timeoutId);
  }, [settingsToast]);

  useEffect(() => {
    const syncHash = () => {
      if (typeof window !== 'undefined') {
        setCurrentHash(window.location.hash || '');
      }
    };

    syncHash();
    if (typeof window !== 'undefined') {
      window.addEventListener('hashchange', syncHash);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('hashchange', syncHash);
      }
    };
  }, [pathname]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!pathname?.startsWith('/admin')) return;

    const sectionIds = [
      'operacao-lucca',
      'crm-custom',
      'crm-funil',
      'gestao-agentes',
      'gestao-financeira',
      'canais',
    ];

    const resolveActiveSection = () => {
      const anchorY = 170;
      let candidate: string | null = null;
      let nearestAbove: { id: string; distance: number } | null = null;
      let nearestBelow: { id: string; distance: number } | null = null;

      for (const id of sectionIds) {
        const element = document.getElementById(id);
        if (!element) continue;

        const rect = element.getBoundingClientRect();

        if (rect.top <= anchorY && rect.bottom >= anchorY) {
          candidate = id;
          break;
        }

        if (rect.top < anchorY) {
          const distance = anchorY - rect.top;
          if (!nearestAbove || distance < nearestAbove.distance) {
            nearestAbove = { id, distance };
          }
        } else {
          const distance = rect.top - anchorY;
          if (!nearestBelow || distance < nearestBelow.distance) {
            nearestBelow = { id, distance };
          }
        }
      }

      if (!candidate) {
        candidate = nearestBelow?.id || nearestAbove?.id || null;
      }

      if (candidate) {
        const nextHash = `#${candidate}`;
        setCurrentHash((prev) => (prev === nextHash ? prev : nextHash));
      }
    };

    resolveActiveSection();
    window.addEventListener('scroll', resolveActiveSection, { passive: true });
    window.addEventListener('resize', resolveActiveSection);

    return () => {
      window.removeEventListener('scroll', resolveActiveSection);
      window.removeEventListener('resize', resolveActiveSection);
    };
  }, [pathname]);

  const isConnectorsModalOpen = isConnectorsOpen || searchParams.get('connectors') === '1';
  const isCompanyModalOpen = isCompanyOpen || searchParams.get('brand') === '1';
  const isFinanceModalOpen = isFinanceOpen || searchParams.get('financeiro') === '1';

  const closeConnectorsModal = () => {
    setIsConnectorsOpen(false);
    if (searchParams.get('connectors') === '1') {
      router.replace(pathname || '/hub', { scroll: false });
    }
  };

  const closeCompanyModal = () => {
    setIsCompanyOpen(false);
    if (searchParams.get('brand') === '1') {
      router.replace(pathname || '/hub', { scroll: false });
    }
  };

  const closeFinanceModal = () => {
    setIsFinanceOpen(false);
    if (searchParams.get('financeiro') === '1') {
      router.replace(pathname || '/hub', { scroll: false });
    }
  };

  const openProfileModal = () => {
    setIsMenuOpen(false);
    setIsProfileOpen(true);
  };

  const openCompanyModal = () => {
    setIsMenuOpen(false);
    setIsCompanyOpen(true);
  };

  const openFinanceModal = () => {
    setIsMenuOpen(false);
    setIsFinanceOpen(true);
  };

  const handleLogout = () => {
    setIsMenuOpen(false);
    void logout();
  };

  const persistConnectorStatusLocal = useCallback((nextStatus: ConnectorStatus) => {
    if (!user) return;
    const connectorsKey = `neuroads_dashboard_connectors_${user.uid}`;
    window.localStorage.setItem(connectorsKey, JSON.stringify(nextStatus));
  }, [user]);

  const getConnectorOAuthHref = (connectorKey: ConnectorKey, provider?: string) => {
    const params = new URLSearchParams({
      next: `${pathname || '/hub'}?connectors=1`,
    });
    if (provider) {
      params.set('provider', provider);
    }
    return `/api/auth/connectors/${connectorKey}/start?${params.toString()}`;
  };

  const navLinks = pathname?.startsWith('/admin') && isAdmin
    ? [
        { name: 'Administrativo', href: '/admin#operacao-lucca' },
        { name: 'Cadastros', href: '/admin#crm-custom' },
        { name: 'CRM Funil', href: '/admin#crm-funil' },
        { name: 'Agentes', href: '/admin#gestao-agentes' },
        { name: 'Financeiro', href: '/admin#gestao-financeira' },
      ]
      : [
        { name: 'Hub Estratégico', href: '/hub' },
        { name: 'Agentes Ativos', href: '/hub/agentes-ativos' },
      ];
  const laboratorySubLinks = [
    { name: 'Laboratório de Agentes', href: '/hub/laboratorio-agentes?agente=auditor-de-desperdicio' },
    { name: 'Performance', href: '/hub/performance' },
    { name: 'Criativos', href: '/hub/criativos' },
    { name: 'Técnico', href: '/hub/tecnico' },
    { name: 'Inteligência', href: '/hub/inteligencia' },
  ];
  const desktopNavClass = pathname?.startsWith('/admin')
    ? 'hidden md:flex items-center gap-9'
    : 'hidden md:flex items-center gap-10';
  const isAdminContext = pathname?.startsWith('/admin') && isAdmin;
  const isHubNavbarStyle = !pathname?.startsWith('/admin');

  const isLinkActive = (href: string): boolean => {
    if (!pathname) return false;
    const [pathWithQuery, hash] = href.split('#');
    const [basePath] = pathWithQuery.split('?');
    if (basePath === '/hub') {
      return pathname === '/hub' || pathname.startsWith('/hub/agente/');
    }
    if (basePath === '/hub/agentes-ativos') {
      return pathname === '/hub/agentes-ativos' || pathname === '/hub/dashboard';
    }
    if (basePath === '/admin' && hash) {
      return pathname === '/admin' && currentHash === `#${hash}`;
    }
    return pathname === basePath || pathname.startsWith(`${basePath}/`);
  };

  const handleNavLinkClick = (href: string) => {
    const [basePath, hash] = href.split('#');
    if (basePath === '/admin' && hash) {
      setCurrentHash(`#${hash}`);
    }
  };

  const usageCount = profile?.usageStats ? Object.keys(profile.usageStats).length : 0;
  const connectedPlatforms = profile?.connections
    ? Object.values(profile.connections).filter((connection) => connection?.isActive).length
    : 0;
  const requiredConnectors = CONNECTOR_DEFINITIONS.filter((item) => item.required);
  const connectedRequired = requiredConnectors.filter((item) => connectorStatus[item.key]).length;
  const dashboardReadiness = Math.round((connectedRequired / requiredConnectors.length) * 100);
  const contractedAgents = useMemo(() => getContractedAgentsFromProfile(profile), [profile]);
  const agentStatusOverrides = useMemo<AgentStatusOverrides>(
    () => {
      void agentStatusVersion;
      return readAgentStatusOverrides(user?.uid);
    },
    [user?.uid, agentStatusVersion]
  );
  const effectiveContracts = useMemo(() => {
    if (Object.keys(agentStatusOverrides).length === 0) return contractedAgents;

    const merged = new Map(contractedAgents);
    for (const [title, isActive] of Object.entries(agentStatusOverrides)) {
      const current = merged.get(title) ?? { isActive: false };
      merged.set(title, { ...current, isActive });
    }
    return merged;
  }, [contractedAgents, agentStatusOverrides]);
  const activeAgentsCount = useMemo(
    () => Array.from(effectiveContracts.values()).filter((agent) => agent.isActive).length,
    [effectiveContracts]
  );
  const hubProfile = useMemo(() => getHubProfileSummary(profile), [profile]);
  const currentPlanName = useMemo(
    () => Array.from(effectiveContracts.values()).find((agent) => agent.isActive)?.planName ?? 'Lite',
    [effectiveContracts]
  );
  
  const hasUnlimitedAgents = !hubProfile.agentLimit;
  const planCapacity = hubProfile.agentLimit ?? PLAN_AGENT_CAPACITY[currentPlanName] ?? 5;
  const capacityRatio = planCapacity > 0 ? activeAgentsCount / planCapacity : 0;
  const isCapacityAbove80 = hasUnlimitedAgents ? false : capacityRatio >= 0.8;
  const planDisplayLabel = hubProfile.planName ?? (profile?.isPremium ? 'NeuroAds IA Pro' : 'NeuroAds IA Pro');
  const financialPlanName = hubProfile.planName ?? planDisplayLabel;
  const financialPlanAmount = formatCurrencyFromCents(hubProfile.planAmountCents);
  const trialEndsAtLabel = formatDateTime(hubProfile.trialEndsAt);
  const trialRemainingLabel = formatTrialRemaining(hubProfile.trialRemainingMs);
  const activeAutomationsCount = useMemo(() => {
    return getHubAutomationsFromProfile(profile).filter((a) => a.status === 'active').length;
  }, [profile]);

  useEffect(() => {
    if (!user) return;

    const handleOverridesUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<{ uid?: string; overrides?: AgentStatusOverrides }>;
      if (customEvent.detail?.uid !== user.uid) return;
      setAgentStatusVersion((current) => current + 1);
    };

    window.addEventListener(AGENT_STATUS_UPDATED_EVENT, handleOverridesUpdate as EventListener);
    return () => {
      window.removeEventListener(AGENT_STATUS_UPDATED_EVENT, handleOverridesUpdate as EventListener);
    };
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const profileRecord = (profile as Record<string, unknown> | null) ?? null;
    const companyKey = `neuroads_company_profile_${user.uid}`;
    const contactKey = `neuroads_profile_contact_${user.uid}`;
    const connectorsKey = `neuroads_dashboard_connectors_${user.uid}`;
    const connectorsConfigKey = `neuroads_dashboard_connectors_config_${user.uid}`;
    const onboardingRecord = readRecord(profileRecord?.onboarding);
    const profileDetailsRecord = readRecord(profileRecord?.profileDetails);
    const fallbackCompanyForm = {
      companyName: readString(
        profileRecord?.companyName ?? profileRecord?.company ?? onboardingRecord?.companyName ?? onboardingRecord?.company
      ),
      site: normalizeHttpsMaskedUrlInput(
        readString(profileRecord?.site ?? profileRecord?.website ?? onboardingRecord?.site ?? profileDetailsRecord?.site)
      ),
      instagram: readString(profileRecord?.instagram ?? onboardingRecord?.instagram ?? profileDetailsRecord?.instagram),
      linkedin: readString(profileRecord?.linkedin ?? onboardingRecord?.linkedin ?? profileDetailsRecord?.linkedin),
      tiktok: '',
      blog: '',
    };
    const fallbackWhatsapp = readString(profileRecord?.whatsapp ?? onboardingRecord?.whatsapp ?? profileDetailsRecord?.whatsapp);
    let timeoutId: number | undefined;

    try {
      let nextCompanyForm = {
        ...DEFAULT_COMPANY_FORM,
        ...fallbackCompanyForm,
        site: fallbackCompanyForm.site && !isHttpsPlaceholderOnly(fallbackCompanyForm.site)
          ? fallbackCompanyForm.site
          : HTTPS_PREFIX,
      };
      let nextWhatsapp = fallbackWhatsapp;
      let nextConnectorStatus = { ...DEFAULT_CONNECTOR_STATUS };
      let nextConnectorConfig = DEFAULT_CONNECTOR_CONFIG;

      const companyRaw = window.localStorage.getItem(companyKey);
      if (companyRaw) {
        const parsed = JSON.parse(companyRaw) as typeof companyForm;
        nextCompanyForm = {
          companyName: nextCompanyForm.companyName || parsed.companyName || '',
          site:
            !isHttpsPlaceholderOnly(nextCompanyForm.site)
              ? nextCompanyForm.site
              : parsed.site
                ? normalizeHttpsMaskedUrlInput(parsed.site)
                : HTTPS_PREFIX,
          instagram: nextCompanyForm.instagram || parsed.instagram || '',
          linkedin: nextCompanyForm.linkedin || parsed.linkedin || '',
          tiktok: parsed.tiktok || '',
          blog: parsed.blog || '',
        };
      }

      const contactRaw = window.localStorage.getItem(contactKey);
      if (contactRaw) {
        const parsed = JSON.parse(contactRaw) as { whatsapp?: string };
        nextWhatsapp = nextWhatsapp || parsed.whatsapp || fallbackWhatsapp;
      } else {
        nextWhatsapp = fallbackWhatsapp;
      }

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

      const connectorsConfigRaw = window.localStorage.getItem(connectorsConfigKey);
      if (connectorsConfigRaw) {
        const parsed = JSON.parse(connectorsConfigRaw) as Partial<typeof connectorConfig>;
        nextConnectorConfig = normalizeConnectorConfig(parsed);
      }

      timeoutId = window.setTimeout(() => {
        setCompanyForm(nextCompanyForm);
        setWhatsApp(nextWhatsapp);
        setConnectorStatus(nextConnectorStatus);
        setConnectorConfig(nextConnectorConfig);
      }, 0);
    } catch {
      timeoutId = window.setTimeout(() => {
        setWhatsApp(fallbackWhatsapp);
      }, 0);
    }

    return () => {
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
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
      const basePath = pathname || '/hub';
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

    if ((connectorParam === 'metaAds' || connectorParam === 'instagram' || connectorParam === 'ga4' || connectorParam === 'googleAds' || connectorParam === 'searchConsole') && !accountId) {
      const params = new URLSearchParams({
        connector_auth_success: '1',
        connector: connectorParam,
        connector_provider: provider ?? '',
        connector_access_token: accessToken,
      });
      if (refreshToken) {
        params.set('connector_refresh_token', refreshToken);
      }
      if (typeof expiresIn === 'number' && Number.isFinite(expiresIn)) {
        params.set('connector_expires_in', String(expiresIn));
      }
      router.replace(`/hub/conectores?${params.toString()}`, { scroll: false });
      return;
    }

    const connectionKey = CONNECTOR_CONNECTION_KEYS[connectorParam];
    const now = Date.now();
    setConnectorStatus((prev) => {
      const nextStatus = {
        ...prev,
        [connectorParam]: true,
      };
      persistConnectorStatusLocal(nextStatus);
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
  }, [pathname, persistConnectorStatusLocal, router, searchParams, user]);

  const handleSaveCompany = async () => {
    if (!user) return;

    const normalizedSite = normalizeHttpsMaskedUrlInput(companyForm.site);
    const authenticatedEmail = userEmail?.trim() || user.email?.trim() || null;
    const payload = {
      companyName: companyForm.companyName.trim(),
      site: normalizedSite,
      instagram: companyForm.instagram.trim(),
      linkedin: companyForm.linkedin.trim(),
      tiktok: companyForm.tiktok.trim(),
      blog: companyForm.blog.trim(),
      updatedAt: Date.now(),
      ...(authenticatedEmail ? { authEmail: authenticatedEmail, email: authenticatedEmail } : {}),
      onboarding: {
        companyName: companyForm.companyName.trim(),
        site: normalizedSite,
        instagram: companyForm.instagram.trim(),
        linkedin: companyForm.linkedin.trim(),
        tiktok: companyForm.tiktok.trim(),
        blog: companyForm.blog.trim(),
      },
    };

    try {
      const db = getFirebaseDb();
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, payload, { merge: true });
      const companyKey = `neuroads_company_profile_${user.uid}`;
      window.localStorage.setItem(companyKey, JSON.stringify({ ...companyForm, site: normalizedSite }));
      setCompanySaved(true);
      setTimeout(() => setCompanySaved(false), 2200);
      showSettingsToast('Informações da empresa salvas com sucesso.');
      closeCompanyModal();
    } catch (error) {
      console.warn('Falha ao salvar dados da empresa no Firestore:', error);
      showSettingsToast('Não foi possível salvar os dados da empresa.', 'error');
    }
  };

  const handleSaveWhatsApp = async () => {
    if (!user) return;

    const normalizedWhatsapp = whatsApp.trim();
    const authenticatedEmail = userEmail?.trim() || user.email?.trim() || null;
    try {
      const db = getFirebaseDb();
      const userRef = doc(db, 'users', user.uid);
      await setDoc(
        userRef,
        {
          whatsapp: normalizedWhatsapp,
          updatedAt: Date.now(),
          ...(authenticatedEmail ? { authEmail: authenticatedEmail, email: authenticatedEmail } : {}),
          onboarding: {
            whatsapp: normalizedWhatsapp,
          },
        },
        { merge: true }
      );
      const contactKey = `neuroads_profile_contact_${user.uid}`;
      window.localStorage.setItem(contactKey, JSON.stringify({ whatsapp: normalizedWhatsapp }));
      showSettingsToast('WhatsApp atualizado com sucesso.');
      setIsProfileOpen(false);
    } catch (error) {
      console.warn('Falha ao salvar WhatsApp no Firestore:', error);
      showSettingsToast('Não foi possível salvar o WhatsApp.', 'error');
    }
  };

  const handleSaveConnectors = async () => {
    if (!user) return;
    try {
      const connectorsKey = `neuroads_dashboard_connectors_${user.uid}`;
      const connectorsConfigKey = `neuroads_dashboard_connectors_config_${user.uid}`;
      window.localStorage.setItem(connectorsKey, JSON.stringify(connectorStatus));
      window.localStorage.setItem(connectorsConfigKey, JSON.stringify(connectorConfig));
      const db = getFirebaseDb();
      const userRef = doc(db, 'users', user.uid);
      await setDoc(
        userRef,
        {
          connections: {
            [CONNECTOR_CONNECTION_KEYS.crm]: {
              metadata: {
                hubspotPortalId: connectorConfig.hubspotPortalId,
                hubspotPipelineId: connectorConfig.hubspotPipelineId,
                hubspotDealStageId: connectorConfig.hubspotDealStageId,
                hubspotLifecycleStageField: connectorConfig.hubspotLifecycleStageField,
                refreshFrequency: connectorConfig.refreshFrequency,
              },
              updatedAt: Date.now(),
            },
          },
          updatedAt: Date.now(),
        },
        { merge: true }
      );
      setConnectorsSaved(true);
      setTimeout(() => setConnectorsSaved(false), 2200);
      showSettingsToast('Configurações de conectores salvas com sucesso.');
      closeConnectorsModal();
    } catch (error) {
      console.warn('Falha ao salvar configurações locais de conectores:', error);
      showSettingsToast('Não foi possível salvar as configurações de conectores.', 'error');
    }
  };

  const handleConnectorDisconnect = async (connectorKey: ConnectorKey) => {
    if (!user) return;
    setConnectorBusyKey(connectorKey);
    setConnectorError(null);
    setConnectorFeedback(null);

    setConnectorStatus((prev) => {
      const nextStatus = { ...prev, [connectorKey]: false };
      persistConnectorStatusLocal(nextStatus);
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

  const handleConnectorConnect = async (connectorKey: ConnectorKey) => {
    if (!user) return;
    setConnectorBusyKey(connectorKey);
    setConnectorError(null);
    setConnectorFeedback(null);

    if (connectorKey === 'rdStation') {
      const accessToken = window.prompt('RD Station CRM (API v2): informe o Access Token (OAuth2 Bearer)');
      if (!accessToken?.trim()) {
        setConnectorBusyKey(null);
        return;
      }

      const refreshToken = window.prompt('RD Station CRM (opcional): informe o Refresh Token');
      const webhookId = window.prompt('RD Station CRM (opcional): informe o ID do webhook cadastrado no RD');

      const now = Date.now();
      const connectionKey = CONNECTOR_CONNECTION_KEYS.rdStation;
      setConnectorStatus((prev) => {
        const nextStatus = { ...prev, rdStation: true };
        persistConnectorStatusLocal(nextStatus);
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
              accessToken: accessToken.trim(),
              refreshToken: refreshToken?.trim() || null,
              metadata: {
                authMode: 'oauth2-bearer',
                webhookId: webhookId?.trim() || null,
              },
              connectedAt: now,
              updatedAt: now,
            },
          },
          updatedAt: now,
        },
        { merge: true }
      );
      setConnectorFeedback('RD Station CRM configurado com OAuth2 Bearer e salvo com sucesso.');
      } catch (connectError) {
        console.warn('Falha ao salvar integração RD Station CRM:', connectError);
        setConnectorError('Não foi possível salvar a integração do RD Station CRM no banco.');
      } finally {
        setConnectorBusyKey(null);
      }
      return;
    }

    if (connectorKey === 'rdStationMarketing') {
      const publicToken = window.prompt('RD Station Marketing: informe o Token Público');
      if (!publicToken?.trim()) {
        setConnectorBusyKey(null);
        return;
      }

      const privateToken = window.prompt('RD Station Marketing: informe o Token Privado');
      if (!privateToken?.trim()) {
        setConnectorBusyKey(null);
        return;
      }

      const now = Date.now();
      const connectionKey = CONNECTOR_CONNECTION_KEYS.rdStationMarketing;
      setConnectorStatus((prev) => {
        const nextStatus = { ...prev, rdStationMarketing: true };
        persistConnectorStatusLocal(nextStatus);
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
                accessToken: privateToken.trim(),
                refreshToken: null,
                metadata: {
                  publicToken: publicToken.trim(),
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
        setConnectorFeedback('Credenciais RD Station Marketing salvas e integração ativada.');
      } catch (connectError) {
        console.warn('Falha ao salvar integração RD Station Marketing:', connectError);
        setConnectorError('Não foi possível salvar a integração RD Station Marketing no banco.');
      } finally {
        setConnectorBusyKey(null);
      }
      return;
    }

    if (connectorKey === 'rdStationConversas') {
      setConnectorBusyKey(null);
      const webhookUrl = `${(process.env.NEXT_PUBLIC_APP_URL || 'https://neuroads.com.br').replace(/\/+$/g, '')}/api/webhooks/rd-station/conversas`;
      setConnectorFeedback(
        `Configure o webhook RD Conversas com método POST em ${webhookUrl} e depois clique novamente para marcar ativo.`
      );
      return;
    }

    const oauthProvider = OAUTH_CONNECTOR_PROVIDERS[connectorKey];
    if (oauthProvider) {
      window.location.href = getConnectorOAuthHref(connectorKey, oauthProvider);
      return;
    }

    // Conector sem OAuth nativo (ex.: GTM Server + CAPI): salva configuração manual.
    const now = Date.now();
    const connectionKey = CONNECTOR_CONNECTION_KEYS[connectorKey];
    const metadata = {
      hubspotPortalId: connectorConfig.hubspotPortalId,
      hubspotPipelineId: connectorConfig.hubspotPipelineId,
      hubspotDealStageId: connectorConfig.hubspotDealStageId,
      hubspotLifecycleStageField: connectorConfig.hubspotLifecycleStageField,
      refreshFrequency: connectorConfig.refreshFrequency,
    };

    setConnectorStatus((prev) => {
      const nextStatus = { ...prev, [connectorKey]: true };
      persistConnectorStatusLocal(nextStatus);
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
              provider: 'manual',
              connectedAt: now,
              updatedAt: now,
              metadata,
            },
          },
          updatedAt: now,
        },
        { merge: true }
      );
      setConnectorFeedback('Conector manual ativado e salvo com sucesso.');
    } catch (connectError) {
      console.warn('Falha ao conectar conector manual:', connectError);
      setConnectorError('Conector ativado localmente, mas houve falha ao salvar no banco.');
    } finally {
      setConnectorBusyKey(null);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user || isDeletingAccount) return;

    const firstConfirmation = window.confirm(
      'Tem certeza que deseja excluir sua conta? Esta ação vai cancelar seu plano e remover seus dados do banco.'
    );
    if (!firstConfirmation) return;

    const secondConfirmation = window.confirm(
      'Confirmação final: esta ação é irreversível. Deseja continuar com a exclusão da conta?'
    );
    if (!secondConfirmation) return;

    setDeleteAccountError(null);
    setIsDeletingAccount(true);

    const deletionFlagKey = `${ACCOUNT_DELETE_FLAG_PREFIX}${user.uid}`;
    const profileRecord = (profile as Record<string, unknown> | null) ?? null;
    const onboardingRecord = readRecord(profileRecord?.onboarding);
    const stripeCustomerId = readString(profileRecord?.stripeCustomerId ?? onboardingRecord?.stripeCustomerId);
    const stripeSubscriptionId = readString(profileRecord?.stripeSubscriptionId ?? onboardingRecord?.stripeSubscriptionId);
    const normalizedEmail = (userEmail?.trim() || user.email?.trim() || readString(profileRecord?.email || profileRecord?.authEmail) || null);

    if (typeof window !== 'undefined') {
      window.localStorage.setItem(deletionFlagKey, '1');
    }

    try {
      const token = await user.getIdToken();
      const response = await fetch('/api/account/delete', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uid: user.uid,
          email: normalizedEmail,
          stripeCustomerId,
          stripeSubscriptionId,
          onboardingStripeSubscriptionId: readString(onboardingRecord?.stripeSubscriptionId),
        }),
      });

      const data = (await response.json().catch(() => null)) as { error?: string } | null;
      if (!response.ok) {
        throw new Error(data?.error || 'Não foi possível concluir a exclusão da conta.');
      }

      const db = getFirebaseDb();
      const userRef = doc(db, 'users', user.uid);

      // Remove subcoleções usadas no Hub antes de apagar o documento principal.
      const userSubcollections = ['agent_reports'];
      for (const subcollectionName of userSubcollections) {
        const snapshot = await getDocs(collection(db, 'users', user.uid, subcollectionName));
        await Promise.all(snapshot.docs.map((entry) => deleteDoc(entry.ref)));
      }

      await deleteDoc(userRef);

      try {
        await user.delete();
      } catch (deleteAuthError) {
        const errorCode =
          deleteAuthError && typeof deleteAuthError === 'object' && 'code' in deleteAuthError
            ? String((deleteAuthError as { code?: unknown }).code ?? '')
            : '';

        if (errorCode !== 'auth/requires-recent-login') {
          throw deleteAuthError;
        }
      }

      if (typeof window !== 'undefined') {
        const keysToClear = [
          `neuroads_company_profile_${user.uid}`,
          `neuroads_profile_contact_${user.uid}`,
          `neuroads_dashboard_connectors_${user.uid}`,
          `neuroads_dashboard_connectors_config_${user.uid}`,
          `neuroads_auth_email_${user.uid}`,
          deletionFlagKey,
        ];
        keysToClear.forEach((key) => window.localStorage.removeItem(key));
      }

      setIsProfileOpen(false);
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Falha ao excluir conta:', error);
      setDeleteAccountError(
        error instanceof Error ? error.message : 'Não foi possível excluir sua conta agora. Tente novamente.'
      );
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(deletionFlagKey);
      }
    } finally {
      setIsDeletingAccount(false);
    }
  };

  const handleManagePlan = async () => {
    if (!user || isManagingPlan) return;

    setIsManagingPlan(true);
    try {
      const token = await user.getIdToken();
      const returnUrl = typeof window !== 'undefined' ? `${window.location.origin}/hub?financeiro=1` : '/hub';

      const response = await fetch('/api/stripe/customer-portal', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ returnUrl }),
      });

      const data = (await response.json().catch(() => null)) as { url?: string; error?: string } | null;
      if (!response.ok || !data?.url) {
        throw new Error(data?.error || 'Não foi possível abrir o gerenciamento do plano.');
      }

      if (typeof window !== 'undefined') {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Não foi possível acessar o gerenciamento do plano agora.';
      showSettingsToast(message, 'error');
    } finally {
      setIsManagingPlan(false);
    }
  };

  return (
    <Fragment>
      <header
      className={
        isHubNavbarStyle
          ? 'fixed left-1/2 top-4 z-[200] w-[min(calc(100%-1.5rem),1196px)] -translate-x-1/2 sm:w-[min(calc(100%-2.5rem),1196px)]'
          : 'fixed top-0 left-0 w-full z-[200] pt-3 px-4 lg:px-6'
      }
    >
      <nav className="relative z-30">
        <div
          className={
            isHubNavbarStyle
              ? 'flex items-center justify-between rounded-full border border-[#ff6a00]/30 bg-[#ff6a00]/15 backdrop-blur-xl px-4 py-3 shadow-[0_12px_40px_rgba(255,106,0,0.15)] transition-all duration-500 sm:px-5 md:px-7'
              : 'flex items-center justify-between rounded-[32px] border border-[#E7EAF0] bg-white px-6 py-3 shadow-[0_10px_28px_rgba(15,23,42,0.06)] transition-all duration-500 lg:px-10'
          }
        >
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center group transition-transform duration-300 hover:scale-[1.01]">
              <Image
                src="/images/logo2026.png"
                alt="NeuroAds Logo"
                width={192}
                height={48}
                className={isHubNavbarStyle ? 'h-8 w-auto object-contain' : 'h-9 w-auto object-contain lg:h-10'}
              />
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className={`${desktopNavClass} flex-1 justify-center px-8`}>
            {isAdminContext ? (
              navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => handleNavLinkClick(link.href)}
                  className={`transition-colors duration-200 ${
                    isHubNavbarStyle
                      ? 'inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[13px] font-semibold'
                      : 'text-[15px] leading-none font-semibold'
                  } ${
                    isLinkActive(link.href) ? 'text-[#0A9D57]' : isHubNavbarStyle ? 'text-slate-300 hover:text-[#FF6A00]' : 'text-[#5f6572] hover:text-[#1c2230]'
                  }`}
                >
                  {link.name}
                </Link>
              ))
            ) : (
              <>
              <Link
                href="/hub"
                className={`transition-colors duration-200 ${
                  isHubNavbarStyle
                    ? 'inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[13px] font-semibold'
                    : 'text-[15px] leading-none font-semibold'
                } ${
                  isLinkActive('/hub') 
                    ? 'text-[#0A9D57]' 
                    : isHubNavbarStyle 
                      ? 'text-slate-300 hover:text-[#FF6A00]' 
                      : 'text-[#5f6572] hover:text-[#FF6A00]'
                  }`}
                >
                  Hub Estratégico
                </Link>
                <div className="relative group">
                  <button
                    type="button"
                    className={`inline-flex items-center gap-1 text-[13px] font-semibold transition-colors duration-200 ${
                      isHubNavbarStyle ? 'rounded-full px-2 py-1 text-slate-300 group-hover:text-[#FF6A00]' : 'text-[#344054] group-hover:text-[#FF6A00]'
                    }`}
                  >
                    Agentes IA
                    <ChevronDown size={14} />
                  </button>
                  <div className={`invisible absolute left-1/2 top-full z-[120] mt-3 w-[300px] -translate-x-1/2 rounded-2xl border p-2 opacity-0 shadow-[0_14px_30px_rgba(15,23,42,0.12)] transition-all duration-150 group-hover:visible group-hover:opacity-100 ${
                    isHubNavbarStyle ? 'bg-[#081120] border-[#122034] shadow-[0_14px_30px_rgba(2,8,22,0.4)]' : 'bg-white border-[#E7EAF0]'
                  }`}>
                    {laboratorySubLinks.map((link, index) => (
                      <div key={link.name}>
                        <Link
                          href={link.href}
                          className={`block w-full rounded-xl px-3 py-2 text-left text-[14px] font-semibold transition-colors ${
                            isLinkActive(link.href)
                              ? isHubNavbarStyle ? 'text-[#FF6A00] bg-[#122034]' : 'text-[#FF6A00] bg-[#F3F4F6]'
                              : isHubNavbarStyle ? 'text-slate-300 hover:bg-[#122034] hover:text-[#FF6A00]' : 'text-[#344054] hover:bg-[#F8FAFC] hover:text-[#FF6A00]'
                          }`}
                        >
                          {link.name}
                        </Link>
                        {index === 0 ? <div className={`my-2 h-px w-full ${isHubNavbarStyle ? 'bg-[#122034]' : 'bg-[#E5E7EB]'}`} /> : null}
                      </div>
                    ))}
                  </div>
                </div>
                <Link
                  href="/hub/agentes-ativos"
                  className={`transition-colors duration-200 ${
                    isHubNavbarStyle
                      ? 'inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[13px] font-semibold'
                      : 'text-[15px] leading-none font-semibold'
                  } ${
                    isLinkActive('/hub/agentes-ativos') 
                      ? 'text-[#0A9D57]' 
                      : isHubNavbarStyle 
                        ? 'text-slate-300 hover:text-[#FF6A00]' 
                        : 'text-[#5f6572] hover:text-[#FF6A00]'
                  }`}
                >
                  Agentes Ativos
                </Link>
                <Link
                  href="/hub/automacoes"
                  className={`transition-colors duration-200 ${
                    isHubNavbarStyle
                      ? 'inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[13px] font-semibold'
                      : 'text-[15px] leading-none font-semibold'
                  } ${
                    isLinkActive('/hub/automacoes') 
                      ? 'text-[#0A9D57]' 
                      : isHubNavbarStyle 
                        ? 'text-slate-300 hover:text-[#FF6A00]' 
                        : 'text-[#5f6572] hover:text-[#FF6A00]'
                  }`}
                >
                  Automações
                </Link>
                <div className="relative group">
                  <button
                    type="button"
                    className={`inline-flex items-center gap-1 text-[13px] font-semibold transition-colors duration-200 ${
                      isHubNavbarStyle
                        ? 'rounded-full px-2 py-1 text-slate-300 group-hover:text-[#FF6A00]'
                        : 'text-[#344054] group-hover:text-[#FF6A00]'
                    }`}
                  >
                    Configurações
                    <ChevronDown size={14} />
                  </button>
                  <div className={`invisible absolute left-1/2 top-full z-[120] mt-3 w-[300px] -translate-x-1/2 rounded-2xl border p-2 opacity-0 shadow-[0_14px_30px_rgba(15,23,42,0.12)] transition-all duration-150 group-hover:visible group-hover:opacity-100 ${
                    isHubNavbarStyle ? 'bg-[#081120] border-[#122034] shadow-[0_14px_30px_rgba(2,8,22,0.4)]' : 'bg-white border-[#E7EAF0]'
                  }`}>
                      <Link
                        href="/hub/configuracoes?tab=perfil"
                        className={`block w-full rounded-xl px-3 py-2 text-left text-[14px] font-semibold transition-colors ${
                          isHubNavbarStyle ? 'text-slate-300 hover:bg-[#122034] hover:text-[#FF6A00]' : 'text-[#344054] hover:bg-[#F8FAFC] hover:text-[#FF6A00]'
                        }`}
                      >
                        Meu perfil
                      </Link>
                      <Link
                        href="/hub/conectores"
                        className={`block w-full rounded-xl px-3 py-2 text-left text-[14px] font-semibold transition-colors ${
                          isHubNavbarStyle ? 'text-slate-300 hover:bg-[#122034] hover:text-[#FF6A00]' : 'text-[#344054] hover:bg-[#F8FAFC] hover:text-[#FF6A00]'
                        }`}
                      >
                        Conectores
                      </Link>
                      <Link
                        href="/hub/configuracoes?tab=empresa"
                        className={`block w-full rounded-xl px-3 py-2 text-left text-[14px] font-semibold transition-colors ${
                          isHubNavbarStyle ? 'text-slate-300 hover:bg-[#122034] hover:text-[#FF6A00]' : 'text-[#344054] hover:bg-[#F8FAFC] hover:text-[#FF6A00]'
                        }`}
                      >
                        Sua Empresa
                      </Link>
                      <Link
                        href="/hub/configuracoes?tab=financeiro"
                        className={`block w-full rounded-xl px-3 py-2 text-left text-[14px] font-semibold transition-colors ${
                          isHubNavbarStyle ? 'text-slate-300 hover:bg-[#122034] hover:text-[#FF6A00]' : 'text-[#344054] hover:bg-[#F8FAFC] hover:text-[#FF6A00]'
                        }`}
                      >
                        Financeiro
                      </Link>
                      <div className={`my-2 h-px w-full ${isHubNavbarStyle ? 'bg-[#122034]' : 'bg-[#E5E7EB]'}`} />
                      <button
                        onClick={handleLogout}
                        className={`w-full rounded-xl px-3 py-2 text-left text-[14px] font-semibold transition-colors ${
                          isHubNavbarStyle ? 'text-red-400 hover:bg-[#122034]' : 'text-red-500 hover:bg-red-50'
                        }`}
                      >
                        Sair
                      </button>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {!pathname?.startsWith('/admin') && (
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-black ${
                  isHubNavbarStyle
                    ? 'text-[#FF6A00] bg-[#FF6A00]/10 border border-[#FF6A00]/20 shadow-[0_0_14px_rgba(255,106,0,0.15)] animate-pulse'
                    : isCapacityAbove80
                      ? 'text-[#C2410C] shadow-[0_0_0_1px_rgba(245,158,11,0.30),0_0_14px_rgba(245,158,11,0.35)] animate-pulse'
                      : 'text-[#0A9D57] shadow-[0_0_0_1px_rgba(10,157,87,0.25),0_0_14px_rgba(10,157,87,0.30)] animate-pulse'
                }`}
              >
                Agentes Ativos: {String(activeAgentsCount).padStart(2, '0')} {hasUnlimitedAgents ? `de ${String(agents.length).padStart(2, '0')}` : `de ${String(planCapacity).padStart(2, '0')}`}
              </span>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={
                isHubNavbarStyle
                  ? 'inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#122034] bg-[#081120]/60 p-0 text-slate-300 transition hover:border-[#FF6A00]/50 hover:text-[#FF6A00] focus:outline-none'
                  : 'p-2 text-text-main focus:outline-none'
              }
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 8h16M4 16h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {isHubNavbarStyle && user && (
        <div className={`hidden md:flex items-center justify-between w-full rounded-2xl border border-white/15 bg-gradient-to-r from-[#032918]/70 to-[#085C34]/70 backdrop-blur-xl px-8 shadow-[0_12px_40px_rgba(3,41,24,0.3)] select-none transition-all duration-300 ease-in-out transform origin-top relative z-10 ${
          isMetricsVisible 
            ? 'max-h-24 my-2.5 py-3 opacity-100 translate-y-0' 
            : 'max-h-0 my-0 py-0 opacity-0 -translate-y-6 pointer-events-none'
        }`}>
          {/* Item 1: Empresa */}
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15 text-white flex-shrink-0">
              <Building2 size={16} />
            </div>
            <div className="flex flex-col relative">
              <p className="text-[10px] font-black uppercase tracking-wider text-white/75 leading-none">Empresa</p>
              <p className="mt-1 text-sm font-black text-white leading-none">{companyForm.companyName || 'Sua Empresa'}</p>
              
              {isSuperAdmin && (
                <div ref={companySelectorRef} className="relative mt-1 flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setIsCompanySelectorOpen((prev) => !prev)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 hover:bg-white/20 px-2.5 py-1 text-[10px] font-bold text-white transition-all duration-200 shadow-sm cursor-pointer whitespace-nowrap"
                  >
                    <Building2 size={11} className="text-white/80" />
                    <span className="max-w-[120px] truncate">
                      {displayCompanies.find((c) => c.uid === actingUid)?.companyName || 'Selecionar Empresa'}
                    </span>
                    <ChevronDown size={10} className={`text-white/80 transition-transform duration-200 ${isCompanySelectorOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <button
                    type="button"
                    onClick={handleRefreshCompanies}
                    disabled={isRefreshingCompanies}
                    title="Atualizar lista de empresas"
                    className="inline-flex h-[22px] w-[22px] items-center justify-center rounded-full border border-white/15 bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-all duration-200 shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <RefreshCw size={10} className={`${isRefreshingCompanies ? 'animate-spin' : ''}`} />
                  </button>

                  {isCompanySelectorOpen && (
                    <>
                      <div className="absolute left-0 top-full z-[150] mt-2 w-[280px] rounded-2xl border border-white/10 bg-[#081120] p-2 shadow-[0_12px_30px_rgba(2,8,22,0.4)] animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400">
                          Empresas Cadastradas ({displayCompanies.length})
                        </div>
                        
                        <div className="my-1.5 h-px w-full bg-white/10" />
                        
                        <div className="max-h-[220px] overflow-y-auto space-y-0.5 custom-scrollbar">
                          {actingUid && (
                            <button
                              type="button"
                              onClick={() => {
                                setActingUid(null);
                                setIsCompanySelectorOpen(false);
                              }}
                              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-black text-[#FF6B00] hover:bg-[#FF6B00]/10 transition-colors"
                            >
                              <Building2 size={13} />
                              Restaurar Painel Original
                            </button>
                          )}
                          
                          {displayCompanies.map((company) => (
                            <button
                              key={company.uid}
                              type="button"
                              onClick={() => {
                                setActingUid(company.uid);
                                setIsCompanySelectorOpen(false);
                              }}
                              className={`flex w-full flex-col rounded-xl px-3 py-2 text-left transition-colors ${
                                actingUid === company.uid
                                  ? 'bg-[#FF6B00]/10 text-[#FF6B00]'
                                  : 'hover:bg-[#122034] text-slate-200'
                              }`}
                            >
                              <span className="text-xs font-bold truncate">{company.companyName}</span>
                              <span className="text-[10px] text-slate-400 truncate">{company.email}</span>
                            </button>
                          ))}

                          {displayCompanies.length === 0 && (
                            <div className="px-3 py-4 text-center text-xs font-bold text-slate-400">
                              Nenhuma empresa cadastrada.
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Separator */}
          <div className="h-6 w-px bg-white/20" />

          {/* Item 2: Plano Ativo */}
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15 text-white">
              <Crown size={16} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-white/75 leading-none">Plano Ativo</p>
              <p className="mt-1 text-sm font-black text-white leading-none">{planDisplayLabel}</p>
            </div>
          </div>

          {/* Separator */}
          <div className="h-6 w-px bg-white/20" />

          {/* Item 3: Limite Disponível */}
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15 text-white">
              <ShieldCheck size={16} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-white/75 leading-none">Agentes Disponíveis</p>
              <p className="mt-1 text-sm font-bold text-white leading-none">
                {hubProfile.agentLimit ? `${planCapacity - activeAgentsCount} de ${planCapacity} livres` : `${String(agents.length).padStart(2, '0')} Agentes`}
              </p>
            </div>
          </div>

          {/* Separator */}
          <div className="h-6 w-px bg-white/20" />

          {/* Item 4: Automações Ativas */}
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15 text-white">
              <Workflow size={16} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-white/75 leading-none">Automações Ativas</p>
              <p className="mt-1 text-sm font-bold text-white leading-none">
                {activeAutomationsCount} {activeAutomationsCount === 1 ? 'ativa' : 'ativas'}
              </p>
            </div>
          </div>
        </div>
      )}

      {isHubNavbarStyle && isMenuOpen ? (
        <button
          type="button"
          aria-label="Fechar menu mobile"
          className="fixed inset-0 z-[185] bg-[#0e1830]/35 md:hidden"
          onClick={() => setIsMenuOpen(false)}
        />
      ) : null}

      {/* Mobile Menu */}
      <div
        className={`md:hidden z-[210] overflow-y-auto transition-all duration-300 ${
          isHubNavbarStyle
            ? 'fixed left-1/2 top-[84px] max-h-[calc(100dvh-108px)] w-[min(calc(100%-1.5rem),460px)] -translate-x-1/2 rounded-[20px] p-4 border border-[#122034] bg-[#040a13]/95 backdrop-blur-md text-white shadow-[0_20px_50px_rgba(2,8,22,0.5)] sm:w-[min(calc(100%-2.5rem),460px)]'
            : 'absolute top-24 left-4 right-4 max-h-[calc(100dvh-120px)] rounded-[24px] p-5 bg-white border border-border shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)]'
        } ${isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}
      >
        <div className="w-full space-y-2">
          {isAdminContext ? (
            navLinks.map((link) => (
              <div key={link.name} className={`rounded-[14px] border transition-all ${
                isHubNavbarStyle
                  ? 'border-[#122034] bg-[#081120]/60 hover:bg-[#122034]/60 hover:border-[#FF6A00]/30'
                  : 'border-[#edf1f7] bg-[#fafcff] hover:bg-[#fff5ee]'
              }`}>
                <div className="flex items-center gap-2 px-3.5 py-3">
                  <Link
                    href={link.href}
                    onClick={() => {
                      handleNavLinkClick(link.href);
                      setIsMenuOpen(false);
                    }}
                    className={`grow text-[14px] font-black ${
                      isHubNavbarStyle ? 'text-slate-200 hover:text-[#FF6A00]' : 'text-[#1f2a44]'
                    }`}
                  >
                    {link.name}
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <>
              {/* Hub Estratégico */}
              <div className={`rounded-[14px] border transition-all ${
                isHubNavbarStyle
                  ? 'border-[#122034] bg-[#081120]/60 hover:bg-[#122034]/60 hover:border-[#FF6A00]/30'
                  : 'border-[#edf1f7] bg-[#fafcff] hover:bg-[#fff5ee]'
              }`}>
                <div className="flex items-center gap-2 px-3.5 py-3">
                  <Link
                    href="/hub"
                    onClick={() => setIsMenuOpen(false)}
                    className={`grow text-[14px] font-black ${
                      isHubNavbarStyle ? 'text-slate-200 hover:text-[#FF6A00]' : 'text-[#1f2a44]'
                    }`}
                  >
                    Hub Estratégico
                  </Link>
                </div>
              </div>

              {/* Agentes IA */}
              <div className={`rounded-[14px] border transition-all ${
                isHubNavbarStyle
                  ? 'border-[#122034] bg-[#081120]/60'
                  : 'border-[#edf1f7] bg-[#fafcff]'
              }`}>
                <div className="flex items-center justify-between px-3.5 py-3">
                  <Link
                    href="/hub"
                    onClick={() => setIsMenuOpen(false)}
                    className={`grow text-[14px] font-black ${
                      isHubNavbarStyle ? 'text-slate-200 hover:text-[#FF6A00]' : 'text-[#1f2a44]'
                    }`}
                  >
                    Agentes IA
                  </Link>
                  <button
                    type="button"
                    onClick={() => setIsLabSubmenuOpen((prev) => !prev)}
                    className={`inline-flex h-7 w-7 items-center justify-center rounded-full border transition-all ${
                      isHubNavbarStyle
                        ? 'border-[#122034] bg-[#081120] text-slate-300 hover:text-[#ff6a00] hover:border-[#FF6A00]/30'
                        : 'border-[#dde4ee] text-[#7d889d] hover:text-[#ff6a00] hover:border-[#ffc8a5]'
                    }`}
                    aria-label="Abrir submenu Agentes IA"
                  >
                    <ChevronDown size={15} className={`shrink-0 transition-transform duration-300 ${isLabSubmenuOpen ? 'rotate-180' : ''}`} />
                  </button>
                </div>
                {isLabSubmenuOpen && (
                  <div className={`border-t px-2 py-2 space-y-1 rounded-b-[14px] ${
                    isHubNavbarStyle ? 'border-[#122034] bg-[#040a13]' : 'border-[#edf1f7] bg-white'
                  }`}>
                    {laboratorySubLinks.map((link, index) => (
                      <div key={link.name}>
                        <Link
                          href={link.href}
                          onClick={() => setIsMenuOpen(false)}
                          className={`block rounded-xl px-3 py-2 text-[13px] font-semibold transition ${
                            isLinkActive(link.href)
                              ? isHubNavbarStyle ? 'bg-[#122034] text-[#FF6A00]' : 'bg-[#F3F4F6] text-[#FF6A00]'
                              : isHubNavbarStyle ? 'text-slate-300 hover:bg-[#122034] hover:text-[#FF6A00]' : 'text-[#42506a] hover:bg-[#fff5ee] hover:text-[#ff6a00]'
                          }`}
                        >
                          {link.name}
                        </Link>
                        {index === 0 ? <div className={`my-1.5 h-px w-full ${isHubNavbarStyle ? 'bg-[#122034]' : 'bg-[#E5E7EB]'}`} /> : null}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Agentes Ativos */}
              <div className={`rounded-[14px] border transition-all ${
                isHubNavbarStyle
                  ? 'border-[#122034] bg-[#081120]/60 hover:bg-[#122034]/60 hover:border-[#FF6A00]/30'
                  : 'border-[#edf1f7] bg-[#fafcff] hover:bg-[#fff5ee]'
              }`}>
                <div className="flex items-center gap-2 px-3.5 py-3">
                  <Link
                    href="/hub/agentes-ativos"
                    onClick={() => setIsMenuOpen(false)}
                    className={`grow text-[14px] font-black ${
                      isHubNavbarStyle ? 'text-slate-200 hover:text-[#FF6A00]' : 'text-[#1f2a44]'
                    }`}
                  >
                    Agentes Ativos
                  </Link>
                </div>
              </div>

              {/* Automações */}
              <div className={`rounded-[14px] border transition-all ${
                isHubNavbarStyle
                  ? 'border-[#122034] bg-[#081120]/60 hover:bg-[#122034]/60 hover:border-[#FF6A00]/30'
                  : 'border-[#edf1f7] bg-[#fafcff] hover:bg-[#fff5ee]'
              }`}>
                <div className="flex items-center gap-2 px-3.5 py-3">
                  <Link
                    href="/hub/automacoes"
                    onClick={() => setIsMenuOpen(false)}
                    className={`grow text-[14px] font-black ${
                      isHubNavbarStyle ? 'text-slate-200 hover:text-[#FF6A00]' : 'text-[#1f2a44]'
                    }`}
                  >
                    Automações
                  </Link>
                </div>
              </div>
            </>
          )}

          {user && (
            <div className={`pt-4 mt-2 border-t w-full ${isHubNavbarStyle ? 'border-[#122034]' : 'border-[#edf1f7]'}`}>
              <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#ff6a00] text-center mb-4">
                {getGreeting()}, {getFirstName(user.displayName || user.email)}!
              </p>
              
              <div className="grid gap-2">
                <Link
                  href="/hub/configuracoes?tab=perfil"
                  onClick={() => setIsMenuOpen(false)}
                  className={`block w-full py-3.5 rounded-full border px-5 text-center text-[12px] font-extrabold uppercase tracking-wider transition-all ${
                    isHubNavbarStyle
                      ? 'border-[#122034] bg-[#081120] text-slate-300 hover:bg-[#122034] hover:text-[#FF6A00]'
                      : 'border-slate-100 bg-[#F8FAFC]/60 text-[#334155] hover:bg-[#F1F5F9] hover:text-[#0F172A]'
                  }`}
                >
                  Meu perfil
                </Link>
                <Link
                  href="/hub/conectores"
                  onClick={() => setIsMenuOpen(false)}
                  className={`block w-full py-3.5 rounded-full border px-5 text-center text-[12px] font-extrabold uppercase tracking-wider transition-all ${
                    isHubNavbarStyle
                      ? 'border-[#122034] bg-[#081120] text-slate-300 hover:bg-[#122034] hover:text-[#FF6A00]'
                      : 'border-slate-100 bg-[#F8FAFC]/60 text-[#334155] hover:bg-[#F1F5F9] hover:text-[#0F172A]'
                  }`}
                >
                  Conectores
                </Link>
                <Link
                  href="/hub/configuracoes?tab=empresa"
                  onClick={() => setIsMenuOpen(false)}
                  className={`block w-full py-3.5 rounded-full border px-5 text-center text-[12px] font-extrabold uppercase tracking-wider transition-all ${
                    isHubNavbarStyle
                      ? 'border-[#122034] bg-[#081120] text-slate-300 hover:bg-[#122034] hover:text-[#FF6A00]'
                      : 'border-slate-100 bg-[#F8FAFC]/60 text-[#334155] hover:bg-[#F1F5F9] hover:text-[#0F172A]'
                  }`}
                >
                  Sua empresa
                </Link>
                <Link
                  href="/hub/configuracoes?tab=financeiro"
                  onClick={() => setIsMenuOpen(false)}
                  className={`block w-full py-3.5 rounded-full border px-5 text-center text-[12px] font-extrabold uppercase tracking-wider transition-all ${
                    isHubNavbarStyle
                      ? 'border-[#122034] bg-[#081120] text-slate-300 hover:bg-[#122034] hover:text-[#FF6A00]'
                      : 'border-slate-100 bg-[#F8FAFC]/60 text-[#334155] hover:bg-[#F1F5F9] hover:text-[#0F172A]'
                  }`}
                >
                  Financeiro
                </Link>
                <button
                  onClick={handleLogout}
                  className={`w-full py-3.5 rounded-full border px-5 text-center text-[12px] font-extrabold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                    isHubNavbarStyle
                      ? 'border-red-950/20 bg-rose-950/20 text-rose-400 hover:bg-rose-900/30'
                      : 'border-red-100 bg-rose-50/50 text-red-500 hover:bg-rose-100/50'
                  }`}
                >
                  <LogOut size={14} /> Sair
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>



      {settingsToast ? (
        <div
          className={`${SETTINGS_TOAST_BASE} ${
            settingsToast.variant === 'success'
              ? 'border border-[#BDE8CF] bg-[#ECFDF3] text-[#0A9D57]'
              : 'border border-[#FECACA] bg-[#FEF2F2] text-[#B42318]'
          }`}
          role="status"
          aria-live="polite"
        >
          {settingsToast.message}
        </div>
      ) : null}
    </Fragment>
  );
}

