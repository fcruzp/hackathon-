import { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores/auth-store';
import { useLanguageStore } from '../../stores/language-store';
import { Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { translations } from '../../translations';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabase';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const { login } = useAuthStore();
  const { language } = useLanguageStore();
  const t = translations[language].auth.login;

  useEffect(() => {
    async function fetchLogo() {
      const { data, error } = await supabase.storage
        .from('user-images')
        .list('logos');
      if (error || !data || data.length === 0) {
        setLogoUrl(null);
        return;
      }
      const logoFile = data[0];
      const { data: { publicUrl } } = supabase.storage
        .from('user-images')
        .getPublicUrl(`logos/${logoFile.name}`);
      setLogoUrl(publicUrl);
    }
    fetchLogo();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(email, password);
      toast.success('Login successful!');
    } catch (err) {
      console.error('Login error:', err);
      toast.error(t.error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="flex flex-col md:flex-row items-center justify-center gap-0 md:gap-0 bg-transparent">
        {/* Card Logo */}
        <div className="flex flex-col items-center justify-center bg-white dark:bg-gray-800 rounded-l-lg md:rounded-l-2xl md:rounded-r-none shadow-xl p-10 w-full md:w-[340px] h-[420px] relative z-10">
          <div className="flex flex-col items-center justify-center h-full w-full">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt="Logo"
                className="h-28 w-28 object-contain rounded bg-white shadow-lg border border-gray-200 dark:border-gray-700 mb-4 animate-fade-in"
                style={{ minWidth: 96, minHeight: 96 }}
              />
            ) : (
              <Building2 className="h-20 w-20 text-primary-600 mb-4" />
            )}
            <h2 className="text-2xl font-bold text-center text-primary-600 dark:text-primary-400 mt-2">
              {t.title}
            </h2>
          </div>
        </div>
        {/* Separador vertical animado */}
        <div className="hidden md:flex h-[340px] w-1 relative">
          <div className="absolute left-1/2 top-0 h-full w-1 -translate-x-1/2 bg-gradient-to-b from-primary-400 via-primary-200 to-primary-600 dark:from-primary-700 dark:via-primary-400 dark:to-primary-900 animate-gradient-move rounded-full shadow-lg" style={{backgroundSize: '200% 200%'}} />
        </div>
        {/* Card Login */}
        <div className="flex flex-col justify-center bg-white dark:bg-gray-800 rounded-r-lg md:rounded-r-2xl md:rounded-l-none shadow-xl p-10 w-full md:w-[340px] h-[420px] relative z-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t.email}
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t.password}
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? t.loading : t.submit}
            </button>
          </form>
          <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
            {t.noAccount}{' '}
            <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500">
              {t.register}
            </Link>
          </p>
        </div>
      </div>
      {/* Animación del gradiente */}
      <style>{`
        @keyframes gradient-move {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient-move {
          animation: gradient-move 3s ease-in-out infinite;
        }
        .animate-fade-in {
          animation: fade-in 1s ease;
        }
        @keyframes fade-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}