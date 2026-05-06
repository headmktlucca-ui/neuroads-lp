'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import Image from 'next/image';
import {
  Building2,
  CalendarClock,
  ChartNoAxesCombined,
  CircleDollarSign,
  Cog,
  Crown,
  Gauge,
  Globe,
  HandCoins,
  Megaphone,
  Search,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
  UserRound,
  Wrench,
  type LucideIcon,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

type ActionPriority = 'Alta prioridade' | 'Média prioridade';

type ActionItem = {
  id: string;
  order: string;
  title: string;
  description: string;
  priority: ActionPriority;
};

const ACTIONS: ActionItem[] = [
  {
    id: '01',
    order: '01',
    title: 'Reduzir CPL das campanhas de busca',
    description: 'Revisar termos de pesquisa e ajustar correspondências para reduzir custo por lead.',
    priority: 'Alta prioridade',
  },
  {
    id: '02',
    order: '02',
    title: 'Escalar campanha vencedora no Meta Ads',
    description: 'Aumentar orçamento da campanha com melhor ROAS mantendo controle de frequência.',
    priority: 'Alta prioridade',
  },
  {
    id: '03',
    order: '03',
    title: 'Otimizar página de conversão principal',
    description: 'Testar nova headline e formulário reduzido para aumentar taxa de conversão.',
    priority: 'Média prioridade',
  },
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

function PriorityBadge({ value }: { value: ActionPriority }) {
  const isHigh = value === 'Alta prioridade';
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-[12px] font-semibold ${
        isHigh ? 'bg-[#FFF0E6] text-[#E66100]' : 'bg-[#FFF6DA] text-[#C98500]'
      }`}
    >
      {value}
    </span>
  );
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
    <article className={`rounded-[16px] border ${palette.border} bg-white p-5`}>
      <div className="mb-3 flex items-center gap-3">
        <span className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${palette.iconBg}`}>
          <Icon className={`h-6 w-6 ${palette.iconColor}`} />
        </span>
        <h3 className={`text-[30px] leading-none font-black tracking-tight ${palette.iconColor}`}>{title}</h3>
      </div>

      <p className="mb-4 text-[18px] leading-6 font-semibold tracking-tight text-[#111827]">{subtitle}</p>

      <ul className="mb-5 space-y-2">
        {points.map((point) => (
          <li key={point} className="flex items-start gap-2 text-[15px] leading-6 text-[#4B5563]">
            <span className="mt-2 inline-block h-1.5 w-1.5 rounded-full bg-[#FF5A00]" />
            {point}
          </li>
        ))}
      </ul>

      <Link
        href={href}
        className={`inline-flex h-12 w-full items-center justify-center gap-2 rounded-[12px] border ${palette.buttonBorder} px-4 text-[15px] font-bold ${palette.buttonText} transition hover:brightness-95`}
      >
        Acessar trilha
        <span aria-hidden>→</span>
      </Link>
    </article>
  );
}

export default function StrategicHubOverview() {
  const { user } = useAuth();
  const companyName = 'NeuroAds Marketing Digital';
  const companySite = 'neuroads.com.br';

  const greeting = useMemo(() => getGreeting(), []);
  const firstName = getFirstName(user?.displayName || user?.email);

  return (
    <section className="w-full bg-[#F3F4F6] pb-10 md:pb-12">
      <div className="mx-auto w-full max-w-[1536px] px-4 md:px-6">
        <div className="space-y-6 pt-4 md:pt-6">
          <section className="grid grid-cols-1 gap-4 lg:grid-cols-[1.1fr_1fr]">
            <div className="rounded-[24px] border border-[#FFD7BF] bg-white/90 p-4 shadow-[0_12px_24px_rgba(15,23,42,0.06)]">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <article className="rounded-[16px] border border-[#EEF1F5] bg-[#FCFCFD] p-5">
                  <h2 className="mb-4 flex items-center gap-2 text-[18px] font-black tracking-tight text-[#FF5A00]">
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FFF3EC] text-[#FF5A00]">
                      <Building2 className="h-6 w-6" />
                    </span>
                    Contexto da Conta
                  </h2>

                  <p className="mb-5 flex items-center gap-2 text-[20px] font-black tracking-tight text-[#111827]">
                    <Sparkles className="h-7 w-7 text-[#FFB100]" />
                    {greeting}, <span className="text-[#FF5A00]">{firstName}</span>
                  </p>

                  <div className="space-y-3 text-[15px] leading-tight text-[#374151]">
                    <p className="flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-[#6B7280]" />
                      Empresa: <span className="font-semibold text-[#111827]">{companyName}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Globe className="h-5 w-5 text-[#6B7280]" />
                      Site: <span className="font-semibold text-[#111827]">{companySite}</span>
                    </p>
                  </div>

                  <div className="mt-6">
                    <Link
                      href="/hub?brand=1"
                      className="inline-flex h-12 items-center justify-center gap-2 rounded-[12px] border border-[#FFB98E] px-6 text-[15px] font-bold text-[#FF5A00] transition hover:bg-[#FFF5EF]"
                    >
                      <Cog className="h-5 w-5" />
                      Configurar
                    </Link>
                  </div>
                </article>

                <article className="rounded-[16px] border border-[#EEF1F5] bg-[#FCFCFD] p-5">
                  <h2 className="mb-4 flex items-center gap-2 text-[18px] font-black tracking-tight text-[#FF5A00]">
                    <Crown className="h-7 w-7" />
                    Plano Ativo
                  </h2>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-[#E6EAF0] bg-white p-3">
                      <p className="text-[13px] text-[#6B7280]">Plano</p>
                      <p className="mt-1 flex items-center gap-2 text-[17px] font-black text-[#111827]">
                        <Sparkles className="h-4 w-4 text-[#FF5A00]" />
                        Pro Scale
                      </p>
                    </div>
                    <div className="rounded-xl border border-[#E6EAF0] bg-white p-3">
                      <p className="text-[13px] text-[#6B7280]">Status</p>
                      <p className="mt-1 text-[17px] font-black text-[#0A9D57]">● Ativo</p>
                    </div>
                    <div className="rounded-xl border border-[#E6EAF0] bg-white p-3">
                      <p className="text-[13px] text-[#6B7280]">Capacidade Mensal</p>
                      <p className="mt-1 text-[17px] font-black text-[#111827]">250.000 execuções</p>
                    </div>
                    <div className="rounded-xl border border-[#E6EAF0] bg-white p-3">
                      <p className="text-[13px] text-[#6B7280]">Próxima Renovação</p>
                      <p className="mt-1 text-[17px] font-black text-[#111827]">28/05/2026</p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <Link
                      href="/hub?connectors=1"
                      className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-[12px] bg-gradient-to-r from-[#FF5A00] to-[#FF7A00] px-4 text-[16px] font-bold text-white shadow-[0_12px_20px_rgba(255,90,0,0.28)] transition hover:brightness-95"
                    >
                      <Wrench className="h-5 w-5" />
                      Conectores
                    </Link>
                  </div>
                </article>
              </div>
            </div>

            <article className="relative overflow-hidden rounded-[24px] border border-[#E8ECF1] bg-white p-6 shadow-[0_12px_24px_rgba(15,23,42,0.06)]">
              <div className="relative z-10 max-w-[53%]">
                <span className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FFF3EC] text-[#FF5A00]">
                  <Target className="h-8 w-8" />
                </span>
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

              <div className="pointer-events-none absolute inset-y-0 right-0 flex w-[49%] items-center justify-end pr-2">
                <Image
                  src="/images/hub/hero-centro-decisao-bg-exact.png"
                  alt=""
                  width={340}
                  height={220}
                  className="h-auto max-h-[94%] w-full object-contain object-center"
                  priority
                />
              </div>
            </article>
          </section>

          <section className="rounded-[24px] border border-[#FFD7BF] bg-white/90 p-4 shadow-[0_12px_24px_rgba(15,23,42,0.05)]">
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1.08fr_repeat(4,1fr)]">
              <article className="rounded-[16px] bg-white px-6 py-5">
                <h3 className="text-[18px] font-black leading-tight tracking-tight text-[#FF5A00]">Painel Executivo do Caixa</h3>
                <p className="mt-1 text-[14px] text-[#4B5563]">4 KPIs financeiros essenciais</p>
              </article>

              <article className="rounded-[16px] border border-[#EEF1F5] bg-white px-5 py-4">
                <div className="mb-3 flex items-center gap-3">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FFF3EC] text-[#FF5A00]">
                    <UserRound className="h-6 w-6" />
                  </span>
                  <div>
                    <p className="text-[15px] font-semibold text-[#111827]">CPL Médio</p>
                    <p className="text-[38px] leading-none font-black text-[#111827]">R$ 4,82</p>
                  </div>
                </div>
                <p className="flex items-center gap-1 text-[14px] font-semibold text-[#0A9D57]">
                  <TrendingDown className="h-4 w-4" />
                  -18,2% <span className="font-normal text-[#4B5563]">vs mês anterior</span>
                </p>
              </article>

              <article className="rounded-[16px] border border-[#EEF1F5] bg-white px-5 py-4">
                <div className="mb-3 flex items-center gap-3">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FFF3EC] text-[#FF5A00]">
                    <HandCoins className="h-6 w-6" />
                  </span>
                  <div>
                    <p className="text-[15px] font-semibold text-[#111827]">CAC</p>
                    <p className="text-[38px] leading-none font-black text-[#111827]">R$ 38,11</p>
                  </div>
                </div>
                <p className="flex items-center gap-1 text-[14px] font-semibold text-[#0A9D57]">
                  <TrendingDown className="h-4 w-4" />
                  -12,4% <span className="font-normal text-[#4B5563]">vs mês anterior</span>
                </p>
              </article>

              <article className="rounded-[16px] border border-[#EEF1F5] bg-white px-5 py-4">
                <div className="mb-3 flex items-center gap-3">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FFF3EC] text-[#FF5A00]">
                    <CircleDollarSign className="h-6 w-6" />
                  </span>
                  <div>
                    <p className="text-[15px] font-semibold text-[#111827]">Receita Atribuída</p>
                    <p className="text-[38px] leading-none font-black text-[#111827]">R$ 1.243.000</p>
                  </div>
                </div>
                <p className="flex items-center gap-1 text-[14px] font-semibold text-[#0A9D57]">
                  <TrendingUp className="h-4 w-4" />
                  +15,6% <span className="font-normal text-[#4B5563]">vs mês anterior</span>
                </p>
              </article>

              <article className="rounded-[16px] border border-[#EEF1F5] bg-white px-5 py-4">
                <div className="mb-3 flex items-center gap-3">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FFF3EC] text-[#FF5A00]">
                    <ChartNoAxesCombined className="h-6 w-6" />
                  </span>
                  <div>
                    <p className="text-[15px] font-semibold text-[#111827]">ROAS</p>
                    <p className="text-[38px] leading-none font-black text-[#111827]">5,2x</p>
                  </div>
                </div>
                <p className="flex items-center gap-1 text-[14px] font-semibold text-[#0A9D57]">
                  <TrendingUp className="h-4 w-4" />
                  +15% <span className="font-normal text-[#4B5563]">vs mês anterior</span>
                </p>
              </article>
            </div>
          </section>

          <section className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_1.33fr]">
            <article className="rounded-[24px] border border-[#E8ECF1] bg-white p-5 shadow-[0_12px_24px_rgba(15,23,42,0.05)]">
              <header className="mb-4 border-b border-[#EEF1F5] pb-4">
                <h2 className="flex items-center gap-3 text-[18px] font-black tracking-tight text-[#FF5A00]">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFF3EC] text-[#FF5A00]">
                    <CalendarClock className="h-6 w-6" />
                  </span>
                  Ações de Hoje
                </h2>
                <p className="text-[14px] text-[#4B5563]">Prioridades operacionais do dia</p>
              </header>

              <div className="space-y-3">
                {ACTIONS.map((item) => (
                  <article key={item.id} className="rounded-[14px] border border-[#ECEFF4] bg-white p-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div className="flex gap-3">
                        <span className="inline-flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[12px] bg-[#FFF3EC] text-[24px] font-black text-[#FF5A00]">
                          {item.order}
                        </span>
                        <div>
                          <h3 className="text-[16px] font-black leading-tight text-[#111827]">{item.title}</h3>
                          <p className="mt-1 text-[14px] leading-tight text-[#4B5563]">{item.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <PriorityBadge value={item.priority} />
                        <span className="inline-flex items-center gap-1 text-[13px] text-[#4B5563]">
                          <CalendarClock className="h-4 w-4" />
                          Hoje
                        </span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              <div className="mt-5 text-center">
                <Link
                  href="/hub/performance"
                  className="inline-flex items-center gap-2 text-[16px] font-bold text-[#FF5A00] transition hover:text-[#E14B00]"
                >
                  Ver todas as ações <span aria-hidden>→</span>
                </Link>
              </div>
            </article>

            <article className="rounded-[24px] border border-[#E8ECF1] bg-white p-5 shadow-[0_12px_24px_rgba(15,23,42,0.05)]">
              <header className="mb-4 border-b border-[#EEF1F5] pb-4">
                <h2 className="flex items-center gap-3 text-[18px] font-black tracking-tight text-[#FF5A00]">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFF3EC] text-[#FF5A00]">
                    <Gauge className="h-6 w-6" />
                  </span>
                  Trilhas de Valor
                </h2>
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
                  icon={Megaphone}
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
                  icon={Search}
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
                  icon={Wrench}
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
