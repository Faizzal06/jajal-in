'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Icon from '../ui/Icon';

const navItems = [
  { label: 'Dashboard', icon: 'dashboard', href: '/admin' },
  { label: 'Tempat', icon: 'place', href: '/admin/places' },
  { label: 'Users', icon: 'group', href: '/admin/users' },
  { label: 'Merchants', icon: 'storefront', href: '/admin/merchants' },
  { label: 'Kontribusi', icon: 'rate_review', href: '/admin/contributions' },
  { label: 'Audit Log', icon: 'history', href: '/admin/audit-log' },
];

export default function AdminSidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const pathname = usePathname();

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={onClose} />
      )}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-light-gray z-50 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:z-auto ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center gap-2 h-16 px-6 border-b border-light-gray">
          <span className="font-headline text-xl font-bold text-primary">jajal.in</span>
          <span className="text-xs font-semibold bg-primary-container text-on-primary-container px-2 py-0.5 rounded-full">
            Admin
          </span>
        </div>

        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = item.href === '/admin'
              ? pathname === '/admin'
              : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary-container text-on-primary-container'
                    : 'text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                <Icon name={item.icon} size={20} filled={isActive} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-2.5 text-sm text-on-surface-variant hover:bg-surface-container-high rounded-xl transition-colors"
          >
            <Icon name="arrow_back" size={20} />
            Kembali ke App
          </Link>
        </div>
      </aside>
    </>
  );
}
