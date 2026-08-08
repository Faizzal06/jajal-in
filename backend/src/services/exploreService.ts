import { supabase } from '../lib/supabase';

export const getExploreFeed = async () => {
  const { data, error } = await supabase
    .from('places')
    .select('*, regions(name), categories(name, icon), place_media(url, media_type, caption)')
    .eq('status', 'approved')
    .order('is_sponsored', { ascending: false })
    .limit(20);

  if (error) throw new Error(error.message);
  return data;
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

    return (fallbackData || []).map((p: any) => ({
      id: p.id,
      type: p.type,
      name: p.name,
      slug: p.slug,
      description: p.description,
      lat: p.lat || -6.8898,
      lng: p.lng || 109.6753,
      region_name: p.regions?.name ?? '',
      category_name: p.categories?.name ?? '',
      category_icon: p.categories?.icon ?? 'place',
      rating: p.rating ?? 0,
      review_count: p.review_count ?? 0,
      is_sponsored: p.is_sponsored ?? false,
      place_media: p.place_media ?? [],
    }));
  }

  if (error) throw new Error(error.message);
  return data || [];
};

