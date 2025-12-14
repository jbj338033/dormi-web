import { z } from 'zod';

export const DutyTypeSchema = z.enum(['DORM', 'NIGHT_STUDY']);
export type DutyType = z.infer<typeof DutyTypeSchema>;

const UserInDutySchema = z.object({
  id: z.number(),
  email: z.string(),
  name: z.string(),
  roles: z.array(z.enum(['ADMIN', 'SUPERVISOR', 'COUNCIL'])),
});

export const DutyScheduleSchema = z.object({
  id: z.number(),
  type: DutyTypeSchema,
  assignee: UserInDutySchema,
  date: z.string(),
  floor: z.number().nullable().optional(),
  completed: z.boolean(),
});

export type DutySchedule = z.infer<typeof DutyScheduleSchema>;
