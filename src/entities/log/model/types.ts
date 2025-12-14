import { z } from 'zod';

export const ActionTypeSchema = z.enum([
  'CREATE',
  'UPDATE',
  'DELETE',
  'LOGIN',
  'POINT_GRANT',
  'POINT_CANCEL',
  'POINT_RESET',
  'DUTY_SWAP',
  'DUTY_COMPLETE',
]);
export type ActionType = z.infer<typeof ActionTypeSchema>;

export const EntityTypeSchema = z.enum([
  'USER',
  'STUDENT',
  'POINT',
  'DUTY_SCHEDULE',
]);
export type EntityType = z.infer<typeof EntityTypeSchema>;

export const AuditLogSchema = z.object({
  id: z.number(),
  action: ActionTypeSchema,
  entityType: EntityTypeSchema,
  entityId: z.number(),
  performedById: z.number(),
  details: z.string().nullable().optional(),
  timestamp: z.string(),
});

export type AuditLog = z.infer<typeof AuditLogSchema>;

export const PageableSchema = z.object({
  page: z.number().optional(),
  size: z.number().optional(),
  sort: z.array(z.string()).optional(),
});

export type Pageable = z.infer<typeof PageableSchema>;

export const PageSchema = <T extends z.ZodType>(itemSchema: T) =>
  z.object({
    content: z.array(itemSchema),
    totalElements: z.number(),
    totalPages: z.number(),
    numberOfElements: z.number(),
    first: z.boolean(),
    last: z.boolean(),
    number: z.number(),
    size: z.number(),
    empty: z.boolean(),
  });

export type Page<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  numberOfElements: number;
  first: boolean;
  last: boolean;
  number: number;
  size: number;
  empty: boolean;
};
