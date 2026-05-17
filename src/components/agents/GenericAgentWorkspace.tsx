'use client';

import { useMemo, useState } from 'react';
import { CheckCircle2, Save, Sparkles, Target } from 'lucide-react';
import { slugifyAgentTitle } from '../../lib/hub-agents';

type GenericAgentWorkspaceProps = {
  userId?: string;
  agentTitle: string;
  category: string;
  description: string;
  monthlyLimit?: number;
};

type AgentWorkspaceDraft = {
  objective: string;
  monthlyGoal: string;
  mainChannel: string;
  notes: string;
};

const DEFAULT_DRAFT: AgentWorkspaceDraft = {
  objective: '',
  monthlyGoal: '',
  mainChannel: '',
  notes: '',
};

function buildPlaybookByCategory(category: string): string[] {
  if (category === 'Performance') {
    return [
      'Auditar campanhas ativas e eliminar desperdício de verba.',
      'Priorizar conjuntos de anúncios com maior taxa de conversão.',
      'Recalibrar orçamento com base no custo real por oportunidade.',
    ];
  }

  if (category === 'Criativos') {
    return [
      'Definir 3 ângulos criativos conectados à dor principal do público.',
      'Gerar variações de headline e CTA para validação rápida.',
      'Publicar ciclos semanais e comparar impacto no custo por lead.',
    ];
  }

  if (category === 'Técnico') {
    return [
      'Validar rastreamento e integridade de eventos críticos de conversão.',
      'Eliminar gargalos de jornada (tempo de carregamento e passos extras).',
      'Documentar rotina de monitoramento para evitar perda de dados.',
    ];
  }

  return [
    'Mapear sinais de mercado e priorizar oportunidades acionáveis.',
    'Transformar análise em hipóteses testáveis com prazo definido.',
    'Consolidar aprendizados e ajustar estratégia para escala previsível.',
  ];
}

export default function GenericAgentWorkspace({
  userId,
  agentTitle,
  category,
  description,
  monthlyLimit,
}: GenericAgentWorkspaceProps) {
  const [draft, setDraft] = useState<AgentWorkspaceDraft>(() => {
    if (typeof window === 'undefined' || !userId) return DEFAULT_DRAFT;
    try {
      const key = `neuroads_agent_workspace_${userId}_${slugifyAgentTitle(agentTitle)}`;
      const raw = window.localStorage.getItem(key);
      if (!raw) return DEFAULT_DRAFT;
      const parsed = JSON.parse(raw) as Partial<AgentWorkspaceDraft>;
      return {
        objective: parsed.objective ?? '',
        monthlyGoal: parsed.monthlyGoal ?? '',
        mainChannel: parsed.mainChannel ?? '',
        notes: parsed.notes ?? '',
      };
    } catch {
      return DEFAULT_DRAFT;
    }
  });
  const [saved, setSaved] = useState(false);

  const storageKey = useMemo(() => {
    if (!userId) return null;
    return `neuroads_agent_workspace_${userId}_${slugifyAgentTitle(agentTitle)}`;
  }, [agentTitle, userId]);

  const playbook = useMemo(() => buildPlaybookByCategory(category), [category]);

  const handleSave = () => {
    if (!storageKey || typeof window === 'undefined') return;
    window.localStorage.setItem(storageKey, JSON.stringify(draft));
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="rounded-[30px] p-[2px] bg-gradient-to-br from-white/40 via-orange-300/80 to-[#FF6B00] shadow-[0_24px_52px_-30px_rgba(255,107,0,0.42)]">
      <div className="rounded-[28px] bg-white/85 p-[1px]">
        <div className="rounded-[26px] border border-[#FFF1E8] bg-white p-6 md:p-8">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-widest text-primary font-bold">Workspace Operacional</p>
              <h2 className="mt-1 text-2xl font-black text-text-main">{agentTitle}</h2>
              <p className="mt-2 max-w-3xl text-sm text-text-muted">{description}</p>
            </div>
            <span className="inline-flex items-center rounded-full border border-[#DCE8FF] bg-[#F5F9FF] px-3 py-1 text-xs font-bold text-[#1D4ED8]">
              Limite mensal: {monthlyLimit ?? 0} execuções
            </span>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-[#E7ECF3] bg-[#FBFCFE] p-4">
              <p className="text-xs font-bold uppercase tracking-widest text-text-dim">Configuração rápida</p>
              <div className="mt-3 space-y-3">
                <input
                  value={draft.objective}
                  onChange={(event) => setDraft((prev) => ({ ...prev, objective: event.target.value }))}
                  placeholder="Objetivo principal (ex: reduzir CPL em 20%)"
                  className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm text-text-main outline-none focus:border-primary"
                />
                <input
                  value={draft.monthlyGoal}
                  onChange={(event) => setDraft((prev) => ({ ...prev, monthlyGoal: event.target.value }))}
                  placeholder="Meta mensal em receita/oportunidades"
                  className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm text-text-main outline-none focus:border-primary"
                />
                <input
                  value={draft.mainChannel}
                  onChange={(event) => setDraft((prev) => ({ ...prev, mainChannel: event.target.value }))}
                  placeholder="Canal prioritário (Google, Meta, Orgânico, etc.)"
                  className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm text-text-main outline-none focus:border-primary"
                />
                <textarea
                  value={draft.notes}
                  onChange={(event) => setDraft((prev) => ({ ...prev, notes: event.target.value }))}
                  placeholder="Observações operacionais para o time"
                  rows={4}
                  className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm text-text-main outline-none focus:border-primary"
                />
                <button
                  type="button"
                  onClick={handleSave}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#08B760] to-[#0A9D57] px-4 py-2 text-xs font-bold uppercase tracking-widest text-white shadow-[0_8px_18px_rgba(8,183,96,0.25)]"
                >
                  <Save size={14} />
                  Salvar configuração
                </button>
                {saved ? (
                  <p className="inline-flex items-center gap-2 text-xs font-bold text-[#0A9D57]">
                    <CheckCircle2 size={14} />
                    Configuração salva neste dispositivo.
                  </p>
                ) : null}
              </div>
            </div>

            <div className="rounded-2xl border border-[#E7ECF3] bg-[#FBFCFE] p-4">
              <p className="text-xs font-bold uppercase tracking-widest text-text-dim">Playbook recomendado</p>
              <div className="mt-3 space-y-2">
                {playbook.map((step) => (
                  <div key={step} className="rounded-xl border border-[#E3E8EF] bg-white px-3 py-2 text-sm text-text-main">
                    {step}
                  </div>
                ))}
              </div>

              <div className="mt-4 rounded-xl border border-[#FFDCC7] bg-[#FFF8F3] px-3 py-3 text-sm text-[#9A3412]">
                <p className="inline-flex items-center gap-2 font-bold">
                  <Target size={14} />
                  Resultado esperado
                </p>
                <p className="mt-1">
                  Rotina ativa para gerar execução consistente e evolução de performance sem depender de tentativa e erro.
                </p>
              </div>

              <div className="mt-3 rounded-xl border border-[#DCE8FF] bg-[#F5F9FF] px-3 py-3 text-sm text-[#1E3A8A]">
                <p className="inline-flex items-center gap-2 font-bold">
                  <Sparkles size={14} />
                  Próximo passo
                </p>
                <p className="mt-1">
                  Com esta base pronta, você já consegue operar este agente e evoluir para automações específicas na próxima sprint.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
