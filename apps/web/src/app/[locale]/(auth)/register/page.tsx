'use client';

/**
 * Register page
 * Create new user account with phone + password
 */

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { trpc } from '@/lib/trpc';
import { setAuthToken, setRefreshToken, setCurrentFarmId } from '@/lib/trpc';

export default function RegisterPage() {
  const t = useTranslations('auth');
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: async (data) => {
      // Store tokens
      setAuthToken(data.accessToken);
      setRefreshToken(data.refreshToken);
      
      // Store user data
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Store farm ID (automatically created during registration)
      if (data.farm) {
        setCurrentFarmId(data.farm.id);
      }
      
      // Redirect to dashboard
      router.push(`/${locale}/dashboard`);
    },
    onError: (err) => {
      console.error('Registration failed:', err);
      setError(err.message || t('registrationFailed'));
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!phone || !password) {
      setError(t('phonePasswordRequired'));
      return;
    }

    if (password.length < 8) {
      setError(t('passwordTooShort'));
      return;
    }

    if (password !== confirmPassword) {
      setError(t('passwordMismatch'));
      return;
    }

    // Call register mutation
    registerMutation.mutate({ 
      phone, 
      password,
      name: name || undefined, // Optional name
    });
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        {t('registerTitle')}
      </h2>
      <p className="text-gray-600 mb-6">{t('registerSubtitle')}</p>

      {error && (
        <div className="bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name input (optional) */}
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            {t('name')} <span className="text-gray-500 text-xs">({t('optional')})</span>
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('namePlaceholder')}
            className="input-field"
            autoComplete="name"
          />
        </div>

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
            placeholder="+970 5X XXX XXXX"
            className="input-field"
            required
            autoComplete="tel"
          />
          <p className="text-xs text-gray-500 mt-1">{t('phoneHint')}</p>
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
            autoComplete="new-password"
          />
          <p className="text-xs text-gray-500 mt-1">{t('passwordHint')}</p>
        </div>

        {/* Confirm Password input */}
        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            {t('confirmPassword')}
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            className="input-field"
            required
            autoComplete="new-password"
          />
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={registerMutation.isPending}
          className="btn-primary w-full"
        >
          {registerMutation.isPending ? t('loading') : t('register')}
        </button>
      </form>

      {/* Login link */}
      <div className="mt-6 text-center text-sm text-gray-600">
        {t('haveAccount')}{' '}
        <a href={`/${locale}/login`} className="text-primary-600 hover:text-primary-700 font-medium">
          {t('login')}
        </a>
      </div>
    </div>
  );
}

