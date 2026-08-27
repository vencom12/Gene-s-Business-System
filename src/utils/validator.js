



/**
 * Bounds & Schema Validation Utilities
 * Ensures no negative numbers, zero divisions, or corrupt objects enter state.
 */

export function sanitizeNumber(value, fallback = 0, min = 0) {
  const num = typeof value === 'number' ? value : parseFloat(String(value));
  if (isNaN(num) || !isFinite(num)) return fallback;
  return Math.max(num, min);
}

export function isValidInventoryItem(item) {
  return (
    typeof item.id === 'string' &&
    item.id.length > 0 &&
    typeof item.name === 'string' &&
    item.name.trim().length > 0 &&
    typeof item.purchasePrice === 'number' &&
    item.purchasePrice >= 0 &&
    typeof item.purchaseQuantity === 'number' &&
    item.purchaseQuantity > 0
  );
}

export function isValidRecipe(recipe) {
  return (
    typeof recipe.id === 'string' &&
    recipe.id.length > 0 &&
    typeof recipe.name === 'string' &&
    recipe.name.trim().length > 0 &&
    typeof recipe.yieldQuantity === 'number' &&
    recipe.yieldQuantity > 0 &&
    Array.isArray(recipe.ingredients)
  );
}

export function isValidOrder(order) {
  return (
    typeof order.id === 'string' &&
    order.id.length > 0 &&
    typeof order.customerName === 'string' &&
    order.customerName.trim().length > 0 &&
    Array.isArray(order.items)
  );
}
