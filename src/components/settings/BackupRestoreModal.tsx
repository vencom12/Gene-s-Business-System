import React, { useState } from 'react';
import { Upload, AlertCircle, CheckCircle } from 'lucide-react';
import { Modal } from '../common/Modal';
import { parseAndValidateImportJSON } from '../../services/exportImportService';
import { useApp } from '../../context/AppContext';

interface BackupRestoreModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BackupRestoreModal: React.FC<BackupRestoreModalProps> = ({ isOpen, onClose }) => {
  const { loadFullPayload } = useApp();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg(null);
    setSuccessMsg(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const result = parseAndValidateImportJSON(text);

      if (!result.success || !result.data) {
        setErrorMsg(result.error || 'Failed to import backup file.');
      } else {
        loadFullPayload(result.data);
        setSuccessMsg('Bakery data restored successfully!');
        setTimeout(() => {
          onClose();
        }, 1500);
      }
    };

    reader.readAsText(file);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Restore Data from Backup">
      <div className="space-y-4">
        <p className="text-xs text-slate-600">
          Upload a previously exported <code className="bg-slate-100 px-1 py-0.5 rounded text-amber-700">.json</code> backup file to restore your ingredients, recipes, and orders.
        </p>

        {errorMsg && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-xl p-3 text-xs flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-3 text-xs flex items-center gap-2">
            <CheckCircle size={16} className="shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        <label className="border-2 border-dashed border-amber-300 hover:border-amber-500 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors bg-amber-50/40 hover:bg-amber-50">
          <Upload size={32} className="text-amber-600 mb-2" />
          <span className="text-sm font-bold text-slate-800">Choose JSON Backup File</span>
          <span className="text-xs text-slate-400 mt-0.5">Click to browse your device files</span>
          <input
            type="file"
            accept=".json"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>
      </div>
    </Modal>
  );
};
