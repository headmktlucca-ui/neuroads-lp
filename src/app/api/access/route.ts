import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { name, email, company } = await request.json();
    
    console.log(`[ACCESS REQUEST] Send to: avante@neuroads.com.br`);
    console.log(`Name: ${name}`);
    console.log(`Email: ${email}`);
    console.log(`Company: ${company}`);
    
    // SImulate success
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Internal Error' }, { status: 500 });
  }
}
