'use client';

import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent, Button, Select } from '@/shared/ui';
import { LogViewer } from '@/widgets/log-viewer';
import { getLogs, getLogsByAction } from '@/features/log';
import type { AuditLog, ActionType, Page } from '@/entities/log';

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
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [actionFilter, setActionFilter] = useState('');

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      if (actionFilter) {
        const data = await getLogsByAction(actionFilter as ActionType);
        setLogs(data);
        setTotalPages(1);
      } else {
        const data: Page<AuditLog> = await getLogs(page, 20);
        setLogs(data.content);
        setTotalPages(data.totalPages);
      }
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
    setPage(0);
  }, [actionFilter]);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-semibold text-zinc-900">로그</h1>
        <div className="w-40">
          <Select options={actionOptions} value={actionFilter} onChange={(e) => setActionFilter(e.target.value)} />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="h-5 w-5 border-2 border-zinc-300 border-t-zinc-900 rounded-full animate-spin" />
            </div>
          ) : (
            <>
              <LogViewer logs={logs} />
              {!actionFilter && totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 py-4 border-t border-zinc-100">
                  <Button variant="ghost" size="sm" onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-zinc-600">{page + 1} / {totalPages}</span>
                  <Button variant="ghost" size="sm" onClick={() => setPage(Math.min(totalPages - 1, page + 1))} disabled={page === totalPages - 1}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
