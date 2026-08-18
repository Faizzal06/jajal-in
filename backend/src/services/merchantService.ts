import { supabase } from '../lib/supabase';
import { uploadBase64ToStorage } from './storageService';
import { getAddressFromCoordinates, resolveRegionFromCoordinates } from '../utils/geocoding';

export interface ProductInput {
  name: string;
  price: number;
  description: string;
  imageUrl?: string;
}

export interface RegisterMerchantPayload {
  name: string;
  description?: string;
  lat: number;
  lng: number;
  regionId: string;
  categoryId: string;
  contactWhatsApp?: string;
  media?: string[];
  products?: ProductInput[];
  adPackageId?: string;
  adPaymentProofUrl?: string;
}

export const registerMerchant = async (
  userId: string,
  payload: RegisterMerchantPayload
) => {
  const slugBase = payload.name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  const slug = `${slugBase}-${Date.now()}`;

  const isValidUuid = (id?: string) =>
    id ? /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(id) : false;

  // Ensure user exists in public.users to satisfy owner_id FK constraint
  const userTable = supabase.from('users');
  if (userTable && typeof userTable.select === 'function') {
    const { data: existingUser } = await userTable
      .select('id')
      .eq('id', userId)
      .single();

    if (!existingUser && typeof userTable.upsert === 'function') {
      await userTable.upsert({
        id: userId,
        email: `user_${userId.slice(0, 8)}@jajal.in`,
        name: 'Pemilik Usaha',
        role: 'user',
      });
    }
  }

  let resolvedCategoryId = payload.categoryId;
  if (!isValidUuid(resolvedCategoryId)) {
    const catTable = supabase.from('categories');
    if (catTable && typeof catTable.select === 'function') {
      const { data: catData } = await catTable
        .select('id')
        .eq('slug', payload.categoryId)
        .maybeSingle();
      if (catData?.id) {
        resolvedCategoryId = catData.id;
      }
    }
  }

  let resolvedRegionId = payload.regionId;
  if (!isValidUuid(resolvedRegionId)) {
    const regTable = supabase.from('regions');
    if (regTable && typeof regTable.select === 'function') {
      const { data: regData } = await regTable
        .select('id')
        .eq('slug', payload.regionId)
        .maybeSingle();
      if (regData?.id) {
        resolvedRegionId = regData.id;
      }
    }
  }

  if (!resolvedRegionId || !isValidUuid(resolvedRegionId)) {
    const autoResolved = await resolveRegionFromCoordinates(payload.lat, payload.lng);
    if (autoResolved) {
      resolvedRegionId = autoResolved;
    }
  }

  const address = await getAddressFromCoordinates(payload.lat, payload.lng);

  const { data: placeData, error: placeError } = await supabase
    .from('places')
    .insert({
      type: 'merchant',
      name: payload.name,
      slug,
      description: payload.description || '',
      address,
      location: `POINT(${payload.lng} ${payload.lat})`,
      region_id: resolvedRegionId,
      category_id: resolvedCategoryId,
      contact_whatsapp: payload.contactWhatsApp || '',
      owner_id: userId,
      status: 'pending',
    })
    .select('id')
    .single();

  if (placeError || !placeData) {
    throw new Error(placeError ? placeError.message : 'Failed to insert place');
  }

  const placeId = placeData.id;

  const rollback = async () => {
    await supabase.from('place_media').delete().eq('place_id', placeId);
    await supabase.from('ad_payments').delete().eq('place_id', placeId);
    await supabase.from('products').delete().eq('place_id', placeId);
    await supabase.from('places').delete().eq('id', placeId);
  };

  if (payload.media && payload.media.length > 0) {
    try {
      const uploadedUrls = await Promise.all(
        payload.media.map((item) => uploadBase64ToStorage(item, 'place-media', 'merchants'))
      );

      const mediaRecords = uploadedUrls.map((url) => ({
        place_id: placeId,
        media_type: 'image',
        url,
      }));

      const { error: mediaError } = await supabase
        .from('place_media')
        .insert(mediaRecords);

      if (mediaError) {
        throw new Error(mediaError.message);
      }
    } catch (err: any) {
      await rollback();
      throw err;
    }
  }

  if (payload.products && payload.products.length > 0) {
    try {
      const validProducts = payload.products.filter((p) => p && p.name && p.name.trim() !== '');
      if (validProducts.length > 0) {
        const productRecords = await Promise.all(
          validProducts.map(async (p) => {
            const imageUrl = p.imageUrl
              ? await uploadBase64ToStorage(p.imageUrl, 'place-media', 'products')
              : undefined;
            return {
              place_id: placeId,
              name: p.name.trim(),
              price: p.price || 0,
              description: p.description ? p.description.trim() : '',
              image_url: imageUrl,
            };
          })
        );

        const { error: productsError } = await supabase
          .from('products')
          .insert(productRecords);

        if (productsError) {
          throw new Error(productsError.message);
        }
      }
    } catch (err: any) {
      await rollback();
      throw err;
    }
  }

  if (payload.adPackageId && payload.adPaymentProofUrl) {
    try {
      const proofUrl = await uploadBase64ToStorage(
        payload.adPaymentProofUrl,
        'payment-proofs',
        'merchant-proofs'
      );

      const { data: pkgData, error: pkgError } = await supabase
        .from('ad_packages')
        .select('price_idr')
        .eq('id', payload.adPackageId)
        .single();

      if (pkgError || !pkgData) {
        throw new Error(pkgError ? pkgError.message : 'Ad package not found');
      }

      const { error: paymentError } = await supabase
        .from('ad_payments')
        .insert({
          place_id: placeId,
          ad_package_id: payload.adPackageId,
          amount: pkgData.price_idr,
          proof_url: proofUrl,
          status: 'pending',
        });

      if (paymentError) {
        throw new Error(paymentError.message);
      }
    } catch (err: any) {
      await rollback();
      throw err;
    }
  }

  return { id: placeId };
};

export const getMyMerchants = async (userId: string) => {
  const { data, error } = await supabase
    .from('places')
    .select(`
      id,
      type,
      name,
      slug,
      description,
      address,
      status,
      is_sponsored,
      sponsored_until,
      contact_whatsapp,
      contact_phone,
      rating,
      review_count,
      created_at,
      regions (
        name,
        slug
      ),
      categories (
        name,
        icon,
        applicable_to
      ),
      place_media (
        url,
        media_type,
        caption
      ),
      products (
        id,
        name,
        price,
        description,
        image_url
      )
    `)
    .eq('owner_id', userId)
    .eq('type', 'merchant')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
};
