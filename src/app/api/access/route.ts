import { NextResponse } from 'next/server';
import { sendDemoRequestEmail } from '../../../lib/mail';

export async function POST(request: Request) {
  try {
    const { name, email, company } = await request.json();

    if (!name || !email) {
      return NextResponse.json(
        { success: false, error: 'Nome e e-mail são obrigatórios' },
        { status: 400 }
      );
    }

    const mailResult = await sendDemoRequestEmail({ name, email, company });

    if (!mailResult.success) {
      console.error('[ACCESS REQUEST ERROR]:', mailResult.error);
    }

    return NextResponse.json({ success: true, result: mailResult });
  } catch (error) {
    console.error('[ACCESS REQUEST EXCEPTION]:', error);
    return NextResponse.json({ success: false, error: 'Erro interno no servidor' }, { status: 500 });
  }
}
