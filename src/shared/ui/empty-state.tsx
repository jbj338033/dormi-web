'use client';

import type { ReactNode, ElementType } from 'react';
import { Inbox, Search, FileX, Users, Calendar, Award, FileText } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { Button } from './button';

type EmptyStateVariant = 'default' | 'search' | 'error' | 'students' | 'duties' | 'points' | 'logs';

const variantConfig: Record<EmptyStateVariant, { icon: ElementType; defaultTitle: string; defaultDescription: string }> = {
  default: {
    icon: Inbox,
    defaultTitle: '데이터가 없습니다',
    defaultDescription: '아직 등록된 데이터가 없습니다.',
  },
  search: {
    icon: Search,
    defaultTitle: '검색 결과가 없습니다',
    defaultDescription: '다른 검색어로 다시 시도해보세요.',
  },
  error: {
    icon: FileX,
    defaultTitle: '데이터를 불러올 수 없습니다',
    defaultDescription: '잠시 후 다시 시도해주세요.',
  },
  students: {
    icon: Users,
    defaultTitle: '등록된 학생이 없습니다',
    defaultDescription: '학생을 추가하여 관리를 시작하세요.',
  },
  duties: {
    icon: Calendar,
    defaultTitle: '등록된 당직이 없습니다',
    defaultDescription: '당직 일정을 추가해주세요.',
  },
  points: {
    icon: Award,
    defaultTitle: '벌점/상점 기록이 없습니다',
    defaultDescription: '학생에게 점수를 부여하면 여기에 표시됩니다.',
  },
  logs: {
    icon: FileText,
    defaultTitle: '로그가 없습니다',
    defaultDescription: '시스템 활동이 기록되면 여기에 표시됩니다.',
  },
};

interface EmptyStateProps {
  variant?: EmptyStateVariant;
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  children?: ReactNode;
}

export function EmptyState({ variant = 'default', title, description, action, className, children }: EmptyStateProps) {
  const config = variantConfig[variant];
  const Icon = config.icon;

  return (
    <div className={cn('flex flex-col items-center justify-center py-12 px-4', className)}>
      <div className="w-14 h-14 rounded-full bg-zinc-100 flex items-center justify-center mb-4">
        <Icon className="h-7 w-7 text-zinc-400" />
      </div>
      <h3 className="text-sm font-medium text-zinc-900 mb-1">{title || config.defaultTitle}</h3>
      <p className="text-sm text-zinc-500 text-center max-w-xs mb-4">{description || config.defaultDescription}</p>
      {action && (
        <Button variant="primary" size="sm" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
      {children}
    </div>
  );
}
