import React from 'react';
import { LoanContract } from '../types/loan';
import { calculateLoanSummary, formatCurrency } from '../utils/loanCalculations';
import { AlertTriangle, Clock, CheckCircle2, DollarSign, ArrowRight } from 'lucide-react';

interface DashboardStatsProps {
  contracts: LoanContract[];
  onSelectStatusFilter: (status: any) => void;
  onOpenDemandLetterTab: () => void;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  contracts,
  onSelectStatusFilter,
  onOpenDemandLetterTab,
}) => {
  // Aggregate calculations
  let totalLoanAmount = 0;
  let totalSettledAmount = 0;
  let totalRemainingDebt = 0;
  let overdueCount = 0;
  let overdueDebt = 0;
  let dueSoonCount = 0;
  let settledCount = 0;

  contracts.forEach(contract => {
    const summary = calculateLoanSummary(contract);
    totalLoanAmount += contract.loanAmount;
    totalSettledAmount += summary.totalSettled;
    totalRemainingDebt += summary.remainingDebt;

    if (summary.status === 'overdue') {
      overdueCount++;
      overdueDebt += summary.remainingDebt;
    } else if (summary.status === 'due_soon') {
      dueSoonCount++;
    } else if (summary.status === 'settled') {
      settledCount++;
    }
  });

  const recoveryRate = totalLoanAmount > 0 ? (totalSettledAmount / totalLoanAmount) * 100 : 0;

  return (
    <div className="space-y-4">
      {/* Overdue Alert Banner if overdue loans exist */}
      {overdueCount > 0 && (
        <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-rose-950 dark:text-rose-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-100 dark:bg-rose-900/60 rounded-lg text-rose-700 dark:text-rose-300 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold">
                ตรวจพบสัญญายืมเงินเกินกำหนดส่งใช้ {overdueCount} รายการ (ยอดหนี้ค้างชำระ ฿{formatCurrency(overdueDebt)})
              </p>
              <p className="text-xs text-rose-800 dark:text-rose-300/80 mt-0.5">
                ตามระเบียบเงินยืมราชการ ต้องส่งใช้ภายใน 15-30 วัน กรุณาตรวจสอบหรือออกบันทึกข้อความทวงถามหนี้
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onSelectStatusFilter('overdue')}
              className="px-3 py-1.5 text-xs font-medium text-rose-900 dark:text-rose-200 bg-rose-100 dark:bg-rose-900/60 hover:bg-rose-200 dark:hover:bg-rose-800 rounded-md transition-colors whitespace-nowrap cursor-pointer"
            >
              ดูรายการเกินกำหนด
            </button>
            <button
              onClick={onOpenDemandLetterTab}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-rose-700 hover:bg-rose-800 rounded-md transition-colors whitespace-nowrap flex items-center gap-1 shadow-xs cursor-pointer"
            >
              <span>ออกหนังสือทวงถาม</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Due Soon Advisory Banner */}
      {dueSoonCount > 0 && overdueCount === 0 && (
        <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-xl p-3.5 flex items-center justify-between text-amber-950 dark:text-amber-200">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
            <span className="text-sm">
              มีสัญญายืมเงินใกล้ครบกำหนดส่งใช้ (ภายใน 7 วัน) จำนวน <span className="font-semibold">{dueSoonCount} รายการ</span>
            </span>
          </div>
          <button
            onClick={() => onSelectStatusFilter('due_soon')}
            className="text-xs font-semibold text-amber-900 dark:text-amber-300 underline hover:text-amber-800 cursor-pointer"
          >
            แสดงรายการ
          </button>
        </div>
      )}

      {/* Grid of Key Financial Statistics */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Stat 1: Total Loan Budget */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
            <span>วงเงินยืมรวม</span>
            <DollarSign className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-mono tabular-nums">
            ฿{formatCurrency(totalLoanAmount)}
          </div>
          <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            จากทั้งหมด <span className="font-semibold text-slate-700 dark:text-slate-200 font-mono tabular-nums">{contracts.length}</span> สัญญา
          </div>
        </div>

        {/* Stat 2: Total Settled / Repaid */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
            <span>ส่งใช้คืนแล้ว</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-bold text-emerald-700 dark:text-emerald-400 font-mono tabular-nums">
            ฿{formatCurrency(totalSettledAmount)}
          </div>
          <div className="mt-1 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>อัตราการส่งใช้</span>
            <span className="font-semibold text-emerald-700 dark:text-emerald-400 font-mono tabular-nums">
              {recoveryRate.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Stat 3: Total Remaining Debt */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
            <span>ยอดหนี้ค้างชำระ</span>
            <Clock className="w-4 h-4 text-blue-500" />
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-mono tabular-nums">
            ฿{formatCurrency(totalRemainingDebt)}
          </div>
          <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            ยังคงค้างส่งใช้ในระบบ
          </div>
        </div>

        {/* Stat 4: Overdue Loans */}
        <div
          onClick={() => onSelectStatusFilter('overdue')}
          className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-xs hover:border-rose-300 dark:hover:border-rose-700 cursor-pointer transition-colors"
        >
          <div className="flex items-center justify-between text-xs text-rose-600 dark:text-rose-400 font-medium">
            <span>เกินกำหนดส่งใช้</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-bold text-rose-600 dark:text-rose-400 font-mono tabular-nums">
            {overdueCount} <span className="text-xs font-normal">สัญญา</span>
          </div>
          <div className="mt-1 text-xs text-rose-600/80 dark:text-rose-400/80 font-mono tabular-nums truncate">
            ฿{formatCurrency(overdueDebt)}
          </div>
        </div>

        {/* Stat 5: Settled Contracts */}
        <div
          onClick={() => onSelectStatusFilter('closed')}
          className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-xs hover:border-emerald-300 dark:hover:border-emerald-700 cursor-pointer transition-colors"
        >
          <div className="flex items-center justify-between text-xs text-emerald-700 dark:text-emerald-400 font-medium">
            <span>ปิดสัญญาแล้ว</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-mono tabular-nums">
            {settledCount} <span className="text-xs font-normal text-slate-500 dark:text-slate-400">สัญญา</span>
          </div>
          <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            ชำระครบถ้วน 100%
          </div>
        </div>
      </div>
    </div>
  );
};
