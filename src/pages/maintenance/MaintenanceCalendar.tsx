import React, { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay } from 'date-fns';
import { Link } from 'react-router-dom';
import type { MaintenanceEvent } from '../../types';
import MaintenanceDetailsModal from '../../components/maintenance/MaintenanceDetailsModal';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

export default function MaintenanceCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedMaintenance, setSelectedMaintenance] = useState<MaintenanceEvent | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [maintenanceEvents, setMaintenanceEvents] = useState<MaintenanceEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMaintenanceEvents();
  }, [currentDate]);

  const fetchMaintenanceEvents = async () => {
    try {
      const startOfMonthDate = startOfMonth(currentDate);
      const endOfMonthDate = endOfMonth(currentDate);

      const { data, error } = await supabase
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
          service_providers (
            name
          )
        `)
        .gte('start_date', startOfMonthDate.toISOString())
        .lte('start_date', endOfMonthDate.toISOString())
        .order('start_date');

      if (error) throw error;

      const mappedEvents: MaintenanceEvent[] = data.map(event => ({
        id: event.id,
        vehicleId: event.vehicle_id,
        title: event.title,
        description: event.description,
        type: event.type,
        status: event.status,
        startDate: event.start_date,
        endDate: event.end_date,
        cost: event.cost || undefined,
        serviceProvider: event.service_providers?.name,
        createdBy: event.created_by,
        createdAt: event.created_at,
        updatedAt: event.updated_at,
      }));

      setMaintenanceEvents(mappedEvents);
    } catch (error) {
      console.error('Error fetching maintenance events:', error);
      toast.error('Failed to load maintenance events');
    } finally {
      setIsLoading(false);
    }
  };

  const days = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate),
  });

  const getEventsForDay = (date: Date) => {
    return maintenanceEvents.filter(event => 
      isSameDay(new Date(event.startDate), date)
    );
  };

  const getEventTypeStyle = (type: string) => {
    switch (type) {
      case 'emergency':
        return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100 border-red-200 dark:border-red-800';
      case 'repair':
        return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-100 border-yellow-200 dark:border-yellow-800';
      default:
        return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 border-blue-200 dark:border-blue-800';
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100';
      case 'inProgress':
        return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100';
      case 'cancelled':
        return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100';
      default:
        return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-100';
    }
  };

  const handleMaintenanceClick = (maintenance: MaintenanceEvent) => {
    setSelectedMaintenance(maintenance);
    setIsModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Maintenance Calendar</h1>
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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Maintenance Calendar</h1>
        <Link
          to="/maintenance/new"
          className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Schedule Maintenance
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <div className="p-6 border-b dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Calendar className="h-6 w-6 text-primary-600 dark:text-primary-400 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {format(currentDate, 'MMMM yyyy')}
              </h2>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <ChevronLeft className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              </button>
              <button
                onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <ChevronRight className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-700">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="bg-gray-50 dark:bg-gray-800 p-2 text-center text-sm font-medium text-gray-600 dark:text-gray-300">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-700">
            {days.map((day, dayIdx) => {
              const events = getEventsForDay(day);
              return (
                <div
                  key={day.toString()}
                  className={`min-h-[120px] bg-white dark:bg-gray-800 p-2 ${
                    !isSameMonth(day, currentDate) ? 'bg-gray-50 dark:bg-gray-900' : ''
                  }`}
                >
                  <div className={`text-sm font-medium ${
                    isToday(day) 
                      ? 'bg-primary-600 text-white rounded-full w-7 h-7 flex items-center justify-center' 
                      : !isSameMonth(day, currentDate) 
                        ? 'text-gray-400 dark:text-gray-500' 
                        : 'text-gray-900 dark:text-white'
                  }`}>
                    {format(day, 'd')}
                  </div>
                  <div className="mt-2 space-y-1">
                    {events.map((event) => (
                      <button
                        key={event.id}
                        onClick={() => handleMaintenanceClick(event)}
                        className={`w-full text-left text-xs p-2 rounded-md border ${getEventTypeStyle(event.type)} cursor-pointer hover:opacity-90 transition-opacity`}
                      >
                        <div className="font-medium">{event.title}</div>
                        <div className="mt-1 flex items-center justify-between">
                          <span>{format(new Date(event.startDate), 'HH:mm')}</span>
                          <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${getStatusStyle(event.status)}`}>
                            {event.status}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
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
    </div>
  );
}