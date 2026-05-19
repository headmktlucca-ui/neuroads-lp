'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import {
  Database,
  Building2,
  CheckCircle2,
  Cog,
  Funnel,
  Gem,
  Globe,
  PlugZap,
  Sparkles,
  Target,
  Wrench,
  type LucideIcon,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getContractedAgentsFromProfile } from '../../lib/hub-agents';
import { getHubProfileSummary } from '../../lib/hub-profile';

type ActionItem = {
  id: string;
  order: string;
  title: string;
  description: string;
};

const ACTIONS: ActionItem[] = [];

const REAL_DATA_REQUIREMENTS = [
  'Conectar Google Ads API e Meta Ads API.',
  'Ativar GA4 Data API e tracking server-side (GTM Server + CAPI/Enhanced).',
  'Integrar CRM, pagamentos e data warehouse para consolidar receita e atribuição.',
  'Definir timezone, janela de atribuição e frequência de atualização.',
];

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'Bom dia';
  if (hour >= 12 && hour < 18) return 'Boa tarde';
  return 'Boa noite';
}

function getFirstName(fullName: string | null | undefined): string {
  if (!fullName) return 'Claudio';
  const first = fullName.trim().split(/\s+/)[0];
  return first || 'Claudio';
}

function formatTrialCountdown(remainingMs: number): string {
  const totalSeconds = Math.max(Math.floor(remainingMs / 1000), 0);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  return `${days}d ${hours}h ${minutes}m`;
}

function TrailCard({
  title,
  subtitle,
  points,
  href,
  palette,
  icon,
}: {
  title: string;
  subtitle: string;
  points: string[];
  href: string;
  palette: {
    iconBg: string;
    iconColor: string;
    border: string;
    buttonBorder: string;
    buttonText: string;
  };
  icon: LucideIcon;
}) {
  const Icon = icon;

  return (
    <article className={`flex h-full flex-col rounded-[16px] border ${palette.border} bg-white p-5`}>
      <div className="mb-3 flex items-center gap-3">
        <span className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${palette.iconBg}`}>
          <Icon className={`h-6 w-6 ${palette.iconColor}`} />
        </span>
        <h3 className={`text-[24px] leading-none font-black tracking-tight ${palette.iconColor}`}>{title}</h3>
      </div>

      <p className="mb-4 text-[16px] leading-[1.4] font-semibold tracking-tight text-[#111827]">{subtitle}</p>

      <ul className="mb-5 space-y-2">
        {points.map((point) => (
          <li key={point} className="flex items-start gap-2 text-[14px] leading-[1.4] text-[#4B5563]">
            <CheckCircle2 className={`mt-0.5 h-5 w-5 ${palette.iconColor}`} />
            {point}
          </li>
        ))}
      </ul>

      <Link
        href={href}
        className={`mt-auto inline-flex h-12 w-full items-center justify-center gap-2 rounded-[12px] border ${palette.buttonBorder} px-4 text-[15px] font-bold ${palette.buttonText} transition hover:brightness-95`}
      >
        Acessar trilha
        <span aria-hidden>→</span>
      </Link>
    </article>
  );
}

export default function StrategicHubOverview() {
  const { user, profile } = useAuth();
  const [nowMs, setNowMs] = useState(() => Date.now());

  const greeting = useMemo(() => getGreeting(), []);
  const firstName = getFirstName(user?.displayName || user?.email);
  const hubProfile = useMemo(() => getHubProfileSummary(profile), [profile]);
  const activeAgentsCount = useMemo(
    () => Array.from(getContractedAgentsFromProfile(profile).values()).filter((agent) => agent.isActive).length,
    [profile]
  );
  const remainingAgentSlots =
    hubProfile.agentLimit != null ? Math.max(hubProfile.agentLimit - activeAgentsCount, 0) : null;
  const operationLabel =
    hubProfile.agentLimit != null && hubProfile.includedExecutions != null
      ? `${remainingAgentSlots} vagas • ${hubProfile.includedExecutions.toLocaleString('pt-BR')} exec./mês`
      : hubProfile.operationLabel;

  useEffect(() => {
    if (!hubProfile.isTrialing || hubProfile.trialEndsAt == null) return;
    const intervalId = window.setInterval(() => {
      setNowMs(Date.now());
    }, 60_000);
    return () => window.clearInterval(intervalId);
  }, [hubProfile.isTrialing, hubProfile.trialEndsAt]);

  const trialCountdownLabel = useMemo(() => {
    if (!hubProfile.isTrialing || hubProfile.trialEndsAt == null) return null;
    const remainingMs = Math.max(hubProfile.trialEndsAt - nowMs, 0);
    if (remainingMs <= 0) return null;
    return formatTrialCountdown(remainingMs);
  }, [hubProfile.isTrialing, hubProfile.trialEndsAt, nowMs]);

  return (
    <section className="w-full pb-10 md:pb-12">
      <div className="mx-auto w-full max-w-[1536px] px-4 md:px-6">
        <div className="space-y-6 pt-4 md:pt-6">
          <section className="grid grid-cols-1 gap-4 lg:grid-cols-[1.1fr_1fr]">
            <div className="rounded-[24px] border border-[#153462] bg-[linear-gradient(110deg,#071633_0%,#081c3f_45%,#061734_100%)] p-4 shadow-[0_12px_24px_rgba(2,8,22,0.35)]">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <article className="rounded-[16px] border border-[#173c6e] bg-[#081a38] p-5">
                  <p className="mb-5 flex items-center gap-2 text-[20px] font-black tracking-tight text-white">
                    <Sparkles className="h-7 w-7 text-[#FF6A00]" />
                    {greeting}, <span className="text-[#FF6A00]">{firstName}</span>
                  </p>

                  <div className="space-y-3 text-[15px] leading-tight text-[#C6D3E9]">
                    <p className="flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-[#FF6A00]" />
                      Empresa: <span className="font-semibold text-white">{hubProfile.companyName}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Globe className="h-5 w-5 text-[#FF6A00]" />
                      Site: <span className="font-semibold text-white">{hubProfile.site}</span>
                    </p>
                  </div>

                  <div className="mt-6 max-w-[320px] space-y-3">
                    <Link
                      href="/hub?brand=1"
                      className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-[12px] border border-[#FF6A00] px-6 text-[15px] font-bold text-[#FF6A00] transition hover:bg-[#FF6A00]/10"
                    >
                      <Cog className="h-5 w-5" />
                      Configurar
                    </Link>

                    <Link
                      href="/hub?connectors=1"
                      className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-[12px] bg-[#FF6A00] px-4 text-[16px] font-bold text-white shadow-[0_12px_20px_rgba(255,106,0,0.28)] transition hover:brightness-95"
                    >
                      <Wrench className="h-5 w-5" />
                      Conectores
                    </Link>
                  </div>
                </article>

                <article className="rounded-[16px] border border-[#173c6e] bg-[#081a38] p-5">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <p className="text-[13px] text-[#B7C4DF]">Acesso</p>
                      <p className="mt-1 flex items-center gap-2 text-[20px] font-black text-white">
                        <Gem className="h-5 w-5 text-[#FF6A00]" />
                        {hubProfile.accessLabel}
                      </p>
                    </div>
                    <div>
                      <p className="text-[13px] text-[#B7C4DF]">Status</p>
                      <p className={`mt-1 text-[20px] font-black ${hubProfile.isSubscriptionActive ? 'text-[#FF6A00]' : 'text-[#F59E0B]'}`}>
                        ● {hubProfile.statusLabel}
                      </p>
                    </div>
                    <div>
                      <p className="text-[13px] text-[#B7C4DF]">Recursos</p>
                      <p className="mt-1 text-[20px] font-black text-white">{hubProfile.resourcesLabel}</p>
                    </div>
                    <div>
                      <p className="text-[13px] text-[#B7C4DF]">Operação</p>
                      <p className="mt-1 text-[20px] font-black text-white">{operationLabel}</p>
                    </div>
                  </div>

                  <div className="mt-4">
                    {trialCountdownLabel ? (
                      <p className="mb-3 rounded-[10px] border border-[#28518A] bg-[#092349] px-3 py-2 text-[12px] font-bold text-[#D8E7FF]">
                        Trial gratuito: {trialCountdownLabel} para a 1a cobranca.
                      </p>
                    ) : null}
                    <div className="rounded-[12px] border border-[#28518A] bg-[#092349] px-3 py-3">
                      <p className="text-[12px] font-semibold text-[#B7C4DF]">Agentes Ativos</p>
                      <p className="mt-1 text-[20px] leading-none font-black text-white">
                        {hubProfile.agentLimit != null
                          ? `${String(activeAgentsCount).padStart(2, '0')} de ${String(hubProfile.agentLimit).padStart(2, '0')}`
                          : `${String(activeAgentsCount).padStart(2, '0')} de --`}
                      </p>
                    </div>
                  </div>
                </article>
              </div>
            </div>

            <article className="relative overflow-hidden rounded-[24px] border border-[#E8ECF1] bg-white p-6 shadow-[0_12px_24px_rgba(15,23,42,0.06)]">
              <div className="relative z-10 max-w-full md:max-w-[53%]">
                <h2 className="text-[26px] font-black leading-[1.08] tracking-tight text-[#111827]">
                  Centro de decisão da sua operação
                </h2>
                <p className="mt-4 text-[16px] leading-[1.45] text-[#374151]">
                  Estrutura pronta para receber seus dados e transformar performance em decisões de caixa.
                </p>
                <p className="mt-3 text-[16px] leading-[1.45] text-[#374151]">
                  Aqui o foco é previsibilidade, prioridade diária e crescimento com inteligência.
                </p>
              </div>

              <div className="mt-4 md:hidden">
                <Image
                  src="/images/img_table.png"
                  alt="Dashboard de performance"
                  width={520}
                  height={360}
                  className="h-auto w-full object-contain"
                  priority
                />
              </div>

              <div className="pointer-events-none absolute bottom-0 right-0 hidden h-[78%] w-[50%] items-end justify-end md:flex">
                <Image
                  src="/images/img_table.png"
                  alt="Dashboard de performance"
                  width={520}
                  height={360}
                  className="h-full w-full object-contain object-bottom-right"
                  priority
                />
              </div>
            </article>
          </section>

          <section className="rounded-[24px] border border-[#153462] bg-[linear-gradient(110deg,#071633_0%,#081c3f_45%,#061734_100%)] p-4 shadow-[0_12px_24px_rgba(2,8,22,0.3)]">
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1.08fr_repeat(4,1fr)]">
              <article className="rounded-[16px] border border-[#173c6e] bg-[#081a38] px-6 py-5">
                <h3 className="text-[17px] font-black leading-tight tracking-tight text-white">
                  Painel Executivo do Caixa
                </h3>
                <p className="mt-1 text-[14px] text-[#B7C4DF]">
                  Dados indisponíveis. Conecte os sistemas para visualizar os KPIs reais.
                </p>
              </article>

              {['CPL Médio', 'CAC', 'Receita Atribuída', 'ROAS'].map((label) => (
                <article key={label} className="rounded-[16px] border border-[#173c6e] bg-[#081a38] px-5 py-4">
                  <div className="mb-3 flex items-center gap-3">
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[#FF6A00]/60 bg-[#0B1D3F] text-[#FF6A00]">
                      <Database className="h-6 w-6" />
                    </span>
                    <div>
                      <p className="text-[15px] font-semibold text-white">{label}</p>
                      <p className="text-[20px] leading-none font-black text-[#FF6A00]">Dados indisponíveis</p>
                    </div>
                  </div>
                  <p className="text-[13px] text-[#C6D3E9]">Aguardando integrações obrigatórias e sincronização inicial.</p>
                </article>
              ))}
            </div>
          </section>

          <section className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_1.33fr]">
            <article className="rounded-[24px] border border-[#E8ECF1] bg-white p-5 shadow-[0_12px_24px_rgba(15,23,42,0.05)]">
              <header className="mb-4 border-b border-[#EEF1F5] pb-4">
                <h2 className="text-[18px] font-black tracking-tight text-[#FF5A00]">Ações de Hoje</h2>
                <p className="text-[14px] text-[#4B5563]">Prioridades operacionais do dia</p>
              </header>

              <div className="space-y-3">
                {ACTIONS.length > 0 ? (
                  ACTIONS.map((item) => (
                    <article key={item.id} className="rounded-[14px] border border-[#ECEFF4] bg-white p-4">
                      <div className="flex gap-3">
                        <span className="inline-flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[12px] bg-[#FFF3EC] text-[24px] font-black text-[#FF5A00]">
                          {item.order}
                        </span>
                        <div>
                          <h3 className="text-[16px] font-black leading-tight text-[#111827]">{item.title}</h3>
                          <p className="mt-1 text-[14px] leading-tight text-[#4B5563]">{item.description}</p>
                        </div>
                      </div>
                    </article>
                  ))
                ) : (
                  <article className="rounded-[14px] border border-[#ECEFF4] bg-[#FCFCFD] p-4">
                    <div className="flex items-start gap-3">
                      <span className="inline-flex h-11 w-11 items-center justify-center rounded-[12px] bg-[#FFF3EC] text-[#FF5A00]">
                        <PlugZap className="h-5 w-5" />
                      </span>
                      <div>
                        <h3 className="text-[16px] font-black leading-tight text-[#111827]">Dados indisponíveis</h3>
                        <p className="mt-1 text-[14px] leading-relaxed text-[#4B5563]">
                          Ainda não há insights reais para gerar prioridades automáticas.
                        </p>
                        <p className="mt-3 text-[13px] font-semibold text-[#111827]">Para visualizar dados reais:</p>
                        <ul className="mt-2 space-y-2">
                          {REAL_DATA_REQUIREMENTS.map((requirement) => (
                            <li key={requirement} className="flex items-start gap-2 text-[13px] leading-relaxed text-[#4B5563]">
                              <CheckCircle2 className="mt-0.5 h-4 w-4 text-[#0A9D57]" />
                              {requirement}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </article>
                )}
              </div>

              <div className="mt-5 text-center">
                <Link
                  href="/hub?connectors=1"
                  className="inline-flex items-center gap-2 text-[16px] font-bold text-[#FF5A00] transition hover:text-[#E14B00]"
                >
                  Configurar conectores para liberar dados <span aria-hidden>→</span>
                </Link>
              </div>
            </article>

            <article className="rounded-[24px] border border-[#E8ECF1] bg-white p-5 shadow-[0_12px_24px_rgba(15,23,42,0.05)]">
              <header className="mb-4 border-b border-[#EEF1F5] pb-4">
                <h2 className="text-[18px] font-black tracking-tight text-[#FF5A00]">Trilhas de Valor</h2>
                <p className="text-[14px] text-[#4B5563]">Aquisição, Conversão e Operação</p>
              </header>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <TrailCard
                  title="Aquisição"
                  subtitle="Atrair o público certo com escala e eficiência."
                  points={[
                    'Mídia Paga (Google + Meta)',
                    'SEO + GEO',
                    'Segmentações e Audiências',
                    'Controle de Investimento',
                  ]}
                  href="/hub/performance"
                  icon={Target}
                  palette={{
                    iconBg: 'bg-[#EAFBF0]',
                    iconColor: 'text-[#0A9D57]',
                    border: 'border-[#DCEFE3]',
                    buttonBorder: 'border-[#7FD2A4]',
                    buttonText: 'text-[#0A9D57]',
                  }}
                />

                <TrailCard
                  title="Conversão"
                  subtitle="Transformar cliques em clientes."
                  points={[
                    'Otimização de Páginas',
                    'Testes A/B',
                    'CRM e Funis de Venda',
                    'Automação de Follow-up',
                  ]}
                  href="/hub/criativos"
                  icon={Funnel}
                  palette={{
                    iconBg: 'bg-[#EEF4FF]',
                    iconColor: 'text-[#2F6CF6]',
                    border: 'border-[#DCE6FF]',
                    buttonBorder: 'border-[#8CB2FF]',
                    buttonText: 'text-[#2F6CF6]',
                  }}
                />

                <TrailCard
                  title="Operação"
                  subtitle="Processos e dados para crescimento contínuo."
                  points={[
                    'Tracking e Dados Confiáveis',
                    'Relatórios e Dashboards',
                    'Agentes de IA',
                    'Integrações e Conectores',
                  ]}
                  href="/hub/tecnico"
                  icon={Cog}
                  palette={{
                    iconBg: 'bg-[#FFF4EE]',
                    iconColor: 'text-[#FF5A00]',
                    border: 'border-[#FFE0CF]',
                    buttonBorder: 'border-[#FFB38A]',
                    buttonText: 'text-[#FF5A00]',
                  }}
                />
              </div>
            </article>
          </section>
        </div>
      </div>
    </section>
  );
}
