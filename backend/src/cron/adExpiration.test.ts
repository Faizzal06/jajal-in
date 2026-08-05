import cron from 'node-cron';
import { supabase } from '../lib/supabase';
import { checkAdExpiration, initAdExpirationCron } from './adExpiration';

jest.mock('node-cron', () => ({
  schedule: jest.fn(),
}));

jest.mock('../lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

describe('Ad Expiration Cron', () => {
  let consoleLogSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  it('should initialize cron job with correct schedule string 0 0 * * *', () => {
    initAdExpirationCron();
    expect(cron.schedule).toHaveBeenCalledWith('0 0 * * *', checkAdExpiration);
  });

  it('should update expired sponsored ads successfully', async () => {
    const mockLt = jest.fn().mockResolvedValue({ error: null });
    const mockEq = jest.fn().mockReturnValue({ lt: mockLt });
    const mockUpdate = jest.fn().mockReturnValue({ eq: mockEq });
    const mockFrom = jest.fn().mockReturnValue({ update: mockUpdate });

    (supabase.from as jest.Mock).mockImplementation(mockFrom);

    await checkAdExpiration();

    expect(supabase.from).toHaveBeenCalledWith('places');
    expect(mockUpdate).toHaveBeenCalledWith({ is_sponsored: false, sponsored_until: null });
    expect(mockEq).toHaveBeenCalledWith('is_sponsored', true);
    expect(mockLt).toHaveBeenCalledWith('sponsored_until', expect.any(String));
    expect(consoleLogSpy).toHaveBeenCalledWith('[CRON] Pengecekan selesai.');
  });

  it('should handle error when updating expired ads fails', async () => {
    const mockError = { message: 'Database query failed' };
    const mockLt = jest.fn().mockResolvedValue({ error: mockError });
    const mockEq = jest.fn().mockReturnValue({ lt: mockLt });
    const mockUpdate = jest.fn().mockReturnValue({ eq: mockEq });
    const mockFrom = jest.fn().mockReturnValue({ update: mockUpdate });

    (supabase.from as jest.Mock).mockImplementation(mockFrom);

    await checkAdExpiration();

    expect(consoleErrorSpy).toHaveBeenCalledWith('[CRON] Gagal update ads:', 'Database query failed');
  });
});
