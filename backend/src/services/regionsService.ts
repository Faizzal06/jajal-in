import { supabase } from '../lib/supabase';

export interface RegionFilterOptions {
  parentId?: string;
  type?: 'province' | 'regency';
  grouped?: boolean;
}

export interface RegionRecord {
  id: string;
  name: string;
  slug: string;
  parent_id?: string | null;
  parent?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  regencies?: RegionRecord[];
}

export const getRegions = async (options?: RegionFilterOptions): Promise<RegionRecord[]> => {
  const { parentId, type, grouped } = options || {};

  if (grouped) {
    const { data, error } = await supabase
      .from('regions')
      .select('*, parent:parent_id(id, name, slug)')
      .order('name', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch regions: ${error.message}`);
    }

    const allRegions = (data || []) as RegionRecord[];
    const provinces = allRegions.filter((r) => !r.parent_id);
    const regencies = allRegions.filter((r) => !!r.parent_id);

    return provinces.map((prov) => ({
      ...prov,
      regencies: regencies.filter((reg) => reg.parent_id === prov.id),
    }));
  }

  let query = supabase
    .from('regions')
    .select('*, parent:parent_id(id, name, slug)');

  if (parentId) {
    query = query.eq('parent_id', parentId);
  } else if (type === 'province') {
    query = query.is('parent_id', null);
  } else if (type === 'regency') {
    query = query.not('parent_id', 'is', null);
  }

  const { data, error } = await query.order('name', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch regions: ${error.message}`);
  }

  return (data || []) as RegionRecord[];
};
