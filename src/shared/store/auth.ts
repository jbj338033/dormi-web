'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Role } from '@/entities/user';

interface User {
  id: number;
  email: string;
  name: string;
  roles: Role[];
}

interface AuthState {
  token: string | null;
  user: User | null;
  setAuth: (token: string, user: User) => void;
  clearAuth: () => void;
  hasRole: (role: Role) => boolean;
  hasAnyRole: (roles: Role[]) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      setAuth: (token, user) => set({ token, user }),
      clearAuth: () => set({ token: null, user: null }),
      hasRole: (role) => get().user?.roles.includes(role) ?? false,
      hasAnyRole: (roles) => roles.some((role) => get().user?.roles.includes(role)),
    }),
    { name: 'auth-storage' }
  )
);
