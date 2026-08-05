'use client';

import { usePathname, useRouter } from 'next/navigation';
import Icon from '../ui/Icon';

interface NavTab {
  label: string;
  icon: string;
  route: string;
}

const tabs: NavTab[] = [
  { label: 'Explore', icon: 'explore', route: '/' },
  { label: 'Map', icon: 'map', route: '/map' },
  { label: 'Post', icon: 'add_circle', route: '/post' },
  { label: 'Awards', icon: 'military_tech', route: '/awards' },
  { label: 'Profile', icon: 'person', route: '/profile' },
];

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname.startsWith('/detail') || pathname.startsWith('/register-merchant')) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[1500] bg-background/95 backdrop-blur-md border-t border-outline-variant pb-[var(--safe-area-bottom)]">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {tabs.map((tab) => {
          const isActive =
            tab.route === '/'
              ? pathname === '/'
              : pathname.startsWith(tab.route);

          return (
            <button
              key={tab.route}
              onClick={() => router.push(tab.route)}
              className={`flex flex-col items-center justify-center gap-0.5 px-3 py-1 rounded-full transition-all duration-150 min-w-[64px] h-12 ${
                isActive ? 'bg-primary-container' : 'hover:bg-surface-dim/50'
              }`}
            >
              <Icon
                name={tab.icon}
                size={24}
                filled={isActive}
                className={isActive ? 'text-on-primary-container' : 'text-on-surface-variant'}
              />
              <span
                className={`text-[10px] leading-tight ${
                  isActive
                    ? 'text-on-primary-container font-semibold'
                    : 'text-on-surface-variant font-medium'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
