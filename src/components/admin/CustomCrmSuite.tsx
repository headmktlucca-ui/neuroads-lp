'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  type DocumentData,
} from 'firebase/firestore';
import { Building2, CircleUserRound, Handshake, ListChecks, MessageSquareText, Trash2 } from 'lucide-react';
import { getFirebaseDb } from '../../lib/firebase';

interface CustomCrmSuiteProps {
  userId: string;
}

interface CrmAccount {
  id: string;
  name: string;
  segment: string;
  monthlyRevenue: number;
  owner: string;
  status: 'Ativo' | 'Potencial' | 'Risco';
  updatedAt: number;
}

interface CrmContact {
  id: string;
  accountId: string;
  name: string;
  email: string;
  whatsapp: string;
  role: string;
  updatedAt: number;
}

interface CrmDeal {
  id: string;
  accountId: string;
  title: string;
  stage: string;
  amount: number;
  probability: number;
  expectedCloseDate: string;
  owner: string;
  updatedAt: number;
}

interface CrmInteraction {
  id: string;
  clientName: string;
  front: string;
  channel: string;
  to: string;
  subject: string;
  message: string;
  deliveryStatus: string;
  createdAt: number;
}

const DEFAULT_PIPELINE = ['Diagnóstico', 'Descoberta', 'Proposta', 'Negociação', 'Fechamento'];

function toMillis(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (value instanceof Timestamp) return value.toMillis();
  return Date.now();
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
}

function formatDate(value: number): string {
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(value);
}

export default function CustomCrmSuite({ userId }: CustomCrmSuiteProps) {
  const [pipelineStages, setPipelineStages] = useState<string[]>(DEFAULT_PIPELINE);
  const [newStage, setNewStage] = useState('');

  const [accounts, setAccounts] = useState<CrmAccount[]>([]);
  const [contacts, setContacts] = useState<CrmContact[]>([]);
  const [deals, setDeals] = useState<CrmDeal[]>([]);
  const [interactions, setInteractions] = useState<CrmInteraction[]>([]);

  const [accountForm, setAccountForm] = useState({ name: '', segment: '', monthlyRevenue: '', owner: '', status: 'Potencial' as CrmAccount['status'] });
  const [contactForm, setContactForm] = useState({ accountId: '', name: '', email: '', whatsapp: '', role: '' });
  const [dealForm, setDealForm] = useState({ accountId: '', title: '', amount: '', probability: '30', expectedCloseDate: '', owner: '' });

  useEffect(() => {
    const db = getFirebaseDb();

    async function loadPipelineConfig() {
      const configRef = doc(db, 'admin_workspaces', userId, 'crm_settings', 'pipeline');
      const snapshot = await getDoc(configRef);
      if (snapshot.exists()) {
        const data = snapshot.data() as { stages?: string[] };
        if (data.stages?.length) {
          setPipelineStages(data.stages);
        }
      }
    }

    loadPipelineConfig().catch(() => undefined);

    const accountsQuery = query(collection(db, 'admin_workspaces', userId, 'crm_accounts'), orderBy('updatedAt', 'desc'));
    const contactsQuery = query(collection(db, 'admin_workspaces', userId, 'crm_contacts'), orderBy('updatedAt', 'desc'));
    const dealsQuery = query(collection(db, 'admin_workspaces', userId, 'crm_pipeline_deals'), orderBy('updatedAt', 'desc'));
    const interactionsQuery = query(collection(db, 'admin_workspaces', userId, 'crm_interactions'), orderBy('createdAt', 'desc'));

    const unsubAccounts = onSnapshot(accountsQuery, (snapshot) => {
      setAccounts(
        snapshot.docs.map((d) => {
          const data = d.data() as DocumentData;
          return {
            id: d.id,
            name: String(data.name ?? ''),
            segment: String(data.segment ?? ''),
            monthlyRevenue: Number(data.monthlyRevenue ?? 0),
            owner: String(data.owner ?? ''),
            status: (data.status as CrmAccount['status']) || 'Potencial',
            updatedAt: toMillis(data.updatedAt),
          };
        })
      );
    });

    const unsubContacts = onSnapshot(contactsQuery, (snapshot) => {
      setContacts(
        snapshot.docs.map((d) => {
          const data = d.data() as DocumentData;
          return {
            id: d.id,
            accountId: String(data.accountId ?? ''),
            name: String(data.name ?? ''),
            email: String(data.email ?? ''),
            whatsapp: String(data.whatsapp ?? ''),
            role: String(data.role ?? ''),
            updatedAt: toMillis(data.updatedAt),
          };
        })
      );
    });

    const unsubDeals = onSnapshot(dealsQuery, (snapshot) => {
      setDeals(
        snapshot.docs.map((d) => {
          const data = d.data() as DocumentData;
          return {
            id: d.id,
            accountId: String(data.accountId ?? ''),
            title: String(data.title ?? ''),
            stage: String(data.stage ?? pipelineStages[0] ?? DEFAULT_PIPELINE[0]),
            amount: Number(data.amount ?? 0),
            probability: Number(data.probability ?? 0),
            expectedCloseDate: String(data.expectedCloseDate ?? ''),
            owner: String(data.owner ?? ''),
            updatedAt: toMillis(data.updatedAt),
          };
        })
      );
    });

    const unsubInteractions = onSnapshot(interactionsQuery, (snapshot) => {
      setInteractions(
        snapshot.docs.map((d) => {
          const data = d.data() as DocumentData;
          return {
            id: d.id,
            clientName: String(data.clientName ?? ''),
            front: String(data.front ?? ''),
            channel: String(data.channel ?? ''),
            to: String(data.to ?? ''),
            subject: String(data.subject ?? ''),
            message: String(data.message ?? ''),
            deliveryStatus: String(data.deliveryStatus ?? 'sent'),
            createdAt: toMillis(data.createdAt),
          };
        })
      );
    });

    return () => {
      unsubAccounts();
      unsubContacts();
      unsubDeals();
      unsubInteractions();
    };
  }, [userId, pipelineStages]);

  const weightedForecast = useMemo(() => {
    return deals.reduce((total, deal) => total + deal.amount * (deal.probability / 100), 0);
  }, [deals]);

  const totals = useMemo(() => {
    return {
      accounts: accounts.length,
      contacts: contacts.length,
      deals: deals.length,
      pipeline: deals.reduce((total, deal) => total + deal.amount, 0),
    };
  }, [accounts, contacts, deals]);

  async function persistPipeline(stages: string[]) {
    const db = getFirebaseDb();
    const ref = doc(db, 'admin_workspaces', userId, 'crm_settings', 'pipeline');
    await setDoc(
      ref,
      {
        stages,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  }

  async function addStage() {
    const normalized = newStage.trim();
    if (!normalized || pipelineStages.includes(normalized)) return;
    const next = [...pipelineStages, normalized];
    setPipelineStages(next);
    setNewStage('');
    await persistPipeline(next);
  }

  async function removeStage(stage: string) {
    if (pipelineStages.length <= 2) return;
    const next = pipelineStages.filter((s) => s !== stage);
    setPipelineStages(next);
    await persistPipeline(next);
  }

  async function createAccount() {
    const monthlyRevenue = Number(accountForm.monthlyRevenue);
    if (!accountForm.name.trim() || !Number.isFinite(monthlyRevenue)) return;

    const db = getFirebaseDb();
    await addDoc(collection(db, 'admin_workspaces', userId, 'crm_accounts'), {
      name: accountForm.name.trim(),
      segment: accountForm.segment.trim(),
      monthlyRevenue,
      owner: accountForm.owner.trim(),
      status: accountForm.status,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    setAccountForm({ name: '', segment: '', monthlyRevenue: '', owner: '', status: 'Potencial' });
  }

  async function createContact() {
    if (!contactForm.accountId || !contactForm.name.trim()) return;
    const db = getFirebaseDb();

    await addDoc(collection(db, 'admin_workspaces', userId, 'crm_contacts'), {
      accountId: contactForm.accountId,
      name: contactForm.name.trim(),
      email: contactForm.email.trim(),
      whatsapp: contactForm.whatsapp.trim(),
      role: contactForm.role.trim(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    setContactForm({ accountId: '', name: '', email: '', whatsapp: '', role: '' });
  }

  async function createDeal() {
    const amount = Number(dealForm.amount);
    const probability = Number(dealForm.probability);
    if (!dealForm.accountId || !dealForm.title.trim() || !Number.isFinite(amount)) return;

    const db = getFirebaseDb();
    await addDoc(collection(db, 'admin_workspaces', userId, 'crm_pipeline_deals'), {
      accountId: dealForm.accountId,
      title: dealForm.title.trim(),
      stage: pipelineStages[0] || DEFAULT_PIPELINE[0],
      amount,
      probability: Number.isFinite(probability) ? probability : 30,
      expectedCloseDate: dealForm.expectedCloseDate,
      owner: dealForm.owner.trim(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    setDealForm({ accountId: '', title: '', amount: '', probability: '30', expectedCloseDate: '', owner: '' });
  }

  async function moveDeal(deal: CrmDeal, direction: 'prev' | 'next') {
    const index = pipelineStages.indexOf(deal.stage);
    if (index < 0) return;

    const nextIndex = direction === 'next' ? index + 1 : index - 1;
    if (nextIndex < 0 || nextIndex >= pipelineStages.length) return;

    const db = getFirebaseDb();
    await updateDoc(doc(db, 'admin_workspaces', userId, 'crm_pipeline_deals', deal.id), {
      stage: pipelineStages[nextIndex],
      updatedAt: serverTimestamp(),
    });
  }

  async function removeRecord(collectionName: string, id: string) {
    const db = getFirebaseDb();
    await deleteDoc(doc(db, 'admin_workspaces', userId, collectionName, id));
  }

  const getAccountName = (accountId: string) => accounts.find((account) => account.id === accountId)?.name || 'Conta não encontrada';

  return (
    <section className="rounded-3xl border border-border bg-white p-6 space-y-6">
      <div>
        <p className="text-xs font-black tracking-[0.14em] uppercase text-primary">CRM NeuroAds Personalizado</p>
        <h2 className="text-2xl font-black text-text-main mt-2">Contas, contatos, pipeline e interações do Lucca</h2>
        <p className="text-sm text-text-muted mt-1">
          Modelo focado em previsibilidade comercial, com visão única entre operação e comunicação dos canais.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
        <article className="rounded-2xl border border-border bg-bg-secondary p-4">
          <p className="text-xs text-text-dim font-bold">Contas</p>
          <p className="text-2xl font-black text-text-main mt-1">{totals.accounts}</p>
        </article>
        <article className="rounded-2xl border border-border bg-bg-secondary p-4">
          <p className="text-xs text-text-dim font-bold">Contatos</p>
          <p className="text-2xl font-black text-text-main mt-1">{totals.contacts}</p>
        </article>
        <article className="rounded-2xl border border-border bg-bg-secondary p-4">
          <p className="text-xs text-text-dim font-bold">Pipeline bruto</p>
          <p className="text-2xl font-black text-text-main mt-1">{formatCurrency(totals.pipeline)}</p>
        </article>
        <article className="rounded-2xl border border-[#BDE8CF] bg-[#F2FFF7] p-4">
          <p className="text-xs text-[#0A9D57] font-bold">Forecast ponderado</p>
          <p className="text-2xl font-black text-[#0A9D57] mt-1">{formatCurrency(weightedForecast)}</p>
        </article>
      </div>

      <div className="rounded-2xl border border-border bg-bg-secondary p-4 space-y-3">
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-text-dim">
          <ListChecks size={14} /> Estágios do pipeline
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {pipelineStages.map((stage) => (
            <span key={stage} className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-3 py-1 text-xs font-bold text-text-main">
              {stage}
              <button type="button" onClick={() => removeStage(stage)} className="text-red-500">×</button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            value={newStage}
            onChange={(event) => setNewStage(event.target.value)}
            placeholder="Novo estágio"
            className="flex-1 rounded-xl border border-border bg-white px-4 py-2.5 text-sm font-semibold text-text-main outline-none focus:border-primary"
          />
          <button type="button" onClick={addStage} className="rounded-xl bg-white border border-[#DCE8FF] px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#1D4ED8]">
            Adicionar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <article className="rounded-2xl border border-border bg-bg-secondary p-4 space-y-3">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-text-dim"><Building2 size={14} /> Contas</div>
          <input value={accountForm.name} onChange={(e) => setAccountForm((p) => ({ ...p, name: e.target.value }))} placeholder="Nome da conta" className="w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm font-semibold" />
          <input value={accountForm.segment} onChange={(e) => setAccountForm((p) => ({ ...p, segment: e.target.value }))} placeholder="Segmento" className="w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm font-semibold" />
          <input value={accountForm.monthlyRevenue} onChange={(e) => setAccountForm((p) => ({ ...p, monthlyRevenue: e.target.value }))} placeholder="Faturamento mensal" type="number" className="w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm font-semibold" />
          <input value={accountForm.owner} onChange={(e) => setAccountForm((p) => ({ ...p, owner: e.target.value }))} placeholder="Responsável" className="w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm font-semibold" />
          <select value={accountForm.status} onChange={(e) => setAccountForm((p) => ({ ...p, status: e.target.value as CrmAccount['status'] }))} className="w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm font-semibold">
            <option value="Potencial">Potencial</option>
            <option value="Ativo">Ativo</option>
            <option value="Risco">Risco</option>
          </select>
          <button type="button" onClick={createAccount} className="rounded-xl bg-gradient-to-r from-[#FF6B00] to-[#FF8B2D] px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-white">Salvar conta</button>

          <div className="space-y-2">
            {accounts.map((account) => (
              <div key={account.id} className="rounded-xl border border-border bg-white p-3 text-xs">
                <p className="font-black text-text-main">{account.name}</p>
                <p className="text-text-dim">{account.segment} • {formatCurrency(account.monthlyRevenue)}</p>
                <p className="text-text-dim">Owner: {account.owner || 'Não definido'} • {account.status}</p>
                <button onClick={() => removeRecord('crm_accounts', account.id)} className="mt-2 inline-flex items-center gap-1 text-red-500 font-bold"><Trash2 size={12} />Excluir</button>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-2xl border border-border bg-bg-secondary p-4 space-y-3">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-text-dim"><CircleUserRound size={14} /> Contatos</div>
          <select value={contactForm.accountId} onChange={(e) => setContactForm((p) => ({ ...p, accountId: e.target.value }))} className="w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm font-semibold">
            <option value="">Selecione a conta</option>
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>{account.name}</option>
            ))}
          </select>
          <input value={contactForm.name} onChange={(e) => setContactForm((p) => ({ ...p, name: e.target.value }))} placeholder="Nome do contato" className="w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm font-semibold" />
          <input value={contactForm.email} onChange={(e) => setContactForm((p) => ({ ...p, email: e.target.value }))} placeholder="Email" className="w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm font-semibold" />
          <input value={contactForm.whatsapp} onChange={(e) => setContactForm((p) => ({ ...p, whatsapp: e.target.value }))} placeholder="WhatsApp" className="w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm font-semibold" />
          <input value={contactForm.role} onChange={(e) => setContactForm((p) => ({ ...p, role: e.target.value }))} placeholder="Cargo" className="w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm font-semibold" />
          <button type="button" onClick={createContact} className="rounded-xl bg-gradient-to-r from-[#0A9D57] to-[#08B760] px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-white">Salvar contato</button>

          <div className="space-y-2">
            {contacts.map((contact) => (
              <div key={contact.id} className="rounded-xl border border-border bg-white p-3 text-xs">
                <p className="font-black text-text-main">{contact.name}</p>
                <p className="text-text-dim">{getAccountName(contact.accountId)}</p>
                <p className="text-text-dim">{contact.email || 'Sem email'} • {contact.whatsapp || 'Sem WhatsApp'}</p>
                <button onClick={() => removeRecord('crm_contacts', contact.id)} className="mt-2 inline-flex items-center gap-1 text-red-500 font-bold"><Trash2 size={12} />Excluir</button>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-2xl border border-border bg-bg-secondary p-4 space-y-3">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-text-dim"><Handshake size={14} /> Negócios</div>
          <select value={dealForm.accountId} onChange={(e) => setDealForm((p) => ({ ...p, accountId: e.target.value }))} className="w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm font-semibold">
            <option value="">Selecione a conta</option>
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>{account.name}</option>
            ))}
          </select>
          <input value={dealForm.title} onChange={(e) => setDealForm((p) => ({ ...p, title: e.target.value }))} placeholder="Título do negócio" className="w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm font-semibold" />
          <input value={dealForm.amount} onChange={(e) => setDealForm((p) => ({ ...p, amount: e.target.value }))} placeholder="Valor" type="number" className="w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm font-semibold" />
          <input value={dealForm.probability} onChange={(e) => setDealForm((p) => ({ ...p, probability: e.target.value }))} placeholder="Probabilidade (%)" type="number" min="0" max="100" className="w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm font-semibold" />
          <input value={dealForm.expectedCloseDate} onChange={(e) => setDealForm((p) => ({ ...p, expectedCloseDate: e.target.value }))} type="date" className="w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm font-semibold" />
          <input value={dealForm.owner} onChange={(e) => setDealForm((p) => ({ ...p, owner: e.target.value }))} placeholder="Dono do negócio" className="w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm font-semibold" />
          <button type="button" onClick={createDeal} className="rounded-xl bg-gradient-to-r from-[#0F172A] to-[#1E293B] px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-white">Salvar negócio</button>
        </article>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-3">
        {pipelineStages.map((stage) => {
          const stageDeals = deals.filter((deal) => deal.stage === stage);
          return (
            <article key={stage} className="rounded-2xl border border-border bg-bg-secondary p-3">
              <p className="text-xs font-black text-text-main uppercase tracking-wider mb-2">{stage}</p>
              <div className="space-y-2">
                {stageDeals.map((deal) => (
                  <div key={deal.id} className="rounded-xl border border-border bg-white p-3 text-xs">
                    <p className="font-black text-text-main">{deal.title}</p>
                    <p className="text-text-dim">{getAccountName(deal.accountId)}</p>
                    <p className="text-[#0A9D57] font-bold mt-1">{formatCurrency(deal.amount)}</p>
                    <p className="text-text-dim">Prob.: {deal.probability}%</p>
                    <div className="mt-2 flex gap-1">
                      <button onClick={() => moveDeal(deal, 'prev')} className="rounded border border-border px-2 py-1 font-bold">←</button>
                      <button onClick={() => moveDeal(deal, 'next')} className="rounded border border-[#BDE8CF] bg-[#F2FFF7] px-2 py-1 font-bold text-[#0A9D57]">→</button>
                      <button onClick={() => removeRecord('crm_pipeline_deals', deal.id)} className="ml-auto text-red-500"><Trash2 size={12} /></button>
                    </div>
                  </div>
                ))}
                {stageDeals.length === 0 && <p className="text-xs text-text-dim">Sem negócios.</p>}
              </div>
            </article>
          );
        })}
      </div>

      <div className="rounded-2xl border border-border bg-bg-secondary p-4 space-y-3">
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-text-dim"><MessageSquareText size={14} /> Timeline de interações (Email/WhatsApp)</div>
        <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
          {interactions.slice(0, 80).map((interaction) => (
            <article key={interaction.id} className="rounded-xl border border-border bg-white p-3 text-xs">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-[#DCE8FF] bg-[#F5F9FF] px-2 py-0.5 font-bold text-[#1D4ED8]">{interaction.channel}</span>
                <span className="rounded-full border border-border bg-[#F8FAFC] px-2 py-0.5 font-bold text-text-dim">{interaction.front}</span>
                <span className={`rounded-full border px-2 py-0.5 font-bold ${interaction.deliveryStatus === 'sent' ? 'border-[#BDE8CF] bg-[#F2FFF7] text-[#0A9D57]' : 'border-red-200 bg-red-50 text-red-500'}`}>
                  {interaction.deliveryStatus}
                </span>
              </div>
              <p className="mt-2 font-black text-text-main">{interaction.clientName || 'Cliente sem nome'} → {interaction.to}</p>
              {interaction.subject && <p className="text-text-dim">Assunto: {interaction.subject}</p>}
              <p className="text-text-dim mt-1 line-clamp-3">{interaction.message}</p>
              <p className="mt-2 text-text-dim">{formatDate(interaction.createdAt)}</p>
            </article>
          ))}
          {interactions.length === 0 && <p className="text-sm text-text-dim">Nenhuma interação registrada ainda.</p>}
        </div>
      </div>
    </section>
  );
}