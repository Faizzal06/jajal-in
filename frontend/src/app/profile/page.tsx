'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PageShell from '@/components/layout/PageShell';
import Icon from '@/components/ui/Icon';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Desk from '@/components/ui/Desk';
import ProgressBar from '@/components/ui/ProgressBar';
import { badges, leaderboardEntries } from '@/lib/mock/badges';
import { profileApi, ProfileResponse, merchantApi, MyMerchantResponse, getAuthToken } from '@/lib/api-client';
import { useAuth } from '@/lib/context/AuthContext';
import Loading from '@/app/loading';

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout, loading: authLoading } = useAuth();
  const [apiProfile, setApiProfile] = useState<ProfileResponse | null>(null);
  const [myMerchants, setMyMerchants] = useState<MyMerchantResponse[]>([]);
  const [profileLoading, setProfileLoading] = useState(true);
  const [shareSuccess, setShareSuccess] = useState(false);

  useEffect(() => {
    if (!authLoading && !user && !getAuthToken()) {
      router.replace('/login?redirect=/profile');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      Promise.all([
        profileApi.get().catch(() => null),
        merchantApi.getMyMerchants().catch(() => []),
      ])
        .then(([profileData, merchantData]) => {
          if (profileData) setApiProfile(profileData);
          if (merchantData) setMyMerchants(merchantData);
        })
        .finally(() => {
          setProfileLoading(false);
        });
    } else {
      setProfileLoading(false);
    }
  }, []);

  const avatarUrl =
    apiProfile?.avatar_url ||
    user?.user_metadata?.avatar_url ||
    user?.user_metadata?.picture ||
    null;

  const displayName = apiProfile
    ? apiProfile.name
    : user
    ? user.user_metadata?.full_name || user.user_metadata?.name || user.email || 'Pengguna'
    : 'Penjelajah Lokal';

  const bio = apiProfile?.bio;
  const levelName = apiProfile?.level?.name || 'Local Explorer';
  const levelNumber = apiProfile?.level?.number || 1;
  const totalXp = apiProfile?.total_xp || 0;
  const nextXp = (apiProfile?.level?.xp_required || 0) + 1000;
  const totalContributions = apiProfile?.approved_places_count || 0;
  const totalReviews = apiProfile?.reviews_count || 0;

  const unlockedBadges = badges.filter((b) => b.unlocked);

  const handleShare = async () => {
    const profileId = apiProfile?.id || user?.id;
    const shareUrl = profileId
      ? `${window.location.origin}/profile/${profileId}`
      : window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Profil ${displayName} - Jajal.in`,
          text: `Lihat profil penjelajah ${displayName} di Jajal.in!`,
          url: shareUrl,
        });
      } catch {
        // User cancelled or share failed
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 2500);
      } catch {
        // clipboard write error fallback
      }
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  if (authLoading || profileLoading) {
    return (
      <PageShell title="Jajal.in">
        <Loading />
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Jajal.in"
      rightContent={
        <div className="relative">
          <div className="w-10 h-10 rounded-full border-2 border-primary-container bg-surface-dim flex items-center justify-center overflow-hidden">
            {avatarUrl ? (
              <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
            ) : (
              <Icon name="person" size={20} filled />
            )}
          </div>
          <span className="absolute -top-1 -right-1 bg-primary-container text-on-primary-container text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none">
            PRO
          </span>
        </div>
      }
    >
      <section className="space-y-xl py-lg">
        {/* Toast alert for link copy */}
        {shareSuccess && (
          <div className="fixed top-20 right-4 z-50 bg-inverse-surface text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 animate-bounce">
            <Icon name="check_circle" className="text-primary-container" size={20} />
            <span className="text-sm font-medium">Link profil berhasil disalin!</span>
          </div>
        )}

        {/* Guest Banner */}
        {!user && (
          <Desk className="bg-primary-container/20 border-primary-container flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center shrink-0">
                <Icon name="account_circle" size={24} className="text-on-primary-container" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-on-surface">Belum Masuk?</h4>
                <p className="text-xs text-on-surface-variant">
                  Masuk dengan akun Google untuk menyimpan statistik & kontribusi kamu.
                </p>
              </div>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => router.push('/login')}
              className="w-full sm:w-auto shrink-0"
            >
              Masuk / Daftar
            </Button>
          </Desk>
        )}

        {/* Profile Card & Stats Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-lg">
          {/* Profile Hero Card */}
          <div className="md:col-span-4 flex flex-col">
            <Desk className="flex flex-col items-center text-center p-lg h-full justify-between">
              <div className="flex flex-col items-center w-full">
                <div className="w-24 h-24 rounded-full border-4 border-primary-container p-1 mb-md overflow-hidden bg-surface-dim relative">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover rounded-full" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-surface-container text-primary">
                      <Icon name="person" size={48} filled />
                    </div>
                  )}
                </div>
                <h2 className="font-headline-md text-headline-md text-inverse-surface font-bold">
                  {displayName}
                </h2>
                <p className="font-body-md text-on-surface-variant mb-xs font-medium">
                  Level {levelNumber} Traveler ({levelName})
                </p>
                {bio && (
                  <p className="text-xs text-on-surface-variant/80 italic mb-md px-2 max-w-xs line-clamp-3">
                    &ldquo;{bio}&rdquo;
                  </p>
                )}

                {/* Progress Bar */}
                <div className="w-full bg-surface-container-highest h-3 rounded-full overflow-hidden mb-xs mt-2">
                  <ProgressBar value={Math.min(100, (totalXp / (nextXp || 1000)) * 100)} barClassName="bg-primary-container" showGlow />
                </div>
                <div className="w-full flex justify-between text-label-sm text-on-surface-variant font-medium mb-lg">
                  <span>{totalXp.toLocaleString()} XP</span>
                  <span>{nextXp.toLocaleString()} XP</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="w-full flex flex-col gap-2 mt-auto">
                <div className="w-full flex gap-sm">
                  <Button
                    variant="secondary"
                    size="md"
                    className="flex-1 font-bold text-label-md rounded-full"
                    onClick={() => router.push('/profile/edit')}
                  >
                    <Icon name="edit" size={18} /> Edit Profil
                  </Button>
                  <button
                    onClick={handleShare}
                    className="p-3 border border-outline-variant rounded-full hover:bg-surface-container transition-all active:scale-95 flex items-center justify-center"
                    title="Bagikan Profil"
                  >
                    <Icon name="share" size={20} className="text-on-surface" />
                  </button>
                </div>
                {myMerchants.length > 0 && (
                  <Button
                    variant="primary"
                    size="md"
                    className="w-full font-bold text-label-md rounded-full flex items-center justify-center gap-1.5"
                    onClick={() => router.push('/merchant/manage')}
                  >
                    <Icon name="storefront" size={18} /> Kelola Merchant ({myMerchants.length})
                  </Button>
                )}
              </div>
            </Desk>
          </div>

          {/* Stats Bento Grid */}
          <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-md">
            <div className="bg-white p-lg rounded-full border border-outline-variant flex flex-col justify-between hover:border-primary-container transition-colors group">
              <span className="material-symbols-outlined text-primary mb-md group-hover:scale-110 transition-transform" style={{ fontVariationSettings: "'FILL' 1" }}>military_tech</span>
              <div>
                <div className="font-headline-md text-headline-md text-inverse-surface font-bold">{totalContributions}</div>
                <div className="font-label-sm text-on-surface-variant">Kontribusi</div>
              </div>
            </div>

            <div className="bg-white p-lg rounded-full border border-outline-variant flex flex-col justify-between hover:border-primary-container transition-colors group">
              <span className="material-symbols-outlined text-primary mb-md group-hover:scale-110 transition-transform" style={{ fontVariationSettings: "'FILL' 1" }}>rate_review</span>
              <div>
                <div className="font-headline-md text-headline-md text-inverse-surface font-bold">{totalReviews}</div>
                <div className="font-label-sm text-on-surface-variant">Review Tempat</div>
              </div>
            </div>

            <div className="bg-white p-lg rounded-full border border-outline-variant flex flex-col justify-between hover:border-primary-container transition-colors group">
              <span className="material-symbols-outlined text-primary mb-md group-hover:scale-110 transition-transform" style={{ fontVariationSettings: "'FILL' 1" }}>photo_library</span>
              <div>
                <div className="font-headline-md text-headline-md text-inverse-surface font-bold">12</div>
                <div className="font-label-sm text-on-surface-variant">Foto Unggahan</div>
              </div>
            </div>

            <div className="bg-white p-lg rounded-full border border-outline-variant flex flex-col justify-between hover:border-primary-container transition-colors group">
              <span className="material-symbols-outlined text-primary mb-md group-hover:scale-110 transition-transform" style={{ fontVariationSettings: "'FILL' 1" }}>stars</span>
              <div>
                <div className="font-headline-md text-headline-md text-inverse-surface font-bold">4.9</div>
                <div className="font-label-sm text-on-surface-variant">Rating Reputation</div>
              </div>
            </div>

            {/* Elite Guide Program Banner */}
            <div className="col-span-2 sm:col-span-4 bg-slate-heavy p-lg rounded-full flex items-center justify-between overflow-hidden relative shadow-md">
              <div className="relative z-10 flex items-center gap-lg">
                <div className="w-16 h-16 bg-primary-container rounded-full flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-on-primary-container text-3xl">workspace_premium</span>
                </div>
                <div>
                  <h3 className="text-white font-headline-md text-headline-md leading-tight font-bold">Elite Guide Program</h3>
                  <p className="text-white/70 font-body-md text-sm">Tingkatkan kontribusimu untuk membuka lencana khusus!</p>
                </div>
              </div>
              <Button
                variant="primary"
                size="sm"
                className="relative z-10 font-bold text-label-md shrink-0"
                onClick={() => router.push('/awards')}
              >
                Lihat Detail
              </Button>
            </div>
          </div>
        </div>

        {/* Achievements & Leaderboard */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-xl">
          {/* Badges */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-lg">
              <h3 className="font-headline-md text-headline-md text-inverse-surface font-bold">Lencana Terbaru</h3>
              <button
                onClick={() => router.push('/awards')}
                className="text-primary font-bold text-label-md flex items-center gap-xs hover:underline"
              >
                Lihat Semua <Icon name="arrow_forward" size={16} />
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-md">
              {unlockedBadges.slice(0, 3).map((badge) => (
                <div
                  key={badge.id}
                  className="bg-white p-lg rounded-full border border-outline-variant flex flex-col items-center text-center gap-sm hover:shadow-xl transition-shadow cursor-pointer"
                >
                  <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                      {badge.icon}
                    </span>
                  </div>
                  <div className="font-label-md text-inverse-surface font-semibold">{badge.name}</div>
                  <div className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold">
                    {badge.description}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Leaderboard */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-full border border-outline-variant p-lg flex flex-col h-full">
              <h3 className="font-headline-md text-headline-md text-inverse-surface font-bold mb-lg">
                Leaderboard Mingguan
              </h3>
              <div className="flex flex-col gap-sm">
                {leaderboardEntries.slice(0, 3).map((entry) => (
                  <div
                    key={entry.id}
                    className={`flex items-center gap-md p-md rounded-full transition-colors ${
                      entry.isCurrentUser ? 'bg-slate-heavy text-white shadow-lg' : 'hover:bg-surface-container-low'
                    }`}
                  >
                    <div className={`font-headline-md font-bold w-6 text-center ${entry.isCurrentUser ? 'text-primary-container' : 'text-primary'}`}>
                      {entry.rank}
                    </div>
                    <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden shrink-0 border border-outline-variant">
                      <Icon name="person" size={24} className="m-auto text-on-surface-variant" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-label-md font-semibold truncate leading-none mb-1">
                        {entry.isCurrentUser ? `${displayName} (Kamu)` : entry.user.name}
                      </div>
                      <div className={`text-[10px] truncate ${entry.isCurrentUser ? 'text-white/70' : 'text-on-surface-variant'}`}>
                        {entry.user.title || 'Local Explorer'}
                      </div>
                    </div>
                    <div className="font-bold text-primary-container text-label-md">
                      {entry.totalXp.toLocaleString()}
                    </div>
                  </div>
                ))}
                <div className="mt-lg pt-lg border-t border-outline-variant text-center">
                  <button
                    onClick={() => router.push('/awards')}
                    className="font-bold text-primary text-label-md hover:underline"
                  >
                    Lihat Ranking Lengkap
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Merchant Banner */}
        {myMerchants.length > 0 ? (
          <Card className="border-primary-container bg-primary-container/10 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-center sm:text-left">
              <div className="w-14 h-14 rounded-2xl bg-primary-container flex items-center justify-center text-on-primary-container shrink-0 mx-auto sm:mx-0">
                <Icon name="storefront" size={32} />
              </div>
              <div>
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <h3 className="font-headline-md font-bold text-on-surface text-lg">Merchant & Usaha Anda</h3>
                  <span className="bg-primary-container text-on-primary-container text-xs font-bold px-2 py-0.5 rounded-full">
                    {myMerchants.length} Terdaftar
                  </span>
                </div>
                <p className="text-sm text-on-surface-variant">
                  Kelola profil toko, pantau status verifikasi, dan aktifkan fitur promosi prioritas (Open Promote).
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
              <Button
                variant="primary"
                size="md"
                className="flex-1 sm:flex-none font-bold"
                onClick={() => router.push('/merchant/manage')}
              >
                <Icon name="settings" size={18} /> Kelola Merchant
              </Button>
              <Button
                variant="ghost"
                size="md"
                className="flex-1 sm:flex-none"
                onClick={() => router.push('/register-merchant')}
                title="Daftarkan Usaha Baru"
              >
                <Icon name="add" size={18} /> Tambah
              </Button>
            </div>
          </Card>
        ) : (
          <Card className="border-primary-container bg-primary-container/10 text-center p-xl">
            <Icon name="storefront" size={36} className="text-primary mb-2 mx-auto" />
            <h3 className="font-headline-md font-bold text-on-surface mb-1">Punya Usaha Lokal? Daftarkan Gratis!</h3>
            <p className="text-sm text-on-surface-variant mb-4 max-w-md mx-auto">
              Jangkau ribuan penjelajah lokal, tampilkan produk unggulan, dan kembangkan bisnis usahamu di Jajal.in.
            </p>
            <Button variant="primary" size="md" onClick={() => router.push('/register-merchant')}>
              <Icon name="add" size={18} /> Daftarkan Usaha (Gratis)
            </Button>
          </Card>
        )}

        {/* Logout Button */}
        {user && (
          <div className="pt-2">
            <Button
              variant="ghost"
              size="md"
              className="w-full border-error text-error hover:bg-error/10 flex items-center justify-center gap-2"
              onClick={handleLogout}
            >
              <Icon name="logout" size={20} /> Keluar dari Akun
            </Button>
          </div>
        )}
      </section>
    </PageShell>
  );
}
