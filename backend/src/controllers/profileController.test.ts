import request from 'supertest';
import app from '../app';
import * as profileService from '../services/profileService';
import { supabase } from '../lib/supabase';

jest.mock('../services/profileService');
jest.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
    },
  },
}));

describe('Profile API (GET /api/profile)', () => {
  const mockAuthUser = { id: 'user-123', email: 'traveler@example.com' };
  const mockProfileResponse = {
    id: 'user-123',
    name: 'Budi Explorer',
    email: 'traveler@example.com',
    avatar_url: 'http://example.com/avatar.jpg',
    role: 'user',
    region_id: 'region-456',
    created_at: '2026-01-01T00:00:00Z',
    total_xp: 170,
    level: { id: 'lvl-2', number: 2, name: 'Avid Traveler', xp_required: 100 },
    reviews_count: 2,
    approved_places_count: 3,
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return 401 Unauthorized if Authorization header is missing', async () => {
    const response = await request(app).get('/api/profile');

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: 'Unauthorized: No token provided' });
  });

  it('should return 401 Unauthorized if token is invalid', async () => {
    (supabase.auth.getUser as jest.Mock).mockResolvedValueOnce({
      data: { user: null },
      error: new Error('Invalid token'),
    });

    const response = await request(app)
      .get('/api/profile')
      .set('Authorization', 'Bearer invalid-token');

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: 'Unauthorized: Invalid token' });
  });

  it('should return 200 and user profile when authenticated', async () => {
    (supabase.auth.getUser as jest.Mock).mockResolvedValueOnce({
      data: { user: mockAuthUser },
      error: null,
    });

    (profileService.getUserProfile as jest.Mock).mockResolvedValueOnce(mockProfileResponse);

    const response = await request(app)
      .get('/api/profile')
      .set('Authorization', 'Bearer valid-token');

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockProfileResponse);
    expect(profileService.getUserProfile).toHaveBeenCalledWith('user-123');
  });

  it('should return 404 when user profile is not found', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    (supabase.auth.getUser as jest.Mock).mockResolvedValueOnce({
      data: { user: mockAuthUser },
      error: null,
    });

    const error: any = new Error('User not found');
    error.statusCode = 404;
    (profileService.getUserProfile as jest.Mock).mockRejectedValueOnce(error);

    const response = await request(app)
      .get('/api/profile')
      .set('Authorization', 'Bearer valid-token');

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: 'User not found' });
    consoleSpy.mockRestore();
  });

  it('should return 500 when service throws unexpected error', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    (supabase.auth.getUser as jest.Mock).mockResolvedValueOnce({
      data: { user: mockAuthUser },
      error: null,
    });

    (profileService.getUserProfile as jest.Mock).mockRejectedValueOnce(new Error('DB failure'));

    const response = await request(app)
      .get('/api/profile')
      .set('Authorization', 'Bearer valid-token');

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: 'DB failure' });
    consoleSpy.mockRestore();
  });
});
