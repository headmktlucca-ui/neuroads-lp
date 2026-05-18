export type StripeSessionVerification = {
  id: string;
  mode: string | null;
  status: string | null;
  paymentStatus: string | null;
  kind: string | null;
  clientReferenceId: string | null;
  customerId: string | null;
  subscriptionId: string | null;
  subscriptionStatus: string | null;
  trialEndsAt: number | null;
};

type VerificationResponse = {
  ok: boolean;
  status: number;
  endpoint: string;
  data: StripeSessionVerification | null;
  error: string | null;
};

async function parseJsonSafe(response: Response): Promise<unknown | null> {
  const contentType = response.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) {
    return null;
  }

  try {
    return await response.json();
  } catch {
    return null;
  }
}

export async function verifyStripeCheckoutSession(sessionId: string): Promise<VerificationResponse> {
  const trimmed = sessionId.trim();
  if (!trimmed) {
    return {
      ok: false,
      status: 400,
      endpoint: '',
      data: null,
      error: 'sessionId vazio.',
    };
  }

  const endpoints = ['/api/stripe/verify-session', '/api/stripe/verify'];
  let fallbackError: VerificationResponse | null = null;

  for (const endpoint of endpoints) {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: trimmed }),
    });

    const payload = (await parseJsonSafe(response)) as Record<string, unknown> | null;
    const errorMessage =
      (payload && typeof payload.error === 'string' ? payload.error : null) ??
      (response.ok ? null : `Falha ao validar sessão (${response.status}).`);

    if (response.ok) {
      return {
        ok: true,
        status: response.status,
        endpoint,
        data: payload as StripeSessionVerification,
        error: null,
      };
    }

    const currentFailure: VerificationResponse = {
      ok: false,
      status: response.status,
      endpoint,
      data: null,
      error: errorMessage,
    };

    // Se a rota principal não existir, tentamos a alternativa.
    if (response.status === 404) {
      fallbackError = currentFailure;
      continue;
    }

    return currentFailure;
  }

  return (
    fallbackError ?? {
      ok: false,
      status: 500,
      endpoint: endpoints[endpoints.length - 1],
      data: null,
      error: 'Não foi possível validar sessão no Stripe.',
    }
  );
}
