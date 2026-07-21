'use client';

import React, {
  Suspense, useCallback, useEffect, useRef, useState,
} from 'react';
import {
  Link2, ShieldCheck, ArrowRight, CheckCircle2,
  X, Loader2, BarChart3, AlertCircle, MoreVertical, Info,
  Unlink, Key, ExternalLink, ChevronRight,
  HelpCircle,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { getKapsoPhoneNumberDetails } from '../../../lib/kapso';
import {
  saveConnection,
  saveApiKeyConnection,
  disconnectConnector,
  loadUserConnections,
  isConnectorActive,
  getConnectionMeta,
  type ConnectionsMap,
} from '../../../lib/connector-save';
import type { ConnectorKey } from '../../../lib/connectors';
import {
  IconStripe3D,
  IconGoogleCalendar3D,
  IconGmail3D,
  IconWhatsapp3D,
  IconSignature3D,
  IconHelpdesk3D,
  IconGtmServer3D,
  IconBigQuery3D,
} from '../../../components/hub/ConnectorBrandIcons';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ConnectFlow =
  | 'oauth'
  | 'oauth-select'
  | 'oauth-creds'
  | 'api-key';

type CredField = { label: string; placeholder: string; key: string; secret?: boolean };

type IntegrationDef = {
  id: string;
  connectorKey: ConnectorKey;
  name: string;
  category: string;
  desc: string;
  flow: ConnectFlow;
  icon?: string;
  isComponentIcon?: boolean;
  componentIconType?: 'stripe' | 'database' | 'server' | 'calendar' | 'mail' | 'whatsapp' | 'signature' | 'helpdesk';
  oauthConnector?: string;
  credFields?: CredField[];
  apiKeyLabel?: string;
  apiKeyPlaceholder?: string;
};

// ---------------------------------------------------------------------------
// Help content per channel
// ---------------------------------------------------------------------------

type HelpContent = {
  title: string;
  steps: string[];
  link?: { label: string; url: string };
};

const CHANNEL_HELP: Partial<Record<string, HelpContent>> = {
  hubspot: {
    title: 'Como conectar o HubSpot',
    steps: [
      '1. Clique em "Conectar" para iniciar a autenticação OAuth do HubSpot.',
      '2. Faça login na sua conta HubSpot, se solicitado.',
      '3. Selecione o portal (conta) HubSpot que deseja conectar.',
      '4. Revise as permissões de leitura de contatos e negócios e clique em "Conectar app".',
      '5. Você retornará automaticamente ao NeuroAds com o canal ativo.',
    ],
    link: { label: 'Documentação HubSpot OAuth', url: 'https://developers.hubspot.com/docs/api/oauth-quickstart-guide' },
  },
  rdStationConversas: {
    title: 'Como obter o Token do RD Station Conversas',
    steps: [
      '1. Faça login no RD Station Conversas (app.rdstationconversas.com).',
      '2. Vá em Configurações > Integrações > API.',
      '3. Gere ou copie seu Token de API.',
      '4. Cole o token no campo abaixo.',
    ],
    link: { label: 'Suporte RD Station', url: 'https://help.rdstationconversas.com' },
  },
  rdStationCrm: {
    title: 'Como obter o Token do RD Station CRM',
    steps: [
      '1. Acesse sua conta RD Station CRM (crm.rdstation.com).',
      '2. Vá em Configurações > Integrações > API.',
      '3. Copie o Token de API exibido.',
      '4. Cole o token no campo abaixo.',
    ],
    link: { label: 'Documentação RD Station CRM', url: 'https://developers.rdstation.com' },
  },
  rdStationMarketing: {
    title: 'Como obter o Token do RD Station Marketing',
    steps: [
      '1. Acesse app.rdstation.com.br e faça login.',
      '2. Vá em Configurações > Integrações > API.',
      '3. Copie seu Token de API pessoal.',
      '4. Cole o token no campo abaixo.',
    ],
    link: { label: 'Documentação RD Station Marketing', url: 'https://developers.rdstation.com' },
  },
  serverTracking: {
    title: 'Como obter a URL do GTM Server',
    steps: [
      '1. Acesse o Google Tag Manager (tagmanager.google.com).',
      '2. No container de servidor, vá em Administração > Configurações do Contêiner.',
      '3. Copie a URL do servidor (ex: https://tracking.seudominio.com).',
      '4. Para Meta CAPI, use o endpoint configurado no seu servidor GTM.',
      '5. Cole a URL no campo abaixo.',
    ],
    link: { label: 'Documentação GTM Server-side', url: 'https://developers.google.com/tag-platform/tag-manager/server-side' },
  },
  stripe: {
    title: 'Como obter a chave de API do Stripe',
    steps: [
      '1. Acesse o Dashboard do Stripe (dashboard.stripe.com) e faça login.',
      '2. Vá em Desenvolvedores > Chaves de API.',
      '3. Recomendado: crie uma "Chave restrita" apenas com permissões de leitura (Charges, Customers, Balance) — mais segura que a Secret Key completa.',
      '4. Copie a chave (rk_live_... ou sk_live_...) e cole no campo abaixo.',
    ],
    link: { label: 'Documentação de chaves Stripe', url: 'https://docs.stripe.com/keys' },
  },
  tiktok: {
    title: 'Como conectar o TikTok',
    steps: [
      '1. Clique em "Conectar" para iniciar o fluxo OAuth do TikTok.',
      '2. Faça login com sua conta TikTok de criador/negócio.',
      '3. Autorize o acesso ao NeuroAds e retorne automaticamente.',
      '4. Certifique-se de usar uma conta TikTok For Business para acesso completo.',
    ],
    link: { label: 'TikTok Developer Docs', url: 'https://developers.tiktok.com' },
  },
  tiktokAds: {
    title: 'Como conectar o TikTok Ads',
    steps: [
      '1. Acesse business.tiktok.com e vá em "Ferramentas de Marketing".',
      '2. Clique em "API de Marketing" e crie um app se ainda não tiver.',
      '3. Copie o App ID da sua aplicação TikTok Ads.',
      '4. Clique em "Conectar" para iniciar o fluxo de autorização.',
    ],
    link: { label: 'TikTok Ads API Docs', url: 'https://ads.tiktok.com/marketing_api/docs' },
  },
  googleCalendar: {
    title: 'Como conectar o Google Calendar',
    steps: [
      '1. Clique em "Conectar" para iniciar o fluxo OAuth do Google.',
      '2. Selecione a conta Google da agenda que deseja conectar.',
      '3. Autorize as permissões de leitura e criação de eventos.',
      '4. Escolha a agenda desejada na lista exibida.',
    ],
    link: { label: 'Documentação Google Calendar API', url: 'https://developers.google.com/calendar' },
  },
  gmail: {
    title: 'Como conectar o Gmail',
    steps: [
      '1. Clique em "Conectar" para iniciar o fluxo OAuth do Google.',
      '2. Selecione a conta Google da caixa de e-mail que deseja usar.',
      '3. Autorize as permissões de envio e leitura de e-mails.',
      '4. Confirme a caixa exibida — os agentes usarão este endereço.',
    ],
    link: { label: 'Documentação Gmail API', url: 'https://developers.google.com/gmail/api' },
  },
  whatsapp: {
    title: 'Como conectar o WhatsApp Business via Kapso',
    steps: [
      '1. Acesse ou crie sua conta no Kapso (app.kapso.ai) para vincular seu número do WhatsApp Cloud API.',
      '2. Vá em Configurações > Chaves de API no Kapso e copie sua KAPSO_API_KEY.',
      '3. Inicie a conexão do seu número empresarial pelo fluxo de onboarding do Kapso (kapso setup link).',
      '4. Copie a KAPSO_API_KEY e o ID do número (Phone Number ID) gerado.',
      '5. Cole a KAPSO_API_KEY e o ID do número no campo abaixo para ativar os Agentes de IA da NeuroAds.',
    ],
    link: { label: 'Documentação do Kapso API', url: 'https://docs.kapso.ai' },
  },
  signature: {
    title: 'Como obter o token de assinatura digital',
    steps: [
      '1. Clicksign: acesse app.clicksign.com > Configurações > API e gere um Access Token.',
      '2. Autentique: acesse app.autentique.com.br > Configurações > API e copie o token.',
      '3. Cole o token no campo abaixo.',
      '4. O Breno usará esta integração para enviar contratos e acompanhar assinaturas.',
    ],
    link: { label: 'Documentação Clicksign', url: 'https://developers.clicksign.com' },
  },
  helpdesk: {
    title: 'Como obter o token do helpdesk',
    steps: [
      '1. Zendesk: Admin > Apps e integrações > APIs > Tokens de API — crie um token.',
      '2. Intercom: Settings > Integrations > Developer Hub > sua app > Access Token.',
      '3. Cole o token no campo abaixo.',
      '4. A Manu usará esta integração para ler e resolver tickets.',
    ],
    link: { label: 'Documentação Zendesk API', url: 'https://developer.zendesk.com/api-reference' },
  },
  warehouse: {
    title: 'Como conectar o BigQuery',
    steps: [
      '1. Clique em "Conectar" para iniciar o fluxo OAuth do Google.',
      '2. Selecione a conta Google que tem acesso ao seu projeto BigQuery.',
      '3. Autorize as permissões de leitura no BigQuery.',
      '4. Certifique-se de que o projeto BigQuery está ativo e com dados.',
    ],
    link: { label: 'Documentação BigQuery', url: 'https://cloud.google.com/bigquery/docs' },
  },
};

// ---------------------------------------------------------------------------
// HelpTooltip component
// ---------------------------------------------------------------------------

function HelpTooltip({ channelId }: { channelId: string }) {
  const [open, setOpen] = useState(false);
  const help = CHANNEL_HELP[channelId];
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  if (!help) return null;

  return (
    <div className="relative inline-flex" ref={tooltipRef}>
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-white/40 bg-[#eef2f7] shadow-[1px_1px_3px_#d1d9e6,_-1px_-1px_3px_#ffffff] hover:shadow-[inset_1px_1px_2px_#d1d9e6,_inset_-1px_-1px_2px_#ffffff] text-slate-400 hover:text-[#FF6A00] transition-all"
        aria-label="Ajuda"
        title="Ver instrucoes"
      >
        <HelpCircle className="w-3.5 h-3.5" />
      </button>

      {open && (
        <div className="absolute left-0 top-8 z-50 w-72 rounded-2xl border border-white/80 bg-[#eef2f7] p-4 shadow-[8px_8px_20px_#c2cbd9,_-8px_-8px_20px_#ffffff] animate-in fade-in zoom-in-95 duration-150">
          {/* Arrow pointing up */}
          <div className="absolute -top-2 left-3 w-4 h-4 bg-[#eef2f7] border-l border-t border-white/80 rotate-45 shadow-[-2px_-2px_4px_#d1d9e6]" />
          <div className="flex items-start justify-between gap-2 mb-3">
            <p className="text-[12px] font-black text-[#0f172a]">{help.title}</p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="shrink-0 h-5 w-5 flex items-center justify-center rounded-full border border-white/50 bg-[#eef2f7] shadow-[1px_1px_2px_#d1d9e6,_-1px_-1px_2px_#ffffff] text-slate-400 hover:text-slate-700 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
          <ol className="space-y-1.5">
            {help.steps.map((step, idx) => (
              <li key={idx} className="text-[11px] font-semibold text-slate-600 leading-snug">
                {step}
              </li>
            ))}
          </ol>
          {help.link && (
            <a
              href={help.link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-[#FF6A00] hover:text-[#ff8f3a] transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
              {help.link.label}
            </a>
          )}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Catalog
// ---------------------------------------------------------------------------

const INTEGRATIONS: IntegrationDef[] = [
  {
    id: 'ga4', connectorKey: 'ga4', name: 'GA4', category: 'ANALYTICS',
    desc: 'Monitore eventos, sessoes e conversoes para leitura real de funil e receita.',
    icon: '/images/connectors/ga4-photorealistic-icon-hd-v1.png',
    flow: 'oauth-select', oauthConnector: 'ga4',
  },
  {
    id: 'googleAds', connectorKey: 'googleAds', name: 'Google Ads', category: 'ADS',
    desc: 'Acompanhe campanhas, custos e conversoes para otimizar seus investimentos.',
    icon: '/images/connectors/google-ads-icon-white-v1.png',
    flow: 'oauth-select', oauthConnector: 'googleAds',
  },
  {
    id: 'searchConsole', connectorKey: 'searchConsole', name: 'Google Search Console', category: 'SEO',
    desc: 'Acompanhe metricas de SEO organico, palavras-chave e cliques no Google Busca.',
    icon: '/images/connectors/google-trends-photorealistic-icon-hd-v1.png',
    flow: 'oauth-select', oauthConnector: 'searchConsole',
  },
  {
    id: 'hubspot', connectorKey: 'crm', name: 'HubSpot', category: 'CRM',
    desc: 'Sincronize leads, empresas e oportunidades para uma visao completa do funil.',
    icon: '/images/connectors/hubspot-photorealistic-icon-hd-v1.png',
    flow: 'oauth', oauthConnector: 'crm',
  },
  {
    id: 'instagram', connectorKey: 'instagram', name: 'Instagram', category: 'SOCIAL',
    desc: 'Consolide sinais de engajamento comercial e conteudo com potencial de conversao.',
    icon: '/images/connectors/instagram-photorealistic-icon-hd-v2.png',
    flow: 'oauth-select', oauthConnector: 'instagram',
  },
  {
    id: 'linkedinAds', connectorKey: 'linkedinAds', name: 'LinkedIn Ads', category: 'ADS',
    desc: 'Acompanhe CPL B2B, qualidade de lead e CAC por conta diretamente no LinkedIn.',
    icon: '/images/connectors/linkedin-ads-photorealistic-icon-hd-v1.png',
    flow: 'oauth-select', oauthConnector: 'linkedinAds',
  },
  {
    id: 'linkedinPage', connectorKey: 'linkedinPage', name: 'LinkedIn Page', category: 'SOCIAL',
    desc: 'Acompanhe conteudo organico, crescimento de audiencia e sinais de intencao B2B.',
    icon: '/images/connectors/linkedin-page-photorealistic-icon-hd-v1.png',
    flow: 'oauth-select', oauthConnector: 'linkedinPage',
  },
  {
    id: 'metaAds', connectorKey: 'metaAds', name: 'Meta Ads', category: 'ADS',
    desc: 'Importe dados de anuncios do Facebook e Instagram para analises mais precisas.',
    icon: '/images/connectors/meta-ads-photorealistic-icon-hd-v1.png',
    flow: 'oauth-select', oauthConnector: 'metaAds',
  },
  {
    id: 'rdStationConversas', connectorKey: 'rdStationConversas', name: 'RD Station Conversas', category: 'CRM',
    desc: 'Integre WhatsApp e canais de atendimento para dar escala ao time comercial.',
    icon: '/images/connectors/rd-station-conversas-photorealistic-icon-hd-v1.png',
    flow: 'api-key',
    apiKeyLabel: 'Token de API — RD Station Conversas',
    apiKeyPlaceholder: 'Cole seu token de API do RD Station Conversas',
  },
  {
    id: 'rdStationCrm', connectorKey: 'rdStation', name: 'RD Station CRM', category: 'CRM',
    desc: 'Centralize contatos, empresas e estagios do pipeline para acelerar repasse.',
    icon: '/images/connectors/rd-station-conversas-photorealistic-icon-hd-v1.png',
    flow: 'api-key',
    apiKeyLabel: 'Token de API — RD Station CRM',
    apiKeyPlaceholder: 'Cole seu token de API do RD Station CRM',
  },
  {
    id: 'rdStationMarketing', connectorKey: 'rdStationMarketing', name: 'RD Station Marketing', category: 'MARKETING',
    desc: 'Conecte formularios, campanhas e automacoes para elevar a qualificacao de leads.',
    icon: '/images/connectors/rd-station-conversas-photorealistic-icon-hd-v1.png',
    flow: 'api-key',
    apiKeyLabel: 'Token de API — RD Station Marketing',
    apiKeyPlaceholder: 'Cole seu token de API do RD Station Marketing',
  },
  {
    id: 'serverTracking', connectorKey: 'serverTracking', name: 'GTM Server + CAPI', category: 'ANALYTICS',
    desc: 'Configuração de atribuição confiável de conversões de servidor e deduplicação via GTM.',
    isComponentIcon: true, componentIconType: 'server',
    flow: 'api-key',
    apiKeyLabel: 'URL do GTM Server / Endpoint de Rastreamento',
    apiKeyPlaceholder: 'Cole a URL do seu container GTM Server',
  },
  {
    id: 'stripe', connectorKey: 'payments', name: 'Stripe', category: 'FINANCEIRO',
    desc: 'Conecte pagamentos para liberar receita confirmada, LTV e conciliacao comercial.',
    isComponentIcon: true, flow: 'api-key',
    apiKeyLabel: 'Chave Secreta da API Stripe (Secret Key)',
    apiKeyPlaceholder: 'sk_live_...',
  },
  {
    id: 'tiktok', connectorKey: 'tiktok', name: 'Tik Tok', category: 'SOCIAL',
    desc: 'Mapeie comportamento de audiencia e tendencias de formato para escalar criativos.',
    icon: '/images/connectors/tiktok-icon-from-reference-v1.png',
    flow: 'oauth', oauthConnector: 'tiktok',
  },
  {
    id: 'tiktokAds', connectorKey: 'tiktokAds', name: 'Tik Tok Ads', category: 'ADS',
    desc: 'Integre performance de midia com custo por aquisicao e receita incremental.',
    icon: '/images/connectors/tiktok-photorealistic-icon-hd-v2.png',
    flow: 'oauth-select', oauthConnector: 'tiktokAds',
  },
  {
    id: 'warehouse', connectorKey: 'warehouse', name: 'BigQuery / Data Warehouse', category: 'ANALYTICS',
    desc: 'Visão unificada dos dados e projeções estruturadas através do Google BigQuery.',
    isComponentIcon: true, componentIconType: 'database',
    flow: 'oauth-select', oauthConnector: 'warehouse',
  },
  {
    id: 'googleCalendar', connectorKey: 'googleCalendar', name: 'Google Calendar', category: 'PRODUTIVIDADE',
    desc: 'Agenda conectada para agendamento de reuniões e briefings automáticos dos agentes.',
    isComponentIcon: true, componentIconType: 'calendar',
    flow: 'oauth-select', oauthConnector: 'googleCalendar',
  },
  {
    id: 'gmail', connectorKey: 'gmail', name: 'Gmail / E-mail', category: 'PRODUTIVIDADE',
    desc: 'Envio de cold mail, fluxos de nutrição e aprovações por e-mail direto da sua caixa.',
    isComponentIcon: true, componentIconType: 'mail',
    flow: 'oauth-select', oauthConnector: 'gmail',
  },
  {
    id: 'whatsapp', connectorKey: 'whatsapp', name: 'WhatsApp Business (Kapso)', category: 'ATENDIMENTO',
    desc: 'Prospecção, fechamento e nutrição por chat via WhatsApp Cloud API oficial da Meta integrado via Kapso.',
    isComponentIcon: true, componentIconType: 'whatsapp',
    flow: 'api-key',
    apiKeyLabel: 'Chave de API Kapso (KAPSO_API_KEY) e Phone Number ID',
    apiKeyPlaceholder: 'Cole sua KAPSO_API_KEY',
  },
  {
    id: 'signature', connectorKey: 'signature', name: 'Assinatura Digital', category: 'VENDAS',
    desc: 'Contratos com assinatura eletrônica para fechamento comercial (Clicksign / Autentique).',
    isComponentIcon: true, componentIconType: 'signature',
    flow: 'api-key',
    apiKeyLabel: 'Token de API — Clicksign ou Autentique',
    apiKeyPlaceholder: 'Cole o token de API da sua plataforma de assinatura',
  },
  {
    id: 'helpdesk', connectorKey: 'helpdesk', name: 'Helpdesk / Suporte', category: 'ATENDIMENTO',
    desc: 'Tickets, histórico e CSAT do seu sistema de suporte (Zendesk / Intercom).',
    isComponentIcon: true, componentIconType: 'helpdesk',
    flow: 'api-key',
    apiKeyLabel: 'Token de API — Zendesk ou Intercom',
    apiKeyPlaceholder: 'Cole o token de API do seu helpdesk',
  },
];

const FILTERS = ['Todos', 'SOCIAL', 'CRM', 'ADS', 'ANALYTICS', 'SEO', 'FINANCEIRO', 'MARKETING', 'PRODUTIVIDADE', 'ATENDIMENTO', 'VENDAS'];

// Category left-border accent colors
const CATEGORY_BORDER: Record<string, string> = {
  SOCIAL:        '#E1306C',
  CRM:           '#8B5CF6',
  ADS:           '#FF6A00',
  ANALYTICS:     '#3B82F6',
  SEO:           '#10B981',
  FINANCEIRO:    '#059669',
  MARKETING:     '#7C3AED',
  PRODUTIVIDADE: '#0EA5E9',
  ATENDIMENTO:   '#06B6D4',
  VENDAS:        '#D97706',
};

// Map of which connectors use which account endpoint key
const OAUTH_SELECT_CONNECTORS: Partial<Record<ConnectorKey, { apiPath: string; resKey: string }>> = {
  ga4: { apiPath: '/api/auth/connectors/ga4/accounts', resKey: 'accounts' },
  googleAds: { apiPath: '/api/auth/connectors/googleAds/accounts', resKey: 'customers' },
  searchConsole: { apiPath: '/api/auth/connectors/searchConsole/accounts', resKey: 'accounts' },
  instagram: { apiPath: '/api/auth/connectors/instagram/accounts', resKey: 'accounts' },
  linkedinAds: { apiPath: '/api/auth/connectors/linkedinAds/accounts', resKey: 'accounts' },
  linkedinPage: { apiPath: '/api/auth/connectors/linkedinPage/accounts', resKey: 'accounts' },
  metaAds: { apiPath: '/api/auth/connectors/metaAds/accounts', resKey: 'accounts' },
  tiktokAds: { apiPath: '/api/auth/connectors/tiktokAds/accounts', resKey: 'accounts' },
  warehouse: { apiPath: '/api/auth/connectors/warehouse/accounts', resKey: 'accounts' },
  googleCalendar: { apiPath: '/api/auth/connectors/googleCalendar/accounts', resKey: 'accounts' },
  gmail: { apiPath: '/api/auth/connectors/gmail/accounts', resKey: 'accounts' },
  whatsapp: { apiPath: '/api/auth/connectors/whatsapp/accounts', resKey: 'accounts' },
};

// Friendly modal title per connector
const ACCOUNT_SELECT_TITLES: Partial<Record<ConnectorKey, string>> = {
  ga4: 'Selecionar conta GA4',
  googleAds: 'Selecionar conta Google Ads',
  searchConsole: 'Selecionar propriedade Search Console',
  instagram: 'Selecionar conta Instagram',
  linkedinAds: 'Selecionar conta LinkedIn Ads',
  linkedinPage: 'Selecionar página LinkedIn',
  metaAds: 'Selecionar conta Meta Ads',
  tiktokAds: 'Selecionar anunciante TikTok Ads',
  warehouse: 'Selecionar projeto BigQuery',
  googleCalendar: 'Selecionar agenda',
  gmail: 'Confirmar caixa de e-mail',
  whatsapp: 'Selecionar número WhatsApp',
};

// ---------------------------------------------------------------------------
// Modal / state types
// ---------------------------------------------------------------------------

type AccountEntry = { id: string; name: string; accountId: string };

type AccountSelectModal = {
  connector: ConnectorKey;
  title: string;
  accounts: AccountEntry[];
  accessToken: string;
  refreshToken: string | null;
  expiresIn?: number | null;
};

type FlowPhase =
  | { phase: 'idle' }
  | { phase: 'oauth-loading'; connector: ConnectorKey }
  | { phase: 'saving'; connector: ConnectorKey }
  | { phase: 'success'; connector: ConnectorKey; label?: string }
  | { phase: 'error'; connector: ConnectorKey; message: string };

type CredsModal = { integ: IntegrationDef; values: Record<string, string> };
type ApiKeyModal = { integ: IntegrationDef; value: string; kapsoApiKey?: string; phoneNumberId?: string; displayPhoneNumber?: string; saving: boolean };

// ---------------------------------------------------------------------------
// Icon renderer (shared)
// ---------------------------------------------------------------------------

function IntegIcon({
  integ,
  size = 'md',
}: {
  integ: IntegrationDef;
  size?: 'sm' | 'md';
}) {
  const iconSize = size === 'sm' ? 'h-5 w-5' : 'h-6 w-6';
  const imgSize = size === 'sm' ? 36 : 40;
  const brandSize = size === 'sm' ? 32 : 38;
  if (integ.isComponentIcon) {
    if (integ.componentIconType === 'database') return <IconBigQuery3D size={brandSize} />;
    if (integ.componentIconType === 'server') return <IconGtmServer3D size={brandSize} />;
    if (integ.componentIconType === 'calendar') return <IconGoogleCalendar3D size={brandSize} />;
    if (integ.componentIconType === 'mail') return <IconGmail3D size={brandSize} />;
    if (integ.componentIconType === 'whatsapp') return <IconWhatsapp3D size={brandSize} />;
    if (integ.componentIconType === 'signature') return <IconSignature3D size={brandSize} />;
    if (integ.componentIconType === 'helpdesk') return <IconHelpdesk3D size={brandSize} />;
    return <IconStripe3D size={brandSize} />;
  }
  if (!integ.icon) return <Key className={`${iconSize} text-[#FF6A00]`} />;
  return (
    <Image
      src={integ.icon as string}
      alt={integ.name}
      width={imgSize}
      height={imgSize}
      className="h-full w-full rounded-xl object-cover"
    />
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

function HubIntegracoesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const [activeFilter, setActiveFilter] = useState('Todos');
  const [connections, setConnections] = useState<ConnectionsMap>({});
  const [loadingConnections, setLoadingConnections] = useState(true);
  const [flowPhase, setFlowPhase] = useState<FlowPhase>({ phase: 'idle' });
  const [accountSelectModal, setAccountSelectModal] = useState<AccountSelectModal | null>(null);
  const [credsModal, setCredsModal] = useState<CredsModal | null>(null);
  const [apiKeyModal, setApiKeyModal] = useState<ApiKeyModal | null>(null);
  const [oauthConfirmModal, setOauthConfirmModal] = useState<IntegrationDef | null>(null);
  const [optionsMenuId, setOptionsMenuId] = useState<string | null>(null);
  const [detailsInteg, setDetailsInteg] = useState<IntegrationDef | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Load real connections from Firestore
  const refreshConnections = useCallback(async () => {
    if (!user) return;
    setLoadingConnections(true);
    try {
      const map = await loadUserConnections(user.uid);
      setConnections(map);
    } finally {
      setLoadingConnections(false);
    }
  }, [user]);

  useEffect(() => { refreshConnections(); }, [refreshConnections]);

  // Close options menu on outside click
  useEffect(() => {
    if (!optionsMenuId) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOptionsMenuId(null);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [optionsMenuId]);

  // Generic OAuth callback processor
  const handleOAuthCallback = useCallback(async (
    connector: ConnectorKey,
    flow: ConnectFlow,
    accessToken: string,
    refreshToken: string | null,
    expiresIn: number | null,
    accountId: string | null,
  ) => {
    if (!user) return;

    if (flow === 'oauth-select') {
      setFlowPhase({ phase: 'oauth-loading', connector });
      const selectConfig = OAUTH_SELECT_CONNECTORS[connector];
      if (!selectConfig) {
        setFlowPhase({ phase: 'error', connector, message: 'Conector sem suporte a seleção de conta.' });
        return;
      }

      try {
        const res = await fetch(selectConfig.apiPath, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accessToken }),
        });
        const data = (await res.json()) as Record<string, AccountEntry[] | string | undefined>;
        if (!res.ok || data.error) {
          setFlowPhase({ phase: 'error', connector, message: String(data.error ?? 'Falha ao listar contas.') });
          return;
        }
        const accounts = (data[selectConfig.resKey] as AccountEntry[] | undefined) ?? [];

        // Normalize: ensure every account has an accountId field
        const normalizedAccounts: AccountEntry[] = accounts.map((acc) => ({
          id: acc.id,
          name: acc.name,
          accountId: acc.accountId ?? acc.id,
        }));

        setAccountSelectModal({
          connector,
          title: ACCOUNT_SELECT_TITLES[connector] ?? 'Selecionar conta',
          accounts: normalizedAccounts,
          accessToken,
          refreshToken,
          expiresIn,
        });
        setFlowPhase({ phase: 'idle' });
      } catch {
        setFlowPhase({ phase: 'error', connector, message: 'Erro de rede ao buscar contas.' });
      }
      return;
    }

    // Simple save (no account selection)
    setFlowPhase({ phase: 'saving', connector });
    try {
      await saveConnection({ connector, uid: user.uid, accessToken, refreshToken, accountId, expiresIn });
      setConnections((prev) => ({ ...prev, [connector]: { isActive: true, accessToken, connectedAt: Date.now() } }));
      setFlowPhase({ phase: 'success', connector });
      setTimeout(() => setFlowPhase({ phase: 'idle' }), 3000);
    } catch {
      setFlowPhase({ phase: 'error', connector, message: 'Falha ao salvar a conexao.' });
    }
  }, [user]);

  // Detect OAuth callback from URL params
  useEffect(() => {
    const connector = searchParams.get('connector') as ConnectorKey | null;
    const success = searchParams.get('connector_auth_success');
    const accessToken = searchParams.get('connector_access_token');
    const refreshToken = searchParams.get('connector_refresh_token');
    const expiresInRaw = searchParams.get('connector_expires_in');
    const accountId = searchParams.get('connector_account_id');
    const authError = searchParams.get('connector_auth_error');

    if (!connector) return;
    router.replace('/hub/integracoes', { scroll: false });

    if (authError) {
      setFlowPhase({ phase: 'error', connector, message: `Erro: ${authError}` });
      return;
    }
    if (success === '1' && accessToken) {
      const integ = INTEGRATIONS.find((i) => i.connectorKey === connector);
      const flow = integ?.flow ?? 'oauth';
      handleOAuthCallback(connector, flow, accessToken, refreshToken, expiresInRaw ? Number(expiresInRaw) : null, accountId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Account selection save
  const handleSelectAccount = useCallback(async (acc: AccountEntry) => {
    if (!user || !accountSelectModal) return;
    const { connector, accessToken, refreshToken, expiresIn } = accountSelectModal;
    setFlowPhase({ phase: 'saving', connector });
    setAccountSelectModal(null);
    try {
      await saveConnection({
        connector, uid: user.uid, accessToken, refreshToken,
        accountId: acc.accountId, accountName: acc.name, expiresIn,
      });
      setConnections((prev) => ({
        ...prev,
        [connector]: {
          isActive: true, accessToken,
          accountId: acc.accountId,
          metadata: { accountName: acc.name },
          connectedAt: Date.now(),
        },
      }));
      setFlowPhase({ phase: 'success', connector, label: acc.name });
      setTimeout(() => setFlowPhase({ phase: 'idle' }), 3000);
    } catch {
      setFlowPhase({ phase: 'error', connector, message: 'Falha ao salvar conta selecionada.' });
    }
  }, [user, accountSelectModal]);

  // HubSpot credentials submit -> OAuth redirect
  const handleCredsSubmit = useCallback((integ: IntegrationDef, values: Record<string, string>) => {
    const params = new URLSearchParams({ next: '/hub/integracoes' });
    integ.credFields?.forEach((f) => { if (values[f.key]) params.set(f.key, values[f.key]); });
    setCredsModal(null);
    window.location.href = `/api/auth/connectors/${integ.oauthConnector ?? integ.connectorKey}/start?${params.toString()}`;
  }, []);

  // API key save
  const handleApiKeySave = useCallback(async () => {
    if (!user || !apiKeyModal) return;
    setApiKeyModal((prev) => prev ? { ...prev, saving: true } : null);
    const { integ, value, kapsoApiKey, phoneNumberId, displayPhoneNumber } = apiKeyModal;
    try {
      if (integ.id === 'whatsapp') {
        const finalApiKey = (kapsoApiKey || value).trim();
        const finalPhoneId = (phoneNumberId || '').trim();
        let finalDisplayPhone = (displayPhoneNumber || '').trim();

        if (!finalApiKey) {
          alert('Por favor, informe a KAPSO_API_KEY.');
          setApiKeyModal((prev) => prev ? { ...prev, saving: false } : null);
          return;
        }

        // Auto-fetch display phone number from Kapso if not provided manually
        if (!finalDisplayPhone && finalPhoneId) {
          try {
            const details = await getKapsoPhoneNumberDetails(finalPhoneId, finalApiKey);
            if (details.success && details.displayPhoneNumber) {
              finalDisplayPhone = details.displayPhoneNumber;
            }
          } catch { /* noop */ }
        }

        const formattedName = finalDisplayPhone
          ? `WhatsApp Business (${finalDisplayPhone})`
          : `WhatsApp Business via Kapso${finalPhoneId ? ` (${finalPhoneId})` : ''}`;

        await saveApiKeyConnection({
          connector: integ.connectorKey,
          uid: user.uid,
          apiKey: finalApiKey,
          accountName: formattedName,
          metadata: {
            provider: 'kapso',
            phoneNumberId: finalPhoneId,
            displayPhoneNumber: finalDisplayPhone,
            phoneNumber: finalDisplayPhone,
            connectedAt: Date.now(),
          },
        });
        setConnections((prev) => ({
          ...prev,
          [integ.connectorKey]: {
            isActive: true,
            accessToken: finalApiKey,
            accountId: finalPhoneId,
            metadata: {
              provider: 'kapso',
              phoneNumberId: finalPhoneId,
              displayPhoneNumber: finalDisplayPhone,
              phoneNumber: finalDisplayPhone,
              connectedAt: Date.now(),
            },
            connectedAt: Date.now(),
          },
        }));
      } else {
        if (!value.trim()) return;
        await saveApiKeyConnection({ connector: integ.connectorKey, uid: user.uid, apiKey: value.trim() });
        setConnections((prev) => ({ ...prev, [integ.connectorKey]: { isActive: true, accessToken: value.trim(), connectedAt: Date.now() } }));
      }
      setApiKeyModal(null);
      setFlowPhase({ phase: 'success', connector: integ.connectorKey });
      setTimeout(() => setFlowPhase({ phase: 'idle' }), 3000);
    } catch {
      setApiKeyModal((prev) => prev ? { ...prev, saving: false } : null);
    }
  }, [user, apiKeyModal]);

  // Disconnect
  const handleDisconnect = useCallback(async (connector: ConnectorKey) => {
    if (!user) return;
    setOptionsMenuId(null);
    try {
      await disconnectConnector(user.uid, connector);
      setConnections((prev) => ({ ...prev, [connector]: { ...(prev[connector] ?? {}), isActive: false } }));
    } catch { /* noop */ }
  }, [user]);

  const openConnect = (integ: IntegrationDef) => {
    if (integ.flow === 'oauth') {
      // If channel has help content, show confirmation modal first
      if (CHANNEL_HELP[integ.id]) {
        setOauthConfirmModal(integ);
      } else {
        window.location.href = `/api/auth/connectors/${integ.oauthConnector ?? integ.connectorKey}/start?next=/hub/integracoes`;
      }
    } else if (integ.flow === 'oauth-select') {
      window.location.href = `/api/auth/connectors/${integ.oauthConnector ?? integ.connectorKey}/start?next=/hub/integracoes`;
    } else if (integ.flow === 'oauth-creds') {
      const initial: Record<string, string> = {};
      integ.credFields?.forEach((f) => { initial[f.key] = ''; });
      setCredsModal({ integ, values: initial });
    } else {
      if (integ.id === 'whatsapp') {
        const conn = connections.whatsapp;
        const existingApiKey = conn?.accessToken || '';
        const existingPhoneId = (conn?.metadata?.phoneNumberId as string) || conn?.accountId || '';
        const existingDisplayPhone = (conn?.metadata?.displayPhoneNumber as string) || (conn?.metadata?.phoneNumber as string) || '';
        setApiKeyModal({
          integ,
          value: existingApiKey,
          kapsoApiKey: existingApiKey,
          phoneNumberId: existingPhoneId,
          displayPhoneNumber: existingDisplayPhone,
          saving: false,
        });
      } else {
        setApiKeyModal({ integ, value: '', saving: false });
      }
    }
  };

  const filteredIntegrations = INTEGRATIONS.filter((i) => activeFilter === 'Todos' || i.category === activeFilter);
  const connectedCount = Object.values(connections).filter((c) => c?.isActive).length;

  // ── helpers for per-card flow state
  const cardFlow = (connKey: ConnectorKey) => {
    if (flowPhase.phase === 'idle') return null;
    const fp = flowPhase as { connector: ConnectorKey; phase: string; message?: string; label?: string };
    if (fp.connector !== connKey) return null;
    return fp;
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="w-full space-y-6 px-6 animate-in fade-in slide-in-from-bottom-4 duration-500 text-[#1e293b]">

      {/* ── Header ── */}
      <header className="py-8 border-b border-slate-200 mb-8">
        <div className="flex items-start justify-between gap-6 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="h-1.5 w-1.5 rounded-full bg-[#FF6A00]" />
              <span className="text-[11px] font-black uppercase tracking-[0.16em] text-[#FF6A00]">Integracoes</span>
            </div>
            <h1 className="text-3xl font-black text-[#0f172a] tracking-tight leading-tight">Conecte Seus Canais</h1>
            <p className="text-slate-500 text-[15px] mt-2 max-w-xl font-bold leading-relaxed">
              Vincule suas plataformas de midia paga e analytics para alimentar os Agentes de IA com dados reais da sua operacao.
            </p>
          </div>
          <div className="flex flex-col gap-2 shrink-0">
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-white/60 bg-[#eef2f7] shadow-[2px_2px_4px_#d1d9e6,_-2px_-2px_4px_#ffffff]">
              <Link2 className="w-4 h-4 text-[#FF6A00]" />
              <span className="text-[13px] font-bold text-[#1e293b]">{INTEGRATIONS.length}+ plataformas</span>
              <span className="text-[13px] text-slate-500 font-medium">disponiveis</span>
            </div>
            <div className="flex items-center justify-between gap-4 px-4 py-2.5 rounded-2xl border border-white/60 bg-[#eef2f7] shadow-[2px_2px_4px_#d1d9e6,_-2px_-2px_4px_#ffffff]">
              <span className="text-[13px] text-slate-500 font-bold">Conectadas</span>
              <div className="flex items-center gap-1.5">
                {loadingConnections
                  ? <Loader2 className="w-3.5 h-3.5 text-[#FF6A00] animate-spin" />
                  : <span className="text-[14px] font-black text-[#1e293b]">{connectedCount}</span>
                }
                <Link2 className="w-3.5 h-3.5 text-[#FF6A00]" />
              </div>
            </div>
            <div className="flex items-center justify-between gap-4 px-4 py-2.5 rounded-2xl border border-white/60 bg-[#eef2f7] shadow-[2px_2px_4px_#d1d9e6,_-2px_-2px_4px_#ffffff]">
              <span className="text-[13px] text-slate-500 font-bold">Sincronizacao</span>
              <div className="flex items-center gap-1.5">
                <span className="text-[14px] font-black text-[#1e293b]">Saudavel</span>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ── Catalog ── */}
      <div className="hub-neu-card overflow-hidden">
        <div className="p-5 border-b border-slate-200 bg-slate-100/30">
          <h2 className="text-[15px] font-black text-[#0f172a] mb-4">Catalogo de Integracoes</h2>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              {FILTERS.map((f) => {
                const tabColor = f === 'Todos' ? '#FF6A00' : CATEGORY_BORDER[f] ?? '#FF6A00';
                const isActive = activeFilter === f;
                return (
                  <button key={f} onClick={() => setActiveFilter(f)}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[12px] font-bold tracking-wide transition-all border ${isActive
                      ? 'shadow-[inset_2px_2px_4px_#d1d9e6,_inset_-2px_-2px_4px_#ffffff]'
                      : 'shadow-[2px_2px_4px_#d1d9e6,_-2px_-2px_4px_#ffffff] hover:shadow-[inset_2px_2px_4px_#d1d9e6,_inset_-2px_-2px_4px_#ffffff]'
                    }`}
                    style={{
                      color: tabColor,
                      background: isActive ? `${tabColor}14` : '#eef2f7',
                      borderColor: isActive ? `${tabColor}55` : 'rgba(255,255,255,0.4)',
                    }}>
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: tabColor }} />
                    {f}
                  </button>
                );
              })}
            </div>
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <Link href="/hub/api-keys" className="px-4 py-1.5 rounded-full text-[12px] font-bold border border-white/40 bg-[#eef2f7] text-slate-700 shadow-[2px_2px_4px_#d1d9e6,_-2px_-2px_4px_#ffffff] hover:shadow-[inset_2px_2px_4px_#d1d9e6,_inset_-2px_-2px_4px_#ffffff] transition-all" style={{ textDecoration: 'none' }}>API Keys</Link>
              <Link href="/hub/mcp-cli" className="px-4 py-1.5 rounded-full text-[12px] font-bold border border-white/40 bg-[#eef2f7] text-slate-700 shadow-[2px_2px_4px_#d1d9e6,_-2px_-2px_4px_#ffffff] hover:shadow-[inset_2px_2px_4px_#d1d9e6,_inset_-2px_-2px_4px_#ffffff] transition-all" style={{ textDecoration: 'none' }}>MCP &amp; CLI</Link>
            </div>
          </div>
        </div>

        <div className="p-6 bg-slate-50/30">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredIntegrations.map((integ) => {
              const connected = isConnectorActive(connections, integ.connectorKey);
              const meta = getConnectionMeta(connections, integ.connectorKey);
              const cf = cardFlow(integ.connectorKey);
              const isLoading = cf?.phase === 'oauth-loading' || cf?.phase === 'saving';
              const isSuccess = cf?.phase === 'success';
              const isError = cf?.phase === 'error';

              return (() => {
                // Shared card inner content — rendered inside either a button (inactive) or plain div (connected)
                const cardInner = (
                  <>
                    <div className="flex items-start justify-between gap-2">
                      <div className="w-11 h-11 shrink-0 rounded-xl flex items-center justify-center border border-white/40 bg-[#eef2f7] shadow-[inset_2px_2px_4px_#d1d9e6,_inset_-2px_-2px_4px_#ffffff] overflow-hidden p-1">
                        <IntegIcon integ={integ} size="sm" />
                      </div>
                      <span
                        className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border"
                        style={{
                          color: CATEGORY_BORDER[integ.category] ?? '#64748B',
                          background: `${CATEGORY_BORDER[integ.category] ?? '#64748B'}14`,
                          borderColor: `${CATEGORY_BORDER[integ.category] ?? '#64748B'}33`,
                        }}
                      >{integ.category}</span>
                    </div>

                    <div className="flex-1">
                      <h3 className="text-[14px] font-black text-[#0f172a] group-hover:text-[#FF6A00] transition-colors leading-tight">{integ.name}</h3>
                      {meta.accountName && <p className="text-[11px] font-bold text-[#FF6A00] mt-0.5 truncate">{meta.accountName}</p>}
                      {meta.accountId && (
                        <p className="text-[10px] font-semibold text-slate-400 mt-0.5 truncate">ID: {meta.accountId}</p>
                      )}
                      <p className="mt-1.5 text-[12px] text-slate-500 font-semibold leading-snug line-clamp-2">{integ.desc}</p>
                    </div>
                  </>
                );

                // ── Bottom status bar
                const statusBar = (() => {
                  if (isLoading) return (
                    <div className="mt-auto pt-3 border-t border-slate-200 flex items-center gap-1.5 text-[#FF6A00]">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span className="text-[12px] font-bold">Conectando...</span>
                    </div>
                  );
                  if (isSuccess) return (
                    <div className="mt-auto pt-3 border-t border-slate-200 flex items-center gap-1.5 text-[#0d9488]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span className="text-[12px] font-bold uppercase tracking-wider">Conectado!</span>
                    </div>
                  );
                  if (isError) return (
                    <div className="mt-auto pt-3 border-t border-slate-200 flex items-center gap-1.5 text-red-500">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span className="text-[11px] font-bold truncate">Erro — tente novamente</span>
                    </div>
                  );
                  if (connected) return (
                    // ── Connected status bar with elegant green gradient ──
                    <div className="mt-auto -mx-5 -mb-5 px-5 py-3 rounded-b-2xl bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.15)] flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-white/90" />
                        <span className="text-[11px] font-black uppercase tracking-widest text-white">Conectado</span>
                      </div>
                      <div className="relative" ref={optionsMenuId === integ.id ? menuRef : null}>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setOptionsMenuId((p) => p === integ.id ? null : integ.id); }}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/20 hover:bg-white/30 border border-white/30 text-white transition-all"
                          aria-label="Opcoes"
                        >
                          <MoreVertical className="w-3.5 h-3.5" />
                        </button>
                        {optionsMenuId === integ.id && (
                          <div className="absolute right-0 bottom-9 z-30 min-w-[148px] overflow-hidden rounded-2xl border border-white/80 bg-[#eef2f7] shadow-[5px_5px_15px_#d1d9e6,_-5px_-5px_15px_#ffffff]">
                            <button type="button" onClick={() => { setDetailsInteg(integ); setOptionsMenuId(null); }} className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-[12px] font-bold text-slate-700 hover:bg-slate-200/60 transition-colors">
                              <Info className="w-3.5 h-3.5 text-slate-400" />Detalhes
                            </button>
                            <div className="mx-3 border-t border-slate-200" />
                            <button type="button" onClick={() => handleDisconnect(integ.connectorKey)} className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-[12px] font-bold text-red-600 hover:bg-red-500/10 transition-colors">
                              <Unlink className="w-3.5 h-3.5" />Desconectar
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                  // Inactive — connect CTA
                  return (
                    <div className="mt-auto pt-3 border-t border-slate-200">
                      <div className="flex items-center gap-1.5 text-[#FF6A00] group-hover:text-[#ff8f3a] transition-colors">
                        {integ.flow === 'api-key'
                          ? <><Key className="w-3.5 h-3.5" /><span className="text-[12px] font-bold">Inserir Token</span></>
                          : integ.flow === 'oauth-creds'
                          ? <><ExternalLink className="w-3.5 h-3.5" /><span className="text-[12px] font-bold">Configurar</span></>
                          : <><span className="text-[12px] font-bold">Conectar</span><ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" /></>
                        }
                      </div>
                    </div>
                  );
                })();

                // ── Inactive card: entire card is clickable ──
                if (!connected && !isLoading && !isSuccess && !isError) {
                  return (
                    <button
                      key={integ.id}
                      type="button"
                      onClick={() => openConnect(integ)}
                      className="hub-neu-card group relative flex flex-col gap-4 p-5 text-left w-full cursor-pointer shadow-[3px_3px_6px_#d1d9e6,_-3px_-3px_6px_#ffffff] hover:shadow-[0_0_0_2px_rgba(255,106,0,0.18),_6px_6px_14px_#c2cbd9,_-6px_-6px_14px_#ffffff] hover:scale-[1.015] active:scale-[1.005] transition-all duration-200 overflow-hidden"
                      style={{ background: '#FFFFFF', borderLeft: `3px solid ${CATEGORY_BORDER[integ.category] ?? '#E5E7EB'}` }}
                    >
                      {cardInner}
                      {statusBar}
                    </button>
                  );
                }

                // ── Connected / loading / error card: plain div (not clickable as whole) ──
                return (
                  <div
                    key={integ.id}
                    className="hub-neu-card group relative flex flex-col gap-4 p-5 shadow-[3px_3px_6px_#d1d9e6,_-3px_-3px_6px_#ffffff] transition-all duration-300 overflow-hidden"
                    style={{ background: '#FFFFFF', borderLeft: `3px solid ${CATEGORY_BORDER[integ.category] ?? '#E5E7EB'}` }}
                  >
                    {cardInner}
                    {statusBar}
                  </div>
                );
              })();
            })}
          </div>
        </div>
      </div>

      {/* ── Details Modal ── */}
      {detailsInteg && (() => {
        const meta = getConnectionMeta(connections, detailsInteg.connectorKey);
        return (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <button type="button" onClick={() => setDetailsInteg(null)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" aria-label="Fechar" />
            <section className="relative w-full max-w-sm rounded-[28px] border border-white/80 bg-[#eef2f7] p-6 shadow-[10px_10px_30px_#c2cbd9,_-10px_-10px_30px_#ffffff] animate-in fade-in zoom-in-95 duration-200">
              <button type="button" onClick={() => setDetailsInteg(null)} className="absolute right-4 top-4 h-8 w-8 flex items-center justify-center rounded-full border border-white/50 bg-[#eef2f7] shadow-[2px_2px_4px_#d1d9e6,_-2px_-2px_4px_#ffffff] hover:shadow-[inset_1px_1px_3px_#d1d9e6,_inset_-1px_-1px_3px_#ffffff] text-slate-500 transition-all"><X className="h-4 w-4" /></button>
              <div className="flex items-center gap-4 mb-5">
                <div className="w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center border border-white/50 bg-[#eef2f7] shadow-[3px_3px_6px_#d1d9e6,_-3px_-3px_6px_#ffffff] overflow-hidden p-1.5">
                  <IntegIcon integ={detailsInteg} size="md" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#FF6B00] mb-0.5">{detailsInteg.category}</p>
                  <h3 className="text-[18px] font-black text-[#0f172a] leading-tight">{detailsInteg.name}</h3>
                </div>
              </div>
              <div className="space-y-3">
                <div className="rounded-2xl border border-white/50 bg-[#eef2f7] p-4 shadow-[inset_2px_2px_4px_#d1d9e6,_inset_-2px_-2px_4px_#ffffff]">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Descricao</p>
                  <p className="text-[13px] font-semibold text-slate-700 leading-snug">{detailsInteg.desc}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-white/50 bg-[#eef2f7] p-3.5 shadow-[inset_2px_2px_4px_#d1d9e6,_inset_-2px_-2px_4px_#ffffff]">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Status</p>
                    <div className="flex items-center gap-1.5 text-[#0d9488]"><CheckCircle2 className="w-3.5 h-3.5" /><span className="text-[12px] font-bold">Conectado</span></div>
                  </div>
                  <div className="rounded-2xl border border-white/50 bg-[#eef2f7] p-3.5 shadow-[inset_2px_2px_4px_#d1d9e6,_inset_-2px_-2px_4px_#ffffff]">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Canal</p>
                    <p className="text-[12px] font-bold text-[#0f172a]">{detailsInteg.category}</p>
                  </div>
                </div>
                {meta.accountName && (
                  <div className="rounded-2xl border border-white/50 bg-[#eef2f7] p-3.5 shadow-[inset_2px_2px_4px_#d1d9e6,_inset_-2px_-2px_4px_#ffffff]">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Conta</p>
                    <p className="text-[12px] font-bold text-[#0f172a]">{meta.accountName}</p>
                  </div>
                )}
                {meta.accountId && (
                  <div className="rounded-2xl border border-white/50 bg-[#eef2f7] p-3.5 shadow-[inset_2px_2px_4px_#d1d9e6,_inset_-2px_-2px_4px_#ffffff]">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">ID da Conta</p>
                    <p className="text-[12px] font-bold text-[#0f172a] font-mono">{meta.accountId}</p>
                  </div>
                )}
                {meta.connectedAt && (
                  <div className="rounded-2xl border border-white/50 bg-[#eef2f7] p-3.5 shadow-[inset_2px_2px_4px_#d1d9e6,_inset_-2px_-2px_4px_#ffffff]">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Conectado em</p>
                    <p className="text-[12px] font-bold text-[#0f172a]">{new Date(meta.connectedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                )}
              </div>
              <button type="button" onClick={() => { handleDisconnect(detailsInteg.connectorKey); setDetailsInteg(null); }}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl border border-red-500/20 bg-red-500/5 px-4 py-2.5 text-[12px] font-bold text-red-600 hover:bg-red-500/10 transition-all shadow-[2px_2px_4px_#d1d9e6,_-2px_-2px_4px_#ffffff] hover:shadow-[inset_1px_1px_3px_#d1d9e6,_inset_-1px_-1px_3px_#ffffff]">
                <Unlink className="w-3.5 h-3.5" />Desconectar canal
              </button>
            </section>
          </div>
        );
      })()}

      {/* ── Account Selection Modal ── */}
      {accountSelectModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <button type="button" onClick={() => setAccountSelectModal(null)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" aria-label="Fechar" />
          <section className="relative w-full max-w-md rounded-[24px] border border-white/80 bg-[#eef2f7] p-6 shadow-[10px_10px_30px_#c2cbd9,_-10px_-10px_30px_#ffffff] animate-in fade-in zoom-in-95 duration-200">
            <button type="button" onClick={() => setAccountSelectModal(null)} className="absolute right-4 top-4 h-8 w-8 flex items-center justify-center rounded-full border border-white/50 bg-[#eef2f7] shadow-[2px_2px_4px_#d1d9e6,_-2px_-2px_4px_#ffffff] hover:shadow-[inset_1px_1px_3px_#d1d9e6,_inset_-1px_-1px_3px_#ffffff] text-slate-500 transition-all"><X className="h-4 w-4" /></button>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center"><BarChart3 className="h-5 w-5 text-[#FF6A00]" /></div>
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.12em] text-[#FF6A00]">Selecionar conta</p>
                <h3 className="text-[18px] font-black text-[#0f172a] leading-tight">{accountSelectModal.title}</h3>
              </div>
            </div>
            <p className="text-[13px] text-slate-500 font-semibold mb-4">
              {accountSelectModal.accounts.length === 0
                ? 'Nenhuma conta encontrada para este perfil.'
                : `${accountSelectModal.accounts.length} conta${accountSelectModal.accounts.length !== 1 ? 's' : ''} encontrada${accountSelectModal.accounts.length !== 1 ? 's' : ''}. Selecione qual deseja conectar.`}
            </p>
            {accountSelectModal.accounts.length > 0 && (
              <ul className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {accountSelectModal.accounts.map((acc) => (
                  <li key={acc.id}>
                    <button type="button" onClick={() => handleSelectAccount(acc)}
                      className="w-full text-left flex items-center justify-between gap-3 px-4 py-3 rounded-[12px] border border-white/50 bg-[#eef2f7] shadow-[2px_2px_4px_#d1d9e6,_-2px_-2px_4px_#ffffff] hover:shadow-[inset_1px_1px_3px_#d1d9e6,_inset_-1px_-1px_3px_#ffffff] transition-all group">
                      <div>
                        <p className="text-[14px] font-bold text-slate-800 group-hover:text-[#FF6A00] transition-colors">{acc.name}</p>
                        {acc.accountId && acc.accountId !== acc.id && (
                          <p className="text-[11px] text-slate-400 mt-0.5 font-semibold">ID: {acc.accountId}</p>
                        )}
                        {acc.accountId && acc.accountId === acc.id && (
                          <p className="text-[11px] text-slate-400 mt-0.5 font-semibold">ID: {acc.accountId}</p>
                        )}
                      </div>
                      <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-[#FF6A00] transition-colors shrink-0" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}

      {/* ── Creds Modal (HubSpot) ── */}
      {credsModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <button type="button" onClick={() => setCredsModal(null)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" aria-label="Fechar" />
          <section className="relative w-full max-w-md rounded-[24px] border border-white/80 bg-[#eef2f7] p-6 shadow-[10px_10px_30px_#c2cbd9,_-10px_-10px_30px_#ffffff] animate-in fade-in zoom-in-95 duration-200">
            <button type="button" onClick={() => setCredsModal(null)} className="absolute right-4 top-4 h-8 w-8 flex items-center justify-center rounded-full border border-white/50 bg-[#eef2f7] shadow-[2px_2px_4px_#d1d9e6,_-2px_-2px_4px_#ffffff] hover:shadow-[inset_1px_1px_3px_#d1d9e6,_inset_-1px_-1px_3px_#ffffff] text-slate-500 transition-all"><X className="h-4 w-4" /></button>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center overflow-hidden">
                <IntegIcon integ={credsModal.integ} size="sm" />
              </div>
              <div className="flex-1">
                <p className="text-[11px] font-black uppercase tracking-[0.12em] text-[#FF6A00]">Configurar</p>
                <h3 className="text-[18px] font-black text-[#0f172a] leading-tight">{credsModal.integ.name}</h3>
              </div>
            </div>
            <div className="flex items-center justify-between gap-2 mb-4">
              <p className="text-[13px] text-slate-500 font-semibold">Insira as credenciais do seu app para iniciar a autenticacao OAuth.</p>
              <HelpTooltip channelId={credsModal.integ.id} />
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleCredsSubmit(credsModal.integ, credsModal.values); }} className="space-y-3">
              {credsModal.integ.credFields?.map((field) => (
                <div key={field.key}>
                  <label className="block text-[11px] font-black uppercase tracking-widest text-slate-500 mb-1">{field.label}</label>
                  <input type={field.secret ? 'password' : 'text'} value={credsModal.values[field.key] ?? ''}
                    onChange={(e) => setCredsModal((prev) => prev ? { ...prev, values: { ...prev.values, [field.key]: e.target.value } } : null)}
                    placeholder={field.placeholder}
                    className="w-full rounded-xl border border-white/30 bg-[#eef2f7] shadow-[inset_2px_2px_4px_#d1d9e6,_inset_-2px_-2px_4px_#ffffff] px-3 py-2.5 text-[13px] font-semibold text-slate-700 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-[#FF6A00]/30"
                    required
                  />
                </div>
              ))}
              <button type="submit" className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#FF6A00] to-[#FF8805] px-4 py-3 text-[13px] font-bold text-white shadow-[0_4px_12px_rgba(255,106,0,0.25)] hover:brightness-105 transition-all">
                <ExternalLink className="w-4 h-4" />Continuar para autenticacao
              </button>
            </form>
          </section>
        </div>
      )}

      {/* ── API Key Modal ── */}
      {apiKeyModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <button type="button" onClick={() => !apiKeyModal.saving && setApiKeyModal(null)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" aria-label="Fechar" />
          <section className="relative w-full max-w-sm rounded-[24px] border border-white/80 bg-[#eef2f7] p-6 shadow-[10px_10px_30px_#c2cbd9,_-10px_-10px_30px_#ffffff] animate-in fade-in zoom-in-95 duration-200">
            <button type="button" onClick={() => !apiKeyModal.saving && setApiKeyModal(null)} className="absolute right-4 top-4 h-8 w-8 flex items-center justify-center rounded-full border border-white/50 bg-[#eef2f7] shadow-[2px_2px_4px_#d1d9e6,_-2px_-2px_4px_#ffffff] hover:shadow-[inset_1px_1px_3px_#d1d9e6,_inset_-1px_-1px_3px_#ffffff] text-slate-500 transition-all"><X className="h-4 w-4" /></button>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                <IntegIcon integ={apiKeyModal.integ} size="sm" />
              </div>
              <div className="flex-1">
                <p className="text-[11px] font-black uppercase tracking-[0.12em] text-[#FF6A00]">Token de API</p>
                <h3 className="text-[18px] font-black text-[#0f172a] leading-tight">{apiKeyModal.integ.name}</h3>
              </div>
            </div>
            <div className="flex items-center justify-between gap-2 mb-4">
              <label className="block text-[11px] font-black uppercase tracking-widest text-slate-500">{apiKeyModal.integ.apiKeyLabel ?? 'Token de API'}</label>
              <HelpTooltip channelId={apiKeyModal.integ.id} />
            </div>
            {apiKeyModal.integ.id === 'whatsapp' ? (
              <div className="space-y-4 mb-4">
                <div className="p-3 rounded-xl border border-emerald-500/20 bg-emerald-50 text-[11px] font-semibold text-emerald-800 space-y-2">
                  <p>💡 <strong>Integração via Kapso:</strong> Preencha os campos abaixo com suas credenciais do Kapso.</p>
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        const res = await fetch('/api/auth/connectors/whatsapp/setup-link', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ name: 'Cliente NeuroAds' }),
                        });
                        const data = await res.json();
                        if (data?.url) {
                          window.open(data.url, '_blank');
                        } else {
                          alert(data?.error || 'Instale ou configure a KAPSO_API_KEY no servidor para usar o Setup Link automático.');
                        }
                      } catch {
                        alert('Falha ao iniciar setup link no Kapso.');
                      }
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] transition-all shadow-xs"
                  >
                    <ExternalLink className="w-3 h-3" /> Gerar Setup Link no Kapso
                  </button>
                </div>

                <div>
                  <label className="block text-[11px] font-black uppercase tracking-widest text-slate-500 mb-1">
                    Chave de API Kapso (KAPSO_API_KEY) *
                  </label>
                  <input
                    type="password"
                    value={apiKeyModal.kapsoApiKey ?? apiKeyModal.value ?? ''}
                    onChange={(e) =>
                      setApiKeyModal((prev) =>
                        prev
                          ? { ...prev, kapsoApiKey: e.target.value, value: e.target.value }
                          : null
                      )
                    }
                    placeholder="ex: kap_live_..."
                    disabled={apiKeyModal.saving}
                    className="w-full rounded-xl border border-white/30 bg-[#eef2f7] shadow-[inset_2px_2px_4px_#d1d9e6,_inset_-2px_-2px_4px_#ffffff] px-3 py-2.5 text-[13px] font-semibold text-slate-700 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-[#FF6A00]/30"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black uppercase tracking-widest text-slate-500 mb-1">
                    ID do Número de Telefone (Phone Number ID)
                  </label>
                  <input
                    type="text"
                    value={apiKeyModal.phoneNumberId ?? ''}
                    onChange={(e) =>
                      setApiKeyModal((prev) =>
                        prev
                          ? { ...prev, phoneNumberId: e.target.value }
                          : null
                      )
                    }
                    placeholder="ex: 597907523413541"
                    disabled={apiKeyModal.saving}
                    className="w-full rounded-xl border border-white/30 bg-[#eef2f7] shadow-[inset_2px_2px_4px_#d1d9e6,_inset_-2px_-2px_4px_#ffffff] px-3 py-2.5 text-[13px] font-semibold text-slate-700 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-[#FF6A00]/30"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black uppercase tracking-widest text-slate-500 mb-1">
                    Número do WhatsApp (ex: +55 11 99999-8888)
                  </label>
                  <input
                    type="text"
                    value={apiKeyModal.displayPhoneNumber ?? ''}
                    onChange={(e) =>
                      setApiKeyModal((prev) =>
                        prev
                          ? { ...prev, displayPhoneNumber: e.target.value }
                          : null
                      )
                    }
                    placeholder="ex: +55 11 99999-8888 (ou autodetectado do Kapso)"
                    disabled={apiKeyModal.saving}
                    className="w-full rounded-xl border border-white/30 bg-[#eef2f7] shadow-[inset_2px_2px_4px_#d1d9e6,_inset_-2px_-2px_4px_#ffffff] px-3 py-2.5 text-[13px] font-semibold text-slate-700 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-[#FF6A00]/30"
                  />
                </div>
              </div>
            ) : (
              <div className="mb-4">
                <div className="sr-only">{apiKeyModal.integ.apiKeyLabel}</div>
                <textarea value={apiKeyModal.value} onChange={(e) => setApiKeyModal((prev) => prev ? { ...prev, value: e.target.value } : null)}
                  placeholder={apiKeyModal.integ.apiKeyPlaceholder ?? 'Cole seu token aqui'} rows={3} disabled={apiKeyModal.saving}
                  className="w-full rounded-xl border border-white/30 bg-[#eef2f7] shadow-[inset_2px_2px_4px_#d1d9e6,_inset_-2px_-2px_4px_#ffffff] px-3 py-2.5 text-[13px] font-semibold text-slate-700 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-[#FF6A00]/30 resize-none"
                />
              </div>
            )}

            <button type="button" onClick={handleApiKeySave} disabled={(apiKeyModal.integ.id === 'whatsapp' ? !(apiKeyModal.kapsoApiKey || apiKeyModal.value)?.trim() : !apiKeyModal.value.trim()) || apiKeyModal.saving}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#FF6A00] to-[#FF8805] px-4 py-3 text-[13px] font-bold text-white shadow-[0_4px_12px_rgba(255,106,0,0.25)] hover:brightness-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              {apiKeyModal.saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              {apiKeyModal.saving ? 'Salvando...' : 'Salvar e Conectar'}
            </button>
          </section>
        </div>
      )}

      {/* ── OAuth Confirm Modal (Stripe, TikTok, TikTok Ads, BigQuery) ── */}
      {oauthConfirmModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <button type="button" onClick={() => setOauthConfirmModal(null)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" aria-label="Fechar" />
          <section className="relative w-full max-w-sm rounded-[24px] border border-white/80 bg-[#eef2f7] p-6 shadow-[10px_10px_30px_#c2cbd9,_-10px_-10px_30px_#ffffff] animate-in fade-in zoom-in-95 duration-200">
            <button type="button" onClick={() => setOauthConfirmModal(null)} className="absolute right-4 top-4 h-8 w-8 flex items-center justify-center rounded-full border border-white/50 bg-[#eef2f7] shadow-[2px_2px_4px_#d1d9e6,_-2px_-2px_4px_#ffffff] hover:shadow-[inset_1px_1px_3px_#d1d9e6,_inset_-1px_-1px_3px_#ffffff] text-slate-500 transition-all"><X className="h-4 w-4" /></button>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center overflow-hidden">
                <IntegIcon integ={oauthConfirmModal} size="sm" />
              </div>
              <div className="flex-1">
                <p className="text-[11px] font-black uppercase tracking-[0.12em] text-[#FF6A00]">Conectar</p>
                <h3 className="text-[18px] font-black text-[#0f172a] leading-tight">{oauthConfirmModal.name}</h3>
              </div>
            </div>
            <div className="rounded-2xl border border-white/50 bg-[#eef2f7] p-4 shadow-[inset_2px_2px_4px_#d1d9e6,_inset_-2px_-2px_4px_#ffffff] mb-4">
              <p className="text-[12px] font-semibold text-slate-600 leading-snug">{oauthConfirmModal.desc}</p>
            </div>
            <div className="flex items-center justify-between gap-2 mb-4">
              <p className="text-[12px] text-slate-500 font-semibold">
                Voce sera redirecionado para autenticar sua conta.
              </p>
              <HelpTooltip channelId={oauthConfirmModal.id} />
            </div>
            <button
              type="button"
              onClick={() => {
                const connector = oauthConfirmModal;
                setOauthConfirmModal(null);
                window.location.href = `/api/auth/connectors/${connector.oauthConnector ?? connector.connectorKey}/start?next=/hub/integracoes`;
              }}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#FF6A00] to-[#FF8805] px-4 py-3 text-[13px] font-bold text-white shadow-[0_4px_12px_rgba(255,106,0,0.25)] hover:brightness-105 transition-all"
            >
              <ExternalLink className="w-4 h-4" />Continuar para autenticacao
            </button>
          </section>
        </div>
      )}

      {/* ── Error toast ── */}
      {flowPhase.phase === 'error' && (
        <div className="fixed bottom-6 right-6 z-[9999] flex items-center gap-3 rounded-2xl border border-red-500/20 bg-white px-4 py-3 shadow-[0_8px_24px_rgba(239,68,68,0.15)] animate-in slide-in-from-bottom-4 duration-300">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          <p className="text-[13px] font-bold text-red-700 max-w-xs">{(flowPhase as { message: string }).message}</p>
          <button type="button" onClick={() => setFlowPhase({ phase: 'idle' })} className="ml-1 text-slate-400 hover:text-slate-700 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

export default function HubIntegracoesPage() {
  return (
    <Suspense fallback={<div className="w-full h-64 flex items-center justify-center"><Loader2 className="w-6 h-6 text-[#FF6A00] animate-spin" /></div>}>
      <HubIntegracoesContent />
    </Suspense>
  );
}
