'use client';

import { useEffect, useState, useCallback } from 'react';
import { format, startOfMonth, endOfMonth, addMonths } from 'date-fns';
import { ko } from 'date-fns/locale';
import toast from 'react-hot-toast';
import { Plus, ChevronLeft, ChevronRight, ArrowLeftRight } from 'lucide-react';
import { Card, CardContent, Modal, Button, Select, Input, Checkbox, PageHeader, Skeleton } from '@/shared/ui';
import { DutyCalendar } from '@/widgets/duty-calendar';
import {
  getDuties,
  generateDuties,
  createSwapRequest,
  getMySwapRequests,
  getPendingSwapRequests,
  approveSwapRequest,
  rejectSwapRequest,
} from '@/features/duty';
import { getAllUsers } from '@/features/user';
import { useAuthStore } from '@/shared/store/auth';
import { FEATURE_PERMISSIONS } from '@/shared/config/permissions';
import type { DutySchedule, DutyType, DutySwapRequest } from '@/entities/duty';
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
  const [formLoading, setFormLoading] = useState(false);

  const [swapMode, setSwapMode] = useState(false);
  const [swapSource, setSwapSource] = useState<DutySchedule | null>(null);
  const [swapTarget, setSwapTarget] = useState<DutySchedule | null>(null);
  const [swapLoading, setSwapLoading] = useState(false);

  const [mySwapRequests, setMySwapRequests] = useState<DutySwapRequest[]>([]);
  const [pendingSwapRequests, setPendingSwapRequests] = useState<DutySwapRequest[]>([]);
  const [approveLoading, setApproveLoading] = useState<string | null>(null);
  const [rejectLoading, setRejectLoading] = useState<string | null>(null);

  const [dutyType, setDutyType] = useState<DutyType>('DORM');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);
  const [floor, setFloor] = useState<number | undefined>();

  const user = useAuthStore((state) => state.user);
  const hasAnyRole = useAuthStore((state) => state.hasAnyRole);
  const canCreate = hasAnyRole(FEATURE_PERMISSIONS.DUTY_CREATE);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const start = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
      const end = format(endOfMonth(currentMonth), 'yyyy-MM-dd');
      const data = await getDuties({ startDate: start, endDate: end });
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
    } catch {}
  }, [canCreate]);

  const fetchSwapRequests = useCallback(async () => {
    try {
      const [my, pending] = await Promise.all([
        getMySwapRequests(),
        getPendingSwapRequests(),
      ]);
      setMySwapRequests(my);
      setPendingSwapRequests(pending);
    } catch {}
  }, []);

  useEffect(() => {
    fetchData();
    fetchUsers();
    fetchSwapRequests();
  }, [fetchData, fetchUsers, fetchSwapRequests]);

  const resetForm = () => {
    setDutyType('DORM');
    setStartDate('');
    setEndDate('');
    setSelectedAssignees([]);
    setFloor(undefined);
  };

  const resetSwapMode = () => {
    setSwapMode(false);
    setSwapSource(null);
    setSwapTarget(null);
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

  const handleScheduleClick = (schedule: DutySchedule) => {
    if (!swapMode) return;

    const isMe = schedule.assignee.id === user?.id;
    const isFuture = new Date(schedule.date) >= new Date();

    if (!swapSource) {
      if (isMe && isFuture) {
        setSwapSource(schedule);
      } else {
        toast.error('내 당직을 먼저 선택하세요');
      }
    } else {
      if (isMe) {
        setSwapSource(schedule);
        setSwapTarget(null);
      } else if (
        schedule.type === swapSource.type &&
        (schedule.type === 'DORM' || schedule.floor === swapSource.floor) &&
        isFuture
      ) {
        setSwapTarget(schedule);
      } else {
        toast.error('같은 유형의 당직만 교체할 수 있습니다');
      }
    }
  };

  const handleSwapConfirm = async () => {
    if (!swapSource || !swapTarget) return;
    setSwapLoading(true);
    try {
      await createSwapRequest(swapSource.id, { targetDutyId: swapTarget.id });
      toast.success(`${swapTarget.assignee.name}님에게 교체 신청 완료`);
      resetSwapMode();
      fetchSwapRequests();
    } catch {
      toast.error('신청 실패');
    } finally {
      setSwapLoading(false);
    }
  };

  const handleApprove = async (request: DutySwapRequest) => {
    setApproveLoading(request.id);
    try {
      await approveSwapRequest(request.id);
      toast.success('승인 완료');
      fetchSwapRequests();
      fetchData();
    } catch {
      toast.error('승인 실패');
    } finally {
      setApproveLoading(null);
    }
  };

  const handleReject = async (request: DutySwapRequest) => {
    setRejectLoading(request.id);
    try {
      await rejectSwapRequest(request.id);
      toast.success('거절 완료');
      fetchSwapRequests();
    } catch {
      toast.error('거절 실패');
    } finally {
      setRejectLoading(null);
    }
  };

  const toggleAssignee = (id: string) => {
    setSelectedAssignees((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const councilUsers = users.filter((u) => u.role === 'COUNCIL');
  const typeOptions = Object.entries(DUTY_TYPE_LABELS).map(([value, label]) => ({ value, label }));
  const pendingCount = pendingSwapRequests.length;
  const myPendingCount = mySwapRequests.filter((r) => r.status === 'PENDING').length;

  return (
    <div className="p-6">
      <PageHeader
        title="당직 관리"
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant={swapMode ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => swapMode ? resetSwapMode() : setSwapMode(true)}
            >
              <ArrowLeftRight className="h-4 w-4 mr-1.5" />
              {swapMode ? '취소' : '교체'}
            </Button>
            {canCreate && (
              <Button onClick={() => setIsCreateModalOpen(true)} size="sm">
                <Plus className="h-4 w-4 mr-1.5" />
                생성
              </Button>
            )}
          </div>
        }
      />

      {swapMode && (
        <div className="mb-4 p-4 bg-sky-50 border border-sky-200 rounded-lg">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="text-sm font-medium text-sky-900">교체 모드</p>
              <p className="text-xs text-sky-700 mt-0.5">
                {!swapSource
                  ? '내 당직을 선택하세요'
                  : !swapTarget
                  ? '교체할 상대방의 당직을 선택하세요'
                  : '교체 준비 완료'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {swapSource && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="px-2 py-1 bg-sky-100 rounded text-sky-800">
                    {formatDateKorean(swapSource.date)}
                  </span>
                  {swapTarget && (
                    <>
                      <span className="text-sky-600">↔</span>
                      <span className="px-2 py-1 bg-sky-100 rounded text-sky-800">
                        {swapTarget.assignee.name} ({format(new Date(swapTarget.date), 'M/d')})
                      </span>
                    </>
                  )}
                </div>
              )}
              {swapSource && swapTarget && (
                <Button size="sm" onClick={handleSwapConfirm} loading={swapLoading}>
                  신청
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {pendingCount > 0 && (
        <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm font-medium text-amber-900 mb-3">받은 교체 신청 {pendingCount}건</p>
          <div className="space-y-2">
            {pendingSwapRequests.map((req) => (
              <div key={req.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-amber-100">
                <div className="text-sm">
                  <span className="font-medium text-zinc-900">{req.requester.name}</span>
                  <span className="text-zinc-500 mx-2">·</span>
                  <span className="text-zinc-600">
                    {format(new Date(req.sourceDuty.date), 'M/d')} ↔ {format(new Date(req.targetDuty.date), 'M/d')}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleReject(req)}
                    loading={rejectLoading === req.id}
                    disabled={approveLoading === req.id}
                  >
                    거절
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleApprove(req)}
                    loading={approveLoading === req.id}
                    disabled={rejectLoading === req.id}
                  >
                    승인
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {myPendingCount > 0 && !swapMode && (
        <div className="mb-4 p-3 bg-zinc-50 border border-zinc-200 rounded-lg">
          <p className="text-sm text-zinc-600">보낸 교체 신청 {myPendingCount}건 대기중</p>
        </div>
      )}

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
                  <Skeleton key={i} className="h-24 rounded" />
                ))}
              </div>
            </div>
          ) : (
            <DutyCalendar
              currentMonth={currentMonth}
              schedules={schedules}
              currentUserId={user?.id}
              swapMode={swapMode}
              swapSource={swapSource}
              swapTarget={swapTarget}
              onScheduleClick={handleScheduleClick}
            />
          )}
        </CardContent>
      </Card>

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
    </div>
  );
}
