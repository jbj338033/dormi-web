import { z } from 'zod';

const StudentInPointSchema = z.object({
  id: z.string(),
  studentNumber: z.string(),
  name: z.string(),
  roomNumber: z.string(),
  grade: z.number(),
});

const UserInPointSchema = z.object({
  id: z.string(),
  email: z.string(),
  name: z.string(),
  role: z.enum(['ADMIN', 'SUPERVISOR', 'COUNCIL']),
});

const ReasonInPointSchema = z.object({
  id: z.string(),
  name: z.string(),
  score: z.number(),
  type: z.enum(['REWARD', 'PENALTY']),
});

export const PointSchema = z.object({
  id: z.string(),
  student: StudentInPointSchema,
  reason: ReasonInPointSchema,
  givenBy: UserInPointSchema,
  givenAt: z.string(),
  cancelled: z.boolean(),
  cancelledAt: z.string().nullable().optional(),
});

export type Point = z.infer<typeof PointSchema>;

export const PointSummarySchema = z.object({
  studentId: z.string(),
  totalReward: z.number(),
  totalPenalty: z.number(),
  netScore: z.number(),
});

export type PointSummary = z.infer<typeof PointSummarySchema>;

export interface GivePointInput {
  studentId: string;
  reasonId: string;
}

export interface BulkGivePointInput {
  studentIds: string[];
  reasonId: string;
}
