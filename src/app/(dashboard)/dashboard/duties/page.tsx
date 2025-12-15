'use client';

import { useEffect, useState, useCallback } from 'react';
import { format, startOfMonth, endOfMonth, addMonths } from 'date-fns';
import { ko } from 'date-fns/locale';
import toast from 'react-hot-toast';
import { Plus, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { Card, CardContent, Modal, Button, Select, Input, Badge, Checkbox, PageHeader, ConfirmDialog, EmptyState, Skeleton } from '@/shared/ui';
import { DutyCalendar } from '@/widgets/duty-calendar';
import { getDuties, generateDuties, deleteDuty } from '@/features/duty';
import { getAllUsers } from '@/features/user';
import { useAuthStore } from '@/shared/store/auth';
import { FEATURE_PERMISSIONS } from '@/shared/config/permissions';
import type { DutySchedule, DutyType } from '@/entities/duty';
import type { User as UserType } from '@/entities/user';
import { DUTY_TYPE_LABELS } from '@/shared/config/constants';
import { formatDateKorean } from '@/shared/lib';
import { cn } from '@/shared/lib/cn';

export default function DutiesPage() {
  const [schedules, setSchedules] = useState<DutySchedule[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSchedules, setSelectedSchedules] = useState<DutySchedule[]>([]);
  const [formLoading, setFormLoading] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [scheduleToDelete, setScheduleToDelete] = useState<DutySchedule | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [dutyType, setDutyType] = useState<DutyType>('DORM');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);
  const [floor, setFloor] = useState<number | undefined>();

  const user = useAuthStore((state) => state.user);
  const hasAnyRole = useAuthStore((state) => state.hasAnyRole);
  const canCreate = hasAnyRole(FEATURE_PERMISSIONS.DUTY_CREATE);
  const canDelete = hasAnyRole(FEATURE_PERMISSIONS.DUTY_DELETE);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const start = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
      const end = format(endOfMonth(currentMonth), 'yyyy-MM-dd');
      const res = await getDuties({ startDate: start, endDate: end, limit: 100 });
      setSchedules(res.data);
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
    setFloor(undefined);
  };

  const handleGenerate = async () => {
    if (!startDate || !endDate) {
      toast.error('날짜를 선택하세요');
      return;
    }
    if (selectedAssignees.length === 0) {
      toast.error('담당자를 선택하세요');
      return;
    }

    setFormLoading(true);
    try {
      await generateDuties({
        type: dutyType,
        startDate,
        endDate,
        assigneeIds: selectedAssignees,
        floor: dutyType === 'NIGHT_STUDY' ? floor : undefined,
      });
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

  const handleDeleteClick = (schedule: DutySchedule) => {
    setScheduleToDelete(schedule);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!scheduleToDelete) return;
    setDeleteLoading(true);
    try {
      await deleteDuty(scheduleToDelete.id);
      toast.success('삭제되었습니다');
      setIsDeleteDialogOpen(false);
      setScheduleToDelete(null);
      fetchData();
      setSelectedSchedules((prev) => prev.filter((s) => s.id !== scheduleToDelete.id));
    } catch {
      toast.error('삭제에 실패했습니다');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleSelectDate = (date: Date, daySchedules: DutySchedule[]) => {
    setSelectedDate(date);
    setSelectedSchedules(daySchedules);
  };

  const toggleAssignee = (id: string) => {
    setSelectedAssignees((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const councilUsers = users.filter((u) => u.role === 'COUNCIL');
  const typeOptions = Object.entries(DUTY_TYPE_LABELS).map(([value, label]) => ({ value, label }));

  const myUpcomingDuties = schedules
    .filter((s) => s.assignee.id === user?.id && new Date(s.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  const monthTotalDuties = schedules.length;
  const monthCompletedDuties = schedules.filter((s) => s.completed).length;

  return (
    <div className="p-6">
      <PageHeader
        title="당직 관리"
        actions={
          canCreate && (
            <Button onClick={() => setIsCreateModalOpen(true)} size="sm">
              <Plus className="h-4 w-4 mr-1.5" />
              당직 생성
            </Button>
          )
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 캘린더 */}
        <div className="lg:col-span-2">
          <Card>
            <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-zinc-900">{format(currentMonth, 'yyyy년 M월', { locale: ko })}</h2>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" onClick={() => setCurrentMonth(addMonths(currentMonth, -1))}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="secondary" size="sm" onClick={() => setCurrentMonth(new Date())}>
                  오늘
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-7 gap-2">
                    {Array.from({ length: 7 }).map((_, i) => (
                      <Skeleton key={i} className="h-6 rounded" />
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-2">
                    {Array.from({ length: 35 }).map((_, i) => (
                      <Skeleton key={i} className="h-20 rounded" />
                    ))}
                  </div>
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

        {/* 사이드바 */}
        <div className="space-y-4">
          {/* 내 당직 */}
          {myUpcomingDuties.length > 0 && (
            <Card>
              <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-zinc-900">내 예정 당직</h2>
                <span className="text-xs text-zinc-500">{myUpcomingDuties.length}건</span>
              </div>
              <CardContent className="p-3">
                <div className="space-y-2">
                  {myUpcomingDuties.map((duty) => (
                    <div key={duty.id} className="p-3 bg-amber-50 rounded-lg border border-amber-100 flex items-center justify-between">
                      <span className="text-sm text-amber-900">{formatDateKorean(duty.date)}</span>
                      <Badge variant={duty.type === 'DORM' ? 'info' : 'warning'} className="text-xs">
                        {duty.type === 'DORM' ? '기숙사' : `${duty.floor}층`}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* 선택된 날짜 정보 */}
          <Card>
            <div className="px-5 py-4 border-b border-zinc-100">
              <h2 className="text-sm font-semibold text-zinc-900">
                {selectedDate ? formatDateKorean(selectedDate) : '날짜 선택'}
              </h2>
              {selectedDate && (
                <p className="text-xs text-zinc-500 mt-0.5">{selectedSchedules.length}건의 당직</p>
              )}
            </div>
            <CardContent className="p-0">
              {!selectedDate ? (
                <EmptyState
                  variant="duties"
                  title="날짜를 선택하세요"
                  description="캘린더에서 날짜를 클릭하면 해당 날짜의 당직을 확인할 수 있습니다"
                  className="py-8"
                />
              ) : selectedSchedules.length === 0 ? (
                <EmptyState
                  variant="duties"
                  title="당직이 없습니다"
                  description="선택한 날짜에 등록된 당직이 없습니다"
                  className="py-8"
                />
              ) : (
                <div className="p-3 space-y-2">
                  {[...selectedSchedules]
                    .sort((a, b) => {
                      if (a.type === 'DORM' && b.type !== 'DORM') return -1;
                      if (a.type !== 'DORM' && b.type === 'DORM') return 1;
                      return (a.floor || 0) - (b.floor || 0);
                    })
                    .map((schedule) => {
                      const isMe = schedule.assignee.id === user?.id;
                      return (
                        <div
                          key={schedule.id}
                          className={cn(
                            'p-3 rounded-lg border flex items-center justify-between',
                            isMe ? 'border-amber-200 bg-amber-50' : 'border-zinc-100 bg-zinc-50'
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <Badge variant={schedule.type === 'DORM' ? 'info' : 'warning'} className="text-xs shrink-0">
                              {schedule.type === 'DORM' ? '기숙사' : `${schedule.floor}층`}
                            </Badge>
                            <span className={cn('text-sm', isMe ? 'font-medium text-amber-900' : 'text-zinc-700')}>
                              {schedule.assignee.name}
                              {isMe && <span className="text-amber-600 ml-1">(나)</span>}
                            </span>
                          </div>
                          {canDelete && (
                            <button
                              onClick={() => handleDeleteClick(schedule)}
                              className="p-1.5 rounded hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="h-4 w-4 text-zinc-400 hover:text-red-500" />
                            </button>
                          )}
                        </div>
                      );
                    })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 당직 생성 모달 */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          resetForm();
        }}
        title="당직 생성"
      >
        <div className="space-y-4">
          <Select
            label="당직 유형"
            options={typeOptions}
            value={dutyType}
            onChange={(e) => setDutyType(e.target.value as DutyType)}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input type="date" label="시작일" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            <Input type="date" label="종료일" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>

          {dutyType === 'NIGHT_STUDY' && (
            <Input
              type="number"
              label="층"
              value={floor ?? ''}
              onChange={(e) => setFloor(e.target.value ? Number(e.target.value) : undefined)}
              min={1}
              placeholder="예: 3"
            />
          )}

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">
              담당자 선택 {selectedAssignees.length > 0 && <span className="text-sky-600">({selectedAssignees.length}명)</span>}
            </label>
            <div className="space-y-1.5 max-h-48 overflow-y-auto border border-zinc-200 rounded-lg p-3 bg-zinc-50">
              {councilUsers.length === 0 ? (
                <p className="text-sm text-zinc-500 text-center py-2">담당자가 없습니다</p>
              ) : (
                councilUsers.map((u) => (
                  <div
                    key={u.id}
                    className={cn(
                      'flex items-center gap-2 p-2 rounded-lg transition-colors cursor-pointer',
                      selectedAssignees.includes(u.id) ? 'bg-sky-50 border border-sky-200' : 'hover:bg-white'
                    )}
                    onClick={() => toggleAssignee(u.id)}
                  >
                    <Checkbox id={`assignee-${u.id}`} checked={selectedAssignees.includes(u.id)} onChange={() => {}} />
                    <label htmlFor={`assignee-${u.id}`} className="text-sm text-zinc-700 cursor-pointer">
                      {u.name}
                    </label>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsCreateModalOpen(false);
                resetForm();
              }}
            >
              취소
            </Button>
            <Button onClick={handleGenerate} loading={formLoading}>
              생성
            </Button>
          </div>
        </div>
      </Modal>

      {/* 삭제 확인 다이얼로그 */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setScheduleToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="당직 삭제"
        description={
          scheduleToDelete ? `${scheduleToDelete.assignee.name}님의 ${formatDateKorean(scheduleToDelete.date)} 당직을 삭제하시겠습니까?` : ''
        }
        confirmText="삭제"
        variant="danger"
        loading={deleteLoading}
      />
    </div>
  );
}
