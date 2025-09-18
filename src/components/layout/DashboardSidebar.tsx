'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Download, ListOrdered, Gem, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/dashboard/download', label: 'Download', icon: Download },
  { href: '/dashboard/orders', label: 'My Orders', icon: ListOrdered },
  { href: '/dashboard/pricing', label: 'Pricing', icon: Gem },
  { href: '/dashboard/profile', label: 'Profile', icon: User },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 flex-col border-r bg-gray-100/40 p-4 dark:bg-gray-800/40 md:flex">
      <nav className="flex flex-col gap-2 font-medium">
        {navItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50',
              pathname === item.href && 'bg-gray-200/50 text-gray-900 dark:bg-gray-700/50 dark:text-gray-50'
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
