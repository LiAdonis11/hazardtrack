import { useState } from 'react';
import NotificationsDropdown from './NotificationsDropdown';

const Header = ({ user, onToggleSidebar, onLogout, isMobile, sidebarOpen }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);

  const getUserInitials = (fullname) => {
    if (!fullname) return 'U';
    return fullname
      .split(' ')
      .map(name => name[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleUserMenuToggle = () => {
    setShowUserMenu(!showUserMenu);
  };

  const handleLogoutClick = () => {
    setShowUserMenu(false);
    onLogout();
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={onToggleSidebar}
            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all duration-200 text-gray-600"
            title="Toggle sidebar"
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <img src="/hazartrack-logo.png" alt="HazardTrack" className="w-8 h-8" />
          <h1 className="text-xl font-bold text-primary">HazardTrack Dashboard</h1>
        </div>

        <div className="flex items-center space-x-4">
          {/* Partnership logos */}
          <div className="hidden md:flex items-center space-x-2 text-xs text-gray-500">
            <span>In partnership with</span>
            <img src="/tagudin-logo.png" alt="Tagudin LGU" className="w-6 h-6" />
            <img src="/bfp-logo.png" alt="BFP" className="w-6 h-6" />
          </div>

          {/* Search input - hide on mobile when sidebar is open
          {(!isMobile || !sidebarOpen) && (
            <div className="relative">
              <input
                type="text"
                placeholder="Search reports..."
                className="px-4 py-2 pl-10 bg-neutral-50 border border-gray-200 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              />
              <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          )} */}

          {/* Notifications - hide on mobile when sidebar is open */}
          {(!isMobile || !sidebarOpen) && (
            <NotificationsDropdown user={user} />
          )}

          {/* User menu */}
          <div className="relative">
            <button
              onClick={handleUserMenuToggle}
              className="flex items-center space-x-3 p-1 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all duration-200 text-gray-600"
            >
              <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center text-sm font-bold text-white">
                {getUserInitials(user?.fullname)}
              </div>
              <div className="hidden md:block text-left">
                <div className="text-sm font-medium">{user?.fullname}</div>
                <div className="text-xs text-gray-500">
                  {user?.role === 'admin' ? 'Administrator' : 'BFP Personnel'}
                </div>
              </div>
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                <div className="p-4">
                  <div className="font-medium text-gray-800 mb-1">{user?.fullname}</div>
                  <div className="text-sm text-gray-500 mb-4">{user?.email}</div>

                  <div className="border-t border-gray-200 pt-4">
                    <button
                      onClick={handleLogoutClick}
                      className="w-full flex items-center px-3 py-2 text-sm text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-md transition-colors duration-200"
                    >
                      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" className="mr-3">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Overlay for closing dropdown when clicking outside */}
      {showUserMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </header>
  );
};

export default Header;
