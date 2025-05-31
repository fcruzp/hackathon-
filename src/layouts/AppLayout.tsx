import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../stores/auth-store';
import { useThemeStore } from '../stores/theme-store';
import { useLanguageStore } from '../stores/language-store';
import { Building2, Calendar, Car, LayoutDashboard, LogOut, Menu, Moon, Settings, Sun, Users2, PenTool as Tool, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { translations } from '../translations';
import ChatGeminiAI from '../components/shared/ChatGeminiAI';
import Header from '../components/layout/Header';
import { supabase } from '../lib/supabase';

export default function AppLayout() {
  const { user, logout } = useAuthStore();
  const { isDark, toggleTheme } = useThemeStore();
  const { language } = useLanguageStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const location = useLocation();
  const t = translations[language];
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  // Close sidebar when route changes on mobile
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location]);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const sidebar = document.getElementById('sidebar');
      const menuButton = document.getElementById('menu-button');
      if (
        isSidebarOpen &&
        sidebar &&
        !sidebar.contains(event.target as Node) &&
        menuButton &&
        !menuButton.contains(event.target as Node)
      ) {
        setIsSidebarOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSidebarOpen]);

  useEffect(() => {
    async function fetchLogo() {
      // Buscar el primer archivo que haya en el folder logos
      const { data, error } = await supabase.storage
        .from('user-images')
        .list('logos');
      if (error || !data || data.length === 0) {
        setLogoUrl(null);
        return;
      }
      // Usar el primer archivo encontrado
      const logoFile = data[0];
      const { data: { publicUrl } } = supabase.storage
        .from('user-images')
        .getPublicUrl(`logos/${logoFile.name}`);
      setLogoUrl(publicUrl);
    }
    fetchLogo();
  }, [location]);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const navigation = [
    { name: t.layout.navigation.dashboard, href: '/dashboard', icon: LayoutDashboard },
    { name: t.layout.navigation.vehicles, href: '/vehicles', icon: Car },
    { name: t.layout.navigation.users, href: '/users', icon: Users2 },
    { name: t.layout.navigation.maintenance, href: '/maintenance', icon: Calendar, exact: true },
    { name: 'Service Providers', href: '/maintenance/service-providers', icon: Tool },
  ];

  const isActive = (path: string, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className={`min-h-screen ${isDark ? 'dark' : ''}`}>
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        {/* Mobile sidebar backdrop */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div
          id="sidebar"
          className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:relative lg:transform-none`}
        >
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-between h-16 px-4 border-b dark:border-gray-700">
              <Link to="/dashboard" className="flex items-center space-x-2">
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt="Logo"
                    className="h-8 w-8 object-contain rounded bg-white shadow"
                    style={{ minWidth: 32, minHeight: 32 }}
                  />
                ) : (
                  <Building2 className="h-8 w-8 text-primary-600" />
                )}
                <span className="text-xl font-semibold text-gray-900 dark:text-white">{t.layout.appName}</span>
              </Link>
              <button
                className="lg:hidden p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => setIsSidebarOpen(false)}
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      isActive(item.href, item.exact)
                        ? 'bg-primary-50 dark:bg-primary-900 text-primary-700 dark:text-primary-100'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header logoUrl={logoUrl} />
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-gray-900">
            <Outlet />
          </main>
        </div>
      </div>
      <ChatGeminiAI />
    </div>
  );
}