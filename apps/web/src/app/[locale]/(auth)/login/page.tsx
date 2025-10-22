'use client';

/**
 * Login page
 * Phone + password authentication
 */

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { trpc } from '@/lib/trpc';
import { setAuthToken, setRefreshToken, setCurrentFarmId } from '@/lib/trpc';

export default function LoginPage() {
  const t = useTranslations('auth');
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: async (data) => {
      // Store tokens
      setAuthToken(data.accessToken);
      setRefreshToken(data.refreshToken);
      
      // Store user data
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Store farm ID if user has a farm
      if (data.farm) {
        setCurrentFarmId(data.farm.id);
      }
      
      // Redirect to dashboard with locale
      router.push(`/${locale}/dashboard`);
    },
    onError: (err) => {
      console.error('Login failed - Full error:', err);
      console.error('Error message:', err.message);
      console.error('Error data:', err.data);
      setError(err.message || t('invalidCredentials'));
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Basic validation
    if (!phone || !password) {
      setError('Phone and password are required');
      return;
    }

    // Call login mutation
    loginMutation.mutate({ phone, password });
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        {t('loginTitle')}
      </h2>
      <p className="text-gray-600 mb-6">{t('loginSubtitle')}</p>

      {error && (
        <div className="bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Phone input */}
        <div>
          <label
            htmlFor="phone"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            {t('phone')}
          </label>
          <input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+966 5X XXX XXXX"
            className="input-field"
            required
            autoComplete="tel"
          />
        </div>

        {/* Password input */}
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            {t('password')}
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="input-field"
            required
            autoComplete="current-password"
          />
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={loginMutation.isPending}
          className="btn-primary w-full"
        >
          {loginMutation.isPending ? t('loading') : t('login')}
        </button>
      </form>

      {/* Register link */}
      <div className="mt-6 text-center text-sm text-gray-600">
        {t('noAccount')}{' '}
        <a href={`/${locale}/register`} className="text-primary-600 hover:text-primary-700 font-medium">
          {t('register')}
        </a>
      </div>
    </div>
  );
}

