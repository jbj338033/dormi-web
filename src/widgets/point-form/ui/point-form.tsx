'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input, Select } from '@/shared/ui';
import {
  GrantPointFormSchema,
  type GrantPointFormInput,
  type GrantPointInput,
} from '@/entities/point';
import { POINT_REASON_LABELS } from '@/shared/config/constants';

interface PointFormProps {
  onSubmit: (data: GrantPointInput) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  studentNames?: string[];
}

const typeOptions = [
  { value: 'DEMERIT', label: '벌점' },
  { value: 'MERIT', label: '상점' },
];

const demeritReasons = [
  'LATE_RETURN',
  'ABSENT_ROLLCALL',
  'NOISE',
  'ROOM_UNCLEANED',
  'UNAUTHORIZED_OUTING',
  'UNAUTHORIZED_ABSENCE',
  'SMOKING',
  'DRINKING',
  'OTHER',
];

const meritReasons = ['GOOD_DEED', 'CLEAN_ROOM', 'VOLUNTEER', 'OTHER'];

export function PointForm({
  onSubmit,
  onCancel,
  loading,
  studentNames = [],
}: PointFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<GrantPointFormInput>({
    resolver: zodResolver(GrantPointFormSchema),
    defaultValues: {
      type: 'DEMERIT',
      score: '1',
      reason: 'OTHER',
    },
  });

  const watchType = watch('type');
  const watchReason = watch('reason');

  const reasonOptions =
    watchType === 'MERIT'
      ? meritReasons.map((r) => ({ value: r, label: POINT_REASON_LABELS[r] }))
      : demeritReasons.map((r) => ({ value: r, label: POINT_REASON_LABELS[r] }));

  const handleFormSubmit = (data: GrantPointFormInput) => {
    onSubmit({
      type: data.type,
      score: Number(data.score),
      reason: data.reason,
      customReason: data.customReason,
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      {studentNames.length > 0 && (
        <div className="bg-zinc-50 px-3 py-2.5 rounded-lg border border-zinc-100">
          <p className="text-xs text-zinc-500 mb-1">대상 학생 ({studentNames.length}명)</p>
          <p className="text-sm font-medium text-zinc-900">
            {studentNames.length <= 5
              ? studentNames.join(', ')
              : `${studentNames.slice(0, 5).join(', ')} 외 ${studentNames.length - 5}명`}
          </p>
        </div>
      )}

      <Select
        {...register('type')}
        label="유형"
        options={typeOptions}
        error={errors.type?.message}
      />

      <Input
        {...register('score')}
        type="number"
        label="점수"
        min={1}
        error={errors.score?.message}
      />

      <Select
        {...register('reason')}
        label="사유"
        options={reasonOptions}
        error={errors.reason?.message}
      />

      {watchReason === 'OTHER' && (
        <Input
          {...register('customReason')}
          label="기타 사유"
          placeholder="사유를 입력하세요"
          error={errors.customReason?.message}
        />
      )}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          취소
        </Button>
        <Button type="submit" loading={loading}>
          점수 부여
        </Button>
      </div>
    </form>
  );
}
