import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, source } = body || {};

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const API_URL = process.env.HOSTINGER_REACH_API_URL;
    const API_KEY = process.env.HOSTINGER_REACH_API_KEY;
    const PROFILE_ID = process.env.HOSTINGER_REACH_PROFILE_ID;

    if (!API_URL || !API_KEY) {
      return NextResponse.json({ error: 'Hostinger Reach not configured' }, { status: 500 });
    }

    // Prepare payload according to Hostinger Reach API expectations.
    const payload = {
      email,
      first_name: name || undefined,
      tags: [source || 'newsletter'],
      opt_in: true,
      profile_id: PROFILE_ID || undefined,
    };

    const resp = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    if (!resp.ok) {
      const text = await resp.text();
      return NextResponse.json({ error: text || 'Upstream error' }, { status: 502 });
    }

    const data = await resp.json();
    return NextResponse.json({ ok: true, data });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
