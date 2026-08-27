import type { UnitType } from './ingredient';

export interface OrderItem {
  recipeId: string;
  quantity: number; // Number of units ordered
  pricePerUnit: number; // Price charged per unit
  totalCost: number; // Calculated batch cost to make this item
  totalRevenue: number; // Calculated revenue from this item
}

export interface AggregatedGroceryItem {
  itemId: string;
  name: string;
  category: 'ingredient' | 'packaging';
  totalRequiredQuantity: number;
  unit: UnitType;
  estimatedCost: number;
}

export type OrderStatus = 'Draft' | 'Confirmed' | 'Baking' | 'Completed' | 'Cancelled';

export interface CustomerOrder {
  id: string;
  customerName: string;
  customerPhone?: string;
  deliveryDate: string;
  status: OrderStatus;
  items: OrderItem[];
  totalCost: number;
  totalRevenue: number;
  totalProfit: number;
  depositPaid: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
