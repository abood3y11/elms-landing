// Company facts and navigation shared by every page.

export const companyName = 'مؤسسة حسين سفر النفيعي للمصاعد';
export const companyBrand = 'HENS LINE';
export const companyEmail = 'elevatorsystem@avix-net.com';
export const companyVat = '300385366700003';
export const companyCr = '4031021948';
export const companyPhones = ['0571207000'];
export const companyAddress = 'مكة المكرمة - شارع المنصور';
export const companyWhatsapp = '966571207000';
export const serviceArea = 'مكة المكرمة وجدة والطائف والمدينة المنورة';

export const telHref = `tel:+966${companyPhones[0].slice(1)}`;
export const whatsappHref = `https://wa.me/${companyWhatsapp}`;

export type NavItem = { label: string; to: string };

/** Shown in the desktop bar. */
export const primaryNav: NavItem[] = [
  { label: 'الرئيسية', to: '/' },
  { label: 'الخدمات', to: '/services' },
  { label: 'المنتجات', to: '/products' },
  { label: 'المشاريع', to: '/projects' },
  { label: 'عقود الصيانة', to: '/maintenance-contracts' },
  { label: 'تواصل معنا', to: '/contact' },
];

/** Under «المزيد» on desktop; listed in full in the mobile menu. */
export const moreNav: NavItem[] = [
  { label: 'من نحن', to: '/about' },
  { label: 'قطع الغيار', to: '/spare-parts' },
  { label: 'عملاؤنا', to: '/customers' },
  { label: 'الميديا', to: '/media' },
  { label: 'المقالات', to: '/articles' },
];

export const legalNav: NavItem[] = [
  { label: 'سياسة الخصوصية', to: '/privacy' },
  { label: 'شروط الاستخدام', to: '/terms' },
  { label: 'حذف البيانات', to: '/data-deletion' },
];

export const footerServices: NavItem[] = [
  { label: 'تركيب المصاعد', to: '/services' },
  { label: 'الصيانة الوقائية', to: '/maintenance-contracts' },
  { label: 'تحديث المصاعد', to: '/services' },
  { label: 'قطع الغيار', to: '/spare-parts' },
  { label: 'صمّم مصعدك', to: '/configure' },
];
