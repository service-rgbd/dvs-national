import { cookieBanner } from '@/content/cookies';

const STORAGE_KEY = 'pnigvs_cookie_consent';

export type CookieConsentChoice = 'accepted' | 'refused' | 'customized';

type CookieConsentRecord = {
  choice: CookieConsentChoice;
  expiresAt: number;
};

function retentionMs(): number {
  return cookieBanner.retentionMonths * 30 * 24 * 60 * 60 * 1000;
}

export function getCookieConsent(): CookieConsentRecord | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as CookieConsentRecord;
    if (!parsed.expiresAt || Date.now() > parsed.expiresAt) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function hasCookieConsent(): boolean {
  return getCookieConsent() !== null;
}

export function saveCookieConsent(choice: CookieConsentChoice): void {
  const record: CookieConsentRecord = {
    choice,
    expiresAt: Date.now() + retentionMs(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
}
