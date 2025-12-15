import { api } from '@/shared/api';
import type { User, CreateUserInput, UpdateUserInput } from '@/entities/user';

export async function getAllUsers(): Promise<User[]> {
  return api.get<User[]>('users');
}

export async function getUser(id: string): Promise<User> {
  return api.get<User>(`users/${id}`);
}

export async function createUser(data: CreateUserInput): Promise<User> {
  return api.post<User>('users', { json: data });
}

export async function updateUser(id: string, data: UpdateUserInput): Promise<User> {
  return api.put<User>(`users/${id}`, { json: data });
}

export async function deleteUser(id: string): Promise<void> {
  await api.delete(`users/${id}`);
}
