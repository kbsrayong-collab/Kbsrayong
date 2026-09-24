import React from 'react';
import { LoanContract } from '../types/loan';
import { calculateLoanSummary, convertNumberToThaiBahtText, formatCurrency, formatThaiDate } from '../utils/loanCalculations';
import { Printer, X } from 'lucide-react';

interface Form8500PrintViewProps {
  contract: LoanContract | null;
  isOpen: boolean;
  onClose: () => void;
}

export const Form8500PrintView: React.FC<Form8500PrintViewProps> = ({
  contract,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !contract) return null;

  const summary = calculateLoanSummary(contract);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-4xl w-full overflow-hidden my-4 sm:my-6 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]">
        {/* Top Control Bar (Hidden in print) */}
        <div className="px-6 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0 print:hidden">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
            <h3 className="text-sm font-bold text-slate-800">
              ทะเบียนคุมสัญญาการยืมเงิน (แบบ 8500)
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>พิมพ์แบบฟอร์ม (A4)</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Form 8500 */}
        <div className="flex-1 overflow-y-auto p-8 sm:p-12 bg-white text-slate-900 font-['Sarabun',sans-serif] leading-relaxed select-text print:p-0 print:overflow-visible">
          {/* Form Header */}
          <div className="text-right text-xs text-slate-500 font-bold mb-1">
            แบบ 8500
          </div>
          <div className="text-center mb-6">
            <h1 className="text-xl font-bold tracking-wide">
              สัญญาการยืมเงินและทะเบียนคุมการส่งใช้เงินยืม
            </h1>
            <p className="text-xs text-slate-600 mt-0.5">
              ตามระเบียบกระทรวงการคลังว่าด้วยการเบิกจ่ายเงินจากคลัง การเก็บรักษาเงิน และการนำเงินส่งคลัง
            </p>
          </div>

          {/* Part 1: Contract Details */}
          <div className="border border-slate-300 rounded-lg p-4 mb-6 text-xs space-y-2.5">
            <div className="font-bold text-sm text-slate-900 border-b border-slate-200 pb-1.5 mb-2">
              ส่วนที่ 1: รายละเอียดสัญญาการยืมเงิน
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <span className="text-slate-500 block">เลขที่สัญญา:</span>
                <span className="font-bold font-mono text-sm">{contract.contractNo}</span>
              </div>
              <div>
                <span className="text-slate-500 block">วันที่ยืมเงิน:</span>
                <span className="font-semibold">{formatThaiDate(contract.contractDate, 'short')}</span>
              </div>
              <div>
                <span className="text-slate-500 block">ปีงบประมาณ:</span>
                <span className="font-semibold">พ.ศ. {contract.fiscalYear}</span>
              </div>
              <div>
                <span className="text-slate-500 block">กำหนดส่งใช้คืนภายใน:</span>
                <span className="font-bold text-rose-800">{formatThaiDate(contract.dueDate, 'short')}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
              <div>
                <span className="text-slate-500 block">ชื่อผู้ยืม:</span>
                <span className="font-bold">{contract.borrowerName}</span>
              </div>
              <div>
                <span className="text-slate-500 block">ตำแหน่ง:</span>
                <span>{contract.position}</span>
              </div>
              <div>
                <span className="text-slate-500 block">กลุ่มงาน / สังกัด:</span>
                <span>{contract.department}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <span className="text-slate-500 block">วัตถุประสงค์การยืมเงิน:</span>
              <p className="text-slate-800 mt-0.5">{contract.purpose}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
              <div>
                <span className="text-slate-500 block">แหล่งเงิน:</span>
                <span>{contract.budgetType}</span>
              </div>
              <div>
                <span className="text-slate-500 block">จำนวนเงินที่ยืม:</span>
                <span className="font-bold text-sm font-mono tabular-nums">
                  ฿{formatCurrency(contract.loanAmount)} บาท
                </span>
                <span className="text-slate-600 block text-2xs">
                  ({convertNumberToThaiBahtText(contract.loanAmount)})
                </span>
              </div>
            </div>
          </div>

          {/* Part 2: Settlement Records Table (แบบ 8500 ตารางส่งใช้คืน) */}
          <div className="mb-6">
            <div className="font-bold text-sm text-slate-900 mb-2">
              ส่วนที่ 2: รายการส่งใช้คืนเงินยืมราชการ (เงินสดและใบสำคัญคู่จ่าย)
            </div>
            <table className="w-full text-left text-xs border border-slate-400 border-collapse">
              <thead>
                <tr className="bg-slate-100 text-center font-bold text-slate-800">
                  <th className="border border-slate-400 py-2 px-2 w-12">ลำดับ</th>
                  <th className="border border-slate-400 py-2 px-2 w-28">วัน เดือน ปี</th>
                  <th className="border border-slate-400 py-2 px-2" colSpan={2}>หลักฐานการส่งใช้</th>
                  <th className="border border-slate-400 py-2 px-2 text-right w-28">เงินสด/เงินโอน</th>
                  <th className="border border-slate-400 py-2 px-2 text-right w-28">ใบสำคัญคู่จ่าย</th>
                  <th className="border border-slate-400 py-2 px-2 text-right w-28">รวมส่งใช้</th>
                  <th className="border border-slate-400 py-2 px-2 text-right w-28">คงเหลือค้างชำระ</th>
                  <th className="border border-slate-400 py-2 px-2 w-28">ลายมือชื่อผู้รับเงิน</th>
                </tr>
                <tr className="bg-slate-50 text-2xs text-center text-slate-600">
                  <th className="border border-slate-400 py-1"></th>
                  <th className="border border-slate-400 py-1">ที่ส่งใช้</th>
                  <th className="border border-slate-400 py-1 w-24">เลขที่ใบเสร็จ</th>
                  <th className="border border-slate-400 py-1">เลขที่ใบสำคัญ</th>
                  <th className="border border-slate-400 py-1 text-right">(บาท)</th>
                  <th className="border border-slate-400 py-1 text-right">(บาท)</th>
                  <th className="border border-slate-400 py-1 text-right">(บาท)</th>
                  <th className="border border-slate-400 py-1 text-right">(บาท)</th>
                  <th className="border border-slate-400 py-1">เจ้าหน้าที่</th>
                </tr>
              </thead>
              <tbody>
                {(contract.repayments || []).length === 0 ? (
                  <tr>
                    <td colSpan={9} className="border border-slate-400 py-6 text-center text-slate-500 italic">
                      ยังไม่มีรายการส่งใช้คืนเงินยืม
                    </td>
                  </tr>
                ) : (
                  contract.repayments.map((rep, idx) => (
                    <tr key={rep.id} className="text-slate-800">
                      <td className="border border-slate-400 py-2 px-2 text-center font-mono">{idx + 1}</td>
                      <td className="border border-slate-400 py-2 px-2 text-center whitespace-nowrap">
                        {formatThaiDate(rep.repaymentDate, 'short')}
                      </td>
                      <td className="border border-slate-400 py-2 px-2 font-mono text-center">{rep.receiptNo || '-'}</td>
                      <td className="border border-slate-400 py-2 px-2 font-mono">{rep.voucherNo || '-'}</td>
                      <td className="border border-slate-400 py-2 px-2 text-right font-mono tabular-nums">
                        {rep.cashAmount > 0 ? formatCurrency(rep.cashAmount) : '-'}
                      </td>
                      <td className="border border-slate-400 py-2 px-2 text-right font-mono tabular-nums">
                        {rep.voucherAmount > 0 ? formatCurrency(rep.voucherAmount) : '-'}
                      </td>
                      <td className="border border-slate-400 py-2 px-2 text-right font-mono tabular-nums font-bold">
                        {formatCurrency(rep.totalSettled)}
                      </td>
                      <td className="border border-slate-400 py-2 px-2 text-right font-mono tabular-nums">
                        {formatCurrency(summary.remainingDebt)}
                      </td>
                      <td className="border border-slate-400 py-2 px-2 text-center text-2xs">
                        {rep.verified ? (rep.verifiedBy || 'เจ้าหน้าที่การเงิน') : 'รอตรวจรับ'}
                      </td>
                    </tr>
                  ))
                )}
                {/* Total Row */}
                <tr className="bg-slate-100 font-bold text-slate-900">
                  <td colSpan={4} className="border border-slate-400 py-2 px-2 text-center">รวมส่งใช้ทั้งสิ้น</td>
                  <td className="border border-slate-400 py-2 px-2 text-right font-mono tabular-nums">
                    {formatCurrency(summary.totalCashReturned)}
                  </td>
                  <td className="border border-slate-400 py-2 px-2 text-right font-mono tabular-nums">
                    {formatCurrency(summary.totalVoucherSettled)}
                  </td>
                  <td className="border border-slate-400 py-2 px-2 text-right font-mono tabular-nums text-emerald-800">
                    {formatCurrency(summary.totalSettled)}
                  </td>
                  <td className="border border-slate-400 py-2 px-2 text-right font-mono tabular-nums text-rose-800">
                    {formatCurrency(summary.remainingDebt)}
                  </td>
                  <td className="border border-slate-400 py-2 px-2 text-center text-2xs">
                    {summary.isFullySettled ? 'ปิดยอดแล้ว' : 'ค้างชำระ'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Audit & Signatures */}
          <div className="grid grid-cols-2 gap-8 pt-4 text-xs">
            <div className="text-center">
              <p className="mb-8">ข้าพเจ้าขอรับรองว่าได้ตรวจสอบหลักฐานและเงินสดถูกต้องแล้ว</p>
              <div className="w-48 border-b border-dotted border-slate-500 mx-auto mb-1"></div>
              <p className="font-bold">เจ้าหน้าที่ผู้ตรวจรับเงินยืม</p>
              <p className="text-slate-500 text-2xs mt-0.5">กลุ่มงานการเงินและบัญชี</p>
            </div>

            <div className="text-center">
              <p className="mb-8">ข้าพเจ้าขอรับรองว่าได้ส่งใช้เงินยืมถูกต้องครบถ้วนตามรายการข้างต้น</p>
              <div className="w-48 border-b border-dotted border-slate-500 mx-auto mb-1"></div>
              <p className="font-bold">({contract.borrowerName})</p>
              <p className="text-slate-500 text-2xs mt-0.5">ผู้ยืมเงิน</p>
            </div>
          </div>
        </div>

        {/* Modal Footer (Hidden in print) */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0 print:hidden">
          <span className="text-xs text-slate-500">
            เอกสารมาตรฐานทะเบียนคุมลูกหนี้เงินยืม (แบบ 8500) ตามระเบียบกระทรวงการคลัง
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>พิมพ์แบบฟอร์ม</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
            >
              ปิดหน้าต่าง
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
