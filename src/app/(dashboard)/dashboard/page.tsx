'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Users, Calendar, Home, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { Card, CardContent, Badge, PageHeader, StatCardsSkeleton, EmptyState } from '@/shared/ui';
import { getStudents } from '@/features/student';
import { getDuties } from '@/features/duty';
import type { Student } from '@/entities/student';
import type { DutySchedule } from '@/entities/duty';

export default function DashboardPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [todayDuties, setTodayDuties] = useState<DutySchedule[]>([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const today = format(new Date(), 'yyyy-MM-dd');
        const [studentsRes, dutiesRes] = await Promise.all([
          getStudents({ page: 1, limit: 100 }),
          getDuties({ startDate: today, endDate: today, limit: 50 }),
        ]);
        setStudents(studentsRes.data);
        setTotalStudents(studentsRes.meta.total);
        setTodayDuties(dutiesRes.data);
      } catch {
        // handle error silently
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const roomCount = new Set(students.map((s) => s.roomNumber)).size;
  const completedDuties = todayDuties.filter((d) => d.completed).length;
  const incompleteDuties = todayDuties.filter((d) => !d.completed).length;
  const todayFormatted = format(new Date(), 'M월 d일 (EEEE)', { locale: ko });

  const statCards = [
    {
      label: '전체 학생',
      value: totalStudents,
      subtext: `${roomCount}개 호실`,
      icon: Users,
      color: 'bg-sky-50 text-sky-600',
    },
    {
      label: '오늘 당직',
      value: todayDuties.length,
      subtext: incompleteDuties > 0 ? `${incompleteDuties}개 대기` : '모두 완료',
      icon: Calendar,
      color: 'bg-violet-50 text-violet-600',
    },
    {
      label: '완료된 당직',
      value: completedDuties,
      subtext: '오늘 기준',
      icon: CheckCircle2,
      color: 'bg-emerald-50 text-emerald-600',
    },
    {
      label: '대기 중',
      value: incompleteDuties,
      subtext: '처리 필요',
      icon: Clock,
      color: incompleteDuties > 0 ? 'bg-amber-50 text-amber-600' : 'bg-zinc-50 text-zinc-400',
    },
  ];

  return (
    <div className="p-6">
      <PageHeader title="대시보드" description={todayFormatted} />

      {/* 통계 카드 */}
      {loading ? (
        <StatCardsSkeleton count={4} />
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-xs font-medium text-zinc-500 uppercase tracking-wide">{stat.label}</span>
                    <div className={`h-8 w-8 rounded-lg ${stat.color} flex items-center justify-center`}>
                      <Icon className="h-4 w-4" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-zinc-900">{stat.value}</p>
                  <p className="text-xs text-zinc-500 mt-1">{stat.subtext}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 오늘의 당직 */}
        <Card>
          <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-900">오늘의 당직</h2>
            {todayDuties.length > 0 && (
              <Badge variant={incompleteDuties === 0 ? 'success' : 'warning'}>
                {incompleteDuties === 0 ? '모두 완료' : `${incompleteDuties}개 대기`}
              </Badge>
            )}
          </div>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-5 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 bg-zinc-100 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : todayDuties.length === 0 ? (
              <EmptyState variant="duties" className="py-8" />
            ) : (
              <div className="divide-y divide-zinc-50">
                {todayDuties.map((duty) => (
                  <div key={duty.id} className="flex items-center justify-between px-5 py-3 hover:bg-zinc-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-9 w-9 rounded-lg flex items-center justify-center ${
                          duty.type === 'DORM' ? 'bg-sky-50' : 'bg-amber-50'
                        }`}
                      >
                        {duty.type === 'DORM' ? (
                          <Home className={`h-4 w-4 ${duty.type === 'DORM' ? 'text-sky-600' : 'text-amber-600'}`} />
                        ) : (
                          <Clock className="h-4 w-4 text-amber-600" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-zinc-900">
                          {duty.type === 'DORM' ? '기숙사 당직' : '심야자습 당직'}
                        </p>
                        {duty.floor && <p className="text-xs text-zinc-500">{duty.floor}층</p>}
                      </div>
                    </div>
                    <div
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        duty.completed ? 'bg-emerald-50 text-emerald-700' : 'bg-zinc-100 text-zinc-600'
                      }`}
                    >
                      {duty.completed ? <CheckCircle2 className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                      {duty.completed ? '완료' : '대기'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 학년별 현황 */}
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
