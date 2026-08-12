'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import PageShell from '@/components/layout/PageShell';
import Icon from '@/components/ui/Icon';
import Button from '@/components/ui/Button';
import Desk from '@/components/ui/Desk';
import ProgressBar from '@/components/ui/ProgressBar';
import { badges } from '@/lib/mock/badges';
import { profileApi, ProfileResponse } from '@/lib/api-client';
import Loading from '@/app/loading';

export default function PublicProfilePage() {
  const params = useParams();
  const router = useRouter();
  const userId = params?.id as string;

  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [shareSuccess, setShareSuccess] = useState(false);

  useEffect(() => {
    if (!userId) return;

    profileApi
      .getById(userId)
      .then((data) => {
        setProfile(data);
      })
      .catch((err) => {
        setErrorMsg(err.message || 'Profil pengguna tidak ditemukan');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [userId]);

  const handleShare = async () => {
    const shareUrl = window.location.href;
    const displayName = profile?.name || 'Penjelajah';

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Profil ${displayName} - Jajal.in`,
          text: `Lihat profil penjelajah ${displayName} di Jajal.in!`,
          url: shareUrl,
        });
      } catch {
        // User cancelled
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 2500);
      } catch {
        // Clipboard failed
      }
    }
  };

  if (loading) {
    return (
      <PageShell title="Profil Penjelajah">
        <Loading />
      </PageShell>
    );
  }

  if (errorMsg || !profile) {
    return (
      <PageShell
        title="Profil Penjelajah"
        variant="back"
      >
        <div className="max-w-md mx-auto py-xl text-center space-y-md">
          <Icon name="account_circle" size={64} className="text-on-surface-variant/40 mx-auto" />
          <h2 className="font-headline-md font-bold text-inverse-surface">Pengguna Tidak Ditemukan</h2>
          <p className="text-sm text-on-surface-variant">
            Profil yang Anda cari mungkin tidak ada atau telah dihapus.
          </p>
          <Button variant="secondary" size="md" onClick={() => router.push('/')}>
            Kembali ke Beranda
          </Button>
        </div>
      </PageShell>
    );
  }

  const avatarUrl = profile.avatar_url;
  const displayName = profile.name;
  const bio = profile.bio;
  const levelName = profile.level?.name || 'Local Explorer';
  const levelNumber = profile.level?.number || 1;
  const totalXp = profile.total_xp || 0;
  const nextXp = (profile.level?.xp_required || 0) + 1000;
  const totalContributions = profile.approved_places_count || 0;
  const totalReviews = profile.reviews_count || 0;
  const unlockedBadges = badges.filter((b) => b.unlocked);

  return (
    <PageShell
      title={`Profil ${displayName}`}
      variant="back"
      rightContent={
        <button
          onClick={handleShare}
          className="p-2 hover:bg-surface-container-high transition-colors rounded-full active:scale-95 duration-150 flex items-center justify-center text-primary"
          title="Bagikan Profil"
        >
          <Icon name="share" size={24} />
        </button>
      }
    >
      <section className="space-y-xl py-lg">
        {/* Toast alert */}
        {shareSuccess && (
          <div className="fixed top-20 right-4 z-50 bg-inverse-surface text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 animate-bounce">
            <Icon name="check_circle" className="text-primary-container" size={20} />
            <span className="text-sm font-medium">Link profil berhasil disalin!</span>
          </div>
        )}

        {/* Profile Hero Card & Stats Bento Grid */}
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

              {/* Share Button */}
              <div className="w-full mt-auto">
                <Button
                  variant="secondary"
                  size="md"
                  className="w-full font-bold text-label-md rounded-full flex items-center justify-center gap-2"
                  onClick={handleShare}
                >
                  <Icon name="share" size={18} /> Bagikan Profil Ini
                </Button>
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

            {/* Banner */}
            <div className="col-span-2 sm:col-span-4 bg-slate-heavy p-lg rounded-full flex items-center justify-between overflow-hidden relative shadow-md">
              <div className="relative z-10 flex items-center gap-lg">
                <div className="w-16 h-16 bg-primary-container rounded-full flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-on-primary-container text-3xl">workspace_premium</span>
                </div>
                <div>
                  <h3 className="text-white font-headline-md text-headline-md leading-tight font-bold">Penjelajah Aktif</h3>
                  <p className="text-white/70 font-body-md text-sm">Anggota komunitas penjelajah keunikan lokal Jajal.in!</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Achievements Section */}
        <section>
          <div className="flex items-center justify-between mb-lg">
            <h3 className="font-headline-md text-headline-md text-inverse-surface font-bold">Lencana Penjelajah</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-md">
            {unlockedBadges.slice(0, 3).map((badge) => (
              <div
                key={badge.id}
                className="bg-white p-lg rounded-full border border-outline-variant flex flex-col items-center text-center gap-sm hover:shadow-xl transition-shadow"
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
        </section>
      </section>
    </PageShell>
  );
}
