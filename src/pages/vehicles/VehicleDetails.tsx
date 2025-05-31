import React, { useState, useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { ArrowLeft, Car, Calendar, User, PenTool as Tool, Fuel, Hash, Palette, FileText, Shield, Edit2, UserPlus, History, Image } from 'lucide-react';
import type { Vehicle, Driver } from '../../types';
import AssignDriverModal from '../../components/vehicles/AssignDriverModal';
import VehicleEditModal from '../../components/vehicles/VehicleEditModal';
import MaintenanceTimeline from '../../components/vehicles/MaintenanceTimeline';
import ImageUploadModal from '../../components/vehicles/ImageUploadModal';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import { validate as uuidValidate } from 'uuid';

export default function VehicleDetails() {
  const { id } = useParams();
  const [isAssignDriverModalOpen, setIsAssignDriverModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showMaintenanceLog, setShowMaintenanceLog] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [assignedDriver, setAssignedDriver] = useState<Driver | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id || !uuidValidate(id)) {
      setError('Invalid vehicle ID');
      setIsLoading(false);
      return;
    }
    fetchVehicle();
  }, [id]);

  useEffect(() => {
    if (vehicle?.assignedDriverId) {
      fetchDriver(vehicle.assignedDriverId);
    }
  }, [vehicle?.assignedDriverId]);

  const fetchVehicle = async () => {
    try {
      console.log('Fetching vehicle with ID:', id);
      const { data, error: fetchError } = await supabase
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
          insurance_policy,
          insurance_expiry,
          last_maintenance_date,
          next_maintenance_date,
          mileage,
          odometer_reading,
          purchase_date,
          fuel_type,
          notes,
          created_at
        `)
        .eq('id', id)
        .single();

      console.log('Vehicle fetch response:', { 
        data, 
        error: fetchError,
        assignedDriverId: data?.assigned_driver_id 
      });

      if (fetchError) throw fetchError;

      if (!data) {
        setError('Vehicle not found');
        return;
      }

      setVehicle({
        id: data.id,
        make: data.make,
        model: data.model,
        year: data.year,
        licensePlate: data.license_plate,
        vin: data.vin,
        color: data.color,
        status: data.status,
        assignedDriverId: data.assigned_driver_id || undefined,
        imageUrl: data.image_url || undefined,
        insurancePolicy: data.insurance_policy || undefined,
        insuranceExpiry: data.insurance_expiry || undefined,
        lastMaintenanceDate: data.last_maintenance_date || undefined,
        nextMaintenanceDate: data.next_maintenance_date || undefined,
        mileage: data.mileage,
        odometerReading: data.odometer_reading,
        purchaseDate: data.purchase_date,
        fuelType: data.fuel_type,
        notes: data.notes || undefined,
        createdAt: data.created_at,
      });
    } catch (err) {
      console.error('Error fetching vehicle details:', {
        error: err,
        vehicleId: id,
        timestamp: new Date().toISOString()
      });
      setError('Failed to load vehicle data');
      toast.error('Failed to load vehicle data');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDriver = async (driverId: string) => {
    try {
      console.log('Fetching driver with ID:', driverId);
      const { data, error: fetchError } = await supabase
        .from('users')
        .select(`
          id,
          email,
          first_name,
          last_name,
          role,
          position,
          image_url,
          license_image_url,
          created_at
        `)
        .eq('id', driverId)
        .single();

      console.log('Driver fetch response:', { data, error: fetchError });

      if (fetchError) {
        console.error('Driver fetch error details:', fetchError);
        throw fetchError;
      }

      if (!data) {
        console.log('No driver data found for ID:', driverId);
        setAssignedDriver(null);
        return;
      }

      console.log('Setting driver data:', data);
      setAssignedDriver({
        id: data.id,
        email: data.email,
        firstName: data.first_name,
        lastName: data.last_name,
        role: data.role,
        position: data.position || undefined,
        imageUrl: data.image_url || undefined,
        licenseImageUrl: data.license_image_url || undefined,
        createdAt: data.created_at,
        licenseNumber: '',
        licenseExpiry: '',
        vehicleHistory: [],
        isAvailable: true,
      });
    } catch (err) {
      console.error('Error fetching driver details:', {
        error: err,
        driverId,
        timestamp: new Date().toISOString()
      });
      toast.error('Failed to load driver information');
      setAssignedDriver(null);
    }
  };

  const handleAssignDriver = async (driverId: string) => {
    try {
      const { error: updateError } = await supabase
        .from('vehicles')
        .update({ assigned_driver_id: driverId })
        .eq('id', id);

      if (updateError) throw updateError;

      await fetchDriver(driverId);
      setIsAssignDriverModalOpen(false);
      toast.success('Driver assigned successfully');
    } catch (err) {
      console.error('Error assigning driver:', err);
      toast.error('Failed to assign driver');
    }
  };

  const handleVehicleUpdate = async (updatedVehicle: Vehicle) => {
    try {
      const { error: updateError } = await supabase
        .from('vehicles')
        .update({
          make: updatedVehicle.make,
          model: updatedVehicle.model,
          year: updatedVehicle.year,
          license_plate: updatedVehicle.licensePlate,
          vin: updatedVehicle.vin,
          color: updatedVehicle.color,
          status: updatedVehicle.status,
          image_url: updatedVehicle.imageUrl || null,
          insurance_policy: updatedVehicle.insurancePolicy || null,
          insurance_expiry: updatedVehicle.insuranceExpiry || null,
          last_maintenance_date: updatedVehicle.lastMaintenanceDate || null,
          next_maintenance_date: updatedVehicle.nextMaintenanceDate || null,
          mileage: updatedVehicle.mileage,
          odometer_reading: updatedVehicle.odometerReading,
          fuel_type: updatedVehicle.fuelType,
          notes: updatedVehicle.notes || null,
        })
        .eq('id', id);

      if (updateError) throw updateError;

      setVehicle(updatedVehicle);
      setIsEditModalOpen(false);
      toast.success('Vehicle updated successfully');
    } catch (err) {
      console.error('Error updating vehicle:', err);
      toast.error('Failed to update vehicle');
    }
  };

  const handleImageSelect = async (imageUrl: string | null) => {
    if (!vehicle) return;

    try {
      const { error: updateError } = await supabase
        .from('vehicles')
        .update({ image_url: imageUrl })
        .eq('id', vehicle.id);

      if (updateError) throw updateError;

      setVehicle({ ...vehicle, imageUrl: imageUrl || undefined });
      toast.success('Vehicle image updated successfully');
    } catch (err) {
      console.error('Error updating vehicle image:', err);
      toast.error('Failed to update vehicle image');
    }
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200">{error}</p>
          <Link
            to="/vehicles"
            className="mt-4 inline-flex items-center text-red-800 dark:text-red-200 hover:underline"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Vehicles
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return <Navigate to="/vehicles" replace />;
  }

  const detailSections = [
    {
      title: 'Vehicle Information',
      icon: Car,
      items: [
        { label: 'Make', value: vehicle.make },
        { label: 'Model', value: vehicle.model },
        { label: 'Year', value: vehicle.year },
        { label: 'VIN', value: vehicle.vin },
        { label: 'Color', value: vehicle.color },
        { label: 'Purchase Date', value: new Date(vehicle.purchaseDate).toLocaleDateString() },
      ],
    },
    {
      title: 'Status & Metrics',
      icon: Hash,
      items: [
        { label: 'Status', value: vehicle.status.charAt(0).toUpperCase() + vehicle.status.slice(1) },
        { label: 'Mileage', value: `${vehicle.mileage.toLocaleString()} km` },
        { label: 'Odometer Reading', value: `${vehicle.odometerReading.toLocaleString()} km` },
        { label: 'Fuel Type', value: vehicle.fuelType.charAt(0).toUpperCase() + vehicle.fuelType.slice(1) },
      ],
    },
    {
      title: 'Insurance',
      icon: Shield,
      items: [
        { label: 'Policy Number', value: vehicle.insurancePolicy || 'Not available' },
        { label: 'Expiry Date', value: vehicle.insuranceExpiry ? new Date(vehicle.insuranceExpiry).toLocaleDateString() : 'Not available' },
      ],
    },
    {
      title: 'Maintenance',
      icon: Tool,
      items: [
        { label: 'Last Service', value: vehicle.lastMaintenanceDate ? new Date(vehicle.lastMaintenanceDate).toLocaleDateString() : 'Not available' },
        { label: 'Next Service', value: vehicle.nextMaintenanceDate ? new Date(vehicle.nextMaintenanceDate).toLocaleDateString() : 'Not available' },
      ],
    },
  ];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <Link
          to="/vehicles"
          className="inline-flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Vehicles
        </Link>
        <div className="flex space-x-4">
          <button
            onClick={() => setShowMaintenanceLog(!showMaintenanceLog)}
            className="inline-flex items-center px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            <History className="h-5 w-5 mr-2" />
            {showMaintenanceLog ? 'Hide Maintenance Log' : 'Show Maintenance Log'}
          </button>
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            <Edit2 className="h-5 w-5 mr-2" />
            Edit Vehicle
          </button>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <div className="p-6 border-b dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {vehicle.make} {vehicle.model} ({vehicle.year})
              </h1>
              <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                vehicle.status === 'active' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100' :
                vehicle.status === 'maintenance' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-100' :
                vehicle.status === 'pendingMaintenance' ? 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-100' :
                'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100'
              }`}>
                {vehicle.status.charAt(0).toUpperCase() + vehicle.status.slice(1)}
              </span>
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Vehicle Image Section */}
            <div className="md:col-span-1">
              <button
                onClick={() => setIsImageModalOpen(true)}
                className="w-full aspect-video bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                {vehicle.imageUrl ? (
                  <img
                    src={vehicle.imageUrl}
                    alt={`${vehicle.make} ${vehicle.model}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
                    <Image className="h-12 w-12 mb-2" />
                    <span className="text-sm">Click to add vehicle image</span>
                  </div>
                )}
              </button>
            </div>

            {/* Driver Section */}
            <div className="md:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                  <User className="h-5 w-5 text-primary-600 dark:text-primary-400 mr-2" />
                  Assigned Driver
                </h2>
                <button
                  onClick={() => setIsAssignDriverModalOpen(true)}
                  className="inline-flex items-center px-3 py-1.5 bg-primary-600 text-white rounded-md hover:bg-primary-700 text-sm"
                >
                  <UserPlus className="h-4 w-4 mr-1.5" />
                  {assignedDriver ? 'Change Driver' : 'Assign Driver'}
                </button>
              </div>

              {assignedDriver ? (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center space-x-4">
                    {assignedDriver.imageUrl ? (
                      <img
                        src={assignedDriver.imageUrl}
                        alt={`${assignedDriver.firstName} ${assignedDriver.lastName}`}
                        className="h-12 w-12 rounded-full"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                        <span className="text-primary-700 dark:text-primary-300 text-lg font-medium">
                          {assignedDriver.firstName[0]}{assignedDriver.lastName[0]}
                        </span>
                      </div>
                    )}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        {assignedDriver.firstName} {assignedDriver.lastName}
                      </h3>
                      <div className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                        <p>Position: {assignedDriver.position ? assignedDriver.position.charAt(0).toUpperCase() + assignedDriver.position.slice(1) : 'Not assigned'}</p>
                        <p>Email: {assignedDriver.email}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center text-gray-600 dark:text-gray-300">
                  No driver currently assigned
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
            {detailSections.map((section) => {
              const Icon = section.icon;
              return (
                <div key={section.title} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <Icon className="h-5 w-5 text-primary-600 dark:text-primary-400 mr-2" />
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{section.title}</h2>
                  </div>
                  <div className="space-y-3">
                    {section.items.map((item) => (
                      <div key={item.label} className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-300">{item.label}</span>
                        <span className="font-medium text-gray-900 dark:text-white">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {vehicle.notes && (
            <div className="p-6 border-t dark:border-gray-700">
              <div className="flex items-center mb-4">
                <FileText className="h-5 w-5 text-primary-600 dark:text-primary-400 mr-2" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Notes</h2>
              </div>
              <p className="text-gray-600 dark:text-gray-300">{vehicle.notes}</p>
            </div>
          )}
        </div>

        {showMaintenanceLog && (
          <MaintenanceTimeline vehicleId={vehicle.id} />
        )}
      </div>

      <AssignDriverModal
        vehicle={vehicle}
        isOpen={isAssignDriverModalOpen}
        onClose={() => setIsAssignDriverModalOpen(false)}
        onAssign={handleAssignDriver}
      />

      <VehicleEditModal
        vehicle={vehicle}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleVehicleUpdate}
      />

      <ImageUploadModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        bucket="user-images"
        folder="vehicles"
        onImageSelect={handleImageSelect}
        selectedUrl={vehicle.imageUrl || null}
      />
    </div>
  );
}