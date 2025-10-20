'use client';

/**
 * Animal detail page with tabs
 * Shows animal information and related records
 */

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { trpc } from '@/lib/trpc';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

type Tab = 'details' | 'breeding' | 'health' | 'weight' | 'milk' | 'sales';

export default function AnimalDetailPage() {
  const t = useTranslations('animals');
  const params = useParams();
  const animalId = params.id as string;
  
  const [activeTab, setActiveTab] = useState<Tab>('details');

  // Fetch animal data
  const { data: animal, isLoading } = trpc.animals.get.useQuery(
    {
      id: animalId,
    },
    {
      // Mock for now
      enabled: false,
    }
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!animal) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Animal not found</p>
        <Link href="/animals" className="text-primary-600 hover:text-primary-700 mt-4 inline-block">
          Back to Animals
        </Link>
      </div>
    );
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: 'details', label: t('tabs.details') },
    { key: 'breeding', label: t('tabs.breeding') },
    { key: 'health', label: t('tabs.health') },
    { key: 'weight', label: t('tabs.weight') },
    { key: 'milk', label: t('tabs.milk') },
    { key: 'sales', label: t('tabs.sales') },
  ];

  return (
    <div>
      {/* Back button */}
      <Link
        href="/animals"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Animals
      </Link>

      {/* Header */}
      <div className="card mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {animal?.tagNumber || `Animal #${animalId}`}
            </h1>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>{animal?.type || 'Sheep'}</span>
              <span>•</span>
              <span>{animal?.breed || 'Awassi'}</span>
              <span>•</span>
              <span>{animal?.gender || 'Female'}</span>
            </div>
          </div>

          <button className="btn-primary">Edit</button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <div className="flex gap-6">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`pb-3 px-1 border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-primary-600 text-primary-700 font-medium'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="card">
        {activeTab === 'details' && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Animal Details
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Tag Number</p>
                <p className="text-gray-900 font-medium">{animal?.tagNumber || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">RFID</p>
                <p className="text-gray-900 font-medium">{animal?.rfid || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Birth Date</p>
                <p className="text-gray-900 font-medium">{animal?.birthDate || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <p className="text-gray-900 font-medium">{animal?.status || '-'}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'breeding' && (
          <div className="text-center py-8 text-gray-500">
            Breeding records will appear here
          </div>
        )}

        {activeTab === 'health' && (
          <div className="text-center py-8 text-gray-500">
            Health records will appear here
          </div>
        )}

        {activeTab === 'weight' && (
          <div className="text-center py-8 text-gray-500">
            Weight records will appear here
          </div>
        )}

        {activeTab === 'milk' && (
          <div className="text-center py-8 text-gray-500">
            Milk records will appear here
          </div>
        )}

        {activeTab === 'sales' && (
          <div className="text-center py-8 text-gray-500">
            Sales records will appear here
          </div>
        )}
      </div>
    </div>
  );
}

