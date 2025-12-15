import { api } from '@/shared/api';
import { useAuthStore } from '@/shared/store/auth';
import type { Role } from '@/entities/user';

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: Role;
  };
}

interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export async function login(data: LoginRequest): Promise<void> {
  const res = await api.post<LoginResponse>('auth/login', { json: data });
  useAuthStore.getState().setAuth(res.token, res.user);
}

export async function changePassword(data: ChangePasswordRequest): Promise<void> {
  await api.patch('auth/password', { json: data });
}

export function logout(): void {
  useAuthStore.getState().clearAuth();
  window.location.href = '/login';
}
