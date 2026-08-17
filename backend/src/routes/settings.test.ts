import request from 'supertest';
import app from '../app';

describe('Settings Routes', () => {
  it('GET /api/settings/hero should return hero settings object', async () => {
    const response = await request(app).get('/api/settings/hero');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('hero_badge');
    expect(response.body).toHaveProperty('hero_title');
    expect(response.body).toHaveProperty('hero_subtitle');
    expect(response.body).toHaveProperty('hero_image_url');
  });
});
