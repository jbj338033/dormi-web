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
  completed: z.boolean(),
  createdAt: z.string().optional(),
});

export type DutySchedule = z.infer<typeof DutyScheduleSchema>;

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

export interface SwapDutyInput {
  targetDutyId: string;
}
