import React, { useState, useEffect } from 'react';
import { Car, Users, Wrench, Calendar, BarChart2, LineChart, Plus, Edit2, Trash2, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguageStore } from '../../stores/language-store';
import { translations } from '../../translations';
import { BarChart, Bar, LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '../../lib/supabase';

function Dashboard() {
  const { language } = useLanguageStore();
  const t = translations[language].dashboard;
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar');
  const [statsTimeRange, setStatsTimeRange] = useState<'week' | 'month' | 'year'>('month');

  // Estado para estadísticas reales
  const [stats, setStats] = useState({
    totalVehicles: 0,
    activeDrivers: 0,
    pendingMaintenance: 0,
    scheduledServices: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);

  // Estado para los datos del gráfico
  const [maintenanceChartData, setMaintenanceChartData] = useState<any[]>([]);
  const [loadingChart, setLoadingChart] = useState(true);

  // Estado para logs de actividad
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [logsPerPage] = useState(4); // Mostrar 5 logs por página
  const [totalLogs, setTotalLogs] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      setLoadingStats(true);
      try {
        // Total de vehículos
        const { count: totalVehicles } = await supabase
          .from('vehicles')
          .select('id', { count: 'exact', head: true });

        // Conductores activos
        const { count: activeDrivers } = await supabase
          .from('users')
          .select('id', { count: 'exact', head: true })
          .eq('role', 'driver');

        // Mantenimientos pendientes
        const { count: pendingMaintenance } = await supabase
          .from('maintenance_events')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'pending');

        // Servicios programados
        const { count: scheduledServices } = await supabase
          .from('maintenance_events')
          .select('id', { count: 'exact', head: true })
          .eq('type', 'scheduled');

        setStats({
          totalVehicles: totalVehicles || 0,
          activeDrivers: activeDrivers || 0,
          pendingMaintenance: pendingMaintenance || 0,
          scheduledServices: scheduledServices || 0,
        });
      } catch (error) {
        // Si hay error, dejar los valores en 0
        setStats({
          totalVehicles: 0,
          activeDrivers: 0,
          pendingMaintenance: 0,
          scheduledServices: 0,
        });
      } finally {
        setLoadingStats(false);
      }
    };
    fetchStats();
  }, []);

  useEffect(() => {
    const fetchChartData = async () => {
      setLoadingChart(true);
      try {
        let data: any[] = [];
        const now = new Date();
        if (timeRange === 'week') {
          // Obtener los últimos 7 días
          const days = Array.from({ length: 7 }, (_, i) => {
            const d = new Date(now);
            d.setDate(now.getDate() - (6 - i));
            return d;
          });
          // Consultar todos los mantenimientos de la semana
          const startOfWeek = new Date(now);
          startOfWeek.setDate(now.getDate() - 6);
          startOfWeek.setHours(0,0,0,0);
          const { data: events } = await supabase
            .from('maintenance_events')
            .select('id, start_date')
            .gte('start_date', startOfWeek.toISOString())
            .lte('start_date', now.toISOString());
          data = days.map(day => {
            const dayStr = day.toLocaleDateString('en-US', { weekday: 'short' });
            const count = events?.filter(e => {
              const eventDate = new Date(e.start_date);
              return eventDate.toDateString() === day.toDateString();
            }).length || 0;
            return { name: dayStr, value: count };
          });
        } else if (timeRange === 'month') {
          // Agrupar por semana del mes actual
          const year = now.getFullYear();
          const month = now.getMonth();
          const firstDay = new Date(year, month, 1);
          const lastDay = new Date(year, month + 1, 0);
          const { data: events } = await supabase
            .from('maintenance_events')
            .select('id, start_date')
            .gte('start_date', firstDay.toISOString())
            .lte('start_date', lastDay.toISOString());
          // Calcular semana de cada evento
          const weeks = [0, 1, 2, 3, 4];
          data = weeks.map(weekIdx => {
            const weekStart = new Date(year, month, 1 + weekIdx * 7);
            const weekEnd = new Date(year, month, Math.min(1 + (weekIdx + 1) * 7 - 1, lastDay.getDate()));
            const count = events?.filter(e => {
              const eventDate = new Date(e.start_date);
              return eventDate >= weekStart && eventDate <= weekEnd;
            }).length || 0;
            return { name: `Week ${weekIdx + 1}`, value: count };
          });
        } else if (timeRange === 'year') {
          // Agrupar por mes del año actual
          const year = now.getFullYear();
          const months = Array.from({ length: 12 }, (_, i) => i);
          const { data: events } = await supabase
            .from('maintenance_events')
            .select('id, start_date')
            .gte('start_date', new Date(year, 0, 1).toISOString())
            .lte('start_date', new Date(year, 11, 31, 23, 59, 59).toISOString());
          data = months.map(monthIdx => {
            const monthStart = new Date(year, monthIdx, 1);
            const monthEnd = new Date(year, monthIdx + 1, 0, 23, 59, 59);
            const count = events?.filter(e => {
              const eventDate = new Date(e.start_date);
              return eventDate >= monthStart && eventDate <= monthEnd;
            }).length || 0;
            return { name: monthStart.toLocaleString('en-US', { month: 'short' }), value: count };
          });
        }
        setMaintenanceChartData(data);
      } catch (error) {
        setMaintenanceChartData([]);
      } finally {
        setLoadingChart(false);
      }
    };
    fetchChartData();
  }, [timeRange]);

  useEffect(() => {
    const fetchLogs = async (page = 0) => {
      setLoadingLogs(true);
      try {
        const from = page * logsPerPage;
        const to = from + logsPerPage - 1;

        // Primero, obtener el conteo total (para la paginación)
        const { count, error: countError } = await supabase
          .from('activity_logs')
          .select('id', { count: 'exact', head: true });

        if (countError) throw countError;
        setTotalLogs(count || 0);

        // Luego, obtener los logs de la página actual
        const { data, error } = await supabase
          .from('activity_logs')
          .select('id, user_id, action, entity, entity_id, description, created_at')
          .order('created_at', { ascending: false })
          .range(from, to);

        setActivityLogs(data || []);
      } catch (error) {
        setActivityLogs([]);
      } finally {
        setLoadingLogs(false);
      }
    };
    fetchLogs(currentPage); // Llamar con la página actual
  }, [currentPage]); // Dependencia: refetch logs cuando cambie la página

  const statsData = [
    { label: t.stats.totalVehicles, value: stats.totalVehicles, icon: Car, color: 'text-blue-600 dark:text-blue-400' },
    { label: t.stats.activeDrivers, value: stats.activeDrivers, icon: Users, color: 'text-green-600 dark:text-green-400' },
    { label: t.stats.pendingMaintenance, value: stats.pendingMaintenance, icon: Wrench, color: 'text-yellow-600 dark:text-yellow-400' },
    { label: t.stats.scheduledServices, value: stats.scheduledServices, icon: Calendar, color: 'text-purple-600 dark:text-purple-400' },
  ];

  const quickActions = [
    { label: t.quickActions.addVehicle, icon: Car, to: '/vehicles/new' },
    { label: t.quickActions.addDriver, icon: Users, to: '/users/new' },
    { label: t.quickActions.scheduleService, icon: Wrench, to: '/maintenance/new' },
    { label: t.quickActions.viewCalendar, icon: Calendar, to: '/maintenance/calendar' },
  ];

  function getActionIcon(action: string) {
    switch (action) {
      case 'create':
        return <Plus className="h-5 w-5 text-green-500" />;
      case 'update':
        return <Edit2 className="h-5 w-5 text-blue-500" />;
      case 'delete':
        return <Trash2 className="h-5 w-5 text-red-500" />;
      default:
        return <Check className="h-5 w-5 text-gray-400" />;
    }
  }

  function capitalizeFirst(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  function getRelativeDate(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const isToday = now.toDateString() === date.toDateString();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday = yesterday.toDateString() === date.toDateString();
    const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (isToday) return `Hoy, ${time}`;
    if (isYesterday) return `Ayer, ${time}`;
    if (diffDays > 0) return `Hace ${diffDays} días, ${time}`;
    return date.toLocaleString();
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t.title}</h1>
        <div className="flex rounded-md shadow-sm">
          <button
            onClick={() => setStatsTimeRange('week')}
            className={`px-4 py-2 text-sm font-medium rounded-l-md border ${
              statsTimeRange === 'week'
                ? 'bg-primary-600 text-white border-primary-600'
                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
            }`}
          >
            This Week
          </button>
          <button
            onClick={() => setStatsTimeRange('month')}
            className={`px-4 py-2 text-sm font-medium border-t border-b ${
              statsTimeRange === 'month'
                ? 'bg-primary-600 text-white border-primary-600'
                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
            }`}
          >
            This Month
          </button>
          <button
            onClick={() => setStatsTimeRange('year')}
            className={`px-4 py-2 text-sm font-medium rounded-r-md border ${
              statsTimeRange === 'year'
                ? 'bg-primary-600 text-white border-primary-600'
                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
            }`}
          >
            This Year
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {loadingStats ? (
          Array(4).fill(0).map((_, idx) => (
            <div key={idx} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 animate-pulse h-32" />
          ))
        ) : (
          statsData.map((stat) => {
            const Icon = stat.icon;
            return (
              <div 
                key={stat.label} 
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-transform hover:scale-105"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-full ${stat.color.replace('text', 'bg').replace('600', '100').replace('400', '900')} bg-opacity-10`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <span className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</span>
                </div>
                <h3 className="text-gray-600 dark:text-gray-300 font-medium">{stat.label}</h3>
              </div>
            );
          })
        )}
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Maintenance Statistics</h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setChartType(chartType === 'bar' ? 'line' : 'bar')}
                className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {chartType === 'bar' ? <LineChart className="h-5 w-5" /> : <BarChart2 className="h-5 w-5" />}
              </button>
              <div className="flex rounded-md shadow-sm">
                <button
                  onClick={() => setTimeRange('week')}
                  className={`px-4 py-2 text-sm font-medium rounded-l-md border ${
                    timeRange === 'week'
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                  }`}
                >
                  Week
                </button>
                <button
                  onClick={() => setTimeRange('month')}
                  className={`px-4 py-2 text-sm font-medium border-t border-b ${
                    timeRange === 'month'
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                  }`}
                >
                  Month
                </button>
                <button
                  onClick={() => setTimeRange('year')}
                  className={`px-4 py-2 text-sm font-medium rounded-r-md border ${
                    timeRange === 'year'
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                  }`}
                >
                  Year
                </button>
              </div>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              {loadingChart ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                </div>
              ) : chartType === 'bar' ? (
                <BarChart data={maintenanceChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#0284c7" radius={[4, 4, 0, 0]} />
                </BarChart>
              ) : (
                <RechartsLineChart data={maintenanceChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#0284c7" strokeWidth={2} dot={{ fill: '#0284c7' }} />
                </RechartsLineChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{t.recentActivities.title}</h2>
          <div className="space-y-4">
            {loadingLogs ? (
              <div className="flex items-center justify-center h-24">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            ) : activityLogs.length === 0 ? (
              <div className="text-gray-500 dark:text-gray-400 text-center">No hay actividades recientes.</div>
            ) : (
              activityLogs.map((log) => (
                <div key={log.id} className="flex items-start space-x-4 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg">
                  <div className="flex-shrink-0 mt-1">{getActionIcon(log.action)}</div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {capitalizeFirst(log.action)} {capitalizeFirst(log.entity)}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{log.description}</p>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {getRelativeDate(log.created_at)}
                  </span>
                </div>
              ))
            )}
            {/* Controles de paginación */}
            {totalLogs > logsPerPage && (
              <div className="flex justify-end space-x-2 mt-4 border-t dark:border-gray-700 pt-3">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                  disabled={currentPage === 0 || loadingLogs}
                  className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>
                <button
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  disabled={currentPage * logsPerPage + logsPerPage >= totalLogs || loadingLogs}
                  className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Siguiente
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{t.quickActions.title}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Link
                key={index}
                to={action.to}
                className="flex items-center justify-center space-x-2 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <Icon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                <span className="font-medium text-gray-700 dark:text-gray-200">{action.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;