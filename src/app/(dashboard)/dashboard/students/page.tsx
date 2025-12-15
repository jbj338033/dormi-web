'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import { Plus, Upload, FileSpreadsheet, ChevronDown } from 'lucide-react';
import { Card, CardContent, Modal, Button, PageHeader, TableSkeleton, ConfirmDialog, Badge } from '@/shared/ui';
import { StudentTable } from '@/widgets/student-table';
import { StudentForm } from '@/widgets/student-form';
import { getStudents, createStudent, updateStudent, deleteStudent, importStudentsFromCsv } from '@/features/student';
import { useAuthStore } from '@/shared/store/auth';
import { FEATURE_PERMISSIONS } from '@/shared/config/permissions';
import type { Student, CreateStudentInput } from '@/entities/student';

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | undefined>();
  const [studentToDelete, setStudentToDelete] = useState<Student | undefined>();
  const [importLoading, setImportLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const loaderRef = useRef<HTMLDivElement>(null);

  const hasAnyRole = useAuthStore((state) => state.hasAnyRole);
  const canCreate = hasAnyRole(FEATURE_PERMISSIONS.STUDENT_CREATE);
  const canEdit = hasAnyRole(FEATURE_PERMISSIONS.STUDENT_EDIT);
  const canDelete = hasAnyRole(FEATURE_PERMISSIONS.STUDENT_DELETE);

  const fetchStudents = useCallback(async (pageNum: number, append = false) => {
    if (pageNum === 1) setLoading(true);
    else setLoadingMore(true);

    try {
      const res = await getStudents({ page: pageNum, limit: 20 });
      if (append) {
        setStudents((prev) => [...prev, ...res.data]);
      } else {
        setStudents(res.data);
      }
      setTotalCount(res.meta.total);
      setHasMore(pageNum < res.meta.totalPages);
    } catch {
      toast.error('학생 목록을 불러오는데 실패했습니다');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents(1);
  }, [fetchStudents]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 0.1 }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loadingMore, loading]);

  useEffect(() => {
    if (page > 1) {
      fetchStudents(page, true);
    }
  }, [page, fetchStudents]);

  const refresh = () => {
    setPage(1);
    setHasMore(true);
    fetchStudents(1);
  };

  const handleCreate = () => {
    setSelectedStudent(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (student: Student) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (student: Student) => {
    setStudentToDelete(student);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!studentToDelete) return;
    setDeleteLoading(true);
    try {
      await deleteStudent(studentToDelete.id);
      toast.success('삭제되었습니다');
      setIsDeleteDialogOpen(false);
      setStudentToDelete(undefined);
      refresh();
    } catch {
      toast.error('삭제에 실패했습니다');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleSubmit = async (data: CreateStudentInput) => {
    setFormLoading(true);
    try {
      if (selectedStudent) {
        await updateStudent(selectedStudent.id, data);
        toast.success('수정되었습니다');
      } else {
        await createStudent(data);
        toast.success('등록되었습니다');
      }
      setIsModalOpen(false);
      refresh();
    } catch {
      toast.error(selectedStudent ? '수정에 실패했습니다' : '등록에 실패했습니다');
    } finally {
      setFormLoading(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportLoading(true);
    try {
      await importStudentsFromCsv(file);
      toast.success('학생이 등록되었습니다');
      setIsImportModalOpen(false);
      refresh();
    } catch {
      toast.error('CSV 가져오기에 실패했습니다');
    } finally {
      setImportLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="p-6">
      <PageHeader
        title="학생 관리"
        actions={
          canCreate && (
            <div className="flex gap-2">
              <Button onClick={() => setIsImportModalOpen(true)} size="sm" variant="secondary">
                <Upload className="h-4 w-4 mr-1.5" />
                CSV
              </Button>
              <Button onClick={handleCreate} size="sm">
                <Plus className="h-4 w-4 mr-1.5" />
                등록
              </Button>
            </div>
          )
        }
      />

      <Card>
        <CardContent>
          {loading ? (
            <TableSkeleton rows={8} cols={5} />
          ) : (
            <>
              <StudentTable
                students={students}
                onEdit={canEdit ? handleEdit : undefined}
                onDelete={canDelete ? handleDeleteClick : undefined}
              />
              {hasMore && (
                <div ref={loaderRef} className="flex flex-col items-center gap-2 py-6 border-t border-zinc-100 mt-4">
                  {loadingMore ? (
                    <div className="h-5 w-5 border-2 border-zinc-300 border-t-zinc-900 rounded-full animate-spin" />
                  ) : (
                    <>
                      <ChevronDown className="h-5 w-5 text-zinc-400 animate-bounce" />
                      <p className="text-xs text-zinc-400">스크롤하여 더 불러오기</p>
                    </>
                  )}
                </div>
              )}
              {!hasMore && students.length > 0 && (
                <div className="text-center py-4 border-t border-zinc-100 mt-4">
                  <p className="text-xs text-zinc-400">모든 학생을 불러왔습니다</p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* 학생 등록/수정 모달 */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selectedStudent ? '학생 수정' : '학생 등록'}>
        <StudentForm student={selectedStudent} onSubmit={handleSubmit} onCancel={() => setIsModalOpen(false)} loading={formLoading} />
      </Modal>

      {/* CSV 가져오기 모달 */}
      <Modal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} title="CSV 가져오기">
        <div className="space-y-4">
          <div className="bg-zinc-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <FileSpreadsheet className="h-4 w-4 text-zinc-500" />
              <span className="text-sm font-medium text-zinc-700">CSV 파일 형식</span>
            </div>
            <code className="block bg-white border border-zinc-200 p-3 rounded text-xs font-mono text-zinc-600">
              학번,이름,호실,학년
              <br />
              20240001,홍길동,101,1
              <br />
              20240002,김철수,102,2
            </code>
          </div>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              importLoading ? 'border-zinc-300 bg-zinc-50' : 'border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50'
            }`}
          >
            <input ref={fileInputRef} type="file" accept=".csv" onChange={handleFileSelect} className="hidden" id="csv-input" disabled={importLoading} />
            <label htmlFor="csv-input" className={`flex flex-col items-center gap-3 ${importLoading ? '' : 'cursor-pointer'}`}>
              {importLoading ? (
                <div className="h-8 w-8 border-2 border-zinc-300 border-t-zinc-900 rounded-full animate-spin" />
              ) : (
                <div className="h-12 w-12 rounded-full bg-zinc-100 flex items-center justify-center">
                  <Upload className="h-6 w-6 text-zinc-500" />
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-zinc-700">{importLoading ? '업로드 중...' : 'CSV 파일을 선택하세요'}</p>
                <p className="text-xs text-zinc-500 mt-1">또는 여기에 파일을 드래그하세요</p>
              </div>
            </label>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setIsImportModalOpen(false)} disabled={importLoading}>
              취소
            </Button>
          </div>
        </div>
      </Modal>

      {/* 삭제 확인 다이얼로그 */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setStudentToDelete(undefined);
        }}
        onConfirm={handleDeleteConfirm}
        title="학생 삭제"
        description={studentToDelete ? `${studentToDelete.name} 학생을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.` : ''}
        confirmText="삭제"
        variant="danger"
        loading={deleteLoading}
      />
    </div>
  );
}
