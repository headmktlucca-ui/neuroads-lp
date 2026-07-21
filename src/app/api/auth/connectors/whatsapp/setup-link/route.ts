import { NextResponse } from 'next/server';
import { createKapsoCustomer, generateKapsoSetupLink } from '@/lib/kapso';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { name = 'Cliente NeuroAds', externalId, apiKey } = body || {};

    // 1. Create Customer in Kapso
    const customerRes = await createKapsoCustomer(name, externalId, apiKey);
    if (!customerRes.success || !customerRes.customer?.id) {
      return NextResponse.json(
        { error: customerRes.error || 'Falha ao criar cliente no Kapso.' },
        { status: 400 }
      );
    }

    // 2. Generate Setup Link for Customer
    const setupRes = await generateKapsoSetupLink(
      customerRes.customer.id,
      {
        allowedConnectionTypes: ['dedicated'],
        provisionPhoneNumber: true,
        phoneNumberCountryIsos: ['BR', 'US'],
      },
      apiKey
    );

    if (!setupRes.success || !setupRes.setupLink?.url) {
      return NextResponse.json(
        { error: setupRes.error || 'Falha ao gerar link de setup Kapso.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      url: setupRes.setupLink.url,
      customerId: customerRes.customer.id,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro interno Kapso setup';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
