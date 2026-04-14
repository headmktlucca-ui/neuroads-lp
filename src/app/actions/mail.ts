'use server';

import { 
  sendDiagnosisEmail as sendEmailUtil, 
  sendStrategyRequestEmail as sendStrategyUtil 
} from '../../lib/mail';

export async function sendDiagnosisEmailAction(to: string, userName: string, platform: string, diagnosisMarkdown: string) {
  return await sendEmailUtil(to, userName, platform, diagnosisMarkdown);
}

export async function sendStrategyRequestAction(to: string, userName: string, userEmail: string, selectedAgents: string[]) {
  return await sendStrategyUtil(to, userName, userEmail, selectedAgents);
}
