import { Dialog, Listbox } from '@headlessui/react';
import { X, Calendar, Car, PenTool as Tool, DollarSign, Save, Edit2, Check, ChevronsDownUp as ChevronUpDown } from 'lucide-react';
import { format } from 'date-fns';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import type { MaintenanceEvent, ServiceProvider, Vehicle } from '../../types';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import { logActivity } from '../../lib/logActivity';
import { useAuthStore } from '../../stores/auth-store';

interface MaintenanceDetailsModalProps {
  maintenance: MaintenanceEvent | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function MaintenanceDetailsModal({ maintenance, isOpen, onClose }: MaintenanceDetailsModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serviceProviders, setServiceProviders] = useState<ServiceProvider[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm<MaintenanceEvent>();
  const { user } = useAuthStore();

  useEffect(() => {
    if (isOpen && maintenance) {
      reset(maintenance);
      fetchServiceProviders();
      fetchVehicles();
    }
  }, [isOpen, maintenance, reset]);

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
        odometerReading: vehicle.odometer_reading,
        purchaseDate: vehicle.purchase_date,
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

  if (!maintenance) return null;

  const selectedProvider = serviceProviders.find(p => p.name === watch('serviceProvider'));
  const selectedVehicle = vehicles.find(v => v.id === watch('vehicleId'));

  const statusColors = {
    pending: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-100',
    inProgress: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100',
    completed: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100',
    cancelled: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100',
  };

  const onSubmit = async (data: MaintenanceEvent) => {
    try {
      setIsSubmitting(true);

      // Find service provider ID from name
      const serviceProvider = serviceProviders.find(p => p.name === data.serviceProvider);

      const { error: updateError } = await supabase
        .from('maintenance_events')
        .update({
          title: data.title,
          description: data.description,
          type: data.type,
          status: data.status,
          start_date: data.startDate,
          end_date: data.endDate,
          cost: data.cost || null,
          service_provider_id: serviceProvider?.id || null,
          vehicle_id: data.vehicleId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', maintenance.id);

      if (updateError) throw updateError;

      // Registrar log
      await logActivity({
        userId: user.id,
        action: 'update',
        entity: 'maintenance',
        entityId: maintenance.id,
        description: `Editó el mantenimiento: ${data.title}`,
      });

      toast.success('Maintenance event updated successfully');
      setIsEditing(false);
      onClose();
    } catch (error) {
      console.error('Failed to update maintenance:', error);
      toast.error('Failed to update maintenance event');
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
              {isEditing ? (
                <input
                  type="text"
                  {...register('title', { required: 'Title is required' })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              ) : (
                maintenance.title
              )}
            </Dialog.Title>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="p-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  {isEditing ? (
                    <>
                      <select
                        {...register('status')}
                        className="px-3 py-1 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="pending">Pending</option>
                        <option value="inProgress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                      <select
                        {...register('type')}
                        className="px-3 py-1 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="scheduled">Scheduled</option>
                        <option value="emergency">Emergency</option>
                        <option value="repair">Repair</option>
                      </select>
                    </>
                  ) : (
                    <>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[maintenance.status]}`}>
                        {maintenance.status.charAt(0).toUpperCase() + maintenance.status.slice(1)}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        maintenance.type === 'emergency' ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100' :
                        maintenance.type === 'repair' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-100' :
                        'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100'
                      }`}>
                        {maintenance.type.charAt(0).toUpperCase() + maintenance.type.slice(1)}
                      </span>
                    </>
                  )}
                </div>

                <div className="text-gray-600 dark:text-gray-300">
                  {isEditing ? (
                    <textarea
                      {...register('description')}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  ) : (
                    maintenance.description
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
                    <Car className="h-5 w-5" />
                    <div>
                      <div className="text-sm font-medium">Vehicle</div>
                      {isEditing ? (
                        <Listbox
                          value={selectedVehicle?.id || ''}
                          onChange={(value) => setValue('vehicleId', value)}
                        >
                          <div className="relative mt-1">
                            <Listbox.Button className="relative w-full cursor-default rounded-lg bg-white dark:bg-gray-700 py-2 pl-3 pr-10 text-left border border-gray-300 dark:border-gray-600 focus:outline-none focus-visible:border-primary-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-primary-300">
                              <span className="block truncate">
                                {selectedVehicle ? `${selectedVehicle.make} ${selectedVehicle.model}` : 'Select a vehicle'}
                              </span>
                              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                <ChevronUpDown className="h-5 w-5 text-gray-400" aria-hidden="true" />
                              </span>
                            </Listbox.Button>
                            <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-gray-700 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                              {vehicles.map((vehicle) => (
                                <Listbox.Option
                                  key={vehicle.id}
                                  value={vehicle.id}
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
                                        {`${vehicle.make} ${vehicle.model}`}
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
                      ) : (
                        <div>{maintenance.vehicle || 'No vehicle assigned'}</div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
                    <Calendar className="h-5 w-5" />
                    <div>
                      <div className="text-sm font-medium">Start</div>
                      {isEditing ? (
                        <input
                          type="datetime-local"
                          {...register('startDate')}
                          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      ) : (
                        <div>{format(new Date(maintenance.startDate), 'PPp')}</div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
                    <Calendar className="h-5 w-5" />
                    <div>
                      <div className="text-sm font-medium">End</div>
                      {isEditing ? (
                        <input
                          type="datetime-local"
                          {...register('endDate')}
                          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      ) : (
                        <div>{format(new Date(maintenance.endDate), 'PPp')}</div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
                    <Tool className="h-5 w-5" />
                    <div>
                      <div className="text-sm font-medium">Service Provider</div>
                      {isEditing ? (
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
                      ) : (
                        <div>{maintenance.serviceProvider || 'Not assigned'}</div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
                    <DollarSign className="h-5 w-5" />
                    <div>
                      <div className="text-sm font-medium">Estimated Cost</div>
                      {isEditing ? (
                        <input
                          type="number"
                          step="0.01"
                          {...register('cost')}
                          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      ) : (
                        <div>${maintenance.cost?.toFixed(2) || '0.00'}</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 p-6 border-t dark:border-gray-700">
              {isEditing ? (
                <>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
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
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsEditing(true);
                    }}
                    className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 flex items-center"
                  >
                    <Edit2 className="h-5 w-5 mr-2" />
                    Edit
                  </button>
                </>
              )}
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}