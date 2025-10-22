'use client';

/**
 * Animal detail page with tabs
 * Shows animal information and related records
 */

import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { trpc, getCurrentFarmId } from '@/lib/trpc';
import { ArrowLeft, Calendar, Activity, Weight, Droplet, DollarSign, Heart, Syringe, Plus } from 'lucide-react';
import Link from 'next/link';

type Tab = 'details' | 'breeding' | 'health' | 'weight' | 'milk' | 'sales';

export default function AnimalDetailPage() {
  const t = useTranslations('animals');
  const tCommon = useTranslations('common');
  const params = useParams();
  const animalId = params.id as string;
  const locale = params.locale as string;
  
  const [activeTab, setActiveTab] = useState<Tab>('details');
  const [farmId, setFarmId] = useState<string | null>(null);

  // Get farm ID from localStorage on mount
  useEffect(() => {
    const id = getCurrentFarmId();
    setFarmId(id);
  }, []);

  // Fetch animal data
  const { data: animal, isLoading } = trpc.animals.get.useQuery(
    {
      id: animalId,
      farmId: farmId!,
    },
    { enabled: !!farmId }
  );

  // Fetch breeding cycles with events for this specific animal
  const { data: animalBreedingCycles } = trpc.breeding.cycles.list.useQuery(
    {
      farmId: farmId!,
      limit: 50,
    },
    { 
      enabled: !!farmId && activeTab === 'breeding',
      select: (data) => {
        // Filter cycles where this animal is the ewe
        return data.items.filter((cycle: any) => cycle.eweId === animalId);
      }
    }
  );

  // Fetch breeding cycles
  const { data: breedingData } = trpc.breeding.cycles.list.useQuery(
    {
      farmId: animal?.farmId || '',
      limit: 10,
    },
    { enabled: !!animal?.farmId && activeTab === 'breeding' }
  );

  // Fetch health events
  const { data: healthData } = trpc.health.events.list.useQuery(
    {
      farmId: animal?.farmId || '',
      animalId: animalId,
      limit: 20,
    },
    { enabled: !!animal?.farmId && activeTab === 'health' }
  );

  // Fetch weights
  const { data: weightsData } = trpc.weights.list.useQuery(
    {
      farmId: animal?.farmId || '',
      animalId: animalId,
      limit: 20,
    },
    { enabled: !!animal?.farmId && activeTab === 'weight' }
  );

  // Fetch milk yields
  const { data: milkData } = trpc.milk.yields.list.useQuery(
    {
      farmId: animal?.farmId || '',
      animalId: animalId,
      limit: 20,
    },
    { enabled: !!animal?.farmId && activeTab === 'milk' }
  );

  // Fetch sales
  const { data: salesData } = trpc.sales.list.useQuery(
    {
      farmId: animal?.farmId || '',
      animalId: animalId,
      limit: 10,
    },
    { enabled: !!animal?.farmId && activeTab === 'sales' }
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">{tCommon('loading')}</div>
      </div>
    );
  }

  if (!animal && !isLoading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Animal not found</p>
        <Link href={`/${locale}/animals`} className="text-primary-600 hover:text-primary-700 mt-4 inline-block">
          Back to Animals
        </Link>
      </div>
    );
  }

  const tabs: { key: Tab; label: string; icon: any }[] = [
    { key: 'details', label: t('tabs.details'), icon: Activity },
    { key: 'breeding', label: t('tabs.breeding'), icon: Heart },
    { key: 'health', label: t('tabs.health'), icon: Syringe },
    { key: 'weight', label: t('tabs.weight'), icon: Weight },
    { key: 'milk', label: t('tabs.milk'), icon: Droplet },
    { key: 'sales', label: t('tabs.sales'), icon: DollarSign },
  ];

  // Calculate age
  const calculateAge = (dob: Date | string) => {
    const now = new Date();
    const birth = new Date(dob);
    const months = (now.getFullYear() - birth.getFullYear()) * 12 + now.getMonth() - birth.getMonth();
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    if (years > 0) {
      return `${years}y ${remainingMonths}m`;
    }
    return `${remainingMonths}m`;
  };

  return (
    <div>
      {/* Back button */}
      <Link
        href={`/${locale}/animals`}
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Animals
      </Link>

      {/* Header */}
      <div className="card mb-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <h1 className="text-3xl font-bold text-gray-900">
                {animal?.tagNumber || `Animal #${animalId}`}
              </h1>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  animal?.status === 'ACTIVE'
                    ? 'bg-success-100 text-success-700'
                    : animal?.status === 'SOLD'
                    ? 'bg-gray-100 text-gray-700'
                    : 'bg-error-100 text-error-700'
                }`}
              >
                {animal?.status}
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Type</p>
                <p className="font-medium text-gray-900">{animal?.type || '-'}</p>
              </div>
              <div>
                <p className="text-gray-600">Sex</p>
                <p className="font-medium text-gray-900">{animal?.sex || '-'}</p>
              </div>
              <div>
                <p className="text-gray-600">Age</p>
                <p className="font-medium text-gray-900">
                  {animal?.dob ? calculateAge(animal.dob) : '-'}
                </p>
              </div>
            </div>
          </div>

          <button className="btn-primary">
            {tCommon('edit')}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <div className="flex gap-6 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`pb-3 px-1 border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
                  activeTab === tab.key
                    ? 'border-primary-600 text-primary-700 font-medium'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="card">
        {activeTab === 'details' && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Animal Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900 text-lg">Basic Information</h3>
                <div className="space-y-3">
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
                    <p className="text-gray-900 font-medium">
                      {animal?.dob ? new Date(animal.dob).toLocaleDateString() : '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Breed</p>
                    <p className="text-gray-900 font-medium">-</p>
                  </div>
                </div>
              </div>

              {/* Parentage */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900 text-lg">Parentage</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Sire (Father)</p>
                    <p className="text-gray-900 font-medium">
                      {animal?.sire?.tagNumber || '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Dam (Mother)</p>
                    <p className="text-gray-900 font-medium">
                      {animal?.dam?.tagNumber || '-'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Latest Records */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900 text-lg">Latest Records</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Latest Weight</p>
                    <p className="text-gray-900 font-medium">
                      {animal?.weights?.[0]
                        ? `${animal.weights[0].kg} kg (${new Date(animal.weights[0].date).toLocaleDateString()})`
                        : 'No records'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Health Events</p>
                    <p className="text-gray-900 font-medium">
                      {animal?.healthEvents?.length || 0} events
                    </p>
                  </div>
                </div>
              </div>

              {/* Offspring */}
              {(animal?.offspringAsSire?.length || animal?.offspringAsDam?.length) ? (
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900 text-lg">Offspring</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">As Sire</p>
                      <p className="text-gray-900 font-medium">
                        {animal?.offspringAsSire?.length || 0} offspring
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">As Dam</p>
                      <p className="text-gray-900 font-medium">
                        {animal?.offspringAsDam?.length || 0} offspring
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        )}

        {activeTab === 'breeding' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Breeding Records
              </h2>
              <button className="btn-primary flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add Breeding
              </button>
            </div>
            
            {animalBreedingCycles && animalBreedingCycles.length > 0 ? (
              <div className="space-y-4">
                {animalBreedingCycles.map((cycle: any) => {
                  // Find the lambing event for this cycle
                  const lambingEvent = cycle.events?.find((e: any) => e.type === 'LAMBING');
                  const lambingPayload = lambingEvent?.payload as any;
                  
                  return (
                    <div key={cycle.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              cycle.status === 'PREGNANT'
                                ? 'bg-primary-100 text-primary-700'
                                : cycle.status === 'LAMBED'
                                ? 'bg-success-100 text-success-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {cycle.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          {new Date(cycle.ins1Date).toLocaleDateString()}
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                        <div>
                          <p className="text-gray-600">Insemination Date</p>
                          <p className="font-medium text-gray-900">
                            {new Date(cycle.ins1Date).toLocaleDateString()}
                          </p>
                        </div>
                        {cycle.estDue && (
                          <div>
                            <p className="text-gray-600">Est. Due Date</p>
                            <p className="font-medium text-gray-900">
                              {new Date(cycle.estDue).toLocaleDateString()}
                            </p>
                          </div>
                        )}
                        {lambingEvent && (
                          <div>
                            <p className="text-gray-600">Lambing Date</p>
                            <p className="font-medium text-gray-900">
                              {new Date(lambingEvent.date).toLocaleDateString()}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Lamb Details Section */}
                      {cycle.status === 'LAMBED' && lambingPayload && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <h4 className="font-medium text-gray-900 mb-3">Lamb Details</h4>
                          
                          {/* Summary Stats */}
                          <div className="grid grid-cols-3 gap-3 mb-4">
                            <div className="bg-success-50 rounded-lg p-3">
                              <p className="text-xs text-success-700 mb-1">Total Lambs</p>
                              <p className="text-xl font-bold text-success-900">
                                {lambingPayload.totalCount || 0}
                              </p>
                            </div>
                            <div className="bg-blue-50 rounded-lg p-3">
                              <p className="text-xs text-blue-700 mb-1">Live Lambs</p>
                              <p className="text-xl font-bold text-blue-900">
                                {(lambingPayload.maleCount || 0) + (lambingPayload.femaleCount || 0)}
                              </p>
                            </div>
                            {lambingPayload.stillbornCount > 0 && (
                              <div className="bg-gray-50 rounded-lg p-3">
                                <p className="text-xs text-gray-700 mb-1">Stillborn</p>
                                <p className="text-xl font-bold text-gray-900">
                                  {lambingPayload.stillbornCount}
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Individual Lamb Details */}
                          {lambingPayload.lambs && lambingPayload.lambs.length > 0 && (
                            <div className="space-y-2">
                              <p className="text-sm font-medium text-gray-700 mb-2">Individual Lambs:</p>
                              <div className="grid grid-cols-1 gap-2">
                                {lambingPayload.lambs.map((lamb: any, index: number) => (
                                  <div 
                                    key={index} 
                                    className={`flex items-center justify-between p-2 rounded ${
                                      lamb.isStillborn 
                                        ? 'bg-gray-50 border border-gray-200' 
                                        : 'bg-blue-50 border border-blue-200'
                                    }`}
                                  >
                                    <div className="flex items-center gap-3">
                                      <span className="text-sm font-medium text-gray-900">
                                        #{index + 1}
                                      </span>
                                      {!lamb.isStillborn && lamb.tagNumber && (
                                        <span className="px-2 py-1 bg-white rounded border border-gray-300 text-sm font-mono">
                                          {lamb.tagNumber}
                                        </span>
                                      )}
                                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                                        lamb.sex === 'MALE' 
                                          ? 'bg-blue-100 text-blue-700' 
                                          : 'bg-pink-100 text-pink-700'
                                      }`}>
                                        {lamb.sex === 'MALE' ? 'Male' : 'Female'}
                                      </span>
                                      {lamb.isStillborn && (
                                        <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs font-medium">
                                          Stillborn
                                        </span>
                                      )}
                                    </div>
                                    {!lamb.isStillborn && lamb.tagNumber && (
                                      <Link 
                                        href={`/${locale}/animals?search=${lamb.tagNumber}`}
                                        className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                                      >
                                        View Animal →
                                      </Link>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Notes */}
                          {lambingPayload.notes && (
                            <div className="mt-3 p-3 bg-gray-50 rounded">
                              <p className="text-xs text-gray-600 mb-1">Notes:</p>
                              <p className="text-sm text-gray-900">{lambingPayload.notes}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Heart className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p>No breeding records yet</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'health' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Health Records
              </h2>
              <button className="btn-primary flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add Health Event
              </button>
            </div>
            
            {healthData?.items && healthData.items.length > 0 ? (
              <div className="space-y-4">
                {healthData.items.map((event: any) => (
                  <div key={event.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-medium text-gray-900">{event.type}</h3>
                        <p className="text-sm text-gray-600 mt-1">{event.description || '-'}</p>
                      </div>
                      <p className="text-sm text-gray-600">
                        {new Date(event.date).toLocaleDateString()}
                      </p>
                    </div>
                    {event.treatments && event.treatments.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-sm font-medium text-gray-700 mb-2">Treatments:</p>
                        <div className="space-y-2">
                          {event.treatments.map((treatment: any) => (
                            <div key={treatment.id} className="text-sm text-gray-600">
                              • {treatment.medication} - {treatment.dosage}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Syringe className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p>No health records yet</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'weight' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Weight Records
              </h2>
              <button className="btn-primary flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add Weight
              </button>
            </div>
            
            {weightsData?.items && weightsData.items.length > 0 ? (
              <div>
                {/* Weight Chart Placeholder */}
                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                  <p className="text-sm text-gray-600 text-center">Weight chart visualization coming soon</p>
                </div>
                
                {/* Weight Records Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">Date</th>
                        <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">Weight (kg)</th>
                        <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">Method</th>
                        <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {weightsData.items.map((weight: any) => (
                        <tr key={weight.id} className="hover:bg-gray-50">
                          <td className="py-3 px-4 text-sm text-gray-900">
                            {new Date(weight.date).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4 text-sm font-medium text-gray-900">
                            {weight.kg} kg
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">
                            {weight.method || 'SCALE'}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">
                            {weight.notes || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Weight className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p>No weight records yet</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'milk' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Milk Yield Records
              </h2>
              <button className="btn-primary flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add Milk Yield
              </button>
            </div>
            
            {milkData?.items && milkData.items.length > 0 ? (
              <div>
                {/* Summary Stats */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-primary-50 rounded-lg p-4">
                    <p className="text-sm text-primary-700 mb-1">Total Records</p>
                    <p className="text-2xl font-bold text-primary-900">{milkData.items.length}</p>
                  </div>
                  <div className="bg-primary-50 rounded-lg p-4">
                    <p className="text-sm text-primary-700 mb-1">Total Liters</p>
                    <p className="text-2xl font-bold text-primary-900">
                      {milkData.items.reduce((sum: number, item: any) => sum + item.liters, 0).toFixed(1)}
                    </p>
                  </div>
                  <div className="bg-primary-50 rounded-lg p-4">
                    <p className="text-sm text-primary-700 mb-1">Avg per Record</p>
                    <p className="text-2xl font-bold text-primary-900">
                      {(milkData.items.reduce((sum: number, item: any) => sum + item.liters, 0) / milkData.items.length).toFixed(1)}
                    </p>
                  </div>
                </div>

                {/* Milk Records Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">Date</th>
                        <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">Liters</th>
                        <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {milkData.items.map((yield_: any) => (
                        <tr key={yield_.id} className="hover:bg-gray-50">
                          <td className="py-3 px-4 text-sm text-gray-900">
                            {new Date(yield_.at).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4 text-sm font-medium text-gray-900">
                            {yield_.liters} L
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">
                            {new Date(yield_.at).toLocaleTimeString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Droplet className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p>No milk yield records yet</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'sales' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Sales Records
              </h2>
              {animal?.status !== 'SOLD' && (
                <button className="btn-primary flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Record Sale
                </button>
              )}
            </div>
            
            {salesData?.items && salesData.items.length > 0 ? (
              <div className="space-y-4">
                {salesData.items.map((sale: any) => (
                  <div key={sale.id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-medium text-gray-900 text-lg">
                          {sale.type === 'LIVE' ? 'Live Sale' : 'Meat Sale'}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Buyer: {sale.buyerName || 'Unknown'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-success-700">
                          ${sale.price.toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(sale.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm pt-4 border-t border-gray-200">
                      <div>
                        <p className="text-gray-600">Weight</p>
                        <p className="font-medium text-gray-900">{sale.weightKg} kg</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Price per kg</p>
                        <p className="font-medium text-gray-900">
                          ${(sale.price / sale.weightKg).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <DollarSign className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p>
                  {animal?.status === 'SOLD' 
                    ? 'Sale record not found' 
                    : 'This animal has not been sold yet'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

