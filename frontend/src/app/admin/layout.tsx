'use client';

import { useState } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminGuard from '@/components/admin/AdminGuard';
import Icon from '@/components/ui/Icon';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <AdminGuard>
      <div className="flex min-h-screen bg-cool-gray">
        <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="flex-1 flex flex-col min-w-0">
          <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-light-gray h-16 flex items-center px-4 lg:px-8">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 rounded-xl hover:bg-surface-container-high transition-colors"
            >
              <Icon name="menu" size={24} />
            </button>
            <div className="flex-1" />
            <div className="flex items-center gap-2 text-sm text-on-surface-variant">
              <Icon name="admin_panel_settings" size={20} />
              <span className="font-medium">Admin Panel</span>
            </div>
          </header>

          <main className="flex-1 p-4 lg:p-8 max-w-[1440px] w-full mx-auto">
            {children}
          </main>
        </div>
      </div>
    </AdminGuard>
  );
}
