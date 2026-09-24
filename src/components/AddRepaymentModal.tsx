import React, { useState } from 'react';
import { LoanContract } from '../types/loan';
import { calculateLoanSummary, formatCurrency, formatThaiDate } from '../utils/loanCalculations';
import { X, Check, DollarSign, Receipt, FileCheck, AlertCircle } from 'lucide-react';

interface AddRepaymentModalProps {
  contract: LoanContract | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveRepayment: (contractId: string, repaymentData: any) => void;
}

export const AddRepaymentModal: React.FC<AddRepaymentModalProps> = ({
  contract,
  isOpen,
  onClose,
  onSaveRepayment,
}) => {
  if (!isOpen || !contract) return null;

  const summary = calculateLoanSummary(contract);
  const today = new Date().toISOString().split('T')[0];

  const [repaymentDate, setRepaymentDate] = useState(today);
  const [cashAmount, setCashAmount] = useState<string>('');
  const [receiptNo, setReceiptNo] = useState('');
  const [voucherAmount, setVoucherAmount] = useState<string>('');
  const [voucherNo, setVoucherNo] = useState('');
  const [autoVerify, setAutoVerify] = useState(true);
  const [verifierName, setVerifierName] = useState('นางกานดา สุขสมบัติ (หน.งานการเงิน)');
  const [notes, setNotes] = useState('');

  // Calculations for current inputs
  const parsedCash = parseFloat(cashAmount) || 0;
  const parsedVoucher = parseFloat(voucherAmount) || 0;
  const thisTotal = parsedCash + parsedVoucher;
  const newRemaining = summary.remainingDebt - thisTotal;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (thisTotal <= 0) {
      alert('กรุณากรอกยอดเงินสดหรือยอดใบสำคัญคู่จ่ายอย่างน้อย 1 รายการ');
      return;
    }

    const payload = {
      contractId: contract.id,
      repaymentDate,
      cashAmount: parsedCash,
      receiptNo: receiptNo.trim() || undefined,
      voucherAmount: parsedVoucher,
      voucherNo: voucherNo.trim() || undefined,
      totalSettled: thisTotal,
      verified: autoVerify,
      verifiedBy: autoVerify ? verifierName.trim() : undefined,
      verifiedAt: autoVerify ? repaymentDate : undefined,
      notes: notes.trim() || undefined,
    };

    onSaveRepayment(contract.id, payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-emerald-800 text-white flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold flex items-center gap-2">
              <Receipt className="w-5 h-5 text-emerald-200" />
              <span>บันทึกส่งใช้คืนเงินยืมและใบสำคัญ</span>
            </h2>
            <p className="text-xs text-emerald-100 mt-0.5 font-mono">
              สัญญาเลขที่ {contract.contractNo} · {contract.borrowerName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-emerald-200 hover:text-white rounded-lg hover:bg-emerald-700/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
          {/* Contract Status Summary Card */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 grid grid-cols-3 gap-2 text-center">
            <div>
              <span className="text-slate-500 block">วงเงินยืม</span>
              <span className="font-semibold text-slate-800 font-mono text-sm">
                ฿{formatCurrency(contract.loanAmount)}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">ส่งใช้แล้ว</span>
              <span className="font-semibold text-emerald-700 font-mono text-sm">
                ฿{formatCurrency(summary.totalSettled)}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">ยอดค้างปัจจุบัน</span>
              <span className="font-bold text-amber-700 font-mono text-sm">
                ฿{formatCurrency(summary.remainingDebt)}
              </span>
            </div>
          </div>

          {/* Date of Repayment */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              วันที่ส่งใช้คืนเงินยืม <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              required
              value={repaymentDate}
              onChange={(e) => setRepaymentDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Section 1: Cash/Transfer Return */}
          <div className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-100 space-y-2.5">
            <div className="font-semibold text-blue-950 flex items-center justify-between">
              <span>1. ส่งใช้เป็นเงินสด / เงินโอนคืนคลัง</span>
              <span className="text-2xs font-normal text-blue-800">กรณีเงินเหลือจ่าย</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 mb-1">จำนวนเงินสด (บาท)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">฿</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={cashAmount}
                    onChange={(e) => setCashAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-8 pr-3 py-2 bg-white border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-600 mb-1">เลขที่ใบเสร็จรับเงินสด</label>
                <input
                  type="text"
                  value={receiptNo}
                  onChange={(e) => setReceiptNo(e.target.value)}
                  placeholder="เช่น ล.095/2569"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Vouchers / Expense Receipts */}
          <div className="p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-100 space-y-2.5">
            <div className="font-semibold text-emerald-950 flex items-center justify-between">
              <span>2. ส่งใช้เป็นใบสำคัญคู่จ่าย / ใบเสร็จค่าใช้จ่าย</span>
              <span className="text-2xs font-normal text-emerald-800">หลักฐานการจ่ายตามสัญญา</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 mb-1">จำนวนเงินตามใบสำคัญ (บาท)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">฿</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={voucherAmount}
                    onChange={(e) => setVoucherAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-8 pr-3 py-2 bg-white border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-600 mb-1">เลขที่ใบสำคัญ / ฎีกา / เล่มที่</label>
                <input
                  type="text"
                  value={voucherNo}
                  onChange={(e) => setVoucherNo(e.target.value)}
                  placeholder="เช่น บส.150/69, ฎีกา 502"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Real-time Settlement Audit Box */}
          <div className={`p-3.5 rounded-xl border ${
            thisTotal > 0 && Math.abs(newRemaining) < 0.01
              ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
              : thisTotal > 0 && newRemaining < 0
              ? 'bg-amber-50 border-amber-200 text-amber-950'
              : 'bg-slate-50 border-slate-200 text-slate-800'
          }`}>
            <div className="flex items-center justify-between text-xs font-semibold">
              <span>รวมยอดส่งใช้ในรายการนี้:</span>
              <span className="font-mono text-sm text-emerald-700 font-bold tabular-nums">
                ฿{formatCurrency(thisTotal)}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs mt-1 text-slate-600">
              <span>ยอดหนี้คงค้างหลังส่งใช้:</span>
              <span className={`font-mono font-bold tabular-nums ${newRemaining <= 0 ? 'text-emerald-700' : 'text-amber-700'}`}>
                ฿{formatCurrency(Math.max(0, newRemaining))}
              </span>
            </div>
            {thisTotal > 0 && (
              <div className="mt-2 text-2xs pt-1.5 border-t border-black/5">
                {Math.abs(newRemaining) < 0.01 && (
                  <p className="text-emerald-700 font-semibold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    ยอดเงินสด + ใบสำคัญเท่ากับยอดหนี้พอดี พร้อมปิดสัญญาการยืมเงิน
                  </p>
                )}
                {newRemaining > 0 && (
                  <p className="text-amber-700 font-medium">
                    ส่งใช้บางส่วน ยังมียอดคงค้าง ฿{formatCurrency(newRemaining)} รอส่งใช้ในครั้งต่อไป
                  </p>
                )}
                {newRemaining < 0 && (
                  <p className="text-rose-700 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    ยอดส่งใช้เกินกว่ายอดหนี้คงค้าง ฿{formatCurrency(Math.abs(newRemaining))} กรุณาตรวจทานตัวเลข
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Verification Checkbox */}
          <div className="space-y-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={autoVerify}
                onChange={(e) => setAutoVerify(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
              />
              <span className="font-semibold text-slate-800">
                ตรวจรับรองความถูกต้องของใบสำคัญและเงินสดทันที (Audit Verified)
              </span>
            </label>

            {autoVerify && (
              <div className="pl-6 pt-1">
                <label className="block text-slate-500 mb-1 text-2xs">ชื่อเจ้าหน้าที่การเงินผู้ตรวจรับรอง</label>
                <input
                  type="text"
                  value={verifierName}
                  onChange={(e) => setVerifierName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              หมายเหตุการส่งใช้
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="เช่น ส่งใช้ใบเสร็จค่าที่พัก 2 คืน พร้อมค่าตั๋วเครื่องบิน"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={thisTotal <= 0}
              className={`px-5 py-2 text-white font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs ${
                thisTotal > 0
                  ? 'bg-emerald-700 hover:bg-emerald-800 cursor-pointer'
                  : 'bg-slate-400 cursor-not-allowed'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>บันทึกการส่งใช้เงินยืม</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
