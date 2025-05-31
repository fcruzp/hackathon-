import { Dialog, Listbox } from '@headlessui/react';
import { X, Save, Check, ChevronsDownUp as ChevronUpDown } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useState, useEffect } from 'react';
import type { Vehicle, Driver } from '../../types';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import { logActivity } from '../../lib/logActivity';
import { useAuthStore } from '../../stores/auth-store';
import ImageUploadModal from './ImageUploadModal';

interface VehicleCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (vehicle: Vehicle) => void;
}

export default function VehicleCreateModal({ isOpen, onClose, onSave }: VehicleCreateModalProps) {
  const [availableDrivers, setAvailableDrivers] = useState<Driver[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<Vehicle>();
  const { user } = useAuthStore();
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchDrivers();
    }
  }, [isOpen]);

  const fetchDrivers = async () => {
    try {
      // Get all drivers
      const { data: allDrivers, error: driversError } = await supabase
        .from('users')
        .select(`
          id,
          email,
          first_name,
          last_name,
          role,
          position,
          image_url,
          created_at,
          license_number,
          license_expiry
        `)
        .eq('role', 'driver')
        .order('first_name');

      if (driversError) throw driversError;

      // Then, get all vehicles with assigned drivers to filter out unavailable drivers
      const { data: assignedVehicles, error: vehiclesError } = await supabase
        .from('vehicles')
        .select('assigned_driver_id')
        .not('assigned_driver_id', 'is', null);

      if (vehiclesError) throw vehiclesError;

      // Create a set of assigned driver IDs
      const assignedDriverIds = new Set(assignedVehicles.map(v => v.assigned_driver_id));

      // Filter out drivers that are already assigned to other vehicles
      const availableDriversList = allDrivers
        .filter(driver => !assignedDriverIds.has(driver.id))
        .map(driver => ({
          id: driver.id,
          email: driver.email,
          firstName: driver.first_name,
          lastName: driver.last_name,
          role: driver.role,
          position: driver.position || undefined,
          imageUrl: driver.image_url || undefined,
          createdAt: driver.created_at,
          licenseNumber: driver.license_number || '',
          licenseExpiry: driver.license_expiry || '',
          vehicleHistory: [],
          isAvailable: true,
        }));

      setAvailableDrivers(availableDriversList);
    } catch (err) {
      console.error('Error fetching drivers:', err);
      toast.error('Failed to load available drivers');
    } finally {
      setIsLoading(false);
    }
  };

  const selectedDriver = availableDrivers.find(d => d.id === watch('assignedDriverId'));

  const onSubmit = async (data: Vehicle) => {
    try {
      setIsSubmitting(true);

      if (!selectedImageUrl) {
        toast.error('Debes seleccionar una imagen para el vehículo');
        setIsSubmitting(false);
        return;
      }

      const { data: newVehicle, error: insertError } = await supabase
        .from('vehicles')
        .insert({
          make: data.make,
          model: data.model,
          year: data.year,
          license_plate: data.licensePlate,
          vin: data.vin,
          color: data.color,
          status: data.status,
          assigned_driver_id: data.assignedDriverId || null,
          image_url: selectedImageUrl,
          insurance_policy: data.insurancePolicy || null,
          insurance_expiry: data.insuranceExpiry || null,
          last_maintenance_date: data.lastMaintenanceDate || null,
          next_maintenance_date: data.nextMaintenanceDate || null,
          mileage: data.mileage,
          odometer_reading: data.odometerReading,
          fuel_type: data.fuelType,
          notes: data.notes || null,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Registrar log
      if (user) {
        await logActivity({
          userId: user.id,
          action: 'create',
          entity: 'vehicle',
          entityId: newVehicle.id,
          description: `Creó el vehículo: ${data.make} ${data.model}`,
        });
      }

      onSave(newVehicle);
      toast.success('Vehicle created successfully');
    } catch (error) {
      console.error('Failed to create vehicle:', error);
      toast.error('Failed to create vehicle');
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
              Create Vehicle
            </Dialog.Title>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Make
                </label>
                <input
                  type="text"
                  {...register('make', { required: 'Make is required' })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                {errors.make && (
                  <p className="mt-1 text-sm text-red-600">{errors.make.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Model
                </label>
                <input
                  type="text"
                  {...register('model', { required: 'Model is required' })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                {errors.model && (
                  <p className="mt-1 text-sm text-red-600">{errors.model.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Year
                </label>
                <input
                  type="number"
                  {...register('year', { 
                    required: 'Year is required',
                    min: { value: 1900, message: 'Year must be 1900 or later' },
                    max: { value: new Date().getFullYear() + 1, message: 'Invalid year' }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                {errors.year && (
                  <p className="mt-1 text-sm text-red-600">{errors.year.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Color
                </label>
                <input
                  type="text"
                  {...register('color', { required: 'Color is required' })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                {errors.color && (
                  <p className="mt-1 text-sm text-red-600">{errors.color.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  License Plate
                </label>
                <input
                  type="text"
                  {...register('licensePlate', { required: 'License plate is required' })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                {errors.licensePlate && (
                  <p className="mt-1 text-sm text-red-600">{errors.licensePlate.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  VIN
                </label>
                <input
                  type="text"
                  {...register('vin', { 
                    required: 'VIN is required',
                    pattern: {
                      value: /^[A-HJ-NPR-Z0-9]{17}$/,
                      message: 'Invalid VIN format'
                    }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                {errors.vin && (
                  <p className="mt-1 text-sm text-red-600">{errors.vin.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Status
                </label>
                <select
                  {...register('status')}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="active">Active</option>
                  <option value="maintenance">In Maintenance</option>
                  <option value="pendingMaintenance">Maintenance Pending</option>
                  <option value="outOfService">Out of Service</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Assigned Driver
                </label>
                {isLoading ? (
                  <div className="flex items-center justify-center h-10">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600"></div>
                  </div>
                ) : (
                  <Listbox
                    value={selectedDriver?.id || ''}
                    onChange={(value) => setValue('assignedDriverId', value)}
                  >
                    <div className="relative mt-1">
                      <Listbox.Button className="relative w-full cursor-default rounded-lg bg-white dark:bg-gray-700 py-2 pl-3 pr-10 text-left border border-gray-300 dark:border-gray-600">
                        <span className="block truncate">
                          {selectedDriver ? `${selectedDriver.firstName} ${selectedDriver.lastName}` : 'No driver assigned'}
                        </span>
                        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                          <ChevronUpDown className="h-5 w-5 text-gray-400" aria-hidden="true" />
                        </span>
                      </Listbox.Button>
                      <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-gray-700 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        <Listbox.Option
                          value=""
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
                                No driver assigned
                              </span>
                              {selected && (
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-primary-600 dark:text-primary-400">
                                  <Check className="h-5 w-5" aria-hidden="true" />
                                </span>
                              )}
                            </>
                          )}
                        </Listbox.Option>
                        {availableDrivers.map((driver) => (
                          <Listbox.Option
                            key={driver.id}
                            value={driver.id}
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
                                  {driver.firstName} {driver.lastName}
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
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Purchase Date
                </label>
                <input
                  type="date"
                  {...register('purchaseDate', { required: 'Purchase date is required' })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                {errors.purchaseDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.purchaseDate.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Mileage
                </label>
                <input
                  type="number"
                  {...register('mileage', { 
                    required: 'Mileage is required',
                    min: { value: 0, message: 'Mileage cannot be negative' }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                {errors.mileage && (
                  <p className="mt-1 text-sm text-red-600">{errors.mileage.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Odometer Reading
                </label>
                <input
                  type="number"
                  {...register('odometerReading', { 
                    required: 'Odometer reading is required',
                    min: { value: 0, message: 'Odometer reading cannot be negative' }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                {errors.odometerReading && (
                  <p className="mt-1 text-sm text-red-600">{errors.odometerReading.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Fuel Type
                </label>
                <select
                  {...register('fuelType')}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="gasoline">Gasoline</option>
                  <option value="diesel">Diesel</option>
                  <option value="electric">Electric</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 mt-4">
                Notes
              </label>
              <textarea
                {...register('notes')}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Imagen del vehículo <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => setIsImageModalOpen(true)}
                className="w-full aspect-video bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 flex items-center justify-center"
              >
                {selectedImageUrl ? (
                  <img
                    src={selectedImageUrl}
                    alt="Previsualización"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 py-8">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a4 4 0 004 4h10a4 4 0 004-4V7a4 4 0 00-4-4H7a4 4 0 00-4 4z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11l4 4 4-4" /></svg>
                    <span className="text-sm">Haz clic para seleccionar una imagen</span>
                  </div>
                )}
              </button>
            </div>

            <div className="mt-6 flex justify-end space-x-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 flex items-center"
                disabled={isSubmitting}
              >
                <Save className="h-5 w-5 mr-2" />
                Crear vehículo
              </button>
            </div>
          </form>
          <ImageUploadModal
            isOpen={isImageModalOpen}
            onClose={() => setIsImageModalOpen(false)}
            bucket="user-images"
            folder="vehicles/"
            onImageSelect={(url) => {
              setSelectedImageUrl(url);
              setIsImageModalOpen(false);
            }}
            selectedUrl={selectedImageUrl}
          />
        </Dialog.Panel>
      </div>
    </Dialog>
  );
} 