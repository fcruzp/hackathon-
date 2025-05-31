import type { ReactNode } from 'react';

export type UserRole = 'admin' | 'staff' | 'driver';

export type Position = 
  | 'ministro'
  | 'viceministro'
  | 'director'
  | 'encargado'
  | 'asistente'
  | 'asesor'
  | 'chofer';

export interface Department {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  position?: Position;
  departmentId?: string;
  institutionId?: string;
  phone?: string;
  imageUrl?: string;
  licenseImageUrl?: string;
  createdAt: string;
}

export interface Driver extends User {
  licenseNumber: string;
  licenseExpiry: string;
  assignedVehicleId?: string;
  vehicleHistory: string[];
  isAvailable: boolean;
}

export type VehicleStatus = 'active' | 'maintenance' | 'outOfService' | 'pendingMaintenance';

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  vin: string;
  color: string;
  status: VehicleStatus;
  assignedDriverId?: string;
  imageUrl?: string;
  insurancePolicy?: string;
  insuranceExpiry?: string;
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
  mileage: number;
  odometerReading: number;
  purchaseDate: string;
  fuelType: 'gasoline' | 'diesel' | 'electric' | 'hybrid';
  notes?: string;
  createdAt: string;
}

export type MaintenanceType = 'scheduled' | 'emergency' | 'repair';
export type MaintenanceStatus = 'pending' | 'inProgress' | 'completed' | 'cancelled';

export interface MaintenanceEvent {
  id: string;
  vehicleId: string;
  title: string;
  description: string;
  type: MaintenanceType;
  status: MaintenanceStatus;
  startDate: string;
  endDate: string;
  cost?: number;
  serviceProvider?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  vehicle?: string;
  service_providers?: {
    name: string;
  };
  vehicles?: {
    make: string;
    model: string;
  };
}

export interface ServiceProvider {
  id: string;
  name: string;
  type: 'mechanic' | 'electrician' | 'bodywork' | 'general';
  address: string;
  city: string;
  state: string;
  zipCode: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  specialties: string[];
  rating: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Institution {
  id: string;
  name: string;
  type: 'public' | 'private';
  address: string;
  city: string;
  state: string;
  zipCode: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  createdAt: string;
}

export interface DashboardStats {
  totalVehicles: number;
  activeVehicles: number;
  inMaintenanceVehicles: number;
  outOfServiceVehicles: number;
  totalDrivers: number;
  upcomingMaintenances: number;
  completedMaintenancesThisMonth: number;
  vehiclesByType: {
    label: string;
    value: number;
  }[];
}

export interface Settings {
  positions: Position[];
  departments: Department[];
}