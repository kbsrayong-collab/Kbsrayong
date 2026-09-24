export type LoanType = 'travel' | 'general' | 'contingency' | 'custom';

export type BudgetType = 
  | 'เงินงบประมาณ (เงินรายจ่ายประจำปี)'
  | 'เงินนอกงบประมาณ'
  | 'เงินรายได้แผ่นดิน / รายได้สถานศึกษา'
  | 'เงินทดรองราชการ'
  | 'เงินอุดหนุนทั่วไป / เฉพาะกิจ';

export type LoanStatus = 
  | 'pending_disbursement' // รอจ่ายเงิน
  | 'active'               // ปกติ (ยังไม่ครบกำหนด)
  | 'due_soon'             // ใกล้ครบกำหนด (1-7 วัน)
  | 'overdue'              // เกินกำหนดชำระ
  | 'settled'              // ส่งใช้คืนครบถ้วน (ปิดสัญญา)
  | 'partial';             // ส่งใช้คืนบางส่วน

export interface RepaymentRecord {
  id: string;
  contractId: string;
  repaymentDate: string; // YYYY-MM-DD
  cashAmount: number; // เงินสด / เงินโอน
  receiptNo?: string; // เลขที่ใบเสร็จรับเงินสด
  voucherAmount: number; // ใบสำคัญคู่จ่าย / ใบเสร็จค่าใช้จ่าย
  voucherNo?: string; // เลขที่ใบสำคัญ/ฎีกา/เล่มที่
  totalSettled: number; // cashAmount + voucherAmount
  verified: boolean;
  verifiedBy?: string;
  verifiedAt?: string;
  notes?: string;
}

export interface LoanContract {
  id: string;
  contractNo: string; // เลขที่สัญญา เช่น ย.01/2568
  contractDate: string; // วันที่ทำสัญญา YYYY-MM-DD
  borrowerName: string; // ชื่อ-สกุล ผู้ยืม
  position: string; // ตำแหน่ง
  department: string; // กลุ่มงาน / ส่วนราชการ / ฝ่าย
  fiscalYear: number; // ปีงบประมาณ (พ.ศ.) เช่น 2568
  purpose: string; // วัตถุประสงค์การยืมเงิน
  loanType: LoanType;
  budgetType: BudgetType;
  loanAmount: number; // วงเงินสัญญาการยืม
  disbursementDate: string; // วันที่จ่ายเงินยืมให้ผู้ยืม YYYY-MM-DD
  dueDate: string; // กำหนดวันส่งใช้คืน YYYY-MM-DD
  repayments: RepaymentRecord[];
  remarks?: string;
  appsheetId?: string; // ID อ้างอิงในระบบ AppSheet DB
  createdAt: string;
  updatedAt: string;
}

export interface LoanSummaryCalculation {
  totalCashReturned: number;
  totalVoucherSettled: number;
  totalSettled: number;
  remainingDebt: number;
  overSettledAmount: number;
  status: LoanStatus;
  statusLabel: string;
  daysDiff: number; // บวกคือเหลือวัน, ลบคือเกินกำหนดกี่วัน
  isOverdue: boolean;
  isDueSoon: boolean;
  isFullySettled: boolean;
  reconciliationStatus: 'balanced' | 'underpaid' | 'overpaid' | 'none';
  reconciliationMessage: string;
}

export interface FilterOptions {
  search: string;
  status: 'all' | LoanStatus;
  fiscalYear: 'all' | number;
  department: 'all' | string;
  loanType: 'all' | LoanType;
}

export interface AppSheetConfig {
  databaseId: string;
  databaseUrl: string;
  tableName: string;
  lastSyncedAt?: string;
  syncStatus: 'idle' | 'syncing' | 'connected' | 'error';
  autoSync: boolean;
}
