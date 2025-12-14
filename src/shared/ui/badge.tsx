import { cn } from '@/shared/lib/cn';
import { type HTMLAttributes } from 'react';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
}

export function Badge({ className, variant = 'default', children, ...props }: BadgeProps) {
  const variants = {
    default: 'bg-zinc-100 text-zinc-600',
    success: 'bg-emerald-50 text-emerald-600',
    warning: 'bg-amber-50 text-amber-600',
    danger: 'bg-red-50 text-red-600',
    info: 'bg-sky-50 text-sky-600',
  };

  return (
    <span
      className={cn('inline-flex items-center px-2 py-0.5 rounded text-xs font-medium', variants[variant], className)}
      {...props}
    >
      {children}
    </span>
  );
}
