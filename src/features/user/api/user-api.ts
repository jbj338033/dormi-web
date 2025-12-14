import { api } from '@/shared/api';
import type { User, CreateUserInput, UpdateUserInput } from '@/entities/user';

export async function getAllUsers(): Promise<User[]> {
  return api.get('api/users').json<User[]>();
}

export async function getUser(id: number): Promise<User> {
  return api.get(`api/users/${id}`).json<User>();
}

export async function createUser(data: CreateUserInput): Promise<User> {
  return api.post('api/users', { json: data }).json<User>();
}

export async function updateUser(id: number, data: UpdateUserInput): Promise<User> {
  return api.put(`api/users/${id}`, { json: data }).json<User>();
}

export async function deleteUser(id: number): Promise<void> {
  await api.delete(`api/users/${id}`);
}
