'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { Button, Input, PasswordInput } from '@/shared/ui';
import { login, LoginSchema, type LoginInput } from '@/features/auth';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(LoginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setLoading(true);
    try {
      await login(data);
      router.push('/dashboard');
    } catch {
      toast.error('이메일 또는 비밀번호가 올바르지 않습니다');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-xl font-semibold text-zinc-900">Dormi</h1>
          <p className="text-sm text-zinc-500 mt-1">기숙사 관리 시스템</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            {...register('email')}
            type="email"
            label="이메일"
            placeholder="email@example.com"
            error={errors.email?.message}
            autoComplete="email"
          />
          <PasswordInput
            {...register('password')}
            label="비밀번호"
            placeholder="비밀번호를 입력하세요"
            error={errors.password?.message}
            autoComplete="current-password"
          />
          <Button type="submit" className="w-full" loading={loading}>
            로그인
          </Button>
        </form>
      </div>
    </div>
  );
}
