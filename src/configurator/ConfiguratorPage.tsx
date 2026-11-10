import { lazy, Suspense, useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, Box, Check, ChevronDown, DoorClosed, DoorOpen, Link2, MapPin, Maximize2, MessageCircle, Minimize2, Minus, Move3d, Palette, Plus,
  RotateCcw, Search, Send, X,
} from 'lucide-react';
import {
  categoryLabels, ceilings, cityNames, elevatorTypes, optionsByCategory, presets, regions, services, STOPS_MAX, STOPS_MIN, walls, wallGroups,
  type CategoryKey, type Ceiling, type Finish, type Option,
} from './catalog';
import {
  applyPreset, choose, cityLabel, clampStops, contactErrors, decodeDesign, disabledReason, emptyContact, initialState, locationError, quotePayload,
  regionLabel, shareUrl, summaryLines, whatsappMessage, whatsappUrl, type ConfigState, type ContactForm,
} from './rules';
import { t } from './strings';
import { ceilingSwatch, finishSwatch } from './textures';
import type { ViewId } from './CabinPreview';
import './configurator.css';

const CabinPreview = lazy(() => import('./CabinPreview'));

const QUOTE_API_URL = (import.meta.env.VITE_QUOTE_API_URL as string | undefined)?.trim() || '';

type StepTab = { key: CategoryKey | 'panel'; label: string; view: ViewId };

const materialTabs: StepTab[] = [
  { key: 'wall', label: categoryLabels.wall, view: 'front' },
  { key: 'trim', label: categoryLabels.trim, view: 'front' },
  { key: 'floor', label: categoryLabels.floor, view: 'front' },
  { key: 'ceiling', label: categoryLabels.ceiling, view: 'ceiling' },
  { key: 'mirror', label: categoryLabels.mirror, view: 'front' },
  { key: 'handrail', label: categoryLabels.handrail, view: 'front' },
];

const detailTabs: StepTab[] = [
  { key: 'doorfinish', label: categoryLabels.doorfinish, view: 'landing' },
  { key: 'door', label: categoryLabels.door, view: 'landing' },
  { key: 'entrance', label: categoryLabels.entrance, view: 'exterior' },
  { key: 'panel', label: categoryLabels.panel, view: 'controls' },
  { key: 'light', label: categoryLabels.light, view: 'interior' },
];

const viewOrder: ViewId[] = ['front', 'interior', 'landing', 'exterior', 'ceiling', 'controls'];

function webglAvailable(): boolean {
  try {
    const element = document.createElement('canvas');
    return Boolean(element.getContext('webgl2') || element.getContext('webgl'));
  } catch {
    return false;
  }
}

function newRequestId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function isFinish(option: Option): option is Finish {
  return 'kind' in option;
}

function isCeiling(option: Option): option is Ceiling {
  return 'pattern' in option && !('kind' in option);
}

function useIsMobile() {
  const query = '(max-width: 760px)';
  const [mobile, setMobile] = useState(() => typeof window !== 'undefined' && window.matchMedia(query).matches);
  useEffect(() => {
    const list = window.matchMedia(query);
    const update = () => setMobile(list.matches);
    list.addEventListener('change', update);
    return () => list.removeEventListener('change', update);
  }, []);
  return mobile;
}

function Swatch({ option }: { option: Option }) {
  const src = isFinish(option) ? finishSwatch(option) : isCeiling(option) ? ceilingSwatch(option) : '';
  if (src) return <img className="cfg-swatch-img" src={src} alt="" aria-hidden="true" loading="lazy" />;
  if (option.color) return <span className="cfg-swatch-color" style={{ background: option.color }} aria-hidden="true" />;
  return null;
}

function OptionGrid({ category, state, onChoose, filter }: { category: CategoryKey; state: ConfigState; onChoose: (category: CategoryKey, id: string) => void; filter?: (option: Option) => boolean }) {
  const options = optionsByCategory[category].filter((option) => (filter ? filter(option) : true));
  const visual = options.some((option) => isFinish(option) || isCeiling(option) || option.color);
  if (!options.length) return <p className="cfg-empty">{t.noResults}</p>;
  return (
    <div className={visual ? 'cfg-grid cfg-grid-visual' : 'cfg-grid'} role="radiogroup" aria-label={categoryLabels[category]}>
      {options.map((option) => {
        const reason = disabledReason(state.design, category, option.id);
        const selected = state.design[category] === option.id;
        return (
          <button
            key={option.id}
            type="button"
            role="radio"
            aria-checked={selected}
            className={`cfg-option${selected ? ' is-selected' : ''}`}
            disabled={Boolean(reason)}
            title={reason ?? undefined}
            onClick={() => onChoose(category, option.id)}
          >
            {visual ? <Swatch option={option} /> : <span className="cfg-radio" aria-hidden="true" />}
            <span className="cfg-option-text">
              <strong>{option.ar}</strong>
              {'code' in option && <small>{String((option as { code: string }).code)}</small>}
              {reason && <small className="cfg-option-reason">{reason}</small>}
            </span>
            {selected && visual && <Check className="cfg-option-check" size={16} aria-hidden="true" />}
          </button>
        );
      })}
    </div>
  );
}

function SearchableGrid({ category, state, onChoose, groups }: { category: 'wall' | 'floor' | 'ceiling'; state: ConfigState; onChoose: (category: CategoryKey, id: string) => void; groups?: boolean }) {
  const [query, setQuery] = useState('');
  const [group, setGroup] = useState('all');
  const all = optionsByCategory[category];
  const q = query.trim().toLowerCase();
  const filter = (option: Option) => {
    if (groups && group !== 'all' && (option as Finish).group !== group) return false;
    if (!q) return true;
    return [option.ar, option.en, option.id].some((text) => text.toLowerCase().includes(q));
  };
  const count = all.filter(filter).length;
  return (
    <>
      {groups && (
        <div className="cfg-chips" role="group" aria-label={categoryLabels.wall}>
          {wallGroups.map((item) => (
            <button key={item.id} type="button" className={group === item.id ? 'is-active' : ''} aria-pressed={group === item.id} onClick={() => setGroup(item.id)}>{item.ar}</button>
          ))}
        </div>
      )}
      <label className="cfg-search">
        <Search size={16} aria-hidden="true" />
        <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t.search} aria-label={t.search} />
        <span className="cfg-count" aria-live="polite">{count} / {all.length}</span>
      </label>
      <OptionGrid category={category} state={state} onChoose={onChoose} filter={filter} />
    </>
  );
}

function Tabs({ tabs, active, onChange }: { tabs: StepTab[]; active: string; onChange: (tab: StepTab) => void }) {
  return (
    <div className="cfg-tabs" role="tablist">
      {tabs.map((tab) => (
        <button key={tab.key} type="button" role="tab" aria-selected={active === tab.key} className={active === tab.key ? 'is-active' : ''} onClick={() => onChange(tab)}>{tab.label}</button>
      ))}
    </div>
  );
}

function CurrentChoice({ category, state }: { category: CategoryKey; state: ConfigState }) {
  const option = optionsByCategory[category].find((item) => item.id === state.design[category]);
  if (!option) return null;
  return (
    <p className="cfg-current">
      <span>{t.selected}:</span>
      <strong>{option.ar}</strong>
      {'code' in option && <code dir="ltr">{String((option as { code: string }).code)}</code>}
    </p>
  );
}

const howIcons = [MapPin, Palette, Send];

export default function ConfiguratorPage() {
  const [params] = useSearchParams();
  const shared = useMemo(() => {
    const token = params.get('design');
    return token ? decodeDesign(token) : null;
  }, [params]);

  const [state, setState] = useState<ConfigState>(shared ?? initialState);
  const [step, setStep] = useState(() => (shared && !locationError(shared) ? 2 : 1));
  const [locError, setLocError] = useState<{ field: 'region' | 'city'; message: string } | null>(null);
  const [materialTab, setMaterialTab] = useState<string>('wall');
  const [detailTab, setDetailTab] = useState<string>('doorfinish');
  const [view, setView] = useState<ViewId>('front');
  const [doorsOpen, setDoorsOpen] = useState(true);
  const [resetKey, setResetKey] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [presetsOpen, setPresetsOpen] = useState(() => typeof window === 'undefined' || window.matchMedia('(min-width: 761px)').matches);
  const [toast, setToast] = useState('');
  const [form, setForm] = useState<ContactForm>(emptyContact);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof ContactForm, string>>>({});
  const [submitError, setSubmitError] = useState('');
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState<null | { reference?: string; via: 'api' | 'whatsapp' }>(null);
  const requestId = useRef(newRequestId());
  const regionRef = useRef<HTMLDivElement>(null);
  const cityRef = useRef<HTMLSelectElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const has3d = useMemo(() => (typeof window === 'undefined' ? false : webglAvailable()), []);
  const mobile = useIsMobile();
  // On phones, steps 2-4 become a full-screen app: preview on top, choices below, a fixed bar at the bottom.
  const appMode = mobile && step >= 2;

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(''), 2800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (!appMode) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, [appMode]);

  useEffect(() => {
    if (!locError) return;
    if (locError.field === 'region') regionRef.current?.querySelector('button')?.focus();
    else cityRef.current?.focus();
  }, [locError]);

  const region = regions.find((item) => item.id === state.region);

  function showView(next: ViewId) {
    setView(next);
    setDoorsOpen(next !== 'landing');
    setResetKey((key) => key + 1);
  }

  function goTo(target: number) {
    if (target > 1) {
      const error = locationError(state);
      if (error) {
        setStep(1);
        setLocError({ ...error });
        return;
      }
    }
    setLocError(null);
    setStep(target);
    if (target === 2) showView(materialTabs.find((tab) => tab.key === materialTab)?.view ?? 'front');
    if (target === 3) showView(detailTabs.find((tab) => tab.key === detailTab)?.view ?? 'landing');
    if (target === 4) showView('front');
    bodyRef.current?.scrollTo({ top: 0 });
    if (!mobile) topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    else if (target === 1) window.scrollTo({ top: 0 });
  }

  function onChoose(category: CategoryKey, id: string) {
    setState((current) => ({ ...current, design: choose(current.design, category, id) }));
    if (category === 'panelSide' && view !== 'controls') showView('controls');
    if (category === 'panelSide' && view === 'controls') setResetKey((key) => key + 1);
    if (category === 'entrance' && view === 'exterior') setResetKey((key) => key + 1);
  }

  function onPreset(id: string) {
    setState((current) => ({ ...current, design: applyPreset(current.design, id) }));
    showView('front');
    setToast(t.presetApplied);
  }

  function setRegion(id: string) {
    setState((current) => (current.region === id ? current : { ...current, region: id, city: '', cityOther: '' }));
    setLocError(null);
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl(state));
      setToast(t.copied);
    } catch {
      window.prompt(t.copyLink, shareUrl(state));
    }
  }

  function openWhatsapp(withForm?: ContactForm) {
    window.open(whatsappUrl(whatsappMessage(state, withForm)), '_blank', 'noopener');
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (sending || done) return;
    const errors = contactErrors(form);
    const location = locationError(state);
    setFormErrors(errors);
    setSubmitError('');
    if (location) {
      goTo(1);
      return;
    }
    if (Object.keys(errors).length) {
      setSubmitError(t.errors.fix);
      return;
    }
    if (form.website) {
      // Honeypot filled: pretend success, send nothing.
      setDone({ via: QUOTE_API_URL ? 'api' : 'whatsapp' });
      return;
    }
    if (!QUOTE_API_URL) {
      openWhatsapp(form);
      setDone({ via: 'whatsapp' });
      return;
    }
    setSending(true);
    try {
      const response = await fetch(QUOTE_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(quotePayload(requestId.current, state, form)),
      });
      if (response.ok) {
        const body = (await response.json().catch(() => ({}))) as { reference?: string };
        setDone({ via: 'api', reference: body.reference });
        return;
      }
      if (response.status === 422) {
        const body = (await response.json().catch(() => ({}))) as { error?: { fields?: Record<string, string> } };
        const fields = body.error?.fields ?? {};
        setFormErrors(Object.fromEntries(Object.entries(fields).filter(([key]) => key in emptyContact)) as Partial<Record<keyof ContactForm, string>>);
        setSubmitError(t.errors.fix);
      } else if (response.status === 429) {
        setSubmitError(t.errors.rate);
      } else {
        setSubmitError(t.errors.generic);
      }
    } catch {
      setSubmitError(t.errors.network);
    } finally {
      setSending(false);
    }
  }

  function restart() {
    setState(initialState);
    setForm(emptyContact);
    setFormErrors({});
    setDone(null);
    requestId.current = newRequestId();
    setStep(1);
  }

  const activeCeiling = ceilings.find((item) => item.id === state.design.ceiling);
  const head = t.stepHeads[step - 1];
  const locationText = state.region && state.city ? cityLabel(state) : '';

  const stage = (
    <section className={`cfg-stage${expanded ? ' is-expanded' : ''}`} aria-label={t.viewLabel}>
      {step === 1 ? (
        <div className="cfg-welcome">
          <img src="/img/IMG_1011-scaled.jpg" alt="" aria-hidden="true" />
          <div className="cfg-welcome-card">
            <h2>{t.welcomeTitle}</h2>
            <p>{t.welcomeText}</p>
            <ol className="cfg-how">
              {t.howItWorks.map((item, index) => {
                const Icon = howIcons[index];
                return (
                  <li key={item.title}>
                    <span className="cfg-how-icon"><Icon size={18} aria-hidden="true" /></span>
                    <span><strong>{item.title}</strong><small>{item.text}</small></span>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      ) : has3d ? (
        <>
          <div className="cfg-canvas">
            <Suspense fallback={<div className="cfg-loading"><Box size={28} aria-hidden="true" />{t.loading3d}</div>}>
              <CabinPreview design={state.design} view={view} doorsOpen={doorsOpen} resetKey={resetKey} stops={state.stops} />
            </Suspense>
          </div>
          <div className="cfg-views" role="group" aria-label={t.viewLabel}>
            {viewOrder.map((id) => (
              <button key={id} type="button" className={view === id ? 'is-active' : ''} aria-pressed={view === id} onClick={() => showView(id)}>{t.views[id]}</button>
            ))}
          </div>
          <label className="cfg-views-select">
            <span className="sr-only">{t.viewLabel}</span>
            <select value={view} onChange={(event) => showView(event.target.value as ViewId)}>
              {viewOrder.map((id) => <option key={id} value={id}>{t.views[id]}</option>)}
            </select>
            <ChevronDown size={16} aria-hidden="true" />
          </label>
          <div className="cfg-tools">
            <button type="button" onClick={() => setResetKey((key) => key + 1)} aria-label={t.resetView} title={t.resetView}><RotateCcw size={18} /></button>
            <button type="button" onClick={() => setExpanded((value) => !value)} aria-label={expanded ? t.collapse : t.expand} title={expanded ? t.collapse : t.expand}>{expanded ? <Minimize2 size={18} /> : <Maximize2 size={18} />}</button>
          </div>
          <div className="cfg-stage-bar">
            <span className="cfg-hint" aria-hidden="true"><Move3d size={15} /> {t.dragHint}</span>
            <button type="button" className="cfg-doors" onClick={() => setDoorsOpen((open) => !open)}>
              {doorsOpen ? <DoorClosed size={16} aria-hidden="true" /> : <DoorOpen size={16} aria-hidden="true" />} {doorsOpen ? t.closeDoors : t.openDoors}
            </button>
          </div>
          {view === 'ceiling' && activeCeiling && <div className="cfg-caption">{activeCeiling.ar} · {activeCeiling.code}</div>}
          {view === 'controls' && <div className="cfg-caption cfg-caption-hint">{t.panelHint}</div>}
        </>
      ) : (
        <div className="cfg-welcome">
          <img src="/img/IMG_1011-scaled.jpg" alt="" aria-hidden="true" />
          <div className="cfg-welcome-card"><p>{t.noWebgl}</p></div>
        </div>
      )}
    </section>
  );

  const stepper = (
    <ol className="cfg-stepper">
      {t.steps.map((label, index) => {
        const n = index + 1;
        return (
          <li key={label} className={n === step ? 'is-current' : n < step ? 'is-done' : ''}>
            <button type="button" onClick={() => goTo(n)} aria-current={n === step ? 'step' : undefined} disabled={Boolean(done)}>
              <span className="cfg-step-num">{n < step ? <Check size={14} /> : n}</span>
              <span className="cfg-step-label">{label}</span>
            </button>
          </li>
        );
      })}
    </ol>
  );

  return (
    <main className={`cfg-page${appMode ? ' is-app' : ''}`}>
      <div ref={topRef} className="cfg-intro">
        <span className="cfg-kicker">{t.pageEyebrow}</span>
        <h1>{t.pageTitle}</h1>
        <p>{t.pageLead}</p>
      </div>

      <div className={`cfg-shell step-${step}`}>
        <div className="cfg-appbar">
          <Link to="/" className="cfg-appbar-exit" aria-label={t.exit}><X size={20} /></Link>
          <strong>{t.designerTitle}</strong>
          <button type="button" className="cfg-appbar-loc" onClick={() => goTo(1)} disabled={Boolean(done)}>
            <MapPin size={14} aria-hidden="true" /> {locationText || t.steps[0]}
          </button>
        </div>

        {stage}

        <section className="cfg-panel" aria-label={t.steps[step - 1]}>
          {stepper}
          <div className="cfg-panel-body" ref={bodyRef}>
            {!done && (
              <header className="cfg-step-head">
                <span className="cfg-kicker">{t.stepOf(step)} · {head.kicker}</span>
                <h2>{head.title}</h2>
                <p>{head.text}</p>
              </header>
            )}

            {step === 1 && (
              <div className="cfg-step">
                <h3 className="cfg-label">{t.region}</h3>
                <div ref={regionRef} className="cfg-regions" role="radiogroup" aria-label={t.region}>
                  {regions.map((item) => (
                    <button key={item.id} type="button" role="radio" aria-checked={state.region === item.id} className={`cfg-region${state.region === item.id ? ' is-selected' : ''}`} onClick={() => setRegion(item.id)}>
                      <span className="cfg-region-icon"><MapPin size={18} aria-hidden="true" /></span>
                      <span className="cfg-region-text"><strong>{item.ar}</strong><small>{item.hint}</small></span>
                      <span className="cfg-radio" aria-hidden="true" />
                    </button>
                  ))}
                </div>
                {locError?.field === 'region' && <p className="cfg-error" role="alert">{locError.message}</p>}

                {region && (
                  <div className="cfg-field">
                    <label htmlFor="cfg-city">{t.city}</label>
                    <select id="cfg-city" ref={cityRef} value={state.city} aria-invalid={locError?.field === 'city'} onChange={(event) => { setState((current) => ({ ...current, city: event.target.value })); setLocError(null); }}>
                      <option value="" disabled>{t.cityPlaceholder}</option>
                      {[...region.cities, 'Other'].map((city) => <option key={city} value={city}>{city === 'Other' ? 'مدينة أخرى — اكتب اسمها' : cityNames[city] ?? city}</option>)}
                    </select>
                    {state.city === 'Other' && (
                      <input type="text" maxLength={100} value={state.cityOther} placeholder={t.cityOther} aria-label={t.cityOther} onChange={(event) => setState((current) => ({ ...current, cityOther: event.target.value }))} />
                    )}
                    {locError?.field === 'city' && <p className="cfg-error" role="alert">{locError.message}</p>}
                  </div>
                )}

                <div className="cfg-row">
                  <div className="cfg-field">
                    <label htmlFor="cfg-type">{t.type}</label>
                    <select id="cfg-type" value={state.type} onChange={(event) => setState((current) => ({ ...current, type: event.target.value }))}>
                      {elevatorTypes.map((item) => <option key={item.id} value={item.id}>{item.ar}</option>)}
                    </select>
                  </div>
                  <div className="cfg-field">
                    <span className="cfg-field-label" id="cfg-stops-label">{t.stops}</span>
                    <div className="cfg-counter" role="group" aria-labelledby="cfg-stops-label">
                      <button type="button" aria-label={t.stopsMore} disabled={state.stops >= STOPS_MAX} onClick={() => setState((current) => ({ ...current, stops: clampStops(current.stops + 1) }))}><Plus size={18} /></button>
                      <output aria-live="polite">{state.stops}</output>
                      <button type="button" aria-label={t.stopsLess} disabled={state.stops <= STOPS_MIN} onClick={() => setState((current) => ({ ...current, stops: clampStops(current.stops - 1) }))}><Minus size={18} /></button>
                    </div>
                  </div>
                </div>
                <p className="cfg-note">{t.previewOnly}</p>
              </div>
            )}

            {step === 2 && (
              <div className="cfg-step">
                <details className="cfg-presets" open={presetsOpen} onToggle={(event) => setPresetsOpen((event.target as HTMLDetailsElement).open)}>
                  <summary><span><Palette size={16} aria-hidden="true" /> {t.presets}</span><ChevronDown size={16} aria-hidden="true" /></summary>
                  <div className="cfg-preset-list">
                    {presets.map((preset) => {
                      const wall = walls.find((item) => item.id === preset.values.wall);
                      return (
                        <button key={preset.id} type="button" className="cfg-preset" onClick={() => onPreset(preset.id)}>
                          {wall && <img src={finishSwatch(wall)} alt="" aria-hidden="true" />}
                          <span>{preset.ar}</span>
                        </button>
                      );
                    })}
                  </div>
                </details>
                <Tabs tabs={materialTabs} active={materialTab} onChange={(tab) => { setMaterialTab(tab.key); showView(tab.view); }} />
                <CurrentChoice category={materialTab as CategoryKey} state={state} />
                {t.notes[materialTab] && <p className="cfg-note">{t.notes[materialTab]}</p>}
                {materialTab === 'wall' && <SearchableGrid category="wall" state={state} onChoose={onChoose} groups />}
                {materialTab === 'floor' && <SearchableGrid category="floor" state={state} onChoose={onChoose} />}
                {materialTab === 'ceiling' && <SearchableGrid category="ceiling" state={state} onChoose={onChoose} />}
                {['trim', 'mirror'].includes(materialTab) && <OptionGrid category={materialTab as CategoryKey} state={state} onChoose={onChoose} />}
                {materialTab === 'handrail' && (
                  <>
                    <OptionGrid category="handrail" state={state} onChoose={onChoose} />
                    <h3 className="cfg-label">{categoryLabels.rail}</h3>
                    <OptionGrid category="rail" state={state} onChoose={onChoose} />
                  </>
                )}
              </div>
            )}

            {step === 3 && (
              <div className="cfg-step">
                <Tabs tabs={detailTabs} active={detailTab} onChange={(tab) => { setDetailTab(tab.key); showView(tab.view); }} />
                <CurrentChoice category={detailTab as CategoryKey} state={state} />
                {t.notes[detailTab] && <p className="cfg-note">{t.notes[detailTab]}</p>}
                {detailTab === 'panel' ? (
                  <>
                    <OptionGrid category="panel" state={state} onChoose={onChoose} />
                    <h3 className="cfg-label">{categoryLabels.panelSide}</h3>
                    <OptionGrid category="panelSide" state={state} onChoose={onChoose} />
                  </>
                ) : (
                  <OptionGrid category={detailTab as CategoryKey} state={state} onChoose={onChoose} />
                )}
              </div>
            )}

            {step === 4 && (
              <div className="cfg-step">
                {done ? (
                  <div className="cfg-done" role="status">
                    <Check size={36} aria-hidden="true" />
                    <h2>{done.via === 'api' ? t.done.title : t.done.whatsappTitle}</h2>
                    {done.reference && <p className="cfg-reference">{t.done.reference}: <strong dir="ltr">{done.reference}</strong></p>}
                    <p>{done.via === 'api' ? t.done.text : t.done.whatsappText}</p>
                    <div className="cfg-done-actions">
                      <Link className="cfg-btn cfg-btn-primary" to="/">{t.done.home}</Link>
                      <button type="button" className="cfg-btn cfg-btn-ghost" onClick={restart}>{t.done.again}</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="cfg-location-card">
                      <div>
                        <small>{t.location}</small>
                        <strong>{regionLabel(state)} · {cityLabel(state)}</strong>
                        <small>{elevatorTypes.find((item) => item.id === state.type)?.ar} · {state.stops} {t.stops}</small>
                      </div>
                      <button type="button" onClick={() => goTo(1)}>{t.change}</button>
                    </div>
                    <h3 className="cfg-label">{t.summary}</h3>
                    <dl className="cfg-summary">
                      {summaryLines(state.design).map((line) => (
                        <div key={line.category}><dt>{line.label}</dt><dd>{line.value}</dd></div>
                      ))}
                    </dl>
                    <button type="button" className="cfg-link-button" onClick={copyLink}><Link2 size={16} aria-hidden="true" /> {t.copyLink}</button>

                    <form className="cfg-form" onSubmit={submit} noValidate>
                      <h3 className="cfg-label">{t.form.title}</h3>
                      <div className="cfg-field">
                        <label htmlFor="cfg-name">{t.form.name}</label>
                        <input id="cfg-name" autoComplete="name" maxLength={120} value={form.name} aria-invalid={Boolean(formErrors.name)} aria-describedby={formErrors.name ? 'cfg-name-err' : undefined} onChange={(event) => setForm({ ...form, name: event.target.value })} />
                        {formErrors.name && <p id="cfg-name-err" className="cfg-error">{formErrors.name}</p>}
                      </div>
                      <div className="cfg-field">
                        <label htmlFor="cfg-phone">{t.form.phone}</label>
                        <input id="cfg-phone" type="tel" dir="ltr" inputMode="tel" autoComplete="tel" placeholder="05xxxxxxxx" value={form.phone} aria-invalid={Boolean(formErrors.phone)} aria-describedby={formErrors.phone ? 'cfg-phone-err' : undefined} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
                        {formErrors.phone && <p id="cfg-phone-err" className="cfg-error">{formErrors.phone}</p>}
                      </div>
                      <div className="cfg-field">
                        <label htmlFor="cfg-email">{t.form.email}</label>
                        <input id="cfg-email" type="email" dir="ltr" autoComplete="email" value={form.email} aria-invalid={Boolean(formErrors.email)} aria-describedby={formErrors.email ? 'cfg-email-err' : undefined} onChange={(event) => setForm({ ...form, email: event.target.value })} />
                        {formErrors.email && <p id="cfg-email-err" className="cfg-error">{formErrors.email}</p>}
                      </div>
                      <div className="cfg-field">
                        <label htmlFor="cfg-service">{t.form.service}</label>
                        <select id="cfg-service" value={form.service} onChange={(event) => setForm({ ...form, service: event.target.value })}>
                          {services.map((item) => <option key={item.id} value={item.id}>{item.ar}</option>)}
                        </select>
                      </div>
                      <div className="cfg-field">
                        <label htmlFor="cfg-notes">{t.form.notes}</label>
                        <textarea id="cfg-notes" maxLength={3000} rows={3} placeholder={t.form.notesPlaceholder} value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} />
                      </div>
                      <div className="cfg-honeypot" aria-hidden="true">
                        <label htmlFor="cfg-website">website</label>
                        <input id="cfg-website" tabIndex={-1} autoComplete="off" value={form.website} onChange={(event) => setForm({ ...form, website: event.target.value })} />
                      </div>
                      <label className="cfg-consent">
                        <input type="checkbox" checked={form.consent} aria-invalid={Boolean(formErrors.consent)} onChange={(event) => setForm({ ...form, consent: event.target.checked })} />
                        <span>{t.form.consentBefore}<Link to="/privacy" target="_blank">{t.form.consentLink}</Link>{t.form.consentAfter}</span>
                      </label>
                      {formErrors.consent && <p className="cfg-error">{formErrors.consent}</p>}
                      {submitError && <p className="cfg-error cfg-submit-error" role="alert">{submitError}</p>}
                      <button type="submit" className="cfg-btn cfg-btn-primary cfg-submit" disabled={sending}>
                        <Send size={18} aria-hidden="true" /> {sending ? t.form.sending : QUOTE_API_URL ? t.form.submitApi : t.form.submitWhatsapp}
                      </button>
                      {!QUOTE_API_URL && <p className="cfg-hint-text">{t.form.whatsappNote}</p>}
                      {QUOTE_API_URL && (
                        <button type="button" className="cfg-btn cfg-btn-wa" onClick={() => openWhatsapp()}><MessageCircle size={18} aria-hidden="true" /> {t.orWhatsapp}</button>
                      )}
                    </form>
                  </>
                )}
              </div>
            )}
          </div>

          {!done && (
            <div className="cfg-nav">
              {step < 4 && (
                <button type="button" className="cfg-btn cfg-btn-primary cfg-next" onClick={() => goTo(step + 1)}>
                  {t.nextTo[step]} <ArrowLeft size={18} aria-hidden="true" className="cfg-flip" />
                </button>
              )}
              {step > 1 && (
                <button type="button" className="cfg-btn cfg-btn-ghost" onClick={() => goTo(step - 1)}>
                  <ArrowRight size={18} aria-hidden="true" className="cfg-flip" /> {t.prev}
                </button>
              )}
            </div>
          )}
        </section>
      </div>
      <p className="cfg-disclaimer">{t.disclaimer}</p>

      {toast && <div className="cfg-toast" role="status">{toast}</div>}
    </main>
  );
}
