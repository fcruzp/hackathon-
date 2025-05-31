import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { useEffect } from 'react';

interface LogoStore {
  logoUrl: string | null;
  setLogoUrl: (url: string | null) => void;
  fetchLogo: () => Promise<void>;
}

export const useLogoStore = create<LogoStore>((set, get) => ({
  logoUrl: null,
  setLogoUrl: (url) => {
    set({ logoUrl: url });
    console.log('Logo URL (store):', url);
  },
  fetchLogo: async () => {
    try {
      // Obtener el campo url_logo de la tabla settings (solo un registro)
      const { data, error } = await supabase
        .from('settings')
        .select('url_logo')
        .single();

      if (error) throw error;

      if (data && data.url_logo) {
        set({ logoUrl: data.url_logo });
        console.log('Logo URL (settings):', data.url_logo);
      } else {
        set({ logoUrl: null });
        console.log('Logo URL (settings): null');
      }
    } catch (err) {
      console.error('Error fetching logo from settings:', err);
      set({ logoUrl: null });
    }
  }
}));

// Efecto para mostrar en consola cada vez que cambia logoUrl
export function useDebugLogoUrl() {
  const { logoUrl } = useLogoStore();
  useEffect(() => {
    if (logoUrl) {
      console.log('Logo URL (debug hook):', logoUrl);
    }
  }, [logoUrl]);
}

useEffect(() => {
  async function testFetch() {
    const { data, error } = await supabase
      .from('settings')
      .select('url_logo')
      .single();
    console.log('TEST settings fetch:', { data, error });
  }
  testFetch();
}, []); 