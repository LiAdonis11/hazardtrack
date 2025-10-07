import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useAuth } from '../hooks/useAuth';

const Layout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();

  // Check if device is mobile
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);

    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  const handleToggleSidebar = () => {
    if (isMobile) {
      setSidebarOpen(!sidebarOpen);
    } else {
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  const handleCloseSidebar = () => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-surface transition-all duration-300"
      style={{
        display: 'grid',
        gridTemplateColumns: isMobile
          ? '0 1fr'
          : sidebarCollapsed
          ? '4rem 1fr' // collapsed sidebar width 4rem, content fills rest
          : '16rem 1fr', // expanded sidebar width 16rem, content fills rest
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
      }}
    >
      {/* Sidebar */}
      <div
        className={`${
          isMobile
            ? `fixed inset-y-0 left-0 z-50 transform ${
                sidebarOpen ? 'translate-x-0' : '-translate-x-full'
              } transition-transform duration-300 ease-in-out`
            : 'relative transition-all duration-300'
        }`}
        style={{
          width: isMobile ? undefined : sidebarCollapsed ? '4rem' : '16rem',
          overflow: 'hidden',
        }}
      >
        <Sidebar
          isCollapsed={sidebarCollapsed}
          onToggle={handleToggleSidebar}
          isMobile={isMobile}
        />
      </div>

      {/* Mobile overlay */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={handleCloseSidebar}
        />
      )}

      {/* Main content */}
      <div
        className="flex flex-col min-w-0 overflow-hidden max-w-full pr-0 overflow-x-hidden"
        style={{
          width: '100%',
          height: '100%',
          overflow: 'hidden',
        }}
      >
        <Header
          user={user}
          onToggleSidebar={handleToggleSidebar}
          onLogout={logout}
          isMobile={isMobile}
          sidebarOpen={sidebarOpen}
        />

        <main className="flex-1 p-4 md:p-6 overflow-y-auto overflow-x-hidden" style={{ height: 'calc(100% - 64px)' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
