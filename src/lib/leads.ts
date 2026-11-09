// Sends a website enquiry to ELMS («طلبات الموقع»).
//
// Build-time configuration (Vercel / Netlify environment variables):
//   VITE_LEADS_API_URL      ELMS API base, default https://api.hensline.com/api/v1
//   VITE_WEBSITE_LEADS_KEY  the company's website key (ELMS → الإعدادات → website_leads_key)
//
// The key is public by design: it only tells ELMS which company the enquiry
// belongs to. It is not a password.

export type LeadService = 'installation' | 'maintenance' | 'modernization' | 'parts' | 'consultation';
export type LeadSource = 'quote_form' | 'configurator' | 'product_page' | 'contact_page';

export interface LeadPayload {
  name: string;
  phone: string;
  email?: string;
  city: string;
  service: LeadService;
  elevator_type?: string;
  stops?: number;
  notes?: string;
  consent: boolean;
  /** Honeypot — always empty for a real visitor. */
  website: string;
  request_id: string;
  source: LeadSource;
  configuration?: Record<string, string | number>;
}

export type LeadResult =
  | { ok: true; reference: string }
  | { ok: false; kind: 'fields'; fields: Record<string, string> }
  | { ok: false; kind: 'rate_limited' | 'unavailable' | 'network' };

const API_URL = (import.meta.env.VITE_LEADS_API_URL as string | undefined) || 'https://api.hensline.com/api/v1';
const WEBSITE_KEY = (import.meta.env.VITE_WEBSITE_LEADS_KEY as string | undefined) || '';

export const leadsConfigured = WEBSITE_KEY.length >= 16;

/** A fresh idempotency key for one form. Resent on retry so a double submit is stored once. */
export function newRequestId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  // Old browsers: RFC 4122 v4 from Math.random — fine for an idempotency key.
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

export async function submitLead(payload: LeadPayload): Promise<LeadResult> {
  if (!leadsConfigured) return { ok: false, kind: 'unavailable' };
  let response: Response;
  try {
    response = await fetch(`${API_URL}/public/website-leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Website-Key': WEBSITE_KEY },
      body: JSON.stringify({ ...payload, locale: 'ar', submission_path: window.location.pathname }),
    });
  } catch {
    return { ok: false, kind: 'network' };
  }

  if (response.ok) {
    const data = (await response.json()) as { reference: string };
    return { ok: true, reference: data.reference };
  }
  if (response.status === 429) return { ok: false, kind: 'rate_limited' };
  if (response.status === 422 || response.status === 400) {
    try {
      const data = (await response.json()) as { error?: { fields?: Record<string, string> } };
      if (data.error?.fields) return { ok: false, kind: 'fields', fields: data.error.fields };
    } catch {
      /* fall through */
    }
  }
  return { ok: false, kind: 'unavailable' };
}
