import { supabase } from '../lib/supabase';

export interface UserProfileResponse {
  id: string;
  name: string;
  email: string;
  avatar_url: string | null;
  role: string;
  region_id: string | null;
  created_at: string;
  total_xp: number;
  level: {
    id: string;
    number: number;
    name: string;
    xp_required: number;
  } | null;
  reviews_count: number;
  approved_places_count: number;
}

export const getUserProfile = async (userId: string): Promise<UserProfileResponse> => {
  const { count: reviewsCount, error: reviewsError } = await supabase
    .from('reviews')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  if (reviewsError) {
    throw new Error(`Failed to count reviews: ${reviewsError.message}`);
  }

  const { count: approvedPlacesCount, error: placesError } = await supabase
    .from('places')
    .select('*', { count: 'exact', head: true })
    .eq('owner_id', userId)
    .eq('status', 'approved');

  if (placesError) {
    throw new Error(`Failed to count places: ${placesError.message}`);
  }

  const { data: levels, error: levelsError } = await supabase
    .from('levels')
    .select('*')
    .order('xp_required', { ascending: false });

  if (levelsError) {
    throw new Error(`Failed to fetch levels: ${levelsError.message}`);
  }

  let { data: user, error: userError } = await supabase
    .from('users')
    .select('id, email, name, avatar_url, role, region_id, created_at')
    .eq('id', userId)
    .single();

  if (userError || !user) {
    let authUser: any = null;
    if (supabase.auth && (supabase.auth as any).admin) {
      const authUserData = await (supabase.auth as any).admin.getUserById(userId).catch(() => ({ data: { user: null } }));
      authUser = authUserData?.data?.user || authUserData?.user;
    }

    const email = authUser?.email || `user_${userId.slice(0, 8)}@jajal.in`;
    const name = authUser?.user_metadata?.full_name || authUser?.user_metadata?.name || email.split('@')[0] || 'Penjelajah';
    const avatarUrl = authUser?.user_metadata?.avatar_url || null;

    const userTable = supabase.from('users');
    let newUser = null;
    if (userTable && typeof userTable.upsert === 'function') {
      const { data } = await userTable
        .upsert({
          id: userId,
          email,
          name,
          avatar_url: avatarUrl,
          role: 'user',
        })
        .select('id, email, name, avatar_url, role, region_id, created_at')
        .single();
      newUser = data;
    }

    if (!newUser) {
      const error: any = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }
    user = newUser;
  }

  const reviews = reviewsCount || 0;
  const approvedPlaces = approvedPlacesCount || 0;
  const totalXp = reviews * 10 + approvedPlaces * 50;

  const currentLevel = (levels || []).find((l) => totalXp >= l.xp_required) || null;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatar_url: user.avatar_url || null,
    role: user.role,
    region_id: user.region_id || null,
    created_at: user.created_at,
    total_xp: totalXp,
    level: currentLevel,
    reviews_count: reviews,
    approved_places_count: approvedPlaces,
  };
};
