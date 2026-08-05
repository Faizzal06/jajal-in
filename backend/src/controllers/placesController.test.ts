import request from 'supertest';
import app from '../app';
import * as placesService from '../services/placesService';

jest.mock('../services/placesService');

describe('Places API (Controller & Routes)', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/places/:id', () => {
    it('should return 200 and place details on success', async () => {
      const mockPlace = {
        id: 'place-123',
        name: 'Warung Kopi Hidden Gem',
        description: 'Warung kopi legendaris di sudut kota.',
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

      (placesService.getPlaceById as jest.Mock).mockResolvedValue(mockPlace);

      const response = await request(app).get('/api/places/place-123');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockPlace);
      expect(placesService.getPlaceById).toHaveBeenCalledWith('place-123');
    });

    it('should return 404 when place is not found (PGRST116)', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const error: any = new Error('JSON object requested, multiple (or no) rows returned');
      error.code = 'PGRST116';

      (placesService.getPlaceById as jest.Mock).mockRejectedValue(error);

      const response = await request(app).get('/api/places/non-existent-id');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Place not found' });
      consoleSpy.mockRestore();
    });

    it('should pass service error to errorHandler middleware (500 status)', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      (placesService.getPlaceById as jest.Mock).mockRejectedValue(new Error('DB failure'));

      const response = await request(app).get('/api/places/place-123');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'DB failure' });
      consoleSpy.mockRestore();
    });
  });
});
