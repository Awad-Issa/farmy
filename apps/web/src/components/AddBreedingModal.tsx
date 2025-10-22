'use client';

/**
 * Add Breeding Cycle Modal
 * Form to create a new breeding cycle (INS1)
 */

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { trpc, getCurrentFarmId } from '@/lib/trpc';
import { X, Heart } from 'lucide-react';

interface AddBreedingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AddBreedingModal({ isOpen, onClose, onSuccess }: AddBreedingModalProps) {
  const t = useTranslations('breeding');
  const tCommon = useTranslations('common');
  
  const [eweId, setEweId] = useState('');
  const [ins1Date, setIns1Date] = useState('');
  const [error, setError] = useState('');
  const [farmId, setFarmId] = useState<string | null>(null);

  // Get farm ID on mount
  useEffect(() => {
    const id = getCurrentFarmId();
    setFarmId(id);
  }, []);

  // Fetch female animals (ewes) for selection
  const { data: animalsData } = trpc.animals.list.useQuery(
    {
      farmId: farmId!,
      limit: 100,
    },
    { enabled: !!farmId }
  );

  // Filter to only show EWEs (not LAMBs) that are active
  const ewes = animalsData?.items?.filter(
    a => a.sex === 'FEMALE' && a.status === 'ACTIVE' && a.type === 'EWE'
  ) || [];

  const utils = trpc.useUtils();
  
  const createBreedingMutation = trpc.breeding.cycles.create.useMutation({
    onSuccess: () => {
      // Refresh breeding cycles list
      utils.breeding.cycles.list.invalidate();
      
      // Call success callback
      if (onSuccess) {
        onSuccess();
      }
      
      // Reset form and close modal
      resetForm();
      onClose();
    },
    onError: (err) => {
      setError(err.message || 'Failed to create breeding cycle');
    },
  });

  const resetForm = () => {
    setEweId('');
    setIns1Date('');
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!eweId) {
      setError('Please select a ewe');
      return;
    }

    if (!ins1Date) {
      setError('INS1 date is required');
      return;
    }

    const currentFarmId = getCurrentFarmId();
    if (!currentFarmId) {
      setError('No farm selected');
      return;
    }

    // Submit
    createBreedingMutation.mutate({
      farmId: currentFarmId,
      eweId,
      ins1Date: new Date(ins1Date),
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Heart className="w-6 h-6 text-primary-600" />
            <h2 className="text-xl font-semibold text-gray-900">New Breeding Cycle</h2>
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
              <strong>INS1</strong> is the first insemination date. The system will automatically:
            </p>
            <ul className="text-sm text-blue-700 mt-2 ml-4 list-disc space-y-1">
              <li>Create a reminder for INS2 at +17 days</li>
              <li>Create a reminder for CHECK1 at +28 days</li>
              <li>Track the breeding cycle status</li>
            </ul>
          </div>

          {/* Select Ewe */}
          <div>
            <label htmlFor="ewe" className="block text-sm font-medium text-gray-700 mb-2">
              Select Ewe <span className="text-danger-600">*</span>
            </label>
            <select
              id="ewe"
              value={eweId}
              onChange={(e) => setEweId(e.target.value)}
              className="input-field"
              required
            >
              <option value="">-- Select a Ewe --</option>
              {ewes.map((animal) => (
                <option key={animal.id} value={animal.id}>
                  {animal.tagNumber} {animal.type && `(${animal.type})`}
                </option>
              ))}
            </select>
            {ewes.length === 0 && (
              <p className="text-xs text-error-600 mt-1">
                No female animals available. Please add ewes first.
              </p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Select the female animal to start breeding cycle
            </p>
          </div>

          {/* INS1 Date */}
          <div>
            <label htmlFor="ins1Date" className="block text-sm font-medium text-gray-700 mb-2">
              INS1 Date (First Insemination) <span className="text-danger-600">*</span>
            </label>
            <input
              id="ins1Date"
              type="date"
              value={ins1Date}
              onChange={(e) => setIns1Date(e.target.value)}
              className="input-field"
              max={new Date().toISOString().split('T')[0]}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              The date when the first insemination occurred
            </p>
          </div>

          {/* Expected Timeline Preview */}
          {ins1Date && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-900 mb-2">Expected Timeline:</p>
              <div className="space-y-2 text-sm text-gray-700">
                <div className="flex justify-between">
                  <span>INS2 (2nd Insemination):</span>
                  <span className="font-medium">
                    {new Date(new Date(ins1Date).getTime() + 17 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>CHECK1 (Pregnancy Check):</span>
                  <span className="font-medium">
                    {new Date(new Date(ins1Date).getTime() + 28 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Est. Due Date (if pregnant):</span>
                  <span className="font-medium">
                    {new Date(new Date(ins1Date).getTime() + 150 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="btn-secondary flex-1"
              disabled={createBreedingMutation.isPending}
            >
              {tCommon('cancel')}
            </button>
            <button
              type="submit"
              className="btn-primary flex-1"
              disabled={createBreedingMutation.isPending || ewes.length === 0}
            >
              {createBreedingMutation.isPending ? tCommon('loading') : 'Create Cycle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

