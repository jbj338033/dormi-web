'use client';

import { useMemo } from 'react';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  isToday,
} from 'date-fns';
import { ko } from 'date-fns/locale';
import { cn } from '@/shared/lib/cn';
import type { DutySchedule } from '@/entities/duty';

interface DutyCalendarProps {
  currentMonth: Date;
  schedules: DutySchedule[];
  currentUserId?: string;
  onSelectDate?: (date: Date, schedules: DutySchedule[]) => void;
  swapMode?: boolean;
  swapSource?: DutySchedule | null;
  swapTarget?: DutySchedule | null;
  onScheduleClick?: (schedule: DutySchedule) => void;
}

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

const sortSchedules = (schedules: DutySchedule[]) => {
  return [...schedules].sort((a, b) => {
    if (a.type === 'DORM' && b.type !== 'DORM') return -1;
    if (a.type !== 'DORM' && b.type === 'DORM') return 1;
    if (a.type === 'NIGHT_STUDY' && b.type === 'NIGHT_STUDY') {
      return (a.floor || 0) - (b.floor || 0);
    }
    return 0;
  });
};

const getTypeLabel = (schedule: DutySchedule) => {
  if (schedule.type === 'DORM') return '기숙사';
  return `${schedule.floor}층`;
};

export function DutyCalendar({
  currentMonth,
  schedules,
  currentUserId,
  onSelectDate,
  swapMode = false,
  swapSource,
  swapTarget,
  onScheduleClick,
}: DutyCalendarProps) {
  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth), { locale: ko });
    const end = endOfWeek(endOfMonth(currentMonth), { locale: ko });
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const getSchedulesForDay = (date: Date) => {
    return sortSchedules(schedules.filter((s) => isSameDay(new Date(s.date), date)));
  };

  const isMyDuty = (daySchedules: DutySchedule[]) => {
    return currentUserId && daySchedules.some((s) => s.assignee.id === currentUserId);
  };

  return (
    <div>
      <div className="grid grid-cols-7 border-b border-zinc-100">
        {WEEKDAYS.map((day, i) => (
          <div
            key={day}
            className={cn(
              'py-2 text-center text-xs font-medium',
              i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-zinc-500'
            )}
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {days.map((day) => {
          const daySchedules = getSchedulesForDay(day);
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isMyDay = isMyDuty(daySchedules);
          const dayOfWeek = day.getDay();

          return (
            <div
              key={day.toISOString()}
              onClick={() => !swapMode && onSelectDate?.(day, daySchedules)}
              className={cn(
                'min-h-24 p-1.5 border-b border-r border-zinc-100 transition-colors',
                !isCurrentMonth && 'bg-zinc-50/50',
                isMyDay && isCurrentMonth && !swapMode && 'bg-amber-50/50',
                !swapMode && onSelectDate && 'cursor-pointer hover:bg-zinc-50'
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className={cn(
                    'inline-flex items-center justify-center w-5 h-5 rounded-full text-xs',
                    !isCurrentMonth && 'text-zinc-300',
                    isCurrentMonth && dayOfWeek === 0 && 'text-red-400',
                    isCurrentMonth && dayOfWeek === 6 && 'text-blue-400',
                    isCurrentMonth && dayOfWeek !== 0 && dayOfWeek !== 6 && 'text-zinc-600',
                    isToday(day) && 'bg-zinc-900 text-white font-bold'
                  )}
                >
                  {format(day, 'd')}
                </span>
              </div>

              {isCurrentMonth && daySchedules.length > 0 && (
                <div className="space-y-0.5">
                  {daySchedules.map((schedule) => {
                    const isMe = schedule.assignee.id === currentUserId;
                    const isSource = swapSource?.id === schedule.id;
                    const isTarget = swapTarget?.id === schedule.id;
                    const isFuture = new Date(schedule.date) >= new Date();
                    const canSelect = swapMode && isFuture && (isMe || (swapSource && !isMe));

                    return (
                      <div
                        key={schedule.id}
                        onClick={(e) => {
                          if (swapMode && onScheduleClick) {
                            e.stopPropagation();
                            onScheduleClick(schedule);
                          }
                        }}
                        className={cn(
                          'text-[10px] px-1 py-0.5 rounded truncate transition-all',
                          schedule.type === 'DORM' ? 'bg-sky-100 text-sky-700' : 'bg-violet-100 text-violet-700',
                          isMe && !swapMode && 'ring-1 ring-amber-400 font-medium',
                          swapMode && canSelect && 'cursor-pointer hover:ring-2 hover:ring-sky-400',
                          isSource && 'ring-2 ring-sky-500 bg-sky-200',
                          isTarget && 'ring-2 ring-emerald-500 bg-emerald-100 text-emerald-700'
                        )}
                      >
                        {getTypeLabel(schedule)} {schedule.assignee.name}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-4 mt-4 px-2 text-xs text-zinc-500">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-sky-100" />
          <span>기숙사</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-violet-100" />
          <span>심야자습</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-zinc-100 ring-1 ring-amber-400" />
          <span>내 당직</span>
        </div>
      </div>
    </div>
  );
}
