'use client';

import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { AlertTriangle } from 'lucide-react';
import { Card, CardContent, Modal, Button } from '@/shared/ui';
import { StudentTable } from '@/widgets/student-table';
import { PointForm } from '@/widgets/point-form';
import { PointHistory } from '@/widgets/point-history';
import { getAllStudents } from '@/features/student';
import { getPointsByStudent, getPointSummary, grantPoint, cancelPoint, bulkGrantPoints } from '@/features/point';
import { useAuthStore } from '@/shared/store/auth';
import { FEATURE_PERMISSIONS } from '@/shared/config/permissions';
import type { Student } from '@/entities/student';
import type { Point, PointSummary, GrantPointInput } from '@/entities/point';
import { EXPULSION_THRESHOLD } from '@/shared/config/constants';

export default function PointsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [points, setPoints] = useState<Point[]>([]);
  const [summary, setSummary] = useState<PointSummary | null>(null);
  const [isPointFormOpen, setIsPointFormOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  const hasAnyRole = useAuthStore((state) => state.hasAnyRole);
  const canGrant = hasAnyRole(FEATURE_PERMISSIONS.POINT_GRANT);
  const canCancel = hasAnyRole(FEATURE_PERMISSIONS.POINT_CANCEL);

  const fetchStudents = useCallback(async () => {
    try {
      const data = await getAllStudents();
      setStudents(data);
    } catch {
      toast.error('학생 목록을 불러오는데 실패했습니다');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const handleSelectStudent = async (student: Student) => {
    setSelectedStudent(student);
    setDetailLoading(true);
    try {
      const [pointsData, summaryData] = await Promise.all([
        getPointsByStudent(student.id),
        getPointSummary(student.id),
      ]);
      setPoints(pointsData);
      setSummary(summaryData);
    } catch {
      toast.error('점수 정보를 불러오는데 실패했습니다');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleGrantPoint = async (data: GrantPointInput) => {
    if (selectedIds.length === 0 && !selectedStudent) return;
    setFormLoading(true);
    try {
      if (selectedIds.length > 0) {
        await bulkGrantPoints({ studentIds: selectedIds, point: data });
        toast.success(`${selectedIds.length}명에게 점수가 부여되었습니다`);
        setSelectedIds([]);
      } else if (selectedStudent) {
        await grantPoint(selectedStudent.id, data);
        toast.success('점수가 부여되었습니다');
        handleSelectStudent(selectedStudent);
      }
      setIsPointFormOpen(false);
    } catch {
      toast.error('점수 부여에 실패했습니다');
    } finally {
      setFormLoading(false);
    }
  };

  const handleCancelPoint = async (point: Point) => {
    if (!confirm('이 점수를 취소하시겠습니까?')) return;
    try {
      await cancelPoint(point.id);
      toast.success('점수가 취소되었습니다');
      if (selectedStudent) handleSelectStudent(selectedStudent);
    } catch {
      toast.error('점수 취소에 실패했습니다');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="h-5 w-5 border-2 border-zinc-300 border-t-zinc-900 rounded-full animate-spin" />
      </div>
    );
  }

  const selectedStudents = students.filter((s) => selectedIds.includes(s.id));

  const handleOpenBulkForm = () => {
    setSelectedStudent(null);
    setIsPointFormOpen(true);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-semibold text-zinc-900">벌점/상점</h1>
        {canGrant && selectedIds.length > 0 && (
          <Button onClick={handleOpenBulkForm} size="sm">
            선택한 {selectedIds.length}명에게 점수 부여
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardContent>
            <StudentTable
              students={students}
              onSelect={handleSelectStudent}
              selectable={canGrant}
              selectedIds={selectedIds}
              onSelectionChange={setSelectedIds}
            />
          </CardContent>
        </Card>

        <Card>
          {selectedStudent ? (
            <>
              <div className="px-4 py-3 border-b border-zinc-100 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-zinc-900">{selectedStudent.name}</p>
                  <p className="text-xs text-zinc-500">{selectedStudent.studentNumber} · {selectedStudent.roomNumber}호</p>
                </div>
                {canGrant && (
                  <Button onClick={() => setIsPointFormOpen(true)} size="sm">
                    점수 부여
                  </Button>
                )}
              </div>
              <CardContent>
                {detailLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="h-5 w-5 border-2 border-zinc-300 border-t-zinc-900 rounded-full animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-5">
                    {summary && (
                      <div className="grid grid-cols-3 gap-3">
                        <div className="text-center p-3 bg-emerald-50 rounded-md">
                          <p className="text-xs text-emerald-600">상점</p>
                          <p className="text-lg font-semibold text-emerald-700">+{summary.meritTotal}</p>
                        </div>
                        <div className="text-center p-3 bg-red-50 rounded-md">
                          <p className="text-xs text-red-600">벌점</p>
                          <p className="text-lg font-semibold text-red-700">-{summary.demeritTotal}</p>
                        </div>
                        <div className="text-center p-3 bg-zinc-50 rounded-md">
                          <p className="text-xs text-zinc-600">누적</p>
                          <p className="text-lg font-semibold text-zinc-900">{summary.netScore}</p>
                        </div>
                      </div>
                    )}

                    {summary?.expulsionWarning && (
                      <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-md text-red-600 text-sm">
                        <AlertTriangle className="h-4 w-4" />
                        누적 {EXPULSION_THRESHOLD}점 이상
                      </div>
                    )}

                    <div>
                      <h4 className="text-sm font-medium text-zinc-900 mb-3">점수 이력</h4>
                      <PointHistory points={points} onCancel={canCancel ? handleCancelPoint : undefined} />
                    </div>
                  </div>
                )}
              </CardContent>
            </>
          ) : (
            <CardContent className="flex items-center justify-center h-64 text-sm text-zinc-500">
              학생을 선택하세요
            </CardContent>
          )}
        </Card>
      </div>

      <Modal isOpen={isPointFormOpen} onClose={() => setIsPointFormOpen(false)} title="점수 부여">
        <PointForm
          studentNames={selectedIds.length > 0 ? selectedStudents.map((s) => s.name) : selectedStudent ? [selectedStudent.name] : []}
          onSubmit={handleGrantPoint}
          onCancel={() => setIsPointFormOpen(false)}
          loading={formLoading}
        />
      </Modal>
    </div>
  );
}
