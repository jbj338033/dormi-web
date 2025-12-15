export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export const ROLES = {
  ADMIN: 'ADMIN',
  SUPERVISOR: 'SUPERVISOR',
  COUNCIL: 'COUNCIL',
} as const;

export const ROLE_LABELS: Record<string, string> = {
  ADMIN: '관리자',
  SUPERVISOR: '사감',
  COUNCIL: '학생회',
};

export const POINT_TYPES = {
  REWARD: 'REWARD',
  PENALTY: 'PENALTY',
} as const;

export const POINT_TYPE_LABELS: Record<string, string> = {
  REWARD: '상점',
  PENALTY: '벌점',
};

export const DUTY_TYPES = {
  DORM: 'DORM',
  NIGHT_STUDY: 'NIGHT_STUDY',
} as const;

export const DUTY_TYPE_LABELS: Record<string, string> = {
  DORM: '기숙사 당직',
  NIGHT_STUDY: '심야 자습 당직',
};

export const PENALTY_THRESHOLD = 25;
