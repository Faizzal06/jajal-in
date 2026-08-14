import {
  getAddressFromCoordinates,
  getDetailedAddressFromCoordinates,
  normalizeRegencyName,
  resolveRegionFromCoordinates,
} from './geocoding';
import { supabase } from '../lib/supabase';

jest.mock('../lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

describe('geocoding utility', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.clearAllMocks();
  });

  describe('normalizeRegencyName', () => {
    it('should normalize English regency format', () => {
      expect(normalizeRegencyName('Gunung Kidul Regency')).toBe('Kabupaten Gunungkidul');
      expect(normalizeRegencyName('Sleman Regency')).toBe('Kabupaten Sleman');
      expect(normalizeRegencyName('Badung Regency')).toBe('Kabupaten Badung');
    });

    it('should normalize City format', () => {
      expect(normalizeRegencyName('City of Yogyakarta')).toBe('Kota Yogyakarta');
      expect(normalizeRegencyName('Pekalongan City')).toBe('Kota Pekalongan');
    });

    it('should preserve already formatted Indonesian names', () => {
      expect(normalizeRegencyName('Kota Pekalongan')).toBe('Kota Pekalongan');
      expect(normalizeRegencyName('Kabupaten Bantul')).toBe('Kabupaten Bantul');
    });
  });

  describe('getAddressFromCoordinates', () => {
    it('should return display_name when Nominatim API responds successfully', async () => {
      const mockAddress = 'Monumen Nasional, Jalan Medan Merdeka Barat, Gambir, Jakarta Pusat, DKI Jakarta, 10110, Indonesia';

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          display_name: mockAddress,
        }),
      } as Response);

      const address = await getAddressFromCoordinates(-6.175392, 106.827153);
      expect(address).toBe(mockAddress);
    });

    it('should return null when Nominatim API returns non-200 status', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
      } as Response);

      const address = await getAddressFromCoordinates(-6.175392, 106.827153);
      expect(address).toBeNull();
    });

    it('should return null when fetch throws an error', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

      const address = await getAddressFromCoordinates(-6.175392, 106.827153);
      expect(address).toBeNull();
    });
  });

  describe('getDetailedAddressFromCoordinates', () => {
    it('should extract displayName, cityOrRegency, and province', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          display_name: 'Malioboro, Kota Yogyakarta, Daerah Istimewa Yogyakarta, Indonesia',
          address: {
            city: 'Kota Yogyakarta',
            state: 'Daerah Istimewa Yogyakarta',
          },
        }),
      } as Response);

      const result = await getDetailedAddressFromCoordinates(-7.7956, 110.3695);
      expect(result).toEqual({
        displayName: 'Malioboro, Kota Yogyakarta, Daerah Istimewa Yogyakarta, Indonesia',
        cityOrRegency: 'Kota Yogyakarta',
        province: 'Daerah Istimewa Yogyakarta',
      });
    });

    it('should extract county when city is absent', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          display_name: 'Gua Jomblang, Gunung Kidul Regency, DI Yogyakarta',
          address: {
            county: 'Gunung Kidul Regency',
            state: 'DI Yogyakarta',
          },
        }),
      } as Response);

      const result = await getDetailedAddressFromCoordinates(-8.0286, 110.6384);
      expect(result.cityOrRegency).toBe('Kabupaten Gunungkidul');
    });
  });

  describe('resolveRegionFromCoordinates', () => {
    it('should resolve matching region_id from database based on regency', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          display_name: 'Pekalongan, Jawa Tengah',
          address: {
            city: 'Kota Pekalongan',
            state: 'Jawa Tengah',
          },
        }),
      } as Response);

      const mockMaybeSingle = jest.fn().mockResolvedValue({
        data: { id: '11111111-1111-1111-1111-111111111111' },
        error: null,
      });
      const mockIlike = jest.fn().mockReturnValue({ maybeSingle: mockMaybeSingle });
      const mockSelect = jest.fn().mockReturnValue({ ilike: mockIlike });
      (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

      const regionId = await resolveRegionFromCoordinates(-6.8898, 109.6753);
      expect(regionId).toBe('11111111-1111-1111-1111-111111111111');
    });
  });
});
