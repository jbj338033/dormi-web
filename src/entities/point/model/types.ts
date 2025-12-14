import { z } from 'zod';

export const PointTypeSchema = z.enum(['MERIT', 'DEMERIT']);
export type PointType = z.infer<typeof PointTypeSchema>;

export const PointReasonSchema = z.enum([
  'LATE_RETURN',
  'ABSENT_ROLLCALL',
  'NOISE',
  'ROOM_UNCLEANED',
  'UNAUTHORIZED_OUTING',
  'UNAUTHORIZED_ABSENCE',
  'SMOKING',
  'DRINKING',
  'GOOD_DEED',
  'CLEAN_ROOM',
  'VOLUNTEER',
  'OTHER',
]);
export type PointReason = z.infer<typeof PointReasonSchema>;

const StudentInPointSchema = z.object({
  id: z.number(),
  studentNumber: z.string(),
  name: z.string(),
  roomNumber: z.string(),
  grade: z.number(),
});

const UserInPointSchema = z.object({
  id: z.number(),
  email: z.string(),
  name: z.string(),
  roles: z.array(z.enum(['ADMIN', 'SUPERVISOR', 'COUNCIL'])),
});

export const PointSchema = z.object({
  id: z.number(),
  student: StudentInPointSchema,
  type: PointTypeSchema,
  score: z.number(),
  reason: PointReasonSchema,
  reasonDescription: z.string().nullable().optional(),
  customReason: z.string().nullable().optional(),
  grantedBy: UserInPointSchema,
  cancelled: z.boolean(),
  cancelledAt: z.string().nullable().optional(),
  cancelledBy: UserInPointSchema.nullable().optional(),
  createdAt: z.string(),
});

export type Point = z.infer<typeof PointSchema>;

export const GrantPointFormSchema = z.object({
  type: PointTypeSchema,
  score: z.string().min(1, '점수를 입력하세요'),
  reason: PointReasonSchema,
  customReason: z.string().optional(),
});

export type GrantPointFormInput = z.infer<typeof GrantPointFormSchema>;

export interface GrantPointInput {
  type: PointType;
  score: number;
  reason: PointReason;
  customReason?: string;
}

export interface BulkGrantPointInput {
  studentIds: number[];
  point: GrantPointInput;
}

export const PointSummarySchema = z.object({
  studentId: z.number(),
  meritTotal: z.number(),
  demeritTotal: z.number(),
  netScore: z.number(),
  expulsionWarning: z.boolean(),
});

export type PointSummary = z.infer<typeof PointSummarySchema>;
