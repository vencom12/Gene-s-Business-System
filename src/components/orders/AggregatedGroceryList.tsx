import React from 'react';
import { ShoppingCart, Copy, Printer } from 'lucide-react';
import type { CustomerOrder } from '../../types/order';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/currency';
import { Button } from '../common/Button';
import { Card } from '../common/Card';

interface GroceryListProps {
  ordersToAggregate: CustomerOrder[];
}

export const AggregatedGroceryList: React.FC<GroceryListProps> = ({ ordersToAggregate }) => {
  const { recipes, inventory, settings } = useApp();

  const ingredientTotals: Record<string, { name: string; totalQty: number; unit: string; totalEstCost: number }> = {};

  ordersToAggregate.forEach((order) => {
    order.items.forEach((item) => {
      const recipe = recipes.find((r) => r.id === item.recipeId);
      if (!recipe) return;

      const scaleFactor = recipe.yieldQuantity > 0 ? item.quantity / recipe.yieldQuantity : 1;

      recipe.ingredients.forEach((ri) => {
        const invItem = inventory.find((i) => i.id === ri.itemId);
        if (!invItem) return;

        const reqQty = ri.quantity * scaleFactor;
        const estCost = (ri.cost || 0) * scaleFactor;

        if (!ingredientTotals[invItem.id]) {
          ingredientTotals[invItem.id] = {
            name: invItem.name,
            totalQty: reqQty,
            unit: ri.unit,
            totalEstCost: estCost,
          };
        } else {
          ingredientTotals[invItem.id].totalQty += reqQty;
          ingredientTotals[invItem.id].totalEstCost += estCost;
        }
      });

      recipe.packaging.forEach((rp) => {
        const invItem = inventory.find((i) => i.id === rp.itemId);
        if (!invItem) return;

        const reqQty = rp.quantity * scaleFactor;
        const estCost = (rp.cost || 0) * scaleFactor;

        if (!ingredientTotals[invItem.id]) {
          ingredientTotals[invItem.id] = {
            name: invItem.name,
            totalQty: reqQty,
            unit: 'pcs',
            totalEstCost: estCost,
          };
        } else {
          ingredientTotals[invItem.id].totalQty += reqQty;
          ingredientTotals[invItem.id].totalEstCost += estCost;
        }
      });
    });
  });

  const handleCopyText = () => {
    let text = `🛒 BAKERY GROCERY SHOPPING LIST\n`;
    text += `Generated for ${ordersToAggregate.length} Order(s)\n-------------------------------\n`;

    Object.values(ingredientTotals).forEach((item) => {
      text += `• ${item.name}: ${item.totalQty.toFixed(1)} ${item.unit} (~${formatCurrency(item.totalEstCost, settings.currencySymbol)})\n`;
    });

    navigator.clipboard.writeText(text);
    alert('Grocery list copied to clipboard!');
  };

  const handlePrint = () => {
    window.print();
  };

  const itemsList = Object.values(ingredientTotals);

  return (
    <Card className="space-y-4 border-amber-300 bg-amber-50/30 print:shadow-none">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-amber-200">
        <div>
          <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
            <ShoppingCart size={22} className="text-amber-600" />
            <span>Aggregated Grocery Shopping List</span>
          </h3>
          <p className="text-xs text-slate-500">
            Total raw materials required to fulfill {ordersToAggregate.length} customer order(s)
          </p>
        </div>

        <div className="flex items-center gap-2 print:hidden">
          <Button variant="outline" size="sm" icon={<Copy size={16} />} onClick={handleCopyText}>
            Copy List
          </Button>
          <Button variant="secondary" size="sm" icon={<Printer size={16} />} onClick={handlePrint}>
            Print / PDF
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        {itemsList.map((item, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-amber-200/80 shadow-2xs"
          >
            <div className="flex items-center gap-2.5">
              <span className="w-5 h-5 rounded-full border-2 border-slate-300 flex items-center justify-center text-transparent hover:text-slate-400 cursor-pointer">
                ✓
              </span>
              <span className="font-semibold text-slate-800 text-sm">{item.name}</span>
            </div>

            <div className="text-right">
              <span className="font-extrabold text-amber-900 text-sm">
                {item.totalQty.toFixed(1)} {item.unit}
              </span>
              <span className="text-xs text-slate-400 block font-medium">
                ~{formatCurrency(item.totalEstCost, settings.currencySymbol)}
              </span>
            </div>
          </div>
        ))}

        {itemsList.length === 0 && (
          <p className="text-sm text-slate-500 text-center py-6">
            No items to calculate. Add items to customer orders first.
          </p>
        )}
      </div>
    </Card>
  );
};
