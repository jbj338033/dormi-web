import { z } from 'zod';

export const StudentSchema = z.object({
  id: z.number(),
  studentNumber: z.string(),
  name: z.string(),
  roomNumber: z.string(),
  grade: z.number().min(1).max(3),
});

export type Student = z.infer<typeof StudentSchema>;

export const CreateStudentSchema = z.object({
  studentNumber: z.string().min(1, '학번을 입력하세요'),
  name: z.string().min(1, '이름을 입력하세요'),
  roomNumber: z.string().min(1, '호실 번호를 입력하세요'),
  grade: z.string().min(1, '학년을 선택하세요'),
});

export type CreateStudentFormInput = z.infer<typeof CreateStudentSchema>;

export interface CreateStudentInput {
  studentNumber: string;
  name: string;
  roomNumber: string;
  grade: number;
}

export interface UpdateStudentInput {
  name?: string;
  roomNumber?: string;
  grade?: number;
}
