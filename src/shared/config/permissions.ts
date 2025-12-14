import type { Role } from '@/entities/user';

export const PAGE_PERMISSIONS: Record<string, Role[]> = {
  '/dashboard': ['ADMIN', 'SUPERVISOR', 'COUNCIL'],
  '/dashboard/students': ['ADMIN', 'SUPERVISOR', 'COUNCIL'],
  '/dashboard/points': ['ADMIN', 'SUPERVISOR', 'COUNCIL'],
  '/dashboard/duties': ['ADMIN', 'SUPERVISOR', 'COUNCIL'],
  '/dashboard/users': ['ADMIN'],
  '/dashboard/logs': ['ADMIN'],
};

export const FEATURE_PERMISSIONS = {
  STUDENT_CREATE: ['ADMIN'] as Role[],
  STUDENT_EDIT: ['ADMIN'] as Role[],
  STUDENT_DELETE: ['ADMIN'] as Role[],
  POINT_GRANT: ['ADMIN', 'SUPERVISOR'] as Role[],
  POINT_CANCEL: ['ADMIN', 'SUPERVISOR'] as Role[],
  POINT_RESET: ['ADMIN'] as Role[],
  DUTY_CREATE: ['ADMIN'] as Role[],
  DUTY_DELETE: ['ADMIN'] as Role[],
  USER_MANAGE: ['ADMIN'] as Role[],
};
