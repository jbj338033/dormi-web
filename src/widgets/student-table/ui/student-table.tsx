'use client';

import { useState, useMemo } from 'react';
import { Search, Edit, Trash2, Plus, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Button,
  Input,
  Badge,
  Checkbox,
  EmptyState,
} from '@/shared/ui';
import { cn } from '@/shared/lib';
import type { Student } from '@/entities/student';
import type { PointSummary } from '@/entities/point';

type SortKey = 'studentNumber' | 'name' | 'roomNumber' | 'grade' | 'netScore';
type SortOrder = 'asc' | 'desc';

interface StudentTableProps {
  students: Student[];
  onEdit?: (student: Student) => void;
  onDelete?: (student: Student) => void;
  onCreate?: () => void;
  onSelect?: (student: Student) => void;
  selectable?: boolean;
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  pointSummaries?: Record<string, PointSummary>;
  showPoints?: boolean;
  selectedStudentId?: string;
}

export function StudentTable({
  students,
  onEdit,
  onDelete,
  onCreate,
  onSelect,
  selectable,
  selectedIds = [],
  onSelectionChange,
  pointSummaries,
  showPoints,
  selectedStudentId,
}: StudentTableProps) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  const filtered = students.filter(
    (s) =>
      s.name.includes(search) ||
      s.studentNumber.includes(search) ||
      s.roomNumber.includes(search)
  );

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;

    return [...filtered].sort((a, b) => {
      let valueA: string | number;
      let valueB: string | number;

      if (sortKey === 'netScore') {
        valueA = pointSummaries?.[a.id]?.netScore ?? 0;
        valueB = pointSummaries?.[b.id]?.netScore ?? 0;
      } else {
        valueA = a[sortKey];
        valueB = b[sortKey];
      }

      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return sortOrder === 'asc' ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
      }

      return sortOrder === 'asc' ? Number(valueA) - Number(valueB) : Number(valueB) - Number(valueA);
    });
  }, [filtered, sortKey, sortOrder, pointSummaries]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      if (sortOrder === 'asc') {
        setSortOrder('desc');
      } else {
        setSortKey(null);
        setSortOrder('asc');
      }
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  const SortIcon = ({ columnKey }: { columnKey: SortKey }) => {
    if (sortKey !== columnKey) {
      return <ArrowUpDown className="h-3 w-3 text-zinc-300" />;
    }
    return sortOrder === 'asc' ? (
      <ArrowUp className="h-3 w-3 text-zinc-700" />
    ) : (
      <ArrowDown className="h-3 w-3 text-zinc-700" />
    );
  };

  const SortableHeader = ({ columnKey, children }: { columnKey: SortKey; children: React.ReactNode }) => (
    <button
      onClick={() => handleSort(columnKey)}
      className="flex items-center gap-1.5 hover:text-zinc-900 transition-colors group"
    >
      {children}
      <SortIcon columnKey={columnKey} />
    </button>
  );

  const allFilteredSelected = filtered.length > 0 && filtered.every((s) => selectedIds.includes(s.id));
  const someFilteredSelected = filtered.some((s) => selectedIds.includes(s.id));

  const handleSelectAll = () => {
    if (!onSelectionChange) return;
    if (allFilteredSelected) {
      onSelectionChange(selectedIds.filter((id) => !filtered.some((s) => s.id === id)));
    } else {
      const newIds = [...new Set([...selectedIds, ...filtered.map((s) => s.id)])];
      onSelectionChange(newIds);
    }
  };

  const handleSelectOne = (student: Student, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!onSelectionChange) return;
    if (selectedIds.includes(student.id)) {
      onSelectionChange(selectedIds.filter((id) => id !== student.id));
    } else {
      onSelectionChange([...selectedIds, student.id]);
    }
  };

  const handleRowClick = (student: Student) => {
    onSelect?.(student);
  };

  const colSpan = (selectable ? 1 : 0) + 4 + (showPoints ? 1 : 0) + (onEdit || onDelete ? 1 : 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <Input
            placeholder="이름, 학번, 호실로 검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        {search && (
          <span className="text-sm text-zinc-500">
            {sorted.length}명 검색됨
          </span>
        )}
        {onCreate && (
          <Button onClick={onCreate} size="sm">
            <Plus className="h-4 w-4 mr-1" />
            학생 등록
          </Button>
        )}
      </div>

      <div className="rounded-lg border border-zinc-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              {selectable && (
                <TableHead className="w-12">
                  <Checkbox
                    checked={allFilteredSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = someFilteredSelected && !allFilteredSelected;
                    }}
                    onChange={handleSelectAll}
                  />
                </TableHead>
              )}
              <TableHead>
                <SortableHeader columnKey="studentNumber">학번</SortableHeader>
              </TableHead>
              <TableHead>
                <SortableHeader columnKey="name">이름</SortableHeader>
              </TableHead>
              <TableHead>
                <SortableHeader columnKey="roomNumber">호실</SortableHeader>
              </TableHead>
              {showPoints && (
                <TableHead className="w-24">
                  <SortableHeader columnKey="netScore">점수</SortableHeader>
                </TableHead>
              )}
              <TableHead>
                <SortableHeader columnKey="grade">학년</SortableHeader>
              </TableHead>
              {(onEdit || onDelete) && <TableHead className="w-20"></TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.length === 0 ? (
              <TableRow>
                <TableCell colSpan={colSpan} className="p-0">
                  {search ? (
                    <EmptyState variant="search" className="py-12" />
                  ) : (
                    <EmptyState variant="students" className="py-12" action={onCreate ? { label: '학생 등록', onClick: onCreate } : undefined} />
                  )}
                </TableCell>
              </TableRow>
            ) : (
              sorted.map((student) => {
                const summary = pointSummaries?.[student.id];
                const isSelected = selectedStudentId === student.id;

                return (
                  <TableRow
                    key={student.id}
                    className={cn(
                      'transition-colors',
                      onSelect ? 'cursor-pointer hover:bg-zinc-50' : '',
                      isSelected && 'bg-sky-50 hover:bg-sky-50'
                    )}
                    onClick={() => handleRowClick(student)}
                  >
                    {selectable && (
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedIds.includes(student.id)}
                          onChange={(e) => handleSelectOne(student, e as unknown as React.MouseEvent)}
                        />
                      </TableCell>
                    )}
                    <TableCell className="font-mono text-sm text-zinc-600">{student.studentNumber}</TableCell>
                    <TableCell className="font-medium text-zinc-900">{student.name}</TableCell>
                    <TableCell>
                      <Badge variant="info">{student.roomNumber}호</Badge>
                    </TableCell>
                    {showPoints && (
                      <TableCell>
                        {summary ? (
                          <span
                            className={cn(
                              'inline-flex items-center px-2 py-0.5 rounded text-sm font-medium',
                              summary.netScore > 0
                                ? 'bg-emerald-50 text-emerald-700'
                                : summary.netScore < 0
                                ? 'bg-red-50 text-red-700'
                                : 'bg-zinc-100 text-zinc-500'
                            )}
                          >
                            {summary.netScore > 0 ? '+' : ''}
                            {summary.netScore}
                          </span>
                        ) : (
                          <span className="text-xs text-zinc-400">-</span>
                        )}
                      </TableCell>
                    )}
                    <TableCell>
                      <span className="text-sm text-zinc-600">{student.grade}학년</span>
                    </TableCell>
                    {(onEdit || onDelete) && (
                      <TableCell>
                        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          {onEdit && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                onEdit(student);
                              }}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="h-4 w-4 text-zinc-500 hover:text-zinc-700" />
                            </Button>
                          )}
                          {onDelete && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDelete(student);
                              }}
                              className="h-8 w-8 p-0"
                            >
                              <Trash2 className="h-4 w-4 text-zinc-400 hover:text-red-500" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
