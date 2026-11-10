import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { ChevronDown, Clock3, Mail, MapPin, Menu, MessageCircle, Phone, SlidersHorizontal, X } from 'lucide-react';
import {
  companyAddress, companyBrand, companyCr, companyShortAddress, companyEmail, companyName, companyPhones, companyVat, footerServices, legalNav, moreNav, primaryNav,
  serviceArea, telHref, whatsappHref,
} from '../site';
import './layout.css';

function MoreMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { pathname } = useLocation();
  const active = moreNav.some((item) => item.to === pathname);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return undefined;
    const close = (event: MouseEvent | KeyboardEvent) => {
      if (event instanceof KeyboardEvent ? event.key === 'Escape' : !ref.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', close);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', close);
    };
  }, [open]);

  return (
    <div className="sh-more" ref={ref}>
      <button type="button" className={`sh-link${active ? ' active' : ''}`} aria-expanded={open} aria-haspopup="true" onClick={() => setOpen((value) => !value)}>
        المزيد <ChevronDown size={15} aria-hidden="true" />
      </button>
      {open && (
        <div className="sh-more-menu">
          {moreNav.map((item) => <NavLink key={item.to} to={item.to}>{item.label}</NavLink>)}
        </div>
      )}
    </div>
  );
}

function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  return (
    <div className={`sh-drawer-root${open ? ' is-open' : ''}`} aria-hidden={!open}>
      <div className="sh-backdrop" onClick={onClose} />
      <aside className="sh-drawer" role="dialog" aria-modal="true" aria-label="القائمة">
        <div className="sh-drawer-head">
          <Link to="/" className="sh-brand" onClick={onClose} tabIndex={open ? 0 : -1}>
            <img src="/hens-line-logo/svg/hens-line-primary.svg" alt="" />
            <span><strong>{companyBrand}</strong></span>
          </Link>
          <button ref={closeRef} type="button" className="sh-icon-button" onClick={onClose} aria-label="إغلاق القائمة" tabIndex={open ? 0 : -1}><X size={22} /></button>
        </div>
        <div className="sh-drawer-body">
          <Link to="/configure" className="sh-drawer-cta" onClick={onClose} tabIndex={open ? 0 : -1}>
            <SlidersHorizontal size={20} aria-hidden="true" />
            <span><strong>صمّم مصعدك</strong><small>جرّب الخامات على معاينة ثلاثية الأبعاد واطلب السعر</small></span>
          </Link>
          <nav className="sh-drawer-nav" aria-label="القائمة الرئيسية">
            {[...primaryNav, ...moreNav].map((item) => (
              <NavLink key={item.to} to={item.to} end={item.to === '/'} onClick={onClose} tabIndex={open ? 0 : -1}>{item.label}</NavLink>
            ))}
          </nav>
          <div className="sh-drawer-contact">
            <a href={telHref} tabIndex={open ? 0 : -1}><Phone size={18} aria-hidden="true" /> اتصل {companyPhones[0]}</a>
            <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="is-wa" tabIndex={open ? 0 : -1}><MessageCircle size={18} aria-hidden="true" /> واتساب</a>
          </div>
          <p className="sh-drawer-area"><MapPin size={15} aria-hidden="true" /> {serviceArea}</p>
        </div>
      </aside>
    </div>
  );
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  useEffect(() => setOpen(false), [pathname]);

  return (
    <>
      <div className="sh-topbar">
        <span><MapPin size={14} aria-hidden="true" /> نخدم {serviceArea}</span>
        <span><Clock3 size={14} aria-hidden="true" /> دعم أعطال وطوارئ 24/7</span>
        <a href={telHref} dir="ltr"><Phone size={14} aria-hidden="true" /> {companyPhones[0]}</a>
      </div>
      <header className="sh-header">
        <Link className="sh-brand" to="/" aria-label={`${companyBrand} — الرئيسية`}>
          <img src="/hens-line-logo/svg/hens-line-primary.svg" alt="" />
          <span>
            <strong>{companyBrand}</strong>
            <small>{companyName}</small>
          </span>
        </Link>
        <nav className="sh-nav" aria-label="القائمة الرئيسية">
          {primaryNav.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.to === '/'} className="sh-link">{item.label}</NavLink>
          ))}
          <MoreMenu />
        </nav>
        <div className="sh-actions">
          <a className="sh-icon-button sh-call" href={telHref} aria-label={`اتصل بنا ${companyPhones[0]}`}><Phone size={19} /></a>
          <Link className="sh-cta" to="/configure"><SlidersHorizontal size={17} aria-hidden="true" /> صمّم مصعدك</Link>
          <button type="button" className="sh-icon-button sh-burger" onClick={() => setOpen(true)} aria-label="فتح القائمة" aria-expanded={open}><Menu size={22} /></button>
        </div>
      </header>
      <MobileMenu open={open} onClose={() => setOpen(false)} />
    </>
  );
}

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="sf">
      <div className="sf-cta">
        <div>
          <h2>جاهز تبدأ مشروع مصعدك؟</h2>
          <p>صمّم الكابينة بنفسك واطلب عرض السعر، أو تواصل معنا مباشرة.</p>
        </div>
        <div className="sf-cta-actions">
          <Link to="/configure" className="sf-btn sf-btn-light"><SlidersHorizontal size={18} aria-hidden="true" /> صمّم مصعدك</Link>
          <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="sf-btn sf-btn-ghost"><MessageCircle size={18} aria-hidden="true" /> واتساب</a>
        </div>
      </div>
      <div className="sf-grid">
        <div className="sf-col sf-about">
          <Link to="/" className="sh-brand sf-brand">
            <img src="/hens-line-logo/svg/hens-line-on-dark-transparent.svg" alt="" />
            <span><strong>{companyBrand}</strong><small>{companyName}</small></span>
          </Link>
          <p>تركيب وصيانة وتحديث المصاعد وقطع الغيار وعقود الصيانة السنوية للمنازل والمباني التجارية والصحية.</p>
        </div>
        <div className="sf-col">
          <h3>روابط سريعة</h3>
          <ul>{[primaryNav[0], moreNav[0], primaryNav[3], primaryNav[2], moreNav[3]].map((item) => <li key={item.to}><Link to={item.to}>{item.label}</Link></li>)}</ul>
        </div>
        <div className="sf-col">
          <h3>خدماتنا</h3>
          <ul>{footerServices.map((item) => <li key={item.label}><Link to={item.to}>{item.label}</Link></li>)}</ul>
        </div>
        <div className="sf-col">
          <h3>تواصل معنا</h3>
          <ul className="sf-contact">
            <li><MapPin size={16} aria-hidden="true" /> <span>{companyAddress}<br /><small dir="ltr">{companyShortAddress}</small></span></li>
            <li><Phone size={16} aria-hidden="true" /> <a href={telHref} dir="ltr">{companyPhones[0]}</a></li>
            <li><Mail size={16} aria-hidden="true" /> <a href={`mailto:${companyEmail}`}>{companyEmail}</a></li>
            <li><Clock3 size={16} aria-hidden="true" /> طوارئ على مدار الساعة</li>
          </ul>
        </div>
      </div>
      <div className="sf-bottom">
        <span>© {year} {companyName}</span>
        <span>س.ت: {companyCr} · الرقم الضريبي: {companyVat}</span>
        <nav aria-label="روابط قانونية">{legalNav.map((item) => <Link key={item.to} to={item.to}>{item.label}</Link>)}</nav>
      </div>
    </footer>
  );
}
