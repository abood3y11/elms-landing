import { lazy, Suspense, useEffect, useRef, useState } from 'react';

const RailElevatorScene = lazy(() => import('./RailElevatorScene'));

/** Home-page stops; each id is a section on the page, so a click rides the lift there. */
export const railStops = [
  { id: 'top', label: 'البداية' },
  { id: 'services', label: 'الخدمات' },
  { id: 'designer', label: 'صمّم مصعدك' },
  { id: 'products', label: 'المنتجات' },
  { id: 'projects', label: 'المشاريع' },
  { id: 'quote', label: 'طلب عرض' },
];

/**
 * The lift descends with the page and arrives at the last stop where the footer begins;
 * once the footer is on screen the rail steps aside so it never covers it.
 */
export default function ScrollElevatorRail() {
  const railRef = useRef<HTMLDivElement>(null);
  const elevatorRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef(0);
  const hiddenRef = useRef(false);
  const [active, setActive] = useState(0);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const rail = railRef.current;
      const elevator = elevatorRef.current;
      if (!rail || !elevator) return;

      const footer = document.querySelector('footer');
      const footerTop = footer ? footer.getBoundingClientRect().top + window.scrollY : document.documentElement.scrollHeight;
      const travelEnd = Math.max(1, footerTop - window.innerHeight);
      const progress = Math.min(1, Math.max(0, window.scrollY / travelEnd));
      const travel = Math.max(0, rail.clientHeight - elevator.clientHeight);
      elevator.style.transform = `translate3d(0, ${progress * travel}px, 0)`;
      rail.style.setProperty('--scroll-progress', String(progress));

      const next = Math.min(railStops.length - 1, Math.round(progress * (railStops.length - 1)));
      if (next !== activeRef.current) {
        activeRef.current = next;
        setActive(next);
      }
      const shouldHide = footer ? footer.getBoundingClientRect().top < window.innerHeight - 40 : false;
      if (shouldHide !== hiddenRef.current) {
        hiddenRef.current = shouldHide;
        setHidden(shouldHide);
      }
    };
    const request = () => { if (!frame) frame = window.requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', request, { passive: true });
    window.addEventListener('resize', request);
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', request);
      window.removeEventListener('resize', request);
    };
  }, []);

  const go = (id: string) => {
    const target = id === 'top' ? document.body : document.getElementById(id);
    if (!target) return;
    const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (id === 'top') window.scrollTo({ top: 0, behavior: smooth ? 'smooth' : 'auto' });
    else target.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'start' });
  };

  return (
    <aside className={`home-scroll-rail${hidden ? ' is-hidden' : ''}`} aria-label="مسار المصعد في الصفحة" aria-hidden={hidden}>
      <div className="rail-head">
        <span>مسار الخدمة</span>
        <strong>HENS LINE</strong>
      </div>
      <div ref={railRef} className="rail-track">
        <div className="rail-line" />
        <div className="rail-progress-line" />
        <div ref={elevatorRef} className="rail-elevator-model">
          <Suspense fallback={<div className="rail-loading">3D</div>}>
            <RailElevatorScene />
          </Suspense>
        </div>
        <div className="rail-dots">
          {railStops.map((stop, index) => (
            <button
              type="button"
              key={stop.id}
              className={index <= active ? 'active' : undefined}
              style={{ top: `${(index / (railStops.length - 1)) * 100}%` }}
              onClick={() => go(stop.id)}
              tabIndex={hidden ? -1 : 0}
            >
              <i />
              <b>{stop.label}</b>
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
