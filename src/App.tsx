/**
 * FreshPredict - Main Application Entrypoint
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { DashboardTab } from './components/tabs/DashboardTab';
import { ForecastTab } from './components/tabs/ForecastTab';
import { PurchaseTab } from './components/tabs/PurchaseTab';
import { IngredientsTab } from './components/tabs/IngredientsTab';
import { RevenueTab } from './components/tabs/RevenueTab';
import { SettingsTab } from './components/tabs/SettingsTab';
import { AuthModal } from './components/AuthModal';
import { ProUpgradeModal } from './components/ProUpgradeModal';
import { Loader2, AlertCircle } from 'lucide-react';

const AppContent: React.FC = () => {
  const { activeTab, isLoading, error, toastMessage } = useApp();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 text-xs font-medium animate-in fade-in slide-in-from-bottom-4 duration-150 border border-slate-700">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        onOpenAuth={() => setAuthModalOpen(true)}
        onOpenUpgrade={() => setUpgradeModalOpen(true)}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      {/* Main Layout */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Left Sidebar */}
        <Sidebar
          onOpenUpgrade={() => setUpgradeModalOpen(true)}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
        />

        {/* Content Container */}
        <main className="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-8 min-w-0">
          {isLoading ? (
            <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
              <p className="text-xs text-slate-500 font-medium">
                Đang tải dữ liệu thời tiết & dự báo...
              </p>
            </div>
          ) : error ? (
            <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-sm">Đã xảy ra lỗi</h3>
                <p className="text-xs text-rose-700 mt-1">{error}</p>
              </div>
            </div>
          ) : (
            <>
              {activeTab === 'dashboard' && <DashboardTab />}
              {activeTab === 'forecast' && <ForecastTab />}
              {activeTab === 'purchase' && <PurchaseTab />}
              {activeTab === 'ingredients' && <IngredientsTab />}
              {activeTab === 'revenue' && <RevenueTab />}
              {activeTab === 'settings' && <SettingsTab />}
            </>
          )}
        </main>
      </div>

      {/* Modals */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
      <ProUpgradeModal
        isOpen={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
