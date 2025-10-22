'use client';

/**
 * Record INS2 Modal
 * Form to record second insemination
 */

import { useState } from 'react';
import { X, Calendar } from 'lucide-react';
import { trpc } from '@/lib/trpc';

interface RecordINS2ModalProps {
  isOpen: boolean;
  onClose: () => void;
  cycleId: string;
  farmId: string;
  eweId: string;
  ins1Date: Date;
  onSuccess?: () => void;
}

export function RecordINS2Modal({
  isOpen,
  onClose,
  cycleId,
  farmId,
  eweId,
  ins1Date,
  onSuccess,
}: RecordINS2ModalProps) {
  const [ins2Date, setIns2Date] = useState('');
  const [error, setError] = useState('');

  const utils = trpc.useUtils();

  const updateCycleMutation = trpc.breeding.cycles.update.useMutation({
    onSuccess: async () => {
      // Create INS2 event
      await createEventMutation.mutateAsync({
        farmId,
        cycleId,
        eweId,
        type: 'INS2',
        date: new Date(ins2Date),
      });
    },
    onError: (err) => {
      setError(err.message || 'Failed to record INS2');
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
    setIns2Date('');
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!ins2Date) {
      setError('INS2 date is required');
      return;
    }

    // Validate that INS2 is after INS1
    const ins2 = new Date(ins2Date);
    const ins1 = new Date(ins1Date);
    if (ins2 <= ins1) {
      setError('INS2 date must be after INS1 date');
      return;
    }

    // Update cycle with INS2 date
    updateCycleMutation.mutate({
      id: cycleId,
      farmId,
      ins2Date: ins2,
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Calculate recommended INS2 date (+17 days from INS1)
  const recommendedDate = new Date(ins1Date);
  recommendedDate.setDate(recommendedDate.getDate() + 17);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Calendar className="w-6 h-6 text-primary-600" />
            <h2 className="text-xl font-semibold text-gray-900">Record INS2</h2>
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
              <strong>INS2</strong> is the second insemination, typically performed 17 days after INS1 to increase conception chances.
            </p>
            <p className="text-sm text-blue-700 mt-2">
              Recommended date: <strong>{recommendedDate.toLocaleDateString()}</strong>
            </p>
          </div>

          {/* INS2 Date */}
          <div>
            <label htmlFor="ins2Date" className="block text-sm font-medium text-gray-700 mb-2">
              INS2 Date (Second Insemination) <span className="text-danger-600">*</span>
            </label>
            <input
              id="ins2Date"
              type="date"
              value={ins2Date}
              onChange={(e) => setIns2Date(e.target.value)}
              className="input-field"
              max={new Date().toISOString().split('T')[0]}
              min={new Date(ins1Date).toISOString().split('T')[0]}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              The date when the second insemination occurred
            </p>
          </div>

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
              {updateCycleMutation.isPending || createEventMutation.isPending ? 'Recording...' : 'Record INS2'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

