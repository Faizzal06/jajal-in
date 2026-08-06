'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { profileApi, ProfileResponse } from '@/lib/api-client';

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.replace('/login?redirect=/admin');
      return;
    }

    profileApi.get()
      .then((profile: ProfileResponse) => {
        if (profile.role !== 'admin') {
          router.replace('/');
        } else {
          setAuthorized(true);
        }
      })
      .catch(() => {
        router.replace('/');
      })
      .finally(() => {
        setChecking(false);
      });
  }, [user, authLoading, router]);

  if (authLoading || checking || !authorized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-cool-gray">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-primary-container border-t-primary rounded-full animate-spin" />
          <span className="text-sm text-on-surface-variant">Memverifikasi akses...</span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
