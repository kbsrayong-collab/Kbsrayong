import React, { useState } from 'react';
import { LoanContract } from '../types/loan';
import { calculateLoanSummary, convertNumberToThaiBahtText, formatCurrency, formatThaiDate } from '../utils/loanCalculations';
import { AlertTriangle, FileText, DollarSign, Calendar, Eye, Clock } from 'lucide-react';

interface OverdueViewProps {
  contracts: LoanContract[];
  onGenerateDemandLetter: (contract: LoanContract) => void;
  onViewContract: (contract: LoanContract) => void;
  onAddRepayment: (contract: LoanContract) => void;
}

export const OverdueView: React.FC<OverdueViewProps> = ({
  contracts,
  onGenerateDemandLetter,
  onViewContract,
  onAddRepayment,
}) => {
  const [severityFilter, setSeverityFilter] = useState<'all' | 'critical' | 'moderate'>('all');

  // Filter only contracts that are overdue and have remaining debt
  const overdueContracts = contracts
    .map(c => ({ contract: c, summary: calculateLoanSummary(c) }))
    .filter(({ summary }) => summary.status === 'overdue' && summary.remainingDebt > 0);

  const totalOverdueDebt = overdueContracts.reduce((sum, item) => sum + item.summary.remainingDebt, 0);

  // Filter by severity
  const filteredOverdue = overdueContracts.filter(({ summary }) => {
    const days = Math.abs(summary.daysDiff);
    if (severityFilter === 'critical') return days > 15;
    if (severityFilter === 'moderate') return days <= 15;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-rose-900 dark:bg-rose-950 text-white rounded-2xl p-6 shadow-sm border border-rose-800">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-800 text-rose-200">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>ระบบตรวจสอบหนี้เงินยืมค้างชำระเกินกำหนดอัตโนมัติ</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              ทะเบียนติดตามหนี้เงินยืมราชการเกินกำหนดส่งใช้
            </h2>
            <p className="text-xs text-rose-200 max-w-2xl">
              สัญญาการยืมเงินต้องส่งใช้ภายในกำหนดเวลา เมื่อพ้นกำหนดให้กลุ่มงานการเงินออกหนังสือติดตามทวงถามส่งใช้เงินยืมทันที
            </p>
          </div>

          <div className="bg-rose-950/60 p-4 rounded-xl border border-rose-800 text-right shrink-0">
            <span className="text-xs text-rose-300 block">ยอดหนี้เกินกำหนดรวมทั้งสิ้น</span>
            <span className="text-2xl sm:text-3xl font-bold font-mono text-white tabular-nums">
              ฿{formatCurrency(totalOverdueDebt)}
            </span>
            <span className="text-2xs text-rose-300 block mt-0.5">
              จำนวน {overdueContracts.length} สัญญา
            </span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 text-xs">
        <span className="text-slate-500 dark:text-slate-400 font-medium">ระดับการเกินกำหนด:</span>
        <button
          onClick={() => setSeverityFilter('all')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
            severityFilter === 'all'
              ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-2xs'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
          }`}
        >
          ทั้งหมด ({overdueContracts.length})
        </button>
        <button
          onClick={() => setSeverityFilter('critical')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
            severityFilter === 'critical'
              ? 'bg-rose-700 text-white shadow-2xs'
              : 'bg-white dark:bg-slate-800 text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 border border-rose-200 dark:border-rose-900'
          }`}
        >
          เกินกำหนดมากกว่า 15 วัน (เร่งด่วน)
        </button>
        <button
          onClick={() => setSeverityFilter('moderate')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
            severityFilter === 'moderate'
              ? 'bg-amber-700 text-white shadow-2xs'
              : 'bg-white dark:bg-slate-800 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/50 border border-amber-200 dark:border-amber-900'
          }`}
        >
          เกินกำหนดไม่เกิน 15 วัน
        </button>
      </div>

      {/* Overdue Cards Grid */}
      {filteredOverdue.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-12 text-center text-slate-500 dark:text-slate-400">
          <Clock className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
          <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">ไม่พบสัญญาเงินยืมที่เกินกำหนดชำระในกลุ่มนี้</h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">ผู้ยืมเงินทุกคนส่งใช้คืนตามกำหนดเวลา</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredOverdue.map(({ contract, summary }) => {
            const daysOverdue = Math.abs(summary.daysDiff);

            return (
              <div
                key={contract.id}
                className="bg-white dark:bg-slate-800 border-2 border-rose-200 dark:border-rose-900/60 rounded-xl p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-rose-300 dark:hover:border-rose-700 transition-colors"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-base text-slate-900 dark:text-white">
                          {contract.contractNo}
                        </span>
                        <span className="px-2 py-0.5 bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 rounded font-semibold text-2xs">
                          เกินกำหนด {daysOverdue} วัน
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {contract.department} · ปีงบฯ {contract.fiscalYear}
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-2xs text-slate-400 block">ยอดค้างส่งใช้</span>
                      <span className="text-lg font-bold font-mono text-rose-700 dark:text-rose-400 tabular-nums">
                        ฿{formatCurrency(summary.remainingDebt)}
                      </span>
                    </div>
                  </div>

                  {/* Borrower Details */}
                  <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-900/60 rounded-lg space-y-1.5 border border-slate-100 dark:border-slate-700/60 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 dark:text-slate-400">ผู้ยืมเงิน:</span>
                      <span className="font-semibold text-slate-900 dark:text-white">{contract.borrowerName}</span>
                    </div>
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-slate-500 dark:text-slate-400 shrink-0">วัตถุประสงค์:</span>
                      <span className="text-slate-700 dark:text-slate-300 text-right truncate">{contract.purpose}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 dark:text-slate-400">วงเงินที่ยืม:</span>
                      <span className="font-mono text-slate-700 dark:text-slate-300">฿{formatCurrency(contract.loanAmount)}</span>
                    </div>
                    <div className="flex items-center justify-between text-rose-700 dark:text-rose-400 font-medium">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>กำหนดส่งใช้เดิม:</span>
                      </span>
                      <span>{formatThaiDate(contract.dueDate)}</span>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-700/60">
                  <button
                    onClick={() => onViewContract(contract)}
                    className="px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>ดูรายละเอียด</span>
                  </button>

                  <button
                    onClick={() => onAddRepayment(contract)}
                    className="px-3 py-1.5 text-xs font-medium text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <DollarSign className="w-3.5 h-3.5" />
                    <span>บันทึกชำระคืน</span>
                  </button>

                  <button
                    onClick={() => onGenerateDemandLetter(contract)}
                    className="px-3.5 py-1.5 text-xs font-semibold text-white bg-rose-700 hover:bg-rose-800 rounded-lg transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>ออกหนังสือทวงถามหนี้</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
