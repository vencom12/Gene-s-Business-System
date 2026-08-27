import React, { createContext, useContext, useState, useEffect } from 'react';
import type { InventoryItem } from '../types/ingredient';
import type { Recipe } from '../types/recipe';
import type { CustomerOrder } from '../types/order';
import type { AppSettings } from '../types/settings';
import type { AppDataPayload } from '../services/storage/StorageInterface';
import { storageService } from '../services/storage/LocalStorageService';
import { DEFAULT_SETTINGS } from '../config/defaultStarterData';
import { sanitizeString } from '../utils/sanitizer';

interface AppContextType {
  inventory: InventoryItem[];
  recipes: Recipe[];
  orders: CustomerOrder[];
  settings: AppSettings;
  activeTab: 'dashboard' | 'inventory' | 'recipes' | 'orders' | 'settings';
  setActiveTab: (tab: 'dashboard' | 'inventory' | 'recipes' | 'orders' | 'settings') => void;
  
  addInventoryItem: (item: Omit<InventoryItem, 'id' | 'updatedAt'>) => void;
  updateInventoryItem: (item: InventoryItem) => void;
  deleteInventoryItem: (id: string) => void;

  addRecipe: (recipe: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateRecipe: (recipe: Recipe) => void;
  deleteRecipe: (id: string) => void;

  addOrder: (order: Omit<CustomerOrder, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateOrder: (order: CustomerOrder) => void;
  deleteOrder: (id: string) => void;

  updateSettings: (newSettings: Partial<AppSettings>) => void;
  loadFullPayload: (payload: AppDataPayload) => void;
  resetToDefaultData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'inventory' | 'recipes' | 'orders' | 'settings'>('dashboard');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loaded = storageService.loadData();
    if (loaded) {
      setInventory(loaded.inventory || []);
      setRecipes(loaded.recipes || []);
      setOrders(loaded.orders || []);
      setSettings(loaded.settings || DEFAULT_SETTINGS);
    } else {
      setInventory([]);
      setRecipes([]);
      setOrders([]);
      setSettings(DEFAULT_SETTINGS);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    const payload: AppDataPayload = {
      version: 1,
      inventory,
      recipes,
      orders,
      settings,
    };
    storageService.saveData(payload);
  }, [inventory, recipes, orders, settings, isLoaded]);

  const addInventoryItem = (itemData: Omit<InventoryItem, 'id' | 'updatedAt'>) => {
    const newItem: InventoryItem = {
      ...itemData,
      id: `ing-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: sanitizeString(itemData.name),
      notes: itemData.notes ? sanitizeString(itemData.notes) : undefined,
      updatedAt: new Date().toISOString(),
    };
    setInventory((prev) => [newItem, ...prev]);
  };

  const updateInventoryItem = (updated: InventoryItem) => {
    setInventory((prev) =>
      prev.map((item) =>
        item.id === updated.id
          ? {
              ...updated,
              name: sanitizeString(updated.name),
              notes: updated.notes ? sanitizeString(updated.notes) : undefined,
              updatedAt: new Date().toISOString(),
            }
          : item
      )
    );
  };

  const deleteInventoryItem = (id: string) => {
    setInventory((prev) => prev.filter((item) => item.id !== id));
  };

  const addRecipe = (recipeData: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newRecipe: Recipe = {
      ...recipeData,
      id: `rec-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: sanitizeString(recipeData.name),
      category: sanitizeString(recipeData.category),
      notes: recipeData.notes ? sanitizeString(recipeData.notes) : undefined,
      createdAt: now,
      updatedAt: now,
    };
    setRecipes((prev) => [newRecipe, ...prev]);
  };

  const updateRecipe = (updated: Recipe) => {
    setRecipes((prev) =>
      prev.map((r) =>
        r.id === updated.id
          ? {
              ...updated,
              name: sanitizeString(updated.name),
              category: sanitizeString(updated.category),
              notes: updated.notes ? sanitizeString(updated.notes) : undefined,
              updatedAt: new Date().toISOString(),
            }
          : r
      )
    );
  };

  const deleteRecipe = (id: string) => {
    setRecipes((prev) => prev.filter((r) => r.id !== id));
  };

  const addOrder = (orderData: Omit<CustomerOrder, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newOrder: CustomerOrder = {
      ...orderData,
      id: `ord-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      customerName: sanitizeString(orderData.customerName),
      customerPhone: orderData.customerPhone ? sanitizeString(orderData.customerPhone) : undefined,
      notes: orderData.notes ? sanitizeString(orderData.notes) : undefined,
      createdAt: now,
      updatedAt: now,
    };
    setOrders((prev) => [newOrder, ...prev]);
  };

  const updateOrder = (updated: CustomerOrder) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === updated.id
          ? {
              ...updated,
              customerName: sanitizeString(updated.customerName),
              customerPhone: updated.customerPhone ? sanitizeString(updated.customerPhone) : undefined,
              notes: updated.notes ? sanitizeString(updated.notes) : undefined,
              updatedAt: new Date().toISOString(),
            }
          : o
      )
    );
  };

  const deleteOrder = (id: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== id));
  };

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const loadFullPayload = (payload: AppDataPayload) => {
    setInventory(payload.inventory);
    setRecipes(payload.recipes);
    setOrders(payload.orders || []);
    if (payload.settings) setSettings(payload.settings);
  };

  const resetToDefaultData = () => {
    setInventory([]);
    setRecipes([]);
    setOrders([]);
    setSettings(DEFAULT_SETTINGS);
    storageService.clearData();
  };

  return (
    <AppContext.Provider
      value={{
        inventory,
        recipes,
        orders,
        settings,
        activeTab,
        setActiveTab,
        addInventoryItem,
        updateInventoryItem,
        deleteInventoryItem,
        addRecipe,
        updateRecipe,
        deleteRecipe,
        addOrder,
        updateOrder,
        deleteOrder,
        updateSettings,
        loadFullPayload,
        resetToDefaultData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
