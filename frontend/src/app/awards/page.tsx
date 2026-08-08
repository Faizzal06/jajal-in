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
            <Card className="bg-slate-heavy text-white border-none !p-xl">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className="inline-block bg-primary-container text-on-primary-container text-xs font-bold px-3 py-1 rounded-full mb-2">
                    Level {currentUser.level.number}
                  </span>
                  <h2 className="font-headline-lg text-white font-bold text-2xl">{currentUser.level.name}</h2>
                </div>
                <div className="flex items-center gap-1 bg-white/10 rounded-full px-4 py-2">
                  <Icon name="stars" size={20} filled className="text-primary-container" />
                  <span className="font-bold">{currentXp.toLocaleString()} XP</span>
                </div>
              </div>
              <div className="mb-2">
                <div className="flex justify-between text-sm text-white/70 mb-1">
                  <span>Pangkat Berikutnya: {nextLevel.name}</span>
                  <span>{progress}% Selesai</span>
                </div>
                <ProgressBar value={currentXp} max={nextXp} barClassName="bg-primary-container" showGlow />
              </div>
              <p className="text-xs text-white/50">
                Dapatkan {nextXp - currentXp} XP lagi untuk naik level!
              </p>
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

