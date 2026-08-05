import { supabase } from '../lib/supabase';

export interface Level {
  id: string;
  number: number;
  name: string;
  xp_required: number;
}

export interface LeaderboardEntry {
  rank: number;
  id: string;
  name: string;
  avatar_url: string | null;
  region_id: string | null;
  total_xp: number;
  level: Level | null;
  reviews_count: number;
  approved_places_count: number;
}

export const getLeaderboard = async (regionId?: string): Promise<LeaderboardEntry[]> => {
  let usersQuery = supabase
    .from('users')
    .select('id, name, email, avatar_url, region_id, role, created_at');

  if (regionId) {
    usersQuery = usersQuery.eq('region_id', regionId);
  }

  const { data: users, error: usersError } = await usersQuery;

  if (usersError) {
    throw new Error(`Failed to fetch users for leaderboard: ${usersError.message}`);
  }

  if (!users || users.length === 0) {
    return [];
  }

  const { data: levels, error: levelsError } = await supabase
    .from('levels')
    .select('*')
    .order('xp_required', { ascending: false });

  if (levelsError) {
    throw new Error(`Failed to fetch levels: ${levelsError.message}`);
  }

  const userIds = users.map((u) => u.id);

  const { data: reviews, error: reviewsError } = await supabase
    .from('reviews')
    .select('user_id')
    .in('user_id', userIds);

  if (reviewsError) {
    throw new Error(`Failed to fetch reviews for leaderboard: ${reviewsError.message}`);
  }

  const { data: places, error: placesError } = await supabase
    .from('places')
    .select('owner_id')
    .eq('status', 'approved')
    .in('owner_id', userIds);

  if (placesError) {
    throw new Error(`Failed to fetch places for leaderboard: ${placesError.message}`);
  }

  const reviewCountMap: Record<string, number> = {};
  (reviews || []).forEach((r) => {
    if (r.user_id) {
      reviewCountMap[r.user_id] = (reviewCountMap[r.user_id] || 0) + 1;
    }
  });

  const placeCountMap: Record<string, number> = {};
  (places || []).forEach((p) => {
    if (p.owner_id) {
      placeCountMap[p.owner_id] = (placeCountMap[p.owner_id] || 0) + 1;
    }
  });

  const calculatedEntries = users.map((user) => {
    const reviewCount = reviewCountMap[user.id] || 0;
    const placeCount = placeCountMap[user.id] || 0;
    const totalXp = reviewCount * 10 + placeCount * 50;

    return {
      id: user.id,
      name: user.name,
      avatar_url: user.avatar_url || null,
      region_id: user.region_id || null,
      total_xp: totalXp,
      level: currentLevel((levels as Level[]) || [], totalXp),
      reviews_count: reviewCount,
      approved_places_count: placeCount,
    };
  });

  calculatedEntries.sort((a, b) => b.total_xp - a.total_xp);

  return calculatedEntries.slice(0, 10).map((entry, index) => ({
    rank: index + 1,
    ...entry,
  }));
};

const currentLevel = (levels: Level[], totalXp: number): Level | null => {
  return levels.find((lvl) => totalXp >= lvl.xp_required) || null;
};
