import { supabase } from '../lib/supabase';
import { uploadBase64ToStorage } from './storageService';
import { getAddressFromCoordinates } from '../utils/geocoding';

export interface CreateContributionPayload {
  name: string;
  description: string;
  lat: number;
  lng: number;
  regionId: string;
  categoryId: string;
  media?: string[];
  highlights?: { title: string; description: string; icon?: string }[];
}

export const createContribution = async (
  userId: string,
  payload: CreateContributionPayload
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
        name: 'Penjelajah',
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

  const address = await getAddressFromCoordinates(payload.lat, payload.lng);

  const { data: placeData, error: placeError } = await supabase
    .from('places')
    .insert({
      type: 'gem',
      name: payload.name,
      slug,
      description: payload.description,
      address,
      location: `POINT(${payload.lng} ${payload.lat})`,
      region_id: resolvedRegionId,
      category_id: resolvedCategoryId,
      owner_id: userId,
      status: 'pending',
    })
    .select('id')
    .single();

  if (placeError || !placeData) {
    throw new Error(placeError ? placeError.message : 'Failed to insert place');
  }

  if (payload.media && payload.media.length > 0) {
    const uploadedUrls = await Promise.all(
      payload.media.map((item) => uploadBase64ToStorage(item, 'place-media', 'contributions'))
    );

    const mediaRecords = uploadedUrls.map((url) => ({
      place_id: placeData.id,
      media_type: 'image',
      url,
    }));

    const { error: mediaError } = await supabase
      .from('place_media')
      .insert(mediaRecords);

    if (mediaError) {
      throw new Error(mediaError.message);
    }
  }

  if (payload.highlights && payload.highlights.length > 0) {
    const validHighlights = payload.highlights
      .filter((h) => h && h.title && h.title.trim() !== '')
      .map((h) => ({
        place_id: placeData.id,
        title: h.title.trim(),
        description: h.description ? h.description.trim() : '',
        icon: h.icon || 'landscape',
      }));

    if (validHighlights.length > 0) {
      await supabase.from('place_highlights').insert(validHighlights);
    }
  }

  return { id: placeData.id };
};
