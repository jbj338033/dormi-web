'use client';

import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Badge,
} from '@/shared/ui';
import type { AuditLog } from '@/entities/log';
import { formatDateTime } from '@/shared/lib';

interface LogViewerProps {
  logs: AuditLog[];
}

const actionLabels: Record<string, string> = {
  CREATE: '생성',
  UPDATE: '수정',
  DELETE: '삭제',
  LOGIN: '로그인',
  POINT_GRANT: '점수 부여',
  POINT_CANCEL: '점수 취소',
  POINT_RESET: '점수 초기화',
  DUTY_SWAP: '당직 교환',
  DUTY_COMPLETE: '당직 완료',
};

const entityLabels: Record<string, string> = {
  USER: '사용자',
  STUDENT: '학생',
  POINT: '점수',
  DUTY_SCHEDULE: '당직 일정',
};

const actionVariants: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  CREATE: 'success',
  UPDATE: 'info',
  DELETE: 'danger',
  LOGIN: 'default',
  POINT_GRANT: 'warning',
  POINT_CANCEL: 'danger',
  POINT_RESET: 'danger',
  DUTY_SWAP: 'info',
  DUTY_COMPLETE: 'success',
};

export function LogViewer({ logs }: LogViewerProps) {
  if (logs.length === 0) {
    return (
      <div className="text-center py-8 text-zinc-500 text-sm">기록이 없습니다</div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>일시</TableHead>
          <TableHead>액션</TableHead>
          <TableHead>대상</TableHead>
          <TableHead>상세</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {logs.map((log) => (
          <TableRow key={log.id}>
            <TableCell className="text-xs text-zinc-500 whitespace-nowrap">
              {formatDateTime(log.timestamp)}
            </TableCell>
            <TableCell>
              <Badge variant={actionVariants[log.action] ?? 'default'}>
                {actionLabels[log.action] ?? log.action}
              </Badge>
            </TableCell>
            <TableCell>
              <span className="text-zinc-600 text-sm">
                {entityLabels[log.entityType] ?? log.entityType}
              </span>
              <span className="ml-1 font-mono text-xs text-zinc-400">#{log.entityId}</span>
            </TableCell>
            <TableCell className="text-sm text-zinc-600 max-w-xs truncate">
              {log.details ?? '-'}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
