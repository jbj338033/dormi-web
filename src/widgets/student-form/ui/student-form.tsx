'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input, Select } from '@/shared/ui';
import {
  CreateStudentSchema,
  type CreateStudentFormInput,
  type Student,
} from '@/entities/student';

interface StudentFormProps {
  student?: Student;
  onSubmit: (data: { studentNumber: string; name: string; roomNumber: string; grade: number }) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const gradeOptions = [
  { value: '1', label: '1학년' },
  { value: '2', label: '2학년' },
  { value: '3', label: '3학년' },
];

export function StudentForm({
  student,
  onSubmit,
  onCancel,
  loading,
}: StudentFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateStudentFormInput>({
    resolver: zodResolver(CreateStudentSchema),
    defaultValues: student
      ? {
          studentNumber: student.studentNumber,
          name: student.name,
          roomNumber: student.roomNumber,
          grade: String(student.grade),
        }
      : undefined,
  });

  const handleFormSubmit = (data: CreateStudentFormInput) => {
    onSubmit({
      studentNumber: data.studentNumber,
      name: data.name,
      roomNumber: data.roomNumber,
      grade: Number(data.grade),
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <Input
        {...register('studentNumber')}
        label="학번"
        placeholder="예: 10101"
        error={errors.studentNumber?.message}
        disabled={!!student}
      />
      <Input
        {...register('name')}
        label="이름"
        placeholder="학생 이름"
        error={errors.name?.message}
      />
      <Input
        {...register('roomNumber')}
        label="호실"
        placeholder="예: 201"
        error={errors.roomNumber?.message}
      />
      <Select
        {...register('grade')}
        label="학년"
        options={gradeOptions}
        placeholder="학년 선택"
        error={errors.grade?.message}
      />

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          취소
        </Button>
        <Button type="submit" loading={loading}>
          {student ? '수정' : '등록'}
        </Button>
      </div>
    </form>
  );
}
