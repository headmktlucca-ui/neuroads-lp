import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '../../../../../lib/firebase-admin';
import { getAuth } from 'firebase-admin/auth';

// The target user who receives all Diagnostic leads
const TARGET_EMAIL = 'avante@neuroads.com.br';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, company, website, segment } = body;

    if (!name || !email) {
      return NextResponse.json({ error: 'name and email are required' }, { status: 400 });
    }

    // 1. Find UID for avante@neuroads.com.br via Firebase Admin Auth
    let targetUid: string;
    try {
      const userRecord = await getAuth().getUserByEmail(TARGET_EMAIL);
      targetUid = userRecord.uid;
    } catch (authErr) {
      console.error('[capture-lead] User not found:', TARGET_EMAIL, authErr);
      return NextResponse.json({ error: 'Target user not found' }, { status: 404 });
    }

    // 2. Load existing leads from Firestore
    const db = getAdminDb();
    const docRef = db.collection('users').doc(targetUid).collection('leads_funil').doc('main');
    const snap = await docRef.get();

    let leads: any[] = [];
    if (snap.exists && Array.isArray(snap.data()?.leads)) {
      leads = snap.data()!.leads;
    }

    // 3. Deduplicate by email (case-insensitive)
    const alreadyExists = leads.some(
      (l: any) => l.email && l.email.toLowerCase() === email.toLowerCase()
    );

    if (alreadyExists) {
      return NextResponse.json({ success: true, skipped: true, reason: 'duplicate_email' });
    }

    // 4. Build new lead object matching the Lead interface in funil-vendas
    const newLead = {
      id: `lead-diag-${Date.now()}`,
      name,
      company: company || 'Empresa (Diagnóstico)',
      value: 9800,
      email,
      phone: '',
      stage: 'capturado',
      originAgent: 'LAÍS (Diagnóstico Estratégico)',
      originAgentCor: '#FF6A00',
      statusText: `Capturado via Diagnóstico Estratégico. Site: ${website || 'Não informado'} | Empresa: ${company || '-'}`,
      history: [
        {
          timestamp: Date.now(),
          agentName: 'LAÍS (Diagnóstico Estratégico)',
          agentCor: '#FF6A00',
          message: `Lead cadastrado via Diagnóstico Estratégico. Empresa: ${company || '-'}, Site: ${website || '-'}, Segmento: ${segment || 'Geral'}, E-mail: ${email}`,
        },
      ],
      createdAt: Date.now(),
    };

    // 5. Prepend and save
    const updatedLeads = [newLead, ...leads];
    await docRef.set({ leads: updatedLeads }, { merge: true });

    console.log(`[capture-lead] Lead saved for ${TARGET_EMAIL}: ${name} <${email}>`);
    return NextResponse.json({ success: true, leadId: newLead.id });
  } catch (err: any) {
    console.error('[capture-lead] Error:', err);
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}
