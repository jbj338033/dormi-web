'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Users, Award, Calendar, UserCog, FileText, LayoutGrid, LogOut, ListChecks, Menu, X, KeyRound } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { logout } from '@/features/auth';
import { useAuthStore } from '@/shared/store/auth';
import { PAGE_PERMISSIONS } from '@/shared/config/permissions';
import { ChangePasswordModal } from '@/widgets/change-password-modal';
import type { Role } from '@/entities/user';

const menuItems = [
  { href: '/dashboard', label: '대시보드', icon: LayoutGrid },
  { href: '/dashboard/students', label: '학생', icon: Users },
  { href: '/dashboard/points', label: '벌점/상점', icon: Award },
  { href: '/dashboard/point-reasons', label: '점수 사유', icon: ListChecks },
  { href: '/dashboard/duties', label: '당직', icon: Calendar },
  { href: '/dashboard/users', label: '계정', icon: UserCog },
  { href: '/dashboard/logs', label: '로그', icon: FileText },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const user = useAuthStore((state) => state.user);
  const hasAnyRole = useAuthStore((state) => state.hasAnyRole);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const filteredMenuItems = menuItems.filter((item) => {
    const requiredRoles = PAGE_PERMISSIONS[item.href];
    return requiredRoles ? hasAnyRole(requiredRoles as Role[]) : true;
  });

  const SidebarContent = () => (
    <>
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
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all',
                    isActive
                      ? 'bg-zinc-900 text-white font-medium shadow-sm'
                      : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
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
          onClick={() => setIsPasswordModalOpen(true)}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 transition-all"
        >
          <KeyRound className="h-4 w-4" />
          비밀번호 변경
        </button>
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-zinc-600 hover:bg-red-50 hover:text-red-600 transition-all"
        >
          <LogOut className="h-4 w-4" />
          로그아웃
        </button>
      </div>
    </>
  );

  return (
    <>
      <header className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b border-zinc-200 z-40 flex items-center justify-between px-4">
        <span className="text-sm font-semibold text-zinc-900">Dormi</span>
        <button
          onClick={() => setIsOpen(true)}
          className="p-2 -mr-2 rounded-lg hover:bg-zinc-100 transition-colors"
          aria-label="메뉴 열기"
        >
          <Menu className="h-5 w-5 text-zinc-700" />
        </button>
      </header>

      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-zinc-900/20 backdrop-blur-sm z-50"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={cn(
          'lg:hidden fixed top-0 right-0 h-screen w-72 bg-white shadow-xl z-50 flex flex-col transition-transform duration-300 ease-out',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className="h-14 flex items-center justify-between px-5 border-b border-zinc-100">
          <span className="text-sm font-semibold text-zinc-900">메뉴</span>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 -mr-2 rounded-lg hover:bg-zinc-100 transition-colors"
            aria-label="메뉴 닫기"
          >
            <X className="h-5 w-5 text-zinc-700" />
          </button>
        </div>
        <SidebarContent />
      </aside>

      <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-56 bg-white border-r border-zinc-200 flex-col">
        <div className="h-14 flex items-center px-5 border-b border-zinc-100">
          <span className="text-sm font-semibold text-zinc-900">Dormi</span>
        </div>
        <SidebarContent />
      </aside>

      <ChangePasswordModal isOpen={isPasswordModalOpen} onClose={() => setIsPasswordModalOpen(false)} />
    </>
  );
}
