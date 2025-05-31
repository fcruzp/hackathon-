import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, PenTool as Tool, Save, Star, Check, ChevronsDownUp as ChevronUpDown } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Listbox } from '@headlessui/react';
import type { ServiceProvider } from '../../types';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

type ServiceProviderFormData = Omit<ServiceProvider, 'id' | 'createdAt' | 'updatedAt'>;

export default function AddServiceProvider() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<ServiceProviderFormData>({
    defaultValues: {
      isActive: true,
      rating: 0,
      specialties: [],
    },
  });

  const currentRating = watch('rating');
  const selectedSpecialties = watch('specialties') || [];

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

  const onSubmit = async (data: ServiceProviderFormData) => {
    try {
      setIsSubmitting(true);

      // Prepare service provider data
      const providerData = {
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
      };

      // Insert service provider into database
      const { error: insertError } = await supabase
        .from('service_providers')
        .insert([providerData]);

      if (insertError) {
        // Handle specific database errors
        if (insertError.code === '23505') {
          throw new Error('A service provider with this name already exists');
        }
        throw insertError;
      }

      toast.success('Service provider added successfully');
      navigate('/maintenance/service-providers');
    } catch (error) {
      console.error('Failed to create service provider:', error);
      toast.error(error.message || 'Failed to create service provider');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <Link
          to="/maintenance/service-providers"
          className="inline-flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Service Providers
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <div className="p-6 border-b dark:border-gray-700">
          <div className="flex items-center">
            <Tool className="h-6 w-6 text-primary-600 dark:text-primary-400 mr-2" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Add New Service Provider</h1>
          </div>
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
                <option value="">Select type</option>
                <option value="mechanic">Mechanic</option>
                <option value="electrician">Electrician</option>
                <option value="bodywork">Bodywork</option>
                <option value="general">General</option>
              </select>
              {errors.type && (
                <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
              )}
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
                <Listbox value={selectedSpecialties} onChange={handleSpecialtiesChange} multiple>
                  <div className="relative">
                    <Listbox.Button className="relative w-full cursor-default rounded-lg bg-white dark:bg-gray-700 py-2 pl-3 pr-10 text-left border border-gray-300 dark:border-gray-600 focus:outline-none focus-visible:border-primary-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-primary-300">
                      <span className="block truncate">
                        {selectedSpecialties.length === 0 
                          ? 'Select specialties' 
                          : selectedSpecialties.join(', ')}
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
            <Link
              to="/maintenance/service-providers"
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="h-5 w-5 mr-2" />
              {isSubmitting ? 'Adding Provider...' : 'Add Provider'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}