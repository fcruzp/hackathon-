export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      departments: {
        Row: {
          id: string
          name: string
          description: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      users: {
        Row: {
          id: string
          email: string
          first_name: string
          last_name: string
          role: 'admin' | 'staff' | 'driver'
          position: string | null
          department_id: string | null
          phone: string | null
          image_url: string | null
          license_image_url: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          email: string
          first_name: string
          last_name: string
          role: 'admin' | 'staff' | 'driver'
          position?: string | null
          department_id?: string | null
          phone?: string | null
          image_url?: string | null
          license_image_url?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          first_name?: string
          last_name?: string
          role?: 'admin' | 'staff' | 'driver'
          position?: string | null
          department_id?: string | null
          phone?: string | null
          image_url?: string | null
          license_image_url?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      vehicles: {
        Row: {
          id: string
          make: string
          model: string
          year: number
          license_plate: string
          vin: string
          color: string
          status: 'active' | 'maintenance' | 'pendingMaintenance' | 'outOfService'
          assigned_driver_id: string | null
          institution_id: string
          image_url: string | null
          insurance_policy: string | null
          insurance_expiry: string | null
          last_maintenance_date: string | null
          next_maintenance_date: string | null
          mileage: number
          odometer_reading: number
          purchase_date: string
          fuel_type: 'gasoline' | 'diesel' | 'electric' | 'hybrid'
          notes: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          make: string
          model: string
          year: number
          license_plate: string
          vin: string
          color: string
          status: 'active' | 'maintenance' | 'pendingMaintenance' | 'outOfService'
          assigned_driver_id?: string | null
          institution_id: string
          image_url?: string | null
          insurance_policy?: string | null
          insurance_expiry?: string | null
          last_maintenance_date?: string | null
          next_maintenance_date?: string | null
          mileage?: number
          odometer_reading?: number
          purchase_date: string
          fuel_type: 'gasoline' | 'diesel' | 'electric' | 'hybrid'
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          make?: string
          model?: string
          year?: number
          license_plate?: string
          vin?: string
          color?: string
          status?: 'active' | 'maintenance' | 'pendingMaintenance' | 'outOfService'
          assigned_driver_id?: string | null
          institution_id?: string
          image_url?: string | null
          insurance_policy?: string | null
          insurance_expiry?: string | null
          last_maintenance_date?: string | null
          next_maintenance_date?: string | null
          mileage?: number
          odometer_reading?: number
          purchase_date?: string
          fuel_type?: 'gasoline' | 'diesel' | 'electric' | 'hybrid'
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      service_providers: {
        Row: {
          id: string
          name: string
          type: 'mechanic' | 'electrician' | 'bodywork' | 'general'
          address: string
          city: string
          state: string
          zip_code: string
          contact_person: string
          contact_email: string
          contact_phone: string
          specialties: string[]
          rating: number
          is_active: boolean
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          type: 'mechanic' | 'electrician' | 'bodywork' | 'general'
          address: string
          city: string
          state: string
          zip_code: string
          contact_person: string
          contact_email: string
          contact_phone: string
          specialties?: string[]
          rating: number
          is_active?: boolean
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          type?: 'mechanic' | 'electrician' | 'bodywork' | 'general'
          address?: string
          city?: string
          state?: string
          zip_code?: string
          contact_person?: string
          contact_email?: string
          contact_phone?: string
          specialties?: string[]
          rating?: number
          is_active?: boolean
          created_at?: string | null
          updated_at?: string | null
        }
      }
      maintenance_events: {
        Row: {
          id: string
          vehicle_id: string
          title: string
          description: string
          type: 'scheduled' | 'emergency' | 'repair'
          status: 'pending' | 'inProgress' | 'completed' | 'cancelled'
          start_date: string
          end_date: string
          cost: number | null
          service_provider_id: string | null
          created_by: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          vehicle_id: string
          title: string
          description: string
          type: 'scheduled' | 'emergency' | 'repair'
          status: 'pending' | 'inProgress' | 'completed' | 'cancelled'
          start_date: string
          end_date: string
          cost?: number | null
          service_provider_id?: string | null
          created_by: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          vehicle_id?: string
          title?: string
          description?: string
          type?: 'scheduled' | 'emergency' | 'repair'
          status?: 'pending' | 'inProgress' | 'completed' | 'cancelled'
          start_date?: string
          end_date?: string
          cost?: number | null
          service_provider_id?: string | null
          created_by?: string
          created_at?: string | null
          updated_at?: string | null
        }
      }
    }
  }
}