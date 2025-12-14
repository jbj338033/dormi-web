export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081';

export const ROLES = {
  ADMIN: 'ADMIN',
  SUPERVISOR: 'SUPERVISOR',
  COUNCIL: 'COUNCIL',
} as const;

export const POINT_TYPES = {
  MERIT: 'MERIT',
  DEMERIT: 'DEMERIT',
} as const;

export const POINT_REASONS = {
  LATE_RETURN: 'LATE_RETURN',
  ABSENT_ROLLCALL: 'ABSENT_ROLLCALL',
  NOISE: 'NOISE',
  ROOM_UNCLEANED: 'ROOM_UNCLEANED',
  UNAUTHORIZED_OUTING: 'UNAUTHORIZED_OUTING',
  UNAUTHORIZED_ABSENCE: 'UNAUTHORIZED_ABSENCE',
  SMOKING: 'SMOKING',
  DRINKING: 'DRINKING',
  GOOD_DEED: 'GOOD_DEED',
  CLEAN_ROOM: 'CLEAN_ROOM',
  VOLUNTEER: 'VOLUNTEER',
  OTHER: 'OTHER',
} as const;

export const POINT_REASON_LABELS: Record<string, string> = {
  LATE_RETURN: '귀가 지각',
  ABSENT_ROLLCALL: '점호 불참',
  NOISE: '소음',
  ROOM_UNCLEANED: '호실 미청소',
  UNAUTHORIZED_OUTING: '무단 외출',
  UNAUTHORIZED_ABSENCE: '무단 외박',
  SMOKING: '흡연',
  DRINKING: '음주',
  GOOD_DEED: '선행',
  CLEAN_ROOM: '청결 모범',
  VOLUNTEER: '봉사 활동',
  OTHER: '기타',
};

export const DUTY_TYPES = {
  DORM: 'DORM',
  NIGHT_STUDY: 'NIGHT_STUDY',
} as const;

export const DUTY_TYPE_LABELS: Record<string, string> = {
  DORM: '기숙사 당직',
  NIGHT_STUDY: '심야 자습 당직',
};

export const EXPULSION_THRESHOLD = 25;
