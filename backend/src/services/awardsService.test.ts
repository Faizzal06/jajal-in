import { getLeaderboard } from './awardsService';
import { supabase } from '../lib/supabase';

jest.mock('../lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

describe('awardsService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getLeaderboard', () => {
    const mockLevels = [
      { id: 'lvl-3', number: 3, name: 'Master Explorer', xp_required: 500 },
      { id: 'lvl-2', number: 2, name: 'Avid Traveler', xp_required: 100 },
      { id: 'lvl-1', number: 1, name: 'Novice Explorer', xp_required: 0 },
    ];

    const mockUsers = [
      { id: 'user-1', name: 'Alice', avatar_url: 'http://example.com/alice.jpg', region_id: 'region-1' },
      { id: 'user-2', name: 'Bob', avatar_url: 'http://example.com/bob.jpg', region_id: 'region-1' },
      { id: 'user-3', name: 'Charlie', avatar_url: null, region_id: 'region-2' },
    ];

    it('should return top 10 leaderboard entries sorted by dynamic total_xp descending with ranks', async () => {
      // User 1: 5 reviews (50 XP), 2 places (100 XP) -> 150 XP
      // User 2: 1 review (10 XP), 5 places (250 XP) -> 260 XP
      // User 3: 0 reviews (0 XP), 0 places (0 XP) -> 0 XP

      const mockUsersSelect = jest.fn().mockResolvedValue({ data: mockUsers, error: null });

      const mockLevelsOrder = jest.fn().mockResolvedValue({ data: mockLevels, error: null });
      const mockLevelsSelect = jest.fn().mockReturnValue({ order: mockLevelsOrder });

      const mockReviewsIn = jest.fn().mockResolvedValue({
        data: [
          { user_id: 'user-1' }, { user_id: 'user-1' }, { user_id: 'user-1' }, { user_id: 'user-1' }, { user_id: 'user-1' },
          { user_id: 'user-2' },
        ],
        error: null,
      });
      const mockReviewsSelect = jest.fn().mockReturnValue({ in: mockReviewsIn });

      const mockPlacesIn = jest.fn().mockResolvedValue({
        data: [
          { owner_id: 'user-1' }, { owner_id: 'user-1' },
          { owner_id: 'user-2' }, { owner_id: 'user-2' }, { owner_id: 'user-2' }, { owner_id: 'user-2' }, { owner_id: 'user-2' },
        ],
        error: null,
      });
      const mockPlacesEqStatus = jest.fn().mockReturnValue({ in: mockPlacesIn });
      const mockPlacesSelect = jest.fn().mockReturnValue({ eq: mockPlacesEqStatus });

      (supabase.from as jest.Mock).mockImplementation((table: string) => {
        if (table === 'users') return { select: mockUsersSelect };
        if (table === 'levels') return { select: mockLevelsSelect };
        if (table === 'reviews') return { select: mockReviewsSelect };
        if (table === 'places') return { select: mockPlacesSelect };
        return {};
      });

      const leaderboard = await getLeaderboard();

      expect(supabase.from).toHaveBeenCalledWith('users');
      expect(leaderboard).toHaveLength(3);

      // Rank 1: User 2 (260 XP)
      expect(leaderboard[0]).toEqual({
        rank: 1,
        id: 'user-2',
        name: 'Bob',
        avatar_url: 'http://example.com/bob.jpg',
        region_id: 'region-1',
        total_xp: 260,
        level: mockLevels[1], // Avid Traveler (xp_required: 100)
        reviews_count: 1,
        approved_places_count: 5,
      });

      // Rank 2: User 1 (150 XP)
      expect(leaderboard[1]).toEqual({
        rank: 2,
        id: 'user-1',
        name: 'Alice',
        avatar_url: 'http://example.com/alice.jpg',
        region_id: 'region-1',
        total_xp: 150,
        level: mockLevels[1],
        reviews_count: 5,
        approved_places_count: 2,
      });

      // Rank 3: User 3 (0 XP)
      expect(leaderboard[2]).toEqual({
        rank: 3,
        id: 'user-3',
        name: 'Charlie',
        avatar_url: null,
        region_id: 'region-2',
        total_xp: 0,
        level: mockLevels[2], // Novice Explorer (xp_required: 0)
        reviews_count: 0,
        approved_places_count: 0,
      });
    });

    it('should filter users by regionId if provided', async () => {
      const mockUsersEq = jest.fn().mockResolvedValue({ data: [mockUsers[0], mockUsers[1]], error: null });
      const mockUsersSelect = jest.fn().mockReturnValue({ eq: mockUsersEq });

      const mockLevelsOrder = jest.fn().mockResolvedValue({ data: mockLevels, error: null });
      const mockLevelsSelect = jest.fn().mockReturnValue({ order: mockLevelsOrder });

      const mockReviewsIn = jest.fn().mockResolvedValue({ data: [], error: null });
      const mockReviewsSelect = jest.fn().mockReturnValue({ in: mockReviewsIn });

      const mockPlacesIn = jest.fn().mockResolvedValue({ data: [], error: null });
      const mockPlacesEqStatus = jest.fn().mockReturnValue({ in: mockPlacesIn });
      const mockPlacesSelect = jest.fn().mockReturnValue({ eq: mockPlacesEqStatus });

      (supabase.from as jest.Mock).mockImplementation((table: string) => {
        if (table === 'users') return { select: mockUsersSelect };
        if (table === 'levels') return { select: mockLevelsSelect };
        if (table === 'reviews') return { select: mockReviewsSelect };
        if (table === 'places') return { select: mockPlacesSelect };
        return {};
      });

      const leaderboard = await getLeaderboard('region-1');

      expect(mockUsersSelect).toHaveBeenCalledWith('id, name, email, avatar_url, region_id, role, created_at');
      expect(mockUsersEq).toHaveBeenCalledWith('region_id', 'region-1');
      expect(leaderboard).toHaveLength(2);
    });

    it('should return empty array if no users found', async () => {
      const mockUsersSelect = jest.fn().mockResolvedValue({ data: [], error: null });

      (supabase.from as jest.Mock).mockImplementation((table: string) => {
        if (table === 'users') return { select: mockUsersSelect };
        return {};
      });

      const leaderboard = await getLeaderboard();
      expect(leaderboard).toEqual([]);
    });

    it('should throw error when users DB query fails', async () => {
      const mockUsersSelect = jest.fn().mockResolvedValue({ data: null, error: { message: 'Database error' } });

      (supabase.from as jest.Mock).mockImplementation((table: string) => {
        if (table === 'users') return { select: mockUsersSelect };
        return {};
      });

      await expect(getLeaderboard()).rejects.toThrow('Failed to fetch users for leaderboard: Database error');
    });
  });
});
