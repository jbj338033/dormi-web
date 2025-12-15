'use client';

import { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2, Users, Shield, UserCheck, Mail, User } from 'lucide-react';
import {
  Card,
  CardContent,
  Modal,
  Button,
  Input,
  Badge,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Select,
  PageHeader,
  TableSkeleton,
  ConfirmDialog,
  EmptyState,
} from '@/shared/ui';
import { getAllUsers, createUser, updateUser, deleteUser } from '@/features/user';
import type { User as UserType, Role } from '@/entities/user';

const ROLE_LABELS: Record<Role, string> = { ADMIN: '관리자', SUPERVISOR: '사감', COUNCIL: '자치위원' };
const ROLE_VARIANTS: Record<Role, 'default' | 'success' | 'warning' | 'danger' | 'info'> = { ADMIN: 'danger', SUPERVISOR: 'info', COUNCIL: 'success' };
const ROLE_OPTIONS = [
  { value: 'ADMIN', label: '관리자' },
  { value: 'SUPERVISOR', label: '사감' },
  { value: 'COUNCIL', label: '자치위원' },
];

interface FormData {
  email: string;
  password: string;
  name: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role>('COUNCIL');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserType | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>();

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
    setSelectedRole('COUNCIL');
    reset();
    setIsModalOpen(true);
  };

  const openEditModal = (user: UserType) => {
    setSelectedUser(user);
    setSelectedRole(user.role);
    reset({ email: user.email, name: user.name, password: '' });
    setIsModalOpen(true);
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
        await updateUser(selectedUser.id, { name: data.name, role: selectedRole });
        toast.success('수정되었습니다');
      } else {
        await createUser({ email: data.email, password: data.password, name: data.name, role: selectedRole });
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

  const handleDeleteClick = (user: UserType) => {
    setUserToDelete(user);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;
    setDeleteLoading(true);
    try {
      await deleteUser(userToDelete.id);
      toast.success('삭제되었습니다');
      setIsDeleteDialogOpen(false);
      setUserToDelete(null);
      fetchUsers();
    } catch {
      toast.error('삭제에 실패했습니다');
    } finally {
      setDeleteLoading(false);
    }
  };

  // 역할별 통계
  const adminCount = users.filter((u) => u.role === 'ADMIN').length;
  const supervisorCount = users.filter((u) => u.role === 'SUPERVISOR').length;
  const councilCount = users.filter((u) => u.role === 'COUNCIL').length;

  return (
    <div className="p-6">
      <PageHeader
        title="계정 관리"
        description={`총 ${users.length}개의 계정`}
        actions={
          <Button onClick={openCreateModal} size="sm">
            <Plus className="h-4 w-4 mr-1.5" />
            계정 생성
          </Button>
        }
      />

      {/* 통계 카드 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-sky-50 flex items-center justify-center">
                <Users className="h-5 w-5 text-sky-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-zinc-900">{users.length}</p>
                <p className="text-xs text-zinc-500">전체 계정</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-red-50 flex items-center justify-center">
                <Shield className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-zinc-900">{adminCount}</p>
                <p className="text-xs text-zinc-500">관리자</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-violet-50 flex items-center justify-center">
                <User className="h-5 w-5 text-violet-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-zinc-900">{supervisorCount}</p>
                <p className="text-xs text-zinc-500">사감</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                <UserCheck className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-zinc-900">{councilCount}</p>
                <p className="text-xs text-zinc-500">자치위원</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 계정 목록 */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-4">
              <TableSkeleton rows={5} cols={4} />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>사용자</TableHead>
                  <TableHead>이메일</TableHead>
                  <TableHead>역할</TableHead>
                  <TableHead className="w-24"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="p-0">
                      <EmptyState
                        variant="default"
                        title="등록된 계정이 없습니다"
                        description="새 계정을 생성하여 시스템을 관리하세요"
                        action={{ label: '계정 생성', onClick: openCreateModal }}
                        className="py-12"
                      />
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id} className="hover:bg-zinc-50 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-zinc-100 flex items-center justify-center">
                            <User className="h-4 w-4 text-zinc-500" />
                          </div>
                          <span className="font-medium text-zinc-900">{user.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-zinc-600">
                          <Mail className="h-3.5 w-3.5" />
                          {user.email}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={ROLE_VARIANTS[user.role]}>{ROLE_LABELS[user.role]}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-0.5">
                          <Button size="sm" variant="ghost" onClick={() => openEditModal(user)} className="h-8 w-8 p-0">
                            <Edit className="h-4 w-4 text-zinc-500 hover:text-zinc-700" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDeleteClick(user)} className="h-8 w-8 p-0">
                            <Trash2 className="h-4 w-4 text-zinc-400 hover:text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* 계정 생성/수정 모달 */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          reset();
        }}
        title={selectedUser ? '계정 수정' : '계정 생성'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            {...register('email')}
            type="email"
            label="이메일"
            placeholder="email@example.com"
            error={errors.email?.message}
            disabled={!!selectedUser}
          />
          <Input {...register('name')} label="이름" placeholder="이름을 입력하세요" error={errors.name?.message} />
          {!selectedUser && (
            <Input
              {...register('password')}
              type="password"
              label="비밀번호"
              placeholder="8자 이상 입력하세요"
              error={errors.password?.message}
            />
          )}
          <Select label="역할" options={ROLE_OPTIONS} value={selectedRole} onChange={(e) => setSelectedRole(e.target.value as Role)} />
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsModalOpen(false);
                reset();
              }}
            >
              취소
            </Button>
            <Button type="submit" loading={formLoading}>
              {selectedUser ? '수정' : '생성'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* 삭제 확인 다이얼로그 */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setUserToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="계정 삭제"
        description={userToDelete ? `${userToDelete.name} 계정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.` : ''}
        confirmText="삭제"
        variant="danger"
        loading={deleteLoading}
      />
    </div>
  );
}
