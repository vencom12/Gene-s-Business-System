import React, { useState, useMemo } from 'react';
import {
  Users,
  Scale,
  DollarSign,
  Copy,
  Check,
  Plus,
  Minus,
  Sparkles,
  Printer,
} from 'lucide-react';
import type { Recipe } from '../../types/recipe';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/currency';
import {
  scaleRecipe,
  calculatePhysicalMetrics,
  formatQuantity,
  type ScaledRecipeResult,
} from '../../utils/recipeScaler';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import confetti from 'canvas-confetti';

interface StepperProps {
  label: string;
  sublabel?: string;
  value: string;
  onChange: (val: string) => void;
  onStepDown: () => void;
  onStepUp: () => void;
  suffix: string;
  placeholder?: string;
}

const StepperControl: React.FC<StepperProps> = ({
  label,
  sublabel,
  value,
  onChange,
  onStepDown,
  onStepUp,
  suffix,
  placeholder,
}) => (
  <div className="flex flex-col gap-1">
    <div className="flex items-center justify-between text-xs">
      <span className="font-semibold text-slate-700">{label}</span>
      {sublabel && <span className="text-[10px] text-amber-700 font-medium">{sublabel}</span>}
    </div>

    <div className="flex items-center rounded-xl border border-slate-300 bg-white hover:border-amber-400 focus-within:ring-2 focus-within:ring-amber-500 focus-within:border-amber-500 transition-all shadow-2xs overflow-hidden h-9">
      <button
        type="button"
        onClick={onStepDown}
        className="h-full px-2.5 flex items-center justify-center text-slate-600 hover:text-amber-800 hover:bg-amber-100 active:bg-amber-200 transition-colors border-r border-slate-200 cursor-pointer select-none"
        title={`Decrease ${label}`}
        aria-label={`Decrease ${label}`}
      >
        <Minus size={14} className="stroke-[2.5]" />
      </button>

      <div className="relative flex-1 flex items-center justify-center min-w-0 px-1">
        <input
          type="number"
          step="any"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full text-center text-xs sm:text-sm font-bold text-slate-800 bg-transparent py-1 px-1 focus:outline-none no-spinner"
        />
        <span className="text-[10px] text-slate-400 font-semibold pr-1.5 select-none pointer-events-none whitespace-nowrap shrink-0">
          {suffix}
        </span>
      </div>

      <button
        type="button"
        onClick={onStepUp}
        className="h-full px-2.5 flex items-center justify-center text-slate-600 hover:text-amber-800 hover:bg-amber-100 active:bg-amber-200 transition-colors border-l border-slate-200 cursor-pointer select-none"
        title={`Increase ${label}`}
        aria-label={`Increase ${label}`}
      >
        <Plus size={14} className="stroke-[2.5]" />
      </button>
    </div>
  </div>
);

interface PortionRatioScalerModalProps {
  recipe: Recipe | null;
  isOpen: boolean;
  onClose: () => void;
}

type ScalingMode = 'portions' | 'grams' | 'multiplier';

export const PortionRatioScalerModal: React.FC<PortionRatioScalerModalProps> = ({
  recipe,
  isOpen,
  onClose,
}) => {
  const { inventory, settings, addRecipe } = useApp();

  // If no recipe, render null
  const baseYield = recipe ? Math.max(recipe.servingCount || recipe.yieldQuantity || 1, 0.1) : 1;

  const [mode, setMode] = useState<ScalingMode>('portions');
  const [targetServings, setTargetServings] = useState<number>(baseYield);
  const [customServingsInput, setCustomServingsInput] = useState<string>(baseYield.toString());
  const [customMultiplier, setCustomMultiplier] = useState<string>('1.0');
  const [targetGramsInput, setTargetGramsInput] = useState<string>('');
  const [packagingStrategy, setPackagingStrategy] = useState<'individual' | 'shared' | 'auto'>('individual');
  const [packagingOverrides, setPackagingOverrides] = useState<Record<string, number>>({});
  const [copied, setCopied] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Sync state whenever recipe changes
  React.useEffect(() => {
    if (recipe) {
      const initialServings = Math.max(recipe.servingCount || recipe.yieldQuantity || 1, 0.1);
      setTargetServings(initialServings);
      setCustomServingsInput(initialServings.toString());
      setCustomMultiplier('1.0');
      setPackagingStrategy('individual');
      setPackagingOverrides({});
      const metrics = calculatePhysicalMetrics(recipe, inventory);
      if (metrics.gramsPerServing > 0) {
        setTargetGramsInput(metrics.gramsPerServing.toString());
      } else {
        setTargetGramsInput('');
      }
      setCopied(false);
      setSavedSuccess(false);
    }
  }, [recipe, inventory]);

  const physicalMetrics = useMemo(() => {
    if (!recipe) return null;
    return calculatePhysicalMetrics(recipe, inventory);
  }, [recipe, inventory]);

  // Compute scaled recipe
  const scaledResult: ScaledRecipeResult | null = useMemo(() => {
    if (!recipe) return null;

    if (mode === 'multiplier') {
      const mult = parseFloat(customMultiplier) || 1;
      return scaleRecipe({
        recipe,
        inventory,
        settings,
        customRatio: mult,
        packagingStrategy,
        customPackagingOverrides: packagingOverrides,
      });
    }

    if (mode === 'grams') {
      const targetGrams = parseFloat(targetGramsInput) || 0;
      return scaleRecipe({
        recipe,
        inventory,
        settings,
        targetServings,
        targetGramsPerServing: targetGrams,
        packagingStrategy,
        customPackagingOverrides: packagingOverrides,
      });
    }

    // Default: 'portions'
    return scaleRecipe({
      recipe,
      inventory,
      settings,
      targetServings,
      packagingStrategy,
      customPackagingOverrides: packagingOverrides,
    });
  }, [
    recipe,
    inventory,
    settings,
    mode,
    targetServings,
    customMultiplier,
    targetGramsInput,
    packagingStrategy,
    packagingOverrides,
  ]);

  if (!recipe || !scaledResult) return null;

  // Preset portions buttons
  const portionPresets = [1, 2, 3, 4, 6, 8, 12];

  const handleSelectPreset = (portions: number) => {
    setMode('portions');
    setTargetServings(portions);
    setCustomServingsInput(portions.toString());
  };

  const handleCustomServingsChange = (valStr: string) => {
    setCustomServingsInput(valStr);
    const parsed = parseFloat(valStr);
    if (!isNaN(parsed) && parsed > 0) {
      setMode('portions');
      setTargetServings(parsed);
    }
  };

  const handleMultiplierChange = (valStr: string) => {
    setCustomMultiplier(valStr);
    const parsed = parseFloat(valStr);
    if (!isNaN(parsed) && parsed > 0) {
      setMode('multiplier');
      setTargetServings(baseYield * parsed);
    }
  };

  const handleGramsChange = (valStr: string) => {
    setTargetGramsInput(valStr);
    setMode('grams');
  };

  // Step button handlers (increment / decrement)
  const handleStepPortions = (delta: number) => {
    setMode('portions');
    const current = parseFloat(customServingsInput) || targetServings || 1;
    const next = Math.max(0.5, Math.round((current + delta) * 10) / 10);
    setTargetServings(next);
    setCustomServingsInput(next.toString());
  };

  const handleStepMultiplier = (delta: number) => {
    setMode('multiplier');
    const current = parseFloat(customMultiplier) || 1;
    const next = Math.max(0.05, Math.round((current + delta) * 100) / 100);
    setCustomMultiplier(next.toString());
    const nextServings = Math.round(baseYield * next * 100) / 100;
    setTargetServings(nextServings);
  };

  const handleStepGrams = (delta: number) => {
    setMode('grams');
    const fallback = physicalMetrics?.gramsPerServing || 50;
    const current = parseFloat(targetGramsInput) || fallback;
    const next = Math.max(1, Math.round((current + delta) * 10) / 10);
    setTargetGramsInput(next.toString());
  };

  // Packaging stepper handler
  const handleStepPackaging = (itemId: string, delta: number, currentQty: number) => {
    setPackagingOverrides((prev) => {
      const existing = typeof prev[itemId] === 'number' ? prev[itemId] : currentQty;
      const next = Math.max(0, existing + delta);
      return { ...prev, [itemId]: next };
    });
  };

  const handleResetPackaging = () => {
    setPackagingOverrides({});
  };

  // Copy scaled ingredients text
  const handleCopyRecipe = () => {
    const lines: string[] = [];
    lines.push(`📖 ${recipe.name} — Scaled Recipe`);
    lines.push(`👥 Portions: ${scaledResult.targetServings} person(s) (Ratio: ${scaledResult.scaleRatio}x)`);
    if (scaledResult.totalScaledGrams > 0) {
      lines.push(`⚖️ Total Weight: ~${scaledResult.totalScaledGrams}g (~${scaledResult.scaledGramsPerServing}g per person)`);
    }
    if (scaledResult.totalScaledMl > 0) {
      lines.push(`🥤 Liquid Volume: ~${scaledResult.totalScaledMl}ml (~${scaledResult.scaledMlPerServing}ml per person)`);
    }
    lines.push(
      `💰 Suggested Price: ${formatCurrency(scaledResult.suggestedTotalPrice, settings.currencySymbol)} (${formatCurrency(scaledResult.suggestedPricePerServing, settings.currencySymbol)} / person)`
    );
    lines.push(`\n🛒 Ingredients:`);
    scaledResult.ingredients.forEach((ing) => {
      lines.push(` • ${ing.itemName}: ${formatQuantity(ing.scaledQty)} ${ing.unit} (${settings.currencySymbol}${ing.scaledCost.toFixed(2)})`);
    });

    if (scaledResult.packaging.length > 0) {
      lines.push(`\n📦 Packaging:`);
      scaledResult.packaging.forEach((pkg) => {
        lines.push(` • ${pkg.itemName}: ${pkg.scaledQty} pcs (${settings.currencySymbol}${pkg.scaledCost.toFixed(2)})`);
      });
    }

    navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Save as a new scaled recipe in library
  const handleSaveAsNewRecipe = () => {
    const newRecipeName = `${recipe.name} (${scaledResult.targetServings} ${scaledResult.targetServings === 1 ? 'Person' : 'Persons'})`;
    
    addRecipe({
      name: newRecipeName,
      category: recipe.category,
      yieldQuantity: scaledResult.targetServings,
      yieldUnit: recipe.yieldUnit,
      servingCount: scaledResult.targetServings,
      prepTimeMinutes: recipe.prepTimeMinutes,
      bakeTimeMinutes: recipe.bakeTimeMinutes,
      laborHours: Math.round((recipe.laborHours || 0) * scaledResult.scaleRatio * 100) / 100,
      overheadCostPerBatch: Math.round((recipe.overheadCostPerBatch || 0) * scaledResult.scaleRatio * 100) / 100,
      targetProfitMargin: recipe.targetProfitMargin,
      ingredients: scaledResult.ingredients.map((ing) => ({
        itemId: ing.itemId,
        quantity: ing.scaledQty,
        unit: ing.unit,
        cost: ing.scaledCost,
      })),
      packaging: scaledResult.packaging.map((pkg) => ({
        itemId: pkg.itemId,
        quantity: pkg.scaledQty,
        cost: pkg.scaledCost,
      })),
      notes: `Auto-scaled ${scaledResult.scaleRatio}x from ${recipe.name}. Portions: ${scaledResult.targetServings} persons. ${recipe.notes ? `\n\nOriginal Notes: ${recipe.notes}` : ''}`,
    });

    setSavedSuccess(true);
    try {
      confetti({ particleCount: 40, spread: 50, origin: { y: 0.6 } });
    } catch {}
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  const footerContent = (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 w-full">
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <Button
          variant="outline"
          size="sm"
          icon={copied ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
          onClick={handleCopyRecipe}
          className="w-full sm:w-auto"
        >
          {copied ? 'Copied to Clipboard!' : 'Copy Prep List'}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          icon={<Printer size={16} />}
          onClick={handlePrint}
          className="hidden sm:inline-flex"
        >
          Print Sheet
        </Button>
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto">
        <Button
          variant="primary"
          size="sm"
          icon={savedSuccess ? <Check size={16} /> : <Plus size={16} />}
          onClick={handleSaveAsNewRecipe}
          className="w-full sm:w-auto"
        >
          {savedSuccess ? 'Saved to Recipes!' : 'Save as New Scaled Recipe'}
        </Button>
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Recipe Portion & Ratio Scaler"
      maxWidth="3xl"
      footer={footerContent}
    >
      <div className="space-y-5 print:p-0">
        {/* Top Info Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-amber-50 to-orange-50/60 p-4 rounded-2xl border border-amber-200/80">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-extrabold text-slate-900">{recipe.name}</h3>
              <Badge variant="amber">{recipe.category}</Badge>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              Base Recipe: <strong className="text-slate-800">{baseYield} {recipe.yieldUnit || 'servings'}</strong>
              {physicalMetrics && physicalMetrics.totalGrams > 0 && (
                <span> • Total Base Weight: ~{physicalMetrics.totalGrams}g (~{physicalMetrics.gramsPerServing}g / portion)</span>
              )}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs font-semibold px-2.5 py-1 bg-white rounded-lg border border-amber-200 text-amber-900 shadow-2xs">
              Ratio: <strong className="text-sm text-amber-700">{scaledResult.scaleRatio}x</strong>
            </span>
            <Badge variant="emerald">{recipe.targetProfitMargin}% Target Margin</Badge>
          </div>
        </div>

        {/* Portion Selector Buttons */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users size={18} className="text-amber-600" />
              <span className="text-sm font-bold text-slate-800">Select Portions / Persons</span>
            </div>
            <span className="text-xs text-slate-500">
              Instant ratio adjustment
            </span>
          </div>

          {/* Quick preset buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {portionPresets.map((p) => {
              const isSelected = mode === 'portions' && targetServings === p;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => handleSelectPreset(p)}
                  className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-150 flex items-center gap-1.5 shadow-2xs cursor-pointer select-none active:scale-95 ${
                    isSelected
                      ? 'bg-amber-600 text-white shadow-md shadow-amber-600/25 ring-2 ring-amber-600 ring-offset-2'
                      : 'bg-slate-100 hover:bg-amber-100 text-slate-700 border border-slate-200 hover:border-amber-300'
                  }`}
                >
                  <Users size={14} className={isSelected ? 'text-amber-200' : 'text-slate-400'} />
                  <span>{p} {p === 1 ? 'Person' : 'Persons'}</span>
                </button>
              );
            })}
          </div>

          {/* Advanced Stepper Controls with Dedicated Increment / Decrement Buttons */}
          <div className="pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <StepperControl
              label="Custom Portions"
              value={customServingsInput}
              onChange={handleCustomServingsChange}
              onStepDown={() => handleStepPortions(-1)}
              onStepUp={() => handleStepPortions(1)}
              suffix="portions"
              placeholder="e.g. 5"
            />

            <StepperControl
              label="Batch Multiplier"
              value={customMultiplier}
              onChange={handleMultiplierChange}
              onStepDown={() => handleStepMultiplier(-0.1)}
              onStepUp={() => handleStepMultiplier(0.1)}
              suffix="x ratio"
              placeholder="e.g. 1.5"
            />

            <StepperControl
              label="Grams / Portion"
              sublabel="Auto-adjusts"
              value={targetGramsInput}
              onChange={handleGramsChange}
              onStepDown={() => handleStepGrams(-5)}
              onStepUp={() => handleStepGrams(5)}
              suffix="g / pers"
              placeholder={physicalMetrics?.gramsPerServing ? `${physicalMetrics.gramsPerServing}g` : 'N/A'}
            />
          </div>
        </div>

        {/* Live Physical & Price Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Price per Portion */}
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white p-3.5 rounded-2xl shadow-sm">
            <span className="text-[11px] font-medium text-emerald-100 flex items-center gap-1">
              <DollarSign size={14} /> Price Per Portion
            </span>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-xl sm:text-2xl font-black">
                {formatCurrency(scaledResult.suggestedPricePerServing, settings.currencySymbol)}
              </span>
              <span className="text-[11px] text-emerald-100">/ person</span>
            </div>
            <p className="text-[10px] text-emerald-100/90 mt-1">
              Cost: {formatCurrency(scaledResult.costPerServing, settings.currencySymbol)} • Profit: {formatCurrency(scaledResult.profitPerServing, settings.currencySymbol)}
            </p>
          </div>

          {/* Total Suggested Price */}
          <div className="bg-gradient-to-br from-amber-500 to-orange-600 text-white p-3.5 rounded-2xl shadow-sm">
            <span className="text-[11px] font-medium text-amber-100 flex items-center gap-1">
              <Sparkles size={14} /> Total Scaled Price ({scaledResult.targetServings}p)
            </span>
            <div className="mt-1">
              <span className="text-xl sm:text-2xl font-black">
                {formatCurrency(scaledResult.suggestedTotalPrice, settings.currencySymbol)}
              </span>
            </div>
            <p className="text-[10px] text-amber-100/90 mt-1">
              Total Cost: {formatCurrency(scaledResult.totalCost, settings.currencySymbol)} • Net: +{formatCurrency(scaledResult.totalProfit, settings.currencySymbol)}
            </p>
          </div>

          {/* Weight Per Portion */}
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
            <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
              <Scale size={14} className="text-amber-600" /> Portion Weight
            </span>
            <div className="mt-1">
              <span className="text-lg sm:text-xl font-bold text-slate-800">
                {scaledResult.scaledGramsPerServing > 0 ? `~${scaledResult.scaledGramsPerServing}g` : '—'}
              </span>
              {scaledResult.scaledMlPerServing > 0 && (
                <span className="text-xs text-slate-500 ml-1 font-semibold">
                  + ~{scaledResult.scaledMlPerServing}ml
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Total: ~{scaledResult.totalScaledGrams}g mass {scaledResult.totalScaledMl > 0 ? `| ~${scaledResult.totalScaledMl}ml liquid` : ''}
            </p>
          </div>

          {/* Cost Summary Breakdown */}
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
            <span className="text-[11px] font-semibold text-slate-500 flex items-center justify-between">
              <span>Cost Share</span>
              <span className="text-emerald-700 font-bold">{scaledResult.profitMarginPercentage}% margin</span>
            </span>
            <div className="mt-1 space-y-0.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Ingredients:</span>
                <span className="font-semibold text-slate-800">{formatCurrency(scaledResult.ingredientsCost, settings.currencySymbol)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Labor & Gas:</span>
                <span className="font-semibold text-slate-800">{formatCurrency(scaledResult.laborCost + scaledResult.overheadCost, settings.currencySymbol)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Scaled Ingredients Table */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
          <div className="p-3.5 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-slate-800 text-sm">
                Adjusted Ingredients ({scaledResult.ingredients.length})
              </h4>
              <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-semibold">
                Scaled {scaledResult.scaleRatio}x
              </span>
            </div>
            <span className="text-xs text-slate-500">
              For {scaledResult.targetServings} {scaledResult.targetServings === 1 ? 'person' : 'persons'}
            </span>
          </div>

          <div className="overflow-x-auto max-h-[300px] overflow-y-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-100/70 text-slate-600 text-[11px] uppercase tracking-wider sticky top-0 z-1">
                <tr>
                  <th className="py-2.5 px-4 font-bold">Ingredient</th>
                  <th className="py-2.5 px-3 font-bold text-right">Base Amount</th>
                  <th className="py-2.5 px-3 font-bold text-right text-amber-700 bg-amber-50/50">Scaled Amount</th>
                  <th className="py-2.5 px-3 font-bold">Unit</th>
                  <th className="py-2.5 px-4 font-bold text-right">Scaled Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {scaledResult.ingredients.map((ing) => (
                  <tr key={ing.itemId} className="hover:bg-amber-50/30 transition-colors">
                    <td className="py-2.5 px-4 font-semibold text-slate-800">
                      {ing.itemName}
                      {ing.gramsEquivalent ? (
                        <span className="text-[10px] text-slate-400 block font-normal">
                          (~{ing.gramsEquivalent}g total)
                        </span>
                      ) : ing.mlEquivalent ? (
                        <span className="text-[10px] text-slate-400 block font-normal">
                          (~{ing.mlEquivalent}ml total)
                        </span>
                      ) : null}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-400 font-medium">
                      {formatQuantity(ing.originalQty)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-black text-amber-800 bg-amber-50/30">
                      {formatQuantity(ing.scaledQty)}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-600">
                      {ing.unit}
                    </td>
                    <td className="py-2.5 px-4 text-right font-bold text-slate-800">
                      {formatCurrency(ing.scaledCost, settings.currencySymbol)}
                    </td>
                  </tr>
                ))}

                {scaledResult.ingredients.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-400 text-xs">
                      No raw ingredients configured for this recipe.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Packaging & Boxes Section with Steppers & Mode Toggle */}
        {scaledResult.packaging.length > 0 && (
          <div className="border border-indigo-200/80 bg-indigo-50/40 rounded-2xl p-4 space-y-3 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                  <span>Packaging & Boxes</span>
                  <span className="text-xs font-bold px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded-full">
                    {formatCurrency(scaledResult.packagingCost, settings.currencySymbol)}
                  </span>
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {packagingStrategy === 'individual'
                    ? `Individual Portions: 1 box & sticker per person (${scaledResult.targetServings} portions = ${scaledResult.targetServings} boxes & stickers)`
                    : `Shared Packaging: multi-portion capacity per box`}
                </p>
              </div>

              {/* Packaging Mode Selector */}
              <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 self-start sm:self-auto shadow-2xs">
                <button
                  type="button"
                  onClick={() => {
                    setPackagingStrategy('individual');
                    setPackagingOverrides({});
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer select-none ${
                    packagingStrategy === 'individual'
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Each person gets their own box & sticker (1:1 with portion count)"
                >
                  Individual ({scaledResult.targetServings} pcs)
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPackagingStrategy('shared');
                    setPackagingOverrides({});
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer select-none ${
                    packagingStrategy === 'shared'
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Pack together in shared capacity boxes"
                >
                  Shared Boxes
                </button>

                {Object.keys(packagingOverrides).length > 0 && (
                  <button
                    type="button"
                    onClick={handleResetPackaging}
                    className="px-2 py-1 text-[10px] text-slate-400 hover:text-rose-600 font-semibold cursor-pointer"
                    title="Reset to calculated counts"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>

            {/* Packaging Items List with Direct Increment/Decrement Steppers */}
            <div className="space-y-2 bg-white rounded-xl p-2.5 border border-slate-200/80 divide-y divide-slate-100">
              {scaledResult.packaging.map((pkg) => (
                <div
                  key={pkg.itemId}
                  className="flex items-center justify-between gap-3 pt-2 first:pt-0"
                >
                  <div className="min-w-0 flex-1">
                    <span className="font-semibold text-slate-800 block truncate text-xs sm:text-sm">
                      {pkg.itemName}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Unit cost: {formatCurrency(pkg.scaledCost / Math.max(pkg.scaledQty, 1), settings.currencySymbol)}
                    </span>
                  </div>

                  {/* Stepper Buttons for each packaging item */}
                  <div className="flex items-center gap-2.5">
                    <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                      <button
                        type="button"
                        onClick={() => handleStepPackaging(pkg.itemId, -1, pkg.scaledQty)}
                        className="px-2 py-1 text-slate-600 hover:text-amber-800 hover:bg-amber-100 active:bg-amber-200 cursor-pointer select-none border-r border-slate-200"
                        title={`Decrease ${pkg.itemName}`}
                        aria-label={`Decrease ${pkg.itemName}`}
                      >
                        <Minus size={13} className="stroke-[2.5]" />
                      </button>

                      <span className="px-2.5 text-xs font-black text-slate-800 min-w-[34px] text-center">
                        {pkg.scaledQty}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleStepPackaging(pkg.itemId, 1, pkg.scaledQty)}
                        className="px-2 py-1 text-slate-600 hover:text-amber-800 hover:bg-amber-100 active:bg-amber-200 cursor-pointer select-none border-l border-slate-200"
                        title={`Increase ${pkg.itemName}`}
                        aria-label={`Increase ${pkg.itemName}`}
                      >
                        <Plus size={13} className="stroke-[2.5]" />
                      </button>
                    </div>

                    <span className="font-bold text-slate-800 min-w-[55px] text-right text-xs sm:text-sm">
                      {formatCurrency(pkg.scaledCost, settings.currencySymbol)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

