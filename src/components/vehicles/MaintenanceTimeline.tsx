import { History, Calendar, PenTool as Tool, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import type { VehicleStatus } from '../../types';
import type { Database } from '../../types/supabase';
import { supabase } from '../../lib/supabase';
import { useState, useEffect } from 'react';

interface MaintenanceTimelineProps {
  vehicleId: string;
}

type MaintenanceEventFromDB = Omit<Database['public']['Tables']['maintenance_events']['Row'], 'service_provider_id'> & {
  service_provider: { name: string | null } | null;
};

export default function MaintenanceTimeline({ vehicleId }: MaintenanceTimelineProps) {
  const [maintenanceHistory, setMaintenanceHistory] = useState<MaintenanceEventFromDB[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMaintenanceHistory();
  }, [vehicleId]);

  const fetchMaintenanceHistory = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
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
          service_provider:service_providers(name),
          created_by,
          created_at,
          updated_at
        `)
        .eq('vehicle_id', vehicleId)
        .order('start_date', { ascending: false });

      if (fetchError) throw fetchError;

      const processedEvents = (data?.filter(event => event.type !== 'status_change') || []).map(event => {
        const serviceProvider = event.service_provider && typeof event.service_provider === 'object' && !Array.isArray(event.service_provider)
          ? event.service_provider as { name: string | null }
          : null;
        return {
          ...event,
          service_provider: serviceProvider
        };
      }) as MaintenanceEventFromDB[];
      setMaintenanceHistory(processedEvents);
    } catch (err) {
      console.error('Error fetching maintenance history:', err);
      setError('Failed to load maintenance history.');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: VehicleStatus) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'maintenance':
        return <Tool className="h-5 w-5 text-blue-500" />;
      case 'pendingMaintenance':
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case 'outOfService':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getEventIcon = (type: MaintenanceEventFromDB['type'] | 'status_change') => {
    switch (type) {
      case 'scheduled':
        return <Calendar className="h-5 w-5 text-blue-500" />;
      case 'emergency':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'repair':
        return <Tool className="h-5 w-5 text-yellow-500" />;
      case 'status_change':
        return <History className="h-5 w-5 text-gray-400" />;
      default:
        return null;
    }
  };

  const getEventColor = (type: MaintenanceEventFromDB['type'] | 'status_change') => {
    switch (type) {
      case 'scheduled':
        return 'border-blue-200 dark:border-blue-800';
      case 'emergency':
        return 'border-red-200 dark:border-red-800';
      case 'repair':
        return 'border-yellow-200 dark:border-yellow-800';
      default:
        return 'border-gray-200 dark:border-gray-700';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <div className="p-6 border-b dark:border-gray-700">
        <div className="flex items-center">
          <History className="h-6 w-6 text-primary-600 dark:text-primary-400 mr-2" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Maintenance History
          </h2>
        </div>
      </div>

      <div className="p-6">
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />
          
          <div className="space-y-8">
            {maintenanceHistory.map((event) => (
              <div key={event.id} className="relative pl-10">
                <div className="absolute left-0 top-1.5 w-8 h-8 rounded-full bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 flex items-center justify-center">
                  {getEventIcon(event.type)}
                </div>

                <div className={`p-4 rounded-lg border ${getEventColor(event.type)}`}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      {event.title}
                    </h3>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {format(new Date(event.start_date), 'PPp')}
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 mb-2">
                    {event.description}
                  </p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">
                      Service Provider: {event.service_provider?.name || 'N/A'}
                    </span>
                    {event.cost !== null && event.cost !== undefined && (
                      <span className="font-medium text-gray-900 dark:text-white">
                        Cost: ${event.cost.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            )}
            {!isLoading && maintenanceHistory.length === 0 && (
              <div className="text-center text-gray-500 dark:text-gray-400 py-4">
                No maintenance history found for this vehicle.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}