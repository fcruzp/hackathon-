import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, Filter, Car, User } from 'lucide-react';
import { useLanguageStore } from '../../stores/language-store';
import { translations } from '../../translations';
import type { Vehicle, VehicleStatus, Driver } from '../../types';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import { logActivity } from '../../lib/logActivity';
import { useAuthStore } from '../../stores/auth-store';

export default function VehicleList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<VehicleStatus | 'all'>('all');
  const { language } = useLanguageStore();
  const t = translations[language].vehicles.list;
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [drivers, setDrivers] = useState<Record<string, Driver>>({});
  const { user } = useAuthStore();

  useEffect(() => {
    fetchVehicles();
  }, []);

  useEffect(() => {
    if (vehicles.length > 0) {
      const driverIds = vehicles
        .map(v => v.assignedDriverId)
        .filter((id): id is string => id !== null && id !== undefined);
      
      if (driverIds.length > 0) {
        fetchDrivers(driverIds);
      }
    }
  }, [vehicles]);

  const fetchVehicles = async () => {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select(`
          id,
          make,
          model,
          year,
          license_plate,
          vin,
          color,
          status,
          assigned_driver_id,
          image_url,
          mileage,
          fuel_type,
          created_at,
          odometer_reading,
          purchase_date
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mappedVehicles: Vehicle[] = data.map(vehicle => ({
        id: vehicle.id,
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        licensePlate: vehicle.license_plate,
        vin: vehicle.vin,
        color: vehicle.color,
        status: vehicle.status,
        assignedDriverId: vehicle.assigned_driver_id || undefined,
        imageUrl: vehicle.image_url || undefined,
        mileage: vehicle.mileage,
        fuelType: vehicle.fuel_type,
        createdAt: vehicle.created_at,
        odometerReading: vehicle.odometer_reading,
        purchaseDate: vehicle.purchase_date,
      }));

      setVehicles(mappedVehicles);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      toast.error('Failed to load vehicles');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDrivers = async (driverIds: string[]) => {
    try {
      const validDriverIds = driverIds.filter(id => !!id);
      if (validDriverIds.length === 0) {
        setDrivers({});
        return;
      }
      console.log('Consultando drivers con IDs:', validDriverIds);
      const { data, error } = await supabase
        .from('users')
        .select(`
          id,
          email,
          first_name,
          last_name,
          role,
          position,
          created_at
        `)
        .in('id', validDriverIds);

      if (error) {
        console.error('Supabase error:', error);
        toast.error('Error al consultar conductores: ' + error.message);
        return;
      }
      if (!Array.isArray(data)) {
        console.error('Respuesta inesperada de Supabase:', data);
        toast.error('No se pudieron cargar los conductores asignados.');
        return;
      }

      const driversMap: Record<string, Driver> = {};
      data.forEach(driver => {
        driversMap[driver.id] = {
          id: driver.id,
          email: driver.email,
          firstName: driver.first_name,
          lastName: driver.last_name,
          role: driver.role,
          position: driver.position || undefined,
          createdAt: driver.created_at,
          licenseNumber: '',
          licenseExpiry: '',
          vehicleHistory: [],
          isAvailable: true,
        };
      });

      setDrivers(driversMap);
    } catch (error) {
      console.error('Error inesperado al cargar conductores:', error);
      toast.error('Error inesperado al cargar conductores. Revisa la consola.');
    }
  };

  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesSearch = 
      vehicle.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (vehicle.assignedDriverId && drivers[vehicle.assignedDriverId]?.firstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (vehicle.assignedDriverId && drivers[vehicle.assignedDriverId]?.lastName.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || vehicle.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const statusColors = {
    active: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100',
    maintenance: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100',
    pendingMaintenance: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-100',
    outOfService: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100',
  };

  const handleDeleteVehicle = async (vehicle: Vehicle) => {
    try {
      const { error } = await supabase
        .from('vehicles')
        .delete()
        .eq('id', vehicle.id);

      if (error) throw error;

      if (!user) throw new Error('Usuario no autenticado');
      await logActivity({
        userId: user.id,
        action: 'delete',
        entity: 'vehicle',
        entityId: vehicle.id,
        description: `Eliminó el vehículo: ${vehicle.make} ${vehicle.model}`,
      });

      toast.success('Vehicle deleted successfully');
      fetchVehicles();
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      toast.error('Failed to delete vehicle');
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t.title}</h1>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t.title}</h1>
        <Link
          to="/vehicles/new"
          className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
        >
          <Plus className="w-5 h-5 mr-2" />
          {t.addVehicle}
        </Link>
      </div>

      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-5 w-5" />
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-md focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="text-gray-400 dark:text-gray-500 h-5 w-5" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as VehicleStatus | 'all')}
            className="flex-1 border border-gray-300 dark:border-gray-600 rounded-md p-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="maintenance">In Maintenance</option>
            <option value="pendingMaintenance">Maintenance Pending</option>
            <option value="outOfService">Out of Service</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVehicles.map((vehicle) => {
          const assignedDriver = vehicle.assignedDriverId ? drivers[vehicle.assignedDriverId] : null;
          return (
            <Link
              key={vehicle.id}
              to={`/vehicles/${vehicle.id}`}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden"
            >
              <div className="aspect-w-16 aspect-h-9 relative">
                <img
                  src={vehicle.imageUrl}
                  alt={`${vehicle.make} ${vehicle.model}`}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-4 right-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[vehicle.status]}`}>
                    {vehicle.status === 'active' && 'Active'}
                    {vehicle.status === 'maintenance' && 'In Maintenance'}
                    {vehicle.status === 'pendingMaintenance' && 'Maintenance Pending'}
                    {vehicle.status === 'outOfService' && 'Out of Service'}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Car className="h-8 w-8 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {vehicle.make} {vehicle.model}
                </h3>
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <p>{t.details.year}: {vehicle.year}</p>
                  <p>{t.details.licensePlate}: {vehicle.licensePlate}</p>
                  <p>{t.details.mileage}: {vehicle.mileage.toLocaleString()} km</p>
                  <p>{t.details.fuelType}: {vehicle.fuelType.charAt(0).toUpperCase() + vehicle.fuelType.slice(1)}</p>
                </div>
                
                {/* Driver Information */}
                <div className="mt-4 pt-4 border-t dark:border-gray-700">
                  <div className="flex items-center space-x-3">
                    <User className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                    <div>
                      {assignedDriver ? (
                        <>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {assignedDriver.firstName} {assignedDriver.lastName}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {assignedDriver.position ? assignedDriver.position.charAt(0).toUpperCase() + assignedDriver.position.slice(1) : ''}
                          </p>
                        </>
                      ) : (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          No driver assigned
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}

        {filteredVehicles.length === 0 && (
          <div className="col-span-full text-center py-12">
            <Car className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No vehicles found</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {searchTerm || statusFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Get started by adding a new vehicle'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}