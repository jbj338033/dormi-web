import { z } from 'zod';

export const RoleSchema = z.enum(['ADMIN', 'SUPERVISOR', 'COUNCIL']);
export type Role = z.infer<typeof RoleSchema>;

export const UserSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  name: z.string(),
  roles: z.array(RoleSchema),
});

export type User = z.infer<typeof UserSchema>;

export const CreateUserSchema = z.object({
  email: z.string().email('유효한 이메일을 입력하세요'),
  password: z.string().min(8, '비밀번호는 8자 이상이어야 합니다'),
  name: z.string().min(1, '이름을 입력하세요'),
  roles: z.array(RoleSchema).optional(),
});

export type CreateUserInput = z.infer<typeof CreateUserSchema>;

export const UpdateUserSchema = z.object({
  name: z.string().optional(),
  roles: z.array(RoleSchema).optional(),
});

export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;
