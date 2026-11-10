import { lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, BellRing, ClipboardCheck, Mail, MapPin, MessageCircle, Phone, ShieldCheck, SlidersHorizontal, Sparkles } from 'lucide-react';
import { PageShell } from '../motion/motion';
import { gallery, img, marqueeItems, processSteps, products, services, stats, testimonials } from '../content';
import { companyAddress, companyEmail, companyPhones, telHref, whatsappHref } from '../site';
import { CardGrid, CtaBand, ImageTile, Marquee, Section, SectionHead, Stars, StepsLine } from '../ui/Blocks';
import { QuoteForm } from '../ui/QuoteForm';

const ScrollElevatorRail = lazy(() => import('../components/ScrollElevatorRail'));

const designerSwatches = ['#bf9466', '#ece9e3', '#c9a55a', '#2a2a2d', '#c3c9cd'];

export default function HomePage() {
  return (
    <PageShell className="is-home">
      <Suspense fallback={null}><ScrollElevatorRail /></Suspense>

      <section className="hero">
        <div className="hero-inner">
          <div>
            <span className="pill" data-reveal="up"><Sparkles size={15} aria-hidden="true" /> تركيب وصيانة وتحديث المصاعد</span>
            <h1 data-reveal="up">مصاعد آمنة <em>بتصميم يليق</em> بمبناك.</h1>
            <p className="hero-lead" data-reveal="up">
              نركّب مصاعد الفلل والمباني التجارية، ونتابعها بعقود صيانة ودعم طوارئ على مدار الساعة — وصمّم كابينتك بنفسك قبل أن نبدأ.
            </p>
            <div className="actions" data-reveal="up">
              <Link to="/configure" className="btn btn-primary btn-lg"><SlidersHorizontal size={18} aria-hidden="true" /> صمّم مصعدك</Link>
              <a href={telHref} className="btn btn-ghost btn-lg"><Phone size={18} aria-hidden="true" /> <span dir="ltr">{companyPhones[0]}</span></a>
            </div>
            <ul className="hero-trust" data-stagger>
              <li><ShieldCheck size={18} aria-hidden="true" /> اختبارات سلامة قبل التسليم</li>
              <li><BellRing size={18} aria-hidden="true" /> طوارئ 24/7</li>
              <li><ClipboardCheck size={18} aria-hidden="true" /> عقود صيانة AMC</li>
            </ul>
          </div>
          <div className="hero-visual" data-reveal="scale">
            <div className="parallax-frame main"><img src={img('villa-gold')} alt="مصعد فيلا بتشطيب ذهبي من أعمال HENS LINE" data-parallax="0.12" /></div>
            <div className="parallax-frame second" data-parallax="-0.25"><img src={img('round-gold')} alt="مصعد بانورامي دائري" /></div>
            <div className="float-card a" data-parallax="-0.4">
              <span className="card-icon" aria-hidden="true"><BellRing size={20} /></span>
              <div><strong>طوارئ 24/7</strong><small>فريق جاهز للأعطال</small></div>
            </div>
            <div className="float-card b" data-parallax="0.3">
              <span className="card-icon" aria-hidden="true"><ShieldCheck size={20} /></span>
              <div><strong>+30 سنة</strong><small>خبرة في المصاعد</small></div>
            </div>
          </div>
        </div>
      </section>

      <div className="stats">
        <div className="stats-grid" data-reveal="up">
          {stats.map((item) => (
            <div key={item.label}>
              <strong><span data-count={item.value}>{item.value}</span>{item.suffix}</strong>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      <Section id="services">
        <SectionHead eyebrow="خدماتنا" title="كل ما يحتاجه مصعدك، من المعاينة حتى الصيانة." lead="فريق واحد يتابع مصعدك من أول زيارة، فلا تتنقل بين أكثر من جهة." />
        <CardGrid cards={services} links={services.map((item) => item.to)} />
      </Section>

      <Marquee items={marqueeItems} />

      <Section tone="dark" id="designer">
        <div className="designer-promo">
          <div>
            <SectionHead eyebrow="جديد — صمّم مصعدك" title="شاهد كابينتك قبل أن نركّبها." lead="جرّب الجدران والأرضيات والأسقف والأبواب على معاينة ثلاثية الأبعاد، ثم أرسل التصميم لنرد بعرض السعر." />
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

      <Section tone="soft" id="products">
        <SectionHead eyebrow="منتجاتنا" title="مصعد مناسب لكل مبنى." lead="من الفلل الصغيرة إلى المنشآت الصحية، نختار الحل حسب المساحة والاستخدام." />
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

      <Section>
        <div className="split">
          <div>
            <SectionHead eyebrow="كيف نعمل" title="أربع خطوات واضحة حتى يعمل مصعدك." lead="تعرف في كل مرحلة ما تم وما التالي." />
            <StepsLine steps={processSteps} />
          </div>
          <div className="split-media" data-reveal="scale">
            <div className="parallax-frame"><img src={img('glass-stairs')} alt="تركيب مصعد زجاجي بجانب الدرج" loading="lazy" data-parallax="0.15" /></div>
          </div>
        </div>
      </Section>

      <Section tone="soft" id="projects">
        <SectionHead eyebrow="من أعمالنا" title="مصاعد ركّبناها في مكة وما حولها." />
        <div className="gallery" data-stagger>
          {gallery.slice(0, 6).map((item) => <ImageTile key={item.title} image={item.image} title={item.title} tag={item.tag} />)}
        </div>
        <div className="actions" style={{ marginBlockStart: 28 }} data-reveal="up">
          <Link to="/projects" className="btn btn-ghost">كل المشاريع <ArrowLeft size={16} className="flip" aria-hidden="true" /></Link>
        </div>
      </Section>

      <Section tone="dark">
        <SectionHead eyebrow="آراء العملاء" title="خدمة واضحة من أول معاينة حتى ما بعد التسليم." center />
        <div className="testimonials" data-stagger>
          {testimonials.map((item) => (
            <figure key={item.name} className="quote-card">
              <Stars score={item.score} />
              <p>«{item.text}»</p>
              <strong>{item.name}</strong>
            </figure>
          ))}
        </div>
      </Section>

      <Section id="quote">
        <div className="quote-layout">
          <div>
            <SectionHead eyebrow="طلب عرض سعر" title="أخبرنا عن مشروعك." lead="املأ الطلب أو تواصل معنا مباشرة، ونرتب لك زيارة معاينة." />
            <div className="contact-stack" data-stagger>
              <a className="contact-item" href={telHref}><span className="card-icon" aria-hidden="true"><Phone size={20} /></span><span><small>اتصل بنا</small><strong dir="ltr">{companyPhones[0]}</strong></span></a>
              <a className="contact-item" href={whatsappHref} target="_blank" rel="noopener noreferrer"><span className="card-icon" aria-hidden="true"><MessageCircle size={20} /></span><span><small>واتساب</small><strong>راسلنا مباشرة</strong></span></a>
              <a className="contact-item" href={`mailto:${companyEmail}`}><span className="card-icon" aria-hidden="true"><Mail size={20} /></span><span><small>البريد</small><strong>{companyEmail}</strong></span></a>
              <div className="contact-item"><span className="card-icon" aria-hidden="true"><MapPin size={20} /></span><span><small>العنوان</small><strong>{companyAddress}</strong></span></div>
            </div>
          </div>
          <div data-reveal="up"><QuoteForm /></div>
        </div>
      </Section>

      <CtaBand title="صمّم كابينة مصعدك الآن" text="اختر الخامات وشاهد النتيجة فورًا، ثم أرسل التصميم لنرد بعرض السعر.">
        <Link to="/configure" className="btn btn-light btn-lg"><SlidersHorizontal size={18} aria-hidden="true" /> صمّم مصعدك</Link>
        <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-lg"><MessageCircle size={18} aria-hidden="true" /> واتساب</a>
      </CtaBand>
    </PageShell>
  );
}
