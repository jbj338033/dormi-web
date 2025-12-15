'use client';

import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { ChevronLeft, ChevronRight, FileText, Filter, RefreshCw } from 'lucide-react';
import { Card, CardContent, Button, Select, PageHeader, TableSkeleton, EmptyState, Badge } from '@/shared/ui';
import { LogViewer } from '@/widgets/log-viewer';
import { getAuditLogs } from '@/features/log';
import type { AuditLog } from '@/entities/log';

const actionOptions = [
  { value: '', label: '전체' },
  { value: 'CREATE', label: '생성' },
  { value: 'UPDATE', label: '수정' },
  { value: 'DELETE', label: '삭제' },
  { value: 'LOGIN', label: '로그인' },
  { value: 'POINT_GRANT', label: '점수 부여' },
  { value: 'POINT_CANCEL', label: '점수 취소' },
  { value: 'POINT_RESET', label: '점수 초기화' },
  { value: 'DUTY_SWAP', label: '당직 교환' },
  { value: 'DUTY_COMPLETE', label: '당직 완료' },
];

export default function LogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [actionFilter, setActionFilter] = useState('');

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAuditLogs({
        action: actionFilter || undefined,
        page,
        limit: 20,
      });
      setLogs(res.data);
      setTotalPages(res.meta.totalPages);
      setTotalCount(res.meta.total);
    } catch {
      toast.error('로그를 불러오는데 실패했습니다');
    } finally {
      setLoading(false);
    }
  }, [page, actionFilter]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  useEffect(() => {
    setPage(1);
  }, [actionFilter]);

  const handleRefresh = () => {
    fetchLogs();
  };

  const selectedFilterLabel = actionOptions.find((opt) => opt.value === actionFilter)?.label || '전체';

  return (
    <div className="p-6">
      <PageHeader
        title="활동 로그"
        description="시스템의 모든 활동 기록을 확인합니다"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleRefresh} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-zinc-400" />
              <Select options={actionOptions} value={actionFilter} onChange={(e) => setActionFilter(e.target.value)} className="w-40" />
            </div>
          </div>
        }
      />

      {/* 필터 상태 표시 */}
      {actionFilter && (
        <div className="mb-4 flex items-center gap-2">
          <span className="text-sm text-zinc-500">필터:</span>
          <Badge variant="info">{selectedFilterLabel}</Badge>
          <button onClick={() => setActionFilter('')} className="text-xs text-zinc-400 hover:text-zinc-600 transition-colors">
            초기화
          </button>
        </div>
      )}

      <Card>
        <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-zinc-400" />
            <h2 className="text-sm font-semibold text-zinc-900">로그 목록</h2>
          </div>
          {!loading && (
            <span className="text-xs text-zinc-500">
              총 {totalCount}건 {actionFilter && `(필터 적용)`}
            </span>
          )}
        </div>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-4">
              <TableSkeleton rows={8} cols={4} />
            </div>
          ) : logs.length === 0 ? (
            <EmptyState
              variant="logs"
              title={actionFilter ? '해당 조건의 로그가 없습니다' : '로그가 없습니다'}
              description={actionFilter ? '다른 필터를 선택해보세요' : '시스템 활동이 기록되면 여기에 표시됩니다'}
              className="py-12"
            />
          ) : (
            <>
              <LogViewer logs={logs} />
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-5 py-4 border-t border-zinc-100">
                  <span className="text-sm text-zinc-500">
                    {(page - 1) * 20 + 1}-{Math.min(page * 20, totalCount)} / {totalCount}건
                  </span>
                  <div className="flex items-center gap-2">
                    <Button variant="secondary" size="sm" onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}>
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      이전
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum: number;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (page <= 3) {
                          pageNum = i + 1;
                        } else if (page >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = page - 2 + i;
                        }
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setPage(pageNum)}
                            className={`h-8 w-8 rounded-lg text-sm font-medium transition-colors ${
                              page === pageNum ? 'bg-zinc-900 text-white' : 'text-zinc-600 hover:bg-zinc-100'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>
                    <Button variant="secondary" size="sm" onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages}>
                      다음
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
