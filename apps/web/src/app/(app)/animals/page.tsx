'use client';

/**
 * Animals list page
 * Search, filter, and manage animals
 */

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Plus, Search } from 'lucide-react';
import Link from 'next/link';

export default function AnimalsPage() {
  const t = useTranslations('animals');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch animals list
  const { data: animals, isLoading } = trpc.animals.list.useQuery(
    {
      q: searchQuery || undefined,
      limit: 50,
    },
    {
      // Mock for now
      enabled: false,
    }
  );

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
        
        <button className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          {t('addAnimal')}
        </button>
      </div>

      {/* Search and filters */}
      <div className="card mb-6">
        <div className="flex gap-4">
          {/* Search input */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('search') + '...'}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            />
          </div>

          {/* Filter buttons */}
          <button className="btn-secondary">
            Filter
          </button>
        </div>
      </div>

      {/* Animals Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  {t('tagNumber')}
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  {t('rfid')}
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  {t('type')}
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  {t('breed')}
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  {t('gender')}
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  {t('status')}
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : !animals || animals.items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-500">
                    No animals found. Add your first animal to get started.
                  </td>
                </tr>
              ) : (
                animals.items.map((animal) => (
                  <tr key={animal.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm">
                      <Link
                        href={`/animals/${animal.id}`}
                        className="text-primary-600 hover:text-primary-700 font-medium"
                      >
                        {animal.tagNumber}
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900">
                      {animal.rfid || '-'}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900">
                      {animal.type}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900">
                      {animal.breed || '-'}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900">
                      {animal.gender}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          animal.status === 'ACTIVE'
                            ? 'bg-success-100 text-success-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {animal.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <button className="text-primary-600 hover:text-primary-700">
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

