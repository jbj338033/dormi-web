'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Users, Award, Calendar, UserCog, FileText, LayoutGrid, LogOut } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { logout } from '@/features/auth';
import { useAuthStore } from '@/shared/store/auth';
import { PAGE_PERMISSIONS } from '@/shared/config/permissions';
import type { Role } from '@/entities/user';

const menuItems = [
  { href: '/dashboard', label: '대시보드', icon: LayoutGrid },
  { href: '/dashboard/students', label: '학생', icon: Users },
  { href: '/dashboard/points', label: '벌점/상점', icon: Award },
  { href: '/dashboard/duties', label: '당직', icon: Calendar },
  { href: '/dashboard/users', label: '계정', icon: UserCog },
  { href: '/dashboard/logs', label: '로그', icon: FileText },
];

export function Sidebar() {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const hasAnyRole = useAuthStore((state) => state.hasAnyRole);

  const filteredMenuItems = menuItems.filter((item) => {
    const requiredRoles = PAGE_PERMISSIONS[item.href];
    return requiredRoles ? hasAnyRole(requiredRoles as Role[]) : true;
  });

  return (
    <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-56 bg-white border-r border-zinc-200 flex-col">
      <div className="h-14 flex items-center px-5 border-b border-zinc-100">
        <span className="text-sm font-semibold text-zinc-900">Dormi</span>
      </div>

      <nav className="flex-1 py-4 px-3">
        <ul className="space-y-1">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
                    isActive ? 'bg-zinc-100 text-zinc-900 font-medium' : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-3 border-t border-zinc-100">
        <div className="px-3 py-2 mb-2">
          <p className="text-sm font-medium text-zinc-900 truncate">{user?.name}</p>
          <p className="text-xs text-zinc-500 truncate">{user?.email}</p>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-md text-sm text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          로그아웃
        </button>
      </div>
    </aside>
  );
}
