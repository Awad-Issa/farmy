'use client';

/**
 * Record Pregnancy Check Modal
 * Form to record CHECK1 or CHECK2 results
 */

import { useState } from 'react';
import { X, Stethoscope } from 'lucide-react';
import { trpc } from '@/lib/trpc';

interface RecordPregnancyCheckModalProps {
  isOpen: boolean;
  onClose: () => void;
  cycleId: string;
  farmId: string;
  eweId: string;
  ins1Date: Date;
  checkNumber: 1 | 2;
  onSuccess?: () => void;
}

export function RecordPregnancyCheckModal({
  isOpen,
  onClose,
  cycleId,
  farmId,
  eweId,
  ins1Date,
  checkNumber,
  onSuccess,
}: RecordPregnancyCheckModalProps) {
  const [checkDate, setCheckDate] = useState('');
  const [checkResult, setCheckResult] = useState<'POSITIVE' | 'NEGATIVE' | 'UNCERTAIN'>('POSITIVE');
  const [error, setError] = useState('');

  const utils = trpc.useUtils();

  const updateCycleMutation = trpc.breeding.cycles.update.useMutation({
    onSuccess: async () => {
      // Create check event
      await createEventMutation.mutateAsync({
        farmId,
        cycleId,
        eweId,
        type: checkNumber === 1 ? 'CHECK1' : 'CHECK2',
        date: new Date(checkDate),
        payload: { result: checkResult },
      });
    },
    onError: (err) => {
      setError(err.message || 'Failed to record pregnancy check');
    },
  });

  const createEventMutation = trpc.breeding.events.create.useMutation({
    onSuccess: () => {
      utils.breeding.cycles.list.invalidate();
      utils.breeding.cycles.get.invalidate({ id: cycleId, farmId });
      
      if (onSuccess) {
        onSuccess();
      }
      
      resetForm();
      onClose();
    },
    onError: (err) => {
      setError(err.message || 'Failed to create event');
    },
  });

  const resetForm = () => {
    setCheckDate('');
    setCheckResult('POSITIVE');
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!checkDate) {
      setError('Check date is required');
      return;
    }

    // Validate that check date is after INS1
    const check = new Date(checkDate);
    const ins1 = new Date(ins1Date);
    if (check <= ins1) {
      setError('Check date must be after INS1 date');
      return;
    }

    // Prepare update data
    const updateData: any = {
      id: cycleId,
      farmId,
    };

    if (checkNumber === 1) {
      updateData.check1Date = check;
      updateData.check1Result = checkResult;
      // If positive, update status to PREGNANT
      if (checkResult === 'POSITIVE') {
        updateData.status = 'PREGNANT';
      }
    } else {
      updateData.check2Date = check;
      updateData.check2Result = checkResult;
      // If positive, confirm PREGNANT status
      if (checkResult === 'POSITIVE') {
        updateData.status = 'PREGNANT';
      } else if (checkResult === 'NEGATIVE') {
        updateData.status = 'FAILED';
      }
    }

    // Update cycle
    updateCycleMutation.mutate(updateData);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Calculate recommended check date
  const recommendedDate = new Date(ins1Date);
  recommendedDate.setDate(recommendedDate.getDate() + (checkNumber === 1 ? 28 : 45));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Stethoscope className="w-6 h-6 text-primary-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Record CHECK{checkNumber}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>CHECK{checkNumber}</strong> is the {checkNumber === 1 ? 'first' : 'second'} pregnancy check, typically performed {checkNumber === 1 ? '28' : '45-50'} days after INS1.
            </p>
            <p className="text-sm text-blue-700 mt-2">
              Recommended date: <strong>{recommendedDate.toLocaleDateString()}</strong>
            </p>
          </div>

          {/* Check Date */}
          <div>
            <label htmlFor="checkDate" className="block text-sm font-medium text-gray-700 mb-2">
              Check Date <span className="text-danger-600">*</span>
            </label>
            <input
              id="checkDate"
              type="date"
              value={checkDate}
              onChange={(e) => setCheckDate(e.target.value)}
              className="input-field"
              max={new Date().toISOString().split('T')[0]}
              min={new Date(ins1Date).toISOString().split('T')[0]}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              The date when the pregnancy check was performed
            </p>
          </div>

          {/* Check Result */}
          <div>
            <label htmlFor="checkResult" className="block text-sm font-medium text-gray-700 mb-2">
              Check Result <span className="text-danger-600">*</span>
            </label>
            <div className="space-y-2">
              <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="checkResult"
                  value="POSITIVE"
                  checked={checkResult === 'POSITIVE'}
                  onChange={(e) => setCheckResult(e.target.value as any)}
                  className="mr-3"
                />
                <div>
                  <p className="font-medium text-success-700">Positive</p>
                  <p className="text-xs text-gray-600">Ewe is pregnant</p>
                </div>
              </label>
              
              <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="checkResult"
                  value="NEGATIVE"
                  checked={checkResult === 'NEGATIVE'}
                  onChange={(e) => setCheckResult(e.target.value as any)}
                  className="mr-3"
                />
                <div>
                  <p className="font-medium text-error-700">Negative</p>
                  <p className="text-xs text-gray-600">Ewe is not pregnant</p>
                </div>
              </label>
              
              <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="checkResult"
                  value="UNCERTAIN"
                  checked={checkResult === 'UNCERTAIN'}
                  onChange={(e) => setCheckResult(e.target.value as any)}
                  className="mr-3"
                />
                <div>
                  <p className="font-medium text-gray-700">Uncertain</p>
                  <p className="text-xs text-gray-600">Result is unclear, needs follow-up</p>
                </div>
              </label>
            </div>
          </div>

          {/* Result Impact */}
          {checkResult === 'POSITIVE' && (
            <div className="bg-success-50 border border-success-200 rounded-lg p-3">
              <p className="text-sm text-success-800">
                ✓ Cycle status will be updated to <strong>PREGNANT</strong> and estimated due date will be calculated.
              </p>
            </div>
          )}
          
          {checkResult === 'NEGATIVE' && checkNumber === 2 && (
            <div className="bg-error-50 border border-error-200 rounded-lg p-3">
              <p className="text-sm text-error-800">
                ✗ Cycle status will be updated to <strong>FAILED</strong>.
              </p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="btn-secondary flex-1"
              disabled={updateCycleMutation.isPending || createEventMutation.isPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary flex-1"
              disabled={updateCycleMutation.isPending || createEventMutation.isPending}
            >
              {updateCycleMutation.isPending || createEventMutation.isPending ? 'Recording...' : 'Record Check'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

