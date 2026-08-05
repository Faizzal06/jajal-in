'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import PageShell from '@/components/layout/PageShell';
import Icon from '@/components/ui/Icon';

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/profile';

  useEffect(() => {
    let isMounted = true;

    const handleAuthCallback = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session && isMounted) {
          router.push(redirect);
          return;
        }

        const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
          if (session && isMounted) {
            router.push(redirect);
          }
        });

        const timer = setTimeout(() => {
          if (isMounted) {
            router.push(redirect);
          }
        }, 2000);

        return () => {
          authListener.subscription.unsubscribe();
          clearTimeout(timer);
        };
      } catch {
        if (isMounted) {
          router.push(redirect);
        }
      }
    };

    handleAuthCallback();

    return () => {
      isMounted = false;
    };
  }, [router, redirect]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
      <div className="bg-surface rounded-full p-6 shadow-sm border border-outline-variant/30 flex items-center justify-center mb-6">
        <div className="animate-spin text-primary flex items-center justify-center">
          <Icon name="progress_activity" size={48} />
        </div>
      </div>
      <h2 className="font-headline-md text-xl font-bold text-on-surface mb-2">
        Menghubungkan akun Google Anda...
      </h2>
      <p className="font-body-md text-sm text-on-surface-variant max-w-sm">
        Mohon tunggu sebentar, kami sedang mengamankan sesi masuk Anda.
      </p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <PageShell title="Otentikasi" variant="back" hideNav>
      <Suspense
        fallback={
          <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
            <div className="bg-surface rounded-full p-6 shadow-sm border border-outline-variant/30 flex items-center justify-center mb-6">
              <div className="animate-spin text-primary flex items-center justify-center">
                <Icon name="progress_activity" size={48} />
              </div>
            </div>
            <h2 className="font-headline-md text-xl font-bold text-on-surface mb-2">
              Menghubungkan akun Google Anda...
            </h2>
          </div>
        }
      >
        <CallbackHandler />
      </Suspense>
    </PageShell>
  );
}
