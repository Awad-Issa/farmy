'use client';

/**
 * Dashboard page
 * Shows key metrics and recent activity
 */

import { useTranslations } from 'next-intl';
import { trpc } from '@/lib/trpc';
import { LayoutDashboard, PawPrint, Heart, TrendingUp } from 'lucide-react';

export default function DashboardPage() {
  const t = useTranslations('dashboard');

  // Fetch dashboard data (placeholder - will be implemented with actual API)
  const { data: stats, isLoading } = trpc.reports.dashboard.useQuery(
    {},
    {
      // Mock data for now
      enabled: false,
    }
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">{t('welcome')}...</div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">{t('title')}</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Animals */}
        <div className="card flex items-start gap-4">
          <div className="p-3 bg-primary-100 rounded-lg">
            <PawPrint className="w-6 h-6 text-primary-700" />
          </div>
          <div>
            <p className="text-sm text-gray-600">{t('totalAnimals')}</p>
            <p className="text-2xl font-bold text-gray-900">0</p>
          </div>
        </div>

        {/* Active Breeding */}
        <div className="card flex items-start gap-4">
          <div className="p-3 bg-success-100 rounded-lg">
            <Heart className="w-6 h-6 text-success-700" />
          </div>
          <div>
            <p className="text-sm text-gray-600">{t('activeBreeding')}</p>
            <p className="text-2xl font-bold text-gray-900">0</p>
          </div>
        </div>

        {/* Health Events */}
        <div className="card flex items-start gap-4">
          <div className="p-3 bg-warning-100 rounded-lg">
            <Heart className="w-6 h-6 text-warning-700" />
          </div>
          <div>
            <p className="text-sm text-gray-600">{t('healthEvents')}</p>
            <p className="text-2xl font-bold text-gray-900">0</p>
          </div>
        </div>

        {/* Sales */}
        <div className="card flex items-start gap-4">
          <div className="p-3 bg-danger-100 rounded-lg">
            <TrendingUp className="w-6 h-6 text-danger-700" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Sales</p>
            <p className="text-2xl font-bold text-gray-900">$0</p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          {t('recentActivity')}
        </h2>
        <div className="text-gray-500 text-center py-8">
          No recent activity
        </div>
      </div>
    </div>
  );
}

