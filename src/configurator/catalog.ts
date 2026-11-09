// Option catalog for the cabin designer. Swatches and 3D materials are generated
// procedurally (textures.ts) until HENS LINE's own sample photos are supplied;
// swap `kind`/`pattern` for an image path then.

export type Option = { id: string; ar: string; en: string; color: string };

export type FinishKind = 'wood' | 'marble' | 'granite' | 'solid' | 'steel';
export type SteelPattern = 'brushed' | 'dots' | 'wave' | 'geo' | 'linen';
export type Finish = Option & { code: string; kind: FinishKind; accent: string; pattern?: SteelPattern; group: 'wood' | 'stone' | 'solid' | 'steel' };

export type CeilingPattern = 'dots' | 'rings' | 'slots' | 'squares' | 'star' | 'frame';
export type Ceiling = Option & { code: string; pattern: CeilingPattern };

export type CategoryKey =
  | 'wall' | 'trim' | 'floor' | 'ceiling' | 'mirror' | 'handrail'
  | 'doorfinish' | 'door' | 'entrance' | 'panel' | 'panelSide' | 'light';

export const regions = [
  { id: 'makkah', ar: 'منطقة مكة المكرمة', en: 'Makkah Region', hint: 'مكة وجدة والطائف وما حولها', cities: ['Makkah', 'Jeddah', 'Taif', 'Rabigh', 'Al-Qunfudhah', 'Al-Lith'] },
  { id: 'madinah', ar: 'منطقة المدينة المنورة', en: 'Madinah Region', hint: 'المدينة المنورة وينبع', cities: ['Madinah', 'Yanbu', 'Badr', 'Al-Ula'] },
  { id: 'other', ar: 'بقية مدن المملكة', en: 'Rest of the Kingdom', hint: 'ننسّق الزيارة حسب الموقع', cities: ['Riyadh', 'Dammam', 'Khobar', 'Abha', 'Tabuk', 'Hail', 'Buraidah', 'Jazan', 'Najran', 'Al-Baha'] },
] as const;

export const cityNames: Record<string, string> = {
  Makkah: 'مكة المكرمة', Jeddah: 'جدة', Taif: 'الطائف', Rabigh: 'رابغ', 'Al-Qunfudhah': 'القنفذة', 'Al-Lith': 'الليث',
  Madinah: 'المدينة المنورة', Yanbu: 'ينبع', Badr: 'بدر', 'Al-Ula': 'العلا',
  Riyadh: 'الرياض', Dammam: 'الدمام', Khobar: 'الخبر', Abha: 'أبها', Tabuk: 'تبوك', Hail: 'حائل', Buraidah: 'بريدة', Jazan: 'جازان', Najran: 'نجران', 'Al-Baha': 'الباحة',
  Other: 'مدينة أخرى',
};

export const elevatorTypes: Option[] = [
  { id: 'home', ar: 'فيلا / منزلي', en: 'Home', color: '' },
  { id: 'passenger', ar: 'ركاب', en: 'Passenger', color: '' },
  { id: 'panoramic', ar: 'بانورامي', en: 'Panoramic', color: '' },
  { id: 'hospital', ar: 'مستشفى', en: 'Hospital', color: '' },
  { id: 'goods', ar: 'بضائع', en: 'Goods', color: '' },
  { id: 'car', ar: 'سيارات', en: 'Car', color: '' },
  { id: 'food', ar: 'طعام', en: 'Dumbwaiter', color: '' },
  { id: 'pneumatic', ar: 'هوائي', en: 'Pneumatic', color: '' },
];

export const STOPS_MIN = 2;
export const STOPS_MAX = 30;

const w = (code: string, ar: string, en: string, kind: FinishKind, group: Finish['group'], color: string, accent: string, pattern?: SteelPattern): Finish =>
  ({ id: code, code, ar, en, kind, group, color, accent, pattern });

export const walls: Finish[] = [
  w('W-01', 'جوز داكن', 'Dark walnut', 'wood', 'wood', '#5b3a24', '#3b2414'),
  w('W-02', 'بلوط فاتح', 'Light oak', 'wood', 'wood', '#bf9466', '#9a7046'),
  w('W-03', 'ماهوجني', 'Mahogany', 'wood', 'wood', '#6e3020', '#4a1c12'),
  w('W-04', 'رماد طبيعي', 'Natural ash', 'wood', 'wood', '#b1a38d', '#8d7f69'),
  w('S-01', 'رخام أبيض', 'White marble', 'marble', 'stone', '#ece9e3', '#9c9a95'),
  w('S-02', 'ترافرتين بيج', 'Beige travertine', 'marble', 'stone', '#d8c6a5', '#b39b72'),
  w('S-03', 'رخام أسود', 'Black marble', 'marble', 'stone', '#2a2a2d', '#d9d9d9'),
  w('P-01', 'أبيض لؤلؤي', 'Pearl white', 'solid', 'solid', '#f1efe9', '#e2dfd6'),
  w('P-02', 'رمادي داكن', 'Graphite', 'solid', 'solid', '#4a4f55', '#3d4146'),
  w('P-03', 'أزرق ليلي', 'Night blue', 'solid', 'solid', '#1f2d44', '#172235'),
  w('ST-01', 'استيل فضي مصقول', 'Brushed silver steel', 'steel', 'steel', '#c3c9cd', '#9aa2a8', 'brushed'),
  w('ST-02', 'استيل فضي منقّط', 'Dotted silver steel', 'steel', 'steel', '#c7cdd1', '#8d959b', 'dots'),
  w('ST-03', 'استيل ذهبي متموّج', 'Wavy gold steel', 'steel', 'steel', '#caa458', '#9a7a35', 'wave'),
  w('ST-04', 'استيل ذهبي بزخرفة هندسية', 'Geometric gold steel', 'steel', 'steel', '#c9a55a', '#8f6f2e', 'geo'),
  w('ST-05', 'استيل برونزي كتاني', 'Linen bronze steel', 'steel', 'steel', '#9e6c4f', '#734a33', 'linen'),
];

export const wallGroups = [
  { id: 'all', ar: 'الكل' },
  { id: 'wood', ar: 'خشب' },
  { id: 'stone', ar: 'حجر ورخام' },
  { id: 'solid', ar: 'ألوان سادة' },
  { id: 'steel', ar: 'نقشات الاستيل' },
] as const;

const f = (code: string, ar: string, en: string, kind: FinishKind, color: string, accent: string): Finish =>
  ({ id: code, code, ar, en, kind, group: 'stone', color, accent });

export const floors: Finish[] = [
  f('F-01', 'أبيض بعروق رمادية', 'White, grey veins', 'marble', '#ebe9e4', '#8f8f8d'),
  f('F-02', 'بيج بعروق ذهبية', 'Beige, gold veins', 'marble', '#dccaa8', '#a8823d'),
  f('F-03', 'أسود بعروق بيضاء', 'Black, white veins', 'marble', '#232326', '#e6e6e6'),
  f('F-04', 'كريمي دافئ', 'Warm cream', 'marble', '#e7d8bb', '#c4ad84'),
  f('F-05', 'جرانيت رمادي منقّط', 'Speckled grey granite', 'granite', '#8a8d90', '#3f4245'),
  f('F-06', 'جرانيت بني منقّط', 'Speckled brown granite', 'granite', '#7a5a45', '#2f2018'),
  f('F-07', 'رمادي فحمي', 'Charcoal', 'marble', '#45484c', '#7c8086'),
  f('F-08', 'أخضر داكن', 'Dark green', 'marble', '#22392f', '#9fb3a7'),
];

export const ceilings: Ceiling[] = [
  { id: 'CL-01', code: 'CL-01', ar: 'فضي بثقوب دائرية', en: 'Silver, round perforation', color: '#c9ced2', pattern: 'dots' },
  { id: 'CL-02', code: 'CL-02', ar: 'ذهبي بحلقات', en: 'Gold rings', color: '#c9a55a', pattern: 'rings' },
  { id: 'CL-03', code: 'CL-03', ar: 'أسود بشرائح طولية', en: 'Black slots', color: '#2b2e31', pattern: 'slots' },
  { id: 'CL-04', code: 'CL-04', ar: 'فضي بمربعات', en: 'Silver squares', color: '#c4cacd', pattern: 'squares' },
  { id: 'CL-05', code: 'CL-05', ar: 'ذهبي نجمي', en: 'Gold star', color: '#c39c4e', pattern: 'star' },
  { id: 'CL-06', code: 'CL-06', ar: 'أبيض بإطار مضيء', en: 'White, lit frame', color: '#eeeeea', pattern: 'frame' },
];

export const trims: Option[] = [
  { id: 'silver', ar: 'فضي', en: 'Silver', color: '#bfc6c9' },
  { id: 'gold', ar: 'ذهبي', en: 'Gold', color: '#cba754' },
  { id: 'bronze', ar: 'برونزي', en: 'Bronze', color: '#9e694c' },
  { id: 'black', ar: 'أسود', en: 'Black', color: '#272b2d' },
];

export const mirrors: Option[] = [
  { id: 'half', ar: 'نصف الارتفاع', en: 'Half height', color: '' },
  { id: 'full', ar: 'ارتفاع كامل', en: 'Full height', color: '' },
  { id: 'none', ar: 'بدون مرآة', en: 'No mirror', color: '' },
];

export const handrails: Option[] = [
  { id: 'back', ar: 'تحت المرآة (خلفي)', en: 'Back, under mirror', color: '' },
  { id: 'right', ar: 'يمين', en: 'Right', color: '' },
  { id: 'left', ar: 'يسار', en: 'Left', color: '' },
  { id: 'none', ar: 'بدون مسكة', en: 'None', color: '' },
];

export const doorFinishes: Option[] = [
  { id: 'silver-satin', ar: 'فضي مطفي', en: 'Satin silver', color: '#b9c2c3' },
  { id: 'silver-mirror', ar: 'فضي مرآة', en: 'Mirror silver', color: '#d5dcdd' },
  { id: 'gold-satin', ar: 'ذهبي مطفي', en: 'Satin gold', color: '#bba064' },
  { id: 'gold-mirror', ar: 'ذهبي مرآة', en: 'Mirror gold', color: '#d4ac55' },
  { id: 'bronze-satin', ar: 'برونزي مطفي', en: 'Satin bronze', color: '#97704f' },
  { id: 'bronze-mirror', ar: 'برونزي مرآة', en: 'Mirror bronze', color: '#ad8064' },
  { id: 'black-satin', ar: 'أسود مطفي', en: 'Satin black', color: '#303436' },
  { id: 'black-mirror', ar: 'أسود مرآة', en: 'Mirror black', color: '#343a3e' },
];

export const doors: Option[] = [
  { id: 'center', ar: 'فتح مركزي', en: 'Center opening', color: '' },
  { id: 'side', ar: 'فتح جانبي', en: 'Side opening', color: '' },
];

export const entrances: Option[] = [
  { id: 'single', ar: 'باب واحد', en: 'Single entrance', color: '' },
  { id: 'through', ar: 'بابان متقابلان', en: 'Through (opposite)', color: '' },
  { id: 'side-right', ar: 'باب جانبي يمين', en: 'Adjacent, right', color: '' },
  { id: 'side-left', ar: 'باب جانبي يسار', en: 'Adjacent, left', color: '' },
];

export const panels: Option[] = [
  { id: 'classic', ar: 'أزرار دائرية', en: 'Round buttons', color: '' },
  { id: 'touch', ar: 'لوحة لمس', en: 'Touch panel', color: '' },
  { id: 'tft', ar: 'شاشة TFT مع أزرار', en: 'TFT with buttons', color: '' },
];

export const panelSides: Option[] = [
  { id: 'right', ar: 'الكتف الأيمن', en: 'Right jamb', color: '' },
  { id: 'left', ar: 'الكتف الأيسر', en: 'Left jamb', color: '' },
];

export const lights: Option[] = [
  { id: 'warm', ar: 'دافئة', en: 'Warm', color: '#ffe0a5' },
  { id: 'neutral', ar: 'طبيعية', en: 'Neutral', color: '#f5f5ed' },
];

export const services = [
  { id: 'supply_install', ar: 'توريد وتركيب' },
  { id: 'maintenance', ar: 'صيانة' },
  { id: 'modernization', ar: 'تحديث مصعد' },
  { id: 'finishes', ar: 'تشطيبات وإكسسوارات' },
  { id: 'consultation', ar: 'استشارة' },
] as const;

export const optionsByCategory: Record<CategoryKey, Option[]> = {
  wall: walls, trim: trims, floor: floors, ceiling: ceilings, mirror: mirrors, handrail: handrails,
  doorfinish: doorFinishes, door: doors, entrance: entrances, panel: panels, panelSide: panelSides, light: lights,
};

export const categoryLabels: Record<CategoryKey, string> = {
  wall: 'الجدران الداخلية', trim: 'الزوايا والوزرات', floor: 'الأرضية', ceiling: 'السقف', mirror: 'المرآة', handrail: 'المسكة',
  doorfinish: 'تشطيب الأبواب والإطار', door: 'فتح الأبواب', entrance: 'المداخل', panel: 'لوحة التحكم', panelSide: 'موضع اللوحة', light: 'الإضاءة',
};

export const summaryOrder: CategoryKey[] = ['wall', 'trim', 'floor', 'ceiling', 'mirror', 'handrail', 'doorfinish', 'door', 'entrance', 'panel', 'panelSide', 'light'];

export type Preset = { id: string; ar: string; values: Partial<Record<CategoryKey, string>> };

export const presets: Preset[] = [
  { id: 'wood-warm', ar: 'خشب ودافئ', values: { wall: 'W-02', floor: 'F-04', ceiling: 'CL-02', light: 'warm', mirror: 'half' } },
  { id: 'gold-white', ar: 'ذهبي وأبيض', values: { wall: 'ST-04', floor: 'F-01', ceiling: 'CL-05', light: 'neutral', mirror: 'half' } },
  { id: 'silver-grey', ar: 'فضي ورمادي', values: { wall: 'ST-02', floor: 'F-05', ceiling: 'CL-01', light: 'neutral', mirror: 'half' } },
];

export function findOption(category: CategoryKey, id: string): Option | undefined {
  return optionsByCategory[category].find((option) => option.id === id);
}
