import request from 'supertest';
import app from '../app';
import * as contributionsService from '../services/contributionsService';
import { supabase } from '../lib/supabase';

jest.mock('../services/contributionsService');
jest.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
    },
  },
}));

describe('Contributions API (POST /api/contributions)', () => {
  const mockUser = { id: 'user-123', email: 'test@example.com' };
  const validPayload = {
    name: 'Curug Hidden Gem',
    description: 'Air terjun tersembunyi yang sangat indah',
    lat: -6.9175,
    lng: 107.6191,
    regionId: 'region-456',
    categoryId: 'cat-789',
    media: ['http://example.com/photo1.jpg'],
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return 401 Unauthorized if Authorization header is missing', async () => {
    const response = await request(app)
      .post('/api/contributions')
      .send(validPayload);

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: 'Unauthorized: No token provided' });
  });

  it('should return 401 Unauthorized if token is invalid', async () => {
    (supabase.auth.getUser as jest.Mock).mockResolvedValueOnce({
      data: { user: null },
      error: new Error('Invalid token'),
    });

    const response = await request(app)
      .post('/api/contributions')
      .set('Authorization', 'Bearer invalid_token')
      .send(validPayload);

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: 'Unauthorized: Invalid token' });
  });

  it('should return 201 Created and return new place ID on success', async () => {
    (supabase.auth.getUser as jest.Mock).mockResolvedValueOnce({
      data: { user: mockUser },
      error: null,
    });
    (contributionsService.createContribution as jest.Mock).mockResolvedValueOnce({
      id: 'place-new-123',
    });

    const response = await request(app)
      .post('/api/contributions')
      .set('Authorization', 'Bearer valid_token')
      .send(validPayload);

    expect(response.status).toBe(201);
    expect(response.body).toEqual({ id: 'place-new-123' });
    expect(contributionsService.createContribution).toHaveBeenCalledWith('user-123', {
      name: validPayload.name,
      description: validPayload.description,
      lat: validPayload.lat,
      lng: validPayload.lng,
      regionId: validPayload.regionId,
      categoryId: validPayload.categoryId,
      media: validPayload.media,
    });
  });

  it('should return 400 Bad Request when required fields are missing', async () => {
    (supabase.auth.getUser as jest.Mock).mockResolvedValueOnce({
      data: { user: mockUser },
      error: null,
    });
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const invalidPayload = {
      name: 'Missing fields',
      // description missing
      lat: -6.9175,
      lng: 107.6191,
    };

    const response = await request(app)
      .post('/api/contributions')
      .set('Authorization', 'Bearer valid_token')
      .send(invalidPayload);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: 'Missing required fields: name, description, lat, lng, regionId, and categoryId are required',
    });
    consoleSpy.mockRestore();
  });

  it('should return 400 Bad Request when lat/lng are not valid numbers', async () => {
    (supabase.auth.getUser as jest.Mock).mockResolvedValueOnce({
      data: { user: mockUser },
      error: null,
    });
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const payloadInvalidCoords = {
      ...validPayload,
      lat: 'not-a-number',
    };

    const response = await request(app)
      .post('/api/contributions')
      .set('Authorization', 'Bearer valid_token')
      .send(payloadInvalidCoords);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: 'Invalid coordinates: lat and lng must be valid numbers',
    });
    consoleSpy.mockRestore();
  });

  it('should pass service error to errorHandler (500 status)', async () => {
    (supabase.auth.getUser as jest.Mock).mockResolvedValueOnce({
      data: { user: mockUser },
      error: null,
    });
    (contributionsService.createContribution as jest.Mock).mockRejectedValueOnce(
      new Error('DB failure during insert')
    );
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const response = await request(app)
      .post('/api/contributions')
      .set('Authorization', 'Bearer valid_token')
      .send(validPayload);

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: 'DB failure during insert' });
    consoleSpy.mockRestore();
  });
});
