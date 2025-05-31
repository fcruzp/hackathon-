import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, Filter, Star, MapPin, Phone, Mail, PenTool as Tool } from 'lucide-react';
import type { ServiceProvider } from '../../types';
import ServiceProviderEditModal from '../../components/maintenance/ServiceProviderEditModal';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

export default function ServiceProviderList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<ServiceProvider['type'] | 'all'>('all');
  const [selectedProvider, setSelectedProvider] = useState<ServiceProvider | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchServiceProviders();
  }, []);

  const fetchServiceProviders = async () => {
    try {
      const { data, error } = await supabase
        .from('service_providers')
        .select('*')
        .order('name');

      if (error) throw error;

      const mappedProviders: ServiceProvider[] = data.map(provider => ({
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
      }));

      setProviders(mappedProviders);
    } catch (error) {
      console.error('Error fetching service providers:', error);
      toast.error('Failed to load service providers');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProviderUpdate = async (updatedProvider: ServiceProvider) => {
    try {
      const { error: updateError } = await supabase
        .from('service_providers')
        .update({
          name: updatedProvider.name,
          type: updatedProvider.type,
          address: updatedProvider.address,
          city: updatedProvider.city,
          state: updatedProvider.state,
          zip_code: updatedProvider.zipCode,
          contact_person: updatedProvider.contactPerson,
          contact_email: updatedProvider.contactEmail,
          contact_phone: updatedProvider.contactPhone,
          specialties: updatedProvider.specialties,
          rating: updatedProvider.rating,
          is_active: updatedProvider.isActive,
          updated_at: new Date().toISOString(),
        })
        .eq('id', updatedProvider.id);

      if (updateError) throw updateError;

      // Update local state
      setProviders(providers.map(p => 
        p.id === updatedProvider.id ? updatedProvider : p
      ));
      
      setIsEditModalOpen(false);
      setSelectedProvider(null);
      toast.success('Service provider updated successfully');
    } catch (error) {
      console.error('Error updating service provider:', error);
      toast.error('Failed to update service provider');
    }
  };

  const filteredProviders = providers.filter(provider => {
    const matchesSearch = 
      provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      provider.contactPerson.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'all' || provider.type === typeFilter;
    
    return matchesSearch && matchesType;
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Service Providers</h1>
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
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Service Providers</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">Manage your vehicle service providers</p>
        </div>
        <Link
          to="/maintenance/service-providers/new"
          className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Provider
        </Link>
      </div>

      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-5 w-5" />
          <input
            type="text"
            placeholder="Search providers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-md focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="text-gray-400 dark:text-gray-500 h-5 w-5" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as ServiceProvider['type'] | 'all')}
            className="flex-1 border border-gray-300 dark:border-gray-600 rounded-md p-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">All Types</option>
            <option value="mechanic">Mechanic</option>
            <option value="electrician">Electrician</option>
            <option value="bodywork">Bodywork</option>
            <option value="general">General</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProviders.map((provider) => (
          <div
            key={provider.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Tool className="h-8 w-8 text-primary-600 dark:text-primary-400" />
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  provider.isActive
                    ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100'
                    : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100'
                }`}>
                  {provider.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {provider.name}
              </h3>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span>{provider.address}, {provider.city}, {provider.state} {provider.zipCode}</span>
                </div>
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2" />
                  <span>{provider.contactPhone}</span>
                </div>
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  <span>{provider.contactEmail}</span>
                </div>
              </div>

              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Specialties</h4>
                <div className="flex flex-wrap gap-2">
                  {provider.specialties.map((specialty, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-100 text-xs rounded-full"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4 flex items-center">
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                <span className="ml-1 text-sm text-gray-600 dark:text-gray-300">
                  {provider.rating.toFixed(1)}
                </span>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => {
                    setSelectedProvider(provider);
                    setIsEditModalOpen(true);
                  }}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                >
                  Edit Provider
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredProviders.length === 0 && (
          <div className="col-span-full text-center py-12">
            <Tool className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No service providers found</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {searchTerm || typeFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Get started by adding a new service provider'}
            </p>
          </div>
        )}
      </div>

      <ServiceProviderEditModal
        provider={selectedProvider}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedProvider(null);
        }}
        onSave={handleProviderUpdate}
      />
    </div>
  );
}