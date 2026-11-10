import { Link } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, Star } from 'lucide-react';
import type { ReactNode } from 'react';
import type { Card } from '../content';
import './ui.css';

export function Breadcrumbs({ items }: { items: { label: string; to?: string }[] }) {
  return (
    <nav className="crumbs" aria-label="مسار الصفحة">
      <Link to="/">الرئيسية</Link>
      {items.map((item) => (
        <span key={item.label}>
          <ChevronLeft size={14} aria-hidden="true" className="flip" />
          {item.to ? <Link to={item.to}>{item.label}</Link> : <b aria-current="page">{item.label}</b>}
        </span>
      ))}
    </nav>
  );
}

/** Dark page header with drifting shaft lines and an optional photo. */
export function PageHero({ eyebrow, title, lead, image, crumbs, actions, compact }: {
  eyebrow: string; title: ReactNode; lead?: ReactNode; image?: string; crumbs?: { label: string; to?: string }[]; actions?: ReactNode; compact?: boolean;
}) {
  return (
    <header className={`phero${image ? ' has-image' : ''}${compact ? ' is-compact' : ''}`}>
      <div className="phero-lines" data-parallax="0.35" aria-hidden="true">
        {Array.from({ length: 9 }).map((_, i) => <span key={i} />)}
      </div>
      <div className="phero-glow" aria-hidden="true" />
      <div className="phero-inner">
        <div className="phero-copy">
          {crumbs && <Breadcrumbs items={crumbs} />}
          <span className="pill" data-reveal="up">{eyebrow}</span>
          <h1 data-reveal="up">{title}</h1>
          {lead && <p className="phero-lead" data-reveal="up">{lead}</p>}
          {actions && <div className="actions" data-reveal="up">{actions}</div>}
        </div>
        {image && (
          <div className="phero-media" data-reveal="scale">
            <div className="parallax-frame"><img src={image} alt="" data-parallax="0.18" /></div>
          </div>
        )}
      </div>
    </header>
  );
}

export function SectionHead({ eyebrow, title, lead, center }: { eyebrow?: string; title: ReactNode; lead?: ReactNode; center?: boolean }) {
  return (
    <div className={`shead${center ? ' is-center' : ''}`}>
      {eyebrow && <span className="pill" data-reveal="up">{eyebrow}</span>}
      <h2 data-reveal="up">{title}</h2>
      <span className="shead-line" data-line aria-hidden="true" />
      {lead && <p data-reveal="up">{lead}</p>}
    </div>
  );
}

export function Section({ children, tone, id, className = '' }: { children: ReactNode; tone?: 'soft' | 'dark'; id?: string; className?: string }) {
  return (
    <section id={id} className={`sec${tone ? ` sec-${tone}` : ''} ${className}`}>
      <div className="sec-inner">{children}</div>
    </section>
  );
}

export function CardGrid({ cards, cols = 3, links }: { cards: Card[]; cols?: 2 | 3 | 4; links?: string[] }) {
  return (
    <div className={`cards cols-${cols}`} data-stagger>
      {cards.map((card, index) => {
        const body = (
          <>
            <span className="card-icon" aria-hidden="true">{card.icon}</span>
            <h3>{card.title}</h3>
            <p>{card.text}</p>
            {links?.[index] && <span className="card-more">التفاصيل <ArrowLeft size={16} className="flip" aria-hidden="true" /></span>}
          </>
        );
        return links?.[index]
          ? <Link key={card.title} to={links[index]} className="card is-link">{body}</Link>
          : <article key={card.title} className="card">{body}</article>;
      })}
    </div>
  );
}

/** Numbered steps joined by a line that fills as the section scrolls past. */
export function StepsLine({ steps }: { steps: Card[] }) {
  return (
    <ol className="steps">
      <span className="steps-track" aria-hidden="true"><span className="steps-fill" data-line-y /></span>
      {steps.map((step, index) => (
        <li key={step.title} data-reveal="start">
          <span className="steps-dot" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
          <div className="steps-body">
            <span className="card-icon sm" aria-hidden="true">{step.icon}</span>
            <h3>{step.title}</h3>
            <p>{step.text}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

export function ImageTile({ image, title, tag, to, tall }: { image: string; title: string; tag?: string; to?: string; tall?: boolean }) {
  const body = (
    <>
      <div className="tile-media"><img src={image} alt={title} loading="lazy" data-parallax="0.12" /></div>
      <div className="tile-caption">
        {tag && <span>{tag}</span>}
        <strong>{title}</strong>
      </div>
    </>
  );
  const className = `tile${tall ? ' is-tall' : ''}`;
  return to ? <Link to={to} className={className}>{body}</Link> : <figure className={className}>{body}</figure>;
}

export function Marquee({ items, dark }: { items: string[]; dark?: boolean }) {
  return (
    <div className={`marquee${dark ? ' is-dark' : ''}`} aria-hidden="true">
      <div className="marquee-track">
        {[...items, ...items].map((item, index) => <span key={`${item}-${index}`}>{item}</span>)}
      </div>
    </div>
  );
}

export function CtaBand({ title, text, children }: { title: string; text: string; children: ReactNode }) {
  return (
    <section className="cta">
      <span className="cta-orb a" data-parallax="0.5" aria-hidden="true" />
      <span className="cta-orb b" data-parallax="-0.4" aria-hidden="true" />
      <div className="cta-inner" data-reveal="scale">
        <div>
          <h2>{title}</h2>
          <p>{text}</p>
        </div>
        <div className="actions">{children}</div>
      </div>
    </section>
  );
}

export function Stars({ score }: { score: string }) {
  return (
    <span className="stars" aria-label={`تقييم ${score} من 5`}>
      {Array.from({ length: 5 }).map((_, index) => <Star key={index} size={15} fill="currentColor" aria-hidden="true" />)}
      <b>{score}</b>
    </span>
  );
}

export function CheckList({ items }: { items: string[] }) {
  return (
    <ul className="checks" data-stagger>
      {items.map((item) => <li key={item}>{item}</li>)}
    </ul>
  );
}
