import { api } from '@/shared/api';
import type {
  PointReason,
  PointType,
  CreatePointReasonInput,
  UpdatePointReasonInput,
} from '@/entities/point-reason';

export async function getPointReasons(type?: PointType): Promise<PointReason[]> {
  const searchParams = new URLSearchParams();
  if (type) searchParams.set('type', type);
  return api.get<PointReason[]>('point-reasons', { searchParams });
}

export async function getPointReason(id: string): Promise<PointReason> {
  return api.get<PointReason>(`point-reasons/${id}`);
}

export async function createPointReason(data: CreatePointReasonInput): Promise<PointReason> {
  return api.post<PointReason>('point-reasons', { json: data });
}

export async function updatePointReason(id: string, data: UpdatePointReasonInput): Promise<PointReason> {
  return api.put<PointReason>(`point-reasons/${id}`, { json: data });
}

export async function deletePointReason(id: string): Promise<void> {
  await api.delete(`point-reasons/${id}`);
}
