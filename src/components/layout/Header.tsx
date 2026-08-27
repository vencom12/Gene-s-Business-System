import React from 'react';
import { Cake, Download, Smartphone } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { exportDataToJSON } from '../../services/exportImportService';
import { APP_CONFIG } from '../../config/appConfig';

interface HeaderProps {
  deferredPrompt?: any;
  onInstallPWA?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ deferredPrompt, onInstallPWA }) => {
  const { inventory, recipes, orders, settings } = useApp();

  const handleBackup = () => {
    exportDataToJSON({
      version: 1,
      inventory,
      recipes,
      orders,
      settings,
    });
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-amber-200/60 px-4 py-3 sm:px-6">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-white shadow-md shadow-amber-200">
            <Cake size={22} className="animate-pulse-slow" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-800 leading-tight">
              {settings.businessName || APP_CONFIG.appName}
            </h1>
            <p className="text-xs text-amber-700 font-medium">Bakery Costing & Profit System</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {deferredPrompt && onInstallPWA && (
            <button
              onClick={onInstallPWA}
              className="hidden sm:flex items-center gap-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-xl transition-all shadow-sm"
              title="Install app on device"
            >
              <Smartphone size={15} />
              <span>Install App</span>
            </button>
          )}

          <button
            onClick={handleBackup}
            className="flex items-center gap-1.5 text-xs font-medium bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200 px-3 py-2 rounded-xl transition-all active:scale-95"
            title="Download JSON Backup"
          >
            <Download size={15} />
            <span className="hidden sm:inline">Backup Data</span>
          </button>
        </div>
      </div>
    </header>
  );
};
