'use client';

import { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent, Modal, Button, Input, Badge, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Checkbox } from '@/shared/ui';
import { getAllUsers, createUser, updateUser, deleteUser } from '@/features/user';
import type { User, Role } from '@/entities/user';

const ROLE_LABELS: Record<Role, string> = { ADMIN: '관리자', SUPERVISOR: '사감', COUNCIL: '자치위원' };
const ROLE_VARIANTS: Record<Role, 'default' | 'success' | 'warning' | 'danger' | 'info'> = { ADMIN: 'danger', SUPERVISOR: 'info', COUNCIL: 'success' };

interface FormData {
  email: string;
  password: string;
  name: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState<Role[]>([]);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>();

  const fetchUsers = useCallback(async () => {
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch {
      toast.error('사용자 목록을 불러오는데 실패했습니다');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const openCreateModal = () => {
    setSelectedUser(null);
    setSelectedRoles([]);
    reset();
    setIsModalOpen(true);
  };

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setSelectedRoles(user.roles as Role[]);
    reset({ email: user.email, name: user.name, password: '' });
    setIsModalOpen(true);
  };

  const handleRoleToggle = (role: Role) => {
    setSelectedRoles((prev) => prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]);
  };

  const onSubmit = async (data: FormData) => {
    if (!selectedUser && (!data.email || !data.password || !data.name)) {
      toast.error('모든 필드를 입력하세요');
      return;
    }
    if (selectedUser && !data.name) {
      toast.error('이름을 입력하세요');
      return;
    }
    setFormLoading(true);
    try {
      if (selectedUser) {
        await updateUser(selectedUser.id, { name: data.name, roles: selectedRoles });
        toast.success('수정되었습니다');
      } else {
        await createUser({ email: data.email, password: data.password, name: data.name, roles: selectedRoles });
        toast.success('등록되었습니다');
      }
      setIsModalOpen(false);
      reset();
      fetchUsers();
    } catch {
      toast.error(selectedUser ? '수정에 실패했습니다' : '등록에 실패했습니다');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (user: User) => {
    if (!confirm(`${user.name}을(를) 삭제하시겠습니까?`)) return;
    try {
      await deleteUser(user.id);
      toast.success('삭제되었습니다');
      fetchUsers();
    } catch {
      toast.error('삭제에 실패했습니다');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="h-5 w-5 border-2 border-zinc-300 border-t-zinc-900 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-semibold text-zinc-900">계정</h1>
        <Button onClick={openCreateModal} size="sm">
          <Plus className="h-4 w-4 mr-1" />
          생성
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>이름</TableHead>
                <TableHead>이메일</TableHead>
                <TableHead>역할</TableHead>
                <TableHead className="w-20"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-zinc-500 py-8">등록된 계정이 없습니다</TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium text-zinc-900">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {user.roles.map((role) => (
                          <Badge key={role} variant={ROLE_VARIANTS[role as Role]}>{ROLE_LABELS[role as Role]}</Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button size="sm" variant="ghost" onClick={() => openEditModal(user)}>
                          <Edit className="h-4 w-4 text-zinc-500" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDelete(user)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); reset(); }} title={selectedUser ? '계정 수정' : '계정 생성'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input {...register('email')} type="email" label="이메일" placeholder="email@example.com" error={errors.email?.message} disabled={!!selectedUser} />
          <Input {...register('name')} label="이름" placeholder="이름" error={errors.name?.message} />
          {!selectedUser && <Input {...register('password')} type="password" label="비밀번호" placeholder="8자 이상" error={errors.password?.message} />}
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">역할</label>
            <div className="space-y-2">
              {(Object.keys(ROLE_LABELS) as Role[]).map((role) => (
                <Checkbox key={role} id={`role-${role}`} label={ROLE_LABELS[role]} checked={selectedRoles.includes(role)} onChange={() => handleRoleToggle(role)} />
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => { setIsModalOpen(false); reset(); }}>취소</Button>
            <Button type="submit" loading={formLoading}>{selectedUser ? '수정' : '생성'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
