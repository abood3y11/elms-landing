import { useEffect, useLayoutEffect, useRef, type RefObject } from 'react';
import { useLocation } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Pages opt in with data attributes, so content stays plain markup:
//   data-reveal="up|start|end|scale"  fade/slide in once when scrolled into view
//   data-stagger                      reveal the element's children one after another
//   data-parallax="0.15"              drift vertically while its section scrolls past
//   data-line                         a rule that draws itself as you scroll
//   data-line-y                       a vertical progress line filled by scroll (parent is the track)
//   data-count="30"                   count up to the number once visible

export const reducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const isRtl = () => typeof document !== 'undefined' && document.documentElement.dir !== 'ltr';

export function useScrollMotion(root: RefObject<HTMLElement | null>) {
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    const scope = root.current;
    if (!scope || reducedMotion()) return undefined;
    const rtl = isRtl();

    const ctx = gsap.context(() => {
      // fromTo, not from: a `from` tween animates to whatever the element looks like when it is
      // created, so an element that is already hidden then animates hidden → hidden and stays empty.
      gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) => {
        const kind = el.dataset.reveal;
        const from: gsap.TweenVars = { autoAlpha: 0 };
        if (kind === 'start') from.x = rtl ? 60 : -60;
        else if (kind === 'end') from.x = rtl ? -60 : 60;
        else if (kind === 'scale') { from.scale = 0.92; from.y = 20; }
        else from.y = 42;
        gsap.fromTo(el, from, {
          autoAlpha: 1, x: 0, y: 0, scale: 1, duration: 0.9, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        });
      });

      gsap.utils.toArray<HTMLElement>('[data-stagger]').forEach((group) => {
        gsap.fromTo(group.children, { autoAlpha: 0, y: 34 }, {
          autoAlpha: 1,
          y: 0,
          duration: 0.75,
          ease: 'power3.out',
          stagger: 0.08,
          scrollTrigger: { trigger: group, start: 'top 86%', once: true },
        });
      });

      gsap.utils.toArray<HTMLElement>('[data-parallax]').forEach((el) => {
        const speed = Number(el.dataset.parallax) || 0.15;
        gsap.fromTo(
          el,
          { yPercent: -speed * 50 },
          {
            yPercent: speed * 50,
            ease: 'none',
            scrollTrigger: { trigger: el.parentElement ?? el, start: 'top bottom', end: 'bottom top', scrub: true },
          },
        );
      });

      gsap.utils.toArray<HTMLElement>('[data-line]').forEach((el) => {
        gsap.fromTo(
          el,
          { scaleX: 0 },
          {
            scaleX: 1,
            transformOrigin: rtl ? '100% 50%' : '0% 50%',
            ease: 'none',
            scrollTrigger: { trigger: el, start: 'top 92%', end: 'top 55%', scrub: true },
          },
        );
      });

      gsap.utils.toArray<HTMLElement>('[data-line-y]').forEach((el) => {
        gsap.fromTo(
          el,
          { scaleY: 0 },
          {
            scaleY: 1,
            transformOrigin: '50% 0%',
            ease: 'none',
            scrollTrigger: { trigger: el.parentElement ?? el, start: 'top 70%', end: 'bottom 60%', scrub: true },
          },
        );
      });

      gsap.utils.toArray<HTMLElement>('[data-count]').forEach((el) => {
        const target = Number(el.dataset.count);
        if (!Number.isFinite(target)) return;
        const counter = { value: 0 };
        el.textContent = '0';
        gsap.to(counter, {
          value: target,
          duration: 1.6,
          ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 90%', once: true },
          onUpdate: () => { el.textContent = String(Math.round(counter.value)); },
        });
      });
    }, scope);

    // Images and lazy sections change the page height after mount.
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener('load', refresh);
    const timer = window.setTimeout(refresh, 600);
    return () => {
      window.removeEventListener('load', refresh);
      window.clearTimeout(timer);
      ctx.revert();
    };
  }, [root, pathname]);
}

/** Wraps every page: scrolls to the top, plays the entrance, and wires the scroll motion. */
export function PageShell({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useScrollMotion(ref);

  useLayoutEffect(() => {
    if (!ref.current || reducedMotion()) return undefined;
    const tween = gsap.fromTo(ref.current, { autoAlpha: 0, y: 26 }, { autoAlpha: 1, y: 0, duration: 0.7, ease: 'power3.out', clearProps: 'transform' });
    return () => { tween.kill(); };
  }, []);

  return <div ref={ref} className={`page-root ${className}`}>{children}</div>;
}

/** A brand-coloured line that sweeps across the top of the screen on every route change. */
export function RouteLine() {
  const { pathname } = useLocation();
  const line = useRef<HTMLDivElement>(null);
  const first = useRef(true);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
    if (first.current) {
      first.current = false;
      return undefined;
    }
    if (!line.current || reducedMotion()) return undefined;
    const rtl = isRtl();
    const tl = gsap.timeline();
    tl.set(line.current, { autoAlpha: 1, scaleX: 0, transformOrigin: rtl ? '100% 50%' : '0% 50%' })
      .to(line.current, { scaleX: 1, duration: 0.55, ease: 'power2.inOut' })
      .to(line.current, { autoAlpha: 0, duration: 0.3 });
    return () => { tl.kill(); };
  }, [pathname]);

  return <div ref={line} className="route-line" aria-hidden="true" />;
}
