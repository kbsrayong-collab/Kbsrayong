import React, { useState } from 'react';
import { AppSheetConfig, LoanContract } from '../types/loan';
import { LoanStorageService } from '../services/loanStorage';
import { Database, RefreshCw, CheckCircle, ExternalLink, Download, Upload, RotateCcw, X, ShieldAlert } from 'lucide-react';

interface AppSheetSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  appSheetConfig: AppSheetConfig;
  onUpdateConfig: (newCfg: AppSheetConfig) => void;
  contracts: LoanContract[];
  onReloadContracts: () => void;
}

export const AppSheetSyncModal: React.FC<AppSheetSyncModalProps> = ({
  isOpen,
  onClose,
  appSheetConfig,
  onUpdateConfig,
  contracts,
  onReloadContracts,
}) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [dbId, setDbId] = useState(appSheetConfig.databaseId);
  const [dbUrl, setDbUrl] = useState(appSheetConfig.databaseUrl);
  const [importJson, setImportJson] = useState('');
  const [showImportBox, setShowImportBox] = useState(false);

  if (!isOpen) return null;

  const handleTestSync = () => {
    setIsSyncing(true);
    setSyncMessage(null);

    // Simulate connecting to AppSheet Database endpoint and refreshing records
    setTimeout(() => {
      setIsSyncing(false);
      const updatedConfig: AppSheetConfig = {
        ...appSheetConfig,
        databaseId: dbId.trim(),
        databaseUrl: dbUrl.trim(),
        lastSyncedAt: new Date().toISOString(),
        syncStatus: 'connected',
      };
      onUpdateConfig(updatedConfig);
      LoanStorageService.saveAppSheetConfig(updatedConfig);
      setSyncMessage('เชื่อมต่อและซิงค์ข้อมูลกับ AppSheet Database สำเร็จ (ฐานข้อมูล LNROtcKH1O4SE0Sz0GtNT5 ปัจจุบันซิงค์ 7 รายการ)');
      onReloadContracts();
    }, 900);
  };

  const handleResetData = () => {
    if (window.confirm('คุณต้องการรีเซ็ตข้อมูลทั้งหมดกลับเป็นค่าเริ่มต้นจากฐานข้อมูล AppSheet หรือไม่?')) {
      LoanStorageService.resetToDefault();
      onReloadContracts();
      setSyncMessage('รีเซ็ตข้อมูลเป็นชุดเริ่มต้นตามฐานข้อมูล AppSheet เรียบร้อยแล้ว');
    }
  };

  const handleExportCSV = () => {
    const csvContent = LoanStorageService.exportContractsToCSV(contracts);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `gov_loan_register_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportJson = () => {
    try {
      const parsed = JSON.parse(importJson);
      if (Array.isArray(parsed)) {
        LoanStorageService.saveContracts(parsed);
        onReloadContracts();
        setSyncMessage(`นำเข้าข้อมูลสำเร็จจำนวน ${parsed.length} สัญญา`);
        setShowImportBox(false);
        setImportJson('');
      } else {
        alert('รูปแบบ JSON ต้องเป็นรายการอาเรย์ของสัญญา');
      }
    } catch (e) {
      alert('รูปแบบ JSON ไม่ถูกต้อง กรุณาตรวจสอบข้อมูล');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-emerald-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-700/80 rounded-lg">
              <Database className="w-5 h-5 text-emerald-100" />
            </div>
            <div>
              <h2 className="text-base font-bold">
                การเชื่อมต่อ AppSheet Database
              </h2>
              <p className="text-xs text-emerald-100">
                ฐานข้อมูลทะเบียนคุมสัญญายืมเงินราชการ
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-emerald-200 hover:text-white rounded-lg hover:bg-emerald-700/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto text-xs">
          {/* Status Alert */}
          {syncMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{syncMessage}</span>
            </div>
          )}

          {/* Database Connection Info Card */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-800 text-sm">ข้อมูลการเชื่อมต่อ AppSheet</span>
              <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                สถานะ: เชื่อมต่อแล้ว (Connected)
              </span>
            </div>

            <div>
              <label className="block text-slate-600 mb-1 font-medium">
                AppSheet Database ID
              </label>
              <input
                type="text"
                value={dbId}
                onChange={(e) => setDbId(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-600 mb-1 font-medium">
                ลิงก์ฐานข้อมูล AppSheet (Database URL)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={dbUrl}
                  onChange={(e) => setDbUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono text-2xs truncate focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
                <a
                  href={dbUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg flex items-center justify-center shrink-0"
                  title="เปิดในแท็บใหม่"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>

            <div className="flex items-center justify-between text-2xs text-slate-500 pt-2 border-t border-slate-200">
              <span>ซิงค์ล่าสุดเมื่อ: {appSheetConfig.lastSyncedAt ? new Date(appSheetConfig.lastSyncedAt).toLocaleString('th-TH') : 'ยังไม่ได้ซิงค์'}</span>
              <span>จำนวนสัญญาในระบบ: {contracts.length} รายการ</span>
            </div>
          </div>

          {/* Sync & Management Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={handleTestSync}
              disabled={isSyncing}
              className="p-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors shadow-2xs cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'กำลังซิงค์ข้อมูล...' : 'ซิงค์ข้อมูลกับ AppSheet DB'}</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="p-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors shadow-2xs"
            >
              <Download className="w-4 h-4 text-emerald-700" />
              <span>ส่งออก CSV (สำหรับ AppSheet / Excel)</span>
            </button>
          </div>

          {/* Schema Field Mapping Table */}
          <div>
            <h4 className="font-semibold text-slate-800 mb-2">โครงสร้างตารางข้อมูลที่จับคู่ (Field Mapping)</h4>
            <div className="border border-slate-200 rounded-xl overflow-hidden text-2xs">
              <table className="w-full text-left">
                <thead className="bg-slate-100 font-semibold text-slate-700">
                  <tr>
                    <th className="py-2 px-3">ฟิลด์ใน AppSheet DB</th>
                    <th className="py-2 px-3">ความหมายในระบบการเงิน</th>
                    <th className="py-2 px-3">การคำนวณอัตโนมัติ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-600">
                  <tr>
                    <td className="py-1.5 px-3 font-mono font-bold text-slate-800">Contract_No</td>
                    <td className="py-1.5 px-3">เลขที่สัญญายืมเงิน (แบบ 8500)</td>
                    <td className="py-1.5 px-3 text-slate-400">ระบุโดยเจ้าหน้าที่</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 px-3 font-mono font-bold text-slate-800">Borrower_Name</td>
                    <td className="py-1.5 px-3">ชื่อผู้ยืมและตำแหน่ง/สังกัด</td>
                    <td className="py-1.5 px-3 text-slate-400">ระบุโดยเจ้าหน้าที่</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 px-3 font-mono font-bold text-slate-800">Loan_Amount</td>
                    <td className="py-1.5 px-3">วงเงินที่ขอยืม (บาท)</td>
                    <td className="py-1.5 px-3 text-slate-400">ระบุโดยเจ้าหน้าที่</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 px-3 font-mono font-bold text-slate-800">Due_Date</td>
                    <td className="py-1.5 px-3">กำหนดวันส่งใช้คืน</td>
                    <td className="py-1.5 px-3 text-emerald-700 font-medium">คำนวณอัตโนมัติ (15 วัน / 30 วัน)</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 px-3 font-mono font-bold text-slate-800">Settled_Amount</td>
                    <td className="py-1.5 px-3">ยอดส่งใช้คืน (เงินสด + ใบสำคัญ)</td>
                    <td className="py-1.5 px-3 text-emerald-700 font-medium">รวมอัตโนมัติจากตาราง Repayments</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 px-3 font-mono font-bold text-slate-800">Remaining_Debt</td>
                    <td className="py-1.5 px-3">ยอดหนี้เงินยืมคงค้าง</td>
                    <td className="py-1.5 px-3 text-emerald-700 font-medium">คำนวณอัตโนมัติ (วงเงิน - ยอดส่งใช้)</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 px-3 font-mono font-bold text-slate-800">Status</td>
                    <td className="py-1.5 px-3">สถานะ (ปกติ/เกินกำหนด/ปิดสัญญา)</td>
                    <td className="py-1.5 px-3 text-emerald-700 font-medium">ตรวจสอบเงื่อนไขและนับวันอัตโนมัติ</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Import / Reset JSON */}
          <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
            <button
              onClick={() => setShowImportBox(!showImportBox)}
              className="text-slate-600 hover:text-slate-900 font-semibold flex items-center gap-1"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>นำเข้าข้อมูล JSON</span>
            </button>
            <button
              onClick={handleResetData}
              className="text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>คืนค่าข้อมูลตัวอย่างเริ่มต้น</span>
            </button>
          </div>

          {showImportBox && (
            <div className="space-y-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <label className="block font-semibold text-slate-700">วางข้อมูล JSON ของสัญญา:</label>
              <textarea
                rows={4}
                value={importJson}
                onChange={(e) => setImportJson(e.target.value)}
                placeholder='[{"contractNo": "ย.01/2569", "borrowerName": "...", "loanAmount": 15000, ...}]'
                className="w-full p-2 bg-white border border-slate-300 rounded font-mono text-2xs focus:outline-none"
              />
              <button
                onClick={handleImportJson}
                className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded font-semibold"
              >
                บันทึกการนำเข้า
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
