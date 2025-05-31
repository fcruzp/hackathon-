import React, { useState, useEffect } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { ArrowLeft, Car, Save, Check, ChevronsDownUp as ChevronUpDown } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Listbox } from '@headlessui/react';
import type { MaintenanceEvent, ServiceProvider, Vehicle } from '../../types';
import { useAuthStore } from '../../stores/auth-store';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import { logActivity } from '../../lib/logActivity';

type MaintenanceFormData = Omit<MaintenanceEvent, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>;

export default function AddMaintenance() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [serviceProviders, setServiceProviders] = useState<ServiceProvider[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<MaintenanceFormData>();

  useEffect(() => {
    Promise.all([fetchVehicles(), fetchServiceProviders()]).finally(() => {
      setIsLoading(false);
    });
  }, []);

  const fetchVehicles = async () => {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .order('make');

      if (error) throw error;

      setVehicles(data.map(vehicle => ({
        id: vehicle.id,
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        licensePlate: vehicle.license_plate,
        vin: vehicle.vin,
        color: vehicle.color,
        status: vehicle.status,
        assignedDriverId: vehicle.assigned_driver_id || undefined,
        institutionId: vehicle.institution_id,
        imageUrl: vehicle.image_url || undefined,
        mileage: vehicle.mileage,
        fuelType: vehicle.fuel_type,
        createdAt: vehicle.created_at,
      })));
    } catch (err) {
      console.error('Error fetching vehicles:', err);
      toast.error('Failed to load vehicles');
    }
  };

  const fetchServiceProviders = async () => {
    try {
      const { data, error } = await supabase
        .from('service_providers')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;

      setServiceProviders(data.map(provider => ({
        id: provider.id,
        name: provider.name,
        type: provider.type,
        address: provider.address,
        city: provider.city,
        state: provider.state,
        zipCode: provider.zip_code,
        contactPerson: provider.contact_person,
        contactEmail: provider.contact_email,
        contactPhone: provider.contact_phone,
        specialties: provider.specialties,
        rating: provider.rating,
        isActive: provider.is_active,
        createdAt: provider.created_at,
        updatedAt: provider.updated_at,
      })));
    } catch (err) {
      console.error('Error fetching service providers:', err);
      toast.error('Failed to load service providers');
    }
  };

  // Redirect if not authenticated
  if (!user) {
    return <Navigate to="/login" />;
  }

  const selectedProvider = serviceProviders.find(p => p.name === watch('serviceProvider'));

  const onSubmit = async (data: MaintenanceFormData) => {
    try {
      setIsSubmitting(true);

      // Find service provider ID from name
      const serviceProvider = serviceProviders.find(p => p.name === data.serviceProvider);

      const { data: inserted, error: insertError } = await supabase
        .from('maintenance_events')
        .insert([{
          vehicle_id: data.vehicleId,
          title: data.title,
          description: data.description,
          type: data.type,
          status: data.status,
          start_date: data.startDate,
          end_date: data.endDate,
          cost: data.cost || null,
          service_provider_id: serviceProvider?.id || null,
          created_by: user.id,
        }])
        .select();

      if (insertError) throw insertError;

      // Registrar log
      await logActivity({
        userId: user.id,
        action: 'create',
        entity: 'maintenance',
        entityId: inserted?.[0]?.id,
        description: `Creó el mantenimiento: ${data.title}`,
      });

      toast.success('Maintenance event created successfully');
      navigate('/maintenance');
    } catch (error) {
      console.error('Failed to create maintenance event:', error);
      toast.error('Failed to create maintenance event');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <Link
          to="/maintenance"
          className="inline-flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Maintenance
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <div className="p-6 border-b dark:border-gray-700">
          <div className="flex items-center">
            <Car className="h-6 w-6 text-primary-600 dark:text-primary-400 mr-2" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Schedule Maintenance</h1>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Basic Information</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  {...register('title', { required: 'Title is required' })}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.title.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Vehicle
                </label>
                <select
                  {...register('vehicleId', { required: 'Vehicle is required' })}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select a vehicle</option>
                  {vehicles.map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.make} {vehicle.model} ({vehicle.year}) - {vehicle.licensePlate}
                    </option>
                  ))}
                </select>
                {errors.vehicleId && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.vehicleId.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  {...register('description', { required: 'Description is required' })}
                  rows={4}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.description.message}</p>
                )}
              </div>
            </div>

            {/* Schedule Details */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Schedule Details</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Type
                </label>
                <select
                  {...register('type', { required: 'Type is required' })}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select type</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="emergency">Emergency</option>
                  <option value="repair">Repair</option>
                </select>
                {errors.type && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.type.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Status
                </label>
                <select
                  {...register('status', { required: 'Status is required' })}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select status</option>
                  <option value="pending">Pending</option>
                  <option value="inProgress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                {errors.status && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.status.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Start Date & Time
                </label>
                <input
                  type="datetime-local"
                  {...register('startDate', { required: 'Start date is required' })}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                />
                {errors.startDate && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.startDate.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  End Date & Time
                </label>
                <input
                  type="datetime-local"
                  {...register('endDate', { required: 'End date is required' })}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                />
                {errors.endDate && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.endDate.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Service Details */}
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Service Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Service Provider
                </label>
                <Listbox
                  value={selectedProvider?.name || ''}
                  onChange={(value) => setValue('serviceProvider', value)}
                >
                  <div className="relative mt-1">
                    <Listbox.Button className="relative w-full cursor-default rounded-lg bg-white dark:bg-gray-700 py-2 pl-3 pr-10 text-left border border-gray-300 dark:border-gray-600 focus:outline-none focus-visible:border-primary-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-primary-300">
                      <span className="block truncate">
                        {selectedProvider?.name || 'Select a provider'}
                      </span>
                      <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                        <ChevronUpDown className="h-5 w-5 text-gray-400" aria-hidden="true" />
                      </span>
                    </Listbox.Button>
                    <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-gray-700 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                      {serviceProviders.map((provider) => (
                        <Listbox.Option
                          key={provider.id}
                          value={provider.name}
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
                                {provider.name}
                              </span>
                              {selected ? (
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-primary-600 dark:text-primary-400">
                                  <Check className="h-5 w-5" aria-hidden="true" />
                                </span>
                              ) : null}
                            </>
                          )}
                        </Listbox.Option>
                      ))}
                    </Listbox.Options>
                  </div>
                </Listbox>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Estimated Cost
                </label>
                <input
                  type="number"
                  step="0.01"
                  {...register('cost', { 
                    min: { value: 0, message: 'Cost cannot be negative' }
                  })}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                />
                {errors.cost && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.cost.message}</p>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-4">
            <Link
              to="/maintenance"
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
              {isSubmitting ? 'Creating...' : 'Schedule Maintenance'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}