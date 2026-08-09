import { supabase } from '../lib/supabase';
import { parseEWKBPoint } from '../utils/wkbParser';

export const getPlaceById = async (id: string) => {
  const { data, error } = await supabase
    .from('places')
    .select(`
      *,
      regions(name, slug),
      categories(name, icon, applicable_to),
      place_media(url, media_type, caption),
      audio_stories(title, narrator, duration, url),
      products(id, name, price, description, image_url),
      reviews(id, rating, text, is_tip, created_at, users(name, avatar_url))
    `)
    .eq('id', id)
    .single();

  if (error) {
    const err: any = new Error(error.message);
    err.code = error.code;
    throw err;
  }

  const coords = parseEWKBPoint(data.location);
  if (coords) {
    data.lat = coords.lat;
    data.lng = coords.lng;
  }

  return data;
};
