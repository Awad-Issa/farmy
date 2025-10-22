'use client';

/**
 * Record Lambing Modal
 * Form to record lambing event with individual lamb details
 */

import { useState, useEffect } from 'react';
import { X, Heart, Plus, Trash2 } from 'lucide-react';
import { trpc } from '@/lib/trpc';

interface RecordLambingModalProps {
  isOpen: boolean;
  onClose: () => void;
  cycleId: string;
  farmId: string;
  eweId: string;
  eweTagNumber: string;
  estDue?: Date | null;
  onSuccess?: () => void;
}

interface LambDetail {
  id: string;
  tagNumber: string;
  sex: 'MALE' | 'FEMALE';
  isStillborn: boolean;
}

export function RecordLambingModal({
  isOpen,
  onClose,
  cycleId,
  farmId,
  eweId,
  eweTagNumber,
  estDue,
  onSuccess,
}: RecordLambingModalProps) {
  const [lambingDate, setLambingDate] = useState('');
  const [lambs, setLambs] = useState<LambDetail[]>([]);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const utils = trpc.useUtils();

  const createEventMutation = trpc.breeding.events.create.useMutation({
    onSuccess: () => {
      utils.breeding.cycles.list.invalidate();
      utils.breeding.cycles.get.invalidate({ id: cycleId, farmId });
      utils.animals.list.invalidate();
      
      if (onSuccess) {
        onSuccess();
      }
      
      resetForm();
      onClose();
    },
    onError: (err) => {
      setError(err.message || 'Failed to record lambing');
    },
  });

  const resetForm = () => {
    setLambingDate('');
    setLambs([]);
    setNotes('');
    setError('');
  };

  const addLamb = () => {
    const newLamb: LambDetail = {
      id: Math.random().toString(36).substr(2, 9),
      tagNumber: '',
      sex: 'MALE',
      isStillborn: false,
    };
    setLambs([...lambs, newLamb]);
  };

  const removeLamb = (id: string) => {
    setLambs(lambs.filter(lamb => lamb.id !== id));
  };

  const updateLamb = (id: string, field: keyof LambDetail, value: any) => {
    setLambs(lambs.map(lamb => 
      lamb.id === id ? { ...lamb, [field]: value } : lamb
    ));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!lambingDate) {
      setError('Lambing date is required');
      return;
    }

    if (lambs.length === 0) {
      setError('Please add at least one lamb');
      return;
    }

    // Validate tag numbers for live lambs
    const liveLambs = lambs.filter(l => !l.isStillborn);
    for (const lamb of liveLambs) {
      if (!lamb.tagNumber || lamb.tagNumber.trim() === '') {
        setError('All live lambs must have a tag number');
        return;
      }
    }

    // Check for duplicate tag numbers
    const tagNumbers = liveLambs.map(l => l.tagNumber.trim().toUpperCase());
    const uniqueTags = new Set(tagNumbers);
    if (tagNumbers.length !== uniqueTags.size) {
      setError('Duplicate tag numbers are not allowed');
      return;
    }

    // Count lambs by type
    const maleCount = lambs.filter(l => !l.isStillborn && l.sex === 'MALE').length;
    const femaleCount = lambs.filter(l => !l.isStillborn && l.sex === 'FEMALE').length;
    const stillbornCount = lambs.filter(l => l.isStillborn).length;

    // Create lambing event with payload including lamb details
    createEventMutation.mutate({
      farmId,
      cycleId,
      eweId,
      type: 'LAMBING',
      date: new Date(lambingDate),
      payload: {
        maleCount,
        femaleCount,
        stillbornCount,
        totalCount: lambs.length,
        lambs: lambs.map(l => ({
          tagNumber: l.isStillborn ? undefined : l.tagNumber.trim(),
          sex: l.sex,
          isStillborn: l.isStillborn,
        })),
        notes: notes || undefined,
      },
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const liveLambs = lambs.filter(l => !l.isStillborn);
  const stillbornLambs = lambs.filter(l => l.isStillborn);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Heart className="w-6 h-6 text-success-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Record Lambing</h2>
              <p className="text-sm text-gray-600">Ewe: {eweTagNumber}</p>
            </div>
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
          <div className="bg-success-50 border border-success-200 rounded-lg p-4">
            <p className="text-sm text-success-800">
              <strong>Lambing Event</strong> - Record the birth of lambs with their details
            </p>
            {estDue && (
              <p className="text-sm text-success-700 mt-2">
                Estimated due date was: <strong>{new Date(estDue).toLocaleDateString()}</strong>
              </p>
            )}
          </div>

          {/* Lambing Date */}
          <div>
            <label htmlFor="lambingDate" className="block text-sm font-medium text-gray-700 mb-2">
              Lambing Date <span className="text-danger-600">*</span>
            </label>
            <input
              id="lambingDate"
              type="date"
              value={lambingDate}
              onChange={(e) => setLambingDate(e.target.value)}
              className="input-field"
              max={new Date().toISOString().split('T')[0]}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              The date when the lambs were born
            </p>
          </div>

          {/* Lambs List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-gray-900">Lambs</h3>
              <button
                type="button"
                onClick={addLamb}
                className="btn-primary text-sm flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Add Lamb
              </button>
            </div>

            {lambs.length === 0 ? (
              <div className="bg-gray-50 rounded-lg p-6 text-center text-gray-500">
                <p>No lambs added yet. Click "Add Lamb" to start.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {lambs.map((lamb, index) => (
                  <div key={lamb.id} className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900">Lamb #{index + 1}</h4>
                      <button
                        type="button"
                        onClick={() => removeLamb(lamb.id)}
                        className="text-error-600 hover:text-error-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {/* Tag Number */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Tag Number {!lamb.isStillborn && <span className="text-danger-600">*</span>}
                        </label>
                        <input
                          type="text"
                          value={lamb.tagNumber}
                          onChange={(e) => updateLamb(lamb.id, 'tagNumber', e.target.value)}
                          className="input-field"
                          placeholder="e.g., L001"
                          disabled={lamb.isStillborn}
                          required={!lamb.isStillborn}
                        />
                      </div>

                      {/* Sex */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Sex <span className="text-danger-600">*</span>
                        </label>
                        <select
                          value={lamb.sex}
                          onChange={(e) => updateLamb(lamb.id, 'sex', e.target.value as 'MALE' | 'FEMALE')}
                          className="input-field"
                          required
                        >
                          <option value="MALE">Male</option>
                          <option value="FEMALE">Female</option>
                        </select>
                      </div>
                    </div>

                    {/* Stillborn Checkbox */}
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`stillborn-${lamb.id}`}
                        checked={lamb.isStillborn}
                        onChange={(e) => {
                          updateLamb(lamb.id, 'isStillborn', e.target.checked);
                          if (e.target.checked) {
                            updateLamb(lamb.id, 'tagNumber', '');
                          }
                        }}
                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                      <label htmlFor={`stillborn-${lamb.id}`} className="text-sm text-gray-700">
                        Stillborn (no tag number needed)
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Summary */}
            {lambs.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-blue-800">Total Lambs:</span>
                    <span className="font-medium text-blue-900">{lambs.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-800">Live Lambs:</span>
                    <span className="font-medium text-success-700">{liveLambs.length}</span>
                  </div>
                  {stillbornLambs.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-blue-800">Stillborn:</span>
                      <span className="font-medium text-error-700">{stillbornLambs.length}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
              Notes <span className="text-gray-500 text-xs">(optional)</span>
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="input-field"
              rows={3}
              placeholder="Any additional notes about the lambing (complications, health issues, etc.)"
            />
          </div>

          {/* Info Message */}
          {liveLambs.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                <strong>✓ Automatic Creation:</strong> {liveLambs.length} lamb{liveLambs.length !== 1 ? 's' : ''} will be created in the Animals section with the tag numbers you provided and linked to this ewe as their dam.
              </p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="btn-secondary flex-1"
              disabled={createEventMutation.isPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary flex-1"
              disabled={createEventMutation.isPending || lambs.length === 0}
            >
              {createEventMutation.isPending ? 'Recording...' : 'Record Lambing'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
