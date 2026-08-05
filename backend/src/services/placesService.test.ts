import { getPlaceById } from './placesService';
import { supabase } from '../lib/supabase';

jest.mock('../lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

describe('placesService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getPlaceById', () => {
    it('should query places table with joined relations for the specified id using single()', async () => {
      const mockPlace = {
        id: 'place-123',
        name: 'Warung Kopi Hidden Gem',
        regions: { name: 'Bandung', slug: 'bandung' },
        categories: { name: 'Kuliner', icon: 'coffee', applicable_to: 'all' },
        place_media: [{ url: 'http://example.com/img.jpg', media_type: 'image', caption: 'Depan' }],
        audio_stories: [{ title: 'Sejarah Kopi', narrator: 'Budi', duration: 120, url: 'http://example.com/audio.mp3' }],
        products: [{ id: 'prod-1', name: 'Kopi Tubruk', price: 15000, description: 'Mantap', image_url: 'http://example.com/kopi.jpg' }],
        reviews: [
          {
            id: 'rev-1',
            rating: 5,
            text: 'Enak banget',
            is_tip: false,
            created_at: '2026-08-01T00:00:00Z',
            users: { name: 'User 1', avatar_url: 'http://example.com/avatar.jpg' },
          },
        ],
      };

      const mockSingle = jest.fn().mockResolvedValue({ data: mockPlace, error: null });
      const mockEq = jest.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
      (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

      const result = await getPlaceById('place-123');

      expect(supabase.from).toHaveBeenCalledWith('places');
      expect(mockSelect).toHaveBeenCalledWith(
        expect.stringContaining('regions(name, slug)')
      );
      expect(mockSelect).toHaveBeenCalledWith(
        expect.stringContaining('categories(name, icon, applicable_to)')
      );
      expect(mockSelect).toHaveBeenCalledWith(
        expect.stringContaining('place_media(url, media_type, caption)')
      );
      expect(mockSelect).toHaveBeenCalledWith(
        expect.stringContaining('audio_stories(title, narrator, duration, url)')
      );
      expect(mockSelect).toHaveBeenCalledWith(
        expect.stringContaining('products(id, name, price, description, image_url)')
      );
      expect(mockSelect).toHaveBeenCalledWith(
        expect.stringContaining('reviews(id, rating, text, is_tip, created_at, users(name, avatar_url))')
      );
      expect(mockEq).toHaveBeenCalledWith('id', 'place-123');
      expect(mockSingle).toHaveBeenCalled();
      expect(result).toEqual(mockPlace);
    });

    it('should throw error when supabase query returns an error', async () => {
      const mockError = { message: 'Database failure', code: 'PGRST500' };
      const mockSingle = jest.fn().mockResolvedValue({ data: null, error: mockError });
      const mockEq = jest.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
      (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

      await expect(getPlaceById('place-123')).rejects.toThrow('Database failure');
    });
  });
});
