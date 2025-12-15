'use client';

import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import toast from 'react-hot-toast';
import { Plus, Upload, FileSpreadsheet, Search } from 'lucide-react';
import { Card, CardContent, Modal, Button, PageHeader, TableSkeleton, ConfirmDialog, Input, Select } from '@/shared/ui';
import { StudentTable } from '@/widgets/student-table';
import { StudentForm } from '@/widgets/student-form';
import { getStudents, createStudent, updateStudent, deleteStudent, importStudentsFromCsv } from '@/features/student';
import { useAuthStore } from '@/shared/store/auth';
import { FEATURE_PERMISSIONS } from '@/shared/config/permissions';
import type { Student, CreateStudentInput } from '@/entities/student';

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | undefined>();
  const [studentToDelete, setStudentToDelete] = useState<Student | undefined>();
  const [importLoading, setImportLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [gradeFilter, setGradeFilter] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const hasAnyRole = useAuthStore((state) => state.hasAnyRole);
  const canCreate = hasAnyRole(FEATURE_PERMISSIONS.STUDENT_CREATE);
  const canEdit = hasAnyRole(FEATURE_PERMISSIONS.STUDENT_EDIT);
  const canDelete = hasAnyRole(FEATURE_PERMISSIONS.STUDENT_DELETE);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getStudents();
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
      fetchStudents();
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
      fetchStudents();
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
      fetchStudents();
    } catch {
      toast.error('CSV 가져오기에 실패했습니다');
    } finally {
      setImportLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const gradeOptions = [
    { value: '', label: '전체 학년' },
    { value: '1', label: '1학년' },
    { value: '2', label: '2학년' },
    { value: '3', label: '3학년' },
  ];

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
                onEdit={canEdit ? handleEdit : undefined}
                onDelete={canDelete ? handleDeleteClick : undefined}
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

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selectedStudent ? '학생 수정' : '학생 등록'}>
        <StudentForm student={selectedStudent} onSubmit={handleSubmit} onCancel={() => setIsModalOpen(false)} loading={formLoading} />
      </Modal>

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
