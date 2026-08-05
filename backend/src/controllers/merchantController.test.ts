import request from 'supertest';
import app from '../app';
import * as merchantService from '../services/merchantService';
import { supabase } from '../lib/supabase';

jest.mock('../services/merchantService');
jest.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
    },
  },
}));

describe('Merchant API (POST /api/merchant/register)', () => {
  const mockUser = { id: 'user-merchant-1', email: 'merchant@example.com' };
  const validPayload = {
    name: 'Warung Bu Siti',
    description: 'Kuliner tradisional khas Bandung',
    lat: -6.9175,
    lng: 107.6191,
    regionId: 'region-123',
    categoryId: 'cat-456',
    contactWhatsApp: '081234567890',
    products: [
      { name: 'Nasi Timbel', price: 25000, description: 'Nasi timbel komplit' },
    ],
    adPackageId: 'pkg-789',
    adPaymentProofUrl: 'http://example.com/proof.jpg',
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return 401 Unauthorized if Authorization header is missing', async () => {
    const response = await request(app)
      .post('/api/merchant/register')
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
      .post('/api/merchant/register')
      .set('Authorization', 'Bearer invalid_token')
      .send(validPayload);

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: 'Unauthorized: Invalid token' });
  });

  it('should return 201 Created and return registered place ID on success', async () => {
    (supabase.auth.getUser as jest.Mock).mockResolvedValueOnce({
      data: { user: mockUser },
      error: null,
    });
    (merchantService.registerMerchant as jest.Mock).mockResolvedValueOnce({
      id: 'place-merchant-123',
    });

    const response = await request(app)
      .post('/api/merchant/register')
      .set('Authorization', 'Bearer valid_token')
      .send(validPayload);

    expect(response.status).toBe(201);
    expect(response.body).toEqual({ id: 'place-merchant-123' });
    expect(merchantService.registerMerchant).toHaveBeenCalledWith('user-merchant-1', {
      name: validPayload.name,
      description: validPayload.description,
      lat: validPayload.lat,
      lng: validPayload.lng,
      regionId: validPayload.regionId,
      categoryId: validPayload.categoryId,
      contactWhatsApp: validPayload.contactWhatsApp,
      products: validPayload.products,
      adPackageId: validPayload.adPackageId,
      adPaymentProofUrl: validPayload.adPaymentProofUrl,
    });
  });

  it('should return 400 Bad Request when required fields are missing', async () => {
    (supabase.auth.getUser as jest.Mock).mockResolvedValueOnce({
      data: { user: mockUser },
      error: null,
    });
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const invalidPayload = {
      name: 'Warung Bu Siti',
      // description missing
      lat: -6.9175,
      lng: 107.6191,
      regionId: 'region-123',
    };

    const response = await request(app)
      .post('/api/merchant/register')
      .set('Authorization', 'Bearer valid_token')
      .send(invalidPayload);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: 'Missing required fields: name, description, lat, lng, regionId, categoryId, and contactWhatsApp are required',
    });
    consoleSpy.mockRestore();
  });

  it('should return 400 Bad Request when lat/lng are invalid numbers', async () => {
    (supabase.auth.getUser as jest.Mock).mockResolvedValueOnce({
      data: { user: mockUser },
      error: null,
    });
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const payloadInvalidCoords = {
      ...validPayload,
      lat: 'invalid-lat',
    };

    const response = await request(app)
      .post('/api/merchant/register')
      .set('Authorization', 'Bearer valid_token')
      .send(payloadInvalidCoords);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: 'Invalid coordinates: lat and lng must be valid numbers',
    });
    consoleSpy.mockRestore();
  });

  it('should return 400 Bad Request when products is not an array', async () => {
    (supabase.auth.getUser as jest.Mock).mockResolvedValueOnce({
      data: { user: mockUser },
      error: null,
    });
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const payloadInvalidProducts = {
      ...validPayload,
      products: 'not-an-array',
    };

    const response = await request(app)
      .post('/api/merchant/register')
      .set('Authorization', 'Bearer valid_token')
      .send(payloadInvalidProducts);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: 'Invalid products format: products must be an array',
    });
    consoleSpy.mockRestore();
  });

  it('should pass service error to errorHandler (500 status)', async () => {
    (supabase.auth.getUser as jest.Mock).mockResolvedValueOnce({
      data: { user: mockUser },
      error: null,
    });
    (merchantService.registerMerchant as jest.Mock).mockRejectedValueOnce(
      new Error('DB failure')
    );
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const response = await request(app)
      .post('/api/merchant/register')
      .set('Authorization', 'Bearer valid_token')
      .send(validPayload);

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: 'DB failure' });
    consoleSpy.mockRestore();
  });
});
