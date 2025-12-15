import { api } from '@/shared/api';
import type {
  DutySchedule,
  CreateDutyInput,
  UpdateDutyInput,
  GenerateDutyInput,
  SwapDutyInput,
} from '@/entities/duty';

export async function getDuties(params?: {
  type?: string;
  assigneeId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}) {
  const searchParams = new URLSearchParams();
  if (params?.type) searchParams.set('type', params.type);
  if (params?.assigneeId) searchParams.set('assigneeId', params.assigneeId);
  if (params?.startDate) searchParams.set('startDate', params.startDate);
  if (params?.endDate) searchParams.set('endDate', params.endDate);
  if (params?.page) searchParams.set('page', String(params.page));
  if (params?.limit) searchParams.set('limit', String(params.limit));

  return api.paginated<DutySchedule>('duties', { searchParams });
}

export async function getDuty(id: string): Promise<DutySchedule> {
  return api.get<DutySchedule>(`duties/${id}`);
}

export async function createDuty(data: CreateDutyInput): Promise<DutySchedule> {
  return api.post<DutySchedule>('duties', { json: data });
}

export async function updateDuty(id: string, data: UpdateDutyInput): Promise<DutySchedule> {
  return api.put<DutySchedule>(`duties/${id}`, { json: data });
}

export async function deleteDuty(id: string): Promise<void> {
  await api.delete(`duties/${id}`);
}

export async function generateDuties(data: GenerateDutyInput): Promise<DutySchedule[]> {
  return api.post<DutySchedule[]>('duties/generate', { json: data });
}

export async function completeDuty(id: string): Promise<void> {
  await api.patch(`duties/${id}/complete`);
}

export async function swapDuty(id: string, data: SwapDutyInput): Promise<void> {
  await api.post(`duties/${id}/swap`, { json: data });
}
