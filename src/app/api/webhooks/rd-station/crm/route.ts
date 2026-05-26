import { NextRequest, NextResponse } from 'next/server';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { getFirebaseDb } from '../../../../../lib/firebase';

function readBearerToken(value: string | null): string {
  if (!value) return '';
  const trimmed = value.trim();
  if (!trimmed) return '';
  if (trimmed.toLowerCase().startsWith('bearer ')) {
    return trimmed.slice(7).trim();
  }
  return trimmed;
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    provider: 'rd-station-crm',
    mode: 'webhook',
  });
}

export async function POST(request: NextRequest) {
  const verifyToken = process.env.RD_CRM_WEBHOOK_VERIFY_TOKEN?.trim();
  const providedToken =
    readBearerToken(request.headers.get('authorization')) ||
    request.headers.get('x-rd-webhook-token')?.trim() ||
    '';

  if (verifyToken && providedToken !== verifyToken) {
    return NextResponse.json({ ok: false, error: 'Unauthorized webhook token.' }, { status: 401 });
  }

  const payload = await request.json().catch(() => null);
  if (!payload || typeof payload !== 'object') {
    return NextResponse.json({ ok: false, error: 'Payload inválido.' }, { status: 400 });
  }

  try {
    const db = getFirebaseDb();
    await addDoc(collection(db, 'integration_webhook_events'), {
      source: 'rd_station_crm',
      receivedAt: serverTimestamp(),
      headers: {
        userAgent: request.headers.get('user-agent') || '',
        contentType: request.headers.get('content-type') || '',
      },
      payload,
    });
  } catch (error) {
    console.error('Falha ao salvar webhook RD Station CRM:', error);
    return NextResponse.json({ ok: false, error: 'Falha ao registrar webhook.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
