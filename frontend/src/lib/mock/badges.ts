import { Badge, Milestone, LeaderboardEntry } from '../types';
import { users } from './users';
import { regions } from './regions';

export const badges: Badge[] = [
  {
    id: 'b1',
    code: 'wanderlust',
    name: 'Wanderlust',
    description: '5 Kota Dikunjungi',
    icon: 'explore',
    criterionType: 'cities_visited',
    criterionValue: 5,
    unlocked: true,
    progress: 100,
  },
  {
    id: 'b2',
    code: 'visual-storyteller',
    name: 'Visual Storyteller',
    description: '50+ Foto Unggahan',
    icon: 'camera',
    criterionType: 'photos_uploaded',
    criterionValue: 50,
    unlocked: true,
    progress: 100,
  },
  {
    id: 'b3',
    code: 'local-hero',
    name: 'Lokal Hero',
    description: '10 review dengan rating tertinggi',
    icon: 'military_tech',
    criterionType: 'reviews_count',
    criterionValue: 10,
    unlocked: false,
    progress: 65,
  },
  {
    id: 'b4',
    code: 'hidden-gem-hunter',
    name: 'Hidden Gem Hunter',
    description: '15 hidden gem ditemukan',
    icon: 'diamond',
    criterionType: 'gems_submitted',
    criterionValue: 15,
    unlocked: false,
    progress: 40,
  },
  {
    id: 'b5',
    code: 'cultural-explorer',
    name: 'Cultural Explorer',
    description: 'Kunjungi 5 tempat budaya',
    icon: 'museum',
    criterionType: 'cities_visited',
    criterionValue: 5,
    unlocked: false,
    progress: 60,
  },
  {
    id: 'b6',
    code: 'food-hunter',
    name: 'Food Hunter',
    description: 'Cicipi 30 kuliner unik',
    icon: 'restaurant',
    criterionType: 'reviews_count',
    criterionValue: 30,
    unlocked: false,
    progress: 20,
  },
];

export const milestones: Milestone[] = [
  { id: 'ms1', title: 'Kunjungi 5 Pasar Tradisional', description: 'Kunjungi pasar tradisional di berbagai kota', targetCount: 5, progressCount: 3, xpReward: 100 },
  { id: 'ms2', title: 'Kirim 10 Ulasan Baru', description: 'Tulis ulasan untuk tempat yang dikunjungi', targetCount: 10, progressCount: 8, xpReward: 75 },
];

export const leaderboardEntries: LeaderboardEntry[] = [
  { id: 'le1', user: users[4], totalXp: 4280, rank: 1, region: regions[0], period: 'weekly' },
  { id: 'le2', user: users[1], totalXp: 4120, rank: 2, region: regions[0], period: 'weekly' },
  { id: 'le3', user: users[0], totalXp: 2450, rank: 3, region: regions[0], period: 'weekly', isCurrentUser: true },
  { id: 'le4', user: users[3], totalXp: 2310, rank: 4, region: regions[0], period: 'weekly' },
  { id: 'le5', user: users[2], totalXp: 2210, rank: 5, region: regions[0], period: 'weekly' },
];
