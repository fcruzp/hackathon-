import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Settings, Moon, Sun, Bell, Shield, User, Globe, Image } from 'lucide-react';
import { useThemeStore } from '../../stores/theme-store';
import { useLanguageStore } from '../../stores/language-store';
import { useAuthStore } from '../../stores/auth-store';
import { translations } from '../../translations';
import ImageUploadModal from '../../components/vehicles/ImageUploadModal';
import LogoUploadModal from '../../components/settings/LogoUploadModal';
import { supabase } from '../../lib/supabase';

export default function SettingsPage() {
  const { isDark, toggleTheme } = useThemeStore();
  const { language, setLanguage } = useLanguageStore();
  const { user } = useAuthStore();
  const t = translations[language].settings;
  const [showImageModal, setShowImageModal] = useState(false);
  const [showLogoModal, setShowLogoModal] = useState(false);
  const [currentLogoUrl, setCurrentLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchCurrentLogo();
  }, []);

  const fetchCurrentLogo = async () => {
    try {
      // Obtener el logo más reciente de la carpeta logos
      const { data, error } = await supabase.storage
        .from('user-images')
        .list('logos', {
          limit: 1,
          sortBy: { column: 'created_at', order: 'desc' }
        });

      if (error) throw error;

      if (data && data.length > 0) {
        const { data: { publicUrl } } = supabase.storage
          .from('user-images')
          .getPublicUrl(`logos/${data[0].name}`);
        setCurrentLogoUrl(publicUrl);
      }
    } catch (err) {
      console.error('Error fetching current logo:', err);
    }
  };

  const handleLogoUploadComplete = (url: string) => {
    setCurrentLogoUrl(url);
  };

  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <Link
          to="/dashboard"
          className="inline-flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Dashboard
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <div className="p-6 border-b dark:border-gray-700">
          <div className="flex items-center">
            <Settings className="h-6 w-6 text-primary-600 dark:text-primary-400 mr-2" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t.title}</h1>
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-6">
            {/* Appearance Section */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t.appearance.title}</h2>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {isDark ? (
                      <Moon className="h-5 w-5 text-gray-600 dark:text-gray-300 mr-3" />
                    ) : (
                      <Sun className="h-5 w-5 text-gray-600 dark:text-gray-300 mr-3" />
                    )}
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{t.appearance.darkMode}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t.appearance.darkModeDesc}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={toggleTheme}
                    className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                    style={{ backgroundColor: isDark ? '#3b82f6' : '#d1d5db' }}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        isDark ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Globe className="h-5 w-5 text-gray-600 dark:text-gray-300 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{t.appearance.language}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t.appearance.languageDesc}
                      </p>
                    </div>
                  </div>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as 'en' | 'es')}
                    className="border border-gray-300 dark:border-gray-600 rounded-md p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="en">{t.appearance.english}</option>
                    <option value="es">{t.appearance.spanish}</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Notifications Section */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t.notifications.title}</h2>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Bell className="h-5 w-5 text-gray-600 dark:text-gray-300 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{t.notifications.emailNotifications}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t.notifications.emailNotificationsDesc}
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600" />
                  </label>
                </div>
              </div>
            </div>

            {/* Security Section */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t.security.title}</h2>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-4">
                <div className="flex items-center">
                  <Shield className="h-5 w-5 text-gray-600 dark:text-gray-300 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{t.security.twoFactor}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {t.security.twoFactorDesc}
                    </p>
                    <button className="mt-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 text-sm">
                      {t.security.enable2FA}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Account Section */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t.account.title}</h2>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-4">
                <div className="flex items-center">
                  <User className="h-5 w-5 text-gray-600 dark:text-gray-300 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{t.account.profileInfo}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {t.account.profileInfoDesc}
                    </p>
                    <button
                      className="mt-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 text-sm"
                      onClick={() => setShowImageModal(true)}
                    >
                      {t.account.editProfile}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Branding Section */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t.branding.title}</h2>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-4">
                <div className="flex items-center">
                  <Image className="h-5 w-5 text-gray-600 dark:text-gray-300 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{t.branding.logo}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {t.branding.logoDesc}
                    </p>
                    <button
                      className="mt-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 text-sm"
                      onClick={() => setShowLogoModal(true)}
                    >
                      {t.branding.uploadLogo}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ImageUploadModal
        isOpen={showImageModal}
        onClose={() => setShowImageModal(false)}
        bucket="user-images"
        folder="vehicles"
      />

      <LogoUploadModal
        isOpen={showLogoModal}
        onClose={() => setShowLogoModal(false)}
        onUploadComplete={handleLogoUploadComplete}
        currentLogoUrl={currentLogoUrl}
      />
    </div>
  );
}