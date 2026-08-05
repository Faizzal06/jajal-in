import { getExploreFeed, getExploreMap } from './exploreService';
import { supabase } from '../lib/supabase';

jest.mock('../lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
    rpc: jest.fn(),
  },
}));

describe('exploreService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getExploreFeed', () => {
    it('should query approved places ordered by is_sponsored descending with limit 20', async () => {
      const mockData = [{ id: '1', name: 'Place 1' }];
      const mockLimit = jest.fn().mockResolvedValue({ data: mockData, error: null });
      const mockOrder = jest.fn().mockReturnValue({ limit: mockLimit });
      const mockEq = jest.fn().mockReturnValue({ order: mockOrder });
      const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
      (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

      const result = await getExploreFeed();

      expect(supabase.from).toHaveBeenCalledWith('places');
      expect(mockSelect).toHaveBeenCalledWith('*, regions(name), categories(name, icon)');
      expect(mockEq).toHaveBeenCalledWith('status', 'approved');
      expect(mockOrder).toHaveBeenCalledWith('is_sponsored', { ascending: false });
      expect(mockLimit).toHaveBeenCalledWith(20);
      expect(result).toEqual(mockData);
    });

    it('should throw an error when supabase returns error', async () => {
      const mockLimit = jest.fn().mockResolvedValue({ data: null, error: { message: 'Database error' } });
      const mockOrder = jest.fn().mockReturnValue({ limit: mockLimit });
      const mockEq = jest.fn().mockReturnValue({ order: mockOrder });
      const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
      (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

      await expect(getExploreFeed()).rejects.toThrow('Database error');
    });
  });

  describe('getExploreMap', () => {
    it('should call get_places_within_radius RPC with lat, lng, and radius', async () => {
      const mockData = [{ id: '1', name: 'Nearby Place' }];
      (supabase.rpc as jest.Mock).mockResolvedValue({ data: mockData, error: null });

      const result = await getExploreMap(-6.2, 106.8, 5000);

      expect(supabase.rpc).toHaveBeenCalledWith('get_places_within_radius', {
        user_lat: -6.2,
        user_lon: 106.8,
        radius_meters: 5000,
      });
      expect(result).toEqual(mockData);
    });

    it('should throw an error when RPC returns error', async () => {
      (supabase.rpc as jest.Mock).mockResolvedValue({ data: null, error: { message: 'RPC error' } });

      await expect(getExploreMap(-6.2, 106.8, 5000)).rejects.toThrow('RPC error');
    });
  });
});
