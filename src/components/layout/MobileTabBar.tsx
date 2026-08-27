import React from 'react';
import { LayoutDashboard, Package, ChefHat, ShoppingBag, Settings } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const MobileTabBar: React.FC = () => {
  const { activeTab, setActiveTab } = useApp();

  const tabs = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'inventory', label: 'Pantry', icon: Package },
    { id: 'recipes', label: 'Recipes', icon: ChefHat },
    { id: 'orders', label: 'Orders', icon: ShoppingBag },
    { id: 'settings', label: 'Settings', icon: Settings },
  ] as const;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1.5 pb-safe shadow-lg">
      <div className="flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all min-w-[64px] min-h-[48px] ${
                isActive
                  ? 'text-amber-600 font-bold bg-amber-50'
                  : 'text-slate-500 hover:text-slate-800 font-medium'
              }`}
            >
              <Icon size={20} className={isActive ? 'stroke-[2.5px] scale-110' : 'stroke-[1.75px]'} />
              <span className="text-[11px] leading-tight mt-1">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
