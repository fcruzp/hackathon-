import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  token: null,

  login: async (email: string, password: string) => {
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      if (!authData.user) {
        throw new Error('No user data returned from authentication');
      }

      // Fetch the user profile from the users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (userError || !userData) {
        // If user profile doesn't exist, sign out and throw error
        await supabase.auth.signOut();
        throw new Error('User profile not found');
      }

      // Set the user state with the profile data
      set({
        user: {
          id: userData.id,
          email: userData.email,
          firstName: userData.first_name,
          lastName: userData.last_name,
          role: userData.role,
          position: userData.position || undefined,
          departmentId: userData.department_id || undefined,
          phone: userData.phone || undefined,
          imageUrl: userData.image_url || undefined,
          licenseImageUrl: userData.license_image_url || undefined,
          createdAt: userData.created_at,
        },
        isAuthenticated: true,
        token: authData.session?.access_token || null,
      });
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  },

  register: async (email: string, password: string) => {
    try {
      // First, create the auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      if (!authData.user) {
        throw new Error('No user data returned from registration');
      }

      // Then create the user profile in the users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .insert([
          {
            id: authData.user.id,
            email: authData.user.email,
            first_name: email.split('@')[0], // Temporary name until profile is updated
            last_name: '',
            role: 'staff', // Default role
          },
        ])
        .select()
        .single();

      if (userError) {
        // If user profile creation fails, delete the auth user
        await supabase.auth.admin.deleteUser(authData.user.id);
        throw userError;
      }

      // Set the user state with the profile data
      set({
        user: {
          id: userData.id,
          email: userData.email,
          firstName: userData.first_name,
          lastName: userData.last_name,
          role: userData.role,
          createdAt: userData.created_at,
        },
        isAuthenticated: true,
        token: authData.session?.access_token || null,
      });
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  },

  logout: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      set({ user: null, isAuthenticated: false, token: null });
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  },

  setUser: (user: User) => {
    set({ user, isAuthenticated: true });
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null });
  }
}));