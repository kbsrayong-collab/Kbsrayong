import { INITIAL_LOAN_CONTRACTS } from '../data/initialData';
import { AppSheetConfig, LoanContract, RepaymentRecord } from '../types/loan';
import { calculateLoanSummary, formatCurrency, formatThaiDate } from '../utils/loanCalculations';

const STORAGE_KEY = 'gov_loan_tracker_contracts_v1';
const APPSHEET_CONFIG_KEY = 'gov_loan_tracker_appsheet_cfg_v1';

export const DEFAULT_APPSHEET_CONFIG: AppSheetConfig = {
  databaseId: 'LNROtcKH1O4SE0Sz0GtNT5',
  databaseUrl: 'https://www.appsheet.com/dbs/database/LNROtcKH1O4SE0Sz0GtNT5',
  tableName: 'LoanContracts_Register',
  lastSyncedAt: new Date().toISOString(),
  syncStatus: 'connected',
  autoSync: true,
};

export class LoanStorageService {
  static getContracts(): LoanContract[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        // Initialize with default dataset
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_LOAN_CONTRACTS));
        return INITIAL_LOAN_CONTRACTS;
      }
      return JSON.parse(data) as LoanContract[];
    } catch (e) {
      console.error('Error reading contracts from storage', e);
      return INITIAL_LOAN_CONTRACTS;
    }
  }

  static saveContracts(contracts: LoanContract[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(contracts));
    } catch (e) {
      console.error('Error saving contracts to storage', e);
    }
  }

  static getAppSheetConfig(): AppSheetConfig {
    try {
      const data = localStorage.getItem(APPSHEET_CONFIG_KEY);
      if (!data) {
        localStorage.setItem(APPSHEET_CONFIG_KEY, JSON.stringify(DEFAULT_APPSHEET_CONFIG));
        return DEFAULT_APPSHEET_CONFIG;
      }
      return JSON.parse(data) as AppSheetConfig;
    } catch (e) {
      return DEFAULT_APPSHEET_CONFIG;
    }
  }

  static saveAppSheetConfig(cfg: AppSheetConfig): void {
    try {
      localStorage.setItem(APPSHEET_CONFIG_KEY, JSON.stringify(cfg));
    } catch (e) {
      console.error('Error saving appsheet config', e);
    }
  }

  static addContract(newContract: Omit<LoanContract, 'id' | 'createdAt' | 'updatedAt' | 'repayments'> & { repayments?: RepaymentRecord[] }): LoanContract {
    const contracts = this.getContracts();
    const now = new Date().toISOString();
    const created: LoanContract = {
      ...newContract,
      id: 'contract-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      repayments: newContract.repayments || [],
      createdAt: now,
      updatedAt: now,
    };
    const updated = [created, ...contracts];
    this.saveContracts(updated);
    return created;
  }

  static updateContract(id: string, updates: Partial<LoanContract>): LoanContract | null {
    const contracts = this.getContracts();
    const index = contracts.findIndex(c => c.id === id);
    if (index === -1) return null;

    const updatedContract: LoanContract = {
      ...contracts[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    contracts[index] = updatedContract;
    this.saveContracts(contracts);
    return updatedContract;
  }

  static deleteContract(id: string): boolean {
    const contracts = this.getContracts();
    const filtered = contracts.filter(c => c.id !== id);
    if (filtered.length !== contracts.length) {
      this.saveContracts(filtered);
      return true;
    }
    return false;
  }

  static addRepayment(contractId: string, repayment: Omit<RepaymentRecord, 'id'>): RepaymentRecord | null {
    const contracts = this.getContracts();
    const contract = contracts.find(c => c.id === contractId);
    if (!contract) return null;

    const newRepayment: RepaymentRecord = {
      ...repayment,
      id: 'rep-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5),
    };

    const updatedRepayments = [...(contract.repayments || []), newRepayment];
    contract.repayments = updatedRepayments;
    contract.updatedAt = new Date().toISOString();

    this.saveContracts(contracts);
    return newRepayment;
  }

  static verifyRepayment(contractId: string, repaymentId: string, verifierName: string): boolean {
    const contracts = this.getContracts();
    const contract = contracts.find(c => c.id === contractId);
    if (!contract) return false;

    const rep = (contract.repayments || []).find(r => r.id === repaymentId);
    if (!rep) return false;

    rep.verified = true;
    rep.verifiedBy = verifierName;
    rep.verifiedAt = new Date().toISOString().split('T')[0];
    contract.updatedAt = new Date().toISOString();

    this.saveContracts(contracts);
    return true;
  }

  static deleteRepayment(contractId: string, repaymentId: string): boolean {
    const contracts = this.getContracts();
    const contract = contracts.find(c => c.id === contractId);
    if (!contract) return false;

    contract.repayments = (contract.repayments || []).filter(r => r.id !== repaymentId);
    contract.updatedAt = new Date().toISOString();

    this.saveContracts(contracts);
    return true;
  }

  static resetToDefault(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_LOAN_CONTRACTS));
    localStorage.setItem(APPSHEET_CONFIG_KEY, JSON.stringify(DEFAULT_APPSHEET_CONFIG));
  }

  /**
   * Export all contracts to CSV (Thai UTF-8 with BOM for Excel compatibility)
   */
  static exportContractsToCSV(contracts: LoanContract[]): string {
    const headers = [
      'เลขที่สัญญา',
      'วันที่ทำสัญญา',
      'ปีงบประมาณ',
      'ชื่อผู้ยืม',
      'ตำแหน่ง',
      'หน่วยงาน/สังกัด',
      'วัตถุประสงค์',
      'ประเภทการยืม',
      'แหล่งเงิน',
      'วงเงินยืม (บาท)',
      'วันที่จ่ายเงิน',
      'กำหนดส่งใช้คืน',
      'ส่งใช้เงินสด (บาท)',
      'ส่งใช้ใบสำคัญ (บาท)',
      'รวมส่งใช้แล้ว (บาท)',
      'ยอดคงค้าง (บาท)',
      'สถานะ',
      'หมายเหตุ',
    ];

    const rows = contracts.map(c => {
      const summary = calculateLoanSummary(c);
      const loanTypeLabel = 
        c.loanType === 'travel' ? 'เดินทางไปราชการ (15 วัน)' :
        c.loanType === 'general' ? 'ราชการทั่วไป/โครงการ (30 วัน)' :
        c.loanType === 'contingency' ? 'เงินทดรองราชการ' : 'อื่นๆ';

      return [
        `"${c.contractNo}"`,
        `"${formatThaiDate(c.contractDate, 'short')}"`,
        `"${c.fiscalYear}"`,
        `"${c.borrowerName}"`,
        `"${c.position}"`,
        `"${c.department}"`,
        `"${(c.purpose || '').replace(/"/g, '""')}"`,
        `"${loanTypeLabel}"`,
        `"${c.budgetType}"`,
        c.loanAmount,
        `"${formatThaiDate(c.disbursementDate, 'short')}"`,
        `"${formatThaiDate(c.dueDate, 'short')}"`,
        summary.totalCashReturned,
        summary.totalVoucherSettled,
        summary.totalSettled,
        summary.remainingDebt,
        `"${summary.statusLabel}"`,
        `"${(c.remarks || '').replace(/"/g, '""')}"`,
      ].join(',');
    });

    // Add BOM for Excel Thai language rendering
    return '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
  }
}
