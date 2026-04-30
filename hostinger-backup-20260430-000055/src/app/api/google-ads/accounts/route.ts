import { NextResponse } from 'next/server';

/**
 * Server-side proxy for Google Ads API.
 * Uses a proper Bearer token from the Authorization Code flow.
 * Prevents CORS issues and hides the developer-token from the client.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const accessToken = searchParams.get('access_token');
  
  if (!accessToken) {
    return NextResponse.json({ error: 'access_token é obrigatório.' }, { status: 400 });
  }

  const developerToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN;
  if (!developerToken) {
    return NextResponse.json(
      { error: 'GOOGLE_ADS_DEVELOPER_TOKEN não configurado.' },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(
      'https://googleads.googleapis.com/v17/customers:listAccessibleCustomers',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'developer-token': developerToken,
        },
      }
    );

    const rawText = await response.text();

    if (!response.ok) {
      let errorData: any = {};
      try { errorData = JSON.parse(rawText); } catch { errorData = { raw: rawText }; }
      
      console.error('Google Ads API error:', errorData);
      return NextResponse.json(
        { error: errorData?.error?.message || 'Erro ao listar contas.', details: errorData },
        { status: response.status }
      );
    }

    const data = JSON.parse(rawText);
    return NextResponse.json(data);
  } catch (err: any) {
    console.error('Proxy listAccounts error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
