export type UnitType = 
  | 'g' | 'kg' | 'oz' | 'lb' 
  | 'ml' | 'l' | 'tsp' | 'tbsp' | 'cup' 
  | 'pcs' | 'box' | 'sheet' | 'pack';

export type CategoryType = 'ingredient' | 'packaging' | 'overhead';

export interface InventoryItem {
  id: string;
  name: string;
  category: CategoryType;
  purchasePrice: number; // e.g. $10.00
  purchaseQuantity: number; // e.g. 5000
  purchaseUnit: UnitType; // e.g. 'g'
  unitCost: number; // Calculated price per base unit (e.g., per 1g or per 1pc)
  baseUnit: UnitType; // Base unit used for standard calculation ('g', 'ml', 'pcs')
  notes?: string;
  updatedAt: string;
}
