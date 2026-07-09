import { NextResponse } from 'next/server';

type WhatsappNumberRecord = {
  id: string;
  name: string;
  accountId: string;
};

function toStringValue(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

const GRAPH = 'https://graph.facebook.com/v23.0';

async function graphGet(path: string, accessToken: string, fields: string): Promise<Record<string, unknown>> {
  const endpoint = new URL(`${GRAPH}/${path}`);
  endpoint.searchParams.set('fields', fields);
  endpoint.searchParams.set('limit', '50');
  endpoint.searchParams.set('access_token', accessToken);
  const response = await fetch(endpoint.toString(), { method: 'GET', cache: 'no-store' });
  return (await response.json()) as Record<string, unknown>;
}

function readGraphError(payload: Record<string, unknown>): string {
  const err = payload.error;
  if (err && typeof err === 'object') {
    const message = (err as { message?: unknown }).message;
    if (typeof message === 'string' && message.trim()) return message;
  }
  return '';
}

/**
 * Lista os números de telefone do WhatsApp Business (Cloud API) acessíveis pelo
 * usuário autenticado: businesses → WABAs → phone numbers.
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { accessToken?: string };
    const accessToken = toStringValue(body?.accessToken);

    if (!accessToken) {
      return NextResponse.json({ error: 'access_token_required' }, { status: 400 });
    }

    // 1. Businesses do usuário
    const bizPayload = await graphGet('me/businesses', accessToken, 'id,name');
    const bizError = readGraphError(bizPayload);
    if (bizError) {
      return NextResponse.json({ error: bizError }, { status: 400 });
    }
    const businesses = Array.isArray(bizPayload.data) ? (bizPayload.data as Record<string, unknown>[]) : [];

    const accounts: WhatsappNumberRecord[] = [];
    const seen = new Set<string>();

    // 2. WABAs de cada business (próprias e de clientes) → 3. números de cada WABA
    for (const biz of businesses.slice(0, 25)) {
      const bizId = toStringValue(biz.id);
      if (!bizId) continue;

      for (const edge of ['owned_whatsapp_business_accounts', 'client_whatsapp_business_accounts']) {
        const wabaPayload = await graphGet(`${bizId}/${edge}`, accessToken, 'id,name');
        if (readGraphError(wabaPayload)) continue;
        const wabas = Array.isArray(wabaPayload.data) ? (wabaPayload.data as Record<string, unknown>[]) : [];

        for (const waba of wabas.slice(0, 25)) {
          const wabaId = toStringValue(waba.id);
          if (!wabaId) continue;
          const wabaName = toStringValue(waba.name);

          const phonePayload = await graphGet(
            `${wabaId}/phone_numbers`,
            accessToken,
            'id,display_phone_number,verified_name,quality_rating'
          );
          if (readGraphError(phonePayload)) continue;
          const phones = Array.isArray(phonePayload.data) ? (phonePayload.data as Record<string, unknown>[]) : [];

          for (const phone of phones) {
            const phoneId = toStringValue(phone.id);
            if (!phoneId || seen.has(phoneId)) continue;
            seen.add(phoneId);
            const display = toStringValue(phone.display_phone_number);
            const verifiedName = toStringValue(phone.verified_name) || wabaName;
            accounts.push({
              id: phoneId,
              name: display ? `${verifiedName} (${display})` : verifiedName || phoneId,
              accountId: phoneId,
            });
          }
        }
      }
    }

    return NextResponse.json({ accounts });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'whatsapp_accounts_failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
