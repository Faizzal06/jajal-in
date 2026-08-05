import request from 'supertest';
import app from '../app';
import * as exploreService from '../services/exploreService';

jest.mock('../services/exploreService');

describe('Explore API (Controller & Routes)', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/explore/feed', () => {
    it('should return 200 and feed data on success', async () => {
      const mockPlaces = [
        { id: '1', name: 'Gem 1', is_sponsored: true },
        { id: '2', name: 'Gem 2', is_sponsored: false },
      ];
      (exploreService.getExploreFeed as jest.Mock).mockResolvedValue(mockPlaces);

      const response = await request(app).get('/api/explore/feed');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockPlaces);
      expect(exploreService.getExploreFeed).toHaveBeenCalledTimes(1);
    });

    it('should pass service error to errorHandler middleware (500 status)', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      (exploreService.getExploreFeed as jest.Mock).mockRejectedValue(new Error('DB failure'));

      const response = await request(app).get('/api/explore/feed');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'DB failure' });
      consoleSpy.mockRestore();
    });
  });

  describe('GET /api/explore/map', () => {
    it('should return 200 and map data when query parameters are valid', async () => {
      const mockMapPlaces = [{ id: '1', name: 'Nearby Place', dist_meters: 100 }];
      (exploreService.getExploreMap as jest.Mock).mockResolvedValue(mockMapPlaces);

      const response = await request(app)
        .get('/api/explore/map')
        .query({ lat: '-6.2', lng: '106.8', radius: '5000' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockMapPlaces);
      expect(exploreService.getExploreMap).toHaveBeenCalledWith(-6.2, 106.8, 5000);
    });

    it('should return 400 when missing required query parameters', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const response = await request(app)
        .get('/api/explore/map')
        .query({ lat: '-6.2' });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'Missing required query parameters: lat, lng, and radius',
      });
      consoleSpy.mockRestore();
    });

    it('should return 400 when query parameters are not valid numbers', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const response = await request(app)
        .get('/api/explore/map')
        .query({ lat: 'abc', lng: '106.8', radius: 'invalid' });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'Invalid query parameters: lat, lng, and radius must be valid numbers',
      });
      consoleSpy.mockRestore();
    });

    it('should pass service error to errorHandler middleware (500 status)', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      (exploreService.getExploreMap as jest.Mock).mockRejectedValue(new Error('Map query failed'));

      const response = await request(app)
        .get('/api/explore/map')
        .query({ lat: '-6.2', lng: '106.8', radius: '5000' });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Map query failed' });
      consoleSpy.mockRestore();
    });
  });
});
