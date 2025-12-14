import { api } from '@/shared/api';
import type {
  Student,
  CreateStudentInput,
  UpdateStudentInput,
} from '@/entities/student';

export async function getAllStudents(): Promise<Student[]> {
  return api.get('api/students').json<Student[]>();
}

export async function getStudent(id: number): Promise<Student> {
  return api.get(`api/students/${id}`).json<Student>();
}

export async function getStudentByNumber(studentNumber: string): Promise<Student> {
  return api.get(`api/students/number/${studentNumber}`).json<Student>();
}

export async function getStudentsByRoom(roomNumber: string): Promise<Student[]> {
  return api.get(`api/students/room/${roomNumber}`).json<Student[]>();
}

export async function searchStudents(name: string): Promise<Student[]> {
  return api.get('api/students/search', { searchParams: { name } }).json<Student[]>();
}

export async function createStudent(data: CreateStudentInput): Promise<Student> {
  return api.post('api/students', { json: data }).json<Student>();
}

export async function updateStudent(id: number, data: UpdateStudentInput): Promise<Student> {
  return api.put(`api/students/${id}`, { json: data }).json<Student>();
}

export async function deleteStudent(id: number): Promise<void> {
  await api.delete(`api/students/${id}`);
}

export async function importStudentsFromCsv(csvContent: string): Promise<Student[]> {
  return api.post('api/students/import', { json: { csv: csvContent } }).json<Student[]>();
}
