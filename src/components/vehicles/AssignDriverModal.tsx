import { Dialog } from '@headlessui/react';
import { X, Save, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { Vehicle, Driver } from '../../types';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface AssignDriverModalProps {
  vehicle: Vehicle | null;
  isOpen: boolean;
  onClose: () => void;
  onAssign: (driverId: string) => void;
}

export default function AssignDriverModal({ vehicle, isOpen, onClose, onAssign }: AssignDriverModalProps) {
  const [selectedDriverId, setSelectedDriverId] = useState<string>('');
  const [availableDrivers, setAvailableDrivers] = useState<Driver[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchDrivers();
    }
  }, [isOpen]);

  const fetchDrivers = async () => {
    try {
      // First, get all drivers
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
          created_at
        `)
        .eq('role', 'driver')
        .order('first_name');

      if (driversError) throw driversError;

      // Then, get all vehicles with assigned drivers to filter out unavailable drivers
      const { data: assignedVehicles, error: vehiclesError } = await supabase
        .from('vehicles')
        .select('assigned_driver_id')
        .not('assigned_driver_id', 'is', null)
        .neq('id', vehicle?.id || ''); // Exclude current vehicle's assigned driver

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
        }));

      setAvailableDrivers(availableDriversList);
    } catch (err) {
      console.error('Error fetching drivers:', err);
      toast.error('Failed to load available drivers');
    } finally {
      setIsLoading(false);
    }
  };

  if (!vehicle) return null;

  const handleAssign = async () => {
    if (!selectedDriverId) return;

    try {
      setIsSubmitting(true);

      // Start a transaction to update both tables
      const { error: updateError } = await supabase
        .from('vehicles')
        .update({ assigned_driver_id: selectedDriverId })
        .eq('id', vehicle.id);

      if (updateError) throw updateError;

      // Call the onAssign callback with the selected driver ID
      onAssign(selectedDriverId);
      toast.success('Driver assigned successfully');
      onClose();
    } catch (err) {
      console.error('Error assigning driver:', err);
      toast.error('Failed to assign driver');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl">
          <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
            <Dialog.Title className="text-xl font-semibold text-gray-900 dark:text-white">
              Assign Driver
            </Dialog.Title>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="p-6">
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Vehicle
              </h3>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <p className="text-gray-900 dark:text-white font-medium">
                  {vehicle.make} {vehicle.model} ({vehicle.year})
                </p>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  License Plate: {vehicle.licensePlate}
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Driver
              </label>
              {isLoading ? (
                <div className="flex items-center justify-center p-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
                </div>
              ) : availableDrivers.length > 0 ? (
                <div className="space-y-2">
                  {availableDrivers.map((driver) => (
                    <label
                      key={driver.id}
                      className={`flex items-center p-3 rounded-lg border ${
                        selectedDriverId === driver.id
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                      } cursor-pointer transition-colors`}
                    >
                      <input
                        type="radio"
                        name="driver"
                        value={driver.id}
                        checked={selectedDriverId === driver.id}
                        onChange={(e) => setSelectedDriverId(e.target.value)}
                        className="sr-only"
                      />
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          {driver.imageUrl ? (
                            <img
                              src={driver.imageUrl}
                              alt={`${driver.firstName} ${driver.lastName}`}
                              className="h-10 w-10 rounded-full object-cover"
                            />
                          ) : (
                            <User className="h-10 w-10 text-gray-400 dark:text-gray-500" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {driver.firstName} {driver.lastName}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {driver.position ? (
                              driver.position.charAt(0).toUpperCase() + driver.position.slice(1)
                            ) : (
                              'No position assigned'
                            )}
                          </p>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                  No available drivers found
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 p-6 border-t dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAssign}
              disabled={!selectedDriverId || isLoading || isSubmitting}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="h-5 w-5 mr-2" />
              {isSubmitting ? 'Assigning...' : 'Assign Driver'}
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}