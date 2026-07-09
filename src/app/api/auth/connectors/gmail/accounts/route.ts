import { NextResponse } from 'next/server';

function toStringValue(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

type GmailProfileResponse = {
  emailAddress?: string;
  messagesTotal?: number;
  error?: { message?: string };
};

/**
 * Retorna a caixa de e-mail do usuário autenticado (perfil Gmail). O Gmail é
 * 1:1 com a conta Google, então a "seleção" confirma qual caixa foi conectada.
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { accessToken?: string };
    const accessToken = toStringValue(body?.accessToken);

    if (!accessToken) {
      return NextResponse.json({ error: 'access_token_required' }, { status: 400 });
    }

    const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/profile', {
      method: 'GET',
      cache: 'no-store',
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const payload = (await response.json()) as GmailProfileResponse;

    if (!response.ok) {
      const message = toStringValue(payload?.error?.message) || 'Falha ao identificar a caixa Gmail conectada.';
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const email = toStringValue(payload.emailAddress);
    if (!email) {
      return NextResponse.json({ error: 'Nenhuma caixa Gmail encontrada para esta conta.' }, { status: 400 });
    }

    return NextResponse.json({
      accounts: [{ id: email, name: email, accountId: email }],
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'gmail_accounts_failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
