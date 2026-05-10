import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import * as SecureStore from 'expo-secure-store';

interface UserInfo {
  id?: number;
  name?: string;
  email?: string;
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: UserInfo | null;
  isLoggedIn: boolean;

  setTokens: (access: string, refresh: string) => void;
  setUser: (user: UserInfo) => void;
  logout: () => void;
}

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

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

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      isLoggedIn: false,

      setTokens: (access, refresh) => {
        SecureStore.setItemAsync(ACCESS_TOKEN_KEY, access);
        SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refresh);

        set({
          accessToken: access,
          refreshToken: refresh,
          isLoggedIn: true,
        });
      },

      setUser: (user) => set({ user }),

      logout: () => {
        SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
        SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);

        set({
          accessToken: null,
          refreshToken: null,
          user: null,
          isLoggedIn: false,
        });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => secureStorage),
    }
  )
);