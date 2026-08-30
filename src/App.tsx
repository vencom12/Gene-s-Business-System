import React, { useState, useEffect } from 'react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { AppProvider, useApp } from './context/AppContext';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { Header } from './components/layout/Header';
import { Navigation } from './components/layout/Navigation';
import { MobileTabBar } from './components/layout/MobileTabBar';
import { Dashboard } from './components/dashboard/Dashboard';
import { InventoryList } from './components/inventory/InventoryList';
import { RecipeList } from './components/recipes/RecipeList';
import { OrderList } from './components/orders/OrderList';
import { SettingsView } from './components/settings/SettingsView';

const MainContent: React.FC = () => {
  const { activeTab } = useApp();

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-4 sm:pt-6">
      {activeTab === 'dashboard' && <Dashboard />}
      {activeTab === 'inventory' && <InventoryList />}
      {activeTab === 'recipes' && <RecipeList />}
      {activeTab === 'orders' && <OrderList />}
      {activeTab === 'settings' && <SettingsView />}
    </main>
  );
};

export function App() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallPWA = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted PWA installation');
        }
        setDeferredPrompt(null);
      });
    }
  };

  return (
    <ErrorBoundary>
      <AppProvider>
        <div className="min-h-screen bg-[#FDF8F5] text-slate-800 font-sans selection:bg-amber-200 antialiased">
          <Header deferredPrompt={deferredPrompt} onInstallPWA={handleInstallPWA} />
          <Navigation />
          <MainContent />
          <MobileTabBar />
        </div>
        <SpeedInsights />
      </AppProvider>
    </ErrorBoundary>
  );
}

export default App;
