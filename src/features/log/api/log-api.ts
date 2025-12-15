import { api } from '@/shared/api';
import type { AuditLog, AuditLogFilter } from '@/entities/log';

export async function getAuditLogs(filter?: AuditLogFilter) {
  const searchParams = new URLSearchParams();
  if (filter?.userId) searchParams.set('userId', filter.userId);
  if (filter?.action) searchParams.set('action', filter.action);
  if (filter?.entityType) searchParams.set('entityType', filter.entityType);
  if (filter?.startDate) searchParams.set('startDate', filter.startDate);
  if (filter?.endDate) searchParams.set('endDate', filter.endDate);
  if (filter?.page) searchParams.set('page', String(filter.page));
  if (filter?.limit) searchParams.set('limit', String(filter.limit));

  return api.paginated<AuditLog>('audit-logs', { searchParams });
}
