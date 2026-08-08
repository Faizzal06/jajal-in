'use client';
import TopAppBar from './TopAppBar';
import BottomNav from './BottomNav';

interface PageShellProps {
  children: React.ReactNode;
  variant?: 'default' | 'back' | 'close';
  title?: string;
  rightContent?: React.ReactNode;
  hideNav?: boolean;
  maxWidth?: string;
}

import { useState } from 'react';
import SidebarMenu from '@/components/ui/SidebarMenu';

export default function PageShell({
  children,
  variant = 'default',
  title,
  rightContent,
  hideNav = false,
  maxWidth = 'max-w-7xl',
}: PageShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopAppBar variant={variant} title={title} rightContent={rightContent} onMenuClick={toggleSidebar} />
      <SidebarMenu isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className={`flex-1 ${maxWidth} mx-auto w-full px-margin-mobile md:px-margin-desktop pb-24`}>
        {children}
      </main>
      {!hideNav && <BottomNav />}
    </div>
  );
}
