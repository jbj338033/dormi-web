'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';
import { AlertTriangle, Plus, TrendingUp, TrendingDown, Activity, X, Award, User, Search, Download } from 'lucide-react';
import { Card, CardContent, Modal, Button, PageHeader, TableSkeleton, ConfirmDialog, EmptyState, Skeleton, Select } from '@/shared/ui';
import { StudentTable } from '@/widgets/student-table';
import { PointForm } from '@/widgets/point-form';
import { PointHistory } from '@/widgets/point-history';
import { getStudents } from '@/features/student';
import {
  getPointsByStudent,
  getPointSummary,
  givePoint,
  cancelPoint,
  bulkGivePoints,
  exportPointsSummary,
  exportStudentPointsDetail,
} from '@/features/point';
import { useAuthStore } from '@/shared/store/auth';
import { FEATURE_PERMISSIONS } from '@/shared/config/permissions';
import type { Student } from '@/entities/student';
import type { Point, PointSummary } from '@/entities/point';
import { PENALTY_THRESHOLD } from '@/shared/config/constants';

export default function PointsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [points, setPoints] = useState<Point[]>([]);
  const [summary, setSummary] = useState<PointSummary | null>(null);
  const [pointSummaries, setPointSummaries] = useState<Record<string, PointSummary>>({});
  const [isPointFormOpen, setIsPointFormOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [pointToCancel, setPointToCancel] = useState<Point | null>(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [gradeFilter, setGradeFilter] = useState<string>('');

  const hasAnyRole = useAuthStore((state) => state.hasAnyRole);
  const canGrant = hasAnyRole(FEATURE_PERMISSIONS.POINT_GRANT);
  const canCancel = hasAnyRole(FEATURE_PERMISSIONS.POINT_CANCEL);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getStudents();
      setStudents(data);

      const summaryPromises = data.map((s) =>
        getPointSummary(s.id)
          .then((summary) => ({ id: s.id, summary }))
          .catch(() => null)
      );
      const results = await Promise.all(summaryPromises);
      const summaries: Record<string, PointSummary> = {};
      results.forEach((r) => {
        if (r) summaries[r.id] = r.summary;
      });
      setPointSummaries(summaries);
    } catch {
      toast.error('학생 목록을 불러오는데 실패했습니다');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchesSearch = !searchQuery ||
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.studentNumber.includes(searchQuery) ||
        student.roomNumber.includes(searchQuery);
      const matchesGrade = !gradeFilter || student.grade === Number(gradeFilter);
      return matchesSearch && matchesGrade;
    });
  }, [students, searchQuery, gradeFilter]);

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
      setPointSummaries((prev) => ({ ...prev, [student.id]: summaryData }));
    } catch {
      toast.error('점수 정보를 불러오는데 실패했습니다');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleGivePoint = async (reasonId: string) => {
    const targetIds = selectedIds.length > 0 ? selectedIds : selectedStudent ? [selectedStudent.id] : [];
    if (targetIds.length === 0) return;

    setFormLoading(true);
    try {
      if (targetIds.length > 1) {
        await bulkGivePoints({ studentIds: targetIds, reasonId });
        toast.success(`${targetIds.length}명에게 점수가 부여되었습니다`);
      } else {
        await givePoint({ studentId: targetIds[0], reasonId });
        toast.success('점수가 부여되었습니다');
      }

      if (selectedStudent) {
        const [pointsData, summaryData] = await Promise.all([
          getPointsByStudent(selectedStudent.id),
          getPointSummary(selectedStudent.id),
        ]);
        setPoints(pointsData);
        setSummary(summaryData);
        setPointSummaries((prev) => ({ ...prev, [selectedStudent.id]: summaryData }));
      }

      if (targetIds.length > 1) {
        const summaryPromises = targetIds.map((id) =>
          getPointSummary(id)
            .then((s) => ({ id, summary: s }))
            .catch(() => null)
        );
        const results = await Promise.all(summaryPromises);
        const updated: Record<string, PointSummary> = {};
        results.forEach((r) => {
          if (r) updated[r.id] = r.summary;
        });
        setPointSummaries((prev) => ({ ...prev, ...updated }));
      }

      setIsPointFormOpen(false);
      setSelectedIds([]);
    } catch {
      toast.error('점수 부여에 실패했습니다');
    } finally {
      setFormLoading(false);
    }
  };

  const handleCancelClick = (point: Point) => {
    setPointToCancel(point);
    setIsCancelDialogOpen(true);
  };

  const handleCancelConfirm = async () => {
    if (!pointToCancel) return;
    setCancelLoading(true);
    try {
      await cancelPoint(pointToCancel.id);
      toast.success('점수가 취소되었습니다');
      setIsCancelDialogOpen(false);
      setPointToCancel(null);
      if (selectedStudent) {
        const [pointsData, summaryData] = await Promise.all([
          getPointsByStudent(selectedStudent.id),
          getPointSummary(selectedStudent.id),
        ]);
        setPoints(pointsData);
        setSummary(summaryData);
        setPointSummaries((prev) => ({ ...prev, [selectedStudent.id]: summaryData }));
      }
    } catch {
      toast.error('점수 취소에 실패했습니다');
    } finally {
      setCancelLoading(false);
    }
  };

  const selectedStudents = students.filter((s) => selectedIds.includes(s.id));
  const isPenaltyWarning = summary && summary.totalPenalty >= PENALTY_THRESHOLD;
  const targetNames =
    selectedIds.length > 0
      ? selectedStudents.map((s) => s.name)
      : selectedStudent
      ? [selectedStudent.name]
      : [];

  const gradeOptions = [
    { value: '', label: '전체 학년' },
    { value: '1', label: '1학년' },
    { value: '2', label: '2학년' },
    { value: '3', label: '3학년' },
  ];

  return (
    <div className="p-6">
      <PageHeader
        title="벌점/상점"
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => exportPointsSummary(students, pointSummaries)}
              disabled={loading || students.length === 0}
            >
              <Download className="h-4 w-4 mr-1.5" />
              엑셀 내보내기
            </Button>
            {canGrant && (selectedIds.length > 0 || selectedStudent) && (
              <Button onClick={() => setIsPointFormOpen(true)} size="sm">
                <Plus className="h-4 w-4 mr-1.5" />
                {selectedIds.length > 0 ? `${selectedIds.length}명에게 점수 부여` : '점수 부여'}
              </Button>
            )}
          </div>
        }
      />

      {selectedIds.length > 0 && (
        <div className="mb-4 p-3 bg-sky-50 border border-sky-100 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-sky-600" />
              <span className="text-sm font-medium text-sky-900">
                {selectedIds.length}명 선택됨
              </span>
            </div>
            <button onClick={() => setSelectedIds([])} className="text-sky-600 hover:text-sky-800 transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {selectedStudents.slice(0, 5).map((s) => (
              <span key={s.id} className="inline-flex items-center px-2 py-0.5 bg-white rounded text-xs text-sky-700 border border-sky-200">
                {s.name}
              </span>
            ))}
            {selectedIds.length > 5 && (
              <span className="inline-flex items-center px-2 py-0.5 bg-white rounded text-xs text-sky-600">
                +{selectedIds.length - 5}명
              </span>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <Card className="lg:col-span-3">
          <div className="px-5 py-4 border-b border-zinc-100">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <input
                  type="text"
                  placeholder="이름, 학번, 호실로 검색"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                />
              </div>
              <Select
                options={gradeOptions}
                value={gradeFilter}
                onChange={(e) => setGradeFilter(e.target.value)}
                className="w-full sm:w-32"
              />
            </div>
          </div>
          <CardContent>
            {loading ? (
              <TableSkeleton rows={8} cols={5} />
            ) : (
              <>
                <StudentTable
                  students={filteredStudents}
                  onSelect={handleSelectStudent}
                  selectable={canGrant}
                  selectedIds={selectedIds}
                  onSelectionChange={setSelectedIds}
                  pointSummaries={pointSummaries}
                  showPoints
                  selectedStudentId={selectedStudent?.id}
                />
                {filteredStudents.length > 0 && (
                  <div className="text-center py-4 border-t border-zinc-100 mt-4">
                    <p className="text-xs text-zinc-400">{filteredStudents.length}명의 학생</p>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 lg:sticky lg:top-6 lg:self-start">
          {selectedStudent ? (
            <>
              <div className="px-5 py-4 border-b border-zinc-100">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-zinc-100 flex items-center justify-center">
                    <User className="h-5 w-5 text-zinc-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-zinc-900">{selectedStudent.name}</p>
                    <p className="text-xs text-zinc-500">
                      {selectedStudent.studentNumber} · {selectedStudent.roomNumber}호 · {selectedStudent.grade}학년
                    </p>
                  </div>
                </div>
              </div>
              <CardContent className="p-5">
                {detailLoading ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-3">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-20 rounded-lg" />
                      ))}
                    </div>
                    <Skeleton className="h-8 rounded" />
                    <div className="space-y-2">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-12 rounded" />
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {summary && (
                      <div className="grid grid-cols-3 gap-3">
                        <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-xl border border-emerald-100">
                          <div className="flex justify-center mb-2">
                            <TrendingUp className="h-5 w-5 text-emerald-500" />
                          </div>
                          <p className="text-xs font-medium text-emerald-600 mb-1">상점</p>
                          <p className="text-xl font-bold text-emerald-700">+{summary.totalReward}</p>
                        </div>
                        <div className="text-center p-4 bg-gradient-to-br from-red-50 to-red-100/50 rounded-xl border border-red-100">
                          <div className="flex justify-center mb-2">
                            <TrendingDown className="h-5 w-5 text-red-500" />
                          </div>
                          <p className="text-xs font-medium text-red-600 mb-1">벌점</p>
                          <p className="text-xl font-bold text-red-700">-{summary.totalPenalty}</p>
                        </div>
                        <div className="text-center p-4 bg-gradient-to-br from-zinc-50 to-zinc-100/50 rounded-xl border border-zinc-200">
                          <div className="flex justify-center mb-2">
                            <Activity className="h-5 w-5 text-zinc-500" />
                          </div>
                          <p className="text-xs font-medium text-zinc-600 mb-1">누적</p>
                          <p className={`text-xl font-bold ${summary.netScore >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                            {summary.netScore >= 0 ? '+' : ''}{summary.netScore}
                          </p>
                        </div>
                      </div>
                    )}

                    {isPenaltyWarning && (
                      <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-xl">
                        <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                          <AlertTriangle className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-red-800">경고 대상</p>
                          <p className="text-xs text-red-600">누적 벌점 {PENALTY_THRESHOLD}점 이상</p>
                        </div>
                      </div>
                    )}

                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-semibold text-zinc-900">점수 이력</h4>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-zinc-400">{points.length}건</span>
                          {points.length > 0 && (
                            <button
                              onClick={() => exportStudentPointsDetail(selectedStudent, points)}
                              className="text-xs text-sky-600 hover:text-sky-800 transition-colors"
                            >
                              내보내기
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="max-h-80 overflow-y-auto">
                        <PointHistory points={points} onCancel={canCancel ? handleCancelClick : undefined} />
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </>
          ) : (
            <CardContent className="p-0">
              <EmptyState
                variant="points"
                title="학생을 선택하세요"
                description="왼쪽 목록에서 학생을 클릭하면 상세 정보를 확인할 수 있습니다"
                className="py-16"
              />
            </CardContent>
          )}
        </Card>
      </div>

      <Modal isOpen={isPointFormOpen} onClose={() => setIsPointFormOpen(false)} title="점수 부여">
        <PointForm
          studentNames={targetNames}
          onSubmit={handleGivePoint}
          onCancel={() => setIsPointFormOpen(false)}
          loading={formLoading}
        />
      </Modal>

      <ConfirmDialog
        isOpen={isCancelDialogOpen}
        onClose={() => {
          setIsCancelDialogOpen(false);
          setPointToCancel(null);
        }}
        onConfirm={handleCancelConfirm}
        title="점수 취소"
        description={pointToCancel ? `"${pointToCancel.reason.name}" 점수를 취소하시겠습니까?` : ''}
        confirmText="취소하기"
        variant="warning"
        loading={cancelLoading}
      />
    </div>
  );
}
