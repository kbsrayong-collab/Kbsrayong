import { LoanContract, LoanStatus, LoanSummaryCalculation, LoanType } from '../types/loan';

// Thai Month Names
export const THAI_MONTHS_SHORT = [
  'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
  'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
];

export const THAI_MONTHS_FULL = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
];

/**
 * Format date string (YYYY-MM-DD) to Thai date display
 */
export function formatThaiDate(
  dateString: string | undefined | null,
  format: 'short' | 'full' | 'buddhist-year-only' = 'short'
): string {
  if (!dateString) return '-';
  const parts = dateString.split('-');
  if (parts.length !== 3) return dateString;

  const year = parseInt(parts[0], 10);
  const monthIdx = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);

  const thaiYear = year > 2400 ? year : year + 543;

  if (format === 'buddhist-year-only') {
    return `${thaiYear}`;
  }

  if (format === 'full') {
    return `${day} ${THAI_MONTHS_FULL[monthIdx] || ''} พ.ศ. ${thaiYear}`;
  }

  return `${day} ${THAI_MONTHS_SHORT[monthIdx] || ''} ${thaiYear}`;
}

/**
 * Format currency to 2 decimal places with comma
 */
export function formatCurrency(amount: number | undefined | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) return '0.00';
  return new Intl.NumberFormat('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Convert number to Thai Baht text (e.g., หนึ่งหมื่นห้าพันบาทถ้วน)
 */
export function convertNumberToThaiBahtText(amount: number): string {
  if (isNaN(amount) || amount === 0) return 'ศูนย์บาทถ้วน';

  const numbers = ['', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า'];
  const units = ['', 'สิบ', 'ร้อย', 'พัน', 'หมื่น', 'แสน', 'ล้าน'];

  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);

  const [bahtStr, satangStrRaw] = absAmount.toFixed(2).split('.');
  const satang = parseInt(satangStrRaw || '0', 10);

  function convertGroup(digits: string): string {
    let result = '';
    const len = digits.length;

    for (let i = 0; i < len; i++) {
      const digit = parseInt(digits[i], 10);
      const unitIndex = len - i - 1;

      if (digit !== 0) {
        if (unitIndex === 1 && digit === 1) {
          // 'สิบ' instead of 'หนึ่งสิบ'
          result += 'สิบ';
        } else if (unitIndex === 1 && digit === 2) {
          // 'ยี่สิบ'
          result += 'ยี่สิบ';
        } else if (unitIndex === 0 && digit === 1 && len > 1 && parseInt(digits[len - 2], 10) !== 0) {
          // 'เอ็ด' when trailing except alone
          result += 'เอ็ด';
        } else {
          result += numbers[digit] + units[unitIndex];
        }
      }
    }
    return result;
  }

  let resultBaht = '';
  const bahtNumber = parseInt(bahtStr, 10);

  if (bahtNumber === 0) {
    resultBaht = satang === 0 ? 'ศูนย์บาท' : '';
  } else {
    // Break down into millions
    let currentBaht = bahtStr;
    const groups: string[] = [];
    while (currentBaht.length > 0) {
      const start = Math.max(0, currentBaht.length - 6);
      groups.unshift(currentBaht.slice(start));
      currentBaht = currentBaht.slice(0, start);
    }

    for (let i = 0; i < groups.length; i++) {
      const g = groups[i];
      const gText = convertGroup(g);
      resultBaht += gText;
      if (i < groups.length - 1 && gText !== '') {
        resultBaht += 'ล้าน';
      }
    }
    resultBaht += 'บาท';
  }

  let resultSatang = '';
  if (satang === 0) {
    resultSatang = 'ถ้วน';
  } else {
    resultSatang = convertGroup(satang.toString().padStart(2, '0')) + 'สตางค์';
  }

  return (isNegative ? 'ลบ' : '') + resultBaht + resultSatang;
}

/**
 * Calculate Thai fiscal year for a given date
 * In Thailand: FY starts on October 1st and ends September 30th
 */
export function getFiscalYear(date: Date = new Date()): number {
  const month = date.getMonth(); // 0-11 (9 is October)
  const gregorianYear = date.getFullYear();
  const fiscalGregorianYear = month >= 9 ? gregorianYear + 1 : gregorianYear;
  return fiscalGregorianYear + 543;
}

/**
 * Compute automated due date based on loan type and disbursement date
 * Regulations:
 * Travel (เดินทางไปราชการ) = 15 วัน นับแต่วันที่ได้รับเงิน/กลับถึง
 * General (อบรม/โครงการ/ราชการอื่น) = 30 วัน นับแต่วันที่ได้รับเงิน
 */
export function calculateDefaultDueDate(disbursementDateStr: string, loanType: LoanType): string {
  if (!disbursementDateStr) return '';
  const date = new Date(disbursementDateStr);
  if (isNaN(date.getTime())) return '';

  const daysToAdd = loanType === 'travel' ? 15 : 30;
  date.setDate(date.getDate() + daysToAdd);

  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Automatic calculation engine for loan status and repayments
 */
export function calculateLoanSummary(contract: LoanContract, referenceDate: Date = new Date()): LoanSummaryCalculation {
  const totalCashReturned = (contract.repayments || []).reduce((sum, r) => sum + (r.cashAmount || 0), 0);
  const totalVoucherSettled = (contract.repayments || []).reduce((sum, r) => sum + (r.voucherAmount || 0), 0);
  const totalSettled = totalCashReturned + totalVoucherSettled;

  const rawRemaining = contract.loanAmount - totalSettled;
  const remainingDebt = Math.max(0, rawRemaining);
  const overSettledAmount = rawRemaining < 0 ? Math.abs(rawRemaining) : 0;

  // Date calculation
  const today = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate());
  
  let daysDiff = 0;
  let isOverdue = false;
  let isDueSoon = false;

  if (contract.dueDate) {
    const due = new Date(contract.dueDate);
    const diffTime = due.getTime() - today.getTime();
    daysDiff = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (daysDiff < 0) {
      isOverdue = true;
    } else if (daysDiff >= 0 && daysDiff <= 7) {
      isDueSoon = true;
    }
  }

  // Determine Automated Status
  let status: LoanStatus = 'active';
  let statusLabel = 'ปกติ (อยู่ระหว่างดำเนินการ)';

  const isFullySettled = totalSettled >= contract.loanAmount;

  if (!contract.disbursementDate) {
    status = 'pending_disbursement';
    statusLabel = 'รอจ่ายเงินยืม';
  } else if (isFullySettled) {
    status = 'settled';
    statusLabel = 'ส่งใช้คืนครบถ้วน (ปิดสัญญา)';
  } else if (isOverdue && remainingDebt > 0) {
    status = 'overdue';
    statusLabel = `เกินกำหนดชำระ (${Math.abs(daysDiff)} วัน)`;
  } else if (isDueSoon && remainingDebt > 0) {
    status = 'due_soon';
    statusLabel = `ใกล้ครบกำหนด (อีก ${daysDiff} วัน)`;
  } else if (totalSettled > 0 && remainingDebt > 0) {
    status = 'partial';
    statusLabel = `ส่งใช้คืนบางส่วน (คงค้าง ฿${formatCurrency(remainingDebt)})`;
  } else {
    status = 'active';
    statusLabel = `ปกติ (คงเหลือ ${daysDiff} วัน)`;
  }

  // Automatic Reconciliation status
  let reconciliationStatus: 'balanced' | 'underpaid' | 'overpaid' | 'none' = 'none';
  let reconciliationMessage = 'ยังไม่มีการส่งใช้เงินยืม';

  if (totalSettled > 0) {
    if (Math.abs(contract.loanAmount - totalSettled) < 0.01) {
      reconciliationStatus = 'balanced';
      reconciliationMessage = 'ตรวจสอบแล้ว: ยอดเงินสดและใบสำคัญถูกต้องตรงตามวงเงินสัญญา (สมดุล 100%)';
    } else if (totalSettled < contract.loanAmount) {
      reconciliationStatus = 'underpaid';
      reconciliationMessage = `ตรวจสอบแล้ว: ยังมียอดค้างส่งใช้จำนวน ${formatCurrency(remainingDebt)} บาท`;
    } else {
      reconciliationStatus = 'overpaid';
      reconciliationMessage = `ตรวจสอบแล้ว: มียอดส่งใช้เกินวงเงินจำนวน ${formatCurrency(overSettledAmount)} บาท (ตรวจสอบส่วนต่าง)`;
    }
  }

  return {
    totalCashReturned,
    totalVoucherSettled,
    totalSettled,
    remainingDebt,
    overSettledAmount,
    status,
    statusLabel,
    daysDiff,
    isOverdue,
    isDueSoon,
    isFullySettled,
    reconciliationStatus,
    reconciliationMessage,
  };
}

export function getStatusBadgeStyle(status: LoanStatus): {
  bg: string;
  text: string;
  border: string;
  dot: string;
} {
  switch (status) {
    case 'settled':
      return {
        bg: 'bg-emerald-50 text-emerald-800',
        text: 'text-emerald-800',
        border: 'border-emerald-200',
        dot: 'bg-emerald-500',
      };
    case 'overdue':
      return {
        bg: 'bg-rose-50 text-rose-800',
        text: 'text-rose-800',
        border: 'border-rose-200',
        dot: 'bg-rose-500',
      };
    case 'due_soon':
      return {
        bg: 'bg-amber-50 text-amber-800',
        text: 'text-amber-800',
        border: 'border-amber-200',
        dot: 'bg-amber-500',
      };
    case 'partial':
      return {
        bg: 'bg-sky-50 text-sky-800',
        text: 'text-sky-800',
        border: 'border-sky-200',
        dot: 'bg-sky-500',
      };
    case 'pending_disbursement':
      return {
        bg: 'bg-slate-100 text-slate-700',
        text: 'text-slate-700',
        border: 'border-slate-200',
        dot: 'bg-slate-400',
      };
    case 'active':
    default:
      return {
        bg: 'bg-blue-50 text-blue-800',
        text: 'text-blue-800',
        border: 'border-blue-200',
        dot: 'bg-blue-500',
      };
  }
}
