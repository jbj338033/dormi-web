import { z } from 'zod';

export const DutyTypeSchema = z.enum(['DORM', 'NIGHT_STUDY']);
export type DutyType = z.infer<typeof DutyTypeSchema>;

const UserInDutySchema = z.object({
  id: z.string(),
  email: z.string(),
  name: z.string(),
  role: z.enum(['ADMIN', 'SUPERVISOR', 'COUNCIL']),
});

export const DutyScheduleSchema = z.object({
  id: z.string(),
  type: DutyTypeSchema,
  assignee: UserInDutySchema,
  date: z.string(),
  floor: z.number().nullable().optional(),
  createdAt: z.string().optional(),
});

export type DutySchedule = z.infer<typeof DutyScheduleSchema>;

export const SwapRequestStatusSchema = z.enum(['PENDING', 'APPROVED', 'REJECTED']);
export type SwapRequestStatus = z.infer<typeof SwapRequestStatusSchema>;

export const DutySwapRequestSchema = z.object({
  id: z.string(),
  requester: UserInDutySchema,
  sourceDuty: DutyScheduleSchema,
  targetDuty: DutyScheduleSchema,
  status: SwapRequestStatusSchema,
  createdAt: z.string(),
});

export type DutySwapRequest = z.infer<typeof DutySwapRequestSchema>;

export interface CreateDutyInput {
  type: DutyType;
  assigneeId: string;
  date: string;
  floor?: number;
}

export interface UpdateDutyInput {
  type?: DutyType;
  assigneeId?: string;
  date?: string;
  floor?: number;
}

export interface GenerateDutyInput {
  type: DutyType;
  startDate: string;
  endDate: string;
  assigneeIds: string[];
  floor?: number;
}

export interface CreateSwapRequestInput {
  targetDutyId: string;
}
