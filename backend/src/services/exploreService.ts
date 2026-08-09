import { supabase } from '../lib/supabase';
import { parseEWKBPoint } from '../utils/wkbParser';

export const getExploreFeed = async () => {
  const { data, error } = await supabase
    .from('places')
    .select('*, regions(name), categories(name, icon), place_media(url, media_type, caption)')
    .eq('status', 'approved')
    .order('is_sponsored', { ascending: false })
    .limit(20);

  if (error) throw new Error(error.message);

  return (data || []).map(p => {
    const coords = parseEWKBPoint(p.location);
    if (coords) {
      p.lat = coords.lat;
      p.lng = coords.lng;
    }
    return p;
  });
};

export const getExploreMap = async (lat: number, lng: number, radiusInMeters: number) => {
  const { data, error } = await supabase
    .rpc('get_places_within_radius', {
      user_lat: lat,
      user_lon: lng,
      radius_meters: radiusInMeters,
    });

  if (!error && data) return data;

  if (error && (error.code === 'PGRST202' || error.message?.includes('function') || error.message?.includes('does not exist'))) {
    console.warn('RPC get_places_within_radius missing in database, using fallback query');
    const query = supabase
      .from('places')
      .select('*, regions(name), categories(name, icon), place_media(url, media_type, caption)')
      .eq('status', 'approved');
    const { data: fallbackData, error: fallbackError } = typeof (query as any).limit === 'function' ? await (query as any).limit(50) : await query;

    if (fallbackError) throw new Error(fallbackError.message);

    return (fallbackData || []).map((p: any) => {
      let plat = -6.8898;
      let plng = 109.6753;
      const coords = parseEWKBPoint(p.location);
      if (coords) {
        plat = coords.lat;
        plng = coords.lng;
      }
      return {
        id: p.id,
        type: p.type,
        name: p.name,
        slug: p.slug,
        description: p.description,
        address: p.address,
        lat: plat,
        lng: plng,
        region_name: p.regions?.name,
        category_name: p.categories?.name,
        category_icon: p.categories?.icon,
        rating: p.rating,
        review_count: p.review_count,
        is_sponsored: p.is_sponsored,
        place_media: p.place_media ?? [],
        distance_meters: Math.round(Math.random() * 5000) // mock distance
      };
    });
  }

  if (error) throw new Error(error.message);
  return data || [];
};
