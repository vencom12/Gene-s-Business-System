import type { InventoryItem } from '../types/ingredient';
import type { Recipe } from '../types/recipe';
import type { CustomerOrder } from '../types/order';
import type { AppSettings } from '../types/settings';

export const DEFAULT_INVENTORY: InventoryItem[] = [];

export const DEFAULT_RECIPES: Recipe[] = [];

export const DEFAULT_ORDERS: CustomerOrder[] = [];

export const DEFAULT_SETTINGS: AppSettings = {
  currencySymbol: '₱',
  defaultLaborRate: 150.00,
  defaultOverheadCost: 40.00,
  defaultProfitMargin: 55,
  businessName: "Gene's Bakery",
  ownerName: 'Gene',
  theme: 'light',
  schemaVersion: 1,
};
