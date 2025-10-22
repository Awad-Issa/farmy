'use client';

/**
 * Breeding Management Page
 * Lists and manages breeding cycles
 */

import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { trpc, getCurrentFarmId } from '@/lib/trpc';
import { Heart, Plus, Calendar, AlertCircle, CheckCircle2, XCircle, Clock } from 'lucide-react';
import Link from 'next/link';
import { AddBreedingModal } from '@/components/AddBreedingModal';
import { BreedingCycleModal } from '@/components/BreedingCycleModal';
import { RecordINS2Modal } from '@/components/RecordINS2Modal';
import { RecordPregnancyCheckModal } from '@/components/RecordPregnancyCheckModal';
import { RecordLambingModal } from '@/components/RecordLambingModal';

type BreedingStatus = 'OPEN' | 'PREGNANT' | 'LAMBED' | 'FAILED' | 'ABORTED' | undefined;

export default function BreedingPage() {
  const t = useTranslations('breeding');
  const tCommon = useTranslations('common');
  const params = useParams();
  const locale = params.locale as string;
  
  const [farmId, setFarmId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<BreedingStatus>(undefined);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCycle, setSelectedCycle] = useState<any>(null);
  const [showCycleModal, setShowCycleModal] = useState(false);
  const [showINS2Modal, setShowINS2Modal] = useState(false);
  const [showCheckModal, setShowCheckModal] = useState(false);
  const [checkNumber, setCheckNumber] = useState<1 | 2>(1);
  const [showLambingModal, setShowLambingModal] = useState(false);

  // Get farm ID from localStorage on mount
  useEffect(() => {
    const id = getCurrentFarmId();
    setFarmId(id);
  }, []);

  // Fetch breeding cycles
  const { data: cyclesData, isLoading } = trpc.breeding.cycles.list.useQuery(
    {
      farmId: farmId!,
      status: statusFilter,
      limit: 50,
    },
    { enabled: !!farmId }
  );

  // Calculate days until due
  const getDaysUntilDue = (estDue: Date | null) => {
    if (!estDue) return null;
    const now = new Date();
    const due = new Date(estDue);
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'bg-blue-100 text-blue-700';
      case 'PREGNANT':
        return 'bg-primary-100 text-primary-700';
      case 'LAMBED':
        return 'bg-success-100 text-success-700';
      case 'FAILED':
        return 'bg-error-100 text-error-700';
      case 'ABORTED':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'OPEN':
        return <Clock className="w-4 h-4" />;
      case 'PREGNANT':
        return <Heart className="w-4 h-4" />;
      case 'LAMBED':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'FAILED':
      case 'ABORTED':
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  // Handle modal actions
  const handleViewDetails = (cycle: any) => {
    setSelectedCycle(cycle);
    setShowCycleModal(true);
  };

  const handleRecordINS2 = (cycleId?: string) => {
    if (cycleId) {
      const cycle = cyclesData?.items.find((c: any) => c.id === cycleId);
      setSelectedCycle(cycle);
    }
    setShowCycleModal(false);
    setShowINS2Modal(true);
  };

  const handleRecordCheck = (cycleId?: string, num?: 1 | 2) => {
    if (cycleId) {
      const cycle = cyclesData?.items.find((c: any) => c.id === cycleId);
      setSelectedCycle(cycle);
    }
    if (num) {
      setCheckNumber(num);
    }
    setShowCycleModal(false);
    setShowCheckModal(true);
  };

  const handleRecordLambing = (cycleId?: string) => {
    if (cycleId) {
      const cycle = cyclesData?.items.find((c: any) => c.id === cycleId);
      setSelectedCycle(cycle);
    }
    setShowCycleModal(false);
    setShowLambingModal(true);
  };

  const handleModalSuccess = () => {
    setShowINS2Modal(false);
    setShowCheckModal(false);
    setShowLambingModal(false);
    setSelectedCycle(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">{tCommon('loading')}</div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Breeding Management</h1>
          <p className="text-gray-600 mt-1">Track and manage breeding cycles</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          New Breeding Cycle
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Open Cycles</p>
              <p className="text-2xl font-bold text-blue-700">
                {cyclesData?.items.filter(c => c.status === 'OPEN').length || 0}
              </p>
            </div>
            <Clock className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pregnant</p>
              <p className="text-2xl font-bold text-primary-700">
                {cyclesData?.items.filter(c => c.status === 'PREGNANT').length || 0}
              </p>
            </div>
            <Heart className="w-8 h-8 text-primary-500" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Lambed</p>
              <p className="text-2xl font-bold text-success-700">
                {cyclesData?.items.filter(c => c.status === 'LAMBED').length || 0}
              </p>
            </div>
            <CheckCircle2 className="w-8 h-8 text-success-500" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Cycles</p>
              <p className="text-2xl font-bold text-gray-900">
                {cyclesData?.items.length || 0}
              </p>
            </div>
            <Heart className="w-8 h-8 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">Filter by Status:</label>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setStatusFilter(undefined)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                statusFilter === undefined
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter('OPEN')}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                statusFilter === 'OPEN'
                  ? 'bg-blue-600 text-white'
                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              }`}
            >
              Open
            </button>
            <button
              onClick={() => setStatusFilter('PREGNANT')}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                statusFilter === 'PREGNANT'
                  ? 'bg-primary-600 text-white'
                  : 'bg-primary-100 text-primary-700 hover:bg-primary-200'
              }`}
            >
              Pregnant
            </button>
            <button
              onClick={() => setStatusFilter('LAMBED')}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                statusFilter === 'LAMBED'
                  ? 'bg-success-600 text-white'
                  : 'bg-success-100 text-success-700 hover:bg-success-200'
              }`}
            >
              Lambed
            </button>
            <button
              onClick={() => setStatusFilter('FAILED')}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                statusFilter === 'FAILED'
                  ? 'bg-error-600 text-white'
                  : 'bg-error-100 text-error-700 hover:bg-error-200'
              }`}
            >
              Failed
            </button>
          </div>
        </div>
      </div>

      {/* Breeding Cycles List */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Breeding Cycles</h2>
        
        {cyclesData?.items && cyclesData.items.length > 0 ? (
          <div className="space-y-4">
            {cyclesData.items.map((cycle: any) => {
              const daysUntilDue = getDaysUntilDue(cycle.estDue);
              
              return (
                <div
                  key={cycle.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/${locale}/animals/${cycle.ewe.id}`}
                        className="text-lg font-semibold text-primary-700 hover:text-primary-800"
                      >
                        {cycle.ewe.tagNumber}
                      </Link>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${getStatusColor(cycle.status)}`}>
                        {getStatusIcon(cycle.status)}
                        {cycle.status}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">INS1 Date</p>
                      <p className="font-medium text-gray-900">
                        {new Date(cycle.ins1Date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    {cycle.ins2Date && (
                      <div>
                        <p className="text-gray-600">INS2 Date</p>
                        <p className="font-medium text-gray-900">
                          {new Date(cycle.ins2Date).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                    
                    {cycle.check1Date && (
                      <div>
                        <p className="text-gray-600">Check 1</p>
                        <p className="font-medium text-gray-900">
                          {new Date(cycle.check1Date).toLocaleDateString()}
                          {cycle.check1Result && (
                            <span className={`ml-2 text-xs ${
                              cycle.check1Result === 'POSITIVE' ? 'text-success-700' :
                              cycle.check1Result === 'NEGATIVE' ? 'text-error-700' :
                              'text-gray-600'
                            }`}>
                              ({cycle.check1Result})
                            </span>
                          )}
                        </p>
                      </div>
                    )}

                    {cycle.estDue && (
                      <div>
                        <p className="text-gray-600">Est. Due Date</p>
                        <p className="font-medium text-gray-900">
                          {new Date(cycle.estDue).toLocaleDateString()}
                          {daysUntilDue !== null && (
                            <span className={`ml-2 text-xs ${
                              daysUntilDue < 0 ? 'text-error-700' :
                              daysUntilDue <= 7 ? 'text-warning-700' :
                              'text-gray-600'
                            }`}>
                              ({daysUntilDue > 0 ? `${daysUntilDue}d left` : `${Math.abs(daysUntilDue)}d overdue`})
                            </span>
                          )}
                        </p>
                      </div>
                    )}

                    {cycle.events && cycle.events.length > 0 && (
                      <div>
                        <p className="text-gray-600">Events</p>
                        <p className="font-medium text-gray-900">
                          {cycle.events.length} event{cycle.events.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-4 pt-4 border-t border-gray-200 flex gap-2">
                    <button 
                      onClick={() => handleViewDetails(cycle)}
                      className="btn-secondary text-sm"
                    >
                      View Details
                    </button>
                    {cycle.status === 'OPEN' && !cycle.ins2Date && (
                      <button 
                        onClick={() => {
                          setSelectedCycle(cycle);
                          handleRecordINS2(cycle.id);
                        }}
                        className="btn-secondary text-sm"
                      >
                        Record INS2
                      </button>
                    )}
                    {cycle.status === 'OPEN' && !cycle.check1Date && (
                      <button 
                        onClick={() => {
                          setSelectedCycle(cycle);
                          handleRecordCheck(cycle.id, 1);
                        }}
                        className="btn-secondary text-sm"
                      >
                        Record Check 1
                      </button>
                    )}
                    {cycle.status === 'PREGNANT' && daysUntilDue && daysUntilDue <= 7 && (
                      <button 
                        onClick={() => {
                          setSelectedCycle(cycle);
                          handleRecordLambing(cycle.id);
                        }}
                        className="btn-primary text-sm"
                      >
                        Record Lambing
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <Heart className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium mb-2">No breeding cycles found</p>
            <p className="text-sm mb-4">
              {statusFilter 
                ? `No cycles with status "${statusFilter}"`
                : 'Start tracking breeding cycles by creating your first one'}
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-primary inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create First Breeding Cycle
            </button>
          </div>
        )}
      </div>

      {/* Add Breeding Modal */}
      <AddBreedingModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => {
          // Modal will handle refresh via invalidation
        }}
      />

      {/* Breeding Cycle Detail Modal */}
      <BreedingCycleModal
        isOpen={showCycleModal}
        onClose={() => {
          setShowCycleModal(false);
          setSelectedCycle(null);
        }}
        cycle={selectedCycle}
        onRecordINS2={handleRecordINS2}
        onRecordCheck={handleRecordCheck}
        onRecordLambing={handleRecordLambing}
      />

      {/* Record INS2 Modal */}
      {selectedCycle && (
        <RecordINS2Modal
          isOpen={showINS2Modal}
          onClose={() => {
            setShowINS2Modal(false);
            setSelectedCycle(null);
          }}
          cycleId={selectedCycle.id}
          farmId={selectedCycle.farmId}
          eweId={selectedCycle.eweId}
          ins1Date={selectedCycle.ins1Date}
          onSuccess={handleModalSuccess}
        />
      )}

      {/* Record Pregnancy Check Modal */}
      {selectedCycle && (
        <RecordPregnancyCheckModal
          isOpen={showCheckModal}
          onClose={() => {
            setShowCheckModal(false);
            setSelectedCycle(null);
          }}
          cycleId={selectedCycle.id}
          farmId={selectedCycle.farmId}
          eweId={selectedCycle.eweId}
          ins1Date={selectedCycle.ins1Date}
          checkNumber={checkNumber}
          onSuccess={handleModalSuccess}
        />
      )}

      {/* Record Lambing Modal */}
      {selectedCycle && (
        <RecordLambingModal
          isOpen={showLambingModal}
          onClose={() => {
            setShowLambingModal(false);
            setSelectedCycle(null);
          }}
          cycleId={selectedCycle.id}
          farmId={selectedCycle.farmId}
          eweId={selectedCycle.eweId}
          eweTagNumber={selectedCycle.ewe.tagNumber}
          estDue={selectedCycle.estDue}
          onSuccess={handleModalSuccess}
        />
      )}
    </div>
  );
}

