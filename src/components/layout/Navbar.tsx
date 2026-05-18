'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useCallback, useEffect, useMemo, useRef, useState, Fragment } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { collection, deleteDoc, doc, getDocs, setDoc } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import { ChevronDown, User, LogOut, X, PlugZap, CheckCircle2, Database, Gauge, AlertTriangle, CreditCard } from 'lucide-react';
import { getFirebaseDb } from '../../lib/firebase';
import { HTTPS_PREFIX, isHttpsPlaceholderOnly, normalizeHttpsMaskedUrlInput } from '../../lib/url-mask';
import { getContractedAgentsFromProfile } from '../../lib/hub-agents';
import { getHubProfileSummary } from '../../lib/hub-profile';
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
  timezone: 'America/Sao_Paulo',
  currency: 'BRL',
  attributionWindow: '7d-click / 1d-view',
  refreshFrequency: '15 min',
};

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
  metaAds: 'meta',
  linkedinAds: 'linkedin',
  ga4: 'google',
  crm: 'hubspot',
  payments: 'stripe',
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

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLabSubmenuOpen, setIsLabSubmenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
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
  const [deleteAccountError, setDeleteAccountError] = useState<string | null>(null);
  const { user, userEmail, profile, logout, isAdmin } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentHash, setCurrentHash] = useState('');
  const settingsMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isSettingsOpen) return;

    const handleOutsidePointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (settingsMenuRef.current && !settingsMenuRef.current.contains(target)) {
        setIsSettingsOpen(false);
      }
    };

    document.addEventListener('pointerdown', handleOutsidePointerDown);
    return () => {
      document.removeEventListener('pointerdown', handleOutsidePointerDown);
    };
  }, [isSettingsOpen]);

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
    setIsSettingsOpen(false);
    setIsMenuOpen(false);
    setIsProfileOpen(true);
  };

  const openConnectorsModal = () => {
    setIsSettingsOpen(false);
    setIsMenuOpen(false);
    setIsConnectorsOpen(true);
  };

  const openCompanyModal = () => {
    setIsSettingsOpen(false);
    setIsMenuOpen(false);
    setIsCompanyOpen(true);
  };

  const openFinanceModal = () => {
    setIsSettingsOpen(false);
    setIsMenuOpen(false);
    setIsFinanceOpen(true);
  };

  const handleLogout = () => {
    setIsSettingsOpen(false);
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
  const planCapacity = hubProfile.agentLimit ?? PLAN_AGENT_CAPACITY[currentPlanName] ?? 5;
  const capacityRatio = planCapacity > 0 ? activeAgentsCount / planCapacity : 0;
  const isCapacityAbove80 = capacityRatio >= 0.8;
  const planDisplayLabel = hubProfile.planName ?? (profile?.isPremium ? 'Premium' : 'Padrão');
  const financialPlanName = hubProfile.planName ?? planDisplayLabel;
  const financialPlanAmount = formatCurrencyFromCents(hubProfile.planAmountCents);
  const trialEndsAtLabel = formatDateTime(hubProfile.trialEndsAt);
  const trialRemainingLabel = formatTrialRemaining(hubProfile.trialRemainingMs);

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
        nextConnectorConfig = { ...DEFAULT_CONNECTOR_CONFIG, ...parsed };
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
      updatedAt: Date.now(),
      ...(authenticatedEmail ? { authEmail: authenticatedEmail, email: authenticatedEmail } : {}),
      onboarding: {
        companyName: companyForm.companyName.trim(),
        site: normalizedSite,
        instagram: companyForm.instagram.trim(),
        linkedin: companyForm.linkedin.trim(),
      },
    };

    try {
      const db = getFirebaseDb();
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, payload, { merge: true });
    } catch (error) {
      console.warn('Falha ao salvar dados da empresa no Firestore:', error);
    }

    const companyKey = `neuroads_company_profile_${user.uid}`;
    window.localStorage.setItem(companyKey, JSON.stringify({ ...companyForm, site: normalizedSite }));
    setCompanySaved(true);
    setTimeout(() => setCompanySaved(false), 2200);
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
    } catch (error) {
      console.warn('Falha ao salvar WhatsApp no Firestore:', error);
    }

    const contactKey = `neuroads_profile_contact_${user.uid}`;
    window.localStorage.setItem(contactKey, JSON.stringify({ whatsapp: normalizedWhatsapp }));
  };

  const handleSaveConnectors = () => {
    if (!user) return;
    const connectorsKey = `neuroads_dashboard_connectors_${user.uid}`;
    const connectorsConfigKey = `neuroads_dashboard_connectors_config_${user.uid}`;
    window.localStorage.setItem(connectorsKey, JSON.stringify(connectorStatus));
    window.localStorage.setItem(connectorsConfigKey, JSON.stringify(connectorConfig));
    setConnectorsSaved(true);
    setTimeout(() => setConnectorsSaved(false), 2200);
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

    const oauthProvider = OAUTH_CONNECTOR_PROVIDERS[connectorKey];
    if (oauthProvider) {
      window.location.href = getConnectorOAuthHref(connectorKey, oauthProvider);
      return;
    }

    // Conector sem OAuth nativo (ex.: GTM Server + CAPI): salva configuração manual.
    const now = Date.now();
    const connectionKey = CONNECTOR_CONNECTION_KEYS[connectorKey];
    const metadata = {
      timezone: connectorConfig.timezone,
      currency: connectorConfig.currency,
      attributionWindow: connectorConfig.attributionWindow,
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

  return (
    <Fragment>
      <header
      className={
        isHubNavbarStyle
          ? 'fixed left-1/2 top-4 z-[200] w-[min(calc(100%-1.5rem),1196px)] -translate-x-1/2 sm:w-[min(calc(100%-2.5rem),1196px)]'
          : 'fixed top-0 left-0 w-full z-[200] pt-3 px-4 lg:px-6'
      }
    >
      <nav className={isHubNavbarStyle ? 'w-full transition-all duration-700' : 'mx-auto max-w-[1240px] transition-all duration-700'}>
        <div
          className={
            isHubNavbarStyle
              ? 'flex items-center justify-between rounded-full border border-black/[0.06] bg-white px-4 py-3 shadow-[0_8px_26px_rgba(10,18,30,0.04)] transition-all duration-500 sm:px-5 md:px-7'
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
                    isLinkActive(link.href) ? 'text-[#0A9D57]' : 'text-[#5f6572] hover:text-[#1c2230]'
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
                  isLinkActive('/hub') ? 'text-[#0A9D57]' : 'text-[#5f6572] hover:text-[#1c2230]'
                  }`}
                >
                  Hub Estratégico
                </Link>
                <div className="relative group">
                  <button
                    type="button"
                    className={`inline-flex items-center gap-1 text-[13px] font-semibold transition-colors duration-200 ${
                      isHubNavbarStyle ? 'rounded-full px-2 py-1 text-[#5f6572] group-hover:text-[#1c2230]' : 'text-[#344054] group-hover:text-[#111827]'
                    }`}
                  >
                    Agentes IA
                    <ChevronDown size={14} />
                  </button>
                  <div className="invisible absolute left-1/2 top-full z-[120] mt-3 w-[300px] -translate-x-1/2 rounded-2xl border border-[#E7EAF0] bg-white p-2 opacity-0 shadow-[0_14px_30px_rgba(15,23,42,0.12)] transition-all duration-150 group-hover:visible group-hover:opacity-100">
                    {laboratorySubLinks.map((link, index) => (
                      <div key={link.name}>
                        <Link
                          href={link.href}
                          className={`block w-full rounded-xl px-3 py-2 text-left text-[14px] font-semibold transition-colors ${
                            isLinkActive(link.href)
                              ? 'text-[#FF6A00] bg-[#F0FFF7]'
                              : 'text-[#344054] hover:bg-[#F8FAFC]'
                          }`}
                        >
                          {link.name}
                        </Link>
                        {index === 0 ? <div className="my-2 h-px w-full bg-[#E5E7EB]" /> : null}
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
                    isLinkActive('/hub/agentes-ativos') ? 'text-[#0A9D57]' : 'text-[#5f6572] hover:text-[#1c2230]'
                  }`}
                >
                  Agentes Ativos
                </Link>
                <div className="relative group">
                  <button
                    type="button"
                    className={`inline-flex items-center gap-1 text-[13px] font-semibold transition-colors duration-200 ${
                      isHubNavbarStyle
                        ? 'rounded-full px-2 py-1 text-[#5f6572] group-hover:text-[#1c2230]'
                        : 'text-[#344054] group-hover:text-[#111827]'
                    }`}
                  >
                    Configurações
                    <ChevronDown size={14} />
                  </button>
                  <div className="invisible absolute left-1/2 top-full z-[120] mt-3 w-[300px] -translate-x-1/2 rounded-2xl border border-[#E7EAF0] bg-white p-2 opacity-0 shadow-[0_14px_30px_rgba(15,23,42,0.12)] transition-all duration-150 group-hover:visible group-hover:opacity-100">
                      <button
                        onClick={openProfileModal}
                        className="w-full rounded-xl px-3 py-2 text-left text-[14px] font-semibold text-[#344054] hover:bg-[#F8FAFC] transition-colors"
                      >
                        Meu perfil
                      </button>
                      <button
                        onClick={openConnectorsModal}
                        className="w-full rounded-xl px-3 py-2 text-left text-[14px] font-semibold text-[#344054] hover:bg-[#F8FAFC] transition-colors"
                      >
                        Conectores
                      </button>
                      <button
                        onClick={openCompanyModal}
                        className="w-full rounded-xl px-3 py-2 text-left text-[14px] font-semibold text-[#344054] hover:bg-[#F8FAFC] transition-colors"
                      >
                        Sua Empresa
                      </button>
                      <button
                        onClick={openFinanceModal}
                        className="w-full rounded-xl px-3 py-2 text-left text-[14px] font-semibold text-[#344054] hover:bg-[#F8FAFC] transition-colors"
                      >
                        Financeiro
                      </button>
                      <div className="my-2 h-px w-full bg-[#E5E7EB]" />
                      <button
                        onClick={handleLogout}
                        className="w-full rounded-xl px-3 py-2 text-left text-[14px] font-semibold text-red-500 hover:bg-red-50 transition-colors"
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
                  isCapacityAbove80
                    ? 'text-[#C2410C] shadow-[0_0_0_1px_rgba(245,158,11,0.30),0_0_14px_rgba(245,158,11,0.35)] animate-pulse'
                    : 'text-[#0A9D57] shadow-[0_0_0_1px_rgba(10,157,87,0.25),0_0_14px_rgba(10,157,87,0.30)] animate-pulse'
                }`}
              >
                Agentes Ativos: {String(activeAgentsCount).padStart(2, '0')} de {String(planCapacity).padStart(2, '0')}
              </span>
            )}
            {/* User menu (only when logged in) */}
            {user && (
              <div ref={settingsMenuRef} className="relative">
                <button
                  onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                  className="relative size-11 group overflow-hidden rounded-full transition-all flex items-center justify-center border border-[#E5E7EB] bg-white text-[#344054] hover:text-[#111827]"
                >
                  <User size={16} className="relative z-10" />
                  <ChevronDown size={12} className={`relative z-10 transition-transform duration-300 ${isSettingsOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Submenu */}
                {isSettingsOpen && (
                  <div className="absolute top-full right-0 mt-4 w-[300px] rounded-[22px] p-[2px] bg-gradient-to-br from-[#FFEBDD] via-[#FFBE94] to-[#FF7A00] shadow-[0_20px_50px_rgba(255,107,0,0.18)] z-[60]">
                    <div className="bg-white border border-[#FFF1E8] rounded-[20px] overflow-hidden py-3">
                    <button
                      onClick={openProfileModal}
                      className="w-full px-7 py-4 text-left text-[13px] font-bold tracking-[0.08em] text-text-main hover:text-primary hover:bg-[#FFF8F3] transition-all flex items-center gap-4 normal-case"
                    >
                      <User size={15} className="text-text-dim" /> Meu perfil
                    </button>
                    <button
                      onClick={openConnectorsModal}
                      className="w-full px-7 py-4 text-left text-[13px] font-bold tracking-[0.08em] text-text-main hover:text-primary hover:bg-[#FFF8F3] transition-all flex items-center gap-4 normal-case"
                    >
                      <PlugZap size={15} className="text-text-dim" /> Conectores
                    </button>
                    <button
                      onClick={openCompanyModal}
                      className="w-full px-7 py-4 text-left text-[13px] font-bold tracking-[0.08em] text-text-main hover:text-primary hover:bg-[#FFF8F3] transition-all flex items-center gap-4 normal-case"
                    >
                      <User size={15} className="text-text-dim" /> Sua Empresa
                    </button>
                    <button
                      onClick={openFinanceModal}
                      className="w-full px-7 py-4 text-left text-[13px] font-bold tracking-[0.08em] text-text-main hover:text-primary hover:bg-[#FFF8F3] transition-all flex items-center gap-4 normal-case"
                    >
                      <CreditCard size={15} className="text-text-dim" /> Financeiro
                    </button>
                    <div className="h-px bg-border mx-7 my-2" />
                    <button
                      onClick={handleLogout}
                      className="w-full px-7 py-4 text-left text-[13px] font-bold tracking-[0.08em] text-red-500 hover:bg-red-50 transition-all flex items-center gap-4 normal-case"
                    >
                      <LogOut size={15} /> Sair
                    </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={
                isHubNavbarStyle
                  ? 'inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#dbe2ee] bg-white p-0 text-[#2b3240] transition hover:border-[#ffc8a5] hover:text-[#ff6a00] focus:outline-none'
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
        className={`md:hidden bg-white border border-border shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] z-[210] overflow-y-auto transition-all duration-300 ${
          isHubNavbarStyle
            ? 'fixed left-1/2 top-[84px] max-h-[calc(100dvh-108px)] w-[min(calc(100%-1.5rem),460px)] -translate-x-1/2 rounded-[20px] p-4 sm:w-[min(calc(100%-2.5rem),460px)]'
            : 'absolute top-24 left-4 right-4 max-h-[calc(100dvh-120px)] rounded-[24px] p-5'
        } ${isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}
      >
        <div className="flex flex-col items-center gap-8 px-2">
          {isAdminContext ? (
            navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => {
                  handleNavLinkClick(link.href);
                  setIsMenuOpen(false);
                }}
                className={`text-lg font-black tracking-[0.08em] transition-colors ${
                  isLinkActive(link.href) ? 'text-[#0A9D57]' : 'text-text-main hover:text-primary'
                }`}
              >
                {link.name}
              </Link>
            ))
          ) : (
            <>
              <Link
                href="/hub"
                onClick={() => setIsMenuOpen(false)}
                className={`text-lg font-black tracking-[0.08em] transition-colors ${
                  isLinkActive('/hub') ? 'text-[#0A9D57]' : 'text-text-main hover:text-primary'
                }`}
              >
                Hub Estratégico
              </Link>

              <div className="w-full">
                <button
                  type="button"
                  onClick={() => setIsLabSubmenuOpen((prev) => !prev)}
                  className="mx-auto flex items-center gap-2 text-lg font-black tracking-[0.08em] text-text-main transition-colors hover:text-primary"
                >
                  Agentes IA
                  <ChevronDown size={16} className={`transition-transform ${isLabSubmenuOpen ? 'rotate-180' : ''}`} />
                </button>
                <div className={`mt-3 space-y-2 ${isLabSubmenuOpen ? 'block' : 'hidden'}`}>
                  {laboratorySubLinks.map((link, index) => (
                    <div key={link.name}>
                      <Link
                        href={link.href}
                        onClick={() => setIsMenuOpen(false)}
                        className={`block rounded-xl px-4 py-2 text-center text-sm font-bold tracking-wide transition-colors ${
                          isLinkActive(link.href) ? 'bg-[#F0FFF7] text-[#FF6A00]' : 'text-text-muted hover:bg-[#F8FAFC]'
                        }`}
                      >
                        {link.name}
                      </Link>
                      {index === 0 ? <div className="my-2 h-px w-full bg-[#E5E7EB]" /> : null}
                    </div>
                  ))}
                  </div>
                </div>
              <Link
                href="/hub/agentes-ativos"
                onClick={() => setIsMenuOpen(false)}
                className={`text-lg font-black tracking-[0.08em] transition-colors ${
                  isLinkActive('/hub/agentes-ativos') ? 'text-[#0A9D57]' : 'text-text-main hover:text-primary'
                }`}
              >
                Agentes Ativos
              </Link>
            </>
          )}

          <div className="w-full h-px bg-border" />

          {user && (
            <div className="w-full space-y-4">
              <p className="text-center text-sm font-black tracking-widest uppercase italic text-primary">
                {getGreeting()}, {getFirstName(user.displayName || user.email)}!
              </p>
              <button
                onClick={openProfileModal}
                className="w-full py-5 text-sm font-black text-text-muted tracking-widest uppercase border border-border rounded-xl bg-bg-secondary"
              >
                MEU PERFIL
              </button>
              <button
                onClick={openConnectorsModal}
                className="w-full py-5 text-sm font-black text-text-muted tracking-widest uppercase border border-border rounded-xl bg-bg-secondary"
              >
                CONECTORES
              </button>
              <button
                onClick={openCompanyModal}
                className="w-full py-5 text-sm font-black text-text-muted tracking-widest uppercase border border-border rounded-xl bg-bg-secondary"
              >
                SUA EMPRESA
              </button>
              <button
                onClick={openFinanceModal}
                className="w-full py-5 text-sm font-black text-text-muted tracking-widest uppercase border border-border rounded-xl bg-bg-secondary"
              >
                FINANCEIRO
              </button>
              <button
                onClick={handleLogout}
                className="w-full py-5 text-sm font-black text-red-500 tracking-widest uppercase border border-red-200 rounded-xl bg-red-50 flex items-center justify-center gap-3"
              >
                <LogOut size={18} /> SAIR
              </button>
            </div>
          )}
        </div>
      </div>
    </header>

    {/* Profile Modal */}
    {isProfileOpen && user && (
      <div className="fixed inset-0 z-[9999] flex items-start justify-center overflow-y-auto px-4 py-6 sm:items-center sm:py-4">
        <div
          onClick={() => setIsProfileOpen(false)}
          className="absolute inset-0 bg-charcoal/60 backdrop-blur-sm"
        />

        <div className="relative w-full max-w-xl max-h-[92vh] rounded-[30px] p-[2px] bg-gradient-to-br from-[#FFEBDD] via-[#FFBE94] to-[#FF7A00] shadow-[0_20px_50px_rgba(255,107,0,0.2)] animate-in fade-in zoom-in duration-300">
          <div className="max-h-[calc(92vh-4px)] overflow-y-auto rounded-[28px] bg-white border border-[#FFF1E8]">
            <div className="relative px-6 py-5 border-b border-border bg-gradient-to-br from-orange-light to-white">
              <h3 className="text-2xl font-black text-text-main tracking-tight">Meu perfil</h3>
              <p className="text-sm text-text-muted mt-1">Informações da conta do usuário</p>
              <button
                onClick={() => setIsProfileOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-full bg-white border border-border hover:bg-bg-secondary transition-colors"
              >
                <X size={18} className="text-text-main" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="rounded-2xl border border-border bg-bg-secondary p-5">
                <p className="text-xs uppercase tracking-widest text-text-dim font-bold mb-2">Nome</p>
                <p className="text-base font-bold text-text-main">{user.displayName || 'Não informado'}</p>
              </div>

              <div className="rounded-2xl border border-border bg-bg-secondary p-5">
                <p className="text-xs uppercase tracking-widest text-text-dim font-bold mb-2">E-mail</p>
                <p className="text-base font-bold text-text-main">{user.email || 'Não informado'}</p>
              </div>

              <div className="rounded-2xl border border-border bg-bg-secondary p-5">
                <p className="text-xs uppercase tracking-widest text-text-dim font-bold mb-2">WhatsApp</p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    value={whatsApp}
                    onChange={(e) => setWhatsApp(e.target.value)}
                    placeholder="(00) 00000-0000"
                    className="flex-1 bg-white border border-border rounded-xl px-4 py-3 text-sm font-semibold text-text-main focus:border-primary outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleSaveWhatsApp}
                    className="px-5 py-3 rounded-xl bg-gradient-to-r from-[#08B760] to-[#0A9D57] text-white text-xs font-bold tracking-widest uppercase shadow-[0_8px_18px_rgba(8,183,96,0.25)]"
                  >
                    Salvar
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-border bg-bg-secondary p-5">
                  <p className="text-xs uppercase tracking-widest text-text-dim font-bold mb-2">Plano</p>
                  <p className={`text-base font-black ${hubProfile.isSubscriptionActive ? 'text-[#0A9D57]' : 'text-primary'}`}>
                    {planDisplayLabel}
                  </p>
                </div>
                <div className="rounded-2xl border border-border bg-bg-secondary p-5">
                  <p className="text-xs uppercase tracking-widest text-text-dim font-bold mb-2">Plataformas conectadas</p>
                  <p className="text-base font-black text-text-main">{connectedPlatforms}</p>
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-bg-secondary p-5">
                <p className="text-xs uppercase tracking-widest text-text-dim font-bold mb-2">Aplicações em uso</p>
                <p className="text-base font-black text-text-main">{usageCount}</p>
              </div>

              <div className="rounded-2xl border border-border bg-bg-secondary p-5">
                <p className="text-xs uppercase tracking-widest text-text-dim font-bold mb-2">ID do usuário</p>
                <p className="text-sm font-semibold text-text-main break-all">{user.uid}</p>
              </div>

              <div className="rounded-2xl border border-red-200 bg-red-50 p-5 space-y-3">
                <p className="text-xs uppercase tracking-widest text-red-600 font-black">Zona de risco</p>
                <p className="text-sm text-red-700">
                  Ao excluir a conta, seu plano será cancelado e o cadastro será removido do banco de dados.
                </p>
                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  disabled={isDeletingAccount}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-red-600 text-white text-xs font-black tracking-widest uppercase hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <AlertTriangle size={15} />
                  {isDeletingAccount ? 'Excluindo...' : 'Excluir conta'}
                </button>
                {deleteAccountError ? (
                  <p className="text-xs font-semibold text-red-700">{deleteAccountError}</p>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    )}


    {/* Finance Modal */}
    {isFinanceModalOpen && user && (
      <div className="fixed inset-0 z-[9999] flex items-start justify-center overflow-y-auto px-4 py-6 sm:items-center sm:py-4">
        <div
          onClick={closeFinanceModal}
          className="absolute inset-0 bg-charcoal/60 backdrop-blur-sm"
        />

        <div className="relative w-full max-w-2xl max-h-[92vh] rounded-[30px] p-[2px] bg-gradient-to-br from-[#FFEBDD] via-[#FFBE94] to-[#FF7A00] shadow-[0_20px_50px_rgba(255,107,0,0.2)] animate-in fade-in zoom-in duration-300">
          <div className="max-h-[calc(92vh-4px)] overflow-y-auto rounded-[28px] bg-white border border-[#FFF1E8]">
            <div className="relative px-6 py-5 border-b border-border bg-gradient-to-br from-orange-light to-white">
              <h3 className="text-2xl font-black text-text-main tracking-tight">Financeiro</h3>
              <p className="text-sm text-text-muted mt-1">Detalhes do plano, assinatura e período de acesso</p>
              <button
                onClick={closeFinanceModal}
                className="absolute top-4 right-4 p-2 rounded-full bg-white border border-border hover:bg-bg-secondary transition-colors"
              >
                <X size={18} className="text-text-main" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-border bg-bg-secondary p-5">
                  <p className="text-xs uppercase tracking-widest text-text-dim font-bold mb-2">Plano atual</p>
                  <p className="text-base font-black text-text-main">{financialPlanName}</p>
                </div>
                <div className="rounded-2xl border border-border bg-bg-secondary p-5">
                  <p className="text-xs uppercase tracking-widest text-text-dim font-bold mb-2">Valor mensal</p>
                  <p className="text-base font-black text-text-main">{financialPlanAmount}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-border bg-bg-secondary p-5">
                  <p className="text-xs uppercase tracking-widest text-text-dim font-bold mb-2">Status da assinatura</p>
                  <p className={`text-base font-black ${hubProfile.isSubscriptionActive ? 'text-[#0A9D57]' : 'text-primary'}`}>
                    {hubProfile.statusLabel}
                  </p>
                </div>
                <div className="rounded-2xl border border-border bg-bg-secondary p-5">
                  <p className="text-xs uppercase tracking-widest text-text-dim font-bold mb-2">Acesso operacional</p>
                  <p className="text-base font-black text-text-main">{hubProfile.accessLabel}</p>
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-bg-secondary p-5">
                <p className="text-xs uppercase tracking-widest text-text-dim font-bold mb-2">Recursos incluídos</p>
                <p className="text-sm font-bold text-text-main">
                  {hubProfile.operationLabel}
                </p>
                {hubProfile.includedExecutions != null ? (
                  <p className="text-xs text-text-muted mt-2">
                    Execuções inclusas por mês: {hubProfile.includedExecutions.toLocaleString('pt-BR')}
                  </p>
                ) : null}
              </div>

              {hubProfile.isTrialing && (hubProfile.trialRemainingMs ?? 0) > 0 ? (
                <div className="rounded-2xl border border-[#FFD2B5] bg-[#FFF8F3] p-5">
                  <p className="text-xs uppercase tracking-widest text-[#B45309] font-bold mb-2">Período gratuito ativo</p>
                  <p className="text-base font-black text-[#7C2D12]">{trialRemainingLabel}</p>
                  <p className="text-sm text-[#7C2D12] mt-2">
                    Sua primeira cobrança está prevista para: <span className="font-bold">{trialEndsAtLabel}</span>.
                  </p>
                </div>
              ) : null}

              {!hubProfile.isTrialing ? (
                <div className="rounded-2xl border border-border bg-bg-secondary p-5">
                  <p className="text-xs uppercase tracking-widest text-text-dim font-bold mb-2">Período gratuito</p>
                  <p className="text-sm font-bold text-text-main">
                    {hubProfile.trialEndsAt ? `Encerrado em ${trialEndsAtLabel}` : 'Não aplicável ao status atual'}
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    )}

      {/* Company Modal */}
      {isCompanyModalOpen && user && (
        <div className="fixed inset-0 z-[9999] flex items-start justify-center overflow-y-auto px-4 py-6 sm:items-center sm:py-4">
          <div
            onClick={closeCompanyModal}
            className="absolute inset-0 bg-charcoal/60 backdrop-blur-sm"
          />

          <div className="relative w-full max-w-2xl max-h-[92vh] rounded-[30px] p-[2px] bg-gradient-to-br from-[#FFEBDD] via-[#FFBE94] to-[#FF7A00] shadow-[0_20px_50px_rgba(255,107,0,0.2)] animate-in fade-in zoom-in duration-300">
            <div className="max-h-[calc(92vh-4px)] overflow-y-auto rounded-[28px] bg-white border border-[#FFF1E8]">
              <div className="relative px-6 py-5 border-b border-border bg-gradient-to-br from-orange-light to-white">
                <h3 className="text-2xl font-black text-text-main tracking-tight">Sobre sua Marca</h3>
                <p className="text-sm text-text-muted mt-1">Cadastro das informações institucionais</p>
                <button
                  onClick={closeCompanyModal}
                  className="absolute top-4 right-4 p-2 rounded-full bg-white border border-border hover:bg-bg-secondary transition-colors"
                >
                  <X size={18} className="text-text-main" />
                </button>
              </div>

              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-xs uppercase tracking-widest text-text-dim font-bold mb-2 block">Nome da Empresa</label>
                  <input
                    value={companyForm.companyName}
                    onChange={(e) => setCompanyForm((prev) => ({ ...prev, companyName: e.target.value }))}
                    className="w-full bg-bg-secondary border border-border rounded-xl px-4 py-3 text-sm font-semibold text-text-main focus:border-primary outline-none"
                    placeholder="Nome da empresa"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs uppercase tracking-widest text-text-dim font-bold mb-2 block">Site</label>
                  <input
                    value={companyForm.site}
                    onChange={(e) =>
                      setCompanyForm((prev) => ({ ...prev, site: normalizeHttpsMaskedUrlInput(e.target.value) }))
                    }
                    onBlur={(e) =>
                      setCompanyForm((prev) => ({ ...prev, site: normalizeHttpsMaskedUrlInput(e.target.value) }))
                    }
                    className="w-full bg-bg-secondary border border-border rounded-xl px-4 py-3 text-sm font-semibold text-text-main focus:border-primary outline-none"
                    placeholder="https://..."
                  />
                </div>

                <div>
                  <label className="text-xs uppercase tracking-widest text-text-dim font-bold mb-2 block">Instagram</label>
                  <input
                    value={companyForm.instagram}
                    onChange={(e) => setCompanyForm((prev) => ({ ...prev, instagram: e.target.value }))}
                    className="w-full bg-bg-secondary border border-border rounded-xl px-4 py-3 text-sm font-semibold text-text-main focus:border-primary outline-none"
                    placeholder="@perfil"
                  />
                </div>

                <div>
                  <label className="text-xs uppercase tracking-widest text-text-dim font-bold mb-2 block">LinkedIn</label>
                  <input
                    value={companyForm.linkedin}
                    onChange={(e) => setCompanyForm((prev) => ({ ...prev, linkedin: e.target.value }))}
                    className="w-full bg-bg-secondary border border-border rounded-xl px-4 py-3 text-sm font-semibold text-text-main focus:border-primary outline-none"
                    placeholder="linkedin.com/company/..."
                  />
                </div>

                <div>
                  <label className="text-xs uppercase tracking-widest text-text-dim font-bold mb-2 block">TikTok</label>
                  <input
                    value={companyForm.tiktok}
                    onChange={(e) => setCompanyForm((prev) => ({ ...prev, tiktok: e.target.value }))}
                    className="w-full bg-bg-secondary border border-border rounded-xl px-4 py-3 text-sm font-semibold text-text-main focus:border-primary outline-none"
                    placeholder="tiktok.com/@perfil"
                  />
                </div>

                <div>
                  <label className="text-xs uppercase tracking-widest text-text-dim font-bold mb-2 block">Blog</label>
                  <input
                    value={companyForm.blog}
                    onChange={(e) => setCompanyForm((prev) => ({ ...prev, blog: e.target.value }))}
                    className="w-full bg-bg-secondary border border-border rounded-xl px-4 py-3 text-sm font-semibold text-text-main focus:border-primary outline-none"
                    placeholder="blog.seudominio.com"
                  />
                </div>
              </div>

              <div className="px-6 pb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <p className={`text-sm ${companySaved ? 'text-[#0A9D57]' : 'text-text-muted'}`}>
                  {companySaved ? 'Dados salvos com sucesso.' : 'Preencha os dados da empresa.'}
                </p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={closeCompanyModal}
                    className="px-5 py-3 rounded-xl border border-border text-text-muted text-xs font-bold tracking-widest uppercase hover:bg-bg-secondary"
                  >
                    Fechar
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveCompany}
                    className="px-5 py-3 rounded-xl bg-gradient-to-r from-[#08B760] to-[#0A9D57] text-white text-xs font-bold tracking-widest uppercase shadow-[0_8px_18px_rgba(8,183,96,0.25)]"
                  >
                    Salvar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Connectors Modal */}
      {isConnectorsModalOpen && user && (
        <div className="fixed inset-0 z-[9999] flex items-start justify-center overflow-y-auto px-4 py-6 sm:items-center sm:py-4">
          <div
            onClick={closeConnectorsModal}
            className="absolute inset-0 bg-charcoal/60 backdrop-blur-sm"
          />

          <div className="relative w-full max-w-4xl rounded-[30px] p-[2px] bg-gradient-to-br from-[#FFEBDD] via-[#FFBE94] to-[#FF7A00] shadow-[0_20px_50px_rgba(255,107,0,0.2)] max-h-[92vh] animate-in fade-in zoom-in duration-300">
            <div className="rounded-[28px] bg-white border border-[#FFF1E8] overflow-hidden h-full flex flex-col">
              <div className="relative px-6 py-5 border-b border-border bg-gradient-to-br from-orange-light to-white">
                <h3 className="text-2xl font-black text-text-main tracking-tight">Conectores</h3>
                <p className="text-sm text-text-muted mt-1">
                  Configure as integrações e parâmetros essenciais para exibir dados reais e corretos no Dashboard.
                </p>
                <button
                  onClick={closeConnectorsModal}
                  className="absolute top-4 right-4 p-2 rounded-full bg-white border border-border hover:bg-bg-secondary transition-colors"
                >
                  <X size={18} className="text-text-main" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-6">
                <div className="rounded-2xl border border-[#FFE4D1] bg-[#FFF8F3] p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-widest text-[#B45309] font-bold mb-1">Prontidão do Dashboard</p>
                      <p className="text-sm text-[#7C2D12]">Conectores obrigatórios ativos: {connectedRequired} de {requiredConnectors.length}</p>
                    </div>
                    <div className="inline-flex items-center gap-2 px-3 py-2 rounded-full border border-[#FFD2B5] bg-white">
                      <Gauge size={14} className="text-primary" />
                      <span className="text-sm font-black text-primary">{dashboardReadiness}%</span>
                    </div>
                  </div>
                  <div className="mt-4 h-2.5 rounded-full bg-[#FFE5D0] overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#FF6B00] to-[#FF9D00] transition-all duration-500"
                      style={{ width: `${dashboardReadiness}%` }}
                    />
                  </div>
                </div>

                <div className="rounded-2xl border border-border bg-white p-5">
                  <p className="text-xs uppercase tracking-widest text-text-dim font-bold mb-4">Conectores obrigatórios</p>
                  <div className="space-y-3">
                    {CONNECTOR_DEFINITIONS.map((connector) => (
                      <div key={connector.key} className="rounded-xl border border-border bg-bg-secondary p-4">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                          <div>
                            <p className="text-sm font-black text-text-main">{connector.name}</p>
                            <p className="text-xs text-text-muted mt-1">{connector.source} • {connector.usedBy}</p>
                          </div>
                          <div className="flex flex-wrap items-center justify-end gap-2">
                            {connector.key === 'crm' && !connectorStatus[connector.key] ? (
                              <a
                                href={getConnectorOAuthHref(connector.key, 'pipedrive')}
                                className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-[#BFDBFE] bg-[#EFF6FF] text-[#1D4ED8] text-[11px] font-bold tracking-wide uppercase"
                              >
                                <PlugZap size={12} /> Pipedrive
                              </a>
                            ) : null}
                            <button
                              type="button"
                              disabled={connectorBusyKey === connector.key}
                              onClick={() =>
                                connectorStatus[connector.key]
                                  ? void handleConnectorDisconnect(connector.key)
                                  : void handleConnectorConnect(connector.key)
                              }
                              className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl border text-xs font-bold tracking-wider uppercase transition-all disabled:opacity-60 disabled:cursor-not-allowed ${
                                connectorStatus[connector.key]
                                  ? 'bg-[#F2FFF7] border-[#BDE8CF] text-[#0A9D57]'
                                  : 'bg-white border-[#D1D5DB] text-[#6B7280]'
                              }`}
                            >
                              {connectorStatus[connector.key] ? (
                                <>
                                  <CheckCircle2 size={14} /> Conectado
                                </>
                              ) : (
                                <>
                                  <PlugZap size={14} /> Conectar
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-border bg-white p-5">
                  <p className="text-xs uppercase tracking-widest text-text-dim font-bold mb-4">Configurações operacionais</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs uppercase tracking-widest text-text-dim font-bold mb-2 block">Timezone</label>
                      <input
                        value={connectorConfig.timezone}
                        onChange={(e) => setConnectorConfig((prev) => ({ ...prev, timezone: e.target.value }))}
                        className="w-full bg-bg-secondary border border-border rounded-xl px-4 py-3 text-sm font-semibold text-text-main focus:border-primary outline-none"
                        placeholder="America/Sao_Paulo"
                      />
                    </div>
                    <div>
                      <label className="text-xs uppercase tracking-widest text-text-dim font-bold mb-2 block">Moeda</label>
                      <input
                        value={connectorConfig.currency}
                        onChange={(e) => setConnectorConfig((prev) => ({ ...prev, currency: e.target.value.toUpperCase() }))}
                        className="w-full bg-bg-secondary border border-border rounded-xl px-4 py-3 text-sm font-semibold text-text-main focus:border-primary outline-none"
                        placeholder="BRL"
                      />
                    </div>
                    <div>
                      <label className="text-xs uppercase tracking-widest text-text-dim font-bold mb-2 block">Janela de atribuição</label>
                      <input
                        value={connectorConfig.attributionWindow}
                        onChange={(e) => setConnectorConfig((prev) => ({ ...prev, attributionWindow: e.target.value }))}
                        className="w-full bg-bg-secondary border border-border rounded-xl px-4 py-3 text-sm font-semibold text-text-main focus:border-primary outline-none"
                        placeholder="7d-click / 1d-view"
                      />
                    </div>
                    <div>
                      <label className="text-xs uppercase tracking-widest text-text-dim font-bold mb-2 block">Frequência de atualização</label>
                      <input
                        value={connectorConfig.refreshFrequency}
                        onChange={(e) => setConnectorConfig((prev) => ({ ...prev, refreshFrequency: e.target.value }))}
                        className="w-full bg-bg-secondary border border-border rounded-xl px-4 py-3 text-sm font-semibold text-text-main focus:border-primary outline-none"
                        placeholder="15 min"
                      />
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-border bg-white p-5">
                  <p className="text-xs uppercase tracking-widest text-text-dim font-bold mb-4">Componentes do Dashboard e dependências</p>
                  <div className="space-y-3">
                    <div className="rounded-xl border border-border bg-bg-secondary p-4">
                      <p className="text-sm font-bold text-text-main">Resumo executivo (ROAS, CAC, CPL, Receita)</p>
                      <p className="text-xs text-text-muted mt-1">Google Ads + Meta Ads + CRM + Pagamentos + Warehouse</p>
                    </div>
                    <div className="rounded-xl border border-border bg-bg-secondary p-4">
                      <p className="text-sm font-bold text-text-main">Alertas inteligentes e fila de ações</p>
                      <p className="text-xs text-text-muted mt-1">Mídia paga + GA4 + Tracking server-side + Jobs de automação</p>
                    </div>
                    <div className="rounded-xl border border-border bg-bg-secondary p-4">
                      <p className="text-sm font-bold text-text-main">Status de agentes e timeline</p>
                      <p className="text-xs text-text-muted mt-1">Firestore (logs) + Scheduler + Warehouse</p>
                    </div>
                    <div className="rounded-xl border border-border bg-bg-secondary p-4">
                      <p className="text-sm font-bold text-text-main">Projeções e cenários</p>
                      <p className="text-xs text-text-muted mt-1">Histórico consolidado no Warehouse + regras de margem e sazonalidade</p>
                    </div>
                  </div>
                  <div className="mt-4 rounded-xl border border-[#DCE8FF] bg-[#F5F9FF] p-4 text-xs text-[#1D4ED8] flex items-start gap-2">
                    <Database size={14} className="mt-0.5" />
                    <span>
                      Recomendação: centralizar dados no BigQuery e sincronizar os conectores a cada 15 minutos para precisão operacional.
                    </span>
                  </div>
                </div>
              </div>

              <div className="px-6 py-5 border-t border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <p className={`text-sm ${
                  connectorError ? 'text-[#B42318]' : connectorsSaved || connectorFeedback ? 'text-[#0A9D57]' : 'text-text-muted'
                }`}>
                  {connectorError
                    ? connectorError
                    : connectorFeedback
                      ? connectorFeedback
                      : connectorsSaved
                        ? 'Configurações de conectores salvas com sucesso.'
                        : 'Conecte os conectores obrigatórios para liberar dados reais no Dashboard.'}
                </p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={closeConnectorsModal}
                    className="px-5 py-3 rounded-xl border border-border text-text-muted text-xs font-bold tracking-widest uppercase hover:bg-bg-secondary"
                  >
                    Fechar
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveConnectors}
                    className="px-5 py-3 rounded-xl bg-gradient-to-r from-[#08B760] to-[#0A9D57] text-white text-xs font-bold tracking-widest uppercase shadow-[0_8px_18px_rgba(8,183,96,0.25)]"
                  >
                    Salvar configuração
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Fragment>
  );
}
