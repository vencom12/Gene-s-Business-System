import React from 'react';
import { Smartphone, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';

export const PWAStatusCard: React.FC = () => {
  const isOnline = navigator.onLine;

  return (
    <Card className="bg-gradient-to-br from-slate-900 to-slate-800 text-white space-y-4 border-slate-700">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-base text-amber-400 flex items-center gap-2">
          <Smartphone size={20} />
          <span>Offline & iPhone App Status</span>
        </h3>
        <Badge variant={isOnline ? 'emerald' : 'amber'}>
          {isOnline ? 'Online Ready' : 'Offline Mode Active'}
        </Badge>
      </div>

      <p className="text-xs text-slate-300">
        This app uses local storage and service worker caching so you can use it anytime without internet connection.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
        <div className="bg-white/10 rounded-xl p-3 border border-white/10 flex items-center gap-2.5">
          <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
          <div className="text-xs">
            <span className="font-bold block text-white">Add to iPhone Screen</span>
            <span className="text-[11px] text-slate-300">Tap Share ➔ Add to Home Screen</span>
          </div>
        </div>

        <div className="bg-white/10 rounded-xl p-3 border border-white/10 flex items-center gap-2.5">
          <ShieldCheck size={18} className="text-amber-400 shrink-0" />
          <div className="text-xs">
            <span className="font-bold block text-white">100% Private Local Data</span>
            <span className="text-[11px] text-slate-300">Saved safely in your browser</span>
          </div>
        </div>
      </div>
    </Card>
  );
};
