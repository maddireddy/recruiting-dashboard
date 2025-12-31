import { Outlet } from 'react-router-dom';
import { useState, useCallback } from 'react';
import Sidebar from '../components/common/Sidebar';
import Header from '../components/common/Header';
import SupportButton from '../components/support/SupportButton';

export default function MainLayout() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const handleOpenSidebar = useCallback(() => {
    setMobileSidebarOpen(true);
  }, []);

  const handleCloseSidebar = useCallback(() => {
    setMobileSidebarOpen(false);
  }, []);

  return (
    <div className="relative min-h-screen bg-[#F8FAFC] text-[#1E293B] overflow-x-hidden">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 rounded-lg bg-white border border-[#E2E8F0] px-4 py-2 text-sm font-medium shadow-lg">Skip to content</a>
      <div className="relative flex min-h-screen">
        <div className="hidden border-r border-[#E2E8F0] lg:flex lg:w-[260px] xl:w-[280px] bg-white shadow-sm">
          <Sidebar variant="desktop" onNavigate={handleCloseSidebar} />
        </div>

        <div className="flex flex-1 flex-col min-w-0">
          <Header onMenuClick={handleOpenSidebar} />
          <main id="main-content" className="relative flex-1 overflow-y-auto">
            <div className="content-container py-6">
              <Outlet />
            </div>
          </main>
        </div>
      </div>

      <Sidebar
        variant="mobile"
        open={mobileSidebarOpen}
        onNavigate={handleCloseSidebar}
        onClose={handleCloseSidebar}
      />

      {/* Floating support button */}
      <SupportButton variant="floating" />
    </div>
  );
}
