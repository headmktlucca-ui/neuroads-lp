'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  type DocumentData,
} from 'firebase/firestore';
import { BriefcaseBusiness, CircleDollarSign, KanbanSquare, Trash2, UserRoundCog } from 'lucide-react';
import { getFirebaseDb } from '../../lib/firebase';
import LuccaExecutiveDesk from './LuccaExecutiveDesk';
import CustomCrmSuite from './CustomCrmSuite';

const CRM_STAGES = ['Prospect', 'Lead Qualificado', 'Proposta', 'Cliente Ativo'] as const;
const ACTIVITY_PRIORITIES = ['Baixa', 'Media', 'Alta'] as const;
const ACTIVITY_STATUS = ['Planejada', 'Em andamento', 'Concluida', 'Bloqueada'] as const;
const FINANCE_TYPES = ['Receita', 'Custo'] as const;
const FINANCE_STATUS = ['Previsto', 'Pago', 'Atrasado'] as const;

type CrmStage = (typeof CRM_STAGES)[number];
type ActivityPriority = (typeof ACTIVITY_PRIORITIES)[number];
type ActivityStatus = (typeof ACTIVITY_STATUS)[number];
type FinanceType = (typeof FINANCE_TYPES)[number];
type FinanceStatus = (typeof FINANCE_STATUS)[number];

interface CrmDeal {
  id: string;
  name: string;
  company: string;
  stage: CrmStage;
  estimatedValue: number;
  source: string;
  owner: string;
  nextAction: string;
  updatedAt: number;
}

interface AgentActivity {
  id: string;
  clientName: string;
  agentName: string;
  objective: string;
  priority: ActivityPriority;
  status: ActivityStatus;
  dueDate: string;
  updatedAt: number;
}

interface FinanceEntry {
  id: string;
  type: FinanceType;
  category: string;
  description: string;
  amount: number;
  dueDate: string;
  status: FinanceStatus;
  updatedAt: number;
}

interface AdminControlCenterProps {
  userId: string;
}

function toMillis(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (value instanceof Timestamp) return value.toMillis();
  if (typeof value === 'object' && value !== null && 'seconds' in value) {
    const seconds = (value as { seconds?: unknown }).seconds;
    if (typeof seconds === 'number' && Number.isFinite(seconds)) {
      return seconds * 1000;
    }
  }
  return Date.now();
}

function parseCrmStage(value: unknown): CrmStage {
  return CRM_STAGES.includes(value as CrmStage) ? (value as CrmStage) : 'Prospect';
}

function parseActivityPriority(value: unknown): ActivityPriority {
  return ACTIVITY_PRIORITIES.includes(value as ActivityPriority) ? (value as ActivityPriority) : 'Media';
}

function parseActivityStatus(value: unknown): ActivityStatus {
  return ACTIVITY_STATUS.includes(value as ActivityStatus) ? (value as ActivityStatus) : 'Planejada';
}

function parseFinanceType(value: unknown): FinanceType {
  return FINANCE_TYPES.includes(value as FinanceType) ? (value as FinanceType) : 'Receita';
}

function parseFinanceStatus(value: unknown): FinanceStatus {
  return FINANCE_STATUS.includes(value as FinanceStatus) ? (value as FinanceStatus) : 'Previsto';
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
}

function formatDateTime(value: number): string {
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(value);
}

export default function AdminControlCenter({ userId }: AdminControlCenterProps) {
  const [crmDeals, setCrmDeals] = useState<CrmDeal[]>([]);
  const [agentActivities, setAgentActivities] = useState<AgentActivity[]>([]);
  const [financeEntries, setFinanceEntries] = useState<FinanceEntry[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const [dealForm, setDealForm] = useState({
    name: '',
    company: '',
    estimatedValue: '',
    source: '',
    owner: '',
    nextAction: '',
  });

  const [activityForm, setActivityForm] = useState({
    clientName: '',
    agentName: '',
    objective: '',
    priority: 'Media' as ActivityPriority,
    status: 'Planejada' as ActivityStatus,
    dueDate: '',
  });

  const [financeForm, setFinanceForm] = useState({
    type: 'Receita' as FinanceType,
    category: '',
    description: '',
    amount: '',
    dueDate: '',
    status: 'Previsto' as FinanceStatus,
  });

  useEffect(() => {
    const db = getFirebaseDb();

    const crmQuery = query(collection(db, 'admin_workspaces', userId, 'crm_deals'), orderBy('updatedAt', 'desc'));
    const activitiesQuery = query(collection(db, 'admin_workspaces', userId, 'agent_activities'), orderBy('updatedAt', 'desc'));
    const financeQuery = query(collection(db, 'admin_workspaces', userId, 'finance_entries'), orderBy('updatedAt', 'desc'));

    const unsubscribeCrm = onSnapshot(crmQuery, (snapshot) => {
      const parsed = snapshot.docs.map((snapshotDoc) => {
        const data = snapshotDoc.data() as DocumentData;
        return {
          id: snapshotDoc.id,
          name: String(data.name ?? ''),
          company: String(data.company ?? ''),
          stage: parseCrmStage(data.stage),
          estimatedValue: Number(data.estimatedValue ?? 0),
          source: String(data.source ?? ''),
          owner: String(data.owner ?? ''),
          nextAction: String(data.nextAction ?? ''),
          updatedAt: toMillis(data.updatedAt),
        } satisfies CrmDeal;
      });
      setCrmDeals(parsed);
      setLoadingData(false);
    });

    const unsubscribeActivities = onSnapshot(activitiesQuery, (snapshot) => {
      const parsed = snapshot.docs.map((snapshotDoc) => {
        const data = snapshotDoc.data() as DocumentData;
        return {
          id: snapshotDoc.id,
          clientName: String(data.clientName ?? ''),
          agentName: String(data.agentName ?? ''),
          objective: String(data.objective ?? ''),
          priority: parseActivityPriority(data.priority),
          status: parseActivityStatus(data.status),
          dueDate: String(data.dueDate ?? ''),
          updatedAt: toMillis(data.updatedAt),
        } satisfies AgentActivity;
      });
      setAgentActivities(parsed);
    });

    const unsubscribeFinance = onSnapshot(financeQuery, (snapshot) => {
      const parsed = snapshot.docs.map((snapshotDoc) => {
        const data = snapshotDoc.data() as DocumentData;
        return {
          id: snapshotDoc.id,
          type: parseFinanceType(data.type),
          category: String(data.category ?? ''),
          description: String(data.description ?? ''),
          amount: Number(data.amount ?? 0),
          dueDate: String(data.dueDate ?? ''),
          status: parseFinanceStatus(data.status),
          updatedAt: toMillis(data.updatedAt),
        } satisfies FinanceEntry;
      });
      setFinanceEntries(parsed);
    });

    return () => {
      unsubscribeCrm();
      unsubscribeActivities();
      unsubscribeFinance();
    };
  }, [userId]);

  const pipelineTotal = useMemo(() => crmDeals.reduce((total, deal) => total + deal.estimatedValue, 0), [crmDeals]);

  const financeSummary = useMemo(() => {
    const revenue = financeEntries.filter((entry) => entry.type === 'Receita').reduce((total, entry) => total + entry.amount, 0);
    const cost = financeEntries.filter((entry) => entry.type === 'Custo').reduce((total, entry) => total + entry.amount, 0);
    return {
      revenue,
      cost,
      balance: revenue - cost,
      pending: financeEntries.filter((entry) => entry.status !== 'Pago').reduce((total, entry) => total + entry.amount, 0),
    };
  }, [financeEntries]);

  async function createDeal() {
    const estimatedValue = Number(dealForm.estimatedValue);
    if (!dealForm.name.trim() || !dealForm.company.trim() || !Number.isFinite(estimatedValue)) return;

    const db = getFirebaseDb();
    await addDoc(collection(db, 'admin_workspaces', userId, 'crm_deals'), {
      name: dealForm.name.trim(),
      company: dealForm.company.trim(),
      stage: 'Prospect',
      estimatedValue,
      source: dealForm.source.trim(),
      owner: dealForm.owner.trim(),
      nextAction: dealForm.nextAction.trim(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    setDealForm({ name: '', company: '', estimatedValue: '', source: '', owner: '', nextAction: '' });
  }

  async function moveDealStage(deal: CrmDeal, direction: 'prev' | 'next') {
    const index = CRM_STAGES.indexOf(deal.stage);
    const nextIndex = direction === 'next' ? index + 1 : index - 1;
    if (nextIndex < 0 || nextIndex >= CRM_STAGES.length) return;

    const db = getFirebaseDb();
    await updateDoc(doc(db, 'admin_workspaces', userId, 'crm_deals', deal.id), {
      stage: CRM_STAGES[nextIndex],
      updatedAt: serverTimestamp(),
    });
  }

  async function removeDeal(id: string) {
    const db = getFirebaseDb();
    await deleteDoc(doc(db, 'admin_workspaces', userId, 'crm_deals', id));
  }

  async function createActivity() {
    if (!activityForm.clientName.trim() || !activityForm.agentName.trim() || !activityForm.objective.trim()) return;

    const db = getFirebaseDb();
    await addDoc(collection(db, 'admin_workspaces', userId, 'agent_activities'), {
      clientName: activityForm.clientName.trim(),
      agentName: activityForm.agentName.trim(),
      objective: activityForm.objective.trim(),
      priority: activityForm.priority,
      status: activityForm.status,
      dueDate: activityForm.dueDate,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    setActivityForm({
      clientName: '',
      agentName: '',
      objective: '',
      priority: 'Media',
      status: 'Planejada',
      dueDate: '',
    });
  }

  async function cycleActivityStatus(activity: AgentActivity) {
    const currentIndex = ACTIVITY_STATUS.indexOf(activity.status);
    const nextStatus = ACTIVITY_STATUS[(currentIndex + 1) % ACTIVITY_STATUS.length];
    const db = getFirebaseDb();
    await updateDoc(doc(db, 'admin_workspaces', userId, 'agent_activities', activity.id), {
      status: nextStatus,
      updatedAt: serverTimestamp(),
    });
  }

  async function removeActivity(id: string) {
    const db = getFirebaseDb();
    await deleteDoc(doc(db, 'admin_workspaces', userId, 'agent_activities', id));
  }

  async function createFinanceEntry() {
    const amount = Number(financeForm.amount);
    if (!financeForm.category.trim() || !financeForm.description.trim() || !Number.isFinite(amount)) return;

    const db = getFirebaseDb();
    await addDoc(collection(db, 'admin_workspaces', userId, 'finance_entries'), {
      type: financeForm.type,
      category: financeForm.category.trim(),
      description: financeForm.description.trim(),
      amount,
      dueDate: financeForm.dueDate,
      status: financeForm.status,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    setFinanceForm({ type: 'Receita', category: '', description: '', amount: '', dueDate: '', status: 'Previsto' });
  }

  async function cycleFinanceStatus(entry: FinanceEntry) {
    const currentIndex = FINANCE_STATUS.indexOf(entry.status);
    const nextStatus = FINANCE_STATUS[(currentIndex + 1) % FINANCE_STATUS.length];

    const db = getFirebaseDb();
    await updateDoc(doc(db, 'admin_workspaces', userId, 'finance_entries', entry.id), {
      status: nextStatus,
      updatedAt: serverTimestamp(),
    });
  }

  async function removeFinanceEntry(id: string) {
    const db = getFirebaseDb();
    await deleteDoc(doc(db, 'admin_workspaces', userId, 'finance_entries', id));
  }

  const stats = [
    {
      label: 'Pipeline em aberto',
      value: crmDeals.length,
      helper: 'negócios ativos no CRM',
      icon: <KanbanSquare size={18} className="text-[#FF6B00]" />,
    },
    {
      label: 'Valor potencial do funil',
      value: formatCurrency(pipelineTotal),
      helper: 'estimativa financeira total',
      icon: <CircleDollarSign size={18} className="text-[#08B760]" />,
    },
    {
      label: 'Atividades operacionais',
      value: agentActivities.length,
      helper: 'agentes + tarefas em andamento',
      icon: <UserRoundCog size={18} className="text-[#0A9D57]" />,
    },
    {
      label: 'Saldo consolidado',
      value: formatCurrency(financeSummary.balance),
      helper: 'receitas - custos',
      icon: <BriefcaseBusiness size={18} className="text-[#0F172A]" />,
    },
  ];

  return (
    <div className="space-y-8">
      <LuccaExecutiveDesk userId={userId} />
      <CustomCrmSuite userId={userId} />

      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <article key={stat.label} className="rounded-3xl border border-border bg-white p-5 shadow-sm">
            <div className="mb-3 inline-flex items-center justify-center w-10 h-10 rounded-xl bg-[#FFF5EE] border border-[#FFE3CC]">
              {stat.icon}
            </div>
            <p className="text-sm text-text-dim font-semibold">{stat.label}</p>
            <p className="text-2xl font-black text-text-main mt-1">{stat.value}</p>
            <p className="text-xs text-text-muted mt-2">{stat.helper}</p>
          </article>
        ))}
      </section>

      <section className="rounded-3xl border border-border bg-white p-6 space-y-6">
        <div>
          <h2 className="text-2xl font-black text-text-main">CRM com funil de vendas</h2>
          <p className="text-sm text-text-muted mt-1">Gerencie prospects, leads qualificados, propostas e clientes ativos em uma única visão.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          <input
            value={dealForm.name}
            onChange={(event) => setDealForm((prev) => ({ ...prev, name: event.target.value }))}
            placeholder="Nome do contato"
            className="rounded-xl border border-border bg-bg-secondary px-4 py-3 text-sm font-semibold text-text-main outline-none focus:border-primary"
          />
          <input
            value={dealForm.company}
            onChange={(event) => setDealForm((prev) => ({ ...prev, company: event.target.value }))}
            placeholder="Empresa"
            className="rounded-xl border border-border bg-bg-secondary px-4 py-3 text-sm font-semibold text-text-main outline-none focus:border-primary"
          />
          <input
            value={dealForm.estimatedValue}
            onChange={(event) => setDealForm((prev) => ({ ...prev, estimatedValue: event.target.value }))}
            placeholder="Valor estimado (R$)"
            type="number"
            min="0"
            className="rounded-xl border border-border bg-bg-secondary px-4 py-3 text-sm font-semibold text-text-main outline-none focus:border-primary"
          />
          <input
            value={dealForm.source}
            onChange={(event) => setDealForm((prev) => ({ ...prev, source: event.target.value }))}
            placeholder="Origem do lead"
            className="rounded-xl border border-border bg-bg-secondary px-4 py-3 text-sm font-semibold text-text-main outline-none focus:border-primary"
          />
          <input
            value={dealForm.owner}
            onChange={(event) => setDealForm((prev) => ({ ...prev, owner: event.target.value }))}
            placeholder="Responsável"
            className="rounded-xl border border-border bg-bg-secondary px-4 py-3 text-sm font-semibold text-text-main outline-none focus:border-primary"
          />
          <input
            value={dealForm.nextAction}
            onChange={(event) => setDealForm((prev) => ({ ...prev, nextAction: event.target.value }))}
            placeholder="Próxima ação"
            className="rounded-xl border border-border bg-bg-secondary px-4 py-3 text-sm font-semibold text-text-main outline-none focus:border-primary"
          />
        </div>

        <button
          type="button"
          onClick={createDeal}
          className="rounded-xl bg-gradient-to-r from-[#FF6B00] to-[#FF8B2D] px-5 py-3 text-xs font-black tracking-widest uppercase text-white shadow-[0_10px_22px_rgba(255,107,0,0.3)]"
        >
          Adicionar oportunidade
        </button>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
          {CRM_STAGES.map((stage) => {
            const dealsInStage = crmDeals.filter((deal) => deal.stage === stage);
            return (
              <div key={stage} className="rounded-2xl border border-border bg-bg-secondary p-4 min-h-[220px]">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-black text-text-main">{stage}</h3>
                  <span className="text-xs font-bold text-text-dim">{dealsInStage.length}</span>
                </div>

                <div className="space-y-3">
                  {dealsInStage.map((deal) => (
                    <article key={deal.id} className="rounded-xl border border-white bg-white p-3 shadow-sm">
                      <p className="text-sm font-bold text-text-main">{deal.name}</p>
                      <p className="text-xs text-text-muted">{deal.company}</p>
                      <p className="text-xs text-[#0A9D57] font-black mt-1">{formatCurrency(deal.estimatedValue)}</p>
                      <p className="text-[11px] text-text-dim mt-2">Próxima ação: {deal.nextAction || 'Definir'}</p>
                      <p className="text-[11px] text-text-dim">Atualizado: {formatDateTime(deal.updatedAt)}</p>

                      <div className="mt-3 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => moveDealStage(deal, 'prev')}
                          className="rounded-lg border border-border px-2 py-1 text-[10px] font-bold uppercase text-text-dim disabled:opacity-40"
                          disabled={deal.stage === CRM_STAGES[0]}
                        >
                          Voltar
                        </button>
                        <button
                          type="button"
                          onClick={() => moveDealStage(deal, 'next')}
                          className="rounded-lg border border-[#BDE8CF] bg-[#F2FFF7] px-2 py-1 text-[10px] font-bold uppercase text-[#0A9D57] disabled:opacity-40"
                          disabled={deal.stage === CRM_STAGES[CRM_STAGES.length - 1]}
                        >
                          Avançar
                        </button>
                        <button
                          type="button"
                          onClick={() => removeDeal(deal.id)}
                          className="ml-auto rounded-lg border border-red-200 bg-red-50 p-1.5 text-red-500"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </article>
                  ))}

                  {dealsInStage.length === 0 && (
                    <p className="text-xs text-text-dim">Nenhum registro neste estágio.</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-3xl border border-border bg-white p-6 space-y-6">
        <div>
          <h2 className="text-2xl font-black text-text-main">Gestão de Agentes e atividades dos clientes</h2>
          <p className="text-sm text-text-muted mt-1">Monitore agentes ativos, prioridades e entregas em andamento por cliente.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          <input
            value={activityForm.clientName}
            onChange={(event) => setActivityForm((prev) => ({ ...prev, clientName: event.target.value }))}
            placeholder="Cliente"
            className="rounded-xl border border-border bg-bg-secondary px-4 py-3 text-sm font-semibold text-text-main outline-none focus:border-primary"
          />
          <input
            value={activityForm.agentName}
            onChange={(event) => setActivityForm((prev) => ({ ...prev, agentName: event.target.value }))}
            placeholder="Agente"
            className="rounded-xl border border-border bg-bg-secondary px-4 py-3 text-sm font-semibold text-text-main outline-none focus:border-primary"
          />
          <input
            value={activityForm.objective}
            onChange={(event) => setActivityForm((prev) => ({ ...prev, objective: event.target.value }))}
            placeholder="Objetivo da atividade"
            className="rounded-xl border border-border bg-bg-secondary px-4 py-3 text-sm font-semibold text-text-main outline-none focus:border-primary"
          />

          <select
            value={activityForm.priority}
            onChange={(event) => setActivityForm((prev) => ({ ...prev, priority: event.target.value as ActivityPriority }))}
            className="rounded-xl border border-border bg-bg-secondary px-4 py-3 text-sm font-semibold text-text-main outline-none focus:border-primary"
          >
            {ACTIVITY_PRIORITIES.map((priority) => (
              <option key={priority} value={priority}>{priority}</option>
            ))}
          </select>

          <select
            value={activityForm.status}
            onChange={(event) => setActivityForm((prev) => ({ ...prev, status: event.target.value as ActivityStatus }))}
            className="rounded-xl border border-border bg-bg-secondary px-4 py-3 text-sm font-semibold text-text-main outline-none focus:border-primary"
          >
            {ACTIVITY_STATUS.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>

          <input
            value={activityForm.dueDate}
            onChange={(event) => setActivityForm((prev) => ({ ...prev, dueDate: event.target.value }))}
            type="date"
            className="rounded-xl border border-border bg-bg-secondary px-4 py-3 text-sm font-semibold text-text-main outline-none focus:border-primary"
          />
        </div>

        <button
          type="button"
          onClick={createActivity}
          className="rounded-xl bg-gradient-to-r from-[#0A9D57] to-[#08B760] px-5 py-3 text-xs font-black tracking-widest uppercase text-white shadow-[0_10px_22px_rgba(8,183,96,0.3)]"
        >
          Registrar atividade
        </button>

        <div className="space-y-3">
          {agentActivities.map((activity) => (
            <article key={activity.id} className="rounded-2xl border border-border bg-bg-secondary p-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <div>
                  <p className="text-sm font-black text-text-main">{activity.clientName} • {activity.agentName}</p>
                  <p className="text-xs text-text-muted mt-1">{activity.objective}</p>
                </div>
                <div className="text-xs text-text-dim font-semibold">Atualizado: {formatDateTime(activity.updatedAt)}</div>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                <span className="rounded-full border border-border bg-white px-3 py-1 font-bold text-text-main">Prioridade: {activity.priority}</span>
                <span className="rounded-full border border-[#DCE8FF] bg-[#F5F9FF] px-3 py-1 font-bold text-[#1D4ED8]">Entrega: {activity.dueDate || 'Sem data'}</span>
                <button
                  type="button"
                  onClick={() => cycleActivityStatus(activity)}
                  className="rounded-full border border-[#BDE8CF] bg-[#F2FFF7] px-3 py-1 font-bold text-[#0A9D57]"
                >
                  Status: {activity.status}
                </button>
                <button
                  type="button"
                  onClick={() => removeActivity(activity.id)}
                  className="ml-auto rounded-lg border border-red-200 bg-red-50 p-1.5 text-red-500"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </article>
          ))}

          {!loadingData && agentActivities.length === 0 && (
            <p className="text-sm text-text-dim">Nenhuma atividade cadastrada.</p>
          )}
        </div>
      </section>

      <section className="rounded-3xl border border-border bg-white p-6 space-y-6">
        <div>
          <h2 className="text-2xl font-black text-text-main">Gestão Financeira</h2>
          <p className="text-sm text-text-muted mt-1">Acompanhe receitas, custos, pendências e o impacto direto no caixa.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          <select
            value={financeForm.type}
            onChange={(event) => setFinanceForm((prev) => ({ ...prev, type: event.target.value as FinanceType }))}
            className="rounded-xl border border-border bg-bg-secondary px-4 py-3 text-sm font-semibold text-text-main outline-none focus:border-primary"
          >
            {FINANCE_TYPES.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>

          <input
            value={financeForm.category}
            onChange={(event) => setFinanceForm((prev) => ({ ...prev, category: event.target.value }))}
            placeholder="Categoria"
            className="rounded-xl border border-border bg-bg-secondary px-4 py-3 text-sm font-semibold text-text-main outline-none focus:border-primary"
          />

          <input
            value={financeForm.description}
            onChange={(event) => setFinanceForm((prev) => ({ ...prev, description: event.target.value }))}
            placeholder="Descrição"
            className="rounded-xl border border-border bg-bg-secondary px-4 py-3 text-sm font-semibold text-text-main outline-none focus:border-primary"
          />

          <input
            value={financeForm.amount}
            onChange={(event) => setFinanceForm((prev) => ({ ...prev, amount: event.target.value }))}
            placeholder="Valor (R$)"
            type="number"
            min="0"
            className="rounded-xl border border-border bg-bg-secondary px-4 py-3 text-sm font-semibold text-text-main outline-none focus:border-primary"
          />

          <input
            value={financeForm.dueDate}
            onChange={(event) => setFinanceForm((prev) => ({ ...prev, dueDate: event.target.value }))}
            type="date"
            className="rounded-xl border border-border bg-bg-secondary px-4 py-3 text-sm font-semibold text-text-main outline-none focus:border-primary"
          />

          <select
            value={financeForm.status}
            onChange={(event) => setFinanceForm((prev) => ({ ...prev, status: event.target.value as FinanceStatus }))}
            className="rounded-xl border border-border bg-bg-secondary px-4 py-3 text-sm font-semibold text-text-main outline-none focus:border-primary"
          >
            {FINANCE_STATUS.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={createFinanceEntry}
          className="rounded-xl bg-gradient-to-r from-[#0F172A] to-[#1E293B] px-5 py-3 text-xs font-black tracking-widest uppercase text-white shadow-[0_10px_22px_rgba(15,23,42,0.3)]"
        >
          Lançar movimento
        </button>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <article className="rounded-2xl border border-[#BDE8CF] bg-[#F2FFF7] p-4">
            <p className="text-xs font-bold text-[#0A9D57]">Receitas</p>
            <p className="text-lg font-black text-[#0A9D57]">{formatCurrency(financeSummary.revenue)}</p>
          </article>
          <article className="rounded-2xl border border-[#FFD3D3] bg-[#FFF5F5] p-4">
            <p className="text-xs font-bold text-[#D14343]">Custos</p>
            <p className="text-lg font-black text-[#D14343]">{formatCurrency(financeSummary.cost)}</p>
          </article>
          <article className="rounded-2xl border border-border bg-bg-secondary p-4">
            <p className="text-xs font-bold text-text-dim">Saldo</p>
            <p className="text-lg font-black text-text-main">{formatCurrency(financeSummary.balance)}</p>
          </article>
          <article className="rounded-2xl border border-[#FFE4D1] bg-[#FFF8F3] p-4">
            <p className="text-xs font-bold text-primary">Pendências</p>
            <p className="text-lg font-black text-primary">{formatCurrency(financeSummary.pending)}</p>
          </article>
        </div>

        <div className="space-y-3">
          {financeEntries.map((entry) => (
            <article key={entry.id} className="rounded-2xl border border-border bg-bg-secondary p-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <div>
                  <p className="text-sm font-black text-text-main">{entry.category} • {entry.description}</p>
                  <p className="text-xs text-text-muted">Vencimento: {entry.dueDate || 'Sem data'} • Atualizado: {formatDateTime(entry.updatedAt)}</p>
                </div>
                <p className={`text-sm font-black ${entry.type === 'Receita' ? 'text-[#0A9D57]' : 'text-[#D14343]'}`}>
                  {entry.type === 'Receita' ? '+' : '-'} {formatCurrency(entry.amount)}
                </p>
              </div>

              <div className="mt-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => cycleFinanceStatus(entry)}
                  className="rounded-full border border-[#DCE8FF] bg-[#F5F9FF] px-3 py-1 text-xs font-bold text-[#1D4ED8]"
                >
                  Status: {entry.status}
                </button>
                <button
                  type="button"
                  onClick={() => removeFinanceEntry(entry.id)}
                  className="ml-auto rounded-lg border border-red-200 bg-red-50 p-1.5 text-red-500"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </article>
          ))}

          {!loadingData && financeEntries.length === 0 && (
            <p className="text-sm text-text-dim">Nenhum lançamento financeiro cadastrado.</p>
          )}
        </div>
      </section>
    </div>
  );
}
