import { NextResponse } from 'next/server';

type BigQueryProjectRecord = {
  id: string;
  name: string;
  accountId: string;
};

function toStringValue(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

type BigQueryProjectsResponse = {
  projects?: Array<{
    id?: string;
    friendlyName?: string;
    projectReference?: { projectId?: string };
  }>;
  nextPageToken?: string;
  error?: { message?: string };
};

/**
 * Lista os projetos BigQuery acessíveis pelo usuário autenticado — o projeto é
 * a "conta" selecionável do conector warehouse.
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { accessToken?: string };
    const accessToken = toStringValue(body?.accessToken);

    if (!accessToken) {
      return NextResponse.json({ error: 'access_token_required' }, { status: 400 });
    }

    const accounts: BigQueryProjectRecord[] = [];
    const seen = new Set<string>();
    let nextPageToken = '';
    let pageGuard = 0;

    do {
      const endpoint = new URL('https://bigquery.googleapis.com/bigquery/v2/projects');
      endpoint.searchParams.set('maxResults', '200');
      if (nextPageToken) {
        endpoint.searchParams.set('pageToken', nextPageToken);
      }

      const response = await fetch(endpoint.toString(), {
        method: 'GET',
        cache: 'no-store',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const payload = (await response.json()) as BigQueryProjectsResponse;

      if (!response.ok) {
        const message = toStringValue(payload?.error?.message) || 'Falha ao listar projetos do BigQuery.';
        return NextResponse.json({ error: message }, { status: 400 });
      }

      const rows = Array.isArray(payload.projects) ? payload.projects : [];
      for (const row of rows) {
        const projectId = toStringValue(row.projectReference?.projectId) || toStringValue(row.id);
        if (!projectId || seen.has(projectId)) continue;
        seen.add(projectId);
        accounts.push({
          id: projectId,
          name: toStringValue(row.friendlyName) || projectId,
          accountId: projectId,
        });
      }

      nextPageToken = toStringValue(payload.nextPageToken);
      pageGuard += 1;
    } while (nextPageToken && pageGuard < 10);

    return NextResponse.json({ accounts });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'bigquery_projects_failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
