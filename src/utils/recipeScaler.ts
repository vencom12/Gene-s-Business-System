import type { Recipe } from '../types/recipe';
import type { InventoryItem, UnitType } from '../types/ingredient';
import type { AppSettings } from '../types/settings';
import { calculateItemCost } from './unitConversions';
import { calculateSellingPriceFromMargin } from './currency';

// Mass conversions to grams (g)
const MASS_TO_GRAMS: Record<string, number> = {
  g: 1,
  kg: 1000,
  oz: 28.3495,
  lb: 453.592,
};

// Volume conversions to milliliters (ml)
const VOLUME_TO_ML: Record<string, number> = {
  ml: 1,
  l: 1000,
  tsp: 4.92892,
  tbsp: 14.7868,
  cup: 240,
};

export interface PhysicalMetrics {
  totalGrams: number;
  totalMl: number;
  approxTotalWeightGrams: number;
  gramsPerServing: number;
  mlPerServing: number;
  approxWeightPerServingGrams: number;
  baseServings: number;
}

export interface ScaledIngredientRow {
  itemId: string;
  itemName: string;
  originalQty: number;
  scaledQty: number;
  unit: UnitType;
  originalCost: number;
  scaledCost: number;
  gramsEquivalent?: number;
  mlEquivalent?: number;
  unitCost: number;
  baseUnit: UnitType;
}

export interface ScaledPackagingRow {
  itemId: string;
  itemName: string;
  originalQty: number;
  scaledQty: number;
  originalCost: number;
  scaledCost: number;
}

export interface ScaledRecipeResult {
  recipeId: string;
  recipeName: string;
  baseServings: number;
  targetServings: number;
  scaleRatio: number;
  
  // Physical measurements
  totalScaledGrams: number;
  totalScaledMl: number;
  scaledGramsPerServing: number;
  scaledMlPerServing: number;
  approxTotalScaledWeightGrams: number;
  approxScaledWeightPerServingGrams: number;

  // Ingredients and Packaging
  ingredients: ScaledIngredientRow[];
  packaging: ScaledPackagingRow[];

  // Financials
  ingredientsCost: number;
  packagingCost: number;
  laborCost: number;
  overheadCost: number;
  totalCost: number;

  costPerServing: number;
  suggestedPricePerServing: number;
  suggestedTotalPrice: number;
  profitPerServing: number;
  totalProfit: number;
  profitMarginPercentage: number;
}

/**
 * Extracts and calculates physical weight (grams) and volume (ml) metrics of a recipe.
 */
export function calculatePhysicalMetrics(
  recipe: Recipe,
  _inventory?: InventoryItem[]
): PhysicalMetrics {
  const baseServings = Math.max(recipe.servingCount || recipe.yieldQuantity || 1, 0.1);

  let totalGrams = 0;
  let totalMl = 0;

  recipe.ingredients.forEach((ri) => {
    const qty = ri.quantity || 0;
    const unit = ri.unit;

    if (unit in MASS_TO_GRAMS) {
      totalGrams += qty * MASS_TO_GRAMS[unit];
    } else if (unit in VOLUME_TO_ML) {
      totalMl += qty * VOLUME_TO_ML[unit];
    }
  });

  // Approx weight: grams + (1 ml liquid ~ 1 g water density)
  const approxTotalWeightGrams = totalGrams + totalMl;

  return {
    totalGrams: roundNumber(totalGrams, 1),
    totalMl: roundNumber(totalMl, 1),
    approxTotalWeightGrams: roundNumber(approxTotalWeightGrams, 1),
    gramsPerServing: roundNumber(totalGrams / baseServings, 1),
    mlPerServing: roundNumber(totalMl / baseServings, 1),
    approxWeightPerServingGrams: roundNumber(approxTotalWeightGrams / baseServings, 1),
    baseServings,
  };
}

export interface ScaleRecipeOptions {
  recipe: Recipe;
  inventory: InventoryItem[];
  settings: AppSettings;
  targetServings?: number;
  customRatio?: number;
  targetGramsPerServing?: number;
  targetMlPerServing?: number;
  scaleLabor?: boolean;
  scalePackaging?: boolean;
  packagingStrategy?: 'individual' | 'shared' | 'auto';
  customPackagingOverrides?: Record<string, number>;
}

/**
 * Calculates scaled ingredients, physical portions, and adjusted prices/costs based on ratio.
 */
export function scaleRecipe(options: ScaleRecipeOptions): ScaledRecipeResult {
  const {
    recipe,
    inventory,
    settings,
    targetServings,
    customRatio,
    targetGramsPerServing,
    targetMlPerServing,
    scaleLabor = true,
    scalePackaging = true,
    packagingStrategy = 'auto',
    customPackagingOverrides,
  } = options;

  const baseServings = Math.max(recipe.servingCount || recipe.yieldQuantity || 1, 0.1);
  const metrics = calculatePhysicalMetrics(recipe, inventory);

  // Determine scaling ratio
  let ratio = 1;
  let resolvedTargetServings = targetServings ?? baseServings;

  if (typeof customRatio === 'number' && customRatio > 0) {
    ratio = customRatio;
    resolvedTargetServings = roundNumber(baseServings * ratio, 2);
  } else if (typeof targetGramsPerServing === 'number' && targetGramsPerServing > 0 && metrics.gramsPerServing > 0) {
    // Scaling by target weight per serving
    const singlePortionRatio = targetGramsPerServing / metrics.gramsPerServing;
    ratio = singlePortionRatio * (resolvedTargetServings / baseServings);
  } else if (typeof targetMlPerServing === 'number' && targetMlPerServing > 0 && metrics.mlPerServing > 0) {
    // Scaling by target volume per serving
    const singlePortionRatio = targetMlPerServing / metrics.mlPerServing;
    ratio = singlePortionRatio * (resolvedTargetServings / baseServings);
  } else if (typeof targetServings === 'number' && targetServings > 0) {
    ratio = targetServings / baseServings;
  }

  // Ensure reasonable ratio bounds
  ratio = Math.max(ratio, 0.001);

  // Scaled Ingredients
  let ingredientsCost = 0;
  const scaledIngredients: ScaledIngredientRow[] = recipe.ingredients.map((ri) => {
    const item = inventory.find((inv) => inv.id === ri.itemId);
    const scaledQty = roundNumber(ri.quantity * ratio, 2);
    
    const unitCost = item ? item.unitCost : 0;
    const baseUnit = item ? item.baseUnit : 'g';
    const scaledCost = item
      ? calculateItemCost(scaledQty, ri.unit, unitCost, baseUnit)
      : (ri.cost || 0) * ratio;

    const originalCost = ri.cost || (item ? calculateItemCost(ri.quantity, ri.unit, unitCost, baseUnit) : 0);

    ingredientsCost += scaledCost;

    let gramsEquivalent: number | undefined;
    let mlEquivalent: number | undefined;

    if (ri.unit in MASS_TO_GRAMS) {
      gramsEquivalent = roundNumber(scaledQty * MASS_TO_GRAMS[ri.unit], 1);
    } else if (ri.unit in VOLUME_TO_ML) {
      mlEquivalent = roundNumber(scaledQty * VOLUME_TO_ML[ri.unit], 1);
    }

    return {
      itemId: ri.itemId,
      itemName: item ? item.name : 'Unknown Ingredient',
      originalQty: ri.quantity,
      scaledQty,
      unit: ri.unit,
      originalCost: roundNumber(originalCost, 2),
      scaledCost: roundNumber(scaledCost, 2),
      gramsEquivalent,
      mlEquivalent,
      unitCost,
      baseUnit,
    };
  });

  // Scaled Packaging
  let packagingCost = 0;
  const scaledPackaging: ScaledPackagingRow[] = recipe.packaging.map((rp) => {
    const item = inventory.find((inv) => inv.id === rp.itemId);
    const itemNameLower = (item?.name || '').toLowerCase();
    const isBox =
      itemNameLower.includes('box') ||
      itemNameLower.includes('container') ||
      itemNameLower.includes('clamshell') ||
      itemNameLower.includes('tub') ||
      itemNameLower.includes('pouch');
    const isSticker =
      itemNameLower.includes('sticker') ||
      itemNameLower.includes('label') ||
      itemNameLower.includes('tag');

    let scaledQty: number;

    // 1. Check if user provided manual count override in the UI
    if (customPackagingOverrides && typeof customPackagingOverrides[rp.itemId] === 'number') {
      scaledQty = Math.max(0, Math.round(customPackagingOverrides[rp.itemId]));
    } else if (!scalePackaging) {
      scaledQty = rp.quantity;
    } else if (rp.scalingType === 'fixed') {
      // Fixed items (e.g. 1 paper shopping bag per order)
      scaledQty = rp.quantity;
    } else if (packagingStrategy === 'individual' || rp.scalingType === 'per_portion') {
      // Individual portion packaging: 1 box/sticker per portion (or base qty proportional to servings)
      const perPortionRatio = rp.quantity > 0 && baseServings > 0 ? rp.quantity / baseServings : 1;
      scaledQty = Math.max(1, Math.ceil(resolvedTargetServings * perPortionRatio));
    } else if (packagingStrategy === 'shared' || rp.scalingType === 'capacity') {
      // Shared box packaging: calculate capacity per box
      const capacity =
        rp.capacity ||
        (rp.quantity > 0 ? Math.max(1, Math.round(baseServings / rp.quantity)) : 1);
      const boxesNeeded = Math.max(1, Math.ceil(resolvedTargetServings / capacity));
      if (isBox) {
        scaledQty = boxesNeeded;
      } else if (isSticker) {
        scaledQty = boxesNeeded; // 1 sticker per box
      } else {
        scaledQty = Math.max(1, Math.ceil(rp.quantity * ratio));
      }
    } else {
      // 'auto' strategy:
      // If base recipe packaging quantity matches base servings (e.g. 4 portions and 4 boxes), it is 1:1 individual!
      if (Math.abs(rp.quantity - baseServings) < 0.1) {
        scaledQty = Math.max(1, Math.round(resolvedTargetServings));
      } else if (isBox) {
        const capacity =
          rp.capacity ||
          (rp.quantity > 0 ? Math.max(1, Math.round(baseServings / rp.quantity)) : 1);
        scaledQty = Math.max(1, Math.ceil(resolvedTargetServings / capacity));
      } else if (isSticker) {
        const boxItem = recipe.packaging.find((p) => {
          const inv = inventory.find((i) => i.id === p.itemId);
          const name = (inv?.name || '').toLowerCase();
          return name.includes('box') || name.includes('container') || name.includes('clamshell');
        });
        if (boxItem) {
          const boxCap =
            boxItem.capacity ||
            (boxItem.quantity > 0 ? Math.max(1, Math.round(baseServings / boxItem.quantity)) : 1);
          scaledQty = Math.max(1, Math.ceil(resolvedTargetServings / boxCap));
        } else {
          scaledQty = Math.max(1, Math.ceil(rp.quantity * ratio));
        }
      } else {
        scaledQty = Math.max(1, Math.ceil(rp.quantity * ratio));
      }
    }

    const unitCost = item ? item.unitCost : 0;
    const baseUnit = item ? item.baseUnit : 'pcs';
    const scaledCost = item
      ? calculateItemCost(scaledQty, 'pcs', unitCost, baseUnit)
      : (rp.cost || 0) * (scaledQty / Math.max(rp.quantity, 1));

    const originalCost =
      rp.cost || (item ? calculateItemCost(rp.quantity, 'pcs', unitCost, baseUnit) : 0);
    packagingCost += scaledCost;

    return {
      itemId: rp.itemId,
      itemName: item ? item.name : 'Packaging',
      originalQty: rp.quantity,
      scaledQty,
      originalCost: roundNumber(originalCost, 2),
      scaledCost: roundNumber(scaledCost, 2),
    };
  });

  // Labor & Overhead scaling
  const laborHours = recipe.laborHours || 0;
  // Scaled labor: scales proportionally but with a reasonable floor
  const scaledLaborHours = scaleLabor ? laborHours * ratio : laborHours;
  const laborCost = scaledLaborHours * settings.defaultLaborRate;

  // Overhead cost (gas/power): scales with ratio
  const overheadCost = (recipe.overheadCostPerBatch || 0) * ratio;

  const totalCost = ingredientsCost + packagingCost + laborCost + overheadCost;
  const servings = Math.max(resolvedTargetServings, 0.1);
  const costPerServing = totalCost / servings;

  // Suggested selling price calculation based on recipe target profit margin
  const margin = recipe.targetProfitMargin || settings.defaultProfitMargin;
  const suggestedTotalPrice = calculateSellingPriceFromMargin(totalCost, margin);
  const suggestedPricePerServing = suggestedTotalPrice / servings;
  const totalProfit = suggestedTotalPrice - totalCost;
  const profitPerServing = totalProfit / servings;

  // Scaled Physical Totals
  const totalScaledGrams = roundNumber(metrics.totalGrams * ratio, 1);
  const totalScaledMl = roundNumber(metrics.totalMl * ratio, 1);
  const approxTotalScaledWeightGrams = roundNumber(metrics.approxTotalWeightGrams * ratio, 1);

  return {
    recipeId: recipe.id,
    recipeName: recipe.name,
    baseServings,
    targetServings: resolvedTargetServings,
    scaleRatio: roundNumber(ratio, 4),

    totalScaledGrams,
    totalScaledMl,
    scaledGramsPerServing: roundNumber(totalScaledGrams / servings, 1),
    scaledMlPerServing: roundNumber(totalScaledMl / servings, 1),
    approxTotalScaledWeightGrams,
    approxScaledWeightPerServingGrams: roundNumber(approxTotalScaledWeightGrams / servings, 1),

    ingredients: scaledIngredients,
    packaging: scaledPackaging,

    ingredientsCost: roundNumber(ingredientsCost, 2),
    packagingCost: roundNumber(packagingCost, 2),
    laborCost: roundNumber(laborCost, 2),
    overheadCost: roundNumber(overheadCost, 2),
    totalCost: roundNumber(totalCost, 2),

    costPerServing: roundNumber(costPerServing, 2),
    suggestedPricePerServing: roundNumber(suggestedPricePerServing, 2),
    suggestedTotalPrice: roundNumber(suggestedTotalPrice, 2),
    profitPerServing: roundNumber(profitPerServing, 2),
    totalProfit: roundNumber(totalProfit, 2),
    profitMarginPercentage: margin,
  };
}

/**
 * Formats a scaled number cleanly for baking display (e.g. 1.25, 0.5, 250).
 */
export function formatQuantity(num: number): string {
  if (Number.isInteger(num)) return num.toString();
  if (num < 10) return num.toFixed(2).replace(/\.?0+$/, '');
  if (num < 100) return num.toFixed(1).replace(/\.?0+$/, '');
  return Math.round(num).toString();
}

function roundNumber(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round((value + Number.EPSILON) * factor) / factor;
}
