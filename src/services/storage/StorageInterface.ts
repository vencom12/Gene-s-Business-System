import type { InventoryItem } from '../../types/ingredient';
import type { Recipe } from '../../types/recipe';
import type { CustomerOrder } from '../../types/order';
import type { AppSettings } from '../../types/settings';

export interface AppDataPayload {
  version: number;
  inventory: InventoryItem[];
  recipes: Recipe[];
  orders: CustomerOrder[];
  settings: AppSettings;
  exportedAt?: string;
}

export interface StorageInterface {
  loadData(): AppDataPayload | null;
  saveData(data: AppDataPayload): void;
  clearData(): void;
}
