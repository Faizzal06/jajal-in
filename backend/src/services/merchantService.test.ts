import { registerMerchant } from './merchantService';
import { supabase } from '../lib/supabase';
import { uploadBase64ToStorage } from './storageService';

jest.mock('../lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

jest.mock('./storageService', () => ({
  uploadBase64ToStorage: jest.fn((input: string) => Promise.resolve(input)),
}));

jest.mock('../utils/geocoding', () => ({
  getAddressFromCoordinates: jest.fn().mockResolvedValue('Mock Address, Indonesia'),
  resolveRegionFromCoordinates: jest.fn().mockResolvedValue('region-123'),
}));

describe('merchantService', () => {
  const defaultDeleteMock = jest.fn().mockReturnValue({ eq: jest.fn().mockResolvedValue({ error: null }) });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('registerMerchant', () => {
    const userId = 'user-123';
    const basicPayload = {
      name: 'Toko Kopi Sejahtera',
      description: 'Kopi lokal UMKM kualitas tinggi',
      lat: -6.9175,
      lng: 107.6191,
      regionId: 'region-123',
      categoryId: 'cat-456',
      contactWhatsApp: '081234567890',
    };

    it('should insert place into places table with status pending_payment and type merchant', async () => {
      const mockPlaceSingle = jest.fn().mockResolvedValue({
        data: { id: 'place-merchant-1' },
        error: null,
      });
      const mockPlaceSelect = jest.fn().mockReturnValue({ single: mockPlaceSingle });
      const mockPlaceInsert = jest.fn().mockReturnValue({ select: mockPlaceSelect });

      (supabase.from as jest.Mock).mockImplementation((table: string) => {
        if (table === 'places') {
          return { insert: mockPlaceInsert, delete: defaultDeleteMock };
        }
        return { delete: defaultDeleteMock };
      });

      const result = await registerMerchant(userId, basicPayload);

      expect(supabase.from).toHaveBeenCalledWith('places');
      expect(mockPlaceInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'merchant',
          status: 'pending_payment',
          owner_id: userId,
          name: 'Toko Kopi Sejahtera',
          description: basicPayload.description,
          location: 'POINT(107.6191 -6.9175)',
          region_id: 'region-123',
          category_id: 'cat-456',
          contact_whatsapp: '081234567890',
        })
      );
      expect(result).toEqual({ id: 'place-merchant-1' });
    });

    it('should insert products when products array is provided', async () => {
      const payloadWithProducts = {
        ...basicPayload,
        products: [
          { name: 'Kopi Susu Gula Aren', price: 18000, description: 'Best seller kopi', imageUrl: 'http://example.com/kopi.jpg' },
          { name: 'Roti Bakar', price: 15000, description: 'Roti bakar keju', imageUrl: undefined },
        ],
      };

      const mockPlaceSingle = jest.fn().mockResolvedValue({
        data: { id: 'place-merchant-1' },
        error: null,
      });
      const mockPlaceSelect = jest.fn().mockReturnValue({ single: mockPlaceSingle });
      const mockPlaceInsert = jest.fn().mockReturnValue({ select: mockPlaceSelect });
      const mockProductInsert = jest.fn().mockResolvedValue({ error: null });

      (supabase.from as jest.Mock).mockImplementation((table: string) => {
        if (table === 'places') return { insert: mockPlaceInsert, delete: defaultDeleteMock };
        if (table === 'products') return { insert: mockProductInsert, delete: defaultDeleteMock };
        return { delete: defaultDeleteMock };
      });

      const result = await registerMerchant(userId, payloadWithProducts);

      expect(supabase.from).toHaveBeenCalledWith('products');
      expect(mockProductInsert).toHaveBeenCalledWith([
        { place_id: 'place-merchant-1', name: 'Kopi Susu Gula Aren', price: 18000, description: 'Best seller kopi', image_url: 'http://example.com/kopi.jpg' },
        { place_id: 'place-merchant-1', name: 'Roti Bakar', price: 15000, description: 'Roti bakar keju', image_url: undefined },
      ]);
      expect(result).toEqual({ id: 'place-merchant-1' });
    });

    it('should lookup ad_package price and insert payment when adPackageId & adPaymentProofUrl are provided', async () => {
      const payloadWithAd = {
        ...basicPayload,
        adPackageId: 'pkg-789',
        adPaymentProofUrl: 'http://example.com/proof.jpg',
      };

      const mockPlaceSingle = jest.fn().mockResolvedValue({
        data: { id: 'place-merchant-1' },
        error: null,
      });
      const mockPlaceSelect = jest.fn().mockReturnValue({ single: mockPlaceSingle });
      const mockPlaceInsert = jest.fn().mockReturnValue({ select: mockPlaceSelect });

      const mockPkgSingle = jest.fn().mockResolvedValue({
        data: { id: 'pkg-789', price_idr: 150000 },
        error: null,
      });
      const mockPkgSelect = jest.fn().mockReturnValue({ eq: jest.fn().mockReturnValue({ single: mockPkgSingle }) });

      const mockPaymentInsert = jest.fn().mockResolvedValue({ error: null });

      (supabase.from as jest.Mock).mockImplementation((table: string) => {
        if (table === 'places') return { insert: mockPlaceInsert, delete: defaultDeleteMock };
        if (table === 'ad_packages') return { select: mockPkgSelect, delete: defaultDeleteMock };
        if (table === 'ad_payments') return { insert: mockPaymentInsert, delete: defaultDeleteMock };
        return { delete: defaultDeleteMock };
      });

      const result = await registerMerchant(userId, payloadWithAd);

      expect(supabase.from).toHaveBeenCalledWith('ad_packages');
      expect(supabase.from).toHaveBeenCalledWith('ad_payments');
      expect(mockPaymentInsert).toHaveBeenCalledWith({
        place_id: 'place-merchant-1',
        ad_package_id: 'pkg-789',
        amount: 150000,
        proof_url: 'http://example.com/proof.jpg',
        status: 'pending',
      });
      expect(result).toEqual({ id: 'place-merchant-1' });
    });

    it('should throw error when place insert fails', async () => {
      const mockPlaceSingle = jest.fn().mockResolvedValue({
        data: null,
        error: { message: 'Insert place failed' },
      });
      const mockPlaceSelect = jest.fn().mockReturnValue({ single: mockPlaceSingle });
      const mockPlaceInsert = jest.fn().mockReturnValue({ select: mockPlaceSelect });

      (supabase.from as jest.Mock).mockImplementation((table: string) => {
        if (table === 'places') return { insert: mockPlaceInsert, delete: defaultDeleteMock };
        return { delete: defaultDeleteMock };
      });

      await expect(registerMerchant(userId, basicPayload)).rejects.toThrow('Insert place failed');
    });

    it('should rollback manual (delete place) when product insert fails', async () => {
      const payloadWithProducts = {
        ...basicPayload,
        products: [{ name: 'Kopi', price: 10000, description: 'Kopi hitam' }],
      };

      const mockPlaceSingle = jest.fn().mockResolvedValue({
        data: { id: 'place-merchant-1' },
        error: null,
      });
      const mockPlaceSelect = jest.fn().mockReturnValue({ single: mockPlaceSingle });
      const mockPlaceInsert = jest.fn().mockReturnValue({ select: mockPlaceSelect });
      
      const mockPlaceEq = jest.fn().mockResolvedValue({ error: null });
      const mockPlaceDelete = jest.fn().mockReturnValue({ eq: mockPlaceEq });

      const mockProductInsert = jest.fn().mockResolvedValue({
        error: { message: 'Insert product DB error' },
      });

      const mockProductEq = jest.fn().mockResolvedValue({ error: null });
      const mockProductDelete = jest.fn().mockReturnValue({ eq: mockProductEq });

      (supabase.from as jest.Mock).mockImplementation((table: string) => {
        if (table === 'places') return { insert: mockPlaceInsert, delete: mockPlaceDelete };
        if (table === 'products') return { insert: mockProductInsert, delete: mockProductDelete };
        return { delete: defaultDeleteMock };
      });

      await expect(registerMerchant(userId, payloadWithProducts)).rejects.toThrow('Insert product DB error');
      expect(mockProductDelete).toHaveBeenCalled();
      expect(mockProductEq).toHaveBeenCalledWith('place_id', 'place-merchant-1');
      expect(mockPlaceDelete).toHaveBeenCalled();
      expect(mockPlaceEq).toHaveBeenCalledWith('id', 'place-merchant-1');
    });

    it('should rollback manual when ad package query fails or not found', async () => {
      const payloadWithAd = {
        ...basicPayload,
        adPackageId: 'pkg-nonexistent',
        adPaymentProofUrl: 'http://example.com/proof.jpg',
      };

      const mockPlaceSingle = jest.fn().mockResolvedValue({
        data: { id: 'place-merchant-1' },
        error: null,
      });
      const mockPlaceSelect = jest.fn().mockReturnValue({ single: mockPlaceSingle });
      const mockPlaceInsert = jest.fn().mockReturnValue({ select: mockPlaceSelect });
      
      const mockPlaceEq = jest.fn().mockResolvedValue({ error: null });
      const mockPlaceDelete = jest.fn().mockReturnValue({ eq: mockPlaceEq });

      const mockPkgSingle = jest.fn().mockResolvedValue({
        data: null,
        error: { message: 'Ad package not found' },
      });
      const mockPkgSelect = jest.fn().mockReturnValue({ eq: jest.fn().mockReturnValue({ single: mockPkgSingle }) });

      const mockProductEq = jest.fn().mockResolvedValue({ error: null });
      const mockProductDelete = jest.fn().mockReturnValue({ eq: mockProductEq });

      (supabase.from as jest.Mock).mockImplementation((table: string) => {
        if (table === 'places') return { insert: mockPlaceInsert, delete: mockPlaceDelete };
        if (table === 'products') return { delete: mockProductDelete };
        if (table === 'ad_packages') return { select: mockPkgSelect, delete: defaultDeleteMock };
        return { delete: defaultDeleteMock };
      });

      await expect(registerMerchant(userId, payloadWithAd)).rejects.toThrow('Ad package not found');
      expect(mockPlaceDelete).toHaveBeenCalled();
    });

    it('should rollback manual when ad_payments insert fails', async () => {
      const payloadWithAd = {
        ...basicPayload,
        adPackageId: 'pkg-789',
        adPaymentProofUrl: 'http://example.com/proof.jpg',
      };

      const mockPlaceSingle = jest.fn().mockResolvedValue({
        data: { id: 'place-merchant-1' },
        error: null,
      });
      const mockPlaceSelect = jest.fn().mockReturnValue({ single: mockPlaceSingle });
      const mockPlaceInsert = jest.fn().mockReturnValue({ select: mockPlaceSelect });
      
      const mockPlaceEq = jest.fn().mockResolvedValue({ error: null });
      const mockPlaceDelete = jest.fn().mockReturnValue({ eq: mockPlaceEq });

      const mockPkgSingle = jest.fn().mockResolvedValue({
        data: { id: 'pkg-789', price_idr: 150000 },
        error: null,
      });
      const mockPkgSelect = jest.fn().mockReturnValue({ eq: jest.fn().mockReturnValue({ single: mockPkgSingle }) });

      const mockPaymentInsert = jest.fn().mockResolvedValue({
        error: { message: 'Payment insert failed' },
      });
      const mockPaymentEq = jest.fn().mockResolvedValue({ error: null });
      const mockPaymentDelete = jest.fn().mockReturnValue({ eq: mockPaymentEq });

      const mockProductEq = jest.fn().mockResolvedValue({ error: null });
      const mockProductDelete = jest.fn().mockReturnValue({ eq: mockProductEq });

      (supabase.from as jest.Mock).mockImplementation((table: string) => {
        if (table === 'places') return { insert: mockPlaceInsert, delete: mockPlaceDelete };
        if (table === 'products') return { delete: mockProductDelete };
        if (table === 'ad_packages') return { select: mockPkgSelect, delete: defaultDeleteMock };
        if (table === 'ad_payments') return { insert: mockPaymentInsert, delete: mockPaymentDelete };
        return { delete: defaultDeleteMock };
      });

      await expect(registerMerchant(userId, payloadWithAd)).rejects.toThrow('Payment insert failed');
      expect(mockPaymentDelete).toHaveBeenCalled();
      expect(mockPlaceDelete).toHaveBeenCalled();
    });

    it('should upload base64 images to storage buckets for ad payment proof and products', async () => {
      (uploadBase64ToStorage as jest.Mock)
        .mockResolvedValueOnce('https://supabase.co/storage/v1/object/public/place-media/products/prod.jpg')
        .mockResolvedValueOnce('https://supabase.co/storage/v1/object/public/payment-proofs/merchant-proofs/proof.jpg');

      const base64Product = 'data:image/jpeg;base64,productdata';
      const base64Proof = 'data:image/png;base64,proofdata';

      const payloadWithStorage = {
        ...basicPayload,
        products: [{ name: 'Kopi', price: 10000, description: 'Kopi enak', imageUrl: base64Product }],
        adPackageId: 'pkg-789',
        adPaymentProofUrl: base64Proof,
      };

      const mockPlaceSingle = jest.fn().mockResolvedValue({
        data: { id: 'place-merchant-1' },
        error: null,
      });
      const mockPlaceSelect = jest.fn().mockReturnValue({ single: mockPlaceSingle });
      const mockPlaceInsert = jest.fn().mockReturnValue({ select: mockPlaceSelect });

      const mockProductInsert = jest.fn().mockResolvedValue({ error: null });

      const mockPkgSingle = jest.fn().mockResolvedValue({
        data: { id: 'pkg-789', price_idr: 150000 },
        error: null,
      });
      const mockPkgSelect = jest.fn().mockReturnValue({ eq: jest.fn().mockReturnValue({ single: mockPkgSingle }) });

      const mockPaymentInsert = jest.fn().mockResolvedValue({ error: null });

      (supabase.from as jest.Mock).mockImplementation((table: string) => {
        if (table === 'places') return { insert: mockPlaceInsert, delete: defaultDeleteMock };
        if (table === 'products') return { insert: mockProductInsert, delete: defaultDeleteMock };
        if (table === 'ad_packages') return { select: mockPkgSelect, delete: defaultDeleteMock };
        if (table === 'ad_payments') return { insert: mockPaymentInsert, delete: defaultDeleteMock };
        return { delete: defaultDeleteMock };
      });

      await registerMerchant(userId, payloadWithStorage);

      expect(uploadBase64ToStorage).toHaveBeenCalledWith(base64Product, 'place-media', 'products');
      expect(uploadBase64ToStorage).toHaveBeenCalledWith(base64Proof, 'payment-proofs', 'merchant-proofs');

      expect(mockProductInsert).toHaveBeenCalledWith([
        {
          place_id: 'place-merchant-1',
          name: 'Kopi',
          price: 10000,
          description: 'Kopi enak',
          image_url: 'https://supabase.co/storage/v1/object/public/place-media/products/prod.jpg',
        },
      ]);

      expect(mockPaymentInsert).toHaveBeenCalledWith({
        place_id: 'place-merchant-1',
        ad_package_id: 'pkg-789',
        amount: 150000,
        proof_url: 'https://supabase.co/storage/v1/object/public/payment-proofs/merchant-proofs/proof.jpg',
        status: 'pending',
      });
    });
  });
});
