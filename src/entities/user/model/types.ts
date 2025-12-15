import { z } from 'zod';

export const RoleSchema = z.enum(['ADMIN', 'SUPERVISOR', 'COUNCIL']);
export type Role = z.infer<typeof RoleSchema>;

export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  role: RoleSchema,
});

export type User = z.infer<typeof UserSchema>;

export const CreateUserSchema = z.object({
  email: z.string().email('유효한 이메일을 입력하세요'),
  password: z.string().min(6, '비밀번호는 6자 이상이어야 합니다'),
  name: z.string().min(1, '이름을 입력하세요'),
  role: RoleSchema,
});

export type CreateUserInput = z.infer<typeof CreateUserSchema>;

export interface UpdateUserInput {
  name?: string;
  role?: Role;
}
