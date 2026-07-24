import { NextResponse } from 'next/server';

function toStringValue(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

type GoogleUserInfoResponse = {
  sub?: string;
  email?: string;
  name?: string;
  error?: string;
  error_description?: string;
};

/**
 * Retorna a caixa de e-mail do usuário autenticado (identidade Google). O Gmail é
 * 1:1 com a conta Google, então a "seleção" confirma qual caixa foi conectada.
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { accessToken?: string };
    const accessToken = toStringValue(body?.accessToken);

    if (!accessToken) {
      return NextResponse.json({ error: 'access_token_required' }, { status: 400 });
    }

    const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      method: 'GET',
      cache: 'no-store',
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const payload = (await response.json()) as GoogleUserInfoResponse;

    if (!response.ok) {
      const message = toStringValue(payload?.error_description || payload?.error) || 'Falha ao identificar a conta Google conectada.';
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const email = toStringValue(payload.email);
    if (!email) {
      return NextResponse.json({ error: 'Nenhum e-mail encontrado para esta conta.' }, { status: 400 });
    }

    return NextResponse.json({
      accounts: [{ id: email, name: email, accountId: email }],
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'gmail_accounts_failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
