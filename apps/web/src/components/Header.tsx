'use client';

/**
 * Header component with RTL toggle and farm switcher
 */

import { useTranslations, useLocale } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { Globe, ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';

export function Header() {
  const t = useTranslations('settings');
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showFarmMenu, setShowFarmMenu] = useState(false);
  const [currentDir, setCurrentDir] = useState<'ltr' | 'rtl'>('ltr');

  // Get current direction on mount and when it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const dir = document.documentElement.getAttribute('dir') as 'ltr' | 'rtl';
      setCurrentDir(dir || 'ltr');
    }
  }, []);

  // Toggle language (EN/AR)
  const toggleLanguage = (newLocale: string) => {
    // Get current path without locale prefix
    const pathWithoutLocale = pathname.replace(/^\/(en|ar)/, '');
    router.push(`/${newLocale}${pathWithoutLocale}`);
    setShowLangMenu(false);
  };

  // Toggle RTL/LTR
  const toggleDirection = () => {
    if (typeof window !== 'undefined') {
      const html = document.documentElement;
      const currentDir = html.getAttribute('dir');
      const newDir = currentDir === 'rtl' ? 'ltr' : 'rtl';
      html.setAttribute('dir', newDir);
      setCurrentDir(newDir);
    }
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      {/* Page title */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900">
          {/* This would be dynamic based on current page */}
          Dashboard
        </h2>
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-4">
        {/* Farm Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowFarmMenu(!showFarmMenu)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-900"
          >
            <span className="text-sm font-medium">My Farm</span>
            <ChevronDown className="w-4 h-4" />
          </button>

          {showFarmMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-50">
              <button
                className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm text-gray-900"
                onClick={() => {
                  // Switch farm logic
                  setShowFarmMenu(false);
                }}
              >
                Farm 1
              </button>
              <button
                className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm text-gray-900"
                onClick={() => {
                  // Switch farm logic
                  setShowFarmMenu(false);
                }}
              >
                Farm 2
              </button>
            </div>
          )}
        </div>

        {/* Language Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowLangMenu(!showLangMenu)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-900"
          >
            <Globe className="w-4 h-4" />
            <span className="text-sm font-medium uppercase">{locale}</span>
          </button>

          {showLangMenu && (
            <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-50">
              <button
                className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm text-gray-900"
                onClick={() => toggleLanguage('en')}
              >
                English
              </button>
              <button
                className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm text-gray-900"
                onClick={() => toggleLanguage('ar')}
              >
                العربية
              </button>
            </div>
          )}
        </div>

        {/* RTL/LTR Toggle */}
        <button
          onClick={toggleDirection}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-900"
          title={t('direction')}
        >
          {currentDir === 'rtl' ? 'LTR' : 'RTL'}
        </button>
      </div>
    </header>
  );
}

