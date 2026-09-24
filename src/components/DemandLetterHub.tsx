import React, { useState } from 'react';
import { LoanContract } from '../types/loan';
import { calculateLoanSummary, formatCurrency, formatThaiDate } from '../utils/loanCalculations';
import { FileText, Printer, Search, AlertCircle, ShieldAlert } from 'lucide-react';

interface DemandLetterHubProps {
  contracts: LoanContract[];
  onOpenDemandLetterModal: (contract: LoanContract) => void;
}

export const DemandLetterHub: React.FC<DemandLetterHubProps> = ({
  contracts,
  onOpenDemandLetterModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const eligibleContracts = contracts.filter(c => {
    const summary = calculateLoanSummary(c);
    // Contracts that have remaining debt
    if (summary.remainingDebt <= 0) return false;

    if (searchTerm.trim()) {
      const t = searchTerm.toLowerCase();
      return (
        c.contractNo.toLowerCase().includes(t) ||
        c.borrowerName.toLowerCase().includes(t) ||
        c.department.toLowerCase().includes(t)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Informative Header */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
              <span>ศูนย์ออกหนังสือทวงถามหนี้เงินยืมราชการ (บันทึกข้อความตราครุฑ)</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
              สร้างและพิมพ์บันทึกข้อความราชการตามระเบียบงานสารบรรณ เพื่อทวงถามการส่งใช้เงินยืมและใบสำคัญคู่จ่าย ระบบจะดึงข้อมูลสัญญา ยอดหนี้คงค้าง และคำนวณจำนวนวันที่ล่วงเลยกำหนดให้อัตโนมัติ
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 shrink-0">
            <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>ตามระเบียบงานสารบรรณ</span>
          </div>
        </div>

        {/* Search */}
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 max-w-md relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ค้นหาเลขที่สัญญา หรือชื่อผู้ยืม..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-100 placeholder-slate-400"
          />
        </div>
      </div>

      {/* Contracts with Debt Table */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/60 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
            รายการสัญญายืมเงินที่มียอดหนี้คงค้าง ({eligibleContracts.length} สัญญา)
          </h3>
          <span className="text-2xs text-slate-500 dark:text-slate-400">
            คลิกปุ่มพิมพ์บันทึกข้อความเพื่อสร้างเอกสารทวงถามหนี้ตราครุฑ
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-700/60 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold">
                <th className="py-3 px-4">เลขที่สัญญา</th>
                <th className="py-3 px-4">ผู้ยืมเงิน / สังกัด</th>
                <th className="py-3 px-4">วัตถุประสงค์</th>
                <th className="py-3 px-4 text-right">วงเงินยืม</th>
                <th className="py-3 px-4 text-right">หนี้คงเหลือ</th>
                <th className="py-3 px-4">ครบกำหนด</th>
                <th className="py-3 px-4 text-center">สถานะ</th>
                <th className="py-3 px-4 text-center">ออกเอกสาร</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 text-slate-700 dark:text-slate-300">
              {eligibleContracts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-400 dark:text-slate-500">
                    ไม่พบรายการสัญญาที่มียอดหนี้ค้างชำระ
                  </td>
                </tr>
              ) : (
                eligibleContracts.map((contract) => {
                  const summary = calculateLoanSummary(contract);
                  const isOverdue = summary.status === 'overdue';

                  return (
                    <tr
                      key={contract.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors"
                    >
                      <td className="py-3 px-4 font-mono font-semibold text-slate-900 dark:text-white">
                        {contract.contractNo}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-900 dark:text-slate-100">{contract.borrowerName}</div>
                        <div className="text-2xs text-slate-500 dark:text-slate-400">{contract.department}</div>
                      </td>
                      <td className="py-3 px-4 max-w-[200px] truncate" title={contract.purpose}>
                        {contract.purpose}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-800 dark:text-slate-200">
                        ฿{formatCurrency(contract.loanAmount)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-rose-700 dark:text-rose-400">
                        ฿{formatCurrency(summary.remainingDebt)}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div>{formatThaiDate(contract.dueDate)}</div>
                        {isOverdue && (
                          <span className="text-2xs font-semibold text-rose-600 dark:text-rose-400">
                            (เกิน {Math.abs(summary.daysDiff)} วัน)
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-2xs font-semibold ${
                            isOverdue
                              ? 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300'
                              : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                          }`}
                        >
                          {isOverdue ? 'เกินกำหนด' : 'ค้างชำระ'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => onOpenDemandLetterModal(contract)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shadow-2xs cursor-pointer ${
                            isOverdue
                              ? 'bg-rose-700 hover:bg-rose-800 text-white'
                              : 'bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600'
                          }`}
                          title="พิมพ์บันทึกข้อความทวงถามหนี้เงินยืมราชการ"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>บันทึกข้อความ</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
