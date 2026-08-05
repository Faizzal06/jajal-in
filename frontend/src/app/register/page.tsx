'use client';

import { useState } from 'react';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/context/AuthContext';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import Icon from '@/components/ui/Icon';
import TopAppBar from '@/components/layout/TopAppBar';

export default function RegisterPage() {
  const { registerWithEmail, loginWithGoogle } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Kata sandi dan konfirmasi kata sandi tidak cocok.');
      return;
    }

    if (password.length < 6) {
      setError('Kata sandi minimal 6 karakter.');
      return;
    }

    setSubmitting(true);
    try {
      const { error: resError } = await registerWithEmail(email, password, name);
      if (resError) {
        setError(resError.message || 'Gagal mendaftar. Silakan coba lagi.');
      } else {
        setSuccess('Pendaftaran berhasil! Silakan periksa email Anda untuk verifikasi atau silakan masuk.');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan saat mendaftar. Silakan coba lagi.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      const { error: resError } = await loginWithGoogle();
      if (resError) {
        setError(resError.message || 'Gagal masuk dengan Google.');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Gagal masuk dengan Google.';
      setError(msg);
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopAppBar title="Daftar Akun Baru" variant="back" />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md">
          <Card className="!rounded-brand shadow-sm">
            <div className="text-center mb-6">
              <h2 className="font-headline text-2xl font-bold text-slate-heavy">
                Buat Akun
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                Bergabung dengan TemuLokal dan jelajahi kuliner terbaik
              </p>
            </div>

            {/* Google OAuth Button */}
            <Button
              type="button"
              variant="ghost"
              fullWidth
              onClick={handleGoogleLogin}
              disabled={googleLoading || submitting}
              className="py-3 font-semibold text-slate-heavy border-outline-variant hover:bg-slate-50 transition-colors"
            >
              <svg className="w-5 h-5 mr-2 inline-block shrink-0" viewBox="0 0 24 24">
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
              {googleLoading ? 'Menghubungkan...' : 'Daftar dengan Google'}
            </Button>

            {/* Divider */}
            <div className="relative flex items-center my-6">
              <div className="flex-grow border-t border-outline-variant"></div>
              <span className="flex-shrink mx-3 text-xs text-slate-500 uppercase tracking-wider font-semibold">
                atau daftar dengan email
              </span>
              <div className="flex-grow border-t border-outline-variant"></div>
            </div>

            {/* Alert Messages */}
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2">
                <Icon name="error" size={20} className="text-red-500 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm flex items-start gap-2">
                <Icon name="check_circle" size={20} className="text-green-500 shrink-0 mt-0.5" />
                <span>{success}</span>
              </div>
            )}

            {/* Registration Form */}
            <form onSubmit={handleRegister} className="space-y-4">
              <Input
                label="Nama Lengkap"
                type="text"
                placeholder="Masukkan nama lengkap"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              <Input
                label="Email"
                type="email"
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <Input
                label="Kata Sandi"
                type="password"
                placeholder="Minimal 6 karakter"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <Input
                label="Konfirmasi Kata Sandi"
                type="password"
                placeholder="Ulangi kata sandi"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />

              <Button
                type="submit"
                variant="primary"
                fullWidth
                disabled={submitting || googleLoading}
                className="mt-2"
              >
                {submitting ? 'Mendaftar...' : 'Daftar'}
              </Button>
            </form>

            {/* Footer */}
            <div className="mt-6 text-center text-sm text-slate-600">
              Sudah punya akun?{' '}
              <Link href="/login" className="font-semibold text-slate-heavy hover:underline">
                Masuk di sini
              </Link>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
