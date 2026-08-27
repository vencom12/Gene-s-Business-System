import React from 'react';

interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: string;
  colorVariant?: 'amber' | 'emerald' | 'indigo' | 'rose';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  colorVariant = 'amber',
}) => {
  const colorStyles = {
    amber: 'bg-amber-50 border-amber-200 text-amber-800 icon-bg-amber-100',
    emerald: 'bg-emerald-50 border-emerald-200 text-emerald-800 icon-bg-emerald-100',
    indigo: 'bg-indigo-50 border-indigo-200 text-indigo-800 icon-bg-indigo-100',
    rose: 'bg-rose-50 border-rose-200 text-rose-800 icon-bg-rose-100',
  };

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex items-start justify-between">
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">{title}</p>
        <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">{value}</h3>
        {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
      </div>
      <div className={`p-3 rounded-2xl border ${colorStyles[colorVariant]}`}>
        {icon}
      </div>
    </div>
  );
};
