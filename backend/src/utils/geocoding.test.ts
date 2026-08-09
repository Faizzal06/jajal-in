import { getAddressFromCoordinates } from './geocoding';

describe('geocoding utility', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('should return display_name when Nominatim API responds successfully', async () => {
    const mockAddress = 'Monumen Nasional, Jalan Medan Merdeka Barat, Gambir, Jakarta Pusat, DKI Jakarta, 10110, Indonesia';
    
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        display_name: mockAddress,
      }),
    } as Response);

    const address = await getAddressFromCoordinates(-6.175392, 106.827153);
    expect(address).toBe(mockAddress);
    expect(global.fetch).toHaveBeenCalledWith(
      'https://nominatim.openstreetmap.org/reverse?format=json&lat=-6.175392&lon=106.827153',
      expect.objectContaining({
        headers: expect.objectContaining({
          'User-Agent': 'JajalInApp/1.0 (contact@jajal.in)',
        }),
      })
    );
  });

  it('should return null when Nominatim API returns non-200 status', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 429,
      statusText: 'Too Many Requests',
    } as Response);

    const address = await getAddressFromCoordinates(-6.175392, 106.827153);
    expect(address).toBeNull();
  });

  it('should return null when fetch throws an error', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

    const address = await getAddressFromCoordinates(-6.175392, 106.827153);
    expect(address).toBeNull();
  });
});
