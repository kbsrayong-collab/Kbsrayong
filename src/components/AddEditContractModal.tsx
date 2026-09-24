import React, { useState, useEffect } from 'react';
import { BudgetType, LoanContract, LoanType } from '../types/loan';
import { calculateDefaultDueDate, getFiscalYear } from '../utils/loanCalculations';
import { X, Calendar, DollarSign, User, Building, FileText, Check } from 'lucide-react';

interface AddEditContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (contractData: any) => void;
  contractToEdit: LoanContract | null;
  existingContractsCount: number;
}

export const AddEditContractModal: React.FC<AddEditContractModalProps> = ({
  isOpen,
  onClose,
  onSave,
  contractToEdit,
  existingContractsCount,
}) => {
  const [contractNo, setContractNo] = useState('');
  const [contractDate, setContractDate] = useState('');
  const [borrowerName, setBorrowerName] = useState('');
  const [position, setPosition] = useState('');
  const [department, setDepartment] = useState('');
  const [fiscalYear, setFiscalYear] = useState<number>(getFiscalYear());
  const [purpose, setPurpose] = useState('');
  const [loanType, setLoanType] = useState<LoanType>('travel');
  const [budgetType, setBudgetType] = useState<BudgetType>('เงินงบประมาณ (เงินรายจ่ายประจำปี)');
  const [loanAmount, setLoanAmount] = useState<string>('');
  const [disbursementDate, setDisbursementDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [remarks, setRemarks] = useState('');

  // Pre-fill or generate defaults
  useEffect(() => {
    if (contractToEdit) {
      setContractNo(contractToEdit.contractNo);
      setContractDate(contractToEdit.contractDate);
      setBorrowerName(contractToEdit.borrowerName);
      setPosition(contractToEdit.position);
      setDepartment(contractToEdit.department);
      setFiscalYear(contractToEdit.fiscalYear);
      setPurpose(contractToEdit.purpose);
      setLoanType(contractToEdit.loanType);
      setBudgetType(contractToEdit.budgetType);
      setLoanAmount(contractToEdit.loanAmount.toString());
      setDisbursementDate(contractToEdit.disbursementDate || '');
      setDueDate(contractToEdit.dueDate || '');
      setRemarks(contractToEdit.remarks || '');
    } else {
      // Default new contract
      const today = new Date().toISOString().split('T')[0];
      const nextNo = `ย.${String(existingContractsCount + 1).padStart(2, '0')}/${getFiscalYear()}`;
      setContractNo(nextNo);
      setContractDate(today);
      setBorrowerName('');
      setPosition('');
      setDepartment('กลุ่มงานบริหารทั่วไป');
      setFiscalYear(getFiscalYear());
      setPurpose('');
      setLoanType('travel');
      setBudgetType('เงินงบประมาณ (เงินรายจ่ายประจำปี)');
      setLoanAmount('');
      setDisbursementDate(today);
      setDueDate(calculateDefaultDueDate(today, 'travel'));
      setRemarks('');
    }
  }, [contractToEdit, isOpen, existingContractsCount]);

  // When disbursement date or loan type changes, auto-calculate due date
  const handleDisbursementChange = (newDate: string) => {
    setDisbursementDate(newDate);
    if (newDate) {
      const autoDue = calculateDefaultDueDate(newDate, loanType);
      setDueDate(autoDue);
    }
  };

  const handleLoanTypeChange = (newType: LoanType) => {
    setLoanType(newType);
    if (disbursementDate) {
      const autoDue = calculateDefaultDueDate(disbursementDate, newType);
      setDueDate(autoDue);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contractNo.trim() || !borrowerName.trim() || !loanAmount || parseFloat(loanAmount) <= 0) {
      alert('กรุณากรอกข้อมูลเลขที่สัญญา ชื่อผู้ยืม และวงเงินให้ถูกต้องครบถ้วน');
      return;
    }

    const payload = {
      contractNo: contractNo.trim(),
      contractDate,
      borrowerName: borrowerName.trim(),
      position: position.trim() || 'เจ้าหน้าที่',
      department: department.trim() || 'ส่วนราชการ',
      fiscalYear: Number(fiscalYear),
      purpose: purpose.trim() || 'เพื่อใช้จ่ายในการปฏิบัติราชการ',
      loanType,
      budgetType,
      loanAmount: parseFloat(loanAmount),
      disbursementDate,
      dueDate,
      remarks: remarks.trim(),
    };

    onSave(payload);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold text-xs">
              {contractToEdit ? 'แก้ไข' : 'ใหม่'}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {contractToEdit ? 'แก้ไขข้อมูลสัญญายืมเงิน' : 'บันทึกสัญญายืมเงินราชการ (แบบ 8500)'}
              </h2>
              <p className="text-xs text-slate-500">
                กรอกรายละเอียดสัญญาเงินยืมตามระเบียบกระทรวงการคลัง
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
          {/* Row 1: Contract No & Date & Fiscal Year */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                เลขที่สัญญา / สัญญายืมเงิน <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={contractNo}
                onChange={(e) => setContractNo(e.target.value)}
                placeholder="เช่น ย.01/2569"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                วันที่ทำสัญญา <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={contractDate}
                onChange={(e) => setContractDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                ปีงบประมาณ (พ.ศ.) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                required
                value={fiscalYear}
                onChange={(e) => setFiscalYear(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Row 2: Borrower Name, Position, Department */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                ชื่อ-สกุล ผู้ยืมเงิน <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={borrowerName}
                onChange={(e) => setBorrowerName(e.target.value)}
                placeholder="เช่น นายสมเกียรติ มั่นคง"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                ตำแหน่ง
              </label>
              <input
                type="text"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                placeholder="เช่น นักวิชาการเงินฯ ชำนาญการ"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                กลุ่มงาน / ฝ่าย / สังกัด
              </label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="เช่น กลุ่มงานบริหารทั่วไป"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Row 3: Loan Type & Budget Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                ประเภทการยืมเงิน (กำหนดระยะเวลาส่งใช้)
              </label>
              <select
                value={loanType}
                onChange={(e) => handleLoanTypeChange(e.target.value as LoanType)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="travel">เดินทางไปราชการ (ส่งใช้ภายใน 15 วัน)</option>
                <option value="general">ปฏิบัติราชการอื่น / จัดโครงการ / อบรม (ส่งใช้ภายใน 30 วัน)</option>
                <option value="contingency">เงินทดรองราชการ (30 วัน)</option>
                <option value="custom">กำหนดระยะเวลาเอง</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                แหล่งเงินงบประมาณ
              </label>
              <select
                value={budgetType}
                onChange={(e) => setBudgetType(e.target.value as BudgetType)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="เงินงบประมาณ (เงินรายจ่ายประจำปี)">เงินงบประมาณ (เงินรายจ่ายประจำปี)</option>
                <option value="เงินนอกงบประมาณ">เงินนอกงบประมาณ</option>
                <option value="เงินรายได้แผ่นดิน / รายได้สถานศึกษา">เงินรายได้แผ่นดิน / รายได้สถานศึกษา</option>
                <option value="เงินทดรองราชการ">เงินทดรองราชการ</option>
                <option value="เงินอุดหนุนทั่วไป / เฉพาะกิจ">เงินอุดหนุนทั่วไป / เฉพาะกิจ</option>
              </select>
            </div>
          </div>

          {/* Row 4: Purpose */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              วัตถุประสงค์การยืมเงิน / รายละเอียดโครงการ <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={2}
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="ระบุวัตถุประสงค์ เช่น ค่าใช้จ่ายในการเดินทางไปปฏิบัติราชการร่วมประชุม... หรือ จัดอบรม..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none leading-relaxed"
            />
          </div>

          {/* Row 5: Loan Amount & Disbursement & Due Date */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-emerald-50/50 p-3.5 rounded-xl border border-emerald-100">
            <div>
              <label className="block font-semibold text-emerald-950 mb-1">
                วงเงินยืม (บาท) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">฿</span>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  required
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-8 pr-3 py-2 bg-white border border-slate-300 rounded-lg font-mono font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-emerald-950 mb-1">
                วันที่จ่ายเงินยืมให้ผู้ยืม
              </label>
              <input
                type="date"
                value={disbursementDate}
                onChange={(e) => handleDisbursementChange(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
              <span className="text-2xs text-emerald-700 mt-1 block">
                คำนวณวันส่งใช้ 15/30 วันอัตโนมัติ
              </span>
            </div>

            <div>
              <label className="block font-semibold text-emerald-950 mb-1">
                กำหนดวันส่งใช้คืน (Due Date) <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Row 6: Remarks */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              หมายเหตุเพิ่มเติม
            </label>
            <input
              type="text"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="เช่น เลขที่ฎีกาเบิกจ่าย หรือบันทึกข้อความอนุมัติ"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-white bg-emerald-700 hover:bg-emerald-800 font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Check className="w-4 h-4" />
              <span>{contractToEdit ? 'บันทึกการแก้ไข' : 'บันทึกสัญญาเงินยืม'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
