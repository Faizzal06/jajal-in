'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import Button from '@/components/ui/Button';
import Icon from '../ui/Icon';

interface TopAppBarProps {
  variant?: 'default' | 'back' | 'close';
  title?: string;
  onMenuClick?: () => void;
  rightContent?: React.ReactNode;
}

export default function TopAppBar({
  variant = 'default',
  title = 'TemuLokal',
  onMenuClick,
  rightContent,
}: TopAppBarProps) {
  const router = useRouter();
  const { user } = useAuth();

  const handleLeft = () => {
    if (variant === 'back' || variant === 'close') {
      router.back();
    } else if (onMenuClick) {
      onMenuClick();
    }
  };

  const avatarUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture;

  return (
    <header className="sticky top-0 z-40 bg-background border-b border-outline-variant">
      <div className="flex items-center justify-between h-16 px-margin-mobile md:px-margin-desktop max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <button
            onClick={handleLeft}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-dim/50 transition-colors"
          >
            <Icon
              name={variant === 'close' ? 'close' : variant === 'back' ? 'arrow_back' : 'menu'}
              size={24}
            />
          </button>
          <h1 className="font-headline-lg text-primary font-extrabold text-xl">{title}</h1>
        </div>
        {rightContent || (
          user ? (
            <Link
              href="/profile"
              className="w-10 h-10 rounded-full border-2 border-primary-container bg-surface-dim flex items-center justify-center overflow-hidden"
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <Icon name="person" size={20} filled />
              )}
            </Link>
          ) : (
            <Link href="/login">
              <Button size="sm">Masuk</Button>
            </Link>
          )
        )}
      </div>
    </header>
  );
}

