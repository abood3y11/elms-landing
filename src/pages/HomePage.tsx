import { lazy, Suspense, useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Link } from 'react-router-dom';
import { ArrowLeft, BellRing, CheckCircle2, Mail, MapPin, MessageCircle, Phone, ShieldCheck, SlidersHorizontal, Sparkles } from 'lucide-react';
import { PageShell, reducedMotion } from '../motion/motion';
import { faqs, gallery, heroProofs, img, journey, marqueeItems, products, promises, quickAnswers, services, stats, testimonials } from '../content';
import { companyAddress, companyEmail, companyPhones, telHref, whatsappHref } from '../site';
import { CardGrid, Commitments, Faq, ImageTile, Marquee, Reviews, Section, SectionHead, StepsLine } from '../ui/Blocks';
import { QuoteForm } from '../ui/QuoteForm';

const ScrollElevatorRail = lazy(() => import('../components/ScrollElevatorRail'));

const designerSwatches = ['#bf9466', '#ece9e3', '#c9a55a', '#2a2a2d', '#c3c9cd'];

// The hero photo changes while the hero scrolls away.
const heroShots = [
  { src: img('villa-gold'), alt: 'مصعد فيلا بتشطيب ذهبي من أعمال HENS LINE' },
  { src: img('palace'), alt: 'مصعد زجاجي في قصر' },
  { src: img('black-modern'), alt: 'مصعد حديث بتشطيب أسود' },
];

// The pinned «30 years» story: one photo per stop, swapped by scrolling.
const storySlides = [
  { image: img('villa-gold-2'), tag: 'الفلل', title: 'مصاعد فلل بتشطيب ذهبي وزجاجي', text: 'تصاميم هادئة للمنازل الخاصة، تركيب نظيف ومتابعة بعد التسليم.' },
  { image: img('palace'), tag: 'القصور والصالات', title: 'إطارات بانورامية تبرز المكان', text: 'مصاعد زجاجية في وسط الدرج تصبح جزءًا من تصميم البيت.' },
  { image: img('round-gold'), tag: 'بانورامي', title: 'مصاعد دائرية بزجاج كامل', text: 'حلول خاصة للمساحات المفتوحة والصالات المرتفعة.' },
  { image: img('black-modern'), tag: 'سكني وتجاري', title: 'كبائن حديثة للمباني السكنية', text: 'تشغيل هادئ، أنظمة أمان حديثة، وصيانة دورية بعقد واضح.' },
  { image: img('outdoor-shaft'), tag: 'خارجي', title: 'مصاعد خارجية على الواجهة', text: 'عندما لا يتوفر بئر داخلي، نبني الهيكل خارج المبنى بأمان.' },
];

function useHomeScenes(root: React.RefObject<HTMLDivElement | null>) {
  useLayoutEffect(() => {
    const scope = root.current;
    if (!scope || reducedMotion()) return undefined;
    const ctx = gsap.context(() => {
      // Hero: cross-fade the main photo while the hero scrolls out.
      const shots = gsap.utils.toArray<HTMLElement>('.hero-swap img');
      if (shots.length > 1) {
        gsap.set(shots.slice(1), { autoAlpha: 0 });
        const heroTl = gsap.timeline({ scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.6 } });
        shots.slice(1).forEach((shot, i) => {
          heroTl.to(shots[i], { autoAlpha: 0, duration: 1 }).fromTo(shot, { autoAlpha: 0, scale: 1.12 }, { autoAlpha: 1, scale: 1, duration: 1 }, '<');
        });
      }
      gsap.to('.hero-bignum', { yPercent: 35, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

      // Story: pin the section and step through the photos.
      const section = scope.querySelector<HTMLElement>('.story');
      if (!section) return;
      const photos = gsap.utils.toArray<HTMLElement>('.story-photo', section);
      const captions = gsap.utils.toArray<HTMLElement>('.story-caption', section);
      const steps = photos.length - 1;
      gsap.set(photos.slice(1), { autoAlpha: 0 });
      gsap.set(captions.slice(1), { autoAlpha: 0, y: 40 });
      const tl = gsap.timeline({
        defaults: { ease: 'power2.inOut' },
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: () => '+=' + String(window.innerHeight * steps * 0.7),
          pin: true,
          refreshPriority: 1,
          scrub: 0.8,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const index = Math.min(steps, Math.round(self.progress * steps));
            section.querySelectorAll('.story-dots i').forEach((dot, i) => dot.classList.toggle('on', i <= index));
            const counter = section.querySelector('.story-count b');
            if (counter) counter.textContent = String(index + 1).padStart(2, '0');
          },
        },
      });
      tl.fromTo('.story-bignum', { scale: 0.85, yPercent: 8 }, { scale: 1.12, yPercent: -8, ease: 'none', duration: steps }, 0);
      for (let i = 1; i <= steps; i += 1) {
        const at = i - 1;
        tl.to(photos[i - 1], { autoAlpha: 0, scale: 1.08, duration: 0.6 }, at + 0.2)
          .fromTo(photos[i], { autoAlpha: 0, scale: 1.18 }, { autoAlpha: 1, scale: 1, duration: 0.6 }, at + 0.2)
          .to(captions[i - 1], { autoAlpha: 0, y: -40, duration: 0.45 }, at + 0.2)
          .fromTo(captions[i], { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 0.45 }, at + 0.45);
      }
    }, scope);
    ScrollTrigger.sort();
    ScrollTrigger.refresh();
    return () => ctx.revert();
  }, [root]);
}

function Story() {
  return (
    <section className="story" aria-label="أكثر من 30 عامًا من الخبرة">
      <div className="story-bignum" aria-hidden="true"><span>30</span><small>عامًا</small></div>
      <div className="story-inner">
        <div className="story-copy">
          <span className="pill">شركة رائدة منذ أكثر من 30 عامًا</span>
          <h2>خبرة <em>30 عامًا</em> في كل مصعد نركّبه.</h2>
          <div className="story-captions">
            {storySlides.map((slide) => (
              <div key={slide.title} className="story-caption">
                <span className="story-tag">{slide.tag}</span>
                <h3>{slide.title}</h3>
                <p>{slide.text}</p>
              </div>
            ))}
          </div>
          <div className="story-progress" aria-hidden="true">
            <span className="story-count"><b>01</b> / {String(storySlides.length).padStart(2, '0')}</span>
            <span className="story-dots">{storySlides.map((slide, i) => <i key={slide.title} className={i === 0 ? 'on' : ''} />)}</span>
          </div>
        </div>
        <div className="story-media">
          {storySlides.map((slide, i) => <img key={slide.title} className="story-photo" src={slide.image} alt={slide.title} loading={i === 0 ? 'eager' : 'lazy'} />)}
          <div className="story-badge"><strong>+30</strong><span>عامًا من الخبرة</span></div>
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  const root = useRef<HTMLDivElement>(null);
  useHomeScenes(root);
  return (
    <div ref={root}>
    <PageShell className="is-home">
      <Suspense fallback={null}><ScrollElevatorRail /></Suspense>

      <section className="hero">
        <div className="hero-bignum" aria-hidden="true"><span>30</span><small>عامًا من الريادة</small></div>
        <div className="hero-inner">
          <div>
            <span className="pill" data-reveal="up"><Sparkles size={15} aria-hidden="true" /> أكثر من 30 عامًا في المصاعد — مكة المكرمة</span>
            <h1 data-reveal="up">اطمئن على كل من <em>يركب مصعدك.</em></h1>
            <p className="hero-lead" data-reveal="up">
              أهل بيتك، سكان عمارتك، أو زوار منشأتك: نعاين مبناك قبل أي عرض سعر، ونختبر أنظمة السلامة أمامك قبل التسليم،
              ثم نتابع المصعد بعقد صيانة وبلاغات موثقة في نظامنا ودعم طوارئ على مدار الساعة.
            </p>
            <div className="actions" data-reveal="up">
              <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-lg"><MessageCircle size={18} aria-hidden="true" /> احجز معاينة على واتساب</a>
              <a href={telHref} className="btn btn-ghost btn-lg"><Phone size={18} aria-hidden="true" /> <span dir="ltr">{companyPhones[0]}</span></a>
            </div>
            <ul className="hero-proofs" data-stagger>
              {heroProofs.map((proof) => <li key={proof}><CheckCircle2 size={16} aria-hidden="true" /> {proof}</li>)}
            </ul>
          </div>
          <div className="hero-visual" data-reveal="scale">
            <div className="parallax-frame main hero-swap">
              {heroShots.map((shot, i) => <img key={shot.src} src={shot.src} alt={shot.alt} loading={i === 0 ? 'eager' : 'lazy'} />)}
            </div>
            <div className="parallax-frame second" data-parallax="-0.25"><img src={img('round-gold')} alt="مصعد بانورامي دائري" /></div>
            <div className="float-wrap a" data-parallax="-0.4">
              <div className="float-card">
                <span className="card-icon" aria-hidden="true"><BellRing size={20} /></span>
                <div><strong>طوارئ 24/7</strong><small>فريق جاهز للأعطال</small></div>
              </div>
            </div>
            <div className="float-wrap b" data-parallax="0.3">
              <div className="float-card is-hero">
                <strong className="float-num">+30</strong>
                <div><strong>عامًا من الخبرة</strong><small>شركة رائدة في المصاعد</small></div>
              </div>
            </div>
            <div className="float-wrap c" data-parallax="-0.2">
              <div className="float-card">
                <span className="card-icon" aria-hidden="true"><ShieldCheck size={20} /></span>
                <div><strong>عقود AMC</strong><small>صيانة شهرية وسنوية</small></div>
              </div>
            </div>
          </div>
          <div className="hero-stats">
            <div className="stats-grid" data-reveal="up">
              {stats.map((item) => (
                <div key={item.label}>
                  <strong><span data-count={item.value}>{item.value}</span>{item.suffix}</strong>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="quick" aria-label="إجابات سريعة">
        <div className="quick-grid" data-stagger>
          {quickAnswers.map((item) => (
            <article key={item.q} className="quick-item">
              <strong>{item.q}</strong>
              <p>{item.a}</p>
            </article>
          ))}
        </div>
      </section>

      <Story />

      <Section id="promises">
        <SectionHead
          eyebrow="وعدنا لك"
          title="30 عامًا علّمتنا أن الثقة تُبنى بخطوات واضحة، لا بالكلام."
          lead="اختيار شركة المصاعد قرار يعيش معك سنوات. لذلك نحوّل كل وعد إلى خطوة تعرفها وترى نتيجتها: قبل أن تدفع، ويوم التسليم، وفي كل زيارة بعده."
        />
        <Commitments items={promises} />
      </Section>

      <Section tone="soft" id="services">
        <SectionHead eyebrow="خدماتنا" title="من أول معاينة إلى آخر زيارة صيانة." lead="للفلل والعمائر والمباني التجارية والمنشآت الصحية — فريق واحد مسؤول عن مصعدك طوال عمره." />
        <CardGrid cards={services} links={services.map((item) => item.to)} />
      </Section>

      <Marquee items={marqueeItems} />

      <Section tone="dark" id="designer">
        <div className="designer-promo">
          <div>
            <SectionHead eyebrow="صمّم مصعدك" title="شاهد كابينتك قبل أن نركّبها." lead="جرّب الجدران والأرضيات والأسقف والأبواب على معاينة ثلاثية الأبعاد، ثم أرسل التصميم لنرد بعرض السعر." />
            <ol className="designer-steps" data-stagger>
              <li><div><strong>اختر موقعك</strong><small>المنطقة والمدينة ونوع المصعد</small></div></li>
              <li><div><strong>جرّب الخامات</strong><small>خشب، رخام، استيل، وإضاءة</small></div></li>
              <li><div><strong>اطلب السعر</strong><small>نراجع التصميم فنيًا ونرد عليك</small></div></li>
            </ol>
            <div className="actions" data-reveal="up">
              <Link to="/configure" className="btn btn-gold btn-lg"><SlidersHorizontal size={18} aria-hidden="true" /> ابدأ التصميم</Link>
            </div>
          </div>
          <div className="designer-visual" data-reveal="scale">
            <div className="parallax-frame"><img src={img('palace')} alt="مصعد زجاجي في قصر من تنفيذ HENS LINE" data-parallax="0.15" /></div>
            <div className="swatch-row" data-parallax="-0.3" aria-hidden="true">
              {designerSwatches.map((color) => <span key={color} style={{ background: color }} />)}
            </div>
          </div>
        </div>
      </Section>

      <Section id="products">
        <SectionHead eyebrow="منتجاتنا" title="لكل مبنى المصعد الذي يناسبه." lead="من الفلل الصغيرة إلى المنشآت الصحية، نختار الحل حسب المساحة والاستخدام — ونقولك بصراحة إذا كان نوع ما لا يناسب مبناك." />
        <div className="cards cols-4" data-stagger>
          {products.map((product) => (
            <Link key={product.slug} to={`/products/${product.slug}`} className="product-card">
              <div className="parallax-frame"><img src={product.image} alt={product.title} loading="lazy" data-parallax="0.1" /></div>
              <div className="product-card-body">
                <h3>{product.title}</h3>
                <p>{product.text}</p>
                <span className="card-more">التفاصيل <ArrowLeft size={16} className="flip" aria-hidden="true" /></span>
              </div>
            </Link>
          ))}
        </div>
      </Section>

      <Section tone="soft" id="journey">
        <div className="split">
          <div>
            <SectionHead eyebrow="رحلة مصعدك" title="6 محطات واضحة، وفي كل محطة تعرف ماذا تستلم." lead="لا نبدأ عملًا وأنت لا تعرف ماذا سيحدث. تعرف دائمًا أين وصلنا وما الخطوة التالية." />
            <StepsLine steps={journey} />
          </div>
          <div className="split-media sticky-media" data-reveal="scale">
            <div className="parallax-frame"><img src={img('glass-stairs')} alt="تركيب مصعد زجاجي بجانب الدرج" loading="lazy" data-parallax="0.15" /></div>
          </div>
        </div>
      </Section>

      <Section id="projects">
        <SectionHead eyebrow="من أعمالنا" title="مصاعد ركّبناها… شاهد التفاصيل بنفسك." lead="فلل وقصور ومبانٍ سكنية في مكة وما حولها." />
        <div className="gallery" data-stagger>
          {gallery.slice(0, 6).map((item) => <ImageTile key={item.title} image={item.image} title={item.title} tag={item.tag} />)}
        </div>
        <div className="actions" style={{ marginBlockStart: 28 }} data-reveal="up">
          <Link to="/projects" className="btn btn-ghost">كل المشاريع <ArrowLeft size={16} className="flip" aria-hidden="true" /></Link>
        </div>
      </Section>

      <Section tone="dark">
        <SectionHead eyebrow="آراء العملاء" title="خدمة واضحة من أول معاينة حتى ما بعد التسليم." center />
        <Reviews items={testimonials} />
      </Section>

      <Section tone="soft" id="faq">
        <div className="split align-start">
          <SectionHead eyebrow="الأسئلة الشائعة" title="قبل أن تقرر… إجابات واضحة على أكثر ما يُسأل." lead="جمعنا الأسئلة التي يسألها عملاؤنا فعلًا قبل التركيب وبعده." />
          <Faq items={faqs} />
        </div>
      </Section>

      <Section id="quote">
        <div className="quote-layout">
          <div>
            <SectionHead eyebrow="خطوتك الأولى" title="احجز معاينة مصعدك." lead="أسهل بداية: رسالة واتساب أو اتصال. أخبرنا بالمدينة، ونوع المبنى، وعدد الأدوار، وهل يوجد بئر جاهز — ونحدد معك موعد المعاينة. وللأعطال والطوارئ نفس الرقم." />
            <div className="contact-stack" data-stagger>
              <a className="contact-item" href={telHref}><span className="card-icon" aria-hidden="true"><Phone size={20} /></span><span><small>اتصال مباشر — للحجز والأعطال والطوارئ</small><strong dir="ltr">{companyPhones[0]}</strong></span></a>
              <a className="contact-item" href={whatsappHref} target="_blank" rel="noopener noreferrer"><span className="card-icon" aria-hidden="true"><MessageCircle size={20} /></span><span><small>واتساب — اسأل عن مصعدك واحجز معاينتك</small><strong>راسلنا مباشرة</strong></span></a>
              <a className="contact-item" href={`mailto:${companyEmail}`}><span className="card-icon" aria-hidden="true"><Mail size={20} /></span><span><small>البريد</small><strong>{companyEmail}</strong></span></a>
              <div className="contact-item"><span className="card-icon" aria-hidden="true"><MapPin size={20} /></span><span><small>العنوان</small><strong>{companyAddress}</strong></span></div>
            </div>
          </div>
          <div data-reveal="up"><QuoteForm title="أو أرسل طلبك هنا" /></div>
        </div>
      </Section>
    </PageShell>
    </div>
  );
}
