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
  writeBatch,
  type DocumentData,
} from 'firebase/firestore';
import { Bot, Clock3, Filter, Siren, Trash2, Users } from 'lucide-react';
import { getFirebaseDb } from '../../lib/firebase';
import { sendLuccaChannelMessageAction } from '../../app/actions/lucca-channels';

const OPERATION_FRONTS = ['Comercial', 'Pós-venda', 'Captação', 'Suporte'] as const;
const EXEC_STATUS = ['Novo', 'Triagem Lucca', 'Em execução', 'Aguardando cliente', 'Concluído'] as const;
const PRIORITIES = ['Baixa', 'Média', 'Alta', 'Crítica'] as const;

type OperationFront = (typeof OPERATION_FRONTS)[number];
type ExecStatus = (typeof EXEC_STATUS)[number];
type Priority = (typeof PRIORITIES)[number];

interface ExecutiveTask {
  id: string;
  front: OperationFront;
  clientName: string;
  title: string;
  details: string;
  channel: string;
  owner: string;
  status: ExecStatus;
  priority: Priority;
  dueDate: string;
  score: number;
  luccaSummary: string;
  updatedAt: number;
}

interface LuccaExecutiveDeskProps {
  userId: string;
}

interface TriageResult {
  score: number;
  priority: Priority;
  summary: string;
}

const FRONT_SCORE: Record<OperationFront, number> = {
  Comercial: 24,
  'Pós-venda': 20,
  Captação: 22,
  Suporte: 26,
};

const PRIORITY_LABEL_STYLES: Record<Priority, string> = {
  Baixa: 'bg-[#F8FAFC] text-[#475569] border-[#DCE3EE]',
  Média: 'bg-[#FFF8F3] text-[#B45309] border-[#FFE0C2]',
  Alta: 'bg-[#FFF5F5] text-[#C2410C] border-[#FFD2C7]',
  Crítica: 'bg-[#FFF1F2] text-[#BE123C] border-[#FFC2D1]',
};

const STATUS_STYLES: Record<ExecStatus, string> = {
  Novo: 'bg-[#EEF2FF] text-[#3730A3] border-[#C7D2FE]',
  'Triagem Lucca': 'bg-[#FFF8F3] text-[#B45309] border-[#FFE0C2]',
  'Em execução': 'bg-[#F2FFF7] text-[#0A9D57] border-[#BDE8CF]',
  'Aguardando cliente': 'bg-[#F8FAFC] text-[#475569] border-[#DCE3EE]',
  'Concluído': 'bg-[#ECFDF3] text-[#047857] border-[#A7F3D0]',
};

function toMillis(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (value instanceof Timestamp) return value.toMillis();
  return Date.now();
}

function parseFront(value: unknown): OperationFront {
  return OPERATION_FRONTS.includes(value as OperationFront) ? (value as OperationFront) : 'Comercial';
}

function parseStatus(value: unknown): ExecStatus {
  return EXEC_STATUS.includes(value as ExecStatus) ? (value as ExecStatus) : 'Novo';
}

function parsePriority(value: unknown): Priority {
  return PRIORITIES.includes(value as Priority) ? (value as Priority) : 'Média';
}

function getDueUrgencyScore(dueDate: string): number {
  if (!dueDate) return 0;

  const today = new Date();
  const due = new Date(`${dueDate}T23:59:59`);
  const diffMs = due.getTime() - today.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 35;
  if (diffDays === 0) return 28;
  if (diffDays <= 2) return 18;
  if (diffDays <= 5) return 10;
  return 3;
}

function evaluatePriority(score: number): Priority {
  if (score >= 78) return 'Crítica';
  if (score >= 55) return 'Alta';
  if (score >= 34) return 'Média';
  return 'Baixa';
}

function runLuccaTriage(front: OperationFront, title: string, details: string, dueDate: string): TriageResult {
  const text = `${title} ${details}`.toLowerCase();

  let score = FRONT_SCORE[front] + getDueUrgencyScore(dueDate);

  if (text.includes('cancel') || text.includes('reembolso') || text.includes('churn')) score += 22;
  if (text.includes('urgente') || text.includes('hoje') || text.includes('bloqueio')) score += 18;
  if (text.includes('sem retorno') || text.includes('lead parado') || text.includes('proposta')) score += 14;
  if (text.includes('suporte') || text.includes('erro')) score += 12;

  const priority = evaluatePriority(score);

  const summary =
    priority === 'Crítica'
      ? 'Lucca definiu prioridade máxima. Ação em até 2h com dono e retorno ao cliente.'
      : priority === 'Alta'
        ? 'Lucca recomenda execução no mesmo dia e atualização de status com próximo passo objetivo.'
        : priority === 'Média'
          ? 'Lucca recomenda execução em até 48h com checklist de impacto financeiro.'
          : 'Lucca sugere fila planejada, com revisão semanal de prioridade.';

  return { score, priority, summary };
}

function isOpenStatus(status: ExecStatus): boolean {
  return status !== 'Concluído';
}

function isOverdue(dueDate: string, status: ExecStatus): boolean {
  if (!dueDate || status === 'Concluído') return false;
  const due = new Date(`${dueDate}T23:59:59`);
  return due.getTime() < Date.now();
}

function formatDate(value: string): string {
  if (!value) return 'Sem data';
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' }).format(new Date(`${value}T12:00:00`));
}

function formatDateTime(value: number): string {
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(value);
}

export default function LuccaExecutiveDesk({ userId }: LuccaExecutiveDeskProps) {
  const [tasks, setTasks] = useState<ExecutiveTask[]>([]);
  const [crmClients, setCrmClients] = useState<string[]>([]);
  const [frontFilter, setFrontFilter] = useState<OperationFront | 'Todos'>('Todos');
  const [statusFilter, setStatusFilter] = useState<ExecStatus | 'Todos'>('Todos');
  const [composerTaskId, setComposerTaskId] = useState<string | null>(null);
  const [composerChannel, setComposerChannel] = useState<'email'>('email');
  const [composerTo, setComposerTo] = useState('');
  const [composerSubject, setComposerSubject] = useState('');
  const [composerMessage, setComposerMessage] = useState('');
  const [composerStatus, setComposerStatus] = useState<{ type: 'idle' | 'success' | 'error'; text: string }>({
    type: 'idle',
    text: '',
  });
  const [sendingMessage, setSendingMessage] = useState(false);

  const [form, setForm] = useState({
    front: 'Comercial' as OperationFront,
    clientName: '',
    title: '',
    details: '',
    channel: 'Email',
    dueDate: '',
  });

  useEffect(() => {
    const db = getFirebaseDb();
    const execQuery = query(collection(db, 'admin_workspaces', userId, 'executive_tasks'), orderBy('updatedAt', 'desc'));
    const clientsQuery = query(collection(db, 'admin_workspaces', userId, 'crm_accounts'), orderBy('updatedAt', 'desc'));

    const unsubscribe = onSnapshot(execQuery, (snapshot) => {
      const parsed = snapshot.docs.map((snapshotDoc) => {
        const data = snapshotDoc.data() as DocumentData;
        return {
          id: snapshotDoc.id,
          front: parseFront(data.front),
          clientName: String(data.clientName ?? ''),
          title: String(data.title ?? ''),
          details: String(data.details ?? ''),
          channel: String(data.channel ?? ''),
          owner: String(data.owner ?? 'Lucca'),
          status: parseStatus(data.status),
          priority: parsePriority(data.priority),
          dueDate: String(data.dueDate ?? ''),
          score: Number(data.score ?? 0),
          luccaSummary: String(data.luccaSummary ?? ''),
          updatedAt: toMillis(data.updatedAt),
        } satisfies ExecutiveTask;
      });

      setTasks(parsed);
    });

    const unsubscribeClients = onSnapshot(clientsQuery, (snapshot) => {
      const names = Array.from(
        new Set(
          snapshot.docs
            .map((snapshotDoc) => String((snapshotDoc.data() as DocumentData).name ?? '').trim())
            .filter(Boolean),
        ),
      ).sort((first, second) => first.localeCompare(second, 'pt-BR'));
      setCrmClients(names);
    });

    return () => {
      unsubscribe();
      unsubscribeClients();
    };
  }, [userId]);

  const openTasks = useMemo(() => tasks.filter((task) => isOpenStatus(task.status)), [tasks]);

  const stats = useMemo(() => {
    const critical = openTasks.filter((task) => task.priority === 'Crítica').length;
    const overdue = openTasks.filter((task) => isOverdue(task.dueDate, task.status)).length;
    const todayTasks = openTasks.filter((task) => {
      if (!task.dueDate) return false;
      const todayIso = new Date().toISOString().slice(0, 10);
      return task.dueDate === todayIso;
    }).length;

    return {
      open: openTasks.length,
      critical,
      overdue,
      todayTasks,
    };
  }, [openTasks]);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const frontMatches = frontFilter === 'Todos' || task.front === frontFilter;
      const statusMatches = statusFilter === 'Todos' || task.status === statusFilter;
      return frontMatches && statusMatches;
    });
  }, [tasks, frontFilter, statusFilter]);

  async function createExecutiveTask() {
    if (!form.clientName.trim() || !form.title.trim()) return;

    const triage = runLuccaTriage(form.front, form.title, form.details, form.dueDate);

    const db = getFirebaseDb();
    await addDoc(collection(db, 'admin_workspaces', userId, 'executive_tasks'), {
      front: form.front,
      clientName: form.clientName.trim(),
      title: form.title.trim(),
      details: form.details.trim(),
      channel: form.channel.trim(),
      owner: 'Lucca',
      status: 'Novo',
      priority: triage.priority,
      score: triage.score,
      luccaSummary: triage.summary,
      dueDate: form.dueDate,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    setForm({
      front: 'Comercial',
      clientName: '',
      title: '',
      details: '',
      channel: 'Email',
      dueDate: '',
    });
  }

  async function triageSingleTask(task: ExecutiveTask) {
    const triage = runLuccaTriage(task.front, task.title, task.details, task.dueDate);
    const db = getFirebaseDb();
    await updateDoc(doc(db, 'admin_workspaces', userId, 'executive_tasks', task.id), {
      priority: triage.priority,
      score: triage.score,
      luccaSummary: triage.summary,
      status: task.status === 'Novo' ? 'Triagem Lucca' : task.status,
      owner: 'Lucca',
      updatedAt: serverTimestamp(),
    });
  }

  async function applyLuccaBulkTriage() {
    if (!tasks.length) return;
    const db = getFirebaseDb();
    const batch = writeBatch(db);

    for (const task of tasks) {
      if (task.status === 'Concluído') continue;

      const triage = runLuccaTriage(task.front, task.title, task.details, task.dueDate);
      const ref = doc(db, 'admin_workspaces', userId, 'executive_tasks', task.id);
      batch.update(ref, {
        priority: triage.priority,
        score: triage.score,
        luccaSummary: triage.summary,
        status: task.status === 'Novo' ? 'Triagem Lucca' : task.status,
        owner: 'Lucca',
        updatedAt: serverTimestamp(),
      });
    }

    await batch.commit();
  }

  async function cycleStatus(task: ExecutiveTask) {
    const currentIndex = EXEC_STATUS.indexOf(task.status);
    const nextStatus = EXEC_STATUS[(currentIndex + 1) % EXEC_STATUS.length];

    const db = getFirebaseDb();
    await updateDoc(doc(db, 'admin_workspaces', userId, 'executive_tasks', task.id), {
      status: nextStatus,
      updatedAt: serverTimestamp(),
    });
  }

  async function removeTask(id: string) {
    const db = getFirebaseDb();
    await deleteDoc(doc(db, 'admin_workspaces', userId, 'executive_tasks', id));
  }

  function openComposer(task: ExecutiveTask) {
    setComposerTaskId(task.id);
    setComposerSubject(`Lucca | ${task.front} | ${task.clientName}`);
    setComposerMessage(`Olá ${task.clientName},\n\nAtualização da frente ${task.front}:\n${task.title}\n\nPróximo passo: ${task.luccaSummary || task.details || 'Alinhamento operacional em andamento.'}\n\nAtenciosamente,\nLucca | NeuroAds`);
    setComposerStatus({ type: 'idle', text: '' });
  }

  async function submitComposer(task: ExecutiveTask) {
    if (!composerTo.trim() || !composerMessage.trim()) {
      setComposerStatus({ type: 'error', text: 'Informe destino e mensagem antes de enviar.' });
      return;
    }

    setSendingMessage(true);
    setComposerStatus({ type: 'idle', text: '' });

    const result = await sendLuccaChannelMessageAction({
      workspaceUserId: userId,
      taskId: task.id,
      front: task.front,
      channel: composerChannel,
      to: composerTo.trim(),
      subject: composerSubject.trim(),
      message: composerMessage.trim(),
      clientName: task.clientName,
    });

    if (result.success) {
      setComposerStatus({ type: 'success', text: 'Mensagem enviada e registrada no CRM.' });
      setComposerTo('');
      setComposerMessage('');
      setComposerTaskId(null);
    } else {
      setComposerStatus({ type: 'error', text: result.error || 'Falha ao enviar mensagem.' });
    }

    setSendingMessage(false);
  }

  return (
    <section id="operacao-lucca" className="rounded-3xl border border-[#FFB37A] bg-white p-6 space-y-6 scroll-mt-32 shadow-[0_14px_34px_rgba(255,107,0,0.14)]">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <p className="text-xs font-black tracking-[0.14em] uppercase text-primary">Lucca Secretário Executivo</p>
          <h2 className="text-2xl font-black text-text-main mt-2">Central operacional unificada</h2>
          <p className="text-sm text-text-muted mt-1">
            Orquestra Comercial, Pós-venda, Captação e Suporte com triagem automática orientada a impacto no caixa.
          </p>
        </div>

        <button
          type="button"
          onClick={applyLuccaBulkTriage}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#FF6B00] to-[#FF8B2D] px-5 py-3 text-xs font-black tracking-widest uppercase text-white shadow-[0_10px_22px_rgba(255,107,0,0.3)]"
        >
          <Bot size={15} />
          Lucca priorizar fila
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
        <article className="rounded-2xl border border-border bg-bg-secondary p-4">
          <p className="text-xs font-bold text-text-dim">Pendências abertas</p>
          <p className="text-2xl font-black text-text-main mt-1">{stats.open}</p>
        </article>
        <article className="rounded-2xl border border-[#FFD3D3] bg-[#FFF5F5] p-4">
          <p className="text-xs font-bold text-[#D14343]">Prioridade crítica</p>
          <p className="text-2xl font-black text-[#D14343] mt-1">{stats.critical}</p>
        </article>
        <article className="rounded-2xl border border-[#FFE4D1] bg-[#FFF8F3] p-4">
          <p className="text-xs font-bold text-primary">Atrasadas</p>
          <p className="text-2xl font-black text-primary mt-1">{stats.overdue}</p>
        </article>
        <article className="rounded-2xl border border-[#DCE8FF] bg-[#F5F9FF] p-4">
          <p className="text-xs font-bold text-[#1D4ED8]">Vencem hoje</p>
          <p className="text-2xl font-black text-[#1D4ED8] mt-1">{stats.todayTasks}</p>
        </article>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        <select
          value={form.front}
          onChange={(event) => setForm((prev) => ({ ...prev, front: event.target.value as OperationFront }))}
          className="rounded-xl border border-border bg-bg-secondary px-4 py-3 text-sm font-semibold text-text-main outline-none focus:border-primary"
        >
          {OPERATION_FRONTS.map((front) => (
            <option key={front} value={front}>{front}</option>
          ))}
        </select>
        <select
          value={form.clientName}
          onChange={(event) => setForm((prev) => ({ ...prev, clientName: event.target.value }))}
          className="rounded-xl border border-border bg-bg-secondary px-4 py-3 text-sm font-semibold text-text-main outline-none focus:border-primary"
        >
          <option value="">Selecione o cliente</option>
          {!crmClients.includes(form.clientName) && form.clientName && <option value={form.clientName}>{form.clientName}</option>}
          {crmClients.map((clientName) => (
            <option key={clientName} value={clientName}>
              {clientName}
            </option>
          ))}
        </select>
        <input
          value={form.channel}
          onChange={(event) => setForm((prev) => ({ ...prev, channel: event.target.value }))}
          placeholder="Canal (Email, Reunião...)"
          className="rounded-xl border border-border bg-bg-secondary px-4 py-3 text-sm font-semibold text-text-main outline-none focus:border-primary"
        />
        <input
          value={form.title}
          onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
          placeholder="Resumo da demanda"
          className="rounded-xl border border-border bg-bg-secondary px-4 py-3 text-sm font-semibold text-text-main outline-none focus:border-primary"
        />
        <input
          value={form.details}
          onChange={(event) => setForm((prev) => ({ ...prev, details: event.target.value }))}
          placeholder="Contexto operacional"
          className="rounded-xl border border-border bg-bg-secondary px-4 py-3 text-sm font-semibold text-text-main outline-none focus:border-primary"
        />
        <input
          type="date"
          value={form.dueDate}
          onChange={(event) => setForm((prev) => ({ ...prev, dueDate: event.target.value }))}
          className="rounded-xl border border-border bg-bg-secondary px-4 py-3 text-sm font-semibold text-text-main outline-none focus:border-primary"
        />
      </div>

      <button
        type="button"
        onClick={createExecutiveTask}
        className="rounded-xl bg-gradient-to-r from-[#0A9D57] to-[#08B760] px-5 py-3 text-xs font-black tracking-widest uppercase text-white shadow-[0_10px_22px_rgba(8,183,96,0.3)]"
      >
        Registrar demanda para o Lucca
      </button>

      <div className="rounded-2xl border border-border bg-bg-secondary p-4">
        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-text-dim">
            <Filter size={14} /> Filtros
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setFrontFilter('Todos')}
              className={`rounded-full px-3 py-1 text-xs font-bold border ${frontFilter === 'Todos' ? 'bg-white border-primary text-primary' : 'bg-bg-secondary border-border text-text-dim'}`}
            >
              Todos os setores
            </button>
            {OPERATION_FRONTS.map((front) => (
              <button
                key={front}
                type="button"
                onClick={() => setFrontFilter(front)}
                className={`rounded-full px-3 py-1 text-xs font-bold border ${frontFilter === front ? 'bg-white border-primary text-primary' : 'bg-bg-secondary border-border text-text-dim'}`}
              >
                {front}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2 lg:ml-auto">
            <button
              type="button"
              onClick={() => setStatusFilter('Todos')}
              className={`rounded-full px-3 py-1 text-xs font-bold border ${statusFilter === 'Todos' ? 'bg-white border-primary text-primary' : 'bg-bg-secondary border-border text-text-dim'}`}
            >
              Todos os status
            </button>
            {EXEC_STATUS.map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={`rounded-full px-3 py-1 text-xs font-bold border ${statusFilter === status ? 'bg-white border-primary text-primary' : 'bg-bg-secondary border-border text-text-dim'}`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {filteredTasks.map((task) => (
          <article key={task.id} className="rounded-2xl border border-border bg-bg-secondary p-4">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-[#DCE8FF] bg-[#F5F9FF] px-3 py-1 text-xs font-bold text-[#1D4ED8]">{task.front}</span>
                  <span className={`rounded-full border px-3 py-1 text-xs font-bold ${PRIORITY_LABEL_STYLES[task.priority]}`}>{task.priority}</span>
                  <span className={`rounded-full border px-3 py-1 text-xs font-bold ${STATUS_STYLES[task.status]}`}>{task.status}</span>
                </div>

                <p className="text-base font-black text-text-main mt-3">{task.clientName} • {task.title}</p>
                <p className="text-sm text-text-muted mt-1">{task.details || 'Sem contexto adicional informado.'}</p>

                <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-text-dim font-semibold">
                  <span className="inline-flex items-center gap-1"><Users size={13} /> Responsável: {task.owner}</span>
                  <span className="inline-flex items-center gap-1"><Clock3 size={13} /> Prazo: {formatDate(task.dueDate)}</span>
                  <span className="inline-flex items-center gap-1"><Siren size={13} /> Score Lucca: {task.score}</span>
                </div>

                <div className="mt-3 rounded-xl border border-[#FFE4D1] bg-[#FFF8F3] p-3 text-xs text-[#7C2D12] font-semibold">
                  {task.luccaSummary || 'Lucca ainda não executou triagem desta demanda.'}
                </div>
              </div>

              <div className="flex flex-row lg:flex-col gap-2 lg:min-w-[175px]">
                <button
                  type="button"
                  onClick={() => triageSingleTask(task)}
                  className="rounded-xl border border-[#FFD9BD] bg-white px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-primary"
                >
                  Triagem Lucca
                </button>
                <button
                  type="button"
                  onClick={() => cycleStatus(task)}
                  className="rounded-xl border border-[#BDE8CF] bg-[#F2FFF7] px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-[#0A9D57]"
                >
                  Avançar status
                </button>
                <button
                  type="button"
                  onClick={() => openComposer(task)}
                  className="rounded-xl border border-[#DCE8FF] bg-[#F5F9FF] px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-[#1D4ED8]"
                >
                  Contatar cliente
                </button>
                <button
                  type="button"
                  onClick={() => removeTask(task.id)}
                  className="inline-flex items-center justify-center gap-1 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-red-500"
                >
                  <Trash2 size={13} /> Excluir
                </button>
              </div>
            </div>

            <p className="mt-3 text-[11px] text-text-dim">Atualizado em {formatDateTime(task.updatedAt)} via central de execução do Lucca.</p>

            {composerTaskId === task.id && (
              <div className="mt-4 rounded-xl border border-[#DCE8FF] bg-[#F5F9FF] p-4 space-y-3">
                <p className="text-xs font-black uppercase tracking-widest text-[#1D4ED8]">Canal de contato Lucca</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <select
                    value={composerChannel}
                    onChange={(event) => setComposerChannel(event.target.value as 'email')}
                    className="rounded-xl border border-border bg-white px-4 py-2.5 text-sm font-semibold text-text-main outline-none focus:border-primary"
                  >
                    <option value="email">Email</option>
                  </select>

                  <input
                    value={composerTo}
                    onChange={(event) => setComposerTo(event.target.value)}
                    placeholder="cliente@dominio.com"
                    className="rounded-xl border border-border bg-white px-4 py-2.5 text-sm font-semibold text-text-main outline-none focus:border-primary"
                  />
                </div>

                <input
                  value={composerSubject}
                  onChange={(event) => setComposerSubject(event.target.value)}
                  placeholder="Assunto do email"
                  className="w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm font-semibold text-text-main outline-none focus:border-primary"
                />

                <textarea
                  value={composerMessage}
                  onChange={(event) => setComposerMessage(event.target.value)}
                  rows={5}
                  placeholder="Mensagem do Lucca para o cliente"
                  className="w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm font-semibold text-text-main outline-none focus:border-primary"
                />

                {composerStatus.type !== 'idle' && (
                  <p className={`text-xs font-semibold ${composerStatus.type === 'success' ? 'text-[#0A9D57]' : 'text-[#BE123C]'}`}>
                    {composerStatus.text}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    disabled={sendingMessage}
                    onClick={() => submitComposer(task)}
                    className="rounded-xl bg-gradient-to-r from-[#0A9D57] to-[#08B760] px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-white disabled:opacity-60"
                  >
                    {sendingMessage ? 'Enviando...' : 'Enviar e registrar'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setComposerTaskId(null)}
                    className="rounded-xl border border-border bg-white px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-text-dim"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            )}
          </article>
        ))}

        {filteredTasks.length === 0 && (
          <div className="rounded-2xl border border-border bg-bg-secondary p-5 text-sm text-text-dim">
            Nenhuma demanda encontrada com os filtros atuais.
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-[#DCE8FF] bg-[#F5F9FF] p-4 text-sm text-[#1E3A8A]">
        <p className="font-bold">Rotina padrão do Lucca (Secretário Executivo)</p>
        <p className="mt-1">
          1) Recebe demandas por setor; 2) Prioriza por risco de receita, SLA e urgência; 3) Encaminha execução; 4) Atualiza status até conclusão.
        </p>
      </div>
    </section>
  );
}
