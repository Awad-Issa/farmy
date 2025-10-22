'use client';

/**
 * Add Animal Modal
 * Form to create a new animal
 */

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { trpc, getCurrentFarmId } from '@/lib/trpc';
import { X, RefreshCw } from 'lucide-react';

interface AddAnimalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AddAnimalModal({ isOpen, onClose, onSuccess }: AddAnimalModalProps) {
  const t = useTranslations('animals');
  const tCommon = useTranslations('common');
  
  const [tagNumber, setTagNumber] = useState('');
  const [rfid, setRfid] = useState('');
  const [type, setType] = useState<'RAM' | 'EWE' | 'LAMB'>('EWE');
  const [sex, setSex] = useState<'MALE' | 'FEMALE'>('FEMALE');
  const [dob, setDob] = useState('');
  const [sireId, setSireId] = useState('');
  const [damId, setDamId] = useState('');
  const [error, setError] = useState('');
  const [farmId, setFarmId] = useState<string | null>(null);

  // Get farm ID on mount
  useEffect(() => {
    const id = getCurrentFarmId();
    setFarmId(id);
  }, []);

  // Fetch male animals for Sire selection
  const { data: maleAnimals } = trpc.animals.list.useQuery(
    {
      farmId: farmId!,
      limit: 100,
    },
    { enabled: !!farmId }
  );

  // Filter males and females from the animals list
  const males = maleAnimals?.items?.filter(a => a.sex === 'MALE' && a.status === 'ACTIVE') || [];
  const females = maleAnimals?.items?.filter(a => a.sex === 'FEMALE' && a.status === 'ACTIVE') || [];

  const utils = trpc.useUtils();
  
  const createAnimalMutation = trpc.animals.create.useMutation({
    onSuccess: () => {
      // Refresh animals list
      utils.animals.list.invalidate();
      
      // Call success callback
      if (onSuccess) {
        onSuccess();
      }
      
      // Reset form and close modal
      resetForm();
      onClose();
    },
    onError: (err) => {
      setError(err.message || 'Failed to create animal');
    },
  });

  const generateRFID = () => {
    // Generate a random 15-digit RFID
    const rfid = Array.from({ length: 15 }, () => Math.floor(Math.random() * 10)).join('');
    setRfid(rfid);
  };

  const resetForm = () => {
    setTagNumber('');
    setRfid('');
    setType('EWE');
    setSex('FEMALE');
    setDob('');
    setSireId('');
    setDamId('');
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!tagNumber) {
      setError('Tag number is required');
      return;
    }

    const farmId = getCurrentFarmId();
    if (!farmId) {
      setError('No farm selected');
      return;
    }

    // Prepare data
    const data: any = {
      farmId,
      tagNumber,
      type,
      sex,
    };

    // Add optional fields
    if (rfid && rfid.length === 15) {
      data.rfid = rfid;
    }
    
    if (dob) {
      data.dob = new Date(dob);
    }

    // Add parent IDs if selected
    if (sireId) {
      data.sireId = sireId;
    }

    if (damId) {
      data.damId = damId;
    }

    // Submit
    createAnimalMutation.mutate(data);
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
          <h2 className="text-xl font-semibold text-gray-900">{t('addAnimal')}</h2>
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

          {/* Tag Number */}
          <div>
            <label htmlFor="tagNumber" className="block text-sm font-medium text-gray-700 mb-2">
              {t('tagNumber')} <span className="text-danger-600">*</span>
            </label>
            <input
              id="tagNumber"
              type="text"
              value={tagNumber}
              onChange={(e) => setTagNumber(e.target.value)}
              placeholder="R001, E001, etc."
              className="input-field"
              required
              maxLength={20}
            />
            <p className="text-xs text-gray-500 mt-1">Alphanumeric, max 20 characters</p>
          </div>

          {/* RFID (Optional) */}
          <div>
            <label htmlFor="rfid" className="block text-sm font-medium text-gray-700 mb-2">
              {t('rfid')} <span className="text-gray-500 text-xs">(optional)</span>
            </label>
            <div className="flex gap-2">
              <input
                id="rfid"
                type="text"
                value={rfid}
                onChange={(e) => setRfid(e.target.value)}
                placeholder="123456789012345"
                className="input-field flex-1"
                maxLength={15}
              />
              <button
                type="button"
                onClick={generateRFID}
                className="btn-secondary flex items-center gap-2 px-3"
                title="Generate RFID"
              >
                <RefreshCw className="w-4 h-4" />
                Generate
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">Exactly 15 digits - Click Generate for auto RFID</p>
          </div>

          {/* Type */}
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
              {t('type')} <span className="text-danger-600">*</span>
            </label>
            <select
              id="type"
              value={type}
              onChange={(e) => {
                const newType = e.target.value as 'RAM' | 'EWE' | 'LAMB';
                setType(newType);
                // Auto-set sex based on type
                if (newType === 'RAM') setSex('MALE');
                else if (newType === 'EWE') setSex('FEMALE');
              }}
              className="input-field"
              required
            >
              <option value="RAM">RAM (Adult Male)</option>
              <option value="EWE">EWE (Adult Female)</option>
              <option value="LAMB">LAMB (Young)</option>
            </select>
          </div>

          {/* Sex */}
          <div>
            <label htmlFor="sex" className="block text-sm font-medium text-gray-700 mb-2">
              {t('gender')} <span className="text-danger-600">*</span>
            </label>
            <select
              id="sex"
              value={sex}
              onChange={(e) => setSex(e.target.value as 'MALE' | 'FEMALE')}
              className="input-field"
              required
            >
              <option value="MALE">MALE</option>
              <option value="FEMALE">FEMALE</option>
            </select>
          </div>

          {/* Birth Date (Optional) */}
          <div>
            <label htmlFor="dob" className="block text-sm font-medium text-gray-700 mb-2">
              {t('birthDate')} <span className="text-gray-500 text-xs">(optional)</span>
            </label>
            <input
              id="dob"
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="input-field"
              max={new Date().toISOString().split('T')[0]}
            />
          </div>

          {/* Sire (Father) - Optional */}
          <div>
            <label htmlFor="sire" className="block text-sm font-medium text-gray-700 mb-2">
              Sire (Father) <span className="text-gray-500 text-xs">(optional)</span>
            </label>
            <select
              id="sire"
              value={sireId}
              onChange={(e) => setSireId(e.target.value)}
              className="input-field"
            >
              <option value="">-- Select Sire --</option>
              {males.map((animal) => (
                <option key={animal.id} value={animal.id}>
                  {animal.tagNumber} {animal.type && `(${animal.type})`}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">Select the father (male animal)</p>
          </div>

          {/* Dam (Mother) - Optional */}
          <div>
            <label htmlFor="dam" className="block text-sm font-medium text-gray-700 mb-2">
              Dam (Mother) <span className="text-gray-500 text-xs">(optional)</span>
            </label>
            <select
              id="dam"
              value={damId}
              onChange={(e) => setDamId(e.target.value)}
              className="input-field"
            >
              <option value="">-- Select Dam --</option>
              {females.map((animal) => (
                <option key={animal.id} value={animal.id}>
                  {animal.tagNumber} {animal.type && `(${animal.type})`}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">Select the mother (female animal)</p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="btn-secondary flex-1"
              disabled={createAnimalMutation.isPending}
            >
              {tCommon('cancel')}
            </button>
            <button
              type="submit"
              className="btn-primary flex-1"
              disabled={createAnimalMutation.isPending}
            >
              {createAnimalMutation.isPending ? tCommon('loading') : tCommon('add')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

