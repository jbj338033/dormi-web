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
}

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

export function DutyCalendar({
  currentMonth,
  schedules,
  currentUserId,
  onSelectDate,
}: DutyCalendarProps) {
  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth), { locale: ko });
    const end = endOfWeek(endOfMonth(currentMonth), { locale: ko });
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const getSchedulesForDay = (date: Date) => {
    return schedules.filter((s) => isSameDay(new Date(s.date), date));
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
          const mySchedules = daySchedules.filter((s) => s.assignee.id === currentUserId);

          return (
            <div
              key={day.toISOString()}
              onClick={() => onSelectDate?.(day, daySchedules)}
              className={cn(
                'min-h-24 p-1.5 border-b border-r border-zinc-100 cursor-pointer transition-colors',
                !isCurrentMonth && 'bg-zinc-50/50',
                isMyDay && isCurrentMonth && 'bg-amber-50/70',
                onSelectDate && 'hover:bg-zinc-50'
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
                {isCurrentMonth && isMyDay && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                )}
              </div>

              {isCurrentMonth && daySchedules.length > 0 && (
                <div className="space-y-0.5">
                  {daySchedules.map((schedule) => {
                    const isMe = schedule.assignee.id === currentUserId;
                    return (
                      <div
                        key={schedule.id}
                        className={cn(
                          'text-[10px] px-1 py-0.5 rounded truncate',
                          isMe
                            ? 'bg-amber-200 text-amber-900 font-medium'
                            : schedule.type === 'DORM'
                            ? 'bg-sky-100 text-sky-700'
                            : 'bg-violet-100 text-violet-700',
                          schedule.completed && 'opacity-50'
                        )}
                      >
                        {schedule.assignee.name}
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
          <div className="w-3 h-3 rounded bg-amber-200" />
          <span>내 당직</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-sky-100" />
          <span>기숙사</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-violet-100" />
          <span>심야자습</span>
        </div>
      </div>
    </div>
  );
}
