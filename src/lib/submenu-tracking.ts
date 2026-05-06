'use client';

export type SubmenuEventName =
  | 'submenu_page_view'
  | 'submenu_cta_lucca_click'
  | 'submenu_form_start'
  | 'submenu_form_submit'
  | 'submenu_form_success'
  | 'submenu_remotion_play_25'
  | 'submenu_remotion_play_50'
  | 'submenu_remotion_play_75'
  | 'submenu_remotion_play_100'
  | 'submenu_scroll_50'
  | 'submenu_scroll_90';

type EventPayload = Record<string, string | number | boolean | null | undefined>;

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
    gtag?: (command: string, eventName: string, params?: Record<string, unknown>) => void;
    fbq?: (command: string, eventName: string, params?: Record<string, unknown>) => void;
  }
}

function safeNowIso() {
  try {
    return new Date().toISOString();
  } catch {
    return '';
  }
}

export function trackSubmenuEvent(eventName: SubmenuEventName, payload: EventPayload = {}) {
  if (typeof window === 'undefined') return;

  const eventPayload = {
    event: eventName,
    event_name: eventName,
    timestamp: safeNowIso(),
    ...payload,
  };

  if (Array.isArray(window.dataLayer)) {
    window.dataLayer.push(eventPayload);
  }

  if (typeof window.gtag === 'function') {
    window.gtag('event', eventName, payload);
  }

  if (typeof window.fbq === 'function') {
    window.fbq('trackCustom', eventName, payload);
  }
}

