import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/auth-store';
import AppLayout from './layouts/AppLayout';
import AuthLayout from './layouts/AuthLayout';
import LoadingPage from './pages/shared/LoadingPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Dashboard from './pages/dashboard/Dashboard';
import ChatGeminiAI from './components/shared/ChatGeminiAI';

// Lazy-loaded components
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));
const VehicleList = lazy(() => import('./pages/vehicles/VehicleList'));
const AddVehicle = lazy(() => import('./pages/vehicles/AddVehicle'));
const VehicleDetails = lazy(() => import('./pages/vehicles/VehicleDetails'));
const UsersList = lazy(() => import('./pages/users/UsersList'));
const AddUser = lazy(() => import('./pages/users/AddUser'));
const UserDetails = lazy(() => import('./pages/users/UserDetails'));
const MaintenanceCalendar = lazy(() => import('./pages/maintenance/MaintenanceCalendar'));
const MaintenanceList = lazy(() => import('./pages/maintenance/MaintenanceList'));
const AddMaintenance = lazy(() => import('./pages/maintenance/AddMaintenance'));
const ServiceProviderList = lazy(() => import('./pages/maintenance/ServiceProviderList'));
const AddServiceProvider = lazy(() => import('./pages/maintenance/AddServiceProvider'));
const SettingsPage = lazy(() => import('./pages/settings/SettingsPage'));
const NotFoundPage = lazy(() => import('./pages/shared/NotFoundPage'));

function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <Suspense fallback={<LoadingPage />}>
      <Routes>
        {/* Auth routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* Protected app routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            
            {/* Vehicle routes */}
            <Route path="/vehicles" element={<VehicleList />} />
            <Route path="/vehicles/new" element={<AddVehicle />} />
            <Route path="/vehicles/:id" element={<VehicleDetails />} />
            
            {/* User/Driver routes */}
            <Route path="/users" element={<UsersList />} />
            <Route path="/users/new" element={<AddUser />} />
            <Route path="/users/:id" element={<UserDetails />} />
            
            {/* Maintenance routes */}
            <Route path="/maintenance" element={<MaintenanceList />} />
            <Route path="/maintenance/new" element={<AddMaintenance />} />
            <Route path="/maintenance/calendar" element={<MaintenanceCalendar />} />
            <Route path="/maintenance/service-providers" element={<ServiceProviderList />} />
            <Route path="/maintenance/service-providers/new" element={<AddServiceProvider />} />

            {/* Settings route */}
            <Route path="/settings" element={<SettingsPage />} />
            {/* Gemini AI Chat route */}
            <Route path="/chat-gemini" element={<ChatGeminiAI />} />
          </Route>
        </Route>

        {/* Not Found route */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}

export default App;