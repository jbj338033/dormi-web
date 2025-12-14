import { api } from '@/shared/api';
import type { AuditLog, ActionType, EntityType, Page } from '@/entities/log';

export async function getLogs(page: number = 0, size: number = 20): Promise<Page<AuditLog>> {
  return api.get('api/logs', { searchParams: { page: String(page), size: String(size) } }).json<Page<AuditLog>>();
}

export async function getLogsByUser(userId: number): Promise<AuditLog[]> {
  return api.get(`api/logs/user/${userId}`).json<AuditLog[]>();
}

export async function getLogsByEntity(entityType: EntityType, entityId: number): Promise<AuditLog[]> {
  return api.get(`api/logs/entity/${entityType}/${entityId}`).json<AuditLog[]>();
}

export async function getLogsByDateRange(start: string, end: string): Promise<AuditLog[]> {
  return api.get('api/logs/date-range', { searchParams: { start, end } }).json<AuditLog[]>();
}

export async function getLogsByAction(action: ActionType): Promise<AuditLog[]> {
  return api.get(`api/logs/action/${action}`).json<AuditLog[]>();
}
