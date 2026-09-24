import React, { useMemo, useState, useEffect, useRef } from 'react';
import { LoanContract, LoanStatus } from '../types/loan';
import { calculateLoanSummary, formatCurrency, formatThaiDate, getStatusBadgeStyle } from '../utils/loanCalculations';
import { 
  Search, 
  Filter, 
  Eye, 
  DollarSign, 
  FileText, 
  Edit2, 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  History,
  Clock,
  X
} from 'lucide-react';

interface LoanTableProps {
  contracts: LoanContract[];
  onViewContract: (contract: LoanContract) => void;
  onEditContract: (contract: LoanContract) => void;
  onDeleteContract: (contractId: string) => void;
  onAddRepayment: (contract: LoanContract) => void;
  onGenerateDemandLetter: (contract: LoanContract) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: 'all' | LoanStatus;
  setStatusFilter: (status: 'all' | LoanStatus) => void;
  fiscalYearFilter: 'all' | number;
  setFiscalYearFilter: (year: 'all' | number) => void;
  departmentFilter: 'all' | string;
  setDepartmentFilter: (dept: 'all' | string) => void;
  itemsPerPage?: 10 | 20 | 30;
  onItemsPerPageChange?: (items: 10 | 20 | 30) => void;
}

export const LoanTable: React.FC<LoanTableProps> = ({
  contracts,
  onViewContract,
  onEditContract,
  onDeleteContract,
  onAddRepayment,
  onGenerateDemandLetter,
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  fiscalYearFilter,
  setFiscalYearFilter,
  departmentFilter,
  setDepartmentFilter,
  itemsPerPage = 10,
  onItemsPerPageChange,
}) => {
  const [currentPage, setCurrentPage] = useState(1);

  // Search History State & Persistence
  const SEARCH_HISTORY_KEY = 'gov_loan_search_history';
  const MAX_HISTORY_ITEMS = 10;

  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(SEARCH_HISTORY_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            return parsed.filter(item => typeof item === 'string' && item.trim().length > 0);
          }
        }
      } catch (e) {
        console.error('Failed to parse search history', e);
      }
    }
    return ['ค่าใช้จ่ายในการเดินทาง', 'ยืมเงินราชการ', 'สำนักปลัด'];
  });

  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const saveHistory = (items: string[]) => {
    setSearchHistory(items);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(items));
      } catch (e) {
        console.error('Failed to save search history', e);
      }
    }
  };

  const addToHistory = (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;
    const filtered = searchHistory.filter(item => item.toLowerCase() !== trimmed.toLowerCase());
    const updated = [trimmed, ...filtered].slice(0, MAX_HISTORY_ITEMS);
    saveHistory(updated);
  };

  const removeFromHistory = (e: React.MouseEvent, itemToRemove: string) => {
    e.stopPropagation();
    const updated = searchHistory.filter(item => item !== itemToRemove);
    saveHistory(updated);
  };

  const clearAllHistory = (e: React.MouseEvent) => {
    e.stopPropagation();
    saveHistory([]);
  };

  const handleSelectHistoryItem = (query: string) => {
    setSearchTerm(query);
    addToHistory(query);
    setIsHistoryOpen(false);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (searchTerm.trim()) {
        addToHistory(searchTerm);
      }
      setIsHistoryOpen(false);
    } else if (e.key === 'Escape') {
      setIsHistoryOpen(false);
    }
  };

  // Close search history dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsHistoryOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Filter history suggestions based on current typing
  const displayHistory = useMemo(() => {
    if (!searchTerm.trim()) {
      return searchHistory;
    }
    const term = searchTerm.toLowerCase().trim();
    return searchHistory.filter(item => item.toLowerCase().includes(term));
  }, [searchHistory, searchTerm]);

  // Extract unique departments and fiscal years
  const departments = useMemo(() => {
    const set = new Set<string>();
    contracts.forEach(c => {
      if (c.department) set.add(c.department);
    });
    return Array.from(set).sort();
  }, [contracts]);

  const fiscalYears = useMemo(() => {
    const set = new Set<number>();
    contracts.forEach(c => {
      if (c.fiscalYear) set.add(c.fiscalYear);
    });
    return Array.from(set).sort((a, b) => b - a);
  }, [contracts]);

  // Filtered contracts
  const filteredContracts = useMemo(() => {
    return contracts.filter(contract => {
      const summary = calculateLoanSummary(contract);

      // Search term
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchNo = contract.contractNo.toLowerCase().includes(term);
        const matchName = contract.borrowerName.toLowerCase().includes(term);
        const matchDept = contract.department.toLowerCase().includes(term);
        const matchPurpose = contract.purpose.toLowerCase().includes(term);
        if (!matchNo && !matchName && !matchDept && !matchPurpose) return false;
      }

      // Status filter
      if (statusFilter !== 'all' && summary.status !== statusFilter) {
        return false;
      }

      // Fiscal year filter
      if (fiscalYearFilter !== 'all' && contract.fiscalYear !== fiscalYearFilter) {
        return false;
      }

      // Department filter
      if (departmentFilter !== 'all' && contract.department !== departmentFilter) {
        return false;
      }

      return true;
    });
  }, [contracts, searchTerm, statusFilter, fiscalYearFilter, departmentFilter]);

  // Reset current page when filters or itemsPerPage change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, fiscalYearFilter, departmentFilter, itemsPerPage]);

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(filteredContracts.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredContracts.length);
  const currentItems = filteredContracts.slice(startIndex, endIndex);

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xs overflow-hidden transition-colors">
      {/* Control Bar: Search & Filters */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/80 space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search box with History Dropdown */}
          <div ref={searchContainerRef} className="relative flex-1 max-w-md">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setIsHistoryOpen(true);
                }}
                onFocus={() => setIsHistoryOpen(true)}
                onKeyDown={handleSearchKeyDown}
                placeholder="ค้นหาเลขที่สัญญา, ผู้ยืม, วัตถุประสงค์, สำนัก/กอง..."
                className="w-full pl-9 pr-16 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-100 placeholder-slate-400 transition-colors shadow-2xs"
              />
              <div className="absolute right-2 flex items-center gap-1">
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchTerm('');
                      setIsHistoryOpen(true);
                    }}
                    className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded transition-colors cursor-pointer"
                    title="ล้างคำค้นหาปัจจุบัน"
                    aria-label="ล้างคำค้นหา"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsHistoryOpen(prev => !prev)}
                  className={`p-1 rounded transition-colors cursor-pointer ${
                    isHistoryOpen
                      ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60'
                      : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                  }`}
                  title="ประวัติการค้นหาล่าสุด"
                  aria-label="เปิดประวัติการค้นหา"
                >
                  <History className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Search History Dropdown */}
            {isHistoryOpen && (
              <div className="absolute left-0 right-0 mt-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg z-30 overflow-hidden text-xs">
                {/* Header */}
                <div className="flex items-center justify-between px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700">
                  <span className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-200 text-2xs uppercase tracking-wider">
                    <History className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>ประวัติการค้นหาล่าสุด</span>
                    {searchHistory.length > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-3xs font-mono">
                        {searchHistory.length}
                      </span>
                    )}
                  </span>
                  {searchHistory.length > 0 && (
                    <button
                      type="button"
                      onClick={clearAllHistory}
                      className="text-3xs text-rose-500 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 font-medium hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>ล้างประวัติทั้งหมด</span>
                    </button>
                  )}
                </div>

                {/* History Items List */}
                {displayHistory.length === 0 ? (
                  <div className="p-4 text-center text-slate-400 dark:text-slate-500">
                    <p className="text-2xs">
                      {searchHistory.length === 0
                        ? 'ยังไม่มีประวัติการค้นหา (พิมพ์คำค้นแล้วกด Enter)'
                        : 'ไม่พบคำค้นหาในประวัติที่ตรงกัน'}
                    </p>
                  </div>
                ) : (
                  <ul className="max-h-56 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                    {displayHistory.map((query, index) => (
                      <li
                        key={`${query}-${index}`}
                        onClick={() => handleSelectHistoryItem(query)}
                        className="flex items-center justify-between px-3 py-2 hover:bg-emerald-50/60 dark:hover:bg-slate-800/80 cursor-pointer group transition-colors"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors" />
                          <span className="text-slate-700 dark:text-slate-200 truncate group-hover:text-emerald-700 dark:group-hover:text-emerald-300 font-medium">
                            {query}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0 ml-2">
                          <button
                            type="button"
                            onClick={(e) => removeFromHistory(e, query)}
                            className="p-1 text-slate-300 hover:text-rose-500 dark:text-slate-600 dark:hover:text-rose-400 rounded transition-colors opacity-70 group-hover:opacity-100 cursor-pointer"
                            title="ลบรายการนี้"
                            aria-label={`ลบคำค้นหา ${query}`}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}

                {/* Dropdown Footer Hint */}
                <div className="px-3 py-1.5 bg-slate-50/70 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 text-3xs text-slate-400 dark:text-slate-500 flex items-center justify-between">
                  <span>กด ↵ Enter เพื่อบันทึกคำค้นหา</span>
                  <span>กด Esc เพื่อปิด</span>
                </div>
              </div>
            )}

            {/* Quick Tag Suggestions for Rapid Access when search bar is empty */}
            {searchHistory.length > 0 && !searchTerm && (
              <div className="flex items-center gap-1.5 flex-wrap text-2xs text-slate-500 dark:text-slate-400 pt-1.5">
                <span className="flex items-center gap-1 text-slate-400 dark:text-slate-500">
                  <History className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  <span>ค้นหาล่าสุด:</span>
                </span>
                {searchHistory.slice(0, 3).map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setSearchTerm(item);
                      addToHistory(item);
                    }}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer text-2xs shadow-2xs"
                    title={`ค้นหาด่วน: ${item}`}
                  >
                    <span>{item}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Page Size Control (10, 20, 30) */}
          <div className="flex items-center gap-2 text-xs self-end sm:self-auto">
            <span className="text-slate-500 dark:text-slate-400 hidden sm:inline">แสดง:</span>
            <div className="inline-flex rounded-lg border border-slate-200 dark:border-slate-700 p-0.5 bg-white dark:bg-slate-900 shadow-2xs">
              {([10, 20, 30] as const).map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => onItemsPerPageChange?.(size)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                    itemsPerPage === size
                      ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  title={`แสดง ${size} รายการต่อหน้า`}
                >
                  {size}
                </button>
              ))}
            </div>
            <span className="text-slate-400 text-2xs">รายการ/หน้า</span>
          </div>
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2 text-xs pt-1">
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-medium mr-1">
            <Filter className="w-3.5 h-3.5" />
            <span>กรองข้อมูล:</span>
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-200 font-medium focus:ring-1 focus:ring-emerald-500"
          >
            <option value="all">สถานะทั้งหมด</option>
            <option value="normal">ปกติ (ยังไม่ครบกำหนด)</option>
            <option value="due_soon">ใกล้ครบกำหนด (ภายใน 7 วัน)</option>
            <option value="overdue">เกินกำหนดชำระ (ต้องทวงถาม)</option>
            <option value="partial">ส่งใช้แล้วบางส่วน</option>
            <option value="closed">ปิดสัญญาแล้ว (ครบถ้วน)</option>
          </select>

          {/* Fiscal Year Filter */}
          <select
            value={fiscalYearFilter}
            onChange={(e) => setFiscalYearFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className="px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-200 font-medium focus:ring-1 focus:ring-emerald-500"
          >
            <option value="all">ปีงบประมาณทั้งหมด</option>
            {fiscalYears.map(year => (
              <option key={year} value={year}>ปีงบประมาณ พ.ศ. {year}</option>
            ))}
          </select>

          {/* Department Filter */}
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-200 font-medium focus:ring-1 focus:ring-emerald-500 max-w-xs truncate"
          >
            <option value="all">ทุกหน่วยงาน / สำนัก / กอง</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>

          {/* Reset Filters */}
          {(searchTerm || statusFilter !== 'all' || fiscalYearFilter !== 'all' || departmentFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setFiscalYearFilter('all');
                setDepartmentFilter('all');
              }}
              className="text-2xs text-rose-600 dark:text-rose-400 hover:text-rose-800 underline font-medium ml-auto cursor-pointer"
            >
              ล้างตัวกรองทั้งหมด
            </button>
          )}
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-100/90 dark:bg-slate-700/60 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold uppercase tracking-wider">
              <th className="py-3 px-3 text-center w-12">ลำดับ</th>
              <th className="py-3 px-3">เลขที่สัญญา / วันที่ยืม</th>
              <th className="py-3 px-3">ผู้ยืม / สังกัด</th>
              <th className="py-3 px-3">วัตถุประสงค์การยืม</th>
              <th className="py-3 px-3 text-right">วงเงินยืม (บาท)</th>
              <th className="py-3 px-3 text-right">ส่งใช้แล้ว (บาท)</th>
              <th className="py-3 px-3 text-right">หนี้คงเหลือ (บาท)</th>
              <th className="py-3 px-3">กำหนดส่งใช้</th>
              <th className="py-3 px-3 text-center">สถานะ</th>
              <th className="py-3 px-3 text-center w-28">การจัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
            {filteredContracts.length === 0 ? (
              <tr>
                <td colSpan={10} className="text-center py-12 text-slate-400 dark:text-slate-500">
                  <p className="text-sm font-medium">ไม่พบข้อมูลสัญญาเงินยืมตามเงื่อนไขที่ระบุ</p>
                  <p className="text-2xs mt-1">ลองเปลี่ยนคำค้นหาหรือล้างตัวกรอง</p>
                </td>
              </tr>
            ) : (
              currentItems.map((contract, index) => {
                const summary = calculateLoanSummary(contract);
                const badge = getStatusBadgeStyle(summary.status);
                const actualIndex = startIndex + index + 1;

                return (
                  <tr
                    key={contract.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-700/40 transition-colors text-slate-700 dark:text-slate-300"
                  >
                    {/* Index */}
                    <td className="py-3 px-3 text-center font-mono text-2xs text-slate-400 dark:text-slate-500">
                      {actualIndex}
                    </td>

                    {/* Contract No & Borrow Date */}
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-900 dark:text-white font-mono flex items-center gap-1.5">
                        <span>{contract.contractNo}</span>
                      </div>
                      <div className="text-2xs text-slate-400 dark:text-slate-500">
                        ยืม: {formatThaiDate(contract.contractDate)}
                      </div>
                    </td>

                    {/* Borrower & Dept */}
                    <td className="py-3 px-3">
                      <div className="font-medium text-slate-900 dark:text-slate-100">
                        {contract.borrowerName}
                      </div>
                      <div className="text-2xs text-slate-500 dark:text-slate-400 truncate max-w-[160px]">
                        {contract.department}
                      </div>
                    </td>

                    {/* Purpose */}
                    <td className="py-3 px-3 max-w-[200px]">
                      <div className="truncate font-normal" title={contract.purpose}>
                        {contract.purpose}
                      </div>
                      <div className="text-2xs text-slate-400 dark:text-slate-500">
                        ปีงบฯ {contract.fiscalYear}
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="py-3 px-3 text-right font-mono font-semibold text-slate-900 dark:text-white">
                      {formatCurrency(contract.loanAmount)}
                    </td>

                    {/* Repaid */}
                    <td className="py-3 px-3 text-right font-mono text-emerald-700 dark:text-emerald-400 font-medium">
                      {formatCurrency(summary.totalSettled)}
                    </td>

                    {/* Remaining Debt */}
                    <td className="py-3 px-3 text-right font-mono font-bold">
                      <span className={summary.remainingDebt > 0 ? (summary.isOverdue ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white') : 'text-slate-400 dark:text-slate-500'}>
                        {formatCurrency(summary.remainingDebt)}
                      </span>
                    </td>

                    {/* Due Date & Overdue Tag */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="text-slate-700 dark:text-slate-300 font-medium">
                        {formatThaiDate(contract.dueDate)}
                      </div>
                      {summary.isOverdue && summary.remainingDebt > 0 && (
                        <span className="text-2xs font-semibold text-rose-600 dark:text-rose-400">
                          เกินกำหนด {Math.abs(summary.daysDiff)} วัน
                        </span>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-2xs font-semibold border ${badge.bg} ${badge.text} ${badge.border}`}
                      >
                        {summary.statusLabel}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {/* View Details */}
                        <button
                          onClick={() => onViewContract(contract)}
                          title="ดูรายละเอียดสัญญาและประวัติการส่งใช้"
                          className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Add Repayment */}
                        {summary.remainingDebt > 0 && (
                          <button
                            onClick={() => onAddRepayment(contract)}
                            title="บันทึกการส่งใช้เงินยืม (เงินสด/ใบสำคัญ)"
                            className="p-1.5 text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 rounded-md transition-colors cursor-pointer"
                          >
                            <DollarSign className="w-4 h-4" />
                          </button>
                        )}

                        {/* Demand Letter Generator */}
                        {summary.isOverdue && summary.remainingDebt > 0 && (
                          <button
                            onClick={() => onGenerateDemandLetter(contract)}
                            title="ออกหนังสือทวงถามหนี้เงินยืมราชการ (บันทึกข้อความ)"
                            className="p-1.5 text-rose-700 dark:text-rose-400 hover:text-rose-800 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-md transition-colors cursor-pointer"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                        )}

                        {/* Edit Contract */}
                        <button
                          onClick={() => onEditContract(contract)}
                          title="แก้ไขข้อมูลสัญญา"
                          className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        {/* Delete Contract */}
                        <button
                          onClick={() => {
                            if (window.confirm(`ยืนยันการลบสัญญาเลขที่ "${contract.contractNo}" หรือไม่?`)) {
                              onDeleteContract(contract.id);
                            }
                          }}
                          title="ลบสัญญานี้"
                          className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-md transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer: Pagination & Item Count Controls */}
      <div className="p-3.5 border-t border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/80 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-3">
        {/* Left: Summary Count */}
        <div className="flex items-center gap-2">
          <span>
            แสดง <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono tabular-nums">{filteredContracts.length === 0 ? 0 : startIndex + 1} - {endIndex}</span> จากทั้งหมด <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono tabular-nums">{filteredContracts.length}</span> สัญญา
          </span>
          {filteredContracts.length !== contracts.length && (
            <span className="text-2xs text-slate-400">
              (กรองจากทั้งหมด {contracts.length} สัญญา)
            </span>
          )}
        </div>

        {/* Center / Right: Pagination Controls */}
        <div className="flex items-center gap-2">
          {/* Page indicator */}
          <span className="text-2xs text-slate-500 dark:text-slate-400 mr-1">
            หน้า <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">{currentPage}</span> / <span className="font-mono">{totalPages}</span>
          </span>

          {/* Pagination Buttons */}
          <div className="inline-flex items-center gap-1">
            {/* First Page */}
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage <= 1}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
              title="หน้าแรก"
            >
              <ChevronsLeft className="w-3.5 h-3.5" />
            </button>

            {/* Prev Page */}
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage <= 1}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
              title="หน้าก่อนหน้า"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            {/* Direct Page Numbers */}
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
              .map((p, idx, arr) => {
                const showEllipsisBefore = idx > 0 && p - arr[idx - 1] > 1;
                return (
                  <React.Fragment key={p}>
                    {showEllipsisBefore && (
                      <span className="px-1 text-slate-400">...</span>
                    )}
                    <button
                      onClick={() => setCurrentPage(p)}
                      className={`min-w-[28px] h-7 px-1.5 text-xs font-semibold rounded-lg font-mono transition-all ${
                        currentPage === p
                          ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-xs'
                          : 'border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      {p}
                    </button>
                  </React.Fragment>
                );
              })}

            {/* Next Page */}
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage >= totalPages}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
              title="หน้าถัดไป"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            {/* Last Page */}
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage >= totalPages}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
              title="หน้าสุดท้าย"
            >
              <ChevronsRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
