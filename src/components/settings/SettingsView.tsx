import React, { useState } from 'react';
import { Save, RefreshCw, Upload, Download, Building } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PWAStatusCard } from './PWAStatusCard';
import { BackupRestoreModal } from './BackupRestoreModal';
import { exportDataToJSON } from '../../services/exportImportService';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Button } from '../common/Button';
import { Card } from '../common/Card';

export const SettingsView: React.FC = () => {
  const { settings, updateSettings, resetToDefaultData, inventory, recipes, orders } = useApp();

  const [businessName, setBusinessName] = useState(settings.businessName);
  const [ownerName, setOwnerName] = useState(settings.ownerName);
  const [currencySymbol, setCurrencySymbol] = useState(settings.currencySymbol);
  const [customCurrency, setCustomCurrency] = useState('');
  const [useCustomCurrency, setUseCustomCurrency] = useState(
    !['P', '₱', 'PHP', '$', '€', '£', '₹'].includes(settings.currencySymbol)
  );

  const [defaultLaborRate, setDefaultLaborRate] = useState(settings.defaultLaborRate.toString());
  const [defaultOverheadCost, setDefaultOverheadCost] = useState(settings.defaultOverheadCost.toString());
  const [defaultProfitMargin, setDefaultProfitMargin] = useState(settings.defaultProfitMargin.toString());

  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const finalCurrency = useCustomCurrency
      ? customCurrency.trim() || 'P'
      : currencySymbol;

    updateSettings({
      businessName: businessName.trim() || "Gene's Bakery",
      ownerName: ownerName.trim() || 'Gene',
      currencySymbol: finalCurrency,
      defaultLaborRate: parseFloat(defaultLaborRate) || 150.0,
      defaultOverheadCost: parseFloat(defaultOverheadCost) || 40.0,
      defaultProfitMargin: parseFloat(defaultProfitMargin) || 55,
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleExport = () => {
    exportDataToJSON({
      version: 1,
      inventory,
      recipes,
      orders,
      settings,
    });
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to clear all inventory, recipes, and customer orders? This action cannot be undone.')) {
      resetToDefaultData();
    }
  };

  const currentActiveSymbol = useCustomCurrency ? (customCurrency || 'P') : currencySymbol;

  return (
    <div className="space-y-6 pb-20 md:pb-6 animate-fade-in max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">System Settings</h2>
        <p className="text-xs text-slate-500">
          Configure business details, custom currency symbol (P, ₱, PHP, $), labor wages, and data backups.
        </p>
      </div>

      <PWAStatusCard />

      <form onSubmit={handleSaveSettings}>
        <Card className="space-y-5">
          <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
            <Building size={20} className="text-amber-600" />
            <span>Business Defaults & Wages</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Business / Bakery Name"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              required
            />

            <Input
              label="Owner / Baker Name"
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              required
            />
          </div>

          {/* Currency Configuration Section */}
          <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Active Currency Symbol
              </label>
              <button
                type="button"
                onClick={() => setUseCustomCurrency(!useCustomCurrency)}
                className="text-xs font-semibold text-amber-700 hover:text-amber-900 underline"
              >
                {useCustomCurrency ? 'Select standard symbol' : 'Type custom currency text'}
              </button>
            </div>

            {useCustomCurrency ? (
              <Input
                label="Custom Currency Code or Symbol"
                placeholder="e.g. P, PHP, Rs, AED, S$"
                value={customCurrency}
                onChange={(e) => setCustomCurrency(e.target.value)}
                helperText="Type any symbol or currency code you want to appear across the app."
              />
            ) : (
              <Select
                label="Choose Preferred Currency"
                value={currencySymbol}
                onChange={(e) => setCurrencySymbol(e.target.value)}
                options={[
                  { value: 'P', label: 'P (Pesos - Letter P)' },
                  { value: '₱', label: '₱ (Philippine Peso Symbol)' },
                  { value: 'PHP', label: 'PHP (Philippine Peso Code)' },
                  { value: '$', label: '$ (Dollar)' },
                  { value: '€', label: '€ (Euro)' },
                  { value: '£', label: '£ (Pound)' },
                  { value: '₹', label: '₹ (Rupee)' },
                ]}
              />
            )}

            <div className="text-xs text-amber-900 bg-white p-2.5 rounded-xl border border-amber-200 flex items-center justify-between">
              <span>Preview Price Display:</span>
              <span className="font-bold text-sm text-amber-800">
                {currentActiveSymbol} 150.00 / batch
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="Default Hourly Labor Wage"
              type="number"
              step="0.5"
              min="0"
              prefixSymbol={currentActiveSymbol}
              suffixSymbol="/hr"
              value={defaultLaborRate}
              onChange={(e) => setDefaultLaborRate(e.target.value)}
            />

            <Input
              label="Default Overhead / Batch"
              type="number"
              step="0.5"
              min="0"
              prefixSymbol={currentActiveSymbol}
              value={defaultOverheadCost}
              onChange={(e) => setDefaultOverheadCost(e.target.value)}
            />

            <Input
              label="Default Profit Margin %"
              type="number"
              min="10"
              max="90"
              suffixSymbol="%"
              value={defaultProfitMargin}
              onChange={(e) => setDefaultProfitMargin(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            {savedSuccess ? (
              <span className="text-xs font-bold text-emerald-600">Settings saved!</span>
            ) : (
              <span />
            )}

            <Button variant="primary" type="submit" icon={<Save size={18} />}>
              Save Settings
            </Button>
          </div>
        </Card>
      </form>

      <Card className="space-y-4">
        <h3 className="font-bold text-slate-800 text-base">Data Backup & Reset</h3>
        <p className="text-xs text-slate-500">
          Save a copy of all your inventory, custom recipes, and orders to your phone or computer.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <Button variant="secondary" icon={<Download size={18} />} onClick={handleExport}>
            Download Backup JSON
          </Button>

          <Button variant="outline" icon={<Upload size={18} />} onClick={() => setIsRestoreModalOpen(true)}>
            Restore Backup File
          </Button>

          <Button variant="danger" icon={<RefreshCw size={18} />} onClick={handleReset}>
            Clear All Data
          </Button>
        </div>
      </Card>

      <BackupRestoreModal
        isOpen={isRestoreModalOpen}
        onClose={() => setIsRestoreModalOpen(false)}
      />
    </div>
  );
};
