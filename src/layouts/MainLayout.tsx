import { Outlet } from 'react-router-dom';
import { useState, useCallback } from 'react';
import Sidebar from '../components/common/Sidebar';
import Header from '../components/common/Header';

export default function MainLayout() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const handleOpenSidebar = useCallback(() => {
    setMobileSidebarOpen(true);
  }, []);

  const handleCloseSidebar = useCallback(() => {
    setMobileSidebarOpen(false);
  }, []);

  return (
    <div className="relative min-h-screen text-[rgb(var(--app-text-primary))] overflow-x-hidden">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 btn-muted">Skip to content</a>
      <div className="relative flex min-h-screen">
        <div className="sidebar-shell hidden border-r lg:flex lg:w-[260px] xl:w-[280px]">
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
    </div>
  );
}
