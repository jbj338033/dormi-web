'use client';

import { X } from 'lucide-react';
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
import type { Point } from '@/entities/point';
import { POINT_REASON_LABELS } from '@/shared/config/constants';
import { formatDateTime } from '@/shared/lib';

interface PointHistoryProps {
  points: Point[];
  onCancel?: (point: Point) => void;
  loading?: boolean;
}

export function PointHistory({ points, onCancel, loading }: PointHistoryProps) {
  if (points.length === 0) {
    return (
      <div className="text-center py-8 text-zinc-500 text-sm">
        부여된 점수가 없습니다
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>유형</TableHead>
          <TableHead>점수</TableHead>
          <TableHead>사유</TableHead>
          <TableHead>부여자</TableHead>
          <TableHead>일시</TableHead>
          <TableHead>상태</TableHead>
          <TableHead className="w-12"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {points.map((point) => (
          <TableRow key={point.id}>
            <TableCell>
              <Badge variant={point.type === 'MERIT' ? 'success' : 'danger'}>
                {point.type === 'MERIT' ? '상점' : '벌점'}
              </Badge>
            </TableCell>
            <TableCell className="font-medium">
              {point.type === 'MERIT' ? '+' : '-'}
              {point.score}
            </TableCell>
            <TableCell>
              <span>{POINT_REASON_LABELS[point.reason]}</span>
              {point.customReason && (
                <span className="text-zinc-400 text-xs block">{point.customReason}</span>
              )}
            </TableCell>
            <TableCell className="text-zinc-500">{point.grantedBy.name}</TableCell>
            <TableCell className="text-xs text-zinc-400">
              {formatDateTime(point.createdAt)}
            </TableCell>
            <TableCell>
              {point.cancelled ? (
                <Badge variant="default">취소</Badge>
              ) : (
                <Badge variant="info">유효</Badge>
              )}
            </TableCell>
            <TableCell>
              {!point.cancelled && onCancel && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onCancel(point)}
                  disabled={loading}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
