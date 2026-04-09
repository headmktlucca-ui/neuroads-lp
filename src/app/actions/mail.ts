'use server';

import { sendDiagnosisEmail as sendEmailUtil } from '../../lib/mail';

export async function sendDiagnosisEmailAction(to: string, userName: string, platform: string, diagnosisMarkdown: string) {
  return await sendEmailUtil(to, userName, platform, diagnosisMarkdown);
}
