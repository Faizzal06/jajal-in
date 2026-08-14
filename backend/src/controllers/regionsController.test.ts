import request from 'supertest';
import app from '../app';
import * as regionsService from '../services/regionsService';

jest.mock('../services/regionsService');

describe('Regions API (GET /api/regions)', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return 200 and regions list', async () => {
    const mockData = [
      { id: '1', name: 'Kota Pekalongan', slug: 'pekalongan', parent_id: 'p1' },
    ];
    (regionsService.getRegions as jest.Mock).mockResolvedValue(mockData);

    const response = await request(app).get('/api/regions');

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockData);
    expect(regionsService.getRegions).toHaveBeenCalledWith({
      parentId: undefined,
      type: undefined,
      grouped: false,
    });
  });

  it('should pass query parameters to service', async () => {
    const mockData = [{ id: 'p1', name: 'DI Yogyakarta', slug: 'prov-di-yogyakarta' }];
    (regionsService.getRegions as jest.Mock).mockResolvedValue(mockData);

    const response = await request(app).get('/api/regions?type=province&grouped=true&parentId=p1');

    expect(response.status).toBe(200);
    expect(regionsService.getRegions).toHaveBeenCalledWith({
      parentId: 'p1',
      type: 'province',
      grouped: true,
    });
  });

  it('should return 500 if service throws error', async () => {
    (regionsService.getRegions as jest.Mock).mockRejectedValue(new Error('Internal DB failure'));

    const response = await request(app).get('/api/regions');

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: 'Internal DB failure' });
  });
});
