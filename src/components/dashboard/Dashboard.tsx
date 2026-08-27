import React from 'react';
import { Coins, TrendingUp, ChefHat, Package, Plus, ChevronRight, Award } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MetricCard } from './MetricCard';
import { formatCurrency } from '../../utils/currency';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';

export const Dashboard: React.FC = () => {
  const { inventory, recipes, orders, settings, setActiveTab } = useApp();

  const totalRevenue = orders.reduce((sum, o) => sum + o.totalRevenue, 0);
  const totalProfit = orders.reduce((sum, o) => sum + o.totalProfit, 0);
  const inventoryValue = inventory.reduce((sum, item) => sum + item.purchasePrice, 0);

  let topRecipeMargin = 0;

  if (recipes.length > 0) {
    let maxMargin = -1;
    recipes.forEach((r) => {
      if (r.targetProfitMargin > maxMargin) {
        maxMargin = r.targetProfitMargin;
        topRecipeMargin = r.targetProfitMargin;
      }
    });
  }

  return (
    <div className="space-y-6 animate-fade-in pb-20 md:pb-6">
      <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold mb-3">
            <Award size={14} />
            <span>Welcome back, {settings.ownerName || 'Baker'}!</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-1">
            {settings.businessName} Overview
          </h2>
          <p className="text-amber-100 text-sm max-w-xl">
            Track your ingredient inventory, calculate exact batch recipe costs, and optimize profit margins effortlessly.
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-5">
            <Button
              variant="secondary"
              size="md"
              icon={<ChefHat size={18} />}
              onClick={() => setActiveTab('recipes')}
            >
              Calculate New Recipe
            </Button>
            <Button
              variant="outline"
              size="md"
              className="bg-white/10 hover:bg-white/20 text-white border-white/40"
              icon={<Plus size={18} />}
              onClick={() => setActiveTab('inventory')}
            >
              Add Pantry Ingredient
            </Button>
          </div>
        </div>

        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-xl pointer-events-none" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Order Revenue"
          value={formatCurrency(totalRevenue, settings.currencySymbol)}
          subtitle={`${orders.length} orders recorded`}
          icon={<Coins size={24} className="text-amber-600" />}
          colorVariant="amber"
        />
        <MetricCard
          title="Total Net Profit"
          value={formatCurrency(totalProfit, settings.currencySymbol)}
          subtitle={`Margin across orders`}
          icon={<TrendingUp size={24} className="text-emerald-600" />}
          colorVariant="emerald"
        />
        <MetricCard
          title="Active Recipes"
          value={`${recipes.length}`}
          subtitle={`Top margin: ${topRecipeMargin}%`}
          icon={<ChefHat size={24} className="text-indigo-600" />}
          colorVariant="indigo"
        />
        <MetricCard
          title="Inventory Value"
          value={formatCurrency(inventoryValue, settings.currencySymbol)}
          subtitle={`${inventory.length} ingredients & boxes`}
          icon={<Package size={24} className="text-rose-600" />}
          colorVariant="rose"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-800">Recent Recipes</h3>
              <p className="text-xs text-slate-500">Quick costing breakdown and margins</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              icon={<ChevronRight size={16} />}
              onClick={() => setActiveTab('recipes')}
            >
              View All
            </Button>
          </div>

          <div className="space-y-3">
            {recipes.slice(0, 3).map((recipe) => (
              <div
                key={recipe.id}
                onClick={() => setActiveTab('recipes')}
                className="flex items-center justify-between p-3 rounded-xl bg-amber-50/50 hover:bg-amber-100/60 transition-colors cursor-pointer border border-amber-100"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                    <ChefHat size={20} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800 text-sm">{recipe.name}</h4>
                    <p className="text-xs text-slate-500">
                      Yield: {recipe.yieldQuantity} {recipe.yieldUnit}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="emerald">{recipe.targetProfitMargin}% Margin</Badge>
                </div>
              </div>
            ))}
            {recipes.length === 0 && (
              <p className="text-sm text-slate-500 text-center py-6">No recipes added yet.</p>
            )}
          </div>
        </Card>

        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-800">Active Customer Orders</h3>
              <p className="text-xs text-slate-500">Track orders & shopping lists</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              icon={<ChevronRight size={16} />}
              onClick={() => setActiveTab('orders')}
            >
              View Orders
            </Button>
          </div>

          <div className="space-y-3">
            {orders.slice(0, 3).map((order) => (
              <div
                key={order.id}
                onClick={() => setActiveTab('orders')}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer border border-slate-200"
              >
                <div>
                  <h4 className="font-semibold text-slate-800 text-sm">{order.customerName}</h4>
                  <p className="text-xs text-slate-500">Delivery: {order.deliveryDate}</p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-amber-700 text-sm">
                    {formatCurrency(order.totalRevenue, settings.currencySymbol)}
                  </span>
                  <p className="text-[11px] text-emerald-600 font-semibold">
                    Profit: {formatCurrency(order.totalProfit, settings.currencySymbol)}
                  </p>
                </div>
              </div>
            ))}
            {orders.length === 0 && (
              <p className="text-sm text-slate-500 text-center py-6">No active customer orders.</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
