'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PageShell from '@/components/layout/PageShell';
import Icon from '@/components/ui/Icon';
import ProgressBar from '@/components/ui/ProgressBar';
import Card from '@/components/ui/Card';
import Desk from '@/components/ui/Desk';
import Button from '@/components/ui/Button';
import { badges, milestones, leaderboardEntries } from '@/lib/mock/badges';
import { users } from '@/lib/mock/users';
import { awardsApi, LeaderboardResponse } from '@/lib/api-client';
import { useAuth } from '@/lib/context/AuthContext';
import Loading from '@/app/loading';

const currentUser = users[0];

export default function AwardsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [pageReady, setPageReady] = useState(false);
  const [apiLeaderboard, setApiLeaderboard] = useState<LeaderboardResponse[]>([]);
  const [, setLbLoading] = useState(true);

  useEffect(() => {
    awardsApi.getLeaderboard()
      .then((data) => setApiLeaderboard(data))
      .catch(() => {})
      .finally(() => setLbLoading(false));
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setPageReady(true), 1000);
    return () => clearTimeout(t);
  }, []);

  if (!pageReady) {
    return (
      <PageShell title="Jajal.in">
        <div className="py-lg">
          <Loading />
        </div>
      </PageShell>
    );
  }

  const nextLevel = { name: 'Elite Explorer', xpRequired: 4000 };
  const currentXp = currentUser.totalXp;
  const nextXp = nextLevel.xpRequired;
  const progress = Math.round((currentXp / nextXp) * 100);

  return (
    <PageShell title="Jajal.in">
      <section className="space-y-xl py-lg">
        {/* Guest Banner for Unauthenticated Users */}
        {!user && (
          <Card className="bg-primary-container/20 border-primary-container flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center shrink-0">
                <Icon name="military_tech" size={24} className="text-on-primary-container" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-on-surface">Ingin Membuka Lencana & XP?</h4>
                <p className="text-xs text-on-surface-variant">
                  Masuk dengan akun Google kamu untuk mengumpulkan lencana pencapaian dan menaikkan level traveler.
                </p>
              </div>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => router.push('/login?redirect=/awards')}
              className="w-full sm:w-auto shrink-0"
            >
              Masuk / Daftar
            </Button>
          </Card>
        )}

        {/* Authenticated User Stats & Badges */}
        {user && (
          <>
            {/* Hero Level Card */}
            <Card className="bg-slate-heavy text-white border-none !p-xl relative overflow-hidden group">
              {/* Deep Base + Faded Background Iconography */}
              <div className="absolute inset-0 bg-gradient-to-br from-black/30 via-slate-heavy to-black/20 pointer-events-none" />
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <Icon name="military_tech" size={130} filled className="absolute -top-6 -right-6 text-white/[0.03] rotate-12" />
                <Icon name="emoji_events" size={95} filled className="absolute -bottom-5 -left-5 text-white/[0.03] -rotate-12" />
                <Icon name="stars" size={60} filled className="absolute top-1/2 right-8 text-white/[0.03]" />
              </div>
              <div className="absolute top-0 left-0 w-64 h-64 bg-primary-container/10 blur-[90px] -ml-24 -mt-24 pointer-events-none" />

              <div className="relative z-10 flex flex-col items-center text-center gap-5">
                {/* Level Chip */}
                <span className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white/90">
                  <Icon name="military_tech" size={12} filled className="text-primary-container" />
                  Level {currentUser.level.number}
                </span>

                {/* Glowing Trophy Icon */}
                <div className="relative mt-1">
                  <div className="absolute inset-0 rounded-full bg-primary-container/25 blur-2xl scale-150" />
                  <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-primary-container via-primary-container/70 to-primary/60 flex items-center justify-center border-2 border-white/25 shadow-[0_0_40px_rgba(163,230,53,0.45)]">
                    <Icon name="emoji_events" size={40} filled className="text-on-primary-container drop-shadow-[0_0_10px_rgba(163,230,53,0.6)]" />
                  </div>
                </div>

                {/* Typography */}
                <div className="space-y-1.5">
                  <h2 className="font-headline-lg text-white font-bold text-2xl tracking-tight leading-none">
                    {currentUser.level.name}
                  </h2>
                  <p className="text-white/70 text-sm max-w-[34ch] leading-relaxed">
                    Dapatkan {(nextXp - currentXp).toLocaleString()} XP lagi untuk naik ke {nextLevel.name}.
                  </p>
                </div>

                {/* XP Progress */}
                <div className="w-full max-w-xs">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] uppercase font-bold text-white/60 tracking-widest">Menuju {nextLevel.name}</span>
                    <span className="text-[11px] font-mono font-semibold text-white">{currentXp.toLocaleString()} / {nextXp.toLocaleString()}</span>
                  </div>
                  <div className="h-1.5 bg-white/15 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #bef264 0%, #a3e635 50%, #65a30d 100%)' }}
                    />
                  </div>
                </div>

                {/* CTA Button */}
                <Button variant="primary" size="sm" className="group/btn mt-1 hover:scale-[1.03] active:scale-[0.97]">
                  Lihat Papan Peringkat
                  <Icon
                    name="arrow_forward"
                    size={16}
                    className="text-on-primary-container transition-transform duration-200 group-hover/btn:translate-x-0.5"
                  />
                </Button>
              </div>
            </Card>

            {/* Badge Collection */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-headline-md text-on-surface font-bold text-lg">Lencana Koleksi</h3>
                <button className="text-sm text-primary font-medium hover:underline">Lihat Semua</button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {badges.slice(0, 4).map((badge) => (
                  <Card key={badge.id} className="flex flex-col items-center text-center gap-2 hover:border-primary-container transition-colors">
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center ${badge.unlocked ? 'bg-primary-container' : 'bg-[#E5E7EB]'}`}>
                      <Icon name={badge.icon} size={28} className={badge.unlocked ? 'text-on-primary-container' : 'text-on-surface-variant/50'} filled />
                    </div>
                    <h4 className="font-bold text-sm text-on-surface">{badge.name}</h4>
                    <p className="text-xs text-on-surface-variant">{badge.description}</p>
                    {!badge.unlocked && (
                      <span className="text-[10px] font-medium text-on-surface-variant/60 bg-[#E5E7EB] px-2 py-0.5 rounded-full">
                        Terkunci
                      </span>
                    )}
                  </Card>
                ))}
              </div>
            </section>

            {/* Target Mendatang */}
            <section>
              <h3 className="font-headline-md text-on-surface font-bold text-lg mb-4">Target Mendatang</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {milestones.map((ms) => (
                  <Card key={ms.id} className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary-container/30 flex items-center justify-center shrink-0">
                      <Icon name="flag" size={24} className="text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm text-on-surface mb-1">{ms.title}</h4>
                      <ProgressBar value={ms.progressCount} max={ms.targetCount} barClassName="bg-primary-container" />
                      <p className="text-xs text-on-surface-variant mt-0.5">{ms.progressCount}/{ms.targetCount}</p>
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          </>
        )}

        {/* Leaderboard */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-headline-md text-on-surface font-bold text-lg">Papan Peringkat</h3>
            <span className="text-xs text-on-surface-variant bg-[#E5E7EB] px-3 py-1 rounded-full">Mingguan</span>
          </div>
          <Desk className="divide-y divide-outline-variant !p-0">
            {apiLeaderboard.length > 0
              ? apiLeaderboard.map((entry) => (
                  <div key={entry.id} className={`flex items-center gap-4 p-lg`}>
                    <span className={`w-8 text-center font-bold text-sm ${entry.rank <= 3 ? 'text-primary' : 'text-on-surface-variant'}`}>
                      #{entry.rank}
                    </span>
                    <div className="w-10 h-10 rounded-full bg-surface-dim border-2 border-outline-variant flex items-center justify-center overflow-hidden shrink-0">
                      <Icon name="person" size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm truncate text-on-surface">{entry.name}</p>
                      <p className="text-xs text-on-surface-variant">{entry.level?.name ?? 'Explorer'}</p>
                    </div>
                    <span className="font-bold text-sm text-on-surface">{entry.total_xp.toLocaleString()} XP</span>
                  </div>
                ))
              : leaderboardEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className={`flex items-center gap-4 p-lg ${entry.isCurrentUser ? 'bg-primary-container/20' : ''}`}
                  >
                    <span className={`w-8 text-center font-bold text-sm ${entry.rank <= 3 ? 'text-primary' : 'text-on-surface-variant'}`}>
                      #{entry.rank}
                    </span>
                    <div className="w-10 h-10 rounded-full bg-surface-dim border-2 border-outline-variant flex items-center justify-center overflow-hidden shrink-0">
                      <Icon name="person" size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-bold text-sm truncate ${entry.isCurrentUser ? 'text-primary' : 'text-on-surface'}`}>
                        {entry.user.name} {entry.isCurrentUser ? '(Kamu)' : ''}
                      </p>
                      <p className="text-xs text-on-surface-variant">{entry.user.title}</p>
                    </div>
                    <span className="font-bold text-sm text-on-surface">{entry.totalXp.toLocaleString()} XP</span>
                  </div>
                ))}
          </Desk>
          <div className="mt-4 text-center">
            <Button variant="ghost" size="sm">Lihat Papan Peringkat Lengkap</Button>
          </div>
        </section>
      </section>
    </PageShell>
  );
}

