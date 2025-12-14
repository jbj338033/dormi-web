'use client';

import { useEffect, useState } from 'react';
import { Users, Calendar } from 'lucide-react';
import { Card, CardContent, Badge } from '@/shared/ui';
import { getAllStudents } from '@/features/student';
import { getTodaySchedules } from '@/features/duty';
import type { Student } from '@/entities/student';
import type { DutySchedule } from '@/entities/duty';

export default function DashboardPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [todayDuties, setTodayDuties] = useState<DutySchedule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [studentsData, dormDuties, studyDuties] = await Promise.all([
          getAllStudents(),
          getTodaySchedules('DORM'),
          getTodaySchedules('NIGHT_STUDY'),
        ]);
        setStudents(studentsData);
        setTodayDuties([...dormDuties, ...studyDuties]);
      } catch {
        // handle error silently
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="h-5 w-5 border-2 border-zinc-300 border-t-zinc-900 rounded-full animate-spin" />
      </div>
    );
  }

  const roomCount = new Set(students.map((s) => s.roomNumber)).size;
  const incompleteDuties = todayDuties.filter((d) => !d.completed);

  return (
    <div className="p-6">
      <h1 className="text-lg font-semibold text-zinc-900 mb-6">대시보드</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-md bg-zinc-100 flex items-center justify-center">
                <Users className="h-4 w-4 text-zinc-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-zinc-900">{students.length}</p>
                <p className="text-xs text-zinc-500">{roomCount}개 호실</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-md bg-zinc-100 flex items-center justify-center">
                <Calendar className="h-4 w-4 text-zinc-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-zinc-900">{todayDuties.length}</p>
                <p className="text-xs text-zinc-500">{incompleteDuties.length}개 대기</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <div className="px-4 py-3 border-b border-zinc-100">
            <h2 className="text-sm font-medium text-zinc-900">오늘의 당직</h2>
          </div>
          <CardContent>
            {todayDuties.length === 0 ? (
              <p className="text-sm text-zinc-500 text-center py-4">오늘 당직 일정이 없습니다</p>
            ) : (
              <div className="space-y-2">
                {todayDuties.map((duty) => (
                  <div key={duty.id} className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-2">
                      <Badge variant={duty.type === 'DORM' ? 'info' : 'warning'}>
                        {duty.type === 'DORM' ? '기숙사' : '심야자습'}
                      </Badge>
                      {duty.floor && <span className="text-xs text-zinc-500">{duty.floor}층</span>}
                    </div>
                    <Badge variant={duty.completed ? 'success' : 'default'}>
                      {duty.completed ? '완료' : '대기'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <div className="px-4 py-3 border-b border-zinc-100">
            <h2 className="text-sm font-medium text-zinc-900">학년별 현황</h2>
          </div>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((grade) => {
                const count = students.filter((s) => s.grade === grade).length;
                const percentage = students.length > 0 ? Math.round((count / students.length) * 100) : 0;
                return (
                  <div key={grade}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-zinc-600">{grade}학년</span>
                      <span className="text-zinc-900 font-medium">{count}명</span>
                    </div>
                    <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                      <div className="h-full bg-zinc-900 rounded-full transition-all" style={{ width: `${percentage}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
