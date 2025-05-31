import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, Building2, Sun, Moon, Settings, LogOut } from 'lucide-react';
import { useLanguageStore } from '../../stores/language-store';
import { useAuthStore } from '../../stores/auth-store';
import { useThemeStore } from '../../stores/theme-store';
import { translations } from '../../translations';

interface HeaderProps {
  logoUrl: string | null;
}

// Simple toast para feedback
function Toast({ message, type }: { message: string; type: 'success' | 'error' }) {
  return (
    <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded shadow-lg text-white ${type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>{message}</div>
  );
}

export default function Header({ logoUrl }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { language } = useLanguageStore();
  const { user, logout } = useAuthStore();
  const { isDark, toggleTheme } = useThemeStore();
  const location = useLocation();
  const t = translations[language].layout;

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const handleUserMenuToggle = () => setIsUserMenuOpen((open) => !open);
  const handleUserMenuClose = () => setIsUserMenuOpen(false);

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex flex-1" />
          <div className="flex items-center ml-auto space-x-4 relative">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            {user && (
              <>
                <span className="text-base text-gray-900 dark:text-white font-medium">
                  {user.firstName} {user.lastName} ({user.role.charAt(0).toUpperCase() + user.role.slice(1)})
                </span>
                <div className="relative">
                  <button
                    onClick={handleUserMenuToggle}
                    className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {user.firstName[0]}{user.lastName[0]}
                  </button>
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 border border-gray-200 dark:border-gray-700">
                      <Link
                        to="/settings"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={handleUserMenuClose}
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        {t.userMenu.settings}
                      </Link>
                      <button
                        onClick={() => { logout(); handleUserMenuClose(); }}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        {t.userMenu.logout}
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
          <div className="-mr-2 flex items-center sm:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            <Link
              to="/dashboard"
              className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                isActive('/dashboard')
                  ? 'border-primary-500 text-primary-700 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-transparent text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              {t.navigation.dashboard}
            </Link>
            <Link
              to="/vehicles"
              className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                isActive('/vehicles')
                  ? 'border-primary-500 text-primary-700 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-transparent text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              {t.navigation.vehicles}
            </Link>
            <Link
              to="/users"
              className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                isActive('/users')
                  ? 'border-primary-500 text-primary-700 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-transparent text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              {t.navigation.users}
            </Link>
            <Link
              to="/maintenance"
              className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                isActive('/maintenance')
                  ? 'border-primary-500 text-primary-700 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-transparent text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              {t.navigation.maintenance}
            </Link>
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center px-4">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center text-white">
                  {user?.email?.[0].toUpperCase()}
                </div>
              </div>
              <div className="ml-3">
                <div className="text-base font-medium text-gray-800 dark:text-white">
                  {user?.email}
                </div>
              </div>
            </div>
            <div className="mt-3 space-y-1">
              <Link
                to="/settings"
                className="block px-4 py-2 text-base font-medium text-gray-500 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {t.userMenu.settings}
              </Link>
              <button
                onClick={logout}
                className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {t.userMenu.logout}
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
} 