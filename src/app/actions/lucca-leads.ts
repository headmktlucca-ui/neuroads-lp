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

type HubSpotSearchResponse = {
  results?: Array<{
    id?: string;
  }>;
};

type HubSpotPipelinesResponse = {
  results?: Array<{
    id?: string;
    label?: string;
    stages?: Array<{
      id?: string;
      label?: string;
    }>;
  }>;
};

type HubSpotStageResolution = {
  pipelineId: string;
  stageId: string;
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

function normalizeForLookup(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function splitClientName(clientName: string): { firstName: string; lastName: string } {
  const parts = clientName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: '', lastName: '' };
  if (parts.length === 1) return { firstName: parts[0], lastName: '' };
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(' '),
  };
}

function getHubSpotAccessToken(): string {
  return (
    process.env.HUBSPOT_PRIVATE_APP_TOKEN?.trim() ||
    process.env.HUBSPOT_ACCESS_TOKEN?.trim() ||
    ''
  );
}

async function hubspotRequest<T>(token: string, path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`https://api.hubapi.com${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    const raw = await response.text();
    throw new Error(`HubSpot API ${response.status}: ${raw || 'erro sem detalhes'}`);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return (await response.json()) as T;
}

async function findExistingHubSpotContactId(args: {
  token: string;
  email: string;
  whatsapp: string;
}): Promise<string | null> {
  const { token, email, whatsapp } = args;
  const filters: Array<{ propertyName: string; operator: 'EQ'; value: string }> = [];
  if (email) {
    filters.push({ propertyName: 'email', operator: 'EQ', value: email });
  }
  if (whatsapp) {
    filters.push({ propertyName: 'phone', operator: 'EQ', value: whatsapp });
  }

  for (const filter of filters) {
    const payload = await hubspotRequest<HubSpotSearchResponse>(
      token,
      '/crm/v3/objects/contacts/search',
      {
        method: 'POST',
        body: JSON.stringify({
          filterGroups: [{ filters: [filter] }],
          properties: ['email', 'phone'],
          limit: 1,
        }),
      },
    );
    const firstId = payload.results?.[0]?.id?.trim();
    if (firstId) return firstId;
  }

  return null;
}

async function resolveHubSpotDiagnosticStage(args: {
  token: string;
  configuredPipelineId: string;
  configuredStageId: string;
}): Promise<HubSpotStageResolution> {
  const { token, configuredPipelineId, configuredStageId } = args;
  if (configuredPipelineId && configuredStageId) {
    return { pipelineId: configuredPipelineId, stageId: configuredStageId };
  }

  const targetStageLabel = 'solicitacao de diagnostico';
  const payload = await hubspotRequest<HubSpotPipelinesResponse>(
    token,
    '/crm/v3/pipelines/deals',
  );

  for (const pipeline of payload.results || []) {
    if (!pipeline?.id) continue;
    if (configuredPipelineId && pipeline.id !== configuredPipelineId) continue;
    for (const stage of pipeline.stages || []) {
      if (!stage?.id || !stage?.label) continue;
      if (normalizeForLookup(stage.label) === targetStageLabel) {
        return { pipelineId: pipeline.id, stageId: stage.id };
      }
    }
  }

  const pipelineHint = configuredPipelineId
    ? ` no pipeline ${configuredPipelineId}`
    : '';
  throw new Error(
    `Etapa "Solicitação de Diagnóstico" não encontrada${pipelineHint} no HubSpot. Configure HUBSPOT_DIAGNOSTICO_DEAL_STAGE_ID e HUBSPOT_DEAL_PIPELINE_ID.`,
  );
}

async function syncLeadToHubSpot(args: {
  clientName: string;
  email: string;
  whatsapp: string;
  companySite: string;
}): Promise<void> {
  const token = getHubSpotAccessToken();
  if (!token) {
    throw new Error(
      'Integração HubSpot não configurada. Defina HUBSPOT_PRIVATE_APP_TOKEN (ou HUBSPOT_ACCESS_TOKEN).',
    );
  }

  const siteWithProtocol = toHttpsUrl(args.companySite);
  const { firstName, lastName } = splitClientName(args.clientName);
  const existingContactId = await findExistingHubSpotContactId({
    token,
    email: args.email,
    whatsapp: args.whatsapp,
  });

  const contactProperties: Record<string, string> = {};
  if (args.email) contactProperties.email = args.email;
  if (firstName) contactProperties.firstname = firstName;
  if (lastName) contactProperties.lastname = lastName;
  if (args.whatsapp) contactProperties.phone = args.whatsapp;
  if (siteWithProtocol) contactProperties.website = siteWithProtocol;

  let contactId = existingContactId;
  if (contactId) {
    await hubspotRequest(token, `/crm/v3/objects/contacts/${contactId}`, {
      method: 'PATCH',
      body: JSON.stringify({ properties: contactProperties }),
    });
  } else {
    const createdContact = await hubspotRequest<{ id?: string }>(
      token,
      '/crm/v3/objects/contacts',
      {
        method: 'POST',
        body: JSON.stringify({ properties: contactProperties }),
      },
    );
    contactId = createdContact.id?.trim() || '';
  }

  if (!contactId) {
    throw new Error('Não foi possível determinar o ID do contato no HubSpot.');
  }

  const stage = await resolveHubSpotDiagnosticStage({
    token,
    configuredPipelineId: process.env.HUBSPOT_DEAL_PIPELINE_ID?.trim() || '',
    configuredStageId: process.env.HUBSPOT_DIAGNOSTICO_DEAL_STAGE_ID?.trim() || '',
  });

  const diagnosticNote = `SOLICITAÇÃO DE DIAGNÓSTICO\nSite ${siteWithProtocol}`;
  const dealName = `Solicitação de Diagnóstico - ${args.clientName}`;
  const createdDeal = await hubspotRequest<{ id?: string }>(token, '/crm/v3/objects/deals', {
    method: 'POST',
    body: JSON.stringify({
      properties: {
        dealname: dealName,
        pipeline: stage.pipelineId,
        dealstage: stage.stageId,
        description: diagnosticNote,
      },
    }),
  });

  const dealId = createdDeal.id?.trim() || '';
  if (!dealId) {
    throw new Error('Negócio criado no HubSpot sem ID de retorno.');
  }

  await hubspotRequest(
    token,
    `/crm/v4/objects/deals/${dealId}/associations/default/contacts/${contactId}`,
    { method: 'PUT' },
  );

  await hubspotRequest(token, '/crm/v3/objects/notes', {
    method: 'POST',
    body: JSON.stringify({
      properties: {
        hs_note_body: diagnosticNote,
      },
      associations: [
        {
          to: { id: dealId },
          types: [{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId: 214 }],
        },
      ],
    }),
  });
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

  if (!site) {
    return { success: false, error: 'Site da empresa é obrigatório para solicitar o diagnóstico.' };
  }

  const companyName = inferCompanyName(clientName, site);
  const normalizedCompanyName = normalizeName(companyName);
  const db = getFirebaseDb();

  try {
    await timed('lucca.hubspot.sync', async () => {
      await syncLeadToHubSpot({
        clientName,
        email,
        whatsapp,
        companySite: site,
      });
    });
    logEvent({
      event: 'lucca.hubspot.sync.success',
      context: {
        flow,
        pageSlug,
        serviceContext,
      },
    });
  } catch (hubspotError) {
    const message =
      hubspotError instanceof Error
        ? hubspotError.message
        : 'Falha inesperada ao sincronizar lead no HubSpot.';

    logEvent({
      event: 'lucca.hubspot.sync.error',
      context: {
        flow,
        pageSlug,
        serviceContext,
        message,
      },
    });

    return {
      success: false,
      error: `Não consegui registrar no HubSpot agora. ${message}`,
    };
  }

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
