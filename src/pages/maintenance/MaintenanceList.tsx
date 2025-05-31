import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, Filter, Calendar, Edit2, Eye, Trash2, Car, Wrench, DollarSign } from 'lucide-react';
import type { MaintenanceEvent, ServiceProvider, Vehicle } from '../../types';
import MaintenanceDetailsModal from '../../components/maintenance/MaintenanceDetailsModal';
import DeleteConfirmationModal from '../../components/shared/DeleteConfirmationModal';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { logActivity } from '../../lib/logActivity';
import { useAuthStore } from '../../stores/auth-store';

export default function MaintenanceList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<MaintenanceEvent['status'] | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<MaintenanceEvent['type'] | 'all'>('all');
  const [serviceProviderFilter, setServiceProviderFilter] = useState<string>('all');
  const [vehicleFilter, setVehicleFilter] = useState<string>('all');
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');
  const [selectedMaintenance, setSelectedMaintenance] = useState<MaintenanceEvent | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [maintenanceEvents, setMaintenanceEvents] = useState<MaintenanceEvent[]>([]);
  const [serviceProviders, setServiceProviders] = useState<ServiceProvider[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingMaintenance, setDeletingMaintenance] = useState<MaintenanceEvent | null>(null);
  const { user } = useAuthStore();

  useEffect(() => {
    Promise.all([
      fetchMaintenanceEvents(),
      fetchServiceProviders(),
      fetchVehicles()
    ]).finally(() => {
      setIsLoading(false);
    });
  }, []);

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

  const fetchMaintenanceEvents = async () => {
    try {
      let query = supabase
        .from('maintenance_events')
        .select(`
          id,
          vehicle_id,
          title,
          description,
          type,
          status,
          start_date,
          end_date,
          cost,
          service_provider_id,
          created_by,
          created_at,
          updated_at,
          service_providers:service_provider_id (
            name
          ),
          vehicles:vehicle_id (
            make,
            model
          )
        `);

      // Apply date range filters if set
      if (startDateFilter) {
        query = query.gte('start_date', startDateFilter);
      }
      if (endDateFilter) {
        query = query.lte('start_date', endDateFilter);
      }

      query = query.order('start_date', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;

      const mappedEvents: MaintenanceEvent[] = data.map(event => {
        const providerArr = event.service_providers as { name: string }[] | undefined;
        const vehicleArr = event.vehicles as { make: string; model: string }[] | undefined;
        return {
          id: event.id,
          vehicleId: event.vehicle_id,
          title: event.title,
          description: event.description,
          type: event.type,
          status: event.status,
          startDate: event.start_date,
          endDate: event.end_date,
          cost: event.cost || undefined,
          serviceProvider: Array.isArray(providerArr)
            ? providerArr[0]?.name
            : (providerArr as any)?.name,
          createdBy: event.created_by,
          createdAt: event.created_at || '',
          updatedAt: event.updated_at || '',
          vehicle: Array.isArray(vehicleArr)
            ? (vehicleArr[0] ? `${vehicleArr[0].make} ${vehicleArr[0].model}` : 'No vehicle assigned')
            : (vehicleArr ? `${(vehicleArr as any).make} ${(vehicleArr as any).model}` : 'No vehicle assigned'),
        };
      });

      setMaintenanceEvents(mappedEvents);
    } catch (error) {
      console.error('Error fetching maintenance events:', error);
      toast.error('Failed to load maintenance events');
    }
  };

  const handleDelete = async () => {
    if (!deletingMaintenance) return;

    try {
      const { error } = await supabase
        .from('maintenance_events')
        .delete()
        .eq('id', deletingMaintenance.id);

      if (error) throw error;

      // Registrar log
      await logActivity({
        userId: user.id,
        action: 'delete',
        entity: 'maintenance',
        entityId: deletingMaintenance.id,
        description: `Eliminó el mantenimiento: ${deletingMaintenance.title}`,
      });

      setMaintenanceEvents(events => 
        events.filter(event => event.id !== deletingMaintenance.id)
      );
      toast.success('Maintenance event deleted successfully');
    } catch (error) {
      console.error('Error deleting maintenance event:', error);
      toast.error('Failed to delete maintenance event');
    } finally {
      setDeletingMaintenance(null);
    }
  };

  const filteredEvents = maintenanceEvents.filter(event => {
    const matchesSearch = 
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || event.status === statusFilter;
    const matchesType = typeFilter === 'all' || event.type === typeFilter;
    const matchesServiceProvider = serviceProviderFilter === 'all' || event.serviceProvider === serviceProviderFilter;
    const matchesVehicle = vehicleFilter === 'all' || event.vehicleId === vehicleFilter;
    
    return matchesSearch && matchesStatus && matchesType && matchesServiceProvider && matchesVehicle;
  });

  const statusColors = {
    pending: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-100',
    inProgress: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100',
    completed: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100',
    cancelled: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100',
  };

  const typeColors = {
    scheduled: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100',
    emergency: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100',
    repair: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-100',
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Maintenance Schedule</h1>
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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Maintenance Schedule</h1>
        <div className="flex space-x-4">
          <Link
            to="/maintenance/calendar"
            className="inline-flex items-center px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            <Calendar className="w-5 h-5 mr-2" />
            Calendar View
          </Link>
          <Link
            to="/maintenance/new"
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            New Maintenance
          </Link>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-5 w-5" />
          <input
            type="text"
            placeholder="Search maintenance events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-md focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="text-gray-400 dark:text-gray-500 h-5 w-5" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as MaintenanceEvent['status'] | 'all')}
            className="flex-1 border border-gray-300 dark:border-gray-600 rounded-md p-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="inProgress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="text-gray-400 dark:text-gray-500 h-5 w-5" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as MaintenanceEvent['type'] | 'all')}
            className="flex-1 border border-gray-300 dark:border-gray-600 rounded-md p-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">All Types</option>
            <option value="scheduled">Scheduled</option>
            <option value="emergency">Emergency</option>
            <option value="repair">Repair</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="text-gray-400 dark:text-gray-500 h-5 w-5" />
          <select
            value={serviceProviderFilter}
            onChange={(e) => setServiceProviderFilter(e.target.value)}
            className="flex-1 border border-gray-300 dark:border-gray-600 rounded-md p-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">All Service Providers</option>
            {serviceProviders.map((provider) => (
              <option key={provider.id} value={provider.name}>
                {provider.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="text-gray-400 dark:text-gray-500 h-5 w-5" />
          <select
            value={vehicleFilter}
            onChange={(e) => setVehicleFilter(e.target.value)}
            className="flex-1 border border-gray-300 dark:border-gray-600 rounded-md p-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">All Vehicles</option>
            {vehicles.map((vehicle) => (
              <option key={vehicle.id} value={vehicle.id}>
                {vehicle.make} {vehicle.model} ({vehicle.licensePlate})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <Calendar className="text-gray-400 dark:text-gray-500 h-5 w-5" />
          <input
            type="date"
            value={startDateFilter}
            onChange={(e) => setStartDateFilter(e.target.value)}
            className="flex-1 border border-gray-300 dark:border-gray-600 rounded-md p-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Calendar className="text-gray-400 dark:text-gray-500 h-5 w-5" />
          <input
            type="date"
            value={endDateFilter}
            onChange={(e) => setEndDateFilter(e.target.value)}
            className="flex-1 border border-gray-300 dark:border-gray-600 rounded-md p-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        <div className="flex items-center">
          <button
            onClick={() => {
              setStartDateFilter('');
              setEndDateFilter('');
              setStatusFilter('all');
              setTypeFilter('all');
              setServiceProviderFilter('all');
              setVehicleFilter('all');
              setSearchTerm('');
            }}
            className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          >
            Clear Filters
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <div className="overflow-x-auto">
          {/* Vista de escritorio solo en xl+ */}
          <table className="w-full hidden xl:table">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Vehicle</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Start Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">End Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Service Provider</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Cost</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredEvents.map((event) => (
                <tr key={event.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{event.title}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 dark:text-gray-300">{event.vehicle}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${typeColors[event.type]}`}>
                      {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[event.status]}`}>
                      {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {format(new Date(event.startDate), 'PPp')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {format(new Date(event.endDate), 'PPp')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    <div className="flex items-center space-x-2">
                      <Wrench className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-500 dark:text-gray-300">
                        {event.serviceProvider || 'Not assigned'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    ${event.cost?.toFixed(2) || '0.00'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => {
                          setSelectedMaintenance(event);
                          setIsModalOpen(true);
                        }}
                        className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                        title="View Details"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedMaintenance(event);
                          setIsModalOpen(true);
                        }}
                        className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                        title="Edit"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => setDeletingMaintenance(event)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        title="Delete"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Vista tipo tarjeta para mobile, md y lg */}
          <div className="xl:hidden">
            {filteredEvents.map((event) => (
              <div key={event.id} className="p-6 mb-4 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm bg-white dark:bg-gray-800">
                <div className="flex justify-between items-start mb-3">
                  <div className="text-base font-semibold text-gray-900 dark:text-white">{event.title}</div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setSelectedMaintenance(event);
                        setIsModalOpen(true);
                      }}
                      className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                      title="Ver detalles"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedMaintenance(event);
                        setIsModalOpen(true);
                      }}
                      className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                      title="Editar"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setDeletingMaintenance(event)}
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      title="Eliminar"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center space-x-2">
                    <Car className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-700 dark:text-gray-200 font-medium">{event.vehicle}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeColors[event.type]}`}>
                      {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[event.status]}`}>
                      {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-300">
                      {format(new Date(event.startDate), 'PPp')}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Wrench className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-300">
                      {event.serviceProvider || 'Not assigned'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-300">
                      ${event.cost?.toFixed(2) || '0.00'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredEvents.length === 0 && (
            <div className="text-center py-12">
              <Calendar className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No maintenance events found</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' || serviceProviderFilter !== 'all' || vehicleFilter !== 'all' || startDateFilter || endDateFilter
                  ? 'Try adjusting your filters'
                  : 'Get started by adding a new maintenance event'}
              </p>
            </div>
          )}
        </div>
      </div>

      <MaintenanceDetailsModal
        maintenance={selectedMaintenance}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedMaintenance(null);
          fetchMaintenanceEvents(); // Refresh events after modal closes
        }}
      />

      <DeleteConfirmationModal
        isOpen={!!deletingMaintenance}
        title="Delete Maintenance Event"
        message={`Are you sure you want to delete "${deletingMaintenance?.title}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeletingMaintenance(null)}
      />
    </div>
  );
}