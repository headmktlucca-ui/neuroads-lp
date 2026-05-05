export const ADMIN_ALLOWED_EMAIL = 'contato.neuroads@gmail.com';

function normalizeGmailAddress(rawEmail: string): string {
  const email = rawEmail.trim().toLowerCase();
  const [localPart = '', domain = ''] = email.split('@');

  if (domain === 'gmail.com' || domain === 'googlemail.com') {
    const baseLocal = localPart.split('+')[0].replace(/\./g, '');
    return `${baseLocal}@gmail.com`;
  }

  return email;
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return normalizeGmailAddress(email) === normalizeGmailAddress(ADMIN_ALLOWED_EMAIL);
}
