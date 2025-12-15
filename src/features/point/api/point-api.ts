import { api } from '@/shared/api';
import type {
  Point,
  PointSummary,
  GivePointInput,
  BulkGivePointInput,
} from '@/entities/point';

export async function getPoints(params?: {
  studentId?: string;
  type?: string;
  startDate?: string;
  endDate?: string;
}): Promise<Point[]> {
  const searchParams = new URLSearchParams();
  if (params?.studentId) searchParams.set('studentId', params.studentId);
  if (params?.type) searchParams.set('type', params.type);
  if (params?.startDate) searchParams.set('startDate', params.startDate);
  if (params?.endDate) searchParams.set('endDate', params.endDate);

  return api.get<Point[]>('points', { searchParams });
}

export async function getPointsByStudent(studentId: string): Promise<Point[]> {
  return api.get<Point[]>(`points/student/${studentId}`);
}

export async function getPointSummary(studentId: string): Promise<PointSummary> {
  return api.get<PointSummary>(`points/student/${studentId}/summary`);
}

export async function givePoint(data: GivePointInput): Promise<Point> {
  return api.post<Point>('points', { json: data });
}

export async function bulkGivePoints(data: BulkGivePointInput): Promise<Point[]> {
  return api.post<Point[]>('points/bulk', { json: data });
}

export async function cancelPoint(id: string): Promise<void> {
  await api.patch(`points/${id}/cancel`);
}

export async function resetAllPoints(): Promise<void> {
  await api.delete('points/reset');
}
