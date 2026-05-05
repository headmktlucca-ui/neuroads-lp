function getWhatsAppEnv() {
  return {
    provider: (process.env.WHATSAPP_PROVIDER || 'meta_cloud').toLowerCase(),
    accessToken: process.env.WHATSAPP_META_ACCESS_TOKEN,
    phoneNumberId: process.env.WHATSAPP_META_PHONE_NUMBER_ID,
    apiVersion: process.env.WHATSAPP_META_API_VERSION || 'v21.0',
    defaultCountryCode: process.env.WHATSAPP_DEFAULT_COUNTRY_CODE || '55',
  };
}

function normalizePhone(rawPhone: string, defaultCountryCode: string): string {
  const cleaned = rawPhone.replace(/\D/g, '');
  if (!cleaned) return '';

  if (cleaned.startsWith(defaultCountryCode)) {
    return cleaned;
  }

  if (cleaned.length >= 12) return cleaned;
  return `${defaultCountryCode}${cleaned}`;
}

export async function sendWhatsAppTextMessage(to: string, body: string) {
  const env = getWhatsAppEnv();

  if (env.provider !== 'meta_cloud') {
    return { success: false, error: `Provider não suportado: ${env.provider}` };
  }

  if (!env.accessToken || !env.phoneNumberId) {
    return {
      success: false,
      error: 'Credenciais WhatsApp não configuradas. Defina WHATSAPP_META_ACCESS_TOKEN e WHATSAPP_META_PHONE_NUMBER_ID.',
    };
  }

  const normalizedTo = normalizePhone(to, env.defaultCountryCode);
  if (!normalizedTo) {
    return { success: false, error: 'Número de telefone inválido para envio WhatsApp.' };
  }

  try {
    const response = await fetch(
      `https://graph.facebook.com/${env.apiVersion}/${env.phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: normalizedTo,
          type: 'text',
          text: {
            preview_url: false,
            body,
          },
        }),
      }
    );

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      return {
        success: false,
        error: payload?.error?.message || `Falha WhatsApp: HTTP ${response.status}`,
        payload,
      };
    }

    return {
      success: true,
      messageId: payload?.messages?.[0]?.id,
      contactWaId: payload?.contacts?.[0]?.wa_id,
      payload,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro inesperado ao enviar WhatsApp.',
    };
  }
}