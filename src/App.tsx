import { Link, NavLink, Route, Routes, useParams } from 'react-router-dom';
import {
  Activity,
  ArrowLeft,
  BellRing,
  Boxes,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  Headphones,
  Image as ImageIcon,
  LayoutDashboard,
  MapPin,
  Menu,
  MessageCircle,
  Newspaper,
  Phone,
  ShieldCheck,
  Sparkles,
  Star,
  Wrench,
  X,
  Zap,
} from 'lucide-react';
import { AnimatePresence, motion, useScroll, useTransform } from 'framer-motion';
import type { Transition } from 'framer-motion';
import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';

const ElevatorScene = lazy(() => import('./components/ElevatorScene'));
const RailElevatorScene = lazy(() => import('./components/RailElevatorScene'));
const BackgroundElevatorScene = lazy(() => import('./components/BackgroundElevatorScene'));
const AnimeElevatorShowcase = lazy(() => import('./components/AnimeElevatorShowcase'));

const companyName = 'مؤسسة حسين سفر النفيعي للمصاعد';
const companyBrand = 'HENS LINE';
const companyEmail = 'elevatorsystem@avix-net.com';
const companyVat = '300385366700003';
const companyCr = '4031021948';
const companyPhones = ['0571207000'];
const companyAddress = 'مكة المكرمة - شارع المنصور';

const pageTransition: Transition = { duration: 0.58, ease: 'easeOut' };
const fadeFromRight = { hidden: { opacity: 0, x: 54 }, visible: { opacity: 1, x: 0 } };
const fadeFromLeft = { hidden: { opacity: 0, x: -54 }, visible: { opacity: 1, x: 0 } };
const fadeUp = { hidden: { opacity: 0, y: 28 }, visible: { opacity: 1, y: 0 } };

function AnimatedPage({ children }: { children: React.ReactNode }) {
  return (
    <motion.div className="page-transition" initial="hidden" animate="visible" exit="hidden" variants={fadeFromRight} transition={pageTransition}>
      {children}
    </motion.div>
  );
}

function MotionSection({ children, className = '', id, 'aria-label': ariaLabel }: React.PropsWithChildren<{ className?: string; id?: string; 'aria-label'?: string }>) {
  return (
    <motion.section className={className} id={id} aria-label={ariaLabel} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-90px' }} transition={pageTransition}>
      {children}
    </motion.section>
  );
}

const services = [
  { icon: <Building2 />, title: 'تركيب المصاعد', text: 'توريد وتركيب مصاعد الفلل والمباني السكنية والأبراج التجارية والمنشآت الصحية.' },
  { icon: <ShieldCheck />, title: 'الصيانة الوقائية', text: 'زيارات دورية، فحص سلامة، اختبار أبواب، مراجعة لوحة التحكم، وتقارير خدمة شهرية.' },
  { icon: <BellRing />, title: 'دعم طوارئ 24/7', text: 'استجابة للأعطال العاجلة وحالات التوقف، مع فريق فني جاهز لخدمة العملاء.' },
  { icon: <Zap />, title: 'تحديث المصاعد', text: 'تطوير المصاعد القديمة عبر تحديث الكنترول والأبواب والمحركات وأنظمة السلامة.' },
  { icon: <Boxes />, title: 'قطع الغيار', text: 'محركات، لوحات تحكم، إنفرترات، حساسات، أزرار، كابلات، وأنظمة أمان.' },
  { icon: <ClipboardCheck />, title: 'عقود صيانة سنوية', text: 'عقود AMC شهرية وسنوية تشمل الزيارات الوقائية وتقارير الحالة والتوصيات الفنية.' },
];

const products = [
  {
    slug: 'home-elevators',
    title: 'مصاعد منزلية',
    text: 'مصاعد أنيقة وعملية تناسب الفلل والمنازل، مع حلول للمساحات المحدودة ومستويات أمان عالية.',
    image: 'https://images.openai.com/static-rsc-4/9wU6DcWBny5CK4jtkKlHudAUAwM2C7vfe61bDXzCXKwR7JpUc2adOLOkgz3CgOwJVNiF_PrKvKwdeAtKZRwaEx8QX-wkeA1eK1rPQvcmFvchFzSCNoMt84SA8rJNkFuydufbYqd31VUG6sPF16ij59ZIv_mhNc-jEyRsTdWBsNQTX-p__c1hhNBCLoBPQrwI?purpose=fullsize',
    details: ['تصاميم مناسبة للفلل والمنازل الخاصة', 'تشغيل هادئ واستهلاك طاقة منخفض', 'خيارات متعددة للكابينة والأبواب', 'حلول مناسبة للمساحات المحدودة'],
  },
  {
    slug: 'passenger-elevators',
    title: 'مصاعد الأفراد',
    text: 'مصاعد ركاب للمباني السكنية والتجارية بتصاميم متعددة وتشغيل هادئ ومريح.',
    image: 'https://images.openai.com/static-rsc-4/qlp-rs1QKR9TQsLxoGvn3mjn_wbj0BKkHV8jLB_KaKJbwR9evYjSUfxvSo0o_wF6k1uzbHkwsfnurTHOJ6tINvbD_DjlXfX7y8sZ3BHI7S2bSgWrQbGHjv--TiptCJpW9G8E7Y_1173Pic8_x7Tjz9JjX6fKMvyszZgdNBh3HGs7lNarphELBZWLJntfv3qK?purpose=fullsize',
    details: ['مناسبة للعمائر والمكاتب والمباني التجارية', 'أنظمة أمان وتحكم حديثة', 'تصميم كبائن حسب هوية المبنى', 'خيارات سرعة وسعة متعددة'],
  },
  {
    slug: 'outdoor-elevators',
    title: 'مصاعد خارجية',
    text: 'مصاعد زجاجية أو معدنية مقاومة للعوامل الجوية وتضيف قيمة جمالية لواجهة المبنى.',
    image: 'https://images.openai.com/static-rsc-4/IKVg2lGPTRHuA9QKkX9aBNV3fQbPa_QQ_zlsiuucr_Mjg7-2AvCwQjvxfoBWV_N1x8ptSsfD-J_EuAw-V4ue_G4XXERuQwYUje5sOPg0mnMCAwAIyEmvKyBFjFDz1L-r7UhFzgQ0zSailuVUVCw1tgsbE7WTkukdCyNsYjlQvLPHutk93zKr9qVtp7AwzPPA?purpose=fullsize',
    details: ['هيكل خارجي مقاوم للعوامل الجوية', 'واجهات زجاجية أو معدنية حسب التصميم', 'حل مناسب عند عدم توفر بئر داخلي', 'تنفيذ يراعي شكل واجهة المبنى'],
  },
  {
    slug: 'hospital-elevators',
    title: 'مصاعد المستشفيات',
    text: 'حلول مصممة لنقل المرضى والمعدات بسلاسة، مع كبائن واسعة وتحمل للاستخدام المتكرر.',
    image: 'https://images.openai.com/static-rsc-4/39b7cxxhtbe_NiwGblOWBmGlbbz5CUtTk_D6Vc-AXQ16VtcauimcaYl534RDowQZ30Zi7YdIuN0dSSDsnSksG8heBvFaUF2bXor7TvOugvuS6NsjQuTETcd3lSUpj-pZfwCC-dfpWeGqq5NEd2BCuygk3BxjmbiKD5ag0f4qY420kxHw9iqSLE4b-opXuMgs?purpose=fullsize',
    details: ['كبائن واسعة تناسب الأسرة والمعدات', 'تشغيل مستقر للاستخدام المتكرر', 'أرضيات ومواد سهلة التنظيف', 'أولوية عالية لاختبارات السلامة والاعتمادية'],
  },
];

const spareParts = [
  { title: 'لوحات التحكم', text: 'توريد وتركيب لوحات تحكم وإنفرترات مناسبة لنوع المصعد وحالته التشغيلية.' },
  { title: 'أنظمة الأبواب', text: 'مشغلات أبواب، حساسات، بكرات، ومكونات تساعد على تشغيل آمن وسلس.' },
  { title: 'أزرار وكبائن', text: 'أزرار طلب، لوحات كبينة، إضاءة، أرضيات، وتجديد داخلي للمصعد.' },
  { title: 'أنظمة السلامة', text: 'حساسات، ARD، مفاتيح أمان، وحلول مساعدة لتقليل التوقفات.' },
];

const articles = [
  { title: 'متى يحتاج المصعد إلى صيانة وقائية؟', text: 'الأصوات، بطء الباب، الاهتزاز، أو تكرر التوقف علامات تستحق الفحص المبكر.' },
  { title: 'ما الفرق بين تحديث المصعد واستبداله؟', text: 'التحديث مناسب عندما يكون الهيكل جيدًا، والاستبدال يكون أفضل عند نهاية العمر التشغيلي.' },
  { title: 'أهمية عقود الصيانة السنوية AMC', text: 'العقد السنوي يساعد على تقليل الأعطال المفاجئة ويحافظ على سلامة المستخدمين.' },
];

const branches = [
  ['مكة المكرمة', 'شارع المنصور', '0571207000'],
  ['خدمة العملاء', 'طلبات الصيانة والمعاينة', '0571207000'],
  ['منطقة مكة', 'تركيب وصيانة المصاعد', '0571207000'],
  ['خدمات الطوارئ', 'دعم فني للمصاعد', '0571207000'],
];

const localMedia = [
  'IMG_0182-scaled.jpg',
  'IMG_0184-scaled.jpg',
  'IMG_0185-scaled.jpg',
  'IMG_0191-scaled.jpg',
  'IMG_0192-scaled.jpg',
  'IMG_0193-scaled.jpg',
  'IMG_1011-scaled.jpg',
  'IMG_1012-scaled.jpg',
  'PHOTO-2024-09-15-20-52-25.jpeg',
  'PHOTO-2024-09-15-20-52-26.jpeg',
  'PHOTO-2024-09-15-20-52-27.jpeg',
  'PHOTO-2024-09-15-20-52-30.jpeg',
].map((name) => `/img/${name}`);

const projectTypes = [
  { title: 'فلل سكنية', image: products[0].image },
  { title: 'أبراج تجارية', image: 'https://images.openai.com/static-rsc-4/6JbJFuw85BhKLgcccr5yh0BzKW0MmJ83d0yocXtIEzjbbqJ7G6j5VxQmnYnPo9tdbT3WUKvef8VcZnnpinG95F0gYGZtN6D5s_-U-PAXIlrDtqWBQnHRcaqRzCsYUabIA7AkYSCM4LZodwtDR5GjFoT4CeF3N2l0XS_5VPUQESv8wMV04m9UY1hyB21GPAcN?purpose=fullsize' },
  { title: 'مستشفيات', image: products[3].image },
  { title: 'مبان متعددة الأدوار', image: 'https://images.openai.com/static-rsc-4/pjT4OrlpvjDnczMEjt8ABh8S-jK9uj-HCKhUJlJX998paaz-LE5qW5YaSTZUg_d7OdVa75-Fcoe5qF-r5xK34W10jDBR8v9MhdsiCVmuD-39MBVpPpp8FfL6563CKlQL4EPUW_elSRPvazxN11y5k3p6IRK4DC6NAwDYvbq_nYhatRBTwxqisA3u9FK5_m5p?purpose=fullsize' },
];

const heroImages = [
  'https://images.openai.com/static-rsc-4/_6JY_31aiFKvBJF48itsdh4MZRzg6N5pdn_DaTAPd97SAj2WkGPF9qV7DK0bwwYqWAJYGgrQRQoGi6SYJ3WbvX7mwVjgWFwNHjKmp5kzKlwNCWzSO9-RHiIhocTh9j1C6-HKIqlH0TMW6oo7I1LMEzIoR-80GNRX6Yr9O0ZTCuej9cmnsN_alljC28Pl-rM7?purpose=fullsize',
  'https://images.openai.com/static-rsc-4/npZXNTzLAghorrqFsrMydKl2mrMwzRyz6ZSHVk7Hc1u98mv3F1U_VJ3PD1Ssn0ofEjh4HtDlQlytOmCfS_KjEwyq5Ai6kstnc6EeYT5Nq0Z2GnMFCY2ra0ffYBNWD34c-YpqMLICdiGRuT0JsLWz7duxR0gSAeSG7OEGxUXEM_3vgAee9IfUQLrh6hht_T9o?purpose=fullsize',
  products[1].image,
  'https://images.openai.com/static-rsc-4/q_Id_vOhtWJ1vDb5ynkbVZFRY98C8QNJIMORE3b-IuqYkrFVgRluLn11u5kTQxVSIW5V8uBuE4sk8srFMSwaCLwyRljoqpW8qgIwgi7EucTPTh36F_pYxKWurgtFQV8TFPthlgdrTa03dx_HjulkchDTNBim8Ula8aU8RzuiR4fMWDPld7SRuxVNkRJIevgw?purpose=fullsize',
];

const stats = [['24/7', 'دعم أعطال وطوارئ'], ['AMC', 'عقود صيانة سنوية'], ['Safety', 'فحوصات واختبارات سلامة'], ['Parts', 'قطع غيار أصلية وبديلة']];
const movingCards = ['مصاعد منزلية بتصميم هادئ', 'عقود صيانة سنوية AMC', 'فحص سلامة دوري', 'تحديث لوحات التحكم', 'قطع غيار مصاعد', 'خدمة طوارئ 24/7', 'مصاعد خارجية للواجهات', 'مصاعد مستشفيات'];
const workCards = ['تركيب مصاعد فلل', 'تجديد كبائن', 'صيانة شهرية', 'تحديث كنترول', 'فحص أمان', 'توريد قطع غيار', 'مصاعد زجاجية خارجية', 'مصاعد مستشفيات'];
const testimonials = [['مالك فيلا', 'تنفيذ مرتب ومتابعة ممتازة بعد التركيب.', '5.0'], ['مدير مبنى تجاري', 'الصيانة الدورية قللت الأعطال ووضحت حالة المصاعد.', '4.9'], ['مقاول مشروع', 'التنسيق الفني كان واضحًا من المعاينة حتى التسليم.', '5.0'], ['إدارة منشأة صحية', 'اهتمام جيد بالسلامة واختبارات التشغيل.', '4.8']];
const modernization = ['تحديث لوحات التحكم والكنترول', 'تغيير أبواب المصاعد وأنظمة الفتح', 'تجديد الكبائن والأسقف والإضاءة', 'استبدال الماكينات والإنفرترات', 'تركيب حساسات وأنظمة أمان حديثة', 'تحسين كفاءة الطاقة وتقليل الأعطال'];
const timeline = [
  { icon: <Building2 />, title: 'معاينة الموقع', text: 'زيارة هندسية لقياس البئر وعدد الأدوار ومتطلبات السلامة.' },
  { icon: <ClipboardCheck />, title: 'العرض الفني', text: 'تحديد نوع المصعد والمواصفات ومدة التنفيذ وخطة الصيانة.' },
  { icon: <Wrench />, title: 'التركيب والاختبار', text: 'تنفيذ الأعمال الميكانيكية والكهربائية واختبار التشغيل.' },
  { icon: <ShieldCheck />, title: 'التسليم والصيانة', text: 'تسليم المشروع مع عقد صيانة وجدول زيارات وتوصيات فنية.' },
];

function Header() {
  const [open, setOpen] = useState(false);
  const navItems = [['الرئيسية', '/'], ['من نحن', '/about'], ['الخدمات', '/services'], ['المنتجات', '/products'], ['قطع غيار', '/spare-parts'], ['المقالات', '/articles'], ['الميديا', '/media'], ['الفروع', '/branches'], ['تواصل معنا', '/contact']];
  return (
    <header className="site-header">
      <Link className="brand" to="/"><img src="/assets/hens-line-logo.svg" alt={companyName} /><span className="brand-text"><strong>{companyBrand}</strong><small>{companyName}</small></span></Link>
      <button className="menu-button" onClick={() => setOpen((value) => !value)} aria-label="فتح القائمة">{open ? <X /> : <Menu />}</button>
      <nav className={open ? 'nav nav-open' : 'nav'}>
        {navItems.map(([label, path]) => <NavLink key={path} to={path} onClick={() => setOpen(false)}>{label}</NavLink>)}
        <a className="nav-cta nav-call" href={`tel:+966${companyPhones[0].slice(1)}`}><Phone size={16} /> اتصل بنا</a>
        <a className="nav-cta" href={`mailto:${companyEmail}`}>اطلب معاينة</a>
      </nav>
    </header>
  );
}

function RatingStars({ score }: { score: string }) {
  return <div className="rating-stars">{Array.from({ length: 5 }).map((_, index) => <Star key={index} size={17} fill="currentColor" />)}<span>{score}</span></div>;
}

function PageMotion({ title }: { title: string }) {
  return <section className="page-motion" aria-label={title}><div className="motion-track slow">{[...workCards, ...workCards].map((item, index) => <span key={`${title}-${item}-${index}`}>{item}</span>)}</div></section>;
}

const homeTimelineItems = [
  'البداية',
  'الخدمات',
  'المنتجات',
  'المشاريع',
  'الخبرة',
  'طلب عرض',
];

function ScrollElevatorRail() {
  const railRef = useRef<HTMLDivElement>(null);
  const elevatorRef = useRef<HTMLDivElement>(null);
  const activeIndexRef = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      const rail = railRef.current;
      const elevator = elevatorRef.current;
      if (!rail || !elevator) return;

      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const progress = Math.min(1, Math.max(0, window.scrollY / maxScroll));
      const travel = Math.max(0, rail.clientHeight - elevator.clientHeight);
      const nextActiveIndex = Math.min(homeTimelineItems.length - 1, Math.round(progress * (homeTimelineItems.length - 1)));

      elevator.style.transform = `translate3d(0, ${progress * travel}px, 0)`;
      rail.style.setProperty('--scroll-progress', String(progress));

      if (nextActiveIndex !== activeIndexRef.current) {
        activeIndexRef.current = nextActiveIndex;
        setActiveIndex(nextActiveIndex);
      }
    };

    const requestUpdate = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', requestUpdate);
      window.removeEventListener('resize', requestUpdate);
    };
  }, []);

  return (
    <aside className="home-scroll-rail" aria-label="مسار هبوط المصعد مع التمرير">
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
          {homeTimelineItems.map((item, index) => (
            <span className={index <= activeIndex ? 'active' : undefined} key={item} style={{ top: `${(index / (homeTimelineItems.length - 1)) * 100}%` }}>
              <i />
              <b>{item}</b>
            </span>
          ))}
        </div>
      </div>
    </aside>
  );
}

function HomePage() {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -120]);
  return (
    <AnimatedPage>
      <ScrollElevatorRail />
      <section className="hero-section">
        <motion.div className="hero-copy" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <span className="eyebrow"><Sparkles size={16} />مؤسسة تركيب وصيانة مصاعد</span>
          <h1>مصاعد آمنة للفلل والمباني التجارية.</h1>
          <p>{companyName} تقدم تركيب المصاعد، الصيانة الوقائية، تحديث المصاعد القديمة، قطع الغيار، وعقود الخدمة السنوية مع دعم طوارئ.</p>
          <div className="hero-actions"><Link className="primary-action" to="/services">شاهد الخدمات<ArrowLeft size={18} /></Link><a className="secondary-action call-action" href={`tel:+966${companyPhones[0].slice(1)}`}><Phone size={18} /> اتصل بنا {companyPhones[0]}</a><a className="secondary-action" href={`mailto:${companyEmail}`}>اطلب معاينة</a></div>
        </motion.div>
        <motion.div className="hero-media" style={{ y }}>
          <div className="hero-image-slider">{heroImages.map((src, index) => <img key={src} src={src} alt="أعمال مصاعد وصيانة" style={{ animationDelay: `${index * 4}s` }} />)}<div className="hero-image-overlay"><strong>Installation • Maintenance • Modernization</strong><span>24/7 Technical Support</span></div></div>
        </motion.div>
      </section>
      <MotionSection className="stats-strip">{stats.map(([title, text]) => <article key={title}><strong>{title}</strong><span>{text}</span></article>)}</MotionSection>
      <MotionSection className="motion-strip"><div className="motion-track">{[...movingCards, ...movingCards].map((item, index) => <span key={`${item}-${index}`}>{item}</span>)}</div></MotionSection>
      <MotionSection className="section anime-section featured-anime-section"><div className="section-heading"></div><Suspense fallback={<div className="scene-loading dark">جاري تحميل العرض التفاعلي...</div>}><AnimeElevatorShowcase /></Suspense></MotionSection>
      <MotionSection id="services" className="section"><div className="section-heading"><span className="eyebrow">خدماتنا الأساسية</span><h2>حلول مصاعد كاملة من المعاينة والتركيب إلى الصيانة والتحديث.</h2></div><div className="service-grid">{services.map((service, index) => <motion.article key={service.title} className="service-card" initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ delay: index * 0.05 }}><div className="card-icon">{service.icon}</div><h3>{service.title}</h3><p>{service.text}</p></motion.article>)}</div></MotionSection>
      <ProductsPreview />
      <MotionSection className="section project-section"><div className="section-heading"><span className="eyebrow">أنواع المشاريع</span><h2>نخدم المباني التي تحتاج مصاعد آمنة واعتمادية يومية.</h2></div><div className="project-grid">{projectTypes.map((item) => <article key={item.title}><img src={item.image} alt={item.title} /><span>{item.title}</span></article>)}</div></MotionSection>
      <MotionSection className="section testimonials-section"><div className="section-heading"><span className="eyebrow">آراء العملاء</span><h2>تجربة خدمة واضحة من أول معاينة حتى ما بعد التسليم.</h2></div><div className="testimonial-marquee"><div className="testimonial-track">{[...testimonials, ...testimonials].map(([name, text, score], index) => <article key={`${name}-${index}`}><RatingStars score={score} /><strong>{name}</strong><p>{text}</p></article>)}</div></div></MotionSection>
      <MotionSection className="section experience-years-section"><div className="years-badge"><strong>30</strong><span>سنة خبرة</span></div><div><span className="eyebrow">خبرتنا</span><h2>أكثر من ثلاثين عامًا في خدمة المصاعد والصيانة الميدانية.</h2><p>خبرة طويلة في تركيب وصيانة وتحديث المصاعد للمنازل والمباني التجارية، مع فهم عملي لاحتياجات العملاء واشتراطات السلامة.</p></div><div className="years-list"><span>تركيب وصيانة مصاعد</span><span>خدمة ما بعد البيع</span><span>عقود صيانة سنوية</span></div></MotionSection>
      <MotionSection className="section quote-section"><div className="section-heading"><span className="eyebrow">طلب عرض سعر</span><h2>أرسل تفاصيل مشروعك وسنقترح الحل المناسب.</h2></div><div className='form'><QuoteForm /></div></MotionSection>
    </AnimatedPage>
  );
}

function ProductsPreview() {
  return <MotionSection className="section products-section"><div className="section-heading"><span className="eyebrow">منتجاتنا</span><h2>مصاعد عملية وآمنة تناسب المنازل والمباني التجارية والصحية.</h2><p>نوفّر حلولًا تجمع بين التصميم العصري والسلامة والأداء العملي.</p></div><div className="product-grid">{products.map((product) => <article key={product.title}><img src={product.image} alt={product.title} /><h3>{product.title}</h3><p>{product.text}</p><Link to={`/products/${product.slug}`}>تفاصيل المنتج</Link></article>)}</div></MotionSection>;
}

function QuoteForm() {
  return <form className="quote-form"><label>الاسم بالكامل<input type="text" placeholder="اكتب اسمك" /></label><label>رقم الهاتف<input type="tel" placeholder="05xxxxxxxx" /></label><label>نوع الخدمة<select defaultValue=""><option value="" disabled>اختر الخدمة</option><option>تركيب</option><option>صيانة</option><option>تحديث</option><option>قطع غيار</option></select></label><label>نوع المصعد<select defaultValue=""><option value="" disabled>اختر النوع</option><option>منزلي</option><option>أفراد</option><option>خارجي</option><option>مستشفى</option></select></label><label>المدينة<input type="text" placeholder="مثال: مكة المكرمة" /></label><label className="wide">ملاحظات<textarea placeholder="اكتب عدد الأدوار أو نوع المبنى أو وصف المشكلة"></textarea></label><button type="button">إرسال الطلب</button></form>;
}

function ExperiencePage() {
  const [active, setActive] = useState(0);
  const panels = useMemo(() => [{ title: 'طلب معاينة', icon: <Activity />, metric: '48h', body: 'يتم استقبال بيانات المبنى ونوع المصعد المطلوب وتحديد موعد زيارة فنية للمعاينة.' }, { title: 'عقد صيانة', icon: <Phone />, metric: 'AMC', body: 'يحصل العميل على جدول زيارات وقائية وتقرير حالة وخطة استجابة للأعطال.' }, { title: 'قطع الغيار', icon: <Headphones />, metric: 'Parts', body: 'توفير قطع ملائمة للمصعد حسب الفحص الفني ونوع النظام.' }], []);
  return <AnimatedPage><main className="page experience-page"><section className="page-hero compact"><span className="eyebrow">تجربة العميل</span><h1>رحلة عميل واضحة من الطلب إلى التقرير.</h1><p>نعرض كيف تتم المعاينة والصيانة وقطع الغيار من لحظة الطلب حتى استلام التقرير الفني.</p></section><section className="experience-layout"><div className="experience-tabs">{panels.map((panel, index) => <button key={panel.title} className={active === index ? 'active' : ''} onClick={() => setActive(index)}>{panel.icon}<span>{panel.title}</span></button>)}</div><AnimatePresence mode="wait"><motion.div key={active} className="interface-preview" initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 24 }} transition={{ duration: 0.25 }}><div className="preview-header"><div><span>HENS LINE Service</span><h2>{panels[active].title}</h2></div><strong>{panels[active].metric}</strong></div><p>{panels[active].body}</p><div className="preview-board"><div className="ticket urgent"><BellRing /><span>طلب صيانة</span><strong>قيد التوزيع</strong></div><div className="ticket"><Clock3 /><span>فحص سلامة</span><strong>10:30 صباحًا</strong></div><div className="ticket success"><CheckCircle2 /><span>قطع غيار</span><strong>متوفرة</strong></div></div></motion.div></AnimatePresence></section></main></AnimatedPage>;
}

function ProductDetailsPage() {
  const { slug } = useParams();
  const product = products.find((item) => item.slug === slug) || products[0];
  return <AnimatedPage><main className="page"><section className="page-hero compact product-detail-hero"><span className="eyebrow">تفاصيل المنتج</span><h1>{product.title}</h1><p>{product.text}</p></section><motion.section className="product-detail-layout" variants={fadeFromLeft} initial="hidden" animate="visible" transition={pageTransition}><div className="product-detail-panel"><img className="product-detail-image" src={product.image} alt={product.title} /><h2>ماذا يشمل الحل؟</h2><div className="modernization-list">{product.details.map((item) => <span key={item}>{item}</span>)}</div></div><aside className="product-detail-aside"><h2>طلب عرض سعر</h2><p>أرسل نوع المبنى وعدد الأدوار والمدينة، وسيتم اقتراح الحل المناسب.</p><a className="primary-action" href={`mailto:${companyEmail}`}>طلب معاينة</a></aside></motion.section></main></AnimatedPage>;
}

function ServicesPage() {
  return <AnimatedPage><main className="page"><section className="page-hero compact"><span className="eyebrow">الخدمات</span><h1>خدمات تركيب وصيانة وتحديث المصاعد.</h1><p>خدمات متكاملة تبدأ من المعاينة الفنية وتنتهي بالتسليم والصيانة الدورية.</p></section><PageMotion title="services movement" /><section className="service-grid page-grid">{services.map((service) => <article className="service-card" key={service.title}><div className="card-icon">{service.icon}</div><h3>{service.title}</h3><p>{service.text}</p></article>)}</section></main></AnimatedPage>;
}

function ProductsPage() {
  return <AnimatedPage><main className="page"><section className="page-hero compact"><span className="eyebrow">المنتجات</span><h1>مصاعد للمنازل والمباني التجارية والصحية.</h1><p>اختر نوع المصعد المناسب للمبنى، ثم اطلع على تفاصيل الحل والمزايا الفنية.</p></section><section className="product-grid page-grid">{products.map((product) => <article key={product.title}><img src={product.image} alt={product.title} /><h3>{product.title}</h3><p>{product.text}</p><Link to={`/products/${product.slug}`}>تفاصيل المنتج</Link></article>)}</section></main></AnimatedPage>;
}

function SparePartsPage() {
  return <AnimatedPage><main className="page"><section className="page-hero compact"><span className="eyebrow">قطع غيار</span><h1>قطع غيار وأنظمة تحكم للمصاعد.</h1><p>نوفر قطع غيار مناسبة حسب الفحص الفني ونوع المصعد، مع تركيب واختبار عند الحاجة.</p></section><section className="media-highlight"><img src="/img/PHOTO-2024-09-15-20-52-25.jpeg" alt="قطع غيار وأنظمة مصاعد" /><div><Boxes /><h2>توريد وتركيب وفحص</h2><p>نساعدك في اختيار القطعة المناسبة بدل تغيير مكونات سليمة، مع توصيات فنية واضحة.</p></div></section><section className="service-grid page-grid">{spareParts.map((part) => <article className="service-card" key={part.title}><div className="card-icon"><Boxes /></div><h3>{part.title}</h3><p>{part.text}</p></article>)}</section></main></AnimatedPage>;
}

function ArticlesPage() {
  return <AnimatedPage><main className="page"><section className="page-hero compact"><span className="eyebrow">المقالات</span><h1>مقالات ونصائح حول المصاعد.</h1><p>محتوى مبسط يساعد العملاء على فهم الصيانة والسلامة والتحديث قبل اتخاذ القرار.</p></section><section className="article-grid">{articles.map((article, index) => <article key={article.title}><Newspaper /><span>مقال {index + 1}</span><h2>{article.title}</h2><p>{article.text}</p></article>)}</section></main></AnimatedPage>;
}

function MediaPage() {
  return <AnimatedPage><main className="page"><section className="page-hero compact"><span className="eyebrow">الميديا</span><h1>صور من أعمال ومشاريع المصاعد.</h1><p>معرض صور من ملفات الأعمال والمشاريع الموجودة داخل الموقع.</p></section><section className="media-grid">{localMedia.map((src, index) => <article key={src}><img src={src} alt={`صورة مشروع ${index + 1}`} /><span><ImageIcon size={16} /> مشروع {index + 1}</span></article>)}</section></main></AnimatedPage>;
}

function BranchesPage() {
  return <AnimatedPage><main className="page"><section className="page-hero compact"><span className="eyebrow">الفروع</span><h1>نقاط خدمة قريبة من العملاء.</h1><p>نغطي منطقة مكة بخدمة تركيب وصيانة منظمة ومواعيد واضحة.</p></section><section className="branches-grid page-grid">{branches.map(([city, address, phone]) => <article key={city}><MapPin /><h3>{city}</h3><p>{address}</p><strong>{phone}</strong></article>)}</section></main></AnimatedPage>;
}

function AboutPage() {
  return <AnimatedPage><main className="page"><section className="page-hero compact"><span className="eyebrow">عن المؤسسة</span><h1>خبرة في المصاعد وخدمات ما بعد البيع.</h1><p>{companyName} تقدم خدمات تركيب وصيانة وتحديث المصاعد للمباني السكنية والتجارية، مع توفير قطع الغيار وعقود الصيانة السنوية وخدمة الطوارئ.</p></section><PageMotion title="about movement" /><section className="about-grid"><article><ShieldCheck /><h2>نشاط واضح</h2><p>تركيب مصاعد، صيانة وقائية وتصحيحية، تحديث الأنظمة القديمة، وبيع قطع الغيار.</p></article><article><LayoutDashboard /><h2>خبرة ميدانية</h2><p>فرق فنية لمعاينة المواقع، اختبار السلامة، تنفيذ الأعمال، وتقديم تقارير واضحة للعملاء.</p></article><article><Wrench /><h2>خدمة مستمرة</h2><p>عقود صيانة شهرية وسنوية ودعم أعطال للمباني التي تحتاج جاهزية عالية.</p></article></section><MotionSection className="section company-story"><h2>نبذة عن العمل</h2><p>تأسست {companyName} لتقديم حلول مصاعد متكاملة تشمل التوريد والتركيب والصيانة والتحديث وقطع الغيار. تعمل المؤسسة مع ملاك الفلل والمقاولين والمنشآت التجارية والمرافق التي تحتاج إلى حلول نقل آمنة واعتمادية داخل المباني.</p></MotionSection></main></AnimatedPage>;
}

function ContactPage() {
  return <AnimatedPage><main className="page"><section className="page-hero compact"><span className="eyebrow">تواصل معنا</span><h1>تواصل للمعاينة أو الصيانة أو قطع الغيار.</h1><p>يمكن التواصل مع {companyName} لخدمات تركيب المصاعد وعقود الصيانة السنوية والتحديث وقطع الغيار.</p></section><PageMotion title="contact movement" /><motion.section className="contact-grid" variants={fadeFromLeft} initial="hidden" animate="visible" transition={{ ...pageTransition, delay: 0.08 }}><article><MessageCircle /><h2>البريد التجاري</h2><p><a href={`mailto:${companyEmail}`}>{companyEmail}</a></p></article><article><Building2 /><h2>الموقع</h2><p>{companyAddress}</p></article><article><Phone /><h2>الجوال</h2><p>{companyPhones.join(' - ')}</p></article><article><Wrench /><h2>نطاق الخدمة</h2><p>تركيب، صيانة، تحديث، فحص سلامة، عقود AMC، وقطع غيار مصاعد.</p></article></motion.section><section className="company-info-strip"><span>الرقم الضريبي: {companyVat}</span><span>س.ت: {companyCr}</span><span>{companyBrand}</span></section><MotionSection className="section branches-section"><div className="section-heading"><span className="eyebrow">فروع الخدمة</span><h2>خدمة تركيب وصيانة في عدة مدن.</h2></div><div className="branches-grid">{branches.map(([city, address, phone]) => <article key={city}><h3>{city}</h3><p>{address} - {phone}</p></article>)}</div></MotionSection></main></AnimatedPage>;
}

function PrivacyPage() {
  return <AnimatedPage><main className="page"><section className="page-hero compact"><span className="eyebrow">سياسة الخصوصية</span><h1>سياسة خصوصية {companyName}</h1><p>آخر تحديث: 10 مايو 2026</p></section><PageMotion title="privacy movement" /><motion.section className="legal" variants={fadeFromLeft} initial="hidden" animate="visible" transition={{ ...pageTransition, delay: 0.08 }}><h2>البيانات التي نجمعها</h2><p>قد تجمع {companyName} بيانات التواصل، عنوان الموقع، نوع المبنى، معلومات المصعد، طلبات الصيانة، وسجلات الخدمة اللازمة لتقديم خدمات التركيب والصيانة وقطع الغيار.</p><h2>استخدام البيانات</h2><p>نستخدم البيانات لترتيب المعاينات، إعداد العروض الفنية، تنفيذ الصيانة، توريد قطع الغيار، متابعة العقود، والتواصل مع العملاء بخصوص الخدمات المطلوبة.</p><h2>مشاركة البيانات</h2><p>لا نبيع البيانات الشخصية. قد تتم مشاركة المعلومات مع موظفين مخولين أو مزودي خدمات موثوقين عند الحاجة لتنفيذ الخدمة أو تأمين السجلات.</p><h2>التواصل</h2><p>للاستفسارات المتعلقة بالخصوصية يمكن التواصل عبر <a href={`mailto:${companyEmail}`}>{companyEmail}</a>.</p></motion.section></main></AnimatedPage>;
}

function TermsPage() {
  return <AnimatedPage><main className="page"><section className="page-hero compact"><span className="eyebrow">شروط الاستخدام</span><h1>شروط وأحكام خدمات {companyName}</h1><p>آخر تحديث: 17 مايو 2026</p></section><PageMotion title="terms movement" /><motion.section className="legal" variants={fadeFromLeft} initial="hidden" animate="visible" transition={{ ...pageTransition, delay: 0.08 }}><h2>نطاق الخدمات</h2><p>تقدم {companyName} خدمات تركيب وصيانة وتحديث المصاعد وتوريد قطع الغيار وخدمات ما بعد البيع للمباني السكنية والتجارية حسب المعاينة الفنية والاتفاق مع العميل.</p><h2>طلبات المعاينة والصيانة</h2><p>عند إرسال طلب عبر الموقع أو الهاتف أو البريد الإلكتروني، قد نتواصل مع العميل لتأكيد بيانات الموقع ونوع المصعد والموعد المناسب للزيارة الفنية أو الدعم المطلوب.</p><h2>استخدام واتساب للتواصل الخدمي</h2><p>نستخدم واتساب فقط للتواصل المتعلق بالخدمة، مثل تأكيد طلبات الصيانة، تحديثات الفنيين، مواعيد المعاينة، متابعة قطع الغيار، ودعم العملاء. لا نستخدم واتساب لإرسال رسائل عشوائية أو محتوى غير مرتبط بالخدمة.</p><h2>العروض والأسعار</h2><p>أي عرض سعر أو مدة تنفيذ يعتمد على حالة الموقع ونوع المصعد وتوفر القطع والمواصفات المطلوبة. لا يعتبر الطلب مؤكدًا إلا بعد موافقة العميل على العرض النهائي.</p><h2>التواصل</h2><p>للاستفسار عن هذه الشروط يمكن التواصل عبر <a href={`mailto:${companyEmail}`}>{companyEmail}</a> أو عبر أرقام المؤسسة: {companyPhones.join(' / ')}.</p></motion.section></main></AnimatedPage>;
}

function DataDeletionPage() {
  return <AnimatedPage><main className="page"><section className="page-hero compact"><span className="eyebrow">حذف البيانات</span><h1>تعليمات حذف بيانات المستخدم</h1><p>آخر تحديث: 17 مايو 2026</p></section><PageMotion title="data deletion movement" /><motion.section className="legal" variants={fadeFromLeft} initial="hidden" animate="visible" transition={{ ...pageTransition, delay: 0.08 }}><h2>كيفية طلب حذف البيانات</h2><p>يمكنك طلب حذف بياناتك المرتبطة بالتواصل مع {companyName} عبر إرسال رسالة إلى البريد الإلكتروني <a href={`mailto:${companyEmail}`}>{companyEmail}</a> بعنوان: طلب حذف بيانات.</p><h2>المعلومات المطلوبة في الطلب</h2><p>يرجى تضمين الاسم، رقم الجوال المستخدم في التواصل، ووصف مختصر للطلب حتى نتمكن من تحديد السجلات المرتبطة بك ومعالجتها بشكل صحيح.</p><h2>مدة معالجة الطلب</h2><p>نراجع طلبات حذف البيانات خلال مدة تصل إلى 30 يومًا من تاريخ استلام الطلب، وقد نتواصل معك للتحقق من الهوية أو استكمال معلومات ناقصة.</p><h2>البيانات التي قد نحتفظ بها</h2><p>قد نحتفظ ببعض السجلات اللازمة للالتزامات النظامية أو المحاسبية أو لحماية الحقوق القانونية، مع تقليل البيانات إلى الحد المطلوب فقط.</p><h2>قنوات التواصل</h2><p>يمكن إرسال الطلب عبر البريد الإلكتروني <a href={`mailto:${companyEmail}`}>{companyEmail}</a> أو التواصل عبر أرقام المؤسسة: {companyPhones.join(' / ')}.</p></motion.section></main></AnimatedPage>;
}

function FacebookCallbackPage() {
  return <AnimatedPage><main className="page"><section className="page-hero compact"><span className="eyebrow">OAuth Callback</span><h1>تم تجهيز رابط إعادة توجيه تسجيل الدخول.</h1><p>هذا الرابط مخصص لاستقبال نتيجة تسجيل الدخول عبر Facebook OAuth وربطه بخدمات العملاء عند تفعيل التكامل.</p></section><motion.section className="legal" variants={fadeFromLeft} initial="hidden" animate="visible" transition={{ ...pageTransition, delay: 0.08 }}><h2>رابط callback المعتمد</h2><p>استخدم هذا الرابط داخل إعدادات Meta ضمن Valid OAuth Redirect URIs:</p><p><strong>https://hensline.com/auth/facebook/callback</strong></p><h2>ملاحظة أمان</h2><p>يتم استخدام هذا المسار فقط لتسجيل الدخول المصرح به، ولا يستخدم لإرسال رسائل تسويقية أو معالجة بيانات خارج نطاق موافقة المستخدم.</p></motion.section></main></AnimatedPage>;
}

function Footer() {
  return <footer className="footer"><span>{companyName} - {companyBrand}</span><span>{companyAddress}</span><span>جوال: {companyPhones.join(' / ')}</span><span>الرقم الضريبي: {companyVat}</span><span>س.ت: {companyCr}</span><Link to="/privacy">سياسة الخصوصية</Link><Link to="/terms">شروط الاستخدام</Link><Link to="/data-deletion">حذف البيانات</Link></footer>;
}

export default function App() {
  return (
    <div className="app-shell">
      <div className="background-3d" aria-hidden="true"><Suspense fallback={null}><BackgroundElevatorScene /></Suspense></div>
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/experience" element={<ExperiencePage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/:slug" element={<ProductDetailsPage />} />
        <Route path="/spare-parts" element={<SparePartsPage />} />
        <Route path="/articles" element={<ArticlesPage />} />
        <Route path="/media" element={<MediaPage />} />
        <Route path="/branches" element={<BranchesPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/data-deletion" element={<DataDeletionPage />} />
        <Route path="/auth/facebook/callback" element={<FacebookCallbackPage />} />
      </Routes>
      <Footer />
    </div>
  );
}
