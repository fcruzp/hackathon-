import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Position, Department } from '../types';

interface SettingsState {
  positions: Position[];
  departments: Department[];
  addDepartment: (department: Omit<Department, 'id' | 'createdAt'>) => void;
  updateDepartment: (id: string, department: Partial<Department>) => void;
  deleteDepartment: (id: string) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      positions: [
        'ministro',
        'viceministro',
        'director',
        'encargado',
        'asistente',
        'asesor',
        'chofer'
      ],
      departments: [
        {
          id: '1',
          name: 'Administración',
          description: 'Departamento de Administración y Finanzas',
          createdAt: new Date().toISOString(),
        },
        {
          id: '2',
          name: 'Operaciones',
          description: 'Departamento de Operaciones y Logística',
          createdAt: new Date().toISOString(),
        },
        {
          id: '3',
          name: 'Recursos Humanos',
          description: 'Departamento de Recursos Humanos',
          createdAt: new Date().toISOString(),
        },
      ],
      addDepartment: (department) => set((state) => ({
        departments: [
          ...state.departments,
          {
            id: crypto.randomUUID(),
            ...department,
            createdAt: new Date().toISOString(),
          },
        ],
      })),
      updateDepartment: (id, department) => set((state) => ({
        departments: state.departments.map((d) =>
          d.id === id ? { ...d, ...department } : d
        ),
      })),
      deleteDepartment: (id) => set((state) => ({
        departments: state.departments.filter((d) => d.id !== id),
      })),
    }),
    {
      name: 'settings-storage',
    }
  )
);