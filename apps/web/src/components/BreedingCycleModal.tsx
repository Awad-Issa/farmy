'use client';

/**
 * Breeding Cycle Detail Modal
 * Shows full cycle details and allows recording events
 */

import { useState } from 'react';
import { X, Heart, Calendar, CheckCircle2, AlertCircle, Plus } from 'lucide-react';

interface BreedingCycle {
  id: string;
  eweId: string;
  farmId: string;
  ins1Date: Date;
  ins2Date?: Date | null;
  check1Date?: Date | null;
  check1Result?: 'POSITIVE' | 'NEGATIVE' | 'UNCERTAIN' | null;
  check2Date?: Date | null;
  check2Result?: 'POSITIVE' | 'NEGATIVE' | 'UNCERTAIN' | null;
  estDue?: Date | null;
  status: string;
  ewe: {
    id: string;
    tagNumber: string;
    type: string;
  };
  events?: any[];
}

interface BreedingCycleModalProps {
  isOpen: boolean;
  onClose: () => void;
  cycle: BreedingCycle | null;
  onRecordINS2: (cycleId: string) => void;
  onRecordCheck: (cycleId: string, checkNumber: 1 | 2) => void;
  onRecordLambing: (cycleId: string) => void;
}

export function BreedingCycleModal({
  isOpen,
  onClose,
  cycle,
  onRecordINS2,
  onRecordCheck,
  onRecordLambing,
}: BreedingCycleModalProps) {
  if (!isOpen || !cycle) return null;

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
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getDaysUntilDue = () => {
    if (!cycle.estDue) return null;
    const now = new Date();
    const due = new Date(cycle.estDue);
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysUntilDue = getDaysUntilDue();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Heart className="w-6 h-6 text-primary-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Breeding Cycle - {cycle.ewe.tagNumber}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Started {new Date(cycle.ins1Date).toLocaleDateString()}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status Badge */}
          <div className="flex items-center gap-3">
            <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(cycle.status)}`}>
              {cycle.status}
            </span>
            {daysUntilDue !== null && cycle.status === 'PREGNANT' && (
              <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                daysUntilDue < 0 ? 'bg-error-100 text-error-700' :
                daysUntilDue <= 7 ? 'bg-warning-100 text-warning-700' :
                'bg-blue-100 text-blue-700'
              }`}>
                {daysUntilDue > 0 ? `${daysUntilDue} days until due` : `${Math.abs(daysUntilDue)} days overdue`}
              </span>
            )}
          </div>

          {/* Timeline */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Breeding Timeline</h3>
            <div className="space-y-4">
              {/* INS1 */}
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-success-100 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-success-700" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900">INS1 - First Insemination</h4>
                    <span className="text-sm text-gray-600">
                      {new Date(cycle.ins1Date).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Initial insemination completed</p>
                </div>
              </div>

              {/* INS2 */}
              <div className="flex items-start gap-4">
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                  cycle.ins2Date ? 'bg-success-100' : 'bg-gray-100'
                }`}>
                  {cycle.ins2Date ? (
                    <CheckCircle2 className="w-5 h-5 text-success-700" />
                  ) : (
                    <Calendar className="w-5 h-5 text-gray-400" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900">INS2 - Second Insemination</h4>
                    {cycle.ins2Date ? (
                      <span className="text-sm text-gray-600">
                        {new Date(cycle.ins2Date).toLocaleDateString()}
                      </span>
                    ) : (
                      <button
                        onClick={() => onRecordINS2(cycle.id)}
                        className="btn-secondary text-sm flex items-center gap-1"
                      >
                        <Plus className="w-4 h-4" />
                        Record
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {cycle.ins2Date 
                      ? 'Second insemination completed'
                      : 'Recommended at +17 days from INS1'}
                  </p>
                </div>
              </div>

              {/* CHECK1 */}
              <div className="flex items-start gap-4">
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                  cycle.check1Date ? 'bg-success-100' : 'bg-gray-100'
                }`}>
                  {cycle.check1Date ? (
                    <CheckCircle2 className="w-5 h-5 text-success-700" />
                  ) : (
                    <Calendar className="w-5 h-5 text-gray-400" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900">CHECK1 - First Pregnancy Check</h4>
                    {cycle.check1Date ? (
                      <span className="text-sm text-gray-600">
                        {new Date(cycle.check1Date).toLocaleDateString()}
                      </span>
                    ) : (
                      <button
                        onClick={() => onRecordCheck(cycle.id, 1)}
                        className="btn-secondary text-sm flex items-center gap-1"
                      >
                        <Plus className="w-4 h-4" />
                        Record
                      </button>
                    )}
                  </div>
                  {cycle.check1Result && (
                    <div className="mt-2">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        cycle.check1Result === 'POSITIVE' ? 'bg-success-100 text-success-700' :
                        cycle.check1Result === 'NEGATIVE' ? 'bg-error-100 text-error-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        Result: {cycle.check1Result}
                      </span>
                    </div>
                  )}
                  <p className="text-sm text-gray-600 mt-1">
                    {cycle.check1Date 
                      ? 'First pregnancy check completed'
                      : 'Recommended at +28 days from INS1'}
                  </p>
                </div>
              </div>

              {/* CHECK2 */}
              {(cycle.check1Result === 'POSITIVE' || cycle.check2Date) && (
                <div className="flex items-start gap-4">
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                    cycle.check2Date ? 'bg-success-100' : 'bg-gray-100'
                  }`}>
                    {cycle.check2Date ? (
                      <CheckCircle2 className="w-5 h-5 text-success-700" />
                    ) : (
                      <Calendar className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900">CHECK2 - Second Pregnancy Check</h4>
                      {cycle.check2Date ? (
                        <span className="text-sm text-gray-600">
                          {new Date(cycle.check2Date).toLocaleDateString()}
                        </span>
                      ) : (
                        <button
                          onClick={() => onRecordCheck(cycle.id, 2)}
                          className="btn-secondary text-sm flex items-center gap-1"
                        >
                          <Plus className="w-4 h-4" />
                          Record
                        </button>
                      )}
                    </div>
                    {cycle.check2Result && (
                      <div className="mt-2">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          cycle.check2Result === 'POSITIVE' ? 'bg-success-100 text-success-700' :
                          cycle.check2Result === 'NEGATIVE' ? 'bg-error-100 text-error-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          Result: {cycle.check2Result}
                        </span>
                      </div>
                    )}
                    <p className="text-sm text-gray-600 mt-1">
                      {cycle.check2Date 
                        ? 'Second pregnancy check completed'
                        : 'Optional check at +45-50 days from INS1'}
                    </p>
                  </div>
                </div>
              )}

              {/* LAMBING */}
              {cycle.status === 'PREGNANT' && cycle.estDue && (
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                    <Heart className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900">Expected Lambing</h4>
                      <button
                        onClick={() => onRecordLambing(cycle.id)}
                        className="btn-primary text-sm flex items-center gap-1"
                      >
                        <Plus className="w-4 h-4" />
                        Record Lambing
                      </button>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Est. due date: {new Date(cycle.estDue).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}

              {cycle.status === 'LAMBED' && (
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-success-100 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-success-700" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">Lambing Completed</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Breeding cycle completed successfully
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Events History */}
          {cycle.events && cycle.events.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Event History</h3>
              <div className="space-y-2">
                {cycle.events.map((event: any) => (
                  <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{event.type}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(event.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="btn-secondary"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

