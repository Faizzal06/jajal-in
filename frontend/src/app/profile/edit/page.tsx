'use client';

import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import PageShell from '@/components/layout/PageShell';
import Icon from '@/components/ui/Icon';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Desk from '@/components/ui/Desk';
import { profileApi, ProfileResponse, getAuthToken } from '@/lib/api-client';
import { useAuth } from '@/lib/context/AuthContext';
import Loading from '@/app/loading';

export default function EditProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // Form states
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (!authLoading && !user && !getAuthToken()) {
      router.replace('/login?redirect=/profile/edit');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      profileApi
        .get()
        .then((data) => {
          setProfile(data);
          setName(data.name || '');
          setBio(data.bio || '');
          setAvatarUrl(data.avatar_url || '');
        })
        .catch((err) => {
          setErrorMsg(err.message || 'Gagal memuat data profil');
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Ukuran file maksimal 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setAvatarUrl(reader.result);
        setErrorMsg('');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Nama tidak boleh kosong');
      return;
    }

    setSaving(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      await profileApi.update({
        name: name.trim(),
        bio: bio.trim(),
        avatar_url: avatarUrl,
      });

      setSuccessMsg('Profil berhasil diperbarui!');
      setTimeout(() => {
        router.push('/profile');
      }, 1000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menyimpan perubahan');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <PageShell title="Edit Profil">
        <Loading />
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Edit Profil"
      variant="back"
    >
      <div className="max-w-xl mx-auto py-lg space-y-lg">
        {/* Banner Alert Messages */}
        {errorMsg && (
          <div className="bg-error/10 border border-error text-error p-4 rounded-xl text-sm font-medium flex items-center gap-2">
            <Icon name="error" size={20} />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="bg-primary-container/30 border border-primary-container text-on-primary-container p-4 rounded-xl text-sm font-medium flex items-center gap-2">
            <Icon name="check_circle" size={20} />
            <span>{successMsg}</span>
          </div>
        )}

        <Desk className="p-lg md:p-xl space-y-xl">
          <form onSubmit={handleSubmit} className="space-y-lg">
            {/* Avatar Section */}
            <div className="flex flex-col items-center justify-center space-y-md">
              <div className="relative group cursor-pointer">
                <div className="w-28 h-28 rounded-full border-4 border-primary-container p-1 bg-surface-dim overflow-hidden flex items-center justify-center shadow-inner">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar Preview" className="w-full h-full object-cover rounded-full" />
                  ) : (
                    <Icon name="person" size={56} className="text-on-surface-variant" filled />
                  )}
                </div>
                <label
                  htmlFor="avatar-upload"
                  className="absolute bottom-0 right-0 bg-slate-heavy text-white p-2.5 rounded-full border-2 border-white shadow-lg cursor-pointer hover:bg-slate-heavy/90 active:scale-95 transition-all flex items-center justify-center"
                  title="Ubah Foto"
                >
                  <Icon name="photo_camera" size={18} />
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
              </div>
              <p className="text-xs text-on-surface-variant text-center font-medium">
                Klik ikon kamera untuk mengunggah foto baru (Max 5MB)
              </p>
            </div>

            {/* Nama Field */}
            <Input
              label="Nama Lengkap"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Masukkan nama lengkap kamu"
              maxLength={50}
              required
            />

            {/* Bio Field */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label className="text-sm font-semibold text-on-surface">Bio</label>
                <span className="text-xs text-on-surface-variant font-medium">
                  {bio.length}/200
                </span>
              </div>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value.slice(0, 200))}
                placeholder="Ceritakan sedikit tentang dirimu (misal: Pecinta kuliner pedas & pasar tradisional)"
                rows={4}
                className="bg-white border border-outline-variant rounded-input px-4 py-3 text-base text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-2 focus:border-slate-heavy transition-all duration-150 resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-md pt-md">
              <Button
                type="button"
                variant="ghost"
                size="md"
                className="flex-1"
                onClick={() => router.push('/profile')}
                disabled={saving}
              >
                Batal
              </Button>
              <Button
                type="submit"
                variant="secondary"
                size="md"
                className="flex-1 font-bold"
                disabled={saving}
              >
                {saving ? (
                  <span className="flex items-center justify-center gap-2">
                    <Icon name="progress_activity" className="animate-spin" size={18} /> Menyimpan...
                  </span>
                ) : (
                  'Simpan Perubahan'
                )}
              </Button>
            </div>
          </form>
        </Desk>
      </div>
    </PageShell>
  );
}
