import React from 'react';
import { LoanContract } from '../types/loan';
import { calculateLoanSummary, convertNumberToThaiBahtText, formatCurrency, formatThaiDate, getStatusBadgeStyle } from '../utils/loanCalculations';
import { X, CheckCircle, Clock, AlertTriangle, Plus, FileText, Printer, ShieldCheck, Trash2 } from 'lucide-react';

interface ContractDetailModalProps {
  contract: LoanContract | null;
  onClose: () => void;
  onAddRepayment: (contract: LoanContract) => void;
  onGenerateDemandLetter: (contract: LoanContract) => void;
  onPrintForm8500: (contract: LoanContract) => void;
  onVerifyRepayment: (contractId: string, repaymentId: string, verifierName: string) => void;
  onDeleteRepayment: (contractId: string, repaymentId: string) => void;
}

export const ContractDetailModal: React.FC<ContractDetailModalProps> = ({
  contract,
  onClose,
  onAddRepayment,
  onGenerateDemandLetter,
  onPrintForm8500,
  onVerifyRepayment,
  onDeleteRepayment,
}) => {
  if (!contract) return null;

  const summary = calculateLoanSummary(contract);
  const badge = getStatusBadgeStyle(summary.status);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-4xl w-full overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold text-sm">
              ย.
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 font-mono">
                  สัญญาเลขที่ {contract.contractNo}
                </h2>
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.bg}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                  {summary.statusLabel}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                ผู้ยืม: {contract.borrowerName} ({contract.position}) · {contract.department}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Key Metric Financial Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <span className="text-xs text-slate-500 font-medium block">วงเงินสัญญาการยืมเงิน</span>
              <span className="text-xl font-bold text-slate-900 font-mono tabular-nums">
                ฿{formatCurrency(contract.loanAmount)}
              </span>
              <span className="text-2xs text-slate-400 block mt-0.5">
                ({convertNumberToThaiBahtText(contract.loanAmount)})
              </span>
            </div>

            <div>
              <span className="text-xs text-slate-500 font-medium block">ส่งใช้คืนแล้วทั้งหมด</span>
              <span className="text-xl font-bold text-emerald-700 font-mono tabular-nums">
                ฿{formatCurrency(summary.totalSettled)}
              </span>
              <span className="text-2xs text-emerald-800 block mt-0.5">
                สด ฿{formatCurrency(summary.totalCashReturned)} + ใบสำคัญ ฿{formatCurrency(summary.totalVoucherSettled)}
              </span>
            </div>

            <div>
              <span className="text-xs text-slate-500 font-medium block">ยอดหนี้คงค้าง</span>
              <span className={`text-xl font-bold font-mono tabular-nums ${summary.remainingDebt > 0 ? (summary.isOverdue ? 'text-rose-600' : 'text-amber-700') : 'text-slate-400'}`}>
                ฿{formatCurrency(summary.remainingDebt)}
              </span>
              <span className="text-2xs text-slate-400 block mt-0.5">
                {summary.remainingDebt === 0 ? 'ชำระคืนครบถ้วนสมบูรณ์แล้ว' : 'รอส่งใช้คืนตามกำหนด'}
              </span>
            </div>
          </div>

          {/* Automatic Reconciliation & Audit Verification Box */}
          <div className={`p-4 rounded-xl border ${
            summary.reconciliationStatus === 'balanced' 
              ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
              : summary.reconciliationStatus === 'underpaid'
              ? 'bg-amber-50/70 border-amber-200 text-amber-950'
              : summary.reconciliationStatus === 'overpaid'
              ? 'bg-sky-50/70 border-sky-200 text-sky-950'
              : 'bg-slate-50 border-slate-200 text-slate-800'
          }`}>
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold">
                    การตรวจสอบและกระทบยอดเงินยืมอัตโนมัติ (Automated Reconciliation)
                  </h4>
                  <span className="text-xs font-semibold px-2 py-0.5 bg-white/80 rounded border border-current">
                    {summary.reconciliationStatus === 'balanced' && 'สมดุล 100%'}
                    {summary.reconciliationStatus === 'underpaid' && 'ค้างส่งใช้'}
                    {summary.reconciliationStatus === 'overpaid' && 'ส่งเกิน'}
                    {summary.reconciliationStatus === 'none' && 'รอส่งใช้'}
                  </span>
                </div>
                <p className="text-xs mt-1 leading-relaxed">
                  {summary.reconciliationMessage}
                </p>
                <div className="mt-2 text-2xs grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-black/5 text-slate-600">
                  <div>
                    <span className="font-semibold">ประเภทการยืม:</span> {contract.loanType === 'travel' ? 'เดินทางไปราชการ (ส่งใช้ใน 15 วัน)' : 'โครงการ/ราชการอื่น (ส่งใช้ใน 30 วัน)'}
                  </div>
                  <div>
                    <span className="font-semibold">วันจ่ายเงิน:</span> {formatThaiDate(contract.disbursementDate, 'short')}
                  </div>
                  <div>
                    <span className="font-semibold">วันครบกำหนด:</span> {formatThaiDate(contract.dueDate, 'short')}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contract Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-2 bg-slate-50/50 p-4 rounded-xl border border-slate-200">
              <h5 className="font-bold text-slate-900 text-sm">ข้อมูลสัญญาและผู้ยืม</h5>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">เลขที่สัญญา:</span>
                <span className="font-mono font-semibold text-slate-900">{contract.contractNo}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">วันที่ทำสัญญา:</span>
                <span className="font-medium text-slate-800">{formatThaiDate(contract.contractDate, 'full')}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">ปีงบประมาณ:</span>
                <span className="font-medium text-slate-800">พ.ศ. {contract.fiscalYear}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">ชื่อผู้ยืม:</span>
                <span className="font-semibold text-slate-900">{contract.borrowerName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">ตำแหน่ง / สังกัด:</span>
                <span className="text-slate-800">{contract.position} · {contract.department}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">แหล่งเงินงบประมาณ:</span>
                <span className="text-slate-800">{contract.budgetType}</span>
              </div>
            </div>

            <div className="space-y-2 bg-slate-50/50 p-4 rounded-xl border border-slate-200">
              <h5 className="font-bold text-slate-900 text-sm">วัตถุประสงค์และหมายเหตุ</h5>
              <div className="py-1">
                <span className="text-slate-500 block mb-1">วัตถุประสงค์การยืม:</span>
                <p className="text-slate-800 leading-relaxed bg-white p-2.5 rounded-lg border border-slate-200 text-xs">
                  {contract.purpose}
                </p>
              </div>
              <div className="py-1">
                <span className="text-slate-500 block mb-1">หมายเหตุการติดตาม:</span>
                <p className="text-slate-600 italic bg-white p-2.5 rounded-lg border border-slate-200 text-xs">
                  {contract.remarks || 'ไม่มีหมายเหตุเพิ่มเติม'}
                </p>
              </div>
            </div>
          </div>

          {/* Repayments History */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span>ประวัติการส่งใช้คืนเงินยืมและใบสำคัญคู่จ่าย</span>
                <span className="text-xs font-normal text-slate-500">
                  ({(contract.repayments || []).length} รายการ)
                </span>
              </h4>
              <button
                onClick={() => onAddRepayment(contract)}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>บันทึกส่งใช้คืน</span>
              </button>
            </div>

            {(contract.repayments || []).length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 text-slate-500 text-xs">
                ยังไม่มีการส่งใช้คืนเงินสดหรือใบสำคัญสำหรับสัญญานี้
                <div className="mt-2">
                  <button
                    onClick={() => onAddRepayment(contract)}
                    className="text-emerald-700 font-semibold hover:underline"
                  >
                    + บันทึกการส่งใช้เงินยืมครั้งแรก
                  </button>
                </div>
              </div>
            ) : (
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100/80 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">วันที่ส่งใช้</th>
                      <th className="py-2.5 px-3 text-right">เงินสด/เงินโอน (บาท)</th>
                      <th className="py-2.5 px-3">เลขที่ใบเสร็จรับเงิน</th>
                      <th className="py-2.5 px-3 text-right">ใบสำคัญคู่จ่าย (บาท)</th>
                      <th className="py-2.5 px-3">เลขที่ใบสำคัญ/ฎีกา</th>
                      <th className="py-2.5 px-3 text-right">รวมส่งใช้ (บาท)</th>
                      <th className="py-2.5 px-3 text-center">การตรวจรับรอง</th>
                      <th className="py-2.5 px-3 text-center">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {contract.repayments.map((rep) => (
                      <tr key={rep.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-medium text-slate-900 whitespace-nowrap">
                          {formatThaiDate(rep.repaymentDate, 'short')}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-800">
                          {rep.cashAmount > 0 ? `฿${formatCurrency(rep.cashAmount)}` : '-'}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 font-mono">
                          {rep.receiptNo || '-'}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-800">
                          {rep.voucherAmount > 0 ? `฿${formatCurrency(rep.voucherAmount)}` : '-'}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 font-mono">
                          {rep.voucherNo || '-'}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono tabular-nums font-semibold text-emerald-700">
                          ฿{formatCurrency(rep.totalSettled)}
                        </td>
                        <td className="py-2.5 px-3 text-center whitespace-nowrap">
                          {rep.verified ? (
                            <span className="inline-flex items-center gap-1 text-emerald-700 font-medium text-2xs" title={`ตรวจรับรองโดย: ${rep.verifiedBy || 'เจ้าหน้าที่การเงิน'}`}>
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>ตรวจรับรองแล้ว</span>
                            </span>
                          ) : (
                            <button
                              onClick={() => onVerifyRepayment(contract.id, rep.id, 'นางกานดา สุขสมบัติ (หน.งานการเงิน)')}
                              className="px-2 py-0.5 text-2xs font-semibold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 rounded transition-colors"
                            >
                              กดตรวจรับรอง
                            </button>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <button
                            onClick={() => {
                              if (window.confirm('ต้องการลบรายการส่งใช้นี้หรือไม่?')) {
                                onDeleteRepayment(contract.id, rep.id);
                              }
                            }}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded"
                            title="ลบรายการส่งใช้"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer with Actions */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPrintForm8500(contract)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors shadow-2xs"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span>พิมพ์ทะเบียนคุม (แบบ 8500)</span>
            </button>

            {summary.isOverdue && summary.remainingDebt > 0 && (
              <button
                onClick={() => onGenerateDemandLetter(contract)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors"
              >
                <FileText className="w-4 h-4" />
                <span>ออกหนังสือทวงถามหนี้</span>
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
