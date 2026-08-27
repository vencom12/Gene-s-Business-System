import type { UnitType } from './ingredient';

export interface RecipeIngredient {
  itemId: string; // Links to InventoryItem.id
  quantity: number; // Quantity used in recipe (e.g. 350)
  unit: UnitType; // Recipe unit (e.g. 'g' or 'cup')
  cost: number; // Auto-calculated total cost of this ingredient item in recipe
}

export interface RecipePackaging {
  itemId: string;
  quantity: number; // Number of boxes, sheets, stickers used per batch
  cost: number;
}

export interface RecipeCostBreakdown {
  ingredientsCost: number;
  packagingCost: number;
  laborCost: number;
  overheadCost: number;
  totalBatchCost: number;
  costPerUnit: number;
  suggestedPrice: number; // Price based on target profit margin
  profitMarginPercentage: number; // e.g. 50%
  profitPerUnit: number;
  markupMultiplier: number; // e.g. 2.0x
}

export interface Recipe {
  id: string;
  name: string;
  category: string; // e.g. 'Cakes', 'Cookies', 'Cupcakes', 'Pastries'
  yieldQuantity: number; // How many units this recipe yields (e.g., 12 cupcakes, 1 cake)
  yieldUnit: string; // 'pcs', 'batch', 'cakes', 'boxes'
  prepTimeMinutes: number; // Preparation time in minutes
  bakeTimeMinutes: number; // Baking time in minutes
  laborHours: number; // Total labor hours for batch (baking + decorating)
  overheadCostPerBatch: number; // Gas, electricity, water allocation
  targetProfitMargin: number; // Target margin percentage (default e.g. 50%)
  ingredients: RecipeIngredient[];
  packaging: RecipePackaging[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
