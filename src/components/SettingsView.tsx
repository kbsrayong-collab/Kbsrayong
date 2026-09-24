import React from 'react';
import { 
  Palette, 
  Sun, 
  Moon, 
  ListOrdered, 
  Check, 
  RotateCcw, 
  ShieldCheck, 
  Monitor, 
  Layers,
  Sparkles,
  Info
} from 'lucide-react';
import { AppSettings, COLOR_THEMES, ColorThemeId, ThemeMode } from '../types/settings';

interface SettingsViewProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onResetDefaults: () => void;
  onNavigateToContracts: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  onResetDefaults,
  onNavigateToContracts,
}) => {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-primary">
            <Palette className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              การตั้งค่าระบบและส่วนบุคคล
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
            การตั้งค่าธีมและการแสดงผล
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            กำหนดสีธีม 5 รูปแบบ โหมดมืด/สว่าง และจำนวนรายการแสดงในทะเบียนคุมสัญญาเงินยืม
          </p>
        </div>

        <button
          onClick={onResetDefaults}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-xl transition-colors shrink-0"
          title="รีเซ็ตการตั้งค่าเป็นค่าเริ่มต้น"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>คืนค่าเริ่มต้น</span>
        </button>
      </div>

      {/* Section 1: Color Themes (5 Preset Themes) */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                1. สีธีมหลักของระบบ (5 รูปแบบ)
              </h3>
              <p className="text-2xs text-slate-500 dark:text-slate-400">
                เลือกชุดสีอัตลักษณ์ของหน่วยงานราชการ ปรับแต่งปุ่ม แถบเมนู และสถิติ
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
            5 รูปแบบ
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-1">
          {COLOR_THEMES.map((theme) => {
            const isSelected = settings.colorTheme === theme.id;
            return (
              <button
                key={theme.id}
                type="button"
                onClick={() => onUpdateSettings({ colorTheme: theme.id })}
                className={`relative flex flex-col p-4 rounded-xl border text-left transition-all cursor-pointer group ${
                  isSelected
                    ? 'border-slate-900 dark:border-white shadow-md ring-2 ring-slate-900 dark:ring-white bg-slate-50/70 dark:bg-slate-700/50'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50/50 dark:hover:bg-slate-700/30'
                }`}
              >
                {/* Header with color dot and active badge */}
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-5 h-5 rounded-full shadow-xs border border-white/50 shrink-0"
                      style={{ backgroundColor: theme.accentHex }}
                    />
                    <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {theme.name}
                    </span>
                  </div>
                  {isSelected && (
                    <span className="w-5 h-5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center text-xs shrink-0">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </span>
                  )}
                </div>

                <p className="text-2xs text-slate-500 dark:text-slate-400 mb-3 flex-1 line-clamp-2">
                  {theme.subname}
                </p>

                {/* Color Palette Preview Swatches */}
                <div className="flex items-center gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-700/60">
                  <div 
                    className="h-3.5 flex-1 rounded-sm shadow-2xs" 
                    style={{ backgroundColor: theme.accentHex }} 
                    title="สีหลัก (Primary)"
                  />
                  <div 
                    className="h-3.5 flex-1 rounded-sm opacity-80" 
                    style={{ backgroundColor: theme.accentHex, filter: 'brightness(1.2)' }} 
                    title="สีรอง (Secondary)"
                  />
                  <div 
                    className="h-3.5 flex-1 rounded-sm opacity-40" 
                    style={{ backgroundColor: theme.accentHex, filter: 'brightness(1.4)' }} 
                    title="สีพื้นหลังอ่อน (Light Accent)"
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Section 2: Light Mode / Dark Mode Toggle */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center">
              {settings.themeMode === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                2. โหมดการแสดงผลแสง (โหมดมืด / โหมดสว่าง)
              </h3>
              <p className="text-2xs text-slate-500 dark:text-slate-400">
                เลือกรูปแบบความสว่างเพื่อความสบายตาในการตรวจสอบบัญชีและสัญญา
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
            {settings.themeMode === 'dark' ? 'โหมดมืด (Dark)' : 'โหมดสว่าง (Light)'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          {/* Light Mode Option */}
          <button
            type="button"
            onClick={() => onUpdateSettings({ themeMode: 'light' })}
            className={`flex items-start gap-3.5 p-4 rounded-xl border text-left transition-all cursor-pointer ${
              settings.themeMode === 'light'
                ? 'border-slate-900 dark:border-white ring-2 ring-slate-900 dark:ring-white bg-slate-50 dark:bg-slate-700/50 shadow-xs'
                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50/60 dark:hover:bg-slate-700/30'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/30 text-amber-600 flex items-center justify-center shrink-0 border border-amber-200/60">
              <Sun className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  โหมดสว่าง (Light Mode)
                </span>
                {settings.themeMode === 'light' && (
                  <span className="w-4 h-4 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center text-xs">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </span>
                )}
              </div>
              <p className="text-2xs text-slate-500 dark:text-slate-400 mt-1">
                พื้นหลังสีขาวสะอาดตา คมชัด เหมาะสำหรับการทำงานกลางวันและพิมพ์เอกสาร
              </p>
            </div>
          </button>

          {/* Dark Mode Option */}
          <button
            type="button"
            onClick={() => onUpdateSettings({ themeMode: 'dark' })}
            className={`flex items-start gap-3.5 p-4 rounded-xl border text-left transition-all cursor-pointer ${
              settings.themeMode === 'dark'
                ? 'border-slate-900 dark:border-white ring-2 ring-slate-900 dark:ring-white bg-slate-50 dark:bg-slate-700/50 shadow-xs'
                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50/60 dark:hover:bg-slate-700/30'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-950 text-indigo-300 flex items-center justify-center shrink-0 border border-indigo-800">
              <Moon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  โหมดมืด (Dark Mode)
                </span>
                {settings.themeMode === 'dark' && (
                  <span className="w-4 h-4 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center text-xs">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </span>
                )}
              </div>
              <p className="text-2xs text-slate-500 dark:text-slate-400 mt-1">
                พื้นหลังสีเข้ม สบายตา ลดแสงสะท้อน เหมาะสำหรับการทำงานต่อเนื่องนาน
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Section 3: Registry Display Pagination (10, 20, 30 Items) */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 flex items-center justify-center">
              <ListOrdered className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                3. จำนวนรายการแสดงผลในทะเบียนคุมสัญญา
              </h3>
              <p className="text-2xs text-slate-500 dark:text-slate-400">
                กำหนดจำนวนแถวต่อหน้าในตารางทะเบียนคุมสัญญายืมเงินราชการ (แบบ 8500)
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
            {settings.itemsPerPage} รายการ / หน้า
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          {([10, 20, 30] as const).map((count) => {
            const isSelected = settings.itemsPerPage === count;
            return (
              <button
                key={count}
                type="button"
                onClick={() => onUpdateSettings({ itemsPerPage: count })}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border text-center transition-all cursor-pointer ${
                  isSelected
                    ? 'border-slate-900 dark:border-white ring-2 ring-slate-900 dark:ring-white bg-slate-50 dark:bg-slate-700/50 shadow-xs'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50/50 dark:hover:bg-slate-700/30'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
                    {count}
                  </span>
                  {isSelected && (
                    <span className="w-4 h-4 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center text-xs">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </span>
                  )}
                </div>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  รายการต่อหน้า
                </span>
                <span className="text-2xs text-slate-400 dark:text-slate-500 mt-0.5">
                  {count === 10 ? 'โหลดเร็ว กะทัดรัด' : count === 20 ? 'สมดุล แนะนำสำหรับจอมาตรฐาน' : 'ข้อมูลจุใจ ดูได้พร้อมกัน'}
                </span>
              </button>
            );
          })}
        </div>

        <div className="pt-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>สามารถเปลี่ยนจำนวนรายการนี้ได้โดยตรงที่มุมล่างตารางทะเบียนคุมสัญญาเช่นกัน</span>
          </span>
          <button
            onClick={onNavigateToContracts}
            className="text-emerald-700 dark:text-emerald-400 hover:underline font-semibold text-2xs cursor-pointer"
          >
            ไปยังทะเบียนสัญญา →
          </button>
        </div>
      </div>
    </div>
  );
};
