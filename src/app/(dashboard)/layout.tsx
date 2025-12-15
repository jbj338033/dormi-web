'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Sidebar } from '@/widgets/sidebar';
import { useAuthStore } from '@/shared/store/auth';
import { PAGE_PERMISSIONS } from '@/shared/config/permissions';
import type { Role } from '@/entities/user';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const token = useAuthStore((state) => state.token);
  const hasAnyRole = useAuthStore((state) => state.hasAnyRole);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    if (!token) {
      router.push('/login');
      return;
    }

    const requiredRoles = PAGE_PERMISSIONS[pathname];
    if (requiredRoles && !hasAnyRole(requiredRoles as Role[])) {
      router.push('/dashboard');
    }
  }, [mounted, token, pathname, router, hasAnyRole]);

  if (!mounted || !token) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-5 w-5 border-2 border-zinc-300 border-t-zinc-900 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <Sidebar />
      <main className="pt-14 lg:pt-0 lg:ml-56 min-h-screen">{children}</main>
    </div>
  );
}
