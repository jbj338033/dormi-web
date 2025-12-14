import { api } from '@/shared/api';
import type { DutySchedule, DutyType } from '@/entities/duty';

export interface GenerateDormDutyInput {
  startDate: string;
  endDate: string;
  assignees: number[];
}

export interface GenerateNightStudyDutyInput {
  startDate: string;
  endDate: string;
  floor2Assignees: number[];
  floor3Assignees: number[];
}

export async function getSchedulesByDateRange(startDate: string, endDate: string): Promise<DutySchedule[]> {
  return api.get('api/duties', { searchParams: { startDate, endDate } }).json<DutySchedule[]>();
}

export async function getTodaySchedules(type: DutyType): Promise<DutySchedule[]> {
  return api.get('api/duties/today', { searchParams: { type } }).json<DutySchedule[]>();
}

export async function generateDormDuty(data: GenerateDormDutyInput): Promise<DutySchedule[]> {
  return api.post('api/duties/generate/dorm', { json: data }).json<DutySchedule[]>();
}

export async function generateNightStudyDuty(data: GenerateNightStudyDutyInput): Promise<DutySchedule[]> {
  return api.post('api/duties/generate/night-study', { json: data }).json<DutySchedule[]>();
}

export async function deleteSchedule(id: number): Promise<void> {
  await api.delete(`api/duties/${id}`);
}
