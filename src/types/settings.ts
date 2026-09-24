export type ThemeMode = 'light' | 'dark';

export type ColorThemeId = 'emerald' | 'navy' | 'indigo' | 'ruby' | 'amber';

export interface ColorThemeOption {
  id: ColorThemeId;
  name: string;
  subname: string;
  primaryColor: string;
  primaryHover: string;
  bgLight: string;
  ringColor: string;
  accentHex: string;
}

export interface AppSettings {
  themeMode: ThemeMode;
  colorTheme: ColorThemeId;
  itemsPerPage: 10 | 20 | 30;
}

export const COLOR_THEMES: ColorThemeOption[] = [
  {
    id: 'emerald',
    name: 'มรกตราชการ (Emerald Green)',
    subname: 'สีเขียวมรกต มาตรฐานระเบียบการเงินการคลัง',
    primaryColor: 'bg-emerald-700 hover:bg-emerald-800 text-white',
    primaryHover: 'hover:bg-emerald-800',
    bgLight: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    ringColor: 'ring-emerald-600',
    accentHex: '#047857',
  },
  {
    id: 'navy',
    name: 'กรมท่าครามหลวง (Royal Navy)',
    subname: 'สีกรมท่าเข้ม สุขุม หนักแน่น ทรงเกียรติ',
    primaryColor: 'bg-blue-800 hover:bg-blue-900 text-white',
    primaryHover: 'hover:bg-blue-900',
    bgLight: 'bg-blue-50 text-blue-800 border-blue-200',
    ringColor: 'ring-blue-700',
    accentHex: '#1e40af',
  },
  {
    id: 'indigo',
    name: 'ครามม่วงสากล (Deep Indigo)',
    subname: 'สีครามม่วงทันสมัย ผู้บริหารยุคดิจิทัล',
    primaryColor: 'bg-indigo-700 hover:bg-indigo-800 text-white',
    primaryHover: 'hover:bg-indigo-800',
    bgLight: 'bg-indigo-50 text-indigo-800 border-indigo-200',
    ringColor: 'ring-indigo-600',
    accentHex: '#4338ca',
  },
  {
    id: 'ruby',
    name: 'ทับทิมสยาม (Royal Ruby / Crimson)',
    subname: 'สีแดงเลือดนก-ทับทิม มงคล สง่างาม',
    primaryColor: 'bg-rose-800 hover:bg-rose-900 text-white',
    primaryHover: 'hover:bg-rose-900',
    bgLight: 'bg-rose-50 text-rose-800 border-rose-200',
    ringColor: 'ring-rose-700',
    accentHex: '#9f1239',
  },
  {
    id: 'amber',
    name: 'อำพันราชพฤกษ์ (Golden Amber)',
    subname: 'สีทองอำพัน-บรอนซ์ อบอุ่น ชัดเจน ตรวจสอบง่าย',
    primaryColor: 'bg-amber-700 hover:bg-amber-800 text-white',
    primaryHover: 'hover:bg-amber-800',
    bgLight: 'bg-amber-50 text-amber-900 border-amber-200',
    ringColor: 'ring-amber-600',
    accentHex: '#b45309',
  },
];
