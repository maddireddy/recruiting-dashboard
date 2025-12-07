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
    <div className="relative min-h-screen text-[rgb(var(--app-text-primary))]">
      <div className="relative flex min-h-screen">
        <div className="sidebar-shell hidden border-r lg:flex lg:w-[260px] xl:w-[280px]">
          <Sidebar variant="desktop" onNavigate={handleCloseSidebar} />
        </div>

        <div className="flex flex-1 flex-col">
          <Header onMenuClick={handleOpenSidebar} />
          <main className="relative flex-1 overflow-y-auto">
            <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
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
