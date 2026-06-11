import { NextResponse } from 'next/server';

export type LinkedinPageOption = {
  id: string;
  name: string;
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

    // Remover filtro de role=ADMINISTRATOR para pegar todas as páginas
    // Usar projection para trazer o localizedName já na primeira requisição (evita o segundo request)
    const endpoint = new URL('https://api.linkedin.com/v2/organizationAcls?q=roleAssignee&state=APPROVED&projection=(elements*(organization~(localizedName)))');
    const response = await fetch(endpoint.toString(), {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'X-Restli-Protocol-Version': '2.0.0',
      },
      cache: 'no-store',
    });

    const payload = (await response.json()) as Record<string, unknown>;

    if (!response.ok) {
      const message = toStringValue(payload?.message || (payload?.error as Record<string, unknown>)?.message || 'Falha ao listar páginas do LinkedIn.');
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const rawElements = Array.isArray(payload.elements) ? payload.elements as Record<string, unknown>[] : [];
    const accounts: LinkedinPageOption[] = [];

    for (const item of rawElements) {
      const urn = toStringValue(item.organization);
      if (urn && urn.startsWith('urn:li:organization:')) {
        const id = urn.replace('urn:li:organization:', '');
        if (id) {
          // A propriedade decorada 'organization~' contém o objeto da organização
          const orgDetails = item['organization~'] as Record<string, unknown> | undefined;
          let name = `Página ${id}`;
          
          if (orgDetails && orgDetails.localizedName) {
            name = toStringValue(orgDetails.localizedName);
          }
          
          accounts.push({ id, name });
        }
      }
    }

    return NextResponse.json({ accounts });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'linkedin_page_accounts_failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
