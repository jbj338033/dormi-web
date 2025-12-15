'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { KeyRound } from 'lucide-react';
import { Modal, Button, PasswordInput } from '@/shared/ui';
import { changePassword } from '@/features/auth';

const ChangePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, '현재 비밀번호를 입력하세요'),
    newPassword: z.string().min(6, '새 비밀번호는 6자 이상이어야 합니다'),
    confirmPassword: z.string().min(1, '비밀번호 확인을 입력하세요'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: '새 비밀번호가 일치하지 않습니다',
    path: ['confirmPassword'],
  });

type ChangePasswordInput = z.infer<typeof ChangePasswordSchema>;

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChangePasswordModal({ isOpen, onClose }: ChangePasswordModalProps) {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<ChangePasswordInput>({
    resolver: zodResolver(ChangePasswordSchema),
  });

  const newPassword = watch('newPassword', '');

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = async (data: ChangePasswordInput) => {
    setLoading(true);
    try {
      await changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      toast.success('비밀번호가 변경되었습니다');
      handleClose();
    } catch {
      toast.error('비밀번호 변경에 실패했습니다. 현재 비밀번호를 확인하세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="비밀번호 변경">
      <div className="flex items-center gap-3 p-3 bg-zinc-50 rounded-lg mb-4">
        <div className="h-10 w-10 rounded-full bg-zinc-200 flex items-center justify-center">
          <KeyRound className="h-5 w-5 text-zinc-600" />
        </div>
        <div>
          <p className="text-sm font-medium text-zinc-900">보안을 위해 비밀번호를 변경하세요</p>
          <p className="text-xs text-zinc-500">6자 이상의 안전한 비밀번호를 사용하세요</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <PasswordInput
          {...register('currentPassword')}
          label="현재 비밀번호"
          placeholder="현재 비밀번호를 입력하세요"
          error={errors.currentPassword?.message}
          autoComplete="current-password"
        />
        <PasswordInput
          {...register('newPassword')}
          label="새 비밀번호"
          placeholder="새 비밀번호를 입력하세요"
          error={errors.newPassword?.message}
          autoComplete="new-password"
          showStrength
          value={newPassword}
        />
        <PasswordInput
          {...register('confirmPassword')}
          label="새 비밀번호 확인"
          placeholder="새 비밀번호를 다시 입력하세요"
          error={errors.confirmPassword?.message}
          autoComplete="new-password"
        />

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={handleClose} disabled={loading}>
            취소
          </Button>
          <Button type="submit" loading={loading}>
            변경하기
          </Button>
        </div>
      </form>
    </Modal>
  );
}
