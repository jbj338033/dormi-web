import { z } from 'zod';

export const PointTypeSchema = z.enum(['REWARD', 'PENALTY']);
export type PointType = z.infer<typeof PointTypeSchema>;

export const PointReasonSchema = z.object({
  id: z.string(),
  name: z.string(),
  score: z.number(),
  type: PointTypeSchema,
});

export type PointReason = z.infer<typeof PointReasonSchema>;

export interface CreatePointReasonInput {
  name: string;
  score: number;
  type: PointType;
}

export interface UpdatePointReasonInput {
  name?: string;
  score?: number;
  type?: PointType;
}
