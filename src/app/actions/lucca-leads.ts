'use server';

import {
  addDoc,
  collection,
  getDocs,
  limit,
  query,
  serverTimestamp,
  where,
} from 'firebase/firestore';
import { getFirebaseDb } from '../../lib/firebase';
import { logEvent, timed } from '../../lib/observability';

type LuccaLeadFlow = 'analise' | 'claudio' | 'mensagem_livre';

type SubmitLuccaLeadInput = {
  flow: LuccaLeadFlow;
  clientName: string;
  site?: string;
  email?: string;
  whatsapp?: string;
  message?: string;
  pageSlug?: string;
  serviceContext?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  timestamp?: string;
};

function normalize(value: string | undefined): string {
  return (value || '').trim();
}

function normalizeName(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

function normalizePhone(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (!digits) return '';
  return digits.startsWith('55') ? digits : `55${digits}`;
}

function toHttpsUrl(value: string): string {
  if (!value) return '';
  if (/^https?:\/\//i.test(value)) return value;
  return `https://${value}`;
}

function inferCompanyName(clientName: string, site: string): string {
  if (site) {
    try {
      const parsed = new URL(toHttpsUrl(site));
      return parsed.hostname.replace(/^www\./i, '');
    } catch {
      // ignore parse errors and fallback to client name
    }
  }
  return `Lead ${clientName || 'NeuroAds'}`;
}

export async function submitLuccaLeadAction(input: SubmitLuccaLeadInput) {
  const workspaceUserId = process.env.LUCCA_DEFAULT_WORKSPACE_USER_ID || '';
  if (!workspaceUserId) {
    return { success: false, error: 'LUCCA_DEFAULT_WORKSPACE_USER_ID não configurado.' };
  }

  const clientName = normalize(input.clientName);
  const site = normalize(input.site);
  const email = normalizeEmail(normalize(input.email));
  const whatsapp = normalizePhone(normalize(input.whatsapp));
  const message = normalize(input.message);
  const flow = input.flow;
  const pageSlug = normalize(input.pageSlug);
  const serviceContext = normalize(input.serviceContext);
  const utmSource = normalize(input.utmSource);
  const utmMedium = normalize(input.utmMedium);
  const utmCampaign = normalize(input.utmCampaign);
  const inboundTimestamp = normalize(input.timestamp);

  if (!clientName) {
    return { success: false, error: 'Nome do cliente é obrigatório.' };
  }
  if (!email && !whatsapp) {
    return { success: false, error: 'Informe pelo menos um canal de retorno (email ou telefone).' };
  }

  const companyName = inferCompanyName(clientName, site);
  const normalizedCompanyName = normalizeName(companyName);
  const db = getFirebaseDb();

  logEvent({
    event: 'lucca.lead.received',
    context: { flow, workspaceUserId, hasEmail: Boolean(email), hasPhone: Boolean(whatsapp) },
  });

  const accountId = await timed('lucca.account.upsert', async () => {
    let existingAccountId = '';
    const accountQuery = query(
      collection(db, 'admin_workspaces', workspaceUserId, 'crm_accounts'),
      where('normalizedName', '==', normalizedCompanyName),
      limit(1),
    );
    const accountSnapshot = await getDocs(accountQuery);
    if (!accountSnapshot.empty) {
      existingAccountId = accountSnapshot.docs[0]?.id || '';
    }

    if (existingAccountId) return existingAccountId;

    const ref = await addDoc(collection(db, 'admin_workspaces', workspaceUserId, 'crm_accounts'), {
      name: companyName,
      normalizedName: normalizedCompanyName,
      segment: 'Lead inbound',
      monthlyRevenue: 0,
      owner: 'Lucca',
      status: 'Potencial',
      source: 'Lucca Chat',
      createdBy: 'lucca-chat',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return ref.id;
  });

  await timed('lucca.contact.upsert', async () => {
    const contactsSnapshot = await getDocs(
      query(
        collection(db, 'admin_workspaces', workspaceUserId, 'crm_contacts'),
        where('accountId', '==', accountId),
        limit(50),
      ),
    );

    const alreadyExists = contactsSnapshot.docs.some((docSnapshot) => {
      const data = docSnapshot.data() as { email?: string; whatsapp?: string; name?: string };
      const existingEmail = normalizeEmail(data.email || '');
      const existingPhone = normalizePhone(data.whatsapp || '');
      const existingName = normalizeName(data.name || '');

      return (
        (email && existingEmail === email) ||
        (whatsapp && existingPhone === whatsapp) ||
        existingName === normalizeName(clientName)
      );
    });

    if (alreadyExists) return;

    await addDoc(collection(db, 'admin_workspaces', workspaceUserId, 'crm_contacts'), {
      accountId,
      name: clientName,
      normalizedName: normalizeName(clientName),
      email,
      whatsapp,
      role: 'Tomador de decisão',
      source: 'Lucca Chat',
      createdBy: 'lucca-chat',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  });

  await timed('lucca.deal.create', async () => {
    await addDoc(collection(db, 'admin_workspaces', workspaceUserId, 'crm_deals'), {
      name: clientName,
      normalizedName: normalizeName(clientName),
      company: companyName,
      stage: 'Prospect',
      estimatedValue: 0,
      source: 'Lucca Chat',
      owner: 'Lucca',
      nextAction:
        flow === 'analise'
          ? 'Executar diagnóstico inicial da empresa'
          : flow === 'claudio'
            ? 'Aguardar agendamento com especialista'
            : 'Analisar solicitação personalizada',
      createdBy: 'lucca-chat',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  });

  await timed('lucca.task.create', async () => {
    await addDoc(collection(db, 'admin_workspaces', workspaceUserId, 'executive_tasks'), {
      front: 'Comercial',
      clientName,
      title: `Lead recebido via Lucca Chat (${flow})`,
      details: [site ? `Site: ${site}` : '', email ? `Email: ${email}` : '', whatsapp ? `Telefone: ${whatsapp}` : '', message ? `Mensagem: ${message}` : '']
        .filter(Boolean)
        .join(' | '),
      channel: 'Site',
      owner: 'Lucca',
      status: 'Novo',
      priority: 'Média',
      score: 34,
      luccaSummary: 'Novo lead recebido pelo chat com encaminhamento automático para comercial.',
      slaHours: 24,
      statusHistory: [{ status: 'Novo', by: 'lucca-chat', note: 'Tarefa criada automaticamente', at: new Date().toISOString() }],
      source: 'Lucca Chat',
      pageSlug,
      serviceContext,
      utmSource,
      utmMedium,
      utmCampaign,
      inboundTimestamp,
      createdBy: 'lucca-chat',
      dueDate: '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  });

  await timed('lucca.interaction.create', async () => {
    await addDoc(collection(db, 'admin_workspaces', workspaceUserId, 'crm_interactions'), {
      clientName,
      front: 'Comercial',
      channel: 'Lucca Chat',
      to: email || whatsapp || 'não informado',
      subject: `Entrada via site - ${flow}`,
      message: message || 'Lead registrado via chat inicial do Lucca.',
      deliveryStatus: 'received',
      source: 'Lucca Chat',
      pageSlug,
      serviceContext,
      utmSource,
      utmMedium,
      utmCampaign,
      inboundTimestamp,
      createdBy: 'lucca-chat',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  });

  logEvent({ event: 'lucca.lead.persisted', context: { flow, workspaceUserId, accountId } });
  return { success: true };
}
