import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import { useAuthStore } from '../../stores/auth-store';
import { useLanguageStore } from '../../stores/language-store';
import { translations } from '../../translations';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabase';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuthStore();
  const { language } = useLanguageStore();
  const t = translations[language].auth.register;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    // Client-side validation
    if (password.length < 6) {
      setError(t.validation.passwordLength);
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError(t.passwordMismatch);
      setIsLoading(false);
      return;
    }

    try {
      // First, create the auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      if (!authData.user) {
        throw new Error('No user data returned from registration');
      }

      // Create the user profile
      const { error: profileError } = await supabase
        .from('users')
        .insert([
          {
            id: authData.user.id,
            email: authData.user.email,
            first_name: email.split('@')[0], // Temporary name until profile is updated
            last_name: '',
            role: 'staff', // Default role
          }
        ]);

      if (profileError) {
        throw profileError;
      }

      toast.success('Registration successful!');
      navigate('/dashboard');
    } catch (err) {
      console.error('Registration error:', err);
      if (err instanceof Error) {
        if (err.message.includes('row-level security')) {
          setError('Registration failed. Please try again.');
        } else {
          setError(t.validation.serverError);
        }
      } else {
        setError(t.validation.serverError);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg p-8">
      <div className="flex justify-center mb-8">
        <UserPlus className="h-12 w-12 text-primary-600" />
      </div>
      
      <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-8">
        {t.title}
      </h2>

      {error && (
        <div className="mb-4 p-4 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t.email}
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t.password}
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t.confirmPassword}
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
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

        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
          {t.hasAccount}{' '}
          <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
            {t.login}
          </Link>
        </p>
      </form>
    </div>
  );
}