import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string(),
  password: z.string().min(1, '비밀번호를 입력하세요'),
});

export type LoginInput = z.infer<typeof LoginSchema>;
