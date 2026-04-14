'use server';

interface ReachContact {
  email: string;
  name?: string;
  surname?: string;
  tags?: string[];
}

export async function syncToHostingerReach(contact: ReachContact) {
  const profileId = process.env.HOSTINGER_REACH_PROFILE_ID;
  const apiKey = process.env.HOSTINGER_REACH_API_KEY;

  if (!profileId || !apiKey) {
    console.error('Hostinger Reach configuration missing');
    return { success: false, error: 'Configuração ausente' };
  }

  try {
    const response = await fetch(`https://api.hostinger.com/api/reach/v1/profiles/${profileId}/contacts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        email: contact.email,
        name: contact.name,
        note: "Adicionado via NeuroAds LP",
        tags: contact.tags || ["Usuários Ativos"]
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Hostinger Reach API Error:', errorData);
      return { success: false, error: errorData };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('Hostinger Reach Sync failed:', error);
    return { success: false, error };
  }
}
