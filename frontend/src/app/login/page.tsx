'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import Icon from '@/components/ui/Icon';
import TopAppBar from '@/components/layout/TopAppBar';

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');

  const { loginWithGoogle, loginWithEmail } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setError(null);
    setGoogleLoading(true);
    try {
      const result = await loginWithGoogle(redirect || undefined);
      if (result?.error) {
        setError(result.error.message || 'Gagal masuk dengan Google');
        setGoogleLoading(false);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Terjadi kesalahan saat masuk dengan Google';
      setError(message);
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError('Email dan password wajib diisi');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await loginWithEmail(email, password);
      if (result?.error) {
        setError(result.error.message || 'Email atau password salah');
        setIsSubmitting(false);
      } else {
        router.push(redirect || '/profile');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Terjadi kesalahan saat masuk';
      setError(message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopAppBar title="Masuk ke TemuLokal" variant="back" />

      <main className="flex-1 flex items-center justify-center p-margin-mobile md:p-margin-desktop py-8">
        <div className="w-full max-w-md space-y-6">
          <Card className="!p-6 space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold font-headline-md text-on-surface">Selamat Datang Kembali</h2>
              <p className="text-sm text-on-surface-variant">
                Masuk untuk melanjutkan jelajah tempat lokal unik di Indonesia
              </p>
            </div>

            {error && (
              <div className="bg-error/10 border border-error/20 text-error rounded-input p-3 text-sm flex items-center gap-2">
                <Icon name="error" size={20} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Button
              type="button"
              variant="ghost"
              fullWidth
              onClick={handleGoogleLogin}
              disabled={googleLoading || isSubmitting}
              className="flex items-center justify-center gap-3 py-3 font-semibold text-slate-heavy border-outline-variant hover:bg-surface-dim"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{googleLoading ? 'Menghubungkan...' : 'Masuk dengan Google'}</span>
            </Button>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-outline-variant"></div>
              <span className="flex-shrink mx-4 text-xs font-medium text-on-surface-variant">
                atau masuk dengan email
              </span>
              <div className="flex-grow border-t border-outline-variant"></div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email"
                type="email"
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <Input
                label="Password"
                type="password"
                placeholder="Masukkan kata sandi"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <Button
                type="submit"
                variant="primary"
                fullWidth
                disabled={isSubmitting || googleLoading}
                className="mt-2"
              >
                {isSubmitting ? 'Memproses...' : 'Masuk'}
              </Button>
            </form>
          </Card>

          <p className="text-center text-sm text-on-surface-variant">
            Belum punya akun?{' '}
            <Link
              href={redirect ? `/register?redirect=${encodeURIComponent(redirect)}` : '/register'}
              className="text-primary font-bold hover:underline"
            >
              Daftar Sekarang
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex flex-col">
          <TopAppBar title="Masuk ke TemuLokal" variant="back" />
          <div className="flex-1 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-primary-container border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}
