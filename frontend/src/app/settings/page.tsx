'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PageShell from '@/components/layout/PageShell';
import Icon from '@/components/ui/Icon';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Desk from '@/components/ui/Desk';
import { useAuth } from '@/lib/context/AuthContext';
import { supabase } from '@/lib/supabase/client';
import { getAuthToken } from '@/lib/api-client';
import Loading from '@/app/loading';

export default function SettingsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [saving, setSaving] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showErrorPopup, setShowErrorPopup] = useState(false);

  useEffect(() => {
    if (!authLoading && !user && !getAuthToken()) {
      router.replace('/login?redirect=/settings');
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!currentPassword) {
      setErrorMsg('Kata sandi saat ini wajib diisi.');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg('Kata sandi baru minimal 6 karakter.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Kata sandi baru dan konfirmasi kata sandi tidak cocok.');
      return;
    }

    setSaving(true);
    try {
      const email = user?.email;
      if (!email) {
        throw new Error('Akun tidak memiliki email yang terhubung.');
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: currentPassword,
      });
      if (signInError) {
        throw new Error('Kata sandi saat ini salah.');
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (updateError) {
        throw new Error('Gagal memperbarui kata sandi.');
      }

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowSuccessPopup(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gagal mengubah kata sandi.';
      setErrorMsg(message);
      setShowErrorPopup(true);
    } finally {
      setSaving(false);
    }
  };

  if (authLoading) {
    return (
      <PageShell title="Pengaturan Aplikasi">
        <Loading />
      </PageShell>
    );
  }

  return (
    <PageShell title="Pengaturan Aplikasi" variant="back">
      <div className="max-w-xl mx-auto py-lg space-y-lg">
        <Desk className="p-lg md:p-xl space-y-xl">
          <div className="flex items-center gap-md">
            <div className="w-12 h-12 rounded-xl bg-primary-container flex items-center justify-center shrink-0">
              <Icon name="key" size={24} className="text-on-primary-container" filled />
            </div>
            <div>
              <h2 className="font-headline-md text-on-surface font-bold">Ganti Kata Sandi</h2>
              <p className="text-sm text-on-surface-variant mt-0.5">
                Perbarui kata sandi akun kamu secara berkala untuk keamanan.
              </p>
            </div>
          </div>

          {errorMsg && !showErrorPopup && (
            <div className="bg-error/10 border border-error text-error p-4 rounded-xl text-sm font-medium flex items-center gap-2">
              <Icon name="error" size={20} />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-lg">
            <Input
              label="Kata Sandi Saat Ini"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Masukkan kata sandi saat ini"
              autoComplete="current-password"
              required
            />

            <Input
              label="Kata Sandi Baru"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimal 6 karakter"
              autoComplete="new-password"
              required
            />

            <Input
              label="Konfirmasi Kata Sandi Baru"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Ulangi kata sandi baru"
              autoComplete="new-password"
              required
            />

            <Button
              type="submit"
              variant="secondary"
              size="md"
              fullWidth
              disabled={saving}
            >
              {saving ? (
                <span className="flex items-center justify-center gap-2">
                  <Icon name="progress_activity" className="animate-spin" size={18} /> Mengubah...
                </span>
              ) : (
                'Ubah'
              )}
            </Button>
          </form>
        </Desk>
      </div>

      {/* Success Popup */}
      {showSuccessPopup && (
        <div className="fixed inset-0 z-[2000] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full border border-outline-variant flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-primary-container flex items-center justify-center mb-4">
              <Icon name="check_circle" size={36} className="text-on-primary-container" filled />
            </div>
            <h3 className="font-headline-md text-lg font-bold text-on-surface mb-2">
              Kata Sandi Berhasil Diubah
            </h3>
            <p className="text-sm text-on-surface-variant mb-6">
              Kata sandi akun kamu sudah diperbarui. Gunakan kata sandi baru saat masuk berikutnya.
            </p>
            <button
              onClick={() => setShowSuccessPopup(false)}
              className="w-full py-3 rounded-full bg-primary-container text-on-primary-container font-bold text-sm hover:brightness-105 active:scale-95 transition-all"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* Error Popup */}
      {showErrorPopup && (
        <div className="fixed inset-0 z-[2000] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full border border-outline-variant flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center mb-4">
              <Icon name="error" size={36} className="text-error" filled />
            </div>
            <h3 className="font-headline-md text-lg font-bold text-on-surface mb-2">
              Kata Sandi Gagal Diubah
            </h3>
            <p className="text-sm text-on-surface-variant mb-6">
              {errorMsg || 'Terjadi kesalahan saat mengubah kata sandi. Silakan coba lagi.'}
            </p>
            <button
              onClick={() => setShowErrorPopup(false)}
              className="w-full py-3 rounded-full bg-error text-white font-bold text-sm hover:brightness-95 active:scale-95 transition-all"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </PageShell>
  );
}
