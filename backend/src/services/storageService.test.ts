import { uploadBase64ToStorage } from './storageService';
import { supabase } from '../lib/supabase';

jest.mock('../lib/supabase', () => ({
  supabase: {
    storage: {
      from: jest.fn(),
    },
  },
}));

describe('storageService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('uploadBase64ToStorage', () => {
    it('should return input unchanged if input is empty or non-string', async () => {
      // @ts-ignore
      const resultEmpty = await uploadBase64ToStorage('');
      expect(resultEmpty).toBe('');
      expect(supabase.storage.from).not.toHaveBeenCalled();
    });

    it('should return standard http/https URL unchanged without calling storage', async () => {
      const httpUrl = 'http://example.com/image.jpg';
      const httpsUrl = 'https://example.com/image.png';

      const resHttp = await uploadBase64ToStorage(httpUrl, 'contributions');
      const resHttps = await uploadBase64ToStorage(httpsUrl, 'contributions');

      expect(resHttp).toBe(httpUrl);
      expect(resHttps).toBe(httpsUrl);
      expect(supabase.storage.from).not.toHaveBeenCalled();
    });

    it('should upload base64 data URL to storage and return publicUrl', async () => {
      const base64DataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
      const bucketName = 'contributions';
      const pathPrefix = 'user-123';
      const expectedPublicUrl = 'https://supabase.co/storage/v1/object/public/contributions/user-123/12345-abc.png';

      const mockUpload = jest.fn().mockResolvedValue({ data: { path: 'user-123/12345-abc.png' }, error: null });
      const mockGetPublicUrl = jest.fn().mockReturnValue({ data: { publicUrl: expectedPublicUrl } });

      (supabase.storage.from as jest.Mock).mockReturnValue({
        upload: mockUpload,
        getPublicUrl: mockGetPublicUrl,
      });

      const publicUrl = await uploadBase64ToStorage(base64DataUrl, bucketName, pathPrefix);

      expect(supabase.storage.from).toHaveBeenCalledWith(bucketName);
      expect(mockUpload).toHaveBeenCalledWith(
        expect.stringMatching(/^user-123\/\d+-[a-z0-9]+\.png$/),
        expect.any(Buffer),
        { contentType: 'image/png', upsert: true }
      );
      expect(mockGetPublicUrl).toHaveBeenCalledWith(expect.stringMatching(/^user-123\/\d+-[a-z0-9]+\.png$/));
      expect(publicUrl).toBe(expectedPublicUrl);
    });

    it('should use default pathPrefix general if pathPrefix is not provided', async () => {
      const base64DataUrl = 'data:image/jpeg;base64,123456';
      const bucketName = 'merchants';
      const expectedPublicUrl = 'https://supabase.co/storage/v1/object/public/merchants/general/12345-abc.jpeg';

      const mockUpload = jest.fn().mockResolvedValue({ data: { path: 'general/12345-abc.jpeg' }, error: null });
      const mockGetPublicUrl = jest.fn().mockReturnValue({ data: { publicUrl: expectedPublicUrl } });

      (supabase.storage.from as jest.Mock).mockReturnValue({
        upload: mockUpload,
        getPublicUrl: mockGetPublicUrl,
      });

      const publicUrl = await uploadBase64ToStorage(base64DataUrl, bucketName);

      expect(mockUpload).toHaveBeenCalledWith(
        expect.stringMatching(/^general\/\d+-[a-z0-9]+\.jpeg$/),
        expect.any(Buffer),
        { contentType: 'image/jpeg', upsert: true }
      );
      expect(publicUrl).toBe(expectedPublicUrl);
    });

    it('should throw error if storage upload fails', async () => {
      const base64DataUrl = 'data:image/jpeg;base64,123456';
      const bucketName = 'merchants';

      const mockUpload = jest.fn().mockResolvedValue({ data: null, error: { message: 'Bucket quota exceeded' } });

      (supabase.storage.from as jest.Mock).mockReturnValue({
        upload: mockUpload,
      });

      await expect(uploadBase64ToStorage(base64DataUrl, bucketName)).rejects.toThrow(
        'Failed to upload image to storage bucket: Bucket quota exceeded'
      );
    });
  });
});
