 function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } }


import { calculateItemCost } from './unitConversions';
import { calculateSellingPriceFromMargin } from './currency';

// Mass conversions to grams (g)
const MASS_TO_GRAMS = {
  g: 1,
  kg: 1000,
  oz: 28.3495,
  lb: 453.592,
};

// Volume conversions to milliliters (ml)
const VOLUME_TO_ML = {
  ml: 1,
  l: 1000,
  tsp: 4.92892,
  tbsp: 14.7868,
  cup: 240,
};




































































/**
 * Extracts and calculates physical weight (grams) and volume (ml) metrics of a recipe.
 */
export function calculatePhysicalMetrics(
  recipe,
  _inventory
) {
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













/**
 * Calculates scaled ingredients, physical portions, and adjusted prices/costs based on ratio.
 */
export function scaleRecipe(options) {
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
  } = options;

  const baseServings = Math.max(recipe.servingCount || recipe.yieldQuantity || 1, 0.1);
  const metrics = calculatePhysicalMetrics(recipe, inventory);

  // Determine scaling ratio
  let ratio = 1;
  let resolvedTargetServings = _nullishCoalesce(targetServings, () => ( baseServings));

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
  const scaledIngredients = recipe.ingredients.map((ri) => {
    const item = inventory.find((inv) => inv.id === ri.itemId);
    const scaledQty = roundNumber(ri.quantity * ratio, 2);
    
    const unitCost = item ? item.unitCost : 0;
    const baseUnit = item ? item.baseUnit : 'g';
    const scaledCost = item
      ? calculateItemCost(scaledQty, ri.unit, unitCost, baseUnit)
      : (ri.cost || 0) * ratio;

    const originalCost = ri.cost || (item ? calculateItemCost(ri.quantity, ri.unit, unitCost, baseUnit) : 0);

    ingredientsCost += scaledCost;

    let gramsEquivalent;
    let mlEquivalent;

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
  const scaledPackaging = recipe.packaging.map((rp) => {
    const item = inventory.find((inv) => inv.id === rp.itemId);
    // If packaging scales with servings, compute scaled count
    const rawScaled = scalePackaging ? rp.quantity * ratio : rp.quantity;
    const scaledQty = Math.max(Math.ceil(rawScaled), 1);

    const unitCost = item ? item.unitCost : 0;
    const baseUnit = item ? item.baseUnit : 'pcs';
    const scaledCost = item
      ? calculateItemCost(scaledQty, 'pcs', unitCost, baseUnit)
      : (rp.cost || 0) * ratio;

    const originalCost = rp.cost || (item ? calculateItemCost(rp.quantity, 'pcs', unitCost, baseUnit) : 0);
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
export function formatQuantity(num) {
  if (Number.isInteger(num)) return num.toString();
  if (num < 10) return num.toFixed(2).replace(/\.?0+$/, '');
  if (num < 100) return num.toFixed(1).replace(/\.?0+$/, '');
  return Math.round(num).toString();
}

function roundNumber(value, decimals) {
  const factor = Math.pow(10, decimals);
  return Math.round((value + Number.EPSILON) * factor) / factor;
}
