import { exportToExcel, formatDateTime } from '@/shared/lib';
import type { Student } from '@/entities/student';
import type { Point, PointSummary } from '@/entities/point';

export function exportPointsSummary(
  students: Student[],
  summaries: Record<string, PointSummary>
) {
  const data = students
    .map((student) => {
      const summary = summaries[student.id];
      return {
        학년: student.grade,
        학번: student.studentNumber,
        이름: student.name,
        호실: student.roomNumber,
        상점: summary?.totalReward ?? 0,
        벌점: summary?.totalPenalty ?? 0,
        누적점수: summary?.netScore ?? 0,
      };
    })
    .sort((a, b) => {
      if (a.학년 !== b.학년) return a.학년 - b.학년;
      return a.학번.localeCompare(b.학번);
    });

  exportToExcel(data, {
    fileName: '벌점상점_현황',
    sheetName: '벌점상점 현황',
    columns: [
      { width: 6 },
      { width: 12 },
      { width: 10 },
      { width: 8 },
      { width: 8 },
      { width: 8 },
      { width: 10 },
    ],
  });
}

export function exportStudentPointsDetail(student: Student, points: Point[]) {
  const data = points.map((point) => ({
    유형: point.reason.type === 'REWARD' ? '상점' : '벌점',
    점수:
      point.reason.type === 'REWARD'
        ? `+${point.reason.score}`
        : `-${point.reason.score}`,
    사유: point.reason.name,
    부여자: point.givenBy.name,
    일시: formatDateTime(point.givenAt),
    상태: point.cancelled ? '취소' : '유효',
  }));

  exportToExcel(data, {
    fileName: `${student.name}_점수내역`,
    sheetName: '점수 내역',
    columns: [
      { width: 8 },
      { width: 8 },
      { width: 30 },
      { width: 12 },
      { width: 18 },
      { width: 8 },
    ],
  });
}
