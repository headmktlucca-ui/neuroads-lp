export const HTTPS_PREFIX = 'https://';

export function normalizeHttpsMaskedUrlInput(value: string): string {
  const raw = value.replace(/\s+/g, '');
  const withoutProtocol = raw.replace(/^(?:https?:\/\/)+/i, '');
  return `${HTTPS_PREFIX}${withoutProtocol}`;
}

export function isHttpsPlaceholderOnly(value: string): boolean {
  return normalizeHttpsMaskedUrlInput(value) === HTTPS_PREFIX;
}

