import { api } from '@/shared/api';
import type {
  Point,
  PointSummary,
  GrantPointInput,
  BulkGrantPointInput,
} from '@/entities/point';

export async function getPoint(id: number): Promise<Point> {
  return api.get(`api/points/${id}`).json<Point>();
}

export async function getPointsByStudent(studentId: number): Promise<Point[]> {
  return api.get(`api/points/student/${studentId}`).json<Point[]>();
}

export async function getPointSummary(studentId: number): Promise<PointSummary> {
  return api.get(`api/points/student/${studentId}/summary`).json<PointSummary>();
}

export async function grantPoint(studentId: number, data: GrantPointInput): Promise<Point> {
  return api.post(`api/points/student/${studentId}`, { json: data }).json<Point>();
}

export async function bulkGrantPoints(data: BulkGrantPointInput): Promise<Point[]> {
  return api.post('api/points/bulk', { json: data }).json<Point[]>();
}

export async function cancelPoint(id: number): Promise<Point> {
  return api.post(`api/points/${id}/cancel`).json<Point>();
}

export async function resetAllPoints(): Promise<void> {
  await api.delete('api/points/reset');
}
