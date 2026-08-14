import { getRegions } from './regionsService';
import { supabase } from '../lib/supabase';

jest.mock('../lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

describe('regionsService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getRegions', () => {
    it('should fetch all regions with parent relation by default', async () => {
      const mockOrder = jest.fn().mockResolvedValue({
        data: [
          { id: '1', name: 'Kota Pekalongan', slug: 'pekalongan', parent_id: 'p1', parent: { id: 'p1', name: 'Jawa Tengah', slug: 'prov-jawa-tengah' } },
        ],
        error: null,
      });
      const mockSelect = jest.fn().mockReturnValue({ order: mockOrder });
      (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

      const result = await getRegions();

      expect(supabase.from).toHaveBeenCalledWith('regions');
      expect(mockSelect).toHaveBeenCalledWith('*, parent:parent_id(id, name, slug)');
      expect(mockOrder).toHaveBeenCalledWith('name', { ascending: true });
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Kota Pekalongan');
    });

    it('should filter by parentId when provided', async () => {
      const mockOrder = jest.fn().mockResolvedValue({
        data: [{ id: '1', name: 'Kota Yogyakarta', slug: 'kota-yogyakarta', parent_id: 'p-diy' }],
        error: null,
      });
      const mockEq = jest.fn().mockReturnValue({ order: mockOrder });
      const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
      (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

      const result = await getRegions({ parentId: 'p-diy' });

      expect(mockEq).toHaveBeenCalledWith('parent_id', 'p-diy');
      expect(result).toHaveLength(1);
    });

    it('should filter by type=province (parent_id IS NULL)', async () => {
      const mockOrder = jest.fn().mockResolvedValue({
        data: [{ id: 'p1', name: 'DI Yogyakarta', slug: 'prov-di-yogyakarta', parent_id: null }],
        error: null,
      });
      const mockIs = jest.fn().mockReturnValue({ order: mockOrder });
      const mockSelect = jest.fn().mockReturnValue({ is: mockIs });
      (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

      const result = await getRegions({ type: 'province' });

      expect(mockIs).toHaveBeenCalledWith('parent_id', null);
      expect(result).toHaveLength(1);
    });

    it('should filter by type=regency (parent_id IS NOT NULL)', async () => {
      const mockOrder = jest.fn().mockResolvedValue({
        data: [{ id: 'r1', name: 'Kabupaten Sleman', slug: 'kabupaten-sleman', parent_id: 'p-diy' }],
        error: null,
      });
      const mockNot = jest.fn().mockReturnValue({ order: mockOrder });
      const mockSelect = jest.fn().mockReturnValue({ not: mockNot });
      (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

      const result = await getRegions({ type: 'regency' });

      expect(mockNot).toHaveBeenCalledWith('parent_id', 'is', null);
      expect(result).toHaveLength(1);
    });

    it('should return grouped regions when grouped=true', async () => {
      const mockOrder = jest.fn().mockResolvedValue({
        data: [
          { id: 'p1', name: 'DI Yogyakarta', slug: 'prov-di-yogyakarta', parent_id: null },
          { id: 'r1', name: 'Kota Yogyakarta', slug: 'kota-yogyakarta', parent_id: 'p1' },
          { id: 'r2', name: 'Kabupaten Sleman', slug: 'kabupaten-sleman', parent_id: 'p1' },
        ],
        error: null,
      });
      const mockSelect = jest.fn().mockReturnValue({ order: mockOrder });
      (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

      const result = await getRegions({ grouped: true });

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('DI Yogyakarta');
      expect((result[0] as any).regencies).toHaveLength(2);
      expect((result[0] as any).regencies[0].name).toBe('Kota Yogyakarta');
    });

    it('should throw an error if database query fails', async () => {
      const mockOrder = jest.fn().mockResolvedValue({
        data: null,
        error: { message: 'Database query failed' },
      });
      const mockSelect = jest.fn().mockReturnValue({ order: mockOrder });
      (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

      await expect(getRegions()).rejects.toThrow('Failed to fetch regions: Database query failed');
    });
  });
});
