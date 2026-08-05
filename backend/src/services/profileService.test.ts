import { getUserProfile } from './profileService';
import { supabase } from '../lib/supabase';

jest.mock('../lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

describe('profileService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserProfile', () => {
    const userId = 'user-123';
    const mockUser = {
      id: userId,
      email: 'traveler@example.com',
      name: 'Budi Explorer',
      avatar_url: 'http://example.com/avatar.jpg',
      role: 'user',
      region_id: 'region-456',
      created_at: '2026-01-01T00:00:00Z',
    };

    const mockLevels = [
      { id: 'lvl-3', number: 3, name: 'Master Explorer', xp_required: 500 },
      { id: 'lvl-2', number: 2, name: 'Avid Traveler', xp_required: 100 },
      { id: 'lvl-1', number: 1, name: 'Novice Explorer', xp_required: 0 },
    ];

    it('should calculate dynamic XP correctly and return complete profile with level', async () => {
      // Setup mock queries
      // 1. Reviews count = 2 (20 XP)
      const mockReviewsEq = jest.fn().mockResolvedValue({ count: 2, error: null });
      const mockReviewsSelect = jest.fn().mockReturnValue({ eq: mockReviewsEq });

      // 2. Places count = 3 approved places (150 XP) -> Total 170 XP
      const mockPlacesEqStatus = jest.fn().mockResolvedValue({ count: 3, error: null });
      const mockPlacesEqOwner = jest.fn().mockReturnValue({ eq: mockPlacesEqStatus });
      const mockPlacesSelect = jest.fn().mockReturnValue({ eq: mockPlacesEqOwner });

      // 3. Levels query
      const mockLevelsOrder = jest.fn().mockResolvedValue({ data: mockLevels, error: null });
      const mockLevelsSelect = jest.fn().mockReturnValue({ order: mockLevelsOrder });

      // 4. Users query
      const mockUserSingle = jest.fn().mockResolvedValue({ data: mockUser, error: null });
      const mockUserEq = jest.fn().mockReturnValue({ single: mockUserSingle });
      const mockUserSelect = jest.fn().mockReturnValue({ eq: mockUserEq });

      (supabase.from as jest.Mock).mockImplementation((table: string) => {
        if (table === 'reviews') return { select: mockReviewsSelect };
        if (table === 'places') return { select: mockPlacesSelect };
        if (table === 'levels') return { select: mockLevelsSelect };
        if (table === 'users') return { select: mockUserSelect };
        return {};
      });

      const profile = await getUserProfile(userId);

      expect(supabase.from).toHaveBeenCalledWith('reviews');
      expect(mockReviewsSelect).toHaveBeenCalledWith('*', { count: 'exact', head: true });
      expect(mockReviewsEq).toHaveBeenCalledWith('user_id', userId);

      expect(supabase.from).toHaveBeenCalledWith('places');
      expect(mockPlacesEqOwner).toHaveBeenCalledWith('owner_id', userId);
      expect(mockPlacesEqStatus).toHaveBeenCalledWith('status', 'approved');

      expect(profile).toEqual({
        id: userId,
        name: 'Budi Explorer',
        email: 'traveler@example.com',
        avatar_url: 'http://example.com/avatar.jpg',
        role: 'user',
        region_id: 'region-456',
        created_at: '2026-01-01T00:00:00Z',
        total_xp: 170,
        level: mockLevels[1], // Avid Traveler (xp_required: 100)
        reviews_count: 2,
        approved_places_count: 3,
      });
    });

    it('should handle 0 reviews and 0 approved places, assigning lowest level', async () => {
      const mockReviewsEq = jest.fn().mockResolvedValue({ count: 0, error: null });
      const mockReviewsSelect = jest.fn().mockReturnValue({ eq: mockReviewsEq });

      const mockPlacesEqStatus = jest.fn().mockResolvedValue({ count: 0, error: null });
      const mockPlacesEqOwner = jest.fn().mockReturnValue({ eq: mockPlacesEqStatus });
      const mockPlacesSelect = jest.fn().mockReturnValue({ eq: mockPlacesEqOwner });

      const mockLevelsOrder = jest.fn().mockResolvedValue({ data: mockLevels, error: null });
      const mockLevelsSelect = jest.fn().mockReturnValue({ order: mockLevelsOrder });

      const mockUserSingle = jest.fn().mockResolvedValue({ data: mockUser, error: null });
      const mockUserEq = jest.fn().mockReturnValue({ single: mockUserSingle });
      const mockUserSelect = jest.fn().mockReturnValue({ eq: mockUserEq });

      (supabase.from as jest.Mock).mockImplementation((table: string) => {
        if (table === 'reviews') return { select: mockReviewsSelect };
        if (table === 'places') return { select: mockPlacesSelect };
        if (table === 'levels') return { select: mockLevelsSelect };
        if (table === 'users') return { select: mockUserSelect };
        return {};
      });

      const profile = await getUserProfile(userId);

      expect(profile.total_xp).toBe(0);
      expect(profile.level).toEqual(mockLevels[2]); // Novice Explorer (xp_required: 0)
      expect(profile.reviews_count).toBe(0);
      expect(profile.approved_places_count).toBe(0);
    });

    it('should throw 404 error when user is not found', async () => {
      const mockReviewsEq = jest.fn().mockResolvedValue({ count: 0, error: null });
      const mockReviewsSelect = jest.fn().mockReturnValue({ eq: mockReviewsEq });

      const mockPlacesEqStatus = jest.fn().mockResolvedValue({ count: 0, error: null });
      const mockPlacesEqOwner = jest.fn().mockReturnValue({ eq: mockPlacesEqStatus });
      const mockPlacesSelect = jest.fn().mockReturnValue({ eq: mockPlacesEqOwner });

      const mockLevelsOrder = jest.fn().mockResolvedValue({ data: mockLevels, error: null });
      const mockLevelsSelect = jest.fn().mockReturnValue({ order: mockLevelsOrder });

      const mockUserSingle = jest.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } });
      const mockUserEq = jest.fn().mockReturnValue({ single: mockUserSingle });
      const mockUserSelect = jest.fn().mockReturnValue({ eq: mockUserEq });

      (supabase.from as jest.Mock).mockImplementation((table: string) => {
        if (table === 'reviews') return { select: mockReviewsSelect };
        if (table === 'places') return { select: mockPlacesSelect };
        if (table === 'levels') return { select: mockLevelsSelect };
        if (table === 'users') return { select: mockUserSelect };
        return {};
      });

      await expect(getUserProfile('non-existent')).rejects.toThrow('User not found');
    });

    it('should throw error when database query for reviews fails', async () => {
      const mockReviewsEq = jest.fn().mockResolvedValue({ count: null, error: { message: 'DB error' } });
      const mockReviewsSelect = jest.fn().mockReturnValue({ eq: mockReviewsEq });

      (supabase.from as jest.Mock).mockImplementation((table: string) => {
        if (table === 'reviews') return { select: mockReviewsSelect };
        return {};
      });

      await expect(getUserProfile(userId)).rejects.toThrow('Failed to count reviews: DB error');
    });
  });
});
