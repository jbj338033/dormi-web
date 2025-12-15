'use client';

import { useState, useEffect } from 'react';
import { Button, Badge } from '@/shared/ui';
import { getPointReasons } from '@/features/point-reason';
import { cn } from '@/shared/lib';
import type { PointReason, PointType } from '@/entities/point-reason';

interface PointFormProps {
  studentNames: string[];
  onSubmit: (reasonId: string) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export function PointForm({ studentNames, onSubmit, onCancel, loading }: PointFormProps) {
  const [reasons, setReasons] = useState<PointReason[]>([]);
  const [reasonsLoading, setReasonsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<PointType>('PENALTY');
  const [selectedReasonId, setSelectedReasonId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchReasons() {
      try {
        const data = await getPointReasons();
        setReasons(data);
      } catch {
        // ignore
      } finally {
        setReasonsLoading(false);
      }
    }
    fetchReasons();
  }, []);

  const handleSubmit = () => {
    if (!selectedReasonId) return;
    onSubmit(selectedReasonId);
  };

  const rewardReasons = reasons.filter((r) => r.type === 'REWARD');
  const penaltyReasons = reasons.filter((r) => r.type === 'PENALTY');
  const activeReasons = activeTab === 'REWARD' ? rewardReasons : penaltyReasons;
  const selectedReason = reasons.find((r) => r.id === selectedReasonId);

  return (
    <div className="space-y-4">
      <div className="bg-zinc-50 px-3 py-2.5 rounded-lg border border-zinc-100">
        <p className="text-xs text-zinc-500 mb-1">대상 학생 ({studentNames.length}명)</p>
        <p className="text-sm font-medium text-zinc-900">
          {studentNames.length <= 5
            ? studentNames.join(', ')
            : `${studentNames.slice(0, 5).join(', ')} 외 ${studentNames.length - 5}명`}
        </p>
      </div>

      {reasonsLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="h-5 w-5 border-2 border-zinc-300 border-t-zinc-900 rounded-full animate-spin" />
        </div>
      ) : (
        <>
          <div className="flex border-b border-zinc-200">
            <button
              type="button"
              onClick={() => {
                setActiveTab('PENALTY');
                setSelectedReasonId(null);
              }}
              className={cn(
                'flex-1 px-4 py-2.5 text-sm font-medium transition-colors',
                activeTab === 'PENALTY'
                  ? 'text-red-600 border-b-2 border-red-600 -mb-px'
                  : 'text-zinc-500 hover:text-zinc-700'
              )}
            >
              벌점
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('REWARD');
                setSelectedReasonId(null);
              }}
              className={cn(
                'flex-1 px-4 py-2.5 text-sm font-medium transition-colors',
                activeTab === 'REWARD'
                  ? 'text-emerald-600 border-b-2 border-emerald-600 -mb-px'
                  : 'text-zinc-500 hover:text-zinc-700'
              )}
            >
              상점
            </button>
          </div>

          <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto">
            {activeReasons.length === 0 ? (
              <p className="text-center text-sm text-zinc-500 py-4">등록된 사유가 없습니다</p>
            ) : (
              activeReasons.map((reason) => (
                <button
                  key={reason.id}
                  type="button"
                  onClick={() => setSelectedReasonId(reason.id)}
                  className={cn(
                    'flex items-center justify-between p-3 rounded-lg border text-left transition-all',
                    selectedReasonId === reason.id
                      ? activeTab === 'PENALTY'
                        ? 'border-red-400 bg-red-50 ring-1 ring-red-400'
                        : 'border-emerald-400 bg-emerald-50 ring-1 ring-emerald-400'
                      : 'border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50'
                  )}
                >
                  <span className="text-sm text-zinc-900">{reason.name}</span>
                  <Badge variant={activeTab === 'REWARD' ? 'success' : 'danger'}>
                    {activeTab === 'REWARD' ? '+' : '-'}{reason.score}
                  </Badge>
                </button>
              ))
            )}
          </div>

          {selectedReason && (
            <div className="flex items-center gap-2 p-3 bg-zinc-50 rounded-lg border border-zinc-200">
              <Badge variant={selectedReason.type === 'REWARD' ? 'success' : 'danger'}>
                {selectedReason.type === 'REWARD' ? '상점' : '벌점'}
              </Badge>
              <span className="text-sm font-medium text-zinc-900">
                {selectedReason.type === 'REWARD' ? '+' : '-'}{selectedReason.score}점
              </span>
              <span className="text-sm text-zinc-600">· {selectedReason.name}</span>
            </div>
          )}
        </>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          취소
        </Button>
        <Button onClick={handleSubmit} loading={loading} disabled={!selectedReasonId}>
          점수 부여
        </Button>
      </div>
    </div>
  );
}
