'use client';

import { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2 } from 'lucide-react';
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
} from '@/shared/ui';
import {
  getPointReasons,
  createPointReason,
  updatePointReason,
  deletePointReason,
} from '@/features/point-reason';
import type { PointReason, PointType } from '@/entities/point-reason';

const TYPE_LABELS: Record<PointType, string> = { REWARD: '상점', PENALTY: '벌점' };
const TYPE_VARIANTS: Record<PointType, 'success' | 'danger'> = { REWARD: 'success', PENALTY: 'danger' };
const TYPE_OPTIONS = [
  { value: 'REWARD', label: '상점' },
  { value: 'PENALTY', label: '벌점' },
];

interface FormData {
  name: string;
  score: string;
}

export default function PointReasonsPage() {
  const [reasons, setReasons] = useState<PointReason[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState<PointReason | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<PointType>('REWARD');

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>();

  const fetchReasons = useCallback(async () => {
    try {
      const data = await getPointReasons();
      setReasons(data);
    } catch {
      toast.error('사유 목록을 불러오는데 실패했습니다');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReasons();
  }, [fetchReasons]);

  const openCreateModal = () => {
    setSelectedReason(null);
    setSelectedType('REWARD');
    reset({ name: '', score: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (reason: PointReason) => {
    setSelectedReason(reason);
    setSelectedType(reason.type);
    reset({ name: reason.name, score: String(reason.score) });
    setIsModalOpen(true);
  };

  const onSubmit = async (data: FormData) => {
    if (!data.name || !data.score) {
      toast.error('모든 필드를 입력하세요');
      return;
    }
    const score = parseInt(data.score, 10);
    if (isNaN(score) || score <= 0) {
      toast.error('점수는 1 이상의 숫자여야 합니다');
      return;
    }
    setFormLoading(true);
    try {
      if (selectedReason) {
        await updatePointReason(selectedReason.id, { name: data.name, score, type: selectedType });
        toast.success('수정되었습니다');
      } else {
        await createPointReason({ name: data.name, score, type: selectedType });
        toast.success('등록되었습니다');
      }
      setIsModalOpen(false);
      reset();
      fetchReasons();
    } catch {
      toast.error(selectedReason ? '수정에 실패했습니다' : '등록에 실패했습니다');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (reason: PointReason) => {
    if (!confirm(`"${reason.name}" 사유를 삭제하시겠습니까?`)) return;
    try {
      await deletePointReason(reason.id);
      toast.success('삭제되었습니다');
      fetchReasons();
    } catch {
      toast.error('삭제에 실패했습니다');
    }
  };

  const rewardReasons = reasons.filter((r) => r.type === 'REWARD');
  const penaltyReasons = reasons.filter((r) => r.type === 'PENALTY');

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
        <h1 className="text-lg font-semibold text-zinc-900">점수 사유 관리</h1>
        <Button onClick={openCreateModal} size="sm">
          <Plus className="h-4 w-4 mr-1" />
          추가
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <div className="px-4 py-3 border-b border-zinc-100">
            <h2 className="text-sm font-medium text-zinc-900">상점 사유</h2>
          </div>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>사유</TableHead>
                  <TableHead className="w-20">점수</TableHead>
                  <TableHead className="w-20"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rewardReasons.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-zinc-500 py-8">
                      등록된 상점 사유가 없습니다
                    </TableCell>
                  </TableRow>
                ) : (
                  rewardReasons.map((reason) => (
                    <TableRow key={reason.id}>
                      <TableCell className="font-medium text-zinc-900">{reason.name}</TableCell>
                      <TableCell>
                        <Badge variant="success">+{reason.score}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button size="sm" variant="ghost" onClick={() => openEditModal(reason)}>
                            <Edit className="h-4 w-4 text-zinc-500" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDelete(reason)}>
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

        <Card>
          <div className="px-4 py-3 border-b border-zinc-100">
            <h2 className="text-sm font-medium text-zinc-900">벌점 사유</h2>
          </div>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>사유</TableHead>
                  <TableHead className="w-20">점수</TableHead>
                  <TableHead className="w-20"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {penaltyReasons.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-zinc-500 py-8">
                      등록된 벌점 사유가 없습니다
                    </TableCell>
                  </TableRow>
                ) : (
                  penaltyReasons.map((reason) => (
                    <TableRow key={reason.id}>
                      <TableCell className="font-medium text-zinc-900">{reason.name}</TableCell>
                      <TableCell>
                        <Badge variant="danger">-{reason.score}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button size="sm" variant="ghost" onClick={() => openEditModal(reason)}>
                            <Edit className="h-4 w-4 text-zinc-500" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDelete(reason)}>
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
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          reset();
        }}
        title={selectedReason ? '사유 수정' : '사유 추가'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            {...register('name')}
            label="사유"
            placeholder="ex) 봉사활동 참여"
            error={errors.name?.message}
          />
          <Input
            {...register('score')}
            type="number"
            label="점수"
            placeholder="1"
            min={1}
            error={errors.score?.message}
          />
          <Select
            label="유형"
            options={TYPE_OPTIONS}
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as PointType)}
          />
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
              {selectedReason ? '수정' : '추가'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
