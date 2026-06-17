'use server';

import { submitLuccaLeadAction } from './lucca-leads';

type SendPresentationInput = {
  email: string;
  url: string;
  clientName: string;
  historyContext: string;
};

export async function sendPersonalizedPresentationAction(input: SendPresentationInput) {
  try {
    console.log(`[EMAIL MOCK] Sending personalized presentation to ${input.email} for URL: ${input.url}`);
    
    // Save lead data using the existing CRM lead capture logic
    await submitLuccaLeadAction({
      flow: 'presentation_request',
      clientName: input.clientName || 'Lead Sem Nome',
      email: input.email,
      site: input.url,
      message: `Solicitação de apresentação personalizada baseada no contexto: ${input.historyContext}`
    });

    // In a real scenario, integrate with Resend, SendGrid, etc. here
    // Example: await resend.emails.send({ to: input.email, subject: 'Sua Apresentação', react: <Template /> });

    return { success: true };
  } catch (error: any) {
    console.error('Failed to send presentation:', error);
    return { success: false, error: error.message };
  }
}
