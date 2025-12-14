'use client';

import { useEffect, useState, useCallback } from 'react';
import { format, startOfMonth, endOfMonth, addMonths } from 'date-fns';
import toast from 'react-hot-toast';
import { Plus, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Card, CardContent, Modal, Button, Select, Input, Badge, Checkbox } from '@/shared/ui';
import { DutyCalendar } from '@/widgets/duty-calendar';
import { getSchedulesByDateRange, generateDormDuty, generateNightStudyDuty, deleteSchedule } from '@/features/duty';
import { getAllUsers } from '@/features/user';
import { useAuthStore } from '@/shared/store/auth';
import { FEATURE_PERMISSIONS } from '@/shared/config/permissions';
import type { DutySchedule, DutyType } from '@/entities/duty';
import type { User } from '@/entities/user';
import { DUTY_TYPE_LABELS } from '@/shared/config/constants';
import { formatDateKorean } from '@/shared/lib';
import { cn } from '@/shared/lib/cn';

export default function DutiesPage() {
  const [schedules, setSchedules] = useState<DutySchedule[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSchedules, setSelectedSchedules] = useState<DutySchedule[]>([]);
  const [formLoading, setFormLoading] = useState(false);

  const [dutyType, setDutyType] = useState<DutyType>('DORM');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedAssignees, setSelectedAssignees] = useState<number[]>([]);
  const [floor2Assignees, setFloor2Assignees] = useState<number[]>([]);
  const [floor3Assignees, setFloor3Assignees] = useState<number[]>([]);

  const user = useAuthStore((state) => state.user);
  const hasAnyRole = useAuthStore((state) => state.hasAnyRole);
  const canCreate = hasAnyRole(FEATURE_PERMISSIONS.DUTY_CREATE);
  const canDelete = hasAnyRole(FEATURE_PERMISSIONS.DUTY_DELETE);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const start = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
      const end = format(endOfMonth(currentMonth), 'yyyy-MM-dd');
      const data = await getSchedulesByDateRange(start, end);
      setSchedules(data);
    } catch {
      toast.error('데이터를 불러오는데 실패했습니다');
    } finally {
      setLoading(false);
    }
  }, [currentMonth]);

  const fetchUsers = useCallback(async () => {
    if (!canCreate) return;
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch {
      // ignore
    }
  }, [canCreate]);

  useEffect(() => {
    fetchData();
    fetchUsers();
  }, [fetchData, fetchUsers]);

  const resetForm = () => {
    setDutyType('DORM');
    setStartDate('');
    setEndDate('');
    setSelectedAssignees([]);
    setFloor2Assignees([]);
    setFloor3Assignees([]);
  };

  const handleGenerate = async () => {
    if (!startDate || !endDate) {
      toast.error('날짜를 선택하세요');
      return;
    }
    if (dutyType === 'DORM' && selectedAssignees.length === 0) {
      toast.error('담당자를 선택하세요');
      return;
    }
    if (dutyType === 'NIGHT_STUDY' && (floor2Assignees.length === 0 || floor3Assignees.length === 0)) {
      toast.error('각 층별 담당자를 선택하세요');
      return;
    }

    setFormLoading(true);
    try {
      if (dutyType === 'DORM') {
        await generateDormDuty({ startDate, endDate, assignees: selectedAssignees });
      } else {
        await generateNightStudyDuty({ startDate, endDate, floor2Assignees, floor3Assignees });
      }
      toast.success('생성되었습니다');
      setIsCreateModalOpen(false);
      resetForm();
      fetchData();
    } catch {
      toast.error('생성에 실패했습니다');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (schedule: DutySchedule) => {
    if (!confirm('삭제하시겠습니까?')) return;
    try {
      await deleteSchedule(schedule.id);
      toast.success('삭제되었습니다');
      fetchData();
      setSelectedSchedules((prev) => prev.filter((s) => s.id !== schedule.id));
    } catch {
      toast.error('삭제에 실패했습니다');
    }
  };

  const handleSelectDate = (date: Date, daySchedules: DutySchedule[]) => {
    setSelectedDate(date);
    setSelectedSchedules(daySchedules);
  };

  const toggleAssignee = (id: number, list: number[], setList: (v: number[]) => void) => {
    setList(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);
  };

  const councilUsers = users.filter((u) => u.roles.includes('COUNCIL'));
  const typeOptions = Object.entries(DUTY_TYPE_LABELS).map(([value, label]) => ({ value, label }));

  const myUpcomingDuties = schedules
    .filter((s) => s.assignee.id === user?.id && new Date(s.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-semibold text-zinc-900">당직</h1>
        {canCreate && (
          <Button onClick={() => setIsCreateModalOpen(true)} size="sm">
            <Plus className="h-4 w-4 mr-1" />
            생성
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <Card>
            <div className="px-4 py-3 border-b border-zinc-100 flex items-center justify-between">
              <span className="text-sm font-medium text-zinc-900">{format(currentMonth, 'yyyy년 M월')}</span>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" onClick={() => setCurrentMonth(addMonths(currentMonth, -1))}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setCurrentMonth(new Date())}>
                  오늘
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex items-center justify-center h-96">
                  <div className="h-5 w-5 border-2 border-zinc-300 border-t-zinc-900 rounded-full animate-spin" />
                </div>
              ) : (
                <DutyCalendar
                  currentMonth={currentMonth}
                  schedules={schedules}
                  currentUserId={user?.id}
                  onSelectDate={handleSelectDate}
                />
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          {myUpcomingDuties.length > 0 && (
            <Card>
              <div className="px-4 py-3 border-b border-zinc-100">
                <h2 className="text-sm font-medium text-zinc-900">내 당직</h2>
              </div>
              <CardContent className="p-3">
                <div className="space-y-2">
                  {myUpcomingDuties.map((duty) => (
                    <div key={duty.id} className="p-2 bg-amber-50 rounded-md">
                      <p className="text-xs font-medium text-amber-900">{formatDateKorean(duty.date)}</p>
                      <p className="text-xs text-amber-700 mt-0.5">
                        {duty.type === 'DORM' ? '기숙사 당직' : `심야자습 ${duty.floor}층`}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {selectedDate && (
            <Card>
              <div className="px-4 py-3 border-b border-zinc-100">
                <h2 className="text-sm font-medium text-zinc-900">{formatDateKorean(selectedDate)}</h2>
              </div>
              <CardContent className="p-3">
                {selectedSchedules.length === 0 ? (
                  <p className="text-xs text-zinc-500 text-center py-4">당직 일정이 없습니다</p>
                ) : (
                  <div className="space-y-2">
                    {selectedSchedules.map((schedule) => (
                      <div
                        key={schedule.id}
                        className={cn(
                          'p-3 rounded-md border',
                          schedule.assignee.id === user?.id ? 'border-amber-200 bg-amber-50' : 'border-zinc-100 bg-zinc-50'
                        )}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <Badge variant={schedule.type === 'DORM' ? 'info' : 'warning'} className="mb-1">
                              {schedule.type === 'DORM' ? '기숙사' : `자습 ${schedule.floor}층`}
                            </Badge>
                            <p className="text-sm font-medium text-zinc-900">{schedule.assignee.name}</p>
                          </div>
                          {canDelete && (
                            <button
                              onClick={() => handleDelete(schedule)}
                              className="p-1 rounded hover:bg-white"
                              title="삭제"
                            >
                              <X className="h-4 w-4 text-red-500" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Modal isOpen={isCreateModalOpen} onClose={() => { setIsCreateModalOpen(false); resetForm(); }} title="당직 생성">
        <div className="space-y-4">
          <Select
            label="유형"
            options={typeOptions}
            value={dutyType}
            onChange={(e) => setDutyType(e.target.value as DutyType)}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              type="date"
              label="시작일"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <Input
              type="date"
              label="종료일"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          {dutyType === 'DORM' ? (
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">담당자</label>
              <div className="space-y-1.5 max-h-48 overflow-y-auto border border-zinc-200 rounded-lg p-2">
                {councilUsers.map((u) => (
                  <Checkbox
                    key={u.id}
                    id={`assignee-${u.id}`}
                    label={u.name}
                    checked={selectedAssignees.includes(u.id)}
                    onChange={() => toggleAssignee(u.id, selectedAssignees, setSelectedAssignees)}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">2층 담당자</label>
                <div className="space-y-1.5 max-h-40 overflow-y-auto border border-zinc-200 rounded-lg p-2">
                  {councilUsers.map((u) => (
                    <Checkbox
                      key={u.id}
                      id={`floor2-${u.id}`}
                      label={u.name}
                      checked={floor2Assignees.includes(u.id)}
                      onChange={() => toggleAssignee(u.id, floor2Assignees, setFloor2Assignees)}
                    />
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">3층 담당자</label>
                <div className="space-y-1.5 max-h-40 overflow-y-auto border border-zinc-200 rounded-lg p-2">
                  {councilUsers.map((u) => (
                    <Checkbox
                      key={u.id}
                      id={`floor3-${u.id}`}
                      label={u.name}
                      checked={floor3Assignees.includes(u.id)}
                      onChange={() => toggleAssignee(u.id, floor3Assignees, setFloor3Assignees)}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => { setIsCreateModalOpen(false); resetForm(); }}>
              취소
            </Button>
            <Button onClick={handleGenerate} loading={formLoading}>
              생성
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
