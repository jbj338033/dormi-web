import { api } from '@/shared/api';
import { useAuthStore } from '@/shared/store/auth';
import type { Role } from '@/entities/user';

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  accessToken: string;
  tokenType: string;
  user: {
    id: number;
    email: string;
    name: string;
    roles: Role[];
  };
}

export async function login(data: LoginRequest): Promise<void> {
  const res = await api.post('api/auth/login', { json: data }).json<LoginResponse>();
  useAuthStore.getState().setAuth(res.accessToken, res.user);
}

export function logout(): void {
  useAuthStore.getState().clearAuth();
  window.location.href = '/login';
}
