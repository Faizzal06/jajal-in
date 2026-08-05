import request from 'supertest';
import app from '../app';
import * as awardsService from '../services/awardsService';

jest.mock('../services/awardsService');

describe('Awards API (GET /api/awards/leaderboard)', () => {
  const mockLeaderboard = [
    {
      rank: 1,
      id: 'user-2',
      name: 'Bob',
      avatar_url: 'http://example.com/bob.jpg',
      region_id: 'region-123',
      total_xp: 260,
      level: { id: 'lvl-2', number: 2, name: 'Avid Traveler', xp_required: 100 },
      reviews_count: 1,
      approved_places_count: 5,
    },
    {
      rank: 2,
      id: 'user-1',
      name: 'Alice',
      avatar_url: 'http://example.com/alice.jpg',
      region_id: 'region-123',
      total_xp: 150,
      level: { id: 'lvl-2', number: 2, name: 'Avid Traveler', xp_required: 100 },
      reviews_count: 5,
      approved_places_count: 2,
    },
  ];

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return 200 and leaderboard array without region filter', async () => {
    (awardsService.getLeaderboard as jest.Mock).mockResolvedValue(mockLeaderboard);

    const response = await request(app).get('/api/awards/leaderboard');

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockLeaderboard);
    expect(awardsService.getLeaderboard).toHaveBeenCalledWith(undefined);
  });

  it('should pass regionId parameter to service when provided in query string via regionId or region', async () => {
    (awardsService.getLeaderboard as jest.Mock).mockResolvedValue(mockLeaderboard);

    const response1 = await request(app).get('/api/awards/leaderboard?regionId=region-123');

    expect(response1.status).toBe(200);
    expect(response1.body).toEqual(mockLeaderboard);
    expect(awardsService.getLeaderboard).toHaveBeenCalledWith('region-123');

    jest.clearAllMocks();
    (awardsService.getLeaderboard as jest.Mock).mockResolvedValue(mockLeaderboard);

    const response2 = await request(app).get('/api/awards/leaderboard?region=region-123');

    expect(response2.status).toBe(200);
    expect(response2.body).toEqual(mockLeaderboard);
    expect(awardsService.getLeaderboard).toHaveBeenCalledWith('region-123');
  });

  it('should return 500 when service throws an error', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    (awardsService.getLeaderboard as jest.Mock).mockRejectedValue(new Error('Service failure'));

    const response = await request(app).get('/api/awards/leaderboard');

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: 'Service failure' });
    consoleSpy.mockRestore();
  });
});
