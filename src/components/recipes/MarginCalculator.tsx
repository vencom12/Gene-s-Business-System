import React from 'react';
import { TrendingUp } from 'lucide-react';
import { calculateSellingPriceFromMargin, formatCurrency } from '../../utils/currency';

interface MarginCalculatorProps {
  batchCost: number;
  yieldQuantity: number;
  targetMargin: number;
  onChangeMargin: (newMargin: number) => void;
  currencySymbol: string;
}

export const MarginCalculator: React.FC<MarginCalculatorProps> = ({
  batchCost,
  yieldQuantity,
  targetMargin,
  onChangeMargin,
  currencySymbol,
}) => {
  const costPerUnit = yieldQuantity > 0 ? batchCost / yieldQuantity : 0;
  const suggestedTotalPrice = calculateSellingPriceFromMargin(batchCost, targetMargin);
  const suggestedPricePerUnit = yieldQuantity > 0 ? suggestedTotalPrice / yieldQuantity : 0;
  const totalProfit = suggestedTotalPrice - batchCost;
  const profitPerUnit = yieldQuantity > 0 ? totalProfit / yieldQuantity : 0;

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-5 text-white space-y-4 shadow-xl">
      <div className="flex items-center justify-between">
        <h4 className="font-bold text-sm text-amber-400 flex items-center gap-1.5">
          <TrendingUp size={18} />
          <span>Pricing & Profit Margin Calculator</span>
        </h4>
        <span className="bg-amber-400/20 text-amber-300 text-xs px-2.5 py-1 rounded-full font-bold">
          {targetMargin}% Target Margin
        </span>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-300">
          <span>Target Profit Margin:</span>
          <span className="font-bold text-white text-sm">{targetMargin}%</span>
        </div>
        <input
          type="range"
          min="10"
          max="85"
          step="5"
          value={targetMargin}
          onChange={(e) => onChangeMargin(parseFloat(e.target.value))}
          className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
        />
        <div className="flex justify-between text-[10px] text-slate-400">
          <span>10% (Low)</span>
          <span>50% (Standard)</span>
          <span>70%+ (Premium)</span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
        <div className="bg-white/10 rounded-xl p-3 border border-white/10">
          <span className="text-[11px] text-slate-300">Total Batch Cost</span>
          <p className="text-lg font-extrabold text-white">
            {formatCurrency(batchCost, currencySymbol)}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">
            {formatCurrency(costPerUnit, currencySymbol)} / item
          </p>
        </div>

        <div className="bg-amber-500/20 rounded-xl p-3 border border-amber-400/30">
          <span className="text-[11px] text-amber-200">Recommended Selling Price</span>
          <p className="text-lg font-extrabold text-amber-300">
            {formatCurrency(suggestedTotalPrice, currencySymbol)}
          </p>
          <p className="text-[10px] text-amber-200/80 mt-0.5">
            {formatCurrency(suggestedPricePerUnit, currencySymbol)} / item
          </p>
        </div>

        <div className="bg-emerald-500/20 rounded-xl p-3 border border-emerald-400/30 col-span-2 sm:col-span-1">
          <span className="text-[11px] text-emerald-200">Estimated Net Profit</span>
          <p className="text-lg font-extrabold text-emerald-300">
            {formatCurrency(totalProfit, currencySymbol)}
          </p>
          <p className="text-[10px] text-emerald-200/80 mt-0.5">
            {formatCurrency(profitPerUnit, currencySymbol)} / item
          </p>
        </div>
      </div>
    </div>
  );
};
