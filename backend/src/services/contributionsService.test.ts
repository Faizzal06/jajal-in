import { createContribution } from './contributionsService';
import { supabase } from '../lib/supabase';
import { uploadBase64ToStorage } from './storageService';

jest.mock('../lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

jest.mock('./storageService', () => ({
  uploadBase64ToStorage: jest.fn((input: string) => Promise.resolve(input)),
}));

describe('contributionsService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createContribution', () => {
    const userId = 'user-123';
    const payload = {
      name: 'Curug Hidden Gem',
      description: 'Air terjun tersembunyi yang sangat indah',
      lat: -6.9175,
      lng: 107.6191,
      regionId: 'region-456',
      categoryId: 'cat-789',
      media: ['http://example.com/photo1.jpg', 'http://example.com/photo2.jpg'],
    };

    it('should insert place into places table and media into place_media table', async () => {
      const mockPlaceSingle = jest.fn().mockResolvedValue({
        data: { id: 'place-abc' },
        error: null,
      });
      const mockPlaceSelect = jest.fn().mockReturnValue({ single: mockPlaceSingle });
      const mockPlaceInsert = jest.fn().mockReturnValue({ select: mockPlaceSelect });

      const mockMediaInsert = jest.fn().mockResolvedValue({ error: null });

      (supabase.from as jest.Mock).mockImplementation((table: string) => {
        if (table === 'places') {
          return { insert: mockPlaceInsert };
        }
        if (table === 'place_media') {
          return { insert: mockMediaInsert };
        }
        return {};
      });

      const result = await createContribution(userId, payload);

      expect(uploadBase64ToStorage).toHaveBeenCalledWith('http://example.com/photo1.jpg', 'place-media', 'contributions');
      expect(uploadBase64ToStorage).toHaveBeenCalledWith('http://example.com/photo2.jpg', 'place-media', 'contributions');

      expect(supabase.from).toHaveBeenCalledWith('places');
      expect(mockPlaceInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'gem',
          name: 'Curug Hidden Gem',
          description: payload.description,
          location: 'POINT(107.6191 -6.9175)',
          region_id: 'region-456',
          category_id: 'cat-789',
          owner_id: userId,
          status: 'pending',
        })
      );
      expect(supabase.from).toHaveBeenCalledWith('place_media');
      expect(mockMediaInsert).toHaveBeenCalledWith([
        { place_id: 'place-abc', media_type: 'image', url: 'http://example.com/photo1.jpg' },
        { place_id: 'place-abc', media_type: 'image', url: 'http://example.com/photo2.jpg' },
      ]);
      expect(result).toEqual({ id: 'place-abc' });
    });

    it('should upload base64 media to storage bucket and insert returned storage URLs', async () => {
      (uploadBase64ToStorage as jest.Mock).mockImplementation(async (item: string) =>
        item.startsWith('data:') ? 'https://example.supabase.co/storage/v1/object/public/place-media/contributions/file.jpg' : item
      );

      const payloadWithBase64 = {
        ...payload,
        media: ['data:image/jpeg;base64,dGVzdA=='],
      };

      const mockPlaceSingle = jest.fn().mockResolvedValue({
        data: { id: 'place-abc' },
        error: null,
      });
      const mockPlaceSelect = jest.fn().mockReturnValue({ single: mockPlaceSingle });
      const mockPlaceInsert = jest.fn().mockReturnValue({ select: mockPlaceSelect });
      const mockMediaInsert = jest.fn().mockResolvedValue({ error: null });

      (supabase.from as jest.Mock).mockImplementation((table: string) => {
        if (table === 'places') return { insert: mockPlaceInsert };
        if (table === 'place_media') return { insert: mockMediaInsert };
        return {};
      });

      const result = await createContribution(userId, payloadWithBase64);

      expect(uploadBase64ToStorage).toHaveBeenCalledWith(
        'data:image/jpeg;base64,dGVzdA==',
        'place-media',
        'contributions'
      );
      expect(mockMediaInsert).toHaveBeenCalledWith([
        {
          place_id: 'place-abc',
          media_type: 'image',
          url: 'https://example.supabase.co/storage/v1/object/public/place-media/contributions/file.jpg',
        },
      ]);
      expect(result).toEqual({ id: 'place-abc' });
    });

    it('should insert place without inserting media when media array is empty or omitted', async () => {
      const payloadNoMedia = {
        name: 'Curug Tanpa Media',
        description: 'Air terjun tanpa foto',
        lat: -6.9175,
        lng: 107.6191,
        regionId: 'region-456',
        categoryId: 'cat-789',
      };

      const mockPlaceSingle = jest.fn().mockResolvedValue({
        data: { id: 'place-xyz' },
        error: null,
      });
      const mockPlaceSelect = jest.fn().mockReturnValue({ single: mockPlaceSingle });
      const mockPlaceInsert = jest.fn().mockReturnValue({ select: mockPlaceSelect });

      (supabase.from as jest.Mock).mockImplementation((table: string) => {
        if (table === 'places') {
          return { insert: mockPlaceInsert };
        }
        return {};
      });

      const result = await createContribution(userId, payloadNoMedia);

      expect(supabase.from).toHaveBeenCalledWith('places');
      expect(supabase.from).not.toHaveBeenCalledWith('place_media');
      expect(result).toEqual({ id: 'place-xyz' });
    });

    it('should throw error when inserting place fails', async () => {
      const mockPlaceSingle = jest.fn().mockResolvedValue({
        data: null,
        error: { message: 'Database insert failed' },
      });
      const mockPlaceSelect = jest.fn().mockReturnValue({ single: mockPlaceSingle });
      const mockPlaceInsert = jest.fn().mockReturnValue({ select: mockPlaceSelect });

      (supabase.from as jest.Mock).mockImplementation((table: string) => {
        if (table === 'places') {
          return { insert: mockPlaceInsert };
        }
        return {};
      });

      await expect(createContribution(userId, payload)).rejects.toThrow('Database insert failed');
    });

    it('should throw error when inserting media fails', async () => {
      const mockPlaceSingle = jest.fn().mockResolvedValue({
        data: { id: 'place-abc' },
        error: null,
      });
      const mockPlaceSelect = jest.fn().mockReturnValue({ single: mockPlaceSingle });
      const mockPlaceInsert = jest.fn().mockReturnValue({ select: mockPlaceSelect });

      const mockMediaInsert = jest.fn().mockResolvedValue({
        error: { message: 'Media insert failed' },
      });

      (supabase.from as jest.Mock).mockImplementation((table: string) => {
        if (table === 'places') {
          return { insert: mockPlaceInsert };
        }
        if (table === 'place_media') {
          return { insert: mockMediaInsert };
        }
        return {};
      });

      await expect(createContribution(userId, payload)).rejects.toThrow('Media insert failed');
    });
  });
});

