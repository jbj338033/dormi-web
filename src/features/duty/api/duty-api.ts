import { api } from '@/shared/api';
import type {
  DutySchedule,
  DutySwapRequest,
  CreateDutyInput,
  UpdateDutyInput,
  GenerateDutyInput,
  CreateSwapRequestInput,
} from '@/entities/duty';

export async function getDuties(params?: {
  type?: string;
  assigneeId?: string;
  startDate?: string;
  endDate?: string;
}): Promise<DutySchedule[]> {
  const searchParams = new URLSearchParams();
  if (params?.type) searchParams.set('type', params.type);
  if (params?.assigneeId) searchParams.set('assigneeId', params.assigneeId);
  if (params?.startDate) searchParams.set('startDate', params.startDate);
  if (params?.endDate) searchParams.set('endDate', params.endDate);

  return api.get<DutySchedule[]>('duties', { searchParams });
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

export async function createSwapRequest(dutyId: string, data: CreateSwapRequestInput): Promise<DutySwapRequest> {
  return api.post<DutySwapRequest>(`duties/${dutyId}/swap-requests`, { json: data });
}

export async function getMySwapRequests(): Promise<DutySwapRequest[]> {
  return api.get<DutySwapRequest[]>('duty-swap-requests/my');
}

export async function getPendingSwapRequests(): Promise<DutySwapRequest[]> {
  return api.get<DutySwapRequest[]>('duty-swap-requests/pending');
}

export async function approveSwapRequest(id: string): Promise<void> {
  await api.patch(`duty-swap-requests/${id}/approve`);
}

export async function rejectSwapRequest(id: string): Promise<void> {
  await api.patch(`duty-swap-requests/${id}/reject`);
}
