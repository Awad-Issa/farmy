'use client';

/**
 * Dashboard page
 * Shows key metrics and recent activity
 */

import { useTranslations } from 'next-intl';
import { trpc, getCurrentFarmId } from '@/lib/trpc';
import { LayoutDashboard, PawPrint, Heart, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function DashboardPage() {
  const t = useTranslations('dashboard');
  const [farmId, setFarmId] = useState<string | null>(null);

  // Get farm ID from localStorage on mount
  useEffect(() => {
    const id = getCurrentFarmId();
    setFarmId(id);
  }, []);

  // Fetch dashboard data
  const { data: stats, isLoading } = trpc.reports.dashboard.useQuery(
    { farmId: farmId! },
    { enabled: !!farmId }
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">{t('welcome')}...</div>
      </div>
    );
  }

  // Show message if no farm
  if (!farmId) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome to Farmy!</h2>
          <p className="text-gray-600 mb-6">
            It looks like you don't have a farm set up yet. Please contact support or create a farm to get started.
          </p>
        </div>
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
            <p className="text-2xl font-bold text-gray-900">
              {stats?.herd?.total ?? 0}
            </p>
          </div>
        </div>

        {/* Active Breeding */}
        <div className="card flex items-start gap-4">
          <div className="p-3 bg-success-100 rounded-lg">
            <Heart className="w-6 h-6 text-success-700" />
          </div>
          <div>
            <p className="text-sm text-gray-600">{t('activeBreeding')}</p>
            <p className="text-2xl font-bold text-gray-900">
              {stats?.herd?.pregnantEwes ?? 0}
            </p>
          </div>
        </div>

        {/* Health Events */}
        <div className="card flex items-start gap-4">
          <div className="p-3 bg-warning-100 rounded-lg">
            <Heart className="w-6 h-6 text-warning-700" />
          </div>
          <div>
            <p className="text-sm text-gray-600">{t('healthEvents')}</p>
            <p className="text-2xl font-bold text-gray-900">
              {stats?.herd?.recentlySick ?? 0}
            </p>
          </div>
        </div>

        {/* Sales */}
        <div className="card flex items-start gap-4">
          <div className="p-3 bg-danger-100 rounded-lg">
            <TrendingUp className="w-6 h-6 text-danger-700" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Sales</p>
            <p className="text-2xl font-bold text-gray-900">
              ${stats?.sales?.totalRevenue?.toFixed(2) ?? '0.00'}
            </p>
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

