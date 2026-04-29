'use client';

import { useMemo, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Navbar from '../../../../components/layout/Navbar';
import Footer from '../../../../components/layout/Footer';
import { useAuth } from '../../../../context/AuthContext';
import { formatBRL } from '../../../../data/agent-pricing';
import {
  getAgentBySlug,
  getAgentEntryDefinition,
  getContractedAgentsFromProfile,
} from '../../../../lib/hub-agents';

function formatDate(dateString?: string): string {
  if (!dateString) return 'A confirmar';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return 'A confirmar';
  return date.toLocaleDateString('pt-BR');
}

export default function AgentEntryPage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [loading, router, user]);

  const contracts = useMemo(() => getContractedAgentsFromProfile(profile), [profile]);
  const agent = useMemo(() => (slug ? getAgentBySlug(slug) : undefined), [slug]);
  const entry = useMemo(() => (agent ? getAgentEntryDefinition(agent, contracts) : null), [agent, contracts]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-bg-main flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <main className="flex flex-col min-h-screen bg-bg-main">
      <Navbar />

      <div className="flex-grow pt-20 md:pt-28 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <Image
            src="/images/background_hub.png"
            alt="Hub Background"
            fill
            className="object-cover object-top opacity-90"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/25 via-white/40 to-white/70" />
        </div>

        <div className="relative z-10 wrap py-8 md:py-12">
          {!agent || !entry ? (
            <div className="max-w-3xl mx-auto rounded-3xl border border-border bg-white shadow-[0_16px_40px_rgba(15,23,42,0.08)] p-8 md:p-10">
              <p className="text-xs uppercase tracking-widest text-text-dim font-bold mb-3">Agente</p>
              <h1 className="text-3xl md:text-4xl font-black text-text-main mb-4">Agente não encontrado</h1>
              <p className="text-base text-text-muted mb-8">
                O endereço informado não corresponde a um agente válido do Hub.
              </p>
              <button
                onClick={() => router.push('/hub')}
                className="btn btn-primary px-7 py-3 rounded-full text-sm font-bold tracking-widest uppercase"
              >
                Voltar ao Hub
              </button>
            </div>
          ) : !entry.isActive ? (
            <div className="max-w-3xl mx-auto rounded-3xl border border-[#FFE4D1] bg-white shadow-[0_16px_40px_rgba(15,23,42,0.08)] p-8 md:p-10">
              <p className="text-xs uppercase tracking-widest text-primary font-bold mb-3">{entry.category}</p>
              <h1 className="text-3xl md:text-4xl font-black text-text-main mb-4">{entry.title}</h1>
              <p className="text-base text-text-muted mb-8">
                Este agente ainda não está ativo na sua conta. Faça a contratação no Hub para liberar a janela funcional individual.
              </p>
              <button
                onClick={() => router.push('/hub')}
                className="btn btn-primary px-7 py-3 rounded-full text-sm font-bold tracking-widest uppercase"
              >
                Voltar ao Hub
              </button>
            </div>
          ) : (
            <div className="max-w-6xl mx-auto space-y-6">
              <div className="rounded-3xl border border-border bg-white shadow-[0_16px_40px_rgba(15,23,42,0.08)] p-6 md:p-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-primary font-bold mb-2">{entry.category}</p>
                    <h1 className="text-3xl md:text-4xl font-black text-text-main">{entry.title}</h1>
                  </div>
                  <button
                    onClick={() => router.push('/hub')}
                    className="px-6 py-3 rounded-full border border-[#FFE1CF] text-text-main font-bold tracking-widest text-sm uppercase hover:bg-[#FFF8F3] transition-colors"
                  >
                    Voltar ao Hub
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 rounded-3xl border border-[#FFE4D1] bg-white p-6 shadow-[0_12px_32px_rgba(255,107,0,0.08)]">
                  <h2 className="text-xs uppercase tracking-widest text-primary font-bold mb-4">Resumo Comercial</h2>
                  <div className="space-y-3">
                    <p className="text-sm text-text-muted">
                      Plano: <span className="font-bold text-text-main">{entry.planSummary?.planName ?? 'A confirmar'}</span>
                    </p>
                    <p className="text-sm text-text-muted">
                      Valor: <span className="font-bold text-text-main">{formatBRL(entry.planSummary?.monthlyPrice ?? 0)}/mês</span>
                    </p>
                    <p className="text-sm text-text-muted">
                      Limite: <span className="font-bold text-text-main">{entry.planSummary?.monthlyLimit ?? 0} execuções/mês</span>
                    </p>
                    <p className="text-sm text-text-muted">
                      Em uso: <span className="font-bold text-text-main">{entry.planSummary?.usageUsed ?? 0}</span>
                    </p>
                    <p className="text-sm text-text-muted">
                      Próximo pagamento:{' '}
                      <span className="font-bold text-text-main">{formatDate(entry.planSummary?.nextPaymentAt)}</span>
                    </p>
                  </div>
                </div>

                <div className="lg:col-span-2 rounded-3xl border border-border bg-white p-6 md:p-8 shadow-[0_16px_36px_rgba(15,23,42,0.07)]">
                  <h2 className="text-sm uppercase tracking-widest text-primary font-bold mb-4">Área de implantação</h2>
                  <div className="min-h-[420px] rounded-2xl border-2 border-dashed border-[#FFD9C0] bg-gradient-to-br from-[#FFF8F3] to-white p-6">
                    <p className="text-sm text-text-muted">
                      Espaço reservado para implementação das atividades e componentes específicos do agente <strong>{entry.title}</strong>.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}
