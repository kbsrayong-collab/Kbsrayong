import React, { useState } from 'react';
import { LoanContract } from '../types/loan';
import { calculateLoanSummary, convertNumberToThaiBahtText, formatCurrency, formatThaiDate } from '../utils/loanCalculations';
import { GarudaEmblem } from './GarudaEmblem';
import { X, Printer, Edit3, Check, Download } from 'lucide-react';

interface OfficialDemandLetterModalProps {
  contract: LoanContract | null;
  isOpen: boolean;
  onClose: () => void;
}

export const OfficialDemandLetterModal: React.FC<OfficialDemandLetterModalProps> = ({
  contract,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !contract) return null;

  const summary = calculateLoanSummary(contract);
  const today = new Date().toISOString().split('T')[0];

  // Customizable letter fields
  const [docNumber, setDocNumber] = useState(`กค 0409.3/ทว.${contract.contractNo.replace(/[^0-9]/g, '')}`);
  const [docDate, setDocDate] = useState(today);
  const [departmentName, setDepartmentName] = useState('กลุ่มงานการเงินและบัญชี โทร. 0-2123-4567');
  const [signeeName, setSigneeName] = useState('นายประวิทย์ วงศ์สวัสดิ์');
  const [signeePosition, setSigneePosition] = useState('ผู้อำนวยการกองคลัง ปฏิบัติราชการแทนผู้ว่าราชการจังหวัด');
  const [isEditing, setIsEditing] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-3xl w-full overflow-hidden my-4 sm:my-6 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]">
        {/* Top Action Bar (hidden in print) */}
        <div className="px-6 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0 print:hidden">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <h3 className="text-sm font-bold text-slate-800">
              หนังสือทวงถามหนี้เงินยืมราชการ (บันทึกข้อความตราครุฑ)
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isEditing ? 'ดูตัวอย่างเอกสาร' : 'แก้ไขข้อมูลหนังสือ'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>พิมพ์เอกสารราชการ</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Edit Configuration Drawer if active (hidden in print) */}
        {isEditing && (
          <div className="p-4 bg-emerald-50/70 border-b border-emerald-200 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs shrink-0 print:hidden">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">เลขที่หนังสือราชการ</label>
              <input
                type="text"
                value={docNumber}
                onChange={(e) => setDocNumber(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">วันที่ออกหนังสือ</label>
              <input
                type="date"
                value={docDate}
                onChange={(e) => setDocDate(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">ส่วนราชการเจ้าของเรื่อง</label>
              <input
                type="text"
                value={departmentName}
                onChange={(e) => setDepartmentName(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">ชื่อและตำแหน่งผู้ลงนาม</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={signeeName}
                  onChange={(e) => setSigneeName(e.target.value)}
                  placeholder="ชื่อ-สกุล"
                  className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                />
                <input
                  type="text"
                  value={signeePosition}
                  onChange={(e) => setSigneePosition(e.target.value)}
                  placeholder="ตำแหน่ง"
                  className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Printable Thai Government Official Memorandum (บันทึกข้อความ ตราครุฑ) */}
        <div className="flex-1 overflow-y-auto p-8 sm:p-12 bg-white text-slate-900 font-['Sarabun',sans-serif] leading-relaxed select-text print:p-0 print:overflow-visible">
          {/* Official Letterhead */}
          <div className="relative border-b-2 border-slate-900 pb-3 mb-5">
            {/* Garuda Emblem */}
            <div className="flex items-center gap-4">
              <GarudaEmblem size={64} className="text-black shrink-0" />
              <h1 className="text-3xl font-extrabold tracking-wide text-black">
                บันทึกข้อความ
              </h1>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-y-2 text-sm text-black">
              <div>
                <span className="font-bold">ส่วนราชการ:</span>{' '}
                <span>{departmentName}</span>
              </div>
              <div className="text-right">
                <span className="font-bold">ที่:</span>{' '}
                <span className="font-mono">{docNumber}</span>
              </div>
              <div>
                <span className="font-bold">วันที่:</span>{' '}
                <span>{formatThaiDate(docDate, 'full')}</span>
              </div>
              <div className="text-right">
                <span className="font-bold">เรื่อง:</span>{' '}
                <span className="font-bold">ขอให้ส่งใช้เงินยืมราชการตามสัญญาการยืมเงิน</span>
              </div>
            </div>
          </div>

          {/* Recipient */}
          <div className="text-sm text-black mb-4">
            <span className="font-bold">เรียน:</span>{' '}
            <span>{contract.borrowerName} ({contract.position}) สังกัด {contract.department}</span>
          </div>

          {/* Body Paragraph 1: Context & Citation */}
          <div className="text-sm text-justify indent-8 text-black mb-3">
            ตามที่ท่านได้ทำสัญญาการยืมเงินราชการ เลขที่ <span className="font-bold font-mono">{contract.contractNo}</span> ลงวันที่ {formatThaiDate(contract.contractDate, 'full')} เป็นจำนวนเงิน <span className="font-bold font-mono">฿{formatCurrency(contract.loanAmount)}</span> บาท ({convertNumberToThaiBahtText(contract.loanAmount)}) เพื่อเป็นค่าใช้จ่ายในการ{contract.purpose} และได้รับเงินยืมไปตั้งแต่วันที่ {formatThaiDate(contract.disbursementDate, 'full')} นั้น
          </div>

          {/* Body Paragraph 2: Regulations & Overdue Warning */}
          <div className="text-sm text-justify indent-8 text-black mb-3">
            ตามระเบียบกระทรวงการคลังว่าด้วยการเบิกจ่ายเงินจากคลัง การเก็บรักษาเงิน และการนำเงินส่งคลัง พ.ศ. 2562 และระเบียบการยืมเงินราชการ กำหนดให้ผู้ยืมเงินต้องส่งใช้เงินยืมภายใน {contract.loanType === 'travel' ? '15 วัน นับจากวันเดินทางกลับถึง' : '30 วัน นับจากวันที่ได้รับเงินยืม'} ซึ่งสัญญาดังกล่าวได้ครบกำหนดส่งใช้ตั้งแต่วันที่ <span className="font-bold">{formatThaiDate(contract.dueDate, 'full')}</span> และบัดนี้ได้ล่วงเลยกำหนดเวลามาแล้วเป็นเวลา <span className="font-bold text-rose-800">{Math.abs(summary.daysDiff)} วัน</span> โดยปัจจุบันยังมียอดเงินยืมค้างชำระเป็นจำนวนเงินทั้งสิ้น <span className="font-bold font-mono">฿{formatCurrency(summary.remainingDebt)}</span> บาท ({convertNumberToThaiBahtText(summary.remainingDebt)})
          </div>

          {/* Body Paragraph 3: Action Required */}
          <div className="text-sm text-justify indent-8 text-black mb-6">
            ดังนั้น เพื่อให้การบริหารการเงินการคลังเป็นไปด้วยความถูกต้องตามระเบียบของทางราชการ ขอให้ท่านดำเนินการนำส่งเงินสดและ/หรือหลักฐานใบสำคัญคู่จ่ายที่ถูกต้องครบถ้วน มาส่งใช้คืนเงินยืมที่กลุ่มงานการเงินและบัญชีโดยด่วนที่สุด หากมีเหตุขัดข้องประการใดโปรดชี้แจงเป็นลายลักษณ์อักษรต่อไป
          </div>

          {/* Closing & Signature Block */}
          <div className="text-sm text-black mb-8">
            <div className="indent-8 mb-8">
              จึงเรียนมาเพื่อโปรดดำเนินการโดยด่วน
            </div>

            <div className="flex justify-end pr-8">
              <div className="text-center w-64">
                <div className="h-14 flex items-end justify-center">
                  <div className="w-40 border-b border-dotted border-slate-500 mb-2"></div>
                </div>
                <div className="font-bold">({signeeName})</div>
                <div className="text-xs text-slate-700 mt-0.5">{signeePosition}</div>
              </div>
            </div>
          </div>

          {/* Audit Note & Reference at bottom */}
          <div className="pt-4 border-t border-slate-200 text-2xs text-slate-500 flex justify-between items-center">
            <span>เอกสารนี้สร้างโดยระบบทะเบียนคุมสัญญายืมเงินราชการ (AppSheet Sync Reference: {contract.appsheetId || 'DB-LNROtcKH1O4SE0Sz0GtNT5'})</span>
            <span className="font-mono">รหัสตรวจสอบ: {contract.id}</span>
          </div>
        </div>

        {/* Modal Footer (hidden in print) */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0 print:hidden">
          <span className="text-xs text-slate-500">
            คำแนะนำ: สามารถกดปุ่ม "พิมพ์เอกสารราชการ" เพื่อสั่งพิมพ์หรือบันทึกเป็น PDF (ขนาด A4)
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>พิมพ์บันทึกข้อความ</span>
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
