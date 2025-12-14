'use client';

import { Trash2 } from 'lucide-react';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Badge,
  Button,
} from '@/shared/ui';
import type { DutySchedule } from '@/entities/duty';
import { DUTY_TYPE_LABELS } from '@/shared/config/constants';
import { formatDateKorean } from '@/shared/lib';

interface DutyScheduleTableProps {
  schedules: DutySchedule[];
  onDelete?: (schedule: DutySchedule) => void;
  loading?: boolean;
}

export function DutyScheduleTable({
  schedules,
  onDelete,
  loading,
}: DutyScheduleTableProps) {
  if (schedules.length === 0) {
    return (
      <div className="text-center py-8 text-zinc-500 text-sm">
        등록된 당직 일정이 없습니다
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>날짜</TableHead>
          <TableHead>유형</TableHead>
          <TableHead>담당자</TableHead>
          <TableHead>층</TableHead>
          {onDelete && <TableHead className="w-16"></TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {schedules.map((schedule) => (
          <TableRow key={schedule.id}>
            <TableCell className="font-medium">
              {formatDateKorean(schedule.date)}
            </TableCell>
            <TableCell>
              <Badge variant={schedule.type === 'DORM' ? 'info' : 'warning'}>
                {DUTY_TYPE_LABELS[schedule.type]}
              </Badge>
            </TableCell>
            <TableCell>{schedule.assignee.name}</TableCell>
            <TableCell>{schedule.floor ? `${schedule.floor}층` : '-'}</TableCell>
            {onDelete && (
              <TableCell>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onDelete(schedule)}
                  disabled={loading}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
