import React, { useState, useMemo } from 'react';
import { Plus, Trash2, Save, ArrowLeft, ChefHat, Scale, Users } from 'lucide-react';
import type { Recipe, RecipeIngredient, RecipePackaging } from '../../types/recipe';
import type { UnitType } from '../../types/ingredient';
import { useApp } from '../../context/AppContext';
import { calculateItemCost } from '../../utils/unitConversions';
import { calculatePhysicalMetrics } from '../../utils/recipeScaler';
import { MarginCalculator } from './MarginCalculator';
import { RecipeCostingBreakdown } from './RecipeCostingBreakdown';
import { PortionRatioScalerModal } from './PortionRatioScalerModal';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import confetti from 'canvas-confetti';

interface RecipeEditorProps {
  recipeToEdit?: Recipe | null;
  onBack: () => void;
}

export const RecipeEditor: React.FC<RecipeEditorProps> = ({ recipeToEdit, onBack }) => {
  const { inventory, addRecipe, updateRecipe, settings } = useApp();

  const [name, setName] = useState(recipeToEdit?.name || '');
  const [category, setCategory] = useState(recipeToEdit?.category || 'Cakes');
  const [yieldQuantity, setYieldQuantity] = useState<string>(recipeToEdit?.yieldQuantity.toString() || '12');
  const [yieldUnit, setYieldUnit] = useState(recipeToEdit?.yieldUnit || 'cupcakes');
  const [servingCount, setServingCount] = useState<string>(
    recipeToEdit?.servingCount?.toString() || recipeToEdit?.yieldQuantity.toString() || '4'
  );
  const [isScalerOpen, setIsScalerOpen] = useState(false);
  const [prepTimeMinutes] = useState<string>(recipeToEdit?.prepTimeMinutes.toString() || '30');
  const [bakeTimeMinutes] = useState<string>(recipeToEdit?.bakeTimeMinutes.toString() || '20');
  const [laborHours, setLaborHours] = useState<string>(recipeToEdit?.laborHours.toString() || '1.0');
  const [overheadCostPerBatch, setOverheadCostPerBatch] = useState<string>(
    recipeToEdit?.overheadCostPerBatch.toString() || settings.defaultOverheadCost.toString()
  );
  const [targetProfitMargin, setTargetProfitMargin] = useState<number>(
    recipeToEdit?.targetProfitMargin || settings.defaultProfitMargin
  );
  const [notes, setNotes] = useState(recipeToEdit?.notes || '');

  const [recipeIngredients, setRecipeIngredients] = useState<RecipeIngredient[]>(
    recipeToEdit?.ingredients || []
  );
  const [recipePackaging, setRecipePackaging] = useState<RecipePackaging[]>(
    recipeToEdit?.packaging || []
  );

  const rawIngredientsInPantry = inventory.filter((i) => i.category === 'ingredient');
  const packagingInPantry = inventory.filter((i) => i.category === 'packaging');

  const ingredientsCost = recipeIngredients.reduce((sum, ri) => {
    const item = inventory.find((inv) => inv.id === ri.itemId);
    if (!item) return sum;
    return sum + calculateItemCost(ri.quantity, ri.unit, item.unitCost, item.baseUnit);
  }, 0);

  const packagingCost = recipePackaging.reduce((sum, rp) => {
    const item = inventory.find((inv) => inv.id === rp.itemId);
    if (!item) return sum;
    return sum + calculateItemCost(rp.quantity, 'pcs', item.unitCost, item.baseUnit);
  }, 0);

  const laborHoursNum = parseFloat(laborHours) || 0;
  const laborCost = laborHoursNum * settings.defaultLaborRate;
  const overheadCost = parseFloat(overheadCostPerBatch) || 0;

  const totalBatchCost = ingredientsCost + packagingCost + laborCost + overheadCost;
  const yieldQtyNum = parseFloat(yieldQuantity) || 1;

  const handleAddIngredientRow = () => {
    if (rawIngredientsInPantry.length === 0) return;
    const first = rawIngredientsInPantry[0];
    setRecipeIngredients((prev) => [
      ...prev,
      { itemId: first.id, quantity: 100, unit: first.purchaseUnit, cost: 0 },
    ]);
  };

  const handleAddPackagingRow = () => {
    if (packagingInPantry.length === 0) return;
    const first = packagingInPantry[0];
    setRecipePackaging((prev) => [
      ...prev,
      { itemId: first.id, quantity: 1, cost: 0 },
    ]);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || yieldQtyNum <= 0) return;

    const savedIngredients = recipeIngredients.map((ri) => {
      const item = inventory.find((i) => i.id === ri.itemId);
      const cost = item ? calculateItemCost(ri.quantity, ri.unit, item.unitCost, item.baseUnit) : 0;
      return { ...ri, cost };
    });

    const savedPackaging = recipePackaging.map((rp) => {
      const item = inventory.find((i) => i.id === rp.itemId);
      const cost = item ? calculateItemCost(rp.quantity, 'pcs', item.unitCost, item.baseUnit) : 0;
      return { ...rp, cost };
    });

    const servingCountNum = parseFloat(servingCount) || yieldQtyNum;

    if (recipeToEdit) {
      updateRecipe({
        ...recipeToEdit,
        name: name.trim(),
        category,
        yieldQuantity: yieldQtyNum,
        yieldUnit,
        servingCount: servingCountNum,
        prepTimeMinutes: parseInt(prepTimeMinutes) || 0,
        bakeTimeMinutes: parseInt(bakeTimeMinutes) || 0,
        laborHours: laborHoursNum,
        overheadCostPerBatch: overheadCost,
        targetProfitMargin,
        ingredients: savedIngredients,
        packaging: savedPackaging,
        notes: notes.trim() || undefined,
        updatedAt: new Date().toISOString(),
      });
    } else {
      addRecipe({
        name: name.trim(),
        category,
        yieldQuantity: yieldQtyNum,
        yieldUnit,
        servingCount: servingCountNum,
        prepTimeMinutes: parseInt(prepTimeMinutes) || 0,
        bakeTimeMinutes: parseInt(bakeTimeMinutes) || 0,
        laborHours: laborHoursNum,
        overheadCostPerBatch: overheadCost,
        targetProfitMargin,
        ingredients: savedIngredients,
        packaging: savedPackaging,
        notes: notes.trim() || undefined,
      });
    }

    try {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    } catch (err) {}

    onBack();
  };

  const previewRecipe: Recipe = useMemo(() => {
    const servingCountNum = parseFloat(servingCount) || yieldQtyNum;
    return {
      id: recipeToEdit?.id || 'temp-draft',
      name: name.trim() || 'Draft Recipe',
      category,
      yieldQuantity: yieldQtyNum,
      yieldUnit,
      servingCount: servingCountNum,
      prepTimeMinutes: parseInt(prepTimeMinutes) || 0,
      bakeTimeMinutes: parseInt(bakeTimeMinutes) || 0,
      laborHours: laborHoursNum,
      overheadCostPerBatch: overheadCost,
      targetProfitMargin,
      ingredients: recipeIngredients.map((ri) => {
        const item = inventory.find((i) => i.id === ri.itemId);
        const cost = item ? calculateItemCost(ri.quantity, ri.unit, item.unitCost, item.baseUnit) : 0;
        return { ...ri, cost };
      }),
      packaging: recipePackaging.map((rp) => {
        const item = inventory.find((i) => i.id === rp.itemId);
        const cost = item ? calculateItemCost(rp.quantity, 'pcs', item.unitCost, item.baseUnit) : 0;
        return { ...rp, cost };
      }),
      notes,
      createdAt: recipeToEdit?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }, [
    recipeToEdit,
    name,
    category,
    yieldQtyNum,
    yieldUnit,
    servingCount,
    prepTimeMinutes,
    bakeTimeMinutes,
    laborHoursNum,
    overheadCost,
    targetProfitMargin,
    recipeIngredients,
    recipePackaging,
    notes,
    inventory,
  ]);

  const draftMetrics = useMemo(
    () => calculatePhysicalMetrics(previewRecipe, inventory),
    [previewRecipe, inventory]
  );

  return (
    <form onSubmit={handleSave} className="space-y-6 pb-20 md:pb-6 animate-fade-in">
      <div className="flex items-center justify-between gap-4">
        <Button variant="ghost" type="button" icon={<ArrowLeft size={18} />} onClick={onBack}>
          Back to Recipes
        </Button>
        <Button variant="primary" type="submit" icon={<Save size={18} />}>
          {recipeToEdit ? 'Update Recipe' : 'Save Recipe'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="space-y-4">
            <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
              <ChefHat size={20} className="text-amber-600" />
              <span>Recipe Details</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Recipe Name"
                placeholder="e.g. Fudgy Brownies, Vanilla Sponge Cake"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              <Select
                label="Category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                options={[
                  { value: 'Cakes', label: 'Cakes' },
                  { value: 'Cupcakes', label: 'Cupcakes' },
                  { value: 'Cookies', label: 'Cookies & Bars' },
                  { value: 'Pastries', label: 'Pastries & Pies' },
                  { value: 'Breads', label: 'Breads & Buns' },
                ]}
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <Input
                label="Batch Yield"
                type="number"
                step="any"
                min="0.1"
                value={yieldQuantity}
                onChange={(e) => {
                  setYieldQuantity(e.target.value);
                  if (!recipeToEdit?.servingCount) {
                    setServingCount(e.target.value);
                  }
                }}
                required
              />

              <Input
                label="Yield Unit"
                placeholder="e.g. cupcakes, cakes"
                value={yieldUnit}
                onChange={(e) => setYieldUnit(e.target.value)}
                required
              />

              <Input
                label="Servings (Persons)"
                type="number"
                step="0.5"
                min="0.1"
                suffixSymbol="pers"
                value={servingCount}
                onChange={(e) => setServingCount(e.target.value)}
                helperText="For portion scaling"
              />

              <Input
                label="Labor Hours"
                type="number"
                step="0.25"
                min="0"
                suffixSymbol="hrs"
                value={laborHours}
                onChange={(e) => setLaborHours(e.target.value)}
                helperText={`$${settings.defaultLaborRate}/hr wage`}
              />

              <Input
                label="Overhead / Batch"
                type="number"
                step="0.5"
                min="0"
                prefixSymbol={settings.currencySymbol}
                value={overheadCostPerBatch}
                onChange={(e) => setOverheadCostPerBatch(e.target.value)}
                helperText="Gas / electricity"
              />
            </div>

            {/* Quick Portion & Weight Preview Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-amber-50/70 rounded-xl border border-amber-200/70 text-xs">
              <div className="flex items-center gap-2">
                <Scale size={16} className="text-amber-700 shrink-0" />
                <span className="text-slate-700">
                  {draftMetrics.totalGrams > 0 ? (
                    <>
                      Total Batch Weight: <strong className="text-slate-900">~{draftMetrics.totalGrams}g</strong>
                      {draftMetrics.totalMl > 0 ? ` + ~${draftMetrics.totalMl}ml liquid` : ''} •{' '}
                      Portion Size: <strong className="text-amber-800">~{draftMetrics.gramsPerServing}g / person</strong>
                    </>
                  ) : (
                    <span className="text-slate-500">Add ingredients below to see portion weight (grams/ml).</span>
                  )}
                </span>
              </div>

              <Button
                variant="outline"
                size="sm"
                type="button"
                icon={<Users size={14} className="text-amber-600" />}
                onClick={() => setIsScalerOpen(true)}
              >
                Test Portion Scaling (1, 2, 3, 4p)
              </Button>
            </div>

            <Input
              label="Recipe Notes & Instructions (Optional)"
              placeholder="e.g. Chill dough before baking, store in airtight container"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </Card>

          <Card className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-base">Raw Ingredients</h3>
              <Button
                variant="outline"
                size="sm"
                type="button"
                icon={<Plus size={16} />}
                onClick={handleAddIngredientRow}
              >
                Add Ingredient
              </Button>
            </div>

            <div className="space-y-3">
              {recipeIngredients.map((ri, index) => {
                const item = inventory.find((i) => i.id === ri.itemId);
                const itemCost = item
                  ? calculateItemCost(ri.quantity, ri.unit, item.unitCost, item.baseUnit)
                  : 0;

                return (
                  <div
                    key={index}
                    className="grid grid-cols-12 gap-2 items-center bg-slate-50 p-2.5 rounded-xl border border-slate-200"
                  >
                    <div className="col-span-5 sm:col-span-5">
                      <select
                        className="w-full text-xs sm:text-sm font-semibold rounded-lg border-slate-300 py-1.5 px-2 bg-white"
                        value={ri.itemId}
                        onChange={(e) => {
                          const id = e.target.value;
                          const selected = inventory.find((i) => i.id === id);
                          setRecipeIngredients((prev) =>
                            prev.map((row, i) =>
                              i === index
                                ? { ...row, itemId: id, unit: selected ? selected.purchaseUnit : row.unit }
                                : row
                            )
                          );
                        }}
                      >
                        {rawIngredientsInPantry.map((inv) => (
                          <option key={inv.id} value={inv.id}>
                            {inv.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-span-3 sm:col-span-3">
                      <input
                        type="number"
                        step="any"
                        min="0"
                        className="w-full text-xs sm:text-sm rounded-lg border-slate-300 py-1.5 px-2 bg-white font-medium"
                        value={ri.quantity}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          setRecipeIngredients((prev) =>
                            prev.map((row, i) => (i === index ? { ...row, quantity: val } : row))
                          );
                        }}
                      />
                    </div>

                    <div className="col-span-2 sm:col-span-2">
                      <select
                        className="w-full text-xs font-semibold rounded-lg border-slate-300 py-1.5 px-1 bg-white"
                        value={ri.unit}
                        onChange={(e) => {
                          const u = e.target.value as UnitType;
                          setRecipeIngredients((prev) =>
                            prev.map((row, i) => (i === index ? { ...row, unit: u } : row))
                          );
                        }}
                      >
                        <option value="g">g</option>
                        <option value="kg">kg</option>
                        <option value="oz">oz</option>
                        <option value="lb">lb</option>
                        <option value="ml">ml</option>
                        <option value="l">L</option>
                        <option value="tsp">tsp</option>
                        <option value="tbsp">tbsp</option>
                        <option value="cup">cup</option>
                        <option value="pcs">pcs</option>
                      </select>
                    </div>

                    <div className="col-span-2 sm:col-span-2 flex items-center justify-end gap-1">
                      <span className="text-xs font-bold text-amber-700">
                        {settings.currencySymbol}
                        {itemCost.toFixed(2)}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setRecipeIngredients((prev) => prev.filter((_, i) => i !== index))
                        }
                        className="text-slate-400 hover:text-rose-600 p-1"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}

              {recipeIngredients.length === 0 && (
                <p className="text-xs text-slate-400 text-center py-4">
                  No ingredients added. Click 'Add Ingredient' to choose items from your pantry.
                </p>
              )}
            </div>
          </Card>

          <Card className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-base">Packaging & Boxes</h3>
              <Button
                variant="outline"
                size="sm"
                type="button"
                icon={<Plus size={16} />}
                onClick={handleAddPackagingRow}
              >
                Add Box / Sticker
              </Button>
            </div>

            <div className="space-y-3">
              {recipePackaging.map((rp, index) => {
                const item = inventory.find((i) => i.id === rp.itemId);
                const pkgCost = item
                  ? calculateItemCost(rp.quantity, 'pcs', item.unitCost, item.baseUnit)
                  : 0;

                return (
                  <div
                    key={index}
                    className="grid grid-cols-12 gap-2 items-center bg-indigo-50/50 p-2.5 rounded-xl border border-indigo-100"
                  >
                    <div className="col-span-6">
                      <select
                        className="w-full text-xs sm:text-sm font-semibold rounded-lg border-slate-300 py-1.5 px-2 bg-white"
                        value={rp.itemId}
                        onChange={(e) => {
                          const id = e.target.value;
                          setRecipePackaging((prev) =>
                            prev.map((row, i) => (i === index ? { ...row, itemId: id } : row))
                          );
                        }}
                      >
                        {packagingInPantry.map((inv) => (
                          <option key={inv.id} value={inv.id}>
                            {inv.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-span-3">
                      <input
                        type="number"
                        step="1"
                        min="1"
                        placeholder="Qty"
                        className="w-full text-xs sm:text-sm rounded-lg border-slate-300 py-1.5 px-2 bg-white font-medium"
                        value={rp.quantity}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 0;
                          setRecipePackaging((prev) =>
                            prev.map((row, i) => (i === index ? { ...row, quantity: val } : row))
                          );
                        }}
                      />
                    </div>

                    <div className="col-span-3 flex items-center justify-end gap-1">
                      <span className="text-xs font-bold text-indigo-700">
                        {settings.currencySymbol}
                        {pkgCost.toFixed(2)}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setRecipePackaging((prev) => prev.filter((_, i) => i !== index))
                        }
                        className="text-slate-400 hover:text-rose-600 p-1"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}

              {recipePackaging.length === 0 && (
                <p className="text-xs text-slate-400 text-center py-4">
                  No packaging added. (Optional: cake boxes, ribbons, stickers).
                </p>
              )}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <MarginCalculator
            batchCost={totalBatchCost}
            yieldQuantity={yieldQtyNum}
            targetMargin={targetProfitMargin}
            onChangeMargin={setTargetProfitMargin}
            currencySymbol={settings.currencySymbol}
          />

          <RecipeCostingBreakdown
            ingredientsCost={ingredientsCost}
            packagingCost={packagingCost}
            laborCost={laborCost}
            overheadCost={overheadCost}
            totalCost={totalBatchCost}
            currencySymbol={settings.currencySymbol}
          />
        </div>
      </div>

      <PortionRatioScalerModal
        recipe={previewRecipe}
        isOpen={isScalerOpen}
        onClose={() => setIsScalerOpen(false)}
      />
    </form>
  );
};
