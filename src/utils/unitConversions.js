

/**
 * Standard Unit Conversion Table
 * All mass units convert to base 'g'
 * All volume units convert to base 'ml'
 * Count units stay 'pcs'
 */

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
  cup: 240, // Standard US cup in baking
};

export function getBaseUnit(unit) {
  if (unit in MASS_TO_GRAMS) return 'g';
  if (unit in VOLUME_TO_ML) return 'ml';
  return 'pcs';
}

/**
 * Converts a quantity from one unit to another compatible unit.
 */
export function convertUnit(quantity, fromUnit, toUnit) {
  if (fromUnit === toUnit) return quantity;

  // Mass conversion
  if (fromUnit in MASS_TO_GRAMS && toUnit in MASS_TO_GRAMS) {
    const inGrams = quantity * MASS_TO_GRAMS[fromUnit];
    return inGrams / MASS_TO_GRAMS[toUnit];
  }

  // Volume conversion
  if (fromUnit in VOLUME_TO_ML && toUnit in VOLUME_TO_ML) {
    const inMl = quantity * VOLUME_TO_ML[fromUnit];
    return inMl / VOLUME_TO_ML[toUnit];
  }

  // Fallback for direct unit matches or counts
  return quantity;
}

/**
 * Calculates unit cost per base unit (e.g. cost per 1g or per 1ml or per 1pc)
 */
export function calculateBaseUnitCost(purchasePrice, purchaseQuantity, purchaseUnit) {
  if (purchaseQuantity <= 0 || purchasePrice <= 0) {
    return { unitCost: 0, baseUnit: getBaseUnit(purchaseUnit) };
  }

  const baseUnit = getBaseUnit(purchaseUnit);
  let totalBaseQuantity = purchaseQuantity;

  if (purchaseUnit in MASS_TO_GRAMS) {
    totalBaseQuantity = purchaseQuantity * MASS_TO_GRAMS[purchaseUnit];
  } else if (purchaseUnit in VOLUME_TO_ML) {
    totalBaseQuantity = purchaseQuantity * VOLUME_TO_ML[purchaseUnit];
  }

  const unitCost = purchasePrice / totalBaseQuantity;
  return { unitCost, baseUnit };
}

/**
 * Calculate the cost of an item used in a recipe
 */
export function calculateItemCost(
  quantityUsed,
  recipeUnit,
  itemUnitCost,
  itemBaseUnit
) {
  if (quantityUsed <= 0 || itemUnitCost <= 0) return 0;

  let baseQuantityUsed = quantityUsed;

  if (recipeUnit in MASS_TO_GRAMS && itemBaseUnit === 'g') {
    baseQuantityUsed = quantityUsed * MASS_TO_GRAMS[recipeUnit];
  } else if (recipeUnit in VOLUME_TO_ML && itemBaseUnit === 'ml') {
    baseQuantityUsed = quantityUsed * VOLUME_TO_ML[recipeUnit];
  }

  return baseQuantityUsed * itemUnitCost;
}
