import { api } from '@/shared/api';
import type {
  Student,
  CreateStudentInput,
  UpdateStudentInput,
} from '@/entities/student';

export async function getStudents(params?: { search?: string; grade?: number; room?: string }): Promise<Student[]> {
  const searchParams = new URLSearchParams();
  if (params?.search) searchParams.set('search', params.search);
  if (params?.grade) searchParams.set('grade', String(params.grade));
  if (params?.room) searchParams.set('room', params.room);

  return api.get<Student[]>('students', { searchParams });
}

export async function getStudent(id: string): Promise<Student> {
  return api.get<Student>(`students/${id}`);
}

export async function createStudent(data: CreateStudentInput): Promise<Student> {
  return api.post<Student>('students', { json: data });
}

export async function updateStudent(id: string, data: UpdateStudentInput): Promise<Student> {
  return api.put<Student>(`students/${id}`, { json: data });
}

export async function deleteStudent(id: string): Promise<void> {
  await api.delete(`students/${id}`);
}

export async function importStudentsFromCsv(file: File): Promise<void> {
  const formData = new FormData();
  formData.append('file', file);
  await api.post('students/import', { body: formData });
}
