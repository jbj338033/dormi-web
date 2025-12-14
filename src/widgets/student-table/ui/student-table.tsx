'use client';

import { useState } from 'react';
import { Search, Edit, Trash2, Plus } from 'lucide-react';
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
} from '@/shared/ui';
import type { Student } from '@/entities/student';

interface StudentTableProps {
  students: Student[];
  onEdit?: (student: Student) => void;
  onDelete?: (student: Student) => void;
  onCreate?: () => void;
  onSelect?: (student: Student) => void;
  selectable?: boolean;
  selectedIds?: number[];
  onSelectionChange?: (ids: number[]) => void;
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
}: StudentTableProps) {
  const [search, setSearch] = useState('');

  const filtered = students.filter(
    (s) =>
      s.name.includes(search) ||
      s.studentNumber.includes(search) ||
      s.roomNumber.includes(search)
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

  const handleSelectOne = (student: Student) => {
    if (!onSelectionChange) return;
    if (selectedIds.includes(student.id)) {
      onSelectionChange(selectedIds.filter((id) => id !== student.id));
    } else {
      onSelectionChange([...selectedIds, student.id]);
    }
  };

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
              <TableHead>학번</TableHead>
              <TableHead>이름</TableHead>
              <TableHead>호실</TableHead>
              <TableHead>학년</TableHead>
              <TableHead className="w-20"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={selectable ? 6 : 5} className="text-center text-zinc-500 py-8">
                  {search ? '검색 결과가 없습니다' : '등록된 학생이 없습니다'}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((student) => (
                <TableRow
                  key={student.id}
                  className={onSelect || selectable ? 'cursor-pointer hover:bg-zinc-50' : ''}
                  onClick={() => {
                    if (selectable) {
                      handleSelectOne(student);
                    } else {
                      onSelect?.(student);
                    }
                  }}
                >
                  {selectable && (
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.includes(student.id)}
                        onChange={() => handleSelectOne(student)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </TableCell>
                  )}
                  <TableCell className="font-mono text-sm">{student.studentNumber}</TableCell>
                  <TableCell className="font-medium">{student.name}</TableCell>
                  <TableCell>
                    <Badge variant="info">{student.roomNumber}호</Badge>
                  </TableCell>
                  <TableCell>{student.grade}학년</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {onEdit && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit(student);
                          }}
                        >
                          <Edit className="h-4 w-4 text-zinc-500" />
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
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
