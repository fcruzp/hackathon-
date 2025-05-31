import { Dialog, Listbox } from '@headlessui/react';
import { X, Save, Star, Check, ChevronsDownUp as ChevronUpDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import type { ServiceProvider } from '../../types';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface ServiceProviderEditModalProps {
  provider: ServiceProvider | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (provider: ServiceProvider) => void;
}

export default function ServiceProviderEditModal({
  provider,
  isOpen,
  onClose,
  onSave,
}: ServiceProviderEditModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors }, watch, setValue, reset } = useForm<ServiceProvider>();

  // Reset form when provider changes or modal opens
  useEffect(() => {
    if (provider && isOpen) {
      reset({
        id: provider.id,
        name: provider.name,
        type: provider.type,
        address: provider.address,
        city: provider.city,
        state: provider.state,
        zipCode: provider.zipCode,
        contactPerson: provider.contactPerson,
        contactEmail: provider.contactEmail,
        contactPhone: provider.contactPhone,
        specialties: provider.specialties,
        rating: provider.rating,
        isActive: provider.isActive,
        createdAt: provider.createdAt,
        updatedAt: provider.updatedAt,
      });
    }
  }, [provider, isOpen, reset]);

  if (!provider) return null;

  const currentRating = watch('rating') || 0;
  const specialties = watch('specialties') || [];

  const availableSpecialties = [
    'Oil Change',
    'Brake Service',
    'Tire Rotation',
    'Engine Repair',
    'Transmission',
    'Diagnostics',
    'Air Conditioning',
    'Electrical Systems',
    'Body Work',
    'Paint',
    'Suspension',
    'Alignment'
  ];

  const handleStarClick = (rating: number) => {
    setValue('rating', rating);
  };

  const handleSpecialtiesChange = (selected: string[]) => {
    setValue('specialties', selected);
  };

  const onSubmit = async (data: ServiceProvider) => {
    try {
      setIsSubmitting(true);

      // Update service provider in the database
      const { error: updateError } = await supabase
        .from('service_providers')
        .update({
          name: data.name,
          type: data.type,
          address: data.address,
          city: data.city,
          state: data.state,
          zip_code: data.zipCode,
          contact_person: data.contactPerson,
          contact_email: data.contactEmail,
          contact_phone: data.contactPhone,
          specialties: data.specialties,
          rating: data.rating,
          is_active: data.isActive,
          updated_at: new Date().toISOString(),
        })
        .eq('id', provider.id);

      if (updateError) {
        // Handle specific database errors
        if (updateError.code === '23505') {
          throw new Error('A service provider with this name already exists');
        }
        throw updateError;
      }

      onSave({
        ...data,
        id: provider.id,
        createdAt: provider.createdAt,
        updatedAt: new Date().toISOString(),
      });
      
      toast.success('Service provider updated successfully');
    } catch (error) {
      console.error('Error updating service provider:', error);
      toast.error(error.message || 'Failed to update service provider');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-2xl w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl">
          <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
            <Dialog.Title className="text-xl font-semibold text-gray-900 dark:text-white">
              Edit Service Provider
            </Dialog.Title>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Provider Name
                </label>
                <input
                  type="text"
                  {...register('name', { required: 'Provider name is required' })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Type
                </label>
                <select
                  {...register('type', { required: 'Type is required' })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="mechanic">Mechanic</option>
                  <option value="electrician">Electrician</option>
                  <option value="bodywork">Bodywork</option>
                  <option value="general">General</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  {...register('address', { required: 'Address is required' })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                {errors.address && (
                  <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  City
                </label>
                <input
                  type="text"
                  {...register('city', { required: 'City is required' })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                {errors.city && (
                  <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  State
                </label>
                <input
                  type="text"
                  {...register('state', { required: 'State is required' })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                {errors.state && (
                  <p className="mt-1 text-sm text-red-600">{errors.state.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  ZIP Code
                </label>
                <input
                  type="text"
                  {...register('zipCode', { required: 'ZIP code is required' })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                {errors.zipCode && (
                  <p className="mt-1 text-sm text-red-600">{errors.zipCode.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Contact Person
                </label>
                <input
                  type="text"
                  {...register('contactPerson', { required: 'Contact person is required' })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                {errors.contactPerson && (
                  <p className="mt-1 text-sm text-red-600">{errors.contactPerson.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Contact Email
                </label>
                <input
                  type="email"
                  {...register('contactEmail', { 
                    required: 'Contact email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                {errors.contactEmail && (
                  <p className="mt-1 text-sm text-red-600">{errors.contactEmail.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Contact Phone
                </label>
                <input
                  type="tel"
                  {...register('contactPhone', { required: 'Contact phone is required' })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                {errors.contactPhone && (
                  <p className="mt-1 text-sm text-red-600">{errors.contactPhone.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Rating
                </label>
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleStarClick(star)}
                      className="focus:outline-none transition-colors"
                    >
                      <Star
                        className={`h-6 w-6 ${
                          currentRating >= star
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300 dark:text-gray-600'
                        }`}
                      />
                    </button>
                  ))}
                  <input
                    type="number"
                    {...register('rating', {
                      required: 'Rating is required',
                      min: { value: 0, message: 'Rating must be between 0 and 5' },
                      max: { value: 5, message: 'Rating must be between 0 and 5' }
                    })}
                    className="sr-only"
                  />
                </div>
                {errors.rating && (
                  <p className="mt-1 text-sm text-red-600">{errors.rating.message}</p>
                )}
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Specialties
                </label>
                <div className="relative mt-1">
                  <Listbox value={specialties} onChange={handleSpecialtiesChange} multiple>
                    <div className="relative">
                      <Listbox.Button className="relative w-full cursor-default rounded-lg bg-white dark:bg-gray-700 py-2 pl-3 pr-10 text-left border border-gray-300 dark:border-gray-600 focus:outline-none focus-visible:border-primary-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-primary-300">
                        <span className="block truncate">
                          {specialties.length === 0 
                            ? 'Select specialties' 
                            : specialties.join(', ')}
                        </span>
                        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                          <ChevronUpDown className="h-5 w-5 text-gray-400" aria-hidden="true" />
                        </span>
                      </Listbox.Button>
                      <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-gray-700 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        {availableSpecialties.map((specialty) => (
                          <Listbox.Option
                            key={specialty}
                            value={specialty}
                            className={({ active }) =>
                              `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                active 
                                  ? 'bg-primary-100 dark:bg-primary-900 text-primary-900 dark:text-primary-100' 
                                  : 'text-gray-900 dark:text-white'
                              }`
                            }
                          >
                            {({ selected }) => (
                              <>
                                <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                                  {specialty}
                                </span>
                                {selected && (
                                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-primary-600 dark:text-primary-400">
                                    <Check className="h-5 w-5" aria-hidden="true" />
                                  </span>
                                )}
                              </>
                            )}
                          </Listbox.Option>
                        ))}
                      </Listbox.Options>
                    </div>
                  </Listbox>
                </div>
              </div>

              <div className="col-span-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    {...register('isActive')}
                    className="rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Active Provider</span>
                </label>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting}
              >
                <Save className="h-5 w-5 mr-2" />
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}