import { z } from 'zod';

const UserInLogSchema = z.object({
  id: z.string(),
  email: z.string(),
  name: z.string(),
  role: z.enum(['ADMIN', 'SUPERVISOR', 'COUNCIL']),
});

export const AuditLogSchema = z.object({
  id: z.string(),
  action: z.string(),
  entityType: z.string(),
  entityId: z.string(),
  user: UserInLogSchema,
  details: z.any().nullable().optional(),
  ipAddress: z.string().optional(),
  createdAt: z.string(),
});

export type AuditLog = z.infer<typeof AuditLogSchema>;

export interface AuditLogFilter {
  userId?: string;
  action?: string;
  entityType?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: Pagination;
}
