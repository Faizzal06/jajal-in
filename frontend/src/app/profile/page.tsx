'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PageShell from '@/components/layout/PageShell';
import Icon from '@/components/ui/Icon';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Desk from '@/components/ui/Desk';
import ProgressBar from '@/components/ui/ProgressBar';
import { users } from '@/lib/mock/users';
import { badges, leaderboardEntries } from '@/lib/mock/badges';
import { profileApi, ProfileResponse, getAuthToken } from '@/lib/api-client';
import { useAuth } from '@/lib/context/AuthContext';

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout, loading: authLoading } = useAuth();
  const [apiProfile, setApiProfile] = useState<ProfileResponse | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user && !getAuthToken()) {
      router.replace('/login?redirect=/profile');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      profileApi
        .get()
        .then((data) => setApiProfile(data))
        .catch(() => {})
        .finally(() => setProfileLoading(false));
    } else {
      setProfileLoading(false);
    }
  }, []);

  const mockUser = users[0];
  const avatarUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture;
  const displayName = user
    ? (user.user_metadata?.full_name || user.user_metadata?.name || user.email || 'Pengguna')
    : (apiProfile ? apiProfile.name : mockUser.name);

  const displayUser = {
    name: displayName,
    title: apiProfile?.level?.name ?? mockUser.title ?? mockUser.level.name,
    levelNumber: apiProfile?.level?.number ?? mockUser.level.number,
    totalXp: apiProfile?.total_xp ?? mockUser.totalXp,
    totalContributions: apiProfile?.approved_places_count ?? mockUser.totalContributions,
    totalTrips: mockUser.totalTrips ?? 0,
    totalPhotos: mockUser.totalPhotos ?? 0,
    rating: mockUser.rating ?? 0,
  };

  const unlockedBadges = badges.filter((b) => b.unlocked);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  if (authLoading || profileLoading) {
    return (
      <PageShell title="Jajal.in">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-primary-container border-t-transparent rounded-full animate-spin" />
        </div>
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

        {/* Profile Card */}
        <Desk className="flex flex-col md:flex-row md:items-center gap-lg">
          <div className="flex items-center gap-4 md:flex-col md:items-start">
            <div className="w-24 h-24 rounded-full border-4 border-primary-container bg-surface-dim flex items-center justify-center shrink-0 overflow-hidden">
              {avatarUrl ? (
                <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
              ) : (
                <Icon name="person" size={48} filled />
              )}
            </div>
            <div>
              <h2 className="font-headline-md text-on-surface font-bold">{displayUser.name}</h2>
              <p className="text-sm text-primary font-medium">{displayUser.title}</p>
              <p className="text-xs text-on-surface-variant">Level {displayUser.levelNumber} Traveler</p>
            </div>
          </div>
          <div className="flex-1 space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-on-surface-variant">XP Progress</span>
                <span className="font-bold text-on-surface">{displayUser.totalXp} / 3,000</span>
              </div>
              <ProgressBar value={(displayUser.totalXp / 3000) * 100} barClassName="bg-primary-container" showGlow />
            </div>
            <div className="flex gap-3 flex-wrap">
              <Button variant="ghost" size="sm" className="flex-1">
                <Icon name="edit" size={16} /> Edit Profil
              </Button>
              <Button variant="ghost" size="sm" className="flex-1">
                <Icon name="share" size={16} /> Bagikan
              </Button>
              {user && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1 border-error text-error hover:bg-error/10"
                  onClick={handleLogout}
                >
                  <Icon name="logout" size={16} /> Keluar
                </Button>
              )}
            </div>
          </div>
        </Desk>

        {/* Stats Bento Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: 'map', label: 'Kontribusi', value: displayUser.totalContributions },
            { icon: 'flight', label: 'Perjalanan', value: displayUser.totalTrips || 0 },
            { icon: 'camera_alt', label: 'Foto', value: displayUser.totalPhotos },
            { icon: 'star', label: 'Rating', value: displayUser.rating, isDecimal: true },
          ].map((stat) => (
            <Card key={stat.label} className="text-center">
              <Icon name={stat.icon} size={24} className="text-primary mb-1" filled />
              <p className="font-headline-md text-2xl font-bold text-on-surface">
                {stat.isDecimal ? stat.value : stat.value}
              </p>
              <p className="text-xs text-on-surface-variant">{stat.label}</p>
            </Card>
          ))}
        </div>

        {/* Elite Guide Program */}
        <Card className="bg-slate-heavy text-white border-none !p-xl flex flex-col md:flex-row items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary-container flex items-center justify-center shrink-0">
            <Icon name="workspace_premium" size={32} className="text-on-primary-container" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h3 className="font-headline-md font-bold text-lg">Elite Guide Program</h3>
            <p className="text-white/70 text-sm">You&apos;re only 3 gems away from the next tier!</p>
          </div>
          <Button variant="primary" size="sm">Lihat Detail</Button>
        </Card>

        {/* Latest Badges */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-headline-md text-on-surface font-bold text-lg">Lencana Terbaru</h3>
            <button className="text-sm text-primary font-medium hover:underline">Lihat Semua</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {unlockedBadges.slice(0, 3).map((badge) => (
              <Card key={badge.id} className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center shrink-0">
                  <Icon name={badge.icon} size={24} className="text-on-primary-container" filled />
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-sm text-on-surface">{badge.name}</h4>
                  <p className="text-xs text-on-surface-variant truncate">{badge.description}</p>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Leaderboard */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-headline-md text-on-surface font-bold text-lg">Leaderboard Mingguan</h3>
          </div>
          <Desk className="divide-y divide-outline-variant !p-0">
            {leaderboardEntries.slice(0, 3).map((entry) => (
              <div
                key={entry.id}
                className={`flex items-center gap-4 p-lg ${entry.isCurrentUser ? 'bg-slate-heavy text-white' : ''}`}
              >
                <span className="w-8 text-center font-bold text-sm">#{entry.rank}</span>
                <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center overflow-hidden shrink-0 ${entry.isCurrentUser ? 'border-primary-container' : 'border-outline-variant bg-surface-dim'}`}>
                  <Icon name="person" size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm truncate">{entry.user.name}</p>
                  <p className="text-xs opacity-70">{entry.user.title}</p>
                </div>
                <span className={`font-bold text-sm ${entry.rank === 1 ? 'text-primary-container' : ''}`}>
                  {entry.totalXp.toLocaleString()} XP
                </span>
              </div>
            ))}
          </Desk>
          <p className="text-xs text-on-surface-variant mt-2 text-center">
            Top 5% this week
          </p>
          <div className="mt-3 text-center">
            <Button variant="ghost" size="sm">Lihat Ranking Lengkap</Button>
          </div>
        </section>

        {/* Merchant Center Entry */}
        <Card className="border-primary-container bg-primary-container/10 text-center">
          <Icon name="store" size={32} className="text-primary mb-2" />
          <h3 className="font-headline-md font-bold text-on-surface mb-1">Daftarkan Usaha & Pasang Iklan</h3>
          <p className="text-sm text-on-surface-variant mb-4">
            Jangkau ribuan traveler yang mencari keunikan lokal.
          </p>
          <Button variant="secondary" size="md" onClick={() => router.push('/register-merchant')}>Mulai Sekarang</Button>
        </Card>

        {/* Prominent Logout Button for Logged In Users */}
        {user && (
          <div className="pt-2">
            <Button
              variant="ghost"
              size="md"
              className="w-full border-error text-error hover:bg-error/10 flex items-center justify-center gap-2"
              onClick={handleLogout}
            >
              <Icon name="logout" size={20} /> Keluar
            </Button>
          </div>
        )}
      </section>
    </PageShell>
  );
}


