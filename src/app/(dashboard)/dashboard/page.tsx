'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Card, CardContent, Badge, PageHeader, EmptyState } from '@/shared/ui';
import { getStudents } from '@/features/student';
import { getDuties } from '@/features/duty';
import type { Student } from '@/entities/student';
import type { DutySchedule } from '@/entities/duty';

export default function DashboardPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [todayDuties, setTodayDuties] = useState<DutySchedule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const today = format(new Date(), 'yyyy-MM-dd');
        const [studentsData, dutiesData] = await Promise.all([
          getStudents(),
          getDuties({ startDate: today, endDate: today }),
        ]);
        setStudents(studentsData);
        setTodayDuties(dutiesData);
      } catch {
        // handle error silently
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const todayFormatted = format(new Date(), 'M월 d일 (EEEE)', { locale: ko });

  const sortedDuties = [...todayDuties].sort((a, b) => {
    if (a.type === 'DORM' && b.type !== 'DORM') return -1;
    if (a.type !== 'DORM' && b.type === 'DORM') return 1;
    return (a.floor || 0) - (b.floor || 0);
  });

  return (
    <div className="p-6">
      <PageHeader title="대시보드" description={todayFormatted} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-900">오늘의 당직</h2>
            {todayDuties.length > 0 && (
              <span className="text-xs text-zinc-500">{todayDuties.length}명</span>
            )}
          </div>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-5 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-10 bg-zinc-100 rounded animate-pulse" />
                ))}
              </div>
            ) : todayDuties.length === 0 ? (
              <EmptyState variant="duties" className="py-8" />
            ) : (
              <div className="divide-y divide-zinc-100">
                {sortedDuties.map((duty) => (
                  <div key={duty.id} className="flex items-center justify-between px-5 py-3">
                    <div className="flex items-center gap-3">
                      <Badge variant={duty.type === 'DORM' ? 'info' : 'warning'} className="text-xs">
                        {duty.type === 'DORM' ? '기숙사' : `${duty.floor}층`}
                      </Badge>
                      <span className="text-sm text-zinc-900">{duty.assignee?.name || '-'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <div className="px-5 py-4 border-b border-zinc-100">
            <h2 className="text-sm font-semibold text-zinc-900">학년별 현황</h2>
          </div>
          <CardContent className="p-5">
            {loading ? (
              <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-4 bg-zinc-100 rounded animate-pulse w-1/3" />
                    <div className="h-2 bg-zinc-100 rounded-full animate-pulse" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-5">
                {[1, 2, 3].map((grade) => {
                  const count = students.filter((s) => s.grade === grade).length;
                  const percentage = students.length > 0 ? Math.round((count / students.length) * 100) : 0;
                  const colors = ['bg-sky-500', 'bg-violet-500', 'bg-emerald-500'];

                  return (
                    <div key={grade}>
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                          <div className={`h-2 w-2 rounded-full ${colors[grade - 1]}`} />
                          <span className="text-sm font-medium text-zinc-700">{grade}학년</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-zinc-900">{count}명</span>
                          <span className="text-xs text-zinc-400">({percentage}%)</span>
                        </div>
                      </div>
                      <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${colors[grade - 1]} rounded-full transition-all duration-500 ease-out`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}

                <div className="pt-4 mt-4 border-t border-zinc-100">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-zinc-500">전체</span>
                    <span className="text-sm font-semibold text-zinc-900">{students.length}명</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
