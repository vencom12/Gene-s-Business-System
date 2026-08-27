import React from 'react';
import { LayoutDashboard, Package, ChefHat, ShoppingBag, Settings } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const Navigation: React.FC = () => {
  const { activeTab, setActiveTab, inventory, recipes, orders } = useApp();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, count: undefined },
    { id: 'inventory', label: 'Inventory', icon: Package, count: inventory.length },
    { id: 'recipes', label: 'Recipes & Costing', icon: ChefHat, count: recipes.length },
    { id: 'orders', label: 'Orders & Shopping', icon: ShoppingBag, count: orders.length },
    { id: 'settings', label: 'Settings', icon: Settings, count: undefined },
  ] as const;

  return (
    <nav className="hidden md:flex items-center gap-1 border-b border-slate-200 bg-amber-50/40 px-4 py-2">
      <div className="max-w-6xl mx-auto w-full flex items-center gap-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                isActive
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-amber-100/60'
              }`}
            >
              <Icon size={18} />
              <span>{item.label}</span>
              {item.count !== undefined && (
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
