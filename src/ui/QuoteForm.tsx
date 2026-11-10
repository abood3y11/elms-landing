import { useId, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, MessageCircle, Phone, Send, SlidersHorizontal } from 'lucide-react';
import { cityNames, regions } from '../configurator/catalog';
import { normalizePhone, PHONE_RE } from '../configurator/rules';
import { companyPhones, telHref, whatsappHref } from '../site';

const serviceOptions = ['تركيب مصعد جديد', 'صيانة دورية', 'عطل أو طوارئ', 'تحديث مصعد', 'قطع غيار', 'عقد صيانة AMC'];
const typeOptions = ['فيلا / منزلي', 'ركاب', 'بانورامي / خارجي', 'مستشفى', 'بضائع', 'لا أعرف بعد'];
const cities = [...regions.flatMap((region) => region.cities), 'Other'];

type Form = { name: string; phone: string; service: string; type: string; city: string; notes: string; consent: boolean; website: string };
const empty: Form = { name: '', phone: '', service: '', type: '', city: '', notes: '', consent: false, website: '' };

function errorsFor(form: Form) {
  const errors: Partial<Record<keyof Form, string>> = {};
  if (form.name.trim().length < 2) errors.name = 'اكتب اسمك (حرفان على الأقل).';
  if (!PHONE_RE.test(normalizePhone(form.phone))) errors.phone = 'اكتب رقم جوال سعودي مثل 05xxxxxxxx.';
  if (!form.service) errors.service = 'اختر الخدمة التي تحتاجها.';
  if (!form.city) errors.city = 'اختر مدينة المشروع.';
  if (!form.consent) errors.consent = 'وافِق على سياسة الخصوصية لإرسال الطلب.';
  return errors;
}

/** Quick request form. Until ELMS takes website requests directly, it hands the request to WhatsApp. */
export function QuoteForm({ title = 'اطلب معاينة أو عرض سعر', compact }: { title?: string; compact?: boolean }) {
  const id = useId();
  const [form, setForm] = useState<Form>(empty);
  const [errors, setErrors] = useState<Partial<Record<keyof Form, string>>>({});
  const [sent, setSent] = useState(false);

  const set = <K extends keyof Form>(key: K, value: Form[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    if (errors[key]) setErrors((current) => ({ ...current, [key]: undefined }));
  };

  function submit(event: FormEvent) {
    event.preventDefault();
    const found = errorsFor(form);
    setErrors(found);
    if (Object.keys(found).length) {
      const first = Object.keys(found)[0];
      document.getElementById(`${id}-${first}`)?.focus();
      return;
    }
    if (form.website) { setSent(true); return; }
    const city = form.city === 'Other' ? 'مدينة أخرى' : cityNames[form.city] ?? form.city;
    const lines = [
      'السلام عليكم، أرغب في طلب من موقع HENS LINE:',
      `الخدمة: ${form.service}`,
      form.type && `نوع المصعد: ${form.type}`,
      `المدينة: ${city}`,
      `الاسم: ${form.name.trim()}`,
      form.notes.trim() && `تفاصيل: ${form.notes.trim()}`,
    ].filter(Boolean);
    window.open(`${whatsappHref}?text=${encodeURIComponent(lines.join('\n'))}`, '_blank', 'noopener');
    setSent(true);
  }

  if (sent) {
    return (
      <div className="qf qf-done" role="status">
        <CheckCircle2 size={44} aria-hidden="true" />
        <h3>تم تجهيز طلبك على واتساب</h3>
        <p>أكمل الإرسال من واتساب، وسيتواصل معك فريقنا لتأكيد الموعد.</p>
        <div className="actions">
          <Link to="/configure" className="btn btn-primary"><SlidersHorizontal size={18} aria-hidden="true" /> صمّم الكابينة</Link>
          <button type="button" className="btn btn-ghost" onClick={() => { setForm(empty); setSent(false); }}>طلب جديد</button>
        </div>
      </div>
    );
  }

  return (
    <form className={`qf${compact ? ' is-compact' : ''}`} onSubmit={submit} noValidate>
      <div className="qf-head">
        <h3>{title}</h3>
        <p>نرد عليك خلال ساعات العمل. للطوارئ اتصل مباشرة على <a href={telHref} dir="ltr">{companyPhones[0]}</a>.</p>
      </div>

      <fieldset className="qf-field">
        <legend>ما الخدمة التي تحتاجها؟</legend>
        <div className="qf-chips" role="radiogroup" id={`${id}-service`} tabIndex={-1} aria-invalid={Boolean(errors.service)}>
          {serviceOptions.map((option) => (
            <button key={option} type="button" role="radio" aria-checked={form.service === option} className={form.service === option ? 'is-on' : ''} onClick={() => set('service', option)}>{option}</button>
          ))}
        </div>
        {errors.service && <p className="qf-error">{errors.service}</p>}
      </fieldset>

      {!compact && (
        <fieldset className="qf-field">
          <legend>نوع المصعد <small>(اختياري)</small></legend>
          <div className="qf-chips" role="radiogroup">
            {typeOptions.map((option) => (
              <button key={option} type="button" role="radio" aria-checked={form.type === option} className={form.type === option ? 'is-on' : ''} onClick={() => set('type', form.type === option ? '' : option)}>{option}</button>
            ))}
          </div>
        </fieldset>
      )}

      <div className="qf-grid">
        <div className="qf-field">
          <label htmlFor={`${id}-name`}>الاسم</label>
          <input id={`${id}-name`} autoComplete="name" maxLength={120} value={form.name} aria-invalid={Boolean(errors.name)} onChange={(event) => set('name', event.target.value)} placeholder="اسمك الكامل" />
          {errors.name && <p className="qf-error">{errors.name}</p>}
        </div>
        <div className="qf-field">
          <label htmlFor={`${id}-phone`}>رقم الجوال</label>
          <input id={`${id}-phone`} type="tel" dir="ltr" inputMode="tel" autoComplete="tel" value={form.phone} aria-invalid={Boolean(errors.phone)} onChange={(event) => set('phone', event.target.value)} placeholder="05xxxxxxxx" />
          {errors.phone && <p className="qf-error">{errors.phone}</p>}
        </div>
        <div className="qf-field">
          <label htmlFor={`${id}-city`}>المدينة</label>
          <select id={`${id}-city`} value={form.city} aria-invalid={Boolean(errors.city)} onChange={(event) => set('city', event.target.value)}>
            <option value="" disabled>اختر المدينة</option>
            {cities.map((city) => <option key={city} value={city}>{city === 'Other' ? 'مدينة أخرى' : cityNames[city] ?? city}</option>)}
          </select>
          {errors.city && <p className="qf-error">{errors.city}</p>}
        </div>
        <div className="qf-field qf-wide">
          <label htmlFor={`${id}-notes`}>تفاصيل <small>(اختياري)</small></label>
          <textarea id={`${id}-notes`} rows={3} maxLength={1500} value={form.notes} onChange={(event) => set('notes', event.target.value)} placeholder="عدد الأدوار، نوع المبنى، أو وصف المشكلة" />
        </div>
      </div>

      <div className="qf-honeypot" aria-hidden="true">
        <label htmlFor={`${id}-website`}>website</label>
        <input id={`${id}-website`} tabIndex={-1} autoComplete="off" value={form.website} onChange={(event) => set('website', event.target.value)} />
      </div>

      <label className="qf-consent">
        <input id={`${id}-consent`} type="checkbox" checked={form.consent} aria-invalid={Boolean(errors.consent)} onChange={(event) => set('consent', event.target.checked)} />
        <span>أوافق على <Link to="/privacy" target="_blank">سياسة الخصوصية</Link> ومعالجة بياناتي للرد على الطلب.</span>
      </label>
      {errors.consent && <p className="qf-error">{errors.consent}</p>}

      <div className="qf-actions">
        <button type="submit" className="btn btn-primary btn-lg"><Send size={18} aria-hidden="true" /> أرسل الطلب عبر واتساب</button>
        <a href={telHref} className="btn btn-ghost btn-lg"><Phone size={18} aria-hidden="true" /> اتصل الآن</a>
      </div>
      <p className="qf-note"><MessageCircle size={14} aria-hidden="true" /> يفتح واتساب برسالة جاهزة، وأنت من يضغط إرسال.</p>
    </form>
  );
}
