import { NextResponse } from 'next/server';

type CalendarRecord = {
  id: string;
  name: string;
  accountId: string;
};

function toStringValue(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

type CalendarListResponse = {
  items?: Array<{
    id?: string;
    summary?: string;
    primary?: boolean;
    accessRole?: string;
  }>;
  nextPageToken?: string;
  error?: { message?: string };
};

/** Lista as agendas do Google Calendar acessíveis pelo usuário autenticado. */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { accessToken?: string };
    const accessToken = toStringValue(body?.accessToken);

    if (!accessToken) {
      return NextResponse.json({ error: 'access_token_required' }, { status: 400 });
    }

    const accounts: CalendarRecord[] = [];
    const seen = new Set<string>();
    let nextPageToken = '';
    let pageGuard = 0;

    do {
      const endpoint = new URL('https://www.googleapis.com/calendar/v3/users/me/calendarList');
      endpoint.searchParams.set('maxResults', '100');
      endpoint.searchParams.set('minAccessRole', 'writer');
      if (nextPageToken) {
        endpoint.searchParams.set('pageToken', nextPageToken);
      }

      const response = await fetch(endpoint.toString(), {
        method: 'GET',
        cache: 'no-store',
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const payload = (await response.json()) as CalendarListResponse;

      if (!response.ok) {
        const message = toStringValue(payload?.error?.message) || 'Falha ao listar agendas do Google Calendar.';
        return NextResponse.json({ error: message }, { status: 400 });
      }

      const rows = Array.isArray(payload.items) ? payload.items : [];
      for (const row of rows) {
        const id = toStringValue(row.id);
        if (!id || seen.has(id)) continue;
        seen.add(id);
        const name = toStringValue(row.summary) || id;
        accounts.push({
          id,
          name: row.primary ? `${name} (principal)` : name,
          accountId: id,
        });
      }

      nextPageToken = toStringValue(payload.nextPageToken);
      pageGuard += 1;
    } while (nextPageToken && pageGuard < 10);

    // Agenda principal primeiro
    accounts.sort((a, b) => Number(b.name.includes('(principal)')) - Number(a.name.includes('(principal)')));

    return NextResponse.json({ accounts });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'google_calendar_accounts_failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
