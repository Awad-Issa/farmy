'use client';

/**
 * Sidebar navigation component
 * Includes role-based menu items
 */

import { useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  PawPrint,
  Heart,
  Weight,
  Milk,
  TrendingUp,
  Package,
  Bell,
  FileText,
  Settings,
  Shield,
} from 'lucide-react';
import { clearAuth } from '@/lib/trpc';

const menuItems = [
  { key: 'dashboard', href: '/dashboard', icon: LayoutDashboard },
  { key: 'animals', href: '/animals', icon: PawPrint },
  { key: 'breeding', href: '/breeding', icon: Heart },
  { key: 'health', href: '/health', icon: Heart },
  { key: 'weights', href: '/weights', icon: Weight },
  { key: 'milk', href: '/milk', icon: Milk },
  { key: 'sales', href: '/sales', icon: TrendingUp },
  { key: 'inventory', href: '/inventory', icon: Package },
  { key: 'insights', href: '/insights', icon: Bell },
  { key: 'reports', href: '/reports', icon: FileText },
  { key: 'settings', href: '/settings', icon: Settings },
  { key: 'ops', href: '/ops', icon: Shield, roleRequired: 'SUPER_ADMIN' },
];

export function Sidebar() {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const router = useRouter();

  // Extract locale from pathname
  const locale = pathname.split('/')[1] || 'en';

  const handleLogout = () => {
    clearAuth();
    router.push(`/${locale}/login`);
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-primary-700">🐑 Farmy</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const fullPath = `/${locale}${item.href}`;
          const isActive = pathname === fullPath;
          
          return (
            <a
              key={item.key}
              href={fullPath}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                ${
                  isActive
                    ? 'bg-primary-50 text-primary-700 font-medium'
                    : 'text-gray-900 hover:bg-gray-50 hover:text-gray-900'
                }
              `}
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm">{t(item.key)}</span>
            </a>
          );
        })}
      </nav>

      {/* User section */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="w-full text-left px-4 py-3 text-gray-900 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors text-sm"
        >
          {t('logout')}
        </button>
      </div>
    </aside>
  );
}

