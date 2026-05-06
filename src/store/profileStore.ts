import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import * as SecureStore from 'expo-secure-store';

interface ChildProfile {
  name: string;
  age: number;
  concerns: string[];
}

interface ProfileState {
  childProfile: ChildProfile | null;
  setChildProfile: (profile: ChildProfile) => void;
  clearChildProfile: () => void;
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

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      childProfile: null,

      setChildProfile: (profile) => set({ childProfile: profile }),

      clearChildProfile: () => set({ childProfile: null }),
    }),
    {
      name: 'profile-storage',
      storage: createJSONStorage(() => secureStorage),
    }
  )
);