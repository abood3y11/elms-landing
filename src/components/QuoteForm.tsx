import { useId, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Loader2, MessageCircle, Phone, Send } from 'lucide-react';
import { newRequestId, submitLead } from '../lib/leads';
import type { LeadService, LeadSource } from '../lib/leads';

const SERVICES: { value: LeadService; label: string }[] = [
  { value: 'installation', label: 'توريد وتركيب مصعد' },
  { value: 'maintenance', label: 'صيانة' },
  { value: 'modernization', label: 'تحديث مصعد' },
  { value: 'parts', label: 'قطع غيار وتشطيبات' },
  { value: 'consultation', label: 'استشارة' },
];

const ELEVATOR_TYPES: { value: string; label: string }[] = [
  { value: 'home', label: 'مصعد منزلي (فيلا)' },
  { value: 'passenger', label: 'مصعد أفراد (ركاب)' },
  { value: 'outdoor', label: 'مصعد خارجي' },
  { value: 'panoramic', label: 'بانورامي' },
  { value: 'hospital', label: 'مصعد مستشفى' },
  { value: 'goods', label: 'مصعد بضائع' },
];

const SAUDI_MOBILE = /^(?:\+?966|0)?5\d{8}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type FieldName = 'name' | 'phone' | 'email' | 'city' | 'consent';
type Errors = Partial<Record<FieldName, string>>;

interface Props {
  source?: LeadSource;
  defaultService?: LeadService;
  defaultElevatorType?: string;
  /** Business phone, local format (e.g. 0571207000). */
  phone: string;
}

const toWhatsApp = (local: string) => `966${local.replace(/^0/, '')}`;

export function QuoteForm({ source = 'quote_form', defaultService = 'installation', defaultElevatorType = '', phone }: Props) {
  const formId = useId();
  // One idempotency key per filled-in form: a retry after a dropped connection
  // or a double click resends it, and ELMS stores the enquiry once.
  const [requestId, setRequestId] = useState(newRequestId);
  const [values, setValues] = useState({
    name: '',
    phone: '',
    email: '',
    city: '',
    service: defaultService,
    elevatorType: defaultElevatorType,
    stops: '',
    notes: '',
    consent: false,
    website: '',
  });
  const [errors, setErrors] = useState<Errors>({});
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'failed'>('idle');
  const [failure, setFailure] = useState('');
  const [reference, setReference] = useState('');

  const set = <K extends keyof typeof values>(key: K, value: (typeof values)[K]) => {
    setValues((v) => ({ ...v, [key]: value }));
    if (key in errors) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const validate = (): Errors => {
    const e: Errors = {};
    if (values.name.trim().length < 2) e.name = 'اكتب اسمك (حرفان على الأقل).';
    if (!SAUDI_MOBILE.test(values.phone.replace(/[\s\-()]/g, ''))) e.phone = 'اكتب رقم جوال سعودي مثل 05xxxxxxxx.';
    if (values.email.trim() && !EMAIL.test(values.email.trim())) e.email = 'راجع البريد الإلكتروني.';
    if (!values.city.trim()) e.city = 'اكتب مدينة المشروع.';
    if (!values.consent) e.consent = 'وافق على سياسة الخصوصية لإرسال الطلب.';
    return e;
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (state === 'sending') return;
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length) {
      const first = Object.keys(found)[0];
      document.getElementById(`${formId}-${first}`)?.focus();
      return;
    }
    setState('sending');
    const stops = Number.parseInt(values.stops, 10);
    const result = await submitLead({
      name: values.name.trim(),
      phone: values.phone,
      email: values.email.trim() || undefined,
      city: values.city.trim(),
      service: values.service,
      elevator_type: values.elevatorType || undefined,
      stops: Number.isFinite(stops) ? stops : undefined,
      notes: values.notes.trim() || undefined,
      consent: values.consent,
      website: values.website,
      request_id: requestId,
      source,
    });
    if (result.ok) {
      setReference(result.reference);
      setState('sent');
      return;
    }
    if (result.kind === 'fields') {
      const mapped: Errors = {};
      for (const key of Object.keys(result.fields)) {
        if (['name', 'phone', 'email', 'city', 'consent'].includes(key)) {
          mapped[key as FieldName] = 'راجع هذا الحقل.';
        }
      }
      setErrors(mapped);
      setState('idle');
      return;
    }
    setFailure(
      result.kind === 'rate_limited'
        ? 'أرسلت طلبات كثيرة خلال وقت قصير. انتظر دقيقة ثم حاول مجددًا.'
        : 'تعذر إرسال الطلب الآن. بياناتك ما زالت هنا — حاول مجددًا أو تواصل معنا مباشرة.',
    );
    setState('failed');
  };

  const whatsappText = useMemo(
    () =>
      encodeURIComponent(
        reference
          ? `السلام عليكم، أرسلت طلباً من الموقع برقم ${reference}.`
          : `السلام عليكم، أرغب في عرض سعر. الاسم: ${values.name}، المدينة: ${values.city}.`,
      ),
    [reference, values.name, values.city],
  );

  if (state === 'sent') {
    return (
      <div className="quote-success" role="status" aria-live="polite">
        <CheckCircle2 size={52} aria-hidden="true" />
        <span className="eyebrow">تم استلام طلبك</span>
        <h3>شكرًا لك، سيتواصل معك فريقنا قريبًا.</h3>
        <p>احتفظ برقم الطلب للمتابعة:</p>
        <strong className="quote-reference" dir="ltr">{reference}</strong>
        <div className="quote-success-actions">
          <a className="primary-action" href={`https://wa.me/${toWhatsApp(phone)}?text=${whatsappText}`} target="_blank" rel="noopener noreferrer">
            <MessageCircle size={18} aria-hidden="true" /> تابع على واتساب
          </a>
          <button
            type="button"
            className="secondary-action"
            onClick={() => {
              setRequestId(newRequestId());
              setValues((v) => ({ ...v, notes: '', stops: '' }));
              setReference('');
              setState('idle');
            }}
          >
            إرسال طلب آخر
          </button>
        </div>
      </div>
    );
  }

  const field = (name: FieldName) => ({
    id: `${formId}-${name}`,
    'aria-invalid': errors[name] ? true : undefined,
    'aria-describedby': errors[name] ? `${formId}-${name}-error` : undefined,
  });
  const error = (name: FieldName) =>
    errors[name] ? (
      <span className="field-error" id={`${formId}-${name}-error`} role="alert">
        {errors[name]}
      </span>
    ) : null;

  return (
    <form className="quote-form" noValidate onSubmit={onSubmit} aria-busy={state === 'sending'}>
      <label>
        الاسم بالكامل *
        <input {...field('name')} type="text" autoComplete="name" maxLength={120} placeholder="اكتب اسمك" value={values.name} onChange={(e) => set('name', e.target.value)} />
        {error('name')}
      </label>
      <label>
        رقم الجوال *
        <input {...field('phone')} type="tel" inputMode="tel" autoComplete="tel" dir="ltr" maxLength={20} placeholder="05xxxxxxxx" value={values.phone} onChange={(e) => set('phone', e.target.value)} />
        {error('phone')}
      </label>
      <label>
        نوع الخدمة
        <select value={values.service} onChange={(e) => set('service', e.target.value as LeadService)}>
          {SERVICES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </label>
      <label>
        نوع المصعد
        <select value={values.elevatorType} onChange={(e) => set('elevatorType', e.target.value)}>
          <option value="">غير محدد</option>
          {ELEVATOR_TYPES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </label>
      <label>
        المدينة *
        <input {...field('city')} type="text" autoComplete="address-level2" maxLength={100} placeholder="مثال: مكة المكرمة" value={values.city} onChange={(e) => set('city', e.target.value)} />
        {error('city')}
      </label>
      <label>
        عدد الأدوار (الوقفات)
        <input type="number" inputMode="numeric" min={2} max={60} placeholder="مثال: 3" value={values.stops} onChange={(e) => set('stops', e.target.value)} />
      </label>
      <label className="wide">
        البريد الإلكتروني (اختياري)
        <input {...field('email')} type="email" autoComplete="email" dir="ltr" maxLength={190} value={values.email} onChange={(e) => set('email', e.target.value)} />
        {error('email')}
      </label>
      <label className="wide">
        ملاحظات
        <textarea maxLength={3000} placeholder="نوع المبنى، مرحلة المشروع، أو وصف المشكلة" value={values.notes} onChange={(e) => set('notes', e.target.value)} />
      </label>

      {/* Honeypot: hidden from people and screen readers, filled by bots. */}
      <div className="hp-field" aria-hidden="true">
        <label>
          Website
          <input tabIndex={-1} autoComplete="off" value={values.website} onChange={(e) => set('website', e.target.value)} />
        </label>
      </div>

      <label className="wide consent-label">
        <span className="consent-row">
          <input {...field('consent')} type="checkbox" checked={values.consent} onChange={(e) => set('consent', e.target.checked)} />
          <span>
            أوافق على استخدام بياناتي للرد على طلبي وفق <Link to="/privacy" target="_blank">سياسة الخصوصية</Link>.
          </span>
        </span>
        {error('consent')}
      </label>

      {state === 'failed' && (
        <div className="form-failure wide" role="alert">
          <p>{failure}</p>
          <div>
            <a href={`https://wa.me/${toWhatsApp(phone)}?text=${whatsappText}`} target="_blank" rel="noopener noreferrer"><MessageCircle size={16} aria-hidden="true" /> واتساب</a>
            <a href={`tel:+${toWhatsApp(phone)}`}><Phone size={16} aria-hidden="true" /> {phone}</a>
          </div>
        </div>
      )}

      <button type="submit" className="wide" disabled={state === 'sending'}>
        {state === 'sending' ? <><Loader2 className="spin" size={18} aria-hidden="true" /> جارٍ الإرسال…</> : <><Send size={18} aria-hidden="true" /> إرسال الطلب</>}
      </button>
      <small className="wide form-reassurance">طلبك بدون أي التزام. يتواصل معك الفريق لمراجعة التفاصيل والمعاينة.</small>
    </form>
  );
}

export default QuoteForm;
