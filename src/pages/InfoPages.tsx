import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Building2, Clock3, Mail, MapPin, MessageCircle, Phone, SlidersHorizontal, Wrench } from 'lucide-react';
import { PageShell } from '../motion/motion';
import {
  articles, customerSegments, elmsReasons, gallery, img, maintenanceContracts, maintenanceFlow, marqueeItems, modernization, processSteps, products,
  services, spareParts,
} from '../content';
import {
  companyAddress, companyBrand, companyCr, companyEmail, companyUnifiedNumber, companyName, companyPhones, companyShortAddress, companyVat, serviceArea, telHref, whatsappHref,
} from '../site';
import { CardGrid, CheckList, CtaBand, ImageTile, Marquee, PageHero, Section, SectionHead, StepsLine } from '../ui/Blocks';
import { QuoteForm } from '../ui/QuoteForm';

function DesignerCta() {
  return (
    <CtaBand title="جرّب شكل الكابينة قبل التنفيذ" text="صمّم مصعدك على معاينة ثلاثية الأبعاد وأرسل التصميم لطلب السعر.">
      <Link to="/configure" className="btn btn-light btn-lg"><SlidersHorizontal size={18} aria-hidden="true" /> صمّم مصعدك</Link>
      <a href={telHref} className="btn btn-ghost btn-lg"><Phone size={18} aria-hidden="true" /> اتصل بنا</a>
    </CtaBand>
  );
}

const heroActions = (
  <>
    <Link to="/configure" className="btn btn-gold btn-lg"><SlidersHorizontal size={18} aria-hidden="true" /> صمّم مصعدك</Link>
    <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="btn btn-glass btn-lg"><MessageCircle size={18} aria-hidden="true" /> واتساب</a>
  </>
);

export function ServicesPage() {
  return (
    <PageShell>
      <PageHero crumbs={[{ label: 'الخدمات' }]} eyebrow="الخدمات" title={<>خدمات <em>تركيب وصيانة وتحديث</em> المصاعد.</>} lead="خدمات متكاملة تبدأ من المعاينة الفنية وتنتهي بالتسليم والصيانة الدورية." image={img('gold-tower')} actions={heroActions} />
      <Section>
        <SectionHead eyebrow="ماذا نقدم" title="ست خدمات، فريق واحد يتابعك." />
        <CardGrid cards={services} links={services.map((item) => item.to)} />
      </Section>
      <Marquee items={marqueeItems} dark />
      <Section tone="soft">
        <div className="split">
          <div>
            <SectionHead eyebrow="تحديث المصاعد" title="مصعد قديم؟ نحدّثه بدل استبداله." lead="عندما يكون الهيكل سليمًا، يعطيك التحديث تشغيلًا أهدأ وأكثر أمانًا بتكلفة أقل." />
            <CheckList items={modernization} />
          </div>
          <div className="split-media" data-reveal="scale"><div className="parallax-frame"><img src={img('cabin-dark')} alt="كابينة بعد التحديث" loading="lazy" data-parallax="0.15" /></div></div>
        </div>
      </Section>
      <Section>
        <SectionHead eyebrow="مراحل العمل" title="من المعاينة إلى التسليم." center />
        <StepsLine steps={processSteps} />
      </Section>
      <DesignerCta />
    </PageShell>
  );
}

export function MaintenanceContractsPage() {
  return (
    <PageShell>
      <PageHero crumbs={[{ label: 'عقود الصيانة' }]} eyebrow="عقود الصيانة" title={<>صيانة <em>شهرية وسنوية</em> تقلل الأعطال.</>} lead="الصيانة الدورية أساس سلامة المصعد. خطط واضحة تشمل الفحص والتقارير والاستجابة للأعطال وتوصيات قطع الغيار." image={img('install-top')} actions={heroActions} />
      <Section>
        <SectionHead eyebrow="أنواع العقود" title="اختر مستوى المتابعة الذي يناسب مبناك." />
        <CardGrid cards={maintenanceContracts} cols={4} />
      </Section>
      <Section tone="dark">
        <div className="split">
          <div>
            <SectionHead eyebrow="رحلة البلاغ" title="من اتصالك حتى التقرير." lead="كل بلاغ يُسجَّل ويُتابع حتى يُغلق، ويصلك تقرير بما تم." />
            <StepsLine steps={maintenanceFlow} />
          </div>
          <div className="split-media" data-reveal="scale"><div className="parallax-frame"><img src={img('grey-stairs')} alt="مصعد في مبنى سكني تحت عقد صيانة" loading="lazy" data-parallax="0.15" /></div></div>
        </div>
      </Section>
      <Section id="quote">
        <div className="quote-layout">
          <SectionHead eyebrow="اطلب عقد صيانة" title="نزور المصعد ونقترح العقد المناسب." lead="أرسل بياناتك وسنتواصل لترتيب زيارة فحص." />
          <div data-reveal="up"><QuoteForm title="طلب عقد صيانة" /></div>
        </div>
      </Section>
    </PageShell>
  );
}

export function ProductsPage() {
  return (
    <PageShell>
      <PageHero crumbs={[{ label: 'المنتجات' }]} eyebrow="المنتجات" title={<>مصاعد <em>للمنازل والمباني</em> التجارية والصحية.</>} lead="اختر نوع المصعد المناسب للمبنى، ثم اطلع على تفاصيل الحل والمزايا الفنية." image={img('round-gold')} actions={heroActions} />
      <Section>
        <div className="cards cols-2" data-stagger>
          {products.map((product) => (
            <Link key={product.slug} to={`/products/${product.slug}`} className="product-card">
              <div className="parallax-frame"><img src={product.image} alt={product.title} loading="lazy" data-parallax="0.1" /></div>
              <div className="product-card-body">
                <h3>{product.title}</h3>
                <p>{product.text}</p>
                <span className="card-more">تفاصيل المنتج <ArrowLeft size={16} className="flip" aria-hidden="true" /></span>
              </div>
            </Link>
          ))}
        </div>
      </Section>
      <DesignerCta />
    </PageShell>
  );
}

export function ProductDetailsPage() {
  const { slug } = useParams();
  const product = products.find((item) => item.slug === slug) ?? products[0];
  const others = products.filter((item) => item.slug !== product.slug);
  return (
    <PageShell>
      <PageHero crumbs={[{ label: 'المنتجات', to: '/products' }, { label: product.title }]} eyebrow="تفاصيل المنتج" title={product.title} lead={product.text} image={product.image} actions={heroActions} />
      <Section>
        <div className="quote-layout">
          <div>
            <SectionHead eyebrow="ماذا يشمل الحل؟" title="مواصفات نختارها حسب مبناك." />
            <CheckList items={product.details} />
          </div>
          <div data-reveal="up"><QuoteForm title={`طلب عرض سعر — ${product.title}`} compact /></div>
        </div>
      </Section>
      <Section tone="soft">
        <SectionHead eyebrow="منتجات أخرى" title="قد يناسبك أيضًا." />
        <div className="cards cols-3" data-stagger>
          {others.map((item) => (
            <Link key={item.slug} to={`/products/${item.slug}`} className="product-card">
              <div className="parallax-frame"><img src={item.image} alt={item.title} loading="lazy" data-parallax="0.1" /></div>
              <div className="product-card-body"><h3>{item.title}</h3><p>{item.text}</p></div>
            </Link>
          ))}
        </div>
      </Section>
    </PageShell>
  );
}

export function SparePartsPage() {
  return (
    <PageShell>
      <PageHero crumbs={[{ label: 'قطع الغيار' }]} eyebrow="قطع الغيار" title={<>قطع غيار <em>وأنظمة تحكم</em> للمصاعد.</>} lead="نوفر القطعة المناسبة بعد الفحص الفني، مع التركيب والاختبار — بدل تغيير مكونات سليمة." image={img('mirror-black')} actions={heroActions} />
      <Section>
        <SectionHead eyebrow="ما نوفره" title="مكونات أصلية وبديلة مختبرة." />
        <CardGrid cards={spareParts} cols={4} />
      </Section>
      <Section tone="soft" id="quote">
        <div className="quote-layout">
          <SectionHead eyebrow="اطلب قطعة" title="صف لنا المشكلة أو القطعة المطلوبة." lead="أرسل صورة القطعة على واتساب بعد إرسال الطلب لتسريع التحديد." />
          <div data-reveal="up"><QuoteForm title="طلب قطع غيار" /></div>
        </div>
      </Section>
    </PageShell>
  );
}

export function ProjectsPage() {
  return (
    <PageShell>
      <PageHero crumbs={[{ label: 'المشاريع' }]} eyebrow="المشاريع" title={<>أعمال <em>على أرض الواقع.</em></>} lead="فلل وقصور ومبانٍ سكنية — تركيب وتحديث وتشطيبات نفذها فريقنا." image={img('showroom')} actions={heroActions} />
      <Section>
        <div className="gallery" data-stagger>
          {gallery.map((item) => <ImageTile key={item.title} image={item.image} title={item.title} tag={item.tag} />)}
        </div>
      </Section>
      <DesignerCta />
    </PageShell>
  );
}

export function MediaPage() {
  return (
    <PageShell>
      <PageHero compact crumbs={[{ label: 'الميديا' }]} eyebrow="الميديا" title="صور من أعمالنا." lead="معرض من ملفات المشاريع والصيانة والتشطيبات." />
      <Section>
        <div className="gallery" data-stagger>
          {[...gallery].reverse().map((item) => <ImageTile key={item.title} image={item.image} title={item.title} tag={item.tag} />)}
        </div>
      </Section>
    </PageShell>
  );
}

export function CustomersPage() {
  return (
    <PageShell>
      <PageHero crumbs={[{ label: 'عملاؤنا' }]} eyebrow="عملاؤنا" title={<>نخدم <em>ملاكًا ومقاولين</em> ومنشآت.</>} lead={`تعمل ${companyName} مع شرائح مختلفة، ولكل شريحة طريقة تعامل واضحة من المعاينة حتى خدمة ما بعد البيع.`} image={img('lobby')} actions={heroActions} />
      <Section>
        <CardGrid cards={customerSegments} cols={4} />
      </Section>
      <Section tone="soft">
        <div className="info-strip" data-stagger>
          <span>الرقم الوطني الموحد: {companyUnifiedNumber}</span>
          <span>سجل تجاري: {companyCr}</span>
          <span>الرقم الضريبي: {companyVat}</span>
          <span>الجوال: {companyPhones[0]}</span>
          <span>{companyAddress}</span>
        </div>
      </Section>
      <DesignerCta />
    </PageShell>
  );
}

export function ArticlesPage() {
  return (
    <PageShell>
      <PageHero compact crumbs={[{ label: 'المقالات' }]} eyebrow="المقالات" title="نصائح حول المصاعد." lead="محتوى مبسط يساعدك على فهم الصيانة والسلامة والتحديث قبل اتخاذ القرار." />
      <Section>
        <div className="cards cols-3" data-stagger>
          {articles.map((article) => (
            <article key={article.title} className="product-card">
              <div className="parallax-frame"><img src={article.image} alt="" loading="lazy" data-parallax="0.1" /></div>
              <div className="product-card-body"><h3>{article.title}</h3><p>{article.text}</p></div>
            </article>
          ))}
        </div>
      </Section>
    </PageShell>
  );
}

export function BranchesPage() {
  const points = [
    { icon: <MapPin />, title: 'مكة المكرمة', text: `${companyAddress} (${companyShortAddress})` },
    { icon: <Phone />, title: 'خدمة العملاء', text: `طلبات الصيانة والمعاينة — ${companyPhones[0]}` },
    { icon: <Building2 />, title: 'نطاق الخدمة', text: serviceArea },
    { icon: <Wrench />, title: 'الطوارئ', text: `دعم فني للأعطال على مدار الساعة — ${companyPhones[0]}` },
  ];
  return (
    <PageShell>
      <PageHero compact crumbs={[{ label: 'الفروع' }]} eyebrow="الفروع" title="نقاط خدمة قريبة منك." lead="نغطي منطقة مكة بخدمة تركيب وصيانة منظمة ومواعيد واضحة." />
      <Section><CardGrid cards={points} cols={4} /></Section>
    </PageShell>
  );
}

export function AboutPage() {
  const identity = [
    { icon: <Building2 />, title: 'من نحن', text: `${companyName}، ${companyBrand}، مؤسسة سعودية في مجال المصاعد وخدمات ما بعد البيع، مقرها ${companyAddress}.` },
    { icon: <Wrench />, title: 'ماذا نفعل', text: 'تركيب المصاعد، الصيانة الوقائية والتصحيحية، تحديث المصاعد القديمة، قطع الغيار، وعقود الصيانة الشهرية والسنوية.' },
    { icon: <MapPin />, title: 'أين نعمل', text: `نخدم ${serviceArea}، وننسّق زيارات للمدن الأخرى حسب نوع الطلب.` },
  ];
  return (
    <PageShell>
      <PageHero crumbs={[{ label: 'من نحن' }]} eyebrow="عن المؤسسة" title={<>أكثر من <em>30 عامًا</em> مع المصاعد.</>} lead="مصعد آمن، زيارة موثقة، واستجابة منظمة — هذا ما نعمل عليه كل يوم." image={img('villa-gold-2')} actions={heroActions} />
      <Section><CardGrid cards={identity} /></Section>
      <Section tone="soft">
        <div className="split">
          <div>
            <SectionHead eyebrow="كيف تتم الصيانة؟" title="رحلة تبدأ من البلاغ وتنتهي بتقرير." />
            <StepsLine steps={maintenanceFlow} />
          </div>
          <div className="split-media" data-reveal="scale"><div className="parallax-frame"><img src={img('black-modern')} alt="مصعد حديث من أعمال المؤسسة" loading="lazy" data-parallax="0.15" /></div></div>
        </div>
      </Section>
      <Section tone="dark">
        <div className="split">
          <SectionHead eyebrow="لماذا ELMS؟" title="نظام يدير البلاغات والإشعارات وخدمة ما بعد البيع." lead="بيانات الموقع والمصعد وحالة البلاغ والمتابعة الفنية في مكان واحد، بدل الرسائل المتفرقة." />
          <CheckList items={elmsReasons} />
        </div>
      </Section>
      <DesignerCta />
    </PageShell>
  );
}

export function ContactPage() {
  return (
    <PageShell>
      <PageHero compact crumbs={[{ label: 'تواصل معنا' }]} eyebrow="تواصل معنا" title={<>نحن على بُعد <em>اتصال.</em></>} lead="للمعاينة أو الصيانة أو قطع الغيار أو الطوارئ." />
      <Section>
        <div className="quote-layout">
          <div className="contact-stack" data-stagger>
            <a className="contact-item" href={telHref}><span className="card-icon" aria-hidden="true"><Phone size={20} /></span><span><small>الجوال</small><strong dir="ltr">{companyPhones[0]}</strong></span></a>
            <a className="contact-item" href={whatsappHref} target="_blank" rel="noopener noreferrer"><span className="card-icon" aria-hidden="true"><MessageCircle size={20} /></span><span><small>واتساب</small><strong>راسلنا مباشرة</strong></span></a>
            <a className="contact-item" href={`mailto:${companyEmail}`}><span className="card-icon" aria-hidden="true"><Mail size={20} /></span><span><small>البريد</small><strong>{companyEmail}</strong></span></a>
            <div className="contact-item"><span className="card-icon" aria-hidden="true"><MapPin size={20} /></span><span><small>العنوان · {companyShortAddress}</small><strong>{companyAddress}</strong></span></div>
            <div className="contact-item"><span className="card-icon" aria-hidden="true"><Clock3 size={20} /></span><span><small>الطوارئ</small><strong>على مدار الساعة</strong></span></div>
          </div>
          <div data-reveal="up"><QuoteForm title="أرسل طلبك" /></div>
        </div>
      </Section>
      <Section tone="soft">
        <div className="info-strip" data-stagger>
          <span>{companyBrand}</span>
          <span>الرقم الوطني الموحد: {companyUnifiedNumber}</span>
          <span>س.ت: {companyCr}</span>
          <span>الرقم الضريبي: {companyVat}</span>
          <span>نخدم {serviceArea}</span>
        </div>
      </Section>
    </PageShell>
  );
}

export function ExperiencePage() {
  return (
    <PageShell>
      <PageHero compact crumbs={[{ label: 'تجربة العميل' }]} eyebrow="تجربة العميل" title="رحلة واضحة من الطلب إلى التقرير." lead="هكذا تتم المعاينة والصيانة وقطع الغيار من لحظة الطلب حتى استلام التقرير الفني." />
      <Section><StepsLine steps={maintenanceFlow} /></Section>
      <DesignerCta />
    </PageShell>
  );
}
