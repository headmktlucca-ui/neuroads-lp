import { NextResponse } from 'next/server';

export type LinkedinAdsAccountOption = {
  id: string;
  name: string;
  currency: string;
  status: string;
};

function toStringValue(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { accessToken?: string };
    const accessToken = toStringValue(body?.accessToken);

    if (!accessToken) {
      return NextResponse.json({ error: 'access_token_required' }, { status: 400 });
    }

    // Buscar apenas as contas ativas (comportamento padrão do q=search na API do LinkedIn)
    // Isso evita completamente o uso do parâmetro 'search' e problemas de sintaxe Rest.li
    const endpoint = 'https://api.linkedin.com/rest/adAccounts?q=search';
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'LinkedIn-Version': '202605',
        'X-Restli-Protocol-Version': '2.0.0',
      },
      cache: 'no-store',
    });

    const payload = (await response.json()) as Record<string, unknown>;

    if (!response.ok) {
      const message = toStringValue(payload?.message || (payload?.error as Record<string, unknown>)?.message || 'Falha ao listar contas do LinkedIn Ads.');
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const rawElements = Array.isArray(payload.elements) ? payload.elements as Record<string, unknown>[] : [];
    const accounts: LinkedinAdsAccountOption[] = [];

    for (const item of rawElements) {
      const id = item.id ? String(item.id) : '';
      if (!id) continue;

      const rawStatus = toStringValue(item.status) || 'UNKNOWN';
      const servingStatuses = Array.isArray(item.servingStatuses) ? item.servingStatuses as string[] : [];
      
      const statusMap: Record<string, string> = {
        ACTIVE: 'Ativa',
        DRAFT: 'Rascunho',
        CANCELED: 'Cancelada',
        UNKNOWN: 'Desconhecido',
      };
      
      let translatedStatus = statusMap[rawStatus] || rawStatus;

      // Se a conta estiver ativa mas tiver retenções, exibe isso para o usuário
      if (rawStatus === 'ACTIVE' && servingStatuses.length > 0) {
        if (servingStatuses.includes('RESTRICTED_HOLD')) translatedStatus = 'Restrita';
        else if (servingStatuses.includes('BILLING_HOLD')) translatedStatus = 'Sem Saldo';
        else if (servingStatuses.includes('ACCOUNT_TOTAL_BUDGET_HOLD')) translatedStatus = 'Orçamento Atingido';
        else if (servingStatuses.includes('STOPPED')) translatedStatus = 'Parada';
        else if (!servingStatuses.includes('RUNNABLE')) translatedStatus = 'Retida';
      }

      const baseName = toStringValue(item.name) || `Conta ${id}`;

      accounts.push({
        id,
        name: `${baseName} (${translatedStatus})`,
        currency: toStringValue(item.currency) || '',
        status: rawStatus,
      });
    }

    return NextResponse.json({ accounts });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'linkedin_ads_accounts_failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
