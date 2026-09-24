import React from 'react';
import { 
  LayoutDashboard, 
  FileSpreadsheet, 
  AlertTriangle, 
  FileText, 
  Database, 
  Plus, 
  Download, 
  ChevronLeft, 
  ChevronRight, 
  X,
  Settings
} from 'lucide-react';
import { AppSheetConfig } from '../types/loan';
import { AppSettings, COLOR_THEMES } from '../types/settings';

export type NavTab = 'overview' | 'contracts' | 'overdue' | 'demand-letters' | 'appsheet' | 'settings';

interface SidebarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean | ((prev: boolean) => boolean)) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
  overdueCount: number;
  totalContractsCount: number;
  onOpenAddModal: () => void;
  onExportCSV: () => void;
  appSheetConfig: AppSheetConfig;
  settings: AppSettings;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isCollapsed,
  setIsCollapsed,
  isMobileOpen,
  setIsMobileOpen,
  overdueCount,
  totalContractsCount,
  onOpenAddModal,
  onExportCSV,
  appSheetConfig,
  settings,
}) => {
  const currentTheme = COLOR_THEMES.find(t => t.id === settings.colorTheme) || COLOR_THEMES[0];

  const navItems = [
    {
      id: 'overview' as NavTab,
      label: 'ภาพรวมทะเบียน',
      shortLabel: 'ภาพรวม',
      icon: LayoutDashboard,
      description: 'สรุปสถิติการเงินและยอดค้าง',
      badge: null,
    },
    {
      id: 'contracts' as NavTab,
      label: 'ทะเบียนคุมสัญญา',
      shortLabel: 'สัญญา',
      icon: FileSpreadsheet,
      description: 'แบบ 8500 และรายการยืมทั้งหมด',
      badge: totalContractsCount > 0 ? `${totalContractsCount}` : null,
      badgeColor: 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300',
    },
    {
      id: 'overdue' as NavTab,
      label: 'หนี้เกินกำหนด',
      shortLabel: 'เกินกำหนด',
      icon: AlertTriangle,
      description: 'สัญญาที่พ้นกำหนดส่งใช้คืน',
      badge: overdueCount > 0 ? `${overdueCount}` : null,
      badgeColor: 'bg-rose-600 text-white animate-pulse',
    },
    {
      id: 'demand-letters' as NavTab,
      label: 'หนังสือทวงถามหนี้',
      shortLabel: 'ทวงถาม',
      icon: FileText,
      description: 'บันทึกข้อความตราครุฑ',
      badge: null,
    },
    {
      id: 'appsheet' as NavTab,
      label: 'ฐานข้อมูล AppSheet',
      shortLabel: 'AppSheet',
      icon: Database,
      description: 'ซิงค์ข้อมูลและตารางฟิลด์',
      badge: 'DB',
      badgeColor: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-mono',
    },
    {
      id: 'settings' as NavTab,
      label: 'การตั้งค่าระบบ',
      shortLabel: 'ตั้งค่า',
      icon: Settings,
      description: 'ธีมสี โหมดมืด/สว่าง จำนวนแถว',
      badge: null,
    },
  ];

  const handleTabClick = (tabId: NavTab) => {
    setActiveTab(tabId);
    if (isMobileOpen) {
      setIsMobileOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs md:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-all duration-300 ease-in-out print:hidden
          ${isMobileOpen ? 'translate-x-0 w-72' : '-translate-x-full md:translate-x-0'}
          ${isCollapsed ? 'md:w-20' : 'md:w-64'}
        `}
      >
        {/* Sidebar Header / Brand */}
        <div className="h-16 px-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50/70 dark:bg-slate-800/60">
          <div className="flex items-center gap-3 min-w-0 overflow-hidden">
            <div 
              className="w-10 h-10 rounded-xl text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0 ring-2 ring-white/20"
              style={{ backgroundColor: currentTheme.accentHex }}
            >
              ศค
            </div>
            {(!isCollapsed || isMobileOpen) && (
              <div className="min-w-0 flex-1">
                <h1 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight leading-tight truncate">
                  ทะเบียนคุมเงินยืม
                </h1>
                <p className="text-2xs text-slate-500 dark:text-slate-400 font-medium truncate">
                  ราชการ (แบบ 8500)
                </p>
              </div>
            )}
          </div>

          {/* Close button on mobile */}
          <button
            onClick={() => setIsMobileOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-lg md:hidden transition-colors"
            title="ปิดเมนู"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Collapse/Expand Toggle on Desktop */}
          <button
            onClick={() => setIsCollapsed(prev => !prev)}
            className={`hidden md:flex items-center justify-center w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/80 dark:hover:bg-slate-800 transition-colors shrink-0 ${
              isCollapsed ? 'mx-auto' : ''
            }`}
            title={isCollapsed ? 'ขยายสไลด์บาร์ (Expand)' : 'ย่อสไลด์บาร์ (Collapse)'}
            aria-label={isCollapsed ? 'ขยายสไลด์บาร์' : 'ย่อสไลด์บาร์'}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Quick Action Button */}
        <div className="p-3 shrink-0 border-b border-slate-100 dark:border-slate-800/80">
          {isCollapsed && !isMobileOpen ? (
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={onOpenAddModal}
                style={{ backgroundColor: currentTheme.accentHex }}
                className="w-10 h-10 rounded-xl text-white flex items-center justify-center transition-opacity hover:opacity-90 shadow-2xs group relative cursor-pointer"
                title="บันทึกสัญญายืมเงินใหม่"
              >
                <Plus className="w-5 h-5" />
                <span className="absolute left-full ml-2 px-2 py-1 bg-slate-900 text-white text-2xs rounded shadow-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
                  + สัญญาใหม่
                </span>
              </button>
              <button
                onClick={onExportCSV}
                className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center transition-colors border border-slate-200 dark:border-slate-700 group relative cursor-pointer"
                title="ส่งออก CSV สำหรับ AppSheet / Excel"
              >
                <Download className="w-4 h-4" style={{ color: currentTheme.accentHex }} />
                <span className="absolute left-full ml-2 px-2 py-1 bg-slate-900 text-white text-2xs rounded shadow-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
                  ส่งออก CSV
                </span>
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <button
                onClick={onOpenAddModal}
                style={{ backgroundColor: currentTheme.accentHex }}
                className="w-full py-2 px-3 text-white hover:opacity-90 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-opacity shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>บันทึกสัญญาใหม่</span>
              </button>
              <button
                onClick={onExportCSV}
                className="w-full py-1.5 px-3 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" style={{ color: currentTheme.accentHex }} />
                <span>ส่งออกรายงาน CSV</span>
              </button>
            </div>
          )}
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-2 py-3 space-y-1">
          {(!isCollapsed || isMobileOpen) && (
            <div className="px-3 pb-1.5 text-2xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              เมนูหลัก
            </div>
          )}

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`w-full flex items-center gap-3 rounded-xl transition-all relative group cursor-pointer
                  ${isCollapsed && !isMobileOpen ? 'justify-center p-2.5' : 'px-3 py-2.5 text-left'}
                  ${
                    isActive
                      ? 'shadow-2xs font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white border border-transparent'
                  }
                `}
                style={
                  isActive
                    ? {
                        backgroundColor: settings.themeMode === 'dark' ? '#1e293b' : `${currentTheme.accentHex}14`,
                        color: currentTheme.accentHex,
                        borderColor: `${currentTheme.accentHex}40`,
                        borderWidth: 1,
                      }
                    : undefined
                }
                title={isCollapsed && !isMobileOpen ? item.label : undefined}
              >
                <div className="relative shrink-0">
                  <Icon
                    className={`w-5 h-5 transition-colors ${
                      isActive ? '' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                    }`}
                    style={isActive ? { color: currentTheme.accentHex } : undefined}
                  />
                  {/* Small badge dot on icon when collapsed */}
                  {isCollapsed && !isMobileOpen && item.badge && item.id === 'overdue' && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-600 rounded-full ring-2 ring-white dark:ring-slate-900 animate-pulse" />
                  )}
                </div>

                {(!isCollapsed || isMobileOpen) && (
                  <div className="flex-1 min-w-0 flex items-center justify-between">
                    <div className="truncate">
                      <div className="text-xs leading-tight truncate">{item.label}</div>
                      <div className="text-2xs opacity-75 font-normal leading-tight truncate">
                        {item.description}
                      </div>
                    </div>
                    {item.badge && (
                      <span
                        className={`text-2xs font-bold px-1.5 py-0.5 rounded-full font-mono tabular-nums shrink-0 ml-2 ${
                          item.badgeColor || 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}

                {/* Tooltip for Collapsed Desktop Mode */}
                {isCollapsed && !isMobileOpen && (
                  <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-slate-900 text-white text-xs rounded-lg shadow-xl whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 flex items-center gap-2">
                    <span className="font-semibold">{item.label}</span>
                    {item.badge && (
                      <span className="text-2xs px-1.5 py-0.2 rounded bg-slate-700 font-mono">
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Sidebar Footer: AppSheet DB Status & Settings summary */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 shrink-0">
          {isCollapsed && !isMobileOpen ? (
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={() => handleTabClick('settings')}
                className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 flex items-center justify-center transition-colors group relative shadow-2xs cursor-pointer"
                title="การตั้งค่าระบบและธีม"
              >
                <Settings className="w-4 h-4" />
                <span className="absolute left-full ml-2 px-2 py-1 bg-slate-900 text-white text-2xs rounded shadow-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
                  การตั้งค่าระบบ
                </span>
              </button>

              <button
                onClick={() => setIsCollapsed(false)}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 flex items-center justify-center transition-colors mt-1 cursor-pointer"
                title="ขยายสไลด์บาร์"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <div 
                onClick={() => handleTabClick('appsheet')}
                className="p-2.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-600 cursor-pointer transition-colors shadow-2xs"
              >
                <div className="flex items-center justify-between text-2xs mb-1">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">AppSheet DB</span>
                  <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    เชื่อมต่อแล้ว
                  </span>
                </div>
                <div className="font-mono text-2xs font-semibold text-slate-800 dark:text-slate-200 truncate bg-slate-50 dark:bg-slate-900/60 px-1.5 py-0.5 rounded border border-slate-100 dark:border-slate-700">
                  {appSheetConfig.databaseId}
                </div>
              </div>

              <div className="flex items-center justify-between text-2xs text-slate-400 dark:text-slate-500 px-1">
                <span>ธีม: {currentTheme.name.split(' ')[0]}</span>
                <button
                  onClick={() => setIsCollapsed(true)}
                  className="hidden md:flex items-center gap-1 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
                  title="ย่อสไลด์บาร์"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>ย่อเมนู</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
