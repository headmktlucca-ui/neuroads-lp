'use client';

import React, { Suspense, useCallback, useEffect, useState } from 'react';
import { Link2, ShieldCheck, ArrowRight, CheckCircle2, CreditCard, X, Loader2, BarChart3, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { doc, setDoc } from 'firebase/firestore';
import { useAuth } from '../../../context/AuthContext';
import { getFirebaseDb } from '../../../lib/firebase';

type IntegrationStatus = 'available' | 'connected';

type Integration = {
  id: string;
  name: string;
  status: IntegrationStatus;
  category: string;
  desc: string;
  icon?: string;
  isComponentIcon?: boolean;
  oauthConnector?: string;
};

const INTEGRATIONS: Integration[] = [
  {
    id: 'ga4',
    name: 'GA4',
    status: 'available',
    category: 'ANALYTICS',
    desc: 'Monitore eventos, sessões e conversões para leitura real de funil e receita.',
    icon: '/images/connectors/ga4-photorealistic-icon-hd-v1.png',
    oauthConnector: 'ga4',
  },
  {
    id: 'googleAds',
    name: 'Google Ads',
    status: 'connected',
    category: 'ADS',
    desc: 'Acompanhe campanhas, custos e conversões para otimizar seus investimentos.',
    icon: '/images/connectors/google-ads-icon-white-v1.png'
  },
  {
    id: 'searchConsole',
    name: 'Google Search Console',
    status: 'available',
    category: 'SEO',
    desc: 'Acompanhe métricas de SEO orgânico, palavras-chave e cliques no Google Busca.',
    icon: '/images/connectors/google-trends-photorealistic-icon-hd-v1.png'
  },
  {
    id: 'hubspot',
    name: 'HubSpot',
    status: 'available',
    category: 'CRM',
    desc: 'Sincronize leads, empresas e oportunidades para uma visão completa do funil.',
    icon: '/images/connectors/hubspot-photorealistic-icon-hd-v1.png'
  },
  {
    id: 'instagram',
    name: 'Instagram',
    status: 'available',
    category: 'SOCIAL',
    desc: 'Consolide sinais de engajamento comercial e conteúdo com potencial de conversão.',
    icon: '/images/connectors/instagram-photorealistic-icon-hd-v2.png'
  },
  {
    id: 'linkedinPage',
    name: 'LinkedIn Page',
    status: 'available',
    category: 'SOCIAL',
    desc: 'Acompanhe conteúdo orgânico, crescimento de audiência e sinais de intenção B2B.',
    icon: '/images/connectors/linkedin-page-photorealistic-icon-hd-v1.png'
  },
  {
    id: 'metaAds',
    name: 'Meta Ads',
    status: 'connected',
    category: 'ADS',
    desc: 'Importe dados de anúncios do Facebook e Instagram para análises mais precisas.',
    icon: '/images/connectors/meta-ads-photorealistic-icon-hd-v1.png'
  },
  {
    id: 'rdStationConversas',
    name: 'RD Station Conversas',
    status: 'available',
    category: 'CRM',
    desc: 'Integre WhatsApp e canais de atendimento para dar escala ao time comercial sem perder contexto.',
    icon: '/images/connectors/rd-station-conversas-photorealistic-icon-hd-v1.png'
  },
  {
    id: 'rdStationCrm',
    name: 'RD Station CRM',
    status: 'available',
    category: 'CRM',
    desc: 'Centralize contatos, empresas e estágios do pipeline para acelerar repasse e previsibilidade comercial.',
    icon: '/images/connectors/rd-station-conversas-photorealistic-icon-hd-v1.png'
  },
  {
    id: 'rdStationMarketing',
    name: 'RD Station Marketing',
    status: 'available',
    category: 'MARKETING',
    desc: 'Conecte formulários, campanhas e automações para elevar a qualificação de leads com dados reais.',
    icon: '/images/connectors/rd-station-conversas-photorealistic-icon-hd-v1.png'
  },
  {
    id: 'stripe',
    name: 'Stripe',
    status: 'available',
    category: 'FINANCEIRO',
    desc: 'Conecte pagamentos para liberar receita confirmada, LTV e conciliação comercial no Hub.',
    isComponentIcon: true
  },
  {
    id: 'tiktok',
    name: 'Tik Tok',
    status: 'available',
    category: 'SOCIAL',
    desc: 'Mapeie comportamento de audiência e tendências de formato para escalar criativos.',
    icon: '/images/connectors/tiktok-icon-from-reference-v1.png'
  },
  {
    id: 'tiktokAds',
    name: 'Tik Tok Ads',
    status: 'available',
    category: 'ADS',
    desc: 'Integre performance de mídia com custo por aquisição e receita incremental.',
    icon: '/images/connectors/tiktok-photorealistic-icon-hd-v2.png'
  },
];

const FILTERS = ['Todos', 'SOCIAL', 'CRM', 'ADS', 'ANALYTICS', 'SEO', 'FINANCEIRO', 'MARKETING'];

type Ga4Account = { id: string; name: string; accountId: string };

type Ga4ModalState =
  | { phase: 'loading' }
  | { phase: 'select'; accounts: Ga4Account[]; accessToken: string; refreshToken: string | null }
  | { phase: 'saving'; selectedAccount: Ga4Account; accessToken: string; refreshToken: string | null }
  | { phase: 'error'; message: string }
  | { phase: 'success'; accountName: string };

function HubIntegracoesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const [activeFilter, setActiveFilter] = useState('Todos');
  const [connectedIds, setConnectedIds] = useState<Set<string>>(
    new Set(INTEGRATIONS.filter((i) => i.status === 'connected').map((i) => i.id))
  );
  const [ga4Modal, setGa4Modal] = useState<Ga4ModalState | null>(null);

  // Detect OAuth callback for GA4
  useEffect(() => {
    const connector = searchParams.get('connector');
    const success = searchParams.get('connector_auth_success');
    const accessToken = searchParams.get('connector_access_token');
    const refreshToken = searchParams.get('connector_refresh_token');
    const authError = searchParams.get('connector_auth_error');

    if (connector !== 'ga4') return;

    // Clean URL immediately
    router.replace('/hub/integracoes', { scroll: false });

    if (authError) {
      setGa4Modal({ phase: 'error', message: `Erro na autenticação: ${authError}` });
      return;
    }

    if (success === '1' && accessToken) {
      setGa4Modal({ phase: 'loading' });
      fetchGa4Accounts(accessToken, refreshToken ?? null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchGa4Accounts = useCallback(async (accessToken: string, refreshToken: string | null) => {
    try {
      const res = await fetch('/api/auth/connectors/ga4/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken }),
      });
      const data = (await res.json()) as { accounts?: Ga4Account[]; error?: string };
      if (!res.ok || data.error) {
        setGa4Modal({ phase: 'error', message: data.error ?? 'Falha ao listar contas do GA4.' });
        return;
      }
      setGa4Modal({ phase: 'select', accounts: data.accounts ?? [], accessToken, refreshToken });
    } catch {
      setGa4Modal({ phase: 'error', message: 'Erro de rede ao buscar contas do GA4.' });
    }
  }, []);

  const handleSelectGa4Account = useCallback(async (account: Ga4Account) => {
    if (!user || ga4Modal?.phase !== 'select') return;
    const { accessToken, refreshToken } = ga4Modal;

    setGa4Modal({ phase: 'saving', selectedAccount: account, accessToken, refreshToken });

    try {
      const db = getFirebaseDb();
      await setDoc(
        doc(db, 'users', user.uid),
        {
          connectors: {
            ga4: {
              connected: true,
              accountId: account.accountId,
              accountName: account.name,
              accessToken,
              refreshToken: refreshToken ?? null,
              connectedAt: Date.now(),
            },
          },
        },
        { merge: true }
      );
      setConnectedIds((prev) => new Set([...prev, 'ga4']));
      setGa4Modal({ phase: 'success', accountName: account.name });
    } catch {
      setGa4Modal({ phase: 'error', message: 'Falha ao salvar a integração. Tente novamente.' });
    }
  }, [user, ga4Modal]);

  const filteredIntegrations = INTEGRATIONS.filter(
    (integ) => activeFilter === 'Todos' || integ.category === activeFilter
  );

  const connectedCount = connectedIds.size;

  return (
    <div className="w-full space-y-6 px-6 animate-in fade-in slide-in-from-bottom-4 duration-500 text-[#1e293b]">
      <header className="py-8 border-b border-slate-200 mb-8">
        <div className="flex items-start justify-between gap-6 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="h-1.5 w-1.5 rounded-full bg-[#FF6A00]" />
              <span className="text-[11px] font-black uppercase tracking-[0.16em] text-[#FF6A00]">Integrações</span>
            </div>
            <h1 className="text-3xl font-black text-[#0f172a] tracking-tight leading-tight">Conecte Seus Canais</h1>
            <p className="text-slate-500 text-[15px] mt-2 max-w-xl font-bold leading-relaxed">
              Vincule suas plataformas de mídia paga e analytics para alimentar os Agentes de IA com dados reais da sua operação.
            </p>
          </div>
          <div className="flex flex-col gap-2 shrink-0">
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-white/60 bg-[#eef2f7] shadow-[2px_2px_4px_#d1d9e6,_-2px_-2px_4px_#ffffff]">
              <Link2 className="w-4 h-4 text-[#FF6A00]" />
              <span className="text-[13px] font-bold text-[#1e293b]">13+ plataformas</span>
              <span className="text-[13px] text-slate-500 font-medium">disponíveis</span>
            </div>
            <div className="flex items-center justify-between gap-4 px-4 py-2.5 rounded-2xl border border-white/60 bg-[#eef2f7] shadow-[2px_2px_4px_#d1d9e6,_-2px_-2px_4px_#ffffff]">
              <span className="text-[13px] text-slate-500 font-bold">Conectadas</span>
              <div className="flex items-center gap-1.5">
                <span className="text-[14px] font-black text-[#1e293b]">{connectedCount}</span>
                <Link2 className="w-3.5 h-3.5 text-[#FF6A00]" />
              </div>
            </div>
            <div className="flex items-center justify-between gap-4 px-4 py-2.5 rounded-2xl border border-white/60 bg-[#eef2f7] shadow-[2px_2px_4px_#d1d9e6,_-2px_-2px_4px_#ffffff]">
              <span className="text-[13px] text-slate-500 font-bold">Sincronização</span>
              <div className="flex items-center gap-1.5">
                <span className="text-[14px] font-black text-[#1e293b]">Saudável</span>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Catálogo */}
      <div className="rounded-3xl border border-white/50 bg-[#eef2f7] overflow-hidden text-[#1e293b] shadow-[5px_5px_10px_#d1d9e6,_-5px_-5px_10px_#ffffff]">
        <div className="p-5 border-b border-slate-200 bg-slate-100/30">
          <h2 className="text-[15px] font-black text-[#0f172a] mb-4">Catálogo de Integrações</h2>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              {FILTERS.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-3.5 py-1.5 rounded-full text-[12px] font-bold tracking-wide transition-all ${
                    activeFilter === filter
                      ? 'bg-[#eef2f7] text-[#FF6A00] shadow-[inset_2px_2px_4px_#d1d9e6,_inset_-2px_-2px_4px_#ffffff] border border-white/20'
                      : 'bg-[#eef2f7] border border-white/40 text-slate-600 shadow-[2px_2px_4px_#d1d9e6,_-2px_-2px_4px_#ffffff] hover:shadow-[inset_2px_2px_4px_#d1d9e6,_inset_-2px_-2px_4px_#ffffff]'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <Link href="/hub/api-keys" className="px-4 py-1.5 rounded-full text-[12px] font-bold tracking-wide border border-white/40 bg-[#eef2f7] text-slate-700 shadow-[2px_2px_4px_#d1d9e6,_-2px_-2px_4px_#ffffff] hover:shadow-[inset_2px_2px_4px_#d1d9e6,_inset_-2px_-2px_4px_#ffffff] transition-all" style={{ textDecoration: 'none' }}>
                API Keys
              </Link>
              <Link href="/hub/mcp-cli" className="px-4 py-1.5 rounded-full text-[12px] font-bold tracking-wide border border-white/40 bg-[#eef2f7] text-slate-700 shadow-[2px_2px_4px_#d1d9e6,_-2px_-2px_4px_#ffffff] hover:shadow-[inset_2px_2px_4px_#d1d9e6,_inset_-2px_-2px_4px_#ffffff] transition-all" style={{ textDecoration: 'none' }}>
                MCP & CLI
              </Link>
            </div>
          </div>
        </div>

        <div className="p-6 bg-slate-50/30">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredIntegrations.map((integ) => {
              const isConnected = connectedIds.has(integ.id);
              return (
                <div
                  key={integ.id}
                  className="group relative flex flex-col gap-4 rounded-[20px] border border-white/60 bg-[#eef2f7] p-5 shadow-[3px_3px_6px_#d1d9e6,_-3px_-3px_6px_#ffffff] hover:shadow-[4px_4px_8px_#c2cbd9,_-4px_-4px_8px_#ffffff] transition-all duration-300"
                >
                  {/* Icon + category badge */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="w-11 h-11 shrink-0 rounded-xl flex items-center justify-center border border-white/40 bg-[#eef2f7] shadow-[inset_2px_2px_4px_#d1d9e6,_inset_-2px_-2px_4px_#ffffff] overflow-hidden p-1">
                      {integ.isComponentIcon ? (
                        <CreditCard className="h-5 w-5 text-[#635BFF]" />
                      ) : (
                        <Image
                          src={integ.icon as string}
                          alt={`Ícone ${integ.name}`}
                          width={36}
                          height={36}
                          className="h-full w-full rounded-lg object-cover"
                        />
                      )}
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border border-white/60 bg-[#eef2f7] shadow-[2px_2px_4px_#d1d9e6,_-2px_-2px_4px_#ffffff] ${
                      isConnected ? 'text-[#0d9488]' : 'text-slate-500'
                    }`}>
                      {integ.category}
                    </span>
                  </div>

                  {/* Name + desc */}
                  <div className="flex-1">
                    <h3 className="text-[14px] font-black text-[#0f172a] group-hover:text-[#FF6A00] transition-colors leading-tight">
                      {integ.name}
                    </h3>
                    <p className="mt-1.5 text-[12px] text-slate-500 font-semibold leading-snug line-clamp-2">
                      {integ.desc}
                    </p>
                  </div>

                  {/* Action */}
                  <div className="mt-auto pt-3 border-t border-slate-200">
                    {isConnected ? (
                      <div className="flex items-center gap-1.5 text-[#0d9488]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span className="text-[12px] font-bold uppercase tracking-wider">Conectado</span>
                      </div>
                    ) : integ.oauthConnector ? (
                      <a
                        href={`/api/auth/connectors/${integ.oauthConnector}/start?next=/hub/integracoes`}
                        className="flex items-center gap-1.5 text-[#FF6A00] hover:text-[#ff8f3a] transition-colors"
                        style={{ textDecoration: 'none' }}
                      >
                        <span className="text-[12px] font-bold">Conectar</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </a>
                    ) : (
                      <button className="flex items-center gap-1.5 text-slate-500 hover:text-[#FF6A00] transition-colors">
                        <span className="text-[12px] font-bold">Conectar</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* GA4 Account Selection Modal */}
      {ga4Modal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <button
            type="button"
            onClick={() => setGa4Modal(null)}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            aria-label="Fechar"
          />
          <section className="relative w-full max-w-md rounded-[24px] border border-white/80 bg-white/95 p-6 shadow-[0_24px_60px_rgba(13,26,42,0.15)] text-[#1e293b] animate-in fade-in zoom-in-95 duration-200">

            {/* Close */}
            {ga4Modal.phase !== 'saving' && (
              <button
                type="button"
                onClick={() => setGa4Modal(null)}
                className="absolute right-4 top-4 h-8 w-8 flex items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-slate-600 transition-all hover:bg-slate-200 hover:text-slate-800 hover:scale-105 active:scale-95 shadow-sm"
              >
                <X className="h-4 w-4" />
              </button>
            )}

            {/* Loading */}
            {ga4Modal.phase === 'loading' && (
              <div className="flex flex-col items-center gap-4 py-8">
                <Loader2 className="h-8 w-8 text-[#FF6A00] animate-spin" />
                <p className="text-[15px] font-bold text-[#0f172a]">Buscando suas contas GA4…</p>
                <p className="text-[13px] text-slate-500 font-semibold">Conectando com o Google Analytics</p>
              </div>
            )}

            {/* Account selection */}
            {ga4Modal.phase === 'select' && (
              <>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                    <BarChart3 className="h-5 w-5 text-[#FF6A00]" />
                  </div>
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.12em] text-[#FF6A00]">Google Analytics 4</p>
                    <h3 className="text-[18px] font-black text-[#0f172a] leading-tight">Selecionar Conta</h3>
                  </div>
                </div>

                <p className="text-[13px] text-slate-500 font-semibold mb-4">
                  {ga4Modal.accounts.length === 0
                    ? 'Nenhuma conta GA4 encontrada para este perfil do Google.'
                    : `${ga4Modal.accounts.length} conta${ga4Modal.accounts.length !== 1 ? 's' : ''} encontrada${ga4Modal.accounts.length !== 1 ? 's' : ''}. Selecione qual deseja conectar.`
                  }
                </p>

                {ga4Modal.accounts.length > 0 && (
                  <ul className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {ga4Modal.accounts.map((account) => (
                      <li key={account.id}>
                        <button
                          type="button"
                          onClick={() => handleSelectGa4Account(account)}
                          className="w-full text-left flex items-center justify-between gap-3 px-4 py-3 rounded-[12px] border border-slate-200 bg-slate-50 hover:bg-orange-500/5 hover:border-[#FF6A00]/30 transition-all group"
                        >
                          <div>
                            <p className="text-[14px] font-bold text-slate-800 group-hover:text-[#FF6A00] transition-colors">
                              {account.name}
                            </p>
                            <p className="text-[11px] text-slate-400 mt-0.5 font-semibold">ID: {account.accountId}</p>
                          </div>
                          <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-[#FF6A00] transition-colors shrink-0" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}

                {ga4Modal.accounts.length === 0 && (
                  <a
                    href="/api/auth/connectors/ga4/start?next=/hub/integracoes"
                    className="mt-2 inline-flex h-10 items-center justify-center gap-2 rounded-[12px] bg-gradient-to-r from-[#FF6A00] to-[#FF8805] px-5 text-[13px] font-bold text-white shadow-[0_4px_12px_rgba(255,106,0,0.25)] hover:brightness-105 hover:scale-102 transition-all"
                  >
                    Tentar outra conta Google
                  </a>
                )}
              </>
            )}

            {/* Saving */}
            {ga4Modal.phase === 'saving' && (
              <div className="flex flex-col items-center gap-4 py-8">
                <Loader2 className="h-8 w-8 text-[#FF6A00] animate-spin" />
                <p className="text-[15px] font-bold text-[#0f172a]">Salvando integração…</p>
                <p className="text-[13px] text-slate-500 font-semibold">{ga4Modal.selectedAccount.name}</p>
              </div>
            )}

            {/* Success */}
            {ga4Modal.phase === 'success' && (
              <div className="flex flex-col items-center gap-4 py-8 text-center">
                <div className="h-14 w-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <CheckCircle2 className="h-7 w-7 text-[#0d9488]" />
                </div>
                <div>
                  <p className="text-[18px] font-black text-[#0f172a]">GA4 Conectado!</p>
                  <p className="text-[13px] text-slate-500 font-semibold mt-1">{ga4Modal.accountName}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setGa4Modal(null)}
                  className="mt-2 h-10 px-6 rounded-[12px] bg-gradient-to-r from-[#FF6A00] to-[#FF8805] text-[13px] font-bold text-white shadow-[0_4px_12px_rgba(255,106,0,0.25)] hover:brightness-105 hover:scale-102 transition-all"
                >
                  Concluir
                </button>
              </div>
            )}

            {/* Error */}
            {ga4Modal.phase === 'error' && (
              <div className="flex flex-col items-center gap-4 py-6 text-center">
                <div className="h-12 w-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-red-500" />
                </div>
                <div>
                  <p className="text-[16px] font-black text-[#0f172a]">Falha na conexão</p>
                  <p className="text-[12px] text-slate-500 font-semibold mt-1 max-w-xs">{ga4Modal.message}</p>
                </div>
                <a
                  href="/api/auth/connectors/ga4/start?next=/hub/integracoes"
                  className="h-10 px-6 rounded-[12px] bg-gradient-to-r from-[#FF6A00] to-[#FF8805] text-[13px] font-bold text-white shadow-[0_4px_12px_rgba(255,106,0,0.25)] hover:brightness-105 hover:scale-102 transition-all inline-flex items-center"
                  style={{ textDecoration: 'none' }}
                >
                  Tentar novamente
                </a>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

export default function HubIntegracoesPage() {
  return (
    <Suspense fallback={
      <div className="w-full flex items-center justify-center py-32">
        <Loader2 className="h-6 w-6 text-[#FF6A00] animate-spin" />
      </div>
    }>
      <HubIntegracoesContent />
    </Suspense>
  );
}
