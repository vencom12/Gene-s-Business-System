import React from 'react';
import { PieChart, DollarSign, Package, Clock, Flame } from 'lucide-react';
import { formatCurrency } from '../../utils/currency';

interface CostBreakdownProps {
  ingredientsCost: number;
  packagingCost: number;
  laborCost: number;
  overheadCost: number;
  totalCost: number;
  currencySymbol: string;
}

export const RecipeCostingBreakdown: React.FC<CostBreakdownProps> = ({
  ingredientsCost,
  packagingCost,
  laborCost,
  overheadCost,
  totalCost,
  currencySymbol,
}) => {
  const safeTotal = totalCost > 0 ? totalCost : 1;

  const items = [
    { label: 'Raw Ingredients', amount: ingredientsCost, icon: DollarSign, color: 'bg-amber-500', barColor: '#F59E0B' },
    { label: 'Packaging & Boxes', amount: packagingCost, icon: Package, color: 'bg-indigo-500', barColor: '#6366F1' },
    { label: 'Labor Hours', amount: laborCost, icon: Clock, color: 'bg-emerald-500', barColor: '#10B981' },
    { label: 'Overhead (Gas/Power)', amount: overheadCost, icon: Flame, color: 'bg-rose-500', barColor: '#EF4444' },
  ];

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
          <PieChart size={18} className="text-amber-600" />
          <span>Batch Cost Breakdown</span>
        </h4>
        <span className="font-extrabold text-slate-900 text-base">
          Total: {formatCurrency(totalCost, currencySymbol)}
        </span>
      </div>

      <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
        {items.map((item, idx) => {
          const pct = (item.amount / safeTotal) * 100;
          if (pct <= 0) return null;
          return (
            <div
              key={idx}
              style={{ width: `${pct}%`, backgroundColor: item.barColor }}
              className="h-full transition-all duration-300 hover:opacity-90"
              title={`${item.label}: ${pct.toFixed(1)}%`}
            />
          );
        })}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
        {items.map((item, idx) => {
          const pct = ((item.amount / safeTotal) * 100).toFixed(1);
          return (
            <div key={idx} className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
              <div className="flex items-center gap-1.5 text-xs text-slate-600 mb-1">
                <span className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                <span className="font-medium truncate">{item.label}</span>
              </div>
              <p className="font-bold text-slate-800 text-sm">
                {formatCurrency(item.amount, currencySymbol)}
              </p>
              <p className="text-[10px] text-slate-400 font-medium">{pct}% of batch</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
