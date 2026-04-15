'use server';

interface ReachContact {
  email: string;
  name?: string;
  surname?: string;
  website?: string;
  phone?: string;
  tags?: string[];
}

export async function syncToHostingerReach(contact: ReachContact) {
  const apiKey = process.env.HOSTINGER_REACH_API_KEY;

  if (!apiKey) {
    console.error('Hostinger Reach: HOSTINGER_REACH_API_KEY não configurada.');
    return { success: false, error: 'Configuração ausente' };
  }

  // Nome e sobrenome separados
  const nameParts = (contact.name || '').trim().split(/\s+/);
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';

  const payload: Record<string, unknown> = {
    email: contact.email,
    first_name: firstName,
    last_name: lastName,
    ...(contact.phone ? { phone: contact.phone } : {}),
    ...(contact.website ? { website: contact.website } : {}),
    tags: contact.tags || ['NeuroAds LP'],
  };

  try {
    // URL correta da API Reach do Hostinger
    const response = await fetch('https://developers.hostinger.com/api/reach/v1/contacts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const responseText = await response.text();
    let data: unknown;
    try {
      data = JSON.parse(responseText);
    } catch {
      data = responseText;
    }

    if (!response.ok) {
      console.error(`Hostinger Reach API Error [${response.status}]:`, data);
      return { success: false, error: data };
    }

    console.log('Hostinger Reach: contato sincronizado com sucesso.', data);
    return { success: true, data };
  } catch (error) {
    console.error('Hostinger Reach: falha na requisição:', error);
    return { success: false, error: String(error) };
  }
}
