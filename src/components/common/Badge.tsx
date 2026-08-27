import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'amber' | 'emerald' | 'rose' | 'slate' | 'indigo';
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'amber' }) => {
  const styles = {
    amber: 'bg-amber-100 text-amber-800 border-amber-200',
    emerald: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    rose: 'bg-rose-100 text-rose-800 border-rose-200',
    slate: 'bg-slate-100 text-slate-700 border-slate-200',
    indigo: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles[variant]}`}
    >
      {children}
    </span>
  );
};
