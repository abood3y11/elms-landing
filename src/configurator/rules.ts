import { companyWhatsapp } from '../site';
import {
  type CategoryKey, cityNames, findOption, optionsByCategory, presets, regions, STOPS_MAX, STOPS_MIN, summaryOrder, categoryLabels, elevatorTypes, services,
} from './catalog';

export type Design = Record<CategoryKey, string>;

export type ConfigState = {
  region: string;
  city: string;
  cityOther: string;
  type: string;
  stops: number;
  design: Design;
};

export const defaultDesign: Design = {
  wall: 'W-02', trim: 'silver', floor: 'F-04', ceiling: 'CL-01', mirror: 'half', handrail: 'back', rail: 'round',
  doorfinish: 'silver-satin', door: 'center', entrance: 'single', panel: 'classic', panelSide: 'right', light: 'warm',
};

export const initialState: ConfigState = { region: '', city: '', cityOther: '', type: 'home', stops: 3, design: defaultDesign };

/** Why an option cannot be picked right now, or null when it can. Conflicting
 *  options are shown disabled with this reason, never hidden. */
export function disabledReason(design: Design, category: CategoryKey, id: string): string | null {
  if (category === 'mirror' && id !== 'none' && design.entrance === 'through') return 'الجدار الخلفي باب في المدخلين المتقابلين.';
  if (category === 'handrail') {
    if (id === 'back' && design.entrance === 'through') return 'لا يوجد جدار خلفي مع المدخلين المتقابلين.';
    if (id === 'right' && design.entrance === 'side-right') return 'الجدار الأيمن فيه باب.';
    if (id === 'left' && design.entrance === 'side-left') return 'الجدار الأيسر فيه باب.';
  }
  return null;
}

/** Apply one choice and the automatic follow-ups that keep the cabin physically possible. */
export function choose(design: Design, category: CategoryKey, id: string): Design {
  if (disabledReason(design, category, id)) return design;
  const next: Design = { ...design, [category]: id };
  // A full-height mirror leaves no wall for a rail behind it.
  if (category === 'mirror' && (id === 'full' || id === 'smoked') && next.handrail === 'back') next.handrail = 'none';
  if (category === 'entrance') {
    if (id === 'through') {
      next.mirror = 'none';
      if (next.handrail === 'back') next.handrail = 'right';
    }
    if (id === 'side-right' && next.handrail === 'right') next.handrail = 'back';
    if (id === 'side-left' && next.handrail === 'left') next.handrail = 'back';
  }
  return next;
}

export function applyPreset(design: Design, presetId: string): Design {
  const preset = presets.find((item) => item.id === presetId);
  if (!preset) return design;
  let next = design;
  for (const [key, value] of Object.entries(preset.values) as [CategoryKey, string][]) next = choose(next, key, value);
  return next;
}

/** Any id that is not in the catalog (old share link, removed option) falls back to the default, then to the first option. */
export function sanitizeDesign(raw: Partial<Record<string, unknown>>): Design {
  let next: Design = { ...defaultDesign };
  for (const key of summaryOrder) {
    const value = raw[key];
    if (typeof value === 'string' && findOption(key, value)) next = choose(next, key, value);
    else if (!findOption(key, next[key])) next = { ...next, [key]: optionsByCategory[key][0].id };
  }
  return next;
}

export function clampStops(value: number): number {
  return Math.min(STOPS_MAX, Math.max(STOPS_MIN, Math.round(value) || STOPS_MIN));
}

export function locationError(state: ConfigState): { field: 'region' | 'city'; message: string } | null {
  if (!state.region) return { field: 'region', message: 'اختر منطقة مشروعك أولًا.' };
  if (!state.city || (state.city === 'Other' && !state.cityOther.trim())) return { field: 'city', message: 'اختر مدينة المشروع أو اكتب اسمها.' };
  return null;
}

export function regionLabel(state: ConfigState): string {
  return regions.find((item) => item.id === state.region)?.ar ?? '';
}

export function cityLabel(state: ConfigState): string {
  if (state.city === 'Other') return state.cityOther.trim();
  return cityNames[state.city] ?? state.city;
}

export function summaryLines(design: Design): { category: CategoryKey; label: string; value: string }[] {
  return summaryOrder.map((category) => {
    const option = findOption(category, design[category]);
    const code = option && 'code' in option ? ` (${String((option as { code: string }).code)})` : '';
    return { category, label: categoryLabels[category], value: `${option?.ar ?? design[category]}${code}` };
  });
}

// ---------- quote request ----------

export type ContactForm = { name: string; phone: string; email: string; service: string; notes: string; consent: boolean; website: string };

export const emptyContact: ContactForm = { name: '', phone: '', email: '', service: 'supply_install', notes: '', consent: false, website: '' };

export const PHONE_RE = /^(?:\+?966|0)?5[0-9]{8}$/;

export function normalizePhone(value: string): string {
  return value.replace(/[\s-]/g, '').replace(/[٠-٩]/g, (digit) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit)));
}

export function contactErrors(form: ContactForm): Partial<Record<keyof ContactForm, string>> {
  const errors: Partial<Record<keyof ContactForm, string>> = {};
  const name = form.name.trim();
  if (name.length < 2 || name.length > 120) errors.name = 'اكتب اسمك (حرفان على الأقل).';
  if (!PHONE_RE.test(normalizePhone(form.phone))) errors.phone = 'اكتب رقم جوال سعودي مثل 05xxxxxxxx.';
  if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) errors.email = 'راجع عنوان البريد الإلكتروني.';
  if (form.notes.length > 3000) errors.notes = 'التفاصيل أطول من 3000 حرف.';
  if (!form.consent) errors.consent = 'وافِق على سياسة الخصوصية لإرسال الطلب.';
  return errors;
}

/** The body POSTed to the quote endpoint. This is the contract the ELMS backend endpoint must accept. */
export function quotePayload(requestId: string, state: ConfigState, form: ContactForm) {
  return {
    request_id: requestId,
    name: form.name.trim(),
    phone: normalizePhone(form.phone),
    email: form.email.trim() || null,
    service: form.service,
    notes: form.notes.trim() || null,
    location: { region: state.region, city: state.city, city_other: state.city === 'Other' ? state.cityOther.trim() : null },
    elevator: { type: state.type, stops: state.stops },
    design: state.design,
    consent: form.consent,
    website: form.website,
    submission_path: '/configure',
  };
}

export function whatsappMessage(state: ConfigState, form?: ContactForm): string {
  const type = elevatorTypes.find((item) => item.id === state.type)?.ar ?? state.type;
  const lines = [
    'السلام عليكم، أرغب في عرض سعر لمصعد بهذا التصميم:',
    '',
    `المنطقة: ${regionLabel(state)}`,
    `المدينة: ${cityLabel(state)}`,
    `نوع المصعد: ${type}`,
    `عدد الوقفات: ${state.stops}`,
    ...summaryLines(state.design).map((line) => `${line.label}: ${line.value}`),
  ];
  if (form) {
    const service = services.find((item) => item.id === form.service)?.ar ?? form.service;
    // The sender's number already reaches us with the WhatsApp message itself.
    lines.push('', `الاسم: ${form.name.trim()}`, `الخدمة: ${service}`);
    if (form.notes.trim()) lines.push(`تفاصيل: ${form.notes.trim()}`);
  }
  lines.push('', `رابط التصميم: ${shareUrl(state)}`);
  return lines.join('\n');
}

// ---------- share link ----------

export function encodeDesign(state: ConfigState): string {
  const compact = { ...state.design, r: state.region, c: state.city, o: state.cityOther, t: state.type, s: state.stops };
  const bytes = new TextEncoder().encode(JSON.stringify(compact));
  let binary = '';
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function decodeDesign(token: string): ConfigState | null {
  try {
    const binary = atob(token.replace(/-/g, '+').replace(/_/g, '/'));
    const raw = JSON.parse(new TextDecoder().decode(Uint8Array.from(binary, (char) => char.charCodeAt(0)))) as Record<string, unknown>;
    const region = regions.find((item) => item.id === raw.r);
    const city = typeof raw.c === 'string' && (raw.c === 'Other' || (region?.cities as readonly string[] | undefined)?.includes(raw.c)) ? raw.c : '';
    const type = elevatorTypes.some((item) => item.id === raw.t) ? String(raw.t) : initialState.type;
    return {
      region: region?.id ?? '',
      city: region ? city : '',
      cityOther: typeof raw.o === 'string' ? raw.o.slice(0, 100) : '',
      type,
      stops: clampStops(Number(raw.s)),
      design: sanitizeDesign(raw),
    };
  } catch {
    return null;
  }
}

export function shareUrl(state: ConfigState): string {
  const origin = typeof window === 'undefined' ? 'https://hensline.com' : window.location.origin;
  return `${origin}/configure?design=${encodeDesign(state)}`;
}

export const COMPANY_WHATSAPP = companyWhatsapp;

export function whatsappUrl(text: string): string {
  return `https://wa.me/${COMPANY_WHATSAPP}?text=${encodeURIComponent(text)}`;
}
