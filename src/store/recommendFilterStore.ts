import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import * as SecureStore from 'expo-secure-store';

interface RecommendFilterState {
  region: string | null;
  budget: string | null;
  transport: string | null;
  moveTime: string | null;
  classType: string | null;
  concerns: string[];

  setRegion: (value: string) => void;
  setBudget: (value: string) => void;
  setTransport: (value: string) => void;
  setMoveTime: (value: string) => void;
  setClassType: (value: string) => void;
  setConcerns: (value: string[]) => void;

  resetFilters: () => void;
}

const secureStorage = {
  getItem: async (name: string) => {
    return (await SecureStore.getItemAsync(name)) ?? null;
  },
  setItem: async (name: string, value: string) => {
    await SecureStore.setItemAsync(name, value);
  },
  removeItem: async (name: string) => {
    await SecureStore.deleteItemAsync(name);
  },
};

export const useRecommendFilterStore = create<RecommendFilterState>()(
  persist(
    (set) => ({
      region: null,
      budget: null,
      transport: null,
      moveTime: null,
      classType: null,
      concerns: [],

      setRegion: (value) => set({ region: value }),
      setBudget: (value) => set({ budget: value }),
      setTransport: (value) => set({ transport: value }),
      setMoveTime: (value) => set({ moveTime: value }),
      setClassType: (value) => set({ classType: value }),
      setConcerns: (value) => set({ concerns: value }),

      resetFilters: () =>
        set({
          region: null,
          budget: null,
          transport: null,
          moveTime: null,
          classType: null,
          concerns: [],
        }),
    }),
    {
      name: 'recommend-storage',
      storage: createJSONStorage(() => secureStorage),
    }
  )
);