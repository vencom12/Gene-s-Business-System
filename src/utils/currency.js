/**
 * Currency & Financial Math Precision Engine
 * Prevents JavaScript floating-point rounding errors (e.g. 0.1 + 0.2 = 0.30000000000000004)
 * by computing with integer precision (cents/micros) or strict fixed rounding.
 */

/**
 * Rounds a number to a specific decimal precision safely
 */
export function roundTo(value, decimals = 2) {
  if (isNaN(value) || !isFinite(value)) return 0;
  const factor = Math.pow(10, decimals);
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

/**
 * Format currency value with symbol and locale decimal places
 */
export function formatCurrency(amount, symbol = '$') {
  const safeAmount = roundTo(amount, 2);
  const formatted = safeAmount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${symbol}${formatted}`;
}

/**
 * Format small unit costs (e.g. $0.0024/g) for inventory previews
 */
export function formatUnitCost(amount, symbol = '$') {
  if (isNaN(amount) || !isFinite(amount)) return `${symbol}0.0000`;
  if (amount < 0.01) {
    return `${symbol}${amount.toFixed(4)}`;
  }
  return formatCurrency(amount, symbol);
}

/**
 * Calculate recommended selling price given a cost and target profit margin %
 * Profit Margin % Formula: Margin = (Price - Cost) / Price => Price = Cost / (1 - Margin%)
 */
export function calculateSellingPriceFromMargin(cost, targetMarginPercent) {
  if (cost <= 0) return 0;
  // Cap profit margin between 0% and 95% to avoid division by zero or infinity
  const safeMargin = Math.min(Math.max(targetMarginPercent, 0), 95) / 100;
  const price = cost / (1 - safeMargin);
  return roundTo(price, 2);
}

/**
 * Calculate profit margin % from Cost and Selling Price
 * Formula: Margin% = ((Price - Cost) / Price) * 100
 */
export function calculateProfitMarginPercent(cost, price) {
  if (price <= 0 || price <= cost) return 0;
  const margin = ((price - cost) / price) * 100;
  return roundTo(margin, 1);
}

/**
 * Calculate markup multiplier (e.g. 2.5x)
 * Formula: Price / Cost
 */
export function calculateMarkupMultiplier(cost, price) {
  if (cost <= 0) return 0;
  return roundTo(price / cost, 2);
}
