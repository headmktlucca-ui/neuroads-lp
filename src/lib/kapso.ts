/**
 * Kapso Integration Helper Library for NeuroAds
 * Preferred onboarding, messaging, and webhook integration path for WhatsApp Business via Kapso.
 */

export interface KapsoConfig {
  baseUrl: string;
  apiKey: string;
  metaVersion: string;
}

export function getKapsoConfig(overrideKey?: string): KapsoConfig {
  return {
    baseUrl: (process.env.KAPSO_API_BASE_URL || 'https://api.kapso.ai').replace(/\/$/, ''),
    apiKey: overrideKey || process.env.KAPSO_API_KEY || '',
    metaVersion: process.env.META_GRAPH_VERSION || 'v24.0',
  };
}

export interface KapsoCustomer {
  id: string;
  name: string;
  external_id?: string;
  created_at?: string;
}

export interface KapsoSetupLink {
  id: string;
  url: string;
  customer_id: string;
  expires_at?: string;
}

export interface KapsoInboundMessage {
  id: string;
  from?: string;
  to?: string;
  body?: string;
  text?: { body: string };
  timestamp?: string | number;
  direction?: 'inbound' | 'outbound';
  status?: string;
  contact_name?: string;
  sender_name?: string;
}

/**
 * Creates a customer in Kapso Platform API
 */
export async function createKapsoCustomer(
  name: string,
  externalId?: string,
  overrideApiKey?: string
): Promise<{ success: boolean; customer?: KapsoCustomer; error?: string }> {
  const config = getKapsoConfig(overrideApiKey);
  if (!config.apiKey) {
    return { success: false, error: 'KAPSO_API_KEY não configurada.' };
  }

  try {
    const res = await fetch(`${config.baseUrl}/platform/v1/customers`, {
      method: 'POST',
      headers: {
        'X-API-Key': config.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customer: {
          name,
          external_id: externalId,
        },
      }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { success: false, error: data?.error?.message || data?.message || `Erro HTTP ${res.status}` };
    }

    return { success: true, customer: data.customer || data };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Erro ao criar cliente no Kapso' };
  }
}

/**
 * Generates a Kapso Setup Link for customer onboarding
 */
export async function generateKapsoSetupLink(
  customerId: string,
  options?: {
    allowedConnectionTypes?: string[];
    provisionPhoneNumber?: boolean;
    phoneNumberCountryIsos?: string[];
    redirectUrl?: string;
  },
  overrideApiKey?: string
): Promise<{ success: boolean; setupLink?: KapsoSetupLink; error?: string }> {
  const config = getKapsoConfig(overrideApiKey);
  if (!config.apiKey) {
    return { success: false, error: 'KAPSO_API_KEY não configurada.' };
  }

  try {
    const res = await fetch(`${config.baseUrl}/platform/v1/customers/${customerId}/setup_links`, {
      method: 'POST',
      headers: {
        'X-API-Key': config.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        setup_link: {
          allowed_connection_types: options?.allowedConnectionTypes || ['dedicated'],
          provision_phone_number: options?.provisionPhoneNumber ?? true,
          phone_number_country_isos: options?.phoneNumberCountryIsos || ['BR', 'US'],
          redirect_url: options?.redirectUrl,
        },
      }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { success: false, error: data?.error?.message || data?.message || `Erro HTTP ${res.status}` };
    }

    return { success: true, setupLink: data.setup_link || data };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Erro ao gerar link de setup Kapso' };
  }
}

/**
 * Sends a WhatsApp text message via Kapso Meta Proxy
 */
export async function sendKapsoTextMessage(
  phoneNumberId: string,
  to: string,
  body: string,
  overrideApiKey?: string
): Promise<{ success: boolean; messageId?: string; error?: string; payload?: unknown }> {
  const config = getKapsoConfig(overrideApiKey);
  if (!config.apiKey) {
    return { success: false, error: 'KAPSO_API_KEY não configurada.' };
  }

  if (!phoneNumberId) {
    return { success: false, error: 'phone_number_id é obrigatório para envio no Kapso.' };
  }

  // Clean phone number
  const cleanedTo = to.replace(/\D/g, '');
  const normalizedTo = cleanedTo.startsWith('55') || cleanedTo.length >= 12 ? cleanedTo : `55${cleanedTo}`;

  try {
    const url = `${config.baseUrl}/meta/whatsapp/${config.metaVersion}/${phoneNumberId}/messages`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'X-API-Key': config.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: normalizedTo,
        type: 'text',
        text: {
          preview_url: false,
          body,
        },
      }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        success: false,
        error: data?.error?.message || data?.message || `Falha Kapso WhatsApp: HTTP ${res.status}`,
        payload: data,
      };
    }

    return {
      success: true,
      messageId: data?.messages?.[0]?.id,
      payload: data,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Erro inesperado ao enviar via Kapso',
    };
  }
}

/**
 * Fetches recent messages from Kapso Inbox API
 */
export async function fetchKapsoMessages(
  phoneNumberId: string,
  overrideApiKey?: string,
  limit: number = 50
): Promise<{ success: boolean; messages: KapsoInboundMessage[]; error?: string }> {
  const config = getKapsoConfig(overrideApiKey);
  if (!config.apiKey || !phoneNumberId) {
    return { success: false, messages: [], error: 'KAPSO_API_KEY ou phone_number_id ausentes.' };
  }

  try {
    // 1. Primary: Kapso Meta Proxy messages endpoint
    const url = `${config.baseUrl}/meta/whatsapp/${config.metaVersion}/${phoneNumberId}/messages?limit=${limit}`;
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'X-API-Key': config.apiKey,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      const items = Array.isArray(data?.data) ? data.data : Array.isArray(data?.messages) ? data.messages : Array.isArray(data) ? data : [];
      return { success: true, messages: items as KapsoInboundMessage[] };
    }

    // 2. Fallback: Kapso Platform API messages endpoint
    const platformUrl = `${config.baseUrl}/platform/v1/whatsapp/phone_numbers/${phoneNumberId}/messages?limit=${limit}`;
    const resPlatform = await fetch(platformUrl, {
      method: 'GET',
      headers: {
        'X-API-Key': config.apiKey,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    const dataPlatform = await resPlatform.json().catch(() => ({}));
    if (resPlatform.ok) {
      const items = Array.isArray(dataPlatform?.data) ? dataPlatform.data : Array.isArray(dataPlatform?.messages) ? dataPlatform.messages : Array.isArray(dataPlatform) ? dataPlatform : [];
      return { success: true, messages: items as KapsoInboundMessage[] };
    }

    return {
      success: false,
      messages: [],
      error: data?.error?.message || dataPlatform?.error?.message || `Erro HTTP ${res.status}`,
    };
  } catch (err) {
    return {
      success: false,
      messages: [],
      error: err instanceof Error ? err.message : 'Erro ao buscar mensagens Kapso',
    };
  }
}
