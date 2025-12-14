'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import { Plus, Upload } from 'lucide-react';
import { Card, CardContent, Modal, Button } from '@/shared/ui';
import { StudentTable } from '@/widgets/student-table';
import { StudentForm } from '@/widgets/student-form';
import { getAllStudents, createStudent, updateStudent, deleteStudent, importStudentsFromCsv } from '@/features/student';
import { useAuthStore } from '@/shared/store/auth';
import { FEATURE_PERMISSIONS } from '@/shared/config/permissions';
import type { Student, CreateStudentInput } from '@/entities/student';

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | undefined>();
  const [importLoading, setImportLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const hasAnyRole = useAuthStore((state) => state.hasAnyRole);
  const canCreate = hasAnyRole(FEATURE_PERMISSIONS.STUDENT_CREATE);
  const canEdit = hasAnyRole(FEATURE_PERMISSIONS.STUDENT_EDIT);
  const canDelete = hasAnyRole(FEATURE_PERMISSIONS.STUDENT_DELETE);

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

  const handleCreate = () => {
    setSelectedStudent(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (student: Student) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
  };

  const handleDelete = async (student: Student) => {
    if (!confirm(`${student.name} 학생을 삭제하시겠습니까?`)) return;
    try {
      await deleteStudent(student.id);
      toast.success('삭제되었습니다');
      fetchStudents();
    } catch {
      toast.error('삭제에 실패했습니다');
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
      const rawContent = await file.text();
      const content = rawContent.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
      const result = await importStudentsFromCsv(content);
      toast.success(`${result.length}명의 학생이 등록되었습니다`);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="h-5 w-5 border-2 border-zinc-300 border-t-zinc-900 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-semibold text-zinc-900">학생</h1>
        {canCreate && (
          <div className="flex gap-2">
            <Button onClick={() => setIsImportModalOpen(true)} size="sm" variant="secondary">
              <Upload className="h-4 w-4 mr-1" />
              CSV
            </Button>
            <Button onClick={handleCreate} size="sm">
              <Plus className="h-4 w-4 mr-1" />
              등록
            </Button>
          </div>
        )}
      </div>

      <Card>
        <CardContent>
          <StudentTable
            students={students}
            onEdit={canEdit ? handleEdit : undefined}
            onDelete={canDelete ? handleDelete : undefined}
          />
        </CardContent>
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selectedStudent ? '학생 수정' : '학생 등록'}>
        <StudentForm student={selectedStudent} onSubmit={handleSubmit} onCancel={() => setIsModalOpen(false)} loading={formLoading} />
      </Modal>

      <Modal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} title="CSV 가져오기">
        <div className="space-y-4">
          <div className="text-sm text-zinc-600">
            <p className="mb-2">CSV 파일 형식:</p>
            <code className="block bg-zinc-100 p-2 rounded text-xs">
              학번,이름,호실,학년
            </code>
          </div>
          <div className="border-2 border-dashed border-zinc-200 rounded-lg p-6 text-center">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="hidden"
              id="csv-input"
            />
            <label
              htmlFor="csv-input"
              className="cursor-pointer flex flex-col items-center gap-2"
            >
              <Upload className="h-8 w-8 text-zinc-400" />
              <span className="text-sm text-zinc-600">CSV 파일을 선택하세요</span>
            </label>
          </div>
          {importLoading && (
            <div className="flex items-center justify-center py-2">
              <div className="h-5 w-5 border-2 border-zinc-300 border-t-zinc-900 rounded-full animate-spin" />
            </div>
          )}
          <div className="flex justify-end">
            <Button variant="secondary" onClick={() => setIsImportModalOpen(false)}>
              닫기
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
